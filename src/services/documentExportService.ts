 import jsPDF from 'jspdf';
 import html2canvas from 'html2canvas';
 import { QuoteInvoice } from '@/types/quote';
 
 interface ExportOptions {
   filename?: string;
   scale?: number;
 }
 
 /**
  * Captures the document preview element and generates a PDF
  */
 export const exportToPDF = async (
   elementId: string = 'document-preview',
   options: ExportOptions = {}
 ): Promise<void> => {
   const element = document.getElementById(elementId);
   if (!element) {
     throw new Error('Document preview element not found');
   }
 
   const { filename = 'document.pdf', scale = 2 } = options;
 
   try {
     // Capture the element as a canvas
     const canvas = await html2canvas(element, {
       scale,
       useCORS: true,
       allowTaint: true,
       logging: false,
       backgroundColor: '#ffffff',
     });
 
     // Calculate dimensions for A4
     const imgWidth = 210; // A4 width in mm
     const pageHeight = 297; // A4 height in mm
     const imgHeight = (canvas.height * imgWidth) / canvas.width;
 
     const pdf = new jsPDF('p', 'mm', 'a4');
     const imgData = canvas.toDataURL('image/png');
 
     let heightLeft = imgHeight;
     let position = 0;
 
     // Add first page
     pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
     heightLeft -= pageHeight;
 
     // Add additional pages if content overflows
     while (heightLeft > 0) {
       position = heightLeft - imgHeight;
       pdf.addPage();
       pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
       heightLeft -= pageHeight;
     }
 
     pdf.save(filename);
   } catch (error) {
     console.error('PDF generation failed:', error);
     throw new Error('Failed to generate PDF. Please try again.');
   }
 };
 
 /**
  * Generates a Word-compatible HTML document for download
  */
 export const exportToWord = async (
   elementId: string = 'document-preview',
   options: ExportOptions = {}
 ): Promise<void> => {
   const element = document.getElementById(elementId);
   if (!element) {
     throw new Error('Document preview element not found');
   }
 
   const { filename = 'document.doc' } = options;
 
   try {
     // Get the HTML content
     const htmlContent = element.innerHTML;
 
     // Create a Word-compatible HTML structure
     const wordDocument = `
       <!DOCTYPE html>
       <html xmlns:o="urn:schemas-microsoft-com:office:office"
             xmlns:w="urn:schemas-microsoft-com:office:word"
             xmlns="http://www.w3.org/TR/REC-html40">
       <head>
         <meta charset="utf-8">
         <title>Document</title>
         <style>
           body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.5; padding: 20px; }
           table { width: 100%; border-collapse: collapse; margin: 16px 0; }
           th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
           th { font-weight: bold; background-color: #f5f5f5; }
           .text-right { text-align: right; }
           .text-center { text-align: center; }
           .font-bold { font-weight: bold; }
           .border-t { border-top: 1px solid #ddd; }
         </style>
       </head>
       <body>
         ${htmlContent}
       </body>
       </html>
     `;
 
     // Create and download the file
     const blob = new Blob([wordDocument], {
       type: 'application/msword',
     });
 
     const url = URL.createObjectURL(blob);
     const link = document.createElement('a');
     link.href = url;
     link.download = filename;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
     URL.revokeObjectURL(url);
   } catch (error) {
     console.error('Word export failed:', error);
     throw new Error('Failed to export to Word. Please try again.');
   }
 };
 
 /**
  * Helper to generate filename from quote/invoice
  */
 export const getExportFilename = (
   quote: QuoteInvoice,
   extension: 'pdf' | 'doc'
 ): string => {
   const type = quote.type === 'quote' ? 'Quote' : 'Invoice';
   const number = quote.number.replace(/[^a-zA-Z0-9-]/g, '_');
   const date = new Date().toISOString().split('T')[0];
   return `${type}_${number}_${date}.${extension}`;
 };
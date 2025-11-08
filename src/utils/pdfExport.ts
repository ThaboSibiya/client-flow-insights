import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generate and download PDF from HTML content
 */
export const generatePDFFromHTML = async (
  htmlContent: string,
  fileName: string = 'statement.pdf'
): Promise<void> => {
  // Create a temporary container
  const container = document.createElement('div');
  container.innerHTML = htmlContent;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '210mm'; // A4 width
  container.style.padding = '20px';
  container.style.backgroundColor = 'white';
  document.body.appendChild(container);

  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;

    // Add image to PDF (handle multiple pages if needed)
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Download the PDF
    pdf.save(fileName);
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
};

/**
 * Generate PDF directly from statement data
 */
export const generateStatementPDF = async (
  customerName: string,
  statementHTML: string
): Promise<void> => {
  const fileName = `${customerName.replace(/\s+/g, '_')}_Statement_${new Date().toISOString().split('T')[0]}.pdf`;
  await generatePDFFromHTML(statementHTML, fileName);
};

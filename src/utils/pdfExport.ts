/**
 * Generate and download PDF from HTML using browser print
 */
export const generatePDFFromHTML = async (
  htmlContent: string,
  fileName: string = 'statement.pdf'
): Promise<void> => {
  // Create a temporary iframe for printing
  const printFrame = document.createElement('iframe');
  printFrame.style.position = 'absolute';
  printFrame.style.width = '0';
  printFrame.style.height = '0';
  printFrame.style.border = 'none';
  
  document.body.appendChild(printFrame);
  
  const frameDoc = printFrame.contentWindow?.document;
  if (!frameDoc) {
    document.body.removeChild(printFrame);
    throw new Error('Could not access iframe document');
  }
  
  // Write HTML content with print styles
  frameDoc.open();
  frameDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${fileName}</title>
        <style>
          @media print {
            @page { margin: 1cm; }
            body { margin: 0; padding: 20px; }
          }
        </style>
      </head>
      <body>${htmlContent}</body>
    </html>
  `);
  frameDoc.close();
  
  // Wait for content to load then trigger print
  printFrame.onload = () => {
    setTimeout(() => {
      printFrame.contentWindow?.print();
      // Clean up after a delay
      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 1000);
    }, 250);
  };
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

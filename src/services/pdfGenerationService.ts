
import { QuoteInvoice } from '@/types/quote';

export interface PDFGenerationOptions {
  includeBranding: boolean;
  template: 'professional' | 'modern' | 'classic' | 'minimal';
  watermark: boolean;
  logoUrl?: string;
}

export class PDFGenerationService {
  // Generate PDF content as HTML for server-side PDF generation
  private generateHTMLContent(quote: QuoteInvoice, options: PDFGenerationOptions): string {
    const { includeBranding, template, watermark } = options;
    
    const templateStyles = this.getTemplateStyles(template);
    const watermarkHTML = watermark ? '<div class="watermark">SAMPLE</div>' : '';
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${quote.type === 'quote' ? 'Quote' : 'Invoice'} ${quote.number}</title>
          <style>
            ${templateStyles}
            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 72px;
              color: rgba(0,0,0,0.1);
              z-index: -1;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          ${watermarkHTML}
          <div class="document">
            ${includeBranding ? this.generateHeader(quote) : ''}
            ${this.generateDocumentInfo(quote)}
            ${this.generateItemsTable(quote)}
            ${this.generateTotals(quote)}
            ${this.generateFooter(quote)}
          </div>
        </body>
      </html>
    `;
  }

  private getTemplateStyles(template: string): string {
    const baseStyles = `
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
      .document { max-width: 800px; margin: 0 auto; }
      .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
      .company-info { flex: 1; }
      .document-info { text-align: right; }
      .customer-info { margin: 20px 0; }
      .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      .items-table th, .items-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
      .items-table th { background-color: #f5f5f5; }
      .totals { text-align: right; margin-top: 20px; }
      .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
      .total-row.final { font-weight: bold; border-top: 2px solid #333; padding-top: 10px; }
    `;

    const templateSpecificStyles = {
      professional: `
        .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; }
        .document-title { color: #2563eb; font-size: 24px; font-weight: bold; }
      `,
      modern: `
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; margin: -20px -20px 30px -20px; }
        .document-title { font-size: 28px; font-weight: 300; }
      `,
      classic: `
        .header { border: 2px solid #333; padding: 15px; }
        .document-title { font-family: 'Times New Roman', serif; font-size: 22px; }
      `,
      minimal: `
        .header { border-bottom: 1px solid #e5e5e5; }
        .document-title { font-size: 20px; font-weight: 300; color: #666; }
      `
    };

    return baseStyles + (templateSpecificStyles[template] || templateSpecificStyles.professional);
  }

  private generateHeader(quote: QuoteInvoice): string {
    return `
      <div class="header">
        <div class="company-info">
          <h1>Your Company Name</h1>
          <p>123 Business Street<br>
          City, State 12345<br>
          Phone: (555) 123-4567<br>
          Email: info@company.com</p>
        </div>
        <div class="document-info">
          <h2 class="document-title">${quote.type === 'quote' ? 'QUOTE' : 'INVOICE'}</h2>
          <p><strong>Number:</strong> ${quote.number}<br>
          <strong>Date:</strong> ${new Date(quote.issue_date).toLocaleDateString()}<br>
          ${quote.due_date ? `<strong>Due Date:</strong> ${new Date(quote.due_date).toLocaleDateString()}<br>` : ''}
          ${quote.valid_until ? `<strong>Valid Until:</strong> ${new Date(quote.valid_until).toLocaleDateString()}` : ''}</p>
        </div>
      </div>
    `;
  }

  private generateDocumentInfo(quote: QuoteInvoice): string {
    return `
      <div class="customer-info">
        <h3>Bill To:</h3>
        <p><strong>${quote.customer_name}</strong><br>
        ${quote.customer_email ? `${quote.customer_email}<br>` : ''}
        </p>
        ${quote.subject ? `<p><strong>Subject:</strong> ${quote.subject}</p>` : ''}
      </div>
    `;
  }

  private generateItemsTable(quote: QuoteInvoice): string {
    const items = quote.quote_invoice_items || [];
    
    const itemRows = items.map(item => `
      <tr>
        <td>${item.description}</td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right;">R ${item.rate.toFixed(2)}</td>
        <td style="text-align: right;">R ${(item.quantity * item.rate).toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: center;">Quantity</th>
            <th style="text-align: right;">Rate</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>
    `;
  }

  private generateTotals(quote: QuoteInvoice): string {
    return `
      <div class="totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>R ${quote.subtotal.toFixed(2)}</span>
        </div>
        ${quote.discount > 0 ? `
          <div class="total-row">
            <span>Discount:</span>
            <span>-R ${quote.discount.toFixed(2)}</span>
          </div>
        ` : ''}
        <div class="total-row">
          <span>Tax (VAT):</span>
          <span>R ${quote.tax.toFixed(2)}</span>
        </div>
        <div class="total-row final">
          <span>Total:</span>
          <span>R ${quote.total.toFixed(2)}</span>
        </div>
      </div>
    `;
  }

  private generateFooter(quote: QuoteInvoice): string {
    return `
      <div class="footer" style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
        ${quote.notes ? `<p><strong>Notes:</strong><br>${quote.notes}</p>` : ''}
        ${quote.terms ? `<p><strong>Terms & Conditions:</strong><br>${quote.terms}</p>` : ''}
        <p style="text-align: center; color: #666; margin-top: 30px;">
          Thank you for your business!
        </p>
      </div>
    `;
  }

  // Generate PDF using browser's print functionality
  async generatePDF(quote: QuoteInvoice, options: PDFGenerationOptions = {
    includeBranding: true,
    template: 'professional',
    watermark: false
  }): Promise<void> {
    try {
      const htmlContent = this.generateHTMLContent(quote, options);
      
      // Create a new window with the PDF content
      const printWindow = window.open('', '_blank', 'noopener,noreferrer');
      if (!printWindow) {
        throw new Error('Unable to open print window. Please check your popup blocker.');
      }

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load
      printWindow.onload = () => {
        // Trigger print dialog
        printWindow.print();
        
        // Close the window after printing
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      };

    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  // Download HTML version for debugging
  downloadHTML(quote: QuoteInvoice, options: PDFGenerationOptions): void {
    const htmlContent = this.generateHTMLContent(quote, options);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${quote.type}_${quote.number}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const pdfGenerationService = new PDFGenerationService();

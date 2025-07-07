
import { QuoteInvoice } from '@/types/quote';
import { toast } from '@/hooks/use-toast';

export interface MobilePDFOptions {
  template: 'professional' | 'modern' | 'minimal';
  includeBranding: boolean;
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

export class MobilePDFService {
  private generateHTMLContent(quote: QuoteInvoice, options: MobilePDFOptions): string {
    const { template, includeBranding, companyInfo } = options;
    
    const defaultCompany = {
      name: "Your Company Name",
      address: "123 Business Street, City, Country",
      phone: "+27 123 456 789",
      email: "info@yourcompany.com"
    };

    const company = companyInfo || defaultCompany;
    
    const templateStyles = this.getTemplateStyles(template);
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${quote.type === 'quote' ? 'Quote' : 'Invoice'} ${quote.number}</title>
          <style>
            ${templateStyles}
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
            @media screen and (max-width: 768px) {
              .container { padding: 10px; }
              .header { flex-direction: column; gap: 20px; }
              .items-table { font-size: 14px; }
              .items-table th, .items-table td { padding: 8px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${includeBranding ? this.generateHeader(quote, company) : ''}
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
      * { box-sizing: border-box; }
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
        margin: 0; 
        padding: 0; 
        line-height: 1.6;
        color: #333;
      }
      .container { max-width: 800px; margin: 0 auto; padding: 20px; }
      .header { display: flex; justify-content: space-between; margin-bottom: 30px; align-items: start; }
      .company-info { flex: 1; }
      .company-info h1 { margin: 0 0 10px 0; color: #2563eb; }
      .document-info { text-align: right; min-width: 200px; }
      .document-title { font-size: 28px; font-weight: bold; margin: 0 0 10px 0; }
      .customer-info { margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; }
      .customer-info h3 { margin: 0 0 15px 0; color: #495057; }
      .items-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
      .items-table th { background: #f8f9fa; padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; font-weight: 600; }
      .items-table td { padding: 12px; border-bottom: 1px solid #dee2e6; }
      .items-table th:nth-child(2), .items-table td:nth-child(2) { text-align: center; }
      .items-table th:nth-child(3), .items-table td:nth-child(3), 
      .items-table th:nth-child(4), .items-table td:nth-child(4) { text-align: right; }
      .totals { margin-top: 30px; }
      .totals-table { width: 100%; max-width: 300px; margin-left: auto; }
      .totals-table td { padding: 8px 0; border-bottom: 1px solid #dee2e6; }
      .totals-table .total-row { font-weight: bold; font-size: 18px; border-top: 2px solid #333; }
      .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #dee2e6; }
      .footer p { margin: 15px 0; }
    `;

    const templateSpecificStyles = {
      professional: `
        .document-title { color: #2563eb; }
        .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; }
      `,
      modern: `
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; margin: -20px -20px 30px -20px; border-radius: 8px; }
        .company-info h1 { color: white; }
        .document-title { color: white; font-weight: 300; }
      `,
      minimal: `
        .header { border-bottom: 1px solid #e5e5e5; }
        .document-title { color: #666; font-weight: 300; }
        .company-info h1 { color: #666; }
      `
    };

    return baseStyles + (templateSpecificStyles[template] || templateSpecificStyles.professional);
  }

  private generateHeader(quote: QuoteInvoice, company: any): string {
    return `
      <div class="header">
        <div class="company-info">
          <h1>${company.name}</h1>
          <p>${company.address}<br>
          ${company.phone}<br>
          ${company.email}</p>
        </div>
        <div class="document-info">
          <div class="document-title">${quote.type === 'quote' ? 'QUOTE' : 'INVOICE'}</div>
          <p><strong>Number:</strong> ${quote.number}<br>
          <strong>Date:</strong> ${new Date(quote.issue_date).toLocaleDateString()}<br>
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
        <td>${item.quantity}</td>
        <td>R ${item.rate.toFixed(2)}</td>
        <td>R ${(item.quantity * item.rate).toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
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
        <table class="totals-table">
          <tr>
            <td>Subtotal:</td>
            <td style="text-align: right;">R ${quote.subtotal.toFixed(2)}</td>
          </tr>
          ${quote.discount > 0 ? `
            <tr>
              <td>Discount:</td>
              <td style="text-align: right;">-R ${quote.discount.toFixed(2)}</td>
            </tr>
          ` : ''}
          <tr>
            <td>Tax (VAT):</td>
            <td style="text-align: right;">R ${quote.tax.toFixed(2)}</td>
          </tr>
          <tr class="total-row">
            <td>Total:</td>
            <td style="text-align: right;">R ${quote.total.toFixed(2)}</td>
          </tr>
        </table>
      </div>
    `;
  }

  private generateFooter(quote: QuoteInvoice): string {
    return `
      <div class="footer">
        ${quote.notes ? `<p><strong>Notes:</strong><br>${quote.notes}</p>` : ''}
        ${quote.terms ? `<p><strong>Terms & Conditions:</strong><br>${quote.terms}</p>` : ''}
        <p style="text-align: center; color: #666; margin-top: 30px;">
          Thank you for your business!
        </p>
      </div>
    `;
  }

  // Mobile-optimized PDF generation - downloads directly instead of print dialog
  async generateMobilePDF(quote: QuoteInvoice, options: MobilePDFOptions = {
    template: 'professional',
    includeBranding: true
  }): Promise<void> {
    try {
      const htmlContent = this.generateHTMLContent(quote, options);
      
      // Create blob and download directly for mobile
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `${quote.type}_${quote.number}.html`;
      link.style.display = 'none';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Complete",
        description: "Your quote has been downloaded. You can print it from your browser.",
      });

    } catch (error) {
      console.error('Error generating mobile PDF:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the quote. Please try again.",
        variant: "destructive"
      });
    }
  }

  // Share functionality for mobile devices
  async shareQuote(quote: QuoteInvoice, options: MobilePDFOptions): Promise<void> {
    try {
      const htmlContent = this.generateHTMLContent(quote, options);
      
      if (navigator.share) {
        // Use Web Share API if available
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const file = new File([blob], `${quote.type}_${quote.number}.html`, { type: 'text/html' });
        
        await navigator.share({
          title: `${quote.type} ${quote.number}`,
          text: `${quote.type} for ${quote.customer_name}`,
          files: [file]
        });
        
        toast({
          title: "Shared Successfully",
          description: "Quote has been shared."
        });
      } else {
        // Fallback to download
        await this.generateMobilePDF(quote, options);
      }
    } catch (error) {
      console.error('Error sharing quote:', error);
      toast({
        title: "Share Failed",
        description: "Could not share the quote. Downloaded instead.",
        variant: "destructive"
      });
      // Fallback to download
      await this.generateMobilePDF(quote, options);
    }
  }
}

export const mobilePDFService = new MobilePDFService();

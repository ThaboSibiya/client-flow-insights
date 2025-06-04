
export interface ExportData {
  customers: any[];
  format: 'csv' | 'json' | 'excel';
  filename?: string;
}

export const exportCustomers = ({ customers, format, filename }: ExportData) => {
  const defaultFilename = `customers-export-${new Date().toISOString().split('T')[0]}`;
  const finalFilename = filename || defaultFilename;

  switch (format) {
    case 'csv':
      exportAsCSV(customers, finalFilename);
      break;
    case 'json':
      exportAsJSON(customers, finalFilename);
      break;
    case 'excel':
      // For Excel, we'll export as CSV with .xlsx extension as a simple implementation
      exportAsCSV(customers, finalFilename, '.xlsx');
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

const exportAsCSV = (customers: any[], filename: string, extension: string = '.csv') => {
  const headers = [
    'Name', 'Email', 'Phone', 'Status', 'Created At', 'Updated At', 
    'Ticket Count', 'Last Ticket Date', 'Notes'
  ];
  
  const csvContent = [
    headers.join(','),
    ...customers.map(customer => [
      `"${customer.name}"`,
      `"${customer.email}"`,
      `"${customer.phone || ''}"`,
      `"${customer.status}"`,
      `"${customer.createdAt.toLocaleDateString()}"`,
      `"${customer.updatedAt.toLocaleDateString()}"`,
      customer.ticketCount.toString(),
      `"${customer.lastTicketDate ? customer.lastTicketDate.toLocaleDateString() : ''}"`,
      `"${customer.notes || ''}"`
    ].join(','))
  ].join('\n');

  downloadFile(csvContent, `${filename}${extension}`, 'text/csv');
};

const exportAsJSON = (customers: any[], filename: string) => {
  const jsonContent = JSON.stringify(customers.map(customer => ({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    status: customer.status,
    notes: customer.notes,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
    ticketCount: customer.ticketCount,
    lastTicketDate: customer.lastTicketDate?.toISOString(),
    activeTickets: customer.activeTickets
  })), null, 2);

  downloadFile(jsonContent, `${filename}.json`, 'application/json');
};

const downloadFile = (content: string, filename: string, contentType: string) => {
  const blob = new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

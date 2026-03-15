export type ImportDataType = 'customers' | 'tickets' | 'invoices';
export type ImportStep = 'select' | 'upload' | 'map' | 'transform' | 'preview' | 'importing' | 'done';
export type MainTab = 'import' | 'history' | 'connect';

export interface ParsedRow {
  [key: string]: string;
}

export interface FieldMapping {
  csvColumn: string;
  crmField: string;
}

export interface ValueTransform {
  field: string;
  rules: { from: string; to: string }[];
}

export interface ImportHistoryRecord {
  id: string;
  data_type: string;
  source_file: string | null;
  source_crm: string | null;
  total_rows: number;
  success_count: number;
  failed_count: number;
  skipped_duplicates: number;
  imported_record_ids: string[];
  status: string;
  created_at: string;
}

export interface ImportResults {
  success: number;
  failed: number;
  skippedDuplicates: number;
  errors: string[];
  importId?: string;
}

export const CRM_FIELDS: Record<ImportDataType, { field: string; label: string; required: boolean }[]> = {
  customers: [
    { field: 'name', label: 'Name', required: true },
    { field: 'email', label: 'Email', required: true },
    { field: 'phone', label: 'Phone', required: false },
    { field: 'address', label: 'Address', required: false },
    { field: 'contact_person', label: 'Contact Person', required: false },
    { field: 'company_address', label: 'Company Address', required: false },
    { field: 'status', label: 'Status', required: false },
    { field: 'notes', label: 'Notes', required: false },
    { field: 'source', label: 'Source', required: false },
    { field: 'reason', label: 'Reason/Summary', required: false },
  ],
  tickets: [
    { field: 'subject', label: 'Subject', required: true },
    { field: 'description', label: 'Description', required: false },
    { field: 'status', label: 'Status', required: false },
    { field: 'priority', label: 'Priority', required: false },
    { field: 'customer_email', label: 'Customer Email (to match)', required: true },
  ],
  invoices: [
    { field: 'invoice_number', label: 'Invoice Number', required: true },
    { field: 'amount', label: 'Amount', required: true },
    { field: 'total_amount', label: 'Total Amount', required: true },
    { field: 'due_date', label: 'Due Date', required: true },
    { field: 'status', label: 'Status', required: false },
    { field: 'description', label: 'Description', required: false },
    { field: 'customer_email', label: 'Customer Email (to match)', required: true },
  ],
};

export const STATUS_PRESETS: Record<ImportDataType, { from: string; to: string }[]> = {
  customers: [
    { from: 'Lead', to: 'new' },
    { from: 'Prospect', to: 'new' },
    { from: 'Subscriber', to: 'new' },
    { from: 'Active', to: 'existing' },
    { from: 'Qualified', to: 'existing' },
    { from: 'Customer', to: 'existing' },
    { from: 'Won', to: 'finalised' },
    { from: 'Closed', to: 'finalised' },
    { from: 'In Progress', to: 'pending' },
    { from: 'Negotiation', to: 'pending' },
  ],
  tickets: [
    { from: 'New', to: 'open' },
    { from: 'Assigned', to: 'in-progress' },
    { from: 'Working', to: 'in-progress' },
    { from: 'Solved', to: 'resolved' },
    { from: 'Done', to: 'closed' },
  ],
  invoices: [
    { from: 'Unpaid', to: 'pending' },
    { from: 'Overdue', to: 'overdue' },
    { from: 'Paid', to: 'paid' },
    { from: 'Partial', to: 'partial' },
  ],
};

export const COLUMN_HINTS: Record<ImportDataType, Record<string, string>> = {
  customers: {
    'Name': 'name', 'Full Name': 'name', 'Customer Name': 'name', 'Company': 'name', 'Account Name': 'name',
    'First Name': 'name', 'Last Name': 'name', 'FirstName': 'name', 'LastName': 'name',
    'Email': 'email', 'Email Address': 'email', 'E-mail': 'email', 'Primary Email': 'email', 'Work Email': 'email',
    'Phone': 'phone', 'Phone Number': 'phone', 'Mobile': 'phone', 'Mobile Phone': 'phone', 'Work Phone': 'phone', 'Telephone': 'phone',
    'Address': 'address', 'Street Address': 'address', 'Mailing Address': 'address', 'Street': 'address', 'Billing Address': 'address',
    'Contact Person': 'contact_person', 'Contact Owner': 'contact_person', 'Owner': 'contact_person', 'Assigned To': 'contact_person', 'Record Owner': 'contact_person',
    'Company Address': 'company_address', 'Business Address': 'company_address', 'Office Address': 'company_address',
    'Status': 'status', 'Lead Status': 'status', 'Lifecycle Stage': 'status', 'Contact Status': 'status', 'Stage': 'status',
    'Notes': 'notes', 'Description': 'notes', 'Comments': 'notes', 'Internal Notes': 'notes',
    'Source': 'source', 'Lead Source': 'source', 'Original Source': 'source', 'Campaign Source': 'source',
    'Reason': 'reason', 'Summary': 'reason', 'Pain Points': 'reason',
    'Account': 'name', 'AccountName': 'name', 'OwnerId': 'contact_person', 'LeadSource': 'source',
    'MailingStreet': 'address', 'BillingStreet': 'company_address',
    'Company Name': 'name', 'Lead Owner': 'contact_person',
    'Organization': 'name', 'Person Name': 'name', 'Deal Owner': 'contact_person',
  },
  tickets: {
    'Subject': 'subject', 'Title': 'subject', 'Ticket Name': 'subject', 'Issue': 'subject', 'Case Subject': 'subject',
    'Description': 'description', 'Details': 'description', 'Body': 'description', 'Case Description': 'description',
    'Status': 'status', 'Ticket Status': 'status', 'Case Status': 'status', 'State': 'status',
    'Priority': 'priority', 'Urgency': 'priority', 'Severity': 'priority', 'Case Priority': 'priority',
    'Customer Email': 'customer_email', 'Contact Email': 'customer_email', 'Associated contact email': 'customer_email',
    'Requester Email': 'customer_email', 'Email': 'customer_email', 'Client Email': 'customer_email',
  },
  invoices: {
    'Invoice Number': 'invoice_number', 'Invoice #': 'invoice_number', 'Invoice No': 'invoice_number', 'Number': 'invoice_number', 'Reference': 'invoice_number',
    'Amount': 'amount', 'Subtotal': 'amount', 'Net Amount': 'amount', 'Line Total': 'amount',
    'Total': 'total_amount', 'Total Amount': 'total_amount', 'Grand Total': 'total_amount', 'Invoice Total': 'total_amount',
    'Due Date': 'due_date', 'Payment Due': 'due_date', 'Due': 'due_date', 'Due By': 'due_date',
    'Status': 'status', 'Invoice Status': 'status', 'Payment Status': 'status',
    'Description': 'description', 'Memo': 'description', 'Notes': 'description',
    'Contact Email': 'customer_email', 'Customer Email': 'customer_email', 'Client Email': 'customer_email', 'Bill To Email': 'customer_email',
  },
};

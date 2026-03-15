import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Download, Loader2, X, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useActiveWorkspaceId } from '@/hooks/useActiveWorkspaceId';
import { useQueryClient } from '@tanstack/react-query';

type ImportDataType = 'customers' | 'tickets' | 'invoices';
type ImportStep = 'select' | 'upload' | 'map' | 'preview' | 'importing' | 'done';

interface ParsedRow {
  [key: string]: string;
}

interface FieldMapping {
  csvColumn: string;
  crmField: string;
}

const CRM_FIELDS: Record<ImportDataType, { field: string; label: string; required: boolean }[]> = {
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

// Universal column-name hints covering HubSpot, Salesforce, Zoho, Pipedrive, Freshsales, and generic exports
const COLUMN_HINTS: Record<ImportDataType, Record<string, string>> = {
  customers: {
    // Generic
    'Name': 'name', 'Full Name': 'name', 'Customer Name': 'name', 'Company': 'name', 'Account Name': 'name',
    'First Name': 'name', 'Last Name': 'name', 'FirstName': 'name', 'LastName': 'name',
    'Email': 'email', 'Email Address': 'email', 'E-mail': 'email', 'Primary Email': 'email', 'Work Email': 'email',
    'Phone': 'phone', 'Phone Number': 'phone', 'Mobile': 'phone', 'Mobile Phone': 'phone', 'Work Phone': 'phone', 'Telephone': 'phone',
    'Address': 'address', 'Street Address': 'address', 'Mailing Address': 'address', 'Street': 'address', 'Billing Address': 'address',
    'Contact Person': 'contact_person', 'Contact Owner': 'contact_person', 'Owner': 'contact_person', 'Assigned To': 'contact_person', 'Record Owner': 'contact_person',
    'Company Address': 'company_address', 'Business Address': 'company_address', 'Office Address': 'company_address',
    'Status': 'status', 'Lead Status': 'status', 'Lifecycle Stage': 'status', 'Contact Status': 'status', 'Stage': 'status',
    'Notes': 'notes', 'Description': 'notes', 'Comments': 'notes', 'Internal Notes': 'notes',
    'Source': 'source', 'Lead Source': 'source', 'Original Source': 'source', 'Campaign Source': 'source', 'How did they find us': 'source',
    'Reason': 'reason', 'Summary': 'reason', 'Pain Points': 'reason',
    // Salesforce specific
    'Account': 'name', 'AccountName': 'name', 'OwnerId': 'contact_person', 'LeadSource': 'source',
    'MailingStreet': 'address', 'BillingStreet': 'company_address',
    // Zoho specific
    'Company Name': 'name', 'Lead Owner': 'contact_person', 'Email Opt Out': '_skip',
    // Pipedrive specific
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
    'Description': 'description', 'Memo': 'description', 'Notes': 'description', 'Line Description': 'description',
    'Contact Email': 'customer_email', 'Customer Email': 'customer_email', 'Client Email': 'customer_email', 'Bill To Email': 'customer_email',
  },
};

const DataImportSettings = () => {
  const { user } = useAuth();
  const workspaceId = useActiveWorkspaceId();
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState<ImportStep>('select');
  const [dataType, setDataType] = useState<ImportDataType>('customers');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<ParsedRow[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [fileName, setFileName] = useState('');
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{ success: number; failed: number; errors: string[] }>({ success: 0, failed: 0, errors: [] });
  const [isDragging, setIsDragging] = useState(false);

  const resetImport = () => {
    setStep('select');
    setCsvHeaders([]);
    setCsvRows([]);
    setFieldMappings([]);
    setFileName('');
    setImportProgress(0);
    setImportResults({ success: 0, failed: 0, errors: [] });
  };

  const parseCSV = (text: string): { headers: string[]; rows: ParsedRow[] } => {
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) return { headers: [], rows: [] };

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = lines.slice(1).map(line => {
      const values = line.match(/(".*?"|[^,]+)/g) || [];
      const row: ParsedRow = {};
      headers.forEach((header, i) => {
        row[header] = (values[i] || '').trim().replace(/^"|"$/g, '');
      });
      return row;
    });

    return { headers, rows };
  };

  const autoMapFields = (headers: string[]) => {
    const hints = HUBSPOT_HINTS[dataType];
    const crmFields = CRM_FIELDS[dataType];
    
    const mappings: FieldMapping[] = [];
    
    headers.forEach(csvCol => {
      // Direct hint match
      if (hints[csvCol]) {
        mappings.push({ csvColumn: csvCol, crmField: hints[csvCol] });
        return;
      }
      // Fuzzy match: lowercase comparison
      const lowerCol = csvCol.toLowerCase().replace(/[_\-\s]+/g, '');
      const match = crmFields.find(f => {
        const lowerField = f.field.toLowerCase().replace(/[_\-\s]+/g, '');
        const lowerLabel = f.label.toLowerCase().replace(/[_\-\s]+/g, '');
        return lowerCol === lowerField || lowerCol === lowerLabel || lowerCol.includes(lowerField) || lowerField.includes(lowerCol);
      });
      if (match) {
        mappings.push({ csvColumn: csvCol, crmField: match.field });
      } else {
        mappings.push({ csvColumn: csvCol, crmField: '_skip' });
      }
    });

    // Handle HubSpot first/last name merge
    const firstNameIdx = mappings.findIndex(m => m.csvColumn.toLowerCase().includes('first'));
    const lastNameIdx = mappings.findIndex(m => m.csvColumn.toLowerCase().includes('last'));
    if (firstNameIdx >= 0 && lastNameIdx >= 0) {
      mappings[firstNameIdx].crmField = 'name';
      mappings[lastNameIdx].crmField = '_merge_name';
    }

    return mappings;
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10MB');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers, rows } = parseCSV(text);
      
      if (headers.length === 0) {
        toast.error('Could not parse CSV headers');
        return;
      }

      setCsvHeaders(headers);
      setCsvRows(rows);
      const mappings = autoMapFields(headers);
      setFieldMappings(mappings);
      setStep('map');
      toast.success(`Parsed ${rows.length} rows with ${headers.length} columns`);
    };
    reader.readAsText(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [dataType]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const updateMapping = (csvColumn: string, crmField: string) => {
    setFieldMappings(prev => prev.map(m => m.csvColumn === csvColumn ? { ...m, crmField } : m));
  };

  const getMappedData = (): Record<string, string>[] => {
    return csvRows.map(row => {
      const mapped: Record<string, string> = {};
      fieldMappings.forEach(m => {
        if (m.crmField === '_skip') return;
        if (m.crmField === '_merge_name') {
          mapped['name'] = `${mapped['name'] || ''} ${row[m.csvColumn] || ''}`.trim();
        } else {
          if (mapped[m.crmField] && m.crmField === 'name') {
            mapped[m.crmField] = `${mapped[m.crmField]} ${row[m.csvColumn] || ''}`.trim();
          } else {
            mapped[m.crmField] = row[m.csvColumn] || '';
          }
        }
      });
      return mapped;
    });
  };

  const validateMappings = (): string[] => {
    const requiredFields = CRM_FIELDS[dataType].filter(f => f.required).map(f => f.field);
    const mappedFields = fieldMappings.filter(m => m.crmField !== '_skip').map(m => m.crmField);
    const missing = requiredFields.filter(f => !mappedFields.includes(f));
    return missing;
  };

  const normalizeStatus = (raw: string): string => {
    const lower = (raw || '').toLowerCase().trim();
    const statusMap: Record<string, string> = {
      'new': 'new', 'lead': 'new', 'prospect': 'new', 'subscriber': 'new',
      'existing': 'existing', 'active': 'existing', 'qualified': 'existing', 'customer': 'existing', 'opportunity': 'existing',
      'pending': 'pending', 'in progress': 'pending', 'negotiation': 'pending',
      'finalised': 'finalised', 'finalized': 'finalised', 'closed': 'finalised', 'won': 'finalised', 'converted': 'existing',
    };
    return statusMap[lower] || 'new';
  };

  const executeImport = async () => {
    if (!user) return;
    setStep('importing');
    setImportProgress(0);

    const mappedData = getMappedData();
    const total = mappedData.length;
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    // Batch insert for efficiency
    const BATCH_SIZE = 50;

    if (dataType === 'customers') {
      for (let i = 0; i < total; i += BATCH_SIZE) {
        const batch = mappedData.slice(i, i + BATCH_SIZE);
        const records = batch.map(row => ({
          name: row.name || 'Unknown',
          email: row.email || `import-${Date.now()}-${Math.random().toString(36).slice(2)}@placeholder.com`,
          phone: row.phone || null,
          address: row.address || null,
          contact_person: row.contact_person || null,
          company_address: row.company_address || null,
          status: normalizeStatus(row.status),
          notes: row.notes || null,
          source: row.source || 'CSV Import',
          reason: row.reason || null,
          user_id: user.id,
          workspace_id: workspaceId,
        }));

        const { error } = await supabase.from('customers').insert(records);
        if (error) {
          failed += batch.length;
          errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
        } else {
          success += batch.length;
        }
        setImportProgress(Math.round(((i + batch.length) / total) * 100));
      }
    } else if (dataType === 'tickets') {
      for (let i = 0; i < total; i++) {
        const row = mappedData[i];
        // Find customer by email
        const { data: customer } = await supabase
          .from('customers')
          .select('id')
          .eq('email', row.customer_email || '')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();

        if (!customer) {
          failed++;
          errors.push(`Row ${i + 1}: Customer not found for email "${row.customer_email}"`);
        } else {
          const { error } = await supabase.from('tickets').insert({
            subject: row.subject || 'Imported Ticket',
            ticket_number: `IMP-${Date.now()}-${i}`,
            description: row.description || null,
            status: row.status || 'open',
            priority: row.priority || 'medium',
            customer_id: customer.id,
            user_id: user.id,
            workspace_id: workspaceId,
          });
          if (error) {
            failed++;
            errors.push(`Row ${i + 1}: ${error.message}`);
          } else {
            success++;
          }
        }
        setImportProgress(Math.round(((i + 1) / total) * 100));
      }
    } else if (dataType === 'invoices') {
      for (let i = 0; i < total; i++) {
        const row = mappedData[i];
        const { data: customer } = await supabase
          .from('customers')
          .select('id')
          .eq('email', row.customer_email || '')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();

        if (!customer) {
          failed++;
          errors.push(`Row ${i + 1}: Customer not found for email "${row.customer_email}"`);
        } else {
          const { error } = await supabase.from('invoices').insert({
            invoice_number: row.invoice_number || `IMP-${Date.now()}`,
            amount: parseFloat(row.amount) || 0,
            total_amount: parseFloat(row.total_amount) || parseFloat(row.amount) || 0,
            due_date: row.due_date || new Date().toISOString().split('T')[0],
            status: row.status || 'pending',
            description: row.description || null,
            customer_id: customer.id,
            user_id: user.id,
            workspace_id: workspaceId,
          });
          if (error) {
            failed++;
            errors.push(`Row ${i + 1}: ${error.message}`);
          } else {
            success++;
          }
        }
        setImportProgress(Math.round(((i + 1) / total) * 100));
      }
    }

    setImportResults({ success, failed, errors: errors.slice(0, 20) });
    setStep('done');
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    queryClient.invalidateQueries({ queryKey: ['tickets'] });
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
    
    if (success > 0) toast.success(`Successfully imported ${success} records`);
    if (failed > 0) toast.error(`${failed} records failed to import`);
  };

  const missingRequired = validateMappings();
  const previewData = getMappedData().slice(0, 5);

  const downloadTemplate = () => {
    const fields = CRM_FIELDS[dataType];
    const csv = fields.map(f => f.label).join(',') + '\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quikle_${dataType}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Data Import</h2>
          <p className="text-sm text-muted-foreground">Import data from HubSpot, Salesforce, or any CRM via CSV</p>
        </div>
        {step !== 'select' && step !== 'importing' && (
          <Button variant="outline" size="sm" onClick={resetImport}>
            <X className="h-4 w-4 mr-1" /> Start Over
          </Button>
        )}
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 text-xs">
        {['select', 'upload', 'map', 'preview', 'done'].map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
              step === s ? 'bg-primary text-primary-foreground font-medium' :
              ['select', 'upload', 'map', 'preview', 'importing', 'done'].indexOf(step) > i ? 'bg-primary/20 text-primary' :
              'bg-muted text-muted-foreground'
            }`}>
              <span>{i + 1}</span>
              <span className="hidden sm:inline capitalize">{s === 'map' ? 'Map Fields' : s}</span>
            </div>
            {i < 4 && <div className="h-px w-4 bg-border" />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Select Data Type */}
      {step === 'select' && (
        <div className="grid gap-4 sm:grid-cols-3">
          {([
            { type: 'customers' as const, label: 'Customers', desc: 'Contacts, leads, and accounts', icon: '👥' },
            { type: 'tickets' as const, label: 'Tickets', desc: 'Support tickets and deals', icon: '🎫' },
            { type: 'invoices' as const, label: 'Invoices', desc: 'Financial records', icon: '💰' },
          ]).map(item => (
            <Card
              key={item.type}
              className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/50 ${dataType === item.type ? 'border-primary ring-2 ring-primary/20' : ''}`}
              onClick={() => setDataType(item.type)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3 className="font-medium text-foreground">{item.label}</h3>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
          <div className="sm:col-span-3 flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-1" /> Download Template
            </Button>
            <Button onClick={() => setStep('upload')}>
              Continue <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Upload CSV */}
      {step === 'upload' && (
        <div className="space-y-4">
          <Alert>
            <HelpCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>HubSpot tip:</strong> Go to HubSpot → Contacts → Export → Choose CSV. 
              The importer will auto-detect HubSpot column names.
            </AlertDescription>
          </Alert>

          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-foreground font-medium">Drop your CSV file here</p>
            <p className="text-sm text-muted-foreground mt-1">or click to browse (max 10MB)</p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="absolute inset-0 opacity-0 cursor-pointer"
              style={{ position: 'relative', marginTop: '12px' }}
            />
            <Button variant="outline" size="sm" className="mt-4 relative" asChild>
              <label className="cursor-pointer">
                <FileSpreadsheet className="h-4 w-4 mr-1" /> Choose File
                <input type="file" accept=".csv" onChange={handleFileInput} className="hidden" />
              </label>
            </Button>
          </div>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep('select')}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Map Fields */}
      {step === 'map' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground">Map Your Columns</h3>
              <p className="text-xs text-muted-foreground">
                {fileName} • {csvRows.length} rows • Auto-mapped {fieldMappings.filter(m => m.crmField !== '_skip').length}/{csvHeaders.length} columns
              </p>
            </div>
            {missingRequired.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {missingRequired.length} required field(s) unmapped
              </Badge>
            )}
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {fieldMappings.map(mapping => {
              const crmFieldDef = CRM_FIELDS[dataType].find(f => f.field === mapping.crmField);
              return (
                <div key={mapping.csvColumn} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-mono truncate block text-foreground">{mapping.csvColumn}</span>
                    <span className="text-xs text-muted-foreground">
                      Sample: {csvRows[0]?.[mapping.csvColumn]?.slice(0, 40) || '—'}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Select value={mapping.crmField} onValueChange={(v) => updateMapping(mapping.csvColumn, v)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_skip">⏭ Skip this column</SelectItem>
                      {CRM_FIELDS[dataType].map(f => (
                        <SelectItem key={f.field} value={f.field}>
                          {f.label} {f.required && '•'}
                        </SelectItem>
                      ))}
                      {dataType === 'customers' && <SelectItem value="_merge_name">↪ Merge into Name</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep('upload')}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <Button onClick={() => setStep('preview')} disabled={missingRequired.length > 0}>
              Preview <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Preview */}
      {step === 'preview' && (
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">Preview (first 5 rows)</h3>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted">
                  {CRM_FIELDS[dataType].filter(f => fieldMappings.some(m => m.crmField === f.field)).map(f => (
                    <th key={f.field} className="p-2 text-left font-medium text-foreground">{f.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, i) => (
                  <tr key={i} className="border-t">
                    {CRM_FIELDS[dataType].filter(f => fieldMappings.some(m => m.crmField === f.field)).map(f => (
                      <td key={f.field} className="p-2 text-muted-foreground max-w-[150px] truncate">{row[f.field] || '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Ready to import <strong>{csvRows.length}</strong> {dataType} records into your workspace. 
              {dataType !== 'customers' && ' Records will be matched to existing customers by email.'}
            </AlertDescription>
          </Alert>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep('map')}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <Button onClick={executeImport}>
              Import {csvRows.length} Records <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Importing */}
      {step === 'importing' && (
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
            <h3 className="font-medium text-foreground">Importing your data...</h3>
            <Progress value={importProgress} className="max-w-xs mx-auto" />
            <p className="text-sm text-muted-foreground">{importProgress}% complete</p>
          </CardContent>
        </Card>
      )}

      {/* Step 6: Done */}
      {step === 'done' && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center space-y-3">
              <CheckCircle2 className="h-12 w-12 mx-auto text-primary" />
              <h3 className="text-lg font-medium text-foreground">Import Complete</h3>
              <div className="flex justify-center gap-6 text-sm">
                <span className="text-primary font-medium">✓ {importResults.success} imported</span>
                {importResults.failed > 0 && (
                  <span className="text-destructive font-medium">✗ {importResults.failed} failed</span>
                )}
              </div>
            </CardContent>
          </Card>

          {importResults.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-1">Errors:</p>
                <ul className="text-xs space-y-1 max-h-32 overflow-y-auto">
                  {importResults.errors.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={resetImport}>Import More Data</Button>
            <Button onClick={() => window.location.href = `/${dataType}`}>
              View {dataType.charAt(0).toUpperCase() + dataType.slice(1)}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataImportSettings;

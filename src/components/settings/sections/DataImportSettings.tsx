import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Download, Loader2, X, HelpCircle, History, Undo2, Clock, Plug, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useActiveWorkspaceId } from '@/hooks/useActiveWorkspaceId';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as XLSX from 'xlsx';

type ImportDataType = 'customers' | 'tickets' | 'invoices';
type ImportStep = 'select' | 'upload' | 'map' | 'preview' | 'importing' | 'done';
type MainTab = 'import' | 'history' | 'connect';

interface ParsedRow {
  [key: string]: string;
}

interface FieldMapping {
  csvColumn: string;
  crmField: string;
}

interface ImportHistoryRecord {
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

const DataImportSettings = () => {
  const { user } = useAuth();
  const workspaceId = useActiveWorkspaceId();
  const queryClient = useQueryClient();

  const [mainTab, setMainTab] = useState<MainTab>('import');
  const [step, setStep] = useState<ImportStep>('select');
  const [dataType, setDataType] = useState<ImportDataType>('customers');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<ParsedRow[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [fileName, setFileName] = useState('');
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{ success: number; failed: number; skippedDuplicates: number; errors: string[]; importId?: string }>({ success: 0, failed: 0, skippedDuplicates: 0, errors: [] });
  const [isDragging, setIsDragging] = useState(false);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [undoingId, setUndoingId] = useState<string | null>(null);

  // Fetch import history
  const { data: importHistory = [], refetch: refetchHistory } = useQuery({
    queryKey: ['import-history', user?.id, workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('import_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as ImportHistoryRecord[];
    },
    enabled: !!user?.id,
  });

  const resetImport = () => {
    setStep('select');
    setCsvHeaders([]);
    setCsvRows([]);
    setFieldMappings([]);
    setFileName('');
    setImportProgress(0);
    setImportResults({ success: 0, failed: 0, skippedDuplicates: 0, errors: [] });
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

  const parseXLSX = (buffer: ArrayBuffer): { headers: string[]; rows: ParsedRow[] } => {
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: '' });
    if (jsonData.length === 0) return { headers: [], rows: [] };
    const headers = Object.keys(jsonData[0]);
    const rows = jsonData.map(r => {
      const row: ParsedRow = {};
      headers.forEach(h => { row[h] = String(r[h] ?? ''); });
      return row;
    });
    return { headers, rows };
  };

  const autoMapFields = (headers: string[]) => {
    const hints = COLUMN_HINTS[dataType];
    const crmFields = CRM_FIELDS[dataType];
    const mappings: FieldMapping[] = [];

    headers.forEach(csvCol => {
      if (hints[csvCol]) {
        mappings.push({ csvColumn: csvCol, crmField: hints[csvCol] });
        return;
      }
      const lowerCol = csvCol.toLowerCase().replace(/[_\-\s]+/g, '');
      const match = crmFields.find(f => {
        const lowerField = f.field.toLowerCase().replace(/[_\-\s]+/g, '');
        const lowerLabel = f.label.toLowerCase().replace(/[_\-\s]+/g, '');
        return lowerCol === lowerField || lowerCol === lowerLabel || lowerCol.includes(lowerField) || lowerField.includes(lowerCol);
      });
      mappings.push({ csvColumn: csvCol, crmField: match ? match.field : '_skip' });
    });

    // Handle first/last name merge
    const firstNameIdx = mappings.findIndex(m => m.csvColumn.toLowerCase().includes('first'));
    const lastNameIdx = mappings.findIndex(m => m.csvColumn.toLowerCase().includes('last'));
    if (firstNameIdx >= 0 && lastNameIdx >= 0) {
      mappings[firstNameIdx].crmField = 'name';
      mappings[lastNameIdx].crmField = '_merge_name';
    }
    return mappings;
  };

  const handleFile = (file: File) => {
    const isCSV = file.name.toLowerCase().endsWith('.csv');
    const isExcel = file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls');

    if (!isCSV && !isExcel) {
      toast.error('Please upload a CSV or Excel (.xlsx) file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10MB');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      let headers: string[];
      let rows: ParsedRow[];

      if (isExcel) {
        const result = parseXLSX(e.target?.result as ArrayBuffer);
        headers = result.headers;
        rows = result.rows;
      } else {
        const result = parseCSV(e.target?.result as string);
        headers = result.headers;
        rows = result.rows;
      }

      if (headers.length === 0) {
        toast.error('Could not parse file headers');
        return;
      }

      setCsvHeaders(headers);
      setCsvRows(rows);
      setFieldMappings(autoMapFields(headers));
      setStep('map');
      toast.success(`Parsed ${rows.length} rows with ${headers.length} columns`);
    };

    if (isExcel) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
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
        } else if (mapped[m.crmField] && m.crmField === 'name') {
          mapped[m.crmField] = `${mapped[m.crmField]} ${row[m.csvColumn] || ''}`.trim();
        } else {
          mapped[m.crmField] = row[m.csvColumn] || '';
        }
      });
      return mapped;
    });
  };

  const validateMappings = (): string[] => {
    const requiredFields = CRM_FIELDS[dataType].filter(f => f.required).map(f => f.field);
    const mappedFields = fieldMappings.filter(m => m.crmField !== '_skip').map(m => m.crmField);
    return requiredFields.filter(f => !mappedFields.includes(f));
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

  // ----- Duplicate detection -----
  const fetchExistingEmails = async (): Promise<Set<string>> => {
    if (!user) return new Set();
    const query = supabase
      .from('customers')
      .select('email')
      .eq('user_id', user.id);

    if (workspaceId) query.eq('workspace_id', workspaceId);

    const { data } = await query;
    return new Set((data || []).map(c => c.email?.toLowerCase()));
  };

  // ----- Undo import -----
  const undoImport = async (record: ImportHistoryRecord) => {
    if (!user || record.status === 'undone') return;
    setUndoingId(record.id);

    try {
      const ids = record.imported_record_ids || [];
      if (ids.length === 0) {
        toast.error('No records to undo');
        return;
      }

      const table = record.data_type as ImportDataType;
      const { error } = await supabase
        .from(table)
        .delete()
        .in('id', ids);

      if (error) throw error;

      await supabase
        .from('import_history')
        .update({ status: 'undone' } as any)
        .eq('id', record.id);

      toast.success(`Undone: ${ids.length} ${table} records deleted`);
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      refetchHistory();
    } catch (err) {
      console.error('Undo failed:', err);
      toast.error('Failed to undo import');
    } finally {
      setUndoingId(null);
    }
  };

  // ----- Execute Import with duplicate detection + history logging -----
  const executeImport = async () => {
    if (!user) return;
    setStep('importing');
    setImportProgress(0);

    const mappedData = getMappedData();
    const total = mappedData.length;
    let success = 0;
    let failed = 0;
    let skippedDuplicates = 0;
    const errors: string[] = [];
    const importedIds: string[] = [];

    // Pre-fetch existing emails for duplicate detection
    const existingEmails = skipDuplicates ? await fetchExistingEmails() : new Set<string>();

    const BATCH_SIZE = 50;

    if (dataType === 'customers') {
      for (let i = 0; i < total; i += BATCH_SIZE) {
        const batch = mappedData.slice(i, i + BATCH_SIZE);
        const filtered: typeof batch = [];

        for (const row of batch) {
          const email = (row.email || '').toLowerCase();
          if (skipDuplicates && email && existingEmails.has(email)) {
            skippedDuplicates++;
            continue;
          }
          if (email) existingEmails.add(email);
          filtered.push(row);
        }

        if (filtered.length === 0) {
          setImportProgress(Math.round(((i + batch.length) / total) * 100));
          continue;
        }

        const records = filtered.map(row => ({
          name: row.name || 'Unknown',
          email: row.email || `import-${Date.now()}-${Math.random().toString(36).slice(2)}@placeholder.com`,
          phone: row.phone || null,
          address: row.address || null,
          contact_person: row.contact_person || null,
          company_address: row.company_address || null,
          status: normalizeStatus(row.status),
          notes: row.notes || null,
          source: row.source || 'Import',
          reason: row.reason || null,
          user_id: user.id,
          workspace_id: workspaceId,
        }));

        const { data: inserted, error } = await supabase.from('customers').insert(records).select('id');
        if (error) {
          failed += filtered.length;
          errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
        } else {
          success += filtered.length;
          (inserted || []).forEach(r => importedIds.push(r.id));
        }
        setImportProgress(Math.round(((i + batch.length) / total) * 100));
      }
    } else if (dataType === 'tickets') {
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
          errors.push(`Row ${i + 1}: Customer not found for "${row.customer_email}"`);
        } else {
          const { data: inserted, error } = await supabase.from('tickets').insert({
            subject: row.subject || 'Imported Ticket',
            ticket_number: `IMP-${Date.now()}-${i}`,
            description: row.description || null,
            status: row.status || 'open',
            priority: row.priority || 'medium',
            customer_id: customer.id,
            user_id: user.id,
            workspace_id: workspaceId,
          }).select('id');
          if (error) {
            failed++;
            errors.push(`Row ${i + 1}: ${error.message}`);
          } else {
            success++;
            (inserted || []).forEach(r => importedIds.push(r.id));
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
          errors.push(`Row ${i + 1}: Customer not found for "${row.customer_email}"`);
        } else {
          const { data: inserted, error } = await supabase.from('invoices').insert({
            invoice_number: row.invoice_number || `IMP-${Date.now()}-${i}`,
            amount: parseFloat(row.amount) || 0,
            total_amount: parseFloat(row.total_amount) || parseFloat(row.amount) || 0,
            due_date: row.due_date || new Date().toISOString().split('T')[0],
            status: row.status || 'pending',
            description: row.description || null,
            customer_id: customer.id,
            user_id: user.id,
            workspace_id: workspaceId,
          }).select('id');
          if (error) {
            failed++;
            errors.push(`Row ${i + 1}: ${error.message}`);
          } else {
            success++;
            (inserted || []).forEach(r => importedIds.push(r.id));
          }
        }
        setImportProgress(Math.round(((i + 1) / total) * 100));
      }
    }

    // Log to import_history
    const historyPayload = {
      user_id: user.id,
      workspace_id: workspaceId,
      data_type: dataType,
      source_file: fileName,
      source_crm: 'csv',
      total_rows: total,
      success_count: success,
      failed_count: failed,
      skipped_duplicates: skippedDuplicates,
      imported_record_ids: JSON.stringify(importedIds),
      field_mappings: JSON.stringify(Object.fromEntries(fieldMappings.map(m => [m.csvColumn, m.crmField]))),
      errors: JSON.stringify(errors.slice(0, 50)),
      status: 'completed',
    };
    const { data: historyRow } = await supabase
      .from('import_history')
      .insert(historyPayload as any)
      .select('id')
      .single();

    setImportResults({ success, failed, skippedDuplicates, errors: errors.slice(0, 20), importId: historyRow?.id });
    setStep('done');
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    queryClient.invalidateQueries({ queryKey: ['tickets'] });
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
    refetchHistory();

    if (success > 0) toast.success(`Successfully imported ${success} records`);
    if (skippedDuplicates > 0) toast.info(`${skippedDuplicates} duplicates skipped`);
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Data Import</h2>
          <p className="text-sm text-muted-foreground">Import from any CRM — HubSpot, Salesforce, Zoho, Pipedrive, or custom CSV/Excel</p>
        </div>
        {mainTab === 'import' && step !== 'select' && step !== 'importing' && (
          <Button variant="outline" size="sm" onClick={resetImport}>
            <X className="h-4 w-4 mr-1" /> Start Over
          </Button>
        )}
      </div>

      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as MainTab)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="import" className="gap-1"><Upload className="h-3.5 w-3.5" /> Import</TabsTrigger>
          <TabsTrigger value="history" className="gap-1"><History className="h-3.5 w-3.5" /> History</TabsTrigger>
          <TabsTrigger value="connect" className="gap-1"><Plug className="h-3.5 w-3.5" /> API Connect</TabsTrigger>
        </TabsList>

        {/* ==================== IMPORT TAB ==================== */}
        <TabsContent value="import" className="space-y-4 mt-4">
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

          {/* Step 1: Select */}
          {step === 'select' && (
            <div className="space-y-4">
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
              </div>

              {/* Duplicate detection toggle */}
              {dataType === 'customers' && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">Skip duplicates</p>
                    <p className="text-xs text-muted-foreground">Skip rows with emails already in your workspace</p>
                  </div>
                  <Switch checked={skipDuplicates} onCheckedChange={setSkipDuplicates} />
                </div>
              )}

              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-1" /> Download Template
                </Button>
                <Button onClick={() => setStep('upload')}>
                  Continue <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Upload */}
          {step === 'upload' && (
            <div className="space-y-4">
              <Alert>
                <HelpCircle className="h-4 w-4" />
                <AlertDescription className="space-y-2">
                  <p className="font-medium">How to export from your CRM:</p>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li><strong>HubSpot</strong> — Contacts → Actions → Export → CSV</li>
                    <li><strong>Salesforce</strong> — Reports → Export → CSV / Data Export</li>
                    <li><strong>Zoho CRM</strong> — Module → ⋮ → Export → CSV</li>
                    <li><strong>Pipedrive</strong> — Contacts → Export filter results → CSV</li>
                    <li><strong>Freshsales</strong> — Contacts → Settings → Export</li>
                    <li><strong>Other</strong> — Export as CSV or Excel (.xlsx); columns will be auto-detected</li>
                  </ul>
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
                <p className="text-foreground font-medium">Drop your CSV or Excel file here</p>
                <p className="text-sm text-muted-foreground mt-1">Supports .csv and .xlsx (max 10MB)</p>
                <Button variant="outline" size="sm" className="mt-4 relative" asChild>
                  <label className="cursor-pointer">
                    <FileSpreadsheet className="h-4 w-4 mr-1" /> Choose File
                    <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileInput} className="hidden" />
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
                {fieldMappings.map(mapping => (
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
                ))}
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
                  Ready to import <strong>{csvRows.length}</strong> {dataType} records.
                  {skipDuplicates && dataType === 'customers' && ' Duplicate emails will be skipped.'}
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
                  <div className="flex justify-center gap-4 text-sm flex-wrap">
                    <span className="text-primary font-medium">✓ {importResults.success} imported</span>
                    {importResults.skippedDuplicates > 0 && (
                      <span className="text-muted-foreground font-medium">⏭ {importResults.skippedDuplicates} duplicates skipped</span>
                    )}
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
                <Button variant="outline" onClick={() => setMainTab('history')}>
                  <History className="h-4 w-4 mr-1" /> View History
                </Button>
                <Button onClick={() => window.location.href = `/${dataType}`}>
                  View {dataType.charAt(0).toUpperCase() + dataType.slice(1)}
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ==================== HISTORY TAB ==================== */}
        <TabsContent value="history" className="mt-4">
          <div className="space-y-3">
            {importHistory.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <History className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No imports yet. Import your first dataset to see history here.</p>
                </CardContent>
              </Card>
            ) : (
              importHistory.map(record => (
                <Card key={record.id} className={record.status === 'undone' ? 'opacity-60' : ''}>
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-foreground capitalize">{record.data_type}</span>
                        <Badge variant={record.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                          {record.status}
                        </Badge>
                        {record.source_file && (
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">{record.source_file}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(record.created_at)}</span>
                        <span className="text-primary">✓ {record.success_count}</span>
                        {record.skipped_duplicates > 0 && <span>⏭ {record.skipped_duplicates} skipped</span>}
                        {record.failed_count > 0 && <span className="text-destructive">✗ {record.failed_count}</span>}
                      </div>
                    </div>
                    {record.status === 'completed' && (record.imported_record_ids?.length ?? 0) > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => undoImport(record)}
                        disabled={undoingId === record.id}
                      >
                        {undoingId === record.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <><Undo2 className="h-4 w-4 mr-1" /> Undo</>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* ==================== API CONNECT TAB ==================== */}
        <TabsContent value="connect" className="mt-4">
          <div className="space-y-4">
            <Alert>
              <Plug className="h-4 w-4" />
              <AlertDescription>
                Connect directly to your CRM's API for automated, scheduled imports without manual CSV exports.
              </AlertDescription>
            </Alert>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { name: 'HubSpot', desc: 'Contacts, deals, tickets', status: 'coming_soon' },
                { name: 'Salesforce', desc: 'Leads, accounts, opportunities', status: 'coming_soon' },
                { name: 'Zoho CRM', desc: 'Contacts, leads, deals', status: 'coming_soon' },
                { name: 'Pipedrive', desc: 'People, organizations, deals', status: 'coming_soon' },
              ].map(crm => (
                <Card key={crm.name} className="transition-all hover:shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm text-foreground">{crm.name}</h4>
                      <p className="text-xs text-muted-foreground">{crm.desc}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs whitespace-nowrap">Coming Soon</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-dashed">
              <CardContent className="p-6 text-center space-y-3">
                <Clock className="h-8 w-8 mx-auto text-muted-foreground" />
                <div>
                  <h4 className="font-medium text-foreground">Scheduled Imports</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Once connected, set up automatic daily or weekly syncs to keep your data up to date.
                  </p>
                </div>
                <Badge variant="secondary">Coming Soon</Badge>
              </CardContent>
            </Card>

            <Alert>
              <HelpCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>In the meantime:</strong> Use the Import tab to upload CSV or Excel exports from any CRM. 
                You can also use the <strong>Integrations → Webhooks</strong> feature to push data from external tools (N8N, Zapier, Make) directly into Quikle.
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataImportSettings;

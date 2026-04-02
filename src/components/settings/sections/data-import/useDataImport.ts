import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useActiveWorkspaceId } from '@/hooks/useActiveWorkspaceId';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import {
  ImportDataType, ImportStep, ParsedRow, FieldMapping, ValueTransform,
  ImportHistoryRecord, ImportResults, CRM_FIELDS, COLUMN_HINTS,
} from './types';

const BATCH_SIZE = 50;

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

export const useDataImport = () => {
  const { user } = useAuth();
  const workspaceId = useActiveWorkspaceId();
  const queryClient = useQueryClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const [step, setStep] = useState<ImportStep>('select');
  const [dataType, setDataType] = useState<ImportDataType>('customers');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<ParsedRow[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [valueTransforms, setValueTransforms] = useState<ValueTransform[]>([]);
  const [fileName, setFileName] = useState('');
  const [importProgress, setImportProgress] = useState(0);
  const [importProgressDetail, setImportProgressDetail] = useState('');
  const [importResults, setImportResults] = useState<ImportResults>({ success: 0, failed: 0, skippedDuplicates: 0, errors: [] });
  const [isDragging, setIsDragging] = useState(false);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [undoingId, setUndoingId] = useState<string | null>(null);

  // Real-time progress channel
  useEffect(() => {
    if (step !== 'importing' || !user) return;

    const channel = supabase.channel(`import-progress-${user.id}`)
      .on('broadcast', { event: 'progress' }, (payload) => {
        const { progress, detail } = payload.payload as { progress: number; detail: string };
        setImportProgress(progress);
        setImportProgressDetail(detail);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [step, user]);

  const broadcastProgress = useCallback((progress: number, detail: string) => {
    setImportProgress(progress);
    setImportProgressDetail(detail);
    channelRef.current?.send({
      type: 'broadcast',
      event: 'progress',
      payload: { progress, detail },
    });
  }, []);

  // History query scoped to workspace
  const { data: importHistory = [], refetch: refetchHistory } = useQuery({
    queryKey: ['import-history', user?.id, workspaceId],
    queryFn: async () => {
      let query = supabase
        .from('import_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as ImportHistoryRecord[];
    },
    enabled: !!user?.id,
  });

  const resetImport = useCallback(() => {
    setStep('select');
    setCsvHeaders([]);
    setCsvRows([]);
    setFieldMappings([]);
    setValueTransforms([]);
    setFileName('');
    setImportProgress(0);
    setImportProgressDetail('');
    setImportResults({ success: 0, failed: 0, skippedDuplicates: 0, errors: [] });
  }, []);

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

  const autoMapFields = useCallback((headers: string[], type: ImportDataType) => {
    const hints = COLUMN_HINTS[type];
    const crmFields = CRM_FIELDS[type];
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
  }, []);

  const handleFile = useCallback((file: File) => {
    const isCSV = file.name.toLowerCase().endsWith('.csv');
    const isExcel = /\.(xlsx|xls)$/i.test(file.name);

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
      setFieldMappings(autoMapFields(headers, dataType));
      setStep('map');
      toast.success(`Parsed ${rows.length} rows with ${headers.length} columns`);
    };

    if (isExcel) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  }, [dataType, autoMapFields]);

  const updateMapping = useCallback((csvColumn: string, crmField: string) => {
    setFieldMappings(prev => prev.map(m => m.csvColumn === csvColumn ? { ...m, crmField } : m));
  }, []);

  const reorderMappings = useCallback((newMappings: FieldMapping[]) => {
    setFieldMappings(newMappings);
  }, []);

  const applyTransforms = useCallback((value: string, field: string): string => {
    const transform = valueTransforms.find(t => t.field === field);
    if (!transform) return value;
    const lower = (value || '').toLowerCase().trim();
    const rule = transform.rules.find(r => r.from.toLowerCase().trim() === lower);
    return rule ? rule.to : value;
  }, [valueTransforms]);

  const getMappedData = useCallback((): Record<string, string>[] => {
    return csvRows.map(row => {
      const mapped: Record<string, string> = {};
      fieldMappings.forEach(m => {
        if (m.crmField === '_skip') return;
        if (m.crmField === '_merge_name') {
          mapped['name'] = `${mapped['name'] || ''} ${row[m.csvColumn] || ''}`.trim();
        } else if (mapped[m.crmField] && m.crmField === 'name') {
          mapped[m.crmField] = `${mapped[m.crmField]} ${row[m.csvColumn] || ''}`.trim();
        } else {
          const rawValue = row[m.csvColumn] || '';
          mapped[m.crmField] = applyTransforms(rawValue, m.crmField);
        }
      });
      return mapped;
    });
  }, [csvRows, fieldMappings, applyTransforms]);

  const validateMappings = useCallback((): string[] => {
    const requiredFields = CRM_FIELDS[dataType].filter(f => f.required).map(f => f.field);
    const mappedFields = fieldMappings.filter(m => m.crmField !== '_skip').map(m => m.crmField);
    return requiredFields.filter(f => !mappedFields.includes(f));
  }, [dataType, fieldMappings]);

  const fetchExistingEmails = async (): Promise<Set<string>> => {
    if (!user) return new Set();
    const query = supabase.from('customers').select('email').eq('user_id', user.id);
    if (workspaceId) query.eq('workspace_id', workspaceId);
    const { data } = await query;
    return new Set((data || []).map(c => c.email?.toLowerCase()));
  };

  const batchFetchCustomersByEmail = async (emails: string[]): Promise<Map<string, string>> => {
    const emailMap = new Map<string, string>();
    if (!user || emails.length === 0) return emailMap;

    const uniqueEmails = [...new Set(emails.map(e => e.toLowerCase()))];
    for (let i = 0; i < uniqueEmails.length; i += 100) {
      const batch = uniqueEmails.slice(i, i + 100);
      const query = supabase
        .from('customers')
        .select('id, email')
        .eq('user_id', user.id)
        .in('email', batch);
      if (workspaceId) query.eq('workspace_id', workspaceId);
      const { data } = await query;
      (data || []).forEach(c => emailMap.set(c.email.toLowerCase(), c.id));
    }
    return emailMap;
  };

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
      const { error } = await supabase.from(table).delete().in('id', ids);
      if (error) throw error;

      await supabase.from('import_history').update({ status: 'undone' } as any).eq('id', record.id);

      toast.success(`Undone: ${ids.length} ${table} records removed`);
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

  const executeImport = async () => {
    if (!user) return;
    setStep('importing');
    setImportProgress(0);
    setImportProgressDetail('Preparing import…');

    const mappedData = getMappedData();
    const total = mappedData.length;
    let success = 0;
    let failed = 0;
    let skippedDuplicates = 0;
    const errors: string[] = [];
    const importedIds: string[] = [];

    if (dataType === 'customers') {
      broadcastProgress(2, 'Checking for duplicates…');
      const existingEmails = skipDuplicates ? await fetchExistingEmails() : new Set<string>();

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
          const pct = Math.round(((i + batch.length) / total) * 100);
          broadcastProgress(pct, `Processing batch ${Math.floor(i / BATCH_SIZE) + 1}…`);
          continue;
        }

        const records = filtered.map(row => {
          const email = (row.email || '').trim();
          if (!email) {
            // Skip rows without email - don't create placeholder
            return null;
          }
          return {
            name: row.name || 'Unknown',
            email,
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
          };
        }).filter(Boolean);

        const { data: inserted, error } = await supabase.from('customers').insert(records).select('id');
        if (error) {
          failed += filtered.length;
          errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
        } else {
          success += filtered.length;
          (inserted || []).forEach(r => importedIds.push(r.id));
        }
        const pct = Math.min(Math.round(((i + BATCH_SIZE) / total) * 100), 98);
        broadcastProgress(pct, `Imported ${success} of ${total} records…`);
      }
    } else {
      broadcastProgress(5, 'Matching customers by email…');
      const allEmails = mappedData.map(r => r.customer_email || '').filter(Boolean);
      const customerMap = await batchFetchCustomersByEmail(allEmails);

      for (let i = 0; i < total; i += BATCH_SIZE) {
        const batch = mappedData.slice(i, i + BATCH_SIZE);
        const validRecords: any[] = [];

        for (let j = 0; j < batch.length; j++) {
          const row = batch[j];
          const rowIdx = i + j + 1;
          const customerId = customerMap.get((row.customer_email || '').toLowerCase());

          if (!customerId) {
            failed++;
            errors.push(`Row ${rowIdx}: Customer not found for "${row.customer_email}"`);
            continue;
          }

          if (dataType === 'tickets') {
            validRecords.push({
              subject: row.subject || 'Imported Ticket',
              ticket_number: `IMP-${Date.now()}-${rowIdx}`,
              description: row.description || null,
              status: row.status || 'open',
              priority: row.priority || 'medium',
              customer_id: customerId,
              user_id: user.id,
              workspace_id: workspaceId,
            });
          } else {
            validRecords.push({
              invoice_number: row.invoice_number || `IMP-${Date.now()}-${rowIdx}`,
              amount: parseFloat(row.amount) || 0,
              total_amount: parseFloat(row.total_amount) || parseFloat(row.amount) || 0,
              due_date: row.due_date || new Date().toISOString().split('T')[0],
              status: row.status || 'pending',
              description: row.description || null,
              customer_id: customerId,
              user_id: user.id,
              workspace_id: workspaceId,
            });
          }
        }

        if (validRecords.length > 0) {
          const table = dataType === 'tickets' ? 'tickets' : 'invoices';
          const { data: inserted, error } = await supabase.from(table).insert(validRecords).select('id');
          if (error) {
            failed += validRecords.length;
            errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
          } else {
            success += validRecords.length;
            (inserted || []).forEach(r => importedIds.push(r.id));
          }
        }
        const pct = Math.min(Math.round(((i + BATCH_SIZE) / total) * 100), 98);
        broadcastProgress(pct, `Imported ${success} of ${total} records…`);
      }
    }

    broadcastProgress(99, 'Saving import history…');

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

    broadcastProgress(100, 'Complete!');

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

  const downloadTemplate = useCallback(() => {
    const fields = CRM_FIELDS[dataType];
    const csv = fields.map(f => f.label).join(',') + '\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quikle_${dataType}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [dataType]);

  return {
    step, setStep,
    dataType, setDataType,
    csvHeaders, csvRows,
    fieldMappings, updateMapping, reorderMappings,
    valueTransforms, setValueTransforms,
    fileName,
    importProgress, importProgressDetail,
    importResults,
    isDragging, setIsDragging,
    skipDuplicates, setSkipDuplicates,
    undoingId,
    importHistory,
    resetImport,
    handleFile,
    getMappedData,
    validateMappings,
    executeImport,
    undoImport,
    downloadTemplate,
  };
};

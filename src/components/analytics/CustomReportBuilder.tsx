
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings, BarChart3, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import ReportBasicInfo from './report-builder/ReportBasicInfo';
import FieldSelector from './report-builder/FieldSelector';
import FilterManager from './report-builder/FilterManager';
import ReportConfiguration from './report-builder/ReportConfiguration';
import SavedReportsList from './report-builder/SavedReportsList';
import ReportResults from './report-builder/ReportResults';

export interface ReportField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'status';
  selected: boolean;
  dbColumn: string;
  table: string;
}

export interface ReportFilter {
  id: string;
  field: string;
  operator: string;
  value: string;
}

export interface CustomReport {
  id: string;
  name: string;
  description: string;
  fields: ReportField[];
  filters: ReportFilter[];
  groupBy: string;
  chartType: string;
}

const CustomReportBuilder: React.FC = () => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportResults, setReportResults] = useState<Record<string, unknown>[] | null>(null);

  const [currentReport, setCurrentReport] = useState<CustomReport>({
    id: '',
    name: '',
    description: '',
    fields: [],
    filters: [],
    groupBy: '',
    chartType: 'table'
  });

  const [savedReports, setSavedReports] = useState<CustomReport[]>([]);

  const availableFields: ReportField[] = [
    { id: '1', name: 'Customer Name', type: 'text', selected: false, dbColumn: 'name', table: 'customers' },
    { id: '2', name: 'Email', type: 'text', selected: false, dbColumn: 'email', table: 'customers' },
    { id: '3', name: 'Phone', type: 'text', selected: false, dbColumn: 'phone', table: 'customers' },
    { id: '4', name: 'Status', type: 'status', selected: false, dbColumn: 'status', table: 'customers' },
    { id: '5', name: 'Created Date', type: 'date', selected: false, dbColumn: 'created_at', table: 'customers' },
    { id: '6', name: 'Updated Date', type: 'date', selected: false, dbColumn: 'updated_at', table: 'customers' },
  ];

  const handleReportUpdate = (updates: Partial<CustomReport>) => {
    setCurrentReport(prev => ({ ...prev, ...updates }));
  };

  const handleFieldToggle = (fieldId: string) => {
    const field = availableFields.find(f => f.id === fieldId);
    if (!field) return;

    const isSelected = currentReport.fields.some(f => f.id === fieldId);
    if (isSelected) {
      setCurrentReport(prev => ({ ...prev, fields: prev.fields.filter(f => f.id !== fieldId) }));
    } else {
      setCurrentReport(prev => ({ ...prev, fields: [...prev.fields, { ...field, selected: true }] }));
    }
  };

  const addFilter = () => {
    setCurrentReport(prev => ({
      ...prev,
      filters: [...prev.filters, { id: Date.now().toString(), field: '', operator: 'equals', value: '' }]
    }));
  };

  const updateFilter = (filterId: string, updates: Partial<ReportFilter>) => {
    setCurrentReport(prev => ({
      ...prev,
      filters: prev.filters.map(f => f.id === filterId ? { ...f, ...updates } : f)
    }));
  };

  const removeFilter = (filterId: string) => {
    setCurrentReport(prev => ({ ...prev, filters: prev.filters.filter(f => f.id !== filterId) }));
  };

  const generateReport = async () => {
    if (currentReport.fields.length === 0) {
      toast.error('Please select at least one field');
      return;
    }

    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    setIsGenerating(true);
    setReportResults(null);

    try {
      // Build select columns
      const selectColumns = currentReport.fields.map(f => f.dbColumn).join(', ');

      // Build query with raw select to avoid deep type instantiation
      let query = supabase
        .from('customers')
        .select(selectColumns)
        .eq('user_id', user.id) as any;

      // Apply filters
      for (const filter of currentReport.filters) {
        if (!filter.field || !filter.value) continue;
        
        const matchingField = availableFields.find(f => f.name.toLowerCase() === filter.field);
        const dbCol = matchingField?.dbColumn || filter.field;

        switch (filter.operator) {
          case 'equals':
            query = query.eq(dbCol, filter.value);
            break;
          case 'contains':
            query = query.ilike(dbCol, `%${filter.value}%`);
            break;
          case 'greater':
            query = query.gt(dbCol, filter.value);
            break;
          case 'less':
            query = query.lt(dbCol, filter.value);
            break;
        }
      }

      // Apply ordering
      if (currentReport.groupBy && currentReport.groupBy !== 'none') {
        const groupField = currentReport.groupBy === 'status' ? 'status' 
          : currentReport.groupBy === 'created_date' ? 'created_at' 
          : 'updated_at';
        query = query.order(groupField);
      }

      const { data, error } = await query.limit(500) as { data: Record<string, unknown>[] | null; error: any };

      if (error) throw error;

      setReportResults(data || []);
      toast.success(`Report generated: ${data?.length ?? 0} rows`);
    } catch (err) {
      console.error('Report generation error:', err);
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveReport = () => {
    if (!currentReport.name) {
      toast.error('Please enter a report name');
      return;
    }
    if (currentReport.fields.length === 0) {
      toast.error('Please select at least one field');
      return;
    }

    setSavedReports(prev => [...prev, { ...currentReport, id: Date.now().toString() }]);
    setCurrentReport({ id: '', name: '', description: '', fields: [], filters: [], groupBy: '', chartType: 'table' });
    setReportResults(null);
    toast.success('Report saved');
  };

  const loadReport = (report: CustomReport) => {
    setCurrentReport({ ...report, id: '' });
    setReportResults(null);
    toast.success('Report loaded');
  };

  const exportReport = (report: CustomReport) => {
    toast.success(`Exporting ${report.name}...`);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              Report Builder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ReportBasicInfo report={currentReport} onUpdate={handleReportUpdate} />
            <Separator />
            <FieldSelector availableFields={availableFields} selectedFields={currentReport.fields} onFieldToggle={handleFieldToggle} />
            <Separator />
            <FilterManager filters={currentReport.filters} availableFields={availableFields} onAddFilter={addFilter} onUpdateFilter={updateFilter} onRemoveFilter={removeFilter} />
            <Separator />
            <ReportConfiguration report={currentReport} onUpdate={handleReportUpdate} />

            <div className="flex gap-2">
              <Button onClick={generateReport} className="flex-1" disabled={isGenerating}>
                {isGenerating ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><BarChart3 className="h-4 w-4 mr-2" /> Generate Report</>
                )}
              </Button>
              <Button variant="outline" onClick={saveReport}>Save</Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {reportResults !== null && (
            <ReportResults
              data={reportResults}
              fields={currentReport.fields}
              chartType={currentReport.chartType}
              groupBy={currentReport.groupBy}
            />
          )}
          <SavedReportsList
            savedReports={savedReports}
            onLoadReport={loadReport}
            onRunReport={generateReport}
            onExportReport={exportReport}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomReportBuilder;

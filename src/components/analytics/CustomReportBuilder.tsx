
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Settings, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import ReportBasicInfo from './report-builder/ReportBasicInfo';
import FieldSelector from './report-builder/FieldSelector';
import FilterManager from './report-builder/FilterManager';
import ReportConfiguration from './report-builder/ReportConfiguration';
import SavedReportsList from './report-builder/SavedReportsList';

export interface ReportField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'status';
  selected: boolean;
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

const CustomReportBuilder = () => {
  const [currentReport, setCurrentReport] = useState<CustomReport>({
    id: '',
    name: '',
    description: '',
    fields: [],
    filters: [],
    groupBy: '',
    chartType: 'table'
  });

  const [savedReports, setSavedReports] = useState<CustomReport[]>([
    {
      id: '1',
      name: 'Customer Status Analysis',
      description: 'Breakdown of customers by status and creation date',
      fields: [
        { id: '1', name: 'Customer Name', type: 'text', selected: true },
        { id: '2', name: 'Status', type: 'status', selected: true },
        { id: '3', name: 'Created Date', type: 'date', selected: true }
      ],
      filters: [
        { id: '1', field: 'status', operator: 'equals', value: 'active' }
      ],
      groupBy: 'status',
      chartType: 'bar'
    }
  ]);

  const availableFields: ReportField[] = [
    { id: '1', name: 'Customer Name', type: 'text', selected: false },
    { id: '2', name: 'Email', type: 'text', selected: false },
    { id: '3', name: 'Phone', type: 'text', selected: false },
    { id: '4', name: 'Status', type: 'status', selected: false },
    { id: '5', name: 'Created Date', type: 'date', selected: false },
    { id: '6', name: 'Updated Date', type: 'date', selected: false },
    { id: '7', name: 'Ticket Count', type: 'number', selected: false },
    { id: '8', name: 'Last Activity', type: 'date', selected: false }
  ];

  const handleReportUpdate = (updates: Partial<CustomReport>) => {
    setCurrentReport(prev => ({ ...prev, ...updates }));
  };

  const handleFieldToggle = (fieldId: string) => {
    const field = availableFields.find(f => f.id === fieldId);
    if (!field) return;

    const isSelected = currentReport.fields.some(f => f.id === fieldId);
    
    if (isSelected) {
      setCurrentReport(prev => ({
        ...prev,
        fields: prev.fields.filter(f => f.id !== fieldId)
      }));
    } else {
      setCurrentReport(prev => ({
        ...prev,
        fields: [...prev.fields, { ...field, selected: true }]
      }));
    }
  };

  const addFilter = () => {
    const newFilter: ReportFilter = {
      id: Date.now().toString(),
      field: '',
      operator: 'equals',
      value: ''
    };
    
    setCurrentReport(prev => ({
      ...prev,
      filters: [...prev.filters, newFilter]
    }));
  };

  const updateFilter = (filterId: string, updates: Partial<ReportFilter>) => {
    setCurrentReport(prev => ({
      ...prev,
      filters: prev.filters.map(filter => 
        filter.id === filterId ? { ...filter, ...updates } : filter
      )
    }));
  };

  const removeFilter = (filterId: string) => {
    setCurrentReport(prev => ({
      ...prev,
      filters: prev.filters.filter(f => f.id !== filterId)
    }));
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

    const reportToSave: CustomReport = {
      ...currentReport,
      id: Date.now().toString()
    };

    setSavedReports(prev => [...prev, reportToSave]);
    setCurrentReport({
      id: '',
      name: '',
      description: '',
      fields: [],
      filters: [],
      groupBy: '',
      chartType: 'table'
    });
    
    toast.success('Report saved successfully');
  };

  const loadReport = (report: CustomReport) => {
    setCurrentReport({ ...report, id: '' });
    toast.success('Report loaded into builder');
  };

  const generateReport = () => {
    if (currentReport.fields.length === 0) {
      toast.error('Please select at least one field');
      return;
    }
    
    toast.success('Report generated successfully');
  };

  const exportReport = (report: CustomReport) => {
    toast.success(`Exporting ${report.name}...`);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              Report Builder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ReportBasicInfo 
              report={currentReport}
              onUpdate={handleReportUpdate}
            />

            <Separator />

            <FieldSelector
              availableFields={availableFields}
              selectedFields={currentReport.fields}
              onFieldToggle={handleFieldToggle}
            />

            <Separator />

            <FilterManager
              filters={currentReport.filters}
              availableFields={availableFields}
              onAddFilter={addFilter}
              onUpdateFilter={updateFilter}
              onRemoveFilter={removeFilter}
            />

            <Separator />

            <ReportConfiguration
              report={currentReport}
              onUpdate={handleReportUpdate}
            />

            <div className="flex gap-2">
              <Button onClick={generateReport} className="flex-1">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button variant="outline" onClick={saveReport}>
                Save
              </Button>
            </div>
          </CardContent>
        </Card>

        <SavedReportsList
          savedReports={savedReports}
          onLoadReport={loadReport}
          onRunReport={generateReport}
          onExportReport={exportReport}
        />
      </div>
    </div>
  );
};

export default CustomReportBuilder;

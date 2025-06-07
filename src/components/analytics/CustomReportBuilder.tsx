
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, Plus, X, BarChart3, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

interface ReportField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'status';
  selected: boolean;
}

interface ReportFilter {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface CustomReport {
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
    // In a real app, this would generate and display the actual report
  };

  const exportReport = (report: CustomReport) => {
    toast.success(`Exporting ${report.name}...`);
    // In a real app, this would trigger the actual export
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="report-name">Report Name</Label>
                <Input
                  id="report-name"
                  placeholder="Enter report name"
                  value={currentReport.name}
                  onChange={(e) => setCurrentReport(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="report-description">Description (Optional)</Label>
                <Input
                  id="report-description"
                  placeholder="Describe your report"
                  value={currentReport.description}
                  onChange={(e) => setCurrentReport(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Select Fields</h4>
                <Badge variant="secondary">{currentReport.fields.length} selected</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {availableFields.map((field) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={field.id}
                      checked={currentReport.fields.some(f => f.id === field.id)}
                      onCheckedChange={() => handleFieldToggle(field.id)}
                    />
                    <Label htmlFor={field.id} className="text-sm">{field.name}</Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                <Button variant="outline" size="sm" onClick={addFilter}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Filter
                </Button>
              </div>
              
              {currentReport.filters.map((filter) => (
                <div key={filter.id} className="flex items-center gap-2">
                  <Select 
                    value={filter.field} 
                    onValueChange={(value) => updateFilter(filter.id, { field: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Field" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFields.map((field) => (
                        <SelectItem key={field.id} value={field.name.toLowerCase()}>
                          {field.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    value={filter.operator} 
                    onValueChange={(value) => updateFilter(filter.id, { operator: value })}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="greater">Greater</SelectItem>
                      <SelectItem value="less">Less</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Input
                    placeholder="Value"
                    value={filter.value}
                    onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                    className="flex-1"
                  />
                  
                  <Button variant="outline" size="sm" onClick={() => removeFilter(filter.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Group By</Label>
                <Select 
                  value={currentReport.groupBy} 
                  onValueChange={(value) => setCurrentReport(prev => ({ ...prev, groupBy: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="created_date">Created Date</SelectItem>
                    <SelectItem value="updated_date">Updated Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Chart Type</Label>
                <Select 
                  value={currentReport.chartType} 
                  onValueChange={(value) => setCurrentReport(prev => ({ ...prev, chartType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="table">Table</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

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

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Saved Reports ({savedReports.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savedReports.map((report) => (
                <div key={report.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{report.name}</h4>
                      {report.description && (
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                      )}
                    </div>
                    <Badge variant="outline">{report.chartType}</Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-3">
                    <p>{report.fields.length} fields, {report.filters.length} filters</p>
                    {report.groupBy && <p>Grouped by: {report.groupBy}</p>}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => loadReport(report)}>
                      Load
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => generateReport()}>
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Run
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportReport(report)}>
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              ))}
              
              {savedReports.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No saved reports yet. Create your first custom report using the builder.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomReportBuilder;

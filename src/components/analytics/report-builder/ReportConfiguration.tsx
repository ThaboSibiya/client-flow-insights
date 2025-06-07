
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomReport } from '../CustomReportBuilder';

interface ReportConfigurationProps {
  report: CustomReport;
  onUpdate: (updates: Partial<CustomReport>) => void;
}

const ReportConfiguration = ({ report, onUpdate }: ReportConfigurationProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Group By</Label>
        <Select 
          value={report.groupBy} 
          onValueChange={(value) => onUpdate({ groupBy: value })}
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
          value={report.chartType} 
          onValueChange={(value) => onUpdate({ chartType: value })}
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
  );
};

export default ReportConfiguration;

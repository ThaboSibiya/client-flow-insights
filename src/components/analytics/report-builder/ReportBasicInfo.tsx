
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomReport } from '../CustomReportBuilder';

interface ReportBasicInfoProps {
  report: CustomReport;
  onUpdate: (updates: Partial<CustomReport>) => void;
}

const ReportBasicInfo = ({ report, onUpdate }: ReportBasicInfoProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="report-name">Report Name</Label>
        <Input
          id="report-name"
          placeholder="Enter report name"
          value={report.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="report-description">Description (Optional)</Label>
        <Input
          id="report-description"
          placeholder="Describe your report"
          value={report.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
        />
      </div>
    </div>
  );
};

export default ReportBasicInfo;

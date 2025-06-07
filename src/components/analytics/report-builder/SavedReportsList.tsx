
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, BarChart3, Download } from 'lucide-react';
import { CustomReport } from '../CustomReportBuilder';

interface SavedReportsListProps {
  savedReports: CustomReport[];
  onLoadReport: (report: CustomReport) => void;
  onRunReport: () => void;
  onExportReport: (report: CustomReport) => void;
}

const SavedReportsList = ({ 
  savedReports, 
  onLoadReport, 
  onRunReport, 
  onExportReport 
}: SavedReportsListProps) => {
  return (
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
                {report.groupBy && report.groupBy !== 'none' && <p>Grouped by: {report.groupBy}</p>}
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onLoadReport(report)}>
                  Load
                </Button>
                <Button variant="outline" size="sm" onClick={onRunReport}>
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Run
                </Button>
                <Button variant="outline" size="sm" onClick={() => onExportReport(report)}>
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
  );
};

export default SavedReportsList;

import React from 'react';
import { CheckCircle2, AlertCircle, History, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ImportDataType, ImportResults } from './types';

interface ImportResultsViewProps {
  results: ImportResults;
  dataType: ImportDataType;
  onImportMore: () => void;
  onViewHistory: () => void;
}

const ImportResultsView = ({ results, dataType, onImportMore, onViewHistory }: ImportResultsViewProps) => {
  const navigate = useNavigate();

  const handleViewRecords = () => {
    navigate(dataType === 'customers' ? '/customers' : '/pipeline');
  };

  return (
    <div className="space-y-4">
      <Card className="border-primary/20">
        <CardContent className="p-8 text-center space-y-4">
          <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Import Complete</h3>
          <div className="flex justify-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{results.success}</p>
              <p className="text-xs text-muted-foreground">Imported</p>
            </div>
            {results.skippedDuplicates > 0 && (
              <div className="text-center">
                <p className="text-2xl font-bold text-muted-foreground">{results.skippedDuplicates}</p>
                <p className="text-xs text-muted-foreground">Skipped</p>
              </div>
            )}
            {results.failed > 0 && (
              <div className="text-center">
                <p className="text-2xl font-bold text-destructive">{results.failed}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {results.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-1">Errors:</p>
            <ul className="text-xs space-y-0.5 max-h-28 overflow-y-auto">
              {results.errors.map((err, i) => (
                <li key={i}>• {err}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-center gap-3">
        <Button variant="outline" size="sm" onClick={onImportMore}>Import More</Button>
        <Button variant="outline" size="sm" onClick={onViewHistory}>
          <History className="h-4 w-4 mr-1" /> History
        </Button>
        <Button size="sm" onClick={handleViewRecords}>
          View {dataType.charAt(0).toUpperCase() + dataType.slice(1)} <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default ImportResultsView;

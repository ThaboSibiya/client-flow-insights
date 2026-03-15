import React from 'react';
import { History, Clock, Undo2, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ImportHistoryRecord } from './types';

interface ImportHistoryListProps {
  records: ImportHistoryRecord[];
  undoingId: string | null;
  onUndo: (record: ImportHistoryRecord) => void;
}

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

const ImportHistoryList = ({ records, undoingId, onUndo }: ImportHistoryListProps) => {
  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="p-10 text-center">
          <div className="p-3 rounded-full bg-muted w-fit mx-auto mb-3">
            <History className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No imports yet</p>
          <p className="text-xs text-muted-foreground mt-1">Your import history will appear here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {records.map(record => {
        const isUndone = record.status === 'undone';
        const canUndo = record.status === 'completed' && (record.imported_record_ids?.length ?? 0) > 0;

        return (
          <Card key={record.id} className={`transition-opacity ${isUndone ? 'opacity-50' : ''}`}>
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm text-foreground capitalize">{record.data_type}</span>
                  <Badge
                    variant={isUndone ? 'secondary' : record.status === 'completed' ? 'default' : 'secondary'}
                    className="text-[10px]"
                  >
                    {record.status}
                  </Badge>
                  {record.source_file && (
                    <span className="text-xs text-muted-foreground truncate max-w-[180px]">{record.source_file}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(record.created_at)}</span>
                  <span className="text-primary font-medium">✓ {record.success_count}</span>
                  {record.skipped_duplicates > 0 && <span>⏭ {record.skipped_duplicates}</span>}
                  {record.failed_count > 0 && <span className="text-destructive">✗ {record.failed_count}</span>}
                </div>
              </div>
              {canUndo && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={undoingId === record.id}
                      className="text-destructive hover:text-destructive"
                    >
                      {undoingId === record.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <><Undo2 className="h-3.5 w-3.5 mr-1" /> Undo</>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Undo Import
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete {record.imported_record_ids?.length || 0} {record.data_type} records
                        imported from "{record.source_file}". This cannot be reversed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onUndo(record)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Records
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ImportHistoryList;

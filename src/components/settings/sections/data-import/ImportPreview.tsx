import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { ImportDataType, FieldMapping, CRM_FIELDS } from './types';

interface ImportPreviewProps {
  dataType: ImportDataType;
  previewData: Record<string, string>[];
  totalRows: number;
  fieldMappings: FieldMapping[];
  skipDuplicates: boolean;
  onBack: () => void;
  onImport: () => void;
}

const ImportPreview = ({
  dataType, previewData, totalRows, fieldMappings,
  skipDuplicates, onBack, onImport,
}: ImportPreviewProps) => {
  const mappedFields = CRM_FIELDS[dataType].filter(f => fieldMappings.some(m => m.crmField === f.field));

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-foreground">Preview — first {previewData.length} of {totalRows} rows</h3>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/70">
              {mappedFields.map(f => (
                <th key={f.field} className="p-2.5 text-left font-medium text-foreground whitespace-nowrap">
                  {f.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewData.map((row, i) => (
              <tr key={i} className="border-t hover:bg-muted/30 transition-colors">
                {mappedFields.map(f => (
                  <td key={f.field} className="p-2.5 text-muted-foreground max-w-[180px] truncate">
                    {row[f.field] || <span className="text-muted-foreground/40">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Alert className="border-primary/20 bg-primary/5">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <AlertDescription className="text-foreground">
          Ready to import <strong>{totalRows}</strong> {dataType} records.
          {skipDuplicates && dataType === 'customers' && ' Duplicate emails will be skipped.'}
          {dataType !== 'customers' && ' Records will be matched to existing customers by email.'}
        </AlertDescription>
      </Alert>

      <div className="flex justify-between pt-1">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm">
              Import {totalRows} Records <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Import</AlertDialogTitle>
              <AlertDialogDescription>
                You're about to import <strong>{totalRows}</strong> {dataType} records into your workspace.
                {skipDuplicates && dataType === 'customers' && ' Duplicate emails will be automatically skipped.'}
                {' '}This action can be undone from the History tab.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onImport}>Start Import</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ImportPreview;

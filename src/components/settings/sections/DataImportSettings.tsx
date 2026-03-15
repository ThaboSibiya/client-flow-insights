import React, { useState, useCallback } from 'react';
import { Upload, History, Plug, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDataImport } from './data-import/useDataImport';
import { MainTab } from './data-import/types';
import ImportStepper from './data-import/ImportStepper';
import DataTypeSelector from './data-import/DataTypeSelector';
import FileUploadZone from './data-import/FileUploadZone';
import FieldMapper from './data-import/FieldMapper';
import ImportPreview from './data-import/ImportPreview';
import ImportProgress from './data-import/ImportProgress';
import ImportResultsView from './data-import/ImportResultsView';
import ImportHistoryList from './data-import/ImportHistoryList';
import ApiConnectTab from './data-import/ApiConnectTab';

const DataImportSettings = () => {
  const [mainTab, setMainTab] = useState<MainTab>('import');
  const {
    step, setStep,
    dataType, setDataType,
    csvHeaders, csvRows,
    fieldMappings, updateMapping,
    fileName,
    importProgress,
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
  } = useDataImport();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile, setIsDragging]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const missingRequired = validateMappings();
  const previewData = getMappedData().slice(0, 5);
  const showReset = mainTab === 'import' && step !== 'select' && step !== 'importing';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Data Import</h2>
          <p className="text-sm text-muted-foreground">
            Import from any CRM — CSV or Excel supported
          </p>
        </div>
        {showReset && (
          <Button variant="ghost" size="sm" onClick={resetImport} className="text-muted-foreground">
            <X className="h-4 w-4 mr-1" /> Start Over
          </Button>
        )}
      </div>

      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as MainTab)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-9">
          <TabsTrigger value="import" className="gap-1.5 text-xs">
            <Upload className="h-3.5 w-3.5" /> Import
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5 text-xs">
            <History className="h-3.5 w-3.5" /> History
          </TabsTrigger>
          <TabsTrigger value="connect" className="gap-1.5 text-xs">
            <Plug className="h-3.5 w-3.5" /> API Connect
          </TabsTrigger>
        </TabsList>

        {/* Import Tab */}
        <TabsContent value="import" className="space-y-5 mt-5">
          <ImportStepper currentStep={step} />

          {step === 'select' && (
            <DataTypeSelector
              dataType={dataType}
              onDataTypeChange={setDataType}
              skipDuplicates={skipDuplicates}
              onSkipDuplicatesChange={setSkipDuplicates}
              onContinue={() => setStep('upload')}
              onDownloadTemplate={downloadTemplate}
            />
          )}

          {step === 'upload' && (
            <FileUploadZone
              isDragging={isDragging}
              onDragging={setIsDragging}
              onDrop={handleDrop}
              onFileInput={handleFileInput}
              onBack={() => setStep('select')}
            />
          )}

          {step === 'map' && (
            <FieldMapper
              dataType={dataType}
              fileName={fileName}
              rowCount={csvRows.length}
              fieldMappings={fieldMappings}
              headerCount={csvHeaders.length}
              sampleRow={csvRows[0]}
              missingRequired={missingRequired}
              onUpdateMapping={updateMapping}
              onBack={() => setStep('upload')}
              onContinue={() => setStep('preview')}
            />
          )}

          {step === 'preview' && (
            <ImportPreview
              dataType={dataType}
              previewData={previewData}
              totalRows={csvRows.length}
              fieldMappings={fieldMappings}
              skipDuplicates={skipDuplicates}
              onBack={() => setStep('map')}
              onImport={executeImport}
            />
          )}

          {step === 'importing' && (
            <ImportProgress progress={importProgress} />
          )}

          {step === 'done' && (
            <ImportResultsView
              results={importResults}
              dataType={dataType}
              onImportMore={resetImport}
              onViewHistory={() => setMainTab('history')}
            />
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-5">
          <ImportHistoryList
            records={importHistory}
            undoingId={undoingId}
            onUndo={undoImport}
          />
        </TabsContent>

        {/* API Connect Tab */}
        <TabsContent value="connect" className="mt-5">
          <ApiConnectTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataImportSettings;

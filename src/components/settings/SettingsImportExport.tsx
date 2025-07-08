
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, FileText, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SettingsImportExport = () => {
  const [importData, setImportData] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Simulate export process
      const settings = {
        company: {
          name: "Sample Company",
          email: "info@company.com",
          phone: "+1234567890"
        },
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        appearance: {
          theme: "light",
          language: "en"
        },
        exportedAt: new Date().toISOString(),
        version: "1.0"
      };

      const dataStr = JSON.stringify(settings, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `settings-export-${new Date().getTime()}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "Settings Exported",
        description: "Your settings have been exported successfully."
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      toast({
        title: "No Data",
        description: "Please paste your settings data to import.",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    try {
      const settings = JSON.parse(importData);
      
      // Validate the structure
      if (!settings.version || !settings.exportedAt) {
        throw new Error("Invalid settings format");
      }

      // In a real app, you would apply these settings
      console.log("Importing settings:", settings);
      
      toast({
        title: "Settings Imported",
        description: "Your settings have been imported successfully."
      });
      
      setImportData('');
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Invalid settings format. Please check your data.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
        <Download className="h-4 w-4 mr-2" />
        {isExporting ? 'Exporting...' : 'Export'}
      </Button>
      
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Import Settings
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Importing settings will overwrite your current configuration. Please ensure you have a backup.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Settings Data (JSON)</label>
              <Textarea
                placeholder="Paste your exported settings JSON here..."
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                rows={8}
                className="font-mono text-xs"
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setImportData('')}
              >
                Clear
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={isImporting || !importData.trim()}
              >
                {isImporting ? 'Importing...' : 'Import Settings'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsImportExport;

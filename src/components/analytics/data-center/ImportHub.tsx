
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileSpreadsheet, 
  Database, 
  Cloud, 
  CheckCircle2, 
  AlertCircle,
  FileJson,
  FileText,
  Link2,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ImportSource {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  formats: string[];
}

const importSources: ImportSource[] = [
  {
    id: 'file',
    name: 'File Upload',
    icon: <Upload className="h-5 w-5" />,
    description: 'Upload CSV, Excel, or JSON files',
    formats: ['CSV', 'XLSX', 'XLS', 'JSON']
  },
  {
    id: 'google',
    name: 'Google Sheets',
    icon: <FileSpreadsheet className="h-5 w-5" />,
    description: 'Connect to Google Sheets',
    formats: ['Google Sheets']
  },
  {
    id: 'api',
    name: 'API Connection',
    icon: <Database className="h-5 w-5" />,
    description: 'Connect via REST API',
    formats: ['REST', 'GraphQL']
  },
  {
    id: 'cloud',
    name: 'Cloud Storage',
    icon: <Cloud className="h-5 w-5" />,
    description: 'Import from cloud storage',
    formats: ['S3', 'Azure', 'GCP']
  }
];

interface ImportHubProps {
  onImportComplete?: (data: any) => void;
}

const ImportHub: React.FC<ImportHubProps> = ({ onImportComplete }) => {
  const [selectedSource, setSelectedSource] = useState<string>('file');
  const [isImporting, setIsImporting] = useState(false);
  const [importHistory, setImportHistory] = useState<Array<{
    id: string;
    name: string;
    date: Date;
    status: 'success' | 'error';
    rows: number;
  }>>([
    { id: '1', name: 'customers_jan.csv', date: new Date(2025, 0, 15), status: 'success', rows: 1250 },
    { id: '2', name: 'tickets_export.xlsx', date: new Date(2025, 0, 28), status: 'success', rows: 856 },
    { id: '3', name: 'revenue_data.json', date: new Date(2025, 1, 1), status: 'error', rows: 0 }
  ]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    // Simulate import process
    setTimeout(() => {
      const newImport = {
        id: Date.now().toString(),
        name: file.name,
        date: new Date(),
        status: 'success' as const,
        rows: Math.floor(Math.random() * 1000) + 100
      };
      
      setImportHistory(prev => [newImport, ...prev]);
      setIsImporting(false);
      
      toast({
        title: "Import Successful",
        description: `${file.name} imported with ${newImport.rows} rows`,
      });
      
      onImportComplete?.(newImport);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Source Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {importSources.map((source) => (
          <button
            key={source.id}
            onClick={() => setSelectedSource(source.id)}
            className={`
              p-4 rounded-lg border text-left transition-all
              ${selectedSource === source.id 
                ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }
            `}
          >
            <div className={`mb-2 ${selectedSource === source.id ? 'text-primary' : 'text-muted-foreground'}`}>
              {source.icon}
            </div>
            <p className="font-medium text-sm">{source.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{source.description}</p>
          </button>
        ))}
      </div>

      {/* Import Area */}
      <Card>
        <CardContent className="pt-6">
          {selectedSource === 'file' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {isImporting ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Importing data...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="font-medium">Drop files here or click to upload</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Supports CSV, Excel, and JSON files
                    </p>
                    <div className="flex gap-2 justify-center mt-4">
                      <Badge variant="outline"><FileSpreadsheet className="h-3 w-3 mr-1" /> CSV</Badge>
                      <Badge variant="outline"><FileSpreadsheet className="h-3 w-3 mr-1" /> Excel</Badge>
                      <Badge variant="outline"><FileJson className="h-3 w-3 mr-1" /> JSON</Badge>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {selectedSource === 'google' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium">Google Sheets</p>
                  <p className="text-sm text-muted-foreground">Connect your Google account to import sheets</p>
                </div>
                <Button>
                  <Link2 className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Or paste a Google Sheets URL</Label>
                <div className="flex gap-2">
                  <Input placeholder="https://docs.google.com/spreadsheets/d/..." className="flex-1" />
                  <Button>Import</Button>
                </div>
              </div>
            </div>
          )}

          {selectedSource === 'api' && (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>API Endpoint</Label>
                  <Input placeholder="https://api.example.com/data" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Method</Label>
                    <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                      <option>GET</option>
                      <option>POST</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Auth Type</Label>
                    <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                      <option>None</option>
                      <option>Bearer Token</option>
                      <option>API Key</option>
                    </select>
                  </div>
                </div>
                <Button className="w-full">Test Connection & Import</Button>
              </div>
            </div>
          )}

          {selectedSource === 'cloud' && (
            <div className="grid grid-cols-3 gap-3">
              {['Amazon S3', 'Azure Blob', 'Google Cloud'].map((provider) => (
                <button
                  key={provider}
                  className="p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-all text-center"
                >
                  <Cloud className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">{provider}</p>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Recent Imports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {importHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                {item.status === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.date.toLocaleDateString()} • {item.rows.toLocaleString()} rows
                  </p>
                </div>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportHub;

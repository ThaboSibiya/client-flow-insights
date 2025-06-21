
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Archive, Download, Trash2, FolderOpen, Clock } from "lucide-react";
import { QuoteInvoice } from '@/types/quote';
import { toast } from '@/hooks/use-toast';

interface DocumentArchiveCardProps {
  quote: QuoteInvoice;
}

interface ArchivedDocument {
  id: string;
  name: string;
  type: 'pdf' | 'signed_pdf' | 'email';
  size: string;
  archivedAt: string;
  status: 'active' | 'archived';
}

const DocumentArchiveCard = ({ quote }: DocumentArchiveCardProps) => {
  const [autoArchive, setAutoArchive] = useState(true);
  const [documents, setDocuments] = useState<ArchivedDocument[]>([
    {
      id: '1',
      name: `Quote_${quote.number}.pdf`,
      type: 'pdf',
      size: '245 KB',
      archivedAt: '2024-01-20',
      status: 'active'
    },
    {
      id: '2',
      name: `Quote_${quote.number}_Signed.pdf`,
      type: 'signed_pdf',
      size: '267 KB',
      archivedAt: '2024-01-21',
      status: 'archived'
    },
    {
      id: '3',
      name: `Email_Confirmation_${quote.number}.html`,
      type: 'email',
      size: '15 KB',
      archivedAt: '2024-01-20',
      status: 'active'
    }
  ]);

  const handleArchiveDocument = (documentId: string) => {
    setDocuments(docs => 
      docs.map(doc => 
        doc.id === documentId 
          ? { ...doc, status: 'archived' as const, archivedAt: new Date().toISOString().split('T')[0] }
          : doc
      )
    );
    
    toast({
      title: "Document Archived",
      description: "Document has been moved to archive.",
    });
  };

  const handleDownloadDocument = (document: ArchivedDocument) => {
    toast({
      title: "Download Started",
      description: `Downloading ${document.name}`,
    });
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocuments(docs => docs.filter(doc => doc.id !== documentId));
    
    toast({
      title: "Document Deleted",
      description: "Document has been permanently deleted.",
      variant: "destructive",
    });
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'signed_pdf': return '✅';
      case 'email': return '📧';
      default: return '📄';
    }
  };

  const activeDocuments = documents.filter(doc => doc.status === 'active');
  const archivedDocuments = documents.filter(doc => doc.status === 'archived');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5" />
          Document Archive
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
          <div>
            <Label>Auto-Archive Completed Documents</Label>
            <p className="text-sm text-muted-foreground">
              Automatically archive documents when workflows complete
            </p>
          </div>
          <Switch
            checked={autoArchive}
            onCheckedChange={setAutoArchive}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Documents */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              <h4 className="font-medium">Active Documents</h4>
              <Badge variant="outline">{activeDocuments.length}</Badge>
            </div>
            
            <div className="space-y-2">
              {activeDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getDocumentIcon(doc.type)}</span>
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownloadDocument(doc)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleArchiveDocument(doc.id)}
                    >
                      <Archive className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Archived Documents */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              <h4 className="font-medium">Archived Documents</h4>
              <Badge variant="outline">{archivedDocuments.length}</Badge>
            </div>
            
            <div className="space-y-2">
              {archivedDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <span className="text-lg opacity-60">{getDocumentIcon(doc.type)}</span>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{doc.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Archived {doc.archivedAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownloadDocument(doc)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteDocument(doc.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
          <h4 className="font-medium text-blue-800 mb-2">Archive Storage</h4>
          <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <p>Total Documents: {documents.length}</p>
              <p>Storage Used: 527 KB</p>
            </div>
            <div>
              <p>Retention Period: 7 years</p>
              <p>Backup: Automated daily</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Export Archive
          </Button>
          <Button variant="outline" size="sm">
            Archive Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentArchiveCard;

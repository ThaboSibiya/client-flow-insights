
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PenTool, Send, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { QuoteInvoice } from '@/types/quote';
import { toast } from '@/hooks/use-toast';

interface ESignatureCardProps {
  quote: QuoteInvoice;
}

const ESignatureCard = ({ quote }: ESignatureCardProps) => {
  const [signerEmail, setSignerEmail] = useState(quote.customer_email || '');
  const [signerName, setSignerName] = useState(quote.customer_name || '');
  const [message, setMessage] = useState('');
  const [signatureStatus, setSignatureStatus] = useState<'pending' | 'sent' | 'signed' | 'expired'>('pending');
  const [isSending, setIsSending] = useState(false);

  const handleSendForSignature = async () => {
    if (!signerEmail || !signerName) {
      toast({
        title: "Missing Information",
        description: "Please provide signer email and name.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      // Simulate sending for signature
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSignatureStatus('sent');
      toast({
        title: "Signature Request Sent",
        description: `E-signature request sent to ${signerEmail}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send signature request.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const getStatusIcon = () => {
    switch (signatureStatus) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'sent': return <Send className="h-4 w-4" />;
      case 'signed': return <CheckCircle className="h-4 w-4" />;
      case 'expired': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (signatureStatus) {
      case 'pending': return 'default';
      case 'sent': return 'secondary';
      case 'signed': return 'default';
      case 'expired': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="h-5 w-5" />
          E-Signature Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
          <div>
            <h4 className="font-medium">Signature Status</h4>
            <p className="text-sm text-muted-foreground">
              Current status of the signature request
            </p>
          </div>
          <Badge variant={getStatusColor() as any} className="flex items-center gap-1">
            {getStatusIcon()}
            {signatureStatus.charAt(0).toUpperCase() + signatureStatus.slice(1)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Signer Name</Label>
            <Input
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Enter signer's full name"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Signer Email</Label>
            <Input
              type="email"
              value={signerEmail}
              onChange={(e) => setSignerEmail(e.target.value)}
              placeholder="Enter signer's email address"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Custom Message (Optional)</Label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a personal message for the signer..."
            rows={3}
          />
        </div>

        {signatureStatus === 'signed' && (
          <div className="p-4 border border-green-200 rounded-lg bg-green-50">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Document Signed</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Signed by {signerName} on {new Date().toLocaleDateString()}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="font-medium">Signature Requirements</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Customer approval required
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Legal binding signature
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Audit trail included
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Secure document storage
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleSendForSignature}
            disabled={isSending || signatureStatus === 'sent' || signatureStatus === 'signed'}
            className="flex-1"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSending ? 'Sending...' : 'Send for Signature'}
          </Button>
          {signatureStatus === 'signed' && (
            <Button variant="outline">
              Download Signed Document
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ESignatureCard;

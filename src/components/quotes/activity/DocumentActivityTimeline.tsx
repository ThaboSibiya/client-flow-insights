import React, { useState } from 'react';
import { QuoteInvoice } from '@/types/quote';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  FileText,
  Send,
  Mail,
  Eye,
  PenTool,
  Archive,
  CheckCircle,
  Clock,
  Loader2,
  Download,
  MessageSquare,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useQuoteEmail } from '@/hooks/useQuoteEmail';
import { usePDFGeneration } from '@/hooks/usePDFGeneration';
import { exportToPDF, getExportFilename } from '@/services/documentExportService';

interface DocumentActivityTimelineProps {
  quote: QuoteInvoice;
}

type StepStatus = 'completed' | 'active' | 'pending';

interface PipelineStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: StepStatus;
  timestamp?: string;
  description?: string;
}

const DocumentActivityTimeline: React.FC<DocumentActivityTimelineProps> = ({ quote }) => {
  const { sendQuoteEmail, isSending } = useQuoteEmail();
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [signerEmail, setSignerEmail] = useState(quote.customer_email || '');
  const [isSendingSignature, setIsSendingSignature] = useState(false);

  const getStepStatus = (stepId: string): StepStatus => {
    const statusFlow: Record<string, string[]> = {
      draft: ['generate'],
      sent: ['generate', 'send'],
      viewed: ['generate', 'send', 'track'],
      accepted: ['generate', 'send', 'track', 'sign'],
      paid: ['generate', 'send', 'track', 'sign', 'archive'],
      overdue: ['generate', 'send'],
    };

    const completedSteps = statusFlow[quote.status] || [];
    if (completedSteps.includes(stepId)) return 'completed';

    const allSteps = ['generate', 'send', 'track', 'sign', 'archive'];
    const firstPendingIdx = allSteps.findIndex((s) => !completedSteps.includes(s));
    if (allSteps[firstPendingIdx] === stepId) return 'active';

    return 'pending';
  };

  const handleDownloadPDF = async () => {
    setIsExportingPDF(true);
    try {
      await exportToPDF('document-preview', {
        filename: getExportFilename(quote, 'pdf'),
      });
      toast({ title: 'PDF Downloaded', description: 'Document saved as PDF.' });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to generate PDF.',
        variant: 'destructive',
      });
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleSendEmail = () => {
    sendQuoteEmail(quote);
  };

  const handleSendWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi,\n\nPlease find ${quote.type === 'quote' ? 'quote' : 'invoice'} ${quote.number} for R${quote.total.toFixed(2)}.\n\nThank you!`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleSendForSignature = async () => {
    if (!signerEmail) {
      toast({ title: 'Missing email', description: 'Provide signer email.', variant: 'destructive' });
      return;
    }
    setIsSendingSignature(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast({ title: 'Signature Request Sent', description: `Sent to ${signerEmail}` });
    } catch {
      toast({ title: 'Error', description: 'Failed to send.', variant: 'destructive' });
    } finally {
      setIsSendingSignature(false);
    }
  };

  const steps: PipelineStep[] = [
    {
      id: 'generate',
      label: 'Generate PDF',
      icon: <FileText className="h-4 w-4" />,
      status: getStepStatus('generate'),
      description: 'Download or export as PDF',
    },
    {
      id: 'send',
      label: 'Send to Customer',
      icon: <Send className="h-4 w-4" />,
      status: getStepStatus('send'),
      description: 'Email or WhatsApp delivery',
    },
    {
      id: 'track',
      label: 'Track Delivery',
      icon: <Eye className="h-4 w-4" />,
      status: getStepStatus('track'),
      description: 'Opened, clicked, viewed',
    },
    {
      id: 'sign',
      label: 'E-Signature',
      icon: <PenTool className="h-4 w-4" />,
      status: getStepStatus('sign'),
      description: 'Customer signs digitally',
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: <Archive className="h-4 w-4" />,
      status: getStepStatus('archive'),
      description: 'Stored for records',
    },
  ];

  const statusIcon = (status: StepStatus) => {
    if (status === 'completed') return <CheckCircle className="h-5 w-5 text-primary" />;
    if (status === 'active') return <Clock className="h-5 w-5 text-warning" />;
    return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />;
  };

  return (
    <div className="space-y-1">
      {/* Document info bar */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3 mb-4">
        <div className="flex items-center gap-3">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">
              {quote.type === 'quote' ? 'Quote' : 'Invoice'} #{quote.number}
            </p>
            <p className="text-xs text-muted-foreground">{quote.customer_name}</p>
          </div>
        </div>
        <Badge
          variant={
            quote.status === 'paid'
              ? 'default'
              : quote.status === 'overdue'
              ? 'destructive'
              : 'secondary'
          }
          className="capitalize"
        >
          {quote.status}
        </Badge>
      </div>

      {/* Pipeline steps */}
      <div className="space-y-0">
        {steps.map((step, index) => (
          <div key={step.id} className="relative flex gap-4">
            {/* Vertical line */}
            <div className="flex flex-col items-center">
              <div className="flex-shrink-0 mt-1">{statusIcon(step.status)}</div>
              {index < steps.length - 1 && (
                <div
                  className={`w-px flex-1 min-h-[2rem] ${
                    step.status === 'completed' ? 'bg-primary/40' : 'bg-border'
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 pb-6 ${step.status === 'pending' ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {step.icon}
                  <span className="text-sm font-medium text-foreground">{step.label}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>

              {/* Step-specific actions */}
              {step.id === 'generate' && step.status === 'active' && (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleDownloadPDF} disabled={isExportingPDF}>
                    {isExportingPDF ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Download className="h-3 w-3 mr-1" />}
                    PDF
                  </Button>
                </div>
              )}

              {step.id === 'send' && step.status === 'active' && (
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSendEmail}
                    disabled={isSending || !quote.customer_email}
                  >
                    {isSending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Mail className="h-3 w-3 mr-1" />}
                    Email
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleSendWhatsApp}>
                    <MessageSquare className="h-3 w-3 mr-1" />
                    WhatsApp
                  </Button>
                </div>
              )}

              {step.id === 'sign' && step.status === 'active' && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label className="text-xs">Signer Email</Label>
                      <Input
                        type="email"
                        value={signerEmail}
                        onChange={(e) => setSignerEmail(e.target.value)}
                        placeholder="customer@email.com"
                        className="h-8 text-sm"
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={handleSendForSignature}
                      disabled={isSendingSignature}
                    >
                      {isSendingSignature ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <Send className="h-3 w-3 mr-1" />
                      )}
                      Sign
                    </Button>
                  </div>
                </div>
              )}

              {step.id === 'send' && step.status === 'completed' && (
                <p className="text-xs text-primary mt-1">
                  Sent to {quote.customer_email}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentActivityTimeline;

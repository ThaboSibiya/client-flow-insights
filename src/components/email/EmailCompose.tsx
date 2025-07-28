
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Send, Paperclip, X } from 'lucide-react';
import { toast } from 'sonner';
import { emailService } from '@/services/emailService';

interface EmailComposeProps {
  onClose: () => void;
  onSent: () => void;
  replyTo?: {
    thread_id: string;
    subject: string;
    to_emails: string[];
  };
}

const EmailCompose = ({ onClose, onSent, replyTo }: EmailComposeProps) => {
  const [to, setTo] = useState(replyTo?.to_emails?.join(', ') || '');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(replyTo?.subject ? `Re: ${replyTo.subject}` : '');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [showCcBcc, setShowCcBcc] = useState(false);

  const handleSend = async () => {
    if (!to.trim() || !subject.trim()) {
      toast.error('Please fill in the recipient and subject fields');
      return;
    }

    try {
      setSending(true);
      
      const emailData = {
        to_emails: to.split(',').map(email => email.trim()).filter(Boolean),
        cc_emails: cc ? cc.split(',').map(email => email.trim()).filter(Boolean) : [],
        bcc_emails: bcc ? bcc.split(',').map(email => email.trim()).filter(Boolean) : [],
        subject: subject.trim(),
        body_text: body,
        body_html: body.replace(/\n/g, '<br>'),
        thread_id: replyTo?.thread_id,
      };

      await emailService.sendEmail(emailData);
      onSent();
    } catch (error) {
      console.error('Failed to send email:', error);
      toast.error('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {replyTo ? 'Reply to Email' : 'Compose New Email'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              required
            />
          </div>

          {!showCcBcc && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowCcBcc(true)}
              >
                Add CC/BCC
              </Button>
            </div>
          )}

          {showCcBcc && (
            <>
              <div className="space-y-2">
                <Label htmlFor="cc">CC</Label>
                <Input
                  id="cc"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  placeholder="cc@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bcc">BCC</Label>
                <Input
                  id="bcc"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  placeholder="bcc@example.com"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              required
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message here..."
              className="min-h-[200px]"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Paperclip className="h-4 w-4 mr-2" />
                Attach Files
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSend} disabled={sending}>
                <Send className="h-4 w-4 mr-2" />
                {sending ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailCompose;

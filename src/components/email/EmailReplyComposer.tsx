
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Send, Paperclip, Bold, Italic, Link } from 'lucide-react';
import { toast } from 'sonner';
import { emailService, Email } from '@/services/emailService';

interface EmailReplyComposerProps {
  email: Email;
  onClose: () => void;
  onSent: () => void;
  replyType?: 'reply' | 'reply-all' | 'forward';
}

const EmailReplyComposer = ({ email, onClose, onSent, replyType = 'reply' }: EmailReplyComposerProps) => {
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const getRecipients = () => {
    switch (replyType) {
      case 'reply':
        return [email.from_email];
      case 'reply-all':
        return [email.from_email, ...email.to_emails, ...email.cc_emails].filter(Boolean);
      case 'forward':
        return [];
      default:
        return [email.from_email];
    }
  };

  const getSubject = () => {
    const prefix = replyType === 'forward' ? 'Fwd:' : 'Re:';
    return email.subject.startsWith(prefix) ? email.subject : `${prefix} ${email.subject}`;
  };

  const handleSend = async () => {
    if (!body.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      setSending(true);
      
      const recipients = getRecipients();
      if (recipients.length === 0 && replyType !== 'forward') {
        toast.error('No recipients found');
        return;
      }

      const emailData = {
        to_emails: recipients,
        cc_emails: [],
        bcc_emails: [],
        subject: getSubject(),
        body_text: body,
        body_html: body.replace(/\n/g, '<br>'),
        thread_id: email.thread_id,
        reply_to: email.from_email,
      };

      await emailService.sendEmail(emailData);
      onSent();
      toast.success('Reply sent successfully');
    } catch (error) {
      console.error('Failed to send reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const getOriginalEmailQuote = () => {
    const date = new Date(email.message_date).toLocaleString();
    return `

------- Original Message -------
From: ${email.from_name || email.from_email} <${email.from_email}>
Date: ${date}
Subject: ${email.subject}

${email.body_text || 'No content'}`;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {replyType === 'forward' ? 'Forward Email' : 
             replyType === 'reply-all' ? 'Reply All' : 'Reply'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">To:</span> {getRecipients().join(', ') || 'Enter recipients...'}
            </div>
            <div className="text-sm">
              <span className="font-medium">Subject:</span> {getSubject()}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex gap-2 border-b pb-2">
              <Button variant="ghost" size="sm">
                <Bold className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Italic className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Link className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
            
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your reply here..."
              className="min-h-[200px] resize-none"
            />
          </div>

          {replyType !== 'forward' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 whitespace-pre-wrap">
                {getOriginalEmailQuote()}
              </div>
            </div>
          )}

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

export default EmailReplyComposer;

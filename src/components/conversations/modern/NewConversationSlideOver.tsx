import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MessageCircle, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

interface NewConversationSlideOverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type ConversationType = 'email' | 'whatsapp' | 'telegram' | 'internal_chat';

const typeOptions: { id: ConversationType; label: string; icon: React.ReactNode }[] = [
  { id: 'email', label: 'Email', icon: <Mail className="h-4 w-4" /> },
  { id: 'whatsapp', label: 'WhatsApp', icon: <Phone className="h-4 w-4" /> },
  { id: 'telegram', label: 'Telegram', icon: <TelegramIcon className="h-4 w-4" /> },
  { id: 'internal_chat', label: 'Internal', icon: <MessageCircle className="h-4 w-4" /> },
];

const NewConversationSlideOver = ({ open, onOpenChange, onSuccess }: NewConversationSlideOverProps) => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<ConversationType>('email');
  const [subject, setSubject] = useState('');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !subject.trim() || !message.trim()) return;

    setLoading(true);
    
    try {
      // P5: Build recipient fields based on type
      const recipientFields: Record<string, string | null> = {
        recipient_email: null,
        recipient_phone: null,
        recipient_name: null,
      };

      if (type === 'email' && recipient.trim()) {
        recipientFields.recipient_email = recipient.trim();
        recipientFields.recipient_name = recipient.trim();
      } else if (type === 'whatsapp' && recipient.trim()) {
        recipientFields.recipient_phone = recipient.trim();
      } else if (type === 'telegram' && recipient.trim()) {
        recipientFields.recipient_phone = recipient.trim(); // Chat ID or username
        recipientFields.recipient_name = recipient.trim();
      }

      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          company_owner_id: user.id,
          type,
          subject: subject.trim(),
          status: 'active',
          ...recipientFields,
        } as any)
        .select()
        .single();
        
      if (convError) throw convError;

      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_type: 'employee',
          sender_name: user.email || 'Unknown',
          sender_email: user.email,
          content: message.trim(),
          message_type: type === 'internal_chat' ? 'internal_note' : 'text',
        });
        
      if (messageError) throw messageError;

      toast({
        title: 'Conversation created',
        description: 'Your new conversation has been started.',
      });

      setSubject('');
      setRecipient('');
      setMessage('');
      setType('email');
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create conversation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isValid = subject.trim() && message.trim();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="pb-4 border-b border-border/50">
          <SheetTitle className="text-lg">New Conversation</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col pt-4">
          {/* Type Selector */}
          <div className="space-y-2 mb-4">
            <Label className="text-xs text-muted-foreground">Type</Label>
            <div className="flex gap-2">
              {typeOptions.map((option) => (
                <Button
                  key={option.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "flex-1 gap-1.5 h-9",
                    type === option.id && "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                  )}
                  onClick={() => setType(option.id)}
                >
                  {option.icon}
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="subject" className="text-xs text-muted-foreground">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What's this about?"
              className="h-9"
            />
          </div>

          {/* Recipient (for non-internal) */}
          {type !== 'internal_chat' && (
            <div className="space-y-2 mb-4">
              <Label htmlFor="recipient" className="text-xs text-muted-foreground">
                {type === 'email' ? 'Email Address' : type === 'telegram' ? 'Telegram Chat ID or Username' : 'Phone Number'}
              </Label>
              <Input
                id="recipient"
                type={type === 'email' ? 'email' : 'text'}
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={
                  type === 'email' 
                    ? 'name@example.com' 
                    : type === 'telegram'
                    ? '@username or chat ID'
                    : '+1 234 567 8900'
                }
                className="h-9"
              />
            </div>
          )}

          {/* Message */}
          <div className="space-y-2 flex-1">
            <Label htmlFor="message" className="text-xs text-muted-foreground">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 min-h-[120px] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-4 mt-4 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 gap-1.5"
              disabled={loading || !isValid}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default NewConversationSlideOver;

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

interface NewConversationSlideOverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type ConversationType = 'email' | 'whatsapp' | 'internal_chat';

const typeOptions: { id: ConversationType; label: string; icon: React.ReactNode }[] = [
  { id: 'email', label: 'Email', icon: <Mail className="h-4 w-4" /> },
  { id: 'whatsapp', label: 'WhatsApp', icon: <Phone className="h-4 w-4" /> },
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
      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          company_owner_id: user.id,
          type,
          subject: subject.trim(),
          status: 'active',
        })
        .select()
        .single();
        
      if (convError) throw convError;

      // Create initial message
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

      // Reset form
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
                {type === 'email' ? 'Email Address' : 'Phone Number'}
              </Label>
              <Input
                id="recipient"
                type={type === 'email' ? 'email' : 'tel'}
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={type === 'email' ? 'name@example.com' : '+1 234 567 8900'}
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

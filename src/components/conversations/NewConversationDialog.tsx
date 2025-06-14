
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewConversationDialog = ({ open, onOpenChange }: NewConversationDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'email',
    subject: '',
    recipient_email: '',
    recipient_name: '',
    initial_message: '',
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          company_owner_id: user.id,
          type: formData.type,
          subject: formData.subject,
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
          content: formData.initial_message,
          message_type: formData.type === 'internal_chat' ? 'internal_note' : 'text',
        });
        
      if (messageError) throw messageError;
      
      toast({
        title: "Success",
        description: "Conversation created successfully",
      });
      
      setFormData({
        type: 'email',
        subject: '',
        recipient_email: '',
        recipient_name: '',
        initial_message: '',
      });
      
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start New Conversation</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="internal_chat">Internal Chat</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Enter conversation subject"
              required
            />
          </div>
          
          {formData.type !== 'internal_chat' && (
            <>
              <div>
                <Label htmlFor="recipient_name">Recipient Name</Label>
                <Input
                  id="recipient_name"
                  value={formData.recipient_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipient_name: e.target.value }))}
                  placeholder="Enter recipient name"
                />
              </div>
              
              <div>
                <Label htmlFor="recipient_email">Recipient Email/Phone</Label>
                <Input
                  id="recipient_email"
                  value={formData.recipient_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipient_email: e.target.value }))}
                  placeholder="Enter email or phone number"
                  required
                />
              </div>
            </>
          )}
          
          <div>
            <Label htmlFor="initial_message">Initial Message</Label>
            <Textarea
              id="initial_message"
              value={formData.initial_message}
              onChange={(e) => setFormData(prev => ({ ...prev, initial_message: e.target.value }))}
              placeholder="Type your message..."
              rows={4}
              required
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Start Conversation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewConversationDialog;

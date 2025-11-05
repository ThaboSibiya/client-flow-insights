import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  Plus, 
  Clock, 
  User, 
  Edit2, 
  Trash2,
  Flag,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface ReconciliationNote {
  id: string;
  user_id: string;
  customer_id?: string;
  invoice_id?: string;
  payment_id?: string;
  note_type: string;
  note_content: string;
  created_by: string;
  priority: string;
  is_system_generated: boolean;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface ReconciliationNotesProps {
  invoiceId?: string;
  paymentId?: string;
  customerId?: string;
  showAddButton?: boolean;
}

const ReconciliationNotes: React.FC<ReconciliationNotesProps> = ({
  invoiceId,
  paymentId,
  customerId,
  showAddButton = true
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<ReconciliationNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState({
    content: '',
    type: 'general',
    priority: 'normal'
  });
  const [editingNote, setEditingNote] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user, invoiceId, paymentId, customerId]);

  const fetchNotes = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('reconciliation_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (invoiceId) {
        query = query.eq('invoice_id', invoiceId);
      }
      if (paymentId) {
        query = query.eq('payment_id', paymentId);
      }
      if (customerId) {
        query = query.eq('customer_id', customerId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!user || !newNote.content.trim()) return;

    try {
      const noteData = {
        user_id: user.id,
        customer_id: customerId || null,
        invoice_id: invoiceId || null,
        payment_id: paymentId || null,
        note_type: newNote.type,
        note_content: newNote.content.trim(),
        created_by: user.email || 'Unknown User',
        priority: newNote.priority,
        is_system_generated: false,
        metadata: {
          invoice_id: invoiceId,
          payment_id: paymentId,
          customer_id: customerId
        }
      };

      const { error } = await supabase
        .from('reconciliation_notes')
        .insert(noteData);

      if (error) throw error;

      toast({
        title: "Note Added",
        description: "Your note has been saved successfully",
      });

      setNewNote({ content: '', type: 'general', priority: 'normal' });
      setIsDialogOpen(false);
      fetchNotes();
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('reconciliation_notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Note Deleted",
        description: "Note has been removed",
      });

      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  const getNoteTypeIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'flag':
        return <Flag className="h-4 w-4 text-red-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
    }
  };

  const getNoteTypeBadge = (type: string) => {
    const configs: Record<string, { label: string; className: string }> = {
      match: { label: 'Match', className: 'bg-green-100 text-green-800' },
      partial: { label: 'Partial', className: 'bg-yellow-100 text-yellow-800' },
      flag: { label: 'Flagged', className: 'bg-red-100 text-red-800' },
      general: { label: 'General', className: 'bg-blue-100 text-blue-800' }
    };
    const config = configs[type] || configs.general;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const configs: Record<string, { label: string; className: string }> = {
      high: { label: 'High', className: 'bg-red-100 text-red-800' },
      normal: { label: 'Normal', className: 'bg-gray-100 text-gray-800' },
      low: { label: 'Low', className: 'bg-green-100 text-green-800' }
    };
    const config = configs[priority] || configs.normal;
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  return (
    <Card className="border-quikle-silver/20 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-quikle-charcoal flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-quikle-primary" />
              Reconciliation Notes
            </CardTitle>
            <CardDescription>
              Track comments and actions with full audit trail
            </CardDescription>
          </div>
          {showAddButton && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-to-r from-quikle-primary to-quikle-secondary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Add Reconciliation Note</DialogTitle>
                  <DialogDescription>
                    Add a note or comment about this reconciliation item
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="note-type">Note Type</Label>
                    <Select
                      value={newNote.type}
                      onValueChange={(value) => setNewNote({ ...newNote, type: value })}
                    >
                      <SelectTrigger id="note-type">
                        <SelectValue placeholder="Select note type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="match">Match</SelectItem>
                        <SelectItem value="partial">Partial Payment</SelectItem>
                        <SelectItem value="flag">Flagged Issue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newNote.priority}
                      onValueChange={(value) => setNewNote({ ...newNote, priority: value })}
                    >
                      <SelectTrigger id="priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="note-content">Note</Label>
                    <Textarea
                      id="note-content"
                      placeholder="Enter your note here..."
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAddNote}
                    disabled={!newNote.content.trim()}
                  >
                    Save Note
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-quikle-slate">Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-quikle-slate">No notes yet</p>
            <p className="text-sm text-quikle-slate/70">Add notes to track reconciliation activities</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="border border-quikle-silver/20 rounded-lg p-4 bg-gradient-to-r from-white to-gray-50 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getNoteTypeIcon(note.note_type)}
                      {getNoteTypeBadge(note.note_type)}
                      {getPriorityBadge(note.priority)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteNote(note.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-quikle-charcoal mb-3 whitespace-pre-wrap">
                    {note.note_content}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-quikle-slate">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{note.created_by}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{format(new Date(note.created_at), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                    {note.updated_at !== note.created_at && (
                      <Badge variant="outline" className="text-xs">
                        Edited
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default ReconciliationNotes;
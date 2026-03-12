import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DebtorNote, NoteType, NotePriority } from '@/types/finance';
import { Plus, Phone, Bell, Calendar, AlertTriangle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

interface DebtorNotesPanelProps {
  notes: DebtorNote[];
  onAddNote: (note: Partial<DebtorNote>) => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
}

const DebtorNotesPanel = ({ notes, onAddNote, hasMore = false, onLoadMore, loadingMore = false }: DebtorNotesPanelProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [noteType, setNoteType] = useState<NoteType>('general');
  const [priority, setPriority] = useState<NotePriority>('normal');
  const [content, setContent] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  const handleSubmit = () => {
    if (!content.trim()) return;

    onAddNote({
      note_type: noteType,
      note_content: content,
      priority,
      follow_up_date: followUpDate || null,
      created_by: user?.email || 'Unknown',
    });

    setContent('');
    setFollowUpDate('');
    setNoteType('general');
    setPriority('normal');
    setOpen(false);
  };

  const getNoteIcon = (type: NoteType) => {
    switch (type) {
      case 'call': return <Phone className="h-4 w-4" />;
      case 'reminder': return <Bell className="h-4 w-4" />;
      case 'promise_to_pay': return <Calendar className="h-4 w-4" />;
      case 'dispute': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: NotePriority) => {
    switch (priority) {
      case 'urgent': return 'text-destructive bg-destructive/10';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'normal': return 'text-primary bg-primary/10';
      case 'low': return 'text-muted-foreground bg-muted';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Debtor Notes</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Debtor Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Note Type</label>
                <Select value={noteType} onValueChange={(v) => setNoteType(v as NoteType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="promise_to_pay">Promise to Pay</SelectItem>
                    <SelectItem value="dispute">Dispute</SelectItem>
                    <SelectItem value="payment_plan">Payment Plan</SelectItem>
                    <SelectItem value="escalation">Escalation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select value={priority} onValueChange={(v) => setPriority(v as NotePriority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Note Content</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter note details..."
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Follow-up Date (Optional)</label>
                <Input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </div>

              <Button onClick={handleSubmit} className="w-full" disabled={!content.trim()}>
                Add Note
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No notes yet. Add your first note above.</p>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {notes.map((note) => (
              <div key={note.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getNoteIcon(note.note_type)}
                    <span className="font-medium capitalize">{note.note_type.replace('_', ' ')}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(note.priority)}`}>
                    {note.priority}
                  </span>
                </div>
                <p className="text-sm">{note.note_content}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>By {note.created_by}</span>
                  <span>{format(new Date(note.created_at), 'MMM dd, yyyy HH:mm')}</span>
                </div>
                {note.follow_up_date && (
                  <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                    <Calendar className="h-3 w-3" />
                    Follow-up: {format(new Date(note.follow_up_date), 'MMM dd, yyyy')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {hasMore && onLoadMore && (
          <div className="flex justify-center mt-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onLoadMore}
              disabled={loadingMore}
              size="sm"
            >
              {loadingMore ? 'Loading...' : 'Load More Notes'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DebtorNotesPanel;

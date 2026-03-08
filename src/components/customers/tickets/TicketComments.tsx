import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  addTicketComment,
  getTicketComments,
  updateTicketComment,
  deleteTicketComment,
  type TicketComment,
} from '@/services/ticketCommentService';
import { sendTicketNotification } from '@/services/ticketNotificationService';
import CommentForm from './comments/CommentForm';
import CommentsList from './comments/CommentsList';
import { formatTicketDate } from '@/utils/ticketFormatters';

interface TicketCommentsProps {
  ticketId: string;
  customerEmail?: string;
  customerName?: string;
}

const TicketComments = ({ ticketId, customerEmail, customerName }: TicketCommentsProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    if (user && ticketId) loadComments();
  }, [user, ticketId]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const data = await getTicketComments(ticketId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;
    setIsSubmitting(true);
    try {
      const comment = await addTicketComment(ticketId, user.id, user.email || 'Unknown User', newComment.trim(), isInternal);
      if (comment) {
        setComments(prev => [...prev, comment]);
        setNewComment('');
        if (!isInternal && customerEmail && customerName) {
          await sendTicketNotification({
            ticketId,
            customerEmail,
            customerName,
            ticketNumber: `TKT-${ticketId.slice(-6)}`,
            subject: 'Ticket Update',
            type: 'comment_added',
            details: { comment: newComment.trim(), isInternal, userName: user.email || 'Support Team' },
          });
        }
        setIsInternal(false);
        toast({ title: "Success", description: "Comment added successfully" });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (comment: TicketComment) => {
    setEditingId(comment.id);
    setEditText(comment.comment);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim() || !editingId) return;
    const success = await updateTicketComment(editingId, editText.trim());
    if (success) {
      setComments(prev => prev.map(c =>
        c.id === editingId ? { ...c, comment: editText.trim(), updated_at: new Date().toISOString() } : c
      ));
      setEditingId(null);
      setEditText('');
      toast({ title: "Success", description: "Comment updated" });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    const success = await deleteTicketComment(deleteTargetId);
    if (success) {
      setComments(prev => prev.filter(c => c.id !== deleteTargetId));
      toast({ title: "Success", description: "Comment deleted" });
    }
    setDeleteTargetId(null);
  };

  if (!user) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-sm text-foreground">Comments</span>
        {comments.length > 0 && <Badge variant="outline" className="text-xs">{comments.length}</Badge>}
      </div>

      <CommentForm
        newComment={newComment}
        setNewComment={setNewComment}
        isInternal={isInternal}
        setIsInternal={setIsInternal}
        isSubmitting={isSubmitting}
        onSubmit={handleAddComment}
      />

      <CommentsList
        comments={comments}
        isLoading={isLoading}
        currentUserId={user.id}
        editingId={editingId}
        editText={editText}
        setEditText={setEditText}
        onEdit={handleEdit}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
        onDelete={(id) => setDeleteTargetId(id)}
        formatDate={(dateString) => formatTicketDate(dateString)}
      />

      <AlertDialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TicketComments;

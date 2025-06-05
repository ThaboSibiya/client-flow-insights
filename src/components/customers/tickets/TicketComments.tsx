
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import {
  addTicketComment,
  getTicketComments,
  updateTicketComment,
  deleteTicketComment,
  type TicketComment
} from '@/services/ticketCommentService';
import CommentForm from './comments/CommentForm';
import CommentsList from './comments/CommentsList';

interface TicketCommentsProps {
  ticketId: string;
}

const TicketComments = ({ ticketId }: TicketCommentsProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (user && ticketId) {
      loadComments();
    }
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
      const comment = await addTicketComment(
        ticketId,
        user.id,
        user.email || 'Unknown User',
        newComment.trim(),
        isInternal
      );
      
      if (comment) {
        setComments(prev => [...prev, comment]);
        setNewComment('');
        setIsInternal(false);
        toast({
          title: "Success",
          description: "Comment added successfully",
        });
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
        c.id === editingId 
          ? { ...c, comment: editText.trim(), updated_at: new Date().toISOString() }
          : c
      ));
      setEditingId(null);
      setEditText('');
      toast({
        title: "Success",
        description: "Comment updated successfully",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleDelete = async (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      const success = await deleteTicketComment(commentId);
      if (success) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        toast({
          title: "Success",
          description: "Comment deleted successfully",
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  if (!user) return null;

  return (
    <div className="border-t pt-3 mt-3">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="h-4 w-4" />
        <span className="font-medium text-sm">Comments</span>
        {comments.length > 0 && (
          <Badge variant="outline" className="text-xs">
            {comments.length}
          </Badge>
        )}
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
        onDelete={handleDelete}
        formatDate={formatDate}
      />
    </div>
  );
};

export default TicketComments;

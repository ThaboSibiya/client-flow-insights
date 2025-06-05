
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { MessageSquare, Edit, Trash2, Save, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import {
  addTicketComment,
  getTicketComments,
  updateTicketComment,
  deleteTicketComment,
  type TicketComment
} from '@/services/ticketCommentService';

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

      {/* Add new comment */}
      <div className="space-y-2 mb-4">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={2}
          className="text-sm"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="internal-comment"
              checked={isInternal}
              onCheckedChange={setIsInternal}
            />
            <label htmlFor="internal-comment" className="text-xs text-gray-600">
              Internal note (not visible to customer)
            </label>
          </div>
          <Button
            size="sm"
            onClick={handleAddComment}
            disabled={!newComment.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Comment'
            )}
          </Button>
        </div>
      </div>

      {/* Comments list */}
      {isLoading ? (
        <div className="text-center py-4">
          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
          <p className="text-xs text-gray-500 mt-1">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-4">No comments yet</p>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-3 rounded-lg ${
                comment.is_internal 
                  ? 'bg-yellow-50 border border-yellow-200' 
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{comment.user_name}</span>
                  {comment.is_internal && (
                    <Badge variant="secondary" className="text-xs">
                      Internal
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">
                    {formatDate(comment.created_at)}
                    {comment.updated_at !== comment.created_at && ' (edited)'}
                  </span>
                  {comment.user_id === user.id && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleEdit(comment)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                        onClick={() => handleDelete(comment.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {editingId === comment.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={2}
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveEdit}>
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {comment.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketComments;

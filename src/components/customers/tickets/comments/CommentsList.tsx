
import React from 'react';
import { Loader2 } from 'lucide-react';
import { TicketComment } from '@/services/ticketCommentService';
import CommentItem from './CommentItem';

interface CommentsListProps {
  comments: TicketComment[];
  isLoading: boolean;
  currentUserId: string;
  editingId: string | null;
  editText: string;
  setEditText: (value: string) => void;
  onEdit: (comment: TicketComment) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (commentId: string) => void;
  formatDate: (dateString: string) => string;
}

const CommentsList = ({
  comments,
  isLoading,
  currentUserId,
  editingId,
  editText,
  setEditText,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  formatDate
}: CommentsListProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-4">
        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
        <p className="text-xs text-gray-500 mt-1">Loading comments...</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <p className="text-xs text-gray-500 text-center py-4">No comments yet</p>
    );
  }

  return (
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          isEditing={editingId === comment.id}
          editText={editText}
          setEditText={setEditText}
          onEdit={() => onEdit(comment)}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
          onDelete={() => onDelete(comment.id)}
          formatDate={formatDate}
        />
      ))}
    </div>
  );
};

export default CommentsList;

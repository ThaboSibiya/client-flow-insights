
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Save, X } from 'lucide-react';
import { TicketComment } from '@/services/ticketCommentService';

interface CommentItemProps {
  comment: TicketComment;
  currentUserId: string;
  isEditing: boolean;
  editText: string;
  setEditText: (value: string) => void;
  onEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  formatDate: (dateString: string) => string;
}

const CommentItem = ({
  comment,
  currentUserId,
  isEditing,
  editText,
  setEditText,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  formatDate
}: CommentItemProps) => {
  return (
    <div
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
          {comment.user_id === currentUserId && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={onEdit}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                onClick={onDelete}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={2}
            className="text-sm"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={onSaveEdit}>
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={onCancelEdit}>
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
  );
};

export default CommentItem;

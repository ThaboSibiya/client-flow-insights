
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Save, X, Lock, MessageSquare } from 'lucide-react';
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
      className={`relative p-4 rounded-lg border-l-4 ${
        comment.is_internal 
          ? 'bg-gradient-to-r from-slate-50 to-slate-100 border-l-slate-500 border border-slate-200' 
          : 'bg-gradient-to-r from-blue-50 to-blue-100 border-l-blue-500 border border-blue-200'
      }`}
    >
      {/* Comment type indicator */}
      <div className="absolute top-2 right-2">
        {comment.is_internal ? (
          <Lock className="h-4 w-4 text-slate-600" />
        ) : (
          <MessageSquare className="h-4 w-4 text-blue-600" />
        )}
      </div>

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`font-semibold text-sm ${
            comment.is_internal ? 'text-slate-800' : 'text-blue-800'
          }`}>
            {comment.user_name}
          </span>
          <Badge 
            variant={comment.is_internal ? "secondary" : "default"}
            className={`text-xs ${
              comment.is_internal 
                ? 'bg-slate-100 text-slate-700 border-slate-300' 
                : 'bg-blue-100 text-blue-700 border-blue-300'
            }`}
          >
            {comment.is_internal ? (
              <>
                <Lock className="h-3 w-3 mr-1" />
                Internal Note
              </>
            ) : (
              <>
                <MessageSquare className="h-3 w-3 mr-1" />
                Customer Visible
              </>
            )}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-600">
            {formatDate(comment.created_at)}
            {comment.updated_at !== comment.created_at && (
              <span className="ml-1 italic">(edited)</span>
            )}
          </span>
          {comment.user_id === currentUserId && (
            <div className="flex gap-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-white/50"
                onClick={onEdit}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
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
            rows={3}
            className="text-sm bg-white"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={onSaveEdit} className="text-xs">
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={onCancelEdit} className="text-xs">
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className={`p-3 rounded-md ${
          comment.is_internal 
            ? 'bg-white/60 border border-slate-200' 
            : 'bg-white/60 border border-blue-200'
        }`}>
          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {comment.comment}
          </p>
        </div>
      )}
    </div>
  );
};

export default CommentItem;

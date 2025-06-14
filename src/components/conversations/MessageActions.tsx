
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, Check, X } from 'lucide-react';
import { useMessageManagement } from '@/hooks/useMessageManagement';
import { formatDistanceToNow } from 'date-fns';

interface MessageActionsProps {
  messageId: string;
  conversationId: string;
  content: string;
  senderEmail: string | null;
  createdAt: string;
  currentUserEmail: string | null;
  isEdited?: boolean;
}

const MessageActions = ({ 
  messageId, 
  conversationId, 
  content, 
  senderEmail, 
  createdAt,
  currentUserEmail,
  isEdited 
}: MessageActionsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const { deleteMessage, editMessage, isDeletingMessage, isEditingMessage } = useMessageManagement(conversationId);

  const isOwner = senderEmail === currentUserEmail;
  const createdDate = new Date(createdAt);
  const now = new Date();
  const timeDiffMinutes = (now.getTime() - createdDate.getTime()) / (1000 * 60);
  
  const canEdit = isOwner && timeDiffMinutes <= 15;
  const canDelete = isOwner && timeDiffMinutes <= 5;

  const handleEdit = () => {
    if (editContent.trim() && editContent !== content) {
      editMessage({ messageId, newContent: editContent });
      setIsEditing(false);
    } else {
      setIsEditing(false);
      setEditContent(content);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      deleteMessage(messageId);
    }
  };

  if (!isOwner || (!canEdit && !canDelete)) {
    return null;
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 mt-2">
        <Input
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="flex-1"
          autoFocus
        />
        <Button 
          size="sm" 
          onClick={handleEdit}
          disabled={isEditingMessage}
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => {
            setIsEditing(false);
            setEditContent(content);
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {isEdited && (
        <span className="text-xs text-gray-500">(edited)</span>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <MoreVertical className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canEdit && (
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Edit className="h-3 w-3 mr-2" />
              Edit ({Math.ceil(15 - timeDiffMinutes)}m left)
            </DropdownMenuItem>
          )}
          {canDelete && (
            <DropdownMenuItem 
              onClick={handleDelete}
              disabled={isDeletingMessage}
              className="text-red-600"
            >
              <Trash2 className="h-3 w-3 mr-2" />
              Delete ({Math.ceil(5 - timeDiffMinutes)}m left)
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MessageActions;

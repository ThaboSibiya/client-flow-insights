
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

interface CommentFormProps {
  newComment: string;
  setNewComment: (value: string) => void;
  isInternal: boolean;
  setIsInternal: (value: boolean) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
}

const CommentForm = ({
  newComment,
  setNewComment,
  isInternal,
  setIsInternal,
  isSubmitting,
  onSubmit
}: CommentFormProps) => {
  const handleInternalChange = (checked: boolean | "indeterminate") => {
    setIsInternal(checked === true);
  };

  return (
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
            onCheckedChange={handleInternalChange}
          />
          <label htmlFor="internal-comment" className="text-xs text-gray-600">
            Internal note (not visible to customer)
          </label>
        </div>
        <Button
          size="sm"
          onClick={onSubmit}
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
  );
};

export default CommentForm;

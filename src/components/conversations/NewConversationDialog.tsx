
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewConversationDialog = ({ open, onOpenChange }: NewConversationDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start New Conversation</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p className="text-sm text-gray-500">New conversation functionality coming soon...</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewConversationDialog;

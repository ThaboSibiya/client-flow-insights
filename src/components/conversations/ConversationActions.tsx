
import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Archive, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import { useConversationManagement } from '@/hooks/useConversationManagement';

interface ConversationActionsProps {
  conversationId: string;
  currentStatus: 'active' | 'closed' | 'archived';
  assignedTo?: string | null;
}

const ConversationActions = ({ 
  conversationId, 
  currentStatus, 
  assignedTo 
}: ConversationActionsProps) => {
  const [showAssignSelect, setShowAssignSelect] = useState(false);
  const { archiveConversation, assignConversation, updateConversationStatus } = useConversationManagement();

  const handleStatusChange = (status: 'active' | 'closed' | 'archived') => {
    updateConversationStatus({ conversationId, status });
  };

  const handleAssign = (employeeId: string) => {
    assignConversation({ conversationId, employeeId });
    setShowAssignSelect(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      case 'archived': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge className={getStatusColor(currentStatus)}>
        {currentStatus}
      </Badge>
      
      {showAssignSelect ? (
        <Select onValueChange={handleAssign}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Assign to..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="employee1">John Doe</SelectItem>
            <SelectItem value="employee2">Jane Smith</SelectItem>
            <SelectItem value="employee3">Mike Johnson</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowAssignSelect(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Assign
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {currentStatus !== 'active' && (
              <DropdownMenuItem onClick={() => handleStatusChange('active')}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Active
              </DropdownMenuItem>
            )}
            {currentStatus !== 'closed' && (
              <DropdownMenuItem onClick={() => handleStatusChange('closed')}>
                <XCircle className="h-4 w-4 mr-2" />
                Close
              </DropdownMenuItem>
            )}
            {currentStatus !== 'archived' && (
              <DropdownMenuItem onClick={() => archiveConversation(conversationId)}>
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default ConversationActions;

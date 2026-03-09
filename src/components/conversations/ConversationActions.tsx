import React, { useState, useEffect } from 'react';
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
import { MoreVertical, Archive, UserPlus, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useConversationManagement } from '@/hooks/useConversationManagement';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  designation: string;
}

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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const { user } = useAuth();
  const { archiveConversation, assignConversation, updateConversationStatus } = useConversationManagement();

  // P6: Dynamic employee list
  useEffect(() => {
    if (!showAssignSelect || !user) return;

    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('id, first_name, last_name, designation')
          .eq('company_owner_id', user.id)
          .eq('status', 'active')
          .order('first_name');

        if (!error && data) {
          setEmployees(data);
        }
      } catch (err) {
        console.error('Error fetching employees:', err);
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, [showAssignSelect, user]);

  const handleStatusChange = (status: 'active' | 'closed' | 'archived') => {
    updateConversationStatus({ conversationId, status });
  };

  const handleAssign = (employeeId: string) => {
    assignConversation({ conversationId, employeeId });
    setShowAssignSelect(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant={
        currentStatus === 'active' ? 'default' : 
        currentStatus === 'closed' ? 'secondary' : 'outline'
      }>
        {currentStatus}
      </Badge>
      
      {showAssignSelect ? (
        <div className="flex items-center gap-1">
          <Select onValueChange={handleAssign}>
            <SelectTrigger className="w-44 h-8 text-sm">
              <SelectValue placeholder={loadingEmployees ? 'Loading...' : 'Assign to...'} />
            </SelectTrigger>
            <SelectContent>
              {loadingEmployees ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : employees.length === 0 ? (
                <div className="py-3 px-2 text-sm text-muted-foreground text-center">
                  No active employees
                </div>
              ) : (
                employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name}
                    {emp.designation && (
                      <span className="text-muted-foreground ml-1">· {emp.designation}</span>
                    )}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={() => setShowAssignSelect(false)}
          >
            Cancel
          </Button>
        </div>
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

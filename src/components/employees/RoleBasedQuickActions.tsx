
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Calendar, 
  Users, 
  Settings, 
  Mail, 
  Phone, 
  Edit, 
  UserPlus,
  Clock,
  FileText,
  Award
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  status: string;
}

interface RoleBasedQuickActionsProps {
  employee: Employee;
  currentUserRole: string;
  onEditEmployee: (employee: Employee) => void;
  onAssignTask?: (employeeId: string) => void;
  onScheduleMeeting?: (employeeId: string) => void;
  onManagePrivileges?: (employeeId: string) => void;
  onViewPerformance?: (employeeId: string) => void;
  onSendMessage?: (employeeId: string) => void;
}

const RoleBasedQuickActions = ({
  employee,
  currentUserRole,
  onEditEmployee,
  onAssignTask,
  onScheduleMeeting,
  onManagePrivileges,
  onViewPerformance,
  onSendMessage
}: RoleBasedQuickActionsProps) => {
  
  const canManageEmployee = () => {
    return currentUserRole === 'admin' || 
           (currentUserRole === 'manager' && employee.role !== 'admin');
  };

  const canAssignTasks = () => {
    return ['admin', 'manager', 'supervisor'].includes(currentUserRole) &&
           !['admin', 'manager'].includes(employee.role);
  };

  const canManagePrivileges = () => {
    return currentUserRole === 'admin';
  };

  const canViewPerformance = () => {
    return ['admin', 'manager'].includes(currentUserRole);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'manager': return <Users className="h-4 w-4" />;
      case 'supervisor': return <Award className="h-4 w-4" />;
      default: return <UserPlus className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'supervisor': return 'bg-green-100 text-green-800 border-green-200';
      case 'employee': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspended': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'terminated': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Role and Status Badges */}
      <Badge className={getRoleColor(employee.role)}>
        {getRoleIcon(employee.role)}
        <span className="ml-1">{employee.role}</span>
      </Badge>
      
      <Badge className={getStatusColor(employee.status)}>
        {employee.status}
      </Badge>

      {/* Communication Actions */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSendMessage?.(employee.id)}
        className="h-8 px-2"
      >
        <Mail className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => window.open(`tel:${employee.email}`, '_blank')}
        className="h-8 px-2"
      >
        <Phone className="h-4 w-4" />
      </Button>

      {/* Schedule Meeting */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onScheduleMeeting?.(employee.id)}
        className="h-8 px-2"
      >
        <Calendar className="h-4 w-4" />
      </Button>

      {/* Task Assignment (Managers and above) */}
      {canAssignTasks() && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAssignTask?.(employee.id)}
          className="h-8 px-2"
        >
          <Clock className="h-4 w-4" />
        </Button>
      )}

      {/* Performance View (Managers and above) */}
      {canViewPerformance() && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewPerformance?.(employee.id)}
          className="h-8 px-2"
        >
          <FileText className="h-4 w-4" />
        </Button>
      )}

      {/* Privilege Management (Admin only) */}
      {canManagePrivileges() && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onManagePrivileges?.(employee.id)}
          className="h-8 px-2"
        >
          <Settings className="h-4 w-4" />
        </Button>
      )}

      {/* Edit Employee (Based on permissions) */}
      {canManageEmployee() && (
        <Button
          variant="default"
          size="sm"
          onClick={() => onEditEmployee(employee)}
          className="h-8 px-3 bg-quikle-primary hover:bg-quikle-secondary"
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      )}
    </div>
  );
};

export default RoleBasedQuickActions;


import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Mail, Phone, Calendar, Building, Users } from "lucide-react";
import InvitationSender from './InvitationSender';
import RoleBasedQuickActions from './RoleBasedQuickActions';

interface Employee {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  designation: string;
  title: string;
  department?: string;
  role: string;
  status: string;
  hire_date: string;
  is_invited?: boolean;
  invitation_sent_at?: string;
  invitation_expires_at?: string;
  auth_user_id?: string;
  last_login_at?: string;
}

interface EmployeeListProps {
  employees: Employee[];
  loading: boolean;
  onEditEmployee: (employee: Employee) => void;
  onInvitationSent?: () => void;
  currentUserRole?: string;
}

const EmployeeList = ({ 
  employees, 
  loading, 
  onEditEmployee, 
  onInvitationSent,
  currentUserRole = 'admin' // Default to admin for now
}: EmployeeListProps) => {
  const getAuthStatus = (employee: Employee) => {
    if (employee.auth_user_id) {
      return (
        <Badge variant="secondary" className="text-green-600 border-green-200">
          ✓ Registered
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-gray-600">
        ⏳ Pending Setup
      </Badge>
    );
  };

  const handleAssignTask = (employeeId: string) => {
    console.log('Assign task to employee:', employeeId);
    // Implement task assignment logic
  };

  const handleScheduleMeeting = (employeeId: string) => {
    console.log('Schedule meeting with employee:', employeeId);
    // Implement meeting scheduling logic
  };

  const handleManagePrivileges = (employeeId: string) => {
    console.log('Manage privileges for employee:', employeeId);
    // Implement privilege management logic
  };

  const handleViewPerformance = (employeeId: string) => {
    console.log('View performance for employee:', employeeId);
    // Implement performance viewing logic
  };

  const handleSendMessage = (employeeId: string) => {
    console.log('Send message to employee:', employeeId);
    // Implement messaging logic
  };

  if (loading) {
    return <div className="text-center py-8 text-quikle-slate">Loading employees...</div>;
  }

  if (employees.length === 0) {
    return (
      <div className="text-center py-8 text-quikle-slate">
        <Users className="h-12 w-12 mx-auto mb-4 text-quikle-silver" />
        <p>No employees found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {employees.map((employee) => (
        <Card key={employee.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <h3 className="text-lg font-semibold text-quikle-charcoal">
                    {employee.first_name} {employee.last_name}
                  </h3>
                  {getAuthStatus(employee)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-quikle-slate">
                      <Building className="h-4 w-4" />
                      <span className="font-medium">#{employee.employee_number}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-quikle-slate">
                      <Mail className="h-4 w-4" />
                      <span>{employee.email}</span>
                    </div>
                    {employee.phone && (
                      <div className="flex items-center gap-2 text-sm text-quikle-slate">
                        <Phone className="h-4 w-4" />
                        <span>{employee.phone}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium text-quikle-charcoal">Title: </span>
                      <span className="text-quikle-slate">{employee.title}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-quikle-charcoal">Designation: </span>
                      <span className="text-quikle-slate">{employee.designation}</span>
                    </div>
                    {employee.department && (
                      <div className="text-sm">
                        <span className="font-medium text-quikle-charcoal">Department: </span>
                        <span className="text-quikle-slate">{employee.department}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-quikle-slate">
                      <Calendar className="h-4 w-4" />
                      <span>Hired: {new Date(employee.hire_date).toLocaleDateString()}</span>
                    </div>
                    {employee.last_login_at && (
                      <div className="text-sm text-quikle-slate">
                        Last login: {new Date(employee.last_login_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Role-based Quick Actions */}
                <div className="mt-4 pt-4 border-t border-quikle-silver/30">
                  <RoleBasedQuickActions
                    employee={employee}
                    currentUserRole={currentUserRole}
                    onEditEmployee={onEditEmployee}
                    onAssignTask={handleAssignTask}
                    onScheduleMeeting={handleScheduleMeeting}
                    onManagePrivileges={handleManagePrivileges}
                    onViewPerformance={handleViewPerformance}
                    onSendMessage={handleSendMessage}
                  />
                </div>

                {/* Invitation Management */}
                <div className="mt-4 pt-4 border-t border-quikle-silver/30">
                  <InvitationSender
                    employee={employee}
                    companyName="Your Company" // This should come from company settings
                    onInvitationSent={onInvitationSent || (() => {})}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EmployeeList;

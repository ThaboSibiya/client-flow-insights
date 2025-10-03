
import React, { useEffect, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Mail, Phone, Calendar, Building, Users } from "lucide-react";
import { useEmployeeDetails } from '@/hooks/useEmployeeDetails';

interface BasicEmployee {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  designation: string;
  role: string;
  status: string;
  is_invited: boolean;
  auth_user_id: string | null;
}

interface OptimizedEmployeeListProps {
  employees: BasicEmployee[];
  loading: boolean;
  onEditEmployee: (employee: any) => void;
  onInvitationSent?: () => void;
}

const OptimizedEmployeeList = ({ employees, loading, onEditEmployee, onInvitationSent }: OptimizedEmployeeListProps) => {
  const { detailedEmployees, loadingDetails, loadEmployeeDetails } = useEmployeeDetails();

  // Memoize employee IDs to prevent unnecessary re-fetches
  const employeeIds = useMemo(() => employees.map(emp => emp.id), [employees]);

  useEffect(() => {
    if (employeeIds.length > 0) {
      loadEmployeeDetails(employeeIds);
    }
  }, [employeeIds, loadEmployeeDetails]);

  const getStatusColor = useMemo(() => (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-quikle-success border border-quikle-success/20';
      case 'inactive': return 'bg-quikle-platinum text-quikle-slate border border-quikle-silver';
      case 'suspended': return 'bg-quikle-crystal text-quikle-accent border border-quikle-accent/30';
      case 'terminated': return 'bg-red-50 text-quikle-danger border border-quikle-danger/20';
      default: return 'bg-quikle-platinum text-quikle-slate border border-quikle-silver';
    }
  }, []);

  const getRoleColor = useMemo(() => (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-50 text-quikle-purple border border-quikle-purple/20';
      case 'manager': return 'bg-blue-50 text-quikle-info border border-quikle-info/20';
      case 'supervisor': return 'bg-quikle-platinum text-quikle-secondary border border-quikle-silver';
      case 'employee': return 'bg-green-50 text-quikle-success border border-quikle-success/20';
      case 'intern': return 'bg-quikle-crystal text-quikle-slate border border-quikle-silver/80';
      default: return 'bg-quikle-platinum text-quikle-slate border border-quikle-silver';
    }
  }, []);

  const getAuthStatus = useMemo(() => (employee: BasicEmployee) => {
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
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-quikle-slate">Loading team members...</div>;
  }

  if (employees.length === 0) {
    return (
      <div className="text-center py-8 text-quikle-slate">
        <Users className="h-12 w-12 mx-auto mb-4 text-quikle-silver" />
        <p>No team members found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {employees.map((employee) => {
        const detailedEmployee = detailedEmployees[employee.id];
        const isLoadingDetail = loadingDetails[employee.id];

        return (
          <Card key={employee.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-quikle-charcoal">
                      {employee.first_name} {employee.last_name}
                    </h3>
                    <Badge className={getStatusColor(employee.status)}>
                      {employee.status}
                    </Badge>
                    <Badge className={getRoleColor(employee.role)}>
                      {employee.role}
                    </Badge>
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
                      {detailedEmployee?.phone && (
                        <div className="flex items-center gap-2 text-sm text-quikle-slate">
                          <Phone className="h-4 w-4" />
                          <span>{detailedEmployee.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium text-quikle-charcoal">Designation: </span>
                        <span className="text-quikle-slate">{employee.designation}</span>
                      </div>
                      {detailedEmployee && !isLoadingDetail && (
                        <>
                          <div className="text-sm">
                            <span className="font-medium text-quikle-charcoal">Title: </span>
                            <span className="text-quikle-slate">{detailedEmployee.title}</span>
                          </div>
                          {detailedEmployee.department && (
                            <div className="text-sm">
                              <span className="font-medium text-quikle-charcoal">Department: </span>
                              <span className="text-quikle-slate">{detailedEmployee.department}</span>
                            </div>
                          )}
                        </>
                      )}
                      {isLoadingDetail && (
                        <div className="text-sm text-quikle-slate">Loading details...</div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {detailedEmployee && !isLoadingDetail && (
                        <>
                          <div className="flex items-center gap-2 text-sm text-quikle-slate">
                            <Calendar className="h-4 w-4" />
                            <span>Hired: {new Date(detailedEmployee.hire_date).toLocaleDateString()}</span>
                          </div>
                          {detailedEmployee.last_login_at && (
                            <div className="text-sm text-quikle-slate">
                              Last login: {new Date(detailedEmployee.last_login_at).toLocaleDateString()}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditEmployee(detailedEmployee || employee)}
                  className="border-quikle-silver text-quikle-charcoal hover:bg-quikle-crystal"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default OptimizedEmployeeList;


import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Mail, Phone, Calendar, Building } from "lucide-react";

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
}

interface EmployeeListProps {
  employees: Employee[];
  loading: boolean;
  onEditEmployee: (employee: Employee) => void;
}

const EmployeeList = ({ employees, loading, onEditEmployee }: EmployeeListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'supervisor': return 'bg-indigo-100 text-indigo-800';
      case 'employee': return 'bg-green-100 text-green-800';
      case 'intern': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-quikle-charcoal">
                    {employee.first_name} {employee.last_name}
                  </h3>
                  <Badge className={getStatusColor(employee.status)}>
                    {employee.status}
                  </Badge>
                  <Badge className={getRoleColor(employee.role)}>
                    {employee.role}
                  </Badge>
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
                  </div>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditEmployee(employee)}
                className="border-quikle-silver text-quikle-charcoal hover:bg-quikle-crystal"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EmployeeList;

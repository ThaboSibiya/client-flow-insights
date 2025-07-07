
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  ChevronRight, 
  Users, 
  Crown, 
  Shield, 
  UserCheck,
  Building
} from "lucide-react";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  department?: string;
  manager_id?: string;
  employee_number: string;
  status: string;
}

interface TeamHierarchyProps {
  employees: Employee[];
  onEmployeeSelect?: (employee: Employee) => void;
}

interface HierarchyNodeProps {
  employee: Employee;
  directReports: Employee[];
  level: number;
  onEmployeeSelect?: (employee: Employee) => void;
}

const HierarchyNode = ({ employee, directReports, level, onEmployeeSelect }: HierarchyNodeProps) => {
  const [isOpen, setIsOpen] = useState(level < 2); // Auto-expand top 2 levels

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-purple-600" />;
      case 'manager': return <Shield className="h-4 w-4 text-blue-600" />;
      case 'supervisor': return <UserCheck className="h-4 w-4 text-green-600" />;
      default: return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'manager': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'supervisor': return 'bg-green-50 border-green-200 text-green-800';
      case 'employee': return 'bg-gray-50 border-gray-200 text-gray-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`${level > 0 ? 'ml-6 border-l-2 border-quikle-silver/30 pl-4' : ''}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-2 mb-2">
          {directReports.length > 0 && (
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          )}
          
          <Card 
            className={`flex-1 hover:shadow-md transition-all cursor-pointer ${getRoleColor(employee.role)}`}
            onClick={() => onEmployeeSelect?.(employee)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-quikle-primary text-white text-sm">
                      {employee.first_name[0]}{employee.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(employee.role)}
                      <h4 className="font-medium text-sm">
                        {employee.first_name} {employee.last_name}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-600">#{employee.employee_number}</p>
                    {employee.department && (
                      <div className="flex items-center gap-1 mt-1">
                        <Building className="h-3 w-3" />
                        <span className="text-xs">{employee.department}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <Badge className={`text-xs ${getStatusColor(employee.status)}`}>
                    {employee.status}
                  </Badge>
                  {directReports.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {directReports.length} report{directReports.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <CollapsibleContent>
          <div className="space-y-2">
            {directReports.map((report) => (
              <HierarchyNode
                key={report.id}
                employee={report}
                directReports={[]} // Will be populated by parent
                level={level + 1}
                onEmployeeSelect={onEmployeeSelect}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

const TeamHierarchy = ({ employees, onEmployeeSelect }: TeamHierarchyProps) => {
  // Build hierarchy structure
  const buildHierarchy = () => {
    const employeeMap = new Map();
    const topLevel: Employee[] = [];

    // Initialize map with all employees
    employees.forEach(emp => {
      employeeMap.set(emp.id, { ...emp, directReports: [] });
    });

    // Build hierarchy
    employees.forEach(employee => {
      if (employee.manager_id && employeeMap.has(employee.manager_id)) {
        const manager = employeeMap.get(employee.manager_id);
        manager.directReports.push(employee);
      } else {
        topLevel.push(employee);
      }
    });

    return { employeeMap, topLevel };
  };

  const { employeeMap, topLevel } = buildHierarchy();

  // Get statistics
  const departmentStats = employees.reduce((acc, emp) => {
    const dept = emp.department || 'Unassigned';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const roleStats = employees.reduce((acc, emp) => {
    acc[emp.role] = (acc[emp.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-quikle-primary" />
          Team Hierarchy
        </CardTitle>
        
        {/* Quick Stats */}
        <div className="flex flex-wrap gap-4 text-sm text-quikle-slate">
          <div className="flex items-center gap-2">
            <span>Total: {employees.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Departments: {Object.keys(departmentStats).length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Managers: {roleStats.manager || 0}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {topLevel.length === 0 ? (
          <div className="text-center py-8 text-quikle-slate">
            <Users className="h-12 w-12 mx-auto mb-4 text-quikle-silver" />
            <p>No team hierarchy available</p>
            <p className="text-sm">Add employees and set manager relationships</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topLevel.map((employee) => (
              <HierarchyNode
                key={employee.id}
                employee={employee}
                directReports={employeeMap.get(employee.id)?.directReports || []}
                level={0}
                onEmployeeSelect={onEmployeeSelect}
              />
            ))}
          </div>
        )}
        
        {/* Department Breakdown */}
        {Object.keys(departmentStats).length > 1 && (
          <div className="mt-6 pt-4 border-t border-quikle-silver/30">
            <h4 className="font-medium text-quikle-charcoal mb-3">Department Breakdown</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(departmentStats).map(([dept, count]) => (
                <Badge key={dept} variant="outline" className="text-xs">
                  {dept}: {count}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamHierarchy;


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Users, 
  Plus,
  SortAsc,
  X
} from "lucide-react";
import MobileEmployeeCard from './MobileEmployeeCard';
import { useMobileDetection } from '@/hooks/useMobileDetection';

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
  auth_user_id?: string;
  last_login_at?: string;
}

interface MobileEmployeeDirectoryProps {
  employees: Employee[];
  loading: boolean;
  onEditEmployee: (employee: Employee) => void;
  onAddEmployee: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const MobileEmployeeDirectory = ({ 
  employees, 
  loading, 
  onEditEmployee, 
  onAddEmployee,
  searchTerm,
  onSearchChange
}: MobileEmployeeDirectoryProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'role'>('name');
  const { shouldUseMobileView } = useMobileDetection();

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`, '_self');
  };

  const handleMessage = (employeeId: string) => {
    console.log('Message employee:', employeeId);
    // Implement messaging logic
  };

  const filteredEmployees = employees
    .filter(employee => {
      const matchesSearch = 
        employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.designation.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = !selectedRole || employee.role === selectedRole;
      const matchesStatus = !selectedStatus || employee.status === selectedStatus;
      
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
        case 'date':
          return new Date(b.hire_date).getTime() - new Date(a.hire_date).getTime();
        case 'role':
          return a.role.localeCompare(b.role);
        default:
          return 0;
      }
    });

  const uniqueRoles = [...new Set(employees.map(emp => emp.role))];
  const uniqueStatuses = [...new Set(employees.map(emp => emp.status))];

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-quikle-charcoal">Team Directory</h2>
          <p className="text-sm text-quikle-slate">{filteredEmployees.length} employees</p>
        </div>
        <Button 
          onClick={onAddEmployee}
          size="sm"
          className="bg-quikle-primary hover:bg-quikle-secondary"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-quikle-slate h-4 w-4" />
        <Input
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-6 w-6 p-0 ${showFilters ? 'bg-quikle-primary text-white' : ''}`}
          >
            <Filter className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortBy(sortBy === 'name' ? 'date' : sortBy === 'date' ? 'role' : 'name')}
            className="h-6 w-6 p-0"
          >
            <SortAsc className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="animate-accordion-down">
          <CardContent className="p-3">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-quikle-charcoal">Role</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge
                    variant={!selectedRole ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedRole('')}
                  >
                    All
                  </Badge>
                  {uniqueRoles.map(role => (
                    <Badge
                      key={role}
                      variant={selectedRole === role ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedRole(role === selectedRole ? '' : role)}
                    >
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-quikle-charcoal">Status</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge
                    variant={!selectedStatus ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedStatus('')}
                  >
                    All
                  </Badge>
                  {uniqueStatuses.map(status => (
                    <Badge
                      key={status}
                      variant={selectedStatus === status ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedStatus(status === selectedStatus ? '' : status)}
                    >
                      {status}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Employee List */}
      {filteredEmployees.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-quikle-silver" />
            <p className="text-quikle-slate">No employees found</p>
            {searchTerm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSearchChange('')}
                className="mt-2"
              >
                Clear search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredEmployees.map((employee) => (
            <MobileEmployeeCard
              key={employee.id}
              employee={employee}
              onEditEmployee={onEditEmployee}
              onCall={handleCall}
              onEmail={handleEmail}
              onMessage={handleMessage}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileEmployeeDirectory;

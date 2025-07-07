
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Plus, Edit, ArrowUp, ArrowDown } from "lucide-react";
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  department?: string;
  manager_id?: string;
  employee_number: string;
}

interface OrgChartProps {
  employees: Employee[];
  onUpdateHierarchy: (employeeId: string, newManagerId: string | null) => void;
  onEditEmployee: (employee: Employee) => void;
}

interface EmployeeNodeProps {
  employee: Employee;
  level: number;
  directReports: Employee[];
  onEditEmployee: (employee: Employee) => void;
}

const EmployeeNode = ({ employee, level, directReports, onEditEmployee }: EmployeeNodeProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: employee.id,
  });

  const { setNodeRef: dropRef, isOver } = useDroppable({
    id: `drop-${employee.id}`,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
  } : {};

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'supervisor': return 'bg-green-100 text-green-800 border-green-200';
      case 'employee': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div 
      className={`ml-${level * 8} mb-4`}
      ref={dropRef}
    >
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`
          relative cursor-move transition-all duration-200
          ${isOver ? 'ring-2 ring-quikle-primary' : ''}
          ${isDragging ? 'z-50' : ''}
        `}
      >
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-quikle-primary text-white">
                    {employee.first_name[0]}{employee.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h4 className="font-semibold text-quikle-charcoal">
                    {employee.first_name} {employee.last_name}
                  </h4>
                  <p className="text-sm text-quikle-slate">#{employee.employee_number}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getRoleColor(employee.role)}>
                      {employee.role}
                    </Badge>
                    {employee.department && (
                      <span className="text-xs text-quikle-slate">{employee.department}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {directReports.length > 0 && (
                  <Badge variant="outline" className="text-quikle-primary">
                    {directReports.length} report{directReports.length !== 1 ? 's' : ''}
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditEmployee(employee)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Render direct reports */}
      {directReports.map((report) => (
        <EmployeeNode
          key={report.id}
          employee={report}
          level={level + 1}
          directReports={[]} // Will be populated by parent component
          onEditEmployee={onEditEmployee}
        />
      ))}
    </div>
  );
};

const OrgChart = ({ employees, onUpdateHierarchy, onEditEmployee }: OrgChartProps) => {
  const [viewMode, setViewMode] = useState<'hierarchy' | 'flat'>('hierarchy');

  // Build hierarchy structure
  const buildHierarchy = useCallback(() => {
    const employeeMap = new Map(employees.map(emp => [emp.id, { ...emp, directReports: [] as Employee[] }]));
    const topLevel: Employee[] = [];

    employees.forEach(employee => {
      if (employee.manager_id && employeeMap.has(employee.manager_id)) {
        const manager = employeeMap.get(employee.manager_id)!;
        manager.directReports.push(employee);
      } else {
        topLevel.push(employee);
      }
    });

    return { employeeMap, topLevel };
  }, [employees]);

  const { employeeMap, topLevel } = buildHierarchy();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const draggedEmployeeId = active.id as string;
      const newManagerId = over.id.toString().replace('drop-', '');
      
      // Prevent circular references
      if (newManagerId !== draggedEmployeeId) {
        onUpdateHierarchy(draggedEmployeeId, newManagerId);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-quikle-primary" />
            Organization Chart
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'hierarchy' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('hierarchy')}
            >
              Hierarchy
            </Button>
            <Button
              variant={viewMode === 'flat' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('flat')}
            >
              Flat View
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'hierarchy' ? (
          <DndContext onDragEnd={handleDragEnd}>
            <div className="space-y-4">
              {topLevel.length === 0 ? (
                <div className="text-center py-8 text-quikle-slate">
                  <Users className="h-12 w-12 mx-auto mb-4 text-quikle-silver" />
                  <p>No organizational structure defined</p>
                  <p className="text-sm">Drag employees to create reporting relationships</p>
                </div>
              ) : (
                topLevel.map((employee) => (
                  <EmployeeNode
                    key={employee.id}
                    employee={employee}
                    level={0}
                    directReports={employeeMap.get(employee.id)?.directReports || []}
                    onEditEmployee={onEditEmployee}
                  />
                ))
              )}
            </div>
          </DndContext>
        ) : (
          <div className="grid gap-4">
            {employees.map((employee) => (
              <Card key={employee.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-quikle-primary text-white text-sm">
                          {employee.first_name[0]}{employee.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-quikle-charcoal">
                          {employee.first_name} {employee.last_name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${
                            employee.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            employee.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                            employee.role === 'supervisor' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {employee.role}
                          </Badge>
                          {employee.department && (
                            <span className="text-xs text-quikle-slate">{employee.department}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditEmployee(employee)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrgChart;


import React, { useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  designation: string;
  title: string;
  department?: string;
  role: string;
  manager_id?: string;
  employee_number: string;
}

interface EmployeeHierarchyProps {
  employees: Employee[];
}

// Custom node component for employee cards
const EmployeeNode = ({ data }: { data: Employee }) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'supervisor': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="w-64 bg-white shadow-md hover:shadow-lg transition-shadow border border-quikle-silver/30">
      <CardContent className="p-4">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-quikle-primary/10 rounded-full flex items-center justify-center mx-auto">
            <span className="text-quikle-primary font-semibold text-lg">
              {data.first_name.charAt(0)}{data.last_name.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-quikle-charcoal">
              {data.first_name} {data.last_name}
            </h3>
            <p className="text-sm text-quikle-slate">{data.designation}</p>
            <p className="text-xs text-quikle-slate">{data.title}</p>
            {data.department && (
              <p className="text-xs text-quikle-slate mt-1">{data.department}</p>
            )}
          </div>
          <div className="flex justify-center">
            <Badge className={`text-xs ${getRoleColor(data.role)}`}>
              {data.role}
            </Badge>
          </div>
          <p className="text-xs text-quikle-slate">{data.employee_number}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const nodeTypes = {
  employee: EmployeeNode,
};

const EmployeeHierarchy: React.FC<EmployeeHierarchyProps> = ({ employees }) => {
  const { nodes, edges } = useMemo(() => {
    // Create nodes for each employee
    const nodeMap = new Map<string, Node>();
    const edgeList: Edge[] = [];
    
    // Find root employees (those without managers or with invalid manager_id)
    const rootEmployees = employees.filter(emp => 
      !emp.manager_id || !employees.find(e => e.id === emp.manager_id)
    );
    
    // Calculate positions using a hierarchical layout
    const levelHeight = 200;
    const nodeWidth = 280;
    let currentLevel = 0;
    
    const processedEmployees = new Set<string>();
    const levelEmployees: Employee[][] = [];
    
    // Build hierarchy levels
    const buildLevels = (employeeList: Employee[], level: number) => {
      if (employeeList.length === 0) return;
      
      if (!levelEmployees[level]) {
        levelEmployees[level] = [];
      }
      
      employeeList.forEach(emp => {
        if (!processedEmployees.has(emp.id)) {
          levelEmployees[level].push(emp);
          processedEmployees.add(emp.id);
        }
      });
      
      // Find direct reports for current level employees
      const nextLevelEmployees: Employee[] = [];
      employeeList.forEach(emp => {
        const directReports = employees.filter(e => e.manager_id === emp.id);
        nextLevelEmployees.push(...directReports);
      });
      
      if (nextLevelEmployees.length > 0) {
        buildLevels(nextLevelEmployees, level + 1);
      }
    };
    
    buildLevels(rootEmployees, 0);
    
    // Create nodes with calculated positions
    levelEmployees.forEach((levelEmps, level) => {
      levelEmps.forEach((emp, index) => {
        const totalAtLevel = levelEmps.length;
        const xPosition = (index - (totalAtLevel - 1) / 2) * nodeWidth;
        const yPosition = level * levelHeight;
        
        nodeMap.set(emp.id, {
          id: emp.id,
          type: 'employee',
          position: { x: xPosition, y: yPosition },
          data: emp,
          draggable: true,
        });
      });
    });
    
    // Create edges for manager-employee relationships
    employees.forEach(emp => {
      if (emp.manager_id && nodeMap.has(emp.manager_id) && nodeMap.has(emp.id)) {
        edgeList.push({
          id: `${emp.manager_id}-${emp.id}`,
          source: emp.manager_id,
          target: emp.id,
          type: 'smoothstep',
          style: {
            stroke: '#6366F1',
            strokeWidth: 2,
          },
          markerEnd: {
            type: 'arrowclosed' as any,
            color: '#6366F1',
          },
        });
      }
    });
    
    return {
      nodes: Array.from(nodeMap.values()),
      edges: edgeList,
    };
  }, [employees]);

  const [flowNodes, , onNodesChange] = useNodesState(nodes);
  const [flowEdges, , onEdgesChange] = useEdgesState(edges);

  if (employees.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto text-quikle-slate/50 mb-4" />
          <p className="text-quikle-slate">No employees found to display hierarchy</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-quikle-charcoal">
          <Users className="h-5 w-5 text-quikle-primary" />
          Organization Hierarchy
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-[500px]">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{
            padding: 0.2,
            includeHiddenNodes: false,
          }}
          style={{ backgroundColor: '#f8fafc' }}
          className="bg-quikle-crystal/20"
        >
          <Controls 
            className="bg-white border border-quikle-silver/30 shadow-sm"
            showZoom={true}
            showFitView={true}
            showInteractive={true}
          />
          <Background 
            color="#e2e8f0" 
            gap={16} 
            size={1}
            style={{ backgroundColor: '#f8fafc' }}
          />
        </ReactFlow>
      </CardContent>
    </Card>
  );
};

export default EmployeeHierarchy;

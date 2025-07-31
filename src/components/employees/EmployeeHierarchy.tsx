
import React, { useState, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Employee extends Record<string, unknown> {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  department: string;
  avatar_url?: string;
  manager_id?: string;
}

const EmployeeNode = ({ data }: { data: Employee }) => {
  const initials = `${data.first_name.charAt(0)}${data.last_name.charAt(0)}`;
  
  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'ceo':
      case 'director':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'team lead':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card className="min-w-[200px] shadow-lg hover:shadow-xl transition-shadow bg-white border-2">
      <CardContent className="p-4 text-center">
        <Avatar className="w-12 h-12 mx-auto mb-2">
          <AvatarImage src={data.avatar_url} alt={`${data.first_name} ${data.last_name}`} />
          <AvatarFallback className="bg-quikle-primary text-white">{initials}</AvatarFallback>
        </Avatar>
        <h3 className="font-semibold text-quikle-charcoal">
          {data.first_name} {data.last_name}
        </h3>
        <p className="text-sm text-quikle-slate mb-2">{data.email}</p>
        <Badge className={`text-xs ${getRoleColor(data.role)}`}>
          {data.role}
        </Badge>
        <p className="text-xs text-quikle-neutral mt-1">{data.department}</p>
      </CardContent>
    </Card>
  );
};

const nodeTypes = {
  employeeNode: EmployeeNode,
};

export default function EmployeeHierarchy() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock employee data with proper structure
  const mockEmployees: Employee[] = [
    {
      id: '1',
      first_name: 'John',
      last_name: 'Smith',
      email: 'john.smith@company.com',
      role: 'CEO',
      department: 'Executive',
      manager_id: undefined,
    },
    {
      id: '2',
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'sarah.johnson@company.com',
      role: 'Director',
      department: 'Operations',
      manager_id: '1',
    },
    {
      id: '3',
      first_name: 'Mike',
      last_name: 'Davis',
      email: 'mike.davis@company.com',
      role: 'Director',
      department: 'Sales',
      manager_id: '1',
    },
    {
      id: '4',
      first_name: 'Emily',
      last_name: 'Wilson',
      email: 'emily.wilson@company.com',
      role: 'Manager',
      department: 'Operations',
      manager_id: '2',
    },
    {
      id: '5',
      first_name: 'David',
      last_name: 'Brown',
      email: 'david.brown@company.com',
      role: 'Manager',
      department: 'Sales',
      manager_id: '3',
    },
    {
      id: '6',
      first_name: 'Lisa',
      last_name: 'Anderson',
      email: 'lisa.anderson@company.com',
      role: 'Team Lead',
      department: 'Operations',
      manager_id: '4',
    },
    {
      id: '7',
      first_name: 'Tom',
      last_name: 'Wilson',
      email: 'tom.wilson@company.com',
      role: 'Employee',
      department: 'Sales',
      manager_id: '5',
    },
    {
      id: '8',
      first_name: 'Anna',
      last_name: 'Taylor',
      email: 'anna.taylor@company.com',
      role: 'Employee',
      department: 'Operations',
      manager_id: '6',
    },
  ];

  // Filter employees based on search term
  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) {
      return mockEmployees;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return mockEmployees.filter(employee => 
      employee.first_name.toLowerCase().includes(searchLower) ||
      employee.last_name.toLowerCase().includes(searchLower) ||
      employee.email.toLowerCase().includes(searchLower) ||
      employee.role.toLowerCase().includes(searchLower) ||
      employee.department.toLowerCase().includes(searchLower)
    );
  }, [searchTerm, mockEmployees]);

  // Generate nodes and edges based on filtered employees
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    // Create a map of employee levels for positioning
    const employeeLevels: { [key: string]: number } = {};
    const getEmployeeLevel = (employee: Employee): number => {
      if (employeeLevels[employee.id] !== undefined) {
        return employeeLevels[employee.id];
      }
      
      if (!employee.manager_id) {
        employeeLevels[employee.id] = 0;
        return 0;
      }
      
      const manager = filteredEmployees.find(emp => emp.id === employee.manager_id);
      if (!manager) {
        employeeLevels[employee.id] = 0;
        return 0;
      }
      
      const level = getEmployeeLevel(manager) + 1;
      employeeLevels[employee.id] = level;
      return level;
    };

    // Group employees by level
    const levelGroups: { [key: number]: Employee[] } = {};
    filteredEmployees.forEach(employee => {
      const level = getEmployeeLevel(employee);
      if (!levelGroups[level]) {
        levelGroups[level] = [];
      }
      levelGroups[level].push(employee);
    });

    // Create nodes with proper positioning
    Object.entries(levelGroups).forEach(([level, employees]) => {
      const levelNum = parseInt(level);
      employees.forEach((employee, index) => {
        const totalInLevel = employees.length;
        const xOffset = (index - (totalInLevel - 1) / 2) * 300;
        
        nodes.push({
          id: employee.id,
          type: 'employeeNode',
          position: { x: xOffset, y: levelNum * 200 },
          data: employee,
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        });

        // Create edges to managers
        if (employee.manager_id && filteredEmployees.some(emp => emp.id === employee.manager_id)) {
          edges.push({
            id: `edge-${employee.manager_id}-${employee.id}`,
            source: employee.manager_id,
            target: employee.id,
            type: 'smoothstep',
            style: { stroke: '#6366f1', strokeWidth: 2 },
          });
        }
      });
    });

    return { nodes, edges };
  }, [filteredEmployees]);

  const [flowNodes, setNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setEdges, onEdgesChange] = useEdgesState(edges);

  // Update nodes when filtered data changes
  React.useEffect(() => {
    setNodes(nodes);
  }, [nodes, setNodes]);

  React.useEffect(() => {
    setEdges(edges);
  }, [edges, setEdges]);

  return (
    <div className="h-full space-y-4">
      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-quikle-slate" />
        <Input
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-quikle-silver focus:border-quikle-primary"
        />
      </div>

      {/* Organization Chart */}
      <div className="h-[600px] border border-quikle-silver rounded-lg bg-quikle-crystal">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.5}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        >
          <Background color="#f1f5f9" gap={20} />
          <Controls className="bg-white border-quikle-silver" />
          <MiniMap 
            nodeColor={(node) => '#6366f1'}
            className="bg-white border border-quikle-silver"
          />
        </ReactFlow>
      </div>

      {/* Results Summary */}
      {searchTerm && (
        <div className="text-sm text-quikle-slate">
          Showing {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} 
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      )}
    </div>
  );
}

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
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Users } from 'lucide-react';
import { TeamMember } from '@/hooks/useTeamData';
import { cn } from '@/lib/utils';

interface TeamOrgChartProps {
  members: TeamMember[];
  onSelectMember: (member: TeamMember) => void;
}

const getRoleStyles = (role: string) => {
  switch (role) {
    case 'admin':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'manager':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

interface EmployeeNodeData extends Record<string, unknown> {
  member: TeamMember;
  onSelect: (member: TeamMember) => void;
}

const EmployeeNode = ({ data }: { data: EmployeeNodeData }) => {
  const { member, onSelect } = data;
  const initials = `${member.first_name?.[0] || ''}${member.last_name?.[0] || ''}`.toUpperCase();
  const fullName = `${member.first_name} ${member.last_name}`;

  return (
    <Card
      className="min-w-[180px] shadow-md hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50"
      onClick={() => onSelect(member)}
    >
      <CardContent className="p-3 text-center">
        <div className="relative inline-block">
          <Avatar className="w-10 h-10 mx-auto">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {initials || '??'}
            </AvatarFallback>
          </Avatar>
          {member.status === 'active' && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
          )}
        </div>
        <h3 className="font-medium text-sm mt-2 truncate">{fullName}</h3>
        <p className="text-xs text-muted-foreground truncate">{member.title || member.designation}</p>
        <Badge variant="outline" className={cn('text-[10px] mt-2 capitalize', getRoleStyles(member.role))}>
          {member.role}
        </Badge>
      </CardContent>
    </Card>
  );
};

const nodeTypes = {
  employeeNode: EmployeeNode,
};

const TeamOrgChart: React.FC<TeamOrgChartProps> = ({ members, onSelectMember }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter members based on search
  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return members;
    const searchLower = searchTerm.toLowerCase();
    return members.filter(
      (m) =>
        m.first_name.toLowerCase().includes(searchLower) ||
        m.last_name.toLowerCase().includes(searchLower) ||
        m.email.toLowerCase().includes(searchLower) ||
        m.designation.toLowerCase().includes(searchLower)
    );
  }, [members, searchTerm]);

  // Build hierarchy nodes and edges
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Build level map
    const levelMap: { [key: string]: number } = {};
    const getLevel = (member: TeamMember): number => {
      if (levelMap[member.id] !== undefined) return levelMap[member.id];
      if (!member.manager_id) {
        levelMap[member.id] = 0;
        return 0;
      }
      const manager = filteredMembers.find((m) => m.id === member.manager_id);
      if (!manager) {
        levelMap[member.id] = 0;
        return 0;
      }
      const level = getLevel(manager) + 1;
      levelMap[member.id] = level;
      return level;
    };

    // Group by level
    const levelGroups: { [key: number]: TeamMember[] } = {};
    filteredMembers.forEach((member) => {
      const level = getLevel(member);
      if (!levelGroups[level]) levelGroups[level] = [];
      levelGroups[level].push(member);
    });

    // Create nodes with positioning
    Object.entries(levelGroups).forEach(([level, levelMembers]) => {
      const levelNum = parseInt(level);
      levelMembers.forEach((member, index) => {
        const totalInLevel = levelMembers.length;
        const xOffset = (index - (totalInLevel - 1) / 2) * 220;

        nodes.push({
          id: member.id,
          type: 'employeeNode',
          position: { x: xOffset, y: levelNum * 160 },
          data: { member, onSelect: onSelectMember },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        });

        // Create edges to managers
        if (member.manager_id && filteredMembers.some((m) => m.id === member.manager_id)) {
          edges.push({
            id: `edge-${member.manager_id}-${member.id}`,
            source: member.manager_id,
            target: member.id,
            type: 'smoothstep',
            style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
          });
        }
      });
    });

    return { nodes, edges };
  }, [filteredMembers, onSelectMember]);

  const [flowNodes, setNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setEdges, onEdgesChange] = useEdgesState(edges);

  React.useEffect(() => {
    setNodes(nodes);
  }, [nodes, setNodes]);

  React.useEffect(() => {
    setEdges(edges);
  }, [edges, setEdges]);

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-center">
        <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="font-medium text-lg mb-1">No team members</h3>
        <p className="text-sm text-muted-foreground">
          Add team members to see the organization chart
        </p>
      </div>
    );
  }

  return (
    <div className="h-full space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search team members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      {/* Chart */}
      <div className="h-[600px] border rounded-lg bg-muted/20">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.5}
          maxZoom={1.5}
        >
          <Background color="hsl(var(--muted-foreground) / 0.1)" gap={20} />
          <Controls className="bg-background border" />
          <MiniMap
            nodeColor={() => 'hsl(var(--primary))'}
            className="bg-background border"
          />
        </ReactFlow>
      </div>

      {/* Summary */}
      {searchTerm && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredMembers.length} of {members.length} team member
          {members.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

export default TeamOrgChart;


import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, Bot, MessageSquare, Tags, FileSearch, GitBranch, RefreshCw, 
  Clock, AlertTriangle, Mail, Phone, Database, Globe, Play, UserCheck, Webhook
} from 'lucide-react';
import { CustomNode, WorkflowNodeType } from './types';
import { CATEGORY_COLORS } from './constants';

const iconMap: Record<WorkflowNodeType, React.ComponentType<{ className?: string }>> = {
  trigger: Zap,
  webhook: Webhook,
  ai_agent: Bot,
  ai_chat: MessageSquare,
  ai_classify: Tags,
  ai_extract: FileSearch,
  condition: GitBranch,
  loop: RefreshCw,
  delay: Clock,
  error_handler: AlertTriangle,
  email: Mail,
  sms: Phone,
  database: Database,
  api_call: Globe,
  action: Play,
  approval: UserCheck,
};

const WorkflowNodeComponent = ({ data, selected }: NodeProps<CustomNode>) => {
  const Icon = iconMap[data.type] || Play;
  const categoryColor = CATEGORY_COLORS[data.category] || 'hsl(var(--muted-foreground))';

  return (
    <Card 
      className={`w-56 transition-all duration-200 ${
        selected 
          ? 'border-primary shadow-lg ring-2 ring-primary/20' 
          : 'border-border hover:border-primary/50 hover:shadow-md'
      }`}
      style={{ borderLeftWidth: '4px', borderLeftColor: categoryColor }}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-md transition-colors"
            style={{ backgroundColor: `${categoryColor}20` }}
          >
            <Icon className="h-4 w-4" style={{ color: categoryColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-medium text-sm block truncate">{data.name}</span>
            <Badge variant="outline" className="text-xs mt-1 capitalize">
              {data.type.replace(/_/g, ' ')}
            </Badge>
          </div>
        </div>
        
        <Handle 
          type="target" 
          position={Position.Top} 
          className="!bg-muted-foreground !w-3 !h-3 !border-2 !border-background hover:!bg-primary transition-colors" 
        />
        <Handle 
          type="source" 
          position={Position.Bottom} 
          className="!bg-muted-foreground !w-3 !h-3 !border-2 !border-background hover:!bg-primary transition-colors" 
        />
      </CardContent>
    </Card>
  );
};

export default React.memo(WorkflowNodeComponent);

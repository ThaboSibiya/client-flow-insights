import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Play, Trash2, GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDataSyncRules } from '@/hooks/useDataSyncRules';

interface SyncRuleCardProps {
  rule: ReturnType<typeof useDataSyncRules>['syncRules'][number];
  onToggle: () => void;
  onTest: () => void;
  onDelete: () => void;
  formatDate: (d: string | null) => string;
}

const SyncRuleCard: React.FC<SyncRuleCardProps> = ({
  rule, onToggle, onTest, onDelete, formatDate,
}) => {
  return (
    <Card className="group transition-all hover:shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              'h-2 w-2 rounded-full shrink-0',
              rule.is_active ? 'bg-green-500' : 'bg-muted-foreground/30'
            )} />
            <GitBranch className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-foreground truncate">{rule.name}</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span>{rule.source_system} → {rule.target_system}</span>
                <span>•</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{rule.data_type}</Badge>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{rule.frequency}</Badge>
                <span>•</span>
                <span>{rule.sync_count} syncs</span>
                <span>•</span>
                <span>Last: {formatDate(rule.last_sync_at)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={rule.is_active} onCheckedChange={onToggle} className="shrink-0" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onTest}>
                  <Play className="h-3.5 w-3.5 mr-2" />
                  Manual Sync
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SyncRuleCard;

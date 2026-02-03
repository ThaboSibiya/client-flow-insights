import React, { memo } from 'react';
import { Project } from '@/types/project';
import { 
  FolderKanban, 
  Play, 
  CheckCircle2, 
  Wallet,
  TrendingUp
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CompactStatsBarProps {
  projects: Project[];
}

const CompactStatsBar = memo(({ projects }: CompactStatsBarProps) => {
  const stats = React.useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'in-progress').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
    const avgProgress = totalProjects > 0 
      ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects)
      : 0;
    
    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalBudget,
      totalSpent,
      budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
      avgProgress,
    };
  }, [projects]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `R${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `R${(amount / 1000).toFixed(0)}K`;
    }
    return `R${amount}`;
  };

  const statItems = [
    {
      icon: FolderKanban,
      label: 'Total',
      value: stats.totalProjects,
      color: 'text-primary',
      tooltip: 'Total projects',
    },
    {
      icon: Play,
      label: 'Active',
      value: stats.activeProjects,
      color: 'text-blue-600',
      tooltip: 'Projects in progress',
    },
    {
      icon: CheckCircle2,
      label: 'Done',
      value: stats.completedProjects,
      color: 'text-emerald-600',
      tooltip: 'Completed projects',
    },
    {
      icon: TrendingUp,
      label: 'Avg Progress',
      value: `${stats.avgProgress}%`,
      color: 'text-purple-600',
      tooltip: 'Average project progress',
    },
    {
      icon: Wallet,
      label: 'Budget',
      value: formatCurrency(stats.totalBudget),
      color: 'text-amber-600',
      tooltip: `Total budget: R${stats.totalBudget.toLocaleString()} | Spent: R${stats.totalSpent.toLocaleString()} (${stats.budgetUtilization.toFixed(0)}%)`,
    },
  ];

  return (
    <TooltipProvider>
      <div className="flex items-center gap-4 py-2 px-3 rounded-lg bg-muted/30 border border-border/40">
        {statItems.map((item, index) => (
          <React.Fragment key={item.label}>
            {index > 0 && <div className="h-4 w-px bg-border/50" />}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-default">
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-foreground">
                      {item.value}
                    </span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {item.label}
                    </span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </React.Fragment>
        ))}
      </div>
    </TooltipProvider>
  );
});

CompactStatsBar.displayName = 'CompactStatsBar';

export default CompactStatsBar;

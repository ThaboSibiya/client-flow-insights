import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace, Workspace } from '@/context/WorkspaceContext';
import { Building2, Check, ChevronsUpDown, Plus, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const WorkspaceSwitcher = () => {
  const navigate = useNavigate();
  const { workspaces, activeWorkspace, switchWorkspace, createWorkspace, loading } = useWorkspace();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIndustry, setNewIndustry] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    await createWorkspace(newName.trim(), newIndustry.trim() || undefined);
    setCreating(false);
    setCreateOpen(false);
    setNewName('');
    setNewIndustry('');
  };

  if (loading) {
    return (
      <div className="px-3 py-2">
        <div className="h-9 bg-muted/50 rounded-md animate-pulse" />
      </div>
    );
  }

  // Collapsed sidebar: show just the avatar with tooltip
  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-full h-9"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold">
                  {activeWorkspace?.name?.charAt(0).toUpperCase() || 'W'}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-64">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Workspaces
              </DropdownMenuLabel>
              {workspaces.map((ws) => (
                <DropdownMenuItem
                  key={ws.id}
                  onClick={() => switchWorkspace(ws.id)}
                  className="flex items-center justify-between gap-2 cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-primary text-xs font-bold">
                      {ws.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm truncate">{ws.name}</span>
                  </div>
                  {activeWorkspace?.id === ws.id && (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setCreateOpen(true)} className="cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                <span className="text-sm">Create new workspace</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings/workspace')} className="cursor-pointer">
                <Settings className="h-4 w-4 mr-2" />
                <span className="text-sm">Workspace settings</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent side="right">{activeWorkspace?.name || 'Workspace'}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between gap-2 px-3 py-2 h-auto text-left"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">
                  {activeWorkspace?.name || 'Select workspace'}
                </span>
                <span className="text-[10px] text-muted-foreground capitalize">
                  {activeWorkspace?.role || ''}
                </span>
              </div>
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Workspaces
          </DropdownMenuLabel>
          {workspaces.map((ws) => (
            <DropdownMenuItem
              key={ws.id}
              onClick={() => switchWorkspace(ws.id)}
              className="flex items-center justify-between gap-2 cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-primary text-xs font-bold">
                  {ws.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm truncate">{ws.name}</span>
                  {ws.industry && (
                    <span className="text-[10px] text-muted-foreground truncate">{ws.industry}</span>
                  )}
                </div>
              </div>
              {activeWorkspace?.id === ws.id && (
                <Check className="h-4 w-4 text-primary shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setCreateOpen(true)}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="text-sm">Create new workspace</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => navigate('/settings/workspace')}
            className="cursor-pointer"
          >
            <Settings className="h-4 w-4 mr-2" />
            <span className="text-sm">Workspace settings</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
            <DialogDescription>
              Set up a new business workspace. You can invite team members later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="ws-name">Business Name</Label>
              <Input
                id="ws-name"
                placeholder="e.g. Acme Corp"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ws-industry">Industry (optional)</Label>
              <Input
                id="ws-industry"
                placeholder="e.g. Technology, Retail, HVAC"
                value={newIndustry}
                onChange={(e) => setNewIndustry(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newName.trim() || creating}>
              {creating ? 'Creating...' : 'Create Workspace'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WorkspaceSwitcher;

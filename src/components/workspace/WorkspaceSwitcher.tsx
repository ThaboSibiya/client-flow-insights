import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Building2, Check, ChevronsUpDown, Plus, Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
import WorkspacePlanPaywall from '@/components/workspace/WorkspacePlanPaywall';

const WorkspaceSwitcher = () => {
  const navigate = useNavigate();
  const { workspaces, activeWorkspace, switchWorkspace, createWorkspace, refetchWorkspaces, loading } = useWorkspace();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIndustry, setNewIndustry] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [createdWsName, setCreatedWsName] = useState('');

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const ws = await createWorkspace(newName.trim(), newIndustry.trim() || undefined);
      if (ws) {
        await refetchWorkspaces();
        setCreateOpen(false);
        setCreatedWsName(ws.name);
        setPaywallOpen(true);
        setNewName('');
        setNewIndustry('');
      } else {
        setError('Failed to create workspace.');
      }
    } catch {
      setError('Something went wrong.');
    } finally {
      setCreating(false);
    }
  };

  const handlePaywallSkip = () => {
    setPaywallOpen(false);
    setCreatedWsName('');
  };

  if (loading) {
    return (
      <div className="px-3 py-2">
        <div className="h-9 bg-muted/50 rounded-md animate-pulse" />
      </div>
    );
  }

  const dropdownItems = (
    <>
      <DropdownMenuLabel className="text-xs text-muted-foreground">
        Workspaces
      </DropdownMenuLabel>
      {workspaces.map((ws) => (
        <DropdownMenuItem
          key={ws.id}
          onClick={() => switchWorkspace(ws.id)}
          className={cn(
            "flex items-center justify-between gap-2 cursor-pointer",
            activeWorkspace?.id === ws.id && "bg-primary/5"
          )}
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
      <DropdownMenuItem onClick={() => setCreateOpen(true)} className="cursor-pointer">
        <Plus className="h-4 w-4 mr-2" />
        <span className="text-sm">Create new workspace</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => navigate('/settings/workspace')} className="cursor-pointer">
        <Settings className="h-4 w-4 mr-2" />
        <span className="text-sm">Workspace settings</span>
      </DropdownMenuItem>
    </>
  );

  // Collapsed sidebar: show just the avatar with tooltip
  if (isCollapsed) {
    return (
      <>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-full h-9">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold">
                    {activeWorkspace?.name?.charAt(0).toUpperCase() || 'W'}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className="w-64">
                {dropdownItems}
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent side="right">{activeWorkspace?.name || 'Workspace'}</TooltipContent>
        </Tooltip>

        {/* Create dialog must be outside the tooltip/dropdown tree */}
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
                <Label htmlFor="ws-name-c">Business Name</Label>
                <Input
                  id="ws-name-c"
                  placeholder="e.g. Acme Corp"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ws-industry-c">Industry (optional)</Label>
                <Input
                  id="ws-industry-c"
                  placeholder="e.g. Technology, Retail, HVAC"
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!newName.trim() || creating}>
                {creating ? 'Creating...' : 'Create Workspace'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
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
          {dropdownItems}
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
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ws-industry">Industry (optional)</Label>
              <Input
                id="ws-industry"
                placeholder="e.g. Technology, Retail, HVAC"
                value={newIndustry}
                onChange={(e) => setNewIndustry(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newName.trim() || creating}>
              {creating ? 'Creating...' : 'Create Workspace'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Plan paywall after workspace creation */}
      <WorkspacePlanPaywall
        open={paywallOpen}
        workspaceName={createdWsName}
        onSkip={handlePaywallSkip}
      />
    </>
  );
};

export default WorkspaceSwitcher;

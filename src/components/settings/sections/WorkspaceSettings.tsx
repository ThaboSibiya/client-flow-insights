import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, Loader2, Save, Trash2, AlertTriangle, Users, ArrowRight } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import WorkspaceMembersManager from '@/components/workspace/WorkspaceMembersManager';

const WorkspaceSettings = () => {
  const { activeWorkspace, refetchWorkspaces, workspaces, switchWorkspace, setNeedsOnboarding } = useWorkspace();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = activeWorkspace?.role === 'owner';

  useEffect(() => {
    if (activeWorkspace) {
      setName(activeWorkspace.name);
      setIndustry(activeWorkspace.industry || '');
    }
  }, [activeWorkspace]);

  const handleSave = async () => {
    if (!activeWorkspace || !name.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('workspaces')
        .update({
          name: name.trim(),
          industry: industry.trim() || null,
        })
        .eq('id', activeWorkspace.id);

      if (error) throw error;

      await refetchWorkspaces();
      toast({ title: 'Workspace updated', description: 'Changes saved successfully.' });
    } catch (error: any) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!activeWorkspace) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', activeWorkspace.id);

      if (error) throw error;

      toast({ title: 'Workspace deleted', description: `"${activeWorkspace.name}" has been removed.` });

      // Switch to another workspace or trigger onboarding
      const remaining = workspaces.filter((w) => w.id !== activeWorkspace.id);
      if (remaining.length > 0) {
        switchWorkspace(remaining[0].id);
      } else {
        setNeedsOnboarding(true);
      }
      await refetchWorkspaces();
    } catch (error: any) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  if (!activeWorkspace) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        No active workspace selected.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workspace General Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Workspace Details</CardTitle>
              <CardDescription>Manage your business workspace settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ws-name">Business Name</Label>
              <Input
                id="ws-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isOwner}
                placeholder="e.g. Acme Corp"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ws-industry">Industry</Label>
              <Input
                id="ws-industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                disabled={!isOwner}
                placeholder="e.g. Technology, Retail"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="space-y-1 flex-1">
              <Label className="text-xs text-muted-foreground">Workspace ID</Label>
              <p className="text-xs font-mono text-muted-foreground/70">{activeWorkspace.id}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Your Role</Label>
              <Badge variant="outline" className="capitalize">{activeWorkspace.role}</Badge>
            </div>
          </div>

          {isOwner && (
            <div className="flex justify-end pt-2">
              <Button onClick={handleSave} disabled={saving || !name.trim()}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Members Management */}
      <WorkspaceMembersManager />

      {/* Link to full Team Management */}
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Full Team Management</p>
              <p className="text-xs text-muted-foreground">
                Manage HR records, departments, attendance, and employee privileges
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/employees">
              Go to Team
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {isOwner && (
        <Card className="border-destructive/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
            </div>
            <CardDescription>
              Irreversible actions for this workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border border-destructive/20 p-4">
              <div>
                <p className="font-medium text-sm">Delete this workspace</p>
                <p className="text-xs text-muted-foreground">
                  All data associated with this workspace will be permanently removed.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete "{activeWorkspace.name}"?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all data (customers, invoices, tickets, etc.) in this workspace. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting...' : 'Yes, delete workspace'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkspaceSettings;

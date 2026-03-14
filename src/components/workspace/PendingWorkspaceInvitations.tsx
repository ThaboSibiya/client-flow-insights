import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Check, X, Loader2 } from 'lucide-react';

interface PendingInvite {
  id: string;
  workspace_id: string;
  workspace_name: string;
  role: string;
  invited_at: string;
}

const PendingWorkspaceInvitations: React.FC = () => {
  const { user } = useAuth();
  const { refetchWorkspaces } = useWorkspace();
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);

  const fetchPendingInvites = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workspace_invitations')
        .select('id, workspace_id, role, created_at, workspaces:workspace_id(name)')
        .eq('email', user.email)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString());

      if (error) throw error;

      setInvitations(
        (data || []).map((inv: any) => ({
          id: inv.id,
          workspace_id: inv.workspace_id,
          workspace_name: inv.workspaces?.name || 'Unknown Workspace',
          role: inv.role,
          invited_at: inv.created_at,
        }))
      );
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPendingInvites();
  }, [fetchPendingInvites]);

  const handleAccept = useCallback(async (invitationId: string) => {
    setAccepting(invitationId);
    try {
      const { data, error } = await supabase.rpc('accept_workspace_invitation', {
        p_invitation_id: invitationId,
      });

      if (error) throw error;

      if (data) {
        toast({ title: 'Invitation accepted', description: 'You now have access to the workspace.' });
        await refetchWorkspaces();
        await fetchPendingInvites();
      } else {
        toast({ title: 'Failed to accept', description: 'The invitation may have expired.', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setAccepting(null);
    }
  }, [toast, refetchWorkspaces, fetchPendingInvites]);

  const handleDecline = useCallback(async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('workspace_invitations')
        .update({ status: 'declined' } as any)
        .eq('id', invitationId);

      if (error) throw error;

      toast({ title: 'Invitation declined' });
      await fetchPendingInvites();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  }, [toast, fetchPendingInvites]);

  if (loading || invitations.length === 0) return null;

  return (
    <div className="space-y-2 px-2 py-2 border-b border-border/40">
      {invitations.map((inv) => (
        <Card key={inv.id} className="bg-primary/5 border-primary/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{inv.workspace_name}</p>
                <p className="text-[10px] text-muted-foreground capitalize">Invited as {inv.role}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-primary hover:bg-primary/10"
                  onClick={() => handleAccept(inv.id)}
                  disabled={accepting === inv.id}
                >
                  {accepting === inv.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDecline(inv.id)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PendingWorkspaceInvitations;

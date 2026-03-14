import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Users, UserPlus, Loader2, MoreHorizontal, Trash2, Shield, Clock, Mail } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WorkspaceMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  email?: string;
}

interface WorkspaceInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
}

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-primary/10 text-primary border-primary/20',
  admin: 'bg-accent/50 text-accent-foreground border-accent/30',
  member: 'bg-secondary text-secondary-foreground border-border',
  viewer: 'bg-muted text-muted-foreground border-border',
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  owner: 'Full control, billing, and workspace deletion',
  admin: 'Manage members, settings, and all data',
  member: 'View and edit workspace data',
  viewer: 'Read-only access to workspace data',
};

const WorkspaceMembersManager = () => {
  const { activeWorkspace } = useWorkspace();
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('member');
  const [inviting, setInviting] = useState(false);

  const isOwnerOrAdmin = activeWorkspace?.role === 'owner' || activeWorkspace?.role === 'admin';

  const fetchMembers = useCallback(async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    try {
      // Fetch members
      const { data, error } = await supabase
        .from('workspace_members')
        .select('id, user_id, role, joined_at')
        .eq('workspace_id', activeWorkspace.id)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      // Fetch emails from profiles
      const userIds = (data || []).map((m) => m.user_id);
      let emailMap: Record<string, string> = {};

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', userIds);

        if (profiles) {
          emailMap = Object.fromEntries(profiles.map((p) => [p.id, p.email || '']));
        }
      }

      setMembers(
        (data || []).map((m) => ({
          ...m,
          email: emailMap[m.user_id] || 'Unknown',
        }))
      );

      // Fetch pending invitations
      const { data: invData, error: invError } = await supabase
        .from('workspace_invitations')
        .select('id, email, role, status, created_at, expires_at')
        .eq('workspace_id', activeWorkspace.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (!invError) {
        setInvitations((invData || []) as WorkspaceInvitation[]);
      }
    } catch (error: any) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleInvite = async () => {
    if (!activeWorkspace || !inviteEmail.trim()) return;
    setInviting(true);

    const email = inviteEmail.trim().toLowerCase();

    try {
      // Check if already a member via profile lookup
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (profile) {
        // User exists — check if already a member
        const existing = members.find((m) => m.user_id === profile.id);
        if (existing) {
          toast({
            title: 'Already a member',
            description: 'This user is already part of the workspace.',
            variant: 'destructive',
          });
          setInviting(false);
          return;
        }

        // User exists but not a member — add directly
        const { error } = await supabase.from('workspace_members').insert({
          workspace_id: activeWorkspace.id,
          user_id: profile.id,
          role: inviteRole,
        } as any);

        if (error) throw error;

        toast({ title: 'Member added', description: `${email} has been added as ${inviteRole}.` });
      } else {
        // User doesn't exist — create a pending invitation
        const existingInvite = invitations.find((i) => i.email === email);
        if (existingInvite) {
          toast({
            title: 'Already invited',
            description: 'A pending invitation already exists for this email.',
            variant: 'destructive',
          });
          setInviting(false);
          return;
        }

        const { error } = await supabase.from('workspace_invitations').insert({
          workspace_id: activeWorkspace.id,
          email,
          role: inviteRole,
          invited_by: user?.id,
        } as any);

        if (error) throw error;

        toast({
          title: 'Invitation sent',
          description: `${email} will be added when they sign up.`,
        });
      }

      setInviteEmail('');
      setInviteRole('member');
      await fetchMembers();
    } catch (error: any) {
      toast({ title: 'Failed to invite', description: error.message, variant: 'destructive' });
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('workspace_members')
        .update({ role: newRole as any })
        .eq('id', memberId);

      if (error) throw error;

      toast({ title: 'Role updated' });
      await fetchMembers();
    } catch (error: any) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    }
  };

  const handleRemove = async (memberId: string, memberEmail: string) => {
    try {
      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({ title: 'Member removed', description: `${memberEmail} has been removed.` });
      await fetchMembers();
    } catch (error: any) {
      toast({ title: 'Remove failed', description: error.message, variant: 'destructive' });
    }
  };

  const handleRevokeInvitation = async (invitationId: string, email: string) => {
    try {
      const { error } = await supabase
        .from('workspace_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast({ title: 'Invitation revoked', description: `Invitation to ${email} has been revoked.` });
      await fetchMembers();
    } catch (error: any) {
      toast({ title: 'Revoke failed', description: error.message, variant: 'destructive' });
    }
  };

  if (!activeWorkspace) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">Team Members</CardTitle>
            <CardDescription>
              {members.length} member{members.length !== 1 ? 's' : ''}
              {invitations.length > 0 && ` · ${invitations.length} pending`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Invite Form */}
        {isOwnerOrAdmin && (
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="invite-email" className="text-xs">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
              />
            </div>
            <div className="w-32 space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['admin', 'member', 'viewer'].map((role) => (
                    <SelectItem key={role} value={role}>
                      <div>
                        <span className="capitalize">{role}</span>
                        <p className="text-[10px] text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()} size="sm">
              {inviting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4 mr-1" />
              )}
              Invite
            </Button>
          </div>
        )}

        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Invitations</p>
            {invitations.map((invitation) => {
              const isExpired = new Date(invitation.expires_at) < new Date();
              return (
                <div
                  key={invitation.id}
                  className="flex items-center gap-3 rounded-lg border border-dashed border-border/50 p-3 bg-muted/20"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      <Mail className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{invitation.email}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {isExpired ? (
                        <span className="text-destructive">Expired</span>
                      ) : (
                        <span>Expires {new Date(invitation.expires_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className={`capitalize text-[10px] px-2 ${ROLE_COLORS[invitation.role] || ''}`}>
                    {invitation.role}
                  </Badge>
                  {isOwnerOrAdmin && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRevokeInvitation(invitation.id, invitation.email)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Revoke invitation</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Members List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {members.length > 0 && (
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Members</p>
            )}
            {members.map((member) => {
              const isSelf = member.user_id === user?.id;
              const isOwnerMember = member.role === 'owner';

              return (
                <div
                  key={member.id}
                  className="flex items-center gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/30"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      {(member.email || '?').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {member.email}
                      {isSelf && (
                        <span className="text-xs text-muted-foreground ml-1.5">(you)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge
                        variant="outline"
                        className={`capitalize text-[10px] px-2 ${ROLE_COLORS[member.role] || ''}`}
                      >
                        {member.role}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>{ROLE_DESCRIPTIONS[member.role] || member.role}</TooltipContent>
                  </Tooltip>

                  {isOwnerOrAdmin && !isSelf && !isOwnerMember && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'admin')}>
                          <Shield className="h-4 w-4 mr-2" />
                          Make Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'member')}>
                          <Users className="h-4 w-4 mr-2" />
                          Make Member
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'viewer')}>
                          <Users className="h-4 w-4 mr-2" />
                          Make Viewer
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove member?</AlertDialogTitle>
                              <AlertDialogDescription>
                                {member.email} will lose access to this workspace.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemove(member.id, member.email || '')}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkspaceMembersManager;

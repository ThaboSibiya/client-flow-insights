import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  X,
  Edit,
  Mail,
  Phone,
  Building,
  Calendar,
  Clock,
  Shield,
  User,
  Briefcase,
  DollarSign,
  UserCheck,
  Send,
} from 'lucide-react';
import { TeamMember } from '@/hooks/useTeamData';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TeamDetailPanelProps {
  member: TeamMember;
  onClose: () => void;
  onEdit: () => void;
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

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-emerald-100 text-emerald-700';
    case 'inactive':
      return 'bg-gray-100 text-gray-600';
    case 'suspended':
      return 'bg-amber-100 text-amber-700';
    case 'terminated':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

const InfoRow: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
}> = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-2">
    <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium truncate">{value || '—'}</p>
    </div>
  </div>
);

const TeamDetailPanel: React.FC<TeamDetailPanelProps> = ({ member, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const initials = `${member.first_name?.[0] || ''}${member.last_name?.[0] || ''}`.toUpperCase();
  const fullName = `${member.first_name} ${member.last_name}`;
  const isRegistered = !!member.auth_user_id;

  const formatDate = (date: string | null) => {
    if (!date) return null;
    try {
      return format(new Date(date), 'MMM d, yyyy');
    } catch {
      return null;
    }
  };

  const formatDateTime = (date: string | null) => {
    if (!date) return null;
    try {
      return format(new Date(date), 'MMM d, yyyy h:mm a');
    } catch {
      return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-background border-l">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Member Details</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="p-6 pb-4 text-center border-b bg-muted/20">
        <div className="relative inline-block">
          <Avatar className="h-20 w-20 mx-auto">
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
              {initials || '??'}
            </AvatarFallback>
          </Avatar>
          {member.status === 'active' && (
            <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-background" />
          )}
        </div>
        <h2 className="mt-3 font-semibold text-lg">{fullName}</h2>
        <p className="text-sm text-muted-foreground">{member.title || member.designation}</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <Badge variant="outline" className={cn('capitalize', getRoleStyles(member.role))}>
            {member.role}
          </Badge>
          <Badge className={cn('capitalize', getStatusStyles(member.status))}>
            {member.status}
          </Badge>
        </div>
        {!isRegistered && (
          <div className="mt-4">
            <Button variant="outline" size="sm" className="gap-2">
              <Send className="h-4 w-4" />
              Resend Invitation
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full rounded-none border-b bg-transparent px-4 pt-2">
          <TabsTrigger value="profile" className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
            <User className="h-4 w-4 mr-1.5" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
            <Shield className="h-4 w-4 mr-1.5" />
            Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="flex-1 overflow-auto p-4 mt-0">
          <div className="space-y-6">
            {/* Contact Information */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Contact</h4>
              <div className="space-y-1">
                <InfoRow icon={Mail} label="Email" value={member.email} />
                <InfoRow icon={Phone} label="Phone" value={member.phone} />
              </div>
            </div>

            <Separator />

            {/* Work Information */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Work</h4>
              <div className="space-y-1">
                <InfoRow icon={Building} label="Employee Number" value={member.employee_number} />
                <InfoRow icon={Briefcase} label="Department" value={member.department} />
                <InfoRow icon={User} label="Designation" value={member.designation} />
                {member.salary && (
                  <InfoRow
                    icon={DollarSign}
                    label="Salary"
                    value={`$${member.salary.toLocaleString()}`}
                  />
                )}
              </div>
            </div>

            <Separator />

            {/* Dates */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Timeline</h4>
              <div className="space-y-1">
                <InfoRow icon={Calendar} label="Hire Date" value={formatDate(member.hire_date)} />
                <InfoRow icon={Clock} label="Last Login" value={formatDateTime(member.last_login_at)} />
                <InfoRow icon={UserCheck} label="Joined" value={formatDate(member.created_at)} />
              </div>
            </div>

            {/* Registration Status */}
            <Separator />
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Account Status</h4>
              <div className="p-3 rounded-lg bg-muted/50">
                {isRegistered ? (
                  <div className="flex items-center gap-2 text-sm">
                    <UserCheck className="h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-700 font-medium">Account Registered</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span className="text-amber-700 font-medium">Pending Registration</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="flex-1 overflow-auto p-4 mt-0">
          <div className="space-y-4">
            <div className="p-4 rounded-lg border bg-muted/20">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-medium">Role: {member.role}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {member.role === 'admin'
                  ? 'Full access to all features and settings'
                  : member.role === 'manager'
                  ? 'Can manage team members and view analytics'
                  : 'Standard access to assigned features'}
              </p>
            </div>

            <Button variant="outline" className="w-full" onClick={onEdit}>
              <Shield className="h-4 w-4 mr-2" />
              Manage Detailed Permissions
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamDetailPanel;

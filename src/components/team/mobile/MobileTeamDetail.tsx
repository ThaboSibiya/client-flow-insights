import React from 'react';
import { Phone, Mail, Building2, Calendar, Shield, Clock, Edit } from 'lucide-react';
import { TeamMember } from '@/hooks/useTeamData';
import { MobileHeader } from '@/components/mobile';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

interface MobileTeamDetailProps {
  member: TeamMember;
  onBack: () => void;
  onEdit: () => void;
}

const MobileTeamDetail: React.FC<MobileTeamDetailProps> = ({
  member,
  onBack,
  onEdit,
}) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '??';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'inactive': return 'bg-gray-500';
      case 'terminated': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null | undefined }) => {
    if (!value) return null;
    return (
      <div className="flex items-center gap-3 py-2">
        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-medium truncate">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <MobileHeader
        title={`${member.first_name} ${member.last_name}`}
        subtitle={member.title}
        onBack={onBack}
        actions={[
          { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: onEdit },
        ]}
      />

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Profile Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center mb-4">
                <Avatar className="h-20 w-20 mb-3">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                    {getInitials(member.first_name, member.last_name)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-lg font-semibold">
                  {member.first_name} {member.last_name}
                </h2>
                <p className="text-sm text-muted-foreground">{member.title}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`h-2 w-2 rounded-full ${getStatusColor(member.status)}`} />
                  <span className="text-sm capitalize">{member.status}</span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {member.role.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                {member.phone && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.location.href = `tel:${member.phone}`}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.location.href = `mailto:${member.email}`}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <InfoRow icon={Mail} label="Email" value={member.email} />
              <Separator />
              <InfoRow icon={Phone} label="Phone" value={member.phone} />
            </CardContent>
          </Card>

          {/* Work Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Work Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <InfoRow icon={Building2} label="Department" value={member.department} />
              <Separator />
              <InfoRow icon={Shield} label="Designation" value={member.designation} />
              <Separator />
              <InfoRow 
                icon={Calendar} 
                label="Hire Date" 
                value={member.hire_date ? format(new Date(member.hire_date), 'MMM d, yyyy') : null} 
              />
              <Separator />
              <InfoRow icon={Building2} label="Employee Number" value={member.employee_number} />
            </CardContent>
          </Card>

          {/* Activity */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <InfoRow 
                icon={Clock} 
                label="Last Login" 
                value={member.last_login_at 
                  ? format(new Date(member.last_login_at), 'MMM d, yyyy h:mm a')
                  : 'Never logged in'
                } 
              />
              <Separator />
              <InfoRow 
                icon={Calendar} 
                label="Member Since" 
                value={format(new Date(member.created_at), 'MMM d, yyyy')} 
              />
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default MobileTeamDetail;

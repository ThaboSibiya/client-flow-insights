import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Bell, 
  Lock,
  Download,
  Upload,
  Trash2,
  Save,
  Eye,
  Clock,
  Shield,
  Mail,
  Smartphone,
  AlertTriangle,
  ChevronRight,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from '@/hooks/use-toast';

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsSection = 'general' | 'permissions' | 'notifications' | 'data';

interface SettingRowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  badge?: string;
}

const SettingRow = ({ icon, title, description, checked, onCheckedChange, disabled, badge }: SettingRowProps) => (
  <div className={cn(
    "flex items-center justify-between py-3 group",
    disabled && "opacity-50"
  )}>
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{title}</span>
          {badge && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {badge}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
    />
  </div>
);

const ProjectSettingsModal = ({ isOpen, onClose }: ProjectSettingsModalProps) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const [isSaving, setIsSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    autoSave: true,
    showProgressBars: true,
    enableNotifications: true,
    defaultView: 'kanban',
    allowGuestAccess: false,
    requireApprovalForStatusChanges: false,
    enableTimeTracking: true,
    emailNotifications: true,
    slackNotifications: false,
    inAppNotifications: true,
    deadlineReminders: true,
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    toast({
      title: "Settings Saved",
      description: "Your project management settings have been updated.",
    });
    setIsSaving(false);
    onClose();
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your project data export is being prepared.",
    });
  };

  const sections = [
    { id: 'general' as const, label: 'General', icon: Settings },
    { id: 'permissions' as const, label: 'Permissions', icon: Lock },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'data' as const, label: 'Data', icon: Download },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
              <Settings className="h-4 w-4 text-muted-foreground" />
            </div>
            Project Settings
          </DialogTitle>
        </DialogHeader>

        <div className="flex min-h-[400px]">
          {/* Sidebar Navigation */}
          <div className="w-48 border-r border-border/50 bg-muted/30 p-2">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    activeSection === section.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <section.icon className="h-4 w-4" />
                    {section.label}
                  </span>
                  {activeSection === section.id && (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[450px]">
            {activeSection === 'general' && (
              <div className="space-y-1 animate-in fade-in-50 duration-200">
                <h3 className="text-sm font-semibold mb-4">Interface Preferences</h3>
                
                <SettingRow
                  icon={<Save className="h-4 w-4 text-muted-foreground" />}
                  title="Auto-save Changes"
                  description="Automatically save project changes as you work"
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoSave: checked }))}
                />
                
                <div className="border-t border-border/50" />
                
                <SettingRow
                  icon={<Eye className="h-4 w-4 text-muted-foreground" />}
                  title="Show Progress Bars"
                  description="Display progress indicators on project cards"
                  checked={settings.showProgressBars}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showProgressBars: checked }))}
                />
                
                <div className="border-t border-border/50" />

                <div className="py-3">
                  <Label className="text-sm font-medium">Default View</Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Choose the default view when opening projects
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {['overview', 'kanban', 'gantt', 'calendar'].map((view) => (
                      <button
                        key={view}
                        type="button"
                        onClick={() => setSettings(prev => ({ ...prev, defaultView: view }))}
                        className={cn(
                          "px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all",
                          settings.defaultView === view
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80 text-muted-foreground"
                        )}
                      >
                        {view}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'permissions' && (
              <div className="space-y-1 animate-in fade-in-50 duration-200">
                <h3 className="text-sm font-semibold mb-4">Access Control</h3>
                
                <SettingRow
                  icon={<Shield className="h-4 w-4 text-muted-foreground" />}
                  title="Allow Guest Access"
                  description="Let external users view projects without full account access"
                  checked={settings.allowGuestAccess}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowGuestAccess: checked }))}
                />
                
                <div className="border-t border-border/50" />
                
                <SettingRow
                  icon={<Lock className="h-4 w-4 text-muted-foreground" />}
                  title="Require Approval for Status Changes"
                  description="Project managers must approve status changes"
                  checked={settings.requireApprovalForStatusChanges}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireApprovalForStatusChanges: checked }))}
                />
                
                <div className="border-t border-border/50" />
                
                <SettingRow
                  icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                  title="Enable Time Tracking"
                  description="Allow team members to track time spent on projects"
                  checked={settings.enableTimeTracking}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableTimeTracking: checked }))}
                />
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-1 animate-in fade-in-50 duration-200">
                <h3 className="text-sm font-semibold mb-4">Notification Preferences</h3>
                
                <SettingRow
                  icon={<Mail className="h-4 w-4 text-muted-foreground" />}
                  title="Email Notifications"
                  description="Receive project updates via email"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                />
                
                <div className="border-t border-border/50" />
                
                <SettingRow
                  icon={<Smartphone className="h-4 w-4 text-muted-foreground" />}
                  title="Slack Integration"
                  description="Send notifications to Slack channels"
                  checked={settings.slackNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, slackNotifications: checked }))}
                  disabled
                  badge="Coming Soon"
                />
                
                <div className="border-t border-border/50" />
                
                <SettingRow
                  icon={<Bell className="h-4 w-4 text-muted-foreground" />}
                  title="Deadline Reminders"
                  description="Get notified about upcoming project deadlines"
                  checked={settings.deadlineReminders}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, deadlineReminders: checked }))}
                />
              </div>
            )}

            {activeSection === 'data' && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <h3 className="text-sm font-semibold mb-4">Data Management</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={handleExportData}
                    className="w-full flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Download className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-medium">Export Project Data</h4>
                        <p className="text-xs text-muted-foreground">
                          Download all your project data as CSV or JSON
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>

                  <button
                    className="w-full flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Upload className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-medium">Import Project Data</h4>
                        <p className="text-xs text-muted-foreground">
                          Import projects from CSV files or other tools
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                </div>

                <div className="mt-6 p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <h4 className="text-sm font-medium text-destructive">Danger Zone</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    These actions cannot be undone. Please proceed with caution.
                  </p>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete All Project Data
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/50 bg-muted/30 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} size="sm">
            Cancel
          </Button>
          <Button onClick={handleSave} size="sm" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectSettingsModal;

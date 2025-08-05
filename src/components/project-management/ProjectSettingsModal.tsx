
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Bell, 
  Users, 
  Eye, 
  Lock,
  Download,
  Upload,
  Trash2,
  Save
} from "lucide-react";
import { toast } from '@/hooks/use-toast';

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProjectSettingsModal = ({ isOpen, onClose }: ProjectSettingsModalProps) => {
  const [settings, setSettings] = useState({
    // General settings
    autoSave: true,
    showProgressBars: true,
    enableNotifications: true,
    defaultView: 'kanban',
    
    // Permissions
    allowGuestAccess: false,
    requireApprovalForStatusChanges: false,
    enableTimeTracking: true,
    
    // Notifications
    emailNotifications: true,
    slackNotifications: false,
    inAppNotifications: true,
    deadlineReminders: true,
  });

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your project management settings have been updated.",
    });
    onClose();
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your project data export is being prepared. You'll receive an email when it's ready.",
    });
  };

  const handleImportData = () => {
    toast({
      title: "Import Feature",
      description: "Data import functionality will be available soon.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Project Management Settings
          </DialogTitle>
          <DialogDescription>
            Configure your project management preferences and system settings.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Interface Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-save">Auto-save Changes</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save project changes as you work
                    </p>
                  </div>
                  <Switch
                    id="auto-save"
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, autoSave: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="progress-bars">Show Progress Bars</Label>
                    <p className="text-sm text-muted-foreground">
                      Display progress indicators on project cards
                    </p>
                  </div>
                  <Switch
                    id="progress-bars"
                    checked={settings.showProgressBars}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, showProgressBars: checked }))
                    }
                  />
                </div>

                <Separator />

                <div>
                  <Label htmlFor="default-view">Default View</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Choose the default view when opening projects
                  </p>
                  <select 
                    id="default-view"
                    className="w-full p-2 border rounded-md"
                    value={settings.defaultView}
                    onChange={(e) => setSettings(prev => ({ ...prev, defaultView: e.target.value }))}
                  >
                    <option value="overview">Overview</option>
                    <option value="kanban">Kanban Board</option>
                    <option value="gantt">Timeline</option>
                    <option value="calendar">Calendar</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Access Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="guest-access">Allow Guest Access</Label>
                    <p className="text-sm text-muted-foreground">
                      Let external users view projects without full account access
                    </p>
                  </div>
                  <Switch
                    id="guest-access"
                    checked={settings.allowGuestAccess}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, allowGuestAccess: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="approval-required">Require Approval for Status Changes</Label>
                    <p className="text-sm text-muted-foreground">
                      Project managers must approve status changes
                    </p>
                  </div>
                  <Switch
                    id="approval-required"
                    checked={settings.requireApprovalForStatusChanges}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, requireApprovalForStatusChanges: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="time-tracking">Enable Time Tracking</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow team members to track time spent on projects
                    </p>
                  </div>
                  <Switch
                    id="time-tracking"
                    checked={settings.enableTimeTracking}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, enableTimeTracking: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive project updates via email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="slack-notifications">Slack Integration</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications to Slack channels
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                    <Switch
                      id="slack-notifications"
                      checked={settings.slackNotifications}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, slackNotifications: checked }))
                      }
                      disabled
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="deadline-reminders">Deadline Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about upcoming project deadlines
                    </p>
                  </div>
                  <Switch
                    id="deadline-reminders"
                    checked={settings.deadlineReminders}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, deadlineReminders: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Download className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium">Export Project Data</h4>
                      <p className="text-sm text-muted-foreground">
                        Download all your project data as CSV or JSON
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleExportData}>
                    Export
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Upload className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-medium">Import Project Data</h4>
                      <p className="text-sm text-muted-foreground">
                        Import projects from CSV files or other tools
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleImportData}>
                    Import
                  </Button>
                </div>

                <Separator />

                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center gap-3 mb-3">
                    <Trash2 className="h-5 w-5 text-red-600" />
                    <h4 className="font-medium text-red-800">Danger Zone</h4>
                  </div>
                  <p className="text-sm text-red-700 mb-3">
                    These actions cannot be undone. Please proceed with caution.
                  </p>
                  <Button variant="destructive" size="sm">
                    Delete All Project Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-quikle-primary hover:bg-quikle-secondary text-white">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectSettingsModal;

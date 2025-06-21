
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  Clock,
  Settings,
  Send
} from 'lucide-react';

const CommunicationSettings = () => {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [callSchedulingEnabled, setCallSchedulingEnabled] = useState(true);

  const [welcomeSequenceSettings, setWelcomeSequenceSettings] = useState({
    enabled: true,
    emailCount: 3,
    intervalHours: 24
  });

  const [smsSettings, setSmsSettings] = useState({
    urgentOnly: true,
    includeEmployee: true,
    customMessage: ''
  });

  const [whatsappSettings, setWhatsappSettings] = useState({
    jobCompletion: true,
    statusUpdates: false,
    templateMessage: 'Hi {customer_name}, your job has been completed! Thank you for choosing our services.'
  });

  const [callSettings, setCallSettings] = useState({
    welcomeCallDelay: 24,
    feedbackCallDelay: 24,
    checkInInterval: 72,
    workingHoursOnly: true
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-500" />
            Communication Automation Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="sms" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                SMS
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                WhatsApp
              </TabsTrigger>
              <TabsTrigger value="calls" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Calls
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-enabled" className="text-base font-medium">
                    Enable Email Automation
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically send welcome sequences and updates
                  </p>
                </div>
                <Switch
                  id="email-enabled"
                  checked={emailEnabled}
                  onCheckedChange={setEmailEnabled}
                />
              </div>

              {emailEnabled && (
                <div className="space-y-4 pl-4 border-l-2 border-blue-100">
                  <div>
                    <Label htmlFor="welcome-enabled">Welcome Email Sequence</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Switch
                        id="welcome-enabled"
                        checked={welcomeSequenceSettings.enabled}
                        onCheckedChange={(enabled) => 
                          setWelcomeSequenceSettings(prev => ({ ...prev, enabled }))
                        }
                      />
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Emails:</Label>
                        <Input
                          type="number"
                          value={welcomeSequenceSettings.emailCount}
                          onChange={(e) => 
                            setWelcomeSequenceSettings(prev => ({ 
                              ...prev, 
                              emailCount: parseInt(e.target.value) || 3 
                            }))
                          }
                          className="w-16"
                          min="1"
                          max="10"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Interval (hours):</Label>
                        <Input
                          type="number"
                          value={welcomeSequenceSettings.intervalHours}
                          onChange={(e) => 
                            setWelcomeSequenceSettings(prev => ({ 
                              ...prev, 
                              intervalHours: parseInt(e.target.value) || 24 
                            }))
                          }
                          className="w-20"
                          min="1"
                          max="168"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="sms" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms-enabled" className="text-base font-medium">
                    Enable SMS Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Send urgent status change notifications via SMS
                  </p>
                </div>
                <Switch
                  id="sms-enabled"
                  checked={smsEnabled}
                  onCheckedChange={setSmsEnabled}
                />
              </div>

              {smsEnabled && (
                <div className="space-y-4 pl-4 border-l-2 border-green-100">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="urgent-only">Urgent status changes only</Label>
                    <Switch
                      id="urgent-only"
                      checked={smsSettings.urgentOnly}
                      onCheckedChange={(urgentOnly) => 
                        setSmsSettings(prev => ({ ...prev, urgentOnly }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-employee">Notify assigned employee</Label>
                    <Switch
                      id="include-employee"
                      checked={smsSettings.includeEmployee}
                      onCheckedChange={(includeEmployee) => 
                        setSmsSettings(prev => ({ ...prev, includeEmployee }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="custom-sms">Custom SMS Template (Optional)</Label>
                    <Textarea
                      id="custom-sms"
                      placeholder="Leave empty to use default messages"
                      value={smsSettings.customMessage}
                      onChange={(e) => 
                        setSmsSettings(prev => ({ ...prev, customMessage: e.target.value }))
                      }
                      className="mt-2"
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="whatsapp" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="whatsapp-enabled" className="text-base font-medium">
                    Enable WhatsApp Integration
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Send job completion confirmations via WhatsApp
                  </p>
                </div>
                <Switch
                  id="whatsapp-enabled"
                  checked={whatsappEnabled}
                  onCheckedChange={setWhatsappEnabled}
                />
              </div>

              {whatsappEnabled && (
                <div className="space-y-4 pl-4 border-l-2 border-purple-100">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="job-completion-wa">Job completion notifications</Label>
                    <Switch
                      id="job-completion-wa"
                      checked={whatsappSettings.jobCompletion}
                      onCheckedChange={(jobCompletion) => 
                        setWhatsappSettings(prev => ({ ...prev, jobCompletion }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="status-updates-wa">Status update notifications</Label>
                    <Switch
                      id="status-updates-wa"
                      checked={whatsappSettings.statusUpdates}
                      onCheckedChange={(statusUpdates) => 
                        setWhatsappSettings(prev => ({ ...prev, statusUpdates }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="whatsapp-template">WhatsApp Message Template</Label>
                    <Textarea
                      id="whatsapp-template"
                      value={whatsappSettings.templateMessage}
                      onChange={(e) => 
                        setWhatsappSettings(prev => ({ ...prev, templateMessage: e.target.value }))
                      }
                      className="mt-2"
                      placeholder="Use {customer_name} for personalization"
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="calls" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="calls-enabled" className="text-base font-medium">
                    Enable Call Scheduling
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically schedule follow-up calls based on customer preferences
                  </p>
                </div>
                <Switch
                  id="calls-enabled"
                  checked={callSchedulingEnabled}
                  onCheckedChange={setCallSchedulingEnabled}
                />
              </div>

              {callSchedulingEnabled && (
                <div className="space-y-4 pl-4 border-l-2 border-orange-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="welcome-call-delay">Welcome Call Delay (hours)</Label>
                      <Input
                        id="welcome-call-delay"
                        type="number"
                        value={callSettings.welcomeCallDelay}
                        onChange={(e) => 
                          setCallSettings(prev => ({ 
                            ...prev, 
                            welcomeCallDelay: parseInt(e.target.value) || 24 
                          }))
                        }
                        min="1"
                        max="168"
                      />
                    </div>

                    <div>
                      <Label htmlFor="feedback-call-delay">Feedback Call Delay (hours)</Label>
                      <Input
                        id="feedback-call-delay"
                        type="number"
                        value={callSettings.feedbackCallDelay}
                        onChange={(e) => 
                          setCallSettings(prev => ({ 
                            ...prev, 
                            feedbackCallDelay: parseInt(e.target.value) || 24 
                          }))
                        }
                        min="1"
                        max="168"
                      />
                    </div>

                    <div>
                      <Label htmlFor="checkin-interval">Check-in Interval (hours)</Label>
                      <Input
                        id="checkin-interval"
                        type="number"
                        value={callSettings.checkInInterval}
                        onChange={(e) => 
                          setCallSettings(prev => ({ 
                            ...prev, 
                            checkInInterval: parseInt(e.target.value) || 72 
                          }))
                        }
                        min="24"
                        max="720"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="working-hours-only"
                        checked={callSettings.workingHoursOnly}
                        onCheckedChange={(workingHoursOnly) => 
                          setCallSettings(prev => ({ ...prev, workingHoursOnly }))
                        }
                      />
                      <Label htmlFor="working-hours-only">Working hours only</Label>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end pt-6 border-t">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              Save Communication Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunicationSettings;

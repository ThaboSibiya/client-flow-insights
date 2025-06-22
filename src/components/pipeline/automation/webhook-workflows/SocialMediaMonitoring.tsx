
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useSocialMediaMonitoring } from './social-media/useSocialMediaMonitoring';
import SocialMonitorForm from './social-media/SocialMonitorForm';
import SocialMonitorCard from './social-media/SocialMonitorCard';
import RecentMentionsList from './social-media/RecentMentionsList';
import SocialMonitoringEmptyState from './social-media/SocialMonitoringEmptyState';
import { NewSocialMonitor, Platform } from './social-media/types';

const SocialMediaMonitoring = () => {
  const {
    monitors,
    recentMentions,
    createMonitor,
    toggleMonitor,
    deleteMonitor
  } = useSocialMediaMonitoring();

  const [isCreating, setIsCreating] = useState(false);
  const [newMonitor, setNewMonitor] = useState<NewSocialMonitor>({
    name: '',
    platform: 'twitter',
    keywords: [],
    sentiment: 'all',
    webhookUrl: '',
    alertThreshold: 5
  });

  const platforms: Platform[] = [
    { value: 'twitter', label: 'Twitter', icon: '🐦' },
    { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
    { value: 'facebook', label: 'Facebook', icon: '📘' },
    { value: 'instagram', label: 'Instagram', icon: '📸' },
    { value: 'reddit', label: 'Reddit', icon: '🤖' },
    { value: 'youtube', label: 'YouTube', icon: '📹' }
  ];

  const handleCreate = () => {
    const success = createMonitor(newMonitor);
    if (success) {
      setNewMonitor({
        name: '',
        platform: 'twitter',
        keywords: [],
        sentiment: 'all',
        webhookUrl: '',
        alertThreshold: 5
      });
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Social Media Monitoring</h3>
          <p className="text-sm text-muted-foreground">
            Track brand mentions and engagement across social platforms
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Monitor
            </Button>
          </DialogTrigger>
          <SocialMonitorForm
            isOpen={isCreating}
            onClose={() => setIsCreating(false)}
            newMonitor={newMonitor}
            onMonitorChange={setNewMonitor}
            onCreate={handleCreate}
            platforms={platforms}
          />
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-semibold">Active Monitors</h4>
          {monitors.map((monitor) => (
            <SocialMonitorCard
              key={monitor.id}
              monitor={monitor}
              onToggle={toggleMonitor}
              onDelete={deleteMonitor}
            />
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Recent Mentions</h4>
            <Badge variant="outline">{recentMentions.length} new</Badge>
          </div>
          
          <RecentMentionsList
            mentions={recentMentions}
            platforms={platforms}
          />
        </div>
      </div>

      {monitors.length === 0 && (
        <SocialMonitoringEmptyState onCreateFirst={() => setIsCreating(true)} />
      )}
    </div>
  );
};

export default SocialMediaMonitoring;

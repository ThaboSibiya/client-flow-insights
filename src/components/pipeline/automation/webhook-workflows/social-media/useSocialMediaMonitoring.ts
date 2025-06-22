
import { useState } from 'react';
import { toast } from 'sonner';
import { SocialMonitor, Mention, NewSocialMonitor } from './types';

export const useSocialMediaMonitoring = () => {
  const [monitors, setMonitors] = useState<SocialMonitor[]>([
    {
      id: '1',
      name: 'Brand Mentions',
      platform: 'twitter',
      keywords: ['Quikle', '@quikle', 'quikle.com'],
      sentiment: 'all',
      isActive: true,
      mentionCount: 23,
      lastMention: '2024-01-22T10:30:00Z',
      webhookUrl: 'https://hooks.zapier.com/hooks/catch/brand-mentions/',
      alertThreshold: 10
    },
    {
      id: '2',
      name: 'Competitor Analysis',
      platform: 'linkedin',
      keywords: ['competitors', 'CRM software', 'customer management'],
      sentiment: 'positive',
      isActive: true,
      mentionCount: 8,
      lastMention: '2024-01-21T15:45:00Z',
      alertThreshold: 5
    }
  ]);

  const [recentMentions] = useState<Mention[]>([
    {
      id: '1',
      platform: 'twitter',
      author: '@customer_success',
      content: 'Just started using Quikle for our customer management. The automation features are amazing!',
      sentiment: 'positive',
      timestamp: '2024-01-22T10:30:00Z',
      url: 'https://twitter.com/customer_success/status/123456',
      engagement: 15
    },
    {
      id: '2',
      platform: 'linkedin',
      author: 'Sarah Johnson',
      content: 'Looking for alternatives to our current CRM. Has anyone tried Quikle?',
      sentiment: 'neutral',
      timestamp: '2024-01-22T09:15:00Z',
      url: 'https://linkedin.com/posts/sarah-johnson-456789',
      engagement: 8
    }
  ]);

  const createMonitor = (newMonitor: NewSocialMonitor) => {
    if (!newMonitor.name || newMonitor.keywords.length === 0) {
      toast.error("Please provide monitor name and keywords");
      return false;
    }

    const monitor: SocialMonitor = {
      id: Date.now().toString(),
      ...newMonitor,
      isActive: true,
      mentionCount: 0
    };

    setMonitors([...monitors, monitor]);
    toast.success("Social media monitor has been created successfully");
    return true;
  };

  const toggleMonitor = (id: string) => {
    setMonitors(monitors.map(monitor => 
      monitor.id === id ? { ...monitor, isActive: !monitor.isActive } : monitor
    ));
  };

  const deleteMonitor = (id: string) => {
    setMonitors(monitors.filter(monitor => monitor.id !== id));
    toast.success("Social media monitor has been removed");
  };

  return {
    monitors,
    recentMentions,
    createMonitor,
    toggleMonitor,
    deleteMonitor
  };
};

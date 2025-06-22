
export interface SocialMonitor {
  id: string;
  name: string;
  platform: string;
  keywords: string[];
  sentiment: 'positive' | 'negative' | 'neutral' | 'all';
  isActive: boolean;
  mentionCount: number;
  lastMention?: string;
  webhookUrl?: string;
  alertThreshold: number;
}

export interface Mention {
  id: string;
  platform: string;
  author: string;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  timestamp: string;
  url: string;
  engagement: number;
}

export interface NewSocialMonitor {
  name: string;
  platform: string;
  keywords: string[];
  sentiment: 'positive' | 'negative' | 'neutral' | 'all';
  webhookUrl: string;
  alertThreshold: number;
}

export interface Platform {
  value: string;
  label: string;
  icon: string;
}

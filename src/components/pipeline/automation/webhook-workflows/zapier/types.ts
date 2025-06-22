
export interface ZapierConnection {
  id: string;
  name: string;
  platform: 'zapier' | 'make' | 'n8n';
  webhookUrl: string;
  isActive: boolean;
  triggerCount: number;
  lastTriggered?: string;
  apps: string[];
}

export interface NewZapierConnection {
  name: string;
  platform: 'zapier' | 'make' | 'n8n';
  webhookUrl: string;
  apps: string[];
}

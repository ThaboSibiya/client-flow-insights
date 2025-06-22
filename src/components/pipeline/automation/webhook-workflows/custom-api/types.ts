
export interface CustomApiTrigger {
  id: string;
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  isActive: boolean;
  authType: 'none' | 'bearer' | 'apikey' | 'basic';
  headers: Record<string, string>;
  samplePayload: string;
  triggerCount: number;
  lastTriggered?: string;
  description: string;
}

export interface NewCustomApiTrigger {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  authType: 'none' | 'bearer' | 'apikey' | 'basic';
  description: string;
  samplePayload: string;
}

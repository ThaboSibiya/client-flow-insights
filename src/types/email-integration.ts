
export interface EmailProvider {
  id: string;
  name: string;
  type: 'google' | 'microsoft' | 'exchange' | 'imap';
  icon: string;
  requiresOAuth: boolean;
}

export interface EmailConfiguration {
  id: string;
  providerId: string;
  isEnabled: boolean;
  settings: {
    // OAuth settings
    clientId?: string;
    clientSecret?: string;
    redirectUri?: string;
    
    // IMAP/Exchange settings
    serverHost?: string;
    serverPort?: number;
    username?: string;
    password?: string;
    useSSL?: boolean;
    
    // Email parsing settings
    autoCreateTickets: boolean;
    defaultTicketPriority: 'low' | 'medium' | 'high' | 'urgent';
    emailToTicketMapping: {
      subjectToTitle: boolean;
      bodyToDescription: boolean;
      senderToCustomer: boolean;
      attachmentsToFiles: boolean;
    };
    
    // Template settings
    replyTemplate?: string;
    notificationTemplate?: string;
  };
}

export interface EmailIntegrationStats {
  emailsProcessed: number;
  ticketsCreated: number;
  lastSync: string | null;
  errorCount: number;
}

export interface ParsedEmail {
  id: string;
  subject: string;
  body: string;
  from: {
    email: string;
    name?: string;
  };
  to: string[];
  cc?: string[];
  attachments?: {
    name: string;
    size: number;
    contentType: string;
    content: string; // base64
  }[];
  receivedAt: Date;
  threadId?: string;
}

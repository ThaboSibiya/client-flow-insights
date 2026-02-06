import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Phone, CheckCircle2, AlertCircle } from 'lucide-react';

// Telegram icon component
const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

interface IntegrationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  isConnected?: boolean;
  setupSteps: string[];
  docsUrl: string;
  difficulty: 'easy' | 'medium';
}

const IntegrationCard = ({
  title,
  description,
  icon,
  iconBg,
  isConnected = false,
  setupSteps,
  docsUrl,
  difficulty
}: IntegrationCardProps) => (
  <Card className="relative overflow-hidden">
    <div className={`absolute top-0 left-0 w-1 h-full ${iconBg}`} />
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg ${iconBg} flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              {title}
              <Badge variant={difficulty === 'easy' ? 'secondary' : 'outline'} className="text-[10px] h-4">
                {difficulty === 'easy' ? '⭐ Easy' : '⭐⭐ Medium'}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
          </div>
        </div>
        {isConnected ? (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            <AlertCircle className="h-3 w-3 mr-1" />
            Not configured
          </Badge>
        )}
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Setup Steps:</p>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            {setupSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
        <Button variant="outline" size="sm" className="w-full gap-2" asChild>
          <a href={docsUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
            View Documentation
          </a>
        </Button>
      </div>
    </CardContent>
  </Card>
);

const MessagingIntegrations = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Messaging Channels</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Connect messaging platforms to communicate with customers directly from the CRM.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <IntegrationCard
          title="Telegram"
          description="Send messages via Telegram Bot API"
          icon={<TelegramIcon className="h-5 w-5 text-white" />}
          iconBg="bg-sky-500"
          setupSteps={[
            'Open Telegram and message @BotFather',
            'Send /newbot and follow the prompts',
            'Copy the API token you receive',
            'Add TELEGRAM_BOT_TOKEN in Supabase secrets'
          ]}
          docsUrl="https://core.telegram.org/bots#how-do-i-create-a-bot"
          difficulty="easy"
        />

        <IntegrationCard
          title="WhatsApp"
          description="Send messages via Twilio WhatsApp API"
          icon={<Phone className="h-5 w-5 text-white" />}
          iconBg="bg-green-500"
          setupSteps={[
            'Create a Twilio account at twilio.com',
            'Set up WhatsApp Sandbox or apply for Business API',
            'Get Account SID, Auth Token, and WhatsApp number',
            'Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER as secrets'
          ]}
          docsUrl="https://www.twilio.com/docs/whatsapp"
          difficulty="medium"
        />
      </div>

      <Card className="border-dashed">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Need help setting up?</p>
              <p className="text-xs text-muted-foreground">
                Secrets are managed in Supabase Dashboard → Settings → Edge Functions → Secrets
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a 
                href="https://supabase.com/dashboard/project/oquiaxbnkdnpixqhqdfq/settings/functions" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Open Secrets
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagingIntegrations;

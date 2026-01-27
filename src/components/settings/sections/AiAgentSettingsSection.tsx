
import React from 'react';
import { AiAgentSettings } from '@/components/settings/AiAgentSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Sparkles } from 'lucide-react';

const AiAgentSettingsSection = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-quikle-primary" />
            AI Agent Configuration
          </CardTitle>
          <CardDescription>
            Configure your AI-powered voice agent and automation settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AiAgentSettings />
        </CardContent>
      </Card>

      <Card className="border-quikle-primary/20 bg-gradient-to-br from-quikle-primary/5 to-quikle-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-quikle-primary" />
            AI Capabilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-quikle-charcoal/80">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-quikle-primary rounded-full" />
              Automated customer follow-ups
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-quikle-primary rounded-full" />
              Voice-based customer interactions
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-quikle-primary rounded-full" />
              Intelligent lead qualification
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-quikle-primary rounded-full" />
              Appointment scheduling
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AiAgentSettingsSection;

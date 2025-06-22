
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Brain, Lightbulb, TrendingUp, Users, Zap, Search, MessageSquare, BarChart3 } from "lucide-react";
import { useAIPoweredFeatures } from '@/hooks/useAIPoweredFeatures';

interface Automation {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
  isActive: boolean;
  type: 'customer' | 'ticket';
  triggerType?: 'simple' | 'advanced' | 'time' | 'webhook';
  lastTriggered?: string;
  triggerCount?: number;
}

interface AIAssistantTabProps {
  automations: Automation[];
}

const AIAssistantTab = ({ automations }: AIAssistantTabProps) => {
  const [query, setQuery] = useState('');
  const [selectedFeature, setSelectedFeature] = useState<string>('suggestions');
  const { 
    isLoading, 
    leadScores, 
    predictions, 
    generatedContent,
    scoreLeads, 
    predictNextAction, 
    generateContent 
  } = useAIPoweredFeatures();

  const aiFeatures = [
    {
      id: 'suggestions',
      title: 'Automation Suggestions',
      icon: Lightbulb,
      description: 'Get AI-powered suggestions for new automations',
      color: 'text-yellow-600'
    },
    {
      id: 'optimization',
      title: 'Performance Optimization',
      icon: TrendingUp,
      description: 'Analyze and optimize existing automations',
      color: 'text-green-600'
    },
    {
      id: 'lead-scoring',
      title: 'Lead Scoring',
      icon: Users,
      description: 'AI-powered lead scoring and prioritization',
      color: 'text-blue-600'
    },
    {
      id: 'content-generation',
      title: 'Content Generation',
      icon: MessageSquare,
      description: 'Generate email templates and messages',
      color: 'text-purple-600'
    },
    {
      id: 'analytics',
      title: 'Predictive Analytics',
      icon: BarChart3,
      description: 'Predict customer behavior and outcomes',
      color: 'text-orange-600'
    }
  ];

  const automationSuggestions = [
    {
      title: 'Follow-up for Inactive Leads',
      description: 'Automatically send follow-up emails to leads who haven\'t been contacted in 7 days',
      priority: 'high',
      estimatedImpact: '25% increase in conversion'
    },
    {
      title: 'Urgent Ticket Escalation',
      description: 'Auto-escalate tickets that remain unresolved for more than 4 hours',
      priority: 'medium',
      estimatedImpact: '15% faster resolution time'
    },
    {
      title: 'Customer Satisfaction Survey',
      description: 'Send satisfaction surveys 24 hours after ticket closure',
      priority: 'low',
      estimatedImpact: '30% more feedback collection'
    }
  ];

  const performanceInsights = [
    {
      automation: 'Welcome New Customers',
      insight: 'High trigger rate but low conversion. Consider A/B testing email content.',
      recommendation: 'Update email template with more personalized content'
    },
    {
      automation: 'High Priority Ticket Alert',
      insight: 'Perfect performance with 100% success rate.',
      recommendation: 'Consider expanding to include medium priority tickets'
    }
  ];

  const handleAskAI = async () => {
    if (!query.trim()) return;
    
    try {
      const content = await generateContent(
        { query, automations }, 
        'message'
      );
      console.log('AI Response:', content);
    } catch (error) {
      console.error('AI query failed:', error);
    }
  };

  const handleLeadScoring = async () => {
    const sampleLeads = [
      {
        email: 'john@example.com',
        company: 'Tech Corp',
        industry: 'Technology',
        revenue: 1000000,
        employees: 50,
        websiteVisits: 15,
        emailOpens: 8,
        lastActivity: new Date().toISOString()
      }
    ];
    
    await scoreLeads(sampleLeads);
  };

  const renderFeatureContent = () => {
    switch (selectedFeature) {
      case 'suggestions':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recommended Automations</h3>
            {automationSuggestions.map((suggestion, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{suggestion.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {suggestion.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={
                          suggestion.priority === 'high' ? 'destructive' : 
                          suggestion.priority === 'medium' ? 'default' : 'secondary'
                        }>
                          {suggestion.priority} priority
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {suggestion.estimatedImpact}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Create
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'optimization':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Performance Insights</h3>
            {performanceInsights.map((insight, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <h4 className="font-medium">{insight.automation}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {insight.insight}
                  </p>
                  <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                    <strong>Recommendation:</strong> {insight.recommendation}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'lead-scoring':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Lead Scoring</h3>
              <Button onClick={handleLeadScoring} disabled={isLoading}>
                {isLoading ? 'Scoring...' : 'Score Leads'}
              </Button>
            </div>
            
            {leadScores.length > 0 ? (
              <div className="space-y-3">
                {leadScores.map((lead, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Lead Score: {lead.score}/100</h4>
                          <Badge variant={
                            lead.priority === 'urgent' ? 'destructive' :
                            lead.priority === 'high' ? 'default' :
                            lead.priority === 'medium' ? 'secondary' : 'outline'
                          }>
                            {lead.priority} priority
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-2 space-y-1">
                        {lead.recommendations.map((rec, i) => (
                          <div key={i} className="text-sm text-muted-foreground">
                            • {rec}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Click "Score Leads" to analyze your leads with AI
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'content-generation':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Content Generation</h3>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Email Templates</h4>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => generateContent({ type: 'welcome' }, 'email')}
                  >
                    Generate Welcome Email
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => generateContent({ type: 'followup' }, 'email')}
                  >
                    Generate Follow-up Email
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => generateContent({ type: 'reminder' }, 'email')}
                  >
                    Generate Reminder Email
                  </Button>
                </div>
                
                {generatedContent && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <h5 className="font-medium mb-2">Generated Content:</h5>
                    <p className="text-sm whitespace-pre-wrap">{generatedContent}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Predictive Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Conversion Predictions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Next 7 days</span>
                      <span className="text-sm font-medium">24 conversions</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Next 30 days</span>
                      <span className="text-sm font-medium">89 conversions</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Churn Risk</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">High Risk</span>
                      <span className="text-sm font-medium text-red-600">3 customers</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Medium Risk</span>
                      <span className="text-sm font-medium text-yellow-600">8 customers</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Chat Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Ask me anything about your automations..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
            />
            <Button onClick={handleAskAI} disabled={isLoading || !query.trim()}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feature Selection */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {aiFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <Button
              key={feature.id}
              variant={selectedFeature === feature.id ? "default" : "outline"}
              className="h-auto p-3 flex flex-col items-center gap-2"
              onClick={() => setSelectedFeature(feature.id)}
            >
              <Icon className={`h-5 w-5 ${feature.color}`} />
              <span className="text-xs font-medium">{feature.title}</span>
            </Button>
          );
        })}
      </div>

      <Separator />

      {/* Feature Content */}
      <div className="min-h-[400px]">
        {renderFeatureContent()}
      </div>
    </div>
  );
};

export default AIAssistantTab;

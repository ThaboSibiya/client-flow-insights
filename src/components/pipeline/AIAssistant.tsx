
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Zap, Target, MessageSquare, TrendingUp, Users, Mail, FileText } from "lucide-react";
import { useAIPoweredFeatures } from '@/hooks/useAIPoweredFeatures';
import SmartLeadScoring from './SmartLeadScoring';

const AIAssistant = () => {
  const { 
    isLoading, 
    leadScores, 
    predictions, 
    assignments, 
    generatedContent,
    scoreLeads, 
    predictNextAction, 
    recommendAssignment, 
    generateContent 
  } = useAIPoweredFeatures();

  const [activeTab, setActiveTab] = useState('overview');
  const [contentContext, setContentContext] = useState({
    customerName: '',
    lastInteraction: '',
    primaryNeed: '',
    senderName: '',
    topic: '',
    nextSteps: '',
    priority: 'Medium'
  });
  const [contentType, setContentType] = useState<'email' | 'message' | 'note'>('email');

  // Sample leads data for demonstration
  const sampleLeads = [
    {
      id: '1',
      name: 'John Smith',
      company: 'Acme Corp',
      email: 'john@acme.com',
      source: 'Website',
      createdAt: '2024-06-14T10:00:00Z'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      company: 'Tech Solutions',
      email: 'sarah@techsol.com',
      source: 'Referral',
      createdAt: '2024-06-13T15:30:00Z'
    }
  ];

  const sampleTicketData = {
    id: 'T001',
    title: 'Integration Issue',
    priority: 'high',
    tags: ['technical', 'integration', 'api'],
    description: 'Customer having trouble with API integration'
  };

  const sampleUsers = [
    {
      id: '1',
      name: 'Alice Developer',
      skills: ['technical', 'api', 'integration'],
      currentTickets: 3,
      maxCapacity: 8
    },
    {
      id: '2',
      name: 'Bob Support',
      skills: ['customer-service', 'general'],
      currentTickets: 6,
      maxCapacity: 10
    }
  ];

  const handleGenerateContent = async () => {
    await generateContent(contentContext, contentType);
  };

  const handlePredictAction = async () => {
    const sampleHistory = [
      { type: 'email_sent', timestamp: '2024-06-13T10:00:00Z', outcome: 'opened' },
      { type: 'website_visit', timestamp: '2024-06-13T14:30:00Z', pages: 3 },
      { type: 'demo_requested', timestamp: '2024-06-14T09:15:00Z' }
    ];
    await predictNextAction(sampleHistory);
  };

  const handleRecommendAssignment = async () => {
    await recommendAssignment(sampleTicketData, sampleUsers);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="h-8 w-8 text-quikle-primary" />
        <div>
          <h2 className="text-2xl font-bold">AI Assistant</h2>
          <p className="text-muted-foreground">
            Leverage AI to enhance your pipeline management with smart insights and automation
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lead-scoring" className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            Lead Scoring
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Assignments
          </TabsTrigger>
          <TabsTrigger value="content-gen" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Leads Scored</p>
                    <p className="text-2xl font-bold">{leadScores.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Predictions Made</p>
                    <p className="text-2xl font-bold">{predictions ? 1 : 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Auto Assignments</p>
                    <p className="text-2xl font-bold">{assignments.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Content Generated</p>
                    <p className="text-2xl font-bold">{generatedContent ? 1 : 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-quikle-accent" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Perform common AI-powered tasks with one click
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button 
                  onClick={() => scoreLeads(sampleLeads.map(lead => ({
                    email: lead.email,
                    company: lead.company,
                    source: lead.source,
                    lastActivity: lead.createdAt
                  })))}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Target className="h-4 w-4" />
                  Score Sample Leads
                </Button>
                
                <Button 
                  onClick={handlePredictAction}
                  disabled={isLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  Predict Next Action
                </Button>
                
                <Button 
                  onClick={handleRecommendAssignment}
                  disabled={isLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Recommend Assignment
                </Button>
                
                <Button 
                  onClick={handleGenerateContent}
                  disabled={isLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Generate Content
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lead-scoring">
          <SmartLeadScoring 
            leads={sampleLeads}
            onScoreUpdate={(leadId, score) => {
              console.log(`Lead ${leadId} scored:`, score);
            }}
          />
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Predictive Analytics</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered next best action recommendations
              </p>
            </div>
            <Button onClick={handlePredictAction} disabled={isLoading}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Generate Prediction
            </Button>
          </div>

          {predictions && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Prediction Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Next Best Action</Label>
                    <p className="text-lg font-semibold text-quikle-primary">{predictions.nextBestAction}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Confidence Level</Label>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold">{Math.round(predictions.confidence * 100)}%</p>
                      <Badge variant={predictions.confidence > 0.8 ? 'default' : predictions.confidence > 0.6 ? 'secondary' : 'outline'}>
                        {predictions.confidence > 0.8 ? 'High' : predictions.confidence > 0.6 ? 'Medium' : 'Low'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">AI Reasoning</Label>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                    {predictions.reasoning}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Recommended Timeline</Label>
                    <p className="text-sm">{predictions.timeline}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Expected Outcome</Label>
                    <p className="text-sm">{predictions.expectedOutcome}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!predictions && (
            <Card>
              <CardContent className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Predictions Yet</h3>
                <p className="text-muted-foreground">
                  Generate AI predictions to see next best action recommendations
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Smart Assignment</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered ticket and customer assignment recommendations
              </p>
            </div>
            <Button onClick={handleRecommendAssignment} disabled={isLoading}>
              <Users className="h-4 w-4 mr-2" />
              Get Recommendations
            </Button>
          </div>

          {assignments.length > 0 && (
            <div className="space-y-3">
              {assignments.map((assignment, index) => (
                <Card key={assignment.userId}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-quikle-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-quikle-primary">
                            #{index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">{assignment.userName}</p>
                          <p className="text-sm text-muted-foreground">{assignment.reasoning}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={assignment.confidence > 0.8 ? 'default' : assignment.confidence > 0.6 ? 'secondary' : 'outline'}>
                          {Math.round(assignment.confidence * 100)}% match
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          Workload: {Math.round(assignment.workloadScore * 100)}% | 
                          Expertise: {Math.round(assignment.expertiseMatch * 100)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {assignments.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Recommendations Yet</h3>
                <p className="text-muted-foreground">
                  Generate assignment recommendations to see AI-powered suggestions
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="content-gen" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Content Generation</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered email, message, and note generation
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Content Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Content Type</Label>
                  <Select value={contentType} onValueChange={(value: 'email' | 'message' | 'note') => setContentType(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </div>
                      </SelectItem>
                      <SelectItem value="message">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Message
                        </div>
                      </SelectItem>
                      <SelectItem value="note">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Note
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Customer Name</Label>
                  <Input
                    value={contentContext.customerName}
                    onChange={(e) => setContentContext({ ...contentContext, customerName: e.target.value })}
                    placeholder="e.g., John Smith"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Last Interaction</Label>
                  <Input
                    value={contentContext.lastInteraction}
                    onChange={(e) => setContentContext({ ...contentContext, lastInteraction: e.target.value })}
                    placeholder="e.g., demo call yesterday"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Primary Need/Topic</Label>
                  <Input
                    value={contentContext.primaryNeed}
                    onChange={(e) => setContentContext({ ...contentContext, primaryNeed: e.target.value })}
                    placeholder="e.g., CRM integration"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Sender Name</Label>
                  <Input
                    value={contentContext.senderName}
                    onChange={(e) => setContentContext({ ...contentContext, senderName: e.target.value })}
                    placeholder="e.g., Sarah Johnson"
                    className="mt-1"
                  />
                </div>

                <Button onClick={handleGenerateContent} disabled={isLoading} className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Generate Content
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Generated Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generatedContent ? (
                  <div className="space-y-3">
                    <Textarea
                      value={generatedContent}
                      readOnly
                      className="min-h-[200px] font-mono text-sm"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => navigator.clipboard.writeText(generatedContent)}>
                        Copy to Clipboard
                      </Button>
                      <Button size="sm" variant="outline">
                        Use in Email
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Generated content will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAssistant;

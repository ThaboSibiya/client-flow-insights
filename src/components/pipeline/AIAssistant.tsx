
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, TrendingUp, Users, Mail, Zap, Star, Clock, User } from "lucide-react";
import { useAIPoweredFeatures } from '@/hooks/useAIPoweredFeatures';

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

  const [activeTab, setActiveTab] = useState('scoring');
  const [contentContext, setContentContext] = useState({
    customerName: '',
    topic: '',
    senderName: '',
    primaryNeed: ''
  });

  const mockLeadData = [
    {
      email: 'john@techcorp.com',
      company: 'TechCorp Inc',
      industry: 'Technology',
      revenue: 5000000,
      employees: 150,
      websiteVisits: 25,
      emailOpens: 8,
      lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'website'
    },
    {
      email: 'sarah@startup.io',
      company: 'StartupIO',
      industry: 'SaaS',
      revenue: 500000,
      employees: 25,
      websiteVisits: 12,
      emailOpens: 3,
      lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'social'
    }
  ];

  const mockUsers = [
    { id: '1', name: 'Alice Johnson', currentTickets: 3, maxCapacity: 8, skills: ['technical', 'enterprise'] },
    { id: '2', name: 'Bob Smith', currentTickets: 7, maxCapacity: 10, skills: ['sales', 'small-business'] },
    { id: '3', name: 'Carol Davis', currentTickets: 2, maxCapacity: 6, skills: ['support', 'technical'] }
  ];

  const handleScoreLeads = () => {
    scoreLeads(mockLeadData);
  };

  const handlePredictActions = () => {
    const mockHistory = [
      { type: 'email_sent', timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000 },
      { type: 'email_opened', timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 },
      { type: 'website_visit', timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000 }
    ];
    predictNextAction(mockHistory);
  };

  const handleRecommendAssignment = () => {
    const mockTicket = {
      priority: 'high',
      type: 'technical',
      tags: ['technical', 'enterprise'],
      description: 'Integration issue with API'
    };
    recommendAssignment(mockTicket, mockUsers);
  };

  const handleGenerateContent = (type: 'email' | 'message' | 'note') => {
    generateContent(contentContext, type);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="h-6 w-6 text-purple-600" />
        <h2 className="text-2xl font-bold">AI Assistant</h2>
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          Powered by AI
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scoring" className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            Lead Scoring
          </TabsTrigger>
          <TabsTrigger value="prediction" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="assignment" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Auto-Assignment
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-1">
            <Mail className="h-4 w-4" />
            Content Gen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Lead Scoring Engine
              </CardTitle>
              <CardDescription>
                Automatically score and prioritize leads based on behavior and company data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleScoreLeads} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                {isLoading ? 'Scoring...' : 'Score Sample Leads'}
              </Button>

              {leadScores.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Scored Leads:</h4>
                  {leadScores.map((lead, index) => (
                    <Card key={index} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{mockLeadData[index]?.company}</span>
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(lead.priority)}>
                              {lead.priority.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">Score: {lead.score}</Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm">
                            <strong>Key Factors:</strong>
                            <ul className="mt-1 space-y-1">
                              {lead.factors.slice(0, 3).map((factor: any, idx: number) => (
                                <li key={idx} className="text-xs text-muted-foreground">
                                  • {factor.factor}: +{Math.round(factor.impact)} pts - {factor.reasoning}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="text-sm">
                            <strong>Recommendations:</strong>
                            <ul className="mt-1 space-y-1">
                              {lead.recommendations.slice(0, 2).map((rec: string, idx: number) => (
                                <li key={idx} className="text-xs text-blue-600">• {rec}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prediction" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Predictive Analytics
              </CardTitle>
              <CardDescription>
                AI-powered recommendations for next best actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handlePredictActions} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Brain className="h-4 w-4" />
                {isLoading ? 'Analyzing...' : 'Analyze Customer Journey'}
              </Button>

              {predictions && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Next Best Action</h4>
                        <Badge variant="outline">
                          {Math.round(predictions.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      
                      <div className="bg-white p-3 rounded border">
                        <h5 className="font-medium text-blue-800">{predictions.nextBestAction}</h5>
                        <p className="text-sm text-muted-foreground mt-1">{predictions.reasoning}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <strong>Timeline:</strong>
                          <p className="text-muted-foreground">{predictions.timeline}</p>
                        </div>
                        <div>
                          <strong>Expected Outcome:</strong>
                          <p className="text-muted-foreground">{predictions.expectedOutcome}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                Smart Auto-Assignment
              </CardTitle>
              <CardDescription>
                Intelligently assign tickets based on workload and expertise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleRecommendAssignment} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                {isLoading ? 'Analyzing...' : 'Get Assignment Recommendations'}
              </Button>

              {assignments.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Recommended Assignments:</h4>
                  {assignments.map((assignment, index) => (
                    <Card key={index} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{assignment.userName}</span>
                          <Badge variant="outline">
                            {Math.round(assignment.confidence * 100)}% match
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <p className="text-muted-foreground">{assignment.reasoning}</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <strong>Workload:</strong> {Math.round(assignment.workloadScore * 100)}%
                            </div>
                            <div>
                              <strong>Expertise:</strong> {Math.round(assignment.expertiseMatch * 100)}%
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-purple-500" />
                AI Content Generation
              </CardTitle>
              <CardDescription>
                Generate personalized emails, messages, and notes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={contentContext.customerName}
                    onChange={(e) => setContentContext(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <Label htmlFor="senderName">Your Name</Label>
                  <Input
                    id="senderName"
                    value={contentContext.senderName}
                    onChange={(e) => setContentContext(prev => ({ ...prev, senderName: e.target.value }))}
                    placeholder="Alice Johnson"
                  />
                </div>
                <div>
                  <Label htmlFor="topic">Topic/Subject</Label>
                  <Input
                    id="topic"
                    value={contentContext.topic}
                    onChange={(e) => setContentContext(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="API integration"
                  />
                </div>
                <div>
                  <Label htmlFor="primaryNeed">Primary Need</Label>
                  <Input
                    id="primaryNeed"
                    value={contentContext.primaryNeed}
                    onChange={(e) => setContentContext(prev => ({ ...prev, primaryNeed: e.target.value }))}
                    placeholder="workflow automation"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleGenerateContent('email')} 
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  Generate Email
                </Button>
                <Button 
                  onClick={() => handleGenerateContent('message')} 
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  Generate Message
                </Button>
                <Button 
                  onClick={() => handleGenerateContent('note')} 
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  Generate Note
                </Button>
              </div>

              {generatedContent && (
                <Card className="border-purple-200 bg-purple-50">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Generated Content:</h4>
                    <Textarea
                      value={generatedContent}
                      onChange={(e) => setGeneratedContent(e.target.value)}
                      rows={8}
                      className="bg-white"
                    />
                    <div className="flex gap-2 mt-2">
                      <Button size="sm">Use Content</Button>
                      <Button size="sm" variant="outline">Copy to Clipboard</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAssistant;

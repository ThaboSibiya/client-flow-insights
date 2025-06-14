
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, TrendingUp, Building, Activity, Mail, Globe } from "lucide-react";
import { useAIPoweredFeatures } from '@/hooks/useAIPoweredFeatures';

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  source: string;
  createdAt: string;
}

interface SmartLeadScoringProps {
  leads: Lead[];
  onScoreUpdate?: (leadId: string, score: any) => void;
}

const SmartLeadScoring = ({ leads, onScoreUpdate }: SmartLeadScoringProps) => {
  const { leadScores, scoreLeads, isLoading } = useAIPoweredFeatures();
  const [scoredLeads, setScoredLeads] = useState<any[]>([]);

  useEffect(() => {
    if (leads.length > 0) {
      handleScoreLeads();
    }
  }, [leads]);

  const handleScoreLeads = async () => {
    const leadData = leads.map(lead => ({
      email: lead.email,
      company: lead.company,
      source: lead.source,
      lastActivity: lead.createdAt,
      // Mock additional data for demo
      revenue: Math.floor(Math.random() * 10000000),
      employees: Math.floor(Math.random() * 500) + 10,
      websiteVisits: Math.floor(Math.random() * 50),
      emailOpens: Math.floor(Math.random() * 20)
    }));

    const scores = await scoreLeads(leadData);
    if (scores) {
      const combined = leads.map((lead, index) => ({
        ...lead,
        score: scores[index]
      }));
      setScoredLeads(combined);
      
      // Notify parent component of score updates
      combined.forEach(lead => {
        onScoreUpdate?.(lead.id, lead.score);
      });
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Star className="h-4 w-4 text-red-500 fill-current" />;
      case 'high': return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Activity className="h-4 w-4 text-yellow-500" />;
      default: return <Star className="h-4 w-4 text-green-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (leads.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Leads to Score</h3>
          <p className="text-muted-foreground">
            Add some leads to see AI-powered scoring in action.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Smart Lead Scoring
          </h3>
          <p className="text-sm text-muted-foreground">
            AI-powered lead prioritization and insights
          </p>
        </div>
        <Button 
          onClick={handleScoreLeads} 
          disabled={isLoading}
          size="sm"
          className="flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          {isLoading ? 'Scoring...' : 'Refresh Scores'}
        </Button>
      </div>

      <div className="grid gap-4">
        {scoredLeads.map((lead) => (
          <Card key={lead.id} className="border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{lead.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Building className="h-3 w-3" />
                    {lead.company}
                    <Mail className="h-3 w-3" />
                    {lead.email}
                  </CardDescription>
                </div>
                {lead.score && (
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(lead.score.priority)}
                    <Badge 
                      variant="outline" 
                      className={`font-bold ${getScoreColor(lead.score.score)}`}
                    >
                      {lead.score.score}/100
                    </Badge>
                    <Badge variant={lead.score.priority === 'urgent' ? 'destructive' : 'secondary'}>
                      {lead.score.priority.toUpperCase()}
                    </Badge>
                  </div>
                )}
              </div>
            </CardHeader>
            
            {lead.score && (
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Lead Score</span>
                    <span className={`font-medium ${getScoreColor(lead.score.score)}`}>
                      {lead.score.score}%
                    </span>
                  </div>
                  <Progress value={lead.score.score} className="h-2" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Key Scoring Factors:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {lead.score.factors.slice(0, 4).map((factor: any, index: number) => (
                      <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                        <span className="text-xs font-medium">{factor.factor}</span>
                        <Badge variant="outline" className="text-xs">
                          +{Math.round(factor.impact)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">AI Recommendations:</h4>
                  <div className="space-y-1">
                    {lead.score.recommendations.slice(0, 3).map((rec: string, index: number) => (
                      <div key={index} className="text-xs text-blue-600 bg-blue-50 p-2 rounded flex items-center gap-1">
                        <div className="w-1 h-1 bg-blue-600 rounded-full" />
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1">
                    Contact Lead
                  </Button>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SmartLeadScoring;


import { useState } from 'react';
import { aiService } from '@/services/aiService';
import { toast } from '@/hooks/use-toast';

export const useAIPoweredFeatures = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [leadScores, setLeadScores] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [generatedContent, setGeneratedContent] = useState<string>('');

  const scoreLeads = async (leadData: any[]) => {
    setIsLoading(true);
    try {
      const scores = await aiService.scoreLeads(leadData);
      setLeadScores(scores);
      toast({
        title: "Lead Scoring Complete",
        description: `Scored ${scores.length} leads successfully`,
      });
      return scores;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to score leads",
        variant: "destructive",
      });
      console.error('Lead scoring error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const predictNextAction = async (historyData: any[]) => {
    setIsLoading(true);
    try {
      const prediction = await aiService.predictNextAction(historyData);
      setPredictions(prediction);
      return prediction;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate predictions",
        variant: "destructive",
      });
      console.error('Prediction error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const recommendAssignment = async (ticketData: any, availableUsers: any[]) => {
    setIsLoading(true);
    try {
      const recommendations = await aiService.recommendAssignment(ticketData, availableUsers);
      setAssignments(recommendations);
      return recommendations;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate assignment recommendations",
        variant: "destructive",
      });
      console.error('Assignment error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateContent = async (context: any, type: 'email' | 'message' | 'note') => {
    setIsLoading(true);
    try {
      const content = await aiService.generateContent(context, type);
      setGeneratedContent(content);
      return content;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate content",
        variant: "destructive",
      });
      console.error('Content generation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    leadScores,
    predictions,
    assignments,
    generatedContent,
    scoreLeads,
    predictNextAction,
    recommendAssignment,
    generateContent,
  };
};

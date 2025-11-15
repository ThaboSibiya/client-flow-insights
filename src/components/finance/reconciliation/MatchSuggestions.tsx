import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle, XCircle, TrendingUp, AlertCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface MatchSuggestion {
  invoice_id: string;
  invoice_number: string;
  payment_id: string;
  payment_number: string;
  confidence: number;
  reason: string;
  invoice_amount: number;
  payment_amount: number;
}

interface MatchSuggestionsProps {
  suggestions: MatchSuggestion[];
  onAccept: (suggestion: MatchSuggestion) => Promise<void>;
  onReject: (suggestion: MatchSuggestion) => void;
  isLoading: boolean;
}

const MatchSuggestions: React.FC<MatchSuggestionsProps> = ({ 
  suggestions, 
  onAccept, 
  onReject,
  isLoading 
}) => {
  const { toast } = useToast();
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  const handleAccept = async (suggestion: MatchSuggestion) => {
    setProcessingId(suggestion.payment_id);
    try {
      await onAccept(suggestion);
      toast({
        title: "Match Accepted",
        description: `Payment ${suggestion.payment_number} matched to Invoice ${suggestion.invoice_number}`,
      });
    } catch (error) {
      console.error('Error accepting match:', error);
      toast({
        title: "Error",
        description: "Failed to accept match",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = (suggestion: MatchSuggestion) => {
    onReject(suggestion);
    toast({
      title: "Match Rejected",
      description: `Suggestion removed`,
      variant: "default",
    });
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) {
      return <Badge className="bg-green-100 text-green-800">High: {confidence}%</Badge>;
    } else if (confidence >= 75) {
      return <Badge className="bg-blue-100 text-blue-800">Good: {confidence}%</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800">Fair: {confidence}%</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="border-quikle-silver/20 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-quikle-charcoal">
            <Sparkles className="h-5 w-5 text-quikle-primary animate-pulse" />
            AI Match Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quikle-primary mx-auto mb-3"></div>
            <p className="text-quikle-slate">Analyzing transactions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card className="border-quikle-silver/20 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-quikle-charcoal">
            <Sparkles className="h-5 w-5 text-quikle-primary" />
            AI Match Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-quikle-slate">No confident matches found</p>
            <p className="text-sm text-quikle-slate mt-1">
              Try adjusting filters or manually match transactions
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-quikle-silver/20 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
        <CardTitle className="flex items-center gap-2 text-quikle-charcoal">
          <Sparkles className="h-5 w-5 text-quikle-primary" />
          AI Match Suggestions ({suggestions.length})
        </CardTitle>
        <p className="text-sm text-quikle-slate mt-1">
          AI-powered recommendations based on customer, amount, and date analysis
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => {
            const amountDiff = Math.abs(suggestion.invoice_amount - suggestion.payment_amount);
            const amountMatch = amountDiff < 0.01;
            
            return (
              <div
                key={`${suggestion.invoice_id}-${suggestion.payment_id}`}
                className="border border-quikle-silver/30 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-quikle-primary/10 text-quikle-primary font-semibold">
                      {index + 1}
                    </div>
                    {getConfidenceBadge(suggestion.confidence)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-300 hover:bg-green-50"
                      onClick={() => handleAccept(suggestion)}
                      disabled={processingId === suggestion.payment_id}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => handleReject(suggestion)}
                      disabled={processingId === suggestion.payment_id}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-quikle-slate mb-1">Invoice</p>
                    <p className="font-semibold text-quikle-charcoal">{suggestion.invoice_number}</p>
                    <p className="text-sm text-quikle-charcoal mt-1">
                      ${suggestion.invoice_amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-quikle-slate mb-1">Payment</p>
                    <p className="font-semibold text-quikle-charcoal">{suggestion.payment_number}</p>
                    <p className="text-sm text-quikle-charcoal mt-1">
                      ${suggestion.payment_amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
                  <TrendingUp className="h-4 w-4 text-quikle-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-quikle-charcoal font-medium">{suggestion.reason}</p>
                    {!amountMatch && amountDiff > 0 && (
                      <p className="text-xs text-orange-600 mt-1">
                        Amount difference: R{amountDiff.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchSuggestions;

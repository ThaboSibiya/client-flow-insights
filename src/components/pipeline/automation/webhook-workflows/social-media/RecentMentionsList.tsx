
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, TrendingUp } from 'lucide-react';
import { Mention, Platform } from './types';

interface RecentMentionsListProps {
  mentions: Mention[];
  platforms: Platform[];
}

const RecentMentionsList: React.FC<RecentMentionsListProps> = ({
  mentions,
  platforms
}) => {
  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      case 'neutral': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <>
      {mentions.map((mention) => (
        <Card key={mention.id}>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {platforms.find(p => p.value === mention.platform)?.icon}
                  </span>
                  <span className="font-medium text-sm">{mention.author}</span>
                  <Badge className={`text-xs ${getSentimentBadge(mention.sentiment)}`}>
                    {mention.sentiment}
                  </Badge>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(mention.url, '_blank', 'noopener,noreferrer')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {mention.content}
              </p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{new Date(mention.timestamp).toLocaleString()}</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {mention.engagement} engagement
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default RecentMentionsList;

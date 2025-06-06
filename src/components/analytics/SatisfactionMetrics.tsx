
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Star, MessageSquare, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SatisfactionMetrics as SatisfactionMetricsType } from '@/services/ticketAnalyticsService';

interface SatisfactionMetricsProps {
  metrics: SatisfactionMetricsType;
  isLoading?: boolean;
}

const SatisfactionMetrics = ({ metrics, isLoading }: SatisfactionMetricsProps) => {
  const ratingData = [
    { rating: '1 Star', count: metrics.ratingDistribution[1], color: '#ef4444' },
    { rating: '2 Stars', count: metrics.ratingDistribution[2], color: '#f97316' },
    { rating: '3 Stars', count: metrics.ratingDistribution[3], color: '#eab308' },
    { rating: '4 Stars', count: metrics.ratingDistribution[4], color: '#22c55e' },
    { rating: '5 Stars', count: metrics.ratingDistribution[5], color: '#16a34a' },
  ];

  const getStarDisplay = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRatingColor(metrics.averageRating)}`}>
              {metrics.averageRating.toFixed(1)}
            </div>
            <div className="flex items-center mt-1">
              {getStarDisplay(Math.round(metrics.averageRating))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ratings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalRatings}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.recentFeedback.length} with feedback
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.totalRatings > 0 
                ? Math.round(((metrics.ratingDistribution[4] + metrics.ratingDistribution[5]) / metrics.totalRatings) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              4+ star ratings
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
            <CardDescription>Breakdown of customer satisfaction ratings</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ratingData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="rating" type="category" width={80} />
                <Tooltip formatter={(value) => [`${value} ratings`, 'Count']} />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Feedback</CardTitle>
            <CardDescription>Latest customer comments and ratings</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {metrics.recentFeedback.length > 0 ? (
                  metrics.recentFeedback.map((feedback, index) => (
                    <div key={index} className="border-b pb-3 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex">{getStarDisplay(feedback.rating)}</div>
                          <Badge variant="outline" className="text-xs">
                            {feedback.ticketNumber}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(feedback.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{feedback.feedback}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No feedback available yet</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SatisfactionMetrics;

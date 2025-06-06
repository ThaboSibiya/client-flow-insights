
import { supabase } from '@/integrations/supabase/client';

export interface ResolutionTimeMetrics {
  averageResolutionTime: number; // in minutes
  medianResolutionTime: number;
  resolutionTimeByPriority: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
  resolutionTrend: Array<{
    date: string;
    averageTime: number;
  }>;
}

export interface PriorityDistribution {
  urgent: number;
  high: number;
  medium: number;
  low: number;
}

export interface SatisfactionMetrics {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  recentFeedback: Array<{
    rating: number;
    feedback: string;
    ticketNumber: string;
    createdAt: string;
  }>;
}

export const getResolutionTimeMetrics = async (userId: string, days: number = 30): Promise<ResolutionTimeMetrics> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get resolved tickets with resolution times
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('resolution_time_minutes, priority, resolved_at')
    .eq('user_id', userId)
    .not('resolution_time_minutes', 'is', null)
    .gte('resolved_at', startDate.toISOString())
    .order('resolved_at', { ascending: true });

  if (error) {
    console.error('Error fetching resolution metrics:', error);
    throw error;
  }

  if (!tickets || tickets.length === 0) {
    return {
      averageResolutionTime: 0,
      medianResolutionTime: 0,
      resolutionTimeByPriority: { urgent: 0, high: 0, medium: 0, low: 0 },
      resolutionTrend: [],
    };
  }

  // Calculate average resolution time
  const totalTime = tickets.reduce((sum, ticket) => sum + (ticket.resolution_time_minutes || 0), 0);
  const averageResolutionTime = totalTime / tickets.length;

  // Calculate median resolution time
  const sortedTimes = tickets.map(t => t.resolution_time_minutes || 0).sort((a, b) => a - b);
  const medianResolutionTime = sortedTimes.length % 2 === 0
    ? (sortedTimes[sortedTimes.length / 2 - 1] + sortedTimes[sortedTimes.length / 2]) / 2
    : sortedTimes[Math.floor(sortedTimes.length / 2)];

  // Calculate resolution time by priority
  const resolutionTimeByPriority = {
    urgent: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  const priorityCounts = { urgent: 0, high: 0, medium: 0, low: 0 };

  tickets.forEach(ticket => {
    const priority = ticket.priority as keyof typeof resolutionTimeByPriority;
    if (priority in resolutionTimeByPriority) {
      resolutionTimeByPriority[priority] += ticket.resolution_time_minutes || 0;
      priorityCounts[priority]++;
    }
  });

  // Calculate averages by priority
  Object.keys(resolutionTimeByPriority).forEach(priority => {
    const key = priority as keyof typeof resolutionTimeByPriority;
    if (priorityCounts[key] > 0) {
      resolutionTimeByPriority[key] = resolutionTimeByPriority[key] / priorityCounts[key];
    }
  });

  // Calculate resolution trend (daily averages)
  const trendMap = new Map<string, { total: number; count: number }>();
  tickets.forEach(ticket => {
    if (ticket.resolved_at) {
      const date = new Date(ticket.resolved_at).toISOString().split('T')[0];
      const existing = trendMap.get(date) || { total: 0, count: 0 };
      existing.total += ticket.resolution_time_minutes || 0;
      existing.count++;
      trendMap.set(date, existing);
    }
  });

  const resolutionTrend = Array.from(trendMap.entries()).map(([date, data]) => ({
    date,
    averageTime: data.total / data.count,
  }));

  return {
    averageResolutionTime,
    medianResolutionTime,
    resolutionTimeByPriority,
    resolutionTrend,
  };
};

export const getPriorityDistribution = async (userId: string, days: number = 30): Promise<PriorityDistribution> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('priority')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString());

  if (error) {
    console.error('Error fetching priority distribution:', error);
    throw error;
  }

  const distribution = { urgent: 0, high: 0, medium: 0, low: 0 };

  tickets?.forEach(ticket => {
    const priority = ticket.priority as keyof PriorityDistribution;
    if (priority in distribution) {
      distribution[priority]++;
    }
  });

  return distribution;
};

export const getSatisfactionMetrics = async (userId: string, days: number = 30): Promise<SatisfactionMetrics> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: ratings, error } = await supabase
    .from('ticket_satisfaction')
    .select(`
      rating,
      feedback,
      created_at,
      tickets (
        ticket_number
      )
    `)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching satisfaction metrics:', error);
    throw error;
  }

  if (!ratings || ratings.length === 0) {
    return {
      averageRating: 0,
      totalRatings: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      recentFeedback: [],
    };
  }

  const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
  const averageRating = totalRating / ratings.length;

  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach(rating => {
    const key = rating.rating as keyof typeof ratingDistribution;
    if (key in ratingDistribution) {
      ratingDistribution[key]++;
    }
  });

  const recentFeedback = ratings
    .filter(rating => rating.feedback && rating.feedback.trim() !== '')
    .slice(0, 10)
    .map(rating => ({
      rating: rating.rating,
      feedback: rating.feedback || '',
      ticketNumber: (rating.tickets as any)?.ticket_number || 'Unknown',
      createdAt: rating.created_at,
    }));

  return {
    averageRating,
    totalRatings: ratings.length,
    ratingDistribution,
    recentFeedback,
  };
};

export const submitSatisfactionRating = async (
  ticketId: string,
  customerId: string,
  rating: number,
  feedback?: string
) => {
  const { data, error } = await supabase
    .from('ticket_satisfaction')
    .insert({
      ticket_id: ticketId,
      customer_id: customerId,
      rating,
      feedback: feedback || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error submitting satisfaction rating:', error);
    throw error;
  }

  return data;
};

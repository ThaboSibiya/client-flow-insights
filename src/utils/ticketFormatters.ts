/**
 * Shared utility functions for ticket formatting
 * Eliminates duplication across TicketCard, TicketsTab, OnSiteTicketManager, etc.
 */

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'urgent': return 'bg-destructive/10 text-destructive border-destructive/30';
    case 'high': return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30';
    case 'medium': return 'bg-primary/10 text-primary border-primary/30';
    case 'low': return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'open': return 'bg-primary/10 text-primary border-primary/30';
    case 'in-progress': return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30';
    case 'resolved': return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
    case 'closed': return 'bg-muted text-muted-foreground border-border';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

export const formatTicketDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
};

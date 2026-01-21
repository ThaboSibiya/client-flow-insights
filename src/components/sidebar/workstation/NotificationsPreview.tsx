import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ExternalLink, Clock, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import type { RealtimeNotification } from '@/hooks/useRealtimeNotifications';

interface NotificationsPreviewProps {
  notifications: RealtimeNotification[];
  onMarkAsRead: (id: string) => void;
  onItemClick?: () => void;
}

const NotificationsPreview = ({ notifications, onMarkAsRead, onItemClick }: NotificationsPreviewProps) => {
  const handleMarkAsRead = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    onMarkAsRead(id);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase">Recent Notifications</span>
        <Link to="/notifications" className="text-xs text-primary hover:underline flex items-center gap-1" onClick={onItemClick}>
          View all <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
      {notifications.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No notifications</p>
      ) : (
        notifications.map((n) => (
          <div key={n.id} className={cn(
            "p-2 rounded-md border text-xs group relative",
            !n.read && "bg-primary/5 border-primary/20"
          )}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{n.title}</p>
                <p className="text-muted-foreground truncate">{n.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </p>
              </div>
              {!n.read && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={(e) => handleMarkAsRead(e, n.id)}
                  title="Mark as read"
                >
                  <Check className="h-3 w-3 text-green-600" />
                </Button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default NotificationsPreview;

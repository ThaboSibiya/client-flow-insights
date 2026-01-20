import React from 'react';
import { Bell, FolderKanban, Clock, AtSign, Info, Check, X, Users, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRealtimeNotifications, RealtimeNotification } from '@/hooks/useRealtimeNotifications';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, clearNotification } = useRealtimeNotifications();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const getNotificationIcon = (type: RealtimeNotification['type']) => {
    switch (type) {
      case 'project_assignment':
        return <FolderKanban className="h-4 w-4 text-quikle-primary" />;
      case 'task_due':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'mention':
        return <AtSign className="h-4 w-4 text-quikle-secondary" />;
      case 'customer':
        return <Users className="h-4 w-4 text-emerald-500" />;
      case 'ticket':
        return <Ticket className="h-4 w-4 text-orange-500" />;
      case 'system':
      default:
        return <Info className="h-4 w-4 text-quikle-slate" />;
    }
  };

  const handleNotificationClick = async (notification: RealtimeNotification) => {
    await markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-9 w-9 rounded-full hover:bg-quikle-crystal/50 transition-colors"
          data-tour="notification-bell"
        >
          <Bell className="h-5 w-5 text-quikle-slate" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1.5 text-[10px] font-bold bg-gradient-to-r from-quikle-primary to-quikle-secondary text-white border-2 border-white shadow-md animate-pulse"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 border-quikle-silver/30 shadow-luxury" 
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-quikle-silver/20 bg-gradient-to-r from-quikle-crystal/30 to-transparent">
          <h3 className="font-semibold text-quikle-charcoal">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs text-quikle-primary hover:text-quikle-primary/80 h-7 px-2"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-10 w-10 text-quikle-silver mb-2" />
              <p className="text-sm text-quikle-slate">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-quikle-silver/10">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-quikle-crystal/30",
                    !notification.read && "bg-quikle-primary/5"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "text-sm truncate",
                        !notification.read ? "font-semibold text-quikle-charcoal" : "font-medium text-quikle-slate"
                      )}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-quikle-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-quikle-slate/80 line-clamp-2 mt-0.5">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-quikle-silver mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100 hover:bg-quikle-crystal"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(notification.id);
                    }}
                  >
                    <X className="h-3 w-3 text-quikle-slate" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="px-4 py-2 border-t border-quikle-silver/20 bg-quikle-crystal/20">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs text-quikle-primary hover:text-quikle-primary/80"
              onClick={() => {
                setOpen(false);
                navigate('/dashboard');
              }}
            >
              View all activity
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;

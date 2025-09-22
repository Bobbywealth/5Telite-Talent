import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { useLocation } from "wouter";

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className = "" }: NotificationBellProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ["/api/notifications-new"],
    queryFn: async () => {
      const response = await fetch("/api/notifications-new", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch notifications");
      return response.json();
    },
    enabled: !!user,
    retry: false,
  });

  // Fetch unread count
  const { data: unreadData } = useQuery({
    queryKey: ["/api/notifications/unread-count"],
    queryFn: async () => {
      const response = await fetch("/api/notifications/unread-count", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch unread count");
      return response.json();
    },
    enabled: !!user,
    retry: false,
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to mark as read");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const notifications = notificationsData?.notifications || [];
  const unreadCount = unreadData?.count || 0;

  const handleNotificationClick = (notification: any) => {
    // Mark as read if not already read
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
    
    // Navigate to action URL if provided
    if (notification.actionUrl) {
      setLocation(notification.actionUrl);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`relative p-3 hover:bg-slate-100 rounded-full transition-all duration-200 ${className}`} 
          data-testid="button-notifications"
        >
          <div className="relative">
            {/* Modern bell icon with better visibility */}
            <svg 
              className="w-6 h-6 text-slate-600 hover:text-slate-800 transition-colors" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
              />
            </svg>
            
            {/* Unread count badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-pulse">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
            
            {/* Pulse animation for new notifications */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full animate-ping"></span>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80 max-h-96 overflow-y-auto bg-white border border-slate-200 shadow-lg z-50"
        sideOffset={8}
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount}
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="w-2 h-2 rounded-full mt-2" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notification: any, index: number) => (
            <DropdownMenuItem 
              key={notification.id} 
              className={`flex items-start space-x-3 p-4 cursor-pointer hover:bg-slate-50 ${!notification.read ? 'bg-blue-50' : ''}`}
              onClick={() => handleNotificationClick(notification)}
              data-testid={`notification-item-${index}`}
            >
              <div className={`w-2 h-2 rounded-full mt-2 ${getNotificationColor(notification.type)}`}></div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${!notification.read ? 'text-slate-900' : 'text-slate-600'}`}>
                  {notification.title}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {notification.message}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </DropdownMenuItem>
          ))
        ) : (
          <div className="p-8 text-center">
            <i className="fas fa-check-circle text-green-500 text-2xl mb-2"></i>
            <p className="text-sm text-slate-500">All caught up!</p>
            <p className="text-xs text-slate-400">No new notifications</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getNotificationColor(type: string): string {
  switch (type) {
    case 'booking_request':
      return 'bg-blue-500';
    case 'booking_accepted':
      return 'bg-green-500';
    case 'booking_declined':
      return 'bg-red-500';
    case 'contract_created':
      return 'bg-purple-500';
    case 'contract_signed':
      return 'bg-green-600';
    case 'task_assigned':
      return 'bg-orange-500';
    case 'talent_approved':
      return 'bg-emerald-500';
    case 'system_announcement':
      return 'bg-slate-500';
    default:
      return 'bg-slate-400';
  }
}
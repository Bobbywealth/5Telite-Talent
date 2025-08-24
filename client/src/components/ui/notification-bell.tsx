import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className = "" }: NotificationBellProps) {
  const { user } = useAuth();

  // Fetch notifications based on user role
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["/api/notifications", user?.role],
    queryFn: async () => {
      const response = await fetch("/api/notifications", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch notifications");
      return response.json();
    },
    enabled: !!user,
    retry: false,
  });

  const totalCount = notifications?.total || 0;
  const items = notifications?.items || [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={`relative p-2 ${className}`} data-testid="button-notifications">
          <i className="fas fa-bell text-slate-400 text-lg"></i>
          {totalCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalCount > 99 ? "99+" : totalCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {totalCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {totalCount}
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
        ) : items.length > 0 ? (
          items.map((item: any, index: number) => (
            <DropdownMenuItem 
              key={index} 
              className="flex items-start space-x-3 p-4 cursor-pointer hover:bg-slate-50"
              data-testid={`notification-item-${index}`}
            >
              <div className={`w-2 h-2 rounded-full mt-2 ${getNotificationColor(item.type)}`}></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {item.title}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {item.description}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </p>
              </div>
              {item.badge && (
                <Badge variant="outline" className="text-xs">
                  {item.badge}
                </Badge>
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
    case 'approval':
      return 'bg-orange-500';
    case 'booking':
      return 'bg-blue-500';
    case 'task':
      return 'bg-purple-500';
    case 'message':
      return 'bg-green-500';
    case 'payment':
      return 'bg-yellow-500';
    case 'urgent':
      return 'bg-red-500';
    default:
      return 'bg-slate-400';
  }
}
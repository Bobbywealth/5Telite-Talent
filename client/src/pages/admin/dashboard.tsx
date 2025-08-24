import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import AdminSidebar from "@/components/layout/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();

  // Authentication is handled by the Router component

  // Fetch dashboard stats
  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/bookings"],
    queryFn: async () => {
      const response = await fetch("/api/bookings?limit=5", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch bookings");
      return response.json();
    },
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  const { data: talentsData, isLoading: talentsLoading } = useQuery({
    queryKey: ["/api/talents"],
    queryFn: async () => {
      const response = await fetch("/api/talents?limit=5", {
        credentials: "include", 
      });
      if (!response.ok) throw new Error("Failed to fetch talents");
      return response.json();
    },
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/tasks"],
    queryFn: async () => {
      const response = await fetch("/api/tasks?limit=5", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch tasks");
      return response.json();
    },
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'paid':
      case 'completed':
      case 'approved':
        return 'default';
      case 'pending':
      case 'inquiry':
        return 'secondary';
      case 'cancelled':
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <i className="fas fa-bell text-slate-400 text-lg"></i>
                {(tasksData?.tasks?.filter((task: any) => task.status === 'todo').length > 0) && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {tasksData.tasks.filter((task: any) => task.status === 'todo').length}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-900" data-testid="text-admin-user">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Active Talents</p>
                    <p className="text-3xl font-bold text-slate-900" data-testid="text-active-talents">
                      {talentsLoading ? <Skeleton className="h-8 w-16" /> : talentsData?.total || 0}
                    </p>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-3">
                    <i className="fas fa-users text-primary text-xl"></i>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600">+12% </span>
                  <span className="text-slate-600">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Active Bookings</p>
                    <p className="text-3xl font-bold text-slate-900" data-testid="text-active-bookings">
                      {bookingsLoading ? <Skeleton className="h-8 w-16" /> : bookingsData?.total || 0}
                    </p>
                  </div>
                  <div className="bg-secondary/10 rounded-lg p-3">
                    <i className="fas fa-calendar text-secondary text-xl"></i>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600">+8% </span>
                  <span className="text-slate-600">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Monthly Revenue</p>
                    <p className="text-3xl font-bold text-slate-900" data-testid="text-revenue">
                      $45,620
                    </p>
                  </div>
                  <div className="bg-green-100 rounded-lg p-3">
                    <i className="fas fa-dollar-sign text-green-600 text-xl"></i>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600">+23% </span>
                  <span className="text-slate-600">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Pending Tasks</p>
                    <p className="text-3xl font-bold text-slate-900" data-testid="text-pending-tasks">
                      {tasksLoading ? <Skeleton className="h-8 w-16" /> : 
                       tasksData?.tasks?.filter((task: any) => task.status === 'todo').length || 0}
                    </p>
                  </div>
                  <div className="bg-orange-100 rounded-lg p-3">
                    <i className="fas fa-tasks text-orange-600 text-xl"></i>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-red-600">+2 </span>
                  <span className="text-slate-600">new this week</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity and Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Bookings */}
            <Card>
              <CardHeader className="border-b border-slate-200">
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {bookingsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-lg">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2 mb-1" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    ))}
                  </div>
                ) : bookingsData?.bookings?.length > 0 ? (
                  <div className="space-y-4">
                    {bookingsData.bookings.slice(0, 3).map((booking: any) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg" data-testid={`booking-${booking.id}`}>
                        <div>
                          <p className="font-medium text-slate-900">{booking.title}</p>
                          <p className="text-sm text-slate-600">{booking.client?.firstName} {booking.client?.lastName}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={getStatusBadgeVariant(booking.status)}>
                            {booking.status}
                          </Badge>
                          {booking.rate && (
                            <p className="text-sm font-medium text-slate-900 mt-1">${booking.rate}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">No recent bookings</p>
                )}
              </CardContent>
            </Card>

            {/* Pending Tasks */}
            <Card>
              <CardHeader className="border-b border-slate-200">
                <CardTitle>Pending Tasks</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {tasksLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-start space-x-3">
                        <Skeleton className="w-2 h-2 rounded-full mt-2" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-3/4 mb-1" />
                          <Skeleton className="h-3 w-1/2 mb-1" />
                          <Skeleton className="h-3 w-1/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : tasksData?.tasks?.filter((task: any) => task.status === 'todo').length > 0 ? (
                  <div className="space-y-4">
                    {tasksData.tasks
                      .filter((task: any) => task.status === 'todo')
                      .slice(0, 4)
                      .map((task: any) => (
                        <div key={task.id} className="flex items-start space-x-3" data-testid={`task-${task.id}`}>
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{task.title}</p>
                            {task.assignee && (
                              <p className="text-sm text-slate-600">
                                Assigned to: {task.assignee.firstName} {task.assignee.lastName}
                              </p>
                            )}
                            {task.dueAt && (
                              <p className="text-xs text-slate-500">
                                Due: {new Date(task.dueAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">No pending tasks</p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

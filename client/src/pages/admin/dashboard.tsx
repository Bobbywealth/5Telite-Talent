import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import AdminSidebar from "@/components/layout/admin-sidebar";
import AdminCalendar from "@/components/admin/admin-calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationBell } from "@/components/ui/notification-bell";

export default function AdminDashboard() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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

  // Fetch pending talents for approval
  const { data: pendingTalentsData, isLoading: pendingTalentsLoading } = useQuery({
    queryKey: ["/api/talents", { approvalStatus: "pending" }],
    queryFn: async () => {
      const response = await fetch("/api/talents?approvalStatus=pending&limit=10", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch pending talents");
      return response.json();
    },
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  // Fetch booking requests needing attention
  const { data: pendingRequestsData, isLoading: pendingRequestsLoading } = useQuery({
    queryKey: ["/api/booking-requests", { status: "pending" }],
    queryFn: async () => {
      const response = await fetch("/api/booking-requests?status=pending&limit=5", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch booking requests");
      return response.json();
    },
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  // Quick talent approval mutation
  const quickApproveTalentMutation = useMutation({
    mutationFn: async ({ talentId, status }: { talentId: string; status: "approved" | "rejected" }) => {
      return apiRequest("PATCH", `/api/admin/talents/${talentId}/approve`, { status });
    },
    onSuccess: (_, variables) => {
      // Invalidate all talent-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/talents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/talents", { approvalStatus: "pending" }] });
      toast({
        title: "Success",
        description: `Talent ${variables.status} successfully!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      window.location.href = '/api/login';
      return null;
    }
    
    // Show unauthorized message if wrong role
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Access Denied</h1>
          <p className="text-slate-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
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
      <AdminSidebar 
        isMobileOpen={isMobileSidebarOpen} 
        onMobileToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />
      
      <div className="flex-1">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white shadow-sm border-b border-slate-200 px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsMobileSidebarOpen(true)}
                className="p-2"
                data-testid="button-mobile-sidebar-toggle"
              >
                <i className="fas fa-bars text-lg"></i>
              </Button>
              <img 
                src="/attached_assets/5t-logo.png" 
                alt="5T Talent Platform" 
                className="h-8 w-auto"
              />
              <h1 className="text-lg font-bold text-slate-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2">
              <NotificationBell />
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:block bg-white shadow-sm border-b border-slate-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img 
                src="/attached_assets/5t-logo.png" 
                alt="5T Talent Platform" 
                className="h-12 w-auto"
              />
              <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
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
                    {talentsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-3xl font-bold text-slate-900" data-testid="text-active-talents">
                        {talentsData?.total || 0}
                      </p>
                    )}
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
                    {bookingsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-3xl font-bold text-slate-900" data-testid="text-active-bookings">
                        {bookingsData?.total || 0}
                      </p>
                    )}
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
                    <p className="text-sm font-medium text-slate-600">Pending Approvals</p>
                    {pendingTalentsLoading ? (
                      <div className="py-1">
                        <Skeleton className="h-8 w-16" />
                      </div>
                    ) : (
                      <p className="text-3xl font-bold text-slate-900" data-testid="text-pending-approvals">
                        {pendingTalentsData?.talents?.length || 0}
                      </p>
                    )}
                  </div>
                  <div className="bg-orange-100 rounded-lg p-3">
                    <i className="fas fa-user-clock text-orange-600 text-xl"></i>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  {(pendingTalentsData?.talents?.length || 0) > 0 ? (
                    <>
                      <span className="text-orange-600">Action needed </span>
                      <span className="text-slate-600">for {pendingTalentsData?.talents?.length} talents</span>
                    </>
                  ) : (
                    <>
                      <span className="text-green-600">All caught up </span>
                      <span className="text-slate-600">no pending approvals</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendar Section */}
          <AdminCalendar className="mb-8" />

          {/* Pending Approvals Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Pending Approvals</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Talent Approvals */}
              <Card>
                <CardHeader className="border-b border-slate-200">
                  <CardTitle className="flex items-center justify-between">
                    <span>Talent Approvals</span>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      {pendingTalentsLoading ? "..." : (pendingTalentsData?.talents?.length || 0)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {pendingTalentsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex-1">
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                          <div className="flex space-x-2">
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-8 w-16" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : pendingTalentsData?.talents?.length > 0 ? (
                    <div className="space-y-4">
                      {pendingTalentsData.talents.slice(0, 4).map((talent: any) => (
                        <div key={talent.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">
                              {talent.user.firstName} {talent.user.lastName}
                            </p>
                            <p className="text-sm text-slate-600">{talent.user.email}</p>
                            {talent.categories?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {talent.categories.slice(0, 2).map((category: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {category}
                                  </Badge>
                                ))}
                                {talent.categories.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{talent.categories.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => quickApproveTalentMutation.mutate({ 
                                talentId: talent.userId, 
                                status: 'rejected' 
                              })}
                              disabled={quickApproveTalentMutation.isPending}
                              data-testid={`button-quick-reject-${talent.id}`}
                            >
                              <i className="fas fa-times mr-1"></i>Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => quickApproveTalentMutation.mutate({ 
                                talentId: talent.userId, 
                                status: 'approved' 
                              })}
                              disabled={quickApproveTalentMutation.isPending}
                              data-testid={`button-quick-approve-${talent.id}`}
                            >
                              <i className="fas fa-check mr-1"></i>Approve
                            </Button>
                          </div>
                        </div>
                      ))}
                      {pendingTalentsData.talents.length > 4 && (
                        <div className="text-center pt-2">
                          <Button variant="outline" size="sm">
                            View All ({pendingTalentsData.talents.length - 4} more)
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <i className="fas fa-check-circle text-green-500 text-3xl mb-2"></i>
                      <p className="text-slate-500">No pending talent approvals</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Booking Requests Needing Attention */}
              <Card>
                <CardHeader className="border-b border-slate-200">
                  <CardTitle className="flex items-center justify-between">
                    <span>Booking Requests</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {pendingRequestsLoading ? "..." : (pendingRequestsData?.requests?.length || 0)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {pendingRequestsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-lg">
                          <Skeleton className="h-4 w-48 mb-2" />
                          <Skeleton className="h-3 w-32 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : pendingRequestsData?.requests?.length > 0 ? (
                    <div className="space-y-4">
                      {pendingRequestsData.requests.slice(0, 4).map((request: any) => (
                        <div key={request.id} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">
                                {request.booking.title}
                              </p>
                              <p className="text-sm text-slate-600">
                                To: {request.talent.user.firstName} {request.talent.user.lastName}
                              </p>
                              <p className="text-xs text-slate-500">
                                {new Date(request.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge 
                              variant={request.status === 'pending' ? 'secondary' : 
                                     request.status === 'accepted' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {request.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {pendingRequestsData.requests.length > 4 && (
                        <div className="text-center pt-2">
                          <Button variant="outline" size="sm">
                            View All ({pendingRequestsData.requests.length - 4} more)
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <i className="fas fa-inbox text-slate-400 text-3xl mb-2"></i>
                      <p className="text-slate-500">No pending booking requests</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
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

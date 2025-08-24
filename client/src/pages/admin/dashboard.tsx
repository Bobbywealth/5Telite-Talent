import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
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
import { Users, Calendar, DollarSign, CheckCircle, ClipboardList, Star, Menu, X, Check, Inbox, Clock } from "lucide-react";

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
        <header className="xl:hidden bg-white shadow-sm border-b border-slate-200 px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsMobileSidebarOpen(true)}
                className="p-2"
                data-testid="button-mobile-sidebar-toggle"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-bold text-slate-900">Admin Dashboard</h1>
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
        <header className="hidden xl:block bg-white shadow-sm border-b border-slate-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
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
        <main className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
          {/* Hero Section */}
          <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl p-8 mb-8 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {user?.firstName}!</h1>
                  <p className="text-indigo-100 text-lg">Manage talents, bookings, and platform operations</p>
                </div>
                <div className="hidden md:flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <span className="text-white text-sm font-medium">Admin Account</span>
                  </div>
                  <div className="bg-green-500/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <span className="text-green-100 text-sm font-medium flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Active
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/admin/talents">
                  <Button className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Talents
                  </Button>
                </Link>
                <Link href="/admin/bookings">
                  <Button className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105">
                    <Calendar className="w-4 h-4 mr-2" />
                    View Bookings
                  </Button>
                </Link>
                <Link href="/admin/tasks">
                  <Button className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105">
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Task Manager
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 mb-1">Active Talents</p>
                    {talentsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-3xl font-bold text-blue-900 mb-2" data-testid="text-active-talents">
                        {talentsData?.total || 0}
                      </p>
                    )}
                    <div className="w-full bg-blue-200 rounded-full h-2 mb-3">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500" style={{width: '75%'}}></div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-3 shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-green-600 font-semibold">+12%</span>
                    <span className="text-slate-600 ml-1">vs last month</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700 mb-1">Active Bookings</p>
                    {bookingsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-3xl font-bold text-purple-900 mb-2" data-testid="text-active-bookings">
                        {bookingsData?.total || 0}
                      </p>
                    )}
                    <div className="w-full bg-purple-200 rounded-full h-2 mb-3">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-500" style={{width: '60%'}}></div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-3 shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-green-600 font-semibold">+8%</span>
                    <span className="text-slate-600 ml-1">vs last month</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-purple-50 border-purple-200 text-purple-700">
                    Growing
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-teal-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-700 mb-1">Monthly Revenue</p>
                    <p className="text-3xl font-bold text-emerald-900 mb-2" data-testid="text-revenue">
                      $45,620
                    </p>
                    <div className="w-full bg-emerald-200 rounded-full h-2 mb-3">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-500" style={{width: '85%'}}></div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-3 shadow-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-green-600 font-semibold">+23%</span>
                    <span className="text-slate-600 ml-1">vs last month</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-emerald-50 border-emerald-200 text-emerald-700">
                    Excellent
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-orange-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700 mb-1">Pending Approvals</p>
                    {pendingTalentsLoading ? (
                      <div className="py-1">
                        <Skeleton className="h-8 w-16" />
                      </div>
                    ) : (
                      <p className="text-3xl font-bold text-amber-900 mb-2" data-testid="text-pending-approvals">
                        {pendingTalentsData?.talents?.length || 0}
                      </p>
                    )}
                    <div className="w-full bg-amber-200 rounded-full h-2 mb-3">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-orange-600 h-2 rounded-full transition-all duration-500" 
                        style={{width: (pendingTalentsData?.talents?.length || 0) > 0 ? '40%' : '100%'}}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-3 shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    {(pendingTalentsData?.talents?.length || 0) > 0 ? (
                      <>
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                        <span className="text-orange-600 font-semibold">Action needed</span>
                        <span className="text-slate-600 ml-1">for {pendingTalentsData?.talents?.length}</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-green-600 font-semibold">All caught up</span>
                        <span className="text-slate-600 ml-1">no pending</span>
                      </>
                    )}
                  </div>
                  <Badge variant="outline" className={`text-xs ${(pendingTalentsData?.talents?.length || 0) > 0 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                    {(pendingTalentsData?.talents?.length || 0) > 0 ? 'Urgent' : 'Clear'}
                  </Badge>
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
                              <X className="w-4 h-4 mr-1" />Reject
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
                              <Check className="w-4 h-4 mr-1" />Approve
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
                      <CheckCircle className="w-12 h-12 text-green-500 mb-2" />
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
                      <Inbox className="w-12 h-12 text-slate-400 mb-2" />
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

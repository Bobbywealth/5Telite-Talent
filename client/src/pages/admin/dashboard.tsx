import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import AdminCalendar from "@/components/admin/admin-calendar";
import AdminNavbar from "@/components/layout/admin-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationBell } from "@/components/ui/notification-bell";
import { Users, Calendar, DollarSign, CheckCircle, ClipboardList, Star, Menu, X, Check, Inbox, Clock, BookOpen, Megaphone, Shield, BarChart3, Bell } from "lucide-react";

export default function AdminDashboard() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Authentication is handled by the Router component

  // Fetch dashboard stats
  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/bookings?limit=5"],
    queryFn: getQueryFn(),
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  const { data: talentsData, isLoading: talentsLoading } = useQuery({
    queryKey: ["/api/talents?limit=5"],
    queryFn: getQueryFn(),
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/tasks?limit=5"],
    queryFn: getQueryFn(),
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  // Fetch pending users for approval (same endpoint as approvals page)
  const { data: pendingUsersData, isLoading: pendingUsersLoading } = useQuery({
    queryKey: ["/api/admin/users/pending"],
    queryFn: getQueryFn(),
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  // Fetch booking requests needing attention
  const { data: pendingRequestsData, isLoading: pendingRequestsLoading } = useQuery({
    queryKey: ["/api/booking-requests?status=pending&limit=5"],
    queryFn: getQueryFn(),
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  // Fetch contracts data
  const { data: contractsData, isLoading: contractsLoading } = useQuery({
    queryKey: ["/api/contracts"],
    queryFn: getQueryFn(),
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

  // Setup age verification fields mutation
  const setupAgeVerificationMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/setup-age-verification", {});
    },
    onSuccess: () => {
      toast({
        title: "Age Verification Setup Complete",
        description: "Age verification fields have been added to users table!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to setup age verification: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Setup bookings category column mutation
  const setupBookingsCategoryMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/setup-bookings-category", {});
    },
    onSuccess: () => {
      toast({
        title: "Bookings Setup Complete",
        description: "Category column has been added to bookings table!",
      });
      // Refresh bookings data
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to setup bookings category: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Setup password reset fields mutation
  const setupPasswordResetMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/setup-password-reset", {});
    },
    onSuccess: () => {
      toast({
        title: "Password Reset Setup Complete",
        description: "Password reset fields have been added to the database!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to setup password reset: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Create notifications table mutation
  const createNotificationsTableMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/create-notifications-table", {});
    },
    onSuccess: () => {
      toast({
        title: "Notifications Table Created",
        description: "The notifications table has been created successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to create notifications table: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Test notification mutation
  const testNotificationMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/notifications/test", {});
    },
    onSuccess: () => {
      toast({
        title: "Test Notification Created",
        description: "A test notification has been created. Check the notification bell!",
      });
      // Invalidate notification queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["/api/notifications-new"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to create test notification: " + error.message,
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

  // Calculate total contract amounts
  const calculateContractTotal = () => {
    if (!contractsData || !Array.isArray(contractsData)) return 0;
    
    return contractsData.reduce((total, contract) => {
      // Only count signed contracts
      if (contract.status === 'signed' && contract.booking) {
        return total + (contract.booking.rate || 0);
      }
      return total;
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AdminNavbar />
      <div className="flex flex-col min-h-screen">
        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          {/* Hero Section */}
          <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl p-6 md:p-8 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div className="mb-4 md:mb-0">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Welcome back, {user?.firstName}!</h1>
                  <p className="text-indigo-100 text-base md:text-lg">Manage talents, bookings, and platform operations</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
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
                <Link href="/admin/announcements">
                  <Button className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105">
                    <Megaphone className="w-4 h-4 mr-2" />
                    Manage Announcements
                  </Button>
                </Link>
                <Link href="/admin/training">
                  <Button className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Training Guide
                  </Button>
                </Link>
                <Link href="/admin/approvals">
                  <Button className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105">
                    <Shield className="w-4 h-4 mr-2" />
                    Approvals
                  </Button>
                </Link>
                <Link href="/admin/reports">
                  <Button className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Reports
                  </Button>
                </Link>
                <Button 
                  onClick={() => setupAgeVerificationMutation.mutate()}
                  disabled={setupAgeVerificationMutation.isPending}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {setupAgeVerificationMutation.isPending ? "Setting Up..." : "Setup Age Verification"}
                </Button>
                <Button 
                  onClick={() => setupBookingsCategoryMutation.mutate()}
                  disabled={setupBookingsCategoryMutation.isPending}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  {setupBookingsCategoryMutation.isPending ? "Setting Up..." : "Fix Bookings Table"}
                </Button>
                <Button 
                  onClick={() => setupPasswordResetMutation.mutate()}
                  disabled={setupPasswordResetMutation.isPending}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  {setupPasswordResetMutation.isPending ? "Setting Up..." : "Setup Password Reset"}
                </Button>
                <Button 
                  onClick={() => createNotificationsTableMutation.mutate()}
                  disabled={createNotificationsTableMutation.isPending}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  {createNotificationsTableMutation.isPending ? "Creating Table..." : "Setup Notifications"}
                </Button>
                <Button 
                  onClick={() => testNotificationMutation.mutate()}
                  disabled={testNotificationMutation.isPending}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  {testNotificationMutation.isPending ? "Creating..." : "Test Notification"}
                </Button>
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
                    <p className="text-sm font-medium text-emerald-700 mb-1">Total Contracts</p>
                    <p className="text-3xl font-bold text-emerald-900 mb-2" data-testid="text-contracts">
                      ${calculateContractTotal().toLocaleString()}
                    </p>
                    <div className="w-full bg-emerald-200 rounded-full h-2 mb-3">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-500" style={{width: `${contractsData?.length ? Math.min((contractsData.filter((c: any) => c.status === 'signed').length / contractsData.length) * 100, 100) : 0}%`}}></div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-3 shadow-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-green-600 font-semibold">{contractsData?.filter((c: any) => c.status === 'signed').length || 0}</span>
                    <span className="text-slate-600 ml-1">signed contracts</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-emerald-50 border-emerald-200 text-emerald-700">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-orange-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700 mb-1">Pending Approvals</p>
                    {talentsLoading ? (
                      <div className="py-1">
                        <Skeleton className="h-8 w-16" />
                      </div>
                    ) : (
                      <p className="text-3xl font-bold text-amber-900 mb-2" data-testid="text-pending-approvals">
                        {talentsData?.talents?.filter((t: any) => t.talentProfile?.approvalStatus === 'pending').length || 0}
                      </p>
                    )}
                    <div className="w-full bg-amber-200 rounded-full h-2 mb-3">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-orange-600 h-2 rounded-full transition-all duration-500" 
                        style={{width: (talentsData?.talents?.filter((t: any) => t.talentProfile?.approvalStatus === 'pending').length || 0) > 0 ? '40%' : '100%'}}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-3 shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    {(talentsData?.talents?.filter((t: any) => t.talentProfile?.approvalStatus === 'pending').length || 0) > 0 ? (
                      <>
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                        <span className="text-orange-600 font-semibold">Action needed</span>
                        <span className="text-slate-600 ml-1">for {talentsData?.talents?.filter((t: any) => t.talentProfile?.approvalStatus === 'pending').length}</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-green-600 font-semibold">All caught up</span>
                        <span className="text-slate-600 ml-1">no pending</span>
                      </>
                    )}
                  </div>
                  <Badge variant="outline" className={`text-xs ${(talentsData?.talents?.filter((t: any) => t.talentProfile?.approvalStatus === 'pending').length || 0) > 0 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                    {(talentsData?.talents?.filter((t: any) => t.talentProfile?.approvalStatus === 'pending').length || 0) > 0 ? 'Urgent' : 'Clear'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendar Section */}
          <AdminCalendar className="mb-8" />

          {/* Quick Announcements Overview */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Active Announcements</h2>
              <Link href="/admin/announcements">
                <Button variant="outline" size="sm">
                  <Megaphone className="w-4 h-4 mr-2" />
                  Manage All
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-white border-purple-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-purple-100 text-purple-800 border border-purple-200">Open Calls</Badge>
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Casting Calls</h3>
                  <p className="text-sm text-gray-700">Manage open casting calls and auditions</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-blue-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-blue-100 text-blue-800 border border-blue-200">Events</Badge>
                    <Star className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Industry Events</h3>
                  <p className="text-sm text-gray-700">Networking galas, workshops, and showcases</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-green-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-green-100 text-green-800 border border-green-200">Featured</Badge>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Highlighted Posts</h3>
                  <p className="text-sm text-gray-700">Premium opportunities and special events</p>
                </CardContent>
              </Card>
            </div>
          </div>

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
                      {pendingUsersLoading ? "..." : (pendingUsersData?.users?.length || 0)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {pendingUsersLoading ? (
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
                  ) : pendingUsersData?.users?.length > 0 ? (
                    <div className="space-y-4">
                      {pendingUsersData.users.slice(0, 4).map((user: any) => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-slate-600">{user.email}</p>
                            <p className="text-xs text-slate-500">Role: {user.role}</p>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Link href="/admin/approvals">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                Review
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                      {pendingUsersData.users.length > 4 && (
                        <div className="text-center pt-2">
                          <Button variant="outline" size="sm">
                            View All ({pendingUsersData.users.length - 4} more)
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
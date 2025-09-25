import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { getQueryFn } from "@/lib/queryClient";
import AdminSidebar from "@/components/layout/admin-sidebar";
import AdminNavbar from "@/components/layout/admin-navbar";
import AdminCalendar from "@/components/admin/admin-calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Calendar, CheckCircle, ClipboardList, Star, BookOpen, Megaphone } from "lucide-react";

export default function AdminDashboardSimple() {
  const { isAuthenticated, user } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Simple stats query - just get basic counts
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/dashboard-stats"],
    queryFn: getQueryFn(),
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  // Pending users query
  const { data: pendingUsersData, isLoading: pendingUsersLoading } = useQuery({
    queryKey: ["/api/admin/users/pending"],
    queryFn: getQueryFn(),
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  // Recent bookings query
  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/bookings?limit=5"],
    queryFn: getQueryFn(),
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  // Recent talents query
  const { data: talentsData, isLoading: talentsLoading } = useQuery({
    queryKey: ["/api/talents?limit=5"],
    queryFn: getQueryFn(),
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  // Recent tasks query
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/tasks?limit=5"],
    queryFn: getQueryFn(),
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  // Announcements query
  const { data: announcementsData, isLoading: announcementsLoading } = useQuery({
    queryKey: ["/api/announcements"],
    queryFn: getQueryFn(),
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AdminSidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />
      
      <div className="lg:pl-64">
        <AdminNavbar onMenuClick={() => setIsMobileSidebarOpen(true)} />
        
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          {/* Hero Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-base md:text-lg text-slate-600 mb-6">
              Here's what's happening with your talent platform today.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Link href="/admin/announcements">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Megaphone className="w-4 h-4 mr-2" />
                  Manage Announcements
                </Button>
              </Link>
              <Link href="/admin/training">
                <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Training Guide
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Talents */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Talents</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? <Skeleton className="h-8 w-16" /> : (statsData?.totalTalents || 0)}
                </div>
              </CardContent>
            </Card>

            {/* Active Bookings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? <Skeleton className="h-8 w-16" /> : (statsData?.activeBookings || 0)}
                </div>
              </CardContent>
            </Card>

            {/* Total Contracts */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? <Skeleton className="h-8 w-16" /> : (statsData?.totalContracts || 0)}
                </div>
              </CardContent>
            </Card>

            {/* Pending Tasks */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? <Skeleton className="h-8 w-16" /> : (statsData?.pendingTasks || 0)}
                </div>
              </CardContent>
            </Card>
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
                          <Skeleton className="h-8 w-16" />
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
            </div>
          </div>

          {/* Calendar Section */}
          <AdminCalendar className="mb-8" />

          {/* Quick Announcements Overview */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Announcements Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <Star className="w-5 h-5 mr-2 text-yellow-500" />
                    Open Calls
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {announcementsLoading ? <Skeleton className="h-8 w-16" /> : 
                      (announcementsData?.filter((a: any) => a.type === 'casting_call')?.length || 0)}
                  </div>
                  <p className="text-sm text-slate-600 mt-1">Active casting calls</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                    Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {announcementsLoading ? <Skeleton className="h-8 w-16" /> : 
                      (announcementsData?.filter((a: any) => a.type === 'event')?.length || 0)}
                  </div>
                  <p className="text-sm text-slate-600 mt-1">Upcoming events</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <Megaphone className="w-5 h-5 mr-2 text-green-500" />
                    Featured Posts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {announcementsLoading ? <Skeleton className="h-8 w-16" /> : 
                      (announcementsData?.filter((a: any) => a.type === 'featured')?.length || 0)}
                  </div>
                  <p className="text-sm text-slate-600 mt-1">Featured announcements</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Bookings */}
            <Card>
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Bookings</span>
                  <Link href="/admin/bookings">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {bookingsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : bookingsData?.length > 0 ? (
                  <div className="space-y-3">
                    {bookingsData.slice(0, 5).map((booking: any) => (
                      <div key={booking.id} className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {booking.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {booking.clientName} • {booking.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-4">No recent bookings</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Talents */}
            <Card>
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Talents</span>
                  <Link href="/admin/talents">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {talentsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : talentsData?.length > 0 ? (
                  <div className="space-y-3">
                    {talentsData.slice(0, 5).map((talent: any) => (
                      <div key={talent.id} className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {talent.user?.firstName} {talent.user?.lastName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {talent.talentProfile?.categories?.[0] || 'Talent'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-4">No recent talents</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Tasks */}
            <Card>
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Tasks</span>
                  <Link href="/admin/tasks">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {tasksLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : tasksData?.length > 0 ? (
                  <div className="space-y-3">
                    {tasksData.slice(0, 5).map((task: any) => (
                      <div key={task.id} className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-lg">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <ClipboardList className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {task.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {task.priority} • {task.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-4">No recent tasks</p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

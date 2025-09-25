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
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Talents */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 mb-1">Total Talents</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-3xl font-bold text-blue-900 mb-2">
                        {statsData?.totalTalents || 0}
                      </p>
                    )}
                    <div className="w-full bg-blue-200 rounded-full h-2 mb-3">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500" style={{width: '75%'}}></div>
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

            {/* Active Bookings */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700 mb-1">Active Bookings</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-3xl font-bold text-purple-900 mb-2">
                        {statsData?.activeBookings || 0}
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

            {/* Total Contracts */}
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-700 mb-1">Total Contracts</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-3xl font-bold text-emerald-900 mb-2">
                        {statsData?.totalContracts || 0}
                      </p>
                    )}
                    <div className="w-full bg-emerald-200 rounded-full h-2 mb-3">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-500" style={{width: '45%'}}></div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-3 shadow-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-green-600 font-semibold">+15%</span>
                    <span className="text-slate-600 ml-1">vs last month</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-emerald-50 border-emerald-200 text-emerald-700">
                    Signed
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Pending Tasks */}
            <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700 mb-1">Pending Tasks</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-3xl font-bold text-orange-900 mb-2">
                        {statsData?.pendingTasks || 0}
                      </p>
                    )}
                    <div className="w-full bg-orange-200 rounded-full h-2 mb-3">
                      <div className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all duration-500" style={{width: '30%'}}></div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-3 shadow-lg">
                    <ClipboardList className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-red-600 font-semibold">-5%</span>
                    <span className="text-slate-600 ml-1">vs last month</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-orange-50 border-orange-200 text-orange-700">
                    Pending
                  </Badge>
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Quick Announcements Overview</h2>
              <Link href="/admin/announcements">
                <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                  <Megaphone className="w-4 h-4 mr-2" />
                  Manage All
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-yellow-50 to-amber-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl p-3 shadow-lg">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="outline" className="text-xs bg-yellow-50 border-yellow-200 text-yellow-700">
                      Active
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">Open Calls</h3>
                  <div className="text-3xl font-bold text-yellow-900 mb-2">
                    {announcementsLoading ? <Skeleton className="h-8 w-16" /> : 
                      (announcementsData?.filter((a: any) => a.type === 'casting_call')?.length || 0)}
                  </div>
                  <p className="text-sm text-yellow-700">Active casting calls</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-3 shadow-lg">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                      Upcoming
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Events</h3>
                  <div className="text-3xl font-bold text-blue-900 mb-2">
                    {announcementsLoading ? <Skeleton className="h-8 w-16" /> : 
                      (announcementsData?.filter((a: any) => a.type === 'event')?.length || 0)}
                  </div>
                  <p className="text-sm text-blue-700">Upcoming events</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-3 shadow-lg">
                      <Megaphone className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                      Featured
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Featured Posts</h3>
                  <div className="text-3xl font-bold text-green-900 mb-2">
                    {announcementsLoading ? <Skeleton className="h-8 w-16" /> : 
                      (announcementsData?.filter((a: any) => a.type === 'featured')?.length || 0)}
                  </div>
                  <p className="text-sm text-green-700">Featured announcements</p>
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

import { useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/layout/navbar";
import TalentNavbar from "@/components/layout/talent-navbar";
import AdminNavbar from "@/components/layout/admin-navbar";
import ClientNavbar from "@/components/layout/client-navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoleSwitcher } from "@/components/auth/RoleSwitcher";
import logoImage from "@assets/5t-logo.png";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch real data for admin stats
  const { data: talentsData, isLoading: talentsLoading, error: talentsError } = useQuery({
    queryKey: ["/api/talents"],
    queryFn: async () => {
      const response = await fetch("/api/talents", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch talents");
      return response.json();
    },
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/bookings"],
    queryFn: async () => {
      const response = await fetch("/api/bookings", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch bookings");
      return response.json();
    },
    enabled: isAuthenticated && (user?.role === 'admin' || user?.role === 'client'),
    retry: false,
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/tasks"],
    queryFn: async () => {
      const response = await fetch("/api/tasks", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch tasks");
      return response.json();
    },
    enabled: isAuthenticated && (user?.role === 'admin' || user?.role === 'client'),
    retry: false,
  });

  // Complete talent registration after authentication
  const completeRegistrationMutation = useMutation({
    mutationFn: async (registrationData: any) => {
      return apiRequest("POST", "/api/talents/me", registrationData);
    },
    onSuccess: () => {
      localStorage.removeItem('talent_registration_data');
      toast({
        title: "Registration Completed!",
        description: "Your talent profile has been created and is under review.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Check for pending registration data
  useEffect(() => {
    if (user?.role === 'talent') {
      const registrationData = localStorage.getItem('talent_registration_data');
      if (registrationData) {
        try {
          const data = JSON.parse(registrationData);
          completeRegistrationMutation.mutate(data);
        } catch (error) {
          console.error("Error parsing registration data:", error);
          localStorage.removeItem('talent_registration_data');
        }
      }
    }
  }, [user]);

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'talent') return '/dashboard';
    return '/';
  };

  const getRoleDescription = () => {
    if (user?.role === 'admin') return 'Manage talents, bookings, and platform operations';
    if (user?.role === 'talent') return 'Manage your profile, view bookings, and track tasks';
    if (user?.role === 'client') return 'Browse talents and manage your booking requests';
    return 'Welcome to 5T Talent Platform';
  };

  const renderNavbar = () => {
    if (user?.role === 'talent') return <TalentNavbar />;
    if (user?.role === 'admin') return <AdminNavbar />;
    if (user?.role === 'client') return <ClientNavbar />;
    return <Navbar />;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {renderNavbar()}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="bg-gradient-hero-enhanced text-white rounded-2xl p-8 mb-8 relative overflow-hidden">
            {/* Brand-aligned floating elements */}
            <div className="absolute inset-0">
              <div className="floating-shape shape-1"></div>
              <div className="floating-shape shape-2"></div>
            </div>
            <div className="max-w-3xl">
              <h1 className="text-3xl lg:text-5xl font-bold mb-4">
                Welcome back, {user?.firstName || 'User'}!
              </h1>
              <p className="text-xl text-slate-200 mb-6">
                {getRoleDescription()}
              </p>
              {/* 5T Logo for client dashboard */}
              {user?.role === 'client' && (
                <div className="flex items-center mt-6">
                  <img 
                    src={logoImage} 
                    alt="5T Elite Logo" 
                    className="h-16 w-auto opacity-90 hover:opacity-100 transition-opacity duration-200"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <Badge variant={user?.status === 'active' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'} Account
            </Badge>
            <Badge variant={user?.status === 'active' ? 'default' : 'destructive'} className="text-sm px-3 py-1">
              {user?.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Unknown'}
            </Badge>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user?.role === 'admin' && (
            <div className="col-span-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Admin Dashboard Stats - Replace duplicate navigation with useful stats */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-slate-600">Total Talents</CardTitle>
                      <i className="fas fa-users text-primary"></i>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {talentsData?.total ? parseInt(talentsData.total) : 0}
                    </div>
                    <p className="text-xs text-slate-500">Active profiles</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-slate-600">Active Bookings</CardTitle>
                      <i className="fas fa-calendar-check text-secondary"></i>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{bookingsData?.total ? parseInt(bookingsData.total) : 0}</div>
                    <p className="text-xs text-slate-500">This month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-slate-600">Pending Tasks</CardTitle>
                      <i className="fas fa-tasks text-accent"></i>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {tasksData?.tasks?.filter((task: any) => task.status === 'todo').length || 0}
                    </div>
                    <p className="text-xs text-slate-500">Need attention</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-slate-600">Website Views</CardTitle>
                      <i className="fas fa-eye text-green-600"></i>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,247</div>
                    <p className="text-xs text-slate-500">This week</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {user?.role === 'talent' && (
            <div className="col-span-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Quick Stats Cards - No duplicates with navbar */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-slate-600">Active Bookings</CardTitle>
                      <i className="fas fa-calendar-check text-primary"></i>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-slate-500">This month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-slate-600">Pending Tasks</CardTitle>
                      <i className="fas fa-tasks text-secondary"></i>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-slate-500">Need attention</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-slate-600">Profile Views</CardTitle>
                      <i className="fas fa-eye text-green-600"></i>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">--</div>
                    <p className="text-xs text-slate-500">This week</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-slate-600">Account Status</CardTitle>
                      <i className="fas fa-check-circle text-green-600"></i>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold text-green-600">Active</div>
                    <p className="text-xs text-slate-500">Ready for bookings</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Enhanced Client Dashboard */}
          {user?.role === 'client' && (
            <div className="col-span-full">
              {/* Client Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Total Bookings</p>
                        <p className="text-3xl font-bold text-slate-900" data-testid="text-total-bookings">
                          {bookingsLoading ? "..." : bookingsData?.total || 0}
                        </p>
                      </div>
                      <div className="bg-blue-100 rounded-lg p-3">
                        <i className="fas fa-calendar text-blue-600 text-xl"></i>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                      <span className="text-blue-600">
                        {bookingsData?.bookings?.filter((b: any) => b.status === 'pending').length || 0} pending
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Active Projects</p>
                        <p className="text-3xl font-bold text-slate-900" data-testid="text-active-projects">
                          {bookingsLoading ? "..." : bookingsData?.bookings?.filter((b: any) => ['confirmed', 'in_progress'].includes(b.status)).length || 0}
                        </p>
                      </div>
                      <div className="bg-green-100 rounded-lg p-3">
                        <i className="fas fa-project-diagram text-green-600 text-xl"></i>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                      <span className="text-green-600">Currently running</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Total Spent</p>
                        <p className="text-3xl font-bold text-slate-900" data-testid="text-total-spent">
                          ${bookingsLoading ? "..." : bookingsData?.bookings?.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0).toLocaleString() || 0}
                        </p>
                      </div>
                      <div className="bg-purple-100 rounded-lg p-3">
                        <i className="fas fa-dollar-sign text-purple-600 text-xl"></i>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                      <span className="text-purple-600">All time</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Completed</p>
                        <p className="text-3xl font-bold text-slate-900" data-testid="text-completed-bookings">
                          {bookingsLoading ? "..." : bookingsData?.bookings?.filter((b: any) => b.status === 'completed').length || 0}
                        </p>
                      </div>
                      <div className="bg-orange-100 rounded-lg p-3">
                        <i className="fas fa-check-circle text-orange-600 text-xl"></i>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                      <span className="text-orange-600">Successfully finished</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Bookings */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader className="border-b border-slate-200">
                      <CardTitle className="flex items-center justify-between">
                        Recent Booking Requests
                        <Badge variant="outline" data-testid="badge-recent-bookings">
                          {bookingsData?.bookings?.length || 0}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      {bookingsLoading ? (
                        <div className="space-y-4">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="p-4 bg-slate-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse"></div>
                                <div className="h-6 bg-slate-200 rounded w-20 animate-pulse"></div>
                              </div>
                              <div className="h-3 bg-slate-200 rounded w-1/2 animate-pulse mb-1"></div>
                              <div className="h-3 bg-slate-200 rounded w-1/4 animate-pulse"></div>
                            </div>
                          ))}
                        </div>
                      ) : bookingsData?.bookings?.length > 0 ? (
                        <div className="space-y-4">
                          {bookingsData.bookings.slice(0, 5).map((booking: any) => (
                            <div key={booking.id} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors" data-testid={`booking-${booking.id}`}>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-slate-900">{booking.title}</h4>
                                <Badge variant={booking.status === 'completed' ? 'default' : booking.status === 'pending' ? 'secondary' : booking.status === 'cancelled' ? 'destructive' : 'outline'}>
                                  {booking.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-600 mb-1">
                                Category: {booking.category}
                              </p>
                              <p className="text-xs text-slate-500 mb-2">
                                {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                              </p>
                              {booking.location && (
                                <p className="text-xs text-slate-500 mb-2">
                                  <i className="fas fa-map-marker-alt mr-1"></i>
                                  {booking.location}
                                </p>
                              )}
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-700">
                                  Budget: ${booking.totalAmount?.toLocaleString() || 'TBD'}
                                </span>
                                <span className="text-xs text-slate-400">
                                  Created {new Date(booking.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))}
                          {bookingsData.total > 5 && (
                            <div className="text-center pt-4 border-t border-slate-200">
                              <p className="text-sm text-slate-500 mb-3">
                                Showing 5 of {bookingsData.total} booking requests
                              </p>
                              <Button variant="outline" size="sm">
                                View All Bookings
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <i className="fas fa-calendar-plus text-slate-300 text-4xl mb-4"></i>
                          <h3 className="text-lg font-medium text-slate-900 mb-2">No booking requests yet</h3>
                          <p className="text-slate-500 mb-4">
                            Start by browsing our talent directory and submitting your first booking request.
                          </p>
                          <Button asChild>
                            <Link href="/book">
                              <i className="fas fa-plus mr-2"></i>
                              Create Booking Request
                            </Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions & Client Tasks */}
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full justify-start" asChild>
                        <Link href="/talent">
                          <i className="fas fa-search mr-2"></i>
                          Browse Talent Directory
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link href="/book">
                          <i className="fas fa-plus-circle mr-2"></i>
                          Submit New Request
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <i className="fas fa-headset mr-2"></i>
                        Contact Support
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Client Tasks */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        My Tasks
                        <Badge variant="outline">
                          {tasksData?.tasks?.filter((task: any) => task.status !== 'done').length || 0}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {tasksLoading ? (
                        <div className="space-y-3">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-slate-200 rounded-full mt-2 animate-pulse"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse mb-1"></div>
                                <div className="h-3 bg-slate-200 rounded w-1/2 animate-pulse"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : tasksData?.tasks?.length > 0 ? (
                        <div className="space-y-3">
                          {tasksData.tasks
                            .filter((task: any) => task.status !== 'done')
                            .slice(0, 5)
                            .map((task: any) => (
                              <div key={task.id} className="flex items-start space-x-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${
                                  task.status === 'todo' ? 'bg-slate-400' :
                                  task.status === 'in_progress' ? 'bg-blue-500' :
                                  task.status === 'blocked' ? 'bg-red-500' : 'bg-green-500'
                                }`}></div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-slate-900">{task.title}</p>
                                  {task.description && (
                                    <p className="text-xs text-slate-600">{task.description}</p>
                                  )}
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {task.status.replace('_', ' ')}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <i className="fas fa-tasks text-slate-300 text-2xl mb-2"></i>
                          <p className="text-sm text-slate-500">No tasks assigned</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher for Testing */}
        <div className="mt-8">
          <RoleSwitcher />
        </div>

      </div>

      <Footer />
    </div>
  );
}

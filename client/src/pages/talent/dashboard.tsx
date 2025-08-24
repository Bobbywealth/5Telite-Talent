import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function TalentDashboard() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();

  // Authentication is handled by the Router component

  // Fetch talent bookings
  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/bookings"],
    queryFn: async () => {
      const response = await fetch("/api/bookings", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch bookings");
      return response.json();
    },
    enabled: isAuthenticated && user?.role === 'talent',
    retry: false,
  });

  // Fetch talent tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/tasks"],
    queryFn: async () => {
      const response = await fetch("/api/tasks", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch tasks");
      return response.json();
    },
    enabled: isAuthenticated && user?.role === 'talent',
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'talent') {
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
      case 'proposed':
        return 'secondary';
      case 'cancelled':
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-hero text-white rounded-2xl p-8 mb-6">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-xl text-slate-200 mb-6">
              Manage your profile, view bookings, and track your tasks all in one place.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/dashboard/profile">
                <Button size="lg" className="bg-white text-primary hover:bg-slate-50" data-testid="button-edit-profile">
                  <i className="fas fa-user-edit mr-2"></i>Edit Profile
                </Button>
              </Link>
              <Link href="/talent">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary" data-testid="button-browse-directory">
                  <i className="fas fa-search mr-2"></i>Browse Directory
                </Button>
              </Link>
            </div>
          </div>

          {/* Profile Status */}
          {user?.talentProfile && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-primary text-2xl"></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Profile Status</h3>
                      <p className="text-slate-600">
                        {user.talentProfile.approvalStatus === 'approved' && "Your profile is live and visible in the directory."}
                        {user.talentProfile.approvalStatus === 'rejected' && "Your profile needs updates. Please contact support."}
                        {user.talentProfile.approvalStatus === 'pending' && "Your profile is under review."}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={getStatusBadgeVariant(user.talentProfile.approvalStatus)} 
                    className="text-sm px-3 py-1"
                    data-testid="badge-profile-status"
                  >
                    {user.talentProfile.approvalStatus === 'approved' && <i className="fas fa-check mr-1"></i>}
                    {user.talentProfile.approvalStatus === 'rejected' && <i className="fas fa-times mr-1"></i>}
                    {user.talentProfile.approvalStatus === 'pending' && <i className="fas fa-clock mr-1"></i>}
                    {user.talentProfile.approvalStatus?.charAt(0).toUpperCase() + user.talentProfile.approvalStatus?.slice(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Bookings */}
          <Card>
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="flex items-center justify-between">
                My Bookings
                <Badge variant="outline" data-testid="badge-bookings-count">
                  {bookingsData?.total || 0}
                </Badge>
              </CardTitle>
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
                  {bookingsData.bookings.slice(0, 5).map((booking: any) => (
                    <div key={booking.id} className="p-4 bg-slate-50 rounded-lg" data-testid={`booking-${booking.id}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-slate-900">{booking.title}</h4>
                        <Badge variant={getStatusBadgeVariant(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-1">
                        Client: {booking.client?.firstName} {booking.client?.lastName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                      </p>
                      {booking.location && (
                        <p className="text-xs text-slate-500">
                          <i className="fas fa-map-marker-alt mr-1"></i>
                          {booking.location}
                        </p>
                      )}
                    </div>
                  ))}
                  {bookingsData.total > 5 && (
                    <div className="text-center pt-4">
                      <p className="text-sm text-slate-500">
                        Showing 5 of {bookingsData.total} bookings
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-calendar text-slate-300 text-4xl mb-4"></i>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No bookings yet</h3>
                  <p className="text-slate-500 mb-4">
                    Your booking requests will appear here once submitted.
                  </p>
                  <Link href="/talent">
                    <Button variant="outline" size="sm">
                      Browse Opportunities
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Tasks */}
          <Card>
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="flex items-center justify-between">
                My Tasks
                <Badge variant="outline" data-testid="badge-tasks-count">
                  {tasksData?.tasks?.filter((task: any) => task.status !== 'done').length || 0}
                </Badge>
              </CardTitle>
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
              ) : tasksData?.tasks?.length > 0 ? (
                <div className="space-y-4">
                  {tasksData.tasks
                    .filter((task: any) => task.status !== 'done')
                    .slice(0, 5)
                    .map((task: any) => (
                      <div key={task.id} className="flex items-start space-x-3" data-testid={`task-${task.id}`}>
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          task.status === 'todo' ? 'bg-slate-400' :
                          task.status === 'in_progress' ? 'bg-blue-500' :
                          task.status === 'blocked' ? 'bg-red-500' : 'bg-green-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{task.title}</p>
                          {task.description && (
                            <p className="text-sm text-slate-600 mb-1">{task.description}</p>
                          )}
                          {task.booking && (
                            <p className="text-xs text-slate-500 mb-1">
                              Related to: {task.booking.title}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {task.status.replace('_', ' ')}
                            </Badge>
                            {task.dueAt && (
                              <span className={`text-xs px-2 py-1 rounded ${
                                new Date(task.dueAt) < new Date() 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-slate-100 text-slate-800'
                              }`}>
                                Due: {formatDate(task.dueAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  {tasksData.total > 5 && (
                    <div className="text-center pt-4">
                      <p className="text-sm text-slate-500">
                        Showing 5 of {tasksData.total} tasks
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-tasks text-slate-300 text-4xl mb-4"></i>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No tasks assigned</h3>
                  <p className="text-slate-500">
                    Tasks related to your bookings will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/dashboard/profile">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-user-edit text-primary text-xl"></i>
                  </div>
                  <h3 className="font-medium text-slate-900 mb-2">Update Profile</h3>
                  <p className="text-sm text-slate-600">Edit your bio, add photos, and update rates</p>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/talent">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-search text-green-600 text-xl"></i>
                  </div>
                  <h3 className="font-medium text-slate-900 mb-2">Browse Directory</h3>
                  <p className="text-sm text-slate-600">See how your profile appears to clients</p>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/book">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-calendar-plus text-blue-600 text-xl"></i>
                  </div>
                  <h3 className="font-medium text-slate-900 mb-2">Request Booking</h3>
                  <p className="text-sm text-slate-600">Submit a booking request form</p>
                </CardContent>
              </Link>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

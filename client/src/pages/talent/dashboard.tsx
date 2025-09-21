import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { Link } from "wouter";
import TalentNavbar from "@/components/layout/talent-navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPen, Search, Calendar, User, DollarSign, MapPin, CalendarDays, ClipboardList, Plus } from "lucide-react";

export default function TalentDashboard() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();

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
    if (isAuthenticated && user?.role === 'talent') {
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
  }, [isAuthenticated, user]);

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
    queryFn: getQueryFn(),
    enabled: isAuthenticated && user?.role === 'talent',
    retry: false,
  });

  // Fetch booking requests for this talent
  const { data: bookingRequestsData, isLoading: bookingRequestsLoading } = useQuery({
    queryKey: ["/api/booking-requests"],
    queryFn: async () => {
      const response = await fetch("/api/booking-requests", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch booking requests");
      return response.json();
    },
    enabled: isAuthenticated && user?.role === 'talent',
    retry: false,
  });

  // Fetch talent profile for completion status
  const { data: talentProfile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ["/api/talents", user?.id],
    queryFn: async () => {
      console.log("Fetching talent profile for user:", user?.id);
      const response = await fetch(`/api/talents/${user?.id}`, {
        credentials: "include",
      });
      console.log("Profile fetch response:", response.status, response.statusText);
      if (!response.ok) {
        const errorText = await response.text();
        console.log("Profile fetch error:", errorText);
        throw new Error(`Failed to fetch profile: ${response.status} ${errorText}`);
      }
      const profileData = await response.json();
      console.log("Fetched talent profile:", profileData);
      return profileData;
    },
    enabled: !!(isAuthenticated && user?.role === 'talent' && user?.id),
    retry: false,
  });

  // Log profile fetch status
  console.log("Profile loading:", profileLoading, "Profile error:", profileError, "Profile data:", talentProfile);

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

  const calculateProfileCompletion = (profile: any) => {
    console.log("Profile data for completion calculation:", profile);
    if (!profile) {
      console.log("No profile data found - Bobby needs to create his profile");
      return { 
        percentage: 0, 
        completed: [], 
        missing: ['Stage Name', 'Bio/Description', 'Categories', 'Skills', 'Location', 'Union Status', 'Hourly Rate', 'Height', 'Hair Color', 'Eye Color', 'Profile Photo'], 
        details: { totalRequired: 11, completedRequired: 0, completedOptional: 0 } 
      };
    }
    
    const profileFields = [
      { key: 'stageName', label: 'Stage Name', required: true },
      { key: 'bio', label: 'Bio/Description', required: true },
      { key: 'categories', label: 'Categories', required: true },
      { key: 'skills', label: 'Skills', required: true },
      { key: 'location', label: 'Location', required: true },
      { key: 'unionStatus', label: 'Union Status', required: true },
      { key: 'rates.hourly', label: 'Hourly Rate', required: true },
      { key: 'rates.day', label: 'Day Rate', required: false },
      { key: 'measurements.height', label: 'Height', required: true },
      { key: 'measurements.hair', label: 'Hair Color', required: true },
      { key: 'measurements.eyes', label: 'Eye Color', required: true },
      { key: 'social.instagram', label: 'Instagram', required: false },
      { key: 'profileImageUrl', label: 'Profile Photo', required: true }
    ];
    
    const completed = [];
    const missing = [];
    
    profileFields.forEach(field => {
      const value = getNestedValue(profile, field.key);
      const isCompleted = value && (Array.isArray(value) ? value.length > 0 : value.toString().trim().length > 0);
      
      if (isCompleted) {
        completed.push(field);
      } else if (field.required) {
        missing.push(field);
      }
    });
    
    const requiredFields = profileFields.filter(f => f.required);
    const percentage = Math.round((completed.filter(f => f.required).length / requiredFields.length) * 100);
    
    return {
      percentage,
      completed: completed.map(f => f.label),
      missing: missing.map(f => f.label),
      details: {
        totalRequired: requiredFields.length,
        completedRequired: completed.filter(f => f.required).length,
        completedOptional: completed.filter(f => !f.required).length
      }
    };
  };

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const calculateEarnings = () => {
    if (!bookingsData?.bookings) return 0;
    return bookingsData.bookings
      .filter((booking: any) => booking.status === 'completed')
      .reduce((total: number, booking: any) => total + (booking.totalAmount || 0), 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <TalentNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Hero Section */}
        <div className="mb-8">
          <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-8 mb-6 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                    Welcome back, {user?.firstName}!
                  </h1>
                  <p className="text-emerald-100 text-lg">
                    Track your bookings, earnings, and career progress
                  </p>
                </div>
                <div className="hidden md:flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <span className="text-white text-sm font-medium">Talent Profile</span>
                  </div>
                  <div className={`${talentProfile?.status === 'approved' ? 'bg-green-500/20' : 'bg-amber-500/20'} backdrop-blur-sm rounded-lg px-4 py-2`}>
                    <span className={`${talentProfile?.status === 'approved' ? 'text-green-100' : 'text-amber-100'} text-sm font-medium flex items-center`}>
                      <div className={`w-2 h-2 ${talentProfile?.status === 'approved' ? 'bg-green-400' : 'bg-amber-400'} rounded-full mr-2`}></div>
                      {talentProfile?.status === 'approved' ? 'Active' : 'Under Review'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/talent/profile-edit">
                  <Button className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105" data-testid="button-edit-profile">
                    <UserPen className="w-4 h-4 mr-2" />Edit Profile
                  </Button>
                </Link>
                <Link href="/talent">
                  <Button className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105" data-testid="button-browse-directory">
                    <Search className="w-4 h-4 mr-2" />Browse Directory
                  </Button>
                </Link>
                <Link href="/talent/bookings">
                  <Button className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105">
                    <Calendar className="w-4 h-4 mr-2" />View Bookings
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-700 mb-1">Profile Completion</p>
                    <p className="text-3xl font-bold text-blue-900 mb-2">
                      {calculateProfileCompletion(talentProfile?.talentProfile).percentage}%
                    </p>
                    <div className="w-full bg-blue-200 rounded-full h-2 mb-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500" 
                        style={{width: `${calculateProfileCompletion(talentProfile?.talentProfile).percentage}%`}}
                      ></div>
                    </div>
                    {(() => {
                      const completion = calculateProfileCompletion(talentProfile?.talentProfile);
                      return (
                        <div className="space-y-1">
                          <div className="text-xs text-blue-700 font-medium">
                            {completion.details.completedRequired}/{completion.details.totalRequired} required fields completed
                          </div>
                          {completion.missing.length > 0 && (
                            <div className="text-xs text-slate-600">
                              Missing: {completion.missing.slice(0, 3).join(', ')}
                              {completion.missing.length > 3 && ` +${completion.missing.length - 3} more`}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-3 shadow-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-teal-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-700 mb-1">Total Earnings</p>
                    <p className="text-3xl font-bold text-emerald-900 mb-2">
                      ${calculateEarnings().toLocaleString()}
                    </p>
                    <div className="w-full bg-emerald-200 rounded-full h-2 mb-2">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-500" style={{width: '70%'}}></div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-3 shadow-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-sm text-slate-600">
                  From completed bookings
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700 mb-1">Active Bookings</p>
                    <p className="text-3xl font-bold text-purple-900 mb-2">
                      {bookingsData?.bookings?.filter((b: any) => ['inquiry', 'proposed', 'contract_sent', 'signed', 'invoiced', 'paid'].includes(b.status)).length || 0}
                    </p>
                    <div className="w-full bg-purple-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-500" 
                        style={{width: `${Math.min((bookingsData?.bookings?.filter((b: any) => ['inquiry', 'proposed', 'contract_sent', 'signed', 'invoiced', 'paid'].includes(b.status)).length || 0) * 20, 100)}%`}}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-3 shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-sm text-slate-600">
                  Currently booked projects
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Completion Details */}
          {(() => {
            const completion = calculateProfileCompletion(talentProfile?.talentProfile);
            if (completion.percentage < 100 && completion.missing.length > 0) {
              return (
                <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-amber-800">
                      <User className="w-5 h-5 mr-2" />
                      Complete Your Profile ({completion.percentage}%)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-amber-800 mb-2">Missing Required Fields:</h4>
                        <div className="space-y-1">
                          {completion.missing.map((field, index) => (
                            <div key={index} className="flex items-center text-sm text-amber-700">
                              <div className="w-2 h-2 bg-amber-400 rounded-full mr-2"></div>
                              {field}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-green-800 mb-2">Completed Fields:</h4>
                        <div className="space-y-1">
                          {completion.completed.slice(0, 6).map((field, index) => (
                            <div key={index} className="flex items-center text-sm text-green-700">
                              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                              {field}
                            </div>
                          ))}
                          {completion.completed.length > 6 && (
                            <div className="text-sm text-green-600">
                              +{completion.completed.length - 6} more completed
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-amber-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-amber-700">
                          <strong>Why complete your profile?</strong> Clients prefer talents with complete profiles. 
                          You're {100 - completion.percentage}% away from maximizing your booking potential!
                        </div>
                        <Link href="/talent/profile-edit">
                          <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                            <UserPen className="w-4 h-4 mr-2" />
                            Complete Profile
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }
            return null;
          })()}

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
                          <MapPin className="w-3 h-3 mr-1" />
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
                  <CalendarDays className="w-16 h-16 text-slate-300 mb-4" />
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
                  <ClipboardList className="w-16 h-16 text-slate-300 mb-4" />
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
              <Link href="/talent/profile">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <UserPen className="w-5 h-5 text-primary" />
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
                    <Search className="w-5 h-5 text-green-600" />
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
                    <Plus className="w-5 h-5 text-blue-600" />
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

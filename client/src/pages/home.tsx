import { useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/layout/navbar";
import TalentNavbar from "@/components/layout/talent-navbar";
import AdminNavbar from "@/components/layout/admin-navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoleSwitcher } from "@/components/auth/RoleSwitcher";

export default function Home() {
  const { user } = useAuth();
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
              {/* Only show buttons for client users since admins and talents have navbar */}
              {user?.role === 'client' && (
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" className="bg-white text-primary hover:bg-slate-50" data-testid="button-dashboard" asChild>
                    <Link href={getDashboardLink()}>
                      <i className="fas fa-tachometer-alt mr-2"></i>
                      Go to Dashboard
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary" data-testid="button-browse-talent" asChild>
                    <Link href="/talent">
                      <i className="fas fa-users mr-2"></i>Browse Talent
                    </Link>
                  </Button>
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
                    <div className="text-2xl font-bold">0</div>
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
                    <div className="text-2xl font-bold">0</div>
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
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-slate-500">Need attention</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-slate-600">Platform Status</CardTitle>
                      <i className="fas fa-server text-green-600"></i>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold text-green-600">Online</div>
                    <p className="text-xs text-slate-500">All systems operational</p>
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

          {/* Client-specific cards only */}
          {user?.role === 'client' && (
            <>
              <Link href="/talent">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <i className="fas fa-search text-green-600 text-xl"></i>
                      </div>
                      <CardTitle className="text-lg">Browse Talent</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">Explore our directory of professional talent across all categories.</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/book">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <i className="fas fa-plus-circle text-blue-600 text-xl"></i>
                      </div>
                      <CardTitle className="text-lg">Request Booking</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">Submit a new booking request for your upcoming project.</p>
                  </CardContent>
                </Card>
              </Link>
            </>
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

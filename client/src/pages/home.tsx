import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoleSwitcher } from "@/components/auth/RoleSwitcher";

export default function Home() {
  const { user } = useAuth();

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

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
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
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-white text-primary hover:bg-slate-50" data-testid="button-dashboard" asChild>
                  <Link href={getDashboardLink()}>
                    <i className="fas fa-tachometer-alt mr-2"></i>
                    Go to {user?.role === 'admin' ? 'Admin' : ''} Dashboard
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary" data-testid="button-browse-talent" asChild>
                  <Link href="/talent">
                    <i className="fas fa-users mr-2"></i>Browse Talent
                  </Link>
                </Button>
              </div>
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
            <>
              <Link href="/admin/talents">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <i className="fas fa-users text-primary text-xl"></i>
                      </div>
                      <CardTitle className="text-lg">Manage Talents</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">Review applications, approve profiles, and manage talent roster.</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/bookings">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-secondary/10 rounded-lg">
                        <i className="fas fa-calendar text-secondary text-xl"></i>
                      </div>
                      <CardTitle className="text-lg">Manage Bookings</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">Create bookings, track status, and manage client relationships.</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/tasks">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <i className="fas fa-tasks text-accent text-xl"></i>
                      </div>
                      <CardTitle className="text-lg">Task Management</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">Assign tasks, track progress, and manage workflows.</p>
                  </CardContent>
                </Card>
              </Link>
            </>
          )}

          {user?.role === 'talent' && (
            <>
              <Link href="/dashboard/profile">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <i className="fas fa-user-edit text-primary text-xl"></i>
                      </div>
                      <CardTitle className="text-lg">Edit Profile</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">Update your profile, add photos, and manage availability.</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-secondary/10 rounded-lg">
                        <i className="fas fa-calendar-alt text-secondary text-xl"></i>
                      </div>
                      <CardTitle className="text-lg">My Bookings</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">View upcoming bookings and track your schedule.</p>
                  </CardContent>
                </Card>
              </Link>
            </>
          )}

          {/* Common cards for all users */}
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
        </div>

      </div>

      <Footer />
    </div>
  );
}

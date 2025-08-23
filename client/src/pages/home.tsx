import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
          <div className="bg-gradient-hero text-white rounded-2xl p-8 mb-8">
            <div className="max-w-3xl">
              <h1 className="text-3xl lg:text-5xl font-bold mb-4">
                Welcome back, {user?.firstName || 'User'}!
              </h1>
              <p className="text-xl text-slate-200 mb-6">
                {getRoleDescription()}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href={getDashboardLink()}>
                  <Button size="lg" className="bg-white text-primary hover:bg-slate-50" data-testid="button-dashboard">
                    <i className="fas fa-tachometer-alt mr-2"></i>
                    Go to {user?.role === 'admin' ? 'Admin' : ''} Dashboard
                  </Button>
                </Link>
                <Link href="/talent">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary" data-testid="button-browse-talent">
                    <i className="fas fa-users mr-2"></i>Browse Talent
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <Badge variant={user?.status === 'active' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} Account
            </Badge>
            <Badge variant={user?.status === 'active' ? 'default' : 'destructive'} className="text-sm px-3 py-1">
              {user?.status?.charAt(0).toUpperCase() + user?.status?.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user?.role === 'admin' && (
            <>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/admin/talents">
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
                </Link>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/admin/bookings">
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
                </Link>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/admin/tasks">
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
                </Link>
              </Card>
            </>
          )}

          {user?.role === 'talent' && (
            <>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/dashboard/profile">
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
                </Link>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/dashboard">
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
                </Link>
              </Card>
            </>
          )}

          {/* Common cards for all users */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/talent">
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
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/book">
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
            </Link>
          </Card>
        </div>

        {/* Profile Status for Talents */}
        {user?.role === 'talent' && user?.talentProfile && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-info-circle text-blue-600"></i>
                Profile Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge 
                  variant={user.talentProfile.approvalStatus === 'approved' ? 'default' : 
                          user.talentProfile.approvalStatus === 'rejected' ? 'destructive' : 'secondary'}
                >
                  {user.talentProfile.approvalStatus === 'approved' && <i className="fas fa-check mr-1"></i>}
                  {user.talentProfile.approvalStatus === 'rejected' && <i className="fas fa-times mr-1"></i>}
                  {user.talentProfile.approvalStatus === 'pending' && <i className="fas fa-clock mr-1"></i>}
                  {user.talentProfile.approvalStatus?.charAt(0).toUpperCase() + user.talentProfile.approvalStatus?.slice(1)}
                </Badge>
                <p className="text-slate-600">
                  {user.talentProfile.approvalStatus === 'approved' && "Your profile is live and visible in the talent directory."}
                  {user.talentProfile.approvalStatus === 'rejected' && "Your profile needs updates. Please contact support."}
                  {user.talentProfile.approvalStatus === 'pending' && "Your profile is under review. You'll be notified once approved."}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
}

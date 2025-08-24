import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import ClientNavbar from "@/components/layout/client-navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleSwitcher } from "@/components/auth/RoleSwitcher";

export default function ClientDashboard() {
  const { user, isAuthenticated } = useAuth();

  // Fetch client bookings
  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/bookings"],
    queryFn: async () => {
      const response = await fetch("/api/bookings", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch bookings");
      return response.json();
    },
    enabled: isAuthenticated && user?.role === 'client',
    retry: false,
  });

  // Fetch client tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/tasks"],
    queryFn: async () => {
      const response = await fetch("/api/tasks", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch tasks");
      return response.json();
    },
    enabled: isAuthenticated && user?.role === 'client',
    retry: false,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'inquiry': case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'proposed': case 'contract_sent': return 'bg-blue-100 text-blue-800';
      case 'signed': case 'invoiced': return 'bg-purple-100 text-purple-800';
      case 'paid': case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num || 0);
  };

  const calculateTotalSpent = () => {
    if (!bookingsData?.bookings) return 0;
    return bookingsData.bookings
      .filter((booking: any) => ['paid', 'completed'].includes(booking.status))
      .reduce((sum: number, booking: any) => {
        const rate = typeof booking.rate === 'string' ? parseFloat(booking.rate) : booking.rate;
        return sum + (rate || 0);
      }, 0);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <ClientNavbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900" data-testid="heading-client-dashboard">
              Client Dashboard
            </h1>
            <p className="text-slate-600 mt-1">
              Welcome back, {user?.firstName || 'Client'}! Manage your bookings and projects.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <RoleSwitcher />
            <Link href="/book">
              <Button data-testid="button-create-booking">
                <i className="fas fa-plus mr-2"></i>
                New Booking
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  {bookingsData?.bookings?.filter((b: any) => ['inquiry', 'proposed'].includes(b.status)).length || 0} pending
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
                    {bookingsLoading ? "..." : bookingsData?.bookings?.filter((b: any) => ['signed', 'invoiced', 'paid'].includes(b.status)).length || 0}
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
                    {bookingsLoading ? "..." : formatCurrency(calculateTotalSpent())}
                  </p>
                </div>
                <div className="bg-purple-100 rounded-lg p-3">
                  <i className="fas fa-dollar-sign text-purple-600 text-xl"></i>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-purple-600">This year</span>
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
                <div className="bg-emerald-100 rounded-lg p-3">
                  <i className="fas fa-check-circle text-emerald-600 text-xl"></i>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-emerald-600">Successfully finished</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold">Recent Bookings</CardTitle>
                  <Link href="/client/bookings">
                    <Button variant="outline" size="sm" data-testid="button-view-all-bookings">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {bookingsLoading ? (
                  <div className="p-6 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-3 w-[200px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : bookingsData?.bookings?.length > 0 ? (
                  <div className="divide-y divide-slate-200">
                    {bookingsData.bookings.slice(0, 5).map((booking: any) => (
                      <div key={booking.id} className="p-6 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-slate-900" data-testid={`booking-title-${booking.id}`}>
                              {booking.title}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                              {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                            </p>
                            <p className="text-sm text-slate-600 mt-1">
                              {booking.location || 'Location TBD'}
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            {booking.rate && (
                              <span className="font-medium text-slate-900">
                                {formatCurrency(booking.rate)}
                              </span>
                            )}
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-calendar text-slate-400 text-xl"></i>
                    </div>
                    <h3 className="text-sm font-medium text-slate-900">No bookings yet</h3>
                    <p className="text-sm text-slate-500 mt-1">Start by creating your first booking request.</p>
                    <Link href="/book">
                      <Button className="mt-4" size="sm" data-testid="button-create-first-booking">
                        Create Booking
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Tasks */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/book">
                  <Button className="w-full justify-start" variant="outline" data-testid="button-quick-book">
                    <i className="fas fa-plus mr-3"></i>
                    Create New Booking
                  </Button>
                </Link>
                <Link href="/talent">
                  <Button className="w-full justify-start" variant="outline" data-testid="button-quick-browse-talent">
                    <i className="fas fa-search mr-3"></i>
                    Browse Talent
                  </Button>
                </Link>
                <Link href="/client/bookings">
                  <Button className="w-full justify-start" variant="outline" data-testid="button-quick-manage-bookings">
                    <i className="fas fa-calendar-alt mr-3"></i>
                    Manage Bookings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* My Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">My Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : tasksData?.tasks?.length > 0 ? (
                  <div className="space-y-3">
                    {tasksData.tasks.slice(0, 5).map((task: any) => (
                      <div key={task.id} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900" data-testid={`task-title-${task.id}`}>
                            {task.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Due: {task.dueAt ? formatDate(task.dueAt) : 'No due date'}
                          </p>
                        </div>
                        <Badge variant={task.status === 'todo' ? 'destructive' : 'default'} className="text-xs">
                          {task.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center">No active tasks</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
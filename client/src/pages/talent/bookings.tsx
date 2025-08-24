import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import TalentNavbar from "@/components/layout/talent-navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

export default function TalentBookings() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: bookings, isLoading: bookingsLoading, error } = useQuery({
    queryKey: ["/api/bookings/me"],
    enabled: isAuthenticated && user?.role === 'talent',
    retry: false,
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [error, toast]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TalentNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
          <p className="text-slate-600 mt-2">View and manage your upcoming bookings and projects</p>
        </div>

        {/* Bookings List */}
        {bookingsLoading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (!bookings || !Array.isArray((bookings as any)?.bookings) || (bookings as any)?.bookings?.length === 0) ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-slate-400 mb-4">
                <i className="fas fa-calendar-alt text-4xl"></i>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No bookings yet</h3>
              <p className="text-slate-600">
                Your upcoming bookings and projects will appear here once clients book you for gigs.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {(bookings as any)?.bookings && Array.isArray((bookings as any)?.bookings) && (bookings as any)?.bookings.map((booking: any) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl text-slate-900">
                        {booking.projectTitle || 'Untitled Project'}
                      </CardTitle>
                      <p className="text-slate-600 mt-1">
                        <i className="fas fa-user mr-2"></i>
                        Client: {booking.clientName || 'Unknown Client'}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(booking.status)} className="capitalize">
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-slate-700 mb-1">
                        <i className="fas fa-calendar mr-2"></i>Event Date
                      </p>
                      <p className="text-slate-600">
                        {booking.eventDate ? formatDate(booking.eventDate) : 'TBD'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-700 mb-1">
                        <i className="fas fa-clock mr-2"></i>Duration
                      </p>
                      <p className="text-slate-600">
                        {booking.duration || 'TBD'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-700 mb-1">
                        <i className="fas fa-map-marker-alt mr-2"></i>Location
                      </p>
                      <p className="text-slate-600">
                        {booking.location || 'TBD'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-700 mb-1">
                        <i className="fas fa-dollar-sign mr-2"></i>Budget
                      </p>
                      <p className="text-slate-600">
                        {booking.budget || 'TBD'}
                      </p>
                    </div>
                  </div>
                  
                  {booking.description && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="font-medium text-slate-700 mb-2">
                        <i className="fas fa-info-circle mr-2"></i>Project Description
                      </p>
                      <p className="text-slate-600">{booking.description}</p>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500">
                      Booked on {formatDate(booking.createdAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
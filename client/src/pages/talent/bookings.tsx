import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import TalentNavbar from "@/components/layout/talent-navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function TalentBookings() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

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

  // Fetch confirmed bookings
  const { data: bookings, isLoading: bookingsLoading, error: bookingsError } = useQuery({
    queryKey: ["/api/bookings"],
    enabled: isAuthenticated && user?.role === 'talent',
    retry: false,
  });

  // Fetch pending booking requests
  const { data: requestsData, isLoading: requestsLoading, error: requestsError } = useQuery({
    queryKey: ["/api/booking-requests"],
    enabled: isAuthenticated && user?.role === 'talent',
    retry: false,
  });

  // Handle unauthorized errors
  useEffect(() => {
    const error = bookingsError || requestsError;
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
  }, [bookingsError, requestsError, toast]);

  // Respond to booking request mutation
  const respondToRequestMutation = useMutation({
    mutationFn: async ({ requestId, action, message }: { requestId: string; action: 'accept' | 'decline'; message?: string }) => {
      return apiRequest("PATCH", `/api/booking-requests/${requestId}/respond`, { action, message });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/booking-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setShowResponseDialog(false);
      setSelectedRequest(null);
      setResponseMessage("");
      toast({
        title: "Success",
        description: `Booking request ${variables.action}ed successfully!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleResponse = (request: any, action: 'accept' | 'decline') => {
    setSelectedRequest(request);
    setShowResponseDialog(true);
  };

  const submitResponse = (action: 'accept' | 'decline') => {
    if (selectedRequest) {
      respondToRequestMutation.mutate({
        requestId: selectedRequest.id,
        action,
        message: responseMessage.trim() || undefined,
      });
    }
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed': return 'default';
      case 'inquiry': return 'secondary';
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
          <p className="text-slate-600 mt-2">Manage your bookings and respond to booking requests</p>
        </div>

        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="requests" data-testid="tab-requests">
              Booking Requests
              {requestsData?.requests?.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {requestsData.requests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="bookings" data-testid="tab-bookings">My Bookings</TabsTrigger>
          </TabsList>

          {/* Booking Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            {requestsLoading ? (
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
            ) : (!requestsData?.requests || requestsData.requests.length === 0) ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-slate-400 mb-4">
                    <i className="fas fa-inbox text-4xl"></i>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No pending requests</h3>
                  <p className="text-slate-600">
                    New booking requests from clients will appear here for you to accept or decline.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {requestsData.requests.map((request: any) => (
                  <Card key={request.id} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl text-slate-900">
                            {request.booking.title}
                          </CardTitle>
                          <p className="text-slate-600 mt-1">
                            <i className="fas fa-user mr-2"></i>
                            Client: {request.booking.client.firstName} {request.booking.client.lastName}
                          </p>
                          <p className="text-slate-600">
                            <i className="fas fa-envelope mr-2"></i>
                            {request.booking.client.email}
                          </p>
                        </div>
                        <Badge variant="secondary" className="ml-4">
                          New Request
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-slate-700">Dates</p>
                          <p className="text-slate-600">
                            {formatDate(request.booking.startDate)} - {formatDate(request.booking.endDate)}
                          </p>
                        </div>
                        {request.booking.location && (
                          <div>
                            <p className="text-sm font-medium text-slate-700">Location</p>
                            <p className="text-slate-600">
                              <i className="fas fa-map-marker-alt mr-1"></i>
                              {request.booking.location}
                            </p>
                          </div>
                        )}
                        {request.booking.rate && (
                          <div>
                            <p className="text-sm font-medium text-slate-700">Rate</p>
                            <p className="text-slate-600">${request.booking.rate}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-700">Booking Code</p>
                          <p className="text-slate-600 font-mono">#{request.booking.code}</p>
                        </div>
                      </div>

                      {request.booking.deliverables && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-slate-700 mb-1">Deliverables</p>
                          <p className="text-slate-600 text-sm">{request.booking.deliverables}</p>
                        </div>
                      )}

                      {request.booking.notes && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-slate-700 mb-1">Additional Notes</p>
                          <p className="text-slate-600 text-sm">{request.booking.notes}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t">
                        <p className="text-xs text-slate-500">
                          Received {formatDate(request.createdAt)}
                        </p>
                        <div className="flex space-x-3">
                          <Button
                            variant="outline"
                            onClick={() => handleResponse(request, 'decline')}
                            disabled={respondToRequestMutation.isPending}
                            data-testid={`button-decline-${request.id}`}
                          >
                            <i className="fas fa-times mr-2"></i>Decline
                          </Button>
                          <Button
                            onClick={() => handleResponse(request, 'accept')}
                            disabled={respondToRequestMutation.isPending}
                            data-testid={`button-accept-${request.id}`}
                          >
                            <i className="fas fa-check mr-2"></i>Accept
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
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
            ) : (!bookings?.bookings || bookings.bookings.length === 0) ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-slate-400 mb-4">
                    <i className="fas fa-calendar-alt text-4xl"></i>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No bookings yet</h3>
                  <p className="text-slate-600">
                    Your confirmed bookings and projects will appear here once you accept booking requests.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {bookings.bookings.map((booking: any) => (
                  <Card key={booking.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl text-slate-900">
                            {booking.title}
                          </CardTitle>
                          <p className="text-slate-600 mt-1">
                            <i className="fas fa-user mr-2"></i>
                            Client: {booking.client?.firstName} {booking.client?.lastName}
                          </p>
                        </div>
                        <Badge variant={getStatusColor(booking.status)} className="capitalize">
                          {booking.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-slate-700">Dates</p>
                          <p className="text-slate-600">
                            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                          </p>
                        </div>
                        {booking.location && (
                          <div>
                            <p className="text-sm font-medium text-slate-700">Location</p>
                            <p className="text-slate-600">
                              <i className="fas fa-map-marker-alt mr-1"></i>
                              {booking.location}
                            </p>
                          </div>
                        )}
                        {booking.rate && (
                          <div>
                            <p className="text-sm font-medium text-slate-700">Rate</p>
                            <p className="text-slate-600">${booking.rate}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-700">Booking Code</p>
                          <p className="text-slate-600 font-mono">#{booking.code}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedRequest ? 
                `Respond to Booking Request: ${selectedRequest.booking.title}` : 
                'Respond to Booking Request'
              }
            </DialogTitle>
            <DialogDescription>
              Add an optional message with your response to the client.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Message to Client (Optional)
              </label>
              <Textarea
                placeholder="Add a message for the client..."
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                rows={4}
                data-testid="textarea-response-message"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowResponseDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => submitResponse('decline')}
                disabled={respondToRequestMutation.isPending}
                data-testid="button-confirm-decline"
              >
                {respondToRequestMutation.isPending ? "Declining..." : "Decline Request"}
              </Button>
              <Button
                onClick={() => submitResponse('accept')}
                disabled={respondToRequestMutation.isPending}
                data-testid="button-confirm-accept"
              >
                {respondToRequestMutation.isPending ? "Accepting..." : "Accept Request"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminNavbar from "@/components/layout/admin-navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminBookingRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch booking requests from clients
  const { data: bookingRequests, isLoading } = useQuery({
    queryKey: ["/api/admin/booking-requests"],
    enabled: user?.role === 'admin',
  }) as { data: { bookingRequests?: any[] } | undefined, isLoading: boolean };

  // Mutation to send talent request
  const sendTalentRequestMutation = useMutation({
    mutationFn: async ({ bookingId, talentId }: { bookingId: string; talentId: string }) => {
      return apiRequest("POST", "/api/admin/send-talent-request", {
        bookingId,
        talentId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Talent request sent successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/booking-requests"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send talent request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendTalentRequest = (bookingId: string, talentId: string) => {
    sendTalentRequestMutation.mutate({ bookingId, talentId });
  };

  if (!user || user.role !== 'admin') {
    return <div>Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar />
      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Client Booking Requests</h1>
          <p className="text-slate-600">Review booking requests from clients and manage talent outreach</p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded"></div>
                  <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-3 bg-slate-200 rounded"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-8 bg-slate-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !bookingRequests?.bookingRequests || bookingRequests.bookingRequests.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-slate-400 text-6xl mb-4">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No booking requests yet</h3>
            <p className="text-slate-600">When clients request specific talents, they'll appear here for your review.</p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {bookingRequests?.bookingRequests && bookingRequests.bookingRequests.map((request: any) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {request.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <i className="fas fa-user"></i>
                    <span>{request.client?.firstName} {request.client?.lastName}</span>
                    <Badge variant="secondary">Client</Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Requested Talent */}
                  {request.requestedTalent && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="fas fa-star text-blue-500"></i>
                        <span className="font-semibold text-blue-900">Requested Talent</span>
                      </div>
                      <p className="text-sm text-blue-800">
                        {request.requestedTalent.firstName} {request.requestedTalent.lastName}
                      </p>
                      <p className="text-xs text-blue-600">{request.requestedTalent.email}</p>
                    </div>
                  )}

                  {/* Booking Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <i className="fas fa-calendar text-slate-400"></i>
                      <span>
                        {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {request.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <i className="fas fa-map-marker-alt text-slate-400"></i>
                        <span>{request.location}</span>
                      </div>
                    )}
                    
                    {request.rate && (
                      <div className="flex items-center gap-2 text-sm">
                        <i className="fas fa-dollar-sign text-green-500"></i>
                        <span className="font-semibold">${request.rate}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t space-y-2">
                    {request.requestedTalent && (
                      <Button
                        onClick={() => handleSendTalentRequest(request.id, request.requestedTalent.id)}
                        disabled={sendTalentRequestMutation.isPending}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        size="sm"
                      >
                        {sendTalentRequestMutation.isPending ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Sending...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane mr-2"></i>
                            Send to {request.requestedTalent.firstName}
                          </>
                        )}
                      </Button>
                    )}
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <i className="fas fa-eye mr-2"></i>
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <i className="fas fa-user-plus mr-2"></i>
                        Pick Different Talent
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
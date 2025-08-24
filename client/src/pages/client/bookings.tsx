import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import ClientNavbar from "@/components/layout/client-navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

export default function ClientBookings() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    page: 1,
  });
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);

  // Fetch client bookings
  const { data: bookingsData, isLoading: bookingsLoading, error } = useQuery({
    queryKey: ["/api/bookings", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.status) params.set("status", filters.status);
      params.set("page", filters.page.toString());
      params.set("limit", "20");

      const response = await fetch(`/api/bookings?${params}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch bookings");
      return response.json();
    },
    enabled: isAuthenticated && user?.role === 'client',
    retry: false,
  });

  // Update booking status mutation
  const updateBookingMutation = useMutation({
    mutationFn: async ({ bookingId, updates }: { bookingId: string; updates: any }) => {
      return apiRequest("PATCH", `/api/bookings/${bookingId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Success",
        description: "Booking updated successfully",
      });
      setShowBookingDetails(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update booking",
        variant: "destructive",
      });
    },
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

  const handleViewBooking = (booking: any) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
  };

  const handleUpdateBookingStatus = (newStatus: string) => {
    if (selectedBooking) {
      updateBookingMutation.mutate({
        bookingId: selectedBooking.id,
        updates: { status: newStatus }
      });
    }
  };

  const getBookingsByStatus = (status: string) => {
    return bookingsData?.bookings?.filter((booking: any) => 
      status === 'all' ? true : booking.status === status
    ) || [];
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <ClientNavbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900" data-testid="heading-client-bookings">
              My Bookings
            </h1>
            <p className="text-slate-600 mt-1">
              Manage and track all your booking requests and projects.
            </p>
          </div>
          <Link href="/book">
            <Button data-testid="button-create-booking">
              <i className="fas fa-plus mr-2"></i>
              New Booking
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search bookings..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                  className="w-full"
                  data-testid="input-search-bookings"
                />
              </div>
              <div className="w-full md:w-48">
                <Select 
                  value={filters.status} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value, page: 1 }))}
                >
                  <SelectTrigger data-testid="select-status-filter">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="inquiry">Inquiry</SelectItem>
                    <SelectItem value="proposed">Proposed</SelectItem>
                    <SelectItem value="contract_sent">Contract Sent</SelectItem>
                    <SelectItem value="signed">Signed</SelectItem>
                    <SelectItem value="invoiced">Invoiced</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" data-testid="tab-all-bookings">
              All ({bookingsData?.total || 0})
            </TabsTrigger>
            <TabsTrigger value="inquiry" data-testid="tab-pending-bookings">
              Pending ({getBookingsByStatus('inquiry').length})
            </TabsTrigger>
            <TabsTrigger value="signed" data-testid="tab-active-bookings">
              Active ({getBookingsByStatus('signed').length})
            </TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-completed-bookings">
              Completed ({getBookingsByStatus('completed').length})
            </TabsTrigger>
            <TabsTrigger value="cancelled" data-testid="tab-cancelled-bookings">
              Cancelled ({getBookingsByStatus('cancelled').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600">Error loading bookings: {(error as Error).message}</p>
                  </div>
                ) : bookingsData?.bookings?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Project</TableHead>
                          <TableHead>Dates</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Rate</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookingsData.bookings.map((booking: any) => (
                          <TableRow key={booking.id} className="hover:bg-slate-50">
                            <TableCell>
                              <div>
                                <p className="font-medium text-slate-900" data-testid={`booking-title-${booking.id}`}>
                                  {booking.title}
                                </p>
                                <p className="text-sm text-slate-500">
                                  Code: {booking.code}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p>{formatDate(booking.startDate)}</p>
                                <p className="text-slate-500">to {formatDate(booking.endDate)}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-slate-600">
                                {booking.location || 'TBD'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">
                                {booking.rate ? formatCurrency(booking.rate) : 'TBD'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewBooking(booking)}
                                data-testid={`button-view-booking-${booking.id}`}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-calendar text-slate-400 text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">No bookings found</h3>
                    <p className="text-slate-500 mt-1">Start by creating your first booking request.</p>
                    <Link href="/book">
                      <Button className="mt-4" data-testid="button-create-first-booking">
                        Create Booking
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tab contents with filtered data */}
          {['inquiry', 'signed', 'completed', 'cancelled'].map((statusTab) => (
            <TabsContent key={statusTab} value={statusTab}>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {statusTab === 'inquiry' ? 'Pending' : 
                     statusTab === 'signed' ? 'Active' : 
                     statusTab.charAt(0).toUpperCase() + statusTab.slice(1)} Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getBookingsByStatus(statusTab).length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Project</TableHead>
                            <TableHead>Dates</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Rate</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getBookingsByStatus(statusTab).map((booking: any) => (
                            <TableRow key={booking.id} className="hover:bg-slate-50">
                              <TableCell>
                                <div>
                                  <p className="font-medium text-slate-900">{booking.title}</p>
                                  <p className="text-sm text-slate-500">Code: {booking.code}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <p>{formatDate(booking.startDate)}</p>
                                  <p className="text-slate-500">to {formatDate(booking.endDate)}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-slate-600">
                                  {booking.location || 'TBD'}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium">
                                  {booking.rate ? formatCurrency(booking.rate) : 'TBD'}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(booking.status)}>
                                  {booking.status.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewBooking(booking)}
                                >
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-500">No {statusTab} bookings found.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Booking Details Dialog */}
        <Dialog open={showBookingDetails} onOpenChange={setShowBookingDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedBooking?.title}</DialogTitle>
              <DialogDescription>
                Booking Code: {selectedBooking?.code}
              </DialogDescription>
            </DialogHeader>
            
            {selectedBooking && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Start Date</label>
                    <p className="text-slate-900">{formatDate(selectedBooking.startDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">End Date</label>
                    <p className="text-slate-900">{formatDate(selectedBooking.endDate)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">Location</label>
                  <p className="text-slate-900">{selectedBooking.location || 'TBD'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">Rate</label>
                  <p className="text-slate-900">
                    {selectedBooking.rate ? formatCurrency(selectedBooking.rate) : 'TBD'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">Current Status</label>
                  <Badge className={`${getStatusColor(selectedBooking.status)} mt-1`}>
                    {selectedBooking.status.replace('_', ' ')}
                  </Badge>
                </div>

                {selectedBooking.deliverables && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Deliverables</label>
                    <p className="text-slate-900 whitespace-pre-wrap">{selectedBooking.deliverables}</p>
                  </div>
                )}

                {selectedBooking.notes && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Notes</label>
                    <p className="text-slate-900 whitespace-pre-wrap">{selectedBooking.notes}</p>
                  </div>
                )}

                {/* Action buttons based on current status */}
                <div className="flex justify-end space-x-3">
                  {selectedBooking.status === 'contract_sent' && (
                    <Button 
                      onClick={() => handleUpdateBookingStatus('signed')}
                      disabled={updateBookingMutation.isPending}
                      data-testid="button-approve-contract"
                    >
                      Accept Contract
                    </Button>
                  )}
                  {selectedBooking.status === 'invoiced' && (
                    <Button 
                      onClick={() => handleUpdateBookingStatus('paid')}
                      disabled={updateBookingMutation.isPending}
                      data-testid="button-mark-paid"
                    >
                      Mark as Paid
                    </Button>
                  )}
                  {!['completed', 'cancelled'].includes(selectedBooking.status) && (
                    <Button 
                      variant="destructive"
                      onClick={() => handleUpdateBookingStatus('cancelled')}
                      disabled={updateBookingMutation.isPending}
                      data-testid="button-cancel-booking"
                    >
                      Cancel Booking
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
}
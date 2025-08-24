import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import AdminSidebar from "@/components/layout/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminBookings() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    page: 1,
  });

  // Authentication is handled by the Router component

  // Fetch bookings with filters
  const { data: bookingsData, isLoading: bookingsLoading, error } = useQuery({
    queryKey: ["/api/bookings", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      params.set("page", filters.page.toString());
      params.set("limit", "20");

      const response = await fetch(`/api/bookings?${params}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch bookings");
      return response.json();
    },
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  // Update booking status mutation
  const updateBookingMutation = useMutation({
    mutationFn: async ({ bookingId, updates }: { bookingId: string; updates: any }) => {
      return apiRequest("PATCH", `/api/bookings/${bookingId}`, updates);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Booking updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset page when filters change
    }));
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'paid':
      case 'completed':
        return 'default';
      case 'pending':
      case 'inquiry':
      case 'proposed':
        return 'secondary';
      case 'contract_sent':
      case 'signed':
      case 'invoiced':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900">Booking Management</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">
                {bookingsData ? `${bookingsData.bookings.length} of ${bookingsData.total} bookings` : "Loading..."}
              </span>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Input
                    placeholder="Search bookings..."
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    data-testid="input-search-bookings"
                  />
                </div>
                <div>
                  <Select value={filters.status} onValueChange={(value) => updateFilter('status', value === "all" ? "" : value)}>
                    <SelectTrigger data-testid="select-status-filter">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
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
                <div>
                  <Button 
                    variant="outline" 
                    onClick={() => setFilters({ search: "", status: "", page: 1 })}
                    data-testid="button-clear-filters"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bookings Table */}
          <Card>
            <CardHeader>
              <CardTitle>Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600">Error loading bookings: {error.message}</p>
                </div>
              ) : bookingsData?.bookings?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Talents</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookingsData.bookings.map((booking: any) => (
                      <TableRow key={booking.id} data-testid={`row-booking-${booking.id}`}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900" data-testid={`text-booking-title-${booking.id}`}>
                              {booking.title}
                            </p>
                            <p className="text-sm text-slate-600">#{booking.code}</p>
                            {booking.location && (
                              <p className="text-xs text-slate-500">
                                <i className="fas fa-map-marker-alt mr-1"></i>
                                {booking.location}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {booking.client?.firstName} {booking.client?.lastName}
                            </p>
                            <p className="text-xs text-slate-500">{booking.client?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{formatDate(booking.startDate)}</p>
                            <p className="text-slate-500">to {formatDate(booking.endDate)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            {booking.bookingTalents?.length > 0 ? (
                              <div className="space-y-1">
                                {booking.bookingTalents.slice(0, 2).map((bt: any) => (
                                  <p key={bt.id} className="text-sm text-slate-600">
                                    {bt.talent.firstName} {bt.talent.lastName}
                                  </p>
                                ))}
                                {booking.bookingTalents.length > 2 && (
                                  <p className="text-xs text-slate-500">
                                    +{booking.bookingTalents.length - 2} more
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-500">No talents assigned</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(booking.status)} data-testid={`badge-status-${booking.id}`}>
                            {booking.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" data-testid={`button-view-${booking.id}`}>
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>{booking.title}</DialogTitle>
                                  <DialogDescription>
                                    Booking details and status management
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium">Client</h4>
                                      <p className="text-sm text-slate-600">
                                        {booking.client?.firstName} {booking.client?.lastName}
                                      </p>
                                      <p className="text-sm text-slate-600">{booking.client?.email}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium">Dates</h4>
                                      <p className="text-sm text-slate-600">
                                        {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {booking.description && (
                                    <div>
                                      <h4 className="font-medium">Description</h4>
                                      <p className="text-sm text-slate-600">{booking.description}</p>
                                    </div>
                                  )}
                                  
                                  {booking.rate && (
                                    <div>
                                      <h4 className="font-medium">Rate</h4>
                                      <p className="text-sm text-slate-600">${booking.rate}</p>
                                    </div>
                                  )}
                                  
                                  <div>
                                    <h4 className="font-medium">Update Status</h4>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {['proposed', 'contract_sent', 'signed', 'invoiced', 'paid', 'completed', 'cancelled'].map((status) => (
                                        <Button
                                          key={status}
                                          variant={booking.status === status ? "default" : "outline"}
                                          size="sm"
                                          onClick={() => updateBookingMutation.mutate({ 
                                            bookingId: booking.id, 
                                            updates: { status } 
                                          })}
                                          disabled={updateBookingMutation.isPending}
                                          data-testid={`button-status-${status}`}
                                        >
                                          {status.replace('_', ' ')}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-calendar text-slate-300 text-4xl mb-4"></i>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No bookings found</h3>
                  <p className="text-slate-500">Try adjusting your search filters.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

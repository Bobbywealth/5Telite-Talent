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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Form schemas
const bookingRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  clientId: z.string().min(1, "Client is required"),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  rate: z.string().optional(),
  deliverables: z.string().optional(),
  notes: z.string().optional(),
});

export default function AdminBookings() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    page: 1,
  });
  
  // Booking request modal states
  const [showCreateRequest, setShowCreateRequest] = useState(false);
  const [showTalentSelection, setShowTalentSelection] = useState(false);
  const [selectedTalents, setSelectedTalents] = useState<string[]>([]);
  const [newBookingId, setNewBookingId] = useState<string>("");
  
  // Form for creating booking requests
  const form = useForm<z.infer<typeof bookingRequestSchema>>({
    resolver: zodResolver(bookingRequestSchema),
    defaultValues: {
      title: "",
      clientId: "",
      location: "",
      startDate: "",
      endDate: "",
      rate: "",
      deliverables: "",
      notes: "",
    },
  });

  // Fetch all talents for talent selection
  const { data: talentsData } = useQuery({
    queryKey: ["/api/talents"],
    queryFn: async () => {
      const response = await fetch("/api/talents?limit=100", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch talents");
      return response.json();
    },
    enabled: isAuthenticated && user?.role === 'admin',
  });

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

  // Create booking request mutation
  const createBookingRequestMutation = useMutation({
    mutationFn: async (data: z.infer<typeof bookingRequestSchema>) => {
      // Create a basic client user for the booking
      const clientData = {
        role: "client" as const,
        email: `client-${Date.now()}@5tagency.com`,
        firstName: "Client",
        lastName: "User",
      };

      const bookingData = {
        ...data,
        clientId: user?.id, // Use admin as client for now
        createdBy: user?.id,
        code: `BK-${Date.now()}`,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        rate: data.rate ? parseFloat(data.rate) : undefined,
        status: "inquiry",
      };

      return apiRequest("POST", "/api/bookings", bookingData);
    },
    onSuccess: (booking) => {
      setNewBookingId(booking.id);
      setShowCreateRequest(false);
      setShowTalentSelection(true);
      form.reset();
      toast({
        title: "Success",
        description: "Booking created! Now select talents to send requests.",
      });
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

  // Send booking requests to selected talents
  const sendRequestsMutation = useMutation({
    mutationFn: async ({ bookingId, talentIds }: { bookingId: string; talentIds: string[] }) => {
      return apiRequest("POST", `/api/bookings/${bookingId}/request-talents`, { talentIds });
    },
    onSuccess: () => {
      setShowTalentSelection(false);
      setSelectedTalents([]);
      setNewBookingId("");
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Success",
        description: "Booking requests sent successfully to selected talents!",
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
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Booking Management</h1>
              <span className="text-sm text-slate-600">
                {bookingsData ? `${bookingsData.bookings.length} of ${bookingsData.total} bookings` : "Loading..."}
              </span>
            </div>
            <div className="flex space-x-3">
              <Dialog open={showCreateRequest} onOpenChange={setShowCreateRequest}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-booking-request">
                    <i className="fas fa-plus mr-2"></i>Create Booking Request
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Booking Request</DialogTitle>
                    <DialogDescription>
                      Create a new booking and send requests to talents
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => createBookingRequestMutation.mutate(data))} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project Title</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Commercial Shoot for Brand X" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Los Angeles, CA" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="rate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rate (Optional)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="Enter amount" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="deliverables"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Deliverables</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Describe what's needed..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Notes</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Any additional information..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowCreateRequest(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createBookingRequestMutation.isPending}
                          data-testid="button-submit-booking-request"
                        >
                          {createBookingRequestMutation.isPending ? "Creating..." : "Create & Select Talents"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* Talent Selection Modal */}
        <Dialog open={showTalentSelection} onOpenChange={setShowTalentSelection}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Select Talents for Booking Request</DialogTitle>
              <DialogDescription>
                Choose which talents to send this booking request to
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {talentsData?.talents?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {talentsData.talents.map((talent: any) => (
                    <div 
                      key={talent.userId} 
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50"
                    >
                      <Checkbox
                        id={talent.userId}
                        checked={selectedTalents.includes(talent.userId)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTalents([...selectedTalents, talent.userId]);
                          } else {
                            setSelectedTalents(selectedTalents.filter(id => id !== talent.userId));
                          }
                        }}
                        data-testid={`checkbox-talent-${talent.userId}`}
                      />
                      <div className="flex-1">
                        <label 
                          htmlFor={talent.userId}
                          className="font-medium text-slate-900 cursor-pointer"
                        >
                          {talent.user.firstName} {talent.user.lastName}
                        </label>
                        {talent.stageName && (
                          <p className="text-sm text-slate-600">"{talent.stageName}"</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {talent.categories?.slice(0, 3).map((category: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-8">No approved talents found</p>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <p className="text-sm text-slate-600">
                  {selectedTalents.length} talent{selectedTalents.length !== 1 ? 's' : ''} selected
                </p>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowTalentSelection(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => {
                      if (selectedTalents.length > 0) {
                        sendRequestsMutation.mutate({ 
                          bookingId: newBookingId, 
                          talentIds: selectedTalents 
                        });
                      }
                    }}
                    disabled={selectedTalents.length === 0 || sendRequestsMutation.isPending}
                    data-testid="button-send-requests"
                  >
                    {sendRequestsMutation.isPending ? "Sending..." : `Send Requests (${selectedTalents.length})`}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

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
                                  <div key={bt.id} className="flex items-center justify-between">
                                    <p className="text-sm text-slate-600">
                                      {bt.talent.firstName} {bt.talent.lastName}
                                    </p>
                                    <Badge 
                                      variant={
                                        bt.requestStatus === 'accepted' ? 'default' :
                                        bt.requestStatus === 'declined' ? 'destructive' : 'secondary'
                                      }
                                      className="ml-2 text-xs"
                                    >
                                      {bt.requestStatus}
                                    </Badge>
                                  </div>
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

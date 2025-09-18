import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import AdminSidebar from "@/components/layout/admin-sidebar";
import AdminNavbar from "@/components/layout/admin-navbar"; // Import AdminNavbar
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
  clientId: z.string().optional(), // Made optional since it's set automatically in the mutation
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

  // Talent search and filtering states
  const [talentSearch, setTalentSearch] = useState("");
  const [talentCategoryFilter, setTalentCategoryFilter] = useState("");
  const [filteredTalents, setFilteredTalents] = useState<any[]>([]);

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
    queryKey: ["/api/talents?limit=100"],
    queryFn: getQueryFn(),
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
        // Remove code - it's auto-generated by server
        startDate: new Date(data.startDate).toISOString(), // Convert to ISO string for JSON
        endDate: new Date(data.endDate).toISOString(), // Convert to ISO string for JSON
        rate: data.rate && data.rate.trim() ? parseFloat(data.rate) : undefined,
        status: "inquiry",
      };
      
      console.log("Final booking data being sent:", bookingData);

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
      return apiRequest("POST", `/api/bookings/${bookingId}/send-requests`, { talentIds });
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

  // Filter talents based on search and category
  useEffect(() => {
    if (talentsData?.talents) {
      let filtered = talentsData.talents;

      // Only show approved talents
      filtered = filtered.filter((talent: any) => talent.approvalStatus === 'approved');

      // Search filter
      if (talentSearch) {
        filtered = filtered.filter((talent: any) => {
          const fullName = `${talent.user.firstName} ${talent.user.lastName}`.toLowerCase();
          const stageName = talent.stageName?.toLowerCase() || "";
          const searchTerm = talentSearch.toLowerCase();
          return fullName.includes(searchTerm) || stageName.includes(searchTerm);
        });
      }

      // Category filter
      if (talentCategoryFilter) {
        filtered = filtered.filter((talent: any) => 
          talent.categories?.includes(talentCategoryFilter)
        );
      }

      console.log("Filtered talents:", filtered.length, "out of", talentsData.talents.length);
      setFilteredTalents(filtered);
    } else {
      console.log("No talents data available");
      setFilteredTalents([]);
    }
  }, [talentsData, talentSearch, talentCategoryFilter]);

  // Get unique categories for filter dropdown
  const getUniqueCategories = () => {
    if (!talentsData?.talents) return [];
    const categories = new Set<string>();
    talentsData.talents.forEach((talent: any) => {
      talent.categories?.forEach((category: string) => categories.add(category));
    });
    return Array.from(categories).sort();
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
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      window.location.href = '/api/login';
      return null;
    }

    // Show unauthorized message if wrong role
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Access Denied</h1>
          <p className="text-slate-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar />

      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img 
                src="/attached_assets/5t-logo.png" 
                alt="5T Talent Platform" 
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Booking Management</h1>
                <span className="text-sm text-slate-600">
                  {bookingsData ? `${bookingsData.bookings.length} of ${bookingsData.total} bookings` : "Loading..."}
                </span>
              </div>
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
                    <form onSubmit={form.handleSubmit((data) => {
                      console.log("Form data being submitted:", data);
                      console.log("Form errors:", form.formState.errors);
                      createBookingRequestMutation.mutate(data);
                    })} className="space-y-4">
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
          <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Select Talents for Booking Request</DialogTitle>
              <DialogDescription>
                Search and browse the talent directory to select who should receive this booking request
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
              {/* Search and Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <Label htmlFor="talent-search" className="text-sm font-medium">Search Talents</Label>
                  <Input
                    id="talent-search"
                    placeholder="Search by name or stage name..."
                    value={talentSearch}
                    onChange={(e) => setTalentSearch(e.target.value)}
                    className="mt-1"
                    data-testid="input-talent-search"
                  />
                </div>
                <div>
                  <Label htmlFor="category-filter" className="text-sm font-medium">Filter by Category</Label>
                  <Select value={talentCategoryFilter || "all"} onValueChange={(value) => setTalentCategoryFilter(value === "all" ? "" : value)}>
                    <SelectTrigger className="mt-1" data-testid="select-talent-category">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {getUniqueCategories().map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Results Summary */}
              <div className="flex justify-between items-center px-2">
                <p className="text-sm text-slate-600">
                  Showing {filteredTalents.length} talent{filteredTalents.length !== 1 ? 's' : ''}
                  {talentSearch && ` matching "${talentSearch}"`}
                  {talentCategoryFilter && ` in ${talentCategoryFilter}`}
                </p>
                <p className="text-sm font-medium text-primary">
                  {selectedTalents.length} selected
                </p>
              </div>

              {/* Talent Directory Grid */}
              <div className="flex-1 overflow-y-auto">
                {filteredTalents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
                    {filteredTalents.map((talent: any) => (
                      <div 
                        key={talent.userId} 
                        className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                          selectedTalents.includes(talent.userId) 
                            ? 'border-primary bg-primary/5 shadow-sm' 
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                        onClick={() => {
                          console.log("Talent clicked:", talent.user.firstName, talent.user.lastName);
                          if (selectedTalents.includes(talent.userId)) {
                            setSelectedTalents(selectedTalents.filter(id => id !== talent.userId));
                          } else {
                            setSelectedTalents([...selectedTalents, talent.userId]);
                          }
                        }}
                        data-testid={`card-talent-${talent.userId}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900">
                              {talent.user.firstName} {talent.user.lastName}
                            </h4>
                            {talent.stageName && (
                              <p className="text-sm text-slate-600 italic">"{talent.stageName}"</p>
                            )}
                          </div>
                          <Checkbox
                            checked={selectedTalents.includes(talent.userId)}
                            onChange={() => {}} // Handled by card click
                            className="pointer-events-none"
                            data-testid={`checkbox-talent-${talent.userId}`}
                          />
                        </div>

                        {/* Location and Contact */}
                        <div className="space-y-1 mb-3">
                          {talent.location && (
                            <p className="text-xs text-slate-500">📍 {talent.location}</p>
                          )}
                          <p className="text-xs text-slate-500">✉️ {talent.user.email}</p>
                        </div>

                        {/* Categories */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {talent.categories?.slice(0, 4).map((category: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                          {talent.categories?.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{talent.categories.length - 4} more
                            </Badge>
                          )}
                        </div>

                        {/* Experience Level */}
                        {talent.experienceLevel && (
                          <div className="text-xs text-slate-600">
                            <span className="font-medium">Experience:</span> {talent.experienceLevel}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No talents found</h3>
                    <p className="text-slate-600 mb-4">
                      {talentSearch || talentCategoryFilter 
                        ? "Try adjusting your search or filters" 
                        : "No approved talents are available"}
                    </p>
                    {(talentSearch || talentCategoryFilter) && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setTalentSearch("");
                          setTalentCategoryFilter("");
                        }}
                        className="mt-2"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="flex justify-between items-center pt-4 border-t bg-white">
                <div className="text-sm text-slate-600">
                  {selectedTalents.length > 0 && (
                    <span>
                      Ready to send booking request to {selectedTalents.length} talent{selectedTalents.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowTalentSelection(false);
                      setTalentSearch("");
                      setTalentCategoryFilter("");
                      setSelectedTalents([]);
                    }}
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
                    className="min-w-[140px]"
                  >
                    {sendRequestsMutation.isPending ? "Sending..." : selectedTalents.length > 0 ? `Send to ${selectedTalents.length}` : "Select Talents"}
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
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

export default function AdminTalents() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    approvalStatus: "",
    page: 1,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTalentData, setNewTalentData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    stageName: "",
    bio: "",
    location: "",
    categories: [] as string[],
    skills: "",
  });

  // Authentication is handled by the Router component

  // Add talent mutation
  const addTalentMutation = useMutation({
    mutationFn: async (data: typeof newTalentData) => {
      // First create user
      const userResponse = await apiRequest("POST", "/api/admin/users", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: "talent",
        status: "active"
      });

      // Then create talent profile
      return apiRequest("POST", "/api/talents/admin-create", {
        userId: userResponse.id,
        stageName: data.stageName || `${data.firstName} ${data.lastName}`,
        location: data.location,
        bio: data.bio,
        categories: data.categories,
        skills: data.skills.split(",").map(s => s.trim()).filter(Boolean),
        approvalStatus: "approved"
      });
    },
    onSuccess: () => {
      toast({
        title: "Talent Added Successfully!",
        description: "The new talent has been created and approved.",
      });
      setShowAddForm(false);
      setNewTalentData({
        firstName: "",
        lastName: "",
        email: "",
        stageName: "",
        bio: "",
        location: "",
        categories: [],
        skills: "",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/talents"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error Adding Talent",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fetch talents with filters
  const { data: talentsData, isLoading: talentsLoading, error } = useQuery({
    queryKey: ["/api/talents", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.category) params.set("category", filters.category);
      if (filters.approvalStatus) params.set("approvalStatus", filters.approvalStatus);
      params.set("page", filters.page.toString());
      params.set("limit", "20");

      const response = await fetch(`/api/talents?${params}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch talents");
      return response.json();
    },
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  // Approve/Reject talent mutation
  const approveTalentMutation = useMutation({
    mutationFn: async ({ talentId, status }: { talentId: string; status: "approved" | "rejected" }) => {
      return apiRequest("PATCH", `/api/admin/talents/${talentId}/approve`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Talent status updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/talents"] });
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

  const getApprovalBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
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
            <h1 className="text-2xl font-bold text-slate-900">Talent Management</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">
                {talentsData ? `${talentsData.talents.length} of ${talentsData.total} talents` : "Loading..."}
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
                    placeholder="Search talents..."
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    data-testid="input-search-talents"
                  />
                </div>
                <div>
                  <Select value={filters.category} onValueChange={(value) => updateFilter('category', value === "all" ? "" : value)}>
                    <SelectTrigger data-testid="select-category-filter">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="Runway">Runway</SelectItem>
                      <SelectItem value="Editorial">Editorial</SelectItem>
                      <SelectItem value="On-Camera">On-Camera</SelectItem>
                      <SelectItem value="Voiceover">Voiceover</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={filters.approvalStatus} onValueChange={(value) => updateFilter('approvalStatus', value === "all" ? "" : value)}>
                    <SelectTrigger data-testid="select-approval-status">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Button 
                    variant="outline" 
                    onClick={() => setFilters({ search: "", category: "", approvalStatus: "", page: 1 })}
                    data-testid="button-clear-filters"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Talents Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Talent Directory</CardTitle>
              <Button onClick={() => setShowAddForm(true)} data-testid="button-add-talent">
                <i className="fas fa-plus mr-2"></i>Add Talent
              </Button>
            </CardHeader>
            <CardContent>
              {talentsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600">Error loading talents: {error.message}</p>
                </div>
              ) : talentsData?.talents?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Talent</TableHead>
                      <TableHead>Categories</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {talentsData.talents.map((talent: any) => (
                      <TableRow key={talent.id} data-testid={`row-talent-${talent.id}`}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {talent.user.profileImageUrl ? (
                              <img 
                                src={talent.user.profileImageUrl} 
                                alt={`${talent.user.firstName} ${talent.user.lastName}`}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                                <i className="fas fa-user text-slate-400"></i>
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-slate-900" data-testid={`text-talent-name-${talent.id}`}>
                                {talent.user.firstName} {talent.user.lastName}
                              </p>
                              {talent.stageName && (
                                <p className="text-sm text-slate-600">{talent.stageName}</p>
                              )}
                              <p className="text-xs text-slate-500">{talent.user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {talent.categories?.slice(0, 2).map((category: string) => (
                              <Badge key={category} variant="outline" className="text-xs">
                                {category}
                              </Badge>
                            ))}
                            {talent.categories?.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{talent.categories.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600">{talent.location || "—"}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getApprovalBadgeVariant(talent.approvalStatus)} data-testid={`badge-status-${talent.id}`}>
                            {talent.approvalStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" data-testid={`button-view-${talent.id}`}>
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>{talent.user.firstName} {talent.user.lastName}</DialogTitle>
                                  <DialogDescription>
                                    Talent profile details and approval actions
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium">Contact</h4>
                                      <p className="text-sm text-slate-600">{talent.user.email}</p>
                                      {talent.user.phone && (
                                        <p className="text-sm text-slate-600">{talent.user.phone}</p>
                                      )}
                                    </div>
                                    <div>
                                      <h4 className="font-medium">Location</h4>
                                      <p className="text-sm text-slate-600">{talent.location || "Not specified"}</p>
                                    </div>
                                  </div>
                                  
                                  {talent.bio && (
                                    <div>
                                      <h4 className="font-medium">Bio</h4>
                                      <p className="text-sm text-slate-600">{talent.bio}</p>
                                    </div>
                                  )}
                                  
                                  <div className="flex space-x-2">
                                    {talent.approvalStatus === 'pending' && (
                                      <>
                                        <Button
                                          onClick={() => approveTalentMutation.mutate({ 
                                            talentId: talent.userId, 
                                            status: 'approved' 
                                          })}
                                          disabled={approveTalentMutation.isPending}
                                          data-testid={`button-approve-${talent.id}`}
                                        >
                                          <i className="fas fa-check mr-2"></i>Approve
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          onClick={() => approveTalentMutation.mutate({ 
                                            talentId: talent.userId, 
                                            status: 'rejected' 
                                          })}
                                          disabled={approveTalentMutation.isPending}
                                          data-testid={`button-reject-${talent.id}`}
                                        >
                                          <i className="fas fa-times mr-2"></i>Reject
                                        </Button>
                                      </>
                                    )}
                                    {talent.approvalStatus === 'rejected' && (
                                      <Button
                                        onClick={() => approveTalentMutation.mutate({ 
                                          talentId: talent.userId, 
                                          status: 'approved' 
                                        })}
                                        disabled={approveTalentMutation.isPending}
                                        data-testid={`button-approve-${talent.id}`}
                                      >
                                        <i className="fas fa-check mr-2"></i>Approve
                                      </Button>
                                    )}
                                    {talent.approvalStatus === 'approved' && (
                                      <Button
                                        variant="destructive"
                                        onClick={() => approveTalentMutation.mutate({ 
                                          talentId: talent.userId, 
                                          status: 'rejected' 
                                        })}
                                        disabled={approveTalentMutation.isPending}
                                        data-testid={`button-reject-${talent.id}`}
                                      >
                                        <i className="fas fa-times mr-2"></i>Reject
                                      </Button>
                                    )}
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
                  <i className="fas fa-users text-slate-300 text-4xl mb-4"></i>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No talents found</h3>
                  <p className="text-slate-500">Try adjusting your search filters.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Add Talent Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Talent</DialogTitle>
            <DialogDescription>
              Create a new talent profile that will be automatically approved.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">First Name</label>
                <Input
                  value={newTalentData.firstName}
                  onChange={(e) => setNewTalentData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Last Name</label>
                <Input
                  value={newTalentData.lastName}
                  onChange={(e) => setNewTalentData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={newTalentData.email}
                onChange={(e) => setNewTalentData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Stage Name (Optional)</label>
              <Input
                value={newTalentData.stageName}
                onChange={(e) => setNewTalentData(prev => ({ ...prev, stageName: e.target.value }))}
                placeholder="Professional stage name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                value={newTalentData.location}
                onChange={(e) => setNewTalentData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, State"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Bio</label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md"
                value={newTalentData.bio}
                onChange={(e) => setNewTalentData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Brief biography and experience"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Skills (comma-separated)</label>
              <Input
                value={newTalentData.skills}
                onChange={(e) => setNewTalentData(prev => ({ ...prev, skills: e.target.value }))}
                placeholder="Acting, Modeling, Dancing, etc."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => addTalentMutation.mutate(newTalentData)}
              disabled={addTalentMutation.isPending || !newTalentData.firstName || !newTalentData.lastName || !newTalentData.email}
            >
              {addTalentMutation.isPending ? "Creating..." : "Add Talent"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { ObjectUploader } from "@/components/ObjectUploader";
import AdminSidebar from "@/components/layout/admin-sidebar";
import AdminNavbar from "@/components/layout/admin-navbar";
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
import { Menu } from "lucide-react";
import { NotificationBell } from "@/components/ui/notification-bell";

export default function AdminTalents() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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
    phoneNumber: "",
    stageName: "",
    location: "",
    bio: "",
    categories: [] as string[],
    skills: "",
    experience: "",
    height: "",
    weight: "",
    hairColor: "",
    eyeColor: "",
    uploadedImages: [] as string[],
  });

  // Categories for talent selection
  const categories = [
    "Actor", "Model", "Dancer", "Singer", "Musician", "Voice Over",
    "Comedian", "Host", "Stunt Performer", "Writer", "Poet",
    "Visual Artist", "Motivational Speaker"
  ];

  // Handle category selection
  const handleCategoryChange = (category: string, checked: boolean) => {
    setNewTalentData(prev => ({
      ...prev,
      categories: checked
        ? [...prev.categories, category]
        : prev.categories.filter(c => c !== category)
    }));
  };

  // Handle image uploads
  const handleGetUploadParameters = async () => {
    const response = await apiRequest("POST", "/api/objects/upload", {});
    return {
      method: "PUT" as const,
      url: response.uploadURL,
    };
  };

  const handleImageUploadComplete = (uploadedFiles: { objectName: string; fileName: string }[]) => {
    // Add the uploaded files to the talent data
    setNewTalentData(prev => ({
      ...prev,
      uploadedImages: [...prev.uploadedImages, ...uploadedFiles.map(f => f.objectName)]
    }));
    
    toast({
      title: "Upload successful",
      description: `${uploadedFiles.length} photo(s) uploaded successfully`,
    });
  };

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
        experience: data.experience,
        measurements: {
          height: data.height || null,
          weight: data.weight || null,
          hairColor: data.hairColor || null,
          eyeColor: data.eyeColor || null
        },
        social: {
          phoneNumber: data.phoneNumber
        },
        mediaUrls: data.uploadedImages,
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
        phoneNumber: "",
        stageName: "",
        location: "",
        bio: "",
        categories: [],
        skills: "",
        experience: "",
        height: "",
        weight: "",
        hairColor: "",
        eyeColor: "",
        uploadedImages: [],
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
              <h1 className="text-2xl font-bold text-slate-900">Talent Management</h1>
            </div>
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
                                      <div className="flex items-center space-x-2">
                                        <Badge variant="default" className="bg-green-100 text-green-800">
                                          <i className="fas fa-check mr-1"></i>Approved
                                        </Badge>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => approveTalentMutation.mutate({
                                            talentId: talent.userId,
                                            status: 'rejected'
                                          })}
                                          disabled={approveTalentMutation.isPending}
                                          data-testid={`button-revoke-${talent.id}`}
                                        >
                                          <i className="fas fa-user-times mr-2"></i>Revoke Approval
                                        </Button>
                                      </div>
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
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={newTalentData.firstName}
                    onChange={(e) => setNewTalentData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={newTalentData.lastName}
                    onChange={(e) => setNewTalentData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newTalentData.email}
                    onChange={(e) => setNewTalentData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={newTalentData.phoneNumber}
                    onChange={(e) => setNewTalentData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stageName">Stage/Professional Name</Label>
                  <Input
                    id="stageName"
                    value={newTalentData.stageName}
                    onChange={(e) => setNewTalentData(prev => ({ ...prev, stageName: e.target.value }))}
                    placeholder="If different from legal name"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newTalentData.location}
                    onChange={(e) => setNewTalentData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, State"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Professional Information</h3>

              <div>
                <Label>Talent Categories * (Select all that apply)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={newTalentData.categories.includes(category)}
                        onCheckedChange={(checked) => handleCategoryChange(category, !!checked)}
                      />
                      <Label htmlFor={category} className="text-sm">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="skills">Skills & Specialties</Label>
                <Input
                  id="skills"
                  value={newTalentData.skills}
                  onChange={(e) => setNewTalentData(prev => ({ ...prev, skills: e.target.value }))}
                  placeholder="e.g., Ballet, Jazz Dance, Improv, Guitar, etc. (separate with commas)"
                />
              </div>

              <div>
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  rows={4}
                  value={newTalentData.bio}
                  onChange={(e) => setNewTalentData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about your background, experience, and what makes you unique..."
                />
              </div>

              <div>
                <Label htmlFor="experience">Years of Experience</Label>
                <Select
                  value={newTalentData.experience}
                  onValueChange={(value) => setNewTalentData(prev => ({ ...prev, experience: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1">0-1 years</SelectItem>
                    <SelectItem value="2-5">2-5 years</SelectItem>
                    <SelectItem value="6-10">6-10 years</SelectItem>
                    <SelectItem value="10+">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Physical Characteristics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Physical Characteristics <span className="text-sm text-slate-500">(Optional, for modeling/acting)</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    value={newTalentData.height}
                    onChange={(e) => setNewTalentData(prev => ({ ...prev, height: e.target.value }))}
                    placeholder="5'8&quot;"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    value={newTalentData.weight}
                    onChange={(e) => setNewTalentData(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="150 lbs"
                  />
                </div>
                <div>
                  <Label htmlFor="hairColor">Hair Color</Label>
                  <Input
                    id="hairColor"
                    value={newTalentData.hairColor}
                    onChange={(e) => setNewTalentData(prev => ({ ...prev, hairColor: e.target.value }))}
                    placeholder="Brown"
                  />
                </div>
                <div>
                  <Label htmlFor="eyeColor">Eye Color</Label>
                  <Input
                    id="eyeColor"
                    value={newTalentData.eyeColor}
                    onChange={(e) => setNewTalentData(prev => ({ ...prev, eyeColor: e.target.value }))}
                    placeholder="Brown"
                  />
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Photos</h3>
              <div className="flex flex-col space-y-4">
                <ObjectUploader
                  maxNumberOfFiles={5}
                  maxFileSize={10485760}
                  onComplete={handleImageUploadComplete}
                  buttonClassName="w-full"
                  prefix="headshots"
                >
                  <div className="flex items-center gap-2">
                    <i className="fas fa-camera"></i>
                    <span>Upload Photos (up to 5)</span>
                  </div>
                </ObjectUploader>
                {newTalentData.uploadedImages.length > 0 && (
                  <div className="text-sm text-green-600">
                    {newTalentData.uploadedImages.length} photo(s) uploaded successfully
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => addTalentMutation.mutate(newTalentData)}
              disabled={addTalentMutation.isPending || !newTalentData.firstName || !newTalentData.lastName || !newTalentData.email || newTalentData.categories.length === 0}
            >
              {addTalentMutation.isPending ? "Creating..." : "Add Talent"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
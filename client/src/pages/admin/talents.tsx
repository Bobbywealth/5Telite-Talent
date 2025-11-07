import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { ObjectUploader } from "@/components/ObjectUploader";
import { GcsImage } from "@/components/GcsImage";
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
import { Menu, Trash2 } from "lucide-react";
import { NotificationBell } from "@/components/ui/notification-bell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [editingTalent, setEditingTalent] = useState<any>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [deletingTalent, setDeletingTalent] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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
      console.error('Error adding talent - Full error object:', error);
      console.error('Error details:', {
        response: error?.response,
        data: error?.response?.data,
        message: error?.message,
        status: error?.response?.status
      });
      
      // Extract the most specific error message
      const errorMessage = error?.response?.data?.message 
        || error?.data?.message 
        || error?.message 
        || "Failed to add talent. Please check all required fields.";
      
      const statusCode = error?.response?.status || error?.status || 'Unknown';
      
      toast({
        title: "Error Adding Talent",
        description: `Status ${statusCode}: ${errorMessage}`,
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

  // Delete talent mutation
  const deleteTalentMutation = useMutation({
    mutationFn: async (talentId: string) => {
      return apiRequest("DELETE", `/api/admin/talents/${talentId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Talent profile deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/talents"] });
      setShowDeleteDialog(false);
      setDeletingTalent(null);
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
      setShowDeleteDialog(false);
      setDeletingTalent(null);
    },
  });

  // Update talent mutation
  const updateTalentMutation = useMutation({
    mutationFn: async ({ talentId, talentData, userData }: { 
      talentId: string; 
      talentData: any; 
      userData: any; 
    }) => {
      try {
        // Update user information first
        const userResult = await apiRequest("PATCH", `/api/users/${userData.id}`, {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
        });

        // Update talent profile
        const talentResult = await apiRequest("PATCH", `/api/talents/${talentId}`, {
          stageName: talentData.stageName,
          bio: talentData.bio,
          location: talentData.location,
          experience: talentData.experience,
          unionStatus: talentData.unionStatus,
          categories: talentData.categories,
          skills: talentData.skills,
          approvalStatus: talentData.approvalStatus,
          mediaUrls: talentData.mediaUrls,
        });
        
        return talentResult;
      } catch (error) {
        console.error('Error in updateTalentMutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Talent profile updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/talents"] });
      setShowEditForm(false);
      setEditingTalent(null);
    },
    onError: (error: any) => {
      console.error("Error updating talent:", error);
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
      
      // Show more specific error message
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to update talent profile.";
      toast({
        title: "Error",
        description: errorMessage,
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
                      <TableHead className="w-80">Talent Profile</TableHead>
                      <TableHead>Categories & Skills</TableHead>
                      <TableHead>Experience & Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {talentsData.talents.map((talent: any) => (
                      <TableRow key={talent.id} data-testid={`row-talent-${talent.id}`} className="h-24">
                        <TableCell className="py-4">
                          <div className="flex items-center space-x-4">
                            {/* Profile Image */}
                            <div className="flex-shrink-0">
                              {talent.mediaUrls && talent.mediaUrls.length > 0 ? (
                                <GcsImage 
                                  objectName={talent.mediaUrls[0]}
                                  alt={`${talent.user.firstName} ${talent.user.lastName}`}
                                  className="w-16 h-16 rounded-full object-cover border-2 border-slate-200"
                                  fallback={
                                    <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center border-2 border-slate-200">
                                      <i className="fas fa-user text-slate-400 text-lg"></i>
                                    </div>
                                  }
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center border-2 border-slate-200">
                                  <i className="fas fa-user text-slate-400 text-lg"></i>
                                </div>
                              )}
                            </div>
                            
                            {/* Talent Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-slate-900 truncate" data-testid={`text-talent-name-${talent.id}`}>
                                  {talent.user.firstName} {talent.user.lastName}
                                </p>
                                {talent.stageName && (
                                  <Badge variant="secondary" className="text-xs">
                                    {talent.stageName}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 truncate mb-1">{talent.user.email}</p>
                              {talent.bio && (
                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                  {talent.bio.substring(0, 120)}{talent.bio.length > 120 ? '...' : ''}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="py-4">
                          <div className="space-y-2">
                            {/* Categories */}
                            <div className="flex flex-wrap gap-1">
                              {talent.categories?.slice(0, 3).map((category: string) => (
                                <Badge key={category} variant="outline" className="text-xs">
                                  {category}
                                </Badge>
                              ))}
                              {talent.categories?.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{talent.categories.length - 3}
                                </Badge>
                              )}
                            </div>
                            
                            {/* Top Skills */}
                            {talent.skills && talent.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {talent.skills.slice(0, 2).map((skill: string) => (
                                  <Badge key={skill} variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                                    {skill}
                                  </Badge>
                                ))}
                                {talent.skills.length > 2 && (
                                  <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                                    +{talent.skills.length - 2} skills
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            {talent.experience && (
                              <div className="flex items-center gap-1 text-sm text-slate-600">
                                <i className="fas fa-clock text-xs"></i>
                                <span>{talent.experience} experience</span>
                              </div>
                            )}
                            {talent.location && (
                              <div className="flex items-center gap-1 text-sm text-slate-600">
                                <i className="fas fa-map-marker-alt text-xs"></i>
                                <span>{talent.location}</span>
                              </div>
                            )}
                            {talent.unionStatus && (
                              <div className="flex items-center gap-1 text-sm text-slate-600">
                                <i className="fas fa-certificate text-xs"></i>
                                <span>{talent.unionStatus}</span>
                              </div>
                            )}
                            {talent.mediaUrls && talent.mediaUrls.length > 1 && (
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <i className="fas fa-images"></i>
                                <span>{talent.mediaUrls.length} photos</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell className="py-4">
                          <Badge variant={getApprovalBadgeVariant(talent.approvalStatus)} data-testid={`badge-status-${talent.id}`}>
                            {talent.approvalStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              data-testid={`button-edit-${talent.id}`} 
                              className="text-xs"
                              onClick={() => {
                                setEditingTalent(talent);
                                setShowEditForm(true);
                              }}
                            >
                              <i className="fas fa-edit mr-1"></i>
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              data-testid={`button-delete-${talent.id}`} 
                              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setDeletingTalent(talent);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" data-testid={`button-view-${talent.id}`} className="text-xs">
                                  <i className="fas fa-eye mr-1"></i>
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
                            
                            {/* Quick Actions */}
                            {talent.approvalStatus === 'pending' && (
                              <Button 
                                size="sm"
                                onClick={() => approveTalentMutation.mutate({
                                  talentId: talent.userId,
                                  status: 'approved'
                                })}
                                disabled={approveTalentMutation.isPending}
                                className="text-xs bg-green-600 hover:bg-green-700"
                              >
                                <i className="fas fa-check mr-1"></i>
                                Approve
                              </Button>
                            )}
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

              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  Talent Categories <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-gray-600">Select at least one category that applies</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={newTalentData.categories.includes(category)}
                        onCheckedChange={(checked) => handleCategoryChange(category, !!checked)}
                      />
                      <Label htmlFor={category} className="text-sm cursor-pointer">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
                {newTalentData.categories.length > 0 && (
                  <p className="text-sm text-green-600 font-medium">
                    ✓ {newTalentData.categories.length} category(ies) selected
                  </p>
                )}
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
                  <SelectContent className="z-[100000]" position="popper" side="bottom" align="start" sideOffset={5}>
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
              onClick={() => {
                // Validate required fields
                if (!newTalentData.firstName || !newTalentData.lastName || !newTalentData.email) {
                  toast({
                    title: "Missing Required Fields",
                    description: "Please fill in First Name, Last Name, and Email",
                    variant: "destructive",
                  });
                  return;
                }
                if (newTalentData.categories.length === 0) {
                  toast({
                    title: "Category Required",
                    description: "Please select at least one talent category (Actor, Model, Dancer, etc.)",
                    variant: "destructive",
                  });
                  return;
                }
                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(newTalentData.email)) {
                  toast({
                    title: "Invalid Email",
                    description: "Please enter a valid email address",
                    variant: "destructive",
                  });
                  return;
                }
                
                addTalentMutation.mutate(newTalentData);
              }}
              disabled={addTalentMutation.isPending}
              className="min-w-[120px]"
            >
              {addTalentMutation.isPending ? "Creating..." : "Add Talent"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Talent Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Talent Profile</DialogTitle>
            <DialogDescription>
              Update talent profile information and settings.
            </DialogDescription>
          </DialogHeader>
          {editingTalent && (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <Input
                      value={editingTalent.user.firstName || ""}
                      onChange={(e) => setEditingTalent({
                        ...editingTalent,
                        user: { ...editingTalent.user, firstName: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <Input
                      value={editingTalent.user.lastName || ""}
                      onChange={(e) => setEditingTalent({
                        ...editingTalent,
                        user: { ...editingTalent.user, lastName: e.target.value }
                      })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      value={editingTalent.user.email || ""}
                      onChange={(e) => setEditingTalent({
                        ...editingTalent,
                        user: { ...editingTalent.user, email: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <Input
                      value={editingTalent.user.phone || ""}
                      onChange={(e) => setEditingTalent({
                        ...editingTalent,
                        user: { ...editingTalent.user, phone: e.target.value }
                      })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stage Name</label>
                  <Input
                    value={editingTalent.stageName || ""}
                    onChange={(e) => setEditingTalent({
                      ...editingTalent,
                      stageName: e.target.value
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <Textarea
                    value={editingTalent.bio || ""}
                    onChange={(e) => setEditingTalent({
                      ...editingTalent,
                      bio: e.target.value
                    })}
                    rows={3}
                  />
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Professional Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <Input
                      value={editingTalent.location || ""}
                      onChange={(e) => setEditingTalent({
                        ...editingTalent,
                        location: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Experience</label>
                    <select
                      value={editingTalent.experience || ""}
                      onChange={(e) => setEditingTalent({
                        ...editingTalent,
                        experience: e.target.value
                      })}
                      className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select experience level</option>
                      <option value="0-1 experience">0-1 experience</option>
                      <option value="1-2 years">1-2 years</option>
                      <option value="2-3 years">2-3 years</option>
                      <option value="3-5 years">3-5 years</option>
                      <option value="5-7 years">5-7 years</option>
                      <option value="7-10 years">7-10 years</option>
                      <option value="10-15 years">10-15 years</option>
                      <option value="15-20 years">15-20 years</option>
                      <option value="20+ years">20+ years</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Union Status</label>
                  <select
                    value={editingTalent.unionStatus || ""}
                    onChange={(e) => setEditingTalent({
                      ...editingTalent,
                      unionStatus: e.target.value
                    })}
                    className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select union status</option>
                    <option value="SAG-AFTRA">SAG-AFTRA</option>
                    <option value="Non-Union">Non-Union</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Categories & Skills */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Categories & Skills</h3>
                
                {/* Categories - What type of talent */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Primary Categories 
                    <span className="text-xs text-gray-500 ml-2">(What type of performer are you?)</span>
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editingTalent.categories?.map((category: string) => (
                      <Badge key={category} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                        {category}
                        <button
                          type="button"
                          onClick={() => setEditingTalent({
                            ...editingTalent,
                            categories: editingTalent.categories.filter((c: string) => c !== category)
                          })}
                          className="ml-1 text-xs hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <select
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value && !editingTalent.categories?.includes(value)) {
                        setEditingTalent({
                          ...editingTalent,
                          categories: [...(editingTalent.categories || []), value]
                        });
                        e.target.value = ""; // Reset selection
                      }
                    }}
                    className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a category to add</option>
                    <option value="Actor">Actor</option>
                    <option value="Model">Model</option>
                    <option value="Dancer">Dancer</option>
                    <option value="Singer">Singer</option>
                    <option value="Musician">Musician</option>
                    <option value="Voice Over">Voice Over</option>
                    <option value="Comedian">Comedian</option>
                    <option value="Host">Host/MC</option>
                    <option value="Stunt Performer">Stunt Performer</option>
                    <option value="Writer">Writer</option>
                    <option value="Poet">Poet</option>
                    <option value="Visual Artist">Visual Artist</option>
                    <option value="Motivational Speaker">Motivational Speaker</option>
                    <option value="DJ">DJ</option>
                    <option value="Producer">Producer</option>
                    <option value="Director">Director</option>
                  </select>
                </div>
                
                {/* Skills - Specific abilities */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Skills & Abilities
                    <span className="text-xs text-gray-500 ml-2">(Specific talents, e.g., Stage Combat, Piano, Spanish Fluent)</span>
                  </label>
                  <Textarea
                    value={Array.isArray(editingTalent.skills) ? editingTalent.skills.join(", ") : ""}
                    onChange={(e) => setEditingTalent({
                      ...editingTalent,
                      skills: e.target.value.split(",").map(s => s.trim()).filter(s => s.length > 0)
                    })}
                    rows={3}
                    placeholder="e.g., Stage Combat, Piano, Spanish Fluent, Social Media Marketing"
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate multiple skills with commas</p>
                </div>
              </div>

              {/* Photos Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Photos</h3>
                <div>
                  <label className="block text-sm font-medium mb-2">Profile Photos</label>
                  <ObjectUploader
                    maxNumberOfFiles={5}
                    maxFileSize={10485760}
                    onComplete={(uploads) => {
                      const newUrls = uploads.map(u => u.objectName);
                      setEditingTalent({
                        ...editingTalent,
                        mediaUrls: [...(editingTalent.mediaUrls || []), ...newUrls]
                      });
                    }}
                    buttonClassName="w-full"
                    prefix="headshots"
                  >
                    <div className="flex items-center gap-2">
                      <i className="fas fa-camera"></i>
                      <span>Upload Photos (up to 5)</span>
                    </div>
                  </ObjectUploader>
                  
                  {/* Display existing photos */}
                  {editingTalent.mediaUrls && editingTalent.mediaUrls.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">{editingTalent.mediaUrls.length} photo(s) uploaded</p>
                      <div className="grid grid-cols-3 gap-2">
                        {editingTalent.mediaUrls.map((url, index) => (
                          <div key={index} className="relative">
                            <GcsImage
                              objectName={url}
                              alt={`Photo ${index + 1}`}
                              className="w-full h-24 object-cover rounded"
                              fallback={
                                <div className="w-full h-24 bg-slate-200 flex items-center justify-center rounded">
                                  <i className="fas fa-image text-slate-400"></i>
                                </div>
                              }
                            />
                            <button
                              onClick={() => {
                                const newUrls = editingTalent.mediaUrls?.filter((_, i) => i !== index);
                                setEditingTalent({
                                  ...editingTalent,
                                  mediaUrls: newUrls
                                });
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-500 mt-2">Upload up to 5 photos total</p>
                </div>
              </div>

              {/* Approval Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Status</h3>
                <div>
                  <label className="block text-sm font-medium mb-1">Approval Status</label>
                  <select
                    value={editingTalent.approvalStatus || ""}
                    onChange={(e) => setEditingTalent({
                      ...editingTalent,
                      approvalStatus: e.target.value
                    })}
                    className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select approval status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditForm(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!editingTalent) return;
                
                updateTalentMutation.mutate({
                  talentId: editingTalent.userId,  // Use userId instead of talent profile id
                  talentData: editingTalent,
                  userData: editingTalent.user
                });
              }}
              disabled={updateTalentMutation.isPending}
            >
              {updateTalentMutation.isPending ? "Updating..." : "Update Talent"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Talent Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white border-2 border-red-200 shadow-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-red-600 flex items-center">
              <Trash2 className="h-5 w-5 mr-2" />
              Delete Talent Profile
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-700 text-base leading-relaxed">
              Are you sure you want to delete the talent profile for{" "}
              <strong className="text-red-600 font-semibold">{deletingTalent?.user?.firstName} {deletingTalent?.user?.lastName}</strong>?
              <br /><br />
              <span className="text-red-600 font-semibold">This action cannot be undone and will permanently remove:</span>
              <ul className="mt-3 ml-4 list-disc text-sm space-y-1 text-slate-600">
                <li>The talent profile and all associated data</li>
                <li>Profile images and media</li>
                <li>Booking history and assignments</li>
                <li>Task assignments and completion records</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel 
              disabled={deleteTalentMutation.isPending}
              className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTalentMutation.mutate(deletingTalent?.id)}
              disabled={deleteTalentMutation.isPending}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {deleteTalentMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Talent
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  );
}
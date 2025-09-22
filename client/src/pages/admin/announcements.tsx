import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
// Use nested div structure instead of AdminLayout
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Megaphone, Plus, Calendar, MapPin, Mail, Edit, Trash2, Eye } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Announcement, InsertAnnouncement } from "@shared/schema";

const createAnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.enum(["open-call", "event"]),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  date: z.string().min(1, "Date is required"),
  deadline: z.string().optional(),
  requirements: z.string(),
  compensation: z.string().optional(),
  contactEmail: z.string().email("Please enter a valid email"),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
});

type CreateAnnouncementForm = z.infer<typeof createAnnouncementSchema>;

export default function AdminAnnouncements() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<(Announcement & { createdBy: any }) | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const form = useForm<CreateAnnouncementForm>({
    resolver: zodResolver(createAnnouncementSchema),
    defaultValues: {
      title: "",
      category: "open-call",
      description: "",
      location: "",
      date: "",
      deadline: "",
      requirements: "",
      compensation: "",
      contactEmail: user?.email || "",
      featured: false,
      published: true,
    },
  });

  // Fetch announcements
  const { data: announcementsResult, isLoading } = useQuery({
    queryKey: ["/api/announcements", { search: searchQuery, category: selectedCategory !== "all" ? selectedCategory : undefined }],
    enabled: user?.role === "admin",
  });

  const announcements = (announcementsResult as any)?.announcements || [];

  // Create announcement mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateAnnouncementForm) => {
      const payload = {
        ...data,
        requirements: data.requirements.split('\n').filter(req => req.trim()),
        date: new Date(data.date).toISOString(),
        deadline: data.deadline ? new Date(data.deadline).toISOString() : null,
      };
      return apiRequest('POST', '/api/announcements', payload);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Announcement created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create announcement",
        variant: "destructive",
      });
    },
  });

  // Update announcement mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateAnnouncementForm> }) => {
      const payload: any = { ...data };
      if (data.requirements) {
        payload.requirements = data.requirements.split('\n').filter(req => req.trim());
      }
      if (data.date) {
        payload.date = new Date(data.date).toISOString();
      }
      if (data.deadline) {
        payload.deadline = new Date(data.deadline).toISOString();
      }
      return apiRequest('PATCH', `/api/announcements/${id}`, payload);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Announcement updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      setEditingAnnouncement(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update announcement",
        variant: "destructive",
      });
    },
  });

  // Delete announcement mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/announcements/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete announcement",
        variant: "destructive",
      });
    },
  });

  const handleCreateSubmit = (data: CreateAnnouncementForm) => {
    createMutation.mutate(data);
  };

  const handleEditSubmit = (data: CreateAnnouncementForm) => {
    if (editingAnnouncement) {
      updateMutation.mutate({ id: editingAnnouncement.id, data });
    }
  };

  const handleEditClick = (announcement: any) => {
    setEditingAnnouncement(announcement);
    form.reset({
      title: announcement.title,
      category: announcement.category,
      description: announcement.description,
      location: announcement.location,
      date: announcement.date ? new Date(announcement.date).toISOString().split('T')[0] : "",
      deadline: announcement.deadline ? new Date(announcement.deadline).toISOString().split('T')[0] : "",
      requirements: Array.isArray(announcement.requirements) ? announcement.requirements.join('\n') : "",
      compensation: announcement.compensation || "",
      contactEmail: announcement.contactEmail,
      featured: announcement.featured,
      published: announcement.published,
    });
  };

  const handleDeleteClick = (id: string) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3" data-testid="text-page-title">
              <Megaphone className="w-8 h-8 text-primary" />
              Announcements
            </h1>
            <p className="text-gray-600 mt-2">Manage casting calls, auditions, and events</p>
          </div>

          <Button 
            onClick={() => setIsCreateDialogOpen(true)} 
            data-testid="button-create-announcement"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Announcement
          </Button>
        </div>

        {/* Create/Edit Dialog */}
        <Dialog 
          open={isCreateDialogOpen || !!editingAnnouncement} 
          onOpenChange={(open) => {
            if (!open) {
              setIsCreateDialogOpen(false);
              setEditingAnnouncement(null);
              form.reset();
            }
          }}
        >
          <DialogContent 
            className="max-w-2xl max-h-[90vh] overflow-y-auto" 
            onPointerDownOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
          >
              <DialogHeader>
                <DialogTitle>
                  {editingAnnouncement ? "Edit Announcement" : "Create New Announcement"}
                </DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form 
                  onSubmit={form.handleSubmit(editingAnnouncement ? handleEditSubmit : handleCreateSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter announcement title" data-testid="input-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="open-call">Open Call</SelectItem>
                              <SelectItem value="event">Event</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={4}
                            placeholder="Provide detailed description..." 
                            data-testid="input-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Event location" data-testid="input-location" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="contact@example.com" data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Date</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" data-testid="input-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Application Deadline (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" data-testid="input-deadline" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="compensation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Compensation (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., $500/day, TFP, etc." data-testid="input-compensation" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requirements (One per line)</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={3}
                            placeholder="Height: 5'6&quot; - 5'10&quot;&#10;Age: 21-35&#10;Experience required" 
                            data-testid="input-requirements"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              data-testid="checkbox-featured"
                            />
                          </FormControl>
                          <FormLabel className="text-sm">Featured</FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="published"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              data-testid="checkbox-published"
                            />
                          </FormControl>
                          <FormLabel className="text-sm">Published</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        setEditingAnnouncement(null);
                        form.reset();
                      }}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      data-testid="button-submit-announcement"
                    >
                      {editingAnnouncement ? "Update" : "Create"} Announcement
                    </Button>
                  </div>
                </form>
              </Form>
          </DialogContent>
        </Dialog>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-announcements"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48" data-testid="select-filter-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="open-call">Open Calls</SelectItem>
              <SelectItem value="event">Events</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Announcements List */}
        {isLoading ? (
          <div className="text-center py-8">Loading announcements...</div>
        ) : announcements.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No announcements found</h3>
              <p className="text-gray-600 mb-4">Create your first announcement to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement: any) => (
              <Card key={announcement.id} data-testid={`card-announcement-${announcement.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{announcement.title}</CardTitle>
                        <Badge variant={announcement.category === "open-call" ? "default" : "secondary"}>
                          {announcement.category === "open-call" ? "Open Call" : "Event"}
                        </Badge>
                        {announcement.featured && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                            Featured
                          </Badge>
                        )}
                        {!announcement.published && (
                          <Badge variant="outline" className="bg-gray-50 text-gray-600">
                            Draft
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(announcement.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {announcement.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {announcement.contactEmail}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(announcement)}
                        data-testid={`button-edit-${announcement.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(announcement.id)}
                        data-testid={`button-delete-${announcement.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">{announcement.description}</p>
                  
                  {announcement.requirements && Array.isArray(announcement.requirements) && announcement.requirements.length > 0 && (
                    <div className="mb-3">
                      <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {announcement.requirements.map((req: string, index: number) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <div className="flex gap-4">
                      {announcement.deadline && (
                        <span>Deadline: {formatDate(announcement.deadline)}</span>
                      )}
                      {announcement.compensation && (
                        <span>Compensation: {announcement.compensation}</span>
                      )}
                    </div>
                    <span>Created: {formatDate(announcement.createdAt!)}</span>
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
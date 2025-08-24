import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import TalentNavbar from "@/components/layout/talent-navbar";
import AdminNavbar from "@/components/layout/admin-navbar";
import ClientNavbar from "@/components/layout/client-navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Form schema for profile updates
const profileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");

  // Form for profile updates
  const form = useForm<z.infer<typeof profileUpdateSchema>>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileUpdateSchema>) => {
      return apiRequest("PATCH", "/api/auth/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof profileUpdateSchema>) => {
    updateProfileMutation.mutate(data);
  };

  const renderNavbar = () => {
    if (user?.role === 'talent') return <TalentNavbar />;
    if (user?.role === 'admin') return <AdminNavbar />;
    if (user?.role === 'client') return <ClientNavbar />;
    return <Navbar />;
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'admin': return '/admin';
      case 'talent': return '/dashboard';
      case 'client': return '/client';
      default: return '/';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {renderNavbar()}
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900" data-testid="heading-profile">
              My Profile
            </h1>
            <p className="text-slate-600 mt-1">
              Manage your account settings and personal information.
            </p>
          </div>
          <Link href={getDashboardLink()}>
            <Button variant="outline" data-testid="button-back-to-dashboard">
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" data-testid="tab-profile-info">
              Profile Information
            </TabsTrigger>
            <TabsTrigger value="account" data-testid="tab-account-settings">
              Account Settings
            </TabsTrigger>
            <TabsTrigger value="security" data-testid="tab-security">
              Security
            </TabsTrigger>
          </TabsList>

          {/* Profile Information Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Picture */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user?.profileImageUrl || undefined} alt="Profile" />
                      <AvatarFallback className="bg-primary text-white text-2xl">
                        {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Button variant="outline" size="sm" data-testid="button-change-picture">
                        <i className="fas fa-camera mr-2"></i>
                        Change Picture
                      </Button>
                      <p className="text-xs text-slate-500 mt-2">
                        JPG, PNG up to 5MB
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter your first name" 
                                    {...field} 
                                    data-testid="input-first-name"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter your last name" 
                                    {...field} 
                                    data-testid="input-last-name"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email"
                                  placeholder="Enter your email" 
                                  {...field} 
                                  data-testid="input-email"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input 
                                  type="tel"
                                  placeholder="Enter your phone number" 
                                  {...field} 
                                  data-testid="input-phone"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end space-x-3">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => form.reset()}
                            data-testid="button-reset-form"
                          >
                            Reset
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={updateProfileMutation.isPending}
                            data-testid="button-save-profile"
                          >
                            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Account Settings Tab */}
          <TabsContent value="account">
            <div className="space-y-6">
              {/* Account Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-slate-600">User ID</Label>
                      <p className="text-slate-900 font-mono text-sm mt-1" data-testid="text-user-id">
                        {user?.id}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Account Role</Label>
                      <p className="text-slate-900 capitalize mt-1" data-testid="text-user-role">
                        {user?.role}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Account Status</Label>
                      <p className="text-slate-900 capitalize mt-1" data-testid="text-user-status">
                        {user?.status || 'Active'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Member Since</Label>
                      <p className="text-slate-900 mt-1" data-testid="text-member-since">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">Email Notifications</p>
                        <p className="text-sm text-slate-500">Receive email updates about your bookings</p>
                      </div>
                      <Button variant="outline" size="sm" data-testid="button-toggle-email-notifications">
                        Enabled
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">Marketing Communications</p>
                        <p className="text-sm text-slate-500">Receive promotional emails and updates</p>
                      </div>
                      <Button variant="outline" size="sm" data-testid="button-toggle-marketing">
                        Disabled
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-slate-900 mb-2">Authentication</h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Your account is secured through Replit Auth. You can manage your authentication settings 
                        directly through your Replit account.
                      </p>
                      <Button variant="outline" data-testid="button-manage-auth">
                        <i className="fas fa-external-link-alt mr-2"></i>
                        Manage Authentication
                      </Button>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-medium text-slate-900 mb-2">Active Sessions</h3>
                      <p className="text-sm text-slate-600 mb-4">
                        You are currently signed in on this device.
                      </p>
                      <div className="bg-slate-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-900">Current Session</p>
                            <p className="text-sm text-slate-500">This device • Now</p>
                          </div>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Active
                          </span>
                        </div>
                      </div>
                      <Button variant="destructive" data-testid="button-sign-out-all">
                        Sign Out All Devices
                      </Button>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-medium text-slate-900 mb-2">Account Actions</h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Manage your account or request data deletion.
                      </p>
                      <div className="space-y-3">
                        <Button variant="outline" data-testid="button-download-data">
                          <i className="fas fa-download mr-2"></i>
                          Download My Data
                        </Button>
                        <br />
                        <Button variant="destructive" data-testid="button-delete-account">
                          <i className="fas fa-trash mr-2"></i>
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import AdminNavbar from "@/components/layout/admin-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationBell } from "@/components/ui/notification-bell";
import { Settings, Globe, Mail, Shield, Upload, Zap, BarChart3, Wrench } from "lucide-react";

export default function AdminSettings() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    // Site Configuration
    siteName: "5T Talent Platform",
    siteDescription: "Professional talent booking platform",
    siteLogo: "",
    contactEmail: "admin@5telite.org",
    contactPhone: "",
    businessAddress: "",
    
    // Booking Settings
    emailNotifications: true,
    autoApproveBookings: false,
    requireClientApproval: true,
    maxBookingDays: 365,
    minBookingDays: 1,
    cancellationPolicy: "Bookings can be cancelled up to 24 hours before the event.",
    paymentTerms: "Payment due within 30 days of booking confirmation.",
    defaultBookingStatus: "inquiry",
    
    // Pagination & Display
    defaultPageSize: 20,
    maxPageSize: 100,
    talentDirectoryPageSize: 20,
    bookingsPageSize: 20,
    tasksPageSize: 20,
    
    // Email Settings
    emailFromName: "5T Elite Talent",
    emailFromAddress: "noreply@5telite.org",
    emailReplyTo: "admin@5telite.org",
    emailNotificationsEnabled: true,
    bookingNotificationEmails: true,
    taskNotificationEmails: true,
    contractNotificationEmails: true,
    approvalNotificationEmails: true,
    
    // Business Rules
    autoApproveTalents: false,
    requireTalentApproval: true,
    allowPublicBookings: true,
    requireBookingDeposit: false,
    defaultDepositPercentage: 25,
    maxConcurrentBookings: 5,
    
    // Security & Access
    sessionTimeout: 24, // hours
    requireEmailVerification: false,
    allowSelfRegistration: true,
    maxLoginAttempts: 5,
    lockoutDuration: 30, // minutes
    
    // File Upload Settings
    maxFileSize: 10, // MB
    allowedImageTypes: ["jpg", "jpeg", "png", "gif", "webp"],
    allowedDocumentTypes: ["pdf", "doc", "docx"],
    maxPhotosPerTalent: 20,
    
    // Integration Settings
    stripeEnabled: false,
    stripePublicKey: "",
    stripeSecretKey: "",
    cloudinaryEnabled: false,
    cloudinaryCloudName: "",
    cloudinaryApiKey: "",
    hellosignEnabled: false,
    hellosignApiKey: "",
    
    // Notification Settings
    pushNotificationsEnabled: false,
    smsNotificationsEnabled: false,
    notificationRetentionDays: 30,
    
    // Analytics & Reporting
    googleAnalyticsId: "",
    enableAnalytics: false,
    reportRetentionDays: 365,
    
    // Maintenance
    maintenanceMode: false,
    maintenanceMessage: "We're currently performing maintenance. Please check back soon.",
  });

  // Fetch current settings
  const { data: currentSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/admin/settings"],
    queryFn: getQueryFn(),
    enabled: isAuthenticated && user?.role === 'admin',
  });

  // Update settings when data is loaded
  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings);
    }
  }, [currentSettings]);

  if (!isAuthenticated || user?.role !== 'admin') {
    window.location.href = '/api/login';
    return null;
  }

  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: typeof settings) => {
      return apiRequest("POST", "/api/admin/settings", newSettings);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Settings updated successfully!",
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

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate(settings);
  };

  const updateSetting = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar />
      
      <div className="flex-1">

        {/* Desktop Header */}
        <header className="hidden xl:block bg-white shadow-sm border-b border-slate-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img 
                src="/attached_assets/5t-logo.png" 
                alt="5T Talent Platform" 
                className="h-12 w-auto"
              />
              <h1 className="text-2xl font-bold text-slate-900">Admin Settings</h1>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-900">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <Tabs defaultValue="site" className="space-y-6">
              <TabsList className="grid w-full grid-cols-8">
                <TabsTrigger value="site" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Site
                </TabsTrigger>
                <TabsTrigger value="booking" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Booking
                </TabsTrigger>
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="uploads" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Files
                </TabsTrigger>
                <TabsTrigger value="integrations" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Integrations
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="maintenance" className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  System
                </TabsTrigger>
              </TabsList>

              {/* Site Configuration */}
              <TabsContent value="site" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="siteName">Site Name</Label>
                        <Input
                          id="siteName"
                          value={settings.siteName}
                          onChange={(e) => updateSetting('siteName', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="siteDescription">Site Description</Label>
                        <Textarea
                          id="siteDescription"
                          value={settings.siteDescription}
                          onChange={(e) => updateSetting('siteDescription', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="siteLogo">Site Logo URL</Label>
                        <Input
                          id="siteLogo"
                          value={settings.siteLogo}
                          onChange={(e) => updateSetting('siteLogo', e.target.value)}
                          placeholder="https://example.com/logo.png"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={settings.contactEmail}
                          onChange={(e) => updateSetting('contactEmail', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Contact Phone</Label>
                        <Input
                          id="contactPhone"
                          value={settings.contactPhone}
                          onChange={(e) => updateSetting('contactPhone', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="businessAddress">Business Address</Label>
                        <Textarea
                          id="businessAddress"
                          value={settings.businessAddress}
                          onChange={(e) => updateSetting('businessAddress', e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Pagination & Display</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="defaultPageSize">Default Page Size</Label>
                          <Input
                            id="defaultPageSize"
                            type="number"
                            value={settings.defaultPageSize}
                            onChange={(e) => updateSetting('defaultPageSize', parseInt(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="talentDirectoryPageSize">Talent Directory Page Size</Label>
                          <Input
                            id="talentDirectoryPageSize"
                            type="number"
                            value={settings.talentDirectoryPageSize}
                            onChange={(e) => updateSetting('talentDirectoryPageSize', parseInt(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bookingsPageSize">Bookings Page Size</Label>
                          <Input
                            id="bookingsPageSize"
                            type="number"
                            value={settings.bookingsPageSize}
                            onChange={(e) => updateSetting('bookingsPageSize', parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Booking Settings */}
              <TabsContent value="booking" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Booking Rules</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Auto-approve Bookings</Label>
                          <p className="text-sm text-slate-600">Automatically approve new bookings</p>
                        </div>
                        <Switch
                          checked={settings.autoApproveBookings}
                          onCheckedChange={(checked) => updateSetting('autoApproveBookings', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Require Client Approval</Label>
                          <p className="text-sm text-slate-600">Require client approval for bookings</p>
                        </div>
                        <Switch
                          checked={settings.requireClientApproval}
                          onCheckedChange={(checked) => updateSetting('requireClientApproval', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Allow Public Bookings</Label>
                          <p className="text-sm text-slate-600">Allow unauthenticated users to submit bookings</p>
                        </div>
                        <Switch
                          checked={settings.allowPublicBookings}
                          onCheckedChange={(checked) => updateSetting('allowPublicBookings', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Require Booking Deposit</Label>
                          <p className="text-sm text-slate-600">Require deposit for bookings</p>
                        </div>
                        <Switch
                          checked={settings.requireBookingDeposit}
                          onCheckedChange={(checked) => updateSetting('requireBookingDeposit', checked)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Booking Limits</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="maxBookingDays">Max Booking Days Ahead</Label>
                        <Input
                          id="maxBookingDays"
                          type="number"
                          value={settings.maxBookingDays}
                          onChange={(e) => updateSetting('maxBookingDays', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minBookingDays">Min Booking Days Ahead</Label>
                        <Input
                          id="minBookingDays"
                          type="number"
                          value={settings.minBookingDays}
                          onChange={(e) => updateSetting('minBookingDays', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxConcurrentBookings">Max Concurrent Bookings</Label>
                        <Input
                          id="maxConcurrentBookings"
                          type="number"
                          value={settings.maxConcurrentBookings}
                          onChange={(e) => updateSetting('maxConcurrentBookings', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="defaultDepositPercentage">Default Deposit %</Label>
                        <Input
                          id="defaultDepositPercentage"
                          type="number"
                          value={settings.defaultDepositPercentage}
                          onChange={(e) => updateSetting('defaultDepositPercentage', parseInt(e.target.value))}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Policies & Terms</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                        <Textarea
                          id="cancellationPolicy"
                          value={settings.cancellationPolicy}
                          onChange={(e) => updateSetting('cancellationPolicy', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="paymentTerms">Payment Terms</Label>
                        <Textarea
                          id="paymentTerms"
                          value={settings.paymentTerms}
                          onChange={(e) => updateSetting('paymentTerms', e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Email Settings */}
              <TabsContent value="email" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Email Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="emailFromName">From Name</Label>
                        <Input
                          id="emailFromName"
                          value={settings.emailFromName}
                          onChange={(e) => updateSetting('emailFromName', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emailFromAddress">From Address</Label>
                        <Input
                          id="emailFromAddress"
                          type="email"
                          value={settings.emailFromAddress}
                          onChange={(e) => updateSetting('emailFromAddress', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emailReplyTo">Reply-To Address</Label>
                        <Input
                          id="emailReplyTo"
                          type="email"
                          value={settings.emailReplyTo}
                          onChange={(e) => updateSetting('emailReplyTo', e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-slate-600">Enable email notifications</p>
                        </div>
                        <Switch
                          checked={settings.emailNotificationsEnabled}
                          onCheckedChange={(checked) => updateSetting('emailNotificationsEnabled', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Booking Notifications</Label>
                          <p className="text-sm text-slate-600">Send booking-related emails</p>
                        </div>
                        <Switch
                          checked={settings.bookingNotificationEmails}
                          onCheckedChange={(checked) => updateSetting('bookingNotificationEmails', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Task Notifications</Label>
                          <p className="text-sm text-slate-600">Send task-related emails</p>
                        </div>
                        <Switch
                          checked={settings.taskNotificationEmails}
                          onCheckedChange={(checked) => updateSetting('taskNotificationEmails', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Contract Notifications</Label>
                          <p className="text-sm text-slate-600">Send contract-related emails</p>
                        </div>
                        <Switch
                          checked={settings.contractNotificationEmails}
                          onCheckedChange={(checked) => updateSetting('contractNotificationEmails', checked)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Security Settings */}
              <TabsContent value="security" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Access Control</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Allow Self Registration</Label>
                          <p className="text-sm text-slate-600">Allow users to register themselves</p>
                        </div>
                        <Switch
                          checked={settings.allowSelfRegistration}
                          onCheckedChange={(checked) => updateSetting('allowSelfRegistration', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Require Email Verification</Label>
                          <p className="text-sm text-slate-600">Require email verification for new accounts</p>
                        </div>
                        <Switch
                          checked={settings.requireEmailVerification}
                          onCheckedChange={(checked) => updateSetting('requireEmailVerification', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Auto-approve Talents</Label>
                          <p className="text-sm text-slate-600">Automatically approve new talent registrations</p>
                        </div>
                        <Switch
                          checked={settings.autoApproveTalents}
                          onCheckedChange={(checked) => updateSetting('autoApproveTalents', checked)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Session & Login</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                        <Input
                          id="sessionTimeout"
                          type="number"
                          value={settings.sessionTimeout}
                          onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                        <Input
                          id="maxLoginAttempts"
                          type="number"
                          value={settings.maxLoginAttempts}
                          onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                        <Input
                          id="lockoutDuration"
                          type="number"
                          value={settings.lockoutDuration}
                          onChange={(e) => updateSetting('lockoutDuration', parseInt(e.target.value))}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* File Upload Settings */}
              <TabsContent value="uploads" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>File Limits</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                        <Input
                          id="maxFileSize"
                          type="number"
                          value={settings.maxFileSize}
                          onChange={(e) => updateSetting('maxFileSize', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxPhotosPerTalent">Max Photos Per Talent</Label>
                        <Input
                          id="maxPhotosPerTalent"
                          type="number"
                          value={settings.maxPhotosPerTalent}
                          onChange={(e) => updateSetting('maxPhotosPerTalent', parseInt(e.target.value))}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Allowed File Types</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="allowedImageTypes">Allowed Image Types</Label>
                        <Input
                          id="allowedImageTypes"
                          value={settings.allowedImageTypes.join(', ')}
                          onChange={(e) => updateSetting('allowedImageTypes', e.target.value.split(',').map(s => s.trim()))}
                          placeholder="jpg, jpeg, png, gif, webp"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="allowedDocumentTypes">Allowed Document Types</Label>
                        <Input
                          id="allowedDocumentTypes"
                          value={settings.allowedDocumentTypes.join(', ')}
                          onChange={(e) => updateSetting('allowedDocumentTypes', e.target.value.split(',').map(s => s.trim()))}
                          placeholder="pdf, doc, docx"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Integration Settings */}
              <TabsContent value="integrations" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Integration (Stripe)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Enable Stripe</Label>
                          <p className="text-sm text-slate-600">Enable Stripe payment processing</p>
                        </div>
                        <Switch
                          checked={settings.stripeEnabled}
                          onCheckedChange={(checked) => updateSetting('stripeEnabled', checked)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stripePublicKey">Stripe Public Key</Label>
                        <Input
                          id="stripePublicKey"
                          value={settings.stripePublicKey}
                          onChange={(e) => updateSetting('stripePublicKey', e.target.value)}
                          type="password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
                        <Input
                          id="stripeSecretKey"
                          value={settings.stripeSecretKey}
                          onChange={(e) => updateSetting('stripeSecretKey', e.target.value)}
                          type="password"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>File Storage (Cloudinary)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Enable Cloudinary</Label>
                          <p className="text-sm text-slate-600">Enable Cloudinary file storage</p>
                        </div>
                        <Switch
                          checked={settings.cloudinaryEnabled}
                          onCheckedChange={(checked) => updateSetting('cloudinaryEnabled', checked)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cloudinaryCloudName">Cloudinary Cloud Name</Label>
                        <Input
                          id="cloudinaryCloudName"
                          value={settings.cloudinaryCloudName}
                          onChange={(e) => updateSetting('cloudinaryCloudName', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cloudinaryApiKey">Cloudinary API Key</Label>
                        <Input
                          id="cloudinaryApiKey"
                          value={settings.cloudinaryApiKey}
                          onChange={(e) => updateSetting('cloudinaryApiKey', e.target.value)}
                          type="password"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Contract Signing (HelloSign)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Enable HelloSign</Label>
                          <p className="text-sm text-slate-600">Enable HelloSign contract signing</p>
                        </div>
                        <Switch
                          checked={settings.hellosignEnabled}
                          onCheckedChange={(checked) => updateSetting('hellosignEnabled', checked)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hellosignApiKey">HelloSign API Key</Label>
                        <Input
                          id="hellosignApiKey"
                          value={settings.hellosignApiKey}
                          onChange={(e) => updateSetting('hellosignApiKey', e.target.value)}
                          type="password"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Analytics Settings */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Google Analytics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Enable Analytics</Label>
                          <p className="text-sm text-slate-600">Enable Google Analytics tracking</p>
                        </div>
                        <Switch
                          checked={settings.enableAnalytics}
                          onCheckedChange={(checked) => updateSetting('enableAnalytics', checked)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                        <Input
                          id="googleAnalyticsId"
                          value={settings.googleAnalyticsId}
                          onChange={(e) => updateSetting('googleAnalyticsId', e.target.value)}
                          placeholder="GA-XXXXXXXXX-X"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Data Retention</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reportRetentionDays">Report Retention (days)</Label>
                        <Input
                          id="reportRetentionDays"
                          type="number"
                          value={settings.reportRetentionDays}
                          onChange={(e) => updateSetting('reportRetentionDays', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notificationRetentionDays">Notification Retention (days)</Label>
                        <Input
                          id="notificationRetentionDays"
                          type="number"
                          value={settings.notificationRetentionDays}
                          onChange={(e) => updateSetting('notificationRetentionDays', parseInt(e.target.value))}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Maintenance Settings */}
              <TabsContent value="maintenance" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Maintenance Mode</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Enable Maintenance Mode</Label>
                          <p className="text-sm text-slate-600">Put the site in maintenance mode</p>
                        </div>
                        <Switch
                          checked={settings.maintenanceMode}
                          onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                        <Textarea
                          id="maintenanceMessage"
                          value={settings.maintenanceMessage}
                          onChange={(e) => updateSetting('maintenanceMessage', e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>System Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm text-slate-600">
                        <p><strong>Platform Version:</strong> 1.0.0</p>
                        <p><strong>Database:</strong> PostgreSQL</p>
                        <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
                        <p><strong>Environment:</strong> Production</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Save Button */}
            <div className="flex justify-end mt-8">
              <Button 
                onClick={handleSaveSettings}
                disabled={saveSettingsMutation.isPending}
                className="px-8"
                data-testid="button-save-settings"
              >
                {saveSettingsMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
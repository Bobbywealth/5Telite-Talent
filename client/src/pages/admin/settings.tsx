import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AdminSidebar from "@/components/layout/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { NotificationBell } from "@/components/ui/notification-bell";

export default function AdminSettings() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    siteName: "5T Talent Platform",
    siteDescription: "Professional talent booking platform",
    emailNotifications: true,
    autoApproveBookings: false,
    requireClientApproval: true,
    maxBookingDays: 365,
    cancellationPolicy: "Bookings can be cancelled up to 24 hours before the event.",
    paymentTerms: "Payment due within 30 days of booking confirmation.",
  });

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
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar 
        isMobileOpen={isMobileSidebarOpen} 
        onMobileToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />
      
      <div className="flex-1">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white shadow-sm border-b border-slate-200 px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsMobileSidebarOpen(true)}
                className="p-2"
                data-testid="button-mobile-sidebar-toggle"
              >
                <i className="fas fa-bars text-lg"></i>
              </Button>
              <img 
                src="/attached_assets/5t-logo.png" 
                alt="5T Talent Platform" 
                className="h-8 w-auto"
              />
              <h1 className="text-lg font-bold text-slate-900">Settings</h1>
            </div>
            <div className="flex items-center space-x-2">
              <NotificationBell />
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:block bg-white shadow-sm border-b border-slate-200 px-6 py-4">
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
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Site Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-cog mr-2 text-primary"></i>
                  Site Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) => updateSetting('siteName', e.target.value)}
                      data-testid="input-site-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxBookingDays">Max Booking Days Ahead</Label>
                    <Input
                      id="maxBookingDays"
                      type="number"
                      value={settings.maxBookingDays}
                      onChange={(e) => updateSetting('maxBookingDays', parseInt(e.target.value))}
                      data-testid="input-max-booking-days"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) => updateSetting('siteDescription', e.target.value)}
                    data-testid="textarea-site-description"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Booking Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-calendar mr-2 text-primary"></i>
                  Booking Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-approve Bookings</Label>
                    <p className="text-sm text-slate-500">
                      Automatically approve new booking requests
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoApproveBookings}
                    onCheckedChange={(checked) => updateSetting('autoApproveBookings', checked)}
                    data-testid="switch-auto-approve-bookings"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Client Approval</Label>
                    <p className="text-sm text-slate-500">
                      Require explicit client approval for bookings
                    </p>
                  </div>
                  <Switch
                    checked={settings.requireClientApproval}
                    onCheckedChange={(checked) => updateSetting('requireClientApproval', checked)}
                    data-testid="switch-require-client-approval"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-bell mr-2 text-primary"></i>
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-slate-500">
                      Send email notifications for important events
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                    data-testid="switch-email-notifications"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Policies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-file-contract mr-2 text-primary"></i>
                  Policies & Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                  <Textarea
                    id="cancellationPolicy"
                    value={settings.cancellationPolicy}
                    onChange={(e) => updateSetting('cancellationPolicy', e.target.value)}
                    rows={3}
                    data-testid="textarea-cancellation-policy"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Textarea
                    id="paymentTerms"
                    value={settings.paymentTerms}
                    onChange={(e) => updateSetting('paymentTerms', e.target.value)}
                    rows={3}
                    data-testid="textarea-payment-terms"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
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
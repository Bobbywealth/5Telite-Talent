import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTimezone } from "@/contexts/TimezoneContext";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import TalentNavbar from "@/components/layout/talent-navbar";
import AdminNavbar from "@/components/layout/admin-navbar";
import ClientNavbar from "@/components/layout/client-navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { timezone, setTimezone, formatDateTime } = useTimezone();
  const [activeTab, setActiveTab] = useState("notifications");

  // Settings state
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false,
    booking_updates: true,
    task_reminders: true,
    talent_applications: user?.role === 'admin',
  });

  const [preferences, setPreferences] = useState({
    currency: 'USD',
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
    
    toast({
      title: "Setting Updated",
      description: `${key.replace('_', ' ')} notifications ${value ? 'enabled' : 'disabled'}.`,
    });
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "auto") => {
    setTheme(newTheme);
    toast({
      title: t("switchTheme"),
      description: `Theme switched to ${newTheme}`,
    });
  };

  const handleLanguageChange = (newLanguage: "en" | "es" | "fr") => {
    setLanguage(newLanguage);
    toast({
      title: t("changeLanguage"),
      description: `Language changed to ${newLanguage === 'en' ? 'English' : newLanguage === 'es' ? 'Español' : 'Français'}`,
    });
  };

  const handleTimezoneChange = (newTimezone: "America/New_York" | "America/Chicago" | "America/Denver" | "America/Los_Angeles" | "UTC") => {
    setTimezone(newTimezone);
    toast({
      title: t("updateTimezone"),
      description: `Timezone updated. Current time: ${formatDateTime(new Date())}`,
    });
  };

  const handlePreferenceChange = (key: string, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    
    toast({
      title: "Preference Updated",
      description: `${key} has been updated.`,
    });
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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100" data-testid="heading-settings">
              {t("settings")}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Customize your experience and manage your preferences.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
              Current time in {timezone}: {formatDateTime(new Date())}
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notifications" data-testid="tab-notifications">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="preferences" data-testid="tab-preferences">
              Preferences
            </TabsTrigger>
            <TabsTrigger value="privacy" data-testid="tab-privacy">
              Privacy
            </TabsTrigger>
            <TabsTrigger value="integrations" data-testid="tab-integrations">
              Integrations
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Email notifications</Label>
                      <p className="text-sm text-slate-500">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                      data-testid="switch-email-notifications"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Booking updates</Label>
                      <p className="text-sm text-slate-500">
                        Get notified about booking status changes
                      </p>
                    </div>
                    <Switch
                      checked={notifications.booking_updates}
                      onCheckedChange={(checked) => handleNotificationChange('booking_updates', checked)}
                      data-testid="switch-booking-notifications"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Task reminders</Label>
                      <p className="text-sm text-slate-500">
                        Receive reminders for upcoming task deadlines
                      </p>
                    </div>
                    <Switch
                      checked={notifications.task_reminders}
                      onCheckedChange={(checked) => handleNotificationChange('task_reminders', checked)}
                      data-testid="switch-task-reminders"
                    />
                  </div>

                  {user?.role === 'admin' && (
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Talent applications</Label>
                        <p className="text-sm text-slate-500">
                          Get notified about new talent applications
                        </p>
                      </div>
                      <Switch
                        checked={notifications.talent_applications}
                        onCheckedChange={(checked) => handleNotificationChange('talent_applications', checked)}
                        data-testid="switch-talent-applications"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Marketing communications</Label>
                      <p className="text-sm text-slate-500">
                        Receive promotional emails and platform updates
                      </p>
                    </div>
                    <Switch
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => handleNotificationChange('marketing', checked)}
                      data-testid="switch-marketing-notifications"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Push Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Browser notifications</Label>
                      <p className="text-sm text-slate-500">
                        Show notifications in your browser
                      </p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                      data-testid="switch-push-notifications"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Display Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <Select 
                        value={theme} 
                        onValueChange={handleThemeChange}
                      >
                        <SelectTrigger data-testid="select-theme">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="auto">Auto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select 
                        value={language} 
                        onValueChange={handleLanguageChange}
                      >
                        <SelectTrigger data-testid="select-language">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Regional Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select 
                        value={timezone} 
                        onValueChange={handleTimezoneChange}
                      >
                        <SelectTrigger data-testid="select-timezone">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select 
                        value={preferences.currency} 
                        onValueChange={(value) => handlePreferenceChange('currency', value)}
                      >
                        <SelectTrigger data-testid="select-currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="CAD">CAD ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Profile visibility</Label>
                      <p className="text-sm text-slate-500">
                        {user?.role === 'talent' 
                          ? 'Allow your profile to be visible in talent directory'
                          : 'Control who can see your profile information'
                        }
                      </p>
                    </div>
                    <Switch defaultChecked data-testid="switch-profile-visibility" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Contact information</Label>
                      <p className="text-sm text-slate-500">
                        Allow others to see your contact details
                      </p>
                    </div>
                    <Switch defaultChecked data-testid="switch-contact-visibility" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Activity status</Label>
                      <p className="text-sm text-slate-500">
                        Show when you were last active on the platform
                      </p>
                    </div>
                    <Switch defaultChecked data-testid="switch-activity-status" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" data-testid="button-export-data">
                      <i className="fas fa-download mr-3"></i>
                      Export My Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start" data-testid="button-data-preferences">
                      <i className="fas fa-shield-alt mr-3"></i>
                      Manage Data Preferences
                    </Button>
                    <Button variant="destructive" className="w-full justify-start" data-testid="button-delete-data">
                      <i className="fas fa-trash mr-3"></i>
                      Request Data Deletion
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Connected Apps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <i className="fas fa-calendar text-white"></i>
                        </div>
                        <div>
                          <p className="font-medium">Google Calendar</p>
                          <p className="text-sm text-slate-500">Sync bookings with your calendar</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Coming Soon</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                          <i className="fas fa-credit-card text-white"></i>
                        </div>
                        <div>
                          <p className="font-medium">Stripe</p>
                          <p className="text-sm text-slate-500">Process payments and invoices</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Coming Soon</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                          <i className="fas fa-signature text-white"></i>
                        </div>
                        <div>
                          <p className="font-medium">DocuSign</p>
                          <p className="text-sm text-slate-500">Digital contract signing</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Coming Soon</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                      Generate API keys to integrate with external systems and automate workflows.
                    </p>
                    <Button variant="outline" data-testid="button-generate-api-key">
                      <i className="fas fa-key mr-2"></i>
                      Generate API Key
                    </Button>
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
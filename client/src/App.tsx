
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TimezoneProvider } from "@/contexts/TimezoneContext";

// Pages
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Auth from "@/pages/auth";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import TalentDirectory from "@/pages/talent-directory";
import TalentProfile from "@/pages/talent-profile";
import BookRequest from "@/pages/book-request";
import Register from "@/pages/register";
import Announcements from "@/pages/announcements";
import NotFound from "@/pages/not-found";

// Admin Pages
import AdminDashboardSimple from "@/pages/admin/dashboard-simple";
import AdminTalents from "@/pages/admin/talents";
import AdminBookings from "@/pages/admin/bookings";
import AdminBookingRequests from "@/pages/admin/booking-requests";
import AdminTasks from "@/pages/admin/tasks";
import AdminAnnouncements from "@/pages/admin/announcements";
import AdminTraining from "@/pages/admin/training";
import AdminReports from "@/pages/admin/reports";
import AdminApprovals from "@/pages/admin/approvals";
import AdminSettings from "@/pages/admin/settings";
import Support from "@/pages/support";

// Talent Pages
import TalentDashboard from "@/pages/talent/dashboard";
import TalentProfileEdit from "@/pages/talent/profile-edit";
import TalentBookings from "@/pages/talent/bookings";
import TalentTasks from "@/pages/talent/tasks";
import TalentContracts from "@/pages/talent/contracts";

// Client Pages
import ClientDashboard from "@/pages/client/dashboard";
import ClientBookings from "@/pages/client/bookings";

// Shared Pages
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import Contracts from "@/pages/contracts";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/auth" component={Auth} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password" component={ResetPassword} />
          <Route path="/talent" component={TalentDirectory} />
          <Route path="/talent/:id" component={TalentProfile} />
          <Route path="/announcements" component={Announcements} />
          <Route path="/book" component={BookRequest} />
          <Route path="/register" component={Register} />
          <Route path="/contracts" component={Contracts} />
          <Route path="/terms" component={Terms} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/support" component={Support} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          {user?.role === 'talent' && (
            <>
              <Route path="/talent/dashboard" component={TalentDashboard} />
              <Route path="/talent/profile" component={TalentProfileEdit} />
              <Route path="/talent/bookings" component={TalentBookings} />
              <Route path="/talent/tasks" component={TalentTasks} />
              <Route path="/talent/contracts" component={TalentContracts} />
              <Route path="/talent/settings" component={Settings} />
            </>
          )}
          {user?.role === 'admin' && (
            <>
              <Route path="/admin" component={AdminDashboardSimple} />
              <Route path="/admin/booking-requests" component={AdminBookingRequests} />
              <Route path="/admin/talents" component={AdminTalents} />
              <Route path="/admin/bookings" component={AdminBookings} />
              <Route path="/admin/tasks" component={AdminTasks} />
              <Route path="/admin/announcements" component={AdminAnnouncements} />
              <Route path="/admin/contracts" component={Contracts} />
              <Route path="/admin/talent" component={TalentDirectory} />
              <Route path="/admin/settings" component={AdminSettings} />
              <Route path="/admin/training" component={AdminTraining} />
              <Route path="/admin/reports" component={AdminReports} />
              <Route path="/admin/approvals" component={AdminApprovals} />
            </>
          )}
          <Route path="/talent" component={TalentDirectory} />
          <Route path="/talent/:id" component={TalentProfile} />
          <Route path="/announcements" component={Announcements} />
          <Route path="/book" component={BookRequest} />
          <Route path="/register" component={Register} />
          <Route path="/support" component={Support} />
          <Route path="/terms" component={Terms} />
          <Route path="/privacy" component={Privacy} />
          {user?.role === 'client' && (
            <>
              <Route path="/client" component={ClientDashboard} />
              <Route path="/client/bookings" component={ClientBookings} />
            </>
          )}
          <Route path="/dashboard" component={() => {
            const redirectPaths: Record<string, string> = {
              admin: '/admin',
              talent: '/talent/dashboard',
              client: '/client'
            };
            const redirectPath = redirectPaths[user?.role || ''] || '/';
            window.location.replace(redirectPath);
            return null;
          }} />
          <Route path="/profile" component={Profile} />
          <Route path="/settings" component={Settings} />
          <Route path="/contracts" component={Contracts} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <TimezoneProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </TimezoneProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;

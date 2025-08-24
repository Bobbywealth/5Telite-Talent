import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

// Pages
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import TalentDirectory from "@/pages/talent-directory";
import TalentProfile from "@/pages/talent-profile";
import BookRequest from "@/pages/book-request";
import Register from "@/pages/register";
import NotFound from "@/pages/not-found";

// Admin Pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminTalents from "@/pages/admin/talents";
import AdminBookings from "@/pages/admin/bookings";
import AdminTasks from "@/pages/admin/tasks";

// Talent Pages
import TalentDashboard from "@/pages/talent/dashboard";
import TalentProfileEdit from "@/pages/talent/profile-edit";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Add timeout for loading state to prevent infinite loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/talent" component={TalentDirectory} />
          <Route path="/talent/:id" component={TalentProfile} />
          <Route path="/book" component={BookRequest} />
          <Route path="/register" component={Register} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/talent" component={TalentDirectory} />
          <Route path="/talent/:id" component={TalentProfile} />
          <Route path="/book" component={BookRequest} />
          <Route path="/register" component={Register} />

          {/* Admin routes */}
          {user?.role === 'admin' && (
            <>
              <Route path="/admin" component={AdminDashboard} />
              <Route path="/admin/talents" component={AdminTalents} />
              <Route path="/admin/bookings" component={AdminBookings} />
              <Route path="/admin/tasks" component={AdminTasks} />
            </>
          )}

          {/* Talent routes */}
          {user?.role === 'talent' && (
            <>
              <Route path="/dashboard" component={TalentDashboard} />
              <Route path="/dashboard/profile" component={TalentProfileEdit} />
            </>
          )}
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
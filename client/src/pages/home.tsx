import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import logoImage from "@assets/5t-logo.png";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Auto-redirect authenticated users to their appropriate dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = {
        admin: '/admin',
        talent: '/talent/dashboard',
        client: '/client'
      }[user.role];

      if (redirectPath) {
        // Small delay to prevent jarring immediate redirect
        setTimeout(() => setLocation(redirectPath), 100);
      }
    }
  }, [isAuthenticated, user, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is authenticated, show a brief loading state while redirecting
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  // For non-authenticated users, show a welcome/landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <img 
            src={logoImage} 
            alt="5T Talent Platform" 
            className="h-20 w-auto mx-auto mb-8"
          />
          <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6">
            Welcome to 5T Talent Platform
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Connect with top-tier talent, manage bookings, and streamline your creative projects 
            all in one powerful platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => window.location.href = "/auth"} className="text-lg px-8 py-3">
              <i className="fas fa-sign-in-alt mr-2"></i>
              Sign In
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-3">
              <a href="/talent">
                <i className="fas fa-search mr-2"></i>
                Browse Talent
              </a>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-users text-2xl text-primary"></i>
              </div>
              <CardTitle>For Talent</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                Showcase your skills, manage bookings, and grow your career with our comprehensive talent management tools.
              </p>
              <Button variant="outline" asChild>
                <a href="/register">
                  Join as Talent
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-briefcase text-2xl text-green-600"></i>
              </div>
              <CardTitle>For Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                Find the perfect talent for your projects, manage bookings, and streamline your creative workflow.
              </p>
              <Button variant="outline" asChild>
                <a href="/api/login">
                  Start Hiring
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-cog text-2xl text-purple-600"></i>
              </div>
              <CardTitle>For Agencies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                Manage your talent roster, track bookings, and oversee operations with powerful admin tools.
              </p>
              <Button variant="outline" asChild>
                <a href="/api/login">
                  Admin Access
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Platform at a Glance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-slate-600">Verified Talents</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">1,200+</div>
              <div className="text-slate-600">Successful Bookings</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">99%</div>
              <div className="text-slate-600">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
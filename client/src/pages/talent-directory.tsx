import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/navbar";
import AdminNavbar from "@/components/layout/admin-navbar";
import TalentNavbar from "@/components/layout/talent-navbar";
import ClientNavbar from "@/components/layout/client-navbar";
import Footer from "@/components/layout/footer";
import TalentCard from "@/components/talent-card";
import SearchFilters from "@/components/search-filters";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function TalentDirectory() {
  const { isAuthenticated, user } = useAuth();
  const [location, navigate] = useLocation();
  
  // Redirect admin users to proper admin URL
  useEffect(() => {
    if (user?.role === 'admin' && location === '/talent') {
      navigate('/admin/talent');
    }
  }, [user, location, navigate]);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    skills: [] as string[],
    location: "",
    page: 1,
  });

  const { data: talentsData, isLoading, error } = useQuery({
    queryKey: ["/api/talents", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.category) params.set("category", filters.category);
      if (filters.location) params.set("location", filters.location);
      if (filters.skills.length > 0) {
        filters.skills.forEach(skill => params.append("skills", skill));
      }
      params.set("page", filters.page.toString());
      params.set("limit", "12");
      params.set("approvalStatus", "approved"); // Public directory only shows approved talent

      const response = await fetch(`/api/talents?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch talents");
      }
      return response.json();
    },
  });

  const handleLoadMore = () => {
    setFilters(prev => ({ ...prev, page: prev.page + 1 }));
  };

  const hasMoreData = talentsData && talentsData.talents.length < talentsData.total;

  // Content component to avoid duplication
  const TalentDirectoryContent = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative bg-gradient-hero-enhanced overflow-hidden py-20">
        <div className="absolute inset-0">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-white/20">
              <i className="fas fa-star text-yellow-300 text-xs"></i>
              Professional Talent Network
            </div>
            <h1 className="text-4xl lg:text-6xl font-extrabold text-white mb-5 tracking-tight">
              Find Your Perfect<br /><span className="text-gradient-white">Talent Match</span>
            </h1>
            <p className="text-lg text-slate-200 mb-8 max-w-2xl mx-auto leading-relaxed">
              Browse our curated roster of professional talent across performance, modeling, hosting, and more.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Browse Talent</h2>
            <p className="text-sm text-slate-500 mt-1">Filter and discover the right fit for your project.</p>
          </div>
          {talentsData && (
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
              <i className="fas fa-users text-primary text-xs"></i>
              <span className="text-sm font-medium text-slate-700">{talentsData.total} talent{talentsData.total !== 1 ? "s" : ""}</span>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <SearchFilters
          filters={filters}
          onFiltersChange={setFilters}
          data-testid="search-filters"
        />

        {/* Content */}
        {isLoading && filters.page === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                <Skeleton className="h-64 w-full rounded-none" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Skeleton className="h-8 flex-1 rounded-md" />
                    <Skeleton className="h-8 flex-1 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Unable to Load Talents</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto text-sm">
              {error instanceof Error ? error.message : "Something went wrong while loading the talent directory."}
            </p>
            <Button onClick={() => window.location.reload()} className="bg-gradient-to-r from-primary to-secondary text-white border-0">
              <i className="fas fa-redo mr-2"></i>Try Again
            </Button>
          </div>
        ) : talentsData && talentsData.talents.length > 0 ? (
          <>
            {/* Results info */}
            <div className="mb-5 flex items-center gap-2 text-sm text-slate-500">
              <i className="fas fa-check-circle text-green-500"></i>
              Showing <span className="font-semibold text-slate-700">{talentsData.talents.length}</span> of <span className="font-semibold text-slate-700">{talentsData.total}</span> talents
            </div>

            {/* Talent Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10" data-testid="talent-grid">
              {talentsData.talents.map((talent: any) => (
                <TalentCard key={talent.id} talent={talent} />
              ))}
            </div>

            {/* Load More Button */}
            {hasMoreData && (
              <div className="text-center">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  size="lg"
                  className="px-10 bg-gradient-to-r from-primary to-secondary text-white border-0 shadow-lg hover:opacity-90 transition-opacity"
                  data-testid="button-load-more"
                >
                  {isLoading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>Loading...</>
                  ) : (
                    <><i className="fas fa-plus mr-2"></i>Load More Talent</>
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <i className="fas fa-users text-4xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Talents Found</h3>
            <p className="text-slate-600 mb-4">
              {filters.search || filters.category || filters.location || filters.skills.length > 0
                ? "Try adjusting your search criteria to find more results."
                : "No talents are currently available in the directory."}
            </p>
            {(filters.search || filters.category || filters.location || filters.skills.length > 0) && (
              <Button 
                variant="outline"
                onClick={() => setFilters({ search: "", category: "", skills: [], location: "", page: 1 })}
              >
                Clear All Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Render with appropriate navigation based on user role
  if (user?.role === 'admin') {
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
                <h1 className="text-2xl font-bold text-slate-900">Talent Directory</h1>
              </div>
            </div>
          </header>
          <main className="overflow-y-auto">
            <TalentDirectoryContent />
          </main>
        </div>
      </div>
    );
  }

  if (user?.role === 'talent') {
    return (
      <div className="min-h-screen bg-slate-50">
        <TalentNavbar />
        <div className="pt-4">
          <TalentDirectoryContent />
        </div>
        <Footer />
      </div>
    );
  }

  // Default layout for client users and unauthenticated users
  return (
    <div className="min-h-screen bg-slate-50">
      <ClientNavbar />
      <div className="pt-4">
        <TalentDirectoryContent />
      </div>
      <Footer />
    </div>
  );
}
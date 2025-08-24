import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/navbar";
import AdminSidebar from "@/components/layout/admin-sidebar";
import TalentNavbar from "@/components/layout/talent-navbar";
import ClientNavbar from "@/components/layout/client-navbar";
import Footer from "@/components/layout/footer";
import TalentCard from "@/components/talent-card";
import SearchFilters from "@/components/search-filters";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function TalentDirectory() {
  const { isAuthenticated, user } = useAuth();
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
      {/* Brand-aligned Hero Section */}
      <section className="relative bg-gradient-hero-enhanced overflow-hidden py-20">
        <div className="absolute inset-0">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Talent <span className="text-gradient-white">Directory</span>
            </h1>
            <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
              Discover exceptional talent for your next project
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Talent Directory
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover professional talent for your next project. Filter by category, skills, and location to find the perfect match.
          </p>
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
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <i className="fas fa-exclamation-triangle text-4xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Unable to Load Talents</h3>
            <p className="text-slate-600 mb-4">
              {error instanceof Error ? error.message : "Something went wrong while loading the talent directory."}
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : talentsData && talentsData.talents.length > 0 ? (
          <>
            {/* Results info */}
            <div className="mb-6 text-sm text-slate-600">
              Showing {talentsData.talents.length} of {talentsData.total} talents
            </div>

            {/* Talent Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8" data-testid="talent-grid">
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
                  className="px-8"
                  data-testid="button-load-more"
                >
                  {isLoading ? "Loading..." : "Load More Talent"}
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
      <div className="min-h-screen bg-slate-50 flex">
        <AdminSidebar />
        <div className="flex-1">
          <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Talent Directory</h1>
                <p className="text-slate-600">Browse and discover talent profiles</p>
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
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/navbar";
import AdminNavbar from "@/components/layout/admin-navbar";
import TalentNavbar from "@/components/layout/talent-navbar";
import ClientNavbar from "@/components/layout/client-navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, MapPin, Users, Clock, Star } from "lucide-react";

interface Announcement {
  id: number;
  title: string;
  category: "open-call" | "event";
  description: string;
  location: string;
  date: string;
  deadline: string | null;
  requirements: string[];
  compensation: string | null;
  contact: string;
  featured: boolean;
  createdAt: string;
}

export default function Announcements() {
  const { isAuthenticated, user } = useAuth();
  const [filters, setFilters] = useState({
    category: "all",
    search: "",
  });

  // Fetch announcements data
  const { data: announcementsData, isLoading, error } = useQuery({
    queryKey: ["/api/announcements", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category && filters.category !== "all") params.set("category", filters.category);
      if (filters.search) params.set("search", filters.search);

      try {
        const response = await fetch(`/api/announcements?${params}`);
        
        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          // API endpoint doesn't exist yet, use mock data
          return getMockAnnouncements();
        }
        
        if (!response.ok) {
          // If endpoint doesn't exist yet, return mock data for now
          if (response.status === 404) {
            return getMockAnnouncements();
          }
          throw new Error("Failed to fetch announcements");
        }
        
        return response.json();
      } catch (fetchError) {
        // Network error or parsing error, fallback to mock data
        console.log("Using mock data due to API error:", fetchError);
        return getMockAnnouncements();
      }
    },
    retry: false, // Don't retry since we're using fallback data
  });

  // Mock data for now until backend endpoint is created
  const getMockAnnouncements = () => ({
    announcements: [
      {
        id: 1,
        title: "Netflix Series - Principal Cast Open Call",
        category: "open-call",
        description: "Major streaming series seeking lead and supporting actors for new drama series filming in Atlanta. Professional production with established showrunners and A-list producers.",
        location: "Atlanta, GA",
        date: "2025-09-15",
        deadline: "2025-09-05",
        requirements: ["Ages 25-45", "Strong dramatic acting experience", "Available for 6-month shoot", "Union preferred but not required"],
        compensation: "$15,000-$35,000/episode",
        contact: "casting@5tagency.com",
        featured: true,
        createdAt: "2025-08-20T10:00:00Z"
      },
      {
        id: 2,
        title: "Industry Networking Gala - Meet the Makers",
        category: "event",
        description: "Exclusive evening connecting top talent with casting directors, agents, and production companies. Premium networking opportunity with panel discussions and portfolio reviews.",
        location: "Beverly Hills, CA",
        date: "2025-10-12",
        deadline: null,
        requirements: ["Professional performers only", "Portfolio/reel required", "Formal attire", "RSVP by October 1st"],
        compensation: null,
        contact: "events@5tagency.com",
        featured: false,
        createdAt: "2025-08-25T15:30:00Z"
      }
    ]
  });

  const announcements: Announcement[] = announcementsData?.announcements || [];
  const filteredAnnouncements = announcements.filter((announcement: Announcement) => {
    const matchesCategory = !filters.category || filters.category === "all" || announcement.category === filters.category;
    const matchesSearch = !filters.search || 
      announcement.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      announcement.description.toLowerCase().includes(filters.search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isDeadlineSoon = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDeadline <= 7 && daysUntilDeadline >= 0;
  };

  // Navigation component based on user role
  const NavigationComponent = () => {
    if (!isAuthenticated) {
      return <Navbar />;
    }
    
    switch (user?.role) {
      case 'admin':
        return <AdminNavbar />;
      case 'talent':
        return <TalentNavbar />;
      case 'client':
        return <ClientNavbar />;
      default:
        return <Navbar />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationComponent />

      {/* Hero Section */}
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
              Announcements & <span className="text-gradient-white">Open Calls</span>
            </h1>
            <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
              Stay updated with the latest opportunities, events, and casting calls from 5T Talent Platform
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search announcements..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full"
                data-testid="input-search-announcements"
              />
            </div>
            <div className="sm:w-48">
              <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                <SelectTrigger data-testid="select-category-filter">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="open-call">Open Calls</SelectItem>
                  <SelectItem value="event">Events</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Announcements Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-80">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <i className="fas fa-exclamation-triangle text-4xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Unable to Load Announcements</h3>
            <p className="text-slate-600 mb-4">
              Something went wrong while loading announcements. Please try again.
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <i className="fas fa-search text-4xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Announcements Found</h3>
            <p className="text-slate-600">
              {filters.search || filters.category ? "Try adjusting your filters to see more results." : "No announcements are currently available."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnnouncements.map((announcement: Announcement) => (
              <Card key={announcement.id} className={`hover:shadow-lg transition-shadow ${announcement.featured ? 'ring-2 ring-primary/20' : ''}`} data-testid={`card-announcement-${announcement.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold mb-2 line-clamp-2">{announcement.title}</CardTitle>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant={announcement.category === 'open-call' ? 'default' : 'secondary'} data-testid={`badge-category-${announcement.category}`}>
                          {announcement.category === 'open-call' ? 'Open Call' : 'Event'}
                        </Badge>
                        {announcement.featured && (
                          <Badge variant="outline" className="border-yellow-500 text-yellow-600 bg-yellow-50">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {announcement.deadline && isDeadlineSoon(announcement.deadline) && (
                          <Badge variant="destructive">
                            <Clock className="w-3 h-3 mr-1" />
                            Urgent
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-600 line-clamp-3">{announcement.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-slate-500">
                      <MapPin className="w-4 h-4 mr-2" />
                      {announcement.location}
                    </div>
                    <div className="flex items-center text-slate-500">
                      <CalendarDays className="w-4 h-4 mr-2" />
                      {formatDate(announcement.date)}
                    </div>
                    {announcement.deadline && (
                      <div className="flex items-center text-slate-500">
                        <Clock className="w-4 h-4 mr-2" />
                        Apply by: {formatDate(announcement.deadline)}
                      </div>
                    )}
                  </div>

                  {announcement.requirements && announcement.requirements.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900 mb-1">Requirements:</h4>
                      <ul className="text-sm text-slate-600 space-y-1">
                        {announcement.requirements.slice(0, 2).map((req: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            {req}
                          </li>
                        ))}
                        {announcement.requirements.length > 2 && (
                          <li className="text-slate-400">+{announcement.requirements.length - 2} more...</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {announcement.compensation && (
                    <div className="text-sm">
                      <span className="font-semibold text-green-600">Compensation: </span>
                      <span className="text-slate-600">{announcement.compensation}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => window.open(`mailto:${announcement.contact}?subject=Inquiry about ${announcement.title}`, '_blank')}
                      data-testid={`button-contact-${announcement.id}`}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Contact Us
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getQueryFn } from "@/lib/queryClient";
import Navbar from "@/components/layout/navbar";
import AdminSidebar from "@/components/layout/admin-sidebar";
import TalentNavbar from "@/components/layout/talent-navbar";
import ClientNavbar from "@/components/layout/client-navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GcsImage } from "@/components/GcsImage";

export default function TalentProfile() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();

  const { data: talent, isLoading, error } = useQuery({
    queryKey: [`/api/talents/public/${id}`],
    queryFn: getQueryFn(),
    retry: false,
  });

  // Loading state component
  const LoadingState = () => (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <i className="fas fa-exclamation-triangle text-4xl"></i>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Talent Profile Not Found</h3>
        <p className="text-slate-600 mb-4">
          The talent profile you're looking for doesn't exist or isn't available.
        </p>
        <Button asChild>
          <Link href="/talent">Back to Directory</Link>
        </Button>
      </div>
    </div>
  );

  // Show loading state
  if (isLoading) {
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <LoadingState />
        </div>
      );
    }

    if (user?.role === 'admin') {
      return (
        <div className="min-h-screen bg-slate-50 flex">
          <AdminSidebar />
          <div className="flex-1">
            <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Talent Profile</h1>
                  <p className="text-slate-600">Loading talent details...</p>
                </div>
              </div>
            </header>
            <main className="overflow-y-auto">
              <LoadingState />
            </main>
          </div>
        </div>
      );
    }

    if (user?.role === 'talent') {
      return (
        <div className="min-h-screen bg-slate-50">
          <TalentNavbar />
          <LoadingState />
        </div>
      );
    }

    if (user?.role === 'client') {
      return (
        <div className="min-h-screen bg-slate-50">
          <ClientNavbar />
          <LoadingState />
        </div>
      );
    }
  }

  // Show error state
  if (error || !talent) {
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <ErrorState />
        </div>
      );
    }

    if (user?.role === 'admin') {
      return (
        <div className="min-h-screen bg-slate-50 flex">
          <AdminSidebar />
          <div className="flex-1">
            <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Talent Profile</h1>
                  <p className="text-slate-600">Profile not found</p>
                </div>
              </div>
            </header>
            <main className="overflow-y-auto">
              <ErrorState />
            </main>
          </div>
        </div>
      );
    }

    if (user?.role === 'talent') {
      return (
        <div className="min-h-screen bg-slate-50">
          <TalentNavbar />
          <ErrorState />
        </div>
      );
    }

    if (user?.role === 'client') {
      return (
        <div className="min-h-screen bg-slate-50">
          <ClientNavbar />
          <ErrorState />
        </div>
      );
    }
  }

  // Main content component
  const TalentProfileContent = () => (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              {talent.mediaUrls && talent.mediaUrls.length > 0 ? (
                <GcsImage 
                  objectName={talent.mediaUrls[0]}
                  alt={talent.stageName || `${talent.user?.firstName} ${talent.user?.lastName}`}
                  className="w-48 h-48 rounded-xl object-cover shadow-lg"
                  fallback={
                    <div className="w-48 h-48 bg-slate-200 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-4xl text-slate-400">{talent.user?.firstName?.[0]}{talent.user?.lastName?.[0]}</span>
                    </div>
                  }
                />
              ) : (
                <div className="w-48 h-48 bg-slate-200 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-4xl text-slate-400">{talent.user?.firstName?.[0]}{talent.user?.lastName?.[0]}</span>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    {talent.stageName || `${talent.user?.firstName} ${talent.user?.lastName}`}
                  </h1>
                  <p className="text-xl text-primary font-medium mb-4">
                    {talent.categories?.join(', ') || 'Professional Talent'}
                  </p>
                  {talent.location && (
                    <p className="text-slate-600 mb-4 flex items-center">
                      <i className="fas fa-map-marker-alt mr-2"></i>
                      {talent.location}
                    </p>
                  )}
                  {talent.bio && (
                    <p className="text-slate-700 leading-relaxed">{talent.bio}</p>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild>
                    <Link href={`/book?talent=${talent.id}`}>Book Now</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/talent">Back to Directory</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Skills */}
          {talent.skills && talent.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills & Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {talent.skills.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Photo Gallery */}
          {talent.mediaUrls && talent.mediaUrls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {talent.mediaUrls.map((objectName: string, index: number) => (
                    <GcsImage 
                      key={objectName}
                      objectName={objectName}
                      alt={`${talent.firstName} ${talent.lastName} - Photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      fallback={
                        <div className="w-full h-32 bg-slate-200 rounded-lg flex items-center justify-center">
                          <i className="fas fa-image text-slate-400"></i>
                        </div>
                      }
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experience */}
          {talent.experience && (
            <Card>
              <CardHeader>
                <CardTitle>Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-slate max-w-none">
                  <p className="whitespace-pre-wrap">{talent.experience}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {talent.experience && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Experience:</span>
                  <span className="font-medium">{talent.experience} years</span>
                </div>
              )}
              {talent.categories && talent.categories.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Categories:</span>
                  <span className="font-medium">{talent.categories.join(', ')}</span>
                </div>
              )}
              {talent.rates?.hourly && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Hourly Rate:</span>
                  <span className="font-medium">${talent.rates.hourly}</span>
                </div>
              )}
              {talent.availability && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Availability:</span>
                  <span className="font-medium">{talent.availability}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" asChild>
                <Link href={`/book?talent=${talent.id}`}>Book This Talent</Link>
              </Button>
              <p className="text-sm text-slate-600 text-center">
                Ready to work together? Click above to start the booking process.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  // Render with appropriate layout based on authentication and user role
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <TalentProfileContent />
        <Footer />
      </div>
    );
  }

  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <AdminSidebar />
        <div className="flex-1">
          <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {talent?.firstName} {talent?.lastName}
                </h1>
                <p className="text-slate-600">Talent Profile</p>
              </div>
            </div>
          </header>
          <main className="overflow-y-auto">
            <TalentProfileContent />
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
          <TalentProfileContent />
        </div>
        <Footer />
      </div>
    );
  }

  if (user?.role === 'client') {
    return (
      <div className="min-h-screen bg-slate-50">
        <ClientNavbar />
        <div className="pt-4">
          <TalentProfileContent />
        </div>
        <Footer />
      </div>
    );
  }

  return null;
}
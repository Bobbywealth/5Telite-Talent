import { useState, useEffect } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GcsImage } from "@/components/GcsImage";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

export default function TalentProfile() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const { data: talent, isLoading, error } = useQuery({
    queryKey: [`/api/talents/public/${id}`],
    queryFn: getQueryFn(),
    retry: false,
  });

  // Gallery functions
  const openGallery = (index: number) => {
    setSelectedImageIndex(index);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
    setSelectedImageIndex(null);
  };

  const nextImage = () => {
    if (talent?.mediaUrls && selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % talent.mediaUrls.length);
    }
  };

  const prevImage = () => {
    if (talent?.mediaUrls && selectedImageIndex !== null) {
      setSelectedImageIndex(selectedImageIndex === 0 ? talent.mediaUrls.length - 1 : selectedImageIndex - 1);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isGalleryOpen) return;
    
    switch (e.key) {
      case 'Escape':
        closeGallery();
        break;
      case 'ArrowLeft':
        prevImage();
        break;
      case 'ArrowRight':
        nextImage();
        break;
    }
  };

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isGalleryOpen, selectedImageIndex]);

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
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => openGallery(0)}
                >
                  <GcsImage 
                    objectName={talent.mediaUrls[0]}
                    alt={talent.stageName || `${talent.user?.firstName} ${talent.user?.lastName}`}
                    className="w-48 h-48 rounded-xl object-cover shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                    fallback={
                      <div className="w-48 h-48 bg-slate-200 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-4xl text-slate-400">{talent.user?.firstName?.[0]}{talent.user?.lastName?.[0]}</span>
                      </div>
                    }
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                        <Maximize2 className="w-6 h-6 text-slate-700" />
                      </div>
                    </div>
                  </div>
                </div>
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
                <CardTitle className="flex items-center gap-2">
                  <Maximize2 className="w-5 h-5" />
                  Photos
                  <Badge variant="secondary" className="ml-auto">
                    {talent.mediaUrls.length} photo{talent.mediaUrls.length !== 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {talent.mediaUrls.map((objectName: string, index: number) => (
                    <div
                      key={objectName}
                      className="relative group cursor-pointer"
                      onClick={() => openGallery(index)}
                    >
                      <GcsImage 
                        objectName={objectName}
                        alt={`${talent.stageName || talent.user?.firstName} ${talent.user?.lastName} - Photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 group-hover:scale-105"
                        fallback={
                          <div className="w-full h-32 bg-slate-200 rounded-lg flex items-center justify-center">
                            <Maximize2 className="w-6 h-6 text-slate-400" />
                          </div>
                        }
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                            <Maximize2 className="w-4 h-4 text-slate-700" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-500 mt-4 text-center">
                  Click any photo to view in full size
                </p>
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

      {/* Photo Gallery Modal */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="absolute top-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between text-white">
              <DialogTitle className="text-lg font-semibold">
                {talent.stageName || `${talent.user?.firstName} ${talent.user?.lastName}`} - Photo Gallery
              </DialogTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/80">
                  {selectedImageIndex !== null ? selectedImageIndex + 1 : 0} of {talent?.mediaUrls?.length || 0}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeGallery}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {selectedImageIndex !== null && talent?.mediaUrls && (
            <div className="relative w-full h-full bg-black flex items-center justify-center">
              {/* Main Image */}
              <div className="relative w-full h-full flex items-center justify-center p-4">
                <GcsImage
                  objectName={talent.mediaUrls[selectedImageIndex]}
                  alt={`${talent.stageName || talent.user?.firstName} ${talent.user?.lastName} - Photo ${selectedImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  fallback={
                    <div className="w-full h-full bg-slate-800 rounded-lg flex items-center justify-center">
                      <Maximize2 className="w-16 h-16 text-slate-400" />
                    </div>
                  }
                />
              </div>

              {/* Navigation Buttons */}
              {talent.mediaUrls.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </>
              )}

              {/* Image Counter Dots */}
              {talent.mediaUrls.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {talent.mediaUrls.map((_: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === selectedImageIndex
                          ? 'bg-white scale-125'
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
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
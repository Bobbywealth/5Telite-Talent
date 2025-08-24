import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function TalentProfile() {
  const { id } = useParams();

  const { data: talent, isLoading, error } = useQuery({
    queryKey: ["/api/talents", id],
    queryFn: async () => {
      const response = await fetch(`/api/talents/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch talent profile");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
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
      </div>
    );
  }

  if (error || !talent) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <i className="fas fa-exclamation-triangle text-4xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Talent Profile Not Found</h3>
            <p className="text-slate-600 mb-4">
              The talent profile you're looking for doesn't exist or isn't available.
            </p>
            <Link href="/talent">
              <Button>Back to Directory</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-32 h-32 md:w-40 md:h-40 mx-auto md:mx-0">
                {talent.user.profileImageUrl ? (
                  <img 
                    src={talent.user.profileImageUrl} 
                    alt={`${talent.user.firstName} ${talent.user.lastName}`}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center">
                    <i className="fas fa-user text-slate-400 text-4xl"></i>
                  </div>
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-slate-900 mb-2" data-testid="text-talent-name">
                  {talent.user.firstName} {talent.user.lastName}
                </h1>
                {talent.stageName && (
                  <p className="text-lg text-slate-600 mb-2" data-testid="text-stage-name">
                    Stage Name: {talent.stageName}
                  </p>
                )}
                <p className="text-slate-500 mb-4" data-testid="text-location">
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  {talent.location || "Location not specified"}
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  {talent.categories?.map((category: string) => (
                    <Badge key={category} className="bg-primary/10 text-primary">
                      {category}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {talent.skills?.map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Biography */}
            {talent.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>Biography</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700" data-testid="text-bio">{talent.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Portfolio */}
            {talent.mediaUrls && talent.mediaUrls.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {talent.mediaUrls.map((url: string, index: number) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Portfolio image ${index + 1}`}
                        className="rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer w-full h-48 object-cover"
                        data-testid={`img-portfolio-${index}`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {talent.user.email && (
                  <div className="flex items-center" data-testid="text-email">
                    <i className="fas fa-envelope text-slate-400 w-5"></i>
                    <span className="ml-3 text-slate-600">{talent.user.email}</span>
                  </div>
                )}
                {talent.user.phone && (
                  <div className="flex items-center" data-testid="text-phone">
                    <i className="fas fa-phone text-slate-400 w-5"></i>
                    <span className="ml-3 text-slate-600">{talent.user.phone}</span>
                  </div>
                )}
                {talent.social?.instagram && (
                  <div className="flex items-center" data-testid="text-instagram">
                    <i className="fab fa-instagram text-slate-400 w-5"></i>
                    <span className="ml-3 text-slate-600">{talent.social.instagram}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Measurements */}
            {talent.measurements && (
              <Card>
                <CardHeader>
                  <CardTitle>Measurements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {Object.entries(talent.measurements).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-slate-600 capitalize">{key}:</span>
                      <span className="text-slate-900" data-testid={`text-measurement-${key}`}>{value as string}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            

            {/* Union Status */}
            {talent.unionStatus && (
              <Card>
                <CardHeader>
                  <CardTitle>Union Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" data-testid="text-union-status">
                    {talent.unionStatus}
                  </Badge>
                </CardContent>
              </Card>
            )}

            {/* Book Now Button */}
            <Link href="/book">
              <Button className="w-full" data-testid="button-request-booking">
                <i className="fas fa-calendar-plus mr-2"></i>
                Request Booking
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

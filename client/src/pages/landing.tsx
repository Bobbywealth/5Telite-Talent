import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import TalentCard from "@/components/talent-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2 } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function Landing() {
  const { toast } = useToast();
  const [bookingForm, setBookingForm] = useState({
    title: "",
    category: "",
    startDate: "",
    endDate: "",
    location: "",
    description: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
  });

  // Fetch featured talents
  const { data: talentsData } = useQuery({
    queryKey: ["/api/talents"],
    queryFn: async () => {
      const response = await fetch("/api/talents?limit=4");
      if (!response.ok) throw new Error("Failed to fetch talents");
      return response.json();
    },
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: typeof bookingForm) => {
      return apiRequest("POST", "/api/bookings/public", data);
    },
    onSuccess: () => {
      toast({
        title: "Booking request submitted!",
        description: "We'll get back to you within 24 hours.",
      });
      setBookingForm({
        title: "",
        category: "",
        startDate: "",
        endDate: "",
        location: "",
        description: "",
        clientName: "",
        clientEmail: "",
        clientPhone: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    bookingMutation.mutate(bookingForm);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO 
        title="5T Elite Talent Platform - Professional Talent Booking & Management"
        description="Connect with top-tier professional talent for your events, productions, and projects. Browse verified profiles, book talent directly, and manage your entertainment needs with 5T Elite."
        keywords="talent booking, professional talent, entertainment booking, actors, models, performers, casting, production, events, talent management"
        url="/"
      />
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-hero-enhanced overflow-hidden">
        {/* Dynamic animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Floating geometric shapes */}
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
          <div className="floating-shape shape-4"></div>
          <div className="floating-shape shape-5"></div>

          {/* Animated particles */}
          <div className="floating-particles">
            <div className="particle particle-1"></div>
            <div className="particle particle-2"></div>
            <div className="particle particle-3"></div>
            <div className="particle particle-4"></div>
            <div className="particle particle-5"></div>
            <div className="particle particle-6"></div>
            <div className="particle particle-7"></div>
            <div className="particle particle-8"></div>
          </div>

          {/* Floating geometric elements */}
          <div className="geometric-elements">
            <div className="triangle triangle-1"></div>
            <div className="triangle triangle-2"></div>
            <div className="circle circle-1"></div>
            <div className="circle circle-2"></div>
            <div className="square square-1"></div>
            <div className="square square-2"></div>
          </div>

          {/* Animated gradient orbs */}
          <div className="gradient-orbs">
            <div className="orb orb-1"></div>
            <div className="orb orb-2"></div>
            <div className="orb orb-3"></div>
          </div>
        </div>

        {/* Content overlay with subtle pattern */}
        <div className="absolute inset-0 bg-black bg-opacity-20 pointer-events-none">
          <div className="absolute inset-0 hero-pattern opacity-5"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center text-white relative z-20">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black mb-8 leading-tight tracking-tight">
                Book
                <br />
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                    Exceptional
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-full"></div>
                </span>
                <br />
                Talent
              </h1>

              <p className="text-lg sm:text-xl lg:text-2xl mb-12 text-white/90 font-light leading-relaxed max-w-3xl mx-auto">
                Connect with diverse, multicultural performers who represent today's evolving global landscape.
                <br />
                <span className="font-semibold text-yellow-300 tracking-wide">Book with confidence</span> through our comprehensive talent platform.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 relative z-10">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-white text-primary hover:bg-slate-50 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl px-8 py-4 text-lg font-semibold" 
                data-testid="button-browse-talent" 
                onClick={() => {
                  window.location.href = "/talent";
                }}
              >
                <i className="fas fa-search text-lg mr-3"></i>Browse Elite Talent
                <i className="fas fa-arrow-right ml-3"></i>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto border-2 border-white/80 bg-white/10 text-white hover:bg-white hover:text-primary hover:scale-105 transition-all duration-300 backdrop-blur-sm px-8 py-4 text-lg font-semibold"
                data-testid="button-request-booking"
                asChild
              >
                <Link href="/book">
                  <i className="fas fa-calendar text-lg mr-3"></i>Start Booking
                  <i className="fas fa-sparkles ml-3"></i>
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto border-2 border-white/80 bg-white/10 text-white hover:bg-white hover:text-primary hover:scale-105 transition-all duration-300 backdrop-blur-sm px-8 py-4 text-lg font-semibold"
                data-testid="button-sign-in"
                onClick={() => window.location.href = "/auth"}
              >
                <i className="fas fa-sign-in-alt text-lg mr-3"></i>Sign In
                <i className="fas fa-user ml-3"></i>
              </Button>
            </div>

            {/* Stats - improved layout */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto text-white animate-fade-in-up-delay-4">
              <div className="text-center">
                <div className="text-3xl lg:text-5xl font-bold mb-2 tracking-tight">100%</div>
                <div className="text-sm-plus text-slate-200 uppercase tracking-wider font-medium">Verified Talent</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-5xl font-bold mb-2 tracking-tight">
                  {talentsData?.total ? `${talentsData.total}+` : "\u2014"}
                </div>
                <div className="text-sm-plus text-slate-200 uppercase tracking-wider font-medium">Registered Talent</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-5xl font-bold mb-2 tracking-tight">24hr</div>
                <div className="text-sm-plus text-slate-200 uppercase tracking-wider font-medium">Response Time</div>
              </div>
            </div>

          </div>
      </section>

      {/* What We Do Section */}
        <section className="py-24 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
          {/* Background branding elements */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 text-6xl font-black text-blue-600 transform -rotate-12">5T</div>
            <div className="absolute top-32 right-20 text-4xl font-black text-blue-600 transform rotate-45">ELITE</div>
            <div className="absolute bottom-20 left-1/4 text-5xl font-black text-blue-600 transform -rotate-45">TALENT</div>
            <div className="absolute bottom-32 right-10 text-3xl font-black text-blue-600 transform rotate-12">5T</div>
            <div className="absolute top-1/2 left-1/2 text-7xl font-black text-blue-600 transform -translate-x-1/2 -translate-y-1/2 rotate-90 opacity-30">ELITE</div>
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                What We Do
              </h2>
              <p className="text-lg-plus sm:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-medium">
                5T Elite Talent is the "everything" of talent and management agencies, focusing on the exquisite beauty and talent of predominantly multiracial-diverse-cultured performers who represent today's evolving global trends.
              </p>
            </div>

            <div className="grid lg:grid-cols-4 gap-6 mb-12">
              <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-full p-4 w-16 h-16 mx-auto mb-5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <i className="fas fa-graduation-cap text-white text-xl"></i>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Educational Programming</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    School assemblies, afterschool programs, and educational content that enriches school communities.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-full p-4 w-16 h-16 mx-auto mb-5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <i className="fas fa-building text-white text-xl"></i>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Corporate Talent</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Talent acquisition for major companies, corporate programming, and finding the right people for your organization.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full p-4 w-16 h-16 mx-auto mb-5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <i className="fas fa-tv text-white text-xl"></i>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Media & Entertainment</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Television, theatrical, commercials, voice over, documentaries, hosting, and new media platforms.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-full p-4 w-16 h-16 mx-auto mb-5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <i className="fas fa-briefcase text-white text-xl"></i>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Employment Services</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Helping employers find employees and helping jobseekers find meaningful work opportunities.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Talent Categories */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50">
              <h3 className="text-2xl font-bold text-slate-900 text-center mb-8">Our Diverse Talent Roster</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-800">Performers</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>&bull; Dancers</li>
                    <li>&bull; Actors</li>
                    <li>&bull; Singers</li>
                    <li>&bull; Musicians</li>
                    <li>&bull; Comedians</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-800">Models</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>&bull; Runway Models</li>
                    <li>&bull; Video & Print Models</li>
                    <li>&bull; All Races & Ethnicities</li>
                    <li>&bull; Children</li>
                    <li>&bull; Seniors</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-800">Creative Professionals</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>&bull; Writers</li>
                    <li>&bull; Poets</li>
                    <li>&bull; Visual Artists</li>
                    <li>&bull; Graphic Designers</li>
                    <li>&bull; Animators</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-800">Specialists</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>&bull; Motivational Speakers</li>
                    <li>&bull; Lecturers</li>
                    <li>&bull; Broadcasters</li>
                    <li>&bull; Stunt Performers</li>
                    <li>&bull; Performers with Disabilities</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* Featured Talents */}
      <section className="relative py-16 bg-gradient-hero-enhanced overflow-hidden">
        {/* Brand floating elements */}
        <div className="absolute inset-0">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-3"></div>
          <div className="floating-shape shape-5"></div>
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-10 brand-dot-pattern"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Featured Talent</h2>
            <p className="text-lg text-slate-200 max-w-2xl mx-auto">
              Explore our diverse roster of professional talent across multiple categories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {talentsData?.talents?.slice(0, 4).map((talent: any) => (
              <TalentCard key={talent.id} talent={talent} />
            )) || (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="bg-white overflow-hidden">
                  <Skeleton className="w-full h-64" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="text-center">
            <Button 
              data-testid="button-load-more-talent" 
              className="relative z-10"
              onClick={() => window.location.href = "/talent"}
            >
              Load More Talent
            </Button>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking-section" className="relative py-16 bg-gradient-hero-enhanced overflow-hidden">
        {/* Brand floating elements */}
        <div className="absolute inset-0">
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-4"></div>
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-10 brand-dot-pattern"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Ready to Book?</h2>
            <p className="text-lg text-slate-200 max-w-2xl mx-auto">
              Start your booking process with our streamlined request system
            </p>
          </div>

          <Card className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl relative z-10">
            <CardContent className="p-8">
              <form onSubmit={handleBookingSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title">Project Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Spring Fashion Campaign"
                      value={bookingForm.title}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, title: e.target.value }))}
                      required
                      data-testid="input-project-title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={bookingForm.category} 
                      onValueChange={(value) => setBookingForm(prev => ({ ...prev, category: value }))}
                      required
                    >
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Commercial">Commercial</SelectItem>
                        <SelectItem value="Fashion">Fashion</SelectItem>
                        <SelectItem value="Editorial">Editorial</SelectItem>
                        <SelectItem value="Event">Event</SelectItem>
                        <SelectItem value="Corporate">Corporate</SelectItem>
                        <SelectItem value="Film/TV">Film/TV</SelectItem>
                        <SelectItem value="Music Video">Music Video</SelectItem>
                        <SelectItem value="Photography">Photography</SelectItem>
                        <SelectItem value="Educational">Educational</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={bookingForm.startDate}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                      data-testid="input-start-date"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={bookingForm.endDate}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, endDate: e.target.value }))}
                      required
                      data-testid="input-end-date"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Shoot location"
                    value={bookingForm.location}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, location: e.target.value }))}
                    data-testid="input-location"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Project Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    placeholder="Describe your project requirements..."
                    value={bookingForm.description}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, description: e.target.value }))}
                    data-testid="textarea-description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="clientName">Your Name</Label>
                    <Input
                      id="clientName"
                      placeholder="Full name"
                      value={bookingForm.clientName}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, clientName: e.target.value }))}
                      required
                      data-testid="input-client-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientEmail">Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={bookingForm.clientEmail}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, clientEmail: e.target.value }))}
                      required
                      data-testid="input-client-email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="clientPhone">Phone Number</Label>
                    <Input
                      id="clientPhone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={bookingForm.clientPhone}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, clientPhone: e.target.value }))}
                      data-testid="input-client-phone"
                    />
                  </div>
                  <div>
                    {/* Empty div to maintain grid layout */}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200" 
                  disabled={bookingMutation.isPending}
                  data-testid="button-submit-booking"
                >
                  {bookingMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Booking Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
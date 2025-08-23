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
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
      return apiRequest("POST", "/api/bookings", data);
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
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-hero-new overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
          <div className="floating-dots"></div>
        </div>
        
        {/* Content overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Main content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6 animate-fade-in-up">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                500+ Professional Talents Available
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up-delay-1">
                Book <span className="text-gradient-white relative">
                  Exceptional
                  <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transform scale-x-0 animate-underline"></div>
                </span> Talent
              </h1>
              
              <p className="text-xl lg:text-2xl text-slate-200 mb-8 max-w-xl lg:max-w-none animate-fade-in-up-delay-2">
                Connect with professional models, actors, and performers for your next project. 
                <span className="text-yellow-300 font-semibold">Book with confidence</span> through our comprehensive talent platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 lg:justify-start justify-center mb-8 animate-fade-in-up-delay-3">
                <Link href="/talent">
                  <Button size="lg" className="bg-white text-primary hover:bg-slate-50 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl" data-testid="button-browse-talent">
                    <i className="fas fa-search mr-2"></i>Browse 500+ Talents
                    <i className="fas fa-arrow-right ml-2"></i>
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-white text-white hover:bg-white hover:text-primary hover:scale-105 transition-all duration-300 backdrop-blur-sm"
                  onClick={() => document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' })}
                  data-testid="button-request-booking"
                >
                  <i className="fas fa-calendar mr-2"></i>Start Booking
                  <i className="fas fa-sparkles ml-2"></i>
                </Button>
              </div>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-white animate-fade-in-up-delay-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-sm text-slate-200">Active Talents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">1000+</div>
                  <div className="text-sm text-slate-200">Completed Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">50+</div>
                  <div className="text-sm text-slate-200">Cities Worldwide</div>
                </div>
              </div>
            </div>
            
            {/* Right side - Visual elements */}
            <div className="hidden lg:block relative">
              <div className="relative">
                {/* Floating cards */}
                <div className="absolute top-0 right-0 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-xl transform rotate-3 hover:rotate-0 transition-all duration-500 floating-card-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <i className="fas fa-star text-white"></i>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">Top Rated</div>
                      <div className="text-sm text-gray-600">5.0 ★ Rating</div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-20 left-0 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-xl transform -rotate-3 hover:rotate-0 transition-all duration-500 floating-card-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                      <i className="fas fa-check text-white"></i>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">Verified</div>
                      <div className="text-sm text-gray-600">Professional</div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute bottom-0 right-10 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-xl transform rotate-2 hover:rotate-0 transition-all duration-500 floating-card-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                      <i className="fas fa-bolt text-white"></i>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">Fast Response</div>
                      <div className="text-sm text-gray-600">&lt; 24 hours</div>
                    </div>
                  </div>
                </div>
                
                {/* Central icon */}
                <div className="mx-auto w-48 h-48 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 pulse-animation">
                  <i className="fas fa-users text-6xl text-white"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Talents */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Featured Talent</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Explore our diverse roster of professional talent across multiple categories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {talentsData?.talents?.slice(0, 4).map((talent: any) => (
              <TalentCard key={talent.id} talent={talent} />
            )) || (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="w-full h-64 bg-slate-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-slate-200 rounded mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded mb-3"></div>
                    <div className="flex gap-2 mb-3">
                      <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
                      <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-16 bg-slate-200 rounded"></div>
                      <div className="h-6 w-20 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-center">
            <Link href="/talent">
              <Button data-testid="button-load-more-talent">
                Load More Talent
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking-section" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Ready to Book?</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Start your booking process with our streamlined request system
            </p>
          </div>

          <Card className="max-w-2xl mx-auto">
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

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={bookingMutation.isPending}
                  data-testid="button-submit-booking"
                >
                  {bookingMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane mr-2"></i>Submit Booking Request
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

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
      <section className="relative bg-gradient-hero">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Discover Exceptional Talent
            </h1>
            <p className="text-xl lg:text-2xl text-slate-200 mb-8 max-w-3xl mx-auto">
              Connect with professional models, actors, and performers for your next project. 
              Book with confidence through our comprehensive talent platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/talent">
                <Button size="lg" className="bg-white text-primary hover:bg-slate-50" data-testid="button-browse-talent">
                  <i className="fas fa-search mr-2"></i>Browse Talent
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-white text-white hover:bg-white hover:text-primary"
                onClick={() => document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-request-booking"
              >
                <i className="fas fa-calendar mr-2"></i>Request Booking
              </Button>
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

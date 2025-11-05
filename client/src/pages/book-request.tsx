
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ClientNavbar from "@/components/layout/client-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookRequest() {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  
  // Get talent info from URL parameters (NEW WORKFLOW)
  const urlParams = new URLSearchParams(window.location.search);
  const talentId = urlParams.get('talentId'); // Changed from 'talent' to 'talentId'
  const talentName = urlParams.get('talentName');
  
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    startDate: "",
    endDate: "",
    location: "",
    description: "",
    deliverables: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    budget: "",
    talentId: talentId || "",
  });
  
  // Fetch selected talent data
  const { data: selectedTalent, isLoading: talentLoading } = useQuery({
    queryKey: ["/api/talents", talentId],
    queryFn: async () => {
      if (!talentId) return null;
      const response = await fetch(`/api/talents/${talentId}`);
      if (!response.ok) throw new Error("Failed to fetch talent");
      return response.json();
    },
    enabled: !!talentId,
    retry: false,
  });
  
  // Pre-populate form with talent data
  useEffect(() => {
    if (selectedTalent) {
      setFormData(prev => ({
        ...prev,
        category: selectedTalent.category || "",
        title: `Project with ${selectedTalent.firstName} ${selectedTalent.lastName}`,
      }));
    }
  }, [selectedTalent]);
  
  
  const bookingMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/bookings/public", {
        ...data,
        // Include requested talent information for admin review
        talentId: talentId,
        talentName: talentName,
      });
    },
    onSuccess: () => {
      toast({
        title: "Booking request submitted successfully!",
        description: talentName 
          ? `Your request to book ${talentName} has been sent to our admin team for review. We'll handle the talent outreach and get back to you soon!`
          : "We'll review your request and get back to you within 24 hours.",
      });
      // Reset form
      setFormData({
        title: "",
        category: "",
        startDate: "",
        endDate: "",
        location: "",
        description: "",
        deliverables: "",
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        budget: "",
        talentId: talentId || "",
      });
    },
    onError: (error) => {
      toast({
        title: "Error submitting request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.clientEmail && !emailRegex.test(formData.clientEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    // Validate dates
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (startDate > endDate) {
        toast({
          title: "Invalid Dates",
          description: "End date must be after start date",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Submit directly without authentication
    bookingMutation.mutate(formData);
  };
  

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Restore form data after login if it exists
  useEffect(() => {
    const savedData = localStorage.getItem('booking_form_data');
    if (savedData && isAuthenticated) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsedData }));
        localStorage.removeItem('booking_form_data');
      } catch (error) {
        console.error('Error parsing saved form data:', error);
      }
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Selected Talent Banner */}
      {selectedTalent && (
        <div className="bg-primary text-white p-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            {selectedTalent.profileImageUrl && (
              <img 
                src={selectedTalent.profileImageUrl} 
                alt={`${selectedTalent.firstName} ${selectedTalent.lastName}`}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div>
              <h2 className="font-semibold">Booking: {selectedTalent.firstName} {selectedTalent.lastName}</h2>
              <p className="text-sm opacity-90">{selectedTalent.category}</p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with Brand Gradient */}
      <section className="relative bg-gradient-hero-enhanced overflow-hidden py-16">
        {/* Dynamic animated background elements */}
        <div className="absolute inset-0">
          {/* Floating geometric shapes */}
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
          <div className="floating-shape shape-4"></div>
          <div className="floating-shape shape-5"></div>
        </div>
        
        {/* Subtle overlay pattern */}
        <div className="absolute inset-0 bg-black bg-opacity-10 brand-dot-pattern"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6 border border-white/30">
            <i className="fas fa-calendar-plus mr-2"></i>
            Professional Booking Request
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {selectedTalent ? `Book ${selectedTalent.firstName}` : "Request a"}
            <span className="block bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">
              {selectedTalent ? selectedTalent.lastName : "Booking"}
            </span>
          </h1>
          
          <p className="text-lg lg:text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed">
            {selectedTalent 
              ? `Tell us about your project and we'll connect you with ${selectedTalent.firstName}. Our team will review your request and provide a customized proposal within 24 hours.`
              : "Tell us about your project and we'll connect you with the perfect talent. Our team will review your request and provide a customized proposal within 24 hours."
            }
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="relative py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
              <CardTitle className="text-2xl text-slate-900 flex items-center">
                <i className="fas fa-file-alt mr-3 text-blue-600"></i>
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Selected Talent Display */}
                {talentLoading && talentId ? (
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <Skeleton className="h-5 w-32 mb-3" />
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-16 h-16 rounded-lg" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                    </div>
                  </div>
                ) : selectedTalent && (
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Selected Talent</h3>
                    <div className="flex items-center gap-3">
                      {selectedTalent.profileImageUrl && (
                        <img 
                          src={selectedTalent.profileImageUrl} 
                          alt={`${selectedTalent.firstName} ${selectedTalent.lastName}`}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium">{selectedTalent.firstName} {selectedTalent.lastName}</p>
                        <p className="text-sm text-slate-600">{selectedTalent.category}</p>
                        {selectedTalent.location && (
                          <p className="text-sm text-slate-500">{selectedTalent.location}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {/* Project Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title" className="text-slate-700 font-medium">Project Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Spring Fashion Campaign 2024"
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      required
                      data-testid="input-project-title"
                      className="mt-2 border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category" className="text-slate-700 font-medium">Category *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleChange("category", value)}
                      required
                    >
                      <SelectTrigger data-testid="select-category" className="mt-2 border-slate-300 focus:ring-blue-500 focus:border-blue-500">
                        <SelectValue placeholder="Select project category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-300">
                        <SelectItem value="Commercial" className="hover:bg-blue-50">Commercial</SelectItem>
                        <SelectItem value="Fashion" className="hover:bg-blue-50">Fashion</SelectItem>
                        <SelectItem value="Editorial" className="hover:bg-blue-50">Editorial</SelectItem>
                        <SelectItem value="Event" className="hover:bg-blue-50">Event</SelectItem>
                        <SelectItem value="Corporate" className="hover:bg-blue-50">Corporate</SelectItem>
                        <SelectItem value="Film/TV" className="hover:bg-blue-50">Film/TV</SelectItem>
                        <SelectItem value="Music Video" className="hover:bg-blue-50">Music Video</SelectItem>
                        <SelectItem value="Photography" className="hover:bg-blue-50">Photography</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Dates and Location */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="startDate" className="text-slate-700 font-medium">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleChange("startDate", e.target.value)}
                      required
                      data-testid="input-start-date"
                      className="mt-2 border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="text-slate-700 font-medium">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleChange("endDate", e.target.value)}
                      required
                      data-testid="input-end-date"
                      className="mt-2 border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-slate-700 font-medium">Location *</Label>
                    <Input
                      id="location"
                      placeholder="e.g., New York Studio"
                      value={formData.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                      required
                      data-testid="input-location"
                      className="mt-2 border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Project Description */}
                <div>
                  <Label htmlFor="description" className="text-slate-700 font-medium">Project Description *</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    placeholder="Describe your project, the type of talent you're looking for, and any specific requirements..."
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    required
                    data-testid="textarea-description"
                    className="mt-2 border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Deliverables */}
                <div>
                  <Label htmlFor="deliverables" className="text-slate-700 font-medium">Deliverables</Label>
                  <Textarea
                    id="deliverables"
                    rows={3}
                    placeholder="What will be delivered? e.g., Photos for social media, commercial video, runway show performance..."
                    value={formData.deliverables}
                    onChange={(e) => handleChange("deliverables", e.target.value)}
                    data-testid="textarea-deliverables"
                    className="mt-2 border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Budget */}
                <div>
                  <Label htmlFor="budget" className="text-slate-700 font-medium">Budget (USD)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="Enter your project budget"
                    value={formData.budget}
                    onChange={(e) => handleChange("budget", e.target.value)}
                    data-testid="input-budget"
                    className="mt-2 border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-sm text-slate-500 mt-2">
                    Optional. Helps us provide more accurate talent recommendations.
                  </p>
                </div>

                {/* Contact Information */}
                <div className="border-t border-slate-200 pt-8">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                    <i className="fas fa-user mr-3 text-blue-600"></i>
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="clientName" className="text-slate-700 font-medium">Your Name *</Label>
                      <Input
                        id="clientName"
                        placeholder="Full name"
                        value={formData.clientName}
                        onChange={(e) => handleChange("clientName", e.target.value)}
                        required
                        data-testid="input-client-name"
                        className="mt-2 border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientEmail" className="text-slate-700 font-medium">Email Address *</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        placeholder="your@company.com"
                        value={formData.clientEmail}
                        onChange={(e) => handleChange("clientEmail", e.target.value)}
                        required
                        data-testid="input-client-email"
                        className="mt-2 border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <Label htmlFor="clientPhone" className="text-slate-700 font-medium">Phone Number</Label>
                    <Input
                      id="clientPhone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.clientPhone}
                      onChange={(e) => handleChange("clientPhone", e.target.value)}
                      data-testid="input-client-phone"
                      className="mt-2 border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-8">
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
                    size="lg"
                    disabled={bookingMutation.isPending || talentLoading}
                    data-testid="button-submit-booking"
                  >
                    {bookingMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-3"></i>
                        Submitting Request...
                      </>
                    ) : talentLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-3"></i>
                        Loading...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane mr-3"></i>
                        {selectedTalent ? `Book ${selectedTalent.firstName} ${selectedTalent.lastName}` : "Submit Booking Request"}
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-slate-500 text-center mt-4">
                    We'll review your request and respond within 24 hours with talent recommendations and next steps.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function BookRequest() {
  const { toast } = useToast();
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
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/bookings", {
        ...data,
        rate: data.budget ? parseFloat(data.budget) : undefined,
        status: "inquiry",
      });
    },
    onSuccess: () => {
      toast({
        title: "Booking request submitted successfully!",
        description: "We'll review your request and get back to you within 24 hours.",
      });
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
    bookingMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Request a Booking
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Tell us about your project and we'll connect you with the perfect talent. 
            Our team will review your request and provide a customized proposal.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Spring Fashion Campaign 2024"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    required
                    data-testid="input-project-title"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleChange("category", value)}
                    required
                  >
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Select project category" />
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
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dates and Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    required
                    data-testid="input-start-date"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    required
                    data-testid="input-end-date"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., New York Studio"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    required
                    data-testid="input-location"
                  />
                </div>
              </div>

              {/* Project Description */}
              <div>
                <Label htmlFor="description">Project Description *</Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Describe your project, the type of talent you're looking for, and any specific requirements..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  required
                  data-testid="textarea-description"
                />
              </div>

              {/* Deliverables */}
              <div>
                <Label htmlFor="deliverables">Deliverables</Label>
                <Textarea
                  id="deliverables"
                  rows={3}
                  placeholder="What will be delivered? e.g., Photos for social media, commercial video, runway show performance..."
                  value={formData.deliverables}
                  onChange={(e) => handleChange("deliverables", e.target.value)}
                  data-testid="textarea-deliverables"
                />
              </div>

              {/* Budget */}
              <div>
                <Label htmlFor="budget">Budget (USD)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="Enter your project budget"
                  value={formData.budget}
                  onChange={(e) => handleChange("budget", e.target.value)}
                  data-testid="input-budget"
                />
                <p className="text-sm text-slate-500 mt-1">
                  Optional. Helps us provide more accurate talent recommendations.
                </p>
              </div>

              {/* Contact Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="clientName">Your Name *</Label>
                    <Input
                      id="clientName"
                      placeholder="Full name"
                      value={formData.clientName}
                      onChange={(e) => handleChange("clientName", e.target.value)}
                      required
                      data-testid="input-client-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientEmail">Email Address *</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      placeholder="your@company.com"
                      value={formData.clientEmail}
                      onChange={(e) => handleChange("clientEmail", e.target.value)}
                      required
                      data-testid="input-client-email"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="clientPhone">Phone Number</Label>
                  <Input
                    id="clientPhone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.clientPhone}
                    onChange={(e) => handleChange("clientPhone", e.target.value)}
                    data-testid="input-client-phone"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={bookingMutation.isPending}
                  data-testid="button-submit-booking"
                >
                  {bookingMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane mr-2"></i>
                      Submit Booking Request
                    </>
                  )}
                </Button>
                <p className="text-sm text-slate-500 text-center mt-3">
                  We'll review your request and respond within 24 hours with talent recommendations and next steps.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}

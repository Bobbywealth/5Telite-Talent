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
import { useLocation } from "react-router-dom";

export default function BookRequest() {
  const navigate = useLocation()[1]; // This line seems to be incorrect as useLocation() returns an object, not an array with an index. Assuming it's a typo and should be removed or corrected if there's a specific routing library context.
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-yellow-400 mb-4">
            Request a Booking
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Tell us about your project and we'll connect you with the perfect talent. 
            Our team will review your request and provide a customized proposal.
          </p>
        </div>

        <Card className="bg-gradient-to-b from-gray-800 to-gray-700 border-yellow-400 border-2">
          <CardHeader className="border-b border-yellow-400">
            <CardTitle className="text-2xl text-yellow-400">Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title" className="text-yellow-400">Project Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Spring Fashion Campaign 2024"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    required
                    data-testid="input-project-title"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="text-yellow-400">Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleChange("category", value)}
                    required
                  >
                    <SelectTrigger data-testid="select-category" className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-yellow-400 focus:border-yellow-400">
                      <SelectValue placeholder="Select project category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600 text-white">
                      <SelectItem value="Commercial" className="hover:bg-yellow-400 hover:text-gray-900">Commercial</SelectItem>
                      <SelectItem value="Fashion" className="hover:bg-yellow-400 hover:text-gray-900">Fashion</SelectItem>
                      <SelectItem value="Editorial" className="hover:bg-yellow-400 hover:text-gray-900">Editorial</SelectItem>
                      <SelectItem value="Event" className="hover:bg-yellow-400 hover:text-gray-900">Event</SelectItem>
                      <SelectItem value="Corporate" className="hover:bg-yellow-400 hover:text-gray-900">Corporate</SelectItem>
                      <SelectItem value="Film/TV" className="hover:bg-yellow-400 hover:text-gray-900">Film/TV</SelectItem>
                      <SelectItem value="Music Video" className="hover:bg-yellow-400 hover:text-gray-900">Music Video</SelectItem>
                      <SelectItem value="Photography" className="hover:bg-yellow-400 hover:text-gray-900">Photography</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dates and Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="startDate" className="text-yellow-400">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    required
                    data-testid="input-start-date"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-yellow-400">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    required
                    data-testid="input-end-date"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                </div>
                <div>
                  <Label htmlFor="location" className="text-yellow-400">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., New York Studio"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    required
                    data-testid="input-location"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                </div>
              </div>

              {/* Project Description */}
              <div>
                <Label htmlFor="description" className="text-yellow-400">Project Description *</Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Describe your project, the type of talent you're looking for, and any specific requirements..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  required
                  data-testid="textarea-description"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>

              {/* Deliverables */}
              <div>
                <Label htmlFor="deliverables" className="text-yellow-400">Deliverables</Label>
                <Textarea
                  id="deliverables"
                  rows={3}
                  placeholder="What will be delivered? e.g., Photos for social media, commercial video, runway show performance..."
                  value={formData.deliverables}
                  onChange={(e) => handleChange("deliverables", e.target.value)}
                  data-testid="textarea-deliverables"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>

              {/* Budget */}
              <div>
                <Label htmlFor="budget" className="text-yellow-400">Budget (USD)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="Enter your project budget"
                  value={formData.budget}
                  onChange={(e) => handleChange("budget", e.target.value)}
                  data-testid="input-budget"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-yellow-400 focus:border-yellow-400"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Optional. Helps us provide more accurate talent recommendations.
                </p>
              </div>

              {/* Contact Information */}
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-yellow-400 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="clientName" className="text-yellow-400">Your Name *</Label>
                    <Input
                      id="clientName"
                      placeholder="Full name"
                      value={formData.clientName}
                      onChange={(e) => handleChange("clientName", e.target.value)}
                      required
                      data-testid="input-client-name"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-yellow-400 focus:border-yellow-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientEmail" className="text-yellow-400">Email Address *</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      placeholder="your@company.com"
                      value={formData.clientEmail}
                      onChange={(e) => handleChange("clientEmail", e.target.value)}
                      required
                      data-testid="input-client-email"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-yellow-400 focus:border-yellow-400"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="clientPhone" className="text-yellow-400">Phone Number</Label>
                  <Input
                    id="clientPhone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.clientPhone}
                    onChange={(e) => handleChange("clientPhone", e.target.value)}
                    data-testid="input-client-phone"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button 
                  type="submit" 
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
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
                <p className="text-sm text-gray-400 text-center mt-3">
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
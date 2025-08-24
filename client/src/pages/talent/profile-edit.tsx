import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";
import TalentNavbar from "@/components/layout/talent-navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const categories = [
  "Commercial",
  "Runway", 
  "Editorial",
  "On-Camera",
  "Voiceover",
  "Event",
  "Corporate"
];

const skills = [
  "Acting",
  "Modeling", 
  "Dance",
  "Singing",
  "Voice Acting",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Yoga",
  "Sports",
  "Comedy",
  "Drama",
  "Improvisation",
  "Stage Combat",
  "Martial Arts"
];

const unionStatuses = ["SAG-AFTRA", "Non-Union", "Other"];

export default function TalentProfileEdit() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    stageName: "",
    categories: [] as string[],
    skills: [] as string[],
    bio: "",
    location: "",
    unionStatus: "",
    measurements: {
      height: "",
      weight: "",
      bust: "",
      waist: "",
      hips: "",
      jacket: "",
      inseam: "",
      shoe: "",
      hair: "",
      eyes: "",
    },
    rates: {
      day: "",
      halfDay: "",
      hourly: "",
    },
    social: {
      instagram: "",
      tiktok: "",
      youtube: "",
      website: "",
    },
    guardian: {
      name: "",
      email: "",
      phone: "",
    },
  });

  // Populate form with existing data when profile loads
  useEffect(() => {
    if (profileData?.talentProfile) {
      const profile = profileData.talentProfile;
      setFormData({
        stageName: profile.stageName || "",
        categories: profile.categories || [],
        skills: profile.skills || [],
        bio: profile.bio || "",
        location: profile.location || "",
        unionStatus: profile.unionStatus || "",
        measurements: profile.measurements || {
          height: "",
          weight: "",
          bust: "",
          waist: "",
          hips: "",
          jacket: "",
          inseam: "",
          shoe: "",
          hair: "",
          eyes: "",
        },
        rates: {
          day: profile.rates?.day?.toString() || "",
          halfDay: profile.rates?.halfDay?.toString() || "",
          hourly: profile.rates?.hourly?.toString() || "",
        },
        social: profile.social || {
          instagram: "",
          tiktok: "",
          youtube: "",
          website: "",
        },
        guardian: profile.guardian || {
          name: "",
          email: "",
          phone: "",
        },
      });
    }
  }, [profileData]);

  // Authentication is handled by the Router component

  // Fetch current profile data
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const userData = await apiRequest("GET", "/api/auth/user");
      // Try to fetch talent profile
      try {
        const talentProfile = await apiRequest("GET", `/api/talents/${userData.id}`);
        return { ...userData, talentProfile };
      } catch (error) {
        // Profile doesn't exist yet, return user data only
        return { ...userData, talentProfile: null };
      }
    },
    enabled: isAuthenticated && user?.role === 'talent',
    retry: false,
  });

  // Save profile mutation
  const saveProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        rates: {
          day: data.rates.day ? parseFloat(data.rates.day) : undefined,
          halfDay: data.rates.halfDay ? parseFloat(data.rates.halfDay) : undefined,
          hourly: data.rates.hourly ? parseFloat(data.rates.hourly) : undefined,
        },
      };
      
      // Check if profile exists first
      if (profileData?.talentProfile) {
        // Update existing profile
        return apiRequest("PATCH", `/api/talents/${user?.id}`, payload);
      } else {
        // Create new profile
        return apiRequest("POST", "/api/talents", payload);
      }
    },
    onSuccess: () => {
      toast({
        title: "Profile updated successfully!",
        description: "Your changes have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle upload parameters
  const handleGetUploadParameters = async () => {
    try {
      const response = await fetch("/api/objects/upload", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to get upload URL");
      const data = await response.json();
      return {
        method: "PUT" as const,
        url: data.uploadURL,
      };
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to prepare file upload",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Handle upload completion
  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      try {
        await apiRequest("PATCH", `/api/talents/${user?.id}`, {
          mediaUrls: [...(profileData?.talentProfile?.mediaUrls || []), uploadedFile.uploadURL],
        });
        toast({
          title: "Media uploaded successfully!",
          description: "Your portfolio has been updated.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      } catch (error: any) {
        if (isUnauthorizedError(error)) {
          toast({
            title: "Unauthorized", 
            description: "You are logged out. Logging in again...",
            variant: "destructive",
          });
          setTimeout(() => {
            window.location.href = "/api/login";
          }, 500);
          return;
        }
        toast({
          title: "Error",
          description: "Failed to save uploaded media",
          variant: "destructive",
        });
      }
    }
  };

  const updateFormData = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as any),
        [field]: value,
      },
    }));
  };

  const addToArray = (field: "categories" | "skills", value: string) => {
    if (!formData[field].includes(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value],
      }));
    }
  };

  const removeFromArray = (field: "categories" | "skills", value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(item => item !== value),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfileMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'talent') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TalentNavbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Edit Profile</h1>
          <p className="text-lg text-slate-600">
            Update your talent profile to showcase your skills and experience to potential clients.
          </p>
          
          {/* Profile Status */}
        </div>

        {profileLoading ? (
          <Card>
            <CardContent className="p-8">
              <div className="space-y-6">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-32 w-full" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="general" data-testid="tab-general">General</TabsTrigger>
                <TabsTrigger value="measurements" data-testid="tab-measurements">Measurements</TabsTrigger>
                <TabsTrigger value="skills" data-testid="tab-skills">Skills</TabsTrigger>
                <TabsTrigger value="media" data-testid="tab-media">Media</TabsTrigger>
                <TabsTrigger value="rates" data-testid="tab-rates">Rates</TabsTrigger>
              </TabsList>

              {/* General Information */}
              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>General Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="stageName">Stage Name</Label>
                        <Input
                          id="stageName"
                          value={formData.stageName}
                          onChange={(e) => setFormData(prev => ({ ...prev, stageName: e.target.value }))}
                          placeholder="Professional name or alias"
                          data-testid="input-stage-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="City, State"
                          data-testid="input-location"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="unionStatus">Union Status</Label>
                      <Select 
                        value={formData.unionStatus} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, unionStatus: value }))}
                      >
                        <SelectTrigger data-testid="select-union-status">
                          <SelectValue placeholder="Select union status" />
                        </SelectTrigger>
                        <SelectContent>
                          {unionStatuses.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="bio">Biography</Label>
                      <Textarea
                        id="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Describe your experience, specialties, and what makes you unique..."
                        data-testid="textarea-bio"
                      />
                    </div>

                    <div>
                      <Label>Social Media</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div>
                          <Label htmlFor="instagram" className="text-sm">Instagram</Label>
                          <Input
                            id="instagram"
                            value={formData.social.instagram}
                            onChange={(e) => updateFormData('social', 'instagram', e.target.value)}
                            placeholder="@username"
                            data-testid="input-instagram"
                          />
                        </div>
                        <div>
                          <Label htmlFor="tiktok" className="text-sm">TikTok</Label>
                          <Input
                            id="tiktok"
                            value={formData.social.tiktok}
                            onChange={(e) => updateFormData('social', 'tiktok', e.target.value)}
                            placeholder="@username"
                            data-testid="input-tiktok"
                          />
                        </div>
                        <div>
                          <Label htmlFor="youtube" className="text-sm">YouTube</Label>
                          <Input
                            id="youtube"
                            value={formData.social.youtube}
                            onChange={(e) => updateFormData('social', 'youtube', e.target.value)}
                            placeholder="Channel URL"
                            data-testid="input-youtube"
                          />
                        </div>
                        <div>
                          <Label htmlFor="website" className="text-sm">Website</Label>
                          <Input
                            id="website"
                            value={formData.social.website}
                            onChange={(e) => updateFormData('social', 'website', e.target.value)}
                            placeholder="https://..."
                            data-testid="input-website"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Guardian Information (for minors)</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div>
                          <Label htmlFor="guardianName" className="text-sm">Name</Label>
                          <Input
                            id="guardianName"
                            value={formData.guardian.name}
                            onChange={(e) => updateFormData('guardian', 'name', e.target.value)}
                            placeholder="Guardian's full name"
                            data-testid="input-guardian-name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="guardianEmail" className="text-sm">Email</Label>
                          <Input
                            id="guardianEmail"
                            type="email"
                            value={formData.guardian.email}
                            onChange={(e) => updateFormData('guardian', 'email', e.target.value)}
                            placeholder="guardian@email.com"
                            data-testid="input-guardian-email"
                          />
                        </div>
                        <div>
                          <Label htmlFor="guardianPhone" className="text-sm">Phone</Label>
                          <Input
                            id="guardianPhone"
                            type="tel"
                            value={formData.guardian.phone}
                            onChange={(e) => updateFormData('guardian', 'phone', e.target.value)}
                            placeholder="(555) 123-4567"
                            data-testid="input-guardian-phone"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Measurements */}
              <TabsContent value="measurements">
                <Card>
                  <CardHeader>
                    <CardTitle>Measurements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {Object.entries(formData.measurements).map(([key, value]) => (
                        <div key={key}>
                          <Label htmlFor={key} className="text-sm capitalize">
                            {key === 'bust' ? 'Bust/Chest' : key}
                          </Label>
                          <Input
                            id={key}
                            value={value}
                            onChange={(e) => updateFormData('measurements', key, e.target.value)}
                            placeholder={
                              key === 'height' ? '5\'8"' :
                              key === 'weight' ? '120 lbs' :
                              key === 'shoe' ? '8.5' :
                              key === 'hair' ? 'Brown' :
                              key === 'eyes' ? 'Hazel' :
                              '34"'
                            }
                            data-testid={`input-measurement-${key}`}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Skills & Categories */}
              <TabsContent value="skills">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {formData.categories.length > 0 && (
                          <div>
                            <Label className="text-sm">Selected Categories</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {formData.categories.map(category => (
                                <Badge 
                                  key={category}
                                  variant="default"
                                  className="cursor-pointer"
                                  onClick={() => removeFromArray('categories', category)}
                                  data-testid={`badge-selected-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                                >
                                  {category}
                                  <i className="fas fa-times ml-1"></i>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <Label className="text-sm">Available Categories</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {categories
                              .filter(category => !formData.categories.includes(category))
                              .map(category => (
                                <Badge 
                                  key={category}
                                  variant="outline"
                                  className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                                  onClick={() => addToArray('categories', category)}
                                  data-testid={`badge-available-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                                >
                                  {category}
                                  <i className="fas fa-plus ml-1"></i>
                                </Badge>
                              ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {formData.skills.length > 0 && (
                          <div>
                            <Label className="text-sm">Selected Skills</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {formData.skills.map(skill => (
                                <Badge 
                                  key={skill}
                                  variant="secondary"
                                  className="cursor-pointer"
                                  onClick={() => removeFromArray('skills', skill)}
                                  data-testid={`badge-selected-skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}
                                >
                                  {skill}
                                  <i className="fas fa-times ml-1"></i>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <Label className="text-sm">Available Skills</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {skills
                              .filter(skill => !formData.skills.includes(skill))
                              .map(skill => (
                                <Badge 
                                  key={skill}
                                  variant="outline"
                                  className="cursor-pointer hover:bg-secondary hover:text-white transition-colors"
                                  onClick={() => addToArray('skills', skill)}
                                  data-testid={`badge-available-skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}
                                >
                                  {skill}
                                  <i className="fas fa-plus ml-1"></i>
                                </Badge>
                              ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Media Upload */}
              <TabsContent value="media">
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio Media</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <Label className="text-base font-medium mb-4 block">Upload Photos & Videos</Label>
                        <ObjectUploader
                          maxNumberOfFiles={5}
                          maxFileSize={52428800} // 50MB
                          onGetUploadParameters={handleGetUploadParameters}
                          onComplete={handleUploadComplete}
                          buttonClassName="w-full"
                        >
                          <div className="flex items-center justify-center gap-3 py-4">
                            <i className="fas fa-cloud-upload-alt text-xl"></i>
                            <span>Upload Portfolio Media</span>
                          </div>
                        </ObjectUploader>
                        <p className="text-sm text-slate-500 mt-2">
                          Upload high-quality photos and videos that showcase your talent. Maximum 5 files, 50MB each.
                        </p>
                      </div>

                      {/* Current Media */}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Rates */}
              <TabsContent value="rates">
                <Card>
                  <CardHeader>
                    <CardTitle>Rates & Pricing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label htmlFor="dayRate">Day Rate (USD)</Label>
                        <Input
                          id="dayRate"
                          type="number"
                          value={formData.rates.day}
                          onChange={(e) => updateFormData('rates', 'day', e.target.value)}
                          placeholder="800"
                          data-testid="input-day-rate"
                        />
                      </div>
                      <div>
                        <Label htmlFor="halfDayRate">Half Day Rate (USD)</Label>
                        <Input
                          id="halfDayRate"
                          type="number"
                          value={formData.rates.halfDay}
                          onChange={(e) => updateFormData('rates', 'halfDay', e.target.value)}
                          placeholder="500"
                          data-testid="input-half-day-rate"
                        />
                      </div>
                      <div>
                        <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
                        <Input
                          id="hourlyRate"
                          type="number"
                          value={formData.rates.hourly}
                          onChange={(e) => updateFormData('rates', 'hourly', e.target.value)}
                          placeholder="125"
                          data-testid="input-hourly-rate"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 mt-4">
                      Set your base rates for different booking durations. These can be negotiated based on usage rights and project scope.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Save Button */}
            <div className="flex justify-end pt-6">
              <Button 
                type="submit" 
                disabled={saveProfileMutation.isPending}
                className="min-w-32"
                data-testid="button-save-profile"
              >
                {saveProfileMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>

      <Footer />
    </div>
  );
}

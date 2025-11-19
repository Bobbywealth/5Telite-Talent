import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Eye, EyeOff, Sparkles, Users, Briefcase, Shield, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import logoImage from "@assets/5t-logo.png";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  ),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["admin", "talent", "client"]).default("talent"),
  isOver18: z.boolean(),
  guardianPhone: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
}).refine((data) => {
  // If under 18, guardian phone is required
  if (!data.isOver18 && (!data.guardianPhone || data.guardianPhone.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Parent/guardian phone number is required for users under 18",
  path: ["guardianPhone"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

const roleDescriptions = {
  talent: "Showcase your skills and get discovered by clients looking for exceptional performers",
  client: "Find and book talented performers for your projects, events, and productions", 
  admin: "Manage platform operations, oversee bookings, and support the talent community"
};

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const queryClient = useQueryClient();

  // Redirect if already logged in
  if (user && !isLoading) {
    setLocation("/");
    return null;
  }

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "talent",
      isOver18: true,
      guardianPhone: "",
      acceptTerms: false,
    },
  });

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPasswordHelp, setShowPasswordHelp] = useState(false);

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^\w\s]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 2) return 'bg-red-500';
    if (passwordStrength < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 2) return 'Weak';
    if (passwordStrength < 4) return 'Medium';
    return 'Strong';
  };

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      return await apiRequest("POST", "/api/login", data);
    },
    onSuccess: async (data: any) => {
      // Invalidate and refetch user data
      await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      await queryClient.refetchQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      
      // Small delay to ensure auth state updates
      setTimeout(() => {
        const redirectPaths: Record<string, string> = {
          admin: '/admin',
          talent: '/talent/dashboard', // Use talent-specific path
          client: '/client'
        };
        const redirectPath = redirectPaths[data?.role] || '/';
        window.location.href = redirectPath; // Force full page navigation
      }, 1000); // Longer delay for auth state
    },
    onError: (error: any) => {
      toast({
        title: "Sign in failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      return await apiRequest("POST", "/api/register", data);
    },
    onSuccess: async (data: any) => {
      // Check if account requires approval
      if (data.requiresApproval) {
        toast({
          title: "Account Created!",
          description: data.message || "Your account is pending admin approval. You'll receive an email once approved.",
        });
        
        // Stay on auth page with message
        return;
      }

      // For approved accounts, proceed with login
      await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      await queryClient.refetchQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: "Welcome to 5T Talent!",
        description: "Your account has been created successfully.",
      });
      
      // Small delay to ensure auth state updates
      setTimeout(() => {
        const redirectPaths: Record<string, string> = {
          admin: '/admin',
          talent: '/talent/dashboard',
          client: '/client'
        };
        const redirectPath = redirectPaths[data?.role || data?.user?.role] || '/';
        window.location.href = redirectPath; // Force full page navigation
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const onLogin = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-lg animate-bounce"></div>
        <div className="absolute bottom-32 left-32 w-40 h-40 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-xl animate-bounce"></div>
        
        {/* Floating particles */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-white/30 rounded-full animate-ping`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left side - Enhanced Hero section */}
        <div className="hidden md:block space-y-10">
          <div className="space-y-6">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <Sparkles className="w-4 h-4 text-yellow-400 mr-2" />
              <span className="text-white/90 text-sm font-medium">Premium Talent Platform</span>
            </div>
            
            <h1 className="text-5xl xl:text-7xl font-black text-white leading-tight tracking-tight">
              Welcome to the Future of
              <br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Talent Booking
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-full animate-pulse"></div>
              </span>
            </h1>
            
            <p className="text-xl text-white/80 leading-relaxed max-w-lg">
              Connect with exceptional performers and streamline your booking process with our 
              <span className="font-semibold text-cyan-300"> comprehensive talent platform</span>.
            </p>
          </div>

          <div className="space-y-8">
            <div className="group flex items-start space-x-6 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Diverse Talent Pool</h3>
                <p className="text-white/70 leading-relaxed">Access to exceptional performers from all backgrounds and specialties</p>
              </div>
            </div>
            
            <div className="group flex items-start space-x-6 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Streamlined Booking</h3>
                <p className="text-white/70 leading-relaxed">Efficient workflow from inquiry to completion with automated processes</p>
              </div>
            </div>
            
            <div className="group flex items-start space-x-6 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Professional Tools</h3>
                <p className="text-white/70 leading-relaxed">Complete platform for talent management and project coordination</p>
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center space-x-8 pt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">500+</div>
              <div className="text-sm text-white/60 uppercase tracking-wider">Verified Talents</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">1000+</div>
              <div className="text-sm text-white/60 uppercase tracking-wider">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">24hrs</div>
              <div className="text-sm text-white/60 uppercase tracking-wider">Average Response</div>
            </div>
          </div>
        </div>

        {/* Right side - Enhanced Auth forms */}
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Hero Section */}
          <div className="md:hidden text-center mb-8 space-y-4">
            <div className="inline-flex items-center px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-4">
              <Sparkles className="w-3 h-3 text-yellow-400 mr-2" />
              <span className="text-white/90 text-xs font-medium">Premium Platform</span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              Join <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">5T Talent</span>
            </h1>
            <p className="text-white/70">
              Connect with exceptional performers and streamline your booking process
            </p>
          </div>
          
          {/* Back to Homepage Button - Above the card */}
          <div className="flex justify-center mb-6 w-full max-w-md">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm transition-all duration-200 hover:scale-105 text-lg px-6 py-6 h-auto"
              size="lg"
            >
              <ArrowLeft className="h-5 w-5 mr-3" />
              Back to Homepage
            </Button>
          </div>

          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm relative overflow-hidden">
            {/* Card decoration */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"></div>
            
            <CardHeader className="text-center pb-4 pt-8">
              <div className="w-20 h-20 mx-auto mb-4">
                <img 
                  src={logoImage} 
                  alt="5T Talent Platform" 
                  className="w-full h-full object-contain"
                />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-purple-900 bg-clip-text text-transparent">
                Welcome to the Future of Talent Booking
              </CardTitle>
              <CardDescription className="text-gray-600">
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100 p-1 rounded-xl h-12">
                  <TabsTrigger 
                    value="login" 
                    data-testid="tab-login"
                    className="rounded-lg font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register" 
                    data-testid="tab-register"
                    className="rounded-lg font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="your@email.com"
                                className="h-12 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-300"
                                data-testid="input-login-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter your password"
                                  className="h-12 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-300"
                                  data-testid="input-login-password"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                  data-testid="button-toggle-password"
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Forgot Password Link */}
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setLocation("/forgot-password")}
                          className="text-sm text-purple-600 hover:text-purple-800 hover:underline transition-colors"
                        >
                          Forgot Password?
                        </button>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-slate-900 to-purple-900 hover:from-slate-800 hover:to-purple-800 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                        disabled={loginMutation.isPending}
                        data-testid="button-login"
                      >
                        {loginMutation.isPending ? (
                          <div className="flex items-center">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                            Signing in...
                          </div>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="John"
                                  className="h-12 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-300"
                                  data-testid="input-register-firstName"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Doe"
                                  className="h-12 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-300"
                                  data-testid="input-register-lastName"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="your@email.com"
                                className="h-12 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-300"
                                data-testid="input-register-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Create a strong password"
                                  className="h-12 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-300"
                                  data-testid="input-register-password"
                                  onFocus={() => setShowPasswordHelp(true)}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    checkPasswordStrength(e.target.value);
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                  data-testid="button-toggle-password-register"
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            
                            {/* Enhanced Password Strength Indicator */}
                            {field.value && (
                              <div className="space-y-3 mt-3">
                                <div className="flex items-center space-x-3">
                                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full transition-all duration-500 ${getPasswordStrengthColor()}`}
                                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                    />
                                  </div>
                                  <div className={`text-xs font-semibold px-2 py-1 rounded-full transition-all duration-300 ${
                                    passwordStrength < 2 
                                      ? 'bg-red-50 text-red-600' 
                                      : passwordStrength < 4 
                                        ? 'bg-yellow-50 text-yellow-600' 
                                        : 'bg-green-50 text-green-600'
                                  }`}>
                                    {getPasswordStrengthText()}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Enhanced Password Requirements */}
                            {showPasswordHelp && (
                              <div className="text-xs space-y-2 mt-3 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                                <div className="font-semibold text-slate-800 mb-3 flex items-center">
                                  <Shield className="w-4 h-4 mr-2 text-blue-600" />
                                  Password must contain:
                                </div>
                                <div className={`flex items-center space-x-2 ${field.value?.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                                  {field.value?.length >= 8 ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                  <span>At least 8 characters</span>
                                </div>
                                <div className={`flex items-center space-x-2 ${/[a-z]/.test(field.value || '') ? 'text-green-600' : 'text-gray-500'}`}>
                                  {/[a-z]/.test(field.value || '') ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                  <span>One lowercase letter</span>
                                </div>
                                <div className={`flex items-center space-x-2 ${/[A-Z]/.test(field.value || '') ? 'text-green-600' : 'text-gray-500'}`}>
                                  {/[A-Z]/.test(field.value || '') ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                  <span>One uppercase letter</span>
                                </div>
                                <div className={`flex items-center space-x-2 ${/\d/.test(field.value || '') ? 'text-green-600' : 'text-gray-500'}`}>
                                  {/\d/.test(field.value || '') ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                  <span>One number</span>
                                </div>
                              </div>
                            )}
                            
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>I am a...</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger 
                                  data-testid="select-register-role"
                                  className="h-12 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-300"
                                >
                                  <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-white border-0 shadow-xl rounded-xl z-[999999] w-[400px] max-w-[calc(100vw-2rem)]">
                                <SelectItem value="talent" className="hover:bg-purple-50 focus:bg-purple-50 rounded-lg py-4 px-4 m-1 cursor-pointer h-auto">
                                  <div className="flex items-center gap-3 w-full">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                                      <Sparkles className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                      <div className="font-bold text-gray-900 text-base mb-0.5 whitespace-normal leading-tight">Talent/Performer</div>
                                      <div className="text-xs text-gray-600 whitespace-normal leading-relaxed">Showcase your skills and get booked for gigs</div>
                                    </div>
                                  </div>
                                </SelectItem>
                                <SelectItem value="client" className="hover:bg-blue-50 focus:bg-blue-50 rounded-lg py-4 px-4 m-1 cursor-pointer h-auto">
                                  <div className="flex items-center gap-3 w-full">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                                      <Briefcase className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                      <div className="font-bold text-gray-900 text-base mb-0.5 whitespace-normal leading-tight">Client/Booker</div>
                                      <div className="text-xs text-gray-600 whitespace-normal leading-relaxed">Find and book talented performers</div>
                                    </div>
                                  </div>
                                </SelectItem>
                                <SelectItem value="admin" className="hover:bg-green-50 focus:bg-green-50 rounded-lg py-4 px-4 m-1 cursor-pointer h-auto">
                                  <div className="flex items-center gap-3 w-full">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                                      <Shield className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                      <div className="font-bold text-gray-900 text-base mb-0.5 whitespace-normal leading-tight">Admin</div>
                                      <div className="text-xs text-gray-600 whitespace-normal leading-relaxed">Manage platform operations</div>
                                    </div>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Age Verification */}
                      <FormField
                        control={registerForm.control}
                        name="isOver18"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                              <FormLabel className="text-base font-semibold text-gray-900 mb-3 block">
                                Age Verification
                              </FormLabel>
                              <div className="flex items-start space-x-3">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    data-testid="checkbox-over-18"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-medium text-gray-700">
                                    I am 18 years or older
                                  </FormLabel>
                                  <p className="text-xs text-gray-500">
                                    If you are under 18, we'll need a parent/guardian contact
                                  </p>
                                </div>
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Guardian Phone - Only show if under 18 */}
                      {!registerForm.watch("isOver18") && (
                        <FormField
                          control={registerForm.control}
                          name="guardianPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-2">
                                <span>Parent/Guardian Phone Number</span>
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="tel"
                                  placeholder="(555) 123-4567"
                                  className="h-12 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-300"
                                  data-testid="input-guardian-phone"
                                />
                              </FormControl>
                              <p className="text-xs text-gray-500 mt-1">
                                We'll contact your parent/guardian for verification
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={registerForm.control}
                        name="acceptTerms"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <div className="flex items-start space-x-3">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={(checked) => field.onChange(checked === true)}
                                  data-testid="checkbox-accept-terms"
                                  className="cursor-pointer mt-0.5"
                                  id="accept-terms-checkbox"
                                />
                              </FormControl>
                              <button
                                type="button"
                                className="space-y-1 leading-none flex-1 text-left"
                                onClick={() => field.onChange(!field.value)}
                              >
                                <span className="text-sm font-normal text-gray-700">
                                  I agree to the{" "}
                                  <a 
                                    href="/terms" 
                                    className="text-blue-600 hover:text-blue-800 hover:underline font-semibold inline-block cursor-pointer underline-offset-2 transition-colors" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      window.open('/terms', '_blank', 'noopener,noreferrer');
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                  >
                                    Terms of Service
                                  </a>
                                  {" "}and{" "}
                                  <a 
                                    href="/privacy" 
                                    className="text-blue-600 hover:text-blue-800 hover:underline font-semibold inline-block cursor-pointer underline-offset-2 transition-colors" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      window.open('/privacy', '_blank', 'noopener,noreferrer');
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                  >
                                    Privacy Policy
                                  </a>
                                </span>
                              </button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* What happens next */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">What happens next?</span>
                        </div>
                        <div className="text-xs text-blue-700 space-y-1">
                          <p>• We'll send a verification email to confirm your account</p>
                          <p>• Complete your profile to get the most out of the platform</p>
                          <p>• Start connecting with the talent community right away!</p>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-slate-900 to-purple-900 hover:from-slate-800 hover:to-purple-800 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                        disabled={registerMutation.isPending}
                        data-testid="button-register"
                      >
                        {registerMutation.isPending ? (
                          <div className="flex items-center">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                            Creating account...
                          </div>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
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
import { Eye, EyeOff, Sparkles, Users, Briefcase, Shield, CheckCircle, AlertCircle } from "lucide-react";

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
  acceptTerms: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
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
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      // Redirect based on user role
      const redirectPaths: Record<string, string> = {
        admin: '/admin',
        talent: '/dashboard',
        client: '/client'
      };
      const redirectPath = redirectPaths[data?.role] || '/';
      setLocation(redirectPath);
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
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Welcome to 5T Talent!",
        description: "Your account has been created successfully.",
      });
      // Redirect based on user role
      const redirectPaths: Record<string, string> = {
        admin: '/admin',
        talent: '/dashboard',
        client: '/client'
      };
      const redirectPath = redirectPaths[data?.role] || '/';
      setLocation(redirectPath);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Hero section */}
        <div className="hidden md:block space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
              Join the Future of
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Talent Booking
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Connect with exceptional performers and streamline your booking process with our comprehensive talent platform.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Diverse Talent Pool</h3>
                <p className="text-gray-600">Access to exceptional performers from all backgrounds</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Streamlined Booking</h3>
                <p className="text-gray-600">Efficient workflow from inquiry to completion</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Professional Tools</h3>
                <p className="text-gray-600">Complete platform for talent management</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth forms */}
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Hero Section */}
          <div className="md:hidden text-center mb-8 space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Join <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">5T Talent</span>
            </h1>
            <p className="text-gray-600">
              Connect with exceptional performers and streamline your booking process
            </p>
          </div>
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
              <CardDescription>
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login" data-testid="tab-login">Sign In</TabsTrigger>
                  <TabsTrigger value="register" data-testid="tab-register">Sign Up</TabsTrigger>
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

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                        data-testid="button-login"
                      >
                        {loginMutation.isPending ? "Signing in..." : "Sign In"}
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
                            
                            {/* Password Strength Indicator */}
                            {field.value && (
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-medium text-gray-600">
                                    {getPasswordStrengthText()}
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            {/* Password Requirements */}
                            {showPasswordHelp && (
                              <div className="text-xs space-y-1 mt-2 p-3 bg-blue-50 rounded-lg">
                                <div className="font-medium text-blue-900 mb-2">Password must contain:</div>
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
                                <SelectTrigger data-testid="select-register-role">
                                  <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="talent">
                                  <div className="flex items-center space-x-2">
                                    <Sparkles className="w-4 h-4 text-purple-500" />
                                    <div>
                                      <div className="font-medium">Talent/Performer</div>
                                      <div className="text-xs text-gray-500">Showcase your skills, get booked</div>
                                    </div>
                                  </div>
                                </SelectItem>
                                <SelectItem value="client">
                                  <div className="flex items-center space-x-2">
                                    <Briefcase className="w-4 h-4 text-blue-500" />
                                    <div>
                                      <div className="font-medium">Client/Booker</div>
                                      <div className="text-xs text-gray-500">Find and book talented performers</div>
                                    </div>
                                  </div>
                                </SelectItem>
                                <SelectItem value="admin">
                                  <div className="flex items-center space-x-2">
                                    <Shield className="w-4 h-4 text-green-500" />
                                    <div>
                                      <div className="font-medium">Admin</div>
                                      <div className="text-xs text-gray-500">Manage platform operations</div>
                                    </div>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="acceptTerms"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <div className="flex items-start space-x-3">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-accept-terms"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-normal text-gray-700">
                                  I agree to the{" "}
                                  <a href="/terms" className="text-blue-600 hover:underline" target="_blank">
                                    Terms of Service
                                  </a>
                                  {" "}and{" "}
                                  <a href="/privacy" className="text-blue-600 hover:underline" target="_blank">
                                    Privacy Policy
                                  </a>
                                </FormLabel>
                              </div>
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
                        className="w-full"
                        disabled={registerMutation.isPending}
                        data-testid="button-register"
                      >
                        {registerMutation.isPending ? "Creating account..." : "Create Account"}
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
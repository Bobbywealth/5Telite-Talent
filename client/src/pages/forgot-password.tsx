import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const logoImage = "/attached_assets/5t-logo.png";

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await apiRequest("POST", "/api/auth/forgot-password", { email });
      setEmailSent(true);
      toast({
        title: "Email Sent",
        description: "If an account exists with this email, a password reset link has been sent.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm relative overflow-hidden">
        {/* Card decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"></div>
        
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => setLocation("/auth")}
          className="absolute top-4 right-4 z-10 bg-slate-100 hover:bg-slate-200 text-slate-700"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Button>

        <CardHeader className="text-center pb-4 pt-12">
          <div className="w-20 h-20 mx-auto mb-4">
            <img 
              src={logoImage} 
              alt="5T Talent Platform" 
              className="w-full h-full object-contain"
            />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-purple-900 bg-clip-text text-transparent">
            {emailSent ? "Check Your Email" : "Forgot Password?"}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {emailSent 
              ? "We've sent you a password reset link" 
              : "Enter your email to receive a password reset link"}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          {emailSent ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-center text-gray-600 mb-2">
                  We've sent a password reset link to:
                </p>
                <p className="text-center font-semibold text-gray-900 mb-4">
                  {email}
                </p>
                <p className="text-center text-sm text-gray-500">
                  The link will expire in 1 hour. If you don't see the email, check your spam folder.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => setLocation("/auth")}
                  className="w-full h-12 bg-gradient-to-r from-slate-900 to-purple-900 hover:from-slate-800 hover:to-purple-800 text-white font-semibold rounded-xl"
                >
                  Back to Login
                </Button>
                
                <Button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail("");
                  }}
                  variant="outline"
                  className="w-full h-12 rounded-xl"
                >
                  Send Another Link
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-10 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-slate-900 to-purple-900 hover:from-slate-800 hover:to-purple-800 text-white font-semibold rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setLocation("/auth")}
                  className="text-sm text-purple-600 hover:text-purple-800 hover:underline"
                >
                  Remember your password? Sign in
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


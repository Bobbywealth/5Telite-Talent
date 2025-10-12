import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Shield } from "lucide-react";
import AdminNavbar from "@/components/layout/admin-navbar";

export default function AgeVerificationSetup() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const setupAgeVerificationMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/setup-age-verification", {});
    },
    onSuccess: () => {
      toast({
        title: "Success! ✅",
        description: "Age verification fields have been added to the database!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Access Denied</h1>
          <p className="text-slate-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Shield className="w-6 h-6 mr-2 text-blue-600" />
              Setup Age Verification
            </CardTitle>
            <CardDescription>
              Add age verification fields to the users table
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900">What This Does</h3>
                  <p className="text-sm text-blue-700 mt-2">
                    This will add the age verification feature to your registration process. 
                    Users will be asked if they're 18 or older, and if not, they'll need to provide 
                    a parent/guardian phone number.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900">Database Changes</h3>
                  <ul className="text-sm text-green-700 space-y-1 mt-2">
                    <li>• Adds `is_over_18` column (BOOLEAN, default true)</li>
                    <li>• Adds `guardian_phone` column (VARCHAR)</li>
                    <li>• Safe to run multiple times (won't duplicate columns)</li>
                    <li>• Takes just a few seconds to complete</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={() => setupAgeVerificationMutation.mutate()}
                disabled={setupAgeVerificationMutation.isPending}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {setupAgeVerificationMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Setting Up Age Verification...
                  </div>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Setup Age Verification Now
                  </>
                )}
              </Button>
            </div>

            {setupAgeVerificationMutation.isSuccess && (
              <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900">Setup Complete!</span>
                </div>
                <p className="text-sm text-green-700 mt-2">
                  Age verification is now active. New users will see the age verification checkbox 
                  and guardian phone field (if under 18) during registration.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


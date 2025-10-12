import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle } from "lucide-react";
import AdminNavbar from "@/components/layout/admin-navbar";

export default function DatabaseFix() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const setupBookingsCategoryMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/setup-bookings-category", {});
    },
    onSuccess: () => {
      toast({
        title: "Success! ✅",
        description: "The bookings table has been fixed. You can now view and create bookings!",
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
            <CardTitle className="text-2xl">Fix Bookings Database</CardTitle>
            <CardDescription>
              This will add the missing 'category' column to the bookings table
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900">Current Issue</h3>
                  <p className="text-sm text-blue-700">
                    The bookings page shows a 500 error because the database is missing the 'category' column.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900">What This Does</h3>
                  <ul className="text-sm text-green-700 space-y-1 mt-2">
                    <li>• Adds the missing 'category' column to the bookings table</li>
                    <li>• Safe to run multiple times (won't duplicate the column)</li>
                    <li>• Fixes both viewing and creating bookings</li>
                    <li>• Takes just a few seconds to complete</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={() => setupBookingsCategoryMutation.mutate()}
                disabled={setupBookingsCategoryMutation.isPending}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {setupBookingsCategoryMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Fixing Database...
                  </div>
                ) : (
                  "Fix Bookings Table Now"
                )}
              </Button>
            </div>

            {setupBookingsCategoryMutation.isSuccess && (
              <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900">Database Fixed Successfully!</span>
                </div>
                <p className="text-sm text-green-700 mt-2">
                  You can now go to the bookings page and it should work perfectly.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


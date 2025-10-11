import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminSidebar from "@/components/layout/admin-sidebar";
import AdminNavbar from "@/components/layout/admin-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function RemoveBobby() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const removeBobbyMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", "/api/admin/remove-bobby-accounts");
    },
    onSuccess: (data) => {
      toast({
        title: "Bobby accounts removed successfully",
        description: `Removed ${data.removedCount} account(s): ${data.accounts.map((acc: any) => acc.name).join(", ")}`,
      });
      setShowConfirmDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove Bobby accounts",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
      setShowConfirmDialog(false);
    },
  });

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-slate-600">You need admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 lg:ml-64 p-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <Trash2 className="h-6 w-6 mr-2" />
                Remove Bobby Test Accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Warning: Irreversible Action</h3>
                    <p className="text-yellow-700 text-sm mb-2">
                      This will permanently delete all Bobby test accounts and their associated data including:
                    </p>
                    <ul className="text-yellow-700 text-sm list-disc list-inside space-y-1">
                      <li>User account and profile information</li>
                      <li>Talent profiles and photos</li>
                      <li>Bookings and contracts</li>
                      <li>Tasks and notifications</li>
                      <li>Login activity and page views</li>
                      <li>Uploaded documents</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">🔍 What will be removed:</h3>
                <p className="text-blue-700 text-sm">
                  This action will search for and remove any accounts where:
                </p>
                <ul className="text-blue-700 text-sm list-disc list-inside mt-2 space-y-1">
                  <li>Email contains "bobby"</li>
                  <li>First name is "Bobby"</li>
                  <li>First name is "Test" AND last name is "Bobby"</li>
                </ul>
              </div>

              <Button
                onClick={() => setShowConfirmDialog(true)}
                variant="destructive"
                className="w-full"
                disabled={removeBobbyMutation.isPending}
              >
                {removeBobbyMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Removing Accounts...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Bobby Test Accounts
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center text-red-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Confirm Account Removal
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you absolutely sure you want to permanently delete all Bobby test accounts? 
                  This action cannot be undone and will remove all associated data from the database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => removeBobbyMutation.mutate()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Yes, Delete Bobby Accounts
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

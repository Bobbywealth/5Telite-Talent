import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdminNavbar from "@/components/layout/admin-navbar";
import AdminSidebar from "@/components/layout/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CheckCircle, XCircle, Clock, User, Mail, Calendar, Shield, Users, Briefcase, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface PendingUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  status: string;
}

export default function AdminApprovals() {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  // Fetch pending users
  const { data: pendingUsersResponse, isLoading } = useQuery({
    queryKey: ["/api/admin/users/pending"],
    queryFn: getQueryFn(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  const pendingUsers = pendingUsersResponse?.users || [];

  // Mutation for updating user status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update user status");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message || "User status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/pending"] });
      setSelectedUser(null);
      setActionType(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive",
      });
    },
  });

  const handleAction = (user: PendingUser, action: "approve" | "reject") => {
    setSelectedUser(user);
    setActionType(action);
  };

  const confirmAction = () => {
    if (selectedUser && actionType) {
      const status = actionType === "approve" ? "active" : "suspended";
      updateStatusMutation.mutate({ userId: selectedUser.id, status });
    }
  };

  const cancelAction = () => {
    setSelectedUser(null);
    setActionType(null);
  };

  // Count statistics
  const talentCount = pendingUsers.filter((u: PendingUser) => u.role === "talent").length;
  const clientCount = pendingUsers.filter((u: PendingUser) => u.role === "client").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      <AdminSidebar />
      <div className="flex-1">
        <AdminNavbar />
        
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                Pending Approvals
              </h1>
            </div>
            <p className="text-base md:text-lg text-slate-600">
              Review and approve new user registrations
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingUsers.length}</div>
                <p className="text-xs text-muted-foreground">
                  Users awaiting approval
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Talent Approvals</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{talentCount}</div>
                <Badge variant={talentCount > 0 ? "default" : "secondary"} className="mt-1">
                  {talentCount > 0 ? "Action Required" : "All Clear"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Client Approvals</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clientCount}</div>
                <Badge variant={clientCount > 0 ? "default" : "secondary"} className="mt-1">
                  {clientCount > 0 ? "Action Required" : "All Clear"}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Pending Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Pending User Registrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : pendingUsers.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No Pending Approvals
                  </h3>
                  <p className="text-slate-600">
                    All user registrations have been reviewed
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingUsers.map((user: PendingUser) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-slate-400" />
                              {user.firstName} {user.lastName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-slate-400" />
                              {user.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.role === "talent" ? "default" : "secondary"}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              {format(new Date(user.createdAt), "MMM d, yyyy")}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleAction(user, "approve")}
                                disabled={updateStatusMutation.isPending}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleAction(user, "reject")}
                                disabled={updateStatusMutation.isPending}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!selectedUser && !!actionType} onOpenChange={cancelAction}>
        <AlertDialogContent className="max-w-md mx-auto">
          <AlertDialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              {actionType === "approve" ? (
                <CheckCircle className="h-6 w-6 text-blue-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
            </div>
            <AlertDialogTitle className="text-xl font-semibold">
              {actionType === "approve" ? "Approve User" : "Reject User"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-slate-600 mt-4">
              {actionType === "approve" ? (
                <div className="space-y-3">
                  <p>
                    Are you sure you want to approve this user?
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-900">
                        {selectedUser?.firstName} {selectedUser?.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-green-600" />
                      <span className="text-green-700">{selectedUser?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="text-green-700 capitalize">{selectedUser?.role}</span>
                    </div>
                  </div>
                  <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                    ✅ They will be able to log in and access the platform immediately.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p>
                    Are you sure you want to reject this user?
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-red-600" />
                      <span className="font-medium text-red-900">
                        {selectedUser?.firstName} {selectedUser?.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-red-600" />
                      <span className="text-red-700">{selectedUser?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-600" />
                      <span className="text-red-700 capitalize">{selectedUser?.role}</span>
                    </div>
                  </div>
                  <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                    ❌ They will not be able to access the platform.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3 mt-6">
            <AlertDialogCancel 
              onClick={cancelAction}
              className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={`w-full sm:w-auto ${
                actionType === "reject" 
                  ? "bg-red-600 hover:bg-red-700 text-white" 
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {actionType === "approve" ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve User
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject User
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import TalentNavbar from "@/components/layout/talent-navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

export default function TalentTasks() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: tasks, isLoading: tasksLoading, error } = useQuery({
    queryKey: ["/api/tasks/me"],
    enabled: isAuthenticated && user?.role === 'talent',
    retry: false,
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
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
  }, [error, toast]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'pending': return 'outline';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TalentNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Tasks</h1>
          <p className="text-slate-600 mt-2">Track your assignments and project tasks</p>
        </div>

        {/* Tasks List */}
        {tasksLoading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (!tasks || !Array.isArray((tasks as any)?.tasks) || (tasks as any)?.tasks?.length === 0) ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-slate-400 mb-4">
                <i className="fas fa-tasks text-4xl"></i>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No tasks assigned</h3>
              <p className="text-slate-600">
                Your project tasks and assignments will appear here once they're created by admins or clients.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {(tasks as any)?.tasks && Array.isArray((tasks as any)?.tasks) && (tasks as any)?.tasks.map((task: any) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl text-slate-900">
                        {task.title}
                      </CardTitle>
                      {task.bookingId && (
                        <p className="text-slate-600 mt-1">
                          <i className="fas fa-link mr-2"></i>
                          Related to booking #{task.bookingId}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getStatusColor(task.status)} className="capitalize">
                        {task.status?.replace('_', ' ')}
                      </Badge>
                      <Badge variant={getPriorityColor(task.priority)} className="capitalize">
                        {task.priority} Priority
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {task.description && (
                    <div className="mb-4">
                      <p className="font-medium text-slate-700 mb-2">
                        <i className="fas fa-info-circle mr-2"></i>Description
                      </p>
                      <p className="text-slate-600">{task.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-slate-700 mb-1">
                        <i className="fas fa-calendar-plus mr-2"></i>Created
                      </p>
                      <p className="text-slate-600">
                        {formatDate(task.createdAt)}
                      </p>
                    </div>
                    {task.dueDate && (
                      <div>
                        <p className="font-medium text-slate-700 mb-1">
                          <i className="fas fa-calendar-check mr-2"></i>Due Date
                        </p>
                        <p className="text-slate-600">
                          {formatDate(task.dueDate)}
                        </p>
                      </div>
                    )}
                    {task.completedAt && (
                      <div>
                        <p className="font-medium text-slate-700 mb-1">
                          <i className="fas fa-check-circle mr-2"></i>Completed
                        </p>
                        <p className="text-slate-600">
                          {formatDate(task.completedAt)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500">
                      Assigned by {task.assignedBy || 'System'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
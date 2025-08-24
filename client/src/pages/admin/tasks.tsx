import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import AdminSidebar from "@/components/layout/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminTasks() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: "",
    page: 1,
  });
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    scope: "booking" as "booking" | "talent",
    bookingId: "",
    talentId: "",
    assigneeId: "",
    dueAt: "",
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Authentication is handled by the Router component

  // Fetch tasks with filters
  const { data: tasksData, isLoading: tasksLoading, error } = useQuery({
    queryKey: ["/api/tasks", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      params.set("page", filters.page.toString());
      params.set("limit", "20");

      const response = await fetch(`/api/tasks?${params}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch tasks");
      return response.json();
    },
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  // Fetch bookings for task creation
  const { data: bookingsData } = useQuery({
    queryKey: ["/api/bookings"],
    queryFn: async () => {
      const response = await fetch("/api/bookings?limit=100", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch bookings");
      return response.json();
    },
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  // Fetch talents for task assignment
  const { data: talentsData } = useQuery({
    queryKey: ["/api/talents"],
    queryFn: async () => {
      const response = await fetch("/api/talents?limit=100", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch talents");
      return response.json();
    },
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: typeof newTask) => {
      return apiRequest("POST", "/api/tasks", {
        ...taskData,
        dueAt: taskData.dueAt ? new Date(taskData.dueAt).toISOString() : undefined,
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: any }) => {
      return apiRequest("PATCH", `/api/tasks/${taskId}`, updates);
    },
  });

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'done':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'blocked':
        return 'destructive';
      case 'todo':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Group tasks by status for Kanban view
  const tasksByStatus = tasksData?.tasks?.reduce((acc: any, task: any) => {
    if (!acc[task.status]) acc[task.status] = [];
    acc[task.status].push(task);
    return acc;
  }, {}) || {};

  const statusColumns = [
    { key: 'todo', title: 'To Do', color: 'border-slate-300' },
    { key: 'in_progress', title: 'In Progress', color: 'border-blue-300' },
    { key: 'blocked', title: 'Blocked', color: 'border-red-300' },
    { key: 'done', title: 'Done', color: 'border-green-300' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900">Task Management</h1>
            <div className="flex items-center space-x-4">
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-task">
                    <i className="fas fa-plus mr-2"></i>Create Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>
                      Create a new task for booking or talent management
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    createTaskMutation.mutate(newTask);
                  }} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={newTask.title}
                        onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                        required
                        data-testid="input-task-title"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newTask.description}
                        onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                        data-testid="textarea-task-description"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="scope">Scope *</Label>
                        <Select value={newTask.scope} onValueChange={(value: "booking" | "talent") => setNewTask(prev => ({ ...prev, scope: value }))}>
                          <SelectTrigger data-testid="select-task-scope">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="booking">Booking</SelectItem>
                            <SelectItem value="talent">Talent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="dueAt">Due Date</Label>
                        <Input
                          id="dueAt"
                          type="date"
                          value={newTask.dueAt}
                          onChange={(e) => setNewTask(prev => ({ ...prev, dueAt: e.target.value }))}
                          data-testid="input-task-due-date"
                        />
                      </div>
                    </div>

                    {newTask.scope === 'booking' && (
                      <div>
                        <Label htmlFor="bookingId">Related Booking</Label>
                        <Select value={newTask.bookingId} onValueChange={(value) => setNewTask(prev => ({ ...prev, bookingId: value }))}>
                          <SelectTrigger data-testid="select-task-booking">
                            <SelectValue placeholder="Select booking" />
                          </SelectTrigger>
                          <SelectContent>
                            {bookingsData?.bookings?.map((booking: any) => (
                              <SelectItem key={booking.id} value={booking.id}>
                                {booking.title} (#{booking.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {newTask.scope === 'talent' && (
                      <div>
                        <Label htmlFor="talentId">Related Talent</Label>
                        <Select value={newTask.talentId} onValueChange={(value) => setNewTask(prev => ({ ...prev, talentId: value }))}>
                          <SelectTrigger data-testid="select-task-talent">
                            <SelectValue placeholder="Select talent" />
                          </SelectTrigger>
                          <SelectContent>
                            {talentsData?.talents?.map((talent: any) => (
                              <SelectItem key={talent.userId} value={talent.userId}>
                                {talent.user.firstName} {talent.user.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="assigneeId">Assignee</Label>
                      <Select value={newTask.assigneeId} onValueChange={(value) => setNewTask(prev => ({ ...prev, assigneeId: value }))}>
                        <SelectTrigger data-testid="select-task-assignee">
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                        <SelectContent>
                          {talentsData?.talents?.map((talent: any) => (
                            <SelectItem key={talent.userId} value={talent.userId}>
                              {talent.user.firstName} {talent.user.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex space-x-2">
                      <Button type="submit" disabled={createTaskMutation.isPending} data-testid="button-submit-task">
                        {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Select value={filters.status} onValueChange={(value) => updateFilter('status', value === "all" ? "" : value)}>
                    <SelectTrigger data-testid="select-status-filter">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Button 
                    variant="outline" 
                    onClick={() => setFilters({ status: "", page: 1 })}
                    data-testid="button-clear-filters"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kanban Board */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statusColumns.map((column) => (
              <Card key={column.key} className={`border-t-4 ${column.color}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    {column.title}
                    <Badge variant="outline">
                      {tasksByStatus[column.key]?.length || 0}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tasksLoading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-lg">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2 mb-1" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    ))
                  ) : tasksByStatus[column.key]?.length > 0 ? (
                    tasksByStatus[column.key].map((task: any) => (
                      <div 
                        key={task.id} 
                        className="p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        data-testid={`task-card-${task.id}`}
                      >
                        <h4 className="font-medium text-slate-900 mb-2">{task.title}</h4>
                        {task.description && (
                          <p className="text-sm text-slate-600 mb-2 line-clamp-2">{task.description}</p>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <div>
                            {task.booking && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {task.booking.title}
                              </span>
                            )}
                            {task.talent && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                {task.talent.firstName} {task.talent.lastName}
                              </span>
                            )}
                          </div>
                          {task.dueAt && (
                            <span className={`px-2 py-1 rounded ${
                              new Date(task.dueAt) < new Date() ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                            }`}>
                              {formatDate(task.dueAt)}
                            </span>
                          )}
                        </div>

                        {task.assignee && (
                          <p className="text-xs text-slate-500 mt-2">
                            Assigned to: {task.assignee.firstName} {task.assignee.lastName}
                          </p>
                        )}

                        <div className="flex space-x-1 mt-3">
                          {['todo', 'in_progress', 'blocked', 'done'].map((status) => (
                            <Button
                              key={status}
                              variant={task.status === status ? "default" : "outline"}
                              size="sm"
                              className="text-xs px-2 py-1"
                              onClick={() => updateTaskMutation.mutate({ 
                                taskId: task.id, 
                                updates: { status } 
                              })}
                              disabled={updateTaskMutation.isPending}
                              data-testid={`button-task-status-${status}`}
                            >
                              {status.replace('_', ' ')}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <i className="fas fa-tasks text-2xl mb-2"></i>
                      <p className="text-sm">No tasks</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

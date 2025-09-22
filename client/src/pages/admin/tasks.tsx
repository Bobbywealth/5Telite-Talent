import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import AdminSidebar from "@/components/layout/admin-sidebar";
import AdminNavbar from "@/components/layout/admin-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Trash2, Edit, CheckCircle, Clock, AlertCircle, LayoutGrid, List, Filter, Search } from "lucide-react";

export default function AdminTasks() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: "",
    assignee: "",
    scope: "",
    search: "",
    page: 1,
  });
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    scope: "booking" as "booking" | "talent" | "general",
    bookingId: "",
    talentId: "",
    assigneeId: "",
    dueAt: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'title' | 'dueAt' | 'status' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Drag and drop states
  const [draggedTask, setDraggedTask] = useState<any>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Authentication is handled by the Router component

  // Fetch tasks with filters
  const { data: tasksData, isLoading: tasksLoading, error } = useQuery({
    queryKey: [`/api/tasks?status=${filters.status}&assigneeId=${filters.assignee}&page=${filters.page}&limit=100`],
    queryFn: getQueryFn(),
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
    select: (data: any) => {
      // Client-side filtering and sorting for search and other features
      let filteredTasks = data.tasks || [];

      // Apply search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredTasks = filteredTasks.filter((task: any) => 
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.booking?.title?.toLowerCase().includes(searchLower) ||
          `${task.talent?.firstName} ${task.talent?.lastName}`.toLowerCase().includes(searchLower) ||
          `${task.assignee?.firstName} ${task.assignee?.lastName}`.toLowerCase().includes(searchLower)
        );
      }

      // Apply sorting
      filteredTasks.sort((a: any, b: any) => {
        let aValue, bValue;

        switch (sortBy) {
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case 'dueAt':
            aValue = a.dueAt ? new Date(a.dueAt).getTime() : 0;
            bValue = b.dueAt ? new Date(b.dueAt).getTime() : 0;
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          default:
            aValue = a.createdAt;
            bValue = b.createdAt;
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      return {
        ...data,
        tasks: filteredTasks,
        total: filteredTasks.length
      };
    },
  });

  // Fetch bookings for task creation
  const { data: bookingsData } = useQuery({
    queryKey: ["/api/bookings?limit=100"],
    queryFn: getQueryFn(),
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  // Fetch talents for task assignment
  const { data: talentsData } = useQuery({
    queryKey: ["/api/talents?limit=100"],
    queryFn: getQueryFn(),
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: typeof newTask) => {
      // Clean and validate the data before sending
      const cleanedData = {
        title: taskData.title.trim(),
        description: taskData.description?.trim() || null,
        scope: taskData.scope,
        bookingId: taskData.bookingId || null,
        talentId: taskData.talentId || null,
        assigneeId: taskData.assigneeId || null,
        dueAt: taskData.dueAt ? new Date(taskData.dueAt).toISOString() : null,
        priority: taskData.priority || "medium",
      };
      
      console.log("Sending task data:", cleanedData);
      return apiRequest("POST", "/api/tasks", cleanedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task created successfully" });
      setShowCreateDialog(false);
      setNewTask({
        title: "",
        description: "",
        scope: "booking" as "booking" | "talent" | "general",
        bookingId: "",
        talentId: "",
        assigneeId: "",
        dueAt: "",
        priority: "medium" as "low" | "medium" | "high" | "urgent",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Failed to create task", variant: "destructive" });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: any }) => {
      return apiRequest("PATCH", `/api/tasks/${taskId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task updated successfully" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Failed to update task", variant: "destructive" });
    },
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ taskIds, updates }: { taskIds: string[]; updates: any }) => {
      const promises = taskIds.map(taskId => 
        apiRequest("PATCH", `/api/tasks/${taskId}`, updates)
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: `Updated ${selectedTasks.length} tasks successfully` });
      setSelectedTasks([]);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized", 
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Failed to update tasks", variant: "destructive" });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return apiRequest("DELETE", `/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ 
        title: "Task deleted successfully",
        description: "The task has been permanently removed."
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({
        title: "Error",
        description: `Failed to delete task: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, task: any) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    e.dataTransfer.setData('text/plain', task.id);
  };

  const handleDragOver = (e: React.DragEvent, columnStatus: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnStatus);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only clear drag over if we're actually leaving the column
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (draggedTask && draggedTask.status !== targetStatus) {
      updateTaskMutation.mutate({
        taskId: draggedTask.id,
        updates: { status: targetStatus }
      });
    }
    setDraggedTask(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const clearFilters = () => {
    setFilters({ status: "", assignee: "", scope: "", search: "", page: 1 });
    setSelectedTasks([]);
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const selectAllTasks = () => {
    const allTaskIds = tasksData?.tasks?.map((task: any) => task.id) || [];
    setSelectedTasks(selectedTasks.length === allTaskIds.length ? [] : allTaskIds);
  };

  const openTaskDetails = (task: any) => {
    setSelectedTask(task);
    setShowTaskDialog(true);
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
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      window.location.href = '/api/login';
      return null;
    }

    // Show unauthorized message if wrong role
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

      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img 
                src="/attached_assets/5t-logo.png" 
                alt="5T Talent Platform" 
                className="h-12 w-auto"
              />
              <h1 className="text-2xl font-bold text-slate-900">Task Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => {
                  console.log("Create Task button clicked");
                  setShowCreateDialog(true);
                }}
                data-testid="button-create-task"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </div>
          </header>

          {/* Create Task Dialog */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Create a task and assign it to any talent. Choose scope: General (standalone task), Booking Related (tied to specific booking), or Talent Specific (about a particular talent).
            </DialogDescription>
          </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!newTask.title.trim()) {
                      toast({
                        title: "Validation Error",
                        description: "Title is required",
                        variant: "destructive",
                      });
                      return;
                    }
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
                        <Select value={newTask.scope} onValueChange={(value: "booking" | "talent" | "general") => setNewTask(prev => ({ ...prev, scope: value }))}>
                          <SelectTrigger data-testid="select-task-scope">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Task</SelectItem>
                            <SelectItem value="booking">Booking Related</SelectItem>
                            <SelectItem value="talent">Talent Specific</SelectItem>
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

                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={newTask.priority} onValueChange={(value: "low" | "medium" | "high" | "urgent") => setNewTask(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger data-testid="select-task-priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Assignee - Who will complete this task */}
                    <div>
                      <Label htmlFor="assigneeId">Assign To *</Label>
                      <p className="text-xs text-slate-500 mb-2">Who should complete this task?</p>
                      <Select value={newTask.assigneeId} onValueChange={(value) => setNewTask(prev => ({ ...prev, assigneeId: value }))}>
                        <SelectTrigger data-testid="select-task-assignee">
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Unassigned</SelectItem>
                          {talentsData?.talents?.map((talent: any) => (
                            <SelectItem key={talent.userId} value={talent.userId}>
                              {talent.user.firstName} {talent.user.lastName}
                              {talent.stageName && ` (${talent.stageName})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Conditional fields based on scope */}
                    {newTask.scope === 'booking' && (
                      <div>
                        <Label htmlFor="bookingId">Related Booking</Label>
                        <p className="text-xs text-slate-500 mb-2">Link this task to a specific booking</p>
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
                        <p className="text-xs text-slate-500 mb-2">Link this task to a specific talent (different from assignee)</p>
                        <Select value={newTask.talentId} onValueChange={(value) => setNewTask(prev => ({ ...prev, talentId: value }))}>
                          <SelectTrigger data-testid="select-task-talent">
                            <SelectValue placeholder="Select talent" />
                          </SelectTrigger>
                          <SelectContent>
                            {talentsData?.talents?.map((talent: any) => (
                              <SelectItem key={talent.userId} value={talent.userId}>
                                {talent.user.firstName} {talent.user.lastName}
                                {talent.stageName && ` (${talent.stageName})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button type="submit" disabled={createTaskMutation.isPending} data-testid="button-submit-task">
                        {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => {
                        setShowCreateDialog(false);
                        setNewTask({
                          title: "",
                          description: "",
                          scope: "booking",
                          bookingId: "",
                          talentId: "",
                          assigneeId: "",
                          dueAt: "",
                          priority: "medium",
                        });
                      }}>
                        Cancel
                      </Button>
                    </div>
                  </form>
            </DialogContent>
          </Dialog>

        <main className="p-6">
          {/* Enhanced Filters and Controls */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Task Management</CardTitle>
                <div className="flex items-center space-x-4">
                  {/* View Toggle */}
                  <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'kanban' | 'list')}>
                    <TabsList>
                      <TabsTrigger value="kanban" data-testid="tab-kanban-view">
                        <LayoutGrid className="h-4 w-4 mr-2" />
                        Kanban
                      </TabsTrigger>
                      <TabsTrigger value="list" data-testid="tab-list-view">
                        <List className="h-4 w-4 mr-2" />
                        List
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="filters-section grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                {/* Search */}
                <div className="col-span-2">
                  <Input
                    placeholder="Search tasks..."
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    data-testid="input-search-tasks"
                    className="w-full"
                  />
                </div>

                {/* Status Filter */}
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

                {/* Assignee Filter */}
                <div>
                  <Select value={filters.assignee} onValueChange={(value) => updateFilter('assignee', value === "all" ? "" : value)}>
                    <SelectTrigger data-testid="select-assignee-filter">
                      <SelectValue placeholder="All Assignees" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Assignees</SelectItem>
                      {talentsData?.talents?.map((talent: any) => (
                        <SelectItem key={talent.userId} value={talent.userId}>
                          {talent.user.firstName} {talent.user.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Scope Filter */}
                <div>
                  <Select value={filters.scope} onValueChange={(value) => updateFilter('scope', value === "all" ? "" : value)}>
                    <SelectTrigger data-testid="select-scope-filter">
                      <SelectValue placeholder="All Scopes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Scopes</SelectItem>
                      <SelectItem value="general">General Tasks</SelectItem>
                      <SelectItem value="booking">Booking Related</SelectItem>
                      <SelectItem value="talent">Talent Specific</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters */}
                <div>
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    data-testid="button-clear-filters"
                    className="w-full"
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              {/* Bulk Actions (for list view) */}
              {viewMode === 'list' && selectedTasks.length > 0 && (
                <div className="flex items-center space-x-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" data-testid="button-bulk-actions">
                        Bulk Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem 
                        onClick={() => bulkUpdateMutation.mutate({ taskIds: selectedTasks, updates: { status: 'todo' } })}
                      >
                        Mark as To Do
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => bulkUpdateMutation.mutate({ taskIds: selectedTasks, updates: { status: 'in_progress' } })}
                      >
                        Mark as In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => bulkUpdateMutation.mutate({ taskIds: selectedTasks, updates: { status: 'blocked' } })}
                      >
                        Mark as Blocked
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => bulkUpdateMutation.mutate({ taskIds: selectedTasks, updates: { status: 'done' } })}
                      >
                        Mark as Done
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Views Container */}
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'kanban' | 'list')}>

            {/* Kanban View */}
            <TabsContent value="kanban" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statusColumns.map((column) => (
                  <Card 
                    key={column.key} 
                    className={`border-t-4 ${column.color} ${
                      dragOverColumn === column.key ? 'ring-2 ring-blue-400 ring-opacity-75' : ''
                    }`}
                    onDragOver={(e) => handleDragOver(e, column.key)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, column.key)}
                  >
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
                            className={`p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-move ${
                              draggedTask?.id === task.id ? 'opacity-50 transform rotate-2' : ''
                            }`}
                            data-testid={`task-card-${task.id}`}
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, task)}
                            onDragEnd={handleDragEnd}
                            onClick={() => openTaskDetails(task)}
                          >
                            <h4 className="font-medium text-slate-900 mb-2">{task.title}</h4>
                            {task.description && (
                              <p className="text-sm text-slate-600 mb-2 line-clamp-2">{task.description}</p>
                            )}

                            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                              <div className="flex space-x-1">
                                {task.booking && (
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                    {task.booking.title}
                                  </span>
                                )}
                                {task.talent && (
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                    {task.talent.firstName} {task.talent.lastName}
                                  </span>
                                )}
                              </div>
                              {task.dueAt && (
                                <span className={`px-2 py-1 rounded text-xs ${
                                  new Date(task.dueAt) < new Date() ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                                }`}>
                                  {formatDate(task.dueAt)}
                                </span>
                              )}
                            </div>

                            {task.assignee && (
                              <p className="text-xs text-slate-500 mb-2">
                                Assigned: {task.assignee.firstName} {task.assignee.lastName}
                              </p>
                            )}

                            <div className="flex space-x-1">
                              {['todo', 'in_progress', 'blocked', 'done'].map((status) => (
                                <Button
                                  key={status}
                                  variant={task.status === status ? "default" : "outline"}
                                  size="sm"
                                  className="text-xs px-2 py-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateTaskMutation.mutate({ 
                                      taskId: task.id, 
                                      updates: { status } 
                                    });
                                  }}
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
                          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                          <p className="text-sm">No tasks</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* List/Table View */}
            <TabsContent value="list" className="mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle>Tasks List</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                        <SelectTrigger className="w-48" data-testid="select-sort-by">
                          <SelectValue placeholder="Sort by..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="title">Title</SelectItem>
                          <SelectItem value="status">Status</SelectItem>
                          <SelectItem value="dueAt">Due Date</SelectItem>
                          <SelectItem value="createdAt">Created Date</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        data-testid="button-sort-order"
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        {sortOrder.toUpperCase()}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {tasksLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 flex-1" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedTasks.length === tasksData?.tasks?.length && tasksData?.tasks?.length > 0}
                              onCheckedChange={selectAllTasks}
                              data-testid="checkbox-select-all"
                            />
                          </TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Scope</TableHead>
                          <TableHead>Assignee</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Related</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tasksData?.tasks?.map((task: any) => (
                          <TableRow 
                            key={task.id} 
                            className="hover:bg-slate-50 cursor-pointer"
                            onClick={() => openTaskDetails(task)}
                            data-testid={`task-row-${task.id}`}
                          >
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={selectedTasks.includes(task.id)}
                                onCheckedChange={() => toggleTaskSelection(task.id)}
                                data-testid={`checkbox-task-${task.id}`}
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              <div>
                                <div className="font-medium">{task.title}</div>
                                {task.description && (
                                  <div className="text-sm text-slate-500 line-clamp-1">{task.description}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(task.status)}>
                                {task.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {task.scope}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {task.assignee ? (
                                <div className="text-sm">
                                  {task.assignee.firstName} {task.assignee.lastName}
                                </div>
                              ) : (
                                <span className="text-slate-400">Unassigned</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {task.dueAt ? (
                                <span className={`text-sm ${
                                  new Date(task.dueAt) < new Date() ? 'text-red-600 font-medium' : 'text-slate-600'
                                }`}>
                                  {formatDate(task.dueAt)}
                                </span>
                              ) : (
                                <span className="text-slate-400">No due date</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {task.booking && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                  {task.booking.title}
                                </span>
                              )}
                              {task.talent && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                  {task.talent.firstName} {task.talent.lastName}
                                </span>
                              )}
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm" data-testid={`button-task-actions-${task.id}`}>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => openTaskDetails(task)}>
                                    <Search className="h-4 w-4 mr-2" />View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => updateTaskMutation.mutate({ 
                                      taskId: task.id, 
                                      updates: { status: 'todo' } 
                                    })}
                                  >
                                    <Clock className="h-4 w-4 mr-2" />To Do
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => updateTaskMutation.mutate({ 
                                      taskId: task.id, 
                                      updates: { status: 'in_progress' } 
                                    })}
                                  >
                                    <AlertCircle className="h-4 w-4 mr-2" />In Progress
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => updateTaskMutation.mutate({ 
                                      taskId: task.id, 
                                      updates: { status: 'done' } 
                                    })}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />Done
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
                                        deleteTaskMutation.mutate(task.id);
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />Delete Task
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}

                  {!tasksLoading && (!tasksData?.tasks || tasksData.tasks.length === 0) && (
                    <div className="text-center py-12">
                      <CheckCircle className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">No tasks found</h3>
                      <p className="text-slate-500">Create your first task to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        {/* Task Details Modal */}
        <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Task Details</DialogTitle>
              <DialogDescription>
                View and manage task information
              </DialogDescription>
            </DialogHeader>

            {selectedTask && (
              <div className="space-y-6">
                {/* Task Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{selectedTask.title}</h3>
                    <div className="flex items-center space-x-3">
                      <Badge variant={getStatusBadgeVariant(selectedTask.status)}>
                        {selectedTask.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline">
                        {selectedTask.scope}
                      </Badge>
                      {selectedTask.dueAt && (
                        <span className={`text-sm px-2 py-1 rounded ${
                          new Date(selectedTask.dueAt) < new Date() 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          Due: {formatDate(selectedTask.dueAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Quick Actions */}
                  <div className="flex space-x-2">
                    {['todo', 'in_progress', 'blocked', 'done'].map((status) => (
                      <Button
                        key={status}
                        variant={selectedTask.status === status ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          updateTaskMutation.mutate({ 
                            taskId: selectedTask.id, 
                            updates: { status } 
                          });
                          setSelectedTask({ ...selectedTask, status });
                        }}
                        disabled={updateTaskMutation.isPending}
                        data-testid={`modal-button-status-${status}`}
                      >
                        {status.replace('_', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                {selectedTask.description && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Description</h4>
                    <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">{selectedTask.description}</p>
                  </div>
                )}

                {/* Task Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Assignment & Relations */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-900">Assignment & Relations</h4>

                    <div className="space-y-3">
                      {/* Assignee */}
                      <div>
                        <Label className="text-sm font-medium text-slate-700">Assignee</Label>
                        <div className="mt-1">
                          {selectedTask.assignee ? (
                            <div className="flex items-center space-x-2 p-2 bg-slate-50 rounded">
                              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {selectedTask.assignee.firstName?.[0]}{selectedTask.assignee.lastName?.[0]}
                              </div>
                              <div>
                                <div className="font-medium text-sm">{selectedTask.assignee.firstName} {selectedTask.assignee.lastName}</div>
                                <div className="text-xs text-slate-500">{selectedTask.assignee.email}</div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm">Unassigned</span>
                          )}
                        </div>
                      </div>

                      {/* Related Booking */}
                      {selectedTask.booking && (
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Related Booking</Label>
                          <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded">
                            <div className="font-medium text-blue-900">{selectedTask.booking.title}</div>
                            <div className="text-sm text-blue-700">#{selectedTask.booking.code}</div>
                            {selectedTask.booking.startDate && (
                              <div className="text-xs text-blue-600 mt-1">
                                {formatDate(selectedTask.booking.startDate)} - {formatDate(selectedTask.booking.endDate)}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Related Talent */}
                      {selectedTask.talent && (
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Related Talent</Label>
                          <div className="mt-1 p-2 bg-green-50 border border-green-200 rounded">
                            <div className="font-medium text-green-900">
                              {selectedTask.talent.firstName} {selectedTask.talent.lastName}
                            </div>
                            <div className="text-sm text-green-700">{selectedTask.talent.email}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dates & Timeline */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-900">Timeline</h4>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-slate-700">Created</Label>
                        <div className="text-sm text-slate-600 mt-1">
                          {new Date(selectedTask.createdAt).toLocaleDateString()} at {new Date(selectedTask.createdAt).toLocaleTimeString()}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-slate-700">Last Updated</Label>
                        <div className="text-sm text-slate-600 mt-1">
                          {new Date(selectedTask.updatedAt).toLocaleDateString()} at {new Date(selectedTask.updatedAt).toLocaleTimeString()}
                        </div>
                      </div>

                      {selectedTask.dueAt && (
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Due Date</Label>
                          <div className={`text-sm mt-1 ${
                            new Date(selectedTask.dueAt) < new Date() 
                              ? 'text-red-600 font-medium' 
                              : 'text-slate-600'
                          }`}>
                            {new Date(selectedTask.dueAt).toLocaleDateString()}
                            {new Date(selectedTask.dueAt) < new Date() && (
                              <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Overdue</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                {selectedTask.attachmentUrls && selectedTask.attachmentUrls.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Attachments</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedTask.attachmentUrls.map((url: string, index: number) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 p-2 border rounded hover:bg-slate-50"
                        >
                          <Plus className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-blue-600 hover:text-blue-800">
                            Attachment {index + 1}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-slate-500">
                    Task ID: {selectedTask.id}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowTaskDialog(false)}
                      data-testid="button-close-task-modal"
                    >
                      Close
                    </Button>
                    <Button 
                      onClick={() => {
                        // Here you could add edit functionality
                        toast({ title: "Edit functionality coming soon!" });
                      }}
                      data-testid="button-edit-task"
                    >
                      <Edit className="h-4 w-4 mr-2" />Edit Task
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
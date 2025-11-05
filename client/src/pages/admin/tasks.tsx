import { useState } from "react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  MoreHorizontal, 
  Trash2, 
  Edit, 
  Search,
  Calendar,
  User,
  FileText,
  X,
  Grid3X3,
  List,
  Clock,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'blocked' | 'done';
  scope: 'booking' | 'talent' | 'general';
  priority: 'low' | 'medium' | 'high';
  dueAt?: string;
  assigneeId?: string;
  bookingId?: string;
  talentId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  booking?: {
    id: string;
    title: string;
    code: string;
  };
  talent?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// Task Card Component for Kanban View
const TaskCard = ({ task, onEdit, onDelete }: { 
  task: Task; 
  onEdit: (task: Task) => void; 
  onDelete: (taskId: string) => void; 
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScopeColor = (scope: string) => {
    switch (scope) {
      case 'booking': return 'bg-blue-100 text-blue-800';
      case 'talent': return 'bg-purple-100 text-purple-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{task.title}</h4>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(task.id)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </Badge>
          <Badge variant="outline" className={`text-xs ${getScopeColor(task.scope)}`}>
            {task.scope}
          </Badge>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center">
          <User className="h-3 w-3 mr-1" />
          {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'}
        </div>
        {task.dueAt && (
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date(task.dueAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default function AdminTasks() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [scopeFilter, setScopeFilter] = useState("");
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  
  // Form state
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    status: "todo" as Task['status'],
    scope: "general" as Task['scope'],
    priority: "medium" as Task['priority'],
    dueAt: "",
    assigneeId: "unassigned",
    bookingId: "",
    talentId: "",
  });

  // Fetch tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks'],
    queryFn: getQueryFn(),
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  // Fetch talents for assignee dropdown
  const { data: talentsData } = useQuery({
    queryKey: ['/api/talents'],
    queryFn: getQueryFn(),
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  // Fetch bookings for booking-related tasks
  const { data: bookingsData } = useQuery({
    queryKey: ['/api/bookings'],
    queryFn: getQueryFn(),
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: typeof taskForm) => {
      const cleanedData = {
        title: taskData.title.trim(),
        description: taskData.description?.trim() || null,
        status: taskData.status,
        scope: taskData.scope,
        priority: taskData.priority,
        dueAt: taskData.dueAt ? new Date(taskData.dueAt).toISOString() : null,
        assigneeId: taskData.assigneeId === "unassigned" ? null : taskData.assigneeId || null,
        bookingId: taskData.scope === 'booking' ? taskData.bookingId || null : null,
        talentId: taskData.scope === 'talent' ? taskData.talentId || null : null,
      };
      
      return apiRequest("POST", "/api/tasks", cleanedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({ title: "Task created successfully" });
      setShowCreateDialog(false);
      resetForm();
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
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      return apiRequest("PATCH", `/api/tasks/${taskId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({ title: "Task updated successfully" });
      setShowEditDialog(false);
      setSelectedTask(null);
      resetForm();
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

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return apiRequest("DELETE", `/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({ title: "Task deleted successfully" });
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
      toast({ title: "Failed to delete task", variant: "destructive" });
    },
  });

  // Reset form
  const resetForm = () => {
    setTaskForm({
      title: "",
      description: "",
      status: "todo",
      scope: "general",
      priority: "medium",
      dueAt: "",
      assigneeId: "unassigned",
      bookingId: "",
      talentId: "",
    });
  };

  // Handle create task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }
    createTaskMutation.mutate(taskForm);
  };

  // Handle edit task
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      scope: task.scope,
      priority: task.priority || "medium",
      dueAt: task.dueAt ? new Date(task.dueAt).toISOString().split('T')[0] : "",
      assigneeId: task.assigneeId || "unassigned",
      bookingId: task.bookingId || "",
      talentId: task.talentId || "",
    });
    setShowEditDialog(true);
  };

  // Handle update task
  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !selectedTask) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }
    updateTaskMutation.mutate({ taskId: selectedTask.id, updates: taskForm });
  };

  // Handle delete task
  const handleDeleteTask = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  // Handle status change
  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    updateTaskMutation.mutate({ taskId, updates: { status: newStatus } });
  };

  // Filter tasks
  const filteredTasks = (tasksData?.tasks || []).filter((task: Task) => {
    const matchesSearch = !searchTerm || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || statusFilter === "all" || task.status === statusFilter;
    const matchesScope = !scopeFilter || scopeFilter === "all" || task.scope === scopeFilter;
    
    return matchesSearch && matchesStatus && matchesScope;
  });

  // Get priority badge color
  const getPriorityBadgeColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AdminNavbar />
        <div className="flex">
          <AdminSidebar />
          <div className="flex-1 p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar />

        <div className="flex-1 p-6">
        {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
              <p className="text-gray-600">Manage and track all platform tasks</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="h-8 px-3"
                >
                  <List className="h-4 w-4 mr-2" />
                  Table
                  </Button>
                <Button
                  variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('kanban')}
                  className="h-8 px-3"
                >
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Kanban
                </Button>
                    </div>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Task
                      </Button>
                    </div>
            </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                  />
                </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
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
                <Select value={scopeFilter} onValueChange={setScopeFilter}>
                  <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Scopes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Scopes</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                      <SelectItem value="booking">Booking</SelectItem>
                      <SelectItem value="talent">Talent</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setScopeFilter("all");
                  }}
                >
                  Clear Filters
                                </Button>
                            </div>
                    </CardContent>
                  </Card>

          {/* Tasks View */}
          {viewMode === 'table' ? (
              <Card>
              <CardHeader>
                <CardTitle>Tasks ({filteredTasks.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {tasksLoading ? (
                    <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || statusFilter || scopeFilter 
                      ? "No tasks match your current filters." 
                      : "Get started by creating your first task."}
                  </p>
                  {!searchTerm && !statusFilter && !scopeFilter && (
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Task
                    </Button>
                  )}
                </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                          <TableHead>Scope</TableHead>
                          <TableHead>Assignee</TableHead>
                          <TableHead>Due Date</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                    {filteredTasks.map((task: Task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                              <div>
                                <div className="font-medium">{task.title}</div>
                                {task.description && (
                              <div className="text-sm text-gray-600 truncate max-w-xs">
                                {task.description}
                              </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                          <Select
                            value={task.status}
                            onValueChange={(value) => handleStatusChange(task.id, value as Task['status'])}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-[9999]">
                              <SelectItem value="todo">To Do</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="blocked">Blocked</SelectItem>
                              <SelectItem value="done">Done</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityBadgeColor(task.priority || 'medium')}>
                            {task.priority || 'medium'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {task.scope}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {task.assignee ? (
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1 text-gray-400" />
                                  {task.assignee.firstName} {task.assignee.lastName}
                                </div>
                              ) : (
                            <span className="text-gray-400">Unassigned</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {task.dueAt ? (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                              {new Date(task.dueAt).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-gray-400">No due date</span>
                              )}
                            </TableCell>
                            <TableCell>
                          {new Date(task.createdAt).toLocaleDateString()}
                            </TableCell>
                        <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                onClick={() => handleDeleteTask(task.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Tasks ({filteredTasks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-32 w-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* To Do Column */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <h3 className="font-semibold text-gray-700">To Do</h3>
                        <Badge variant="secondary" className="ml-auto">
                          {filteredTasks.filter(task => task.status === 'todo').length}
                        </Badge>
                      </div>
                      <div className="space-y-3 min-h-[400px]">
                        {filteredTasks
                          .filter(task => task.status === 'todo')
                          .map((task) => (
                            <TaskCard key={task.id} task={task} onEdit={handleEditTask} onDelete={handleDeleteTask} />
                          ))}
                      </div>
                    </div>

                    {/* In Progress Column */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-blue-500" />
                        <h3 className="font-semibold text-gray-700">In Progress</h3>
                        <Badge variant="secondary" className="ml-auto">
                          {filteredTasks.filter(task => task.status === 'in_progress').length}
                        </Badge>
                      </div>
                      <div className="space-y-3 min-h-[400px]">
                        {filteredTasks
                          .filter(task => task.status === 'in_progress')
                          .map((task) => (
                            <TaskCard key={task.id} task={task} onEdit={handleEditTask} onDelete={handleDeleteTask} />
                          ))}
                      </div>
                    </div>

                    {/* Blocked Column */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <h3 className="font-semibold text-gray-700">Blocked</h3>
                        <Badge variant="secondary" className="ml-auto">
                          {filteredTasks.filter(task => task.status === 'blocked').length}
                      </Badge>
                      </div>
                      <div className="space-y-3 min-h-[400px]">
                        {filteredTasks
                          .filter(task => task.status === 'blocked')
                          .map((task) => (
                            <TaskCard key={task.id} task={task} onEdit={handleEditTask} onDelete={handleDeleteTask} />
                          ))}
                      </div>
                    </div>

                    {/* Done Column */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <h3 className="font-semibold text-gray-700">Done</h3>
                        <Badge variant="secondary" className="ml-auto">
                          {filteredTasks.filter(task => task.status === 'done').length}
                      </Badge>
                      </div>
                      <div className="space-y-3 min-h-[400px]">
                        {filteredTasks
                          .filter(task => task.status === 'done')
                          .map((task) => (
                            <TaskCard key={task.id} task={task} onEdit={handleEditTask} onDelete={handleDeleteTask} />
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
                      )}
                    </div>
                  </div>

      {/* Create Task Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div 
            className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] border-2 border-gray-200 flex flex-col relative z-[10000]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Create New Task</h2>
                      <Button
                  variant="outline"
                        size="sm"
                        onClick={() => {
                    setShowCreateDialog(false);
                    resetForm();
                  }}
                >
                  <X className="h-4 w-4" />
                      </Button>
                  </div>
              
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="Enter task title"
                  />
                </div>

                  <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter task description"
                    rows={3}
                  />
                  </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={taskForm.status} onValueChange={(value) => setTaskForm(prev => ({ ...prev, status: value as Task['status'] }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[10001]">
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                      <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={taskForm.priority} onValueChange={(value) => setTaskForm(prev => ({ ...prev, priority: value as Task['priority'] }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[10001]">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                              </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                              <div>
                    <Label htmlFor="scope">Scope</Label>
                    <Select value={taskForm.scope} onValueChange={(value) => setTaskForm(prev => ({ ...prev, scope: value as Task['scope'] }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[10001]">
                        <SelectItem value="general">General</SelectItem>
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
                      value={taskForm.dueAt}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, dueAt: e.target.value }))}
                    />
                            </div>
                        </div>

                <div>
                  <Label htmlFor="assigneeId">Assign To</Label>
                  <Select value={taskForm.assigneeId} onValueChange={(value) => setTaskForm(prev => ({ ...prev, assigneeId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent className="z-[10001]">
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {talentsData?.talents?.map((talent: any) => (
                        <SelectItem key={talent.userId} value={talent.userId}>
                          {talent.user.firstName} {talent.user.lastName}
                          {talent.stageName && ` (${talent.stageName})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                      </div>

                {taskForm.scope === 'booking' && (
                        <div>
                    <Label htmlFor="bookingId">Related Booking</Label>
                    <Select value={taskForm.bookingId} onValueChange={(value) => setTaskForm(prev => ({ ...prev, bookingId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select booking" />
                      </SelectTrigger>
                      <SelectContent className="z-[10001]">
                        {bookingsData?.bookings?.map((booking: any) => (
                          <SelectItem key={booking.id} value={booking.id}>
                            {booking.title} (#{booking.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                              </div>
                            )}

                {taskForm.scope === 'talent' && (
                  <div>
                    <Label htmlFor="talentId">Related Talent</Label>
                    <Select value={taskForm.talentId} onValueChange={(value) => setTaskForm(prev => ({ ...prev, talentId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select talent" />
                      </SelectTrigger>
                      <SelectContent className="z-[10001]">
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

                <div className="flex space-x-2 pt-4">
                  <Button type="submit" disabled={createTaskMutation.isPending}>
                    {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowCreateDialog(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                            </div>
              </form>
            </div>
                          </div>
                        </div>
                      )}

      {/* Edit Task Dialog */}
      {showEditDialog && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div 
            className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] border-2 border-gray-200 flex flex-col relative z-[10000]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Edit Task</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowEditDialog(false);
                    setSelectedTask(null);
                    resetForm();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
                    </div>
              
              <form onSubmit={handleUpdateTask} className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Title *</Label>
                  <Input
                    id="edit-title"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="Enter task title"
                  />
                  </div>

                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                      <div>
                    <Label htmlFor="edit-status">Status</Label>
                    <Select value={taskForm.status} onValueChange={(value) => setTaskForm(prev => ({ ...prev, status: value as Task['status'] }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[10001]">
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                      </div>

                      <div>
                    <Label htmlFor="edit-priority">Priority</Label>
                    <Select value={taskForm.priority} onValueChange={(value) => setTaskForm(prev => ({ ...prev, priority: value as Task['priority'] }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[10001]">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                        </div>
                      </div>

                <div className="grid grid-cols-2 gap-4">
                        <div>
                    <Label htmlFor="edit-scope">Scope</Label>
                    <Select value={taskForm.scope} onValueChange={(value) => setTaskForm(prev => ({ ...prev, scope: value as Task['scope'] }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[10001]">
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="booking">Booking Related</SelectItem>
                        <SelectItem value="talent">Talent Specific</SelectItem>
                      </SelectContent>
                    </Select>
                          </div>

                  <div>
                    <Label htmlFor="edit-dueAt">Due Date</Label>
                    <Input
                      id="edit-dueAt"
                      type="date"
                      value={taskForm.dueAt}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, dueAt: e.target.value }))}
                    />
                        </div>
                    </div>

                <div>
                  <Label htmlFor="edit-assigneeId">Assign To</Label>
                  <Select value={taskForm.assigneeId} onValueChange={(value) => setTaskForm(prev => ({ ...prev, assigneeId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent className="z-[10001]">
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {talentsData?.talents?.map((talent: any) => (
                        <SelectItem key={talent.userId} value={talent.userId}>
                          {talent.user.firstName} {talent.user.lastName}
                          {talent.stageName && ` (${talent.stageName})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {taskForm.scope === 'booking' && (
                  <div>
                    <Label htmlFor="edit-bookingId">Related Booking</Label>
                    <Select value={taskForm.bookingId} onValueChange={(value) => setTaskForm(prev => ({ ...prev, bookingId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select booking" />
                      </SelectTrigger>
                      <SelectContent className="z-[10001]">
                        {bookingsData?.bookings?.map((booking: any) => (
                          <SelectItem key={booking.id} value={booking.id}>
                            {booking.title} (#{booking.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {taskForm.scope === 'talent' && (
                  <div>
                    <Label htmlFor="edit-talentId">Related Talent</Label>
                    <Select value={taskForm.talentId} onValueChange={(value) => setTaskForm(prev => ({ ...prev, talentId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select talent" />
                      </SelectTrigger>
                      <SelectContent className="z-[10001]">
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

                <div className="flex space-x-2 pt-4">
                  <Button type="submit" disabled={updateTaskMutation.isPending}>
                    {updateTaskMutation.isPending ? "Updating..." : "Update Task"}
                    </Button>
                    <Button 
                    type="button" 
                    variant="outline" 
                      onClick={() => {
                      setShowEditDialog(false);
                      setSelectedTask(null);
                      resetForm();
                      }}
                    >
                    Cancel
                    </Button>
                </div>
              </form>
                  </div>
                </div>
              </div>
            )}
    </div>
  );
}

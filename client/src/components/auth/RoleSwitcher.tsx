import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function RoleSwitcher() {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const switchRoleMutation = useMutation({
    mutationFn: async (role: string) => {
      return await apiRequest("POST", "/api/auth/switch-role", { role });
    },
    onSuccess: () => {
      // Invalidate user query to refresh the user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Role switched!",
        description: `Successfully switched to ${selectedRole} role`,
      });
      setSelectedRole("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to switch role",
        variant: "destructive",
      });
      console.error("Role switch error:", error);
    },
  });

  if (!user) return null;

  return (
    <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 shadow-xl border border-slate-200/50 backdrop-blur-sm">
      {/* Decorative elements */}
      <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
      <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-lg"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-2 shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Testing Mode</h3>
              <p className="text-xs text-slate-600">Role switching for development</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700 text-xs">
            DEV
          </Badge>
        </div>

        {/* Current Role Display */}
        <div className="bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-slate-700">Current Role:</span>
              <Badge 
                variant={user.role === 'admin' ? 'default' : user.role === 'talent' ? 'secondary' : 'outline'}
                className={`capitalize font-semibold ${
                  user.role === 'admin' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0' 
                    : user.role === 'talent' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0' 
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0'
                }`}
                data-testid="current-role-badge"
              >
                {user.role}
              </Badge>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {/* Role Switching */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700 flex items-center">
            <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            Switch to:
          </label>
          <div className="flex gap-3">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger 
                className="bg-white/70 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                data-testid="role-select"
              >
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-md border-slate-200">
                <SelectItem value="admin" className="hover:bg-blue-50">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Admin</span>
                  </div>
                </SelectItem>
                <SelectItem value="talent" className="hover:bg-purple-50">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Talent</span>
                  </div>
                </SelectItem>
                <SelectItem value="client" className="hover:bg-emerald-50">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>Client</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => switchRoleMutation.mutate(selectedRole)}
              disabled={!selectedRole || switchRoleMutation.isPending}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:scale-100"
              data-testid="button-switch-role"
            >
              {switchRoleMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Switching...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m0-4l-4-4" />
                  </svg>
                  <span>Switch</span>
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Information */}
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 backdrop-blur-sm rounded-lg border border-blue-100/50">
          <div className="flex items-start space-x-2">
            <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-slate-600 leading-relaxed">
              This role switcher allows you to test different user roles and their associated features during development.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
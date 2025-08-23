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
      return await apiRequest("/api/auth/switch-role", "POST", { role });
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-sm">Testing Mode</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">Current Role:</span>
          <Badge 
            variant={user.role === 'admin' ? 'default' : user.role === 'talent' ? 'secondary' : 'outline'}
            data-testid="current-role-badge"
          >
            {user.role}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Switch to:</label>
          <div className="flex gap-2">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger data-testid="role-select">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="talent">Talent</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => switchRoleMutation.mutate(selectedRole)}
              disabled={!selectedRole || switchRoleMutation.isPending}
              size="sm"
              data-testid="button-switch-role"
            >
              {switchRoleMutation.isPending ? "Switching..." : "Switch"}
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          This role switcher is for testing purposes. It allows you to test different user roles and their associated features.
        </div>
      </CardContent>
    </Card>
  );
}
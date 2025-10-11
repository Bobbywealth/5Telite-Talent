import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logoImage from "@assets/5t-logo.png";
import { LayoutDashboard, Users, Search, Calendar, ClipboardList, FileText, Megaphone, BookOpen, BarChart3, Shield, Trash2, Home } from "lucide-react";

const sidebarItems = [
  {
    title: "Homepage",
    href: "/",
    icon: Home,
  },
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Approvals",
    href: "/admin/approvals",
    icon: Shield,
    showBadge: true,
  },
  {
    title: "Talent Management",
    href: "/admin/talents",
    icon: Users,
  },
  {
    title: "Browse Talent",
    href: "/admin/talent",
    icon: Search,
  },
  {
    title: "Booking Requests",
    href: "/admin/booking-requests",
    icon: Calendar,
  },
  {
    title: "Bookings",
    href: "/admin/bookings",
    icon: Calendar,
  },
  {
    title: "Task Manager",
    href: "/admin/tasks",
    icon: ClipboardList,
  },
  {
    title: "Announcements",
    href: "/admin/announcements",
    icon: Megaphone,
  },
  {
    title: "Contracts",
    href: "/admin/contracts",
    icon: FileText,
  },
  {
    title: "Training Guide",
    href: "/admin/training",
    icon: BookOpen,
  },
  {
    title: "Reports & Analytics",
    href: "/admin/reports",
    icon: BarChart3,
  },
  {
    title: "Remove Bobby Test",
    href: "/admin/remove-bobby",
    icon: Trash2,
  },
];

interface AdminSidebarProps {
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
}

export default function AdminSidebar({ isMobileOpen, onMobileToggle }: AdminSidebarProps = {}) {
  const { user } = useAuth();
  const [location] = useLocation();
  
  // Fetch pending users count
  const { data: pendingUsersResponse } = useQuery({
    queryKey: ["/api/admin/users/pending"],
    queryFn: getQueryFn(),
    refetchInterval: 60000, // Refresh every minute
  });
  
  const pendingCount = pendingUsersResponse?.users?.length || 0;
  
  // Debug logging
  console.log("DEBUG Sidebar - Pending users response:", pendingUsersResponse);
  console.log("DEBUG Sidebar - Pending count:", pendingCount);

  const isActive = (href: string) => {
    if (href === "/admin") return location === "/admin";
    return location.startsWith(href);
  };

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex justify-center">
        <Link href="/" data-testid="link-logo-admin" className="block">
          <img 
            src={logoImage} 
            alt="5T Talent Platform" 
            className="h-10 w-auto max-w-full object-contain hover:scale-105 transition-transform duration-200"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        <div className="px-6 space-y-2">
          {sidebarItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                    isActive(item.href)
                      ? "text-white bg-primary"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                  data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={onMobileToggle}
                >
                  <IconComponent className="w-4 h-4 mr-3" />
                  <span className="flex-1">{item.title}</span>
                  {item.showBadge && pendingCount > 0 && (
                    <Badge variant={isActive(item.href) ? "secondary" : "destructive"} className="ml-auto">
                      {pendingCount}
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Info */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {user?.firstName?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-slate-900">{user?.firstName}</p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar - Only show on extra large screens */}
      <div className="hidden xl:flex w-64 bg-white shadow-lg min-h-screen relative">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar - Show sheet for all screens smaller than xl */}
      <div className="xl:hidden">
        <Sheet open={isMobileOpen} onOpenChange={onMobileToggle}>
          <SheetContent side="left" className="w-64 p-0">
            <div className="relative h-full">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
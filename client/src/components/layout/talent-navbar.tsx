import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoImage from "@assets/5t-logo.png";
import { NotificationBell } from "@/components/ui/notification-bell";

export default function TalentNavbar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/dashboard") return location === "/dashboard";
    return location.startsWith(path);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const navigationItems = [
    { href: "/dashboard", label: "Dashboard", icon: "fas fa-home" },
    { href: "/dashboard/profile", label: "My Profile", icon: "fas fa-user" },
    { href: "/dashboard/bookings", label: "My Bookings", icon: "fas fa-calendar" },
    { href: "/dashboard/tasks", label: "My Tasks", icon: "fas fa-tasks" },
    { href: "/contracts", label: "My Contracts", icon: "fas fa-file-contract" },
    { href: "/talent", label: "Browse Talent", icon: "fas fa-users" },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center" data-testid="link-logo-talent">
              <img 
                src="/attached_assets/5t-logo.png" 
                alt="5T Talent Platform" 
                className="h-24 w-auto hover:scale-105 transition-transform duration-200"
              />
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? "text-white bg-primary shadow-md" 
                    : "text-slate-600 hover:text-primary hover:bg-slate-50"
                }`}
                data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <i className={`${item.icon} mr-2 w-4`}></i>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right: Notifications & User Profile */}
          <div className="flex items-center space-x-4">
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-lg"
                  data-testid="button-user-menu"
                >
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {getInitials(user?.firstName || undefined, user?.lastName || undefined)}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-slate-900">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-xs text-slate-500 capitalize">
                      Talent
                    </div>
                  </div>
                  <i className="fas fa-chevron-down text-slate-400 text-xs"></i>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="flex items-center cursor-pointer">
                    <i className="fas fa-user mr-2 w-4"></i>
                    Edit Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="flex items-center cursor-pointer">
                    <i className="fas fa-cog mr-2 w-4"></i>
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/api/logout" className="flex items-center cursor-pointer">
                    <i className="fas fa-sign-out-alt mr-2 w-4"></i>
                    Sign Out
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-slate-200">
        <div className="px-4 py-3 space-y-1">
          {navigationItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive(item.href)
                  ? "text-white bg-primary shadow-md" 
                  : "text-slate-600 hover:text-primary hover:bg-slate-50"
              }`}
              data-testid={`mobile-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <i className={`${item.icon} mr-3 w-4`}></i>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
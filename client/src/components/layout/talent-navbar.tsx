import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoImage from "@assets/5t-logo.png";
import { NotificationBell } from "@/components/ui/notification-bell";
import { Home, User, Calendar, ClipboardList, FileText, Users, Menu, ChevronDown, Settings, LogOut } from "lucide-react";


export default function TalentNavbar() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/dashboard") return location === "/dashboard";
    return location.startsWith(path);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const navigationItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/profile", label: "My Profile", icon: User },
    { href: "/dashboard/bookings", label: "My Bookings", icon: Calendar },
    { href: "/dashboard/tasks", label: "My Tasks", icon: ClipboardList },
    { href: "/contracts", label: "My Contracts", icon: FileText },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Left: Mobile Menu Button + Logo */}
          <div className="flex items-center space-x-2">
            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden p-2" data-testid="button-mobile-menu-talent">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="p-6 border-b border-slate-200">
                  <img 
                    src={logoImage} 
                    alt="5T Talent Platform" 
                    className="h-12 w-auto max-w-full object-contain"
                  />
                </div>
                <nav className="mt-6">
                  <div className="px-6 space-y-2">
                    {navigationItems.map((item) => (
                      <Link 
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                          isActive(item.href)
                            ? "text-white bg-primary" 
                            : "text-slate-600 hover:bg-slate-100"
                        }`}>
                          <item.icon className="w-4 h-4 mr-3" />
                          {item.label}
                        </div>
                      </Link>
                    ))}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
            
            <Link href="/dashboard" className="flex items-center" data-testid="link-logo-talent">
              <img 
                src={logoImage} 
                alt="5T Talent Platform" 
                className="h-16 md:h-20 w-auto max-w-full object-contain hover:scale-105 transition-transform duration-200"
              />
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
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
                <item.icon className="w-4 h-4 mr-2" />
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
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="flex items-center cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="flex items-center cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/api/logout" className="flex items-center cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
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
              <item.icon className="w-4 h-4 mr-3" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
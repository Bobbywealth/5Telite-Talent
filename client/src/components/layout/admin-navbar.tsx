import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from "@/components/ui/notification-bell";
import logoImage from "@assets/5t-logo.png";
import { LayoutDashboard, Users, Calendar, ClipboardList, FileText, Search, Menu, ChevronDown, Settings, BarChart3 } from "lucide-react";

export default function AdminNavbar() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/admin") return location === "/admin";
    return location.startsWith(path);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const navigationItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/talents", label: "Manage Talents", icon: Users },
    { href: "/admin/bookings", label: "Manage Bookings", icon: Calendar },
    { href: "/admin/tasks", label: "Task Management", icon: ClipboardList },
    { href: "/admin/contracts", label: "Contracts", icon: FileText },
    { href: "/talent", label: "View Directory", icon: Search },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-slate-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Mobile Menu Button + Logo */}
          <div className="flex items-center space-x-2">
            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden p-2" data-testid="button-mobile-menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="p-6 border-b border-slate-200">
                  <img 
                    src={logoImage} 
                    alt="5T Talent Platform" 
                    className="h-16 w-auto"
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
                            ? "text-slate-900 bg-slate-100" 
                            : "text-slate-900 hover:bg-slate-100"
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
            
            <Link href="/admin" className="flex items-center" data-testid="link-logo-admin">
              <img 
                src={logoImage} 
                alt="5T Talent Platform" 
                className="h-12 md:h-14 w-auto hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  console.error('Logo failed to load');
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <span className="hidden text-primary font-bold text-xl">5T TALENT</span>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 ml-8">
            {navigationItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? "text-slate-900 bg-slate-100 shadow-md" 
                    : "text-slate-900 hover:text-primary hover:bg-slate-50"
                }`}
                data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right: Notifications + User Profile */}
          <div className="flex items-center space-x-4">
            <NotificationBell className="mr-2" />
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
                      Administrator
                    </div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings" className="flex items-center cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Admin Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/reports" className="flex items-center cursor-pointer">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Reports
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/api/logout" className="flex items-center cursor-pointer">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

    </nav>
  );
}
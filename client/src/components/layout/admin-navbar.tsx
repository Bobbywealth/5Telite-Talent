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
import logoImage from "@assets/5t-logo.png";

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
    { href: "/admin", label: "Dashboard", icon: "fas fa-tachometer-alt" },
    { href: "/admin/talents", label: "Manage Talents", icon: "fas fa-users" },
    { href: "/admin/bookings", label: "Manage Bookings", icon: "fas fa-calendar" },
    { href: "/admin/tasks", label: "Task Management", icon: "fas fa-tasks" },
    { href: "/contracts", label: "Contracts", icon: "fas fa-file-contract" },
    { href: "/talent", label: "View Directory", icon: "fas fa-search" },
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
                <Button variant="ghost" size="sm" className="md:hidden p-2" data-testid="button-mobile-menu">
                  <i className="fas fa-bars text-lg"></i>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="p-6 border-b border-slate-200">
                  <img 
                    src="/attached_assets/5t-logo.png" 
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
                            ? "text-white bg-primary" 
                            : "text-slate-600 hover:bg-slate-100"
                        }`}>
                          <i className={`${item.icon} mr-3 w-4`}></i>
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
                src="/attached_assets/5t-logo.png" 
                alt="5T Talent Platform" 
                className="h-16 md:h-20 w-auto hover:scale-105 transition-transform duration-200"
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

          {/* Right: User Profile */}
          <div className="flex items-center">
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
                  <i className="fas fa-chevron-down text-slate-400 text-xs"></i>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings" className="flex items-center cursor-pointer">
                    <i className="fas fa-cog mr-2 w-4"></i>
                    Admin Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/reports" className="flex items-center cursor-pointer">
                    <i className="fas fa-chart-bar mr-2 w-4"></i>
                    Reports
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
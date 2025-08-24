import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { NotificationBell } from "@/components/ui/notification-bell";
import { useAuth } from "@/hooks/useAuth";
import logoImage from "@assets/5t-logo.png";

export default function ClientNavbar() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: "fas fa-tachometer-alt" },
    { href: "/talent", label: "Find Talent", icon: "fas fa-search" },
    { href: "/book", label: "Book Now", icon: "fas fa-plus-circle" },
    { href: "/contracts", label: "My Contracts", icon: "fas fa-file-contract" },
  ];

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* Left: Mobile Menu Button + Logo */}
          <div className="flex items-center space-x-2">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
              data-testid="button-mobile-menu-client"
            >
              <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-lg`}></i>
            </button>
            
            <Link href="/" className="flex items-center" data-testid="link-logo">
              <img 
                src="/attached_assets/5t-logo.png" 
                alt="5T Talent Platform" 
                className="h-16 md:h-20 w-auto hover:scale-105 transition-transform duration-200"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-primary text-white"
                    : "text-slate-700 hover:text-primary hover:bg-slate-50"
                }`}
                data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
              >
                <i className={`${item.icon} text-sm`}></i>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right side - Profile & Notifications */}
          <div className="flex items-center space-x-4">
            {/* User Info Badge */}
            <div className="hidden lg:flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                <i className="fas fa-user mr-1"></i>
                Client Account
              </Badge>
              <Badge 
                variant={user?.status === 'active' ? 'default' : 'secondary'} 
                className="text-xs"
              >
                <i className="fas fa-circle text-[8px] mr-1"></i>
                {user?.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Active'}
              </Badge>
            </div>

            {/* Notifications */}
            <NotificationBell />

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="button-user-menu-client">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl || undefined} alt="Profile" />
                    <AvatarFallback className="bg-primary text-white text-sm">
                      {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-sm">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="w-full cursor-pointer">
                    <i className="fas fa-user mr-2"></i>
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/client/bookings" className="w-full cursor-pointer">
                    <i className="fas fa-calendar mr-2"></i>
                    My Bookings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="w-full cursor-pointer">
                    <i className="fas fa-cog mr-2"></i>
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <a href="/api/logout" className="w-full flex items-center">
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    Sign Out
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-slate-200">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-primary text-white"
                      : "text-slate-700 hover:text-primary hover:bg-slate-50"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  data-testid={`mobile-nav-${item.label.toLowerCase().replace(" ", "-")}`}
                >
                  <i className={`${item.icon} text-sm`}></i>
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* Mobile User Info */}
              <div className="pt-3 border-t border-slate-200 mt-3">
                <div className="px-3 py-2">
                  <div className="text-sm font-medium text-slate-900">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-xs text-slate-500 mb-2">
                    {user?.email}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      Client Account
                    </Badge>
                    <Badge variant="default" className="text-xs">
                      Active
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
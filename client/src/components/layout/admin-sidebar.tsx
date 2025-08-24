import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logoImage from "@assets/5t-logo.png";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: "fas fa-tachometer-alt",
  },
  {
    title: "Talent Management",
    href: "/admin/talents",
    icon: "fas fa-users",
  },
  {
    title: "Browse Talent",
    href: "/talent",
    icon: "fas fa-search",
  },
  {
    title: "Bookings",
    href: "/admin/bookings",
    icon: "fas fa-calendar",
  },
  {
    title: "Task Manager",
    href: "/admin/tasks",
    icon: "fas fa-tasks",
  },
  {
    title: "Contracts",
    href: "/contracts",
    icon: "fas fa-file-contract",
  },
];

interface AdminSidebarProps {
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
}

export default function AdminSidebar({ isMobileOpen, onMobileToggle }: AdminSidebarProps = {}) {
  const { user } = useAuth();
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/admin") return location === "/admin";
    return location.startsWith(href);
  };

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-6 border-b border-slate-200 flex justify-center">
        <Link href="/" data-testid="link-logo-admin">
          <img 
            src="/attached_assets/5t-logo.png" 
            alt="5T Talent Platform" 
            className="h-20 md:h-24 w-auto hover:scale-105 transition-transform duration-200"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        <div className="px-6 space-y-2">
          {sidebarItems.map((item) => (
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
                <i className={`${item.icon} mr-3 w-4`}></i>
                {item.title}
              </div>
            </Link>
          ))}
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
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-white shadow-lg min-h-screen relative">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
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
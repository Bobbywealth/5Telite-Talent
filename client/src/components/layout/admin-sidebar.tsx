import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

export default function AdminSidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/admin") return location === "/admin";
    return location.startsWith(href);
  };

  return (
    <div className="w-64 bg-white shadow-lg min-h-screen">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 flex justify-center">
        <Link href="/" data-testid="link-logo-admin">
          <img 
            src={logoImage} 
            alt="5T Talent Platform" 
            className="h-28 w-auto hover:scale-105 transition-transform duration-200"
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
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate" data-testid="text-admin-name">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-slate-500 truncate">Administrator</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-3 justify-start"
          onClick={() => window.location.href = "/api/logout"}
          data-testid="button-admin-logout"
        >
          <i className="fas fa-sign-out-alt mr-2 w-4"></i>
          Sign Out
        </Button>
      </div>
    </div>
  );
}

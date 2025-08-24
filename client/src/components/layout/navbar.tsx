import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logoImage from "@assets/5t-logo.png";

export default function Navbar() {
  const { isAuthenticated, user } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'talent') return '/dashboard';
    return '/';
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center" data-testid="link-logo">
              <img 
                src={logoImage} 
                alt="5T Talent Platform" 
                className="h-20 w-auto hover:scale-105 transition-transform duration-200"
              />
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive("/") && location === "/" 
                  ? "text-white bg-primary shadow-md" 
                  : "text-slate-600 hover:text-primary hover:bg-slate-50"
              }`}
              data-testid="link-home"
            >
              Home
            </Link>
            <Link 
              href="/talent"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive("/talent") 
                  ? "text-white bg-primary shadow-md" 
                  : "text-slate-600 hover:text-primary hover:bg-slate-50"
              }`}
              data-testid="link-find-talent"
            >
              Find Talent
            </Link>
            <Link 
              href="/book"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive("/book") 
                  ? "text-white bg-primary shadow-md" 
                  : "text-slate-600 hover:text-primary hover:bg-slate-50"
              }`}
              data-testid="link-book"
            >
              Book Now
            </Link>
          </div>

          {/* Right: User Actions */}
          <div className="flex items-center space-x-3">
            {!isAuthenticated ? (
              <Button 
                onClick={() => window.location.href = "/api/login"}
                variant="outline"
                data-testid="button-sign-in"
              >
                <i className="fas fa-user mr-2"></i>Sign In
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full" data-testid="button-user-menu">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.profileImageUrl || undefined} alt={`${user?.firstName || ''} ${user?.lastName || ''}`} />
                      <AvatarFallback>{getInitials(user?.firstName || undefined, user?.lastName || undefined)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium" data-testid="text-user-name">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-slate-500" data-testid="text-user-email">
                      {user?.email}
                    </p>
                    <p className="text-xs text-slate-400 capitalize" data-testid="text-user-role">
                      {user?.role}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()}>
                      <i className="fas fa-tachometer-alt mr-2 w-4"></i>
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === 'talent' && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile">
                        <i className="fas fa-user-edit mr-2 w-4"></i>
                        Edit Profile
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => window.location.href = "/api/logout"}
                    data-testid="button-logout"
                  >
                    <i className="fas fa-sign-out-alt mr-2 w-4"></i>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

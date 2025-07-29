import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home,
  BarChart3,
  Users,
  MessageCircle,
  Settings,
  LogOut,
  Bell,
  Search,
  Plus,
  Crown,
  Camera,
  Store
} from "lucide-react";

// BULLETPROOF NAVIGATION: Role-specific menu items with deep link support
const navigationItems = {
  admin: [
    { name: "Overview", href: "/dashboard", icon: Home, description: "Platform overview" },
    { name: "Users", href: "/dashboard/users", icon: Users, description: "Manage users" },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, description: "Platform analytics" },
    { name: "Platform Settings", href: "/dashboard/settings", icon: Settings, description: "System settings" },
    { name: "Collaborations", href: "/dashboard/collaborations", icon: MessageCircle, description: "All collaborations" },
  ],
  creator: [
    { name: "Dashboard", href: "/dashboard", icon: Home, description: "Creator home" },
    { name: "My Profile", href: "/dashboard/profile", icon: Camera, description: "Profile & portfolio" },
    { name: "Collaborations", href: "/dashboard/collaborations", icon: MessageCircle, description: "Your projects" },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, description: "Performance metrics" },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, description: "Account settings" },
  ],
  business: [
    { name: "Dashboard", href: "/dashboard", icon: Home, description: "Business overview" },
    { name: "Find Creators", href: "/marketplace", icon: Search, description: "Discover talent" },
    { name: "My Campaigns", href: "/campaigns", icon: Store, description: "Campaign management" },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, description: "Campaign insights" },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, description: "Business settings" },
  ]
};

export const DashboardNav = () => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  
  // BULLETPROOF ROLE DETECTION: Same logic as Dashboard component
  const detectUserRole = (): 'creator' | 'business' | 'admin' => {
    // Layer 1: Profile role (real users with completed profiles)
    if (profile?.role && typeof profile.role === 'string') {
      return profile.role as 'creator' | 'business' | 'admin';
    }
    
    // Layer 2: Auth metadata (mock users and real users without profiles)
    if (user?.user_metadata?.role && typeof user.user_metadata.role === 'string') {
      return user.user_metadata.role as 'creator' | 'business' | 'admin';
    }
    
    // Layer 3: Email-based detection for mock users
    if (user?.email) {
      if (user.email.includes('admin@')) {
        return 'admin';
      }
      if (user.email.includes('venue@') || user.email.includes('business@')) {
        return 'business';
      }
      if (user.email.includes('creator@')) {
        return 'creator';
      }
    }
    
    // Layer 4: Ultimate fallback
    return 'creator';
  };
  
  const userRole = detectUserRole();
  const navigation = navigationItems[userRole] || navigationItems.creator;
  
  // Clean role detection logging
  console.log('🧭 DashboardNav: Role detected as', userRole);
  
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4" />;
      case 'creator': return <Camera className="w-4 h-4" />;
      case 'business': return <Store className="w-4 h-4" />;
      default: return <Camera className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'creator': return 'bg-gradient-to-r from-pink-500 to-purple-500';
      case 'business': return 'bg-gradient-to-r from-blue-500 to-indigo-500';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">UR</span>
              </div>
              <span className="font-bold text-xl text-gray-900">URContent</span>
            </Link>
            
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* BULLETPROOF ROLE-BASED QUICK ACTIONS */}
            {userRole === 'business' && (
              <Link to="/marketplace">
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Campaign
                </Button>
              </Link>
            )}
            
            {userRole === 'creator' && (
              <Button size="sm" className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Content
              </Button>
            )}
            
            {userRole === 'admin' && (
              <Button size="sm" className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
            )}

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className={`${getRoleColor(userRole)} text-white font-semibold`}>
                      {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium leading-none">
                        {user?.user_metadata?.full_name || 'Usuario'}
                      </p>
                      <Badge variant="outline" className="flex items-center space-x-1 text-xs">
                        {getRoleIcon(userRole)}
                        <span className="capitalize">{userRole}</span>
                      </Badge>
                    </div>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/profile">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/billing">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};
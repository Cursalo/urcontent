import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Menu,
  X,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Home,
  BarChart3,
  Users,
  MessageCircle,
  Camera,
  Store,
  Crown,
  Target,
  Search,
  Calendar,
  FileImage,
  Briefcase,
  CheckSquare,
  Palette,
  Headphones,
  HelpCircle,
  LayoutDashboard,
  Handshake
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeVariant?: 'default' | 'secondary' | 'destructive';
  onClick?: () => void;
}

interface MobileNavProps {
  userRole: 'creator' | 'business' | 'admin';
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  className?: string;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  userRole,
  activeTab,
  onTabChange,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  // Close sheet on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Navigation items based on user role
  const getNavigationItems = (): NavItem[] => {
    switch (userRole) {
      case 'creator':
        return [
          { id: 'panel', label: 'Panel Principal', icon: LayoutDashboard, onClick: () => onTabChange?.('panel') },
          { id: 'contenido', label: 'Gestión de Contenido', icon: FileImage, onClick: () => onTabChange?.('contenido') },
          { id: 'colaboraciones', label: 'Colaboraciones', icon: Briefcase, onClick: () => onTabChange?.('colaboraciones'), badge: 4 },
          { id: 'analytics', label: 'Analytics', icon: BarChart3, onClick: () => onTabChange?.('analytics') },
          { id: 'herramientas', label: 'Herramientas', icon: CheckSquare, onClick: () => onTabChange?.('herramientas') },
          { id: 'brandkit', label: 'Brand Kit', icon: Palette, onClick: () => onTabChange?.('brandkit') }
        ];
      case 'business':
        return [
          { id: 'panel-principal', label: 'Panel Principal', icon: LayoutDashboard, onClick: () => onTabChange?.('panel-principal') },
          { id: 'campanas', label: 'Campañas', icon: Target, onClick: () => onTabChange?.('campanas'), badge: 3 },
          { id: 'buscar-creators', label: 'Buscar Creators', icon: Search, onClick: () => onTabChange?.('buscar-creators') },
          { id: 'analytics', label: 'Analytics', icon: BarChart3, onClick: () => onTabChange?.('analytics') },
          { id: 'mensajes', label: 'Mensajes', icon: MessageCircle, onClick: () => onTabChange?.('mensajes'), badge: 5, badgeVariant: 'destructive' },
          { id: 'calendario', label: 'Calendario', icon: Calendar, onClick: () => onTabChange?.('calendario') }
        ];
      case 'admin':
        return [
          { id: 'panel', label: 'Panel de Control', icon: LayoutDashboard, onClick: () => onTabChange?.('panel') },
          { id: 'usuarios', label: 'Gestión de Usuarios', icon: Users, onClick: () => onTabChange?.('usuarios'), badge: 234 },
          { id: 'colaboraciones', label: 'Colaboraciones', icon: Handshake, onClick: () => onTabChange?.('colaboraciones'), badge: 12 },
          { id: 'analytics', label: 'Analytics', icon: BarChart3, onClick: () => onTabChange?.('analytics') },
          { id: 'configuracion', label: 'Configuración', icon: Settings, onClick: () => onTabChange?.('configuracion') },
          { id: 'soporte', label: 'Centro de Soporte', icon: Headphones, onClick: () => onTabChange?.('soporte'), badge: 45 }
        ];
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  const getRoleIcon = () => {
    switch (userRole) {
      case 'admin': return <Crown className="w-4 h-4" />;
      case 'creator': return <Camera className="w-4 h-4" />;
      case 'business': return <Store className="w-4 h-4" />;
    }
  };

  const getRoleColor = () => {
    switch (userRole) {
      case 'admin': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'creator': return 'bg-gradient-to-r from-pink-500 to-purple-500';
      case 'business': return 'bg-gradient-to-r from-blue-500 to-indigo-500';
    }
  };

  const getRoleName = () => {
    switch (userRole) {
      case 'admin': return 'Administrador';
      case 'creator': return 'Creador';
      case 'business': return 'Negocio';
    }
  };

  return (
    <div className={cn("lg:hidden", className)}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
          >
            <Menu className="h-6 w-6" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[85vw] sm:w-[350px] p-0">
          <SheetHeader className="p-6 pb-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">UR</span>
              </div>
              <div>
                <SheetTitle className="text-lg">URContent</SheetTitle>
                <p className="text-xs text-gray-500 mt-0.5">{getRoleName()}</p>
              </div>
            </div>
          </SheetHeader>

          {/* User Profile Section */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className={`${getRoleColor()} text-white font-semibold`}>
                  {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {user?.user_metadata?.full_name || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
                <Badge variant="outline" className="mt-1 text-xs">
                  {getRoleIcon()}
                  <span className="ml-1 capitalize">{userRole}</span>
                </Badge>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.href 
                  ? location.pathname === item.href 
                  : activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.onClick) {
                        item.onClick();
                      }
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-black text-white"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.badge && (
                        <Badge 
                          variant={item.badgeVariant || "secondary"}
                          className={cn(
                            "text-xs",
                            isActive && "bg-white text-black"
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t mt-auto">
              <div className="space-y-1">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                >
                  <Bell className="w-5 h-5" />
                  <span>Notificaciones</span>
                  {notifications > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {notifications}
                    </Badge>
                  )}
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                >
                  <Settings className="w-5 h-5" />
                  <span>Configuración</span>
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                >
                  <HelpCircle className="w-5 h-5" />
                  <span>Ayuda y Soporte</span>
                </button>

                <button
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};
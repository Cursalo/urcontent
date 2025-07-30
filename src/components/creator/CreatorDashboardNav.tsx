import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Camera,
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Home,
  BarChart3,
  Briefcase,
  FileImage,
  CheckSquare,
  HelpCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface CreatorDashboardNavProps {
  notificaciones?: number;
  onMenuClick?: () => void;
  menuAbierto?: boolean;
}

export const CreatorDashboardNav: React.FC<CreatorDashboardNavProps> = ({
  notificaciones = 0,
  onMenuClick,
  menuAbierto = false
}) => {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  const navegacionItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/creator/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/creator/colaboraciones', label: 'Colaboraciones', icon: Briefcase },
    { path: '/creator/contenido', label: 'Contenido', icon: FileImage },
    { path: '/creator/tareas', label: 'Tareas', icon: CheckSquare }
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y Menú móvil */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              {menuAbierto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                <Camera className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-xl hidden sm:block">URContent</span>
            </Link>
          </div>

          {/* Navegación Desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {navegacionItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all",
                    isActive
                      ? "bg-black text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Barra de búsqueda */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar colaboraciones, contenido..."
                className="pl-10 pr-4 py-2 w-full rounded bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
          </div>

          {/* Acciones del usuario */}
          <div className="flex items-center gap-3">
            {/* Botón de búsqueda móvil */}
            <Button variant="ghost" size="icon" className="md:hidden rounded">
              <Search className="w-5 h-5" />
            </Button>

            {/* Notificaciones */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded">
                  <Bell className="w-5 h-5" />
                  {notificaciones > 0 && (
                    <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs bg-black text-white">
                      {notificaciones > 9 ? '9+' : notificaciones}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notificaciones === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No tienes notificaciones nuevas</p>
                  </div>
                ) : (
                  <>
                    <DropdownMenuItem className="p-4">
                      <div className="flex gap-3">
                        <div className="w-2 h-2 bg-black rounded-full mt-1.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Nueva colaboración disponible</p>
                          <p className="text-xs text-gray-500 mt-1">Nike está buscando creators como tú</p>
                          <p className="text-xs text-gray-400 mt-1">Hace 2 horas</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="p-4">
                      <div className="flex gap-3">
                        <div className="w-2 h-2 bg-gray-700 rounded-full mt-1.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Pago recibido</p>
                          <p className="text-xs text-gray-500 mt-1">$15,000 MXN de Starbucks México</p>
                          <p className="text-xs text-gray-400 mt-1">Hace 1 día</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center">
                  <Link to="/notificaciones" className="text-sm text-gray-700 hover:underline">
                    Ver todas las notificaciones
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Menú de usuario */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                    <AvatarFallback className="bg-gray-200 text-gray-700">
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.full_name || 'Creator'}</p>
                    <p className="text-xs leading-none text-gray-500">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Mi Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Ayuda y Soporte</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-gray-700">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Navegación móvil */}
      {menuAbierto && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navegacionItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded text-base font-medium",
                    isActive
                      ? "bg-black text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                  onClick={onMenuClick}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};
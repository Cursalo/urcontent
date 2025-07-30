import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Handshake,
  BarChart3,
  Settings,
  Headphones,
  LogOut,
  Moon,
  Sun,
  Bell,
  Search,
  Menu,
  X,
  Shield,
  Activity,
  FileText,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminDashboardNavProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  darkMode?: boolean;
  toggleDarkMode?: () => void;
}

export const AdminDashboardNav: React.FC<AdminDashboardNavProps> = ({
  activeSection,
  setActiveSection,
  darkMode = false,
  toggleDarkMode
}) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [notifications] = React.useState([
    { id: 1, type: 'alert', message: 'Nueva disputa pendiente de revisión', time: '5 min', unread: true },
    { id: 2, type: 'success', message: '15 nuevos usuarios registrados hoy', time: '1 hora', unread: true },
    { id: 3, type: 'warning', message: 'Actualización del sistema programada', time: '2 horas', unread: false },
  ]);

  const navItems = [
    { id: 'panel', label: 'Panel de Control', icon: LayoutDashboard, badge: null },
    { id: 'usuarios', label: 'Gestión de Usuarios', icon: Users, badge: '234' },
    { id: 'colaboraciones', label: 'Colaboraciones', icon: Handshake, badge: '12' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
    { id: 'configuracion', label: 'Configuración', icon: Settings, badge: null },
    { id: 'soporte', label: 'Centro de Soporte', icon: Headphones, badge: '45' },
  ];

  const systemStats = [
    { label: 'Uptime', value: '99.9%', icon: Activity, status: 'success' },
    { label: 'API', value: 'Activo', icon: CheckCircle2, status: 'success' },
    { label: 'Carga', value: '2.4', icon: Clock, status: 'warning' },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'success': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <>
      {/* Top Navigation Bar - Now handled by DashboardNav */}
      <div className={`fixed top-16 left-0 right-0 z-50 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b hidden`}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  URContent Admin
                </h1>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Panel de Administración
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="hidden md:flex items-center space-x-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar usuarios, colaboraciones..."
                className="pl-10 w-64"
              />
            </div>

            {/* System Status */}
            <div className="hidden lg:flex items-center space-x-3">
              {systemStats.map((stat, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <stat.icon className={`w-4 h-4 ${
                    stat.status === 'success' ? 'text-green-500' : 'text-yellow-500'
                  }`} />
                  <div className="text-sm">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {stat.label}:
                    </span>
                    <span className={`ml-1 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stat.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* Dark Mode Toggle */}
            {toggleDarkMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="rounded-full"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            )}

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5" />
                  {notifications.filter(n => n.unread).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notificaciones</span>
                  <Badge variant="secondary">
                    {notifications.filter(n => n.unread).length} nuevas
                  </Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="flex items-start space-x-3 p-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <p className={`text-sm ${notification.unread ? 'font-medium' : ''}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center justify-center">
                  Ver todas las notificaciones
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                    SA
                  </div>
                  <span className="hidden md:inline">Super Admin</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="w-4 h-4 mr-2" />
                  Logs de Auditoría
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <div className={`fixed left-0 top-16 bottom-0 w-64 ${
        darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      } border-r transform transition-transform duration-300 translate-x-0 z-40`}>
        <div className="h-full flex flex-col">
          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  activeSection === item.id 
                    ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-l-4 border-purple-600' 
                    : ''
                }`}
                onClick={() => {
                  setActiveSection(item.id);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </nav>

          {/* Quick Stats */}
          <div className={`p-4 m-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h3 className="text-sm font-medium mb-3">Resumen Rápido</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Usuarios Activos</span>
                <span className="font-medium">1,234</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Revenue Hoy</span>
                <span className="font-medium text-green-600">$12,485</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tickets Abiertos</span>
                <span className="font-medium text-yellow-600">45</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`p-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Activity className="w-4 h-4" />
              <span>Sistema actualizado hace 2 min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};
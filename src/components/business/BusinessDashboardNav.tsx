import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Building2,
  LayoutDashboard,
  Target,
  Search,
  BarChart3,
  MessageCircle,
  Settings,
  Calendar,
  FileText,
  Users,
  TrendingUp,
  Bell,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface BusinessDashboardNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  mensajesNuevos?: number;
}

const BusinessDashboardNav: React.FC<BusinessDashboardNavProps> = ({
  activeTab,
  onTabChange,
  mensajesNuevos = 0
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: 'panel-principal',
      label: 'Panel Principal',
      icon: LayoutDashboard,
      description: 'Vista general de tu negocio'
    },
    {
      id: 'campanas',
      label: 'Campañas',
      icon: Target,
      description: 'Gestiona tus campañas activas',
      badge: '3'
    },
    {
      id: 'buscar-creators',
      label: 'Buscar Creators',
      icon: Search,
      description: 'Encuentra creators ideales'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Análisis y métricas detalladas'
    },
    {
      id: 'mensajes',
      label: 'Mensajes',
      icon: MessageCircle,
      description: 'Centro de comunicaciones',
      badge: mensajesNuevos > 0 ? mensajesNuevos.toString() : undefined,
      badgeVariant: 'destructive' as const
    },
    {
      id: 'calendario',
      label: 'Calendario',
      icon: Calendar,
      description: 'Programa tus campañas'
    }
  ];

  const bottomMenuItems = [
    {
      id: 'configuracion',
      label: 'Configuración',
      icon: Settings,
      description: 'Ajustes del negocio'
    },
    {
      id: 'ayuda',
      label: 'Ayuda',
      icon: HelpCircle,
      description: 'Centro de ayuda'
    }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-100 h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Mi Negocio</h2>
            <p className="text-xs text-gray-500">Panel de Control</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <TooltipProvider key={item.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    activeTab === item.id
                      ? "bg-black text-white"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <Badge 
                      variant={item.badgeVariant || "secondary"}
                      className={cn(
                        "ml-auto",
                        activeTab === item.id && "bg-white text-black"
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </nav>

      {/* Quick Stats */}
      <div className="px-6 py-4">
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">ROI Promedio</span>
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-sm font-semibold text-gray-900">4.2x</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Inversión Mes</span>
            <span className="text-sm font-semibold text-gray-900">$45,000</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Creators Activos</span>
            <span className="text-sm font-semibold text-gray-900">12</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Bottom Navigation */}
      <div className="p-4 space-y-1">
        {bottomMenuItems.map((item) => (
          <TooltipProvider key={item.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    activeTab === item.id
                      ? "bg-black text-white"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-600">MN</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Mi Negocio</p>
            <p className="text-xs text-gray-500">Plan Premium</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => navigate('/logout')}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
};

export default BusinessDashboardNav;
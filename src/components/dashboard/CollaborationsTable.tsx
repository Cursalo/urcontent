import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  MessageCircle, 
  Eye, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { MockCollaboration } from '@/data/mockUsers';

interface CollaborationsTableProps {
  collaborations: MockCollaboration[] | null | undefined;
  title?: string;
  description?: string;
  showAll?: boolean;
  maxItems?: number;
}

export const CollaborationsTable: React.FC<CollaborationsTableProps> = ({
  collaborations: rawCollaborations,
  title = "Colaboraciones Recientes",
  description = "Tus últimas asociaciones",
  showAll = false,
  maxItems = 5
}) => {
  // Safely handle collaborations array with null/undefined checks
  const collaborations = React.useMemo(() => {
    if (!rawCollaborations) return [];
    if (!Array.isArray(rawCollaborations)) {
      console.warn('CollaborationsTable: collaborations prop is not an array, received:', typeof rawCollaborations);
      return [];
    }
    return rawCollaborations.filter(collab => collab && typeof collab === 'object');
  }, [rawCollaborations]);
  
  const displayCollaborations = showAll ? collaborations : collaborations.slice(0, maxItems);

  const getStatusBadge = (status: any) => {
    // Safe status badge with fallbacks
    const statusConfig = {
      completed: { 
        label: "Completada", 
        className: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200",
        icon: CheckCircle
      },
      in_progress: { 
        label: "En Progreso", 
        className: "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200",
        icon: Clock
      },
      accepted: { 
        label: "Aceptada", 
        className: "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200",
        icon: CheckCircle
      },
      proposed: { 
        label: "Propuesta", 
        className: "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200",
        icon: AlertCircle
      },
      rejected: { 
        label: "Rechazada", 
        className: "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200",
        icon: AlertCircle
      },
      unknown: {
        label: "Desconocida",
        className: "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200",
        icon: AlertCircle
      }
    };
    
    let statusKey = 'unknown';
    if (status && typeof status === 'string') {
      statusKey = statusConfig[status as keyof typeof statusConfig] ? status : 'unknown';
    }
    
    const config = statusConfig[statusKey as keyof typeof statusConfig];
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.className} border flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getPlatformIcon = (platform: any) => {
    // Robust platform icon handling
    if (!platform) return '📱';
    if (typeof platform !== 'string') {
      console.warn('getPlatformIcon: platform is not a string:', platform);
      return '📱';
    }
    try {
      switch (platform.toLowerCase().trim()) {
        case 'instagram':
          return '📷';
        case 'tiktok':
          return '🎵';
        case 'youtube':
          return '📺';
        case 'twitter':
          return '🐦';
        default:
          return '📱';
      }
    } catch (error) {
      console.warn('getPlatformIcon: Error processing platform:', platform, error);
      return '📱';
    }
  };

  const formatCurrency = (amount: any) => {
    // Safe currency formatting with fallbacks
    try {
      const numAmount = Number(amount);
      if (isNaN(numAmount)) {
        console.warn('formatCurrency: Invalid amount:', amount);
        return '$0';
      }
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0
      }).format(numAmount);
    } catch (error) {
      console.warn('formatCurrency: Error formatting currency:', amount, error);
      return '$0';
    }
  };

  const formatDate = (dateString: any) => {
    // Safe date formatting with fallbacks
    try {
      if (!dateString) return 'Fecha no disponible';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('formatDate: Invalid date string:', dateString);
        return 'Fecha inválida';
      }
      return date.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      console.warn('formatDate: Error formatting date:', dateString, error);
      return 'Error de fecha';
    }
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'proposed': return 20;
      case 'accepted': return 40;
      case 'in_progress': return 70;
      case 'completed': return 100;
      default: return 0;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white border border-gray-100 rounded-3xl hover:border-gray-200 hover:shadow-2xl transition-all duration-300 overflow-hidden relative">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-transparent to-pink-50/30 pointer-events-none" />
      <CardHeader className="relative pb-6 bg-gradient-to-r from-gray-50/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div 
              className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <MessageCircle className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-xl font-medium text-black">{title}</CardTitle>
              <CardDescription className="text-gray-500 text-sm">{description}</CardDescription>
            </div>
          </div>
          {!showAll && (
            <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-200 rounded-full px-4 py-2 transition-all duration-300 transform hover:scale-105">
              Ver Todas
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="relative">
        {displayCollaborations.length === 0 ? (
          <div className="text-center py-12 text-gray-500 animate-fade-in">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">Aún no hay colaboraciones</p>
            <p className="text-sm">Comienza a conectar con marcas para ver tus colaboraciones aquí</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayCollaborations.map((collaboration, index) => {
              // Safe collaboration data extraction with fallbacks
              const safeCollaboration = {
                id: collaboration?.id || `collab-${index}`,
                title: collaboration?.title || 'Colaboración sin título',
                description: collaboration?.description || 'Sin descripción disponible',
                status: collaboration?.status || 'unknown',
                platform: collaboration?.platform || 'unknown',
                created_at: collaboration?.created_at || new Date().toISOString(),
                collaboration_type: collaboration?.collaboration_type || 'general',
                compensation_amount: collaboration?.compensation_amount || 0,
                compensation_type: collaboration?.compensation_type || 'one-time',
                business_profile: collaboration?.business_profile || null,
                performance: collaboration?.performance || null
              };
              
              return (
                <motion.div
                  key={safeCollaboration.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="group p-6 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl hover:from-purple-50 hover:to-pink-50 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-lg transition-shadow duration-300">
                        <span className="text-xl">{getPlatformIcon(safeCollaboration.platform)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-black text-lg">{safeCollaboration.title}</h3>
                          {getStatusBadge(safeCollaboration.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{safeCollaboration.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Creada {formatDate(safeCollaboration.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="capitalize">{(safeCollaboration.collaboration_type || '').replace('_', ' ')}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-black mb-1">
                        {formatCurrency(safeCollaboration.compensation_amount)}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {safeCollaboration.compensation_type}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600">Progreso</span>
                      <span className="text-xs text-gray-500">{getProgressValue(safeCollaboration.status)}%</span>
                    </div>
                    <Progress 
                      value={getProgressValue(safeCollaboration.status)} 
                      className="h-2 bg-gray-200 rounded-full overflow-hidden"
                    />
                  </div>

                  {/* Performance Metrics (for completed collaborations) */}
                  {safeCollaboration.status === 'completed' && safeCollaboration.performance && (
                    <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100 shadow-inner">
                      <div className="text-center">
                        <div className="text-lg font-bold text-black">
                          {safeCollaboration.performance.total_reach?.toLocaleString() || '0'}
                        </div>
                        <div className="text-xs text-gray-500">Alcance Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-black">
                          {Number(safeCollaboration.performance.engagement_rate || 0).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">Interacción</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-black">
                          {Number(safeCollaboration.performance.roi || 0).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500">ROI</div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2">
                      {safeCollaboration.status === 'proposed' && (
                        <>
                          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full px-4 shadow-lg transform transition-all duration-300 hover:scale-105">
                            Aceptar
                          </Button>
                          <Button size="sm" variant="outline" className="rounded-full px-4">
                            Rechazar
                          </Button>
                        </>
                      )}
                      {safeCollaboration.status === 'accepted' && (
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-full px-4 shadow-lg transform transition-all duration-300 hover:scale-105">
                          Iniciar Trabajo
                        </Button>
                      )}
                      {safeCollaboration.status === 'in_progress' && (
                        <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full px-4 shadow-lg transform transition-all duration-300 hover:scale-105">
                          Enviar Contenido
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost" className="rounded-full p-2">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="rounded-full p-2">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="rounded-full p-2">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
      </Card>
    </motion.div>
  );
};
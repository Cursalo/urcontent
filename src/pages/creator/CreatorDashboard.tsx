import React, { useState, useEffect, memo } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { DashboardLoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  DollarSign,
  TrendingUp,
  MessageCircle,
  Star,
  LayoutDashboard,
  FileImage,
  Briefcase,
  BarChart3,
  CheckSquare,
  Palette,
  Menu,
  X,
  Moon,
  Sun,
  Bell,
  Settings,
  LogOut,
  Lock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHybridDashboard } from "@/hooks/useHybridDashboard";
import { toast } from "sonner";
import { DashboardErrorBoundary, CardErrorFallback } from "@/components/dashboard/DashboardErrorBoundary";
import { cn } from "@/lib/utils";
import { AnonymousAccessBanner } from "@/components/auth/AnonymousAccessBanner";
import { GuestModeInfo, creatorFeatures } from "@/components/auth/GuestModeInfo";
import { GuestModeBanner } from "@/components/auth/GuestModeBanner";

// Importar nuevos componentes
import { PanelPrincipal } from "@/components/creator/PanelPrincipal";
import { GestionContenido } from "@/components/creator/GestionContenido";
import { ColaboracionesKanban } from "@/components/creator/ColaboracionesKanban";
import { AnalyticsProfesionales } from "@/components/creator/AnalyticsProfesionales";
import { HerramientasProductividad } from "@/components/creator/HerramientasProductividad";
import { MiBrandKit } from "@/components/creator/MiBrandKit";
import socialMediaCreators from "@/assets/social-media-creators.jpg";
import fitnessCreators from "@/assets/fitness-creators.jpg";
import restaurantFood from "@/assets/restaurant-food-ugc.jpg";

const CreatorDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('panel');
  const [showGuestInfo, setShowGuestInfo] = useState(false);
  const [showGuestBanner, setShowGuestBanner] = useState(true);
  const { user, profile } = useAuth();
  const {
    loading,
    error,
    dashboardData,
    authType,
    userProfile: creatorProfile,
    collaborations,
    portfolio,
    metrics,
    analytics,
    refresh
  } = useHybridDashboard('creator');
  
  // Legacy state for component compatibility
  const [dashboardStats, setDashboardStats] = useState({
    monthlyEarnings: 0,
    activeCollaborations: 0,
    urScore: 0,
    totalFollowers: 0,
    completedCollaborations: 0,
    avgRating: 0
  });

  // Update legacy stats when dashboard data changes
  useEffect(() => {
    if (dashboardData && metrics) {
      setDashboardStats({
        monthlyEarnings: metrics.monthlyEarnings || 0,
        activeCollaborations: metrics.activeCollaborations || 0,
        urScore: metrics.urScore || 0,
        totalFollowers: metrics.totalFollowers || 0,
        completedCollaborations: metrics.completedCollaborations || 0,
        avgRating: metrics.avgRating || 0
      });
      
      console.log(`✅ Creator Dashboard: Loaded ${authType} data with ${collaborations.length} collaborations`);
      
      // Show success notification
      if (!loading && dashboardData) {
        toast.success('Dashboard loaded successfully!', {
          description: `Welcome back! You have ${metrics.activeCollaborations} active collaborations and ${portfolio.length} portfolio items.`,
          duration: 4000,
        });
      }
    }
  }, [dashboardData, metrics, authType, collaborations.length, portfolio.length, loading]);
  
  // Handle errors with toast notifications
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Format numbers for display
  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Preparar datos para los nuevos componentes
  const metricasPrincipales = [
    {
      titulo: "Ingresos del Mes",
      valor: formatCurrency(dashboardStats.monthlyEarnings),
      cambio: 22.5,
      esCrecimiento: true,
      objetivo: 50000,
      actual: dashboardStats.monthlyEarnings,
      icono: <DollarSign className="w-6 h-6 text-green-600" />,
      color: "bg-green-100"
    },
    {
      titulo: "Colaboraciones Activas",
      valor: dashboardStats.activeCollaborations.toString(),
      cambio: 15,
      esCrecimiento: true,
      objetivo: 10,
      actual: dashboardStats.activeCollaborations,
      icono: <Briefcase className="w-6 h-6 text-blue-600" />,
      color: "bg-blue-100"
    },
    {
      titulo: "URScore™",
      valor: `${dashboardStats.urScore}/100`,
      cambio: 2,
      esCrecimiento: true,
      objetivo: 100,
      actual: dashboardStats.urScore,
      icono: <Star className="w-6 h-6 text-yellow-600" />,
      color: "bg-yellow-100"
    },
    {
      titulo: "Seguidores Totales",
      valor: formatFollowers(dashboardStats.totalFollowers),
      cambio: 8.3,
      esCrecimiento: true,
      objetivo: 150000,
      actual: dashboardStats.totalFollowers,
      icono: <TrendingUp className="w-6 h-6 text-purple-600" />,
      color: "bg-purple-100"
    }
  ];

  // Datos para gráfico de ingresos
  const datosIngresos = [
    { mes: 'Ene', ingresos: 25000, objetivo: 30000 },
    { mes: 'Feb', ingresos: 32000, objetivo: 30000 },
    { mes: 'Mar', ingresos: 28000, objetivo: 35000 },
    { mes: 'Abr', ingresos: 41000, objetivo: 35000 },
    { mes: 'May', ingresos: 38000, objetivo: 40000 },
    { mes: 'Jun', ingresos: dashboardStats.monthlyEarnings, objetivo: 45000 }
  ];

  // Datos de contenido mock
  const contenidosMock = [
    {
      id: '1',
      titulo: 'Rutina de Skincare Matutina',
      tipo: 'video' as const,
      plataforma: 'instagram' as const,
      estado: 'publicado' as const,
      fechaPublicacion: '2024-01-15T10:00:00',
      miniatura: '/api/placeholder/400/400',
      vistas: 15420,
      engagement: 8.7
    },
    {
      id: '2',
      titulo: 'Outfit del Día - Casual Chic',
      tipo: 'carrusel' as const,
      plataforma: 'instagram' as const,
      estado: 'programado' as const,
      fechaPublicacion: '2024-01-20T14:00:00',
      miniatura: '/api/placeholder/400/400',
      engagement: 0
    },
    {
      id: '3',
      titulo: 'Review Restaurante Nuevo',
      tipo: 'video' as const,
      plataforma: 'tiktok' as const,
      estado: 'borrador' as const,
      miniatura: '/api/placeholder/400/400'
    }
  ];

  // Datos de colaboraciones para Kanban
  const columnasKanban = [
    {
      id: 'negociacion',
      titulo: 'En Negociación',
      color: 'bg-yellow-100',
      colaboraciones: collaborations.filter(c => c.status === 'pending').map(c => ({
        id: c.id,
        empresa: c.business_profile?.company_name || 'Empresa',
        titulo: c.title || 'Colaboración',
        valor: c.compensation_amount || 0,
        fechaEntrega: c.end_date || new Date().toISOString(),
        entregables: [],
        prioridad: 'media' as const,
        progreso: 0,
        mensajesSinLeer: Math.floor(Math.random() * 5)
      }))
    },
    {
      id: 'aceptadas',
      titulo: 'Aceptadas',
      color: 'bg-blue-100',
      colaboraciones: collaborations.filter(c => c.status === 'accepted').map(c => ({
        id: c.id,
        empresa: c.business_profile?.company_name || 'Empresa',
        titulo: c.title || 'Colaboración',
        valor: c.compensation_amount || 0,
        fechaEntrega: c.end_date || new Date().toISOString(),
        entregables: [],
        prioridad: 'alta' as const,
        progreso: 25
      }))
    },
    {
      id: 'en_progreso',
      titulo: 'En Progreso',
      color: 'bg-purple-100',
      colaboraciones: collaborations.filter(c => c.status === 'in_progress').map(c => ({
        id: c.id,
        empresa: c.business_profile?.company_name || 'Empresa',
        titulo: c.title || 'Colaboración',
        valor: c.compensation_amount || 0,
        fechaEntrega: c.end_date || new Date().toISOString(),
        entregables: [],
        prioridad: 'alta' as const,
        progreso: 60
      }))
    },
    {
      id: 'completadas',
      titulo: 'Completadas',
      color: 'bg-green-100',
      colaboraciones: collaborations.filter(c => c.status === 'completed').map(c => ({
        id: c.id,
        empresa: c.business_profile?.company_name || 'Empresa',
        titulo: c.title || 'Colaboración',
        valor: c.compensation_amount || 0,
        fechaEntrega: c.end_date || new Date().toISOString(),
        entregables: [],
        prioridad: 'baja' as const,
        progreso: 100
      }))
    }
  ];

  // Datos de analytics mock
  const metricasPorPlataforma = [
    {
      plataforma: 'Instagram',
      seguidores: 87000,
      crecimiento: 12.5,
      engagementRate: 6.8,
      alcancePromedio: 45000,
      mejorHorario: '20:00 - 22:00'
    },
    {
      plataforma: 'TikTok',
      seguidores: 32000,
      crecimiento: 28.3,
      engagementRate: 8.2,
      alcancePromedio: 28000,
      mejorHorario: '19:00 - 21:00'
    },
    {
      plataforma: 'YouTube',
      seguidores: 26000,
      crecimiento: 5.7,
      engagementRate: 4.9,
      alcancePromedio: 15000,
      mejorHorario: '18:00 - 20:00'
    }
  ];

  const datosEngagement = [
    { fecha: '01/01', engagement: 5.2 },
    { fecha: '02/01', engagement: 5.8 },
    { fecha: '03/01', engagement: 6.1 },
    { fecha: '04/01', engagement: 5.9 },
    { fecha: '05/01', engagement: 6.8 },
    { fecha: '06/01', engagement: 7.2 },
    { fecha: '07/01', engagement: 6.9 }
  ];

  const mejoresPublicaciones = [
    {
      titulo: 'Morning Routine 2024',
      imagen: '/api/placeholder/400/400',
      alcance: 125000,
      likes: 15420,
      comentarios: 342
    },
    {
      titulo: 'Haul de Verano',
      imagen: '/api/placeholder/400/400',
      alcance: 98000,
      likes: 12100,
      comentarios: 289
    },
    {
      titulo: 'Q&A con Seguidores',
      imagen: '/api/placeholder/400/400',
      alcance: 87000,
      likes: 9800,
      comentarios: 567
    }
  ];

  // Datos para herramientas de productividad
  const tareasMock = [
    {
      id: '1',
      titulo: 'Grabar contenido para Nike',
      completada: false,
      prioridad: 'alta' as const,
      fechaLimite: '2024-01-20',
      categoria: 'Contenido'
    },
    {
      id: '2',
      titulo: 'Editar video de YouTube',
      completada: false,
      prioridad: 'media' as const,
      fechaLimite: '2024-01-22',
      categoria: 'Edición'
    },
    {
      id: '3',
      titulo: 'Responder emails de colaboraciones',
      completada: true,
      prioridad: 'alta' as const,
      categoria: 'Comunicación'
    }
  ];

  const notasMock = [
    {
      id: '1',
      titulo: 'Ideas para contenido de febrero',
      contenido: 'Valentine\'s Day special, Rutinas de ejercicio, Colaboración con marca de café...',
      fecha: '2024-01-15',
      color: '#FFE4E1'
    },
    {
      id: '2',
      titulo: 'Feedback de la última campaña',
      contenido: 'La audiencia respondió muy bien al contenido lifestyle. Más contenido behind the scenes.',
      fecha: '2024-01-14',
      color: '#E6E6FA'
    }
  ];

  const recordatoriosMock = [
    {
      id: '1',
      titulo: 'Publicar en Instagram',
      fecha: '2024-01-18',
      hora: '20:00',
      repetir: 'diario' as const
    },
    {
      id: '2',
      titulo: 'Reunión con equipo de Nike',
      fecha: '2024-01-19',
      hora: '15:00',
      repetir: 'no' as const
    }
  ];

  // Datos para Brand Kit
  const brandKitData = {
    colores: [
      { nombre: 'Negro Principal', hex: '#000000', uso: 'Textos y elementos principales' },
      { nombre: 'Rosa Accent', hex: '#E91E63', uso: 'CTAs y elementos destacados' },
      { nombre: 'Gris Claro', hex: '#F5F5F5', uso: 'Fondos y elementos secundarios' }
    ],
    fuentes: [
      { nombre: 'Títulos', familia: 'Montserrat', peso: '700', uso: 'Títulos y encabezados' },
      { nombre: 'Cuerpo', familia: 'Open Sans', peso: '400', uso: 'Textos largos y descripciones' }
    ],
    logos: [
      { id: '1', nombre: 'Logo Principal', url: '/api/placeholder/200/200', tipo: 'principal' as const },
      { id: '2', nombre: 'Logo Icono', url: '/api/placeholder/200/200', tipo: 'icono' as const }
    ],
    biografia: 'Creator de contenido lifestyle | 🌟 Inspirando a vivir mejor cada día | 📍 CDMX | 📧 colaboraciones@example.com',
    enlaces: [
      { plataforma: 'Instagram', url: '@tucreador' },
      { plataforma: 'TikTok', url: '@tucreador' },
      { plataforma: 'YouTube', url: 'youtube.com/tucreador' }
    ]
  };

  const urScoreBreakdown = [
    { name: 'Content Quality', value: 96, color: '#E91E63' },
    { name: 'Engagement Rate', value: 94, color: '#9C27B0' },
    { name: 'Professionalism', value: 98, color: '#3F51B5' },
    { name: 'Delivery Time', value: 88, color: '#00BCD4' }
  ];

  const earningsData = [
    { month: 'Jan', earnings: 2100, collaborations: 5 },
    { month: 'Feb', earnings: 2650, collaborations: 7 },
    { month: 'Mar', earnings: 2890, collaborations: 6 },
    { month: 'Apr', earnings: 3100, collaborations: 8 },
    { month: 'May', earnings: 2950, collaborations: 7 },
    { month: 'Jun', earnings: 3240, collaborations: 8 }
  ];

  const engagementData = [
    { platform: 'Instagram', followers: 87000, engagement: 6.8, posts: 45 },
    { platform: 'TikTok', followers: 32000, engagement: 8.2, posts: 28 },
    { platform: 'YouTube', followers: 26000, engagement: 4.9, posts: 12 }
  ];

  // Safely process collaborations data with comprehensive error handling
  const recentCollaborations = React.useMemo(() => {
    try {
      if (!Array.isArray(collaborations)) {
        console.warn('CreatorDashboard: collaborations is not an array:', collaborations);
        return [];
      }
      
      return collaborations.slice(0, 4).map((collab, index) => {
        // Safe collaboration processing with fallbacks
        if (!collab || typeof collab !== 'object') {
          console.warn(`CreatorDashboard: Invalid collaboration at index ${index}:`, collab);
          return {
            id: `invalid-collab-${index}`,
            brand: "Unknown Business",
            status: "unknown",
            value: formatCurrency(0),
            date: "Unknown",
            type: "Collaboration",
            engagement: "No data"
          };
        }
        
        let deliverableTypes = "Collaboration";
        
        try {
          if (collab.deliverables && typeof collab.deliverables === 'string') {
            const parsed = JSON.parse(collab.deliverables);
            if (Array.isArray(parsed)) {
              deliverableTypes = parsed
                .map((d: any) => d?.type || 'Unknown')
                .filter(Boolean)
                .join(', ') || "Collaboration";
            }
          }
        } catch (e) {
          console.warn('Failed to parse deliverables:', collab.deliverables, e);
          deliverableTypes = collab.title || "Collaboration";
        }

        return {
          id: collab.id || `collab-${index}`,
          brand: collab.business_profile?.company_name || 
                 collab.business_profile?.user?.full_name || 
                 "Unknown Business",
          status: collab.status || "unknown",
          value: formatCurrency(collab.compensation_amount || 0),
          date: collab.created_at ? 
                new Date(collab.created_at).toLocaleDateString() : 
                "Unknown",
          type: deliverableTypes,
          engagement: collab.status === 'completed' 
            ? `${collab.reach || 0} reach, ${collab.clicks || 0} clicks` 
            : collab.status === 'in_progress' 
              ? "In progress" 
              : "Pending"
        };
      });
    } catch (error) {
      console.error('CreatorDashboard: Error processing collaborations:', error);
      return [];
    }
  }, [collaborations]);

  // Safely process upcoming deadlines with comprehensive error handling
  const upcomingDeadlines = React.useMemo(() => {
    try {
      if (!Array.isArray(collaborations)) {
        console.warn('CreatorDashboard: collaborations is not an array for deadlines');
        return [];
      }
      
      return collaborations
        .filter(collab => {
          if (!collab || typeof collab !== 'object') return false;
          return ['accepted', 'in_progress'].includes(collab.status) && 
                 collab.end_date &&
                 !isNaN(new Date(collab.end_date).getTime());
        })
        .sort((a, b) => {
          try {
            return new Date(a.end_date!).getTime() - new Date(b.end_date!).getTime();
          } catch (error) {
            console.warn('Error sorting deadlines:', error);
            return 0;
          }
        })
        .slice(0, 3)
        .map((collab, index) => {
          try {
            const daysUntilDeadline = Math.ceil(
              (new Date(collab.end_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );
            
            return {
              id: collab.id || `deadline-${index}`,
              brand: collab.business_profile?.company_name || "Unknown Business",
              task: collab.status === 'in_progress' ? "Final content delivery" : "Project start",
              date: new Date(collab.end_date!).toLocaleDateString(),
              priority: daysUntilDeadline <= 3 ? "high" : daysUntilDeadline <= 7 ? "medium" : "low"
            };
          } catch (error) {
            console.warn('Error processing deadline:', collab, error);
            return {
              id: `error-deadline-${index}`,
              brand: "Unknown Business",
              task: "Unknown task",
              date: "Unknown date",
              priority: "low" as const
            };
          }
        });
    } catch (error) {
      console.error('CreatorDashboard: Error processing deadlines:', error);
      return [];
    }
  }, [collaborations]);

  const portfolioImages = [
    {
      src: socialMediaCreators,
      alt: "Social media content creation",
      title: "Social Media Mastery",
      description: "Engaging content that drives results"
    },
    {
      src: fitnessCreators,
      alt: "Fitness content collaboration",
      title: "Fitness Collaboration",
      description: "Authentic lifestyle content"
    },
    {
      src: restaurantFood,
      alt: "Food photography and review",
      title: "Food & Lifestyle",
      description: "Mouth-watering food content"
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: "Completed", className: "bg-green-100 text-green-800" },
      in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-800" },
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      rejected: { label: "Rejected", className: "bg-red-100 text-red-800" }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: { label: "High", className: "bg-red-100 text-red-800" },
      medium: { label: "Medium", className: "bg-yellow-100 text-yellow-800" },
      low: { label: "Low", className: "bg-green-100 text-green-800" }
    };
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  // Loading state with enhanced skeleton
  if (loading) {
    return (
      <>
        <DashboardNav />
        <DashboardLoadingSkeleton />
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <DashboardNav />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline" 
              className="rounded-full"
            >
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is not authenticated - show anonymous access banner
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        
        {/* Anonymous Access Banner */}
        <AnonymousAccessBanner 
          userType="creator" 
          showFeatures={!showGuestInfo}
        />
        
        {/* Toggle Guest Info Button */}
        <div className="text-center mb-8">
          <Button
            variant="outline"
            onClick={() => setShowGuestInfo(!showGuestInfo)}
            className="rounded-full"
          >
            {showGuestInfo ? 'Ver Beneficios' : 'Ver Comparación de Funciones'}
          </Button>
        </div>
        
        {/* Guest Mode Feature Comparison */}
        {showGuestInfo && (
          <div className="max-w-4xl mx-auto px-4 mb-8">
            <GuestModeInfo features={creatorFeatures} />
          </div>
        )}
        
        {/* Limited Dashboard Preview */}
        <div className="max-w-7xl mx-auto px-4 pb-8">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h3 className="text-xl font-semibold mb-4">Vista Previa del Dashboard de Creador</h3>
            <p className="text-gray-600 mb-6">
              Explora cómo se ve el panel de control para creadores. Regístrate para acceder a todas las funciones.
            </p>
            
            {/* Mock Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {metricasPrincipales.map((metrica, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 opacity-75">
                  <div className={`${metrica.color} rounded-lg p-3 w-fit mb-3`}>
                    {metrica.icono}
                  </div>
                  <p className="text-sm text-gray-600">{metrica.titulo}</p>
                  <p className="text-2xl font-bold text-gray-900">{metrica.valor}</p>
                  <p className="text-xs text-gray-500 mt-1">Datos de ejemplo</p>
                </div>
              ))}
            </div>
            
            {/* Sample Content */}
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Crea una cuenta para empezar a gestionar tu contenido y colaboraciones
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'panel', label: 'Panel Principal', icon: LayoutDashboard },
    { id: 'contenido', label: 'Gestión de Contenido', icon: FileImage },
    { id: 'colaboraciones', label: 'Colaboraciones', icon: Briefcase },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'herramientas', label: 'Herramientas', icon: CheckSquare },
    { id: 'brandkit', label: 'Brand Kit', icon: Palette }
  ];

  return (
    <div className={cn("min-h-screen", darkMode ? "bg-gray-900" : "bg-gray-50")}>
      <DashboardNav />
      
      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 z-40",
          darkMode && "bg-gray-800 border-gray-700",
          sidebarOpen ? "w-64" : "w-20"
        )}>
          <div className="p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mb-4"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                      activeTab === item.id
                        ? "bg-black text-white"
                        : "hover:bg-gray-100 text-gray-700",
                      darkMode && activeTab !== item.id && "hover:bg-gray-700 text-gray-300"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                  </button>
                );
              })}
            </nav>
          </div>
          
          {sidebarOpen && (
            <div className="absolute bottom-4 left-4 right-4 space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
                className="w-full justify-start"
              >
                {darkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                {darkMode ? "Modo Claro" : "Modo Oscuro"}
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          )}
        </aside>
        
        {/* Main Content */}
        <main className={cn(
          "flex-1 transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-20"
        )}>
          {/* Guest Mode Banner for anonymous users */}
          {!user && showGuestBanner && (
            <GuestModeBanner 
              compact={true} 
              onDismiss={() => setShowGuestBanner(false)} 
            />
          )}
          
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                  </h1>
                  <p className="text-gray-500 mt-1">
                    Bienvenido de vuelta, {creatorProfile?.user?.full_name || user?.user_metadata?.full_name || 'Creator'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Bell className="w-5 h-5" />
                  </Button>
                  <Button className="bg-black hover:bg-gray-800 text-white rounded-full">
                    <Camera className="w-4 h-4 mr-2" />
                    Subir Contenido
                  </Button>
                </div>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="bg-white rounded-2xl shadow-sm">
              {activeTab === 'panel' && (
                <DashboardErrorBoundary componentName="PanelPrincipal" fallback={CardErrorFallback}>
                  <PanelPrincipal
                    metricas={metricasPrincipales}
                    datosIngresos={datosIngresos}
                    proximasColaboraciones={recentCollaborations.map(c => ({
                      id: c.id,
                      empresa: c.brand,
                      fecha: c.date,
                      tipo: c.type,
                      estado: c.status === 'completed' ? 'completada' : c.status === 'in_progress' ? 'en_progreso' : 'pendiente' as any
                    }))}
                    tareasPendientes={tareasMock.filter(t => !t.completada).length}
                  />
                </DashboardErrorBoundary>
              )}
              
              {activeTab === 'contenido' && (
                <DashboardErrorBoundary componentName="GestionContenido" fallback={CardErrorFallback}>
                  <GestionContenido contenidos={contenidosMock} />
                </DashboardErrorBoundary>
              )}
              
              {activeTab === 'colaboraciones' && (
                <DashboardErrorBoundary componentName="ColaboracionesKanban" fallback={CardErrorFallback}>
                  <ColaboracionesKanban columnas={columnasKanban} />
                </DashboardErrorBoundary>
              )}
              
              {activeTab === 'analytics' && (
                <DashboardErrorBoundary componentName="AnalyticsProfesionales" fallback={CardErrorFallback}>
                  <AnalyticsProfesionales
                    metricasPorPlataforma={metricasPorPlataforma}
                    datosEngagement={datosEngagement}
                    datosAudiencia={[]}
                    mejoresPublicaciones={mejoresPublicaciones}
                  />
                </DashboardErrorBoundary>
              )}
              
              {activeTab === 'herramientas' && (
                <DashboardErrorBoundary componentName="HerramientasProductividad" fallback={CardErrorFallback}>
                  <HerramientasProductividad
                    tareas={tareasMock}
                    notas={notasMock}
                    recordatorios={recordatoriosMock}
                  />
                </DashboardErrorBoundary>
              )}
              
              {activeTab === 'brandkit' && (
                <DashboardErrorBoundary componentName="MiBrandKit" fallback={CardErrorFallback}>
                  <MiBrandKit
                    colores={brandKitData.colores}
                    fuentes={brandKitData.fuentes}
                    logos={brandKitData.logos}
                    biografia={brandKitData.biografia}
                    enlaces={brandKitData.enlaces}
                  />
                </DashboardErrorBoundary>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreatorDashboard;
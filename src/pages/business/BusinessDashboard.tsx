import React, { useState, useEffect } from "react";
import { DashboardLoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import BusinessDashboardNav from "@/components/business/BusinessDashboardNav";
import PanelPrincipalBusiness from "@/components/business/PanelPrincipalBusiness";
import GestionCampanas from "@/components/business/GestionCampanas";
import BusquedaCreators from "@/components/business/BusquedaCreators";
import AnalyticsNegocio from "@/components/business/AnalyticsNegocio";
import CentroMensajes from "@/components/business/CentroMensajes";
import ConfiguracionNegocio from "@/components/business/ConfiguracionNegocio";
import { businessMockData } from "@/data/businessMockData";
import { useAuth } from "@/contexts/AuthContext";
import { useHybridDashboard } from "@/hooks/useHybridDashboard";
import { toast } from "sonner";
import { DashboardErrorBoundary } from "@/components/dashboard/DashboardErrorBoundary";

const BusinessDashboard = () => {
  const { user, profile } = useAuth();
  const [tabActiva, setTabActiva] = useState("panel-principal");
  const {
    loading,
    error,
    dashboardData,
    authType,
    userProfile: businessProfile,
    collaborations,
    portfolio,
    metrics,
    analytics,
    refresh
  } = useHybridDashboard('business');
  
  // Mensajes nuevos mock
  const mensajesNuevos = businessMockData.metricas.mensajesNuevos;

  // Mostrar notificación de bienvenida
  useEffect(() => {
    if (!loading && dashboardData) {
      toast.success('¡Panel de Negocio cargado exitosamente!', {
        description: `Bienvenido de vuelta. Tienes ${metrics?.activeCampaigns || 0} campañas activas.`,
        duration: 4000,
      });
    }
  }, [loading, dashboardData, metrics]);
  
  // Manejar errores
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Estado de carga
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="w-64 bg-white border-r border-gray-100">
          <DashboardLoadingSkeleton />
        </div>
        <div className="flex-1 p-8">
          <DashboardLoadingSkeleton />
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Renderizar contenido según la tab activa
  const renderContenido = () => {
    switch (tabActiva) {
      case 'panel-principal':
        return <PanelPrincipalBusiness />;
      case 'campanas':
        return <GestionCampanas />;
      case 'buscar-creators':
        return <BusquedaCreators />;
      case 'analytics':
        return <AnalyticsNegocio />;
      case 'mensajes':
        return <CentroMensajes />;
      case 'calendario':
        return (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <p className="text-gray-500 mb-4">Calendario en desarrollo</p>
              <p className="text-sm text-gray-400">Próximamente podrás gestionar todas tus fechas importantes aquí</p>
            </div>
          </div>
        );
      case 'configuracion':
        return <ConfiguracionNegocio />;
      case 'ayuda':
        return (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <p className="text-gray-500 mb-4">Centro de Ayuda</p>
              <p className="text-sm text-gray-400">¿Necesitas asistencia? Contáctanos en soporte@urcontent.com</p>
            </div>
          </div>
        );
      default:
        return <PanelPrincipalBusiness />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Navegación lateral */}
      <BusinessDashboardNav 
        activeTab={tabActiva} 
        onTabChange={setTabActiva}
        mensajesNuevos={mensajesNuevos}
      />
      
      {/* Contenido principal */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <DashboardErrorBoundary componentName={`BusinessDashboard-${tabActiva}`}>
            {renderContenido()}
          </DashboardErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
import React, { useState } from 'react';
import { AdminDashboardNav } from "@/components/admin/AdminDashboardNav";
import { PanelControlAdmin } from "@/components/admin/PanelControlAdmin";
import { GestionUsuariosAdmin } from "@/components/admin/GestionUsuariosAdmin";
import { GestionColaboracionesAdmin } from "@/components/admin/GestionColaboracionesAdmin";
import { AnalyticsPlataforma } from "@/components/admin/AnalyticsPlataforma";
import { ConfiguracionSistema } from "@/components/admin/ConfiguracionSistema";
import { CentroSoporteAdmin } from "@/components/admin/CentroSoporteAdmin";

const AdminDashboard = () => {
  const [seccionActiva, setSeccionActiva] = useState('panel');
  const [modoOscuro, setModoOscuro] = useState(false);

  const toggleModoOscuro = () => {
    setModoOscuro(!modoOscuro);
  };

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'panel':
        return <PanelControlAdmin />;
      case 'usuarios':
        return <GestionUsuariosAdmin />;
      case 'colaboraciones':
        return <GestionColaboracionesAdmin />;
      case 'analytics':
        return <AnalyticsPlataforma />;
      case 'configuracion':
        return <ConfiguracionSistema />;
      case 'soporte':
        return <CentroSoporteAdmin />;
      default:
        return <PanelControlAdmin />;
    }
  };

  return (
    <div className={`min-h-screen ${modoOscuro ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <AdminDashboardNav 
        activeSection={seccionActiva}
        setActiveSection={setSeccionActiva}
        darkMode={modoOscuro}
        toggleDarkMode={toggleModoOscuro}
      />
      
      {/* Main Content Area */}
      <div className="lg:ml-64 pt-[65px]">
        <div className="p-6">
          {renderSeccion()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
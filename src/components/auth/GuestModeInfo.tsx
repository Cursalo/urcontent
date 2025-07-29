import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  Check,
  X,
  Info
} from 'lucide-react';

interface Feature {
  name: string;
  guest: boolean;
  registered: boolean;
  description?: string;
}

interface GuestModeInfoProps {
  features: Feature[];
  className?: string;
}

export const GuestModeInfo: React.FC<GuestModeInfoProps> = ({ features, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-500" />
          Comparación de Funciones
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Descubre lo que puedes hacer con una cuenta gratuita
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left p-4 font-medium text-gray-900">Función</th>
              <th className="text-center p-4 font-medium text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>Modo Invitado</span>
                </div>
              </th>
              <th className="text-center p-4 font-medium text-gray-900">
                <div className="flex items-center justify-center gap-2">
                  <Unlock className="h-4 w-4" />
                  <span>Usuario Registrado</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4">
                  <div>
                    <p className="font-medium text-gray-900">{feature.name}</p>
                    {feature.description && (
                      <p className="text-sm text-gray-500 mt-0.5">{feature.description}</p>
                    )}
                  </div>
                </td>
                <td className="text-center p-4">
                  {feature.guest ? (
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-gray-300 mx-auto" />
                  )}
                </td>
                <td className="text-center p-4">
                  {feature.registered ? (
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-gray-300 mx-auto" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-6 bg-gray-50 border-t border-gray-100">
        <p className="text-sm text-gray-600 text-center">
          <Lock className="h-4 w-4 inline mr-1" />
          Desbloquea todas las funciones creando una cuenta gratuita
        </p>
      </div>
    </div>
  );
};

// Preset feature lists for different dashboard types
export const creatorFeatures: Feature[] = [
  {
    name: 'Ver panel de control',
    guest: true,
    registered: true,
    description: 'Explora el diseño y funciones del dashboard'
  },
  {
    name: 'Crear y gestionar contenido',
    guest: false,
    registered: true,
    description: 'Sube y organiza tu portfolio'
  },
  {
    name: 'Aceptar colaboraciones',
    guest: false,
    registered: true,
    description: 'Recibe ofertas de marcas'
  },
  {
    name: 'Ver analytics y métricas',
    guest: true,
    registered: true,
    description: 'Datos de ejemplo en modo invitado'
  },
  {
    name: 'Comunicarse con marcas',
    guest: false,
    registered: true,
    description: 'Chat y mensajería integrada'
  },
  {
    name: 'Recibir pagos',
    guest: false,
    registered: true,
    description: 'Cobra por tus colaboraciones'
  },
  {
    name: 'Personalizar perfil',
    guest: false,
    registered: true,
    description: 'Brand kit y configuración'
  }
];

export const businessFeatures: Feature[] = [
  {
    name: 'Explorar creadores',
    guest: true,
    registered: true,
    description: 'Ver perfiles de ejemplo'
  },
  {
    name: 'Crear campañas',
    guest: false,
    registered: true,
    description: 'Lanza colaboraciones con creadores'
  },
  {
    name: 'Contactar creadores',
    guest: false,
    registered: true,
    description: 'Envía propuestas y mensajes'
  },
  {
    name: 'Ver analytics',
    guest: true,
    registered: true,
    description: 'Métricas de ejemplo disponibles'
  },
  {
    name: 'Gestionar presupuestos',
    guest: false,
    registered: true,
    description: 'Control total de gastos'
  },
  {
    name: 'Calificar creadores',
    guest: false,
    registered: true,
    description: 'Deja reseñas y feedback'
  },
  {
    name: 'Exportar reportes',
    guest: false,
    registered: true,
    description: 'Descarga datos y métricas'
  }
];

export const adminFeatures: Feature[] = [
  {
    name: 'Ver estadísticas',
    guest: true,
    registered: true,
    description: 'Datos agregados de la plataforma'
  },
  {
    name: 'Gestionar usuarios',
    guest: false,
    registered: true,
    description: 'Administración completa'
  },
  {
    name: 'Moderar contenido',
    guest: false,
    registered: true,
    description: 'Revisar y aprobar publicaciones'
  },
  {
    name: 'Configurar sistema',
    guest: false,
    registered: true,
    description: 'Ajustes de la plataforma'
  },
  {
    name: 'Ver reportes',
    guest: true,
    registered: true,
    description: 'Reportes de ejemplo disponibles'
  },
  {
    name: 'Gestionar pagos',
    guest: false,
    registered: true,
    description: 'Supervisar transacciones'
  }
];
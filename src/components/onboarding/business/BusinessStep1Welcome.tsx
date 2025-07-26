import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, TrendingUp, Users, Star, Zap, Target, BarChart3 } from 'lucide-react';
import { BusinessOnboardingData } from '@/hooks/useOnboarding';

interface BusinessStep1WelcomeProps {
  data: BusinessOnboardingData;
  updateData: (updates: Partial<BusinessOnboardingData>) => void;
  errors: Record<string, string>;
  isLoading: boolean;
}

export const BusinessStep1Welcome: React.FC<BusinessStep1WelcomeProps> = ({
  data,
  updateData,
  errors
}) => {
  const benefits = [
    {
      icon: Users,
      title: 'Acceso a +2,500 Creadores',
      description: 'Conecta con influencers verificados en todas las categorías',
      color: 'text-blue-600'
    },
    {
      icon: Target,
      title: 'Matching Inteligente',
      description: 'Nuestro algoritmo encuentra creadores perfectos para tu marca',
      color: 'text-purple-600'
    },
    {
      icon: BarChart3,
      title: 'Analytics Avanzados',
      description: 'Mide el ROI de cada colaboración con métricas detalladas',
      color: 'text-green-600'
    },
    {
      icon: Zap,
      title: 'Gestión Simplificada',
      description: 'Maneja campañas completas desde una sola plataforma',
      color: 'text-orange-600'
    }
  ];

  const stats = [
    { label: 'Marcas Registradas', value: '850+', icon: TrendingUp },
    { label: 'Colaboraciones Exitosas', value: '25K+', icon: CheckCircle },
    { label: 'Alcance Promedio', value: '2.3M', icon: Users },
    { label: 'Satisfacción', value: '96%', icon: Star }
  ];

  const handleWatchVideo = () => {
    // This would open a video modal
    console.log('Opening welcome video...');
  };

  const handleMarkComplete = () => {
    updateData({ welcomeComplete: true });
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto mb-6 flex items-center justify-center">
          <span className="text-3xl">🚀</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Potenciá tu marca con contenido auténtico
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          URContent es la plataforma líder en Argentina que conecta marcas con creadores de contenido. 
          En solo 3 minutos tendrás acceso a miles de influencers verificados.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4 text-center border-2 hover:border-blue-200 transition-colors">
            <stat.icon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Benefits */}
      <div className="grid md:grid-cols-2 gap-6">
        {benefits.map((benefit, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-xl bg-gray-50`}>
                <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Success Stories */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Ver casos de éxito
            </h3>
            <p className="text-gray-600 text-sm">
              Descubre cómo otras marcas han crecido con URContent
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleWatchVideo}
            className="shrink-0"
          >
            Ver Video (2 min)
          </Button>
        </div>
      </Card>

      {/* What to Expect */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          ¿Qué configuraremos juntos?
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                1
              </Badge>
              <span className="text-sm text-gray-700">Información de tu empresa</span>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                2
              </Badge>
              <span className="text-sm text-gray-700">Datos de contacto y ubicación</span>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                3
              </Badge>
              <span className="text-sm text-gray-700">Presencia digital y logo</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                4
              </Badge>
              <span className="text-sm text-gray-700">Objetivos y presupuesto</span>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                5
              </Badge>
              <span className="text-sm text-gray-700">Preferencias de creadores</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-sm text-gray-700">¡Listo para colaborar!</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Confirmation */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              ¿Listo para comenzar?
            </h3>
            <p className="text-gray-600 text-sm">
              Este proceso toma solo 3-5 minutos y podrás pausar en cualquier momento
            </p>
          </div>
          <Button
            onClick={handleMarkComplete}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {data.welcomeComplete ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                ¡Confirmado!
              </>
            ) : (
              'Sí, empezar ahora'
            )}
          </Button>
        </div>
      </Card>

      {/* Error display */}
      {errors.general && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-700 text-sm">{errors.general}</p>
        </Card>
      )}
    </div>
  );
};
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Trophy, Users, Target, ArrowRight, Star, Gift } from 'lucide-react';
import { BusinessOnboardingData } from '@/hooks/useOnboarding';

interface BusinessStep7SuccessProps {
  data: BusinessOnboardingData;
  updateData: (updates: Partial<BusinessOnboardingData>) => void;
  errors: Record<string, string>;
  isLoading: boolean;
}

export const BusinessStep7Success: React.FC<BusinessStep7SuccessProps> = ({
  data,
  isLoading
}) => {
  const nextSteps = [
    {
      icon: Users,
      title: 'Explorar Creadores',
      description: 'Descubre creadores que encajan con tu marca',
      action: 'Ver Marketplace',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: Target,
      title: 'Crear Primera Campaña',
      description: 'Lanza tu primera colaboración con creadores',
      action: 'Crear Campaña',
      color: 'text-green-600 bg-green-50'
    },
    {
      icon: Star,
      title: 'Completar Perfil',
      description: 'Añade más detalles para mejor matching',
      action: 'Editar Perfil',
      color: 'text-purple-600 bg-purple-50'
    }
  ];

  const benefits = [
    'Acceso completo a +2,500 creadores verificados',
    'Herramientas de gestión de campañas',
    'Analytics y reportes detallados',
    'Soporte personalizado de nuestro equipo',
    'Matching inteligente basado en IA'
  ];

  return (
    <div className="space-y-8">
      {/* Success Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          ¡Felicitaciones! 🎉
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Tu perfil de <strong>{data.companyName}</strong> está configurado y listo. 
          Ahora puedes comenzar a conectar con los mejores creadores de contenido de Argentina.
        </p>
      </div>

      {/* Profile Summary */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Perfil Completado</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Empresa:</strong> {data.companyName}</p>
            <p><strong>Industria:</strong> {data.industry}</p>
            <p><strong>Contacto:</strong> {data.contactPerson}</p>
          </div>
          <div>
            <p><strong>Presupuesto:</strong> {data.marketingBudget}</p>
            <p><strong>Objetivos:</strong> {data.marketingObjectives?.length || 0} definidos</p>
            <p><strong>Preferencias:</strong> {data.preferredCreatorTypes?.length || 0} tipos de creadores</p>
          </div>
        </div>
      </Card>

      {/* Welcome Benefits */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Gift className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Lo que incluye tu membresía
          </h3>
        </div>
        <div className="space-y-3">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              <span className="text-gray-700">{benefit}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Next Steps */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 text-center">
          ¿Qué quieres hacer ahora?
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {nextSteps.map((step, index) => (
            <Card 
              key={index}
              className="p-6 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className={`w-12 h-12 rounded-full ${step.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <step.icon className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{step.title}</h4>
              <p className="text-gray-600 text-sm mb-4">{step.description}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full group-hover:bg-gray-50"
              >
                {step.action}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-4">
          💡 Tips para comenzar con éxito
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Para mejores resultados:</h4>
            <ul className="space-y-1 text-gray-700">
              <li>• Sé específico en tus briefs de campaña</li>
              <li>• Interactúa genuinamente con los creadores</li>
              <li>• Permite creatividad dentro de tu marca</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Recuerda:</h4>
            <ul className="space-y-1 text-gray-700">
              <li>• Las mejores colaboraciones son auténticas</li>
              <li>• Los resultados se ven a mediano plazo</li>
              <li>• Nuestro equipo está aquí para ayudarte</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Welcome Message */}
      <Card className="p-6 text-center bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          ¡Bienvenido a la comunidad URContent! 👋
        </h3>
        <p className="text-gray-600 mb-4">
          Únete a más de 850 marcas que han encontrado el éxito trabajando con creadores auténticos. 
          Estamos emocionados de ser parte de tu journey de crecimiento.
        </p>
        <div className="flex justify-center space-x-4">
          <Badge className="bg-purple-100 text-purple-800 px-3 py-1">
            +25,000 colaboraciones exitosas
          </Badge>
          <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
            96% satisfacción
          </Badge>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="p-6 text-center">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Finalizando configuración...</span>
          </div>
        </Card>
      )}
    </div>
  );
};
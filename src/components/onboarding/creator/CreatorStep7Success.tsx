import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Trophy, Star, DollarSign, ArrowRight, Gift, Heart } from 'lucide-react';
import { CreatorOnboardingData } from '@/hooks/useOnboarding';

interface CreatorStep7SuccessProps {
  data: CreatorOnboardingData;
  updateData: (updates: Partial<CreatorOnboardingData>) => void;
  errors: Record<string, string>;
  isLoading: boolean;
}

export const CreatorStep7Success: React.FC<CreatorStep7SuccessProps> = ({
  data,
  isLoading
}) => {
  const nextSteps = [
    {
      icon: Star,
      title: 'Completar Perfil',
      description: 'Añade más contenido a tu portfolio',
      action: 'Editar Perfil',
      color: 'text-purple-600 bg-purple-50'
    },
    {
      icon: DollarSign,
      title: 'Ver Oportunidades',
      description: 'Explora propuestas de marcas disponibles',
      action: 'Ver Propuestas',
      color: 'text-green-600 bg-green-50'
    },
    {
      icon: Heart,
      title: 'Conectar con Marcas',
      description: 'Envía propuestas a tus marcas favoritas',
      action: 'Explorar Marcas',
      color: 'text-pink-600 bg-pink-50'
    }
  ];

  const benefits = [
    'Perfil verificado con badge de autenticidad',
    'Acceso a +850 marcas registradas',
    'Herramientas de gestión de colaboraciones',
    'Pagos seguros y puntuales',
    'Soporte personalizado de nuestro equipo'
  ];

  return (
    <div className="space-y-8">
      {/* Success Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          ¡Bienvenido/a a URContent! 🎉
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Tu perfil de creador <strong>{data.username}</strong> está configurado y listo para recibir propuestas. 
          Las mejores marcas de Argentina ahora pueden descubrir tu talento.
        </p>
      </div>

      {/* Profile Summary */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Perfil de Creador Completado</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Nombre:</strong> {data.fullName}</p>
            <p><strong>Usuario:</strong> {data.username}</p>
            <p><strong>Instagram:</strong> {data.instagramHandle} {data.instagramVerified && '✅'}</p>
          </div>
          <div>
            <p><strong>Especialidades:</strong> {data.specialties?.length || 0} definidas</p>
            <p><strong>Portfolio:</strong> {data.portfolioItems?.length || 0} elementos</p>
            <p><strong>Tarifa:</strong> ${data.minRate} - ${data.maxRate}</p>
          </div>
        </div>
      </Card>

      {/* Welcome Benefits */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Gift className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Beneficios de ser parte de URContent
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
          💡 Tips para maximizar tus ingresos
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Para obtener más propuestas:</h4>
            <ul className="space-y-1 text-gray-700">
              <li>• Mantén tu portfolio actualizado</li>
              <li>• Responde rápido a las marcas</li>
              <li>• Sé profesional en tus comunicaciones</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Para crear mejor contenido:</h4>
            <ul className="space-y-1 text-gray-700">
              <li>• Mantén tu estilo auténtico</li>
              <li>• Lee bien los briefs de las marcas</li>
              <li>• Entrega siempre en tiempo y forma</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Welcome Message */}
      <Card className="p-6 text-center bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          ¡Bienvenido/a a la familia URContent! 👋
        </h3>
        <p className="text-gray-600 mb-4">
          Únete a más de 2,500 creadores que han monetizado su pasión trabajando con las mejores marcas. 
          Estamos emocionados de ser parte de tu journey creativo.
        </p>
        <div className="flex justify-center space-x-4">
          <Badge className="bg-green-100 text-green-800 px-3 py-1">
            +25,000 colaboraciones exitosas
          </Badge>
          <Badge className="bg-purple-100 text-purple-800 px-3 py-1">
            98% satisfacción creadores
          </Badge>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="p-6 text-center">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Finalizando configuración...</span>
          </div>
        </Card>
      )}
    </div>
  );
};
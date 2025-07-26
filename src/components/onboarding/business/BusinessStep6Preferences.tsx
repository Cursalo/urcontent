import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Heart, CheckCircle, AlertCircle, Star } from 'lucide-react';
import { BusinessOnboardingData } from '@/hooks/useOnboarding';

interface BusinessStep6PreferencesProps {
  data: BusinessOnboardingData;
  updateData: (updates: Partial<BusinessOnboardingData>) => void;
  errors: Record<string, string>;
  isLoading: boolean;
}

const creatorTypes = [
  { id: 'micro', label: 'Micro-Influencers', range: '1K-50K seguidores', icon: '👥', description: 'Alto engagement, audiencia nicho' },
  { id: 'macro', label: 'Macro-Influencers', range: '50K-500K seguidores', icon: '🌟', description: 'Mayor alcance, reconocimiento' },
  { id: 'mega', label: 'Mega-Influencers', range: '500K+ seguidores', icon: '🔥', description: 'Máximo alcance, celebrities' },
  { id: 'nano', label: 'Nano-Influencers', range: '1K-10K seguidores', icon: '💎', description: 'Audiencia muy comprometida' }
];

const collaborationTypes = [
  { id: 'posts', label: 'Posts en Feed', icon: '📸', description: 'Publicaciones principales' },
  { id: 'stories', label: 'Instagram Stories', icon: '📱', description: 'Contenido temporal' },
  { id: 'reels', label: 'Reels/Videos', icon: '🎥', description: 'Contenido dinámico' },
  { id: 'events', label: 'Eventos Presenciales', icon: '🎪', description: 'Apariciones físicas' },
  { id: 'ugc', label: 'Contenido UGC', icon: '✨', description: 'Para usar en tu marketing' },
  { id: 'reviews', label: 'Reviews/Testimonios', icon: '⭐', description: 'Reseñas auténticas' }
];

const brandValues = [
  { id: 'authenticity', label: 'Autenticidad', icon: '✨' },
  { id: 'quality', label: 'Calidad', icon: '💎' },
  { id: 'innovation', label: 'Innovación', icon: '🚀' },
  { id: 'sustainability', label: 'Sustentabilidad', icon: '🌱' },
  { id: 'inclusivity', label: 'Inclusividad', icon: '🤝' },
  { id: 'fun', label: 'Diversión', icon: '🎉' },
  { id: 'luxury', label: 'Lujo', icon: '👑' },
  { id: 'accessibility', label: 'Accesibilidad', icon: '❤️' }
];

export const BusinessStep6Preferences: React.FC<BusinessStep6PreferencesProps> = ({
  data,
  updateData,
  errors
}) => {
  const toggleItem = (type: 'preferredCreatorTypes' | 'collaborationTypes' | 'brandValues', item: string) => {
    const current = data[type] || [];
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    updateData({ [type]: updated });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
        <Heart className="w-4 h-4" />
        <span>Preferencias de colaboración</span>
      </div>

      {/* Creator Types */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">
          Tipos de Creadores Preferidos *
        </Label>
        <div className="grid md:grid-cols-2 gap-4">
          {creatorTypes.map((type) => (
            <Card
              key={type.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                data.preferredCreatorTypes?.includes(type.id)
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleItem('preferredCreatorTypes', type.id)}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{type.icon}</span>
                <div className="flex-1">
                  <h3 className={`font-medium ${
                    data.preferredCreatorTypes?.includes(type.id) ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {type.label}
                  </h3>
                  <p className="text-sm text-gray-600">{type.range}</p>
                  <p className={`text-xs ${
                    data.preferredCreatorTypes?.includes(type.id) ? 'text-blue-700' : 'text-gray-500'
                  }`}>
                    {type.description}
                  </p>
                </div>
                {data.preferredCreatorTypes?.includes(type.id) && (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                )}
              </div>
            </Card>
          ))}
        </div>
        {errors.preferredCreatorTypes && (
          <p className="text-red-600 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.preferredCreatorTypes}
          </p>
        )}
      </div>

      {/* Collaboration Types */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">
          Tipos de Colaboración *
        </Label>
        <div className="grid md:grid-cols-2 gap-3">
          {collaborationTypes.map((type) => (
            <Card
              key={type.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                data.collaborationTypes?.includes(type.id)
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleItem('collaborationTypes', type.id)}
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{type.icon}</span>
                <div className="flex-1">
                  <h3 className={`font-medium ${
                    data.collaborationTypes?.includes(type.id) ? 'text-green-900' : 'text-gray-900'
                  }`}>
                    {type.label}
                  </h3>
                  <p className={`text-sm ${
                    data.collaborationTypes?.includes(type.id) ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    {type.description}
                  </p>
                </div>
                {data.collaborationTypes?.includes(type.id) && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </div>
            </Card>
          ))}
        </div>
        {errors.collaborationTypes && (
          <p className="text-red-600 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.collaborationTypes}
          </p>
        )}
      </div>

      {/* Brand Values */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">
          Valores de tu Marca *
        </Label>
        <p className="text-gray-600 text-sm">
          Selecciona los valores que mejor representen tu marca para conectar con creadores afines
        </p>
        <div className="flex flex-wrap gap-3">
          {brandValues.map((value) => (
            <Badge
              key={value.id}
              variant={data.brandValues?.includes(value.id) ? "default" : "outline"}
              className={`cursor-pointer px-4 py-3 text-base ${
                data.brandValues?.includes(value.id)
                  ? 'bg-purple-500 hover:bg-purple-600 text-white'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => toggleItem('brandValues', value.id)}
            >
              <span className="mr-2">{value.icon}</span>
              {value.label}
            </Badge>
          ))}
        </div>
        {errors.brandValues && (
          <p className="text-red-600 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.brandValues}
          </p>
        )}
      </div>

      {/* Summary */}
      {(data.preferredCreatorTypes?.length > 0 || data.collaborationTypes?.length > 0 || data.brandValues?.length > 0) && (
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-purple-600" />
            Tu Perfil de Colaboración
          </h3>
          <div className="space-y-2 text-sm">
            {data.preferredCreatorTypes?.length > 0 && (
              <p><strong>Creadores:</strong> {data.preferredCreatorTypes.length} tipos seleccionados</p>
            )}
            {data.collaborationTypes?.length > 0 && (
              <p><strong>Colaboraciones:</strong> {data.collaborationTypes.length} formatos preferidos</p>
            )}
            {data.brandValues?.length > 0 && (
              <p><strong>Valores:</strong> {data.brandValues.length} valores de marca definidos</p>
            )}
          </div>
        </Card>
      )}

      <Alert className="bg-blue-50 border-blue-200">
        <CheckCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>¡Perfecto!</strong> Con esta información podremos sugerirte creadores que 
          encajen perfectamente con tu marca y objetivos. Podrás ajustar estas preferencias en cualquier momento.
        </AlertDescription>
      </Alert>

      {errors.general && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {errors.general}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
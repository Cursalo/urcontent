import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, AlertCircle } from 'lucide-react';
import { CreatorOnboardingData } from '@/hooks/useOnboarding';

interface CreatorStep4SpecialtiesProps {
  data: CreatorOnboardingData;
  updateData: (updates: Partial<CreatorOnboardingData>) => void;
  errors: Record<string, string>;
  isLoading: boolean;
}

const specialties = [
  'Lifestyle', 'Moda', 'Belleza', 'Fitness', 'Gastronomía', 'Viajes', 
  'Tecnología', 'Gaming', 'Música', 'Arte', 'Educación', 'Humor'
];

const contentTypes = [
  'Posts en Feed', 'Instagram Stories', 'Reels', 'Videos de YouTube', 
  'TikToks', 'IGTV', 'Live Streams', 'UGC'
];

export const CreatorStep4Specialties: React.FC<CreatorStep4SpecialtiesProps> = ({
  data,
  updateData,
  errors
}) => {
  const toggleSpecialty = (specialty: string) => {
    const current = data.specialties || [];
    const updated = current.includes(specialty)
      ? current.filter(s => s !== specialty)
      : current.length < 5 ? [...current, specialty] : current;
    updateData({ specialties: updated });
  };

  const toggleContentType = (type: string) => {
    const current = data.contentTypes || [];
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    updateData({ contentTypes: updated });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
        <Heart className="w-4 h-4" />
        <span>Especialidades de contenido</span>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base font-semibold">
            Especialidades *
          </Label>
          <p className="text-gray-600 text-sm">
            Selecciona hasta 5 especialidades que mejor describan tu contenido
          </p>
          <div className="flex flex-wrap gap-3">
            {specialties.map((specialty) => (
              <Badge
                key={specialty}
                variant={data.specialties?.includes(specialty) ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 ${
                  data.specialties?.includes(specialty)
                    ? 'bg-purple-500 hover:bg-purple-600 text-white'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => toggleSpecialty(specialty)}
              >
                {specialty}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            {data.specialties?.length || 0}/5 especialidades seleccionadas
          </p>
          {errors.specialties && (
            <p className="text-red-600 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.specialties}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <Label className="text-base font-semibold">
            Tipos de Contenido *
          </Label>
          <div className="grid md:grid-cols-2 gap-3">
            {contentTypes.map((type) => (
              <Card
                key={type}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  data.contentTypes?.includes(type)
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleContentType(type)}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${
                    data.contentTypes?.includes(type) ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {type}
                  </span>
                  {data.contentTypes?.includes(type) && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
          {errors.contentTypes && (
            <p className="text-red-600 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.contentTypes}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold">
            Biografía *
          </Label>
          <textarea
            placeholder="Cuéntanos sobre ti, tu estilo y lo que hace único tu contenido..."
            value={data.bio}
            onChange={(e) => updateData({ bio: e.target.value })}
            className={`w-full min-h-[120px] px-3 py-2 border border-input rounded-md text-base resize-none ${
              errors.bio ? 'border-red-500' : ''
            }`}
            rows={4}
          />
          <p className="text-xs text-gray-500">
            {data.bio?.length || 0}/500 caracteres
          </p>
          {errors.bio && (
            <p className="text-red-600 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.bio}
            </p>
          )}
        </div>
      </div>

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
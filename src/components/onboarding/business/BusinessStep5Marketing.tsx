import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Target, DollarSign, TrendingUp, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { BusinessOnboardingData } from '@/hooks/useOnboarding';

interface BusinessStep5MarketingProps {
  data: BusinessOnboardingData;
  updateData: (updates: Partial<BusinessOnboardingData>) => void;
  errors: Record<string, string>;
  isLoading: boolean;
}

const budgetRanges = [
  { value: '1k-5k', label: '$1,000 - $5,000', description: 'Ideal para comenzar', popular: false },
  { value: '5k-15k', label: '$5,000 - $15,000', description: 'Campañas regulares', popular: true },
  { value: '15k-50k', label: '$15,000 - $50,000', description: 'Estrategia robusta', popular: false },
  { value: '50k+', label: '$50,000+', description: 'Campañas premium', popular: false }
];

const marketingObjectives = [
  { id: 'brand-awareness', label: 'Reconocimiento de Marca', icon: '🎯', description: 'Dar a conocer tu marca' },
  { id: 'lead-generation', label: 'Generación de Leads', icon: '📈', description: 'Captar potenciales clientes' },
  { id: 'sales-conversion', label: 'Conversión de Ventas', icon: '💰', description: 'Aumentar ventas directas' },
  { id: 'engagement', label: 'Engagement', icon: '❤️', description: 'Interacción con audiencia' },
  { id: 'content-creation', label: 'Creación de Contenido', icon: '📸', description: 'Generar contenido de calidad' },
  { id: 'influencer-relations', label: 'Relaciones Públicas', icon: '🤝', description: 'Construir relaciones' }
];

const ageRanges = ['18-24', '25-34', '35-44', '45-54', '55+'];
const interests = [
  'Moda', 'Belleza', 'Fitness', 'Tecnología', 'Gastronomía', 'Viajes', 
  'Lifestyle', 'Música', 'Arte', 'Deportes', 'Salud', 'Educación'
];
const locations = [
  'CABA', 'Buenos Aires', 'Córdoba', 'Santa Fe', 'Mendoza', 
  'Tucumán', 'Entre Ríos', 'Salta', 'Misiones', 'Neuquén'
];

export const BusinessStep5Marketing: React.FC<BusinessStep5MarketingProps> = ({
  data,
  updateData,
  errors
}) => {
  const toggleObjective = (objectiveId: string) => {
    const current = data.marketingObjectives || [];
    const updated = current.includes(objectiveId)
      ? current.filter(id => id !== objectiveId)
      : [...current, objectiveId];
    updateData({ marketingObjectives: updated });
  };

  const toggleAudienceItem = (type: 'ageRanges' | 'interests' | 'locations', item: string) => {
    const current = data.targetAudience[type] || [];
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    updateData({
      targetAudience: {
        ...data.targetAudience,
        [type]: updated
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Progress indicator */}
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
        <Target className="w-4 h-4" />
        <span>Objetivos de marketing</span>
      </div>

      {/* Budget Range */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">
          Presupuesto Mensual para Influencer Marketing *
        </Label>
        <div className="grid md:grid-cols-2 gap-4">
          {budgetRanges.map((budget) => (
            <Card
              key={budget.value}
              className={`p-4 cursor-pointer transition-all hover:shadow-md relative ${
                data.marketingBudget === budget.value 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => updateData({ marketingBudget: budget.value })}
            >
              {budget.popular && (
                <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs">
                  Más Popular
                </Badge>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-semibold ${
                    data.marketingBudget === budget.value ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {budget.label}
                  </h3>
                  <p className={`text-sm ${
                    data.marketingBudget === budget.value ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    {budget.description}
                  </p>
                </div>
                {data.marketingBudget === budget.value && (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                )}
              </div>
            </Card>
          ))}
        </div>
        {errors.marketingBudget && (
          <p className="text-red-600 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.marketingBudget}
          </p>
        )}
        <p className="text-gray-500 text-sm">
          Este presupuesto nos ayuda a sugerir creadores en tu rango de inversión
        </p>
      </div>

      {/* Marketing Objectives */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">
          Objetivos de Marketing *
        </Label>
        <p className="text-gray-600 text-sm">
          Selecciona los objetivos principales de tus campañas (puedes elegir varios)
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          {marketingObjectives.map((objective) => (
            <Card
              key={objective.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                data.marketingObjectives?.includes(objective.id)
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleObjective(objective.id)}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{objective.icon}</span>
                <div className="flex-1">
                  <h3 className={`font-medium ${
                    data.marketingObjectives?.includes(objective.id) ? 'text-purple-900' : 'text-gray-900'
                  }`}>
                    {objective.label}
                  </h3>
                  <p className={`text-sm ${
                    data.marketingObjectives?.includes(objective.id) ? 'text-purple-700' : 'text-gray-600'
                  }`}>
                    {objective.description}
                  </p>
                </div>
                {data.marketingObjectives?.includes(objective.id) && (
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                )}
              </div>
            </Card>
          ))}
        </div>
        {errors['marketingObjectives'] && (
          <p className="text-red-600 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors['marketingObjectives']}
          </p>
        )}
      </div>

      {/* Target Audience */}
      <div className="space-y-6">
        <div>
          <Label className="text-base font-semibold">
            Audiencia Objetivo *
          </Label>
          <p className="text-gray-600 text-sm mt-1">
            Define las características de tu audiencia ideal para encontrar creadores con seguidores similares
          </p>
        </div>

        {/* Age Ranges */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Rangos de Edad</h4>
          <div className="flex flex-wrap gap-2">
            {ageRanges.map((age) => (
              <Badge
                key={age}
                variant={data.targetAudience.ageRanges?.includes(age) ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 ${
                  data.targetAudience.ageRanges?.includes(age)
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => toggleAudienceItem('ageRanges', age)}
              >
                {age} años
              </Badge>
            ))}
          </div>
          {errors['targetAudience.ageRanges'] && (
            <p className="text-red-600 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors['targetAudience.ageRanges']}
            </p>
          )}
        </div>

        {/* Interests */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Intereses</h4>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <Badge
                key={interest}
                variant={data.targetAudience.interests?.includes(interest) ? "default" : "outline"}
                className={`cursor-pointer px-3 py-2 ${
                  data.targetAudience.interests?.includes(interest)
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => toggleAudienceItem('interests', interest)}
              >
                {interest}
              </Badge>
            ))}
          </div>
          {errors['targetAudience.interests'] && (
            <p className="text-red-600 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors['targetAudience.interests']}
            </p>
          )}
        </div>

        {/* Locations */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Ubicaciones</h4>
          <div className="flex flex-wrap gap-2">
            {locations.map((location) => (
              <Badge
                key={location}
                variant={data.targetAudience.locations?.includes(location) ? "default" : "outline"}
                className={`cursor-pointer px-3 py-2 ${
                  data.targetAudience.locations?.includes(location)
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => toggleAudienceItem('locations', location)}
              >
                {location}
              </Badge>
            ))}
          </div>
          {errors['targetAudience.locations'] && (
            <p className="text-red-600 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors['targetAudience.locations']}
            </p>
          )}
        </div>
      </div>

      {/* Summary */}
      {(data.marketingBudget || data.marketingObjectives?.length > 0) && (
        <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Resumen de tu Estrategia
          </h3>
          <div className="space-y-2 text-sm">
            {data.marketingBudget && (
              <p><strong>Presupuesto:</strong> {budgetRanges.find(b => b.value === data.marketingBudget)?.label} mensual</p>
            )}
            {data.marketingObjectives?.length > 0 && (
              <p><strong>Objetivos:</strong> {data.marketingObjectives.length} seleccionados</p>
            )}
            {data.targetAudience.ageRanges?.length > 0 && (
              <p><strong>Audiencia:</strong> {data.targetAudience.ageRanges.length} rangos de edad, {data.targetAudience.interests?.length || 0} intereses</p>
            )}
          </div>
        </Card>
      )}

      {/* Error display */}
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
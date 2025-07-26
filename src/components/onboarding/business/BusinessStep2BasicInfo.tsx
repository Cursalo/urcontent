import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, AlertCircle, CheckCircle, Users, TrendingUp } from 'lucide-react';
import { BusinessOnboardingData } from '@/hooks/useOnboarding';
import { validateCuit } from '@/lib/validation';

interface BusinessStep2BasicInfoProps {
  data: BusinessOnboardingData;
  updateData: (updates: Partial<BusinessOnboardingData>) => void;
  errors: Record<string, string>;
  isLoading: boolean;
}

const industries = [
  'Gastronomía y Restaurantes',
  'Belleza y Estética', 
  'Fitness y Deporte',
  'Moda y Accesorios',
  'Tecnología',
  'Hogar y Decoración',
  'Automotriz',
  'Salud y Bienestar',
  'Entretenimiento',
  'Educación',
  'Turismo y Viajes',
  'Servicios Financieros',
  'Inmobiliario',
  'Retail y E-commerce',
  'Otros'
];

const companySizes = [
  { value: 'startup', label: 'Startup (1-10 empleados)', description: 'Empresa en crecimiento inicial' },
  { value: 'small', label: 'Pequeña (11-50 empleados)', description: 'Negocio establecido localmente' },
  { value: 'medium', label: 'Mediana (51-200 empleados)', description: 'Empresa con presencia regional' },
  { value: 'large', label: 'Grande (200+ empleados)', description: 'Corporación con alcance nacional' }
];

export const BusinessStep2BasicInfo: React.FC<BusinessStep2BasicInfoProps> = ({
  data,
  updateData,
  errors
}) => {
  const [cuitValidation, setCuitValidation] = useState<'valid' | 'invalid' | null>(null);

  const handleCuitChange = (value: string) => {
    // Format CUIT as user types
    let formattedCuit = value.replace(/[^\d]/g, '');
    if (formattedCuit.length >= 2) {
      formattedCuit = formattedCuit.substring(0, 2) + '-' + formattedCuit.substring(2);
    }
    if (formattedCuit.length >= 11) {
      formattedCuit = formattedCuit.substring(0, 11) + '-' + formattedCuit.substring(11, 12);
    }
    
    updateData({ cuit: formattedCuit });
    
    // Validate CUIT if complete
    if (formattedCuit.length === 13) {
      const isValid = validateCuit(formattedCuit);
      setCuitValidation(isValid ? 'valid' : 'invalid');
    } else {
      setCuitValidation(null);
    }
  };

  const getIndustryIcon = (industry: string) => {
    const iconMap: Record<string, string> = {
      'Gastronomía y Restaurantes': '🍽️',
      'Belleza y Estética': '💄',
      'Fitness y Deporte': '🏋️',
      'Moda y Accesorios': '👗',
      'Tecnología': '💻',
      'Hogar y Decoración': '🏠',
      'Automotriz': '🚗',
      'Salud y Bienestar': '🏥',
      'Entretenimiento': '🎬',
      'Educación': '📚',
      'Turismo y Viajes': '✈️',
      'Servicios Financieros': '💳',
      'Inmobiliario': '🏢',
      'Retail y E-commerce': '🛒',
      'Otros': '🏭'
    };
    return iconMap[industry] || '🏢';
  };

  return (
    <div className="space-y-8">
      {/* Progress indicator */}
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
        <Building2 className="w-4 h-4" />
        <span>Información básica de tu empresa</span>
      </div>

      {/* Company Name */}
      <div className="space-y-3">
        <Label htmlFor="companyName" className="text-base font-semibold">
          Nombre de la Empresa *
        </Label>
        <Input
          id="companyName"
          placeholder="Ej: Café La Esquina, Boutique Style, TechSolutions..."
          value={data.companyName}
          onChange={(e) => updateData({ companyName: e.target.value })}
          className={`text-lg p-4 ${errors.companyName ? 'border-red-500' : ''}`}
        />
        {errors.companyName && (
          <p className="text-red-600 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.companyName}
          </p>
        )}
        <p className="text-gray-500 text-sm">
          Este será el nombre que verán los creadores en tu perfil
        </p>
      </div>

      {/* CUIT */}
      <div className="space-y-3">
        <Label htmlFor="cuit" className="text-base font-semibold">
          CUIT de la Empresa *
        </Label>
        <div className="relative">
          <Input
            id="cuit"
            placeholder="XX-XXXXXXXX-X"
            value={data.cuit}
            onChange={(e) => handleCuitChange(e.target.value)}
            className={`text-lg p-4 pr-10 ${
              errors.cuit 
                ? 'border-red-500' 
                : cuitValidation === 'valid' 
                  ? 'border-green-500' 
                  : cuitValidation === 'invalid' 
                    ? 'border-red-500' 
                    : ''
            }`}
            maxLength={13}
          />
          {cuitValidation === 'valid' && (
            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
          )}
          {cuitValidation === 'invalid' && (
            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-600" />
          )}
        </div>
        {errors.cuit && (
          <p className="text-red-600 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.cuit}
          </p>
        )}
        {cuitValidation === 'invalid' && !errors.cuit && (
          <p className="text-red-600 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            CUIT inválido. Verifica el número ingresado.
          </p>
        )}
        <p className="text-gray-500 text-sm">
          Necesario para generar facturas y contratos legales
        </p>
      </div>

      {/* Industry */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          Industria o Sector *
        </Label>
        <Select value={data.industry} onValueChange={(value) => updateData({ industry: value })}>
          <SelectTrigger className={`text-lg p-4 h-auto ${errors.industry ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="Selecciona la industria de tu empresa">
              {data.industry && (
                <div className="flex items-center space-x-2">
                  <span>{getIndustryIcon(data.industry)}</span>
                  <span>{data.industry}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {industries.map((industry) => (
              <SelectItem key={industry} value={industry} className="py-3">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getIndustryIcon(industry)}</span>
                  <span>{industry}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.industry && (
          <p className="text-red-600 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.industry}
          </p>
        )}
        <p className="text-gray-500 text-sm">
          Nos ayuda a encontrar creadores especializados en tu sector
        </p>
      </div>

      {/* Company Size */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          Tamaño de la Empresa *
        </Label>
        <div className="grid md:grid-cols-2 gap-4">
          {companySizes.map((size) => (
            <Card
              key={size.value}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                data.companySize === size.value 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => updateData({ companySize: size.value })}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  data.companySize === size.value ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Users className={`w-5 h-5 ${
                    data.companySize === size.value ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${
                    data.companySize === size.value ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {size.label}
                  </h3>
                  <p className={`text-sm ${
                    data.companySize === size.value ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    {size.description}
                  </p>
                </div>
                {data.companySize === size.value && (
                  <CheckCircle className="w-5 h-5 text-blue-600 shrink-0" />
                )}
              </div>
            </Card>
          ))}
        </div>
        {errors.companySize && (
          <p className="text-red-600 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.companySize}
          </p>
        )}
      </div>

      {/* Info Card */}
      <Alert className="bg-blue-50 border-blue-200">
        <TrendingUp className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>¿Por qué necesitamos esta información?</strong> Nos ayuda a sugerir creadores 
          que han trabajado con empresas similares y a personalizar tu experiencia en la plataforma.
        </AlertDescription>
      </Alert>

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
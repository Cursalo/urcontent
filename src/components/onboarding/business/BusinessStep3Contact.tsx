import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, Mail, MapPin, User, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { BusinessOnboardingData } from '@/hooks/useOnboarding';

interface BusinessStep3ContactProps {
  data: BusinessOnboardingData;
  updateData: (updates: Partial<BusinessOnboardingData>) => void;
  errors: Record<string, string>;
  isLoading: boolean;
}

export const BusinessStep3Contact: React.FC<BusinessStep3ContactProps> = ({
  data,
  updateData,
  errors
}) => {
  const [emailValidation, setEmailValidation] = useState<'valid' | 'invalid' | null>(null);

  const handleEmailChange = (value: string) => {
    updateData({ email: value });
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value.length > 0) {
      setEmailValidation(emailRegex.test(value) ? 'valid' : 'invalid');
    } else {
      setEmailValidation(null);
    }
  };

  const handlePhoneChange = (value: string) => {
    // Format phone number as user types
    let formatted = value.replace(/[^\d+\s-]/g, '');
    
    // Add +54 prefix if starting with area code
    if (formatted.length > 0 && !formatted.startsWith('+') && !formatted.startsWith('0')) {
      if (formatted.startsWith('11') || formatted.startsWith('9')) {
        formatted = '+54 ' + formatted;
      }
    }
    
    updateData({ phone: formatted });
  };

  const popularLocations = [
    'CABA - Ciudad Autónoma de Buenos Aires',
    'Buenos Aires - Zona Norte',
    'Buenos Aires - Zona Oeste', 
    'Buenos Aires - Zona Sur',
    'Córdoba Capital',
    'Rosario, Santa Fe',
    'Mendoza Capital',
    'La Plata, Buenos Aires',
    'Mar del Plata, Buenos Aires',
    'Tucumán Capital'
  ];

  return (
    <div className="space-y-8">
      {/* Progress indicator */}
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
        <User className="w-4 h-4" />
        <span>Información de contacto</span>
      </div>

      {/* Contact Person */}
      <div className="space-y-3">
        <Label htmlFor="contactPerson" className="text-base font-semibold">
          Persona de Contacto *
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="contactPerson"
            placeholder="Nombre y apellido del responsable"
            value={data.contactPerson}
            onChange={(e) => updateData({ contactPerson: e.target.value })}
            className={`text-lg p-4 pl-12 ${errors.contactPerson ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.contactPerson && (
          <p className="text-red-600 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.contactPerson}
          </p>
        )}
        <p className="text-gray-500 text-sm">
          Esta persona recibirá notificaciones sobre colaboraciones
        </p>
      </div>

      {/* Email */}
      <div className="space-y-3">
        <Label htmlFor="email" className="text-base font-semibold">
          Email Corporativo *
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="contacto@empresa.com"
            value={data.email}
            onChange={(e) => handleEmailChange(e.target.value)}
            className={`text-lg p-4 pl-12 pr-12 ${
              errors.email 
                ? 'border-red-500' 
                : emailValidation === 'valid' 
                  ? 'border-green-500' 
                  : emailValidation === 'invalid' 
                    ? 'border-red-500' 
                    : ''
            }`}
          />
          {emailValidation === 'valid' && (
            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
          )}
          {emailValidation === 'invalid' && (
            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-600" />
          )}
        </div>
        {errors.email && (
          <p className="text-red-600 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.email}
          </p>
        )}
        <p className="text-gray-500 text-sm">
          Usaremos este email para comunicarnos contigo y enviarte propuestas
        </p>
      </div>

      {/* Phone */}
      <div className="space-y-3">
        <Label htmlFor="phone" className="text-base font-semibold">
          Teléfono de Contacto *
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="phone"
            placeholder="+54 11 1234-5678"
            value={data.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className={`text-lg p-4 pl-12 ${errors.phone ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.phone && (
          <p className="text-red-600 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.phone}
          </p>
        )}
        <p className="text-gray-500 text-sm">
          Para coordinar llamadas y comunicación directa con creadores
        </p>
      </div>

      {/* Address */}
      <div className="space-y-3">
        <Label htmlFor="address" className="text-base font-semibold">
          Dirección de la Empresa <span className="text-gray-500 font-normal">(Opcional)</span>
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
          <textarea
            id="address"
            placeholder="Av. Corrientes 1234, Piso 5, Oficina A&#10;Barrio Norte, CABA"
            value={data.address}
            onChange={(e) => updateData({ address: e.target.value })}
            className={`w-full min-h-[80px] px-3 py-2 pl-12 border border-input rounded-md text-lg resize-none ${
              errors.address ? 'border-red-500' : ''
            }`}
            rows={2}
          />
        </div>
        {errors.address && (
          <p className="text-red-600 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.address}
          </p>
        )}
        <p className="text-gray-500 text-sm">
          Útil para colaboraciones presenciales o envío de productos
        </p>
      </div>

      {/* Popular Locations Suggestion */}
      {!data.address && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Ubicaciones populares:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {popularLocations.slice(0, 6).map((location, index) => (
                  <button
                    key={index}
                    onClick={() => updateData({ address: location })}
                    className="text-left text-sm text-blue-700 hover:text-blue-900 hover:underline p-1 rounded"
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Contact Preferences */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Preferencias de Comunicación
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Notificaciones por Email</p>
                <p className="text-sm text-gray-600">Propuestas, mensajes y actualizaciones</p>
              </div>
            </div>
            <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Llamadas de Coordinación</p>
                <p className="text-sm text-gray-600">Solo para colaboraciones importantes</p>
              </div>
            </div>
            <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
      </Card>

      {/* Privacy Notice */}
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Tu privacidad es importante.</strong> Solo compartiremos tu información de contacto 
          con creadores una vez que apruebes una colaboración. Nunca vendemos datos a terceros.
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
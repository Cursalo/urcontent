import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  AlertCircle, 
  CheckCircle, 
  Info 
} from 'lucide-react';
import { BusinessOnboardingData } from '@/hooks/useOnboarding';

interface BusinessStep3ContactProps {
  data: BusinessOnboardingData;
  updateData: (updates: Partial<BusinessOnboardingData>) => void;
  errors: Record<string, string>;
  isLoading: boolean;
}

interface ValidationState {
  email: 'valid' | 'invalid' | null;
  phone: 'valid' | 'invalid' | null;
}

export const BusinessStep3Contact: React.FC<BusinessStep3ContactProps> = ({
  data,
  updateData,
  errors,
  isLoading
}) => {
  const [validation, setValidation] = useState<ValidationState>({
    email: null,
    phone: null
  });

  const handleEmailChange = (value: string): void => {
    updateData({ email: value });
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value.length > 0) {
      setValidation(prev => ({
        ...prev,
        email: emailRegex.test(value) ? 'valid' : 'invalid'
      }));
    } else {
      setValidation(prev => ({ ...prev, email: null }));
    }
  };

  const handlePhoneChange = (value: string): void => {
    // Format phone number as user types
    let formatted = value.replace(/[^\d+\s-]/g, '');
    
    // Add +54 prefix if starting with area code
    if (formatted.length > 0 && !formatted.startsWith('+') && !formatted.startsWith('0')) {
      if (formatted.startsWith('11') || formatted.startsWith('9')) {
        formatted = '+54 ' + formatted;
      }
    }
    
    updateData({ phone: formatted });
    
    // Phone validation
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    setValidation(prev => ({
      ...prev,
      phone: phoneRegex.test(formatted) ? 'valid' : 'invalid'
    }));
  };

  const handleContactPersonChange = (value: string): void => {
    updateData({ contactPerson: value });
  };

  const handleAddressChange = (value: string): void => {
    updateData({ address: value });
  };

  const selectPopularLocation = (location: string): void => {
    updateData({ address: location });
  };

  const popularLocations: string[] = [
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

  const getInputBorderClass = (fieldName: string, validationKey?: keyof ValidationState): string => {
    if (errors[fieldName]) {
      return 'border-gray-600 focus:border-gray-800';
    }
    
    if (validationKey && validation[validationKey] === 'valid') {
      return 'border-gray-400 focus:border-gray-600';
    }
    
    if (validationKey && validation[validationKey] === 'invalid') {
      return 'border-red-300 focus:border-red-500';
    }
    
    return 'border-gray-200 focus:border-gray-400';
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto p-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
        <User className="w-4 h-4" />
        <span className="font-medium">Información de contacto</span>
      </div>

      {/* Contact Person */}
      <div className="space-y-3">
        <Label htmlFor="contactPerson" className="text-base font-semibold text-gray-900">
          Persona de Contacto *
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="contactPerson"
            placeholder="Nombre y apellido del responsable"
            value={data.contactPerson || ''}
            onChange={(e) => handleContactPersonChange(e.target.value)}
            disabled={isLoading}
            className={`
              text-lg p-4 pl-12 rounded-sm transition-colors duration-200
              ${getInputBorderClass('contactPerson')}
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
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
        <Label htmlFor="email" className="text-base font-semibold text-gray-900">
          Email Corporativo *
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="contacto@empresa.com"
            value={data.email || ''}
            onChange={(e) => handleEmailChange(e.target.value)}
            disabled={isLoading}
            className={`
              text-lg p-4 pl-12 pr-12 rounded-sm transition-colors duration-200
              ${getInputBorderClass('email', 'email')}
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          />
          {validation.email === 'valid' && (
            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
          )}
          {validation.email === 'invalid' && (
            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
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
        <Label htmlFor="phone" className="text-base font-semibold text-gray-900">
          Teléfono de Contacto *
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="phone"
            placeholder="+54 11 1234-5678"
            value={data.phone || ''}
            onChange={(e) => handlePhoneChange(e.target.value)}
            disabled={isLoading}
            className={`
              text-lg p-4 pl-12 rounded-sm transition-colors duration-200
              ${getInputBorderClass('phone', 'phone')}
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          />
          {validation.phone === 'valid' && (
            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
          )}
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
        <Label htmlFor="address" className="text-base font-semibold text-gray-900">
          Dirección de la Empresa{' '}
          <span className="text-gray-500 font-normal">(Opcional)</span>
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
          <textarea
            id="address"
            placeholder="Av. Corrientes 1234, Piso 5, Oficina A&#10;Barrio Norte, CABA"
            value={data.address || ''}
            onChange={(e) => handleAddressChange(e.target.value)}
            disabled={isLoading}
            className={`
              w-full min-h-[80px] px-3 py-2 pl-12 border rounded-sm text-lg resize-none
              transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200
              ${getInputBorderClass('address')}
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
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
        <Card className="p-4 bg-gray-50 border-gray-200 rounded-sm">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-gray-700 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-3">
                Ubicaciones populares:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {popularLocations.slice(0, 6).map((location, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectPopularLocation(location)}
                    disabled={isLoading}
                    className={`
                      text-left text-sm text-gray-700 hover:text-gray-900 
                      hover:bg-gray-100 p-2 rounded-sm transition-colors duration-200
                      ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
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
      <Card className="p-6 border-gray-200 rounded-sm">
        <h3 className="font-semibold text-gray-900 mb-4">
          Preferencias de Comunicación
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-sm">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Notificaciones por Email</p>
                <p className="text-sm text-gray-600">
                  Propuestas, mensajes y actualizaciones
                </p>
              </div>
            </div>
            <div className="w-6 h-6 rounded-sm bg-gray-800 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-sm">
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Llamadas de Coordinación</p>
                <p className="text-sm text-gray-600">
                  Solo para colaboraciones importantes
                </p>
              </div>
            </div>
            <div className="w-6 h-6 rounded-sm bg-gray-800 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </Card>

      {/* Privacy Notice */}
      <Alert className="bg-gray-50 border-gray-200 rounded-sm">
        <CheckCircle className="h-4 w-4 text-gray-700" />
        <AlertDescription className="text-gray-900">
          <strong>Tu privacidad es importante.</strong> Solo compartiremos tu información 
          de contacto con creadores una vez que apruebes una colaboración. Nunca vendemos 
          datos a terceros.
        </AlertDescription>
      </Alert>

      {/* General Error Display */}
      {errors.general && (
        <Alert className="bg-red-50 border-red-200 rounded-sm">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {errors.general}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
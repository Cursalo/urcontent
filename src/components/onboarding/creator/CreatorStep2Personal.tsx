import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Mail, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { CreatorOnboardingData } from '@/hooks/useOnboarding';

interface CreatorStep2PersonalProps {
  data: CreatorOnboardingData;
  updateData: (updates: Partial<CreatorOnboardingData>) => void;
  errors: Record<string, string>;
  isLoading: boolean;
}

export const CreatorStep2Personal: React.FC<CreatorStep2PersonalProps> = ({
  data,
  updateData,
  errors
}) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
        <User className="w-4 h-4" />
        <span>Información personal</span>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="fullName" className="text-base font-semibold">
            Nombre Completo *
          </Label>
          <Input
            id="fullName"
            placeholder="Tu nombre real"
            value={data.fullName}
            onChange={(e) => updateData({ fullName: e.target.value })}
            className={`text-lg p-4 ${errors.fullName ? 'border-red-500' : ''}`}
          />
          {errors.fullName && (
            <p className="text-red-600 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.fullName}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="username" className="text-base font-semibold">
            Nombre Artístico/Usuario *
          </Label>
          <Input
            id="username"
            placeholder="Como te conocen en redes"
            value={data.username}
            onChange={(e) => updateData({ username: e.target.value })}
            className={`text-lg p-4 ${errors.username ? 'border-red-500' : ''}`}
          />
          {errors.username && (
            <p className="text-red-600 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.username}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="email" className="text-base font-semibold">
            Email *
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={data.email}
              onChange={(e) => updateData({ email: e.target.value })}
              className={`text-lg p-4 pl-12 ${errors.email ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.email && (
            <p className="text-red-600 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="phone" className="text-base font-semibold">
            Teléfono *
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="phone"
              placeholder="+54 11 1234-5678"
              value={data.phone}
              onChange={(e) => updateData({ phone: e.target.value })}
              className={`text-lg p-4 pl-12 ${errors.phone ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.phone && (
            <p className="text-red-600 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <CheckCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Tu privacidad es importante.</strong> Solo compartiremos tu información 
          con marcas después de que apruebes una colaboración.
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
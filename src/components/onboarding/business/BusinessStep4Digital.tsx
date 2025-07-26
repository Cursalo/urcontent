import React, { useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, Instagram, Upload, CheckCircle, AlertCircle, Image, X } from 'lucide-react';
import { BusinessOnboardingData } from '@/hooks/useOnboarding';

interface BusinessStep4DigitalProps {
  data: BusinessOnboardingData;
  updateData: (updates: Partial<BusinessOnboardingData>) => void;
  errors: Record<string, string>;
  isLoading: boolean;
}

export const BusinessStep4Digital: React.FC<BusinessStep4DigitalProps> = ({
  data,
  updateData,
  errors
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(data.logoUrl || '');

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setPreviewUrl(url);
      };
      reader.readAsDataURL(file);
      updateData({ logoFile: file });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const removeLogo = () => {
    setPreviewUrl('');
    updateData({ logoFile: null, logoUrl: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatInstagramHandle = (value: string) => {
    let formatted = value.replace(/[^a-zA-Z0-9._]/g, '');
    if (formatted && !formatted.startsWith('@')) {
      formatted = '@' + formatted;
    }
    return formatted;
  };

  return (
    <div className="space-y-8">
      {/* Progress indicator */}
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
        <Globe className="w-4 h-4" />
        <span>Presencia digital</span>
      </div>

      {/* Website */}
      <div className="space-y-3">
        <Label htmlFor="website" className="text-base font-semibold">
          Sitio Web <span className="text-gray-500 font-normal">(Opcional)</span>
        </Label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="website"
            placeholder="https://www.empresa.com"
            value={data.website}
            onChange={(e) => updateData({ website: e.target.value })}
            className={`text-lg p-4 pl-12 ${errors.website ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.website && (
          <p className="text-red-600 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.website}
          </p>
        )}
        <p className="text-gray-500 text-sm">
          Los creadores podrán conocer mejor tu marca y productos
        </p>
      </div>

      {/* Instagram */}
      <div className="space-y-3">
        <Label htmlFor="instagram" className="text-base font-semibold">
          Instagram <span className="text-gray-500 font-normal">(Opcional)</span>
        </Label>
        <div className="relative">
          <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="instagram"
            placeholder="@empresa"
            value={data.instagram}
            onChange={(e) => updateData({ instagram: formatInstagramHandle(e.target.value) })}
            className={`text-lg p-4 pl-12 ${errors.instagram ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.instagram && (
          <p className="text-red-600 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.instagram}
          </p>
        )}
        <p className="text-gray-500 text-sm">
          Ayuda a los creadores a entender tu estilo y audiencia
        </p>
      </div>

      {/* Logo Upload */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">
          Logo de la Empresa <span className="text-gray-500 font-normal">(Opcional)</span>
        </Label>
        
        {!previewUrl ? (
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sube el logo de tu empresa
            </h3>
            <p className="text-gray-600 mb-4">
              Arrastra una imagen aquí o haz clic para seleccionar
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="mb-2"
            >
              <Image className="w-4 h-4 mr-2" />
              Seleccionar Imagen
            </Button>
            <p className="text-xs text-gray-500">
              PNG, JPG o SVG hasta 5MB. Recomendado: 300x300px
            </p>
          </div>
        ) : (
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Logo preview"
                  className="w-20 h-20 object-contain rounded-lg border"
                />
                <button
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-900">Logo cargado correctamente</span>
                </div>
                <p className="text-sm text-gray-600">
                  Se mostrará en tu perfil y en las propuestas a creadores
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Cambiar
              </Button>
            </div>
          </Card>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />
      </div>

      {/* Benefits of digital presence */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <h3 className="font-semibold text-gray-900 mb-4">
          ¿Por qué es importante tu presencia digital?
        </h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <p className="text-gray-700">
              <strong>Mayor credibilidad:</strong> Los creadores pueden conocer tu marca antes de colaborar
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <p className="text-gray-700">
              <strong>Mejor matching:</strong> Encontramos creadores que encajan con tu estilo
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <p className="text-gray-700">
              <strong>Más propuestas:</strong> Los creadores prefieren marcas con presencia establecida
            </p>
          </div>
        </div>
      </Card>

      {/* Skip notice */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>¿No tienes estos datos ahora?</strong> No te preocupes, puedes completar 
          tu presencia digital más tarde desde tu perfil. Lo importante es que empieces a conectar con creadores.
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
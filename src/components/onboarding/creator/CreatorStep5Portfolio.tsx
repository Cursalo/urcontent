import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, DollarSign, AlertCircle } from 'lucide-react';
import { CreatorOnboardingData } from '@/hooks/useOnboarding';

interface CreatorStep5PortfolioProps {
  data: CreatorOnboardingData;
  updateData: (updates: Partial<CreatorOnboardingData>) => void;
  errors: Record<string, string>;
  isLoading: boolean;
}

export const CreatorStep5Portfolio: React.FC<CreatorStep5PortfolioProps> = ({
  data,
  updateData,
  errors
}) => {
  const addPortfolioItem = () => {
    const newItem = {
      title: '',
      description: '',
      mediaUrl: '',
      platform: 'instagram'
    };
    updateData({
      portfolioItems: [...(data.portfolioItems || []), newItem]
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
        <Camera className="w-4 h-4" />
        <span>Portfolio y tarifas</span>
      </div>

      {/* Portfolio Items */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">
          Portfolio (mínimo 3 elementos) *
        </Label>
        
        {(data.portfolioItems || []).length === 0 && (
          <Card className="p-8 text-center border-dashed border-2">
            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-2">
              Agrega tu mejor contenido
            </h3>
            <p className="text-gray-600 mb-4">
              Sube ejemplos de tu trabajo para mostrar tu estilo
            </p>
            <Button onClick={addPortfolioItem}>
              Agregar Primer Elemento
            </Button>
          </Card>
        )}

        {(data.portfolioItems || []).map((item, index) => (
          <Card key={index} className="p-4">
            <div className="space-y-3">
              <Input
                placeholder="Título del contenido"
                value={item.title}
                onChange={(e) => {
                  const updated = [...(data.portfolioItems || [])];
                  updated[index] = { ...item, title: e.target.value };
                  updateData({ portfolioItems: updated });
                }}
              />
              <Input
                placeholder="URL del contenido"
                value={item.mediaUrl}
                onChange={(e) => {
                  const updated = [...(data.portfolioItems || [])];
                  updated[index] = { ...item, mediaUrl: e.target.value };
                  updateData({ portfolioItems: updated });
                }}
              />
            </div>
          </Card>
        ))}

        {(data.portfolioItems || []).length > 0 && (data.portfolioItems || []).length < 6 && (
          <Button variant="outline" onClick={addPortfolioItem} className="w-full">
            Agregar Otro Elemento
          </Button>
        )}

        {errors['portfolioItems'] && (
          <p className="text-red-600 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors['portfolioItems']}
          </p>
        )}
      </div>

      {/* Rates */}
      <div className="space-y-6">
        <div>
          <Label className="text-base font-semibold">
            Tarifas de Colaboración *
          </Label>
          <p className="text-gray-600 text-sm mt-1">
            Define tu rango de precios para diferentes tipos de colaboraciones
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label htmlFor="minRate">Tarifa Mínima (ARS)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="minRate"
                type="number"
                placeholder="1000"
                value={data.minRate || ''}
                onChange={(e) => updateData({ minRate: parseInt(e.target.value) || 0 })}
                className={`pl-10 ${errors.minRate ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.minRate && (
              <p className="text-red-600 text-sm">{errors.minRate}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="maxRate">Tarifa Máxima (ARS)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="maxRate"
                type="number"
                placeholder="5000"
                value={data.maxRate || ''}
                onChange={(e) => updateData({ maxRate: parseInt(e.target.value) || 0 })}
                className={`pl-10 ${errors.maxRate ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.maxRate && (
              <p className="text-red-600 text-sm">{errors.maxRate}</p>
            )}
          </div>
        </div>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Tip:</strong> Puedes ajustar tus tarifas individualmente para cada propuesta. 
          Estos son solo rangos de referencia para las marcas.
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
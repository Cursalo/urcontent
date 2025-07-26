import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Instagram, Youtube, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { CreatorOnboardingData } from '@/hooks/useOnboarding';
import { verifyInstagramHandle } from '@/lib/validation';

interface CreatorStep3SocialProps {
  data: CreatorOnboardingData;
  updateData: (updates: Partial<CreatorOnboardingData>) => void;
  errors: Record<string, string>;
  isLoading: boolean;
}

const followerRanges = [
  { value: '1k-5k', label: '1K - 5K seguidores' },
  { value: '5k-10k', label: '5K - 10K seguidores' },
  { value: '10k-50k', label: '10K - 50K seguidores' },
  { value: '50k-100k', label: '50K - 100K seguidores' },
  { value: '100k+', label: '100K+ seguidores' }
];

export const CreatorStep3Social: React.FC<CreatorStep3SocialProps> = ({
  data,
  updateData,
  errors
}) => {
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'failed' | null>(null);

  const handleInstagramVerification = async () => {
    if (!data.instagramHandle || data.instagramHandle.length < 3) return;
    
    setVerifying(true);
    setVerificationStatus('pending');
    
    try {
      const result = await verifyInstagramHandle(data.instagramHandle);
      
      if (result.exists) {
        updateData({
          instagramVerified: true,
          instagramFollowers: result.followers || 0
        });
        setVerificationStatus('verified');
      } else {
        setVerificationStatus('failed');
      }
    } catch (error) {
      setVerificationStatus('failed');
    } finally {
      setVerifying(false);
    }
  };

  const formatHandle = (value: string, platform: string) => {
    let formatted = value.replace(/[^a-zA-Z0-9._]/g, '');
    if (formatted && !formatted.startsWith('@')) {
      formatted = '@' + formatted;
    }
    return formatted;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
        <Instagram className="w-4 h-4" />
        <span>Verificación de redes sociales</span>
      </div>

      {/* Instagram */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">
          Instagram *
        </Label>
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="@tuusuario"
              value={data.instagramHandle}
              onChange={(e) => updateData({ instagramHandle: formatHandle(e.target.value, 'instagram') })}
              className={`text-lg p-4 pl-12 ${errors.instagramHandle ? 'border-red-500' : data.instagramVerified ? 'border-green-500' : ''}`}
            />
            {data.instagramVerified && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
            )}
          </div>
          <Button
            onClick={handleInstagramVerification}
            disabled={verifying || !data.instagramHandle || data.instagramHandle.length < 3}
            variant={data.instagramVerified ? "outline" : "default"}
            className="px-6"
          >
            {verifying ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : data.instagramVerified ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Verificado
              </>
            ) : (
              'Verificar'
            )}
          </Button>
        </div>
        
        {verificationStatus === 'verified' && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ¡Perfil verificado! Encontramos {data.instagramFollowers?.toLocaleString()} seguidores.
            </AlertDescription>
          </Alert>
        )}
        
        {verificationStatus === 'failed' && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              No pudimos verificar este perfil. Verifica que el usuario sea correcto y que el perfil sea público.
            </AlertDescription>
          </Alert>
        )}
        
        {errors.instagramHandle && (
          <p className="text-red-600 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.instagramHandle}
          </p>
        )}
      </div>

      {/* TikTok */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          TikTok <span className="text-gray-500 font-normal">(Opcional)</span>
        </Label>
        <Input
          placeholder="@tuusuario"
          value={data.tiktokHandle}
          onChange={(e) => updateData({ tiktokHandle: formatHandle(e.target.value, 'tiktok') })}
          className="text-lg p-4"
        />
      </div>

      {/* YouTube */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          YouTube <span className="text-gray-500 font-normal">(Opcional)</span>
        </Label>
        <div className="relative">
          <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Canal de YouTube"
            value={data.youtubeHandle}
            onChange={(e) => updateData({ youtubeHandle: e.target.value })}
            className="text-lg p-4 pl-12"
          />
        </div>
      </div>

      {/* Followers Count */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          Rango de Seguidores (Instagram) *
        </Label>
        <Select value={data.followersCount} onValueChange={(value) => updateData({ followersCount: value })}>
          <SelectTrigger className={`text-lg p-4 h-auto ${errors.followersCount ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="Selecciona tu rango de seguidores" />
          </SelectTrigger>
          <SelectContent>
            {followerRanges.map((range) => (
              <SelectItem key={range.value} value={range.value} className="py-3">
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.followersCount && (
          <p className="text-red-600 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.followersCount}
          </p>
        )}
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>¿Por qué verificamos tus redes?</strong> Necesitamos confirmar que eres el dueño 
          real de estas cuentas para proteger tanto a creadores como a marcas de perfiles falsos.
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
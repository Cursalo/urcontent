import React from 'react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, X } from 'lucide-react';

interface GuestModeBannerProps {
  onDismiss?: () => void;
  compact?: boolean;
}

export const GuestModeBanner: React.FC<GuestModeBannerProps> = ({ 
  onDismiss,
  compact = false 
}) => {
  if (compact) {
    return (
      <div className="fixed top-16 left-0 right-0 z-40 bg-yellow-50 border-b border-yellow-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              <span className="font-medium">Modo Invitado:</span> Funciones limitadas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/registro">
              <Button size="sm" variant="ghost" className="text-yellow-800 hover:bg-yellow-100">
                Registrarse
              </Button>
            </Link>
            {onDismiss && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDismiss}
                className="text-yellow-800 hover:bg-yellow-100 p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Alert className="mb-6 border-yellow-200 bg-yellow-50">
      <Info className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="text-yellow-800">
          <span className="font-medium">Estás en Modo Invitado.</span> Puedes explorar la plataforma, pero algunas funciones están deshabilitadas.
          {' '}
          <Link to="/login" className="underline font-medium hover:text-yellow-900">
            Inicia sesión
          </Link> o {' '}
          <Link to="/registro" className="underline font-medium hover:text-yellow-900">
            crea una cuenta gratuita
          </Link> para acceder a todas las funciones.
        </div>
        {onDismiss && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDismiss}
            className="ml-4"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};
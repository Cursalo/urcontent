import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
}

export const LoadingSpinner = ({ 
  className, 
  size = "md", 
  text = "Cargando..." 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  // Add timeout for debugging infinite loading
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn('LoadingSpinner ha estado visible por más de 15 segundos. Esto podría indicar un estado de carga infinito.');
    }, 15000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col items-center justify-center",
      className
    )}>
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02)_1px,transparent_1px)] [background-size:24px_24px]" />
      
      <div className="relative">
        {/* Animated background circle */}
        <div className="absolute inset-0 -m-8">
          <div className="w-32 h-32 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full blur-xl animate-pulse opacity-50" />
        </div>
        
        <div className="relative flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-md transform transition-transform hover:scale-110">
            <span className="text-white font-bold text-base">UR</span>
          </div>
          <Loader2 className={cn("animate-spin text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text", sizeClasses[size])} />
        </div>
      </div>
      {text && (
        <p className="mt-6 text-lg text-gray-700 font-medium animate-fade-in">{text}</p>
      )}
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 text-xs text-gray-400 text-center">
          <p>Tiempo de espera de carga: advertencia de 15s, Tiempo de espera de autenticación: 10s</p>
          <p>Revisa la consola del navegador para errores de autenticación</p>
        </div>
      )}
    </div>
  );
};
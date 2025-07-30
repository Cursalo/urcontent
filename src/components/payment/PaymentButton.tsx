import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Shield, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { createPaymentPreference, PaymentData, formatCurrency, getInstallmentOptions } from '@/lib/mercadopago';

interface PaymentButtonProps {
  amount: number;
  description: string;
  paymentType: 'membership' | 'collaboration' | 'experience' | 'campaign_deposit';
  userId: string;
  userEmail: string;
  userName: string;
  metadata?: Record<string, any>;
  onSuccess?: (preferenceId: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'premium' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  showInstallments?: boolean;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  description,
  paymentType,
  userId,
  userEmail,
  userName,
  metadata,
  onSuccess,
  onError,
  disabled = false,
  className = '',
  variant = 'default',
  size = 'md',
  showInstallments = true
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const installmentOptions = getInstallmentOptions(amount);
  const hasInstallments = installmentOptions.length > 1;

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const paymentData: PaymentData = {
        amount,
        description,
        paymentType,
        userId,
        userEmail,
        userName,
        metadata
      };

      const result = await createPaymentPreference(paymentData);
      
      if (result.success && result.initPoint) {
        // Redirect to MercadoPago checkout
        window.location.href = result.initPoint;
        onSuccess?.(result.preferenceId!);
      } else {
        const errorMsg = result.error || 'Error al procesar el pago';
        setError(errorMsg);
        onError?.(errorMsg);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error inesperado';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getButtonStyles = () => {
    const baseStyles = 'font-semibold transition-all duration-300 transform hover:scale-105 rounded';
    const sizeStyles = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    };
    
    const variantStyles = {
      default: 'bg-black hover:bg-gray-800 text-white',
      premium: 'bg-gray-900 hover:bg-gray-800 text-white',
      gradient: 'bg-gray-900 hover:bg-gray-700 text-white'
    };

    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;
  };

  return (
    <div className="space-y-4">
      {/* Payment Button */}
      <Button
        onClick={handlePayment}
        disabled={disabled || loading}
        className={`${getButtonStyles()} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin"/>
            Procesando...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2"/>
            Pagar {formatCurrency(amount)}
          </>
        )}
      </Button>

      {/* Installments Info */}
      {showInstallments && hasInstallments && !loading && (
        <Card className="p-4 bg-gray-50 border-gray-200 rounded">
          <div className="flex items-center space-x-2 mb-2">
            <CreditCard className="w-4 h-4 text-gray-700"/>
            <span className="font-medium text-gray-900">Opciones de Pago</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {installmentOptions.map((installments) => (
              <Badge key={installments} variant="outline" className="text-gray-800 border-gray-300 rounded">
                {installments === 1 
                  ? 'Pago único' 
                  : `${installments} cuotas de ${formatCurrency(amount / installments)}`
                }
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Security Info */}
      <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <Shield className="w-4 h-4 text-gray-700"/>
          <span>Pago Seguro</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4 text-gray-700"/>
          <span>Acreditación Inmediata</span>
        </div>
        <div className="flex items-center space-x-1">
          <CheckCircle className="w-4 h-4 text-gray-700"/>
          <span>MercadoPago</span>
        </div>
      </div>

      {/* Payment Methods */}
      <Card className="p-3 bg-gray-50 rounded">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Métodos de pago disponibles:</p>
          <div className="flex justify-center space-x-2 text-xs">
            <Badge variant="outline" className="rounded">Tarjeta de Crédito</Badge>
            <Badge variant="outline" className="rounded">Tarjeta de Débito</Badge>
            <Badge variant="outline" className="rounded">Transferencia</Badge>
            <Badge variant="outline" className="rounded">Efectivo</Badge>
          </div>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert className="bg-gray-50 border-gray-200 rounded">
          <AlertCircle className="h-4 w-4 text-gray-700"/>
          <AlertDescription className="text-gray-900">
            <strong>Error:</strong> {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
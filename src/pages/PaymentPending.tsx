import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, RefreshCw, MessageCircle, Home, CheckCircle2, AlertCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { getPaymentStatus } from '@/lib/mercadopago';

const PaymentPending: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  
  const paymentId = searchParams.get('payment_id');
  const externalReference = searchParams.get('external_reference');
  const paymentType = externalReference?.split('_')[0] || 'unknown';

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (paymentId) {
        try {
          const result = await getPaymentStatus(paymentId);
          if (result.success) {
            setPaymentDetails(result);
            if (result.status === 'approved') {
              window.location.href = `/payment/success?payment_id=${paymentId}&external_reference=${externalReference}`;
            }
          }
        } catch (error) {
          console.error('Error fetching payment details:', error);
        }
      }
      setLoading(false);
    };

    fetchPaymentDetails();
    const interval = setInterval(fetchPaymentDetails, 30000);
    return () => clearInterval(interval);
  }, [paymentId, externalReference]);

  const checkPaymentStatus = async () => {
    setChecking(true);
    try {
      if (paymentId) {
        const result = await getPaymentStatus(paymentId);
        if (result.success) {
          setPaymentDetails(result);
          if (result.status === 'approved') {
            window.location.href = `/payment/success?payment_id=${paymentId}&external_reference=${externalReference}`;
          } else if (result.status === 'rejected') {
            window.location.href = `/payment/failure?payment_id=${paymentId}&external_reference=${externalReference}`;
          }
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    } finally {
      setChecking(false);
    }
  };

  const getPaymentTypeInfo = (type: string) => {
    switch (type) {
      case 'membership':
        return { title: 'Procesando Membresía', description: 'Estamos procesando tu pago de membresía URContent' };
      case 'collaboration':
        return { title: 'Procesando Pago de Colaboración', description: 'El pago de la colaboración está siendo procesado' };
      case 'experience':
        return { title: 'Procesando Reserva', description: 'Tu reserva de experiencia está siendo procesada' };
      default:
        return { title: 'Procesando Pago', description: 'Tu pago está siendo procesado' };
    }
  };

  const paymentInfo = getPaymentTypeInfo(paymentType);

  const getPendingReasons = () => [
    {
      title: 'Verificación Bancaria',
      description: 'El banco está verificando la transacción',
      timeframe: '5-10 minutos'
    },
    {
      title: 'Pago en Efectivo',
      description: 'Pago pendiente en punto de pago físico',
      timeframe: 'Hasta 3 días hábiles'
    },
    {
      title: 'Transferencia Bancaria',
      description: 'Transferencia en proceso de acreditación',
      timeframe: '1-2 días hábiles'
    },
    {
      title: 'Revisión de Seguridad',
      description: 'Verificación adicional por seguridad',
      timeframe: '10-30 minutos'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Pending Header */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-black rounded mx-auto mb-6 flex items-center justify-center">
              <Clock className="w-12 h-12 text-white animate-pulse"/>
            </div>
            <h1 className="text-4xl font-bold text-black mb-4">
              {paymentInfo.title}
            </h1>
            <p className="text-xl text-gray-600">
              {paymentInfo.description}
            </p>
          </div>

          {/* Status Check Button */}
          <div className="text-center mb-8">
            <Button 
              onClick={checkPaymentStatus} 
              disabled={checking} 
              className="bg-black hover:bg-gray-800 text-white rounded"
            >
              {checking ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin"/>
                  Verificando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2"/>
                  Verificar Estado del Pago
                </>
              )}
            </Button>
          </div>

          {/* Payment Details */}
          {!loading && paymentDetails && (
            <Card className="p-8 mb-8 bg-gray-50 border-gray-200 rounded">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-black mb-6">
                  Estado del Pago
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Estado Actual</p>
                    <Badge className="bg-gray-100 text-gray-900">
                      En Proceso
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">ID de Transacción</p>
                    <p className="text-sm font-mono text-gray-600">{paymentId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Fecha de Solicitud</p>
                    <p className="text-sm text-gray-600">
                      {new Date().toLocaleDateString('es-AR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Auto-refresh Notice */}
          <Card className="p-6 mb-8 bg-gray-50 border-gray-200 rounded">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-6 h-6 text-gray-700"/>
              <div>
                <h3 className="font-semibold text-black">Actualización Automática</h3>
                <p className="text-sm text-gray-600">
                  Esta página se actualiza automáticamente cada 30 segundos para verificar el estado de tu pago.
                </p>
              </div>
            </div>
          </Card>

          {/* Pending Reasons */}
          <Card className="p-8 mb-8 rounded">
            <h2 className="text-2xl font-semibold text-black mb-6 text-center">
              ¿Por qué está pendiente?
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {getPendingReasons().map((reason, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded">
                  <h3 className="font-semibold text-black mb-2">{reason.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{reason.description}</p>
                  <p className="text-sm text-gray-700 font-medium">
                    Tiempo estimado: {reason.timeframe}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-8 mb-8 rounded">
            <h2 className="text-2xl font-semibold text-black mb-6 text-center">
              Mientras tanto...
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link to="/dashboard">
                <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-gray-200 rounded">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-50 rounded flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                      <Home className="w-6 h-6 text-gray-700"/>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-black group-hover:text-gray-700 transition-colors">
                        Ir al Dashboard
                      </h3>
                      <p className="text-sm text-gray-600">
                        Continúa usando la plataforma
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
              <Card className="p-6 border-2 border-gray-200 rounded">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-50 rounded flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-gray-400"/>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-black">
                      Te Notificaremos
                    </h3>
                    <p className="text-sm text-gray-600">
                      Recibirás un email cuando se complete
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </Card>

          {/* Support */}
          <Card className="p-8 bg-gray-50 rounded">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded mx-auto mb-4 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-gray-600"/>
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">
                ¿Necesitas ayuda?
              </h3>
              <p className="text-gray-600 mb-6">
                Si tienes dudas sobre tu pago o necesitas asistencia
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                <Button variant="outline" className="rounded">
                  <MessageCircle className="w-4 h-4 mr-2"/>
                  Chat de Soporte
                </Button>
                <Button variant="outline" className="rounded">
                  Enviar Email
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentPending;
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { XCircle, RotateCcw, MessageCircle, Home, ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const PaymentFailure: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [retryAttempts, setRetryAttempts] = useState(0);

  const paymentId = searchParams.get('payment_id');
  const externalReference = searchParams.get('external_reference');
  const paymentType = externalReference?.split('_')[0] || 'unknown';

  const getPaymentTypeInfo = (type: string) => {
    switch (type) {
      case 'membership':
        return {
          title: 'Error en Membresía',
          description: 'No pudimos activar tu membresía URContent',
          retryUrl: '/precios'
        };
      case 'collaboration':
        return {
          title: 'Error en Pago de Colaboración',
          description: 'El pago de la colaboración no pudo ser procesado',
          retryUrl: '/dashboard'
        };
      case 'experience':
        return {
          title: 'Error en Reserva',
          description: 'No pudimos procesar tu reserva de experiencia',
          retryUrl: '/experiencias'
        };
      default:
        return {
          title: 'Error en el Pago',
          description: 'No pudimos procesar tu pago correctamente',
          retryUrl: '/dashboard'
        };
    }
  };

  const paymentInfo = getPaymentTypeInfo(paymentType);

  const getFailureReasons = () => [
    {
      title: 'Fondos Insuficientes',
      description: 'Tu tarjeta no tiene suficiente saldo disponible',
      solution: 'Verifica el saldo o usa otra tarjeta'
    },
    {
      title: 'Datos Incorrectos',
      description: 'Los datos de la tarjeta ingresados son incorrectos',
      solution: 'Revisa número, vencimiento y código de seguridad'
    },
    {
      title: 'Límite de Tarjeta',
      description: 'Se alcanzó el límite de compras de tu tarjeta',
      solution: 'Contacta a tu banco o usa otro método de pago'
    },
    {
      title: 'Problema Temporal',
      description: 'Error temporal del sistema de pagos',
      solution: 'Intenta nuevamente en unos minutos'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Failure Header */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-r from-red-400 to-rose-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <XCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {paymentInfo.title} ❌
            </h1>
            <p className="text-xl text-gray-600">
              {paymentInfo.description}
            </p>
          </div>

          {/* Payment Details */}
          {paymentId && (
            <Card className="p-8 mb-8 bg-gradient-to-r from-red-50 to-rose-50 border-red-200">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Detalles del Error
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Estado del Pago</p>
                    <Badge className="bg-red-100 text-red-800">
                      Rechazado
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">ID de Transacción</p>
                    <p className="text-sm font-mono text-gray-600">{paymentId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Fecha</p>
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

          {/* Common Failure Reasons */}
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              ¿Por qué pudo fallar el pago?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {getFailureReasons().map((reason, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">{reason.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{reason.description}</p>
                  <p className="text-sm text-blue-600 font-medium">{reason.solution}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              ¿Qué quieres hacer ahora?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Link to={paymentInfo.retryUrl}>
                <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-blue-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <RotateCcw className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        Intentar Nuevamente
                      </h3>
                      <p className="text-sm text-gray-600">
                        Volver a intentar el pago
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link to="/dashboard">
                <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-green-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center group-hover:bg-green-100 transition-colors">
                      <Home className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                        Ir al Dashboard
                      </h3>
                      <p className="text-sm text-gray-600">
                        Volver a tu cuenta
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          </Card>

          {/* Support */}
          <Card className="p-8 bg-yellow-50 border-yellow-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ¿Necesitas ayuda?
              </h3>
              <p className="text-gray-600 mb-6">
                Si el problema persiste, nuestro equipo de soporte está aquí para ayudarte
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                <Button className="bg-yellow-600 hover:bg-yellow-700">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat en Vivo
                </Button>
                <Button variant="outline" className="border-yellow-600 text-yellow-700 hover:bg-yellow-50">
                  Contactar por Email
                </Button>
              </div>
              
              {/* Common solutions */}
              <div className="mt-6 p-4 bg-white rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-gray-900 mb-2">Soluciones rápidas:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Verifica que los datos de tu tarjeta sean correctos</li>
                  <li>• Asegúrate de tener suficiente saldo disponible</li>
                  <li>• Prueba con una tarjeta diferente</li>
                  <li>• Intenta el pago desde otro dispositivo o navegador</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <Link to="/">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentFailure;
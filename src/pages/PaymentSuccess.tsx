import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Download, Star, ArrowRight, Gift, CreditCard } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { getPaymentStatus, formatCurrency } from '@/lib/mercadopago';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
          }
        } catch (error) {
          console.error('Error fetching payment details:', error);
        }
      }
      setLoading(false);
    };

    fetchPaymentDetails();
  }, [paymentId]);

  const getPaymentTypeInfo = (type: string) => {
    switch (type) {
      case 'membership':
        return {
          title: 'Membresía Activada',
          description: 'Tu membresía URContent ha sido activada exitosamente',
          icon: '👑',
          nextSteps: [
            { label: 'Explorar Experiencias', href: '/experiences', icon: Star },
            { label: 'Completar Perfil', href: '/dashboard', icon: Gift }
          ]
        };
      case 'collaboration':
        return {
          title: 'Pago de Colaboración Procesado',
          description: 'El pago de la colaboración ha sido procesado exitosamente',
          icon: '🤝',
          nextSteps: [
            { label: 'Ver Campañas', href: '/campaigns', icon: Star },
            { label: 'Dashboard', href: '/dashboard', icon: ArrowRight }
          ]
        };
      case 'experience':
        return {
          title: 'Experiencia Reservada',
          description: 'Tu experiencia ha sido reservada exitosamente',
          icon: '✨',
          nextSteps: [
            { label: 'Ver Reservas', href: '/reservations', icon: Star },
            { label: 'Más Experiencias', href: '/experiences', icon: Gift }
          ]
        };
      default:
        return {
          title: 'Pago Exitoso',
          description: 'Tu pago ha sido procesado correctamente',
          icon: '✅',
          nextSteps: [
            { label: 'Dashboard', href: '/dashboard', icon: ArrowRight }
          ]
        };
    }
  };

  const paymentInfo = getPaymentTypeInfo(paymentType);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ¡Pago Exitoso! {paymentInfo.icon}
            </h1>
            <p className="text-xl text-gray-600">
              {paymentInfo.description}
            </p>
          </div>

          {/* Payment Details */}
          {!loading && paymentDetails && (
            <Card className="p-8 mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-center space-x-3 mb-6">
                <CreditCard className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Detalles del Pago</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Monto Pagado</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(paymentDetails.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Estado</p>
                    <Badge className="bg-green-100 text-green-800">
                      Aprobado
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-4">
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

              {/* Download Receipt */}
              <div className="mt-6 pt-6 border-t border-green-200">
                <Button 
                  variant="outline" 
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Comprobante
                </Button>
              </div>
            </Card>
          )}

          {/* Membership Specific Benefits */}
          {paymentType === 'membership' && (
            <Card className="p-8 mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  ¡Bienvenido a URContent Premium! 🎉
                </h2>
                <p className="text-gray-600 mb-6">
                  Ahora tienes acceso a beneficios exclusivos y experiencias premium
                </p>
                
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <Star className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Experiencias Exclusivas</h3>
                    <p className="text-sm text-gray-600">Acceso a venues premium</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <Gift className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Créditos Bonus</h3>
                    <p className="text-sm text-gray-600">Créditos adicionales cada mes</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Prioridad</h3>
                    <p className="text-sm text-gray-600">Reservas con prioridad</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Next Steps */}
          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              ¿Qué quieres hacer ahora?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {paymentInfo.nextSteps.map((step, index) => (
                <Link key={index} to={step.href}>
                  <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-blue-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <step.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {step.label}
                        </h3>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </Card>

          {/* Support */}
          <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">
                ¿Necesitas ayuda?
              </h3>
              <p className="text-gray-600 mb-4">
                Nuestro equipo está aquí para ayudarte con cualquier consulta
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline" className="border-blue-300 text-blue-700">
                  Centro de Ayuda
                </Button>
                <Button variant="outline" className="border-blue-300 text-blue-700">
                  Contactar Soporte
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

export default PaymentSuccess;
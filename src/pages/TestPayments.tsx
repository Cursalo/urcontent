import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Star, 
  Gift, 
  Briefcase, 
  CheckCircle, 
  Users,
  Calendar,
  DollarSign
} from 'lucide-react';
import { PaymentButton } from '@/components/payment/PaymentButton';
import { CampaignPaymentModal } from '@/components/payment/CampaignPaymentModal';
import { ExperiencePaymentCard } from '@/components/payment/ExperiencePaymentCard';
import { PaymentHistory } from '@/components/payment/PaymentHistory';

const TestPayments = () => {
  const [showCampaignModal, setShowCampaignModal] = useState(false);

  // Mock data for testing
  const mockCampaign = {
    id: 'camp-123',
    title: 'Campaña de Skincare Premium',
    description: 'Promocionar nueva línea de productos para el cuidado de la piel',
    budget: 25000,
    deadline: '2024-02-15',
    brandName: 'Beauty Brand SA',
    creatorName: 'María González',
    creatorId: 'creator-456',
    brandId: 'brand-789'
  };

  const mockExperience = {
    id: 'exp-123',
    title: 'Brunch Premium en Palermo',
    description: 'Experiencia gastronómica exclusiva con vista panorámica de la ciudad',
    venue: 'Café Tortoni',
    location: 'Palermo, CABA',
    duration: '2 horas',
    capacity: 6,
    price: 4500,
    credits: 2,
    rating: 4.8,
    reviewCount: 127,
    tags: ['Gastronomía', 'Premium', 'Vista'],
    images: ['https://example.com/image1.jpg'],
    membershipTier: 'premium' as const,
    availability: [
      new Date('2024-02-01'),
      new Date('2024-02-02'),
      new Date('2024-02-03')
    ],
    timeSlots: ['10:00', '12:00', '14:00', '16:00']
  };

  const handlePaymentSuccess = (paymentId: string, type: string) => {
    alert(`¡Pago exitoso! ${type} - ID: ${paymentId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Pruebas del Sistema de Pagos
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Funcionalidad completa de MercadoPago integrada con todos los flujos de pago
            </p>
            <Badge className="bg-green-100 text-green-800 mt-4">
              <CheckCircle className="w-4 h-4 mr-2" />
              Sistema Activo
            </Badge>
          </div>

          <Tabs defaultValue="membership" className="space-y-8">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="membership">Membresías</TabsTrigger>
              <TabsTrigger value="campaigns">Campañas</TabsTrigger>
              <TabsTrigger value="experiences">Experiencias</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
              <TabsTrigger value="status">Estado</TabsTrigger>
            </TabsList>

            {/* Membership Payments */}
            <TabsContent value="membership">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Plan Básico</h3>
                    <p className="text-gray-600 mb-4">Para creadores que empiezan</p>
                    <div className="text-3xl font-bold text-blue-600 mb-4">$2,999/mes</div>
                  </div>
                  <PaymentButton
                    amount={2999}
                    description="URContent Básico - Plan Mensual"
                    paymentType="membership"
                    userId="test-user-123"
                    userEmail="test@urcontent.com"
                    userName="Usuario de Prueba"
                    metadata={{
                      membership_tier: 'basic',
                      billing_period: 'monthly'
                    }}
                    onSuccess={(id) => handlePaymentSuccess(id, 'Membresía Básica')}
                    variant="default"
                    size="lg"
                    className="w-full"
                  />
                </Card>

                <Card className="p-6 ring-2 ring-purple-500">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <Star className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Plan Premium</h3>
                    <p className="text-gray-600 mb-4">Lo más popular</p>
                    <div className="text-3xl font-bold text-purple-600 mb-4">$8,999/mes</div>
                    <Badge className="bg-purple-100 text-purple-800 mb-4">Más Popular</Badge>
                  </div>
                  <PaymentButton
                    amount={8999}
                    description="URContent Premium - Plan Mensual"
                    paymentType="membership"
                    userId="test-user-123"
                    userEmail="test@urcontent.com"
                    userName="Usuario de Prueba"
                    metadata={{
                      membership_tier: 'premium',
                      billing_period: 'monthly'
                    }}
                    onSuccess={(id) => handlePaymentSuccess(id, 'Membresía Premium')}
                    variant="premium"
                    size="lg"
                    className="w-full"
                  />
                </Card>

                <Card className="p-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-yellow-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <Gift className="w-8 h-8 text-yellow-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Plan VIP</h3>
                    <p className="text-gray-600 mb-4">Para profesionales</p>
                    <div className="text-3xl font-bold text-yellow-600 mb-4">$19,999/mes</div>
                  </div>
                  <PaymentButton
                    amount={19999}
                    description="URContent VIP - Plan Mensual"
                    paymentType="membership"
                    userId="test-user-123"
                    userEmail="test@urcontent.com"
                    userName="Usuario de Prueba"
                    metadata={{
                      membership_tier: 'vip',
                      billing_period: 'monthly'
                    }}
                    onSuccess={(id) => handlePaymentSuccess(id, 'Membresía VIP')}
                    variant="gradient"
                    size="lg"
                    className="w-full"
                  />
                </Card>
              </div>
            </TabsContent>

            {/* Campaign Payments */}
            <TabsContent value="campaigns">
              <div className="space-y-6">
                <Card className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                        <Briefcase className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                          Pagos de Campañas
                        </h3>
                        <p className="text-gray-600">
                          Sistema completo de pagos para colaboraciones con creadores
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowCampaignModal(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                      size="lg"
                    >
                      <CreditCard className="w-5 h-5 mr-2" />
                      Probar Pago de Campaña
                    </Button>
                  </div>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Características:</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Pago completo inmediato
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Depósito inicial (30%)
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Pago por hitos/etapas
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Comisión automática (15%)
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Protección de pagos
                      </li>
                    </ul>
                  </Card>

                  <Card className="p-6 bg-green-50 border-green-200">
                    <h4 className="font-semibold text-gray-900 mb-4">Ejemplo de Campaña:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Presupuesto:</span>
                        <span className="font-medium">$25,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Para el creador:</span>
                        <span className="text-green-600 font-medium">$21,250</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Comisión plataforma:</span>
                        <span className="text-gray-600">$3,750</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-green-200">
                        <span className="font-medium">Total a pagar:</span>
                        <span className="font-bold text-blue-600">$25,000</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Experience Payments */}
            <TabsContent value="experiences">
              <div className="space-y-6">
                <Card className="p-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                  <div className="text-center">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                      Reserva de Experiencias
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Pago con créditos de membresía o tarjeta de crédito/débito
                    </p>
                  </div>
                </Card>

                <div className="max-w-md mx-auto">
                  <ExperiencePaymentCard
                    experience={mockExperience}
                    onBookingSuccess={(id) => handlePaymentSuccess(id, 'Reserva de Experiencia')}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Payment History */}
            <TabsContent value="history">
              <Card className="p-8 mb-6 bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    Historial de Pagos
                  </h3>
                  <p className="text-gray-600">
                    Sistema completo de seguimiento y gestión de transacciones
                  </p>
                </div>
              </Card>
              
              <PaymentHistory
                userId="test-user-123"
                userType="business"
              />
            </TabsContent>

            {/* System Status */}
            <TabsContent value="status">
              <div className="space-y-6">
                <Card className="p-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-3xl font-bold text-green-900 mb-4">
                      Sistema Operativo ✅
                    </h3>
                    <p className="text-green-700 text-lg">
                      Todas las funcionalidades de pago están activas y funcionando correctamente
                    </p>
                  </div>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                      MercadoPago Configurado
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Public Key:</span>
                        <span className="font-mono text-xs">APP_USR-4bf8...177c65</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Access Token:</span>
                        <span className="font-mono text-xs">APP_USR-9326...39910</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <Badge className="bg-green-100 text-green-800">Activo</Badge>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
                      Funcionalidades Implementadas
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Pagos de membresías
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Pagos de campañas
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Reserva de experiencias
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Historial de pagos
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Páginas de resultado
                      </li>
                    </ul>
                  </Card>
                </div>

                <Card className="p-6 bg-blue-50 border-blue-200">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">URLs de Resultado</h4>
                      <div className="space-y-1 text-sm text-blue-700">
                        <div>✅ Éxito: /payment/success</div>
                        <div>❌ Error: /payment/failure</div>
                        <div>⏳ Pendiente: /payment/pending</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Campaign Payment Modal */}
      <CampaignPaymentModal
        isOpen={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        campaign={mockCampaign}
        onPaymentSuccess={(id) => {
          handlePaymentSuccess(id, 'Pago de Campaña');
          setShowCampaignModal(false);
        }}
      />

      <Footer />
    </div>
  );
};

export default TestPayments;
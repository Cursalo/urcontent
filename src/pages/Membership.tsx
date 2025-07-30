import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Check, Star, Zap, Crown, Sparkles, CreditCard, Shield, Clock, Users, ArrowRight, Gift, Calendar, Heart, Eye, MessageCircle, Award, Smartphone, Globe } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";

const membershipTiers = [
  {
    id: "basic",
    name: "URContent Basic",
    price: { monthly: 8000, yearly: 6400 },
    credits: 10,
    description: "Perfecto para creadores que empiezan",
    icon: Star,
    borderColor: "border-gray-200",
    popular: false,
    features: [
      "10 créditos mensuales",
      "Acceso a venues básicos",
      "Reservas con 24hs anticipación",
      "Experiencias en salones y cafés",
      "Soporte por email",
      "App móvil incluida"
    ]
  },
  {
    id: "premium",
    name: "URContent Premium",
    price: { monthly: 12000, yearly: 9600 },
    credits: 20,
    description: "La experiencia completa para creadores premium",
    icon: Zap,
    borderColor: "border-gray-200",
    popular: true,
    features: [
      "20 créditos mensuales",
      "Acceso completo a venues",
      "Priority booking",
      "Experiencias premium incluidas",
      "Eventos mensuales exclusivos",
      "Soporte prioritario",
      "Early access a nuevos venues",
      "Descuentos adicionales en productos",
      "Personal beauty concierge"
    ]
  },
  {
    id: "vip",
    name: "URContent VIP",
    price: { monthly: 15000, yearly: 12000 },
    credits: 30,
    description: "La experiencia más exclusiva para creadores",
    icon: Crown,
    borderColor: "border-gray-200",
    popular: false,
    features: [
      "30 créditos mensuales",
      "Acceso VIP a todos los venues",
      "Reservas sin restricciones",
      "Experiencias exclusivas VIP",
      "Eventos privados mensuales",
      "Concierge personal 24/7",
      "Priority en lista de espera",
      "Regalos mensuales sorpresa",
      "Acceso a pre-launches",
      "Invitaciones a fashion weeks",
      "Personal styling sessions"
    ]
  }
];

const Membership = () => {
  const [selectedTier, setSelectedTier] = useState("premium");
  const [isYearly, setIsYearly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const tier = searchParams.get('tier');
    if (tier && ['basic', 'premium', 'vip'].includes(tier)) {
      setSelectedTier(tier);
    }
  }, [searchParams]);

  const handleSelectTier = (tierId: string) => {
    setSelectedTier(tierId);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tier', tierId);
    window.history.replaceState({}, '', `${window.location.pathname}?${newSearchParams}`);
  };

  const handleContinue = async () => {
    if (!user) {
      navigate(`/registro/creador?tier=${selectedTier}&billing=${isYearly ? 'yearly' : 'monthly'}`);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Processing payment for:', { selectedTier, isYearly, user: user.id });
      await new Promise(resolve => setTimeout(resolve, 2000));
      navigate('/dashboard?welcome=true');
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTierData = membershipTiers.find(tier => tier.id === selectedTier)!;
  const monthlyPrice = selectedTierData.price[isYearly ? 'yearly' : 'monthly'];
  const originalPrice = selectedTierData.price.monthly;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded bg-black/5 border border-black/10 mb-8">
              <Sparkles className="w-4 h-4 text-black/70"/>
              <span className="text-sm text-black/80 font-medium">Únete a más de 1,200 miembros exclusivos</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-black mb-8 leading-tight">
              Elige tu <br />
              <span className="font-semibold">membresía URContent</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
              Acceso exclusivo a los mejores venues de Argentina. <br />
              <span className="text-black font-medium">Experiencias gratis, solo para miembros.</span>
            </p>

            <div className="flex items-center justify-center space-x-4 mb-16">
              <span className={`text-lg ${!isYearly ? 'text-black font-medium' : 'text-gray-500'}`}>
                Mensual
              </span>
              <Switch checked={isYearly} onCheckedChange={setIsYearly} className="data-[state=checked]:bg-black"/>
              <span className={`text-lg ${isYearly ? 'text-black font-medium' : 'text-gray-500'}`}>
                Anual
              </span>
              {isYearly && (
                <Badge className="bg-gray-100 text-gray-900 font-medium">
                  Ahorra 20%
                </Badge>
              )}
            </div>
          </div>
        </section>

        {/* Membership Tiers */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              {membershipTiers.map((tier) => (
                <Card
                  key={tier.id}
                  className={`relative overflow-hidden transition-all duration-300 cursor-pointer ${
                    selectedTier === tier.id
                      ? `border-2 border-black shadow-2xl shadow-black/10 scale-105`
                      : `border ${tier.borderColor} hover:border-gray-300 hover:shadow-xl hover:shadow-black/5 hover:scale-102`
                  }`}
                  onClick={() => handleSelectTier(tier.id)}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-black text-white px-6 py-2 rounded text-sm font-medium">
                        Más Popular
                      </div>
                    </div>
                  )}

                  <CardHeader className="relative z-10 text-center pb-4">
                    <div className="w-16 h-16 mx-auto mb-6 rounded bg-black flex items-center justify-center">
                      <tier.icon className="w-8 h-8 text-white"/>
                    </div>
                    <CardTitle className="text-2xl font-semibold text-black mb-2">
                      {tier.name}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {tier.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="relative z-10 text-center">
                    <div className="mb-8">
                      <div className="flex items-end justify-center mb-2">
                        <span className="text-4xl font-light text-black">
                          ${isYearly ? tier.price.yearly : tier.price.monthly}
                        </span>
                        <span className="text-gray-500 ml-2 mb-1">
                          /mes
                        </span>
                      </div>
                      {isYearly && (
                        <div className="text-sm text-gray-500">
                          <span className="line-through">${tier.price.monthly}/mes</span>
                          <span className="text-gray-700 ml-2 font-medium">
                            Ahorra ${(tier.price.monthly - tier.price.yearly) * 12}/año
                          </span>
                        </div>
                      )}

                      <div className="mt-4 inline-flex items-center px-4 py-2 bg-black/10 rounded">
                        <Star className="w-4 h-4 mr-2 text-gray-700"/>
                        <span className="text-sm font-medium">{tier.credits} créditos/mes</span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-8">
                      {tier.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start space-x-3">
                          <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-gray-700"/>
                          </div>
                          <span className="text-gray-700 text-sm text-left">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {selectedTier === tier.id && (
                      <div className="mb-4">
                        <Badge className="bg-black text-white">
                          Seleccionado
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Selected Tier Summary */}
            <div className="max-w-2xl mx-auto">
              <Card className="border-2 border-black rounded overflow-hidden">
                <CardHeader className="bg-black text-white text-center">
                  <CardTitle className="text-2xl">Resumen de Membresía</CardTitle>
                  <CardDescription className="text-gray-300">
                    {selectedTierData.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                      <div>
                        <div className="font-semibold text-black">
                          {isYearly ? 'Facturación Anual' : 'Facturación Mensual'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedTierData.credits} créditos por mes
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-black">
                          ${monthlyPrice}/mes
                        </div>
                        {isYearly && (
                          <div className="text-sm text-gray-700 font-medium">
                            Ahorras ${(originalPrice - monthlyPrice) * 12}/año
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={handleContinue}
                      disabled={isLoading}
                      className="w-full bg-black hover:bg-gray-800 text-white py-4 text-lg font-medium rounded transition-all duration-300 hover:scale-105"
                    >
                      {isLoading ? (
                        <>
                          <Clock className="w-5 h-5 mr-2 animate-spin"/>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 mr-2"/>
                          {user ? 'Continuar al Pago' : 'Crear Cuenta y Continuar'}
                          <ArrowRight className="w-5 h-5 ml-2"/>
                        </>
                      )}
                    </Button>

                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                      <Shield className="w-4 h-4"/>
                      <span>Pago seguro con encriptación SSL</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Membership;
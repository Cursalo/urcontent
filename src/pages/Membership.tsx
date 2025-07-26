import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Check, 
  Star, 
  Zap, 
  Crown, 
  Sparkles,
  CreditCard,
  Shield,
  Clock,
  Users,
  ArrowRight,
  Gift,
  Calendar,
  Heart,
  Eye,
  MessageCircle,
  Award,
  Smartphone,
  Globe
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";

const membershipTiers = [
  {
    id: "basic",
    name: "URContent Basic",
    price: { monthly: 8000, yearly: 6400 }, // 20% discount yearly
    credits: 10,
    description: "Perfecto para creadores que empiezan",
    icon: Star,
    gradient: "from-gray-600 to-gray-800",
    bgGradient: "from-gray-50 to-gray-100",
    borderColor: "border-gray-200",
    popular: false,
    features: [
      "10 créditos mensuales",
      "Acceso a venues básicos",
      "Reservas con 24hs anticipación",
      "Experiencias en salones y cafés",
      "Soporte por email",
      "App móvil incluida"
    ],
    limitations: [
      "Sin acceso a spas premium",
      "Sin eventos exclusivos",
      "Sin priority booking"
    ]
  },
  {
    id: "premium",
    name: "URContent Premium",
    price: { monthly: 12000, yearly: 9600 },
    credits: 20,
    description: "La experiencia completa para creadores premium",
    icon: Zap,
    gradient: "from-blue-600 to-indigo-600",
    bgGradient: "from-blue-50 to-indigo-100",
    borderColor: "border-blue-200",
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
    ],
    limitations: []
  },
  {
    id: "vip",
    name: "URContent VIP",
    price: { monthly: 15000, yearly: 12000 },
    credits: 30,
    description: "La experiencia más exclusiva para creadores",
    icon: Crown,
    gradient: "from-purple-600 to-pink-600",
    bgGradient: "from-purple-50 to-pink-100",
    borderColor: "border-purple-200",
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
    ],
    limitations: []
  }
];

const comparisonFeatures = [
  {
    category: "Créditos y Acceso",
    features: [
      { name: "Créditos mensuales", basic: "10", premium: "20", vip: "30" },
      { name: "Tipos de venues", basic: "Básicos", premium: "Todos", vip: "VIP + Exclusivos" },
      { name: "Anticipación reservas", basic: "24 horas", premium: "Inmediato", vip: "Sin límite" },
      { name: "Priority booking", basic: false, premium: true, vip: true }
    ]
  },
  {
    category: "Experiencias",
    features: [
      { name: "Salones de belleza", basic: true, premium: true, vip: true },
      { name: "Spas premium", basic: false, premium: true, vip: true },
      { name: "Restaurantes exclusivos", basic: false, premium: true, vip: true },
      { name: "Eventos privados", basic: false, premium: "Mensuales", vip: "Semanales" }
    ]
  },
  {
    category: "Servicios Premium",
    features: [
      { name: "Beauty concierge", basic: false, premium: "Business hours", vip: "24/7" },
      { name: "Early access venues", basic: false, premium: true, vip: true },
      { name: "Personal styling", basic: false, premium: false, vip: true },
      { name: "Regalos mensuales", basic: false, premium: false, vip: true }
    ]
  }
];

const Membership = () => {
  const [selectedTier, setSelectedTier] = useState("premium");
  const [isYearly, setIsYearly] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Set initial tier from URL params
  useEffect(() => {
    const tier = searchParams.get('tier');
    if (tier && ['basic', 'premium', 'vip'].includes(tier)) {
      setSelectedTier(tier);
    }
  }, [searchParams]);

  const handleSelectTier = (tierId: string) => {
    setSelectedTier(tierId);
    // Update URL without navigating
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tier', tierId);
    window.history.replaceState({}, '', `${window.location.pathname}?${newSearchParams}`);
  };

  const handleContinue = async () => {
    if (!user) {
      // Redirect to registration with membership intent
      navigate(`/registro/creador?tier=${selectedTier}&billing=${isYearly ? 'yearly' : 'monthly'}`);
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement payment processing
      // This would integrate with MercadoPago or Stripe
      console.log('Processing payment for:', { selectedTier, isYearly, user: user.id });
      
      // For now, simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to success page or dashboard
      navigate('/dashboard?welcome=true');
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTierData = membershipTiers.find(tier => tier.id === selectedTier)!;
  const yearlyDiscount = isYearly ? 20 : 0;
  const monthlyPrice = selectedTierData.price[isYearly ? 'yearly' : 'monthly'];
  const originalPrice = selectedTierData.price.monthly;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 border border-black/10 backdrop-blur-sm mb-8">
              <Sparkles className="w-4 h-4 text-black/70" />
              <span className="text-sm text-black/80 font-medium">Únete a más de 1,200 miembros exclusivos</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-black mb-8 leading-tight">
              Elige tu
              <br />
              <span className="font-semibold">membresía URContent</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
              Acceso exclusivo a los mejores venues de Argentina.
              <br />
              <span className="text-black font-medium">Experiencias gratis, solo para miembros.</span>
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-16">
              <span className={`text-lg ${!isYearly ? 'text-black font-medium' : 'text-gray-500'}`}>
                Mensual
              </span>
              <Switch
                checked={isYearly}
                onCheckedChange={setIsYearly}
                className="data-[state=checked]:bg-black"
              />
              <span className={`text-lg ${isYearly ? 'text-black font-medium' : 'text-gray-500'}`}>
                Anual
              </span>
              {isYearly && (
                <Badge className="bg-green-100 text-green-800 font-medium">
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
                  {/* Popular Badge */}
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium">
                        Más Popular
                      </div>
                    </div>
                  )}

                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${tier.bgGradient} opacity-50`} />
                  
                  <CardHeader className="relative z-10 text-center pb-4">
                    <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center`}>
                      <tier.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <CardTitle className="text-2xl font-semibold text-black mb-2">
                      {tier.name}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {tier.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="relative z-10 text-center">
                    {/* Price */}
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
                          <span className="text-green-600 ml-2 font-medium">
                            Ahorra ${(tier.price.monthly - tier.price.yearly) * 12}/año
                          </span>
                        </div>
                      )}
                      
                      {/* Credits */}
                      <div className="mt-4 inline-flex items-center px-4 py-2 bg-black/10 rounded-full">
                        <Star className="w-4 h-4 mr-2 text-yellow-600" />
                        <span className="text-sm font-medium">{tier.credits} créditos/mes</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-8">
                      {tier.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start space-x-3">
                          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-gray-700 text-sm text-left">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Selection Indicator */}
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
              <Card className="border-2 border-black rounded-3xl overflow-hidden">
                <CardHeader className="bg-black text-white text-center">
                  <CardTitle className="text-2xl">Resumen de Membresía</CardTitle>
                  <CardDescription className="text-gray-300">
                    {selectedTierData.name}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {/* Price Summary */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
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
                          <div className="text-sm text-green-600 font-medium">
                            Ahorras ${(originalPrice - monthlyPrice) * 12}/año
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Benefits Preview */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-2xl">
                        <Heart className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <div className="font-semibold text-sm">Experiencias Gratis</div>
                        <div className="text-xs text-gray-600">Valor: +$50,000/mes</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-2xl">
                        <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <div className="font-semibold text-sm">Acceso Exclusivo</div>
                        <div className="text-xs text-gray-600">350+ venues premium</div>
                      </div>
                    </div>

                    {/* Continue Button */}
                    <Button 
                      onClick={handleContinue}
                      disabled={isLoading}
                      className="w-full bg-black hover:bg-gray-800 text-white py-4 text-lg font-medium rounded-2xl transition-all duration-300 hover:scale-105"
                    >
                      {isLoading ? (
                        <>
                          <Clock className="w-5 h-5 mr-2 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 mr-2" />
                          {user ? 'Continuar al Pago' : 'Crear Cuenta y Continuar'}
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>

                    {/* Security Notice */}
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                      <Shield className="w-4 h-4" />
                      <span>Pago seguro con encriptación SSL</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Comparison Toggle */}
            <div className="text-center mt-16">
              <Button
                variant="outline"
                onClick={() => setShowComparison(!showComparison)}
                className="rounded-full px-8 py-3"
              >
                {showComparison ? 'Ocultar' : 'Ver'} Comparación Detallada
                <Eye className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Detailed Comparison */}
        {showComparison && (
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-light text-black mb-6">
                  Comparación <span className="font-semibold">Detallada</span>
                </h2>
                <p className="text-xl text-gray-600">
                  Todos los detalles para que tomes la mejor decisión
                </p>
              </div>

              <div className="space-y-12">
                {comparisonFeatures.map((category, categoryIdx) => (
                  <div key={categoryIdx}>
                    <h3 className="text-2xl font-semibold text-black mb-6 text-center">
                      {category.category}
                    </h3>
                    
                    <Card className="border border-gray-200 rounded-3xl overflow-hidden">
                      {/* Header */}
                      <div className="bg-gray-100 p-6 grid grid-cols-4 gap-6">
                        <div className="font-medium text-gray-600">Característica</div>
                        <div className="text-center font-medium text-gray-600">Basic</div>
                        <div className="text-center font-medium text-gray-600">Premium</div>
                        <div className="text-center font-medium text-gray-600">VIP</div>
                      </div>

                      {/* Features */}
                      <div className="divide-y divide-gray-100">
                        {category.features.map((feature, featureIdx) => (
                          <div key={featureIdx} className="p-6 grid grid-cols-4 gap-6 hover:bg-gray-50/50 transition-colors">
                            <div className="font-medium text-black">{feature.name}</div>
                            <div className="text-center">
                              {typeof feature.basic === 'boolean' ? (
                                feature.basic ? (
                                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )
                              ) : (
                                <span className="text-sm text-gray-700">{feature.basic}</span>
                              )}
                            </div>
                            <div className="text-center">
                              {typeof feature.premium === 'boolean' ? (
                                feature.premium ? (
                                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )
                              ) : (
                                <span className="text-sm text-gray-700">{feature.premium}</span>
                              )}
                            </div>
                            <div className="text-center">
                              {typeof feature.vip === 'boolean' ? (
                                feature.vip ? (
                                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )
                              ) : (
                                <span className="text-sm text-gray-700">{feature.vip}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Social Proof */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-light text-black mb-6">
                Miembros <span className="font-semibold">satisfechos</span>
              </h2>
              <p className="text-xl text-gray-600">
                Más de 1,200 influencers ya disfrutan de URContent
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              {[
                { icon: Users, stat: "1,200+", label: "Miembros activos" },
                { icon: Heart, stat: "15,000+", label: "Experiencias disfrutadas" },
                { icon: Award, stat: "350+", label: "Venues exclusivos" },
                { icon: Star, stat: "4.9/5", label: "Rating promedio" }
              ].map((item, idx) => (
                <div key={idx} className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-8 h-8 text-gray-600" />
                  </div>
                  <div className="text-3xl font-light text-black mb-2">{item.stat}</div>
                  <div className="text-gray-600 text-sm">{item.label}</div>
                </div>
              ))}
            </div>

            {/* Testimonials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sofia Martinez",
                  handle: "@sofia_lifestyle",
                  tier: "VIP",
                  quote: "URContent cambió completamente mi rutina de belleza. Acceso a spas premium que antes no podía costear.",
                  avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=60&h=60&fit=crop&crop=face"
                },
                {
                  name: "Valentina Torres",
                  handle: "@valen_beauty",
                  tier: "Premium",
                  quote: "Los créditos mensuales me permiten probar nuevos tratamientos cada semana. ¡Es increíble!",
                  avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face"
                },
                {
                  name: "Camila Lopez",
                  handle: "@cami_wellness",
                  tier: "Basic",
                  quote: "Empecé con Basic y ya estoy pensando en upgrade. La calidad de los venues es excelente.",
                  avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&h=60&fit=crop&crop=face"
                }
              ].map((testimonial, idx) => (
                <Card key={idx} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-3 mb-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <div className="font-semibold text-black">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.handle}</div>
                    </div>
                    <Badge className="ml-auto bg-purple-100 text-purple-800">
                      {testimonial.tier}
                    </Badge>
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Membership;
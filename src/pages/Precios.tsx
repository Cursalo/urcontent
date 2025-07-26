import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Check, 
  Star, 
  Zap, 
  Crown, 
  Sparkles,
  Users,
  TrendingUp,
  MessageCircle,
  BarChart3,
  Shield,
  Headphones,
  Globe,
  Smartphone
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PaymentButton } from "@/components/payment/PaymentButton";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: { monthly: 0, yearly: 0 },
    description: "Perfecto para comenzar tu journey",
    icon: Star,
    gradient: "from-gray-600 to-gray-800",
    bgGradient: "from-gray-50 to-gray-100",
    textColor: "text-gray-900",
    features: [
      "Hasta 3 campañas por mes",
      "Acceso básico al marketplace",
      "Chat con creadores",
      "Analytics básicos",
      "Soporte por email",
      "Dashboard estándar"
    ],
    limitations: [
      "Sin acceso a creadores premium",
      "Reportes limitados",
      "Sin prioridad en soporte"
    ],
    cta: "Comenzar Gratis",
    popular: false,
    mostUsed: false
  },
  {
    id: "professional",
    name: "Professional",
    price: { monthly: 49, yearly: 39 },
    description: "Para comercios en crecimiento",
    icon: Zap,
    gradient: "from-blue-600 to-indigo-600",
    bgGradient: "from-blue-50 to-indigo-100",
    textColor: "text-blue-900",
    features: [
      "Campañas ilimitadas",
      "Acceso completo al marketplace",
      "Chat y videollamadas",
      "Analytics avanzados",
      "Soporte prioritario",
      "Dashboard profesional",
      "Gestión de equipos (5 usuarios)",
      "Templates de campaña",
      "Automatizaciones básicas"
    ],
    limitations: [],
    cta: "Empezar Prueba Gratis",
    popular: true,
    mostUsed: true
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: { monthly: 149, yearly: 119 },
    description: "Para grandes empresas",
    icon: Crown,
    gradient: "from-purple-600 to-pink-600",
    bgGradient: "from-purple-50 to-pink-100",
    textColor: "text-purple-900",
    features: [
      "Todo lo de Professional",
      "Creadores exclusivos",
      "Account manager dedicado",
      "Analytics predictivos",
      "Soporte 24/7",
      "Dashboard enterprise",
      "Usuarios ilimitados",
      "API access",
      "Integraciones personalizadas",
      "White-label disponible",
      "SLA garantizado"
    ],
    limitations: [],
    cta: "Contactar Ventas",
    popular: false,
    mostUsed: false
  }
];

const features = [
  {
    category: "Marketplace & Discovery",
    items: [
      { name: "Acceso al marketplace", starter: true, professional: true, enterprise: true },
      { name: "Filtros avanzados", starter: false, professional: true, enterprise: true },
      { name: "Creadores verificados", starter: "limited", professional: true, enterprise: true },
      { name: "Creadores exclusivos", starter: false, professional: false, enterprise: true },
      { name: "Recomendaciones AI", starter: false, professional: true, enterprise: true }
    ]
  },
  {
    category: "Campaign Management",
    items: [
      { name: "Campañas simultáneas", starter: "3", professional: "Ilimitadas", enterprise: "Ilimitadas" },
      { name: "Templates de campaña", starter: false, professional: true, enterprise: true },
      { name: "Automatizaciones", starter: false, professional: "Básicas", enterprise: "Avanzadas" },
      { name: "Workflow personalizado", starter: false, professional: false, enterprise: true },
      { name: "Aprobaciones multi-nivel", starter: false, professional: false, enterprise: true }
    ]
  },
  {
    category: "Analytics & Reporting",
    items: [
      { name: "Métricas básicas", starter: true, professional: true, enterprise: true },
      { name: "Reportes avanzados", starter: false, professional: true, enterprise: true },
      { name: "Analytics predictivos", starter: false, professional: false, enterprise: true },
      { name: "ROI tracking", starter: false, professional: true, enterprise: true },
      { name: "Exportación de datos", starter: false, professional: true, enterprise: true }
    ]
  },
  {
    category: "Support & Services",
    items: [
      { name: "Soporte por email", starter: true, professional: true, enterprise: true },
      { name: "Soporte prioritario", starter: false, professional: true, enterprise: true },
      { name: "Account manager", starter: false, professional: false, enterprise: true },
      { name: "Soporte 24/7", starter: false, professional: false, enterprise: true },
      { name: "Onboarding personalizado", starter: false, professional: false, enterprise: true }
    ]
  }
];

const Precios = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("professional");

  const savings = isYearly ? 20 : 0;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-20">
        {/* Hero Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 border border-black/10 backdrop-blur-sm mb-8">
              <Sparkles className="w-4 h-4 text-black/70" />
              <span className="text-sm text-black/80 font-medium">Planes diseñados para cada etapa de crecimiento</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-black mb-8 leading-tight">
              Precios que se adaptan a tu
              <br />
              <span className="font-semibold">ambición</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
              Desde startups hasta empresas Fortune 500. 
              Encuentra el plan perfecto para tu marca.
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

        {/* Pricing Cards */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`relative bg-white border-2 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-2 ${
                    plan.popular 
                      ? 'border-black shadow-xl shadow-black/10 scale-105' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium">
                        Más Popular
                      </div>
                    </div>
                  )}

                  {/* Most Used Badge */}
                  {plan.mostUsed && (
                    <div className="absolute top-6 right-6">
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        Más Usado
                      </Badge>
                    </div>
                  )}

                  <div className="p-8 lg:p-10">
                    {/* Plan Header */}
                    <div className="text-center mb-8">
                      <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}>
                        <plan.icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-semibold text-black mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {plan.description}
                      </p>

                      {/* Price */}
                      <div className="mb-6">
                        {plan.price.monthly === 0 ? (
                          <div className="text-4xl font-light text-black">
                            Gratis
                          </div>
                        ) : (
                          <div className="flex items-end justify-center">
                            <span className="text-4xl font-light text-black">
                              ${isYearly ? plan.price.yearly : plan.price.monthly}
                            </span>
                            <span className="text-gray-500 ml-2 mb-1">
                              /mes
                            </span>
                          </div>
                        )}
                        {isYearly && plan.price.monthly > 0 && (
                          <div className="text-sm text-gray-500 mt-2">
                            <span className="line-through">${plan.price.monthly}/mes</span>
                            <span className="text-green-600 ml-2 font-medium">
                              Ahorra ${(plan.price.monthly - plan.price.yearly) * 12}/año
                            </span>
                          </div>
                        )}
                      </div>

                      {/* CTA Button */}
                      {plan.id === 'starter' ? (
                        <Link to="/onboarding/business">
                          <Button 
                            className="w-full py-4 rounded-2xl font-medium text-lg transition-all duration-300 bg-gray-100 hover:bg-gray-200 text-black hover:scale-105"
                          >
                            {plan.cta}
                          </Button>
                        </Link>
                      ) : plan.id === 'enterprise' ? (
                        <Link to="/contact">
                          <Button 
                            className="w-full py-4 rounded-2xl font-medium text-lg transition-all duration-300 bg-gray-100 hover:bg-gray-200 text-black hover:scale-105"
                          >
                            {plan.cta}
                          </Button>
                        </Link>
                      ) : (
                        <PaymentButton
                          amount={isYearly ? plan.price.yearly * 100 : plan.price.monthly * 100}
                          description={`URContent ${plan.name} - ${isYearly ? 'Plan Anual' : 'Plan Mensual'}`}
                          paymentType="membership"
                          userId="temp-user-id"
                          userEmail="user@example.com"
                          userName="Usuario"
                          metadata={{
                            plan_id: plan.id,
                            billing_period: isYearly ? 'yearly' : 'monthly',
                            plan_name: plan.name
                          }}
                          variant={plan.popular ? 'premium' : 'default'}
                          size="lg"
                          className="w-full py-4 rounded-2xl font-medium text-lg"
                        />
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-4">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start space-x-3">
                          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </div>
                      ))}
                      
                      {plan.limitations.length > 0 && (
                        <div className="pt-4 border-t border-gray-100">
                          <div className="text-xs text-gray-500 mb-2">Limitaciones:</div>
                          {plan.limitations.map((limitation, idx) => (
                            <div key={idx} className="text-xs text-gray-400 mb-1">
                              • {limitation}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Enterprise Contact */}
            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">
                ¿Necesitas algo más personalizado?
              </p>
              <Link to="/contact">
                <Button variant="outline" className="rounded-full px-8 py-3">
                  Hablar con Ventas
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-light text-black mb-6">
                Comparación <span className="font-semibold">detallada</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Todos los detalles de cada plan para que tomes la mejor decisión
              </p>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {features.map((category, categoryIdx) => (
                  <div key={categoryIdx} className="mb-12">
                    <h3 className="text-2xl font-semibold text-black mb-6 px-6">
                      {category.category}
                    </h3>
                    
                    <Card className="border border-gray-200 rounded-3xl overflow-hidden">
                      {/* Header */}
                      <div className="bg-gray-50 p-6 grid grid-cols-4 gap-6">
                        <div className="font-medium text-gray-600">Funcionalidad</div>
                        <div className="text-center font-medium text-gray-600">Starter</div>
                        <div className="text-center font-medium text-gray-600">Professional</div>
                        <div className="text-center font-medium text-gray-600">Enterprise</div>
                      </div>

                      {/* Features */}
                      <div className="divide-y divide-gray-100">
                        {category.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="p-6 grid grid-cols-4 gap-6 hover:bg-gray-50/50 transition-colors">
                            <div className="font-medium text-black">{item.name}</div>
                            <div className="text-center">
                              {typeof item.starter === 'boolean' ? (
                                item.starter ? (
                                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )
                              ) : (
                                <span className="text-sm text-gray-700">{item.starter}</span>
                              )}
                            </div>
                            <div className="text-center">
                              {typeof item.professional === 'boolean' ? (
                                item.professional ? (
                                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )
                              ) : (
                                <span className="text-sm text-gray-700">{item.professional}</span>
                              )}
                            </div>
                            <div className="text-center">
                              {typeof item.enterprise === 'boolean' ? (
                                item.enterprise ? (
                                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )
                              ) : (
                                <span className="text-sm text-gray-700">{item.enterprise}</span>
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
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-light text-black mb-6">
                Preguntas <span className="font-semibold">frecuentes</span>
              </h2>
              <p className="text-xl text-gray-600">
                Todo lo que necesitas saber sobre nuestros planes
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  q: "¿Puedo cambiar de plan en cualquier momento?",
                  a: "Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se aplican inmediatamente y se prorratea el costo."
                },
                {
                  q: "¿Hay período de prueba gratuito?",
                  a: "Sí, todos los planes pagos incluyen 14 días de prueba gratuita. No se requiere tarjeta de crédito para el plan Starter."
                },
                {
                  q: "¿Qué pasa si excedo mis límites?",
                  a: "Te notificaremos cuando te acerques a tus límites. Puedes actualizar tu plan o esperar al siguiente ciclo de facturación."
                },
                {
                  q: "¿Ofrecen descuentos para organizaciones sin fines de lucro?",
                  a: "Sí, ofrecemos descuentos especiales para ONGs y organizaciones educativas. Contáctanos para más información."
                },
                {
                  q: "¿Cómo funciona la facturación anual?",
                  a: "Con la facturación anual obtienes 2 meses gratis (20% de descuento). Se factura una vez al año por adelantado."
                },
                {
                  q: "¿Puedo cancelar mi suscripción?",
                  a: "Sí, puedes cancelar en cualquier momento desde tu dashboard. Tu plan seguirá activo hasta el final del período pagado."
                }
              ].map((faq, idx) => (
                <Card key={idx} className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-gray-300 transition-colors">
                  <h3 className="text-lg font-semibold text-black mb-3">{faq.q}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-light text-black mb-6">
                Usado por las mejores <span className="font-semibold">marcas</span>
              </h2>
              <p className="text-xl text-gray-600">
                Más de 1,250 empresas confían en URContent para sus campañas
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              {[
                { icon: Users, stat: "1,250+", label: "Empresas activas" },
                { icon: TrendingUp, stat: "98%", label: "Tasa de satisfacción" },
                { icon: MessageCircle, stat: "15,000+", label: "Campañas exitosas" },
                { icon: Globe, stat: "50+", label: "Ciudades cubiertas" }
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

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Shield,
                  title: "Seguridad Garantizada",
                  description: "Todos los pagos están protegidos con encriptación de nivel bancario"
                },
                {
                  icon: Headphones,
                  title: "Soporte Premium", 
                  description: "Nuestro equipo está disponible para ayudarte cuando lo necesites"
                },
                {
                  icon: Smartphone,
                  title: "Mobile First",
                  description: "Optimizado para funcionar perfectamente en todos los dispositivos"
                }
              ].map((feature, idx) => (
                <div key={idx} className="text-center p-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Precios;
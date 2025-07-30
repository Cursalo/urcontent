import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "Gratis",
    description: "Perfect para comenzar",
    icon: Star,
    features: [
      "Hasta 3 campañas por mes",
      "Analytics básicos",
      "Chat con creadores",
      "Soporte por email",
      "Dashboard básico"
    ],
    cta: "Empezar Gratis",
    popular: false
  },
  {
    name: "Professional",
    price: "$49",
    period: "/mes",
    description: "Para comercios en crecimiento",
    icon: Zap,
    features: [
      "Campañas ilimitadas",
      "Analytics avanzados",
      "Matching con IA",
      "Contratos automáticos",
      "Soporte prioritario",
      "API Access",
      "Facturación automática"
    ],
    cta: "Comenzar Prueba",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Para grandes marcas",
    icon: Crown,
    features: [
      "Todo de Professional",
      "Manager dedicado",
      "Integraciones custom",
      "White label",
      "SLA garantizado",
      "Onboarding personalizado",
      "Reportes ejecutivos"
    ],
    cta: "Contactar Ventas",
    popular: false
  }
];

export const Pricing = () => {
  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-gray-300">
            Planes y Precios
          </Badge>
          <h2 className="text-3xl md:text-5xl font-poppins font-bold mb-6">
            Un plan para cada{" "}
            <span className="text-black">
              necesidad
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comienza gratis y escala cuando estés listo. Sin sorpresas, sin comisiones ocultas.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative p-8 lg:p-10 transition-all duration-500 hover:scale-105 ${
                plan.popular
                  ? 'border-2 border-black shadow-xl'
                  : 'bg-white border border-gray-200 hover:border-gray-400'
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-black text-white border-0 px-4 py-1">
                    Más Popular
                  </Badge>
                </div>
              )}

              {/* Plan icon */}
              <div className={`w-16 h-16 mx-auto mb-6 rounded ${
                plan.popular ? 'bg-black' : 'bg-gray-100'
              } p-4 group-hover:scale-110 transition-transform duration-300`}>
                <plan.icon className={`w-full h-full ${
                  plan.popular ? 'text-white' : 'text-black'
                }`} />
              </div>

              {/* Plan info */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-poppins font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-gray-600">{plan.period}</span>}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-gray-700 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link to={plan.name === 'Enterprise' ? '/contacto' : '/registro/comercio'}>
                <Button
                  className={`w-full py-6 text-lg transition-all duration-300 hover:scale-105 ${
                    plan.popular
                      ? 'bg-black text-white hover:bg-gray-800'
                      : ''
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">
            ¿Necesitas algo diferente? Hablemos.
          </p>
          <Link to="/contacto">
            <Button variant="outline" size="lg" className="hover:scale-105">
              Contactar Equipo de Ventas
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
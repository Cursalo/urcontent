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
    gradient: "from-blue-500 to-cyan-500",
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
    gradient: "from-purple-500 to-pink-500",
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
    gradient: "from-orange-500 to-red-500",
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
    <section className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="floating-orb top-20 left-20 w-80 h-80 bg-primary/5" />
        <div className="floating-orb bottom-20 right-20 w-72 h-72 bg-secondary/5" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 glass-card border-primary/30">
            Planes y Precios
          </Badge>
          <h2 className="text-3xl md:text-5xl font-poppins font-bold mb-6">
            Un plan para cada{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              necesidad
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comienza gratis y escala cuando estés listo. Sin sorpresas, sin comisiones ocultas.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative p-8 lg:p-10 transition-all duration-500 hover:scale-105 ${
                plan.popular 
                  ? 'glass-card border-primary/30 shadow-glow' 
                  : 'bg-background border border-border hover:border-primary/20'
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className={`bg-gradient-to-r ${plan.gradient} text-white border-0 px-4 py-1`}>
                    Más Popular
                  </Badge>
                </div>
              )}

              {/* Plan icon */}
              <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${plan.gradient} p-4 group-hover:scale-110 transition-transform duration-300`}>
                <plan.icon className="w-full h-full text-white" />
              </div>

              {/* Plan info */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-poppins font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link to={plan.name === 'Enterprise' ? '/contacto' : '/registro/comercio'}>
                <Button 
                  className={`w-full py-6 text-lg transition-all duration-300 ${
                    plan.popular 
                      ? `bg-gradient-to-r ${plan.gradient} text-white hover:scale-105 shadow-glow` 
                      : 'hover:scale-105'
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Link>

              {/* Decorative elements */}
              {plan.popular && (
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse opacity-70" />
              )}
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            ¿Necesitas algo diferente? Hablemos.
          </p>
          <Link to="/contacto">
            <Button variant="outline" size="lg" className="glass-card hover:scale-105">
              Contactar Equipo de Ventas
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
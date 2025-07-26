import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, TrendingUp, Users, Award, Globe } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Contratos Inteligentes",
    description: "Protección automática para comercios y creadores con escrow integrado.",
    badge: "Seguro"
  },
  {
    icon: Zap,
    title: "Matching con IA",
    description: "Algoritmo que encuentra las colaboraciones perfectas basado en datos reales.",
    badge: "IA"
  },
  {
    icon: TrendingUp,
    title: "Analytics Avanzados",
    description: "Métricas en tiempo real de alcance, engagement y ROI verificado.",
    badge: "Analytics"
  },
  {
    icon: Users,
    title: "Comunidad Verificada",
    description: "Todos los perfiles están verificados con métricas auténticas.",
    badge: "Verificado"
  },
  {
    icon: Award,
    title: "Sistema URScore™",
    description: "Ranking transparente basado en calidad y cumplimiento.",
    badge: "Exclusivo"
  },
  {
    icon: Globe,
    title: "Alcance Nacional",
    description: "Conectamos marcas con creadores en toda Argentina.",
    badge: "Nacional"
  }
];

export const Features = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-20">
          <Badge variant="outline" className="mb-6 bg-black text-white border-black px-6 py-2 text-sm font-medium rounded-full">
            Características principales
          </Badge>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-black mb-6 leading-tight">
            La plataforma más
            <br />
            <span className="font-semibold">avanzada del mercado</span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Tecnología de vanguardia que garantiza colaboraciones 
            exitosas y medibles para marcas y creadores.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white rounded-3xl overflow-hidden group"
            >
              <CardContent className="p-8 text-center">
                
                {/* Icon */}
                <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-black transition-colors duration-300">
                  <feature.icon className="w-8 h-8 text-gray-700 group-hover:text-white transition-colors duration-300" />
                </div>

                {/* Badge */}
                <Badge 
                  variant="outline" 
                  className="mb-4 text-xs bg-gray-50 text-gray-700 border-gray-200"
                >
                  {feature.badge}
                </Badge>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-4 text-black">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center mt-20">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-light text-black mb-4">
              ¿Quieres saber más sobre nuestras características?
            </h3>
            <p className="text-gray-600 mb-8">
              Descubre cómo URContent puede transformar tus colaboraciones con creadores.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Badge variant="outline" className="px-4 py-2 text-sm bg-gray-50 text-gray-700 border-gray-200">
                ✓ Sin comisiones ocultas
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm bg-gray-50 text-gray-700 border-gray-200">
                ✓ Soporte 24/7
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm bg-gray-50 text-gray-700 border-gray-200">
                ✓ Integración rápida
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
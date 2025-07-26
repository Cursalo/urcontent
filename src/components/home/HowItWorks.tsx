import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Search, 
  MessageCircle, 
  Handshake, 
  BarChart3,
  ArrowRight,
  CheckCircle
} from "lucide-react";

export const HowItWorks = () => {
  const steps = [
    {
      number: "1",
      title: "Descubre",
      subtitle: "Encuentra la colaboración perfecta",
      description: "Navega por miles de oportunidades curadas específicamente para tu perfil y audiencia.",
      icon: <Search className="w-8 h-8" />,
      details: [
        "Algoritmo inteligente de matching",
        "Filtros avanzados por industria",
        "Recomendaciones personalizadas"
      ]
    },
    {
      number: "2", 
      title: "Conecta",
      subtitle: "Negocia directamente con transparencia",
      description: "Utiliza nuestro chat integrado para acordar términos, precios y entregables de forma segura.",
      icon: <MessageCircle className="w-8 h-8" />,
      details: [
        "Chat en tiempo real",
        "Propuestas automatizadas", 
        "Contratos digitales seguros"
      ]
    },
    {
      number: "3",
      title: "Colabora", 
      subtitle: "Crea contenido excepcional",
      description: "Trabaja con marcas o creadores verificados en un ambiente profesional y seguro.",
      icon: <Handshake className="w-8 h-8" />,
      details: [
        "Pagos protegidos con escrow",
        "Timeline y milestones claros",
        "Soporte dedicado 24/7"
      ]
    },
    {
      number: "4",
      title: "Mide",
      subtitle: "Obtén resultados comprobables", 
      description: "Accede a analytics detallados sobre el impacto real de cada colaboración.",
      icon: <BarChart3 className="w-8 h-8" />,
      details: [
        "Métricas de rendimiento",
        "ROI tracking automático",
        "Reportes profesionales"
      ]
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-20">
          <Badge variant="outline" className="mb-6 bg-black text-white border-black px-6 py-2 text-sm font-medium rounded-full">
            Cómo funciona URContent
          </Badge>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-black mb-6 leading-tight">
            Colaboraciones en
            <br />
            <span className="font-semibold">4 pasos simples</span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Un proceso elegante y transparente que conecta marcas con creadores 
            de forma eficiente y profesional.
          </p>
        </div>

        {/* Steps */}
        <div className="grid lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white rounded-3xl overflow-hidden group">
                <CardContent className="p-8 text-center">
                  
                  {/* Step number */}
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-black text-white text-2xl font-light rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                    {step.number}
                  </div>
                  
                  {/* Icon */}
                  <div className="flex justify-center mb-6 text-gray-700 group-hover:text-black transition-colors">
                    {step.icon}
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-2xl font-semibold text-black mb-2">
                    {step.title}
                  </h3>
                  <p className="text-lg text-gray-600 mb-4 font-medium">
                    {step.subtitle}
                  </p>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Details */}
                  <ul className="space-y-2 text-sm text-gray-500">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              {/* Connector arrow (hidden on mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-6 h-6 text-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gray-50 rounded-3xl p-12">
          <h3 className="text-3xl font-light text-black mb-4">
            ¿Listo para comenzar?
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Únete a miles de marcas y creadores que ya están transformando 
            el marketing de influencers con URContent.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link to="/registro/comercio" className="flex-1">
              <Button 
                size="lg" 
                className="w-full bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-full font-medium"
              >
                Soy una Marca
              </Button>
            </Link>
            
            <Link to="/registro/creador" className="flex-1">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full border-2 border-black text-black hover:bg-black hover:text-white px-6 py-3 rounded-full font-medium"
              >
                Soy Creador
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
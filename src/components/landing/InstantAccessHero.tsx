import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Camera, 
  Store, 
  Shield, 
  ArrowRight, 
  Sparkles,
  TrendingUp,
  Users,
  BarChart3,
  Palette,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface AccessCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  route: string;
}

export const InstantAccessHero = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const accessCards: AccessCard[] = [
    {
      id: "creator",
      title: "Acceso Creator",
      subtitle: "Panel de Creador de Contenido",
      description: "Explora herramientas profesionales para crear y monetizar tu contenido",
      icon: <Camera className="w-6 h-6" />,
      color: "from-purple-500 to-pink-500",
      features: [
        "Brand Kit personalizado",
        "Analytics en tiempo real",
        "Gestión de colaboraciones",
        "Calendario de contenido"
      ],
      route: "/dashboard/creator"
    },
    {
      id: "business",
      title: "Acceso Negocio",
      subtitle: "Panel de Gestión Empresarial",
      description: "Administra tu negocio y conecta con creadores de contenido",
      icon: <Store className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500",
      features: [
        "Búsqueda de creadores",
        "Gestión de campañas",
        "ROI y métricas",
        "Contratos digitales"
      ],
      route: "/dashboard/business"
    },
    {
      id: "admin",
      title: "Acceso Admin",
      subtitle: "Panel de Administración",
      description: "Control total de la plataforma y gestión de usuarios",
      icon: <Shield className="w-6 h-6" />,
      color: "from-gray-700 to-gray-900",
      features: [
        "Gestión de usuarios",
        "Analytics de plataforma",
        "Moderación de contenido",
        "Configuración del sistema"
      ],
      route: "/dashboard/admin"
    }
  ];

  const handleAccessClick = async (card: AccessCard) => {
    setIsLoading(card.id);
    
    try {
      // Show success message
      toast.success(`Accediendo como ${card.title}`, {
        description: "Preparando tu experiencia demo...",
        icon: card.icon
      });
      
      // Navigate to the appropriate dashboard
      // The dashboard will handle guest mode automatically
      setTimeout(() => {
        navigate(card.route);
        setIsLoading(null);
      }, 500);
    } catch (error) {
      toast.error("Error al acceder", {
        description: "Por favor, intenta nuevamente"
      });
      setIsLoading(null);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <Badge className="mb-4 px-4 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-0">
          <Sparkles className="w-3 h-3 mr-1" />
          Acceso Instantáneo
        </Badge>
        
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Prueba la plataforma sin registro
        </h2>
        
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explora todas las funcionalidades de URContent con acceso demo completo. 
          Sin tarjetas de crédito, sin compromisos.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accessCards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card 
              className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
              onClick={() => handleAccessClick(card)}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
              
              {/* Animated border */}
              <div className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                <div className="absolute inset-[1px] bg-white rounded-lg" />
              </div>
              
              <CardContent className="relative p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-lg`}>
                    {card.icon}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Demo
                  </Badge>
                </div>

                {/* Title and description */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {card.subtitle}
                  </p>
                  <p className="text-sm text-gray-500">
                    {card.description}
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  {card.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-600">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${card.color} mr-2`} />
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Action button */}
                <Button
                  className={`w-full bg-gradient-to-r ${card.color} text-white border-0 hover:opacity-90 transition-all duration-300 group`}
                  disabled={isLoading === card.id}
                >
                  {isLoading === card.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Accediendo...
                    </>
                  ) : (
                    <>
                      Acceder ahora
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Additional info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-12 text-center"
      >
        <div className="inline-flex items-center justify-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1 text-purple-500" />
            <span>Sin registro requerido</span>
          </div>
          <div className="flex items-center">
            <BarChart3 className="w-4 h-4 mr-1 text-blue-500" />
            <span>Datos de prueba incluidos</span>
          </div>
          <div className="flex items-center">
            <Building2 className="w-4 h-4 mr-1 text-gray-700" />
            <span>Todas las funciones activas</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
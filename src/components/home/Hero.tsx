import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Store, Camera, Star, Play, Sparkles, TrendingUp, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatsCounter } from "@/components/ui/stats-counter";
import socialMediaCreators from "@/assets/social-media-creators.jpg";
import fitnessCreators from "@/assets/fitness-creators.jpg";
import restaurantFood from "@/assets/restaurant-food-ugc.jpg";

export const Hero = () => {
  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02)_1px,transparent_1px)] [background-size:24px_24px]" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-screen text-center py-20">
          
          {/* Trust badge */}
          <div className="inline-flex items-center px-4 py-2 bg-black text-white text-sm rounded-full mb-8 font-medium">
            <Star className="w-4 h-4 mr-2 fill-current" />
            URContent - Plataforma de Creadores
            <div className="ml-3 flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
              ))}
            </div>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-black mb-6 leading-tight max-w-4xl">
            Conecta marcas con
            <br />
            <span className="font-semibold">creadores de contenido</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl leading-relaxed">
            La plataforma líder para colaboraciones entre influencers y marcas en Argentina.
            <br />
            <span className="text-black font-medium">Experiencias exclusivas para miembros.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link to="/onboarding/creator">
              <Button 
                size="lg" 
                className="bg-black hover:bg-gray-800 text-white px-8 py-4 h-auto text-lg font-medium rounded-full border-0 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <Camera className="mr-2 h-5 w-5" />
                Soy Creador
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Link to="/onboarding/business">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-black text-black hover:bg-black hover:text-white px-8 py-4 h-auto text-lg font-medium rounded-full transform hover:scale-105 transition-all duration-300"
              >
                <Store className="mr-2 h-5 w-5" />
                Soy Marca
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Link to="/membership">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-black text-black hover:bg-black hover:text-white px-8 py-4 h-auto text-lg font-medium rounded-full transform hover:scale-105 transition-all duration-300"
              >
                <Star className="mr-2 h-5 w-5" />
                Membresía
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Marketplace Access Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link to="/marketplace">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-gray-300 text-gray-700 hover:border-black hover:text-black px-8 py-3 h-auto text-base font-medium rounded-full transform hover:scale-105 transition-all duration-300"
              >
                <Camera className="mr-2 h-4 w-4" />
                Ver Creadores
              </Button>
            </Link>
            
            <Link to="/experiences">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-gray-300 text-gray-700 hover:border-black hover:text-black px-8 py-3 h-auto text-base font-medium rounded-full transform hover:scale-105 transition-all duration-300"
              >
                <Star className="mr-2 h-4 w-4" />
                Ver Experiencias
              </Button>
            </Link>
          </div>

          {/* Phone mockup showcase */}
          <div className="relative max-w-sm mx-auto mb-16">
            <div className="relative">
              {/* Phone frame */}
              <div className="relative bg-black rounded-[3rem] p-2 shadow-2xl">
                <div className="bg-white rounded-[2.5rem] overflow-hidden">
                  {/* Status bar */}
                  <div className="flex justify-between items-center px-6 py-3 bg-white">
                    <span className="text-sm font-semibold">9:41</span>
                    <div className="flex space-x-1">
                      <div className="w-4 h-2 bg-black rounded-sm"></div>
                      <div className="w-4 h-2 bg-black rounded-sm"></div>
                      <div className="w-6 h-2 bg-black rounded-sm"></div>
                    </div>
                  </div>
                  
                  {/* App content */}
                  <div className="px-6 py-4 bg-gray-50 min-h-[500px]">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold">URContent</h3>
                      <Badge className="bg-black text-white">PRO</Badge>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-white rounded-2xl p-4 shadow-sm">
                        <img 
                          src={restaurantFood} 
                          alt="Food content" 
                          className="w-full h-32 object-cover rounded-xl mb-3"
                        />
                        <h4 className="font-semibold text-sm mb-1">Café Tortoni</h4>
                        <p className="text-xs text-gray-600">Brunch Gratis • 2 Créditos</p>
                        <div className="flex items-center justify-between mt-3">
                          <Badge variant="outline" className="text-xs">Disponible</Badge>
                          <span className="text-xs text-green-600 font-medium">$4,500 valor</span>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-2xl p-4 shadow-sm">
                        <img 
                          src={fitnessCreators} 
                          alt="Fitness content" 
                          className="w-full h-32 object-cover rounded-xl mb-3"
                        />
                        <h4 className="font-semibold text-sm mb-1">Bliss Spa</h4>
                        <p className="text-xs text-gray-600">Masaje Relajante • 3 Créditos</p>
                        <div className="flex items-center justify-between mt-3">
                          <Badge variant="outline" className="text-xs">Solo VIP</Badge>
                          <span className="text-xs text-blue-600 font-medium">$8,000 valor</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                CREADOR PRO
              </div>
              <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                15 Colaboraciones
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <StatsCounter endValue={2500} className="text-3xl font-light text-black mb-1" />
              <p className="text-gray-600 text-sm">Creadores activos</p>
            </div>
            <div>
              <StatsCounter endValue={850} suffix="+" className="text-3xl font-light text-black mb-1" />
              <p className="text-gray-600 text-sm">Marcas registradas</p>
            </div>
            <div>
              <StatsCounter endValue={25000} suffix="+" className="text-3xl font-light text-black mb-1" />
              <p className="text-gray-600 text-sm">Colaboraciones exitosas</p>
            </div>
            <div>
              <StatsCounter endValue={96} suffix="%" className="text-3xl font-light text-black mb-1" />
              <p className="text-gray-600 text-sm">Satisfacción usuarios</p>
            </div>
          </div>

          {/* App download section */}
          <div className="mt-16 max-w-2xl">
            <p className="text-gray-600 mb-6">Disponible próximamente</p>
            <div className="flex justify-center space-x-4">
              <div className="bg-black text-white px-6 py-3 rounded-xl flex items-center space-x-3 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold text-sm">A</span>
                </div>
                <div className="text-left">
                  <p className="text-xs">Descargar en</p>
                  <p className="font-semibold">App Store</p>
                </div>
              </div>
              
              <div className="bg-black text-white px-6 py-3 rounded-xl flex items-center space-x-3 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Play className="w-4 h-4 text-black" />
                </div>
                <div className="text-left">
                  <p className="text-xs">Obtener en</p>
                  <p className="font-semibold">Google Play</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
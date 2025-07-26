import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { offersService, creditsService, type Offer } from "@/services";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Star, 
  Calendar,
  Users,
  TrendingUp,
  MessageCircle,
  Heart,
  Eye,
  ArrowRight,
  Verified,
  Grid3X3,
  List,
  CreditCard,
  Loader2,
  XCircle,
  RefreshCw
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BookingModal } from "@/components/booking/BookingModal";


const categories = [
  "Todos",
  "Beauty", 
  "Wellness",
  "Fitness", 
  "Restaurant",
  "Spa",
  "Salon",
  "Gimnasio",
  "Café"
];

const locations = [
  "Todas las ubicaciones",
  "Buenos Aires",
  "Córdoba", 
  "Rosario",
  "Mendoza",
  "La Plata"
];

const Experiences = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedLocation, setSelectedLocation] = useState("Todas las ubicaciones");
  const [creditsRange, setCreditsRange] = useState([1, 5]);
  const [valueRange, setValueRange] = useState([1000, 20000]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch all offers
  const { data: offers = [], isLoading: offersLoading, error: offersError } = useQuery({
    queryKey: ['offers'],
    queryFn: () => offersService.getOffers(),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Fetch user's credit balance
  const { data: userCredits = 0 } = useQuery({
    queryKey: ['user-credits', user?.id],
    queryFn: () => creditsService.getUserCreditBalance(user?.id!),
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000 // 2 minutes
  });

  // Helper function
  const getMembershipBadge = (tier: string) => {
    const tierConfig = {
      basic: { label: "Basic", className: "bg-gray-100 text-gray-800" },
      premium: { label: "Premium", className: "bg-blue-100 text-blue-800" },
      vip: { label: "VIP", className: "bg-purple-100 text-purple-800" }
    };
    const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig.basic;
    return (
      <Badge className={`text-xs px-2 py-1 rounded-full ${config.className}`}>
        {config.label}
      </Badge>
    );
  };

  // Filter offers based on search and filter criteria
  const filteredOffers = useMemo(() => {
    if (!offers.length) return [];

    return offers.filter(offer => {
      const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           offer.venue?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           offer.venue?.category?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "Todos" || 
                             offer.venue?.category?.toLowerCase() === selectedCategory.toLowerCase();
      
      const matchesLocation = selectedLocation === "Todas las ubicaciones" ||
                             (offer.venue?.location && offer.venue.location.includes(selectedLocation));
      
      const matchesCredits = offer.credit_cost >= creditsRange[0] && offer.credit_cost <= creditsRange[1];
      
      const matchesValue = offer.original_value >= valueRange[0] && offer.original_value <= valueRange[1];

      return matchesSearch && matchesCategory && matchesLocation && matchesCredits && matchesValue;
    });
  }, [offers, searchQuery, selectedCategory, selectedLocation, creditsRange, valueRange]);

  const handleBookingComplete = (booking: any) => {
    // Credits will be updated automatically via React Query refetch in BookingModal
    console.log('Booking completed:', booking);
  };

  // Loading state
  if (offersLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-20 flex justify-center items-center h-96">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <span className="text-gray-600 text-lg">Cargando experiencias...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (offersError) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-20 flex justify-center items-center h-96">
          <Card className="p-8 max-w-md mx-auto">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Error al cargar experiencias
              </h3>
              <p className="text-gray-600 mb-4">
                No se pudieron cargar las experiencias disponibles
              </p>
              <Button onClick={() => window.location.reload()} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-20">
        {/* Header Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-light text-black mb-4">
                Experiencias <span className="font-semibold">exclusivas te esperan</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Accede a más de 350 venues premium en Argentina. 
                Descubre ofertas exclusivas solo para miembros URContent.
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Busca salones, spas, restaurantes o gimnasios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg rounded-full border-gray-200 focus:border-black transition-colors"
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              <div className="text-center">
                <div className="text-3xl font-light text-black mb-2">350+</div>
                <div className="text-gray-600 text-sm">Venues Exclusivos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-black mb-2">1,200+</div>
                <div className="text-gray-600 text-sm">Miembros Activos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-black mb-2">98%</div>
                <div className="text-gray-600 text-sm">Satisfacción</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-black mb-2">Gratis</div>
                <div className="text-gray-600 text-sm">Para Miembros</div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters and Results */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filter Bar */}
            <div className="flex flex-col lg:flex-row gap-6 mb-8">
              <div className="flex-1">
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                  <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9 bg-gray-100 rounded-2xl p-1">
                    {categories.map((category) => (
                      <TabsTrigger
                        key={category}
                        value={category}
                        className="rounded-xl text-sm data-[state=active]:bg-black data-[state=active]:text-white"
                      >
                        {category}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="rounded-full px-6"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>

                <div className="flex border border-gray-200 rounded-full p-1">
                  <Button
                    size="sm"
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    onClick={() => setViewMode("grid")}
                    className="rounded-full px-3"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === "list" ? "default" : "ghost"}
                    onClick={() => setViewMode("list")}
                    className="rounded-full px-3"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <Card className="p-6 mb-8 border border-gray-200 rounded-3xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Créditos: {creditsRange[0]} - {creditsRange[1]}
                    </label>
                    <Slider
                      value={creditsRange}
                      onValueChange={setCreditsRange}
                      min={1}
                      max={5}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Valor: ${valueRange[0]} - ${valueRange[1]}
                    </label>
                    <Slider
                      value={valueRange}
                      onValueChange={setValueRange}
                      min={1000}
                      max={20000}
                      step={500}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSelectedLocation("Todas las ubicaciones");
                        setCreditsRange([1, 5]);
                        setValueRange([1000, 20000]);
                      }}
                      className="w-full rounded-2xl"
                    >
                      Limpiar Filtros
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Results Count */}
            <div className="flex items-center justify-between mb-8">
              <div className="text-gray-600">
                {filteredOffers.length} experiencias encontradas
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <CreditCard className="w-4 h-4" />
                <span>Tus créditos: {userCredits}</span>
              </div>
            </div>

            {/* Offers Grid/List */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredOffers.map((offer) => (
                  <OfferCard 
                    key={offer.id} 
                    offer={offer} 
                    userCredits={userCredits} 
                    onBookingComplete={handleBookingComplete}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOffers.map((offer) => (
                  <OfferListItem 
                    key={offer.id} 
                    offer={offer} 
                    userCredits={userCredits} 
                    onBookingComplete={handleBookingComplete}
                  />
                ))}
              </div>
            )}

            {/* Load More */}
            {filteredOffers.length > 0 && (
              <div className="text-center mt-12">
                <Button variant="outline" className="rounded-full px-8 py-3">
                  Ver Más Experiencias
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

const OfferCard = ({ offer, userCredits, onBookingComplete }: { 
  offer: Offer; 
  userCredits: number; 
  onBookingComplete: (booking: any) => void; 
}) => {
  return (
    <Card className="group bg-white border border-gray-100 rounded-3xl overflow-hidden hover:border-gray-200 hover:shadow-xl hover:shadow-black/5 transition-all duration-300 cursor-pointer">
      {/* Offer Images */}
      <div className="relative h-48 bg-gray-100">
        <div className="grid grid-cols-3 h-full">
          {offer.images?.slice(0, 3).map((img: string, idx: number) => (
            <div key={idx} className="relative overflow-hidden">
              <img 
                src={img} 
                alt="" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
        
        {/* Verification Badge */}
        {offer.venue?.is_verified && (
          <div className="absolute top-3 right-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-1">
              <Verified className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        )}

        {/* Credits Badge */}
        <div className="absolute top-3 left-3">
          <div className="bg-black/80 text-white px-2 py-1 rounded-full text-xs font-medium">
            {offer.credit_cost} créditos
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Basic Info */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-black truncate">{offer.title}</h3>
            {getMembershipBadge(offer.required_membership || 'basic')}
          </div>
          <p className="text-gray-500 text-sm font-medium">{offer.venue?.name}</p>
          <div className="flex items-center space-x-1 text-gray-400 text-xs mt-1">
            <MapPin className="w-3 h-3" />
            <span>{offer.venue?.location || offer.venue?.address}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {offer.description}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4 py-3 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="font-medium">{offer.venue?.rating || 0}</span>
              <span className="text-gray-500">({offer.reservations?.length || 0})</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{offer.duration_minutes}min</span>
            </div>
          </div>
        </div>

        {/* Value and Availability */}
        <div className="mb-4">
          <div className="text-center mb-2">
            <div className="text-gray-500 text-xs line-through">${offer.original_value}</div>
            <div className="text-green-600 font-bold text-lg">GRATIS</div>
          </div>
          <div className="text-center text-xs text-gray-500">
            {offer.is_active ? 'Disponible' : 'No disponible'}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <BookingModal
            offer={offer}
            onBookingComplete={onBookingComplete}
            trigger={
              <Button size="sm" className="flex-1 bg-black hover:bg-gray-800 text-white rounded-full">
                <Calendar className="w-4 h-4 mr-2" />
                Reservar
              </Button>
            }
          />
          <Button size="sm" variant="outline" className="rounded-full px-3">
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

const OfferListItem = ({ offer, userCredits, onBookingComplete }: { 
  offer: Offer; 
  userCredits: number; 
  onBookingComplete: (booking: any) => void; 
}) => {
  return (
    <Card className="group bg-white border border-gray-100 rounded-3xl p-6 hover:border-gray-200 hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
      <div className="flex items-start space-x-6">
        {/* Offer Image */}
        <div className="w-32 h-32 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0">
          <img 
            src={offer.images?.[0] || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=300&fit=crop"} 
            alt={offer.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-xl font-semibold text-black">{offer.title}</h3>
                {offer.venue?.is_verified && <Verified className="w-4 h-4 text-blue-600" />}
              </div>
              <p className="text-gray-500 font-medium">{offer.venue?.name}</p>
              <div className="flex items-center space-x-1 text-gray-400 text-sm mt-1">
                <MapPin className="w-4 h-4" />
                <span>{offer.venue?.location || offer.venue?.address}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-gray-500 text-sm line-through">${offer.original_value}</div>
              <div className="text-green-600 font-bold text-xl">GRATIS</div>
              <div className="text-black font-medium text-sm">{offer.credit_cost} créditos</div>
            </div>
          </div>

          <p className="text-gray-600 mb-4 line-clamp-2">
            {offer.description}
          </p>

          {/* Stats and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{offer.venue?.rating || 0}</span>
                  <span className="text-gray-500">({offer.reservations?.length || 0})</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{offer.duration_minutes}min</span>
                </div>
                {getMembershipBadge(offer.required_membership || 'basic')}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-500">
                {offer.is_active ? 'Disponible' : 'No disponible'}
              </span>
              <BookingModal
                offer={offer}
                onBookingComplete={onBookingComplete}
                trigger={
                  <Button size="sm" className="bg-black hover:bg-gray-800 text-white rounded-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    Reservar
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Experiences;
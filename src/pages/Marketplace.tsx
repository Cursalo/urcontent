import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Filter, 
  MapPin, 
  Users, 
  TrendingUp, 
  Star, 
  Instagram, 
  Youtube, 
  MessageCircle,
  Heart,
  Eye,
  ArrowRight,
  Verified,
  Grid3X3,
  List,
  Send,
  Bookmark,
  BarChart3,
  Calendar,
  Camera,
  PlayCircle,
  Zap,
  Award,
  DollarSign,
  Loader2
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { creatorService, Creator } from "@/services";
import { ContactCreatorModal } from "@/components/modals/ContactCreatorModal";


const categories = ["Todos", "Lifestyle", "Fitness", "Beauty", "Food", "Travel", "Tech", "Fashion"];
const locations = ["Todas las ubicaciones", "Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata"];

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedLocation, setSelectedLocation] = useState("Todas las ubicaciones");
  const [followersRange, setFollowersRange] = useState([10000, 500000]);
  const [priceRange, setPriceRange] = useState([5000, 60000]);
  const [engagementRange, setEngagementRange] = useState([3, 10]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper functions
  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  const formatPrice = (min: number, max: number) => {
    return `$${(min / 1000).toFixed(0)}K - $${(max / 1000).toFixed(0)}K`;
  };

  // Fetch creators data
  useEffect(() => {
    const fetchCreators = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await creatorService.getCreators({
          search: searchQuery || undefined,
          category: selectedCategory !== "Todos" ? selectedCategory : undefined,
          location: selectedLocation !== "Todas las ubicaciones" ? selectedLocation : undefined,
          isAvailable: true,
        });
        setCreators(data);
      } catch (err) {
        console.error('Error fetching creators:', err);
        setError('Error al cargar los creadores. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchCreators();
  }, [searchQuery, selectedCategory, selectedLocation]);

  // Filter creators based on ranges (client-side filtering for complex range filters)
  const filteredCreators = creators.filter(creator => {
    const totalFollowers = (creator.instagram_followers || 0) + (creator.youtube_followers || 0) + (creator.tiktok_followers || 0);
    const matchesFollowers = totalFollowers >= followersRange[0] && totalFollowers <= followersRange[1];
    
    const avgPrice = ((creator.min_price || 0) + (creator.max_price || 0)) / 2;
    const matchesPrice = avgPrice >= priceRange[0] && avgPrice <= priceRange[1];
    
    const matchesEngagement = (creator.engagement_rate || 0) >= engagementRange[0] && 
                             (creator.engagement_rate || 0) <= engagementRange[1];

    return matchesFollowers && matchesPrice && matchesEngagement;
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-20">
        {/* Header Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-light text-black mb-4">
                Descubre <span className="font-semibold">creadores de contenido</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Conecta con más de 2,500 influencers y creadores de contenido verificados en Argentina. 
                Encuentra el partner perfecto para tu marca.
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Busca por nombre, especialidad o categoría..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg rounded-full border-gray-200 focus:border-black transition-colors"
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              <div className="text-center">
                <div className="text-3xl font-light text-black mb-2">2,500+</div>
                <div className="text-gray-600 text-sm">Creadores Activos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-black mb-2">850+</div>
                <div className="text-gray-600 text-sm">Marcas Conectadas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-black mb-2">25K+</div>
                <div className="text-gray-600 text-sm">Colaboraciones</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-black mb-2">96%</div>
                <div className="text-gray-600 text-sm">Satisfacción</div>
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
                  <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-gray-100 rounded-2xl p-1">
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
                      Seguidores: {formatFollowers(followersRange[0])} - {formatFollowers(followersRange[1])}
                    </label>
                    <Slider
                      value={followersRange}
                      onValueChange={setFollowersRange}
                      min={10000}
                      max={500000}
                      step={10000}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Precio: ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
                    </label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      min={5000}
                      max={60000}
                      step={2500}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Engagement: {engagementRange[0]}% - {engagementRange[1]}%
                    </label>
                    <Slider
                      value={engagementRange}
                      onValueChange={setEngagementRange}
                      min={3}
                      max={10}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedLocation("Todas las ubicaciones");
                      setFollowersRange([10000, 500000]);
                      setPriceRange([5000, 60000]);
                      setEngagementRange([3, 10]);
                    }}
                    className="rounded-2xl"
                  >
                    Limpiar Filtros
                  </Button>
                </div>
              </Card>
            )}

            {/* Results Count */}
            <div className="flex items-center justify-between mb-8">
              {loading ? (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Cargando creadores...</span>
                </div>
              ) : error ? (
                <div className="text-red-600">
                  {error}
                </div>
              ) : (
                <div className="text-gray-600">
                  {filteredCreators.length} creadores encontrados
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-sm">
                  {filteredCreators.filter(c => c.is_available).length} disponibles
                </Badge>
              </div>
            </div>

            {/* Creators Grid/List */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Cargando creadores...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline" 
                    className="rounded-full"
                  >
                    Reintentar
                  </Button>
                </div>
              </div>
            ) : filteredCreators.length === 0 ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">No se encontraron creadores con los filtros seleccionados.</p>
                  <Button 
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("Todos");
                      setSelectedLocation("Todas las ubicaciones");
                      setFollowersRange([10000, 500000]);
                      setPriceRange([5000, 60000]);
                      setEngagementRange([3, 10]);
                    }}
                    variant="outline" 
                    className="rounded-full"
                  >
                    Limpiar Filtros
                  </Button>
                </div>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredCreators.map((creator) => (
                  <CreatorCard key={creator.id} creator={creator} onViewProfile={setSelectedCreator} />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredCreators.map((creator) => (
                  <CreatorListItem key={creator.id} creator={creator} onViewProfile={setSelectedCreator} />
                ))}
              </div>
            )}

            {/* Load More */}
            {filteredCreators.length > 0 && (
              <div className="text-center mt-12">
                <Button variant="outline" className="rounded-full px-8 py-3">
                  Ver Más Creadores
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Creator Profile Modal */}
      <Dialog open={!!selectedCreator} onOpenChange={() => setSelectedCreator(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedCreator && <CreatorProfile creator={selectedCreator} />}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

const CreatorCard = ({ creator, onViewProfile }: { creator: Creator; onViewProfile: (creator: Creator) => void }) => {
  const totalFollowers = (creator.instagram_followers || 0) + (creator.youtube_followers || 0) + (creator.tiktok_followers || 0);

  return (
    <Card className="group bg-white border border-gray-100 rounded-3xl overflow-hidden hover:border-gray-200 hover:shadow-xl hover:shadow-black/5 transition-all duration-300 cursor-pointer">
      {/* Cover Image */}
      <div className="relative h-32 bg-gradient-to-r from-gray-100 to-gray-200">
        <img 
          src={creator.cover_image || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop'} 
          alt="" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
        
        {/* Verification Badge */}
        {creator.is_verified && (
          <div className="absolute top-3 right-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-1">
              <Verified className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        )}

        {/* Availability Badge */}
        <div className="absolute top-3 left-3">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            creator.is_available 
              ? 'bg-green-500/90 text-white' 
              : 'bg-gray-500/90 text-white'
          }`}>
            {creator.is_available ? 'Disponible' : 'Ocupado'}
          </div>
        </div>
      </div>

      {/* Avatar */}
      <div className="relative px-6 -mt-12">
        <Avatar className="w-20 h-20 border-4 border-white">
          <AvatarImage src={creator.user.avatar_url || undefined} alt={creator.user.full_name} />
          <AvatarFallback>{creator.user.full_name?.split(' ').map(n => n[0]).join('') || 'UN'}</AvatarFallback>
        </Avatar>
      </div>

      <div className="p-6 pt-3">
        {/* Basic Info */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-black truncate">{creator.user.full_name}</h3>
            <Badge variant="outline" className="text-xs">
              {creator.category}
            </Badge>
          </div>
          <p className="text-gray-500 text-sm font-medium">@{creator.username}</p>
          <div className="flex items-center space-x-1 text-gray-400 text-xs mt-1">
            <MapPin className="w-3 h-3" />
            <span>{creator.location || 'Argentina'}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 py-3 border-t border-gray-100 text-sm">
          <div>
            <div className="flex items-center space-x-1 mb-1">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-black">{formatFollowers(totalFollowers)}</span>
            </div>
            <div className="text-xs text-gray-500">Seguidores totales</div>
          </div>
          <div>
            <div className="flex items-center space-x-1 mb-1">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-black">{creator.engagement_rate || 0}%</span>
            </div>
            <div className="text-xs text-gray-500">Engagement</div>
          </div>
        </div>

        {/* Price and Rating */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-medium text-black">
              {formatPrice(creator.min_price || 0, creator.max_price || 0)}
            </div>
            <div className="text-xs text-gray-500">por colaboración</div>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{creator.average_rating || 0}</span>
            <span className="text-xs text-gray-500">({creator.total_collaborations || 0})</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            onClick={() => onViewProfile(creator)}
            className="flex-1 bg-black hover:bg-gray-800 text-white rounded-full"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver Perfil
          </Button>
          <Button size="sm" variant="outline" className="rounded-full px-3">
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

const CreatorListItem = ({ creator, onViewProfile }: { creator: Creator; onViewProfile: (creator: Creator) => void }) => {
  const totalFollowers = (creator.instagram_followers || 0) + (creator.youtube_followers || 0) + (creator.tiktok_followers || 0);

  return (
    <Card className="group bg-white border border-gray-100 rounded-3xl p-6 hover:border-gray-200 hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
      <div className="flex items-start space-x-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Avatar className="w-16 h-16">
            <AvatarImage src={creator.user.avatar_url || undefined} alt={creator.user.full_name} />
            <AvatarFallback>{creator.user.full_name?.split(' ').map(n => n[0]).join('') || 'UN'}</AvatarFallback>
          </Avatar>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-xl font-semibold text-black">{creator.user.full_name}</h3>
                {creator.is_verified && <Verified className="w-4 h-4 text-blue-600" />}
              </div>
              <p className="text-gray-500 font-medium">@{creator.username}</p>
              <div className="flex items-center space-x-1 text-gray-400 text-sm mt-1">
                <MapPin className="w-4 h-4" />
                <span>{creator.location || 'Argentina'}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-semibold text-black">
                {formatPrice(creator.min_price || 0, creator.max_price || 0)}
              </div>
              <div className="text-sm text-gray-500">por colaboración</div>
              <Badge className={`mt-2 ${creator.is_available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {creator.is_available ? 'Disponible' : 'Ocupado'}
              </Badge>
            </div>
          </div>

          <p className="text-gray-600 mb-4 line-clamp-2">
            {creator.bio || 'Content creator profesional'}
          </p>

          {/* Stats and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{formatFollowers(totalFollowers)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{creator.engagement_rate || 0}%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{creator.average_rating || 0}</span>
                  <span className="text-gray-500">({creator.total_collaborations || 0})</span>
                </div>
              </div>
              <Badge variant="outline">{creator.category}</Badge>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-500">{creator.response_time || '< 24 horas'}</span>
              <Button 
                size="sm" 
                onClick={() => onViewProfile(creator)}
                className="bg-black hover:bg-gray-800 text-white rounded-full"
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver Perfil
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const CreatorProfile = ({ creator }: { creator: Creator }) => {
  const totalFollowers = (creator.instagram_followers || 0) + (creator.youtube_followers || 0) + (creator.tiktok_followers || 0);

  return (
    <div>
      <DialogHeader className="text-left">
        <DialogTitle className="text-2xl">Perfil del Creador</DialogTitle>
        <DialogDescription>
          {creator.user.full_name} • @{creator.username}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 mt-6">
        {/* Header */}
        <div className="flex items-start space-x-6">
          <Avatar className="w-20 h-20">
            <AvatarImage src={creator.user.avatar_url || undefined} alt={creator.user.full_name} />
            <AvatarFallback>{creator.user.full_name?.split(' ').map(n => n[0]).join('') || 'UN'}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h2 className="text-2xl font-semibold text-black">{creator.user.full_name}</h2>
              {creator.is_verified && <Verified className="w-5 h-5 text-blue-600" />}
            </div>
            <p className="text-gray-600 mb-3">{creator.bio || 'Content creator profesional'}</p>
            <div className="flex items-center space-x-4 text-sm">
              <Badge variant="outline">{creator.category}</Badge>
              <div className="flex items-center space-x-1 text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>{creator.location || 'Argentina'}</span>
              </div>
              <Badge className={creator.is_available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {creator.is_available ? 'Disponible' : 'Ocupado'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 p-6 bg-gray-50 rounded-2xl">
          <div className="text-center">
            <div className="text-2xl font-bold text-black mb-1">{formatFollowers(totalFollowers)}</div>
            <div className="text-sm text-gray-600">Seguidores</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-black mb-1">{creator.engagement_rate || 0}%</div>
            <div className="text-sm text-gray-600">Engagement</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-black mb-1">{creator.average_rating || 0}</div>
            <div className="text-sm text-gray-600">Rating</div>
          </div>
        </div>

        {/* Portfolio */}
        <div>
          <h3 className="text-lg font-semibold text-black mb-4">Portfolio</h3>
          <div className="grid grid-cols-3 gap-4">
            {creator.portfolio && creator.portfolio.length > 0 ? (
              creator.portfolio.map((item, index) => (
                <div key={item.id || index} className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                  <img 
                    src={item.media_url || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=300&fit=crop'} 
                    alt={item.title || ''} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              ))
            ) : (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/photo-${1522202176988 + index}?w=300&h=300&fit=crop`} 
                    alt="" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Specialties */}
        <div>
          <h3 className="text-lg font-semibold text-black mb-4">Especialidades</h3>
          <div className="flex flex-wrap gap-2">
            {creator.specialties && creator.specialties.length > 0 ? (
              creator.specialties.map((specialty: string) => (
                <Badge key={specialty} variant="outline">{specialty}</Badge>
              ))
            ) : (
              <Badge variant="outline">{creator.category}</Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-6 border-t">
          <Button className="flex-1 bg-black hover:bg-gray-800 text-white rounded-2xl">
            <Send className="w-4 h-4 mr-2" />
            Enviar Propuesta
          </Button>
          <Button variant="outline" className="rounded-2xl px-6">
            <Bookmark className="w-4 h-4 mr-2" />
            Guardar
          </Button>
          <Button variant="outline" className="rounded-2xl px-6">
            <MessageCircle className="w-4 h-4 mr-2" />
            Mensaje
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, MapPin, Star, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useIsMobile } from '@/hooks/use-mobile';
import { CreatorCard } from './CreatorCard';
import { FilterSidebar } from './FilterSidebar';
import { SearchBar } from './SearchBar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export interface Creator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  coverImage?: string;
  bio: string;
  location: string;
  rating: number;
  reviewCount: number;
  followerCount: number;
  categories: string[];
  specialties: string[];
  priceRange: {
    min: number;
    max: number;
  };
  verified: boolean;
  responseTime: string;
  completionRate: number;
  portfolio: {
    id: string;
    url: string;
    type: 'image' | 'video';
    title: string;
  }[];
  socialStats: {
    instagram?: number;
    tiktok?: number;
    youtube?: number;
    twitter?: number;
  };
  availableForBooking: boolean;
  lastActive: string;
  languages: string[];
  experience: string;
}

export interface MarketplaceFilters {
  search: string;
  categories: string[];
  location: string;
  priceRange: [number, number];
  rating: number;
  specialties: string[];
  languages: string[];
  sortBy: 'relevance' | 'rating' | 'price_low' | 'price_high' | 'newest' | 'popular';
  availability: 'all' | 'available' | 'busy';
}

const MOCK_CREATORS: Creator[] = [
  {
    id: '1',
    name: 'María González',
    username: 'mariag_creates',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b412?w=150&h=150&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=200&fit=crop',
    bio: 'Lifestyle & beauty content creator especializada en productos naturales y rutinas de skincare.',
    location: 'Buenos Aires, Argentina',
    rating: 4.9,
    reviewCount: 127,
    followerCount: 85000,
    categories: ['Beauty', 'Lifestyle', 'Wellness'],
    specialties: ['Skincare', 'Makeup Tutorials', 'Product Reviews'],
    priceRange: { min: 500, max: 2000 },
    verified: true,
    responseTime: '2 horas',
    completionRate: 98,
    portfolio: [
      { id: '1', url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=200&fit=crop', type: 'image', title: 'Skincare Routine' },
      { id: '2', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=200&fit=crop', type: 'image', title: 'Natural Beauty' }
    ],
    socialStats: { instagram: 85000, tiktok: 45000, youtube: 12000 },
    availableForBooking: true,
    lastActive: '2 horas',
    languages: ['Español', 'English'],
    experience: '3+ años'
  },
  {
    id: '2',
    name: 'Carlos Mendoza',
    username: 'carlosfit',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1571019613914-85f342c6a11e?w=400&h=200&fit=crop',
    bio: 'Fitness trainer y content creator enfocado en entrenamientos funcionales y nutrición deportiva.',
    location: 'Córdoba, Argentina',
    rating: 4.8,
    reviewCount: 89,
    followerCount: 120000,
    categories: ['Fitness', 'Health', 'Sports'],
    specialties: ['Workout Videos', 'Nutrition Tips', 'Equipment Reviews'],
    priceRange: { min: 800, max: 3000 },
    verified: true,
    responseTime: '1 hora',
    completionRate: 95,
    portfolio: [
      { id: '3', url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300&h=200&fit=crop', type: 'image', title: 'Home Workout' },
      { id: '4', url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=300&h=200&fit=crop', type: 'image', title: 'Gym Training' }
    ],
    socialStats: { instagram: 120000, tiktok: 75000, youtube: 25000 },
    availableForBooking: true,
    lastActive: '1 hora',
    languages: ['Español', 'English'],
    experience: '5+ años'
  },
  {
    id: '3',
    name: 'Ana Silva',
    username: 'anafood',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop',
    bio: 'Chef profesional y food blogger especializada en cocina argentina y recetas saludables.',
    location: 'Mendoza, Argentina',
    rating: 4.7,
    reviewCount: 156,
    followerCount: 95000,
    categories: ['Food', 'Cooking', 'Restaurant'],
    specialties: ['Recipe Videos', 'Restaurant Reviews', 'Cooking Tips'],
    priceRange: { min: 600, max: 2500 },
    verified: false,
    responseTime: '3 horas',
    completionRate: 92,
    portfolio: [
      { id: '5', url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop', type: 'image', title: 'Gourmet Dish' },
      { id: '6', url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=200&fit=crop', type: 'image', title: 'Food Styling' }
    ],
    socialStats: { instagram: 95000, tiktok: 30000, youtube: 18000 },
    availableForBooking: false,
    lastActive: '1 día',
    languages: ['Español'],
    experience: '4+ años'
  }
];

const CATEGORIES = ['Beauty', 'Fitness', 'Food', 'Fashion', 'Tech', 'Travel', 'Lifestyle', 'Gaming', 'Music', 'Art'];
const SPECIALTIES = ['Product Reviews', 'Tutorials', 'Unboxing', 'Lifestyle Content', 'Educational', 'Entertainment'];
const LANGUAGES = ['Español', 'English', 'Português', 'Français'];
const LOCATIONS = ['Buenos Aires', 'Córdoba', 'Mendoza', 'Rosario', 'La Plata', 'Mar del Plata'];

export const CreatorMarketplace: React.FC = () => {
  const [creators, setCreators] = useState<Creator[]>(MOCK_CREATORS);
  const [filteredCreators, setFilteredCreators] = useState<Creator[]>(creators);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<MarketplaceFilters>({
    search: '',
    categories: [],
    location: '',
    priceRange: [0, 5000],
    rating: 0,
    specialties: [],
    languages: [],
    sortBy: 'relevance',
    availability: 'all'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const isMobile = useIsMobile();

  // Filter and sort creators
  useEffect(() => {
    let filtered = [...creators];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(creator =>
        creator.name.toLowerCase().includes(searchTerm) ||
        creator.bio.toLowerCase().includes(searchTerm) ||
        creator.categories.some(cat => cat.toLowerCase().includes(searchTerm)) ||
        creator.specialties.some(spec => spec.toLowerCase().includes(searchTerm))
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(creator =>
        creator.categories.some(cat => filters.categories.includes(cat))
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(creator =>
        creator.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Price range filter
    filtered = filtered.filter(creator =>
      creator.priceRange.min >= filters.priceRange[0] &&
      creator.priceRange.max <= filters.priceRange[1]
    );

    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(creator => creator.rating >= filters.rating);
    }

    // Specialty filter
    if (filters.specialties.length > 0) {
      filtered = filtered.filter(creator =>
        creator.specialties.some(spec => filters.specialties.includes(spec))
      );
    }

    // Language filter
    if (filters.languages.length > 0) {
      filtered = filtered.filter(creator =>
        creator.languages.some(lang => filters.languages.includes(lang))
      );
    }

    // Availability filter
    if (filters.availability === 'available') {
      filtered = filtered.filter(creator => creator.availableForBooking);
    } else if (filters.availability === 'busy') {
      filtered = filtered.filter(creator => !creator.availableForBooking);
    }

    // Sort
    switch (filters.sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'price_low':
        filtered.sort((a, b) => a.priceRange.min - b.priceRange.min);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.priceRange.max - a.priceRange.max);
        break;
      case 'popular':
        filtered.sort((a, b) => b.followerCount - a.followerCount);
        break;
      case 'newest':
        // For demo purposes, we'll sort by id (newest first)
        filtered.sort((a, b) => b.id.localeCompare(a.id));
        break;
      default:
        // Relevance - keep original order with verified creators first
        filtered.sort((a, b) => {
          if (a.verified && !b.verified) return -1;
          if (!a.verified && b.verified) return 1;
          return b.rating - a.rating;
        });
    }

    setFilteredCreators(filtered);
  }, [creators, filters]);

  const handleFilterChange = (newFilters: Partial<MarketplaceFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      categories: [],
      location: '',
      priceRange: [0, 5000],
      rating: 0,
      specialties: [],
      languages: [],
      sortBy: 'relevance',
      availability: 'all'
    });
  };

  const loadMore = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPage(prev => prev + 1);
      setLoading(false);
      // For demo, stop loading after page 3
      if (page >= 2) {
        setHasMore(false);
      }
    }, 1000);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Marketplace de Creators
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Encuentra el creator perfecto para tu marca. Más de 1,000 creators verificados listos para colaborar.
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4"/>
                  <span>1,000+ Creators</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4"/>
                  <span>4.8 Rating promedio</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4"/>
                  <span>Respuesta en 24hs</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Filters - Desktop */}
            {!isMobile && (
              <div className="w-80 flex-shrink-0">
                <FilterSidebar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={clearFilters}
                  categories={CATEGORIES}
                  specialties={SPECIALTIES}
                  languages={LANGUAGES}
                  locations={LOCATIONS}
                />
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1">
              {/* Search and Controls */}
              <div className="space-y-4 mb-6">
                <SearchBar
                  value={filters.search}
                  onChange={(search) => handleFilterChange({ search })}
                  placeholder="Buscar creators por nombre, especialidad o categoría..."
                />

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Mobile Filter Button */}
                    {isMobile && (
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Filter className="h-4 w-4 mr-2"/>
                            Filtros
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-full max-w-sm">
                          <SheetHeader>
                            <SheetTitle>Filtros</SheetTitle>
                          </SheetHeader>
                          <div className="mt-6">
                            <FilterSidebar
                              filters={filters}
                              onFilterChange={handleFilterChange}
                              onClearFilters={clearFilters}
                              categories={CATEGORIES}
                              specialties={SPECIALTIES}
                              languages={LANGUAGES}
                              locations={LOCATIONS}
                            />
                          </div>
                        </SheetContent>
                      </Sheet>
                    )}

                    {/* Sort */}
                    <Select
                      value={filters.sortBy}
                      onValueChange={(sortBy: MarketplaceFilters['sortBy']) => 
                        handleFilterChange({ sortBy })
                      }
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Ordenar por"/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevancia</SelectItem>
                        <SelectItem value="rating">Mejor valorados</SelectItem>
                        <SelectItem value="price_low">Precio: menor a mayor</SelectItem>
                        <SelectItem value="price_high">Precio: mayor a menor</SelectItem>
                        <SelectItem value="popular">Más populares</SelectItem>
                        <SelectItem value="newest">Más recientes</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* View Mode */}
                    <div className="flex rounded border">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="rounded-r-none"
                      >
                        Grid
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="rounded-l-none"
                      >
                        Lista
                      </Button>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {filteredCreators.length} creator{filteredCreators.length !== 1 ? 's' : ''} encontrado{filteredCreators.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Active Filters */}
                {(filters.categories.length > 0 || filters.specialties.length > 0 || 
                  filters.languages.length > 0 || filters.location) && (
                  <div className="flex flex-wrap gap-2">
                    {filters.categories.map(category => (
                      <Badge 
                        key={category} 
                        variant="secondary" 
                        className="cursor-pointer"
                        onClick={() => {
                          handleFilterChange({
                            categories: filters.categories.filter(c => c !== category)
                          });
                        }}
                      >
                        {category} ×
                      </Badge>
                    ))}
                    {filters.specialties.map(specialty => (
                      <Badge 
                        key={specialty} 
                        variant="secondary" 
                        className="cursor-pointer"
                        onClick={() => {
                          handleFilterChange({
                            specialties: filters.specialties.filter(s => s !== specialty)
                          });
                        }}
                      >
                        {specialty} ×
                      </Badge>
                    ))}
                    {filters.languages.map(language => (
                      <Badge 
                        key={language} 
                        variant="secondary" 
                        className="cursor-pointer"
                        onClick={() => {
                          handleFilterChange({
                            languages: filters.languages.filter(l => l !== language)
                          });
                        }}
                      >
                        {language} ×
                      </Badge>
                    ))}
                    {filters.location && (
                      <Badge 
                        variant="secondary" 
                        className="cursor-pointer"
                        onClick={() => {
                          handleFilterChange({ location: '' });
                        }}
                      >
                        <MapPin className="h-3 w-3 mr-1"/>
                        {filters.location} ×
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs"
                    >
                      Limpiar todo
                    </Button>
                  </div>
                )}
              </div>

              {/* Results */}
              <AnimatePresence mode="wait">
                {filteredCreators.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12"
                  >
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold mb-2">No se encontraron creators</h3>
                    <p className="text-muted-foreground mb-4">
                      Intenta ajustar tus filtros o realizar una búsqueda diferente.
                    </p>
                    <Button onClick={clearFilters} variant="outline">
                      Limpiar filtros
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`grid gap-6 ${
                      viewMode === 'grid' 
                        ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                        : 'grid-cols-1'
                    }`}
                  >
                    {filteredCreators.map((creator, index) => (
                      <motion.div
                        key={creator.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <CreatorCard
                          creator={creator}
                          viewMode={viewMode}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Load More */}
              {hasMore && filteredCreators.length > 0 && (
                <div className="text-center mt-8">
                  <Button
                    onClick={loadMore}
                    disabled={loading}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner className="mr-2"/>
                        Cargando...
                      </>
                    ) : (
                      'Cargar más creators'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default CreatorMarketplace;
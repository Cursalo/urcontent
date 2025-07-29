import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Users, Clock, CheckCircle, Instagram, Youtube, Zap, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { formatNumber } from '@/lib/utils';
import { Creator } from './CreatorMarketplace';

interface CreatorCardProps {
  creator: Creator;
  viewMode?: 'grid' | 'list';
  onContact?: (creatorId: string) => void;
  onBookmark?: (creatorId: string) => void;
  className?: string;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({
  creator,
  viewMode = 'grid',
  onContact,
  onBookmark,
  className = ''
}) => {
  const {
    id,
    name,
    username,
    avatar,
    coverImage,
    bio,
    location,
    rating,
    reviewCount,
    followerCount,
    categories,
    specialties,
    priceRange,
    verified,
    responseTime,
    completionRate,
    portfolio,
    socialStats,
    availableForBooking,
    lastActive,
    languages,
    experience
  } = creator;

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onContact?.(id);
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onBookmark?.(id);
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className={className}
      >
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-200">
          <div className="flex flex-col md:flex-row">
            {/* Cover Image */}
            <div className="md:w-48 md:flex-shrink-0">
              <AspectRatio ratio={16/9} className="md:aspect-square">
                {coverImage ? (
                  <OptimizedImage
                    src={coverImage}
                    alt={`${name} cover`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Users className="h-12 w-12 text-primary/40" />
                  </div>
                )}
              </AspectRatio>
            </div>

            <CardContent className="flex-1 p-6">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* Main Info */}
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={avatar} alt={name} />
                      <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Link to={`/creator/${id}`} className="hover:underline">
                          <h3 className="font-semibold text-lg text-foreground">{name}</h3>
                        </Link>
                        {verified && (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">@{username}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current text-yellow-400" />
                          <span>{rating}</span>
                          <span>({reviewCount})</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-muted-foreground line-clamp-2">{bio}</p>

                  {/* Categories & Specialties */}
                  <div className="flex flex-wrap gap-1">
                    {categories.slice(0, 2).map(category => (
                      <Badge key={category} variant="secondary" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                    {specialties.slice(0, 2).map(specialty => (
                      <Badge key={specialty} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {(categories.length + specialties.length) > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{(categories.length + specialties.length) - 4}
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{formatNumber(followerCount)} seguidores</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Responde en {responseTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      <span>{completionRate}% completado</span>
                    </div>
                  </div>
                </div>

                {/* Right Side - Price & Actions */}
                <div className="md:w-48 md:flex-shrink-0 space-y-3">
                  {/* Availability */}
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    availableForBooking 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      availableForBooking ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    {availableForBooking ? 'Disponible' : 'Ocupado'}
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <div className="text-lg font-semibold text-foreground">
                      ${priceRange.min.toLocaleString()} - ${priceRange.max.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">por proyecto</div>
                  </div>

                  {/* Social Stats */}
                  <div className="flex items-center gap-2 justify-end">
                    {socialStats.instagram && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Instagram className="h-3 w-3" />
                        <span>{formatNumber(socialStats.instagram)}</span>
                      </div>
                    )}
                    {socialStats.youtube && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Youtube className="h-3 w-3" />
                        <span>{formatNumber(socialStats.youtube)}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button 
                      size="sm" 
                      className="w-full"
                      disabled={!availableForBooking}
                      onClick={handleContactClick}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contactar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      asChild
                    >
                      <Link to={`/creator/${id}`}>
                        Ver perfil
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
        {/* Cover Image */}
        <div className="relative">
          <AspectRatio ratio={16/9}>
            {coverImage ? (
              <OptimizedImage
                src={coverImage}
                alt={`${name} cover`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Users className="h-12 w-12 text-primary/40" />
              </div>
            )}
          </AspectRatio>

          {/* Availability Badge */}
          <div className="absolute top-3 right-3">
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
              availableForBooking 
                ? 'bg-green-500/90 text-white'
                : 'bg-gray-500/90 text-white'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-1 ${
                availableForBooking ? 'bg-white' : 'bg-gray-200'
              }`} />
              {availableForBooking ? 'Disponible' : 'Ocupado'}
            </div>
          </div>

          {/* Portfolio Preview */}
          {portfolio.length > 0 && (
            <div className="absolute bottom-3 left-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {portfolio.slice(0, 3).map((item, index) => (
                <div key={item.id} className="w-8 h-8 rounded overflow-hidden border-2 border-white shadow-sm">
                  <OptimizedImage
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {portfolio.length > 3 && (
                <div className="w-8 h-8 rounded bg-black/50 flex items-center justify-center text-white text-xs font-medium">
                  +{portfolio.length - 3}
                </div>
              )}
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Link to={`/creator/${id}`} className="hover:underline">
                  <h3 className="font-semibold text-foreground truncate">{name}</h3>
                </Link>
                {verified && (
                  <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">@{username}</p>
            </div>
          </div>

          {/* Location & Rating */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-current text-yellow-400" />
              <span>{rating}</span>
              <span>({reviewCount})</span>
            </div>
          </div>

          {/* Bio */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{bio}</p>

          {/* Categories */}
          <div className="flex flex-wrap gap-1 mb-3">
            {categories.slice(0, 2).map(category => (
              <Badge key={category} variant="secondary" className="text-xs">
                {category}
              </Badge>
            ))}
            {categories.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{categories.length - 2}
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{formatNumber(followerCount)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{responseTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>{completionRate}%</span>
            </div>
            <div className="text-right font-medium text-foreground">
              ${priceRange.min.toLocaleString()}+
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="flex-1"
              disabled={!availableForBooking}
              onClick={handleContactClick}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Contactar
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              asChild
            >
              <Link to={`/creator/${id}`}>
                Ver perfil
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CreatorCard;
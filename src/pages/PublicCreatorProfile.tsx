import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Instagram,
  ExternalLink,
  Star,
  Users,
  Heart,
  Camera,
  Video,
  MapPin,
  Calendar,
  Trophy,
  Share2,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PublicCreatorData {
  id: string;
  full_name?: string;
  avatar_url?: string;
  creator_profiles: {
    username: string;
    bio?: string;
    instagram_handle?: string;
    tiktok_handle?: string;
    followers_instagram?: number;
    followers_tiktok?: number;
    specialties?: string[];
    urscore?: number;
    is_verified?: boolean;
    public_slug: string;
    portfolio_images?: string[];
    engagement_rate?: number;
    location?: string;
    member_since?: string;
  };
}

interface ApprovedSubmission {
  id: string;
  submission_url: string;
  submitted_at: string;
  collaboration?: {
    title?: string;
    campaign_title?: string;
  };
  reservation?: {
    offer: {
      title: string;
    };
    venue: {
      name: string;
    };
  };
}

const fetchCreatorBySlug = async (slug: string): Promise<PublicCreatorData> => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      full_name,
      avatar_url,
      creator_profiles!inner(
        username,
        bio,
        instagram_handle,
        tiktok_handle,
        followers_instagram,
        followers_tiktok,
        specialties,
        urscore,
        is_verified,
        public_slug,
        portfolio_images,
        engagement_rate,
        location,
        created_at
      )
    `)
    .eq('creator_profiles.public_slug', slug)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    ...data,
    creator_profiles: {
      ...data.creator_profiles,
      member_since: data.creator_profiles.created_at,
    },
  };
};

const fetchApprovedSubmissions = async (creatorId: string): Promise<ApprovedSubmission[]> => {
  const { data, error } = await supabase
    .from('content_submissions')
    .select(`
      id,
      submission_url,
      submitted_at,
      collaboration:collaborations(title, campaign_title),
      reservation:reservations(
        offer:offers(title),
        venue:venues(name)
      )
    `)
    .eq('creator_id', creatorId)
    .eq('status', 'approved')
    .order('submitted_at', { ascending: false })
    .limit(12);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export default function PublicCreatorProfile() {
  const { slug } = useParams<{ slug: string }>();

  const { data: creator, isLoading, error } = useQuery({
    queryKey: ['public-creator', slug],
    queryFn: () => fetchCreatorBySlug(slug!),
    enabled: !!slug,
  });

  const { data: approvedContent = [] } = useQuery({
    queryKey: ['creator-approved-content', creator?.id],
    queryFn: () => fetchApprovedSubmissions(creator!.id),
    enabled: !!creator?.id,
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${creator?.creator_profiles.username} - URContent Creator`,
        text: `Check out ${creator?.creator_profiles.username}'s profile on URContent`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Profile URL copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-gray-200 rounded-3xl"></div>
            <div className="h-48 bg-gray-200 rounded-3xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-3xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Creator not found</h1>
            <p className="text-gray-600 mb-4">
              The creator profile you're looking for doesn't exist or isn't public.
            </p>
            <Link to="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profile = creator.creator_profiles;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back to URContent</span>
            </Link>
            <Button variant="outline" onClick={handleShare} className="rounded-full">
              <Share2 className="w-4 h-4 mr-2" />
              Share Profile
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <Card className="rounded-3xl border-0 shadow-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              <Avatar className="w-32 h-32 border-4 border-white/20">
                <AvatarImage src={creator.avatar_url} alt={profile.username} />
                <AvatarFallback className="text-2xl bg-white/20">
                  {profile.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                  <h1 className="text-3xl font-bold">{profile.username}</h1>
                  {profile.is_verified && (
                    <Badge className="bg-blue-500 text-white">
                      <Trophy className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                
                {creator.full_name && (
                  <p className="text-xl text-white/90 mb-2">{creator.full_name}</p>
                )}
                
                {profile.bio && (
                  <p className="text-white/80 mb-4 max-w-2xl">{profile.bio}</p>
                )}
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm">
                  {profile.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  
                  {profile.member_since && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Member since {new Date(profile.member_since).getFullYear()}
                      </span>
                    </div>
                  )}
                  
                  {profile.urscore && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>URScore: {profile.urscore}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Specialties */}
            {profile.specialties && profile.specialties.length > 0 && (
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle>Specialties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline" className="rounded-full">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Portfolio */}
            {profile.portfolio_images && profile.portfolio_images.length > 0 && (
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle>Portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {profile.portfolio_images.map((image, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-2xl overflow-hidden bg-gray-100"
                      >
                        <img
                          src={image}
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Work */}
            {approvedContent.length > 0 && (
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle>Recent Work</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {approvedContent.map((content) => (
                      <div
                        key={content.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl"
                      >
                        <div className="flex-1">
                          <p className="font-medium">
                            {content.collaboration?.campaign_title || 
                             content.collaboration?.title || 
                             content.reservation?.offer.title}
                          </p>
                          {content.reservation && (
                            <p className="text-sm text-gray-600">
                              at {content.reservation.venue.name}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {new Date(content.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(content.submission_url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Social Media */}
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.instagram_handle && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Instagram className="w-5 h-5 text-pink-500" />
                      <div>
                        <p className="font-medium">@{profile.instagram_handle}</p>
                        {profile.followers_instagram && (
                          <p className="text-sm text-gray-600">
                            {profile.followers_instagram.toLocaleString()} followers
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(
                          `https://instagram.com/${profile.instagram_handle}`,
                          '_blank'
                        )
                      }
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {profile.tiktok_handle && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Video className="w-5 h-5 text-black" />
                      <div>
                        <p className="font-medium">@{profile.tiktok_handle}</p>
                        {profile.followers_tiktok && (
                          <p className="text-sm text-gray-600">
                            {profile.followers_tiktok.toLocaleString()} followers
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(`https://tiktok.com/@${profile.tiktok_handle}`, '_blank')
                      }
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle>Creator Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.engagement_rate && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Engagement Rate</span>
                    <span className="font-medium">{profile.engagement_rate}%</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Approved Content</span>
                  <span className="font-medium">{approvedContent.length}</span>
                </div>

                {profile.urscore && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">URScore</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium">{profile.urscore}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="rounded-3xl bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold text-lg mb-2">Work with {profile.username}</h3>
                <p className="text-white/90 text-sm mb-4">
                  Ready to collaborate? Join URContent to connect with amazing creators.
                </p>
                <Link to="/register">
                  <Button className="bg-white text-purple-600 hover:bg-gray-100 w-full">
                    Join URContent
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
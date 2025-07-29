import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Star,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Instagram,
  Youtube,
  Camera,
  MapPin,
  TrendingUp,
  Bookmark,
  Send,
  MoreHorizontal,
  Verified
} from "lucide-react";

// Mock creators data
const mockCreators = [
  {
    id: 1,
    name: "Elena Fitness",
    username: "elena_fit",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b6b8bb8f?w=150&h=150&fit=crop&crop=face",
    verified: true,
    followers: 87500,
    engagement: 7.2,
    category: "Fitness & Health",
    location: "Mexico City, MX",
    urScore: 94,
    rate: { min: 800, max: 1200 },
    bio: "Certified fitness trainer helping people achieve their health goals 💪",
    tags: ["Fitness", "Nutrition", "Wellness", "Lifestyle"],
    platforms: {
      instagram: { followers: 87500, engagement: 7.2 },
      tiktok: { followers: 45000, engagement: 8.9 },
      youtube: { followers: 12000, engagement: 5.1 }
    },
    recentWork: [
      { brand: "Nike", type: "Post", engagement: "12.5K likes" },
      { brand: "Protein World", type: "Story", engagement: "8.2K views" }
    ],
    compatibility: 95,
    languages: ["Spanish", "English"]
  },
  {
    id: 2,
    name: "Chef Roberto",
    username: "chef_roberto",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    verified: true,
    followers: 124000,
    engagement: 5.8,
    category: "Food & Culinary",
    location: "Guadalajara, MX",
    urScore: 92,
    rate: { min: 1200, max: 1800 },
    bio: "Professional chef sharing authentic Mexican cuisine 🇲🇽👨‍🍳",
    tags: ["Mexican Food", "Recipes", "Cooking", "Traditional"],
    platforms: {
      instagram: { followers: 124000, engagement: 5.8 },
      tiktok: { followers: 67000, engagement: 7.1 },
      youtube: { followers: 28000, engagement: 4.9 }
    },
    recentWork: [
      { brand: "Maseca", type: "Reel", engagement: "18.2K likes" },
      { brand: "Corona", type: "Video", engagement: "25.1K views" }
    ],
    compatibility: 88,
    languages: ["Spanish", "English"]
  },
  {
    id: 3,
    name: "Style Maven",
    username: "style_maven",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    verified: false,
    followers: 156000,
    engagement: 6.5,
    category: "Fashion & Lifestyle",
    location: "Monterrey, MX",
    urScore: 87,
    rate: { min: 1000, max: 1500 },
    bio: "Fashion enthusiast & style consultant ✨ Sustainable fashion advocate",
    tags: ["Fashion", "Style", "Sustainable", "Lifestyle"],
    platforms: {
      instagram: { followers: 156000, engagement: 6.5 },
      tiktok: { followers: 89000, engagement: 8.2 }
    },
    recentWork: [
      { brand: "Zara", type: "Lookbook", engagement: "22.3K likes" },
      { brand: "H&M", type: "Story Series", engagement: "15.7K views" }
    ],
    compatibility: 82,
    languages: ["Spanish", "English"]
  },
  {
    id: 4,
    name: "Tech Reviewer",
    username: "tech_insights_mx",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    verified: true,
    followers: 203000,
    engagement: 4.9,
    category: "Technology",
    location: "Mexico City, MX",
    urScore: 91,
    rate: { min: 1500, max: 2200 },
    bio: "Tech reviews & digital trends in Spanish 📱💻",
    tags: ["Technology", "Reviews", "Gadgets", "Innovation"],
    platforms: {
      instagram: { followers: 203000, engagement: 4.9 },
      youtube: { followers: 85000, engagement: 6.2 },
      tiktok: { followers: 134000, engagement: 7.8 }
    },
    recentWork: [
      { brand: "Samsung", type: "Review Video", engagement: "45.8K views" },
      { brand: "Apple", type: "Unboxing", engagement: "32.1K views" }
    ],
    compatibility: 79,
    languages: ["Spanish", "English"]
  },
  {
    id: 5,
    name: "Travel Explorer",
    username: "travel_explorer",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face",
    verified: true,
    followers: 178000,
    engagement: 8.1,
    category: "Travel & Adventure",
    location: "Cancun, MX",
    urScore: 89,
    rate: { min: 1300, max: 1900 },
    bio: "Exploring Mexico's hidden gems 🌮🏖️ Adventure photographer",
    tags: ["Travel", "Photography", "Adventure", "Mexico"],
    platforms: {
      instagram: { followers: 178000, engagement: 8.1 },
      youtube: { followers: 42000, engagement: 5.7 },
      tiktok: { followers: 98000, engagement: 9.2 }
    },
    recentWork: [
      { brand: "Airbnb", type: "Travel Guide", engagement: "28.4K likes" },
      { brand: "GoPro", type: "Adventure Video", engagement: "51.2K views" }
    ],
    compatibility: 91,
    languages: ["Spanish", "English", "Portuguese"]
  },
  {
    id: 6,
    name: "Beauty Guru",
    username: "beauty_mx",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
    verified: false,
    followers: 95000,
    engagement: 9.3,
    category: "Beauty & Makeup",
    location: "Puebla, MX",
    urScore: 85,
    rate: { min: 700, max: 1100 },
    bio: "Makeup artist & beauty tips 💄✨ Cruelty-free advocate",
    tags: ["Beauty", "Makeup", "Skincare", "Tutorials"],
    platforms: {
      instagram: { followers: 95000, engagement: 9.3 },
      tiktok: { followers: 167000, engagement: 11.2 },
      youtube: { followers: 35000, engagement: 7.8 }
    },
    recentWork: [
      { brand: "MAC Cosmetics", type: "Tutorial", engagement: "19.7K likes" },
      { brand: "Sephora", type: "Product Review", engagement: "14.3K views" }
    ],
    compatibility: 76,
    languages: ["Spanish"]
  }
];

export const CreatorSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [followersRange, setFollowersRange] = useState([0, 500000]);
  const [engagementRange, setEngagementRange] = useState([0, 15]);
  const [sortBy, setSortBy] = useState("compatibility");
  const [viewMode, setViewMode] = useState("grid");
  const [favorites, setFavorites] = useState<number[]>([]);

  // Filter and sort creators
  const filteredCreators = useMemo(() => {
    let filtered = mockCreators.filter(creator => {
      const matchesSearch = creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           creator.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           creator.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === "all" || creator.category === categoryFilter;
      const matchesLocation = locationFilter === "all" || creator.location.includes(locationFilter);
      const matchesFollowers = creator.followers >= followersRange[0] && creator.followers <= followersRange[1];
      const matchesEngagement = creator.engagement >= engagementRange[0] && creator.engagement <= engagementRange[1];
      
      return matchesSearch && matchesCategory && matchesLocation && matchesFollowers && matchesEngagement;
    });

    // Sort creators
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'compatibility':
          return b.compatibility - a.compatibility;
        case 'followers':
          return b.followers - a.followers;
        case 'engagement':
          return b.engagement - a.engagement;
        case 'urScore':
          return b.urScore - a.urScore;
        case 'rate':
          return a.rate.min - b.rate.min;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, categoryFilter, locationFilter, followersRange, engagementRange, sortBy]);

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const toggleFavorite = (creatorId: number) => {
    setFavorites(prev => 
      prev.includes(creatorId) 
        ? prev.filter(id => id !== creatorId)
        : [...prev, creatorId]
    );
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50";
    if (score >= 80) return "text-blue-600 bg-blue-50";
    if (score >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const categories = [
    "Fitness & Health",
    "Food & Culinary", 
    "Fashion & Lifestyle",
    "Technology",
    "Travel & Adventure",
    "Beauty & Makeup"
  ];

  const locations = [
    "Mexico City",
    "Guadalajara", 
    "Monterrey",
    "Cancun",
    "Puebla"
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-black">Find Creators</h2>
          <p className="text-gray-500">Discover and connect with the perfect creators for your brand</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{filteredCreators.length} creators found</Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name, username, or expertise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compatibility">Best Match</SelectItem>
                <SelectItem value="followers">Most Followers</SelectItem>
                <SelectItem value="engagement">Highest Engagement</SelectItem>
                <SelectItem value="urScore">URScore</SelectItem>
                <SelectItem value="rate">Lowest Rate</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                List
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Followers Range: {formatFollowers(followersRange[0])} - {formatFollowers(followersRange[1])}
              </label>
              <Slider
                value={followersRange}
                onValueChange={setFollowersRange}
                max={500000}
                step={10000}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Engagement Rate: {engagementRange[0]}% - {engagementRange[1]}%
              </label>
              <Slider
                value={engagementRange}
                onValueChange={setEngagementRange}
                max={15}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Creator Results */}
      <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {filteredCreators.map((creator) => (
          <Card key={creator.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={creator.avatar} alt={creator.name} />
                    <AvatarFallback>{creator.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-sm">{creator.name}</h3>
                      {creator.verified && <Verified className="w-4 h-4 text-blue-500" />}
                    </div>
                    <p className="text-xs text-gray-500">@{creator.username}</p>
                    <Badge variant="outline" className="text-xs mt-1">{creator.category}</Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(creator.id)}
                    className="p-1"
                  >
                    <Bookmark className={`w-4 h-4 ${favorites.includes(creator.id) ? 'fill-current text-yellow-500' : 'text-gray-400'}`} />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1">
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Bio */}
              <p className="text-sm text-gray-600">{creator.bio}</p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">{formatFollowers(creator.followers)}</p>
                  <p className="text-gray-500 text-xs">Followers</p>
                </div>
                <div>
                  <p className="font-medium">{creator.engagement}%</p>
                  <p className="text-gray-500 text-xs">Engagement</p>
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <p className="font-medium">{creator.urScore}/100</p>
                  </div>
                  <p className="text-gray-500 text-xs">URScore</p>
                </div>
                <div>
                  <p className="font-medium">{formatCurrency(creator.rate.min)}-{formatCurrency(creator.rate.max)}</p>
                  <p className="text-gray-500 text-xs">Rate Range</p>
                </div>
              </div>

              {/* Compatibility Score */}
              <div className={`p-2 rounded-lg ${getCompatibilityColor(creator.compatibility)}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Brand Match</span>
                  <span className="text-sm font-bold">{creator.compatibility}%</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {creator.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {creator.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{creator.tags.length - 3}
                  </Badge>
                )}
              </div>

              {/* Platform Icons */}
              <div className="flex items-center space-x-2">
                {creator.platforms.instagram && <Instagram className="w-4 h-4 text-pink-500" />}
                {creator.platforms.youtube && <Youtube className="w-4 h-4 text-red-500" />}
                {creator.platforms.tiktok && <Camera className="w-4 h-4 text-black" />}
              </div>

              {/* Location */}
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                <span>{creator.location}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="flex-1 text-xs">
                      <Eye className="w-3 h-3 mr-1" />
                      View Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>{creator.name} - Full Profile</DialogTitle>
                      <DialogDescription>
                        Detailed creator information and collaboration history
                      </DialogDescription>
                    </DialogHeader>
                    <div className="p-4 text-center text-gray-500">
                      Full creator profile would be displayed here
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" className="flex-1 text-xs">
                  <Send className="w-3 h-3 mr-1" />
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredCreators.length === 0 && (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <Users className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">No creators found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters</p>
            </div>
            <Button 
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("all");
                setLocationFilter("all");
                setFollowersRange([0, 500000]);
                setEngagementRange([0, 15]);
              }}
              variant="outline"
            >
              Clear all filters
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
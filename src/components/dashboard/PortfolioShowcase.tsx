import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2, 
  TrendingUp,
  Play,
  Instagram,
  Youtube,
  ExternalLink,
  Upload,
  MoreVertical
} from "lucide-react";
import { MockPortfolioItem } from '@/data/mockUsers';

interface PortfolioShowcaseProps {
  portfolioItems: MockPortfolioItem[];
  title?: string;
  description?: string;
  showAll?: boolean;
  maxItems?: number;
}

export const PortfolioShowcase: React.FC<PortfolioShowcaseProps> = ({
  portfolioItems,
  title = "Portfolio Showcase",
  description = "Your best recent work",
  showAll = false,
  maxItems = 6
}) => {
  const [selectedItem, setSelectedItem] = useState<MockPortfolioItem | null>(null);
  
  const displayItems = showAll ? portfolioItems : portfolioItems.slice(0, maxItems);

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className="w-4 h-4" />;
      case 'youtube':
        return <Youtube className="w-4 h-4" />;
      case 'tiktok':
        return <span className="text-sm font-bold">TT</span>;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'youtube':
        return 'bg-red-500';
      case 'tiktok':
        return 'bg-black';
      default:
        return 'bg-gray-500';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getEngagementColor = (rate: number) => {
    if (rate >= 5) return 'text-green-600';
    if (rate >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="bg-white border border-gray-100 rounded-3xl hover:border-gray-200 transition-all duration-300">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <CardTitle className="text-xl font-medium text-black">{title}</CardTitle>
              <CardDescription className="text-gray-500 text-sm">{description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" className="border-gray-200 hover:bg-gray-50 rounded-full px-4 py-2">
              <Upload className="w-4 h-4 mr-2" />
              Add Content
            </Button>
            {!showAll && (
              <Button size="sm" variant="outline" className="border-gray-200 hover:bg-gray-50 rounded-full px-4 py-2">
                View All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {displayItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Eye className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">No portfolio items yet</p>
            <p className="text-sm mb-4">Upload your best content to showcase your work</p>
            <Button className="bg-black hover:bg-gray-800 text-white rounded-full px-6">
              <Upload className="w-4 h-4 mr-2" />
              Upload First Item
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayItems.map((item) => (
              <div 
                key={item.id} 
                className="group relative bg-gray-50 rounded-2xl overflow-hidden hover:bg-gray-100 transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                {/* Media Container */}
                <div className="relative aspect-square bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                  {item.media_url ? (
                    <img 
                      src={item.media_url} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Media Preview</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Media Type Indicator */}
                  {item.media_type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
                  )}

                  {/* Platform Badge */}
                  <div className="absolute top-3 left-3">
                    <div className={`${getPlatformColor(item.platform)} text-white px-2 py-1 rounded-full flex items-center space-x-1 text-xs font-medium`}>
                      {getPlatformIcon(item.platform)}
                      <span className="capitalize">{item.platform}</span>
                    </div>
                  </div>

                  {/* Featured Badge */}
                  {item.is_featured && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        ⭐ Featured
                      </Badge>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button size="sm" className="bg-white text-black hover:bg-gray-100 rounded-full px-4">
                      View Details
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-black text-sm mb-1 line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" className="p-1 h-auto">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Engagement Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 text-xs text-gray-600">
                        <Heart className="w-3 h-3" />
                        <span>{formatNumber(item.engagement_stats.likes)}</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 text-xs text-gray-600">
                        <MessageCircle className="w-3 h-3" />
                        <span>{formatNumber(item.engagement_stats.comments)}</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 text-xs text-gray-600">
                        <TrendingUp className="w-3 h-3" />
                        <span className={getEngagementColor(item.engagement_stats.engagement_rate)}>
                          {item.engagement_stats.engagement_rate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags.slice(0, 3).map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 border-gray-200"
                        >
                          #{tag}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <Badge 
                          variant="outline" 
                          className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 border-gray-200"
                        >
                          +{item.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Brand Mention */}
                  {item.brand_mention && (
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>Brand:</span>
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {item.brand_mention}
                      </Badge>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost" className="p-1 h-auto text-gray-500 hover:text-black">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="p-1 h-auto text-gray-500 hover:text-black">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="p-1 h-auto text-gray-500 hover:text-black">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Portfolio Stats Summary */}
        {displayItems.length > 0 && (
          <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
            <h4 className="font-semibold text-black mb-4">Portfolio Performance</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-black">
                  {displayItems.length}
                </div>
                <div className="text-xs text-gray-500">Total Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black">
                  {formatNumber(
                    displayItems.reduce((sum, item) => sum + item.engagement_stats.likes, 0)
                  )}
                </div>
                <div className="text-xs text-gray-500">Total Likes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black">
                  {(
                    displayItems.reduce((sum, item) => sum + item.engagement_stats.engagement_rate, 0) / displayItems.length
                  ).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Avg Engagement</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black">
                  {displayItems.filter(item => item.is_featured).length}
                </div>
                <div className="text-xs text-gray-500">Featured</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
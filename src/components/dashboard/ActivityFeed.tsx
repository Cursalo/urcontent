import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Bell, 
  MessageCircle, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  Star,
  TrendingUp,
  Eye,
  Heart,
  Share2,
  Calendar,
  Gift,
  Award,
  AlertCircle,
  ExternalLink
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: 'collaboration' | 'payment' | 'message' | 'notification' | 'achievement' | 'system';
  title: string;
  description: string;
  timestamp: string;
  isRead?: boolean;
  priority?: 'low' | 'medium' | 'high';
  icon?: any;
  metadata?: {
    amount?: number;
    brand?: string;
    platform?: string;
    status?: string;
    userId?: string;
    collaborationId?: string;
  };
}

interface ActivityFeedProps {
  activities?: ActivityItem[];
  title?: string;
  description?: string;
  maxItems?: number;
  showAll?: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities = [],
  title = "Recent Activity",
  description = "Latest updates and notifications",
  maxItems = 10,
  showAll = false
}) => {
  // Sample activity data if none provided
  const sampleActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'collaboration',
      title: 'New Collaboration Request',
      description: 'FreshBites Restaurant wants to collaborate on Instagram content',
      timestamp: '2 hours ago',
      isRead: false,
      priority: 'high',
      metadata: {
        amount: 2500,
        brand: 'FreshBites Restaurant',
        platform: 'instagram',
        status: 'proposed'
      }
    },
    {
      id: '2',
      type: 'payment',
      title: 'Payment Received',
      description: 'You received payment for GreenLeaf Wellness collaboration',
      timestamp: '4 hours ago',
      isRead: false,
      priority: 'medium',
      metadata: {
        amount: 1800,
        brand: 'GreenLeaf Wellness',
        status: 'completed'
      }
    },
    {
      id: '3',
      type: 'achievement',
      title: 'URScore Milestone!',
      description: 'Congratulations! You reached 94/100 URScore rating',
      timestamp: '1 day ago',
      isRead: true,
      priority: 'medium',
      metadata: {
        status: 'elite_tier'
      }
    },
    {
      id: '4',
      type: 'message',
      title: 'New Message',
      description: 'TechFlow Solutions sent you a message about project timeline',
      timestamp: '1 day ago',
      isRead: true,
      priority: 'low',
      metadata: {
        brand: 'TechFlow Solutions'
      }
    },
    {
      id: '5',
      type: 'collaboration',
      title: 'Content Approved',
      description: 'Your Instagram post for Urban Threads has been approved',
      timestamp: '2 days ago',
      isRead: true,
      priority: 'low',
      metadata: {
        brand: 'Urban Threads',
        platform: 'instagram',
        status: 'approved'
      }
    },
    {
      id: '6',
      type: 'system',
      title: 'Profile Views Spike',
      description: 'Your profile received 150% more views this week',
      timestamp: '3 days ago',
      isRead: true,
      priority: 'low'
    }
  ];

  const displayActivities = activities.length > 0 ? activities : sampleActivities;
  const itemsToShow = showAll ? displayActivities : displayActivities.slice(0, maxItems);

  const getActivityIcon = (type: string, metadata?: any) => {
    switch (type) {
      case 'collaboration':
        return <MessageCircle className="w-4 h-4" />;
      case 'payment':
        return <DollarSign className="w-4 h-4" />;
      case 'message':
        return <MessageCircle className="w-4 h-4" />;
      case 'achievement':
        return <Award className="w-4 h-4" />;
      case 'notification':
        return <Bell className="w-4 h-4" />;
      case 'system':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string, priority?: string) => {
    if (priority === 'high') return 'bg-red-50 border-red-200';
    
    switch (type) {
      case 'collaboration':
        return 'bg-blue-50 border-blue-200';
      case 'payment':
        return 'bg-green-50 border-green-200';
      case 'message':
        return 'bg-purple-50 border-purple-200';
      case 'achievement':
        return 'bg-yellow-50 border-yellow-200';
      case 'system':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getIconColor = (type: string, priority?: string) => {
    if (priority === 'high') return 'text-red-600';
    
    switch (type) {
      case 'collaboration':
        return 'text-blue-600';
      case 'payment':
        return 'text-green-600';
      case 'message':
        return 'text-purple-600';
      case 'achievement':
        return 'text-yellow-600';
      case 'system':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      high: { label: 'High', className: 'bg-red-100 text-red-800 border-red-200' },
      medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      low: { label: 'Low', className: 'bg-green-100 text-green-800 border-green-200' }
    };
    const priorityConfig = config[priority as keyof typeof config];
    if (!priorityConfig) return null;
    
    return (
      <Badge className={`${priorityConfig.className} border text-xs px-2 py-0.5`}>
        {priorityConfig.label}
      </Badge>
    );
  };

  return (
    <Card className="bg-white border border-gray-100 rounded-3xl hover:border-gray-200 transition-all duration-300">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-medium text-black">{title}</CardTitle>
              <CardDescription className="text-gray-500 text-sm">{description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-red-100 text-red-800 border-red-200 text-xs px-2 py-1">
              {displayActivities.filter(a => !a.isRead).length} New
            </Badge>
            {!showAll && (
              <Button size="sm" variant="outline" className="border-gray-200 hover:bg-gray-50 rounded-full px-4 py-2">
                View All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {itemsToShow.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">No recent activity</p>
            <p className="text-sm">Your notifications and updates will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {itemsToShow.map((activity) => (
              <div 
                key={activity.id}
                className={`group p-5 rounded-2xl border hover:shadow-md transition-all duration-200 cursor-pointer ${
                  getActivityColor(activity.type, activity.priority)
                } ${!activity.isRead ? 'ring-2 ring-blue-100' : ''}`}
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm ${
                    getIconColor(activity.type, activity.priority)
                  }`}>
                    {getActivityIcon(activity.type, activity.metadata)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className={`font-semibold text-black text-sm ${
                            !activity.isRead ? 'font-bold' : ''
                          }`}>
                            {activity.title}
                          </h3>
                          {!activity.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {activity.timestamp}
                          </span>
                          {activity.metadata?.platform && (
                            <span className="capitalize">{activity.metadata.platform}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Metadata */}
                      <div className="flex flex-col items-end space-y-2">
                        {activity.priority && getPriorityBadge(activity.priority)}
                        {activity.metadata?.amount && (
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(activity.metadata.amount)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        {activity.type === 'collaboration' && activity.metadata?.status === 'proposed' && (
                          <>
                            <Button size="sm" className="bg-black hover:bg-gray-800 text-white rounded-full px-4 py-1 text-xs">
                              View Details
                            </Button>
                            <Button size="sm" variant="outline" className="rounded-full px-4 py-1 text-xs">
                              Respond
                            </Button>
                          </>
                        )}
                        {activity.type === 'payment' && (
                          <Button size="sm" variant="outline" className="rounded-full px-4 py-1 text-xs">
                            View Receipt
                          </Button>
                        )}
                        {activity.type === 'message' && (
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-4 py-1 text-xs">
                            Reply
                          </Button>
                        )}
                        {activity.type === 'achievement' && (
                          <Button size="sm" variant="outline" className="rounded-full px-4 py-1 text-xs">
                            <Share2 className="w-3 h-3 mr-1" />
                            Share
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {!activity.isRead && (
                          <Button size="sm" variant="ghost" className="rounded-full p-1 h-auto">
                            <CheckCircle className="w-4 h-4 text-gray-400 hover:text-green-600" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="rounded-full p-1 h-auto">
                          <ExternalLink className="w-4 h-4 text-gray-400 hover:text-black" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Activity Summary */}
        {itemsToShow.length > 0 && (
          <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
            <h4 className="font-semibold text-black mb-4">Activity Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-black">
                  {displayActivities.filter(a => !a.isRead).length}
                </div>
                <div className="text-xs text-gray-500">Unread</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black">
                  {displayActivities.filter(a => a.type === 'collaboration').length}
                </div>
                <div className="text-xs text-gray-500">Collaborations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black">
                  {displayActivities.filter(a => a.type === 'payment').length}
                </div>
                <div className="text-xs text-gray-500">Payments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black">
                  {displayActivities.filter(a => a.priority === 'high').length}
                </div>
                <div className="text-xs text-gray-500">High Priority</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
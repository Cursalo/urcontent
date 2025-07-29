import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  MessageCircle, 
  Eye, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { MockCollaboration } from '@/data/mockUsers';

interface CollaborationsTableProps {
  collaborations: MockCollaboration[];
  title?: string;
  description?: string;
  showAll?: boolean;
  maxItems?: number;
}

export const CollaborationsTable: React.FC<CollaborationsTableProps> = ({
  collaborations,
  title = "Recent Collaborations",
  description = "Your latest partnerships",
  showAll = false,
  maxItems = 5
}) => {
  const displayCollaborations = showAll ? collaborations : collaborations.slice(0, maxItems);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { 
        label: "Completed", 
        className: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle
      },
      in_progress: { 
        label: "In Progress", 
        className: "bg-blue-100 text-blue-800 border-blue-200",
        icon: Clock
      },
      accepted: { 
        label: "Accepted", 
        className: "bg-purple-100 text-purple-800 border-purple-200",
        icon: CheckCircle
      },
      proposed: { 
        label: "Proposed", 
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: AlertCircle
      },
      rejected: { 
        label: "Rejected", 
        className: "bg-red-100 text-red-800 border-red-200",
        icon: AlertCircle
      }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.proposed;
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.className} border flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return '📷';
      case 'tiktok':
        return '🎵';
      case 'youtube':
        return '📺';
      case 'twitter':
        return '🐦';
      default:
        return '📱';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'proposed': return 20;
      case 'accepted': return 40;
      case 'in_progress': return 70;
      case 'completed': return 100;
      default: return 0;
    }
  };

  return (
    <Card className="bg-white border border-gray-100 rounded-3xl hover:border-gray-200 transition-all duration-300">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-medium text-black">{title}</CardTitle>
              <CardDescription className="text-gray-500 text-sm">{description}</CardDescription>
            </div>
          </div>
          {!showAll && (
            <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50 rounded-full px-4 py-2">
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {displayCollaborations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">No collaborations yet</p>
            <p className="text-sm">Start connecting with brands to see your collaborations here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayCollaborations.map((collaboration) => (
              <div 
                key={collaboration.id} 
                className="group p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-xl">{getPlatformIcon(collaboration.platform)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-black text-lg">{collaboration.title}</h3>
                        {getStatusBadge(collaboration.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{collaboration.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Created {formatDate(collaboration.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="capitalize">{collaboration.collaboration_type.replace('_', ' ')}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-black mb-1">
                      {formatCurrency(collaboration.compensation_amount)}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {collaboration.compensation_type}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">Progress</span>
                    <span className="text-xs text-gray-500">{getProgressValue(collaboration.status)}%</span>
                  </div>
                  <Progress 
                    value={getProgressValue(collaboration.status)} 
                    className="h-2 bg-gray-200"
                  />
                </div>

                {/* Performance Metrics (for completed collaborations) */}
                {collaboration.status === 'completed' && collaboration.performance && (
                  <div className="grid grid-cols-3 gap-4 p-4 bg-white rounded-xl border border-gray-100">
                    <div className="text-center">
                      <div className="text-lg font-bold text-black">
                        {collaboration.performance.total_reach?.toLocaleString() || '0'}
                      </div>
                      <div className="text-xs text-gray-500">Total Reach</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-black">
                        {collaboration.performance.engagement_rate?.toFixed(1) || '0.0'}%
                      </div>
                      <div className="text-xs text-gray-500">Engagement</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-black">
                        {collaboration.performance.roi?.toFixed(0) || '0'}%
                      </div>
                      <div className="text-xs text-gray-500">ROI</div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2">
                    {collaboration.status === 'proposed' && (
                      <>
                        <Button size="sm" className="bg-black hover:bg-gray-800 text-white rounded-full px-4">
                          Accept
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-full px-4">
                          Decline
                        </Button>
                      </>
                    )}
                    {collaboration.status === 'accepted' && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4">
                        Start Work
                      </Button>
                    )}
                    {collaboration.status === 'in_progress' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4">
                        Submit Content
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost" className="rounded-full p-2">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-full p-2">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-full p-2">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
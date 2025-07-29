import React, { useState, useEffect, memo, useMemo, useCallback } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { StatsCard } from "@/components/dashboard/StatsCard"; 
import { UserInfoCard } from "@/components/dashboard/UserInfoCard";
import { DashboardLoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { CampaignManager } from "@/components/business/CampaignManager";
import { CreatorSearch } from "@/components/business/CreatorSearch";
import { BusinessAnalytics } from "@/components/business/BusinessAnalytics";
import { BusinessProfile } from "@/components/business/BusinessProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Building2,
  DollarSign,
  TrendingUp,
  MessageCircle,
  Star,
  Search,
  Plus,
  Eye,
  Heart,
  Share2,
  Users,
  Target,
  Calendar,
  Filter,
  BarChart3,
  Camera,
  Clock,
  CheckCircle,
  Settings,
  FileText,
  UserPlus,
  Zap
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHybridDashboard } from "@/hooks/useHybridDashboard";
import { toast } from "sonner";
import { DashboardErrorBoundary, CardErrorFallback } from "@/components/dashboard/DashboardErrorBoundary";

const BusinessDashboard = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const {
    loading,
    error,
    dashboardData,
    authType,
    userProfile: businessProfile,
    collaborations,
    portfolio,
    metrics,
    analytics,
    refresh
  } = useHybridDashboard('business');
  
  // Business-specific state
  const [businessStats, setBusinessStats] = useState({
    totalSpent: 0,
    activeCampaigns: 0,
    totalReach: 0,
    avgROI: 0,
    completedCampaigns: 0,
    avgEngagement: 0
  });

  // Update business stats when dashboard data changes
  useEffect(() => {
    if (dashboardData && metrics) {
      setBusinessStats({
        totalSpent: metrics.totalSpent || 0,
        activeCampaigns: metrics.activeCampaigns || 0,
        totalReach: metrics.totalReach || 0,
        avgROI: metrics.avgCampaignROI || 0,
        completedCampaigns: metrics.completedCampaigns || 0,
        avgEngagement: 4.2 // Mock engagement rate
      });
      
      console.log(`✅ Business Dashboard: Loaded ${authType} data with ${collaborations.length} campaigns`);
      
      if (!loading && dashboardData) {
        toast.success('Business Dashboard loaded successfully!', {
          description: `Welcome back! You have ${metrics.activeCampaigns} active campaigns and ${collaborations.length} total collaborations.`,
          duration: 4000,
        });
      }
    }
  }, [dashboardData, metrics, authType, collaborations.length, loading]);
  
  // Handle errors with toast notifications
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Format numbers for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  // Business stats configuration
  const businessStatsConfig = [
    { 
      title: "Total Investment", 
      value: formatCurrency(businessStats.totalSpent), 
      icon: DollarSign, 
      trend: { value: "12.5%", isPositive: true }, 
      description: "This month's spend",
      color: "green" as const,
      progress: 68
    },
    { 
      title: "Active Campaigns", 
      value: businessStats.activeCampaigns.toString(), 
      icon: Target, 
      trend: { value: "2", isPositive: true }, 
      description: "Running collaborations",
      color: "blue" as const,
      progress: 75
    },
    { 
      title: "Total Reach", 
      value: formatNumber(businessStats.totalReach), 
      icon: Eye, 
      trend: { value: "15.2K", isPositive: true }, 
      description: "Across all campaigns",
      color: "purple" as const,
      progress: 85
    },
    { 
      title: "Average ROI", 
      value: `${businessStats.avgROI}x`, 
      icon: TrendingUp, 
      trend: { value: "0.3x", isPositive: true }, 
      description: "Return on investment",
      color: "orange" as const,
      progress: businessStats.avgROI * 20
    }
  ];

  // Mock campaign performance data
  const campaignPerformanceData = [
    { month: 'Jan', spent: 8500, reach: 125000, roi: 3.2 },
    { month: 'Feb', spent: 12300, reach: 180000, roi: 3.8 },
    { month: 'Mar', spent: 15600, reach: 220000, roi: 4.1 },
    { month: 'Apr', spent: 18900, reach: 285000, roi: 4.5 },
    { month: 'May', spent: 22100, reach: 320000, roi: 4.8 },
    { month: 'Jun', spent: 25400, reach: 380000, roi: 5.2 }
  ];

  // Mock platform distribution data
  const platformData = [
    { name: 'Instagram', value: 45, color: '#E1306C' },
    { name: 'TikTok', value: 30, color: '#000000' },
    { name: 'YouTube', value: 20, color: '#FF0000' },
    { name: 'Other', value: 5, color: '#6B7280' }
  ];

  // Recent campaigns data with safety checks
  const recentCampaigns = useMemo(() => {
    try {
      if (!Array.isArray(collaborations)) {
        console.warn('BusinessDashboard: collaborations is not an array:', collaborations);
        return [];
      }
      
      return collaborations.slice(0, 5).map((campaign, index) => {
        if (!campaign || typeof campaign !== 'object') {
          console.warn(`BusinessDashboard: Invalid campaign at index ${index}:`, campaign);
          return {
            id: `invalid-campaign-${index}`,
            creator: "Unknown Creator",
            status: "unknown",
            budget: formatCurrency(0),
            reach: "0",
            engagement: "0%",
            date: "Unknown"
          };
        }
        
        return {
          id: campaign.id || `campaign-${index}`,
          creator: campaign.creator_profile?.user?.full_name || "Unknown Creator",
          status: campaign.status || "unknown",
          budget: formatCurrency(campaign.compensation_amount || 0),
          reach: formatNumber(campaign.reach || 0),
          engagement: formatPercentage(campaign.engagement_rate || 0),
          date: campaign.created_at ? 
                new Date(campaign.created_at).toLocaleDateString() : 
                "Unknown"
        };
      });
    } catch (error) {
      console.error('BusinessDashboard: Error processing campaigns:', error);
      return [];
    }
  }, [collaborations]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: "Completed", className: "bg-green-100 text-green-800" },
      in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-800" },
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      rejected: { label: "Rejected", className: "bg-red-100 text-red-800" }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  // Loading state
  if (loading) {
    return (
      <>
        <DashboardNav />
        <DashboardLoadingSkeleton />
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <DashboardNav />
        <div className="flex justify-center items-center min-h-[60vh]">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <DashboardNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-light text-black">Business Dashboard</h1>
                  <p className="text-gray-500 text-lg font-light">
                    Welcome back, {businessProfile?.company_name || user?.user_metadata?.full_name || 'Business'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                className="rounded-full"
                onClick={() => setActiveTab("creators")}
              >
                <Search className="w-4 h-4 mr-2" />
                Find Creators
              </Button>
              <Button className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105">
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 lg:w-fit">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="creators">Find Creators</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {businessStatsConfig.map((stat, index) => (
                <DashboardErrorBoundary key={index} componentName={`BusinessStatsCard-${stat.title}`} fallback={CardErrorFallback}>
                  <StatsCard
                    title={stat.title}
                    value={stat.value}
                    description={stat.description}
                    icon={stat.icon}
                    trend={stat.trend}
                    progress={stat.progress}
                    variant="default"
                    color={stat.color}
                    className="p-8"
                  />
                </DashboardErrorBoundary>
              ))}
            </div>

            {/* Campaign Performance & Platform Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Campaign Performance Chart */}
              <div className="lg:col-span-2">
                <Card className="bg-white border border-gray-100 rounded-3xl p-8 hover:border-gray-200 transition-all duration-300">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-xl font-medium text-black flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      <span>Campaign Performance</span>
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                      Monthly spend vs reach analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={campaignPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip 
                          formatter={(value, name) => {
                            if (name === 'spent') return [formatCurrency(Number(value)), 'Investment'];
                            if (name === 'reach') return [formatNumber(Number(value)), 'Reach'];
                            if (name === 'roi') return [`${value}x`, 'ROI'];
                            return [value, name];
                          }}
                          labelStyle={{ color: '#000' }}
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="spent" 
                          stackId="1" 
                          stroke="#3B82F6" 
                          fill="#3B82F6" 
                          fillOpacity={0.6}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="reach" 
                          stackId="2" 
                          stroke="#10B981" 
                          fill="#10B981" 
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Platform Distribution */}
              <div>
                <Card className="bg-white border border-gray-100 rounded-3xl p-8 hover:border-gray-200 transition-all duration-300">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-xl font-medium text-black flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <span>Platform Mix</span>
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                      Campaign distribution
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {platformData.map((platform, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: platform.color }}
                            />
                            <span className="text-sm font-medium text-gray-700">{platform.name}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-24 bg-gray-100 rounded-full h-2">
                              <div 
                                className="h-full rounded-full" 
                                style={{ 
                                  width: `${platform.value}%`, 
                                  backgroundColor: platform.color 
                                }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-black w-8">{platform.value}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Campaigns Table */}
            <Card className="bg-white border border-gray-100 rounded-3xl p-8 hover:border-gray-200 transition-all duration-300">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl font-medium text-black flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <span>Recent Campaigns</span>
                  </div>
                  <Button variant="outline" className="rounded-full">
                    View All
                  </Button>
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Latest collaboration activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Creator</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Reach</TableHead>
                      <TableHead>Engagement</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentCampaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.creator}</TableCell>
                        <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                        <TableCell>{campaign.budget}</TableCell>
                        <TableCell>{campaign.reach}</TableCell>
                        <TableCell>{campaign.engagement}</TableCell>
                        <TableCell className="text-gray-500">{campaign.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Business Performance Summary */}
            <div className="bg-gradient-to-br from-black to-gray-900 text-white rounded-3xl p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-light mb-2">Business Performance Summary</h3>
                  <p className="text-gray-300">Your marketing impact this month</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-light mb-1">{formatCurrency(businessStats.totalSpent)}</div>
                  <div className="text-sm text-gray-300">Total Investment</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-light mb-1">{businessStats.activeCampaigns}</div>
                  <div className="text-xs text-gray-300">Active Campaigns</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-light mb-1">{formatNumber(businessStats.totalReach)}</div>
                  <div className="text-xs text-gray-300">Total Reach</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-light mb-1">{businessStats.avgROI}x</div>
                  <div className="text-xs text-gray-300">Average ROI</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-light mb-1">{businessStats.completedCampaigns}</div>
                  <div className="text-xs text-gray-300">Completed</div>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-white/5 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Ready to launch your next campaign?</p>
                    <p className="text-gray-300 text-sm mt-1">Connect with top creators and grow your brand</p>
                  </div>
                  <Button className="bg-white text-black hover:bg-gray-100 rounded-full px-6 py-3 font-medium">
                    Create Campaign
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns">
            <DashboardErrorBoundary componentName="CampaignManager" fallback={CardErrorFallback}>
              <CampaignManager campaigns={collaborations} />
            </DashboardErrorBoundary>
          </TabsContent>

          {/* Creators Tab */}
          <TabsContent value="creators">
            <DashboardErrorBoundary componentName="CreatorSearch" fallback={CardErrorFallback}>
              <CreatorSearch />
            </DashboardErrorBoundary>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <DashboardErrorBoundary componentName="BusinessAnalytics" fallback={CardErrorFallback}>
              <BusinessAnalytics data={analytics} metrics={businessStats} />
            </DashboardErrorBoundary>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <DashboardErrorBoundary componentName="BusinessProfile" fallback={CardErrorFallback}>
              <BusinessProfile profile={businessProfile} />
            </DashboardErrorBoundary>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BusinessDashboard;
import { useState, useEffect } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { StatsCard } from "@/components/dashboard/StatsCard"; 
import { UserInfoCard } from "@/components/dashboard/UserInfoCard";
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
  Store,
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
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHybridDashboard } from "@/hooks/useHybridDashboard";
import { toast } from "sonner";

const BusinessDashboard = () => {
  const { user, profile } = useAuth();
  const {
    loading,
    error,
    dashboardData,
    authType,
    userProfile: businessProfile,
    collaborations,
    metrics,
    analytics,
    refresh
  } = useHybridDashboard('business');
  
  // Legacy state for component compatibility
  const [dashboardStats, setDashboardStats] = useState({
    campaignROI: 0,
    activeCampaigns: 0,
    totalReach: 0,
    monthlySpend: 0,
    completedCampaigns: 0,
    avgRating: 0
  });

  // Update legacy stats when dashboard data changes
  useEffect(() => {
    if (dashboardData && metrics) {
      setDashboardStats({
        campaignROI: metrics.avgCampaignROI || 0,
        activeCampaigns: metrics.activeCampaigns || 0,
        totalReach: metrics.totalReach || 0,
        monthlySpend: metrics.monthlySpent || 0,
        completedCampaigns: metrics.completedCampaigns || 0,
        avgRating: metrics.avgRating || 0
      });
      
      console.log(`✅ Business Dashboard: Loaded ${authType} data with ${collaborations.length} collaborations`);
      
      // Show success notification
      if (!loading && dashboardData) {
        toast.success('Business Dashboard loaded successfully!', {
          description: `Welcome back! You have ${metrics.activeCampaigns} active campaigns.`,
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
  const formatReach = (count: number) => {
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

  // Dynamic stats based on real data
  const businessStats = [
    { 
      title: "Campaign ROI", 
      value: `${dashboardStats.campaignROI.toFixed(0)}%`, 
      icon: TrendingUp, 
      trend: { value: "12%", isPositive: true }, 
      description: "Average return on investment" 
    },
    { 
      title: "Active Campaigns", 
      value: dashboardStats.activeCampaigns.toString(), 
      icon: MessageCircle, 
      trend: { value: "2", isPositive: true }, 
      description: "Running collaborations" 
    },
    { 
      title: "Total Reach", 
      value: formatReach(dashboardStats.totalReach), 
      icon: Eye, 
      trend: { value: "180K", isPositive: true }, 
      description: "Monthly impressions" 
    },
    { 
      title: "Monthly Spend", 
      value: formatCurrency(dashboardStats.monthlySpend), 
      icon: DollarSign, 
      trend: { value: "5%", isPositive: false }, 
      description: "Collaboration budget" 
    }
  ];

  const campaignPerformance = [
    { month: 'Jan', reach: 1200000, engagement: 85000, conversions: 2400 },
    { month: 'Feb', reach: 1450000, engagement: 98000, conversions: 2800 },
    { month: 'Mar', reach: 1680000, engagement: 112000, conversions: 3200 },
    { month: 'Apr', reach: 1920000, engagement: 125000, conversions: 3600 },
    { month: 'May', reach: 2100000, engagement: 138000, conversions: 3900 },
    { month: 'Jun', reach: 2400000, engagement: 156000, conversions: 4200 }
  ];

  const roiData = [
    { campaign: 'Fitness Promo', investment: 2500, return: 8500, roi: 340 },
    { campaign: 'Summer Menu', investment: 1800, return: 7200, roi: 400 },
    { campaign: 'New Product', investment: 3200, return: 9600, roi: 300 },
    { campaign: 'Brand Awareness', investment: 1500, return: 4500, roi: 300 }
  ];

  const industryBreakdown = [
    { name: 'Food & Restaurants', value: 35, color: '#FF6B6B' },
    { name: 'Fitness & Health', value: 28, color: '#4ECDC4' },
    { name: 'Fashion & Lifestyle', value: 22, color: '#45B7D1' },
    { name: 'Technology', value: 15, color: '#96CEB4' }
  ];

  // Use real collaborations data for active campaigns
  const activeCampaigns = collaborations.slice(0, 4).map(collab => ({
    id: collab.id,
    name: collab.title || "Untitled Campaign",
    creator: `${collab.creator_profile?.user?.full_name || "Unknown Creator"} (@${collab.creator_profile?.username || "username"})`,
    status: collab.status,
    budget: formatCurrency(collab.compensation_amount || 0),
    reach: collab.reach ? formatReach(collab.reach) : "Pending",
    engagement: collab.engagement_rate ? `${collab.engagement_rate}%` : "Pending",
    deadline: collab.end_date ? new Date(collab.end_date).toLocaleDateString() : "No deadline",
    deliverables: collab.deliverables 
      ? JSON.parse(collab.deliverables).map((d: any) => d.type).join(', ')
      : "To be defined"
  }));

  const recommendedCreators = [
    {
      id: 1,
      name: "Elena Fitness",
      username: "@elena_fit",
      followers: "78K",
      engagement: "7.2%",
      category: "Fitness",
      urScore: 89,
      rate: "$800-1200",
      compatibility: 95,
      avatar: "EF"
    },
    {
      id: 2,
      name: "Chef Roberto",
      username: "@chef_roberto",
      followers: "124K",
      engagement: "5.8%",
      category: "Food",
      urScore: 92,
      rate: "$1200-1800",
      compatibility: 88,
      avatar: "CR"
    },
    {
      id: 3,
      name: "Style Maven",
      username: "@style_maven",
      followers: "156K",
      engagement: "6.5%",
      category: "Fashion",
      urScore: 87,
      rate: "$1000-1500",
      compatibility: 82,
      avatar: "SM"
    },
    {
      id: 4,
      name: "Travel Explorer",
      username: "@travel_explorer",
      followers: "203K",
      engagement: "4.9%",
      category: "Travel",
      urScore: 91,
      rate: "$1500-2200",
      compatibility: 79,
      avatar: "TE"
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: "Completed", className: "bg-green-100 text-green-800" },
      in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-800" },
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      paused: { label: "Paused", className: "bg-gray-100 text-gray-800" }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <DashboardNav />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </div>
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
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-light text-black">Business Dashboard</h1>
                  <p className="text-gray-500 text-lg font-light">
                    {businessProfile?.company_name || user?.user_metadata?.full_name || 'Business'} - Campaign performance overview
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                className="border-gray-200 hover:bg-gray-50 rounded-full px-6 py-3 font-medium"
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

        {/* User Info Card */}
        <div className="mb-8">
          <UserInfoCard />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {businessStats.map((stat, index) => (
            <div key={index} className="group bg-white border border-gray-100 rounded-3xl p-8 hover:border-gray-200 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-300">
                  <stat.icon className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors duration-300" />
                </div>
                {stat.trend && (
                  <div className={`text-sm font-medium ${stat.trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trend.isPositive ? '+' : ''}{stat.trend.value}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-light text-black">{stat.value}</div>
                <div className="text-gray-500 text-sm font-medium">{stat.title}</div>
                <div className="text-gray-400 text-xs">{stat.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Campaign Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Campaign Performance</span>
              </CardTitle>
              <CardDescription>Monthly reach, engagement, and conversions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={campaignPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'reach' ? `${(value as number / 1000000).toFixed(1)}M` : 
                    name === 'engagement' ? `${(value as number / 1000).toFixed(0)}K` :
                    `${(value as number / 1000).toFixed(1)}K`,
                    name === 'reach' ? 'Reach' : 
                    name === 'engagement' ? 'Engagement' : 'Conversions'
                  ]} />
                  <Area type="monotone" dataKey="reach" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="engagement" stackId="2" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* ROI Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>ROI Analysis</span>
              </CardTitle>
              <CardDescription>Return on investment by campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roiData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="campaign" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, 'ROI']} />
                  <Bar dataKey="roi" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Management & Creator Discovery */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Active Campaigns */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>Active Campaigns</span>
                </div>
                <Button variant="outline" size="sm">Manage All</Button>
              </CardTitle>
              <CardDescription>Your current collaborations</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deadline</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeCampaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{campaign.name}</p>
                          <p className="text-xs text-gray-500">{campaign.deliverables}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{campaign.creator}</TableCell>
                      <TableCell className="font-medium">{campaign.budget}</TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <p>{campaign.reach} reach</p>
                          <p className="text-gray-500">{campaign.engagement} engagement</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell className="text-xs text-gray-500">{campaign.deadline}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Quick Actions</span>
              </CardTitle>
              <CardDescription>Common campaign tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Campaign
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Search className="w-4 h-4 mr-2" />
                  Browse Creators
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Content
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message Creators
                </Button>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium text-sm mb-3">Campaign Health</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>On Track</span>
                    <Badge className="bg-green-100 text-green-800">4</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Needs Attention</span>
                    <Badge className="bg-yellow-100 text-yellow-800">2</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Overdue</span>
                    <Badge className="bg-red-100 text-red-800">0</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Creator Recommendations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Recommended Creators</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                <Button variant="outline" size="sm">View All</Button>
              </div>
            </CardTitle>
            <CardDescription>AI-matched creators for your brand</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendedCreators.map((creator) => (
                <Card key={creator.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">
                        {creator.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{creator.name}</p>
                      <p className="text-xs text-gray-500">{creator.username}</p>
                      <Badge variant="outline" className="text-xs mt-1">{creator.category}</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Followers:</span>
                      <span className="font-medium">{creator.followers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Engagement:</span>
                      <span className="font-medium">{creator.engagement}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>URScore:</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="font-medium">{creator.urScore}/100</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate:</span>
                      <span className="font-medium">{creator.rate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Match:</span>
                      <span className={`font-medium ${getCompatibilityColor(creator.compatibility)}`}>
                        {creator.compatibility}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <Button size="sm" className="flex-1 text-xs">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Contact
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-xs">
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Industry Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="w-5 h-5" />
                <span>Industry Distribution</span>
              </CardTitle>
              <CardDescription>Your campaign categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={industryBreakdown}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                    label={({ name, value }) => `${value}%`}
                  >
                    {industryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Upcoming Milestones</span>
              </CardTitle>
              <CardDescription>Important dates and deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Summer Menu - Content Review</p>
                    <p className="text-xs text-gray-600">María García collaboration</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Jan 18</p>
                    <Badge className="bg-blue-100 text-blue-800 text-xs">2 days</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Product Review - Final Delivery</p>
                    <p className="text-xs text-gray-600">Tech Reviewer collaboration</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Jan 22</p>
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">6 days</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Monthly Performance Report</p>
                    <p className="text-xs text-gray-600">All campaigns summary</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Jan 31</p>
                    <Badge className="bg-green-100 text-green-800 text-xs">15 days</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
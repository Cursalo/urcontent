import { useState, useEffect, memo, useMemo, useCallback } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { UserInfoCard } from "@/components/dashboard/UserInfoCard";
import { useDebounce } from "@/hooks/useDebounce";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { performanceMonitor } from "@/lib/performance";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  RadialBarChart,
  RadialBar
} from 'recharts';

// Lazy load chart components for better performance
const LazyLineChart = memo(LineChart);
const LazyAreaChart = memo(AreaChart);
const LazyBarChart = memo(BarChart);
const LazyRadialBarChart = memo(RadialBarChart);
import {
  Camera,
  DollarSign,
  TrendingUp,
  MessageCircle,
  Star,
  Award,
  Clock,
  CheckCircle,
  Instagram,
  Youtube,
  Eye,
  Heart,
  Share2,
  Calendar,
  Target,
  Loader2,
  ExternalLink,
  Copy
} from "lucide-react";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { useAuth } from "@/contexts/AuthContext";
import { creatorService, collaborationService, Collaboration } from "@/services";
import { toast } from "sonner";
import socialMediaCreators from "@/assets/social-media-creators.jpg";
import fitnessCreators from "@/assets/fitness-creators.jpg";
import restaurantFood from "@/assets/restaurant-food-ugc.jpg";

const CreatorDashboard = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatorProfile, setCreatorProfile] = useState<any>(null);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    monthlyEarnings: 0,
    activeCollaborations: 0,
    urScore: 0,
    totalFollowers: 0,
    completedCollaborations: 0,
    avgRating: 0
  });

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !profile || profile.role !== 'creator') return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get creator profile with portfolio
        const creatorData = await creatorService.getCreatorByUserId(user.id);
        if (!creatorData) {
          setError('Perfil de creador no encontrado');
          return;
        }
        setCreatorProfile(creatorData);

        // Get creator's collaborations
        const collaborationsData = await collaborationService.getCollaborations({
          creator_id: creatorData.id
        });
        setCollaborations(collaborationsData);

        // Calculate dashboard stats
        const activeCollab = collaborationsData.filter(c => 
          ['accepted', 'in_progress'].includes(c.status)
        ).length;
        
        const completedCollab = collaborationsData.filter(c => 
          c.status === 'completed'
        ).length;
        
        const monthlyEarnings = collaborationsData
          .filter(c => c.status === 'completed' && c.compensation_amount)
          .reduce((sum, c) => sum + (c.compensation_amount || 0), 0);

        const totalFollowers = (creatorData.instagram_followers || 0) + 
                              (creatorData.tiktok_followers || 0) + 
                              (creatorData.youtube_followers || 0);

        setDashboardStats({
          monthlyEarnings,
          activeCollaborations: activeCollab,
          urScore: creatorData.rating || 0,
          totalFollowers,
          completedCollaborations: completedCollab,
          avgRating: creatorData.rating || 0
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Error al cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, profile]);

  // Format numbers for display
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

  // Dynamic stats based on real data
  const creatorStats = [
    { 
      title: "Monthly Earnings", 
      value: formatCurrency(dashboardStats.monthlyEarnings), 
      icon: DollarSign, 
      trend: { value: "22.5%", isPositive: true }, 
      description: "This month's revenue" 
    },
    { 
      title: "Active Collaborations", 
      value: dashboardStats.activeCollaborations.toString(), 
      icon: MessageCircle, 
      trend: { value: "3", isPositive: true }, 
      description: "Projects in progress" 
    },
    { 
      title: "URScore™", 
      value: `${dashboardStats.urScore}/100`, 
      icon: Star, 
      trend: { value: "2 points", isPositive: true }, 
      description: "Elite tier ranking" 
    },
    { 
      title: "Total Followers", 
      value: formatFollowers(dashboardStats.totalFollowers), 
      icon: TrendingUp, 
      trend: { value: "5.2K", isPositive: true }, 
      description: "Across all platforms" 
    }
  ];

  const urScoreBreakdown = [
    { name: 'Content Quality', value: 96, color: '#E91E63' },
    { name: 'Engagement Rate', value: 94, color: '#9C27B0' },
    { name: 'Professionalism', value: 98, color: '#3F51B5' },
    { name: 'Delivery Time', value: 88, color: '#00BCD4' }
  ];

  const earningsData = [
    { month: 'Jan', earnings: 2100, collaborations: 5 },
    { month: 'Feb', earnings: 2650, collaborations: 7 },
    { month: 'Mar', earnings: 2890, collaborations: 6 },
    { month: 'Apr', earnings: 3100, collaborations: 8 },
    { month: 'May', earnings: 2950, collaborations: 7 },
    { month: 'Jun', earnings: 3240, collaborations: 8 }
  ];

  const engagementData = [
    { platform: 'Instagram', followers: 87000, engagement: 6.8, posts: 45 },
    { platform: 'TikTok', followers: 32000, engagement: 8.2, posts: 28 },
    { platform: 'YouTube', followers: 26000, engagement: 4.9, posts: 12 }
  ];

  // Use real collaborations data
  const recentCollaborations = collaborations.slice(0, 4).map(collab => ({
    id: collab.id,
    brand: collab.business_profile?.company_name || collab.business_profile?.user?.full_name || "Unknown Business",
    status: collab.status,
    value: formatCurrency(collab.compensation_amount || 0),
    date: collab.created_at ? new Date(collab.created_at).toLocaleDateString() : "Unknown",
    type: collab.deliverables ? JSON.parse(collab.deliverables).map((d: any) => d.type).join(', ') : collab.title || "Collaboration",
    engagement: collab.status === 'completed' 
      ? `${collab.reach || 0} reach, ${collab.clicks || 0} clicks` 
      : collab.status === 'in_progress' 
        ? "In progress" 
        : "Pending"
  }));

  // Use real upcoming deadlines from active collaborations
  const upcomingDeadlines = collaborations
    .filter(collab => ['accepted', 'in_progress'].includes(collab.status) && collab.end_date)
    .sort((a, b) => new Date(a.end_date!).getTime() - new Date(b.end_date!).getTime())
    .slice(0, 3)
    .map(collab => {
      const daysUntilDeadline = Math.ceil(
        (new Date(collab.end_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return {
        id: collab.id,
        brand: collab.business_profile?.company_name || "Unknown Business",
        task: collab.status === 'in_progress' ? "Final content delivery" : "Project start",
        date: new Date(collab.end_date!).toLocaleDateString(),
        priority: daysUntilDeadline <= 3 ? "high" : daysUntilDeadline <= 7 ? "medium" : "low"
      };
    });

  const portfolioImages = [
    {
      src: socialMediaCreators,
      alt: "Social media content creation",
      title: "Social Media Mastery",
      description: "Engaging content that drives results"
    },
    {
      src: fitnessCreators,
      alt: "Fitness content collaboration",
      title: "Fitness Collaboration",
      description: "Authentic lifestyle content"
    },
    {
      src: restaurantFood,
      alt: "Food photography and review",
      title: "Food & Lifestyle",
      description: "Mouth-watering food content"
    }
  ];

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

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: { label: "High", className: "bg-red-100 text-red-800" },
      medium: { label: "Medium", className: "bg-yellow-100 text-yellow-800" },
      low: { label: "Low", className: "bg-green-100 text-green-800" }
    };
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    return <Badge className={config.className}>{config.label}</Badge>;
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
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-light text-black">Creator Dashboard</h1>
                  <p className="text-gray-500 text-lg font-light">
                    Welcome back, {creatorProfile?.user?.full_name || user?.user_metadata?.full_name || 'Creator'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {creatorProfile?.public_slug && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const profileUrl = `${window.location.origin}/c/${creatorProfile.public_slug}`;
                      window.open(profileUrl, '_blank');
                    }}
                    className="rounded-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Public Profile
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const profileUrl = `${window.location.origin}/c/${creatorProfile.public_slug}`;
                      navigator.clipboard.writeText(profileUrl);
                      toast.success('Profile URL copied to clipboard!');
                    }}
                    className="rounded-full px-3"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <Button className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105">
                <Camera className="w-4 h-4 mr-2" />
                Upload Content
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
          {creatorStats.map((stat, index) => (
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

        {/* URScore & Portfolio Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* URScore Breakdown */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 hover:border-gray-200 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-black">URScore™</h3>
                <p className="text-gray-500 text-sm">Performance metrics</p>
              </div>
            </div>
            <div className="space-y-6">
              {urScoreBreakdown.map((metric, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{metric.name}</span>
                    <span className="text-sm font-semibold text-black">{metric.value}/100</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-gray-800 to-black rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-black">Overall Score</span>
                  <div className="flex items-center space-x-3">
                    <div className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-medium rounded-full">
                      Elite Tier
                    </div>
                    <span className="font-bold text-2xl text-black">94/100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Showcase */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-8 hover:border-gray-200 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Eye className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-black">Portfolio Showcase</h3>
                <p className="text-gray-500 text-sm">Your best recent work</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6">
              <ImageCarousel 
                images={portfolioImages}
                className="max-w-full mx-auto"
                autoplay={true}
                showControls={true}
              />
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Earnings Chart */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 hover:border-gray-200 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-black">Earnings Overview</h3>
                <p className="text-gray-500 text-sm">Monthly revenue growth</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={earningsData}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'earnings' ? `$${value}` : value,
                      name === 'earnings' ? 'Earnings' : 'Collaborations'
                    ]}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="earnings" 
                    stroke="#000000" 
                    fill="#000000" 
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Platform Performance */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 hover:border-gray-200 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-black">Platform Performance</h3>
                <p className="text-gray-500 text-sm">Engagement by platform</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="platform" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="engagement" 
                    fill="#000000" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Recent Collaborations */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-8 hover:border-gray-200 transition-all duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-black">Recent Collaborations</h3>
                  <p className="text-gray-500 text-sm">Your latest partnerships</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-gray-200 hover:bg-gray-50 rounded-full px-4 py-2"
              >
                View All
              </Button>
            </div>
            <div className="overflow-x-auto">
              <div className="space-y-4">
                {recentCollaborations.map((collab) => (
                  <div key={collab.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                        <div className="w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg"></div>
                      </div>
                      <div>
                        <p className="font-semibold text-black">{collab.brand}</p>
                        <p className="text-sm text-gray-500">{collab.type}</p>
                        <p className="text-xs text-gray-400">{collab.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-black">{collab.value}</p>
                      <div className="mb-2">{getStatusBadge(collab.status)}</div>
                      <p className="text-xs text-gray-500">{collab.engagement}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 hover:border-gray-200 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-black">Upcoming Deadlines</h3>
                <p className="text-gray-500 text-sm">Priority tasks</p>
              </div>
            </div>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="p-5 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-black text-sm">{deadline.brand}</p>
                      <p className="text-xs text-gray-600 mt-1">{deadline.task}</p>
                    </div>
                    {getPriorityBadge(deadline.priority)}
                  </div>
                  <p className="text-xs text-gray-500">{deadline.date}</p>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full mt-6 border-gray-200 hover:bg-gray-50 rounded-2xl py-6"
              >
                <Calendar className="w-4 h-4 mr-2" />
                View Full Calendar
              </Button>
            </div>
          </div>
        </div>

        {/* Achievement Section */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 hover:border-gray-200 transition-all duration-300">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-black">Recent Achievements</h3>
              <p className="text-gray-500 text-sm">Your milestones and recognition</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl hover:from-yellow-100 hover:to-orange-100 transition-all duration-300 cursor-pointer">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Star className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="font-bold text-black text-lg">Elite Status</p>
                <p className="text-sm text-gray-600 mt-1">Reached 90+ URScore</p>
              </div>
            </div>
            
            <div className="group p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl hover:from-green-100 hover:to-emerald-100 transition-all duration-300 cursor-pointer">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="font-bold text-black text-lg">100K Milestone</p>
                <p className="text-sm text-gray-600 mt-1">Total followers reached</p>
              </div>
            </div>
            
            <div className="group p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl hover:from-purple-100 hover:to-pink-100 transition-all duration-300 cursor-pointer">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="font-bold text-black text-lg">Perfect Month</p>
                <p className="text-sm text-gray-600 mt-1">100% delivery rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;
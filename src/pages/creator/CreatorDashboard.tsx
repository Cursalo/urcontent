import React, { useState, useEffect, memo, useMemo, useCallback } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { UserInfoCard } from "@/components/dashboard/UserInfoCard";
import { CollaborationsTable } from "@/components/dashboard/CollaborationsTable";
import { PortfolioShowcase } from "@/components/dashboard/PortfolioShowcase";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { DashboardLoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
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
import { useHybridDashboard } from "@/hooks/useHybridDashboard";
import { toast } from "sonner";
import socialMediaCreators from "@/assets/social-media-creators.jpg";
import fitnessCreators from "@/assets/fitness-creators.jpg";
import restaurantFood from "@/assets/restaurant-food-ugc.jpg";
import { DashboardErrorBoundary, CardErrorFallback } from "@/components/dashboard/DashboardErrorBoundary";

const CreatorDashboard = () => {
  const { user, profile } = useAuth();
  const {
    loading,
    error,
    dashboardData,
    authType,
    userProfile: creatorProfile,
    collaborations,
    portfolio,
    metrics,
    analytics,
    refresh
  } = useHybridDashboard('creator');
  
  // Legacy state for component compatibility
  const [dashboardStats, setDashboardStats] = useState({
    monthlyEarnings: 0,
    activeCollaborations: 0,
    urScore: 0,
    totalFollowers: 0,
    completedCollaborations: 0,
    avgRating: 0
  });

  // Update legacy stats when dashboard data changes
  useEffect(() => {
    if (dashboardData && metrics) {
      setDashboardStats({
        monthlyEarnings: metrics.monthlyEarnings || 0,
        activeCollaborations: metrics.activeCollaborations || 0,
        urScore: metrics.urScore || 0,
        totalFollowers: metrics.totalFollowers || 0,
        completedCollaborations: metrics.completedCollaborations || 0,
        avgRating: metrics.avgRating || 0
      });
      
      console.log(`✅ Creator Dashboard: Loaded ${authType} data with ${collaborations.length} collaborations`);
      
      // Show success notification
      if (!loading && dashboardData) {
        toast.success('Dashboard loaded successfully!', {
          description: `Welcome back! You have ${metrics.activeCollaborations} active collaborations and ${portfolio.length} portfolio items.`,
          duration: 4000,
        });
      }
    }
  }, [dashboardData, metrics, authType, collaborations.length, portfolio.length, loading]);
  
  // Handle errors with toast notifications
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

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

  // Dynamic stats based on real or mock data
  const creatorStats = [
    { 
      title: "Monthly Earnings", 
      value: formatCurrency(dashboardStats.monthlyEarnings), 
      icon: DollarSign, 
      trend: { value: "22.5%", isPositive: true }, 
      description: "This month's revenue",
      color: "green" as const,
      progress: 75
    },
    { 
      title: "Active Collaborations", 
      value: dashboardStats.activeCollaborations.toString(), 
      icon: MessageCircle, 
      trend: { value: "3", isPositive: true }, 
      description: "Projects in progress",
      color: "blue" as const,
      progress: 60
    },
    { 
      title: "URScore™", 
      value: `${dashboardStats.urScore}/100`, 
      icon: Star, 
      trend: { value: "2 points", isPositive: true }, 
      description: "Elite tier ranking",
      color: "orange" as const,
      progress: dashboardStats.urScore
    },
    { 
      title: "Total Followers", 
      value: formatFollowers(dashboardStats.totalFollowers), 
      icon: TrendingUp, 
      trend: { value: "5.2K", isPositive: true }, 
      description: "Across all platforms",
      color: "purple" as const,
      progress: 85
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

  // Safely process collaborations data with comprehensive error handling
  const recentCollaborations = React.useMemo(() => {
    try {
      if (!Array.isArray(collaborations)) {
        console.warn('CreatorDashboard: collaborations is not an array:', collaborations);
        return [];
      }
      
      return collaborations.slice(0, 4).map((collab, index) => {
        // Safe collaboration processing with fallbacks
        if (!collab || typeof collab !== 'object') {
          console.warn(`CreatorDashboard: Invalid collaboration at index ${index}:`, collab);
          return {
            id: `invalid-collab-${index}`,
            brand: "Unknown Business",
            status: "unknown",
            value: formatCurrency(0),
            date: "Unknown",
            type: "Collaboration",
            engagement: "No data"
          };
        }
        
        let deliverableTypes = "Collaboration";
        
        try {
          if (collab.deliverables && typeof collab.deliverables === 'string') {
            const parsed = JSON.parse(collab.deliverables);
            if (Array.isArray(parsed)) {
              deliverableTypes = parsed
                .map((d: any) => d?.type || 'Unknown')
                .filter(Boolean)
                .join(', ') || "Collaboration";
            }
          }
        } catch (e) {
          console.warn('Failed to parse deliverables:', collab.deliverables, e);
          deliverableTypes = collab.title || "Collaboration";
        }

        return {
          id: collab.id || `collab-${index}`,
          brand: collab.business_profile?.company_name || 
                 collab.business_profile?.user?.full_name || 
                 "Unknown Business",
          status: collab.status || "unknown",
          value: formatCurrency(collab.compensation_amount || 0),
          date: collab.created_at ? 
                new Date(collab.created_at).toLocaleDateString() : 
                "Unknown",
          type: deliverableTypes,
          engagement: collab.status === 'completed' 
            ? `${collab.reach || 0} reach, ${collab.clicks || 0} clicks` 
            : collab.status === 'in_progress' 
              ? "In progress" 
              : "Pending"
        };
      });
    } catch (error) {
      console.error('CreatorDashboard: Error processing collaborations:', error);
      return [];
    }
  }, [collaborations]);

  // Safely process upcoming deadlines with comprehensive error handling
  const upcomingDeadlines = React.useMemo(() => {
    try {
      if (!Array.isArray(collaborations)) {
        console.warn('CreatorDashboard: collaborations is not an array for deadlines');
        return [];
      }
      
      return collaborations
        .filter(collab => {
          if (!collab || typeof collab !== 'object') return false;
          return ['accepted', 'in_progress'].includes(collab.status) && 
                 collab.end_date &&
                 !isNaN(new Date(collab.end_date).getTime());
        })
        .sort((a, b) => {
          try {
            return new Date(a.end_date!).getTime() - new Date(b.end_date!).getTime();
          } catch (error) {
            console.warn('Error sorting deadlines:', error);
            return 0;
          }
        })
        .slice(0, 3)
        .map((collab, index) => {
          try {
            const daysUntilDeadline = Math.ceil(
              (new Date(collab.end_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );
            
            return {
              id: collab.id || `deadline-${index}`,
              brand: collab.business_profile?.company_name || "Unknown Business",
              task: collab.status === 'in_progress' ? "Final content delivery" : "Project start",
              date: new Date(collab.end_date!).toLocaleDateString(),
              priority: daysUntilDeadline <= 3 ? "high" : daysUntilDeadline <= 7 ? "medium" : "low"
            };
          } catch (error) {
            console.warn('Error processing deadline:', collab, error);
            return {
              id: `error-deadline-${index}`,
              brand: "Unknown Business",
              task: "Unknown task",
              date: "Unknown date",
              priority: "low" as const
            };
          }
        });
    } catch (error) {
      console.error('CreatorDashboard: Error processing deadlines:', error);
      return [];
    }
  }, [collaborations]);

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

  // Loading state with enhanced skeleton
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
          <DashboardErrorBoundary componentName="UserInfoCard" fallback={CardErrorFallback}>
            <UserInfoCard />
          </DashboardErrorBoundary>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {creatorStats.map((stat, index) => (
            <DashboardErrorBoundary key={index} componentName={`StatsCard-${stat.title}`} fallback={CardErrorFallback}>
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

          {/* Enhanced Portfolio Showcase */}
          <div className="lg:col-span-2">
            <DashboardErrorBoundary componentName="PortfolioShowcase" fallback={CardErrorFallback}>
              <PortfolioShowcase 
                portfolioItems={portfolio || []}
                maxItems={6}
              />
            </DashboardErrorBoundary>
          </div>
        </div>

        {/* Enhanced Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Earnings Chart */}
          <DashboardErrorBoundary componentName="EarningsChart" fallback={CardErrorFallback}>
            <AnalyticsChart 
              data={analytics.monthly || []}
              title="Earnings Overview"
              description="Monthly revenue growth"
              type="area"
              metric="earnings"
              height={300}
            />
          </DashboardErrorBoundary>

          {/* Platform Performance */}
          <DashboardErrorBoundary componentName="PlatformPerformanceChart" fallback={CardErrorFallback}>
            <AnalyticsChart 
              data={analytics.weekly || []}
              title="Platform Performance"
              description="Engagement by platform"
              type="bar"
              metric="engagement"
              height={300}
            />
          </DashboardErrorBoundary>
        </div>

        {/* Additional Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Follower Growth */}
          <DashboardErrorBoundary componentName="FollowerGrowthChart" fallback={CardErrorFallback}>
            <AnalyticsChart 
              data={analytics.daily || []}
              title="Follower Growth"
              description="Daily follower trends"
              type="line"
              metric="followers"
              height={250}
            />
          </DashboardErrorBoundary>

          {/* Platform Distribution */}
          <DashboardErrorBoundary componentName="PlatformDistributionChart" fallback={CardErrorFallback}>
            <AnalyticsChart 
              data={[]}
              title="Platform Distribution"
              description="Audience by platform"
              type="pie"
              metric="distribution"
              height={250}
            />
          </DashboardErrorBoundary>

          {/* Performance Radar */}
          <DashboardErrorBoundary componentName="PerformanceRadarChart" fallback={CardErrorFallback}>
            <AnalyticsChart 
              data={[]}
              title="Performance Metrics"
              description="Overall performance score"
              type="radar"
              metric="performance"
              height={250}
            />
          </DashboardErrorBoundary>
        </div>

        {/* Enhanced Collaborations and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Recent Collaborations */}
          <div className="lg:col-span-2">
            <DashboardErrorBoundary componentName="CollaborationsTable" fallback={CardErrorFallback}>
              <CollaborationsTable 
                collaborations={collaborations}
                maxItems={4}
              />
            </DashboardErrorBoundary>
          </div>

          {/* Activity Feed */}
          <div>
            <DashboardErrorBoundary componentName="ActivityFeed" fallback={CardErrorFallback}>
              <ActivityFeed maxItems={6} />
            </DashboardErrorBoundary>
          </div>
        </div>

        {/* Achievement Section */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 hover:border-gray-200 transition-all duration-300 mb-16">
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

        {/* Performance Summary Card */}
        <div className="bg-gradient-to-br from-black to-gray-900 text-white rounded-3xl p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-light mb-2">Monthly Performance Summary</h3>
              <p className="text-gray-300">Your content creation impact this month</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-light mb-1">{formatCurrency(dashboardStats.monthlyEarnings)}</div>
              <div className="text-sm text-gray-300">Total Earnings</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-light mb-1">{dashboardStats.activeCollaborations}</div>
              <div className="text-xs text-gray-300">Active Projects</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-light mb-1">{formatFollowers(dashboardStats.totalFollowers)}</div>
              <div className="text-xs text-gray-300">Total Reach</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-light mb-1">{dashboardStats.urScore}/100</div>
              <div className="text-xs text-gray-300">URScore</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-light mb-1">{dashboardStats.completedCollaborations}</div>
              <div className="text-xs text-gray-300">Completed</div>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-white/5 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Ready to create more amazing content?</p>
                <p className="text-gray-300 text-sm mt-1">Explore new collaboration opportunities</p>
              </div>
              <Button className="bg-white text-black hover:bg-gray-100 rounded-full px-6 py-3 font-medium">
                Find Collaborations
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Cell,
  RadialBarChart,
  RadialBar,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Download,
  Filter,
  Target,
  Eye,
  Heart,
  Share2,
  DollarSign,
  Users,
  Zap,
  Award
} from "lucide-react";

interface BusinessAnalyticsProps {
  data: {
    monthly?: any[];
    weekly?: any[];
    daily?: any[];
  };
  metrics: {
    totalSpent: number;
    activeCampaigns: number;
    totalReach: number;
    avgROI: number;
    completedCampaigns: number;
    avgEngagement: number;
  };
}

export const BusinessAnalytics: React.FC<BusinessAnalyticsProps> = ({ data, metrics }) => {
  const [timeRange, setTimeRange] = useState("6months");
  const [activeTab, setActiveTab] = useState("performance");

  // Format functions
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

  // Mock analytics data
  const performanceData = [
    { month: 'Jan', investment: 15000, reach: 120000, engagement: 8500, conversions: 240, roi: 3.2 },
    { month: 'Feb', investment: 18500, reach: 155000, engagement: 11200, conversions: 310, roi: 3.8 },
    { month: 'Mar', investment: 22000, reach: 180000, engagement: 13800, conversions: 380, roi: 4.1 },
    { month: 'Apr', investment: 19500, reach: 165000, engagement: 12100, conversions: 340, roi: 4.5 },
    { month: 'May', investment: 25000, reach: 210000, engagement: 16500, conversions: 450, roi: 4.8 },
    { month: 'Jun', investment: 28000, reach: 245000, engagement: 19200, conversions: 520, roi: 5.2 }
  ];

  const platformData = [
    { name: 'Instagram', value: 45, spend: 67500, reach: 180000, color: '#E1306C' },
    { name: 'TikTok', value: 30, spend: 45000, reach: 125000, color: '#000000' },
    { name: 'YouTube', value: 20, spend: 30000, reach: 85000, color: '#FF0000' },
    { name: 'Twitter', value: 5, spend: 7500, reach: 25000, color: '#1DA1F2' }
  ];

  const categoryPerformance = [
    { category: 'Fashion', campaigns: 8, spend: 45000, reach: 320000, roi: 4.2 },
    { category: 'Food', campaigns: 6, spend: 38000, reach: 285000, roi: 4.8 },
    { category: 'Tech', campaigns: 4, spend: 52000, reach: 180000, roi: 3.9 },
    { category: 'Fitness', campaigns: 5, spend: 35000, reach: 240000, roi: 5.1 }
  ];

  const engagementTrends = [
    { week: 'W1', likes: 12500, comments: 850, shares: 320, saves: 1200 },
    { week: 'W2', likes: 15200, comments: 980, shares: 410, saves: 1450 },
    { week: 'W3', likes: 18400, comments: 1250, shares: 520, saves: 1680 },
    { week: 'W4', likes: 16800, comments: 1120, shares: 480, saves: 1520 },
    { week: 'W5', likes: 21200, comments: 1380, shares: 650, saves: 1890 },
    { week: 'W6', likes: 24500, comments: 1620, shares: 780, saves: 2150 }
  ];

  const competitorData = [
    { metric: 'Avg Engagement', yours: 6.8, industry: 5.2, competitor: 4.9 },
    { metric: 'ROI', yours: 4.5, industry: 3.8, competitor: 3.2 },
    { metric: 'Reach Growth', yours: 15.2, industry: 12.5, competitor: 9.8 },
    { metric: 'Cost per Engagement', yours: 0.45, industry: 0.62, competitor: 0.71 }
  ];

  // Calculate trends
  const calculateTrend = (data: any[], key: string) => {
    if (data.length < 2) return { value: 0, isPositive: true };
    const latest = data[data.length - 1][key];
    const previous = data[data.length - 2][key];
    const change = ((latest - previous) / previous) * 100;
    return { value: Math.abs(change).toFixed(1), isPositive: change > 0 };
  };

  const roiTrend = calculateTrend(performanceData, 'roi');
  const reachTrend = calculateTrend(performanceData, 'reach');
  const engagementTrend = calculateTrend(performanceData, 'engagement');
  const conversionTrend = calculateTrend(performanceData, 'conversions');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-black">Analytics & Reports</h2>
          <p className="text-gray-500">Comprehensive insights into your campaign performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="rounded-full">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total ROI</p>
              <p className="text-2xl font-bold text-black">{metrics.avgROI.toFixed(1)}x</p>
              <div className={`flex items-center text-sm ${roiTrend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {roiTrend.isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {roiTrend.value}% vs last period
              </div>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reach</p>
              <p className="text-2xl font-bold text-black">{formatNumber(metrics.totalReach)}</p>
              <div className={`flex items-center text-sm ${reachTrend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {reachTrend.isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {reachTrend.value}% vs last period
              </div>
            </div>
            <Eye className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Engagement</p>
              <p className="text-2xl font-bold text-black">{metrics.avgEngagement.toFixed(1)}%</p>
              <div className={`flex items-center text-sm ${engagementTrend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {engagementTrend.isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {engagementTrend.value}% vs last period
              </div>
            </div>
            <Heart className="w-8 h-8 text-red-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Investment</p>
              <p className="text-2xl font-bold text-black">{formatCurrency(metrics.totalSpent)}</p>
              <div className="flex items-center text-sm text-gray-500">
                <DollarSign className="w-4 h-4 mr-1" />
                {metrics.completedCampaigns} campaigns
              </div>
            </div>
            <Target className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ROI & Investment Trend */}
            <Card className="p-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>ROI & Investment Trend</span>
                </CardTitle>
                <CardDescription>Monthly investment vs return analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis yAxisId="left" stroke="#666" />
                    <YAxis yAxisId="right" orientation="right" stroke="#666" />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'investment') return [formatCurrency(Number(value)), 'Investment'];
                        if (name === 'roi') return [`${value}x`, 'ROI'];
                        return [value, name];
                      }}
                    />
                    <Bar yAxisId="left" dataKey="investment" fill="#3B82F6" fillOpacity={0.6} />
                    <Line yAxisId="right" type="monotone" dataKey="roi" stroke="#10B981" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Reach & Conversions */}
            <Card className="p-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Reach & Conversions</span>
                </CardTitle>
                <CardDescription>Campaign reach and conversion performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'reach') return [formatNumber(Number(value)), 'Reach'];
                        if (name === 'conversions') return [value, 'Conversions'];
                        return [value, name];
                      }}
                    />
                    <Area type="monotone" dataKey="reach" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="conversions" stackId="2" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Category Performance */}
          <Card className="p-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium">Performance by Category</CardTitle>
              <CardDescription>Campaign effectiveness across different content categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryPerformance.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <div>
                        <p className="font-medium">{category.category}</p>
                        <p className="text-sm text-gray-500">{category.campaigns} campaigns</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-8 text-sm">
                      <div className="text-center">
                        <p className="font-semibold">{formatCurrency(category.spend)}</p>
                        <p className="text-gray-500">Spend</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{formatNumber(category.reach)}</p>
                        <p className="text-gray-500">Reach</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-green-600">{category.roi}x</p>
                        <p className="text-gray-500">ROI</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platforms Tab */}
        <TabsContent value="platforms" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Distribution */}
            <Card className="p-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium flex items-center space-x-2">
                  <PieChartIcon className="w-5 h-5" />
                  <span>Platform Distribution</span>
                </CardTitle>
                <CardDescription>Campaign budget allocation by platform</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {platformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Platform Performance */}
            <Card className="p-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium">Platform Performance</CardTitle>
                <CardDescription>Detailed metrics by platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {platformData.map((platform, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: platform.color }}
                          />
                          <span className="font-medium">{platform.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">{platform.value}% of budget</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm ml-5">
                        <div>
                          <p className="font-semibold">{formatCurrency(platform.spend)}</p>
                          <p className="text-gray-500">Total Spend</p>
                        </div>
                        <div>
                          <p className="font-semibold">{formatNumber(platform.reach)}</p>
                          <p className="text-gray-500">Total Reach</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <Card className="p-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium flex items-center space-x-2">
                <Heart className="w-5 h-5" />
                <span>Engagement Trends</span>
              </CardTitle>
              <CardDescription>Weekly engagement metrics breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={engagementTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Bar dataKey="likes" stackId="a" fill="#E1306C" />
                  <Bar dataKey="comments" stackId="a" fill="#3B82F6" />
                  <Bar dataKey="shares" stackId="a" fill="#10B981" />
                  <Bar dataKey="saves" stackId="a" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Benchmarks Tab */}
        <TabsContent value="benchmarks" className="space-y-6">
          <Card className="p-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Industry Benchmarks</span>
              </CardTitle>
              <CardDescription>Compare your performance against industry standards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {competitorData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.metric}</span>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-green-600 font-semibold">You: {item.yours}</span>
                        <span className="text-gray-500">Industry: {item.industry}</span>
                        <span className="text-gray-400">Competitor: {item.competitor}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${(item.yours / Math.max(item.yours, item.industry, item.competitor)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
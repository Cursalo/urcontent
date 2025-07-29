import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Heart, 
  Eye,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { MockAnalyticsData } from '@/data/mockUsers';

interface AnalyticsChartProps {
  data: MockAnalyticsData[];
  title?: string;
  description?: string;
  type?: 'area' | 'line' | 'bar' | 'pie' | 'radar';
  metric?: string;
  showFilters?: boolean;
  height?: number;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  data,
  title = "Analytics Overview",
  description = "Performance metrics over time",
  type = 'area',
  metric = 'engagement',
  showFilters = true,
  height = 300
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState(metric);

  // Sample data for different chart types
  const sampleEarningsData = [
    { month: 'Jan', earnings: 2100, collaborations: 5, reach: 45000 },
    { month: 'Feb', earnings: 2650, collaborations: 7, reach: 52000 },
    { month: 'Mar', earnings: 2890, collaborations: 6, reach: 48000 },
    { month: 'Apr', earnings: 3100, collaborations: 8, reach: 58000 },
    { month: 'May', earnings: 2950, collaborations: 7, reach: 55000 },
    { month: 'Jun', earnings: 3240, collaborations: 8, reach: 62000 }
  ];

  const platformData = [
    { name: 'Instagram', value: 65, color: '#E1306C' },
    { name: 'TikTok', value: 25, color: '#000000' },
    { name: 'YouTube', value: 10, color: '#FF0000' }
  ];

  const engagementData = [
    { platform: 'Instagram', followers: 87000, engagement: 6.8, posts: 45 },
    { platform: 'TikTok', followers: 32000, engagement: 8.2, posts: 28 },
    { platform: 'YouTube', followers: 26000, engagement: 4.9, posts: 12 }
  ];

  const radarData = [
    { subject: 'Content Quality', A: 96, fullMark: 100 },
    { subject: 'Engagement Rate', A: 94, fullMark: 100 },
    { subject: 'Professionalism', A: 98, fullMark: 100 },
    { subject: 'Delivery Time', A: 88, fullMark: 100 },
    { subject: 'Communication', A: 92, fullMark: 100 },
    { subject: 'Creativity', A: 95, fullMark: 100 }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getTrendIcon = (value: number) => {
    return value > 0 ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-lg">
          <p className="font-semibold text-black mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {
                entry.name === 'earnings' 
                  ? formatCurrency(entry.value)
                  : entry.name === 'reach'
                  ? formatNumber(entry.value)
                  : entry.value
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (type) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={sampleEarningsData}>
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
              <Tooltip content={<CustomTooltip />} />
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
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={sampleEarningsData}>
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
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="collaborations" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="earnings" 
                stroke="#000000" 
                strokeWidth={3}
                dot={{ fill: '#000000', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
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
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="engagement" 
                fill="#000000" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={platformData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {platformData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tick={{ fontSize: 10, fill: '#6b7280' }}
              />
              <Radar 
                name="Score" 
                dataKey="A" 
                stroke="#000000" 
                fill="#000000" 
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="bg-white border border-gray-100 rounded-3xl hover:border-gray-200 transition-all duration-300">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-medium text-black">{title}</CardTitle>
              <CardDescription className="text-gray-500 text-sm">{description}</CardDescription>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {showFilters && (
              <>
                <div className="flex items-center space-x-1">
                  {['7d', '30d', '90d', '1y'].map((period) => (
                    <Button
                      key={period}
                      size="sm"
                      variant={selectedPeriod === period ? "default" : "outline"}
                      className={`text-xs px-3 py-1 rounded-full ${
                        selectedPeriod === period 
                          ? "bg-black text-white hover:bg-gray-800" 
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedPeriod(period as any)}
                    >
                      {period}
                    </Button>
                  ))}
                </div>
                <Button size="sm" variant="outline" className="rounded-full p-2">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button size="sm" variant="outline" className="rounded-full p-2">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Key Metrics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 bg-gray-50 rounded-2xl">
            <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-lg font-bold text-black">$3,240</div>
            <div className="text-xs text-gray-500 flex items-center justify-center mt-1">
              {getTrendIcon(22.5)}
              <span className="ml-1">+22.5%</span>
            </div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-2xl">
            <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-lg font-bold text-black">145K</div>
            <div className="text-xs text-gray-500 flex items-center justify-center mt-1">
              {getTrendIcon(5.2)}
              <span className="ml-1">+5.2K</span>
            </div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-2xl">
            <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Heart className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-lg font-bold text-black">6.8%</div>
            <div className="text-xs text-gray-500 flex items-center justify-center mt-1">
              {getTrendIcon(0.3)}
              <span className="ml-1">+0.3%</span>
            </div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-2xl">
            <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Eye className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-lg font-bold text-black">2.1M</div>
            <div className="text-xs text-gray-500 flex items-center justify-center mt-1">
              {getTrendIcon(15.2)}
              <span className="ml-1">+15.2%</span>
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="p-6 bg-gray-50 rounded-2xl">
          {renderChart()}
        </div>

        {/* Chart Legend/Info */}
        <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-black rounded-full"></div>
              <span>Primary Metric</span>
            </div>
            {type === 'line' && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Secondary Metric</span>
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
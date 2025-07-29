import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number | null | undefined;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  } | null | undefined;
  progress?: number | null | undefined; // 0-100 for progress bar
  variant?: 'default' | 'gradient' | 'outline';
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  className?: string;
}

export const StatsCard = memo(({ 
  title, 
  value: rawValue, 
  description, 
  icon: Icon, 
  trend: rawTrend, 
  progress: rawProgress,
  variant = 'default',
  color = 'gray',
  className = "" 
}: StatsCardProps) => {
  // Safe value processing with fallbacks
  const value = React.useMemo(() => {
    if (rawValue === null || rawValue === undefined) {
      console.warn('StatsCard: value is null/undefined for title:', title);
      return '0';
    }
    if (typeof rawValue === 'string' || typeof rawValue === 'number') {
      return rawValue.toString();
    }
    console.warn('StatsCard: invalid value type for title:', title, typeof rawValue);
    return '0';
  }, [rawValue, title]);
  
  // Safe trend processing
  const trend = React.useMemo(() => {
    if (!rawTrend || typeof rawTrend !== 'object') return null;
    if (!rawTrend.value || typeof rawTrend.isPositive !== 'boolean') {
      console.warn('StatsCard: invalid trend data for title:', title, rawTrend);
      return null;
    }
    return rawTrend;
  }, [rawTrend, title]);
  
  // Safe progress processing
  const progress = React.useMemo(() => {
    if (rawProgress === null || rawProgress === undefined) return undefined;
    const numProgress = Number(rawProgress);
    if (isNaN(numProgress)) {
      console.warn('StatsCard: invalid progress value for title:', title, rawProgress);
      return undefined;
    }
    // Clamp between 0 and 100
    return Math.max(0, Math.min(100, numProgress));
  }, [rawProgress, title]);
  const getColorClasses = (color: string) => {
    try {
      const colors = {
        blue: 'from-blue-500 to-blue-600 bg-blue-50 text-blue-600 border-blue-200',
        green: 'from-green-500 to-green-600 bg-green-50 text-green-600 border-green-200',
        purple: 'from-purple-500 to-purple-600 bg-purple-50 text-purple-600 border-purple-200',
        orange: 'from-orange-500 to-orange-600 bg-orange-50 text-orange-600 border-orange-200',
        red: 'from-red-500 to-red-600 bg-red-50 text-red-600 border-red-200',
        gray: 'from-gray-500 to-gray-600 bg-gray-50 text-gray-600 border-gray-200'
      };
      return colors[color as keyof typeof colors] || colors.gray;
    } catch (error) {
      console.warn('StatsCard: Error getting color classes:', error);
      return 'from-gray-500 to-gray-600 bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const colorClasses = getColorClasses(color);

  const getCardClasses = () => {
    try {
      const colorParts = colorClasses.split(' ');
      switch (variant) {
        case 'gradient':
          return `group bg-gradient-to-br ${colorParts[0] || 'from-gray-500'} ${colorParts[1] || 'to-gray-600'} text-white border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300`;
        case 'outline':
          return `group bg-white border-2 ${colorParts[3] || 'border-gray-200'} hover:border-opacity-100 border-opacity-50 hover:shadow-lg transition-all duration-300`;
        default:
          return `group bg-white border border-gray-100 rounded-3xl hover:border-gray-200 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1`;
      }
    } catch (error) {
      console.warn('StatsCard: Error getting card classes:', error);
      return 'group bg-white border border-gray-100 rounded-3xl hover:border-gray-200 transition-all duration-300';
    }
  };

  const getIconClasses = () => {
    try {
      const colorParts = colorClasses.split(' ');
      if (variant === 'gradient') {
        return 'w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm';
      }
      if (variant === 'outline') {
        return `w-12 h-12 ${colorParts[2] || 'bg-gray-50'} rounded-2xl flex items-center justify-center ${colorParts[3] || 'text-gray-600'}`;
      }
      return 'w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-300';
    } catch (error) {
      console.warn('StatsCard: Error getting icon classes:', error);
      return 'w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center';
    }
  };

  const getTextClasses = () => {
    if (variant === 'gradient') {
      return 'text-white';
    }
    return 'text-black';
  };

  const getDescriptionClasses = () => {
    if (variant === 'gradient') {
      return 'text-white/80';
    }
    return 'text-gray-500';
  };

  return (
    <Card className={`${getCardClasses()} ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div className={getIconClasses()}>
          <Icon className={`w-6 h-6 ${variant === 'gradient' ? 'text-white' : variant === 'outline' ? colorClasses.split(' ')[3] : 'text-gray-600 group-hover:text-white'} transition-colors duration-300`} />
        </div>
        {trend && (
          <div className={`text-sm font-medium flex items-center space-x-1 ${
            variant === 'gradient' 
              ? 'text-white/90' 
              : trend.isPositive 
                ? 'text-green-600' 
                : 'text-red-600'
          }`}>
            {trend.isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{trend.isPositive ? '+' : ''}{trend.value || '0'}</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className={`text-3xl font-light ${getTextClasses()}`}>
            {value || '0'}
          </div>
          <div className={`text-sm font-medium ${getTextClasses()}`}>
            {title || 'Untitled Stat'}
          </div>
          {description && (
            <div className={`text-xs ${getDescriptionClasses()}`}>
              {description}
            </div>
          )}
        </div>

        {progress !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className={variant === 'gradient' ? 'text-white/80' : 'text-gray-500'}>
                Progress
              </span>
              <span className={`font-medium ${getTextClasses()}`}>
                {progress?.toFixed(0) || '0'}%
              </span>
            </div>
            <Progress 
              value={progress || 0} 
              className={`h-2 ${
                variant === 'gradient' 
                  ? 'bg-white/20' 
                  : 'bg-gray-200'
              }`}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
});

StatsCard.displayName = "StatsCard";
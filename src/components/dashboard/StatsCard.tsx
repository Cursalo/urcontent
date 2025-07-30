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

  const getCardClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'group bg-black text-white border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300';
      case 'outline':
        return 'group bg-white border-2 border-gray-300 hover:border-black transition-all duration-300';
      default:
        return 'group bg-white border border-gray-200 rounded hover:border-black transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1';
    }
  };

  const getIconClasses = () => {
    if (variant === 'gradient') {
      return 'w-12 h-12 bg-white/20 rounded flex items-center justify-center text-white backdrop-blur-sm';
    }
    if (variant === 'outline') {
      return 'w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-black';
    }
    return 'w-12 h-12 bg-gray-100 rounded flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-300';
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
          <Icon className={`w-6 h-6 ${
            variant === 'gradient' ? 'text-white' : 
            variant === 'outline' ? 'text-black' : 
            'text-gray-600 group-hover:text-white'
          } transition-colors duration-300`} />
        </div>
        {trend && (
          <div className={`text-sm font-medium flex items-center space-x-1 ${
            variant === 'gradient' ? 'text-white/90' : 'text-gray-700'
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
                variant === 'gradient' ? 'bg-white/20' : 'bg-gray-200'
              }`} 
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
});

StatsCard.displayName = "StatsCard";
import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  progress?: number; // 0-100 for progress bar
  variant?: 'default' | 'gradient' | 'outline';
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  className?: string;
}

export const StatsCard = memo(({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  progress,
  variant = 'default',
  color = 'gray',
  className = "" 
}: StatsCardProps) => {
  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 bg-blue-50 text-blue-600 border-blue-200',
      green: 'from-green-500 to-green-600 bg-green-50 text-green-600 border-green-200',
      purple: 'from-purple-500 to-purple-600 bg-purple-50 text-purple-600 border-purple-200',
      orange: 'from-orange-500 to-orange-600 bg-orange-50 text-orange-600 border-orange-200',
      red: 'from-red-500 to-red-600 bg-red-50 text-red-600 border-red-200',
      gray: 'from-gray-500 to-gray-600 bg-gray-50 text-gray-600 border-gray-200'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  const colorClasses = getColorClasses(color);

  const getCardClasses = () => {
    switch (variant) {
      case 'gradient':
        return `group bg-gradient-to-br ${colorClasses.split(' ')[0]} ${colorClasses.split(' ')[1]} text-white border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300`;
      case 'outline':
        return `group bg-white border-2 ${colorClasses.split(' ')[3]} hover:border-opacity-100 border-opacity-50 hover:shadow-lg transition-all duration-300`;
      default:
        return `group bg-white border border-gray-100 rounded-3xl hover:border-gray-200 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1`;
    }
  };

  const getIconClasses = () => {
    if (variant === 'gradient') {
      return 'w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm';
    }
    if (variant === 'outline') {
      return `w-12 h-12 ${colorClasses.split(' ')[2]} rounded-2xl flex items-center justify-center ${colorClasses.split(' ')[3]}`;
    }
    return 'w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-300';
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
            <span>{trend.isPositive ? '+' : ''}{trend.value}</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className={`text-3xl font-light ${getTextClasses()}`}>
            {value}
          </div>
          <div className={`text-sm font-medium ${getTextClasses()}`}>
            {title}
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
                {progress}%
              </span>
            </div>
            <Progress 
              value={progress} 
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
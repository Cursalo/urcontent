import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Zap, 
  Star, 
  Crown, 
  X, 
  TrendingUp,
  Sparkles,
  Gift
} from 'lucide-react';

interface GamificationNotification {
  id: string;
  type: 'xp_gained' | 'level_up' | 'achievement_unlocked' | 'streak_milestone';
  title: string;
  description: string;
  xp?: number;
  level?: number;
  achievementIcon?: string;
  achievementRarity?: string;
  autoHide?: boolean;
  duration?: number;
}

interface GamificationNotificationsProps {
  notifications: GamificationNotification[];
  onDismiss: (id: string) => void;
  className?: string;
}

const GamificationNotifications: React.FC<GamificationNotificationsProps> = ({
  notifications,
  onDismiss,
  className = ""
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState<GamificationNotification[]>([]);

  useEffect(() => {
    setVisibleNotifications(notifications);

    // Auto-hide notifications
    notifications.forEach(notification => {
      if (notification.autoHide !== false) {
        const duration = notification.duration || 5000;
        setTimeout(() => {
          onDismiss(notification.id);
        }, duration);
      }
    });
  }, [notifications, onDismiss]);

  const getNotificationIcon = (type: string, achievementIcon?: string) => {
    switch (type) {
      case 'xp_gained':
        return <Zap className="h-6 w-6 text-yellow-500" />;
      case 'level_up':
        return <TrendingUp className="h-6 w-6 text-blue-500" />;
      case 'achievement_unlocked':
        return achievementIcon ? (
          <span className="text-2xl">{achievementIcon}</span>
        ) : (
          <Trophy className="h-6 w-6 text-purple-500" />
        );
      case 'streak_milestone':
        return <Sparkles className="h-6 w-6 text-orange-500" />;
      default:
        return <Gift className="h-6 w-6 text-green-500" />;
    }
  };

  const getNotificationStyle = (type: string, rarity?: string) => {
    switch (type) {
      case 'xp_gained':
        return 'border-yellow-200 bg-yellow-50 shadow-yellow-100';
      case 'level_up':
        return 'border-blue-200 bg-blue-50 shadow-blue-100 animate-pulse';
      case 'achievement_unlocked':
        switch (rarity) {
          case 'legendary':
            return 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 shadow-yellow-200 animate-bounce';
          case 'epic':
            return 'border-purple-300 bg-purple-50 shadow-purple-200';
          case 'rare':
            return 'border-blue-300 bg-blue-50 shadow-blue-200';
          default:
            return 'border-gray-300 bg-gray-50 shadow-gray-200';
        }
      case 'streak_milestone':
        return 'border-orange-200 bg-orange-50 shadow-orange-100';
      default:
        return 'border-green-200 bg-green-50 shadow-green-100';
    }
  };

  const getRarityBadge = (rarity?: string) => {
    if (!rarity) return null;
    
    const colors = {
      common: 'bg-gray-500',
      rare: 'bg-blue-500',
      epic: 'bg-purple-500',
      legendary: 'bg-yellow-500'
    };

    return (
      <Badge className={`text-xs ${colors[rarity as keyof typeof colors] || colors.common}`}>
        {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
      </Badge>
    );
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 space-y-3 ${className}`}>
      {visibleNotifications.map((notification) => (
        <Card 
          key={notification.id}
          className={`min-w-80 max-w-sm border-2 shadow-lg transition-all duration-300 hover:shadow-xl ${
            getNotificationStyle(notification.type, notification.achievementRarity)
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {getNotificationIcon(notification.type, notification.achievementIcon)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-sm">{notification.title}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-transparent"
                    onClick={() => onDismiss(notification.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {notification.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {notification.xp && (
                      <Badge variant="outline" className="text-xs">
                        +{notification.xp} XP
                      </Badge>
                    )}
                    
                    {notification.level && (
                      <Badge variant="default" className="text-xs">
                        Nivel {notification.level}
                      </Badge>
                    )}
                    
                    {getRarityBadge(notification.achievementRarity)}
                  </div>
                  
                  {notification.type === 'achievement_unlocked' && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Trophy className="h-3 w-3 mr-1" />
                      Logro desbloqueado
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Hook para manejar las notificaciones de gamificación
export const useGamificationNotifications = () => {
  const [notifications, setNotifications] = useState<GamificationNotification[]>([]);

  const addNotification = (notification: Omit<GamificationNotification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Funciones helper para crear notificaciones específicas
  const notifyXpGained = (xp: number, action: string) => {
    addNotification({
      type: 'xp_gained',
      title: `¡+${xp} XP!`,
      description: `Has ganado experiencia por ${action}`,
      xp,
      autoHide: true,
      duration: 3000
    });
  };

  const notifyLevelUp = (newLevel: number, xp: number) => {
    addNotification({
      type: 'level_up',
      title: '¡Nivel aumentado! 🎉',
      description: `¡Felicidades! Has alcanzado el nivel ${newLevel}`,
      level: newLevel,
      xp,
      autoHide: false // Level up es importante, no auto-hide
    });
  };

  const notifyAchievementUnlocked = (
    title: string, 
    description: string, 
    icon: string, 
    xp: number,
    rarity: string
  ) => {
    addNotification({
      type: 'achievement_unlocked',
      title: `¡Logro desbloqueado!`,
      description: `${title}: ${description}`,
      achievementIcon: icon,
      achievementRarity: rarity,
      xp,
      autoHide: false // Achievements son importantes
    });
  };

  const notifyStreakMilestone = (streak: number) => {
    addNotification({
      type: 'streak_milestone',
      title: `¡Racha de ${streak} días! 🔥`,
      description: `¡Increíble constancia! Continúa así.`,
      autoHide: true,
      duration: 4000
    });
  };

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAll,
    // Helper functions
    notifyXpGained,
    notifyLevelUp,
    notifyAchievementUnlocked,
    notifyStreakMilestone
  };
};

export default GamificationNotifications; 
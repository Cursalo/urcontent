import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, Trophy, Star, Zap, Crown } from 'lucide-react';
import { useUserProgress, Achievement } from '@/hooks/useUserProgress';

interface AchievementsGridProps {
  userId: string;
  className?: string;
}

const AchievementsGrid: React.FC<AchievementsGridProps> = ({ userId, className = "" }) => {
  const { achievements, loading } = useUserProgress(userId);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Star className="h-4 w-4" />;
      case 'rare': return <Zap className="h-4 w-4" />;
      case 'epic': return <Trophy className="h-4 w-4" />;
      case 'legendary': return <Crown className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const categories = [
    { key: 'all', label: 'Todos', icon: '🏆' },
    { key: 'course', label: 'Cursos', icon: '📚' },
    { key: 'streak', label: 'Rachas', icon: '🔥' },
    { key: 'quiz', label: 'Quizzes', icon: '🧠' },
    { key: 'special', label: 'Especiales', icon: '⭐' }
  ];

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Logros
            </CardTitle>
            <div className="text-right">
              <div className="text-2xl font-bold">{unlockedCount}/{totalCount}</div>
              <div className="text-sm text-muted-foreground">{completionPercentage}% completado</div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-5">
              {categories.map((category) => (
                <TabsTrigger key={category.key} value={category.key} className="text-xs">
                  <span className="mr-1">{category.icon}</span>
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-6">
              {filteredAchievements.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No hay logros en esta categoría</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAchievements.map((achievement) => (
                    <Card 
                      key={achievement._id} 
                      className={`relative transition-all duration-200 hover:shadow-md ${
                        achievement.unlocked 
                          ? getRarityColor(achievement.rarity)
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="relative">
                            <div className={`text-3xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                              {achievement.icon}
                            </div>
                            {!achievement.unlocked && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Lock className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-semibold text-sm ${
                                achievement.unlocked ? '' : 'text-gray-500'
                              }`}>
                                {achievement.title}
                              </h3>
                              {achievement.unlocked && (
                                <div className={`p-1 rounded ${getRarityBadgeColor(achievement.rarity)}`}>
                                  {getRarityIcon(achievement.rarity)}
                                </div>
                              )}
                            </div>
                            
                            <p className={`text-xs mb-2 ${
                              achievement.unlocked ? 'text-muted-foreground' : 'text-gray-400'
                            }`}>
                              {achievement.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <Badge 
                                variant={achievement.unlocked ? "default" : "secondary"}
                                className="text-xs"
                              >
                                +{achievement.xpReward} XP
                              </Badge>
                              
                              {achievement.unlocked && achievement.unlockedAt && (
                                <span className="text-xs text-muted-foreground">
                                  {new Date(achievement.unlockedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {achievement.unlocked && (
                          <div className="absolute top-2 right-2">
                            <div className="h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Estadísticas por rareza */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estadísticas por Rareza</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['common', 'rare', 'epic', 'legendary'].map((rarity) => {
              const rarityAchievements = achievements.filter(a => a.rarity === rarity);
              const unlockedRarity = rarityAchievements.filter(a => a.unlocked).length;
              const totalRarity = rarityAchievements.length;
              
              return (
                <div key={rarity} className="text-center p-3 rounded-lg bg-muted/50">
                  <div className={`inline-flex p-2 rounded-full mb-2 ${getRarityBadgeColor(rarity)}`}>
                    {getRarityIcon(rarity)}
                  </div>
                  <div className="text-lg font-bold">{unlockedRarity}/{totalRarity}</div>
                  <div className="text-sm text-muted-foreground capitalize">{rarity}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementsGrid; 
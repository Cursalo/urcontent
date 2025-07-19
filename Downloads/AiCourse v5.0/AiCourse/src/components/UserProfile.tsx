import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Trophy, 
  Flame, 
  Star, 
  BookOpen, 
  Target, 
  Award,
  TrendingUp,
  Calendar,
  User
} from 'lucide-react';
import { useUserProgress, UserProfile as UserProfileType } from '@/hooks/useUserProgress';

interface UserProfileProps {
  userId: string;
  showFullProfile?: boolean;
  className?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  userId, 
  showFullProfile = true,
  className = "" 
}) => {
  const { profile, courses, achievements, loading } = useUserProgress(userId);

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No se pudo cargar el perfil del usuario</p>
      </div>
    );
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const recentAchievements = unlockedAchievements.slice(0, 3);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header del perfil */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {profile.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt={profile.mName}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {profile.level}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{profile.mName}</h2>
                <p className="text-muted-foreground">Nivel {profile.level}</p>
                {profile.bio && (
                  <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>
                )}
              </div>
            </div>
            
            {/* Racha */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="text-2xl font-bold">{profile.streak}</span>
              </div>
              <p className="text-xs text-muted-foreground">días seguidos</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Barra de XP */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>XP: {profile.xp}</span>
              <span>Siguiente nivel: {profile.stats.xpNeeded} XP</span>
            </div>
            <Progress 
              value={(profile.stats.xpProgress / (profile.stats.xpProgress + profile.stats.xpNeeded)) * 100} 
              className="h-3"
            />
          </div>
        </CardContent>
      </Card>

      {showFullProfile && (
        <>
          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <BookOpen className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <div className="text-2xl font-bold">{profile.totalCoursesCompleted}</div>
                <p className="text-sm text-muted-foreground">Cursos completados</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <div className="text-2xl font-bold">{profile.totalLessonsCompleted}</div>
                <p className="text-sm text-muted-foreground">Lecciones completadas</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Award className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                <div className="text-2xl font-bold">{unlockedAchievements.length}</div>
                <p className="text-sm text-muted-foreground">Logros desbloqueados</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                <div className="text-2xl font-bold">{profile.stats.inProgressCourses}</div>
                <p className="text-sm text-muted-foreground">Cursos en progreso</p>
              </CardContent>
            </Card>
          </div>

          {/* Logros recientes */}
          {recentAchievements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Logros Recientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {recentAchievements.map((achievement) => (
                    <div key={achievement._id} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{achievement.title}</h4>
                          <div className={`h-2 w-2 rounded-full ${getRarityColor(achievement.rarity)}`} />
                        </div>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                      <Badge variant="secondary">+{achievement.xpReward} XP</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cursos en progreso */}
          {courses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Mis Cursos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses.slice(0, 3).map((courseData) => (
                    <div key={courseData.enrollment._id} className="flex items-center space-x-4 p-4 rounded-lg border">
                      {courseData.course.thumbnail && (
                        <img 
                          src={courseData.course.thumbnail} 
                          alt={courseData.course.title}
                          className="h-12 w-12 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium">{courseData.course.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={courseData.progress.progressPercentage} className="flex-1 h-2" />
                          <span className="text-sm text-muted-foreground">
                            {courseData.progress.progressPercentage}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {courseData.progress.completedLessons} de {courseData.progress.totalLessons} lecciones
                        </p>
                      </div>
                      {courseData.enrollment.completed && (
                        <Badge variant="default">Completado</Badge>
                      )}
                    </div>
                  ))}
                  
                  {courses.length > 3 && (
                    <Button variant="outline" className="w-full">
                      Ver todos los cursos ({courses.length})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default UserProfile; 
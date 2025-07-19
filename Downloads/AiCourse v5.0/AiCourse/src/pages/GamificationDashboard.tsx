import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Trophy, 
  Crown, 
  BookOpen, 
  TrendingUp,
  Zap,
  Target,
  Settings
} from 'lucide-react';

// Importar nuestros componentes de gamificación
import UserProfile from '@/components/UserProfile';
import AchievementsGrid from '@/components/AchievementsGrid';
import Leaderboard from '@/components/Leaderboard';
import CourseProgress from '@/components/CourseProgress';
import GamificationNotifications, { useGamificationNotifications } from '@/components/GamificationNotifications';
import { useUserProgress } from '@/hooks/useUserProgress';

interface GamificationDashboardProps {
  userId: string;
  className?: string;
}

const GamificationDashboard: React.FC<GamificationDashboardProps> = ({ 
  userId, 
  className = "" 
}) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  
  const { profile, courses, loading, actions } = useUserProgress(userId);
  const {
    notifications,
    dismissNotification,
    notifyXpGained,
    notifyLevelUp,
    notifyAchievementUnlocked,
    notifyStreakMilestone
  } = useGamificationNotifications();

  // Simular algunas notificaciones para demostración
  useEffect(() => {
    if (profile && !loading) {
      // Mostrar notificación de racha si es mayor a 1
      if (profile.streak > 1 && profile.streak % 7 === 0) {
        notifyStreakMilestone(profile.streak);
      }
    }
  }, [profile, loading, notifyStreakMilestone]);

  const handleLessonComplete = async (courseId: string, moduleId: number, lessonId: number) => {
    const result = await actions.completeLesson(courseId, moduleId, lessonId);
    if (result.success) {
      notifyXpGained(result.xpEarned || 25, 'completar una lección');
      
      if (result.leveledUp) {
        notifyLevelUp(result.newLevel, result.xpEarned);
      }
    }
  };

  const handleQuizComplete = async (
    courseId: string, 
    moduleId: number, 
    quizId: string, 
    answers: any[], 
    score: number, 
    passed: boolean
  ) => {
    const result = await actions.completeQuiz(courseId, moduleId, quizId, answers, score, passed);
    if (result.success) {
      notifyXpGained(result.xpEarned || 50, `completar un quiz ${passed ? '✅' : '❌'}`);
      
      if (result.leveledUp) {
        notifyLevelUp(result.newLevel, result.xpEarned);
      }
    }
  };

  const handleEnrollInCourse = async (courseId: string) => {
    const result = await actions.enrollInCourse(courseId);
    if (result.success) {
      notifyXpGained(10, 'inscribirte en un curso');
    }
    return result;
  };

  // Función demo para simular completar una lección
  const simulateCompleteLesson = () => {
    if (courses.length > 0) {
      const randomCourse = courses[Math.floor(Math.random() * courses.length)];
      handleLessonComplete(randomCourse.course._id, 1, 1);
    }
  };

  // Función demo para simular desbloquear un logro
  const simulateUnlockAchievement = () => {
    const achievements = [
      { title: 'Primer Paso', description: 'Completa tu primera lección', icon: '🎯', xp: 50, rarity: 'common' },
      { title: 'Dedicado', description: 'Mantén una racha de 7 días', icon: '🔥', xp: 100, rarity: 'rare' },
      { title: 'Maestro', description: 'Completa 5 cursos', icon: '👑', xp: 500, rarity: 'epic' }
    ];
    
    const randomAchievement = achievements[Math.floor(Math.random() * achievements.length)];
    notifyAchievementUnlocked(
      randomAchievement.title,
      randomAchievement.description,
      randomAchievement.icon,
      randomAchievement.xp,
      randomAchievement.rarity
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando tu progreso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* Notificaciones de gamificación */}
      <GamificationNotifications 
        notifications={notifications}
        onDismiss={dismissNotification}
      />

      <div className="container mx-auto p-6 space-y-6">
        {/* Header del dashboard */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard de Aprendizaje</h1>
            <p className="text-muted-foreground">
              Sigue tu progreso, desbloquea logros y compite con otros estudiantes
            </p>
          </div>
          
          {/* Botones de demo */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={simulateCompleteLesson}
              className="text-xs"
            >
              Demo: Completar Lección
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={simulateUnlockAchievement}
              className="text-xs"
            >
              Demo: Desbloquear Logro
            </Button>
          </div>
        </div>

        {/* Resumen rápido */}
        {profile && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="relative">
                    <Zap className="h-8 w-8 text-yellow-500" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {profile.level}
                    </Badge>
                  </div>
                </div>
                <div className="text-2xl font-bold">{profile.xp.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Puntos de Experiencia</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <BookOpen className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <div className="text-2xl font-bold">{profile.totalCoursesCompleted}</div>
                <p className="text-sm text-muted-foreground">Cursos Completados</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                <div className="text-2xl font-bold">{profile.achievements.length}</div>
                <p className="text-sm text-muted-foreground">Logros Desbloqueados</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                <div className="text-2xl font-bold">{profile.streak}</div>
                <p className="text-sm text-muted-foreground">Días de Racha</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pestañas principales */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Logros
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Clasificación
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Mis Cursos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <UserProfile userId={userId} />
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <AchievementsGrid userId={userId} />
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Leaderboard currentUserId={userId} />
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            {selectedCourseId ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Progreso del Curso</h2>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedCourseId(null)}
                  >
                    ← Volver a Mis Cursos
                  </Button>
                </div>
                <CourseProgress 
                  userId={userId}
                  courseId={selectedCourseId}
                  onLessonClick={(moduleId, lessonId) => {
                    handleLessonComplete(selectedCourseId, moduleId, lessonId);
                  }}
                  onQuizClick={(moduleId, quizId) => {
                    // Simular completar quiz con puntuación aleatoria
                    const score = Math.floor(Math.random() * 40) + 60; // 60-100%
                    const passed = score >= 70;
                    handleQuizComplete(selectedCourseId, moduleId, quizId, [], score, passed);
                  }}
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Mis Cursos</h2>
                  <Badge variant="outline">
                    {courses.length} curso{courses.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                
                <div className="grid gap-4">
                  {courses.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No tienes cursos inscritos</h3>
                        <p className="text-muted-foreground mb-4">
                          Explora nuestro catálogo y comienza tu viaje de aprendizaje
                        </p>
                        <Button>Explorar Cursos</Button>
                      </CardContent>
                    </Card>
                  ) : (
                    courses.map((courseData) => (
                      <Card key={courseData.enrollment._id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            {courseData.course.thumbnail && (
                              <img 
                                src={courseData.course.thumbnail} 
                                alt={courseData.course.title}
                                className="h-16 w-16 rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold">{courseData.course.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {courseData.course.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1">
                                  <Target className="h-4 w-4" />
                                  {courseData.progress.progressPercentage}% completado
                                </span>
                                <span className="flex items-center gap-1">
                                  <BookOpen className="h-4 w-4" />
                                  {courseData.progress.completedLessons}/{courseData.progress.totalLessons} lecciones
                                </span>
                              </div>
                            </div>
                            <div className="text-right space-y-2">
                              {courseData.enrollment.completed ? (
                                <Badge variant="default" className="flex items-center gap-1">
                                  <Trophy className="h-3 w-3" />
                                  Completado
                                </Badge>
                              ) : (
                                <Button 
                                  onClick={() => setSelectedCourseId(courseData.course._id)}
                                >
                                  Continuar
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GamificationDashboard; 
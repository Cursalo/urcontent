import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CheckCircle, 
  Circle, 
  Play, 
  Lock, 
  BookOpen, 
  Clock, 
  Trophy,
  Target,
  Star,
  ChevronRight,
  Award
} from 'lucide-react';
import { useUserProgress } from '@/hooks/useUserProgress';

interface CourseProgressProps {
  userId: string;
  courseId: string;
  onLessonClick?: (moduleId: number, lessonId: number) => void;
  onQuizClick?: (moduleId: number, quizId: string) => void;
  className?: string;
}

const CourseProgress: React.FC<CourseProgressProps> = ({ 
  userId, 
  courseId, 
  onLessonClick,
  onQuizClick,
  className = "" 
}) => {
  const { courses, loading, actions } = useUserProgress(userId);
  const [courseProgress, setCourseProgress] = useState<any>(null);

  useEffect(() => {
    const fetchCourseProgress = async () => {
      const progress = await actions.getCourseProgress(courseId);
      setCourseProgress(progress);
    };
    
    if (courseId) {
      fetchCourseProgress();
    }
  }, [courseId, actions]);

  useEffect(() => {
    // También buscar en los cursos cargados
    const foundCourse = courses.find(c => c.course._id === courseId);
    if (foundCourse && !courseProgress) {
      setCourseProgress(foundCourse.enrollment);
    }
  }, [courses, courseId, courseProgress]);

  if (loading || !courseProgress) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <div className="space-y-2 ml-4">
                    {[...Array(2)].map((_, lessonIndex) => (
                      <Skeleton key={lessonIndex} className="h-4 w-full" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const course = courseProgress.courseId;
  const progress = courseProgress.progress;

  // Calcular estadísticas
  const totalLessons = course.modules.reduce((acc: number, module: any) => acc + module.lessons.length, 0);
  const completedLessons = progress.completedLessons.length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const totalQuizzes = course.modules.filter((m: any) => m.quiz).length + (course.finalQuiz ? 1 : 0);
  const completedQuizzes = progress.completedQuizzes.length;

  const isLessonCompleted = (moduleId: number, lessonId: number) => {
    return progress.completedLessons.some(
      (lesson: any) => lesson.moduleId === moduleId && lesson.lessonId === lessonId
    );
  };

  const isQuizCompleted = (moduleId: number, quizId: string) => {
    return progress.completedQuizzes.some(
      (quiz: any) => quiz.moduleId === moduleId && quiz.quizId === quizId
    );
  };

  const isLessonUnlocked = (moduleId: number, lessonId: number) => {
    // La primera lección siempre está desbloqueada
    if (moduleId === 1 && lessonId === 1) return true;
    
    // Verificar si la lección anterior está completada
    const module = course.modules.find((m: any) => m.id === moduleId);
    const lessonIndex = module.lessons.findIndex((l: any) => l.id === lessonId);
    
    if (lessonIndex === 0) {
      // Primera lección del módulo, verificar si el módulo anterior está completo
      const prevModule = course.modules.find((m: any) => m.id === moduleId - 1);
      if (prevModule) {
        return prevModule.lessons.every((lesson: any) => 
          isLessonCompleted(prevModule.id, lesson.id)
        );
      }
      return true;
    } else {
      // Verificar lección anterior en el mismo módulo
      const prevLesson = module.lessons[lessonIndex - 1];
      return isLessonCompleted(moduleId, prevLesson.id);
    }
  };

  const getQuizScore = (moduleId: number, quizId: string) => {
    const quiz = progress.completedQuizzes.find(
      (q: any) => q.moduleId === moduleId && q.quizId === quizId
    );
    return quiz?.score || 0;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header del curso */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {course.title}
              </CardTitle>
              <p className="text-muted-foreground mt-1">{course.description}</p>
            </div>
            {courseProgress.completed && (
              <Badge variant="default" className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                Completado
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Progreso general */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progreso del curso</span>
                <span>{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
            
            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{completedLessons}</div>
                <p className="text-xs text-muted-foreground">de {totalLessons} lecciones</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{completedQuizzes}</div>
                <p className="text-xs text-muted-foreground">de {totalQuizzes} quizzes</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {courseProgress.completed ? '100' : progressPercentage}%
                </div>
                <p className="text-xs text-muted-foreground">completado</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Módulos y lecciones */}
      <div className="space-y-4">
        {course.modules.map((module: any, moduleIndex: number) => {
          const moduleCompleted = module.lessons.every((lesson: any) => 
            isLessonCompleted(module.id, lesson.id)
          );
          const moduleProgress = module.lessons.filter((lesson: any) => 
            isLessonCompleted(module.id, lesson.id)
          ).length;
          
          return (
            <Card key={module.id}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {moduleCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    Módulo {module.id}: {module.title}
                  </CardTitle>
                  <Badge variant={moduleCompleted ? "default" : "secondary"}>
                    {moduleProgress}/{module.lessons.length}
                  </Badge>
                </div>
                {module.description && (
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                )}
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {/* Lecciones */}
                  {module.lessons.map((lesson: any) => {
                    const completed = isLessonCompleted(module.id, lesson.id);
                    const unlocked = isLessonUnlocked(module.id, lesson.id);
                    const isCurrent = progress.currentModule === module.id && 
                                    progress.currentLesson === lesson.id;
                    
                    return (
                      <div 
                        key={lesson.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                          completed 
                            ? 'bg-green-50 border-green-200' 
                            : isCurrent
                            ? 'bg-blue-50 border-blue-200'
                            : unlocked
                            ? 'bg-background border-border hover:bg-muted/50'
                            : 'bg-muted/30 border-muted'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : unlocked ? (
                            <Play className="h-5 w-5 text-blue-500" />
                          ) : (
                            <Lock className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className={`font-medium ${
                            unlocked ? '' : 'text-muted-foreground'
                          }`}>
                            {lesson.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {lesson.duration && (
                              <>
                                <Clock className="h-3 w-3" />
                                <span>{lesson.duration}</span>
                              </>
                            )}
                            {lesson.type && (
                              <>
                                <span>•</span>
                                <span>{lesson.type}</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {isCurrent && !completed && (
                          <Badge variant="outline" className="text-xs">
                            Actual
                          </Badge>
                        )}
                        
                        {unlocked && onLessonClick && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onLessonClick(module.id, lesson.id)}
                            disabled={!unlocked}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Quiz del módulo */}
                  {module.quiz && (
                    <div className={`flex items-center space-x-3 p-3 rounded-lg border-2 border-dashed ${
                      isQuizCompleted(module.id, module.quiz.id)
                        ? 'border-purple-300 bg-purple-50'
                        : 'border-purple-200 bg-purple-25'
                    }`}>
                      <div className="flex-shrink-0">
                        {isQuizCompleted(module.id, module.quiz.id) ? (
                          <Award className="h-5 w-5 text-purple-500" />
                        ) : (
                          <Target className="h-5 w-5 text-purple-400" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium">Quiz: {module.quiz.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {module.quiz.description || 'Pon a prueba tus conocimientos'}
                        </p>
                        {isQuizCompleted(module.id, module.quiz.id) && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs">
                              Puntuación: {getQuizScore(module.id, module.quiz.id)}%
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {onQuizClick && (
                        <Button
                          variant={isQuizCompleted(module.id, module.quiz.id) ? "outline" : "default"}
                          size="sm"
                          onClick={() => onQuizClick(module.id, module.quiz.id)}
                        >
                          {isQuizCompleted(module.id, module.quiz.id) ? 'Revisar' : 'Comenzar'}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {/* Quiz final */}
        {course.finalQuiz && (
          <Card className="border-2 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <Trophy className="h-5 w-5" />
                Examen Final
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{course.finalQuiz.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {course.finalQuiz.description || 'Demuestra todo lo que has aprendido'}
                  </p>
                  {courseProgress.finalQuizPassed && (
                    <div className="flex items-center gap-1 mt-2">
                      <Trophy className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        ¡Aprobado con {courseProgress.finalQuizScore}%!
                      </span>
                    </div>
                  )}
                </div>
                
                <Button
                  variant={courseProgress.finalQuizPassed ? "outline" : "default"}
                  disabled={progressPercentage < 100}
                >
                  {courseProgress.finalQuizPassed ? 'Revisar' : 'Comenzar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CourseProgress; 
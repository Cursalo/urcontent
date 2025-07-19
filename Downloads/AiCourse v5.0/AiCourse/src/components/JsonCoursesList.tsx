import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, User, BookOpen, Star, Play } from 'lucide-react';
import { useJsonCourses, JsonCourse } from '@/hooks/useJsonCourses';

interface JsonCoursesListProps {
  onCourseSelect?: (course: JsonCourse) => void;
  showOnlyFeatured?: boolean;
  className?: string;
}

const JsonCoursesList: React.FC<JsonCoursesListProps> = ({ 
  onCourseSelect, 
  showOnlyFeatured = false,
  className = ""
}) => {
  const { courses, loading, error } = useJsonCourses();

  const filteredCourses = showOnlyFeatured 
    ? courses.filter(course => course.tags?.includes('featured'))
    : courses;

  if (loading) {
    return (
      <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-9 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (filteredCourses.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No hay cursos disponibles</h3>
        <p className="text-muted-foreground">
          Los cursos aparecerán aquí una vez que estén publicados.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {filteredCourses.map((course) => (
        <Card key={course._id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-4">
            {course.thumbnail && (
              <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden">
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {course.description}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {course.category && (
                <Badge variant="secondary">{course.category}</Badge>
              )}
              {course.level && (
                <Badge variant="outline">{course.level}</Badge>
              )}
            </div>

            {/* Course details */}
            <div className="space-y-2 text-sm">
              {course.instructor && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{course.instructor}</span>
                </div>
              )}
              
              {course.duration && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span>
                  {course.modules.length} módulos, {' '}
                  {course.modules.reduce((acc, module) => acc + module.lessons.length, 0)} lecciones
                </span>
              </div>
            </div>

            {/* Course objectives preview */}
            {course.objectives && course.objectives.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Objetivos:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {course.objectives.slice(0, 2).map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Star className="h-3 w-3 mt-1 flex-shrink-0" />
                      <span className="line-clamp-1">{objective}</span>
                    </li>
                  ))}
                  {course.objectives.length > 2 && (
                    <li className="text-xs text-muted-foreground">
                      +{course.objectives.length - 2} objetivos más
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Action button */}
            <Button 
              className="w-full" 
              onClick={() => onCourseSelect?.(course)}
            >
              <Play className="h-4 w-4 mr-2" />
              Iniciar Curso
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default JsonCoursesList; 
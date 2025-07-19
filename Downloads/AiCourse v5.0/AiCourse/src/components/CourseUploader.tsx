import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, CheckCircle, AlertCircle, Download, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { serverURL } from '@/constants';
import axios from 'axios';

interface CourseData {
  title: string;
  description: string;
  category?: string;
  level?: string;
  duration?: string;
  language?: string;
  instructor?: string;
  thumbnail?: string;
  modules: Array<{
    id: number;
    title: string;
    description?: string;
    lessons: Array<{
      id: number;
      title: string;
      content: string;
      type?: string;
      duration?: string;
      resources?: Array<any>;
      codeExamples?: Array<any>;
    }>;
    quiz?: {
      title: string;
      description?: string;
      questions: Array<any>;
    };
  }>;
  finalQuiz?: {
    title: string;
    description?: string;
    passingScore?: number;
    questions: Array<any>;
  };
  requirements?: Array<string>;
  objectives?: Array<string>;
  tags?: Array<string>;
}

interface CourseUploaderProps {
  onUploadSuccess?: () => void;
  onClose?: () => void;
}

const CourseUploader: React.FC<CourseUploaderProps> = ({ onUploadSuccess, onClose }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validar estructura del JSON
  const validateCourseData = (data: any): string[] => {
    const errors: string[] = [];

    // Validaciones básicas
    if (!data.title || typeof data.title !== 'string') {
      errors.push('El título es requerido y debe ser una cadena de texto');
    }
    if (!data.description || typeof data.description !== 'string') {
      errors.push('La descripción es requerida y debe ser una cadena de texto');
    }
    if (!data.modules || !Array.isArray(data.modules) || data.modules.length === 0) {
      errors.push('Se requiere al menos un módulo');
    }

    // Validar módulos
    if (data.modules && Array.isArray(data.modules)) {
      data.modules.forEach((module: any, moduleIndex: number) => {
        if (!module.title || typeof module.title !== 'string') {
          errors.push(`Módulo ${moduleIndex + 1}: El título es requerido`);
        }
        if (!module.lessons || !Array.isArray(module.lessons) || module.lessons.length === 0) {
          errors.push(`Módulo ${moduleIndex + 1}: Se requiere al menos una lección`);
        }

        // Validar lecciones
        if (module.lessons && Array.isArray(module.lessons)) {
          module.lessons.forEach((lesson: any, lessonIndex: number) => {
            if (!lesson.title || typeof lesson.title !== 'string') {
              errors.push(`Módulo ${moduleIndex + 1}, Lección ${lessonIndex + 1}: El título es requerido`);
            }
            if (!lesson.content || typeof lesson.content !== 'string') {
              errors.push(`Módulo ${moduleIndex + 1}, Lección ${lessonIndex + 1}: El contenido es requerido`);
            }
          });
        }

        // Validar quiz si existe
        if (module.quiz) {
          if (!module.quiz.title || typeof module.quiz.title !== 'string') {
            errors.push(`Módulo ${moduleIndex + 1}: El quiz debe tener un título`);
          }
          if (!module.quiz.questions || !Array.isArray(module.quiz.questions) || module.quiz.questions.length === 0) {
            errors.push(`Módulo ${moduleIndex + 1}: El quiz debe tener al menos una pregunta`);
          }
        }
      });
    }

    return errors;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.name.endsWith('.json')) {
      setValidationErrors(['El archivo debe ser de tipo JSON (.json)']);
      return;
    }

    // Leer archivo
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        const errors = validateCourseData(jsonData);
        
        if (errors.length > 0) {
          setValidationErrors(errors);
          setCourseData(null);
        } else {
          setValidationErrors([]);
          setCourseData(jsonData);
          setPreviewMode(true);
        }
      } catch (error) {
        setValidationErrors(['El archivo JSON no es válido. Verifique la sintaxis.']);
        setCourseData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!courseData) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simular progreso de carga
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Enviar datos al servidor
      const response = await axios.post(`${serverURL}/api/upload-course`, {
        courseData,
        user: sessionStorage.getItem('email') || 'admin'
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.data.success) {
        setSuccessMessage('¡Curso subido exitosamente!');
        setTimeout(() => {
          if (onUploadSuccess) onUploadSuccess();
          resetForm();
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Error al subir el curso');
      }
    } catch (error) {
      console.error('Error uploading course:', error);
      setValidationErrors([`Error al subir el curso: ${error instanceof Error ? error.message : 'Error desconocido'}`]);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setCourseData(null);
    setPreviewMode(false);
    setValidationErrors([]);
    setSuccessMessage('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadExample = () => {
    const link = document.createElement('a');
    link.href = '/course-example.json';
    link.download = 'course-example.json';
    link.click();
  };

  if (successMessage) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-700 mb-2">
              {successMessage}
            </h3>
            <p className="text-muted-foreground mb-4">
              El curso ha sido guardado en la base de datos y está disponible para los usuarios.
            </p>
            <Button onClick={resetForm}>Subir otro curso</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Subir Curso desde JSON
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Sube un archivo JSON con la estructura del curso completo
            </p>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!previewMode ? (
          <>
            {/* Descarga del ejemplo */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Formato de archivo</h3>
                <p className="text-muted-foreground mb-4">
                  Descarga el archivo de ejemplo para conocer la estructura JSON requerida
                </p>
                <Button variant="outline" onClick={downloadExample}>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar ejemplo JSON
                </Button>
              </div>
            </div>

            {/* Selección de archivo */}
            <div className="space-y-2">
              <Label htmlFor="course-file">Seleccionar archivo JSON del curso</Label>
              <Input
                id="course-file"
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
            </div>

            {/* Errores de validación */}
            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-semibold">Errores de validación:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <>
            {/* Vista previa del curso */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Vista previa del curso</h3>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => setPreviewMode(false)}>
                    Seleccionar otro archivo
                  </Button>
                  <Button onClick={handleUpload} disabled={isUploading}>
                    {isUploading ? 'Subiendo...' : 'Confirmar y subir'}
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-lg mb-2">{courseData?.title}</h4>
                    <p className="text-muted-foreground mb-3">{courseData?.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {courseData?.category && (
                        <Badge variant="secondary">{courseData.category}</Badge>
                      )}
                      {courseData?.level && (
                        <Badge variant="outline">{courseData.level}</Badge>
                      )}
                      {courseData?.duration && (
                        <Badge variant="outline">{courseData.duration}</Badge>
                      )}
                      {courseData?.language && (
                        <Badge variant="outline">{courseData.language}</Badge>
                      )}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <p><strong>Módulos:</strong> {courseData?.modules.length}</p>
                      <p><strong>Total de lecciones:</strong> {courseData?.modules.reduce((acc, module) => acc + module.lessons.length, 0)}</p>
                      {courseData?.instructor && <p><strong>Instructor:</strong> {courseData.instructor}</p>}
                    </div>
                  </CardContent>
                </Card>

                {/* Lista de módulos */}
                <div className="space-y-2">
                  <h5 className="font-semibold">Módulos del curso:</h5>
                  {courseData?.modules.map((module, index) => (
                    <Card key={module.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-3">
                        <h6 className="font-medium">{index + 1}. {module.title}</h6>
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          {module.lessons.length} lecciones
                          {module.quiz && ' + Quiz'}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Progreso de carga */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subiendo curso...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseUploader; 
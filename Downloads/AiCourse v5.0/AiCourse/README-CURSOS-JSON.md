# Funcionalidad de Cursos JSON

Esta funcionalidad permite a los administradores subir cursos completos en formato JSON al panel de administrador. Los cursos incluyen módulos, lecciones, quizzes y contenido estructurado.

## ✨ Características

- **Subida de archivos JSON**: Interface intuitiva para subir archivos JSON con validación en tiempo real
- **Validación completa**: Validación exhaustiva de la estructura JSON antes de procesar
- **Vista previa**: Previsualización del curso antes de confirmar la subida
- **Base de datos dual**: Almacenamiento en esquema dedicado para cursos JSON + compatibilidad con sistema existente
- **Interface mejorada**: Panel de administrador actualizado con nuevas columnas y filtros
- **API completa**: Endpoints para CRUD de cursos JSON

## 🏗️ Estructura del Proyecto

### Archivos Principales

```
src/
├── components/
│   ├── CourseUploader.tsx          # Componente principal de subida
│   └── JsonCoursesList.tsx         # Lista de cursos para usuarios
├── hooks/
│   └── useJsonCourses.ts           # Hook para manejar cursos JSON
├── pages/admin/
│   └── AdminCourses.tsx            # Panel admin actualizado
└── public/
    └── course-example.json         # Ejemplo de formato JSON

server/
└── server.js                      # Endpoints y schemas del backend
```

### Nuevos Endpoints

- `POST /api/upload-course` - Subir nuevo curso JSON
- `GET /api/getjsoncourses` - Obtener todos los cursos JSON activos
- `GET /api/getjsoncourse/:id` - Obtener un curso específico
- `POST /api/deletejsoncourse` - Eliminar curso JSON
- `POST /api/updatejsoncourse` - Actualizar estado del curso
- `GET /api/getcourses` - Actualizado para incluir cursos JSON

## 📋 Formato JSON Requerido

### Estructura Principal

```json
{
  "title": "Título del curso",
  "description": "Descripción detallada",
  "category": "Categoría (opcional)",
  "level": "Principiante|Intermedio|Avanzado",
  "duration": "4 semanas",
  "language": "es",
  "instructor": "Nombre del instructor",
  "thumbnail": "URL de imagen",
  "modules": [...],
  "finalQuiz": {...},
  "requirements": [...],
  "objectives": [...],
  "tags": [...]
}
```

### Estructura de Módulos

```json
{
  "modules": [
    {
      "id": 1,
      "title": "Título del módulo",
      "description": "Descripción del módulo",
      "lessons": [
        {
          "id": 1,
          "title": "Título de la lección",
          "content": "Contenido de la lección en texto/HTML",
          "type": "text|video|interactive",
          "duration": "15 minutos",
          "resources": [
            {
              "type": "video|document|link",
              "url": "URL del recurso",
              "title": "Título del recurso"
            }
          ],
          "codeExamples": [
            {
              "title": "Título del ejemplo",
              "code": "código aquí"
            }
          ]
        }
      ],
      "quiz": {
        "title": "Título del quiz",
        "description": "Descripción del quiz",
        "questions": [
          {
            "id": 1,
            "question": "Pregunta",
            "type": "multiple_choice|multiple_select|true_false",
            "options": ["Opción 1", "Opción 2", "Opción 3"],
            "correctAnswer": 1,
            "explanation": "Explicación de la respuesta"
          }
        ]
      }
    }
  ]
}
```

### Quiz Final

```json
{
  "finalQuiz": {
    "title": "Examen Final",
    "description": "Descripción del examen",
    "passingScore": 70,
    "questions": [
      {
        "id": 1,
        "question": "Pregunta del examen",
        "type": "multiple_choice",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": 1,
        "explanation": "Explicación"
      }
    ]
  }
}
```

## 🚀 Cómo Usar

### Para Administradores

1. **Acceder al Panel Admin**
   - Ir a `/admin/courses`
   - Hacer clic en "Subir Curso JSON"

2. **Descargar Ejemplo**
   - Usar el botón "Descargar ejemplo JSON" para obtener la estructura
   - Modificar el archivo con el contenido de tu curso

3. **Subir Curso**
   - Seleccionar archivo JSON
   - Revisar los errores de validación (si los hay)
   - Previsualizar el curso
   - Confirmar y subir

4. **Gestionar Cursos**
   - Ver todos los cursos en la tabla actualizada
   - Identificar cursos JSON por el badge "JSON Course"
   - Buscar por título, instructor, categoría

### Para Desarrolladores

#### Usar el Hook de Cursos JSON

```tsx
import { useJsonCourses } from '@/hooks/useJsonCourses';

function MiComponente() {
  const { courses, loading, error, refetch, getCourse } = useJsonCourses();
  
  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;
  
  return (
    <div>
      {courses.map(course => (
        <div key={course._id}>{course.title}</div>
      ))}
    </div>
  );
}
```

#### Mostrar Lista de Cursos

```tsx
import JsonCoursesList from '@/components/JsonCoursesList';

function PaginaCursos() {
  const handleCourseSelect = (course) => {
    // Manejar selección de curso
    console.log('Curso seleccionado:', course);
  };

  return (
    <JsonCoursesList 
      onCourseSelect={handleCourseSelect}
      showOnlyFeatured={false}
    />
  );
}
```

## 🔧 Validaciones

El sistema valida automáticamente:

- **Estructura JSON**: Sintaxis válida
- **Campos requeridos**: title, description, modules
- **Módulos**: Al menos un módulo con título y lecciones
- **Lecciones**: Título y contenido requeridos
- **Quizzes**: Si están presentes, deben tener título y preguntas
- **Preguntas**: Estructura correcta según el tipo

## 🗄️ Base de Datos

### Schema JsonCourse

```javascript
{
  user: String,
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: String,
  level: String,
  duration: String,
  language: { type: String, default: 'es' },
  instructor: String,
  thumbnail: String,
  modules: [ModuleSchema],
  finalQuiz: QuizSchema,
  requirements: [String],
  objectives: [String],
  tags: [String],
  type: { type: String, default: 'json_course' },
  mainTopic: String,
  date: { type: Date, default: Date.now },
  completed: { type: Boolean, default: true },
  active: { type: Boolean, default: true }
}
```

### Compatibilidad

Los cursos JSON también se almacenan en el schema `Course` original para mantener compatibilidad:

```javascript
{
  user: String,
  content: String, // JSON stringify del curso completo
  type: 'json_course',
  mainTopic: String, // título del curso
  photo: String, // thumbnail
  completed: true
}
```

## 🎨 Interfaz de Usuario

### Panel de Administrador

- **Tabla actualizada** con columnas: Title, Type, Category, Status, User, Date
- **Botón "Subir Curso JSON"** en la esquina superior derecha
- **Badges diferenciados** para tipos de curso
- **Modal full-screen** para el uploader
- **Búsqueda expandida** que incluye categoría e instructor

### Componente CourseUploader

- **Descarga de ejemplo** con un solo clic
- **Validación en tiempo real** con mensajes de error específicos
- **Vista previa detallada** antes de subir
- **Progreso de carga** con animación
- **Confirmación de éxito** con opción de subir otro

### Lista de Cursos (Frontend)

- **Cards responsivas** con diseño moderno
- **Información completa**: instructor, duración, módulos, objetivos
- **Thumbnails** con fallback elegante
- **Estados de carga** con skeletons
- **Filtros opcionales** (featured, categoría)

## 🔒 Seguridad

- **Validación server-side** de todos los datos
- **Sanitización** de contenido HTML
- **Límites de tamaño** para archivos JSON
- **Verificación de permisos** de administrador
- **Manejo de errores** completo

## 📊 Monitoreo

Los cursos JSON aparecen en:
- Panel de administrador (`/admin/courses`)
- Logs del servidor con identificación específica
- Base de datos con timestamps y metadatos
- Métricas de uso (a través del campo `user`)

## 🚨 Troubleshooting

### Errores Comunes

1. **"El archivo JSON no es válido"**
   - Verificar sintaxis JSON en un validador online
   - Asegurar que las comillas sean dobles
   - Verificar que no falten comas o corchetes

2. **"Se requiere al menos un módulo"**
   - Agregar al menos un objeto en el array `modules`
   - Verificar que el módulo tenga `title` y `lessons`

3. **"Error al subir el curso"**
   - Verificar conexión a la base de datos
   - Revisar logs del servidor
   - Confirmar permisos de administrador

### Debug

```javascript
// Habilitar logs detallados en server.js
console.log('Course data:', JSON.stringify(courseData, null, 2));

// Verificar en frontend
console.log('Validation errors:', validationErrors);
```

## 🔄 Actualizaciones Futuras

- [ ] Editor WYSIWYG para crear cursos sin JSON
- [ ] Importación desde otras plataformas
- [ ] Versionado de cursos
- [ ] Analíticas avanzadas
- [ ] Sistema de categorías dinámico
- [ ] Soporte para multimedia avanzado

---

¡La funcionalidad está lista para usar! 🎉 
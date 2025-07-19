# 🎮 Sistema de Gamificación - Plataforma de Cursos

## 📋 Resumen

Hemos implementado un **sistema completo de gamificación** que transforma tu plataforma de cursos en una experiencia interactiva y motivadora. Los estudiantes ahora pueden:

- 🎯 **Ganar XP** por completar lecciones y quizzes
- 📈 **Subir de nivel** basado en su experiencia acumulada  
- 🏆 **Desbloquear logros** por diferentes actividades
- 🔥 **Mantener rachas** de estudio diarias
- 👑 **Competir** en leaderboards
- 📊 **Seguir su progreso** detalladamente

---

## 🏗️ Arquitectura del Sistema

### Backend (server/server.js)

#### **Nuevos Schemas**
```javascript
// Usuario actualizado con campos de gamificación
userSchema: {
  xp: Number,                    // Puntos de experiencia
  level: Number,                 // Nivel actual  
  streak: Number,                // Días consecutivos
  totalCoursesCompleted: Number, // Cursos completados
  totalLessonsCompleted: Number, // Lecciones completadas
  achievements: [ObjectId],      // Logros desbloqueados
  avatar: String,                // Avatar del usuario
  bio: String                    // Biografía
}

// Inscripciones de estudiantes en cursos
enrollmentSchema: {
  userId: ObjectId,              // ID del estudiante
  courseId: ObjectId,            // ID del curso
  progress: {
    completedLessons: Array,     // Lecciones completadas
    completedQuizzes: Array,     // Quizzes completados
    currentModule: Number,       // Módulo actual
    currentLesson: Number        // Lección actual
  },
  completed: Boolean,            // Curso completado
  certificateId: String          // ID del certificado
}

// Sistema de logros
achievementSchema: {
  key: String,                   // Identificador único
  title: String,                 // Nombre del logro
  description: String,           // Descripción
  icon: String,                  // Emoji o icono
  xpReward: Number,              // XP que otorga
  category: String,              // Categoría (course, streak, quiz, etc.)
  rarity: String                 // Rareza (common, rare, epic, legendary)
}

// Actividad diaria del usuario
userActivitySchema: {
  userId: ObjectId,              // ID del usuario
  date: Date,                    // Fecha de la actividad
  actions: Array,                // Acciones realizadas
  totalXpEarned: Number          // XP total ganado ese día
}
```

#### **Nuevos Endpoints**

**Sistema de Progreso:**
- `POST /api/enrollment/enroll` - Inscribir usuario en curso
- `GET /api/enrollment/progress/:userId/:courseId` - Obtener progreso
- `POST /api/enrollment/complete-lesson` - Completar lección
- `POST /api/enrollment/complete-quiz` - Completar quiz
- `POST /api/enrollment/complete-course` - Completar curso

**Sistema de Gamificación:**
- `GET /api/user/profile/:userId` - Perfil completo con estadísticas
- `POST /api/user/update-streak` - Actualizar racha de días
- `GET /api/leaderboard` - Clasificaciones (XP, cursos, rachas)
- `GET /api/user/activity/:userId` - Actividad reciente

**Sistema de Logros:**
- `POST /api/achievements/initialize` - Inicializar logros por defecto
- `GET /api/achievements` - Obtener todos los logros
- `GET /api/user/achievements/:userId` - Logros del usuario

**Otros:**
- `GET /api/user/courses/:userId` - Cursos del usuario
- `GET /api/certificate/:certificateId` - Generar certificado

---

### Frontend (React + TypeScript)

#### **Hook Principal: useUserProgress**
```typescript
// src/hooks/useUserProgress.ts
const useUserProgress = (userId: string) => {
  // Estados
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  
  // Acciones
  const actions = {
    enrollInCourse,
    completeLesson,
    completeQuiz,
    completeCourse,
    updateStreak,
    getCourseProgress
  };
  
  return { profile, courses, achievements, loading, error, actions };
};
```

#### **Componentes Principales**

**1. UserProfile** - `src/components/UserProfile.tsx`
- Muestra avatar, nivel, XP, racha
- Estadísticas de cursos y lecciones
- Logros recientes
- Barra de progreso hacia siguiente nivel

**2. AchievementsGrid** - `src/components/AchievementsGrid.tsx`
- Grid de todos los logros disponibles
- Filtros por categoría (cursos, rachas, quizzes, especiales)
- Indicadores de rareza y estado (desbloqueado/bloqueado)
- Estadísticas por rareza

**3. Leaderboard** - `src/components/Leaderboard.tsx`
- Clasificaciones por XP, cursos completados, rachas
- Podio para top 3 usuarios
- Posición del usuario actual
- Avatares y estadísticas

**4. CourseProgress** - `src/components/CourseProgress.tsx`
- Progreso detallado de un curso específico
- Módulos, lecciones y quizzes
- Sistema de desbloqueo progresivo
- Indicadores visuales de completado

**5. GamificationNotifications** - `src/components/GamificationNotifications.tsx`
- Notificaciones en tiempo real
- XP ganado, niveles subidos, logros desbloqueados
- Diferentes estilos según tipo y rareza
- Auto-dismiss configurable

**6. GamificationDashboard** - `src/pages/GamificationDashboard.tsx`
- Dashboard principal que integra todos los componentes
- Pestañas para perfil, logros, clasificación, cursos
- Botones de demo para testing
- Resumen rápido de estadísticas

---

## 🎯 Sistema de Puntuación

### **Experiencia (XP)**
- **Inscripción en curso**: 10 XP
- **Completar lección**: 25 XP
- **Completar quiz**: 50 XP (25 si no aprueba)
- **Bonus excelencia**: +25 XP (quiz con 90%+)
- **Completar curso**: 200 XP
- **Bonus curso aprobado**: +100 XP
- **Bonus puntuación alta**: +50 XP (90%+ en examen final)

### **Niveles**
- Fórmula: `nivel = √(xp / 100) + 1`
- **Nivel 1**: 0-99 XP
- **Nivel 2**: 100-299 XP  
- **Nivel 3**: 300-599 XP
- **Nivel 4**: 600-999 XP
- Y así sucesivamente...

### **Rachas**
- Se incrementa por días consecutivos de actividad
- Se resetea si pasa más de 1 día sin actividad
- Logros especiales por rachas de 7, 30+ días

---

## 🏆 Sistema de Logros

### **Logros por Defecto**

#### **Comunes (Common)**
- 🎯 **Primer Paso** - Inscríbete en tu primer curso (50 XP)
- 📚 **Aprendiz** - Completa tu primera lección (25 XP)

#### **Raros (Rare)**  
- 🎓 **Graduado** - Completa tu primer curso (200 XP)
- 🔥 **Constante** - Mantén una racha de 7 días (100 XP)
- 🦉 **Búho Nocturno** - Completa una lección después de las 10 PM (75 XP)
- 🐦 **Madrugador** - Completa una lección antes de las 8 AM (75 XP)
- 🔍 **Buscador de Conocimiento** - Completa 100 lecciones (300 XP)

#### **Épicos (Epic)**
- 💪 **Dedicado** - Mantén una racha de 30 días (500 XP)
- 🧠 **Maestro de Quizzes** - Obtén 100% en 5 quizzes (150 XP)
- 🏆 **Coleccionista** - Completa 5 cursos (1000 XP)

#### **Legendarios (Legendary)**
- 👑 **Leyenda** - Completa 10 cursos (2000 XP)

### **Categorías de Logros**
- **course**: Relacionados con cursos y lecciones
- **streak**: Relacionados con rachas de días
- **quiz**: Relacionados con quizzes y puntuaciones
- **special**: Logros especiales (horarios, eventos)
- **social**: Futuros logros sociales

---

## 🚀 Instalación y Configuración

### **1. Inicializar Logros**
```bash
# Opción 1: Desde el navegador
# Abrir consola del navegador y ejecutar:
initializeAchievements()

# Opción 2: Hacer POST request
curl -X POST http://localhost:3000/api/achievements/initialize
```

### **2. Integrar en tu App**
```tsx
// Ejemplo de uso en una página
import GamificationDashboard from '@/pages/GamificationDashboard';

function App() {
  const userId = "tu_user_id_aqui";
  
  return (
    <GamificationDashboard userId={userId} />
  );
}
```

### **3. Usar Hook en Componentes**
```tsx
import { useUserProgress } from '@/hooks/useUserProgress';

function MiComponente() {
  const { profile, actions } = useUserProgress(userId);
  
  const handleCompleteLesson = async () => {
    const result = await actions.completeLesson(courseId, moduleId, lessonId);
    if (result.success) {
      // Mostrar notificación de XP ganado
    }
  };
}
```

---

## 📊 Características Avanzadas

### **Notificaciones en Tiempo Real**
- Aparecen automáticamente cuando se gana XP
- Diferentes estilos según tipo (XP, nivel, logro)
- Animaciones especiales para logros legendarios
- Auto-dismiss configurable

### **Sistema de Progreso Inteligente**
- Desbloqueo progresivo de lecciones
- Seguimiento detallado por módulo
- Cálculo automático de porcentajes
- Predicción de tiempo para completar

### **Leaderboards Dinámicos**
- Múltiples tipos de clasificación
- Podio visual para top 3
- Posición del usuario actual
- Actualización en tiempo real

### **Certificados Automáticos**
- Generación automática al completar curso
- ID único por certificado
- Datos del estudiante y curso
- Fecha y puntuación final

---

## 🎨 Personalización

### **Añadir Nuevos Logros**
```javascript
// En el endpoint /api/achievements/initialize
const nuevoLogro = {
  key: 'speed_learner',
  title: 'Aprendiz Veloz',
  description: 'Completa 3 lecciones en una hora',
  icon: '⚡',
  xpReward: 100,
  category: 'special',
  criteria: { type: 'custom', value: 3 },
  rarity: 'rare'
};
```

### **Modificar Sistema de XP**
```javascript
// En la función addXpToUser del servidor
const xpMultiplier = 1.5; // Aumentar XP 50%
user.xp += (xpAmount * xpMultiplier);
```

### **Personalizar Niveles**
```javascript
// Cambiar fórmula de cálculo de nivel
const calculateLevel = (xp) => {
  return Math.floor(xp / 500) + 1; // Cada 500 XP = 1 nivel
};
```

---

## 🔧 Testing y Demo

### **Funciones de Demo Incluidas**
- Botón "Demo: Completar Lección" - Simula completar una lección
- Botón "Demo: Desbloquear Logro" - Simula desbloquear un logro aleatorio
- Datos de ejemplo en `public/course-example.json`

### **Testing Manual**
1. Inscribirse en un curso
2. Completar lecciones y ver XP aumentar
3. Verificar que se desbloquean logros
4. Comprobar leaderboard
5. Probar notificaciones

---

## 📈 Próximas Mejoras

### **Funcionalidades Futuras**
- 🤝 **Sistema social**: Seguir amigos, grupos de estudio
- 🎁 **Recompensas**: Canjear XP por beneficios
- 📅 **Desafíos diarios**: Objetivos diarios/semanales
- 🏅 **Torneos**: Competencias temporales
- 📱 **Notificaciones push**: Recordatorios de estudio
- 🎯 **Metas personalizadas**: Objetivos definidos por el usuario

### **Optimizaciones Técnicas**
- Cache de leaderboards
- Compresión de datos de actividad
- Índices de base de datos optimizados
- API rate limiting

---

## 🎉 ¡Listo para Usar!

Tu plataforma de cursos ahora tiene un **sistema de gamificación completo y profesional**. Los estudiantes estarán más motivados, comprometidos y tendrán una experiencia de aprendizaje mucho más rica e interactiva.

### **Archivos Principales Creados:**
- ✅ Backend: Schemas, endpoints, lógica de gamificación
- ✅ Hook: `useUserProgress.ts` 
- ✅ Componentes: UserProfile, AchievementsGrid, Leaderboard, etc.
- ✅ Dashboard: Página completa integrada
- ✅ Notificaciones: Sistema en tiempo real
- ✅ Documentación: Guía completa de uso

**¡Disfruta de tu nueva plataforma gamificada! 🚀** 
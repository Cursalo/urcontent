import { useState, useEffect } from 'react';
import axios from 'axios';
import { serverURL } from '@/constants';

interface UserStats {
  completedCourses: number;
  inProgressCourses: number;
  xpForNextLevel: number;
  xpProgress: number;
  xpNeeded: number;
}

interface Achievement {
  _id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  category: string;
  rarity: string;
  unlocked: boolean;
  unlockedAt?: string;
}

interface UserProfile {
  _id: string;
  mName: string;
  email: string;
  xp: number;
  level: number;
  streak: number;
  totalCoursesCompleted: number;
  totalLessonsCompleted: number;
  achievements: Achievement[];
  avatar: string;
  bio: string;
  stats: UserStats;
}

interface CourseProgress {
  enrollment: any;
  course: any;
  progress: {
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
    currentModule: number;
    currentLesson: number;
  };
}

export const useUserProgress = (userId: string | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`${serverURL}/api/user/profile/${userId}`);
      if (response.data.success) {
        setProfile(response.data.user);
      }
    } catch (err) {
      setError('Error al cargar el perfil');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async (status: 'all' | 'completed' | 'in_progress' = 'all') => {
    if (!userId) return;
    
    try {
      const response = await axios.get(`${serverURL}/api/user/courses/${userId}?status=${status}`);
      if (response.data.success) {
        setCourses(response.data.courses);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const fetchAchievements = async () => {
    if (!userId) return;
    
    try {
      const response = await axios.get(`${serverURL}/api/user/achievements/${userId}`);
      if (response.data.success) {
        setAchievements(response.data.achievements);
      }
    } catch (err) {
      console.error('Error fetching achievements:', err);
    }
  };

  const enrollInCourse = async (courseId: string) => {
    if (!userId) return { success: false, message: 'Usuario no identificado' };
    
    try {
      const response = await axios.post(`${serverURL}/api/enrollment/enroll`, {
        userId,
        courseId
      });
      
      if (response.data.success) {
        await fetchCourses();
        await fetchProfile();
      }
      
      return response.data;
    } catch (err) {
      console.error('Error enrolling in course:', err);
      return { success: false, message: 'Error al inscribirse en el curso' };
    }
  };

  const completeLesson = async (courseId: string, moduleId: number, lessonId: number) => {
    if (!userId) return { success: false, message: 'Usuario no identificado' };
    
    try {
      const response = await axios.post(`${serverURL}/api/enrollment/complete-lesson`, {
        userId,
        courseId,
        moduleId,
        lessonId
      });
      
      if (response.data.success) {
        await fetchCourses();
        await fetchProfile();
        await fetchAchievements();
      }
      
      return response.data;
    } catch (err) {
      console.error('Error completing lesson:', err);
      return { success: false, message: 'Error al completar la lección' };
    }
  };

  const completeQuiz = async (
    courseId: string, 
    moduleId: number, 
    quizId: string, 
    answers: any[], 
    score: number, 
    passed: boolean
  ) => {
    if (!userId) return { success: false, message: 'Usuario no identificado' };
    
    try {
      const response = await axios.post(`${serverURL}/api/enrollment/complete-quiz`, {
        userId,
        courseId,
        moduleId,
        quizId,
        answers,
        score,
        passed
      });
      
      if (response.data.success) {
        await fetchCourses();
        await fetchProfile();
        await fetchAchievements();
      }
      
      return response.data;
    } catch (err) {
      console.error('Error completing quiz:', err);
      return { success: false, message: 'Error al completar el quiz' };
    }
  };

  const completeCourse = async (
    courseId: string, 
    finalQuizScore?: number, 
    finalQuizPassed?: boolean
  ) => {
    if (!userId) return { success: false, message: 'Usuario no identificado' };
    
    try {
      const response = await axios.post(`${serverURL}/api/enrollment/complete-course`, {
        userId,
        courseId,
        finalQuizScore,
        finalQuizPassed
      });
      
      if (response.data.success) {
        await fetchCourses();
        await fetchProfile();
        await fetchAchievements();
      }
      
      return response.data;
    } catch (err) {
      console.error('Error completing course:', err);
      return { success: false, message: 'Error al completar el curso' };
    }
  };

  const updateStreak = async () => {
    if (!userId) return;
    
    try {
      const response = await axios.post(`${serverURL}/api/user/update-streak`, {
        userId
      });
      
      if (response.data.success) {
        await fetchProfile();
        await fetchAchievements();
      }
      
      return response.data;
    } catch (err) {
      console.error('Error updating streak:', err);
    }
  };

  const getCourseProgress = async (courseId: string) => {
    if (!userId) return null;
    
    try {
      const response = await axios.get(`${serverURL}/api/enrollment/progress/${userId}/${courseId}`);
      return response.data.success ? response.data.enrollment : null;
    } catch (err) {
      console.error('Error getting course progress:', err);
      return null;
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchCourses();
      fetchAchievements();
      updateStreak(); // Actualizar racha al cargar
    }
  }, [userId]);

  return {
    profile,
    courses,
    achievements,
    loading,
    error,
    actions: {
      enrollInCourse,
      completeLesson,
      completeQuiz,
      completeCourse,
      updateStreak,
      getCourseProgress,
      refetch: () => {
        fetchProfile();
        fetchCourses();
        fetchAchievements();
      }
    }
  };
};

export type { UserProfile, CourseProgress, Achievement }; 
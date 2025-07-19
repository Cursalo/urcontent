import { useState, useEffect } from 'react';
import axios from 'axios';
import { serverURL } from '@/constants';

interface JsonCourse {
  _id: string;
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
  user: string;
  date: string;
  active: boolean;
}

export const useJsonCourses = () => {
  const [courses, setCourses] = useState<JsonCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${serverURL}/api/getjsoncourses`);
      setCourses(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los cursos');
      console.error('Error fetching JSON courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCourse = async (id: string): Promise<JsonCourse | null> => {
    try {
      const response = await axios.get(`${serverURL}/api/getjsoncourse/${id}`);
      if (response.data.success) {
        return response.data.course;
      }
      return null;
    } catch (err) {
      console.error('Error fetching course:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    loading,
    error,
    refetch: fetchCourses,
    getCourse
  };
};

export type { JsonCourse }; 
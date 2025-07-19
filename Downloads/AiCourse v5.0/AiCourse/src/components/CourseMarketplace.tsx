import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
    Search, 
    Star, 
    Users, 
    Clock, 
    BookOpen, 
    TrendingUp,
    DollarSign
} from 'lucide-react';

interface Course {
    _id: string;
    title: string;
    description: string;
    category: string;
    level: string;
    duration: string;
    thumbnail: string;
    instructor: string;
    creatorId: {
        _id: string;
        mName: string;
        avatar?: string;
    };
    pricing: {
        isFree: boolean;
        price: number;
        currency: string;
    };
    stats: {
        enrollments: number;
        averageRating: number;
        totalReviews: number;
    };
    tags: string[];
    featured: boolean;
    date: string;
}

interface CourseMarketplaceProps {
    userId?: string;
    onCourseSelect?: (course: Course) => void;
}

const CourseMarketplace: React.FC<CourseMarketplaceProps> = ({ userId, onCourseSelect }) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showFeatured, setShowFeatured] = useState(false);

    const categories = [
        { value: 'all', label: 'Todas las categorías' },
        { value: 'IA para Profesionales', label: 'IA para Profesionales' },
        { value: 'Desarrollo Web', label: 'Desarrollo Web' },
        { value: 'Data Science', label: 'Data Science' },
        { value: 'Diseño UX/UI', label: 'Diseño UX/UI' },
        { value: 'Marketing Digital', label: 'Marketing Digital' },
        { value: 'Emprendimiento', label: 'Emprendimiento' }
    ];

    const levels = [
        { value: 'all', label: 'Todos los niveles' },
        { value: 'Principiante', label: 'Principiante' },
        { value: 'Intermedio', label: 'Intermedio' },
        { value: 'Avanzado', label: 'Avanzado' }
    ];

    const sortOptions = [
        { value: 'newest', label: 'Más recientes' },
        { value: 'rating', label: 'Mejor valorados' },
        { value: 'popular', label: 'Más populares' }
    ];

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '12',
                ...(selectedCategory !== 'all' && { category: selectedCategory }),
                ...(selectedLevel !== 'all' && { level: selectedLevel }),
                sortBy,
                ...(searchTerm && { search: searchTerm }),
                ...(showFeatured && { featured: 'true' })
            });

            const response = await fetch(`/api/courses/public?${params}`);
            const data = await response.json();

            if (data.success) {
                setCourses(data.courses);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [currentPage, selectedCategory, selectedLevel, sortBy, searchTerm, showFeatured]);

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${
                    i < Math.floor(rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : i < rating
                        ? 'fill-yellow-200 text-yellow-400'
                        : 'text-gray-300'
                }`}
            />
        ));
    };

    const CourseCard: React.FC<{ course: Course }> = ({ course }) => (
        <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
            <div className="relative">
                {course.thumbnail ? (
                    <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-white" />
                    </div>
                )}
                
                {course.featured && (
                    <Badge className="absolute top-2 left-2 bg-orange-500 hover:bg-orange-600">
                        ⭐ Destacado
                    </Badge>
                )}
                
                <div className="absolute top-2 right-2">
                    {course.pricing.isFree ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Gratis
                        </Badge>
                    ) : (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            <DollarSign className="w-3 h-3 mr-1" />
                            ${course.pricing.price}
                        </Badge>
                    )}
                </div>
            </div>

            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                        {course.category}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                        {course.level}
                    </Badge>
                </div>

                <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                    {course.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {course.description}
                </p>

                <div className="flex items-center gap-2 mb-3">
                    <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                            {course.creatorId?.mName?.charAt(0) || course.instructor?.charAt(0) || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {course.creatorId?.mName || course.instructor}
                    </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            {renderStars(course.stats.averageRating)}
                            <span className="ml-1">
                                {course.stats.averageRating.toFixed(1)}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{course.stats.enrollments}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}</span>
                    </div>
                </div>

                {course.tags && course.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                        {course.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                        {course.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                                +{course.tags.length - 3}
                            </Badge>
                        )}
                    </div>
                )}
            </CardContent>

            <div className="p-4 pt-0">
                <Button 
                    className="w-full" 
                    onClick={() => onCourseSelect?.(course)}
                >
                    {course.pricing.isFree ? 'Acceder Gratis' : `Comprar por $${course.pricing.price}`}
                </Button>
            </div>
        </Card>
    );

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Marketplace de Cursos</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Descubre cursos increíbles creados por nuestra comunidad
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-sm">
                <div className="flex gap-4 mb-4">
                    <Input
                        type="text"
                        placeholder="Buscar cursos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1"
                    />
                    <Button className="px-6">
                        <Search className="w-4 h-4 mr-2" />
                        Buscar
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                            <SelectValue placeholder="Categoría" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                    {category.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                        <SelectTrigger>
                            <SelectValue placeholder="Nivel" />
                        </SelectTrigger>
                        <SelectContent>
                            {levels.map((level) => (
                                <SelectItem key={level.value} value={level.value}>
                                    {level.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                            <SelectValue placeholder="Ordenar por" />
                        </SelectTrigger>
                        <SelectContent>
                            {sortOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        variant={showFeatured ? "default" : "outline"}
                        onClick={() => setShowFeatured(!showFeatured)}
                        className="w-full"
                    >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Destacados
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                            <CardContent className="p-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : courses.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {courses.map((course) => (
                            <CourseCard key={course._id} course={course} />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center mt-8">
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                >
                                    Anterior
                                </Button>
                                
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const page = i + 1;
                                    return (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? "default" : "outline"}
                                            onClick={() => setCurrentPage(page)}
                                        >
                                            {page}
                                        </Button>
                                    );
                                })}

                                <Button
                                    variant="outline"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        No se encontraron cursos
                    </h3>
                    <p className="text-gray-500">
                        Intenta ajustar los filtros o cambiar los términos de búsqueda
                    </p>
                </div>
            )}
        </div>
    );
};

export default CourseMarketplace; 
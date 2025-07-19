import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import IdeaChat from '../components/IdeaChat';
import CourseMarketplace from '../components/CourseMarketplace';
import CourseReviews from '../components/CourseReviews';
import CreatorProfile from '../components/CreatorProfile';
import { 
    Lightbulb, 
    Store, 
    Users, 
    Star, 
    TrendingUp,
    MessageCircle,
    BookOpen,
    Award,
    Sparkles
} from 'lucide-react';

interface User {
    _id: string;
    mName: string;
    email: string;
    type: string;
}

interface CommunityHubProps {
    user?: User;
}

const CommunityHub: React.FC<CommunityHubProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState('marketplace');
    const [showIdeaChat, setShowIdeaChat] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
    const [featuredCourses, setFeaturedCourses] = useState([]);
    const [topCreators, setTopCreators] = useState([]);
    const [recentIdeas, setRecentIdeas] = useState<string[]>([]);

    useEffect(() => {
        fetchFeaturedContent();
        initializeIdeas();
    }, []);

    const fetchFeaturedContent = async () => {
        try {
            const coursesResponse = await fetch('/api/courses/public?featured=true&limit=6');
            const coursesData = await coursesResponse.json();
            if (coursesData.success) {
                setFeaturedCourses(coursesData.courses);
            }

            setTopCreators([
                { _id: '1', mName: 'Ana García', level: 15, courses: 8, followers: 1200 },
                { _id: '2', mName: 'Carlos López', level: 12, courses: 5, followers: 850 },
                { _id: '3', mName: 'María Rodríguez', level: 18, courses: 12, followers: 2100 }
            ]);
        } catch (error) {
            console.error('Error fetching featured content:', error);
        }
    };

    const initializeIdeas = async () => {
        try {
            await fetch('/api/ideas/initialize', { method: 'POST' });
        } catch (error) {
            console.error('Error initializing ideas:', error);
        }
    };

    const handleIdeaGenerated = (idea: string) => {
        setRecentIdeas(prev => [idea, ...prev.slice(0, 4)]);
    };

    const handleCourseSelect = (course: any) => {
        setSelectedCourse(course);
    };

    const handleCreatorSelect = (creatorId: string) => {
        setSelectedCreator(creatorId);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">
                            Hub de Comunidad 🌟
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-blue-100">
                            Descubre, aprende y conecta con la comunidad más innovadora
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Dialog open={showIdeaChat} onOpenChange={setShowIdeaChat}>
                                <DialogTrigger asChild>
                                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                                        <Lightbulb className="w-5 h-5 mr-2" />
                                        Disparador de Ideas
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden">
                                    <DialogHeader>
                                        <DialogTitle>Disparador de Ideas</DialogTitle>
                                    </DialogHeader>
                                    <div className="h-[70vh]">
                                        {user && (
                                            <IdeaChat 
                                                userId={user._id} 
                                                onIdeaGenerated={handleIdeaGenerated}
                                            />
                                        )}
                                    </div>
                                </DialogContent>
                            </Dialog>
                            
                            <Button 
                                size="lg" 
                                variant="outline" 
                                className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
                                onClick={() => setActiveTab('marketplace')}
                            >
                                <Store className="w-5 h-5 mr-2" />
                                Explorar Marketplace
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                        <div className="text-center">
                            <div className="text-3xl font-bold">500+</div>
                            <div className="text-blue-100">Cursos Disponibles</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold">10K+</div>
                            <div className="text-blue-100">Estudiantes Activos</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold">200+</div>
                            <div className="text-blue-100">Creadores Expertos</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold">50K+</div>
                            <div className="text-blue-100">Ideas Generadas</div>
                        </div>
                    </div>
                </div>
            </div>

            {recentIdeas.length > 0 && (
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-yellow-500" />
                                Ideas Recientes Generadas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {recentIdeas.map((idea, index) => (
                                    <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <p className="text-sm">{idea}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-6 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="marketplace" className="flex items-center gap-2">
                            <Store className="w-4 h-4" />
                            Marketplace
                        </TabsTrigger>
                        <TabsTrigger value="creators" className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Creadores
                        </TabsTrigger>
                        <TabsTrigger value="featured" className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Destacados
                        </TabsTrigger>
                        <TabsTrigger value="community" className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            Comunidad
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="marketplace" className="mt-8">
                        <CourseMarketplace 
                            userId={user?._id}
                            onCourseSelect={handleCourseSelect}
                        />
                    </TabsContent>

                    <TabsContent value="creators" className="mt-8">
                        {selectedCreator ? (
                            <div>
                                <Button 
                                    variant="outline" 
                                    onClick={() => setSelectedCreator(null)}
                                    className="mb-6"
                                >
                                    ← Volver a Creadores
                                </Button>
                                <CreatorProfile 
                                    creatorId={selectedCreator}
                                    currentUserId={user?._id}
                                />
                            </div>
                        ) : (
                            <div>
                                <h2 className="text-2xl font-bold mb-6">Top Creadores de la Comunidad</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {topCreators.map((creator: any) => (
                                        <Card 
                                            key={creator._id} 
                                            className="hover:shadow-lg transition-shadow cursor-pointer"
                                            onClick={() => handleCreatorSelect(creator._id)}
                                        >
                                            <CardContent className="p-6">
                                                <div className="text-center">
                                                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold">
                                                        {creator.mName.charAt(0)}
                                                    </div>
                                                    <h3 className="font-semibold text-lg mb-2">{creator.mName}</h3>
                                                    <Badge variant="secondary" className="mb-3">
                                                        Nivel {creator.level}
                                                    </Badge>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <div className="font-bold text-blue-600">{creator.courses}</div>
                                                            <div className="text-gray-500">Cursos</div>
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-green-600">{creator.followers}</div>
                                                            <div className="text-gray-500">Seguidores</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="featured" className="mt-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Cursos Destacados</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {featuredCourses.map((course: any) => (
                                    <Card key={course._id} className="group hover:shadow-lg transition-all duration-300">
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
                                            <Badge className="absolute top-2 left-2 bg-orange-500">
                                                ⭐ Destacado
                                            </Badge>
                                        </div>
                                        <CardContent className="p-4">
                                            <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                                                {course.description}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-sm">{course.stats?.averageRating || 0}</span>
                                                </div>
                                                <Badge variant="outline">{course.category}</Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="community" className="mt-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Award className="w-5 h-5 text-yellow-500" />
                                        Logros de la Comunidad
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                            <div className="text-2xl">🏆</div>
                                            <div>
                                                <div className="font-semibold">Curso Más Popular</div>
                                                <div className="text-sm text-gray-600">IA para Abogados - 2,500 estudiantes</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <div className="text-2xl">💡</div>
                                            <div>
                                                <div className="font-semibold">Ideas Generadas Hoy</div>
                                                <div className="text-sm text-gray-600">847 nuevas ideas de cursos</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <div className="text-2xl">👥</div>
                                            <div>
                                                <div className="font-semibold">Nuevos Miembros</div>
                                                <div className="text-sm text-gray-600">156 usuarios se unieron esta semana</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-green-500" />
                                        Tendencias
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium">IA para Profesionales</span>
                                                <span className="text-sm text-green-600">+45%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-blue-600 h-2 rounded-full w-[85%]"></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium">Desarrollo Web</span>
                                                <span className="text-sm text-green-600">+32%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-green-600 h-2 rounded-full w-[70%]"></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium">Marketing Digital</span>
                                                <span className="text-sm text-green-600">+28%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-purple-600 h-2 rounded-full w-[60%]"></div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {selectedCourse && (
                <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{selectedCourse.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    {selectedCourse.description}
                                </p>
                                <div className="flex gap-2 mb-4">
                                    <Badge>{selectedCourse.category}</Badge>
                                    <Badge variant="outline">{selectedCourse.level}</Badge>
                                    <Badge variant="secondary">
                                        {selectedCourse.pricing?.isFree ? 'Gratis' : `$${selectedCourse.pricing?.price}`}
                                    </Badge>
                                </div>
                            </div>
                            
                            {user && (
                                <CourseReviews 
                                    courseId={selectedCourse._id}
                                    userId={user._id}
                                    canReview={true}
                                />
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default CommunityHub; 
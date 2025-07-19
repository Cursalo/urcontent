import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
    Users, 
    BookOpen, 
    Star, 
    UserPlus,
    UserMinus,
    DollarSign
} from 'lucide-react';

interface Creator {
    _id: string;
    mName: string;
    email: string;
    avatar?: string;
    bio?: string;
    totalCoursesCompleted: number;
    xp: number;
    level: number;
}

interface Course {
    _id: string;
    title: string;
    description: string;
    category: string;
    level: string;
    thumbnail: string;
    pricing: {
        isFree: boolean;
        price: number;
    };
    stats: {
        enrollments: number;
        averageRating: number;
        totalReviews: number;
    };
    date: string;
}

interface CreatorProfileProps {
    creatorId: string;
    currentUserId?: string;
}

const CreatorProfile: React.FC<CreatorProfileProps> = ({ creatorId, currentUserId }) => {
    const [creator, setCreator] = useState<Creator | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [followers, setFollowers] = useState<Creator[]>([]);
    const [following, setFollowing] = useState<Creator[]>([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('courses');

    useEffect(() => {
        fetchCreatorData();
        if (currentUserId) {
            checkFollowStatus();
        }
    }, [creatorId, currentUserId]);

    const fetchCreatorData = async () => {
        setLoading(true);
        try {
            const userResponse = await fetch(`/api/user/${creatorId}`);
            const userData = await userResponse.json();
            if (userData.success) {
                setCreator(userData.user);
            }

            const coursesResponse = await fetch(`/api/courses/creator/${creatorId}`);
            const coursesData = await coursesResponse.json();
            if (coursesData.success) {
                setCourses(coursesData.courses);
            }

            const followersResponse = await fetch(`/api/followers/${creatorId}`);
            const followersData = await followersResponse.json();
            if (followersData.success) {
                setFollowers(followersData.followers);
            }

            const followingResponse = await fetch(`/api/following/${creatorId}`);
            const followingData = await followingResponse.json();
            if (followingData.success) {
                setFollowing(followingData.following);
            }
        } catch (error) {
            console.error('Error fetching creator data:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkFollowStatus = async () => {
        if (!currentUserId || currentUserId === creatorId) return;

        try {
            const response = await fetch(`/api/follow/status/${currentUserId}/${creatorId}`);
            const data = await response.json();
            if (data.success) {
                setIsFollowing(data.isFollowing);
            }
        } catch (error) {
            console.error('Error checking follow status:', error);
        }
    };

    const handleFollow = async () => {
        if (!currentUserId || currentUserId === creatorId) return;

        try {
            const endpoint = isFollowing ? '/api/unfollow' : '/api/follow';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    followerId: currentUserId,
                    followingId: creatorId
                })
            });

            const data = await response.json();
            if (data.success) {
                setIsFollowing(!isFollowing);
                if (isFollowing) {
                    setFollowers(prev => prev.filter(f => f._id !== currentUserId));
                } else {
                    fetchCreatorData();
                }
            }
        } catch (error) {
            console.error('Error updating follow status:', error);
        }
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${
                    i < Math.floor(rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                }`}
            />
        ));
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="animate-pulse">
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!creator) {
        return (
            <div className="max-w-6xl mx-auto p-6 text-center">
                <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    Creador no encontrado
                </h2>
            </div>
        );
    }

    const totalRevenue = courses.reduce((sum, course) => 
        sum + (course.pricing.isFree ? 0 : course.pricing.price * course.stats.enrollments), 0
    );

    return (
        <div className="max-w-6xl mx-auto p-6">
            <Card className="mb-8">
                <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                        <Avatar className="w-24 h-24">
                            <AvatarFallback className="text-2xl">
                                {creator.mName.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                                <h1 className="text-3xl font-bold">{creator.mName}</h1>
                                <Badge variant="secondary" className="text-lg px-3 py-1">
                                    Nivel {creator.level}
                                </Badge>
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                {creator.bio || 'Educador apasionado compartiendo conocimiento con la comunidad'}
                            </p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {courses.length}
                                    </div>
                                    <div className="text-sm text-gray-500">Cursos</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {followers.length}
                                    </div>
                                    <div className="text-sm text-gray-500">Seguidores</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {creator.xp.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-500">XP Total</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-600">
                                        ${totalRevenue.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-500">Ingresos</div>
                                </div>
                            </div>
                            
                            {currentUserId && currentUserId !== creatorId && (
                                <Button
                                    onClick={handleFollow}
                                    variant={isFollowing ? "outline" : "default"}
                                    className="flex items-center gap-2"
                                >
                                    {isFollowing ? (
                                        <>
                                            <UserMinus className="w-4 h-4" />
                                            Dejar de seguir
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-4 h-4" />
                                            Seguir
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="courses">
                        Cursos ({courses.length})
                    </TabsTrigger>
                    <TabsTrigger value="followers">
                        Seguidores ({followers.length})
                    </TabsTrigger>
                    <TabsTrigger value="following">
                        Siguiendo ({following.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="courses" className="mt-6">
                    {courses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map((course) => (
                                <Card key={course._id} className="group hover:shadow-lg transition-all duration-300">
                                    <div className="relative">
                                        {course.thumbnail ? (
                                            <img
                                                src={course.thumbnail}
                                                alt={course.title}
                                                className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                <BookOpen className="w-8 h-8 text-white" />
                                            </div>
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
                                        <Badge variant="outline" className="text-xs mb-2">
                                            {course.category}
                                        </Badge>
                                        
                                        <h3 className="font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                                            {course.title}
                                        </h3>
                                        
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                                            {course.description}
                                        </p>
                                        
                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                {renderStars(course.stats.averageRating)}
                                                <span className="ml-1">{course.stats.averageRating.toFixed(1)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                <span>{course.stats.enrollments}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                                No hay cursos publicados
                            </h3>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="followers" className="mt-6">
                    {followers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {followers.map((follower) => (
                                <Card key={follower._id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-12 h-12">
                                                <AvatarFallback>
                                                    {follower.mName.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <h4 className="font-semibold">{follower.mName}</h4>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <span>Nivel {follower.level}</span>
                                                    <span>•</span>
                                                    <span>{follower.xp} XP</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                                No tiene seguidores aún
                            </h3>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="following" className="mt-6">
                    {following.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {following.map((user) => (
                                <Card key={user._id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-12 h-12">
                                                <AvatarFallback>
                                                    {user.mName.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <h4 className="font-semibold">{user.mName}</h4>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <span>Nivel {user.level}</span>
                                                    <span>•</span>
                                                    <span>{user.xp} XP</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                                No sigue a nadie aún
                            </h3>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default CreatorProfile; 
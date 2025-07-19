import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
    Star, 
    ThumbsUp, 
    MessageSquare, 
    Filter,
    CheckCircle,
    User,
    Calendar
} from 'lucide-react';

interface Review {
    _id: string;
    userId: {
        _id: string;
        mName: string;
        avatar?: string;
    };
    rating: number;
    review: string;
    helpful: number;
    verified: boolean;
    createdAt: string;
    updatedAt: string;
}

interface CourseReviewsProps {
    courseId: string;
    userId?: string;
    canReview?: boolean;
}

const CourseReviews: React.FC<CourseReviewsProps> = ({ courseId, userId, canReview = false }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState('createdAt');
    
    // Estado para nueva review
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [newRating, setNewRating] = useState(0);
    const [newReview, setNewReview] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10',
                sortBy
            });

            const response = await fetch(`/api/reviews/course/${courseId}?${params}`);
            const data = await response.json();

            if (data.success) {
                setReviews(data.reviews);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [courseId, currentPage, sortBy]);

    const submitReview = async () => {
        if (!userId || newRating === 0) return;

        setSubmittingReview(true);
        try {
            const response = await fetch('/api/reviews/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId,
                    userId,
                    rating: newRating,
                    review: newReview
                })
            });

            const data = await response.json();
            if (data.success) {
                setShowReviewForm(false);
                setNewRating(0);
                setNewReview('');
                fetchReviews(); // Recargar reviews
            } else {
                alert(data.message || 'Error al enviar la reseña');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Error al enviar la reseña');
        } finally {
            setSubmittingReview(false);
        }
    };

    const markHelpful = async (reviewId: string) => {
        if (!userId) return;

        try {
            const response = await fetch('/api/reviews/helpful', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewId, userId })
            });

            const data = await response.json();
            if (data.success) {
                // Actualizar el estado local
                setReviews(prev => prev.map(review => 
                    review._id === reviewId 
                        ? { ...review, helpful: data.helpful }
                        : review
                ));
            }
        } catch (error) {
            console.error('Error marking review as helpful:', error);
        }
    };

    const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`w-5 h-5 ${
                    interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''
                } ${
                    i < rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                }`}
                onClick={() => interactive && onRatingChange?.(i + 1)}
            />
        ));
    };

    const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
        <Card className="mb-4">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                        <AvatarFallback>
                            {review.userId.mName.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{review.userId.mName}</h4>
                            {review.verified && (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Verificado
                                </Badge>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                                {renderStars(review.rating)}
                            </div>
                            <span className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        
                        {review.review && (
                            <p className="text-gray-700 dark:text-gray-300 mb-3">
                                {review.review}
                            </p>
                        )}
                        
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markHelpful(review._id)}
                                className="text-gray-500 hover:text-blue-600"
                            >
                                <ThumbsUp className="w-4 h-4 mr-1" />
                                Útil ({review.helpful})
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header con estadísticas */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Reseñas del Curso</h2>
                    
                    {canReview && userId && (
                        <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
                            <DialogTrigger asChild>
                                <Button>
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Escribir Reseña
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Escribir una Reseña</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Calificación
                                        </label>
                                        <div className="flex gap-1">
                                            {renderStars(newRating, true, setNewRating)}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Comentario (opcional)
                                        </label>
                                        <Textarea
                                            value={newReview}
                                            onChange={(e) => setNewReview(e.target.value)}
                                            placeholder="Comparte tu experiencia con este curso..."
                                            rows={4}
                                        />
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={submitReview}
                                            disabled={newRating === 0 || submittingReview}
                                            className="flex-1"
                                        >
                                            {submittingReview ? 'Enviando...' : 'Enviar Reseña'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setShowReviewForm(false);
                                                setNewRating(0);
                                                setNewReview('');
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                            {averageRating.toFixed(1)}
                        </div>
                        <div className="flex justify-center mb-1">
                            {renderStars(averageRating)}
                        </div>
                        <div className="text-sm text-gray-500">
                            Calificación promedio
                        </div>
                    </div>
                    
                    <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                            {reviews.length}
                        </div>
                        <div className="text-sm text-gray-500">
                            Total de reseñas
                        </div>
                    </div>
                    
                    <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">
                            {reviews.filter(r => r.verified).length}
                        </div>
                        <div className="text-sm text-gray-500">
                            Reseñas verificadas
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium">Ordenar por:</span>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1 border rounded-md text-sm"
                >
                    <option value="createdAt">Más recientes</option>
                    <option value="rating">Calificación más alta</option>
                    <option value="helpful">Más útiles</option>
                </select>
            </div>

            {/* Lista de reseñas */}
            {loading ? (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-4">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
                                        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : reviews.length > 0 ? (
                <>
                    <div>
                        {reviews.map((review) => (
                            <ReviewCard key={review._id} review={review} />
                        ))}
                    </div>

                    {/* Paginación */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-6">
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
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        No hay reseñas aún
                    </h3>
                    <p className="text-gray-500">
                        Sé el primero en reseñar este curso
                    </p>
                </div>
            )}
        </div>
    );
};

export default CourseReviews; 
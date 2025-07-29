import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  DollarSign, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  MessageCircle, 
  Edit, 
  Download,
  Upload,
  Star,
  AlertTriangle,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { CollaborationTimeline } from './CollaborationTimeline';
import { CollaborationChat } from './CollaborationChat';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';

export interface CollaborationData {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'under_review' | 'completed' | 'cancelled' | 'disputed';
  creator: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    rating: number;
  };
  business: {
    id: string;
    name: string;
    logo: string;
  };
  budget: number;
  deliverables: {
    id: string;
    type: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
    dueDate: string;
    submittedAt?: string;
    approvedAt?: string;
    rejectedAt?: string;
    files?: {
      id: string;
      name: string;
      url: string;
      type: 'image' | 'video' | 'document';
      size: number;
    }[];
    feedback?: string;
  }[];
  timeline: {
    created: string;
    accepted?: string;
    started?: string;
    deadline: string;
    completed?: string;
  };
  paymentTerms: string;
  usageRights: string;
  exclusivity: boolean;
  revisionsIncluded: number;
  revisionsUsed: number;
  messages: {
    id: string;
    senderId: string;
    senderName: string;
    senderAvatar: string;
    message: string;
    timestamp: string;
    attachments?: {
      id: string;
      name: string;
      url: string;
      type: string;
    }[];
  }[];
  rating?: {
    business: { score: number; comment: string };
    creator: { score: number; comment: string };
  };
}

interface CollaborationDetailProps {
  collaboration: CollaborationData;
  userRole: 'business' | 'creator';
  onUpdateStatus: (status: CollaborationData['status']) => void;
  onSubmitDeliverable: (deliverableId: string, files: File[]) => void;
  onApproveDeliverable: (deliverableId: string, feedback?: string) => void;
  onRejectDeliverable: (deliverableId: string, feedback: string) => void;
  onSendMessage: (message: string, attachments?: File[]) => void;
  onRateCollaboration: (rating: number, comment: string) => void;
  className?: string;
}

const getStatusColor = (status: CollaborationData['status']) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'under_review': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    case 'disputed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: CollaborationData['status']) => {
  switch (status) {
    case 'pending': return <Clock className="h-4 w-4" />;
    case 'in_progress': return <User className="h-4 w-4" />;
    case 'under_review': return <Eye className="h-4 w-4" />;
    case 'completed': return <CheckCircle className="h-4 w-4" />;
    case 'cancelled': return <XCircle className="h-4 w-4" />;
    case 'disputed': return <AlertTriangle className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
};

const getDeliverableStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-gray-100 text-gray-800';
    case 'in_progress': return 'bg-blue-100 text-blue-800';
    case 'submitted': return 'bg-purple-100 text-purple-800';
    case 'approved': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const CollaborationDetail: React.FC<CollaborationDetailProps> = ({
  collaboration,
  userRole,
  onUpdateStatus,
  onSubmitDeliverable,
  onApproveDeliverable,
  onRejectDeliverable,
  onSendMessage,
  onRateCollaboration,
  className = ''
}) => {
  const [selectedDeliverable, setSelectedDeliverable] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const progress = React.useMemo(() => {
    const total = collaboration.deliverables.length;
    const completed = collaboration.deliverables.filter(d => d.status === 'approved').length;
    return total > 0 ? (completed / total) * 100 : 0;
  }, [collaboration.deliverables]);

  const canUpdateStatus = (newStatus: CollaborationData['status']) => {
    if (userRole === 'business') {
      return [
        'pending', 
        collaboration.status === 'under_review' && newStatus === 'completed',
        collaboration.status === 'in_progress' && newStatus === 'cancelled'
      ].some(Boolean);
    }
    if (userRole === 'creator') {
      return [
        collaboration.status === 'pending' && newStatus === 'in_progress',
        collaboration.status === 'in_progress' && newStatus === 'under_review'
      ].some(Boolean);
    }
    return false;
  };

  return (
    <div className={`max-w-6xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{collaboration.title}</CardTitle>
                <div className="flex items-center gap-4">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(collaboration.status)}`}>
                    {getStatusIcon(collaboration.status)}
                    <span className="ml-2 capitalize">
                      {collaboration.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatCurrency(collaboration.budget)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Entrega: {formatDate(collaboration.timeline.deadline)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {userRole === 'business' ? collaboration.creator.name : collaboration.business.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {userRole === 'business' ? '@' + collaboration.creator.username : 'Cliente'}
                  </div>
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={userRole === 'business' ? collaboration.creator.avatar : collaboration.business.logo} 
                    alt={userRole === 'business' ? collaboration.creator.name : collaboration.business.name}
                  />
                  <AvatarFallback>
                    {userRole === 'business' ? collaboration.creator.name.charAt(0) : collaboration.business.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso general</span>
                <span>{Math.round(progress)}% completado</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {collaboration.deliverables.filter(d => d.status === 'approved').length} de {collaboration.deliverables.length} entregables completados
                </span>
                <span>
                  {collaboration.revisionsUsed} de {collaboration.revisionsIncluded} revisiones usadas
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="deliverables" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="deliverables">Entregables</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="messages">Mensajes</TabsTrigger>
            <TabsTrigger value="details">Detalles</TabsTrigger>
          </TabsList>

          {/* Deliverables Tab */}
          <TabsContent value="deliverables" className="space-y-4">
            {collaboration.deliverables.map((deliverable, index) => (
              <motion.div
                key={deliverable.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{deliverable.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{deliverable.description}</p>
                      </div>
                      <Badge className={getDeliverableStatusColor(deliverable.status)}>
                        {deliverable.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Due Date */}
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Fecha límite: {formatDate(deliverable.dueDate)}</span>
                        {new Date(deliverable.dueDate) < new Date() && deliverable.status !== 'approved' && (
                          <Badge variant="destructive" className="text-xs">Atrasado</Badge>
                        )}
                      </div>

                      {/* Files */}
                      {deliverable.files && deliverable.files.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Archivos adjuntos:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {deliverable.files.map(file => (
                              <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                {file.type === 'image' ? (
                                  <OptimizedImage
                                    src={file.url}
                                    alt={file.name}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                    {file.type === 'video' ? '🎥' : '📝'}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{file.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {(file.size / 1024 / 1024).toFixed(1)} MB
                                  </p>
                                </div>
                                <Button size="sm" variant="outline">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Feedback */}
                      {deliverable.feedback && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Feedback:</strong> {deliverable.feedback}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        {userRole === 'creator' && deliverable.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => setSelectedDeliverable(deliverable.id)}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Subir archivo
                          </Button>
                        )}

                        {userRole === 'business' && deliverable.status === 'submitted' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => onApproveDeliverable(deliverable.id)}
                            >
                              <ThumbsUp className="h-4 w-4 mr-2" />
                              Aprobar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onRejectDeliverable(deliverable.id, 'Necesita revisiones')}
                            >
                              <ThumbsDown className="h-4 w-4 mr-2" />
                              Rechazar
                            </Button>
                          </>
                        )}

                        {deliverable.submittedAt && (
                          <div className="text-xs text-muted-foreground self-center">
                            Enviado {formatRelativeTime(deliverable.submittedAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <CollaborationTimeline collaboration={collaboration} />
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <CollaborationChat
              messages={collaboration.messages}
              currentUserId={userRole === 'business' ? collaboration.business.id : collaboration.creator.id}
              onSendMessage={onSendMessage}
            />
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Detalles del proyecto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Descripción</h4>
                  <p className="text-sm text-muted-foreground">{collaboration.description}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Términos de pago</h4>
                    <p className="text-sm text-muted-foreground">{collaboration.paymentTerms}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Derechos de uso</h4>
                    <p className="text-sm text-muted-foreground">{collaboration.usageRights}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Exclusividad</h4>
                    <p className="text-sm text-muted-foreground">
                      {collaboration.exclusivity ? 'Sí' : 'No'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Revisiones</h4>
                    <p className="text-sm text-muted-foreground">
                      {collaboration.revisionsUsed} de {collaboration.revisionsIncluded} usadas
                    </p>
                  </div>
                </div>

                {collaboration.rating && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-4">Calificaciones</h4>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">Cliente:</span>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < collaboration.rating!.business.score
                                      ? 'fill-current text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {collaboration.rating.business.comment}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">Creator:</span>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < collaboration.rating!.creator.score
                                      ? 'fill-current text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {collaboration.rating.creator.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Action Buttons */}
      {collaboration.status !== 'completed' && collaboration.status !== 'cancelled' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-4"
        >
          {userRole === 'creator' && collaboration.status === 'pending' && (
            <Button onClick={() => onUpdateStatus('in_progress')}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Aceptar proyecto
            </Button>
          )}

          {userRole === 'creator' && collaboration.status === 'in_progress' && progress === 100 && (
            <Button onClick={() => onUpdateStatus('under_review')}>
              <Eye className="h-4 w-4 mr-2" />
              Enviar para revisión
            </Button>
          )}

          {userRole === 'business' && collaboration.status === 'under_review' && (
            <Button onClick={() => onUpdateStatus('completed')}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Marcar como completado
            </Button>
          )}

          <Button variant="outline">
            <MessageCircle className="h-4 w-4 mr-2" />
            Enviar mensaje
          </Button>

          {(collaboration.status === 'pending' || collaboration.status === 'in_progress') && (
            <Button variant="destructive" onClick={() => onUpdateStatus('cancelled')}>
              <XCircle className="h-4 w-4 mr-2" />
              Cancelar proyecto
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default CollaborationDetail;
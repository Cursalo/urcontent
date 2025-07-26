import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Notification = Tables<'notifications'>;

export type NotificationFilters = {
  is_read?: boolean;
  type?: string;
  reference_type?: string;
  date_from?: string;
  date_to?: string;
};

class NotificationService {
  // Get notifications for a user
  async getUserNotifications(
    userId: string,
    filters: NotificationFilters = {},
    limit: number = 50,
    offset: number = 0
  ): Promise<Notification[]> {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId);

    // Apply filters
    if (filters.is_read !== undefined) {
      query = query.eq('is_read', filters.is_read);
    }

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.reference_type) {
      query = query.eq('reference_type', filters.reference_type);
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }

    return data || [];
  }

  // Get unread notification count
  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error getting unread notification count:', error);
      throw error;
    }

    return count || 0;
  }

  // Create a new notification
  async createNotification(
    notificationData: TablesInsert<'notifications'>
  ): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }

    return data;
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Delete all notifications for a user
  async deleteAllNotifications(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting all notifications:', error);
      throw error;
    }
  }

  // Helper methods to create specific types of notifications

  // New collaboration proposal notification
  async notifyNewCollaborationProposal(
    creatorUserId: string,
    businessName: string,
    collaborationId: string,
    collaborationTitle: string
  ): Promise<Notification> {
    return this.createNotification({
      user_id: creatorUserId,
      title: 'Nueva Propuesta de Colaboración',
      message: `${businessName} te ha enviado una propuesta para "${collaborationTitle}"`,
      type: 'collaboration_proposal',
      reference_id: collaborationId,
      reference_type: 'collaboration',
      action_url: `/campaigns/${collaborationId}`,
      is_read: false,
    });
  }

  // Collaboration accepted notification
  async notifyCollaborationAccepted(
    businessUserId: string,
    creatorName: string,
    collaborationId: string,
    collaborationTitle: string
  ): Promise<Notification> {
    return this.createNotification({
      user_id: businessUserId,
      title: 'Colaboración Aceptada',
      message: `${creatorName} ha aceptado tu propuesta para "${collaborationTitle}"`,
      type: 'collaboration_accepted',
      reference_id: collaborationId,
      reference_type: 'collaboration',
      action_url: `/campaigns/${collaborationId}`,
      is_read: false,
    });
  }

  // Collaboration completed notification
  async notifyCollaborationCompleted(
    userId: string,
    collaborationId: string,
    collaborationTitle: string
  ): Promise<Notification> {
    return this.createNotification({
      user_id: userId,
      title: 'Colaboración Completada',
      message: `La colaboración "${collaborationTitle}" ha sido completada`,
      type: 'collaboration_completed',
      reference_id: collaborationId,
      reference_type: 'collaboration',
      action_url: `/campaigns/${collaborationId}`,
      is_read: false,
    });
  }

  // New message notification
  async notifyNewMessage(
    recipientUserId: string,
    senderName: string,
    conversationId: string,
    messagePreview: string
  ): Promise<Notification> {
    return this.createNotification({
      user_id: recipientUserId,
      title: 'Nuevo Mensaje',
      message: `${senderName}: ${messagePreview.substring(0, 100)}${messagePreview.length > 100 ? '...' : ''}`,
      type: 'new_message',
      reference_id: conversationId,
      reference_type: 'conversation',
      action_url: `/messages/${conversationId}`,
      is_read: false,
    });
  }

  // Payment received notification
  async notifyPaymentReceived(
    userId: string,
    amount: number,
    collaborationId: string,
    collaborationTitle: string
  ): Promise<Notification> {
    return this.createNotification({
      user_id: userId,
      title: 'Pago Recibido',
      message: `Has recibido $${amount} por la colaboración "${collaborationTitle}"`,
      type: 'payment_received',
      reference_id: collaborationId,
      reference_type: 'collaboration',
      action_url: `/campaigns/${collaborationId}`,
      is_read: false,
    });
  }

  // URScore update notification
  async notifyURScoreUpdate(
    userId: string,
    points: number,
    newScore: number,
    reason: string
  ): Promise<Notification> {
    const message = points > 0 
      ? `¡Has ganado ${points} puntos! Tu URScore ahora es ${newScore}. ${reason}`
      : `Has perdido ${Math.abs(points)} puntos. Tu URScore ahora es ${newScore}. ${reason}`;

    return this.createNotification({
      user_id: userId,
      title: 'URScore Actualizado',
      message,
      type: 'urscore_update',
      reference_id: null,
      reference_type: 'urscore',
      action_url: '/dashboard',
      is_read: false,
    });
  }

  // Profile verification notification
  async notifyProfileVerification(
    userId: string,
    isVerified: boolean
  ): Promise<Notification> {
    const title = isVerified ? 'Perfil Verificado' : 'Verificación Rechazada';
    const message = isVerified 
      ? '¡Felicitaciones! Tu perfil ha sido verificado exitosamente'
      : 'Tu solicitud de verificación ha sido rechazada. Revisa los requisitos e intenta nuevamente';

    return this.createNotification({
      user_id: userId,
      title,
      message,
      type: 'profile_verification',
      reference_id: null,
      reference_type: 'profile',
      action_url: '/dashboard/profile',
      is_read: false,
    });
  }

  // Deadline reminder notification
  async notifyDeadlineReminder(
    userId: string,
    collaborationId: string,
    collaborationTitle: string,
    daysLeft: number
  ): Promise<Notification> {
    const message = daysLeft === 1 
      ? `La colaboración "${collaborationTitle}" vence mañana`
      : `La colaboración "${collaborationTitle}" vence en ${daysLeft} días`;

    return this.createNotification({
      user_id: userId,
      title: 'Recordatorio de Fecha Límite',
      message,
      type: 'deadline_reminder',
      reference_id: collaborationId,
      reference_type: 'collaboration',
      action_url: `/campaigns/${collaborationId}`,
      is_read: false,
    });
  }

  // Content submission notification
  async notifyContentSubmitted(
    businessUserId: string,
    creatorName: string,
    submissionId: string,
    contentType: 'collaboration' | 'experience'
  ): Promise<Notification> {
    const typeLabel = contentType === 'collaboration' ? 'colaboración' : 'experiencia';
    
    return this.createNotification({
      user_id: businessUserId,
      title: 'Nuevo Contenido Enviado',
      message: `${creatorName} ha enviado contenido para revisión de su ${typeLabel}`,
      type: 'content_submitted',
      reference_id: submissionId,
      reference_type: 'content_submission',
      action_url: '/content-review',
      is_read: false,
    });
  }

  // Content review result notification
  async notifyContentReviewed(
    creatorUserId: string,
    isApproved: boolean,
    submissionId: string,
    contentType: 'collaboration' | 'experience',
    rejectionReason?: string
  ): Promise<Notification> {
    const typeLabel = contentType === 'collaboration' ? 'colaboración' : 'experiencia';
    const title = isApproved ? 'Contenido Aprobado' : 'Contenido Rechazado';
    const message = isApproved
      ? `Tu contenido para la ${typeLabel} ha sido aprobado`
      : `Tu contenido para la ${typeLabel} ha sido rechazado${rejectionReason ? `: ${rejectionReason}` : ''}`;

    return this.createNotification({
      user_id: creatorUserId,
      title,
      message,
      type: isApproved ? 'content_approved' : 'content_rejected',
      reference_id: submissionId,
      reference_type: 'content_submission',
      action_url: '/dashboard',
      is_read: false,
    });
  }

  // Set up real-time subscription for user notifications
  subscribeToUserNotifications(
    userId: string,
    onNewNotification: (notification: Notification) => void,
    onNotificationUpdate: (notification: Notification) => void
  ) {
    const subscription = supabase
      .channel(`user_notifications_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          onNewNotification(payload.new as Notification);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          onNotificationUpdate(payload.new as Notification);
        }
      )
      .subscribe();

    return subscription;
  }

  // Get recent notifications (for notification bell dropdown)
  async getRecentNotifications(userId: string, limit: number = 10): Promise<Notification[]> {
    return this.getUserNotifications(userId, {}, limit);
  }

  // Get notification by ID
  async getNotification(notificationId: string): Promise<Notification | null> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .single();

    if (error) {
      console.error('Error fetching notification:', error);
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  }
}

export const notificationService = new NotificationService();
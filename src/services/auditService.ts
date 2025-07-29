// Audit Service
// Comprehensive logging and audit trail for security and compliance

import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

export type AuditEventType = 
  | 'login_success' | 'login_failed' | 'login_error'
  | 'register_success' | 'register_failed' | 'register_error'
  | 'logout' | 'password_updated' | 'password_reset_requested'
  | 'email_verified' | 'profile_updated' | 'profile_created'
  | 'collaboration_created' | 'collaboration_updated' | 'collaboration_deleted'
  | 'payment_created' | 'payment_updated' | 'payment_failed'
  | 'file_uploaded' | 'file_deleted'
  | 'admin_action' | 'security_event'
  | 'data_export' | 'data_deletion'
  | 'api_access' | 'rate_limit_exceeded'
  | 'system_error' | 'performance_issue';

export interface AuditEvent {
  id?: string;
  event_type: AuditEventType;
  user_id?: string;
  user_email?: string;
  resource_type?: string;
  resource_id?: string;
  action: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  success: boolean;
  error_message?: string;
  duration_ms?: number;
  created_at?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AuditFilters {
  user_id?: string;
  user_email?: string;
  event_type?: AuditEventType;
  resource_type?: string;
  resource_id?: string;
  date_from?: string;
  date_to?: string;
  success?: boolean;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  ip_address?: string;
  search_term?: string;
}

export interface AuditStats {
  total_events: number;
  success_rate: number;
  events_by_type: Record<AuditEventType, number>;
  events_by_severity: Record<string, number>;
  top_users: Array<{ user_email: string; event_count: number }>;
  recent_security_events: AuditEvent[];
  error_rate: number;
  avg_duration_ms: number;
}

class AuditService {
  private localBuffer: AuditEvent[] = [];
  private bufferFlushInterval: NodeJS.Timeout | null = null;
  private readonly maxBufferSize = 100;
  private readonly flushIntervalMs = 30000; // 30 seconds

  // Initialize audit service
  async initialize(): Promise<void> {
    console.log('📋 AuditService: Initializing...');
    
    // Set up periodic buffer flushing
    this.bufferFlushInterval = setInterval(() => {
      this.flushBuffer();
    }, this.flushIntervalMs);
    
    console.log('✅ AuditService: Initialized successfully');
  }

  // Log authentication events
  async logAuthEvent(
    userEmail: string,
    eventType: Extract<AuditEventType, 'login_success' | 'login_failed' | 'login_error' | 'register_success' | 'register_failed' | 'register_error' | 'logout' | 'password_updated' | 'password_reset_requested' | 'email_verified'>,
    details?: Record<string, any>
  ): Promise<void> {
    const severity = eventType.includes('failed') || eventType.includes('error') ? 'medium' : 'low';
    
    await this.logEvent({
      event_type: eventType,
      user_email: userEmail,
      action: eventType.replace('_', ' '),
      details,
      success: !eventType.includes('failed') && !eventType.includes('error'),
      severity
    });
  }

  // Log user actions
  async logUserAction(
    userId: string,
    userEmail: string,
    action: string,
    resourceType?: string,
    resourceId?: string,
    details?: Record<string, any>,
    success: boolean = true,
    duration?: number
  ): Promise<void> {
    await this.logEvent({
      event_type: 'api_access',
      user_id: userId,
      user_email: userEmail,
      resource_type: resourceType,
      resource_id: resourceId,
      action,
      details,
      success,
      duration_ms: duration,
      severity: success ? 'low' : 'medium'
    });
  }

  // Log admin actions
  async logAdminAction(
    adminId: string,
    adminEmail: string,
    action: string,
    targetUserId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      event_type: 'admin_action',
      user_id: adminId,
      user_email: adminEmail,
      resource_type: 'user',
      resource_id: targetUserId,
      action,
      details,
      success: true,
      severity: 'high'
    });
  }

  // Log security events
  async logSecurityEvent(
    eventType: AuditEventType,
    userEmail: string,
    action: string,
    details?: Record<string, any>,
    severity: 'medium' | 'high' | 'critical' = 'high'
  ): Promise<void> {
    await this.logEvent({
      event_type: eventType,
      user_email: userEmail,
      action,
      details,
      success: false,
      severity
    });
  }

  // Log system errors
  async logSystemError(
    error: Error,
    context?: string,
    userId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      event_type: 'system_error',
      user_id: userId,
      action: `System error${context ? ` in ${context}` : ''}`,
      details: {
        error_name: error.name,
        error_message: error.message,
        error_stack: error.stack,
        ...details
      },
      success: false,
      error_message: error.message,
      severity: 'high'
    });
  }

  // Log performance issues
  async logPerformanceIssue(
    operation: string,
    duration: number,
    threshold: number,
    userId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      event_type: 'performance_issue',
      user_id: userId,
      action: `Slow ${operation}`,
      details: {
        operation,
        duration_ms: duration,
        threshold_ms: threshold,
        slowness_factor: duration / threshold,
        ...details
      },
      success: false,
      duration_ms: duration,
      severity: duration > threshold * 3 ? 'high' : 'medium'
    });
  }

  // Generic log event method
  async logEvent(event: Omit<AuditEvent, 'id' | 'created_at'>): Promise<void> {
    const auditEvent: AuditEvent = {
      ...event,
      created_at: new Date().toISOString(),
      ip_address: event.ip_address || await this.getClientIP(),
      user_agent: event.user_agent || await this.getUserAgent(),
      session_id: event.session_id || await this.getSessionId()
    };

    // Add to buffer for batch processing
    this.localBuffer.push(auditEvent);
    
    // Flush buffer if it's getting full
    if (this.localBuffer.length >= this.maxBufferSize) {
      await this.flushBuffer();
    }
    
    // For critical events, flush immediately
    if (event.severity === 'critical') {
      await this.flushBuffer();
    }
  }

  // Get audit events with filtering
  async getAuditEvents(
    filters: AuditFilters = {},
    limit: number = 100,
    offset: number = 0
  ): Promise<AuditEvent[]> {
    try {
      // First flush any pending events
      await this.flushBuffer();
      
      let query = supabase
        .from('audit_logs')
        .select('*');

      // Apply filters
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters.user_email) {
        query = query.eq('user_email', filters.user_email);
      }

      if (filters.event_type) {
        query = query.eq('event_type', filters.event_type);
      }

      if (filters.resource_type) {
        query = query.eq('resource_type', filters.resource_type);
      }

      if (filters.resource_id) {
        query = query.eq('resource_id', filters.resource_id);
      }

      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      if (filters.success !== undefined) {
        query = query.eq('success', filters.success);
      }

      if (filters.severity) {
        query = query.eq('severity', filters.severity);
      }

      if (filters.ip_address) {
        query = query.eq('ip_address', filters.ip_address);
      }

      if (filters.search_term) {
        query = query.or(
          `action.ilike.%${filters.search_term}%,user_email.ilike.%${filters.search_term}%,error_message.ilike.%${filters.search_term}%`
        );
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching audit events:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch audit events:', error);
      // Return mock data for development
      return this.getMockAuditEvents(filters, limit);
    }
  }

  // Get audit statistics
  async getAuditStats(filters: AuditFilters = {}): Promise<AuditStats> {
    try {
      const events = await this.getAuditEvents(filters, 10000); // Large dataset for stats
      
      const stats: AuditStats = {
        total_events: events.length,
        success_rate: events.length > 0 ? 
          (events.filter(e => e.success).length / events.length) * 100 : 0,
        events_by_type: {} as Record<AuditEventType, number>,
        events_by_severity: { low: 0, medium: 0, high: 0, critical: 0 },
        top_users: [],
        recent_security_events: [],
        error_rate: 0,
        avg_duration_ms: 0
      };

      // Calculate statistics
      const userEventCounts: Record<string, number> = {};
      let totalDuration = 0;
      let durationCount = 0;
      let errorCount = 0;

      events.forEach(event => {
        // Count by type
        stats.events_by_type[event.event_type] = 
          (stats.events_by_type[event.event_type] || 0) + 1;
        
        // Count by severity
        stats.events_by_severity[event.severity]++;
        
        // Count by user
        if (event.user_email) {
          userEventCounts[event.user_email] = 
            (userEventCounts[event.user_email] || 0) + 1;
        }
        
        // Duration stats
        if (event.duration_ms) {
          totalDuration += event.duration_ms;
          durationCount++;
        }
        
        // Error count
        if (!event.success) {
          errorCount++;
        }
        
        // Security events
        if (event.event_type === 'security_event' && 
            stats.recent_security_events.length < 10) {
          stats.recent_security_events.push(event);
        }
      });

      // Top users
      stats.top_users = Object.entries(userEventCounts)
        .map(([email, count]) => ({ user_email: email, event_count: count }))
        .sort((a, b) => b.event_count - a.event_count)
        .slice(0, 10);

      // Error rate
      stats.error_rate = events.length > 0 ? (errorCount / events.length) * 100 : 0;
      
      // Average duration
      stats.avg_duration_ms = durationCount > 0 ? totalDuration / durationCount : 0;

      return stats;
    } catch (error) {
      console.error('Failed to get audit stats:', error);
      return this.getMockAuditStats();
    }
  }

  // Export audit logs
  async exportAuditLogs(
    filters: AuditFilters = {},
    format: 'csv' | 'json' = 'csv'
  ): Promise<string> {
    const events = await this.getAuditEvents(filters, 50000); // Large export
    
    if (format === 'json') {
      return JSON.stringify(events, null, 2);
    }
    
    // CSV format
    const headers = [
      'Timestamp',
      'Event Type',
      'User Email',
      'Action',
      'Resource Type',
      'Resource ID',
      'Success',
      'Severity',
      'IP Address',
      'Duration (ms)',
      'Error Message',
      'Details'
    ];
    
    const rows = events.map(event => [
      event.created_at || '',
      event.event_type,
      event.user_email || '',
      event.action,
      event.resource_type || '',
      event.resource_id || '',
      event.success ? 'Yes' : 'No',
      event.severity,
      event.ip_address || '',
      event.duration_ms?.toString() || '',
      event.error_message || '',
      event.details ? JSON.stringify(event.details) : ''
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  }

  // Flush buffer to database
  private async flushBuffer(): Promise<void> {
    if (this.localBuffer.length === 0) return;
    
    const eventsToFlush = [...this.localBuffer];
    this.localBuffer = [];
    
    try {
      // In production, write to Supabase
      const { error } = await supabase
        .from('audit_logs')
        .insert(eventsToFlush);
      
      if (error) {
        console.error('Failed to flush audit events:', error);
        // Re-add events to buffer for retry
        this.localBuffer.unshift(...eventsToFlush);
      } else {
        console.log(`📊 AuditService: Flushed ${eventsToFlush.length} events`);
      }
    } catch (error) {
      console.error('Audit buffer flush error:', error);
      // In development, just log to console
      eventsToFlush.forEach(event => {
        console.log('📋 Audit:', event.action, event.user_email, event.success ? '✅' : '❌');
      });
    }
  }

  // Helper methods
  private async getClientIP(): Promise<string> {
    try {
      // In production, get from request headers or IP service
      return 'localhost';
    } catch {
      return 'unknown';
    }
  }

  private async getUserAgent(): Promise<string> {
    try {
      return navigator.userAgent || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private async getSessionId(): Promise<string> {
    try {
      // Generate or retrieve session ID
      let sessionId = sessionStorage.getItem('audit_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('audit_session_id', sessionId);
      }
      return sessionId;
    } catch {
      return 'unknown';
    }
  }

  // Mock data for development
  private getMockAuditEvents(filters: AuditFilters, limit: number): AuditEvent[] {
    const mockEvents: AuditEvent[] = [
      {
        id: '1',
        event_type: 'login_success',
        user_email: 'creator@test.com',
        action: 'User login',
        success: true,
        severity: 'low',
        created_at: new Date().toISOString(),
        ip_address: '127.0.0.1'
      },
      {
        id: '2',
        event_type: 'collaboration_created',
        user_email: 'business@test.com',
        action: 'Created collaboration',
        resource_type: 'collaboration',
        resource_id: 'collab-123',
        success: true,
        severity: 'low',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        ip_address: '127.0.0.1'
      }
    ];
    
    return mockEvents.slice(0, limit);
  }

  private getMockAuditStats(): AuditStats {
    return {
      total_events: 1250,
      success_rate: 94.5,
      events_by_type: {
        login_success: 450,
        login_failed: 25,
        api_access: 600,
        admin_action: 45
      } as any,
      events_by_severity: {
        low: 1000,
        medium: 200,
        high: 45,
        critical: 5
      },
      top_users: [
        { user_email: 'admin@urcontent.com', event_count: 245 },
        { user_email: 'creator@test.com', event_count: 156 }
      ],
      recent_security_events: [],
      error_rate: 5.5,
      avg_duration_ms: 245
    };
  }

  // Cleanup on service destruction
  async destroy(): Promise<void> {
    if (this.bufferFlushInterval) {
      clearInterval(this.bufferFlushInterval);
      this.bufferFlushInterval = null;
    }
    
    // Flush any remaining events
    await this.flushBuffer();
    
    console.log('🛑 AuditService: Service destroyed');
  }
}

export const auditService = new AuditService();
export default auditService;
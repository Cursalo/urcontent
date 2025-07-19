import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { verify } from 'jsonwebtoken';
import { WebSocketEvents, WebSocketAuth, WebSocketRoom, QueuedMessage } from './types';
import { RoomManager } from './rooms';
import { AuthManager } from './auth';
import { EventHandler } from './events';

export class BonsaiWebSocketServer {
  private io: Server;
  private roomManager: RoomManager;
  private authManager: AuthManager;
  private eventHandler: EventHandler;
  private messageQueue: Map<string, QueuedMessage[]> = new Map();
  private redisClient?: any;
  private rateLimitMap: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(httpServer: any, options: {
    cors?: {
      origin: string | string[];
      credentials: boolean;
    };
    redis?: {
      url: string;
    };
    rateLimit?: {
      maxRequests: number;
      windowMs: number;
    };
  } = {}) {
    // Initialize Socket.IO server
    this.io = new Server(httpServer, {
      cors: options.cors || {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      allowEIO3: true,
    });

    // Initialize Redis adapter if Redis URL is provided
    if (options.redis?.url) {
      this.setupRedisAdapter(options.redis.url);
    }

    // Initialize managers
    this.roomManager = new RoomManager();
    this.authManager = new AuthManager();
    this.eventHandler = new EventHandler(this.io, this.roomManager);

    // Setup connection handling
    this.setupConnectionHandling();
    this.setupRateLimit(options.rateLimit);
    this.setupMessageQueue();
    this.setupHeartbeat();
  }

  private async setupRedisAdapter(redisUrl: string) {
    try {
      const pubClient = createClient({ url: redisUrl });
      const subClient = pubClient.duplicate();

      await Promise.all([
        pubClient.connect(),
        subClient.connect(),
      ]);

      this.io.adapter(createAdapter(pubClient, subClient));
      this.redisClient = pubClient;
      
      console.log('✅ Redis adapter configured successfully');
    } catch (error) {
      console.error('❌ Failed to setup Redis adapter:', error);
    }
  }

  private setupConnectionHandling() {
    this.io.on('connection', async (socket) => {
      console.log(`🔌 New connection: ${socket.id}`);

      try {
        // Authenticate the connection
        const auth = await this.authManager.authenticate(socket);
        if (!auth) {
          socket.emit('error', { code: 'AUTH_FAILED', message: 'Authentication failed' });
          socket.disconnect();
          return;
        }

        // Store auth info in socket
        socket.data.auth = auth;
        socket.data.userId = auth.userId;
        socket.data.sessionId = auth.sessionId;

        // Join user-specific room
        const roomId = `user:${auth.userId}`;
        await socket.join(roomId);
        
        // Register room
        await this.roomManager.joinRoom(roomId, auth.userId, auth.sessionId, socket.id);

        // Send any queued messages
        await this.processQueuedMessages(auth.userId, socket);

        // Setup event handlers
        this.setupSocketEventHandlers(socket, auth);

        // Notify successful connection
        socket.emit('user:joined', {
          userId: auth.userId,
          sessionId: auth.sessionId,
          roomId,
          userInfo: {
            id: auth.userId,
            name: auth.userId, // This should come from user data
          },
        });

        // Broadcast to other clients if needed
        socket.to(roomId).emit('user:connect', {
          userId: auth.userId,
          sessionId: auth.sessionId,
          userAgent: socket.handshake.headers['user-agent'] || '',
          timestamp: Date.now(),
        });

      } catch (error) {
        console.error('❌ Connection setup failed:', error);
        socket.emit('error', { code: 'CONNECTION_FAILED', message: 'Connection setup failed' });
        socket.disconnect();
      }
    });
  }

  private setupSocketEventHandlers(socket: any, auth: WebSocketAuth) {
    // Question analysis events
    socket.on('question:analyze', (data: any) => {
      if (!this.checkRateLimit(auth.userId)) {
        socket.emit('error', { code: 'RATE_LIMIT', message: 'Rate limit exceeded' });
        return;
      }
      this.eventHandler.handleQuestionAnalyze(socket, data);
    });

    // Recommendation events
    socket.on('recommendations:request', (data: any) => {
      if (!this.checkRateLimit(auth.userId)) {
        socket.emit('error', { code: 'RATE_LIMIT', message: 'Rate limit exceeded' });
        return;
      }
      this.eventHandler.handleRecommendationRequest(socket, data);
    });

    // Coaching events
    socket.on('coaching:message', (data: any) => {
      this.eventHandler.handleCoachingMessage(socket, data);
    });

    // Analytics events
    socket.on('analytics:update', (data: any) => {
      this.eventHandler.handleAnalyticsUpdate(socket, data);
    });

    // Extension sync events
    socket.on('extension:sync', (data: any) => {
      this.eventHandler.handleExtensionSync(socket, data);
    });

    socket.on('extension:screenshot', (data: any) => {
      if (!this.checkRateLimit(auth.userId, 'screenshot')) {
        socket.emit('error', { code: 'RATE_LIMIT', message: 'Screenshot rate limit exceeded' });
        return;
      }
      this.eventHandler.handleExtensionScreenshot(socket, data);
    });

    // Session events
    socket.on('session:state', (data: any) => {
      this.eventHandler.handleSessionState(socket, data);
    });

    // Generic error handling
    socket.on('error', (error: any) => {
      console.error(`❌ Socket error from ${socket.id}:`, error);
    });

    // Disconnect handling
    socket.on('disconnect', async (reason) => {
      console.log(`🔌 Disconnection: ${socket.id} - Reason: ${reason}`);
      
      try {
        const roomId = `user:${auth.userId}`;
        await this.roomManager.leaveRoom(roomId, socket.id);
        
        // Broadcast disconnect to other clients
        socket.to(roomId).emit('user:disconnect', {
          userId: auth.userId,
          sessionId: auth.sessionId,
          reason,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('❌ Disconnect cleanup failed:', error);
      }
    });
  }

  private setupRateLimit(config?: { maxRequests: number; windowMs: number }) {
    const defaultConfig = {
      maxRequests: 60,
      windowMs: 60000, // 1 minute
    };
    
    const rateLimit = config || defaultConfig;
    
    setInterval(() => {
      const now = Date.now();
      for (const [key, limit] of Array.from(this.rateLimitMap.entries())) {
        if (now > limit.resetTime) {
          this.rateLimitMap.delete(key);
        }
      }
    }, rateLimit.windowMs);
  }

  private checkRateLimit(userId: string, type: string = 'default'): boolean {
    const key = `${userId}:${type}`;
    const now = Date.now();
    const windowMs = type === 'screenshot' ? 10000 : 60000; // 10s for screenshots, 1m for others
    const maxRequests = type === 'screenshot' ? 10 : 60;

    const limit = this.rateLimitMap.get(key);
    if (!limit) {
      this.rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (now > limit.resetTime) {
      this.rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (limit.count >= maxRequests) {
      return false;
    }

    limit.count++;
    return true;
  }

  private setupMessageQueue() {
    // Process queued messages every 5 seconds
    setInterval(() => {
      this.processAllQueuedMessages();
    }, 5000);
  }

  private setupHeartbeat() {
    // Send heartbeat every 30 seconds
    setInterval(() => {
      this.io.emit('heartbeat', { timestamp: Date.now() });
    }, 30000);
  }

  private async processQueuedMessages(userId: string, socket: any) {
    const messages = this.messageQueue.get(userId);
    if (!messages || messages.length === 0) return;

    for (const message of messages) {
      try {
        socket.emit(message.event, message.data);
        message.attempts++;
      } catch (error) {
        console.error('❌ Failed to send queued message:', error);
        if (message.attempts < 3) {
          // Keep in queue for retry
          continue;
        }
      }
    }

    // Remove processed messages
    this.messageQueue.delete(userId);
  }

  private async processAllQueuedMessages() {
    for (const [userId, messages] of Array.from(this.messageQueue.entries())) {
      const sockets = await this.io.in(`user:${userId}`).fetchSockets();
      if (sockets.length > 0) {
        await this.processQueuedMessages(userId, sockets[0]);
      }
    }
  }

  // Public methods for external use
  public async emitToUser(userId: string, event: keyof WebSocketEvents, data: any) {
    const roomId = `user:${userId}`;
    const sockets = await this.io.in(roomId).fetchSockets();
    
    if (sockets.length === 0) {
      // Queue message if user is not connected
      this.queueMessage(userId, event, data);
      return;
    }

    this.io.to(roomId).emit(event, data);
  }

  public async emitToSession(sessionId: string, event: keyof WebSocketEvents, data: any) {
    const roomId = `session:${sessionId}`;
    this.io.to(roomId).emit(event, data);
  }

  public async emitToAll(event: keyof WebSocketEvents, data: any) {
    this.io.emit(event, data);
  }

  private queueMessage(userId: string, event: keyof WebSocketEvents, data: any) {
    if (!this.messageQueue.has(userId)) {
      this.messageQueue.set(userId, []);
    }

    const messages = this.messageQueue.get(userId)!;
    messages.push({
      id: `${Date.now()}-${Math.random()}`,
      userId,
      event,
      data,
      timestamp: Date.now(),
      attempts: 0,
      priority: 1,
    });

    // Keep only last 50 messages per user
    if (messages.length > 50) {
      messages.splice(0, messages.length - 50);
    }
  }

  public getConnectedUsers(): string[] {
    return this.roomManager.getActiveUsers();
  }

  public getActiveRooms(): WebSocketRoom[] {
    return this.roomManager.getActiveRooms();
  }

  public async close() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
    this.io.close();
  }
}

// Export singleton instance
let serverInstance: BonsaiWebSocketServer | null = null;

export function createWebSocketServer(httpServer: any, options: any = {}) {
  if (serverInstance) {
    return serverInstance;
  }

  serverInstance = new BonsaiWebSocketServer(httpServer, options);
  return serverInstance;
}

export function getWebSocketServer(): BonsaiWebSocketServer | null {
  return serverInstance;
}
import { io, Socket } from 'socket.io-client';
import { WebSocketEvents, BonsaiWebSocketClient, WebSocketConfig, ConnectionStatus } from './types';

export class BonsaiWebSocketClientImpl implements BonsaiWebSocketClient {
  public socket: Socket;
  private config: WebSocketConfig;
  private connectionStatus: ConnectionStatus = 'disconnected';
  private reconnectAttempts = 0;
  private heartbeatInterval?: NodeJS.Timeout;
  private reconnectTimeout?: NodeJS.Timeout;
  private messageQueue: Array<{ event: keyof WebSocketEvents; data: any }> = [];
  private listeners: Map<keyof WebSocketEvents, Set<Function>> = new Map();

  constructor(config: WebSocketConfig) {
    this.config = config;
    this.socket = this.createSocket();
    this.setupEventHandlers();
  }

  private createSocket(): Socket {
    return io(this.config.url, {
      auth: {
        token: this.config.auth.token,
        userId: this.config.auth.userId,
        sessionId: this.config.auth.sessionId,
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: false, // We handle reconnection manually
      autoConnect: false,
    });
  }

  private setupEventHandlers() {
    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.connectionStatus = 'connected';
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.processMessageQueue();
      this.notifyListeners('user:connect', {
        userId: this.config.auth.userId,
        sessionId: this.config.auth.sessionId,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
      this.connectionStatus = 'disconnected';
      this.stopHeartbeat();
      
      // Auto-reconnect unless manually disconnected
      if (reason !== 'io client disconnect') {
        this.scheduleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      this.connectionStatus = 'disconnected';
      this.scheduleReconnect();
    });

    // Heartbeat handling
    this.socket.on('heartbeat', (data) => {
      // Respond to server heartbeat
      this.socket.emit('heartbeat_ack', { timestamp: Date.now() });
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
      this.notifyListeners('error', error);
    });

    // Authentication events
    this.socket.on('user:joined', (data) => {
      this.notifyListeners('user:joined', data);
    });

    // Question analysis events
    this.socket.on('question:analyzed', (data) => {
      this.notifyListeners('question:analyzed', data);
    });

    this.socket.on('question:error', (data) => {
      this.notifyListeners('question:error', data);
    });

    // Recommendation events
    this.socket.on('recommendations:update', (data) => {
      this.notifyListeners('recommendations:update', data);
    });

    this.socket.on('recommendations:refresh', (data) => {
      this.notifyListeners('recommendations:refresh', data);
    });

    // Coaching events
    this.socket.on('coaching:message', (data) => {
      this.notifyListeners('coaching:message', data);
    });

    this.socket.on('coaching:hint', (data) => {
      this.notifyListeners('coaching:hint', data);
    });

    this.socket.on('coaching:strategy', (data) => {
      this.notifyListeners('coaching:strategy', data);
    });

    // Analytics events
    this.socket.on('analytics:update', (data) => {
      this.notifyListeners('analytics:update', data);
    });

    this.socket.on('analytics:performance', (data) => {
      this.notifyListeners('analytics:performance', data);
    });

    this.socket.on('analytics:progress', (data) => {
      this.notifyListeners('analytics:progress', data);
    });

    // Extension sync events
    this.socket.on('extension:sync', (data) => {
      this.notifyListeners('extension:sync', data);
    });

    this.socket.on('extension:state', (data) => {
      this.notifyListeners('extension:state', data);
    });

    // Session events
    this.socket.on('session:state', (data) => {
      this.notifyListeners('session:state', data);
    });

    this.socket.on('session:update', (data) => {
      this.notifyListeners('session:update', data);
    });

    this.socket.on('session:end', (data) => {
      this.notifyListeners('session:end', data);
    });
  }

  private notifyListeners<K extends keyof WebSocketEvents>(
    event: K,
    data: Parameters<WebSocketEvents[K]>[0]
  ) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Error in listener for ${event}:`, error);
        }
      });
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.socket.connected) {
        this.socket.emit('heartbeat', { timestamp: Date.now() });
      }
    }, this.config.heartbeat.interval);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.config.reconnect.attempts) {
      console.log('❌ Max reconnection attempts reached');
      return;
    }

    this.connectionStatus = 'reconnecting';
    this.reconnectAttempts++;

    const delay = Math.min(
      this.config.reconnect.delay * Math.pow(2, this.reconnectAttempts - 1),
      this.config.reconnect.maxDelay
    );

    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnect();
    }, delay);
  }

  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connectionStatus === 'connected') {
        resolve();
        return;
      }

      this.connectionStatus = 'connecting';

      const onConnect = () => {
        this.socket.off('connect', onConnect);
        this.socket.off('connect_error', onError);
        resolve();
      };

      const onError = (error: any) => {
        this.socket.off('connect', onConnect);
        this.socket.off('connect_error', onError);
        reject(error);
      };

      this.socket.on('connect', onConnect);
      this.socket.on('connect_error', onError);

      this.socket.connect();
    });
  }

  public disconnect(): void {
    this.connectionStatus = 'disconnecting';
    this.stopHeartbeat();
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = undefined;
    }

    this.socket.disconnect();
    this.connectionStatus = 'disconnected';
  }

  public async reconnect(): Promise<void> {
    this.disconnect();
    
    // Create new socket with fresh auth if needed
    if (this.isTokenExpired()) {
      throw new Error('Token expired, need to re-authenticate');
    }

    this.socket = this.createSocket();
    this.setupEventHandlers();
    
    return this.connect();
  }

  private isTokenExpired(): boolean {
    return Date.now() > this.config.auth.expiresAt;
  }

  public emit<K extends keyof WebSocketEvents>(
    event: K,
    data: Parameters<WebSocketEvents[K]>[0]
  ): void {
    if (this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      // Queue message for when connection is restored
      this.messageQueue.push({ event, data });
    }
  }

  public on<K extends keyof WebSocketEvents>(
    event: K,
    callback: WebSocketEvents[K]
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  public off<K extends keyof WebSocketEvents>(
    event: K,
    callback?: WebSocketEvents[K]
  ): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      if (callback) {
        listeners.delete(callback);
      } else {
        listeners.clear();
      }
    }
  }

  private processMessageQueue() {
    while (this.messageQueue.length > 0 && this.socket.connected) {
      const message = this.messageQueue.shift()!;
      this.socket.emit(message.event, message.data);
    }
  }

  public get isConnected(): boolean {
    return this.connectionStatus === 'connected';
  }

  public get status(): ConnectionStatus {
    return this.connectionStatus;
  }

  public updateAuth(auth: { token: string; expiresAt: number }) {
    this.config.auth.token = auth.token;
    this.config.auth.expiresAt = auth.expiresAt;
  }

  // Convenience methods for common operations
  public analyzeQuestion(questionData: {
    questionId: string;
    imageData?: string;
    textContent?: string;
    context: any;
  }) {
    this.emit('question:analyze', {
      ...questionData,
      timestamp: Date.now(),
    });
  }

  public requestRecommendations(data: {
    currentSkillLevel: Record<string, number>;
    weakAreas: string[];
    preferences: any;
    context: any;
  }) {
    this.emit('recommendations:request', {
      userId: this.config.auth.userId,
      ...data,
    });
  }

  public sendCoachingMessage(message: string, type: 'encouragement' | 'hint' | 'strategy' | 'correction' = 'encouragement') {
    this.emit('coaching:message', {
      userId: this.config.auth.userId,
      message,
      type,
      priority: 'medium',
      timestamp: Date.now(),
    });
  }

  public updateAnalytics(metrics: any) {
    this.emit('analytics:update', {
      userId: this.config.auth.userId,
      sessionId: this.config.auth.sessionId,
      metrics,
      timestamp: Date.now(),
    });
  }

  public syncExtension(extensionId: string, state: any) {
    this.emit('extension:sync', {
      userId: this.config.auth.userId,
      extensionId,
      state: {
        ...state,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    });
  }

  public updateSessionState(state: 'active' | 'paused' | 'ended', data: any = {}) {
    this.emit('session:state', {
      userId: this.config.auth.userId,
      sessionId: this.config.auth.sessionId,
      state,
      data: {
        ...data,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    });
  }
}

// Factory function to create client
export function createWebSocketClient(config: WebSocketConfig): BonsaiWebSocketClient {
  return new BonsaiWebSocketClientImpl(config);
}

// Singleton client for app-wide use
let clientInstance: BonsaiWebSocketClient | null = null;

export function getWebSocketClient(): BonsaiWebSocketClient | null {
  return clientInstance;
}

export function initializeWebSocketClient(config: WebSocketConfig): BonsaiWebSocketClient {
  if (clientInstance) {
    clientInstance.disconnect();
  }
  
  clientInstance = new BonsaiWebSocketClientImpl(config);
  return clientInstance;
}
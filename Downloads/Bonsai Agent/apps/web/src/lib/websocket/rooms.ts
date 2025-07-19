import { WebSocketRoom } from './types';

export class RoomManager {
  private rooms: Map<string, WebSocketRoom> = new Map();
  private userRooms: Map<string, Set<string>> = new Map(); // userId -> roomIds
  private socketRooms: Map<string, Set<string>> = new Map(); // socketId -> roomIds

  /**
   * Join a user to a room
   */
  async joinRoom(roomId: string, userId: string, sessionId: string, socketId: string): Promise<void> {
    // Create or update room
    const room: WebSocketRoom = {
      id: roomId,
      userId,
      sessionId,
      createdAt: this.rooms.get(roomId)?.createdAt || Date.now(),
      lastActivity: Date.now(),
      metadata: {
        socketId,
        joinedAt: Date.now(),
        ...this.rooms.get(roomId)?.metadata,
      },
    };

    this.rooms.set(roomId, room);

    // Track user rooms
    if (!this.userRooms.has(userId)) {
      this.userRooms.set(userId, new Set());
    }
    this.userRooms.get(userId)!.add(roomId);

    // Track socket rooms
    if (!this.socketRooms.has(socketId)) {
      this.socketRooms.set(socketId, new Set());
    }
    this.socketRooms.get(socketId)!.add(roomId);

    console.log(`✅ User ${userId} joined room ${roomId} with socket ${socketId}`);
  }

  /**
   * Remove a socket from all its rooms
   */
  async leaveRoom(roomId: string, socketId: string): Promise<void> {
    const room = this.rooms.get(roomId);
    if (!room) return;

    // Update room metadata
    room.lastActivity = Date.now();
    if (room.metadata.socketId === socketId) {
      // Remove socket reference from room
      delete room.metadata.socketId;
    }

    // Remove from socket rooms tracking
    const socketRoomSet = this.socketRooms.get(socketId);
    if (socketRoomSet) {
      socketRoomSet.delete(roomId);
      if (socketRoomSet.size === 0) {
        this.socketRooms.delete(socketId);
      }
    }

    // Check if room should be cleaned up
    if (!room.metadata.socketId) {
      // No active sockets in room, but keep room for potential reconnection
      console.log(`📤 Socket ${socketId} left room ${roomId}`);
    }
  }

  /**
   * Get all rooms for a user
   */
  getUserRooms(userId: string): WebSocketRoom[] {
    const roomIds = this.userRooms.get(userId);
    if (!roomIds) return [];

    return Array.from(roomIds)
      .map(roomId => this.rooms.get(roomId))
      .filter((room): room is WebSocketRoom => room !== undefined);
  }

  /**
   * Get a specific room
   */
  getRoom(roomId: string): WebSocketRoom | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Get all active rooms (rooms with recent activity)
   */
  getActiveRooms(maxAge: number = 3600000): WebSocketRoom[] { // 1 hour default
    const now = Date.now();
    return Array.from(this.rooms.values())
      .filter(room => (now - room.lastActivity) < maxAge);
  }

  /**
   * Get all active users
   */
  getActiveUsers(maxAge: number = 3600000): string[] { // 1 hour default
    const activeRooms = this.getActiveRooms(maxAge);
    const activeUsers = new Set<string>();
    
    activeRooms.forEach(room => {
      activeUsers.add(room.userId);
    });

    return Array.from(activeUsers);
  }

  /**
   * Check if a user is currently connected
   */
  isUserConnected(userId: string): boolean {
    const userRoomIds = this.userRooms.get(userId);
    if (!userRoomIds) return false;

    // Check if any of user's rooms have active sockets
    for (const roomId of userRoomIds) {
      const room = this.rooms.get(roomId);
      if (room && room.metadata.socketId) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get room statistics
   */
  getRoomStats(): {
    totalRooms: number;
    activeRooms: number;
    totalUsers: number;
    activeUsers: number;
    activeSockets: number;
  } {
    const activeRooms = this.getActiveRooms();
    const activeUsers = new Set<string>();
    let activeSockets = 0;

    activeRooms.forEach(room => {
      activeUsers.add(room.userId);
      if (room.metadata.socketId) {
        activeSockets++;
      }
    });

    return {
      totalRooms: this.rooms.size,
      activeRooms: activeRooms.length,
      totalUsers: this.userRooms.size,
      activeUsers: activeUsers.size,
      activeSockets,
    };
  }

  /**
   * Clean up old inactive rooms
   */
  cleanupInactiveRooms(maxAge: number = 86400000): number { // 24 hours default
    const now = Date.now();
    let cleanedCount = 0;

    for (const [roomId, room] of this.rooms.entries()) {
      if ((now - room.lastActivity) > maxAge) {
        // Remove from all tracking maps
        this.rooms.delete(roomId);
        
        const userRoomSet = this.userRooms.get(room.userId);
        if (userRoomSet) {
          userRoomSet.delete(roomId);
          if (userRoomSet.size === 0) {
            this.userRooms.delete(room.userId);
          }
        }

        if (room.metadata.socketId) {
          const socketRoomSet = this.socketRooms.get(room.metadata.socketId);
          if (socketRoomSet) {
            socketRoomSet.delete(roomId);
            if (socketRoomSet.size === 0) {
              this.socketRooms.delete(room.metadata.socketId);
            }
          }
        }

        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} inactive rooms`);
    }

    return cleanedCount;
  }

  /**
   * Update room activity timestamp
   */
  updateRoomActivity(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.lastActivity = Date.now();
    }
  }

  /**
   * Update room metadata
   */
  updateRoomMetadata(roomId: string, metadata: Record<string, any>): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.metadata = { ...room.metadata, ...metadata };
      room.lastActivity = Date.now();
    }
  }

  /**
   * Get rooms for a specific session
   */
  getSessionRooms(sessionId: string): WebSocketRoom[] {
    return Array.from(this.rooms.values())
      .filter(room => room.sessionId === sessionId);
  }

  /**
   * Check if a session is active
   */
  isSessionActive(sessionId: string): boolean {
    const sessionRooms = this.getSessionRooms(sessionId);
    return sessionRooms.some(room => room.metadata.socketId);
  }

  /**
   * Get all sockets for a user
   */
  getUserSockets(userId: string): string[] {
    const userRoomIds = this.userRooms.get(userId);
    if (!userRoomIds) return [];

    const sockets = new Set<string>();
    for (const roomId of userRoomIds) {
      const room = this.rooms.get(roomId);
      if (room && room.metadata.socketId) {
        sockets.add(room.metadata.socketId);
      }
    }

    return Array.from(sockets);
  }

  /**
   * Get user for a socket
   */
  getSocketUser(socketId: string): string | undefined {
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.metadata.socketId === socketId) {
        return room.userId;
      }
    }
    return undefined;
  }

  /**
   * Start automatic cleanup
   */
  startAutoCleanup(intervalMs: number = 3600000): NodeJS.Timeout { // 1 hour default
    return setInterval(() => {
      this.cleanupInactiveRooms();
    }, intervalMs);
  }

  /**
   * Export room data for monitoring/debugging
   */
  exportRoomData(): {
    rooms: WebSocketRoom[];
    userRooms: Record<string, string[]>;
    socketRooms: Record<string, string[]>;
    stats: ReturnType<typeof this.getRoomStats>;
  } {
    const userRoomsObj: Record<string, string[]> = {};
    for (const [userId, roomIds] of this.userRooms.entries()) {
      userRoomsObj[userId] = Array.from(roomIds);
    }

    const socketRoomsObj: Record<string, string[]> = {};
    for (const [socketId, roomIds] of this.socketRooms.entries()) {
      socketRoomsObj[socketId] = Array.from(roomIds);
    }

    return {
      rooms: Array.from(this.rooms.values()),
      userRooms: userRoomsObj,
      socketRooms: socketRoomsObj,
      stats: this.getRoomStats(),
    };
  }

  /**
   * Import room data (for testing or restoration)
   */
  importRoomData(data: {
    rooms: WebSocketRoom[];
    userRooms: Record<string, string[]>;
    socketRooms: Record<string, string[]>;
  }): void {
    // Clear existing data
    this.rooms.clear();
    this.userRooms.clear();
    this.socketRooms.clear();

    // Import rooms
    data.rooms.forEach(room => {
      this.rooms.set(room.id, room);
    });

    // Import user rooms
    for (const [userId, roomIds] of Object.entries(data.userRooms)) {
      this.userRooms.set(userId, new Set(roomIds));
    }

    // Import socket rooms
    for (const [socketId, roomIds] of Object.entries(data.socketRooms)) {
      this.socketRooms.set(socketId, new Set(roomIds));
    }

    console.log(`📥 Imported ${data.rooms.length} rooms`);
  }
}
import { createServer } from 'http';
import { createWebSocketServer } from './server';

// Store the HTTP server and WebSocket server
let httpServer: any = null;
let wsServer: any = null;

// Initialize WebSocket server (called separately)
export function initializeWebSocketServer(port: number = 3001) {
  if (wsServer) {
    console.log('🔌 WebSocket server already initialized');
    return wsServer;
  }

  try {
    // Create HTTP server for WebSocket
    httpServer = createServer();

    // Create WebSocket server
    wsServer = createWebSocketServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
      },
      redis: process.env.REDIS_URL ? {
        url: process.env.REDIS_URL,
      } : undefined,
      rateLimit: {
        maxRequests: 60,
        windowMs: 60000,
      },
    });

    // Start listening
    httpServer.listen(port, () => {
      console.log(`🚀 WebSocket server running on port ${port}`);
      console.log(`📡 WebSocket endpoint: ws://localhost:${port}`);
    });

    // Handle server shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 Shutting down WebSocket server...');
      if (wsServer) {
        wsServer.close();
      }
      if (httpServer) {
        httpServer.close();
      }
    });

    return wsServer;

  } catch (error) {
    console.error('❌ Failed to initialize WebSocket server:', error);
    throw error;
  }
}

export { wsServer, httpServer };
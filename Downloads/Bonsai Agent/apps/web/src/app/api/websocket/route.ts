import { NextRequest } from 'next/server';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { createWebSocketServer } from '@/lib/websocket/server';

// Store the HTTP server and WebSocket server
let httpServer: any = null;
let wsServer: any = null;

export async function GET(request: NextRequest) {
  // Check if this is a WebSocket upgrade request
  const upgrade = request.headers.get('upgrade');
  
  if (upgrade !== 'websocket') {
    return new Response('WebSocket endpoint. Use WebSocket connection.', {
      status: 400,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  // For Next.js API routes, we need to handle WebSocket differently
  // This endpoint serves as documentation/health check
  return new Response(JSON.stringify({
    status: 'WebSocket server running',
    endpoint: process.env.WEBSOCKET_URL || 'ws://localhost:3001',
    timestamp: new Date().toISOString(),
    features: [
      'Real-time question analysis',
      'Live recommendations',
      'Instant coaching',
      'Performance analytics',
      'Extension synchronization',
      'Multi-device support'
    ]
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

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

// Health check endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (body.action === 'health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        server: wsServer ? 'running' : 'not_initialized',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (body.action === 'stats' && wsServer) {
      const stats = {
        connectedUsers: wsServer.getConnectedUsers().length,
        activeRooms: wsServer.getActiveRooms().length,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      };

      return new Response(JSON.stringify(stats), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      error: 'Invalid action',
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
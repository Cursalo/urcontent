import { initializeWebSocketServer } from '../src/app/api/websocket/route';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const PORT = parseInt(process.env.WEBSOCKET_PORT || '3001');

async function startWebSocketServer() {
  try {
    console.log('🚀 Starting Bonsai WebSocket Server...');
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    console.log(`🔐 Redis URL: ${process.env.REDIS_URL ? 'Configured' : 'Not configured'}`);
    
    const server = initializeWebSocketServer(PORT);
    
    console.log('✅ WebSocket server started successfully!');
    console.log('📋 Available features:');
    console.log('  - Real-time question analysis');
    console.log('  - Live recommendations');
    console.log('  - Instant coaching');
    console.log('  - Performance analytics');
    console.log('  - Extension synchronization');
    console.log('  - Multi-device support');
    
    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\\n🛑 Shutting down WebSocket server...');
      server.close();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('\\n🛑 Shutting down WebSocket server...');
      server.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start WebSocket server:', error);
    process.exit(1);
  }
}

startWebSocketServer();
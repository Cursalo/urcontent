# Bonsai Real-Time WebSocket System

A comprehensive WebSocket-based real-time communication system for the Bonsai SAT prep platform that enables live bidirectional communication across all platform components.

## 🚀 Features

### Core Real-Time Capabilities
- **Live Question Analysis**: Stream computer vision results and question insights in real-time
- **Dynamic Recommendations**: Push adaptive question suggestions based on real-time performance
- **Instant Coaching**: Deliver contextual hints and strategies during test-taking
- **Performance Analytics**: Stream live performance metrics and learning progress
- **Multi-device Synchronization**: Keep all devices synchronized with current state
- **Browser Extension Bridge**: Enable seamless communication with browser extension

### Advanced Features
- **Auto-reconnection**: Robust reconnection with exponential backoff
- **Message Queuing**: Queue messages for offline/reconnection scenarios
- **Rate Limiting**: Prevent abuse with configurable rate limits
- **Room Management**: Efficient user session management
- **Authentication**: JWT-based secure authentication
- **Redis Clustering**: Scale across multiple servers (optional)
- **Heartbeat Monitoring**: Connection health monitoring

## 📁 File Structure

```
/apps/web/src/lib/websocket/
├── server.ts          # Main WebSocket server implementation
├── client.ts          # Client-side WebSocket utilities  
├── events.ts          # Event definitions and handlers
├── rooms.ts           # Room management for user sessions
├── auth.ts            # WebSocket authentication
└── types.ts           # TypeScript interfaces

/apps/web/src/app/api/websocket/
└── route.ts           # Next.js API route for WebSocket upgrade

/apps/web/src/hooks/
├── useWebSocket.ts               # React hook for WebSocket
├── useRealTimeRecommendations.ts # Real-time recommendations
├── useRealTimeAnalytics.ts       # Live analytics updates  
└── useLiveCoaching.ts            # Real-time coaching system

/apps/web/src/components/websocket/
└── real-time-dashboard.tsx       # Demo dashboard component

/apps/web/scripts/
└── start-websocket.ts            # WebSocket server startup script
```

## 🛠 Installation & Setup

### 1. Install Dependencies

The required dependencies are already added to package.json:

```bash
npm install
```

Dependencies include:
- `socket.io` - WebSocket server
- `socket.io-client` - WebSocket client  
- `@socket.io/redis-adapter` - Redis clustering
- `redis` - Redis client
- `jsonwebtoken` - JWT authentication

### 2. Environment Configuration

Copy the example environment file:

```bash
cp websocket.env.example .env.local
```

Configure the following variables:

```env
# WebSocket Configuration
WEBSOCKET_PORT=3001
WEBSOCKET_URL=ws://localhost:3001
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3001

# Frontend Configuration  
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Redis (Optional)
REDIS_URL=redis://localhost:6379
```

### 3. Start the WebSocket Server

#### Development Mode (with auto-reload):
```bash
npm run websocket:dev
```

#### Production Mode:
```bash
npm run websocket:start
```

#### Full Development (Next.js + WebSocket):
```bash
npm run dev:full
```

#### Full Production (Next.js + WebSocket):
```bash
npm run start:full
```

## 🔌 WebSocket Events

### Connection Events
- `user:connect` - User joins session
- `user:disconnect` - User leaves session  
- `user:joined` - User successfully joined

### Question Analysis Events
- `question:analyze` - Request question analysis
- `question:analyzed` - Question analysis results
- `question:error` - Analysis error

### Recommendation Events  
- `recommendations:request` - Request new recommendations
- `recommendations:update` - Push new recommendations
- `recommendations:refresh` - Trigger recommendation refresh

### Coaching Events
- `coaching:message` - Send/receive coaching message
- `coaching:hint` - Request/receive hint
- `coaching:strategy` - Request/receive strategy

### Analytics Events
- `analytics:update` - Performance analytics update
- `analytics:performance` - Performance data
- `analytics:progress` - Progress tracking data

### Extension Sync Events
- `extension:sync` - Browser extension synchronization
- `extension:screenshot` - Extension screenshot data
- `extension:state` - Extension state changes

### Session Events
- `session:state` - Session state changes
- `session:update` - Session data updates
- `session:end` - Session completion

## 🎯 Usage Examples

### Basic WebSocket Connection

```tsx
import { useWebSocket } from '@/hooks/useWebSocket';

function MyComponent() {
  const config = {
    url: process.env.NEXT_PUBLIC_WEBSOCKET_URL!,
    auth: {
      token: 'your-jwt-token',
      userId: 'user123',
      sessionId: 'session456',
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    },
    reconnect: { attempts: 5, delay: 1000, maxDelay: 10000 },
    heartbeat: { interval: 30000, timeout: 5000 },
    rateLimit: { maxRequests: 60, windowMs: 60000 },
  };

  const { isConnected, emit, on } = useWebSocket(config, {
    autoConnect: true,
    onConnect: () => console.log('Connected!'),
    onError: (error) => console.error('WebSocket error:', error),
  });

  return (
    <div>
      Status: {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  );
}
```

### Real-Time Recommendations

```tsx
import { useRealTimeRecommendations } from '@/hooks/useRealTimeRecommendations';

function RecommendationsComponent({ userId, config }) {
  const { recommendations, requestRecommendations } = useRealTimeRecommendations(
    userId,
    config,
    {
      autoRequest: true,
      refreshInterval: 30000,
      onRecommendationsReceived: (data) => {
        console.log('New recommendations:', data);
      },
    }
  );

  const handleRequestRecommendations = () => {
    requestRecommendations({
      currentSkillLevel: { math: 0.7, reading: 0.8 },
      weakAreas: ['algebra', 'geometry'],
      preferences: {
        difficulty: 3,
        subjects: ['Math'],
        timeLimit: 120,
      },
      context: {
        recentPerformance: [0.7, 0.8, 0.6],
        studyGoals: ['improve-math', 'increase-speed'],
      },
    });
  };

  return (
    <div>
      <h3>Recommended Questions ({recommendations.questions.length})</h3>
      {recommendations.questions.map(q => (
        <div key={q.id}>
          {q.subject} - Difficulty: {q.difficulty}
        </div>
      ))}
      <button onClick={handleRequestRecommendations}>
        Get New Recommendations
      </button>
    </div>
  );
}
```

### Live Coaching

```tsx
import { useLiveCoaching } from '@/hooks/useLiveCoaching';

function CoachingComponent({ userId, config }) {
  const { 
    coaching, 
    requestHint, 
    requestStrategy, 
    getUnreadCount 
  } = useLiveCoaching(userId, config, {
    autoStart: true,
    onMessageReceived: (message) => {
      console.log('New coaching message:', message);
    },
  });

  return (
    <div>
      <h3>Live Coaching ({getUnreadCount()} unread)</h3>
      
      {coaching.messages.map(message => (
        <div key={message.id} className={!message.isRead ? 'unread' : ''}>
          <strong>{message.type}:</strong> {message.message}
        </div>
      ))}
      
      <button onClick={() => requestHint('question123')}>
        Get Hint
      </button>
      <button onClick={() => requestStrategy('question123')}>
        Get Strategy  
      </button>
    </div>
  );
}
```

### Real-Time Analytics

```tsx
import { useRealTimeAnalytics } from '@/hooks/useRealTimeAnalytics';

function AnalyticsComponent({ userId, sessionId, config }) {
  const { 
    analytics, 
    recordAnswer, 
    startSession, 
    endSession 
  } = useRealTimeAnalytics(userId, sessionId, config, {
    autoStart: true,
    updateInterval: 10000,
  });

  const handleCorrectAnswer = () => {
    recordAnswer('question123', true, 45); // 45 seconds
  };

  const handleIncorrectAnswer = () => {
    recordAnswer('question123', false, 120); // 2 minutes
  };

  return (
    <div>
      <h3>Session Analytics</h3>
      <p>Questions Answered: {analytics.currentSession.questionsAnswered}</p>
      <p>Correct: {analytics.currentSession.correctAnswers}</p>
      <p>Streak: {analytics.currentSession.streakCount}</p>
      <p>Overall Performance: {(analytics.performance.overall * 100).toFixed(1)}%</p>
      
      <button onClick={handleCorrectAnswer}>Record Correct</button>
      <button onClick={handleIncorrectAnswer}>Record Incorrect</button>
      <button onClick={startSession}>Start Session</button>
      <button onClick={endSession}>End Session</button>
    </div>
  );
}
```

## 🔒 Security Features

### JWT Authentication
- Secure token-based authentication
- Configurable token expiration
- Token refresh capabilities
- User validation integration

### Rate Limiting
- Per-user rate limiting
- IP-based rate limiting  
- Configurable limits per event type
- Automatic cleanup of expired limits

### CORS Protection
- Configurable allowed origins
- Credential support
- Security header validation

### Connection Security
- Origin validation
- User agent checking
- Connection attempt limiting

## 🚀 Production Deployment

### Environment Variables

```env
# Production WebSocket URL
WEBSOCKET_URL=wss://your-websocket-domain.com
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-websocket-domain.com

# Secure JWT secret
JWT_SECRET=your-production-jwt-secret-256-bits-minimum

# Production allowed origins
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Redis for clustering (recommended)
REDIS_URL=redis://your-redis-instance:6379
```

### Docker Deployment

```dockerfile
# Add to your existing Dockerfile
EXPOSE 3001
CMD ["npm", "run", "start:full"]
```

### Load Balancing

When using multiple WebSocket servers, enable Redis clustering:

```typescript
// In production, Redis adapter enables clustering
const wsServer = createWebSocketServer(httpServer, {
  redis: { url: process.env.REDIS_URL },
  // ... other config
});
```

### Health Monitoring

Monitor WebSocket health:

```bash
# Check WebSocket status
curl -X POST http://localhost:3000/api/websocket \\
  -H "Content-Type: application/json" \\
  -d '{"action": "health"}'

# Get connection statistics  
curl -X POST http://localhost:3000/api/websocket \\
  -H "Content-Type: application/json" \\
  -d '{"action": "stats"}'
```

## 🧪 Testing

### Manual Testing

Use the included dashboard component:

```tsx
import { RealTimeDashboard } from '@/components/websocket/real-time-dashboard';

function TestPage() {
  return (
    <RealTimeDashboard 
      userId="test-user-123"
      sessionId="test-session-456"
    />
  );
}
```

### Browser Testing

1. Open browser developer tools
2. Go to Network tab
3. Filter by "WS" (WebSocket)
4. Monitor real-time message flow

### Load Testing

Use tools like Artillery or Socket.IO load testing:

```bash
npm install -g artillery
artillery quick --count 100 --num 10 ws://localhost:3001
```

## 🔧 Configuration Options

### Server Configuration

```typescript
const server = createWebSocketServer(httpServer, {
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
  redis: {
    url: 'redis://localhost:6379',
  },
  rateLimit: {
    maxRequests: 60,
    windowMs: 60000,
  },
});
```

### Client Configuration

```typescript
const config = {
  url: 'ws://localhost:3001',
  auth: { /* auth config */ },
  reconnect: {
    attempts: 5,      // Max reconnection attempts
    delay: 1000,      // Initial delay (ms)
    maxDelay: 10000,  // Maximum delay (ms)
  },
  heartbeat: {
    interval: 30000,  // Heartbeat interval (ms)
    timeout: 5000,    // Heartbeat timeout (ms)
  },
  rateLimit: {
    maxRequests: 60,  // Max requests per window
    windowMs: 60000,  // Rate limit window (ms)
  },
};
```

## 🐛 Troubleshooting

### Common Issues

**Connection Failed**
- Check WebSocket server is running on correct port
- Verify CORS configuration
- Check JWT token validity

**Messages Not Received**  
- Verify event names match exactly
- Check rate limiting isn't blocking requests
- Ensure WebSocket is connected

**High Memory Usage**
- Enable Redis for clustering
- Configure message queue limits
- Implement proper cleanup

### Debug Mode

Enable detailed logging:

```typescript
// Add to client configuration
const config = {
  // ... other config
  debug: true, // Enable debug logging
};
```

### Performance Monitoring

Monitor WebSocket performance:

```typescript
// Server-side monitoring
setInterval(() => {
  const stats = wsServer.getRoomStats();
  console.log('WebSocket Stats:', stats);
}, 60000);
```

## 📈 Performance Optimization

### Message Batching
- Batch related messages
- Use message priorities
- Implement message deduplication

### Connection Pooling
- Reuse connections when possible  
- Implement connection limits
- Use Redis for scaling

### Memory Management
- Set message queue limits
- Implement automatic cleanup
- Monitor memory usage

## 🤝 Integration Examples

### Browser Extension Integration

```typescript
// In browser extension
const ws = createWebSocketClient(config);

// Sync extension state
ws.syncExtension('extension-123', {
  isActive: true,
  currentUrl: window.location.href,
  detectedQuestions: ['q1', 'q2'],
});

// Send screenshot for analysis
ws.emit('extension:screenshot', {
  userId: 'user123',
  extensionId: 'extension-123', 
  screenshot: base64Screenshot,
  metadata: {
    url: window.location.href,
    timestamp: Date.now(),
    dimensions: { width: 1920, height: 1080 },
  },
});
```

### AI Service Integration

```typescript
// In event handler
async handleQuestionAnalyze(socket, data) {
  // Call your AI service
  const analysis = await aiService.analyzeQuestion(data);
  
  // Send results back
  socket.emit('question:analyzed', {
    questionId: data.questionId,
    analysis,
    timestamp: Date.now(),
  });
}
```

This comprehensive WebSocket system provides the foundation for real-time, intelligent tutoring that feels like having a live coach working alongside students. The system is production-ready with robust error handling, security features, and scaling capabilities.
# Bonsai Analytics Dashboard

A comprehensive, real-time analytics dashboard for the Bonsai SAT prep platform that provides deep insights into student learning progress and performance.

## Overview

The analytics dashboard is designed to transform complex AI-driven learning data into actionable insights that help students and educators optimize the learning experience. It leverages advanced analytics, real-time data processing, and machine learning predictions to provide unprecedented visibility into the learning process.

## Architecture

```
/src/components/analytics/
├── dashboard/                  # Main dashboard components
│   ├── main-dashboard.tsx     # Primary dashboard layout and orchestration
│   ├── performance-overview.tsx # High-level performance summary
│   ├── skill-mastery-grid.tsx # Interactive skill mastery matrix
│   └── progress-timeline.tsx  # Learning journey visualization
├── charts/                    # Visualization components
│   ├── mastery-heatmap.tsx    # BKT probability heatmap
│   ├── learning-velocity-chart.tsx # Speed of learning visualization
│   ├── score-prediction-chart.tsx # AI score predictions
│   └── study-time-analytics.tsx # Time usage and productivity
├── insights/                  # AI-powered insights
│   └── ai-insights-panel.tsx  # AI-generated learning insights
├── real-time/                 # Live performance components
│   ├── live-performance-meter.tsx # Real-time performance gauge
│   └── session-analytics.tsx  # Current session metrics
└── README.md                  # This documentation
```

## Key Features

### 1. Real-Time Performance Metrics
- **Live Performance Gauge**: Real-time accuracy, speed, and focus tracking
- **Session Analytics**: Current session metrics with goal tracking
- **WebSocket Integration**: Live updates from the learning engine
- **Performance Alerts**: Automatic notifications for performance changes

### 2. Skill Mastery Visualization
- **Bayesian Knowledge Tracing (BKT)**: Advanced skill mastery modeling
- **Interactive Skill Grid**: Detailed view of individual skill progress
- **Confidence Intervals**: Uncertainty visualization for skill assessments
- **Skill Dependencies**: Network graphs showing prerequisite relationships

### 3. Learning Velocity Analytics
- **Speed Tracking**: Questions per minute and learning acceleration
- **Velocity Thresholds**: Performance categorization (slow, moderate, excellent)
- **Pattern Recognition**: Identification of optimal learning conditions
- **Momentum Analysis**: Learning consistency and streak tracking

### 4. Predictive Analytics
- **SAT Score Predictions**: ML-powered score forecasting with confidence bands
- **Time-to-Mastery**: Estimates for skill completion
- **Performance Plateau Detection**: Early warning system for learning plateaus
- **Intervention Recommendations**: AI-suggested course corrections

### 5. Study Time Intelligence
- **Time Distribution Analysis**: Subject-wise time allocation
- **Optimal Study Patterns**: Peak performance time identification
- **Focus Score Tracking**: Attention level monitoring
- **Session Efficiency**: Productivity metrics and recommendations

### 6. AI-Powered Insights
- **Automated Pattern Discovery**: Machine learning-based insight generation
- **Strength/Weakness Analysis**: Detailed performance breakdowns
- **Learning Recommendations**: Personalized study suggestions
- **Predictive Alerts**: Proactive notifications about learning trends

## Technical Implementation

### Data Sources
- **Real-time Analytics**: WebSocket events from learning sessions
- **Skill Mastery Data**: BKT system outputs with confidence scores
- **Question Analytics**: Performance data from practice sessions
- **Time Tracking**: Study session duration and focus metrics
- **Recommendation Engine**: AI system effectiveness data

### Visualization Libraries
- **Recharts**: Primary charting library for interactive visualizations
- **Custom Charts**: Specialized components for education-specific metrics
- **Framer Motion**: Smooth animations and transitions
- **D3.js**: Complex custom visualizations (when needed)

### Real-Time Integration
```typescript
// WebSocket connection for live updates
const { analytics, performance, progress, isConnected } = useRealTimeAnalytics();

// Subscribe to real-time events
useEffect(() => {
  if (socket) {
    socket.on('analytics:update', handleAnalyticsUpdate);
    socket.on('analytics:performance', handlePerformanceUpdate);
    socket.on('analytics:progress', handleProgressUpdate);
  }
}, [socket]);
```

### AI Integration
```typescript
// AI insights generation
const generateAIInsights = async () => {
  const insights = await analyzePerformanceData(skillMastery, recentPerformance);
  const patterns = await identifyLearningPatterns(sessionData);
  const predictions = await generatePredictions(historicalData);
  
  return { insights, patterns, predictions };
};
```

## Dashboard Sections

### 1. Overview Dashboard
- Real-time performance summary
- Key metrics and trends
- Quick access to all analytics
- Progress towards goals

### 2. Skill Analysis
- Detailed skill mastery breakdown
- BKT probability heatmaps
- Skill dependency networks
- Prerequisite tracking

### 3. Performance Trends
- Historical performance analysis
- Learning velocity tracking
- Predictive score modeling
- Comparative analytics

### 4. Study Insights
- Learning pattern analysis
- Optimal study time recommendations
- Focus and productivity metrics
- Session effectiveness analysis

### 5. Real-Time Monitoring
- Live performance tracking
- Current session analytics
- Real-time coaching insights
- Alert system for performance issues

## API Endpoints

### Analytics Data
```
GET /api/analytics/dashboard?timeRange=7d
GET /api/analytics/skills
GET /api/analytics/performance/timeseries?range=30d
GET /api/analytics/performance/subjects?range=30d
POST /api/analytics/export (CSV export)
```

### Real-Time Events
```
analytics:update - Real-time performance metrics
analytics:performance - Performance trend updates
analytics:progress - Skill mastery changes
session:state - Current session status
coaching:message - Real-time coaching insights
```

## Usage Examples

### Basic Dashboard Integration
```tsx
import { MainDashboard } from '@/components/analytics/dashboard/main-dashboard';

export default function AnalyticsPage() {
  return <MainDashboard />;
}
```

### Real-Time Performance Monitoring
```tsx
import { LivePerformanceMeter } from '@/components/analytics/real-time/live-performance-meter';

<LivePerformanceMeter 
  currentScore={85}
  targetScore={90}
  isLive={true}
/>
```

### AI Insights Panel
```tsx
import { AIInsightsPanel } from '@/components/analytics/insights/ai-insights-panel';

<AIInsightsPanel 
  skillMastery={skillMasteryData}
  recentPerformance={recentPerformanceScore}
/>
```

## Accessibility Features

- **WCAG 2.1 Compliance**: Full accessibility support
- **Keyboard Navigation**: Complete keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **High Contrast Mode**: Support for visual accessibility needs
- **Responsive Design**: Mobile-first responsive layouts

## Performance Optimizations

- **Data Virtualization**: Efficient rendering of large datasets
- **Memoization**: React.memo and useMemo for expensive calculations
- **Lazy Loading**: Components loaded on demand
- **WebSocket Throttling**: Intelligent update frequency management
- **Caching Strategy**: Smart caching of analytics data

## Future Enhancements

### Planned Features
- **Peer Comparison**: Anonymous benchmarking against other students
- **Learning Style Detection**: AI-powered learning preference identification
- **Goal Setting Assistant**: AI-guided goal creation and tracking
- **Export Capabilities**: PDF reports and data export options
- **Mobile App**: Native mobile analytics dashboard

### Advanced Analytics
- **Cohort Analysis**: Group performance tracking
- **A/B Testing**: Feature effectiveness measurement
- **Predictive Interventions**: Proactive learning support
- **Cross-Platform Analytics**: Multi-device learning tracking

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install recharts @radix-ui/react-tooltip
   ```

2. **Import Analytics Dashboard**:
   ```tsx
   import { MainDashboard } from '@/components/analytics/dashboard/main-dashboard';
   ```

3. **Set Up Real-Time Connection**:
   ```tsx
   const { analytics } = useRealTimeAnalytics();
   ```

4. **Navigate to Analytics**:
   Visit `/dashboard/analytics` to access the full dashboard

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3001
ANALYTICS_UPDATE_INTERVAL=5000
AI_INSIGHTS_REFRESH_RATE=300000
```

### Dashboard Settings
```typescript
const DASHBOARD_CONFIG = {
  refreshInterval: 5000,
  maxDataPoints: 100,
  chartAnimationDuration: 1000,
  realTimeThreshold: 10000
};
```

## Support

For questions about the analytics dashboard or to report issues:

1. Check the component documentation in each file
2. Review the API endpoint documentation
3. Test with mock data using the development endpoints
4. Verify WebSocket connection status in the dashboard

The analytics dashboard represents the cutting edge of educational technology, providing students and educators with unprecedented insights into the learning process. It transforms raw data into actionable intelligence that drives learning success.
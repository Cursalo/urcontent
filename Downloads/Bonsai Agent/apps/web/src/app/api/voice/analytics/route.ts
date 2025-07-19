/**
 * Voice Analytics API Route
 * Handles voice session analytics and performance tracking
 */

import { NextRequest, NextResponse } from 'next/server';

interface VoiceAnalyticsData {
  sessionId: string;
  userId: string;
  analytics: {
    totalCommands: number;
    successfulCommands: number;
    averageResponseTime: number;
    stressLevel: number;
    confidenceLevel: number;
    engagementScore: number;
    voicePatterns: {
      speakingRate: number;
      pauseFrequency: number;
      tonalVariation: number;
      emotionalState: string;
    };
  };
  performance: {
    totalCommands: number;
    successfulCommands: number;
    averageResponseTime: number;
    sessionStartTime: number;
    lastActivityTime: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const analyticsData: VoiceAnalyticsData = await request.json();
    
    // Store analytics data (in a real implementation, this would go to a database)
    await storeVoiceAnalytics(analyticsData);
    
    // Generate insights based on the analytics
    const insights = generateAnalyticsInsights(analyticsData);
    
    return NextResponse.json({
      success: true,
      insights,
      recommendations: generateRecommendations(analyticsData)
    });

  } catch (error) {
    console.error('Voice analytics processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process voice analytics' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    const timeRange = searchParams.get('timeRange') || '24h';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Retrieve analytics data (in a real implementation, this would come from a database)
    const analyticsData = await retrieveVoiceAnalytics(userId, sessionId || undefined, timeRange);
    
    return NextResponse.json({
      success: true,
      data: analyticsData,
      summary: generateAnalyticsSummary(analyticsData)
    });

  } catch (error) {
    console.error('Voice analytics retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve voice analytics' },
      { status: 500 }
    );
  }
}

async function storeVoiceAnalytics(analyticsData: VoiceAnalyticsData) {
  // In a real implementation, this would store data in a database
  // For now, we'll just log it
  console.log('Storing voice analytics:', {
    sessionId: analyticsData.sessionId,
    userId: analyticsData.userId,
    timestamp: new Date().toISOString(),
    summary: {
      totalCommands: analyticsData.analytics.totalCommands,
      successRate: analyticsData.analytics.successfulCommands / analyticsData.analytics.totalCommands,
      engagementScore: analyticsData.analytics.engagementScore,
      stressLevel: analyticsData.analytics.stressLevel,
      confidenceLevel: analyticsData.analytics.confidenceLevel
    }
  });

  // Store in analytics database
  // await database.voiceAnalytics.create(analyticsData);
}

async function retrieveVoiceAnalytics(userId: string, sessionId?: string, timeRange: string = '24h') {
  // In a real implementation, this would query a database
  // For now, return mock data
  return {
    sessions: [
      {
        sessionId: sessionId || 'mock-session-1',
        userId,
        startTime: Date.now() - 3600000, // 1 hour ago
        duration: 3600000, // 1 hour
        analytics: {
          totalCommands: 25,
          successfulCommands: 23,
          averageResponseTime: 850,
          stressLevel: 0.3,
          confidenceLevel: 0.7,
          engagementScore: 0.8,
          voicePatterns: {
            speakingRate: 0.6,
            pauseFrequency: 0.4,
            tonalVariation: 0.3,
            emotionalState: 'confident'
          }
        }
      }
    ],
    trends: {
      engagementTrend: 'increasing',
      stressTrend: 'decreasing',
      confidenceTrend: 'stable',
      improvementAreas: ['response_time', 'command_clarity']
    }
  };
}

function generateAnalyticsInsights(analyticsData: VoiceAnalyticsData) {
  const { analytics, performance } = analyticsData;
  const insights = [];

  // Success rate insights
  const successRate = analytics.successfulCommands / analytics.totalCommands;
  if (successRate > 0.9) {
    insights.push({
      type: 'positive',
      category: 'interaction',
      message: 'Excellent voice interaction success rate! You\'re communicating very clearly with the assistant.',
      score: successRate
    });
  } else if (successRate < 0.7) {
    insights.push({
      type: 'improvement',
      category: 'interaction',
      message: 'Voice recognition could be improved. Try speaking more clearly or adjusting your microphone.',
      score: successRate
    });
  }

  // Engagement insights
  if (analytics.engagementScore > 0.8) {
    insights.push({
      type: 'positive',
      category: 'engagement',
      message: 'High engagement level detected! You\'re actively using the voice assistant effectively.',
      score: analytics.engagementScore
    });
  } else if (analytics.engagementScore < 0.4) {
    insights.push({
      type: 'concern',
      category: 'engagement',
      message: 'Low engagement detected. The voice assistant has more features that could help you.',
      score: analytics.engagementScore
    });
  }

  // Stress level insights
  if (analytics.stressLevel > 0.7) {
    insights.push({
      type: 'concern',
      category: 'wellbeing',
      message: 'High stress levels detected. Consider taking a break or asking for encouragement.',
      score: analytics.stressLevel
    });
  } else if (analytics.stressLevel < 0.3) {
    insights.push({
      type: 'positive',
      category: 'wellbeing',
      message: 'You\'re maintaining good composure. Keep up the steady pace!',
      score: analytics.stressLevel
    });
  }

  // Confidence insights
  if (analytics.confidenceLevel > 0.8) {
    insights.push({
      type: 'positive',
      category: 'confidence',
      message: 'Strong confidence levels! You\'re approaching problems with assurance.',
      score: analytics.confidenceLevel
    });
  } else if (analytics.confidenceLevel < 0.4) {
    insights.push({
      type: 'improvement',
      category: 'confidence',
      message: 'Consider asking for more explanations to build confidence in challenging areas.',
      score: analytics.confidenceLevel
    });
  }

  // Response time insights
  if (performance.averageResponseTime > 2000) {
    insights.push({
      type: 'technical',
      category: 'performance',
      message: 'Voice response times are slower than optimal. Check your internet connection.',
      score: performance.averageResponseTime
    });
  }

  // Emotional state insights
  const emotionalState = analytics.voicePatterns.emotionalState;
  switch (emotionalState) {
    case 'frustrated':
      insights.push({
        type: 'concern',
        category: 'emotional',
        message: 'Frustration detected in voice patterns. Consider taking a break or asking for help.',
        score: 0.8
      });
      break;
    case 'confident':
      insights.push({
        type: 'positive',
        category: 'emotional',
        message: 'Confident tone detected. You\'re in a great mindset for learning!',
        score: 0.9
      });
      break;
    case 'stressed':
      insights.push({
        type: 'improvement',
        category: 'emotional',
        message: 'Some stress detected. Deep breathing and positive self-talk can help.',
        score: 0.6
      });
      break;
  }

  return insights;
}

function generateRecommendations(analyticsData: VoiceAnalyticsData) {
  const { analytics } = analyticsData;
  const recommendations = [];

  // Based on stress level
  if (analytics.stressLevel > 0.6) {
    recommendations.push({
      category: 'stress_management',
      priority: 'high',
      action: 'Take a 5-minute break',
      reason: 'High stress levels can impact performance',
      benefit: 'Improved focus and reduced anxiety'
    });
  }

  // Based on confidence level
  if (analytics.confidenceLevel < 0.5) {
    recommendations.push({
      category: 'confidence_building',
      priority: 'medium',
      action: 'Ask for more detailed explanations',
      reason: 'Understanding concepts better builds confidence',
      benefit: 'Increased certainty in problem-solving'
    });
  }

  // Based on engagement score
  if (analytics.engagementScore < 0.6) {
    recommendations.push({
      category: 'engagement',
      priority: 'medium',
      action: 'Try using more voice commands',
      reason: 'Higher engagement correlates with better learning outcomes',
      benefit: 'More interactive and effective study sessions'
    });
  }

  // Based on success rate
  const successRate = analytics.successfulCommands / analytics.totalCommands;
  if (successRate < 0.8) {
    recommendations.push({
      category: 'technical',
      priority: 'medium',
      action: 'Speak more clearly or adjust microphone settings',
      reason: 'Poor recognition affects interaction quality',
      benefit: 'More reliable voice assistant responses'
    });
  }

  // Based on voice patterns
  if (analytics.voicePatterns.speakingRate > 0.8) {
    recommendations.push({
      category: 'communication',
      priority: 'low',
      action: 'Try speaking a bit slower',
      reason: 'Very fast speech can reduce recognition accuracy',
      benefit: 'Better voice command understanding'
    });
  }

  return recommendations;
}

function generateAnalyticsSummary(analyticsData: any) {
  if (!analyticsData.sessions || analyticsData.sessions.length === 0) {
    return {
      totalSessions: 0,
      averageEngagement: 0,
      averageStressLevel: 0,
      averageConfidenceLevel: 0,
      trends: []
    };
  }

  const sessions = analyticsData.sessions;
  const totalSessions = sessions.length;
  
  const averageEngagement = sessions.reduce((sum: number, session: any) => 
    sum + session.analytics.engagementScore, 0) / totalSessions;
  
  const averageStressLevel = sessions.reduce((sum: number, session: any) => 
    sum + session.analytics.stressLevel, 0) / totalSessions;
  
  const averageConfidenceLevel = sessions.reduce((sum: number, session: any) => 
    sum + session.analytics.confidenceLevel, 0) / totalSessions;

  return {
    totalSessions,
    averageEngagement: Math.round(averageEngagement * 100) / 100,
    averageStressLevel: Math.round(averageStressLevel * 100) / 100,
    averageConfidenceLevel: Math.round(averageConfidenceLevel * 100) / 100,
    trends: analyticsData.trends || []
  };
}
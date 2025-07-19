import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 300));

  // Generate mock skill mastery data
  const mockSkills = [
    {
      skill: 'Algebra',
      mastery: 85,
      confidence: 0.92,
      trend: 'up' as const,
      lastUpdated: Date.now() - 3600000
    },
    {
      skill: 'Geometry',
      mastery: 72,
      confidence: 0.78,
      trend: 'up' as const,
      lastUpdated: Date.now() - 1800000
    },
    {
      skill: 'Reading Comprehension',
      mastery: 88,
      confidence: 0.95,
      trend: 'up' as const,
      lastUpdated: Date.now() - 1200000
    },
    {
      skill: 'Grammar',
      mastery: 82,
      confidence: 0.89,
      trend: 'up' as const,
      lastUpdated: Date.now() - 900000
    },
    {
      skill: 'Essay Writing',
      mastery: 65,
      confidence: 0.73,
      trend: 'down' as const,
      lastUpdated: Date.now() - 5400000
    },
    {
      skill: 'Vocabulary',
      mastery: 75,
      confidence: 0.82,
      trend: 'up' as const,
      lastUpdated: Date.now() - 3600000
    }
  ];

  return NextResponse.json(mockSkills);
}
/**
 * Voice Command Processing API Route
 * Processes voice commands and generates appropriate responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface VoiceCommandRequest {
  intent: string;
  context: {
    testType: 'practice' | 'mock' | 'real';
    currentSection: string;
    questionNumber: number;
    timeRemaining: number;
    skillAreas: string[];
    difficulty: string;
    personalizedProfile: any;
  };
  parameters: Record<string, any>;
  studentProfile: any;
}

export async function POST(request: NextRequest) {
  try {
    const body: VoiceCommandRequest = await request.json();
    const { intent, context, parameters, studentProfile } = body;

    // Process different types of voice commands
    let response: any = {};

    switch (intent) {
      case 'hint':
        response = await generateHint(context, parameters, studentProfile);
        break;
      
      case 'explanation':
        response = await generateExplanation(context, parameters, studentProfile);
        break;
      
      case 'strategy':
        response = await generateStrategy(context, parameters, studentProfile);
        break;
      
      case 'encouragement':
        response = await generateEncouragement(context, studentProfile);
        break;
      
      case 'confusion':
        response = await handleConfusion(context, parameters, studentProfile);
        break;
      
      default:
        response = await generateFallbackResponse(intent, context);
    }

    return NextResponse.json({
      success: true,
      ...response
    });

  } catch (error) {
    console.error('Voice command processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process voice command' },
      { status: 500 }
    );
  }
}

async function generateHint(context: any, parameters: any, studentProfile: any) {
  const prompt = `
You are Bonsai, an AI SAT tutor providing voice assistance. Generate a helpful hint for a student.

Context:
- Test type: ${context.testType}
- Section: ${context.currentSection}
- Question number: ${context.questionNumber}
- Difficulty: ${context.difficulty}
- Time remaining: ${Math.floor(context.timeRemaining / 60)} minutes
- Skill areas: ${context.skillAreas.join(', ')}

Student Profile:
- Learning style: ${studentProfile.learningStyle}
- Weak areas: ${studentProfile.weakAreas.join(', ')}
- Strong areas: ${studentProfile.strongAreas.join(', ')}
- Preferred hint style: ${studentProfile.preferredHintStyle}

Parameters:
- Hint type: ${parameters.type || 'general'}
- Skill area: ${parameters.skillArea || 'general'}

Generate a concise, encouraging hint (2-3 sentences) that helps the student approach the problem without giving away the answer. Adapt your language and approach to their learning style and preferences.

Focus on:
1. Breaking down the problem approach
2. Identifying key information
3. Suggesting a strategic method
4. Building confidence

The hint should be spoken aloud, so use conversational language and avoid complex formatting.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are Bonsai, a supportive AI SAT tutor. Provide clear, encouraging hints that guide without revealing answers."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    const hint = completion.choices[0]?.message?.content || 
      "Try breaking this problem into smaller steps. What information do you have, and what do you need to find?";

    return {
      hint,
      strategy: getStrategyForSkillArea(parameters.skillArea || context.skillAreas[0]),
      followUp: generateFollowUpQuestions(context, parameters)
    };

  } catch (error) {
    console.error('Error generating hint:', error);
    return {
      hint: "Let's approach this step by step. What's the main concept being tested here?",
      strategy: "systematic_approach"
    };
  }
}

async function generateExplanation(context: any, parameters: any, studentProfile: any) {
  const depth = parameters.depth || 'medium';
  
  const prompt = `
You are Bonsai, an AI SAT tutor providing voice explanations. Explain a concept clearly for audio delivery.

Context:
- Test type: ${context.testType}
- Section: ${context.currentSection}
- Question number: ${context.questionNumber}
- Difficulty: ${context.difficulty}
- Skill areas: ${context.skillAreas.join(', ')}

Student Profile:
- Learning style: ${studentProfile.learningStyle}
- Explanation depth requested: ${depth}

Generate a clear explanation (3-4 sentences) suitable for voice delivery. Adapt to the student's learning style:
- Visual learners: Use spatial and descriptive language
- Auditory learners: Use rhythm and verbal patterns
- Kinesthetic learners: Use action-oriented language
- Mixed learners: Combine approaches

Make it conversational and easy to follow when spoken aloud.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are Bonsai, an expert SAT tutor. Provide clear, educational explanations adapted to different learning styles."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.6
    });

    const explanation = completion.choices[0]?.message?.content || 
      "This concept builds on fundamental principles. Let me break it down into key components that connect together.";

    return {
      explanation,
      examples: generateExamples(context.skillAreas[0]),
      nextSteps: getNextSteps(context, depth)
    };

  } catch (error) {
    console.error('Error generating explanation:', error);
    return {
      explanation: "This concept involves understanding the relationship between different elements. Let's focus on the core principle first."
    };
  }
}

async function generateStrategy(context: any, parameters: any, studentProfile: any) {
  const strategies = {
    'algebra': [
      "For algebra problems, start by identifying what you're solving for, then work backwards from what you know.",
      "Use substitution or elimination methods systematically. Don't try to solve everything at once.",
      "Look for patterns in the equations that might simplify your work."
    ],
    'geometry': [
      "Draw diagrams or visualize the shapes. Geometry is much easier when you can see the relationships.",
      "Identify what geometric principles apply - are you working with triangles, circles, or coordinate geometry?",
      "Use the given information to find intermediate values that lead to your answer."
    ],
    'reading': [
      "Read the question first, then scan the passage for relevant information.",
      "Look for context clues and transition words that signal the author's intent.",
      "Eliminate answer choices that are too extreme or not supported by the text."
    ],
    'writing': [
      "Read the sentence aloud in your head to catch awkward phrasing.",
      "Look for common error patterns: subject-verb agreement, pronoun consistency, and parallel structure.",
      "Choose the most concise option that maintains the original meaning."
    ]
  };

  const skillArea = context.skillAreas[0] || 'general';
  const strategyList = strategies[skillArea as keyof typeof strategies] || [
    "Break the problem into smaller, manageable parts.",
    "Use process of elimination to narrow down your choices.",
    "Double-check your work if time permits."
  ];

  const randomStrategy = strategyList[Math.floor(Math.random() * strategyList.length)];

  return {
    strategy: randomStrategy,
    technique: getSpecificTechnique(skillArea, parameters.type),
    timeManagement: getTimeManagementTip(context.timeRemaining, context.difficulty)
  };
}

async function generateEncouragement(context: any, studentProfile: any) {
  const encouragements = [
    "You're doing great! Every question is a chance to show what you know.",
    "Remember, you've prepared for this. Trust your knowledge and instincts.",
    "Take a deep breath. You have the skills to work through this challenge.",
    "Progress, not perfection. Each step forward is an achievement.",
    "You're stronger than any single question. Keep your confidence up!",
    "This is just one moment in your journey. You're capable of amazing things.",
    "Every expert was once a beginner. You're growing with each problem you tackle."
  ];

  const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];

  return {
    message: randomEncouragement,
    tip: "Remember to breathe deeply and stay focused. You've got this!",
    reminder: getPersonalizedReminder(studentProfile)
  };
}

async function handleConfusion(context: any, parameters: any, studentProfile: any) {
  const level = parameters.level || 'medium';
  
  const responses = {
    high: "I understand this feels overwhelming. Let's break it down into the smallest possible steps. What's one thing you do recognize about this problem?",
    medium: "Confusion is totally normal - it means you're learning! Let's approach this from a different angle.",
    low: "No worries at all. Sometimes we just need to see things from a fresh perspective."
  };

  return {
    message: responses[level as keyof typeof responses],
    suggestion: "Let's try a different approach that might click better for you.",
    support: "Remember, struggling with difficult concepts is part of the learning process."
  };
}

async function generateFallbackResponse(intent: string, context: any) {
  return {
    message: "I'm here to help you succeed. You can ask for hints, explanations, strategies, or just let me know if you're feeling stuck.",
    suggestion: "Try asking: 'Give me a hint', 'Explain this concept', or 'What strategy should I use?'",
    context: `We're working on ${context.currentSection} questions right now.`
  };
}

// Helper functions

function getStrategyForSkillArea(skillArea: string): string {
  const strategies: Record<string, string> = {
    algebra: 'systematic_substitution',
    geometry: 'visual_analysis',
    reading: 'context_scanning',
    writing: 'error_pattern_recognition',
    default: 'process_elimination'
  };
  
  return strategies[skillArea] || strategies.default;
}

function generateFollowUpQuestions(context: any, parameters: any): string[] {
  return [
    "What information does the problem give you?",
    "What are you trying to find?",
    "Have you seen a similar problem before?"
  ];
}

function generateExamples(skillArea: string): string[] {
  const examples: Record<string, string[]> = {
    algebra: ["Think of this like balancing a scale", "Each operation you do to one side, do to the other"],
    geometry: ["Imagine folding a piece of paper", "Picture the shape in 3D space"],
    reading: ["This is like detective work - look for clues", "The answer is hidden in the passage"],
    default: ["Break it into steps", "Work systematically"]
  };
  
  return examples[skillArea] || examples.default;
}

function getNextSteps(context: any, depth: string): string[] {
  if (depth === 'detailed') {
    return [
      "Practice similar problems",
      "Review the underlying concept",
      "Apply this to the current question"
    ];
  }
  return ["Apply this understanding to solve the problem"];
}

function getSpecificTechnique(skillArea: string, type: string): string {
  const techniques: Record<string, Record<string, string>> = {
    algebra: {
      equation: "Isolate the variable step by step",
      system: "Use substitution or elimination",
      default: "Simplify before solving"
    },
    geometry: {
      area: "Identify the shape and use the appropriate formula",
      angle: "Look for angle relationships and use geometric principles",
      default: "Draw or visualize the problem"
    }
  };
  
  return techniques[skillArea]?.[type] || techniques[skillArea]?.default || "Use systematic problem-solving";
}

function getTimeManagementTip(timeRemaining: number, difficulty: string): string {
  if (timeRemaining < 300) { // Less than 5 minutes
    return "With limited time, use process of elimination quickly and make your best educated guess.";
  } else if (difficulty === 'hard') {
    return "For challenging questions, don't spend more than 2-3 minutes. Move on if you're stuck.";
  }
  return "Take your time to work through this systematically.";
}

function getPersonalizedReminder(studentProfile: any): string {
  const reminders: Record<string, string> = {
    visual: "Try sketching or visualizing the problem",
    auditory: "Talk through the steps out loud",
    kinesthetic: "Use your hands to work through the problem",
    mixed: "Use whatever method feels most natural"
  };
  
  return reminders[studentProfile.learningStyle] || reminders.mixed;
}
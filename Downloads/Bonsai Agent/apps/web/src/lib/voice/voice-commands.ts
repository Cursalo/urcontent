/**
 * Natural Language Voice Command Processing
 * Intelligent interpretation of voice commands for SAT prep assistance
 */

import { VoiceCommand, VoiceIntent, VoiceCommandConfig, SessionContext } from './voice-types';

interface CommandPattern {
  pattern: RegExp;
  intent: VoiceIntent;
  confidence: number;
  extractParams: (match: RegExpMatchArray) => Record<string, any>;
}

interface IntentClassification {
  intent: VoiceIntent;
  confidence: number;
  parameters: Record<string, any>;
  alternatives: Array<{
    intent: VoiceIntent;
    confidence: number;
  }>;
}

export class VoiceCommandProcessor {
  private commandPatterns: CommandPattern[] = [];
  private intentClassifier: Map<string, VoiceIntent> = new Map();
  private contextHistory: VoiceCommand[] = [];
  private sessionContext: SessionContext | null = null;

  constructor() {
    this.initializeCommandPatterns();
    this.initializeIntentClassifier();
  }

  private initializeCommandPatterns(): void {
    this.commandPatterns = [
      // Hint requests
      {
        pattern: /(?:give me|need|want|can you give me) (?:a )?hint/i,
        intent: 'request_hint',
        confidence: 0.9,
        extractParams: () => ({ type: 'general' })
      },
      {
        pattern: /(?:hint|help) (?:for|with|about) (?:this )?(?:question|problem)/i,
        intent: 'request_hint',
        confidence: 0.85,
        extractParams: () => ({ type: 'question_specific' })
      },
      {
        pattern: /(?:what|how) (?:should|do) i (?:approach|solve|do) (?:this|here)?/i,
        intent: 'request_hint',
        confidence: 0.8,
        extractParams: () => ({ type: 'approach' })
      },

      // Explanation requests
      {
        pattern: /explain (?:this|that|how|why|what)/i,
        intent: 'request_explanation',
        confidence: 0.9,
        extractParams: () => ({ depth: 'detailed' })
      },
      {
        pattern: /(?:i don't|don't) understand (?:this|how|why|what)?/i,
        intent: 'request_explanation',
        confidence: 0.85,
        extractParams: () => ({ depth: 'basic' })
      },
      {
        pattern: /(?:what does|what's) (?:this|that) mean/i,
        intent: 'request_explanation',
        confidence: 0.8,
        extractParams: () => ({ depth: 'definition' })
      },

      // Strategy requests
      {
        pattern: /(?:what|which) strategy (?:should|can) i use/i,
        intent: 'request_strategy',
        confidence: 0.9,
        extractParams: () => ({ type: 'general' })
      },
      {
        pattern: /(?:how to|best way to) (?:solve|approach|tackle) (?:this|these)/i,
        intent: 'request_strategy',
        confidence: 0.85,
        extractParams: () => ({ type: 'problem_solving' })
      },
      {
        pattern: /(?:what's the|show me the) (?:best|fastest|easiest) (?:way|method|approach)/i,
        intent: 'request_strategy',
        confidence: 0.8,
        extractParams: () => ({ type: 'optimal' })
      },

      // Time management
      {
        pattern: /(?:how much|what's the) time (?:left|remaining|do i have)/i,
        intent: 'check_time',
        confidence: 0.95,
        extractParams: () => ({})
      },
      {
        pattern: /(?:check|show) (?:the )?time/i,
        intent: 'check_time',
        confidence: 0.8,
        extractParams: () => ({})
      },

      // Question navigation
      {
        pattern: /skip (?:this )?(?:question|problem|one)/i,
        intent: 'skip_question',
        confidence: 0.9,
        extractParams: () => ({})
      },
      {
        pattern: /(?:move to|go to) (?:next|the next) (?:question|problem|one)/i,
        intent: 'skip_question',
        confidence: 0.85,
        extractParams: () => ({})
      },
      {
        pattern: /(?:i'll|let me) (?:skip|come back to) (?:this|that)/i,
        intent: 'skip_question',
        confidence: 0.8,
        extractParams: () => ({})
      },

      // Session control
      {
        pattern: /pause (?:the )?(?:test|session|practice)/i,
        intent: 'pause_session',
        confidence: 0.95,
        extractParams: () => ({})
      },
      {
        pattern: /(?:take a|i need a) break/i,
        intent: 'pause_session',
        confidence: 0.9,
        extractParams: () => ({ reason: 'break' })
      },
      {
        pattern: /resume (?:the )?(?:test|session|practice)/i,
        intent: 'resume_session',
        confidence: 0.95,
        extractParams: () => ({})
      },
      {
        pattern: /(?:continue|keep going|start again)/i,
        intent: 'resume_session',
        confidence: 0.8,
        extractParams: () => ({})
      },
      {
        pattern: /(?:end|finish|stop) (?:the )?(?:test|session|practice)/i,
        intent: 'end_session',
        confidence: 0.9,
        extractParams: () => ({})
      },

      // Confusion/difficulty reporting
      {
        pattern: /(?:i'm|this is) (?:confused|confusing|difficult|hard)/i,
        intent: 'report_confusion',
        confidence: 0.85,
        extractParams: (match) => ({ 
          level: match[0].includes('very') ? 'high' : 'medium' 
        })
      },
      {
        pattern: /(?:i don't know|don't understand|have no idea)/i,
        intent: 'report_confusion',
        confidence: 0.8,
        extractParams: () => ({ level: 'high' })
      },

      // Encouragement requests
      {
        pattern: /(?:i need|give me) (?:motivation|encouragement)/i,
        intent: 'request_encouragement',
        confidence: 0.9,
        extractParams: () => ({})
      },
      {
        pattern: /(?:this is|i'm) (?:hard|difficult|challenging)/i,
        intent: 'request_encouragement',
        confidence: 0.7,
        extractParams: () => ({})
      },

      // Progress checks
      {
        pattern: /(?:how am i|how's my|what's my) (?:progress|performance|score)/i,
        intent: 'check_progress',
        confidence: 0.9,
        extractParams: () => ({})
      },
      {
        pattern: /(?:show|check) (?:my )?(?:progress|stats|performance)/i,
        intent: 'check_progress',
        confidence: 0.85,
        extractParams: () => ({})
      },

      // Audio controls
      {
        pattern: /(?:repeat|say again|say that again)/i,
        intent: 'repeat_last',
        confidence: 0.9,
        extractParams: () => ({})
      },
      {
        pattern: /(?:slow down|speak slower|too fast)/i,
        intent: 'slow_down',
        confidence: 0.9,
        extractParams: () => ({})
      },
      {
        pattern: /(?:speed up|speak faster|too slow)/i,
        intent: 'speed_up',
        confidence: 0.9,
        extractParams: () => ({})
      },
      {
        pattern: /(?:volume up|louder|turn up)/i,
        intent: 'volume_control',
        confidence: 0.9,
        extractParams: () => ({ action: 'increase' })
      },
      {
        pattern: /(?:volume down|quieter|turn down)/i,
        intent: 'volume_control',
        confidence: 0.9,
        extractParams: () => ({ action: 'decrease' })
      },
      {
        pattern: /(?:mute|be quiet|shut up)/i,
        intent: 'mute',
        confidence: 0.95,
        extractParams: () => ({})
      },
      {
        pattern: /(?:unmute|speak|talk)/i,
        intent: 'unmute',
        confidence: 0.9,
        extractParams: () => ({})
      },

      // Help requests
      {
        pattern: /(?:help|what can you do|available commands)/i,
        intent: 'help',
        confidence: 0.8,
        extractParams: () => ({})
      }
    ];
  }

  private initializeIntentClassifier(): void {
    // Intent keywords for fuzzy matching
    const intentKeywords: Record<VoiceIntent, string[]> = {
      'request_hint': ['hint', 'clue', 'tip', 'suggestion', 'help', 'guidance'],
      'request_explanation': ['explain', 'why', 'how', 'what', 'understand', 'meaning'],
      'request_strategy': ['strategy', 'approach', 'method', 'way', 'technique', 'solve'],
      'check_time': ['time', 'clock', 'minutes', 'seconds', 'remaining', 'left'],
      'skip_question': ['skip', 'next', 'pass', 'move', 'later'],
      'pause_session': ['pause', 'break', 'stop', 'wait'],
      'resume_session': ['resume', 'continue', 'start', 'again'],
      'end_session': ['end', 'finish', 'done', 'quit', 'exit'],
      'report_confusion': ['confused', 'difficult', 'hard', 'lost', 'stuck'],
      'request_encouragement': ['motivation', 'encouragement', 'support', 'confidence'],
      'check_progress': ['progress', 'performance', 'score', 'stats', 'results'],
      'change_settings': ['settings', 'preferences', 'configuration', 'options'],
      'repeat_last': ['repeat', 'again', 'say again'],
      'slow_down': ['slow', 'slower', 'too fast'],
      'speed_up': ['fast', 'faster', 'speed up', 'too slow'],
      'volume_control': ['volume', 'loud', 'quiet', 'louder', 'quieter'],
      'mute': ['mute', 'silent', 'quiet', 'shut up'],
      'unmute': ['unmute', 'speak', 'talk'],
      'help': ['help', 'commands', 'what can you do'],
      'unknown': []
    };

    for (const [intent, keywords] of Object.entries(intentKeywords)) {
      keywords.forEach(keyword => {
        this.intentClassifier.set(keyword, intent as VoiceIntent);
      });
    }
  }

  public processCommand(transcript: string, confidence: number): VoiceCommand {
    const normalizedText = this.normalizeText(transcript);
    const classification = this.classifyIntent(normalizedText);
    
    // Apply context-aware adjustments
    const contextAdjustedClassification = this.applyContextualAdjustments(
      classification, 
      normalizedText
    );

    const command: VoiceCommand = {
      id: this.generateCommandId(),
      command: transcript,
      intent: contextAdjustedClassification.intent,
      confidence: Math.min(confidence * contextAdjustedClassification.confidence, 1.0),
      parameters: contextAdjustedClassification.parameters,
      timestamp: Date.now(),
      processed: false
    };

    // Add to context history
    this.contextHistory.push(command);
    if (this.contextHistory.length > 10) {
      this.contextHistory.shift();
    }

    return command;
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private classifyIntent(text: string): IntentClassification {
    // First, try pattern matching
    for (const pattern of this.commandPatterns) {
      const match = text.match(pattern.pattern);
      if (match) {
        return {
          intent: pattern.intent,
          confidence: pattern.confidence,
          parameters: pattern.extractParams(match),
          alternatives: []
        };
      }
    }

    // Fallback to keyword-based classification
    return this.classifyByKeywords(text);
  }

  private classifyByKeywords(text: string): IntentClassification {
    const words = text.split(' ');
    const intentScores: Record<VoiceIntent, number> = {} as any;

    // Initialize scores
    Object.values(this.intentClassifier).forEach(intent => {
      if (!intentScores[intent]) {
        intentScores[intent] = 0;
      }
    });

    // Score based on keyword matches
    words.forEach(word => {
      const intent = this.intentClassifier.get(word);
      if (intent) {
        intentScores[intent] += 1;
      }
    });

    // Find best match
    const sortedIntents = Object.entries(intentScores)
      .sort(([, a], [, b]) => b - a)
      .filter(([, score]) => score > 0);

    if (sortedIntents.length === 0) {
      return {
        intent: 'unknown',
        confidence: 0.1,
        parameters: {},
        alternatives: []
      };
    }

    const [bestIntent, bestScore] = sortedIntents[0];
    const confidence = Math.min(bestScore / words.length, 0.8);

    const alternatives = sortedIntents.slice(1, 3).map(([intent, score]) => ({
      intent: intent as VoiceIntent,
      confidence: Math.min(score / words.length, 0.8)
    }));

    return {
      intent: bestIntent as VoiceIntent,
      confidence,
      parameters: this.extractParametersFromText(text, bestIntent as VoiceIntent),
      alternatives
    };
  }

  private extractParametersFromText(text: string, intent: VoiceIntent): Record<string, any> {
    const params: Record<string, any> = {};

    switch (intent) {
      case 'request_hint':
        if (text.includes('strategy')) params.type = 'strategy';
        else if (text.includes('concept')) params.type = 'concept';
        else if (text.includes('calculation')) params.type = 'calculation';
        else params.type = 'general';
        break;

      case 'request_explanation':
        if (text.includes('simple') || text.includes('basic')) params.depth = 'basic';
        else if (text.includes('detailed') || text.includes('thorough')) params.depth = 'detailed';
        else params.depth = 'medium';
        break;

      case 'volume_control':
        if (text.includes('up') || text.includes('louder')) params.action = 'increase';
        else if (text.includes('down') || text.includes('quieter')) params.action = 'decrease';
        break;

      case 'report_confusion':
        if (text.includes('very') || text.includes('really')) params.level = 'high';
        else if (text.includes('little') || text.includes('slightly')) params.level = 'low';
        else params.level = 'medium';
        break;
    }

    return params;
  }

  private applyContextualAdjustments(
    classification: IntentClassification, 
    text: string
  ): IntentClassification {
    let adjustedConfidence = classification.confidence;
    let adjustedIntent = classification.intent;
    const adjustedParams = { ...classification.parameters };

    // Context from session
    if (this.sessionContext) {
      // If in practice mode, boost learning-related intents
      if (this.sessionContext.testType === 'practice') {
        if (['request_hint', 'request_explanation', 'request_strategy'].includes(classification.intent)) {
          adjustedConfidence += 0.1;
        }
      }

      // If time is running low, boost time-related intents
      if (this.sessionContext.timeRemaining < 300) { // 5 minutes
        if (classification.intent === 'check_time') {
          adjustedConfidence += 0.1;
        }
      }

      // Skill-specific adjustments
      if (this.sessionContext.skillAreas.includes('algebra') && text.includes('equation')) {
        if (classification.intent === 'request_hint') {
          adjustedParams.skillArea = 'algebra';
          adjustedConfidence += 0.05;
        }
      }
    }

    // Recent command context
    const recentCommands = this.contextHistory.slice(-3);
    
    // If user recently asked for hints, similar requests should have higher confidence
    if (recentCommands.some(cmd => cmd.intent === 'request_hint') && 
        classification.intent === 'request_hint') {
      adjustedConfidence += 0.05;
    }

    // If user is showing confusion patterns, boost encouragement detection
    const confusionCommands = recentCommands.filter(cmd => 
      cmd.intent === 'report_confusion' || 
      cmd.parameters.level === 'high'
    );
    
    if (confusionCommands.length >= 2 && text.includes('difficult')) {
      adjustedIntent = 'request_encouragement';
      adjustedConfidence = 0.8;
    }

    return {
      intent: adjustedIntent,
      confidence: Math.min(adjustedConfidence, 1.0),
      parameters: adjustedParams,
      alternatives: classification.alternatives
    };
  }

  public setSessionContext(context: SessionContext): void {
    this.sessionContext = context;
  }

  public getCommandHistory(): VoiceCommand[] {
    return [...this.contextHistory];
  }

  public clearHistory(): void {
    this.contextHistory = [];
  }

  public getSupportedIntents(): VoiceIntent[] {
    return Array.from(new Set(this.commandPatterns.map(p => p.intent)));
  }

  public getExampleCommands(intent: VoiceIntent): string[] {
    const examples: Record<VoiceIntent, string[]> = {
      'request_hint': [
        "Give me a hint",
        "I need help with this question",
        "What should I do here?",
        "Can you help me approach this?"
      ],
      'request_explanation': [
        "Explain this to me",
        "I don't understand this",
        "What does this mean?",
        "How does this work?"
      ],
      'request_strategy': [
        "What strategy should I use?",
        "What's the best way to solve this?",
        "How should I approach this problem?",
        "Show me the method"
      ],
      'check_time': [
        "How much time do I have left?",
        "Check the time",
        "What's the time remaining?"
      ],
      'skip_question': [
        "Skip this question",
        "Move to the next one",
        "I'll come back to this later"
      ],
      'pause_session': [
        "Pause the test",
        "Take a break",
        "Stop for now"
      ],
      'resume_session': [
        "Resume the test",
        "Continue",
        "Start again"
      ],
      'end_session': [
        "End the session",
        "Finish the test",
        "I'm done"
      ],
      'report_confusion': [
        "I'm confused",
        "This is difficult",
        "I don't know what to do"
      ],
      'request_encouragement': [
        "I need motivation",
        "Give me encouragement",
        "This is really hard"
      ],
      'check_progress': [
        "How am I doing?",
        "Show my progress",
        "What's my score?"
      ],
      'help': [
        "Help",
        "What can you do?",
        "Show me the commands"
      ],
      'repeat_last': ["Repeat that", "Say that again"],
      'slow_down': ["Slow down", "Speak slower"],
      'speed_up': ["Speed up", "Speak faster"],
      'volume_control': ["Volume up", "Turn it down"],
      'mute': ["Mute", "Be quiet"],
      'unmute': ["Unmute", "Speak"],
      'change_settings': ["Change settings", "Adjust preferences"],
      'unknown': []
    };

    return examples[intent] || [];
  }

  private generateCommandId(): string {
    return `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Advanced command processing
  public processMultiTurnCommand(commands: VoiceCommand[]): VoiceCommand {
    // Handle multi-turn conversations like:
    // User: "I need help"
    // Bot: "What kind of help?"
    // User: "With this math problem"
    
    if (commands.length < 2) {
      return commands[commands.length - 1];
    }

    const lastCommand = commands[commands.length - 1];
    const previousCommand = commands[commands.length - 2];

    // If previous was a clarification request
    if (previousCommand.intent === 'help' && 
        lastCommand.command.includes('math')) {
      return {
        ...lastCommand,
        intent: 'request_hint',
        parameters: { ...lastCommand.parameters, skillArea: 'math' },
        confidence: Math.min(lastCommand.confidence + 0.2, 1.0)
      };
    }

    return lastCommand;
  }

  public dispose(): void {
    this.contextHistory = [];
    this.sessionContext = null;
  }
}

// Export utility functions
export const createVoiceCommandProcessor = () => {
  return new VoiceCommandProcessor();
};

export const isValidIntent = (intent: string): intent is VoiceIntent => {
  const validIntents: VoiceIntent[] = [
    'request_hint', 'request_explanation', 'request_strategy', 'check_time',
    'skip_question', 'pause_session', 'resume_session', 'end_session',
    'report_confusion', 'request_encouragement', 'check_progress',
    'change_settings', 'repeat_last', 'slow_down', 'speed_up',
    'volume_control', 'mute', 'unmute', 'help', 'unknown'
  ];
  
  return validIntents.includes(intent as VoiceIntent);
};
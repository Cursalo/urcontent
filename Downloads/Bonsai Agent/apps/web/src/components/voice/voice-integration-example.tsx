"use client";

/**
 * Voice Integration Example
 * Demonstrates how to integrate voice assistant with SAT test interface
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { VoiceAssistantPanel } from './voice-assistant-panel';
import { useVoiceAssistant } from '@/hooks/voice/useVoiceAssistant';
import { useVoiceAnalytics } from '@/hooks/voice/useVoiceAnalytics';
import { SessionContext, StudentProfile } from '@/lib/voice/voice-types';

interface Question {
  id: string;
  question: string;
  choices: string[];
  correctAnswer: number;
  section: string;
  difficulty: 'easy' | 'medium' | 'hard';
  skillAreas: string[];
}

const sampleQuestions: Question[] = [
  {
    id: '1',
    question: 'If 3x + 7 = 22, what is the value of x?',
    choices: ['3', '5', '7', '15'],
    correctAnswer: 1,
    section: 'math',
    difficulty: 'easy',
    skillAreas: ['algebra']
  },
  {
    id: '2',
    question: 'In the passage, the author primarily argues that...',
    choices: [
      'Technology has improved education',
      'Traditional methods are outdated', 
      'Balance is needed between old and new approaches',
      'Students prefer digital learning'
    ],
    correctAnswer: 2,
    section: 'reading',
    difficulty: 'medium',
    skillAreas: ['reading_comprehension']
  }
];

export const VoiceIntegrationExample: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(3600); // 1 hour
  const [isTestStarted, setIsTestStarted] = useState(false);

  // Student profile for personalization
  const studentProfile: StudentProfile = {
    id: 'student_123',
    learningStyle: 'mixed',
    weakAreas: ['algebra', 'geometry'],
    strongAreas: ['reading_comprehension'],
    preferredHintStyle: 'guiding',
    voicePreferences: {
      language: 'en-US',
      accent: 'neutral',
      speed: 1.0,
      pitch: 1.0,
      volume: 0.8,
      wakeWordEnabled: true,
      wakeWord: 'hey bonsai',
      noiseReduction: true,
      voiceActivated: true,
      visualFeedback: true,
      hapticsEnabled: false,
      speechToTextProvider: 'browser',
      textToSpeechProvider: 'browser'
    }
  };

  // Voice assistant integration
  const {
    state: voiceState,
    session: voiceSession,
    startSession: startVoiceSession,
    stopSession: stopVoiceSession,
    isSupported: isVoiceSupported,
    isReady: isVoiceReady
  } = useVoiceAssistant({
    enabled: true,
    enableWakeWord: true,
    enableAdvancedProcessing: true,
    enableRealTimeCoaching: true,
    studentProfile,
    onCommandProcessed: (command, response) => {
      console.log('Voice command processed:', { command: command.command, response: response.text });
      
      // Handle specific commands that might affect the test interface
      if (command.intent === 'skip_question') {
        handleNextQuestion();
      } else if (command.intent === 'check_time') {
        // Time is automatically announced by voice assistant
      }
    },
    onError: (error) => {
      console.error('Voice assistant error:', error);
    }
  });

  // Voice analytics integration
  const {
    analytics,
    startTracking,
    stopTracking,
    recordCommand,
    recordResponse
  } = useVoiceAnalytics({
    enabled: true,
    onStressLevelChange: (level) => {
      if (level > 0.7) {
        console.log('High stress detected, consider suggesting a break');
      }
    },
    onConfidenceLevelChange: (level) => {
      if (level < 0.4) {
        console.log('Low confidence detected, consider providing encouragement');
      }
    }
  });

  // Current question
  const currentQuestion = sampleQuestions[currentQuestionIndex];

  // Session context for voice assistant
  const sessionContext: SessionContext = {
    testType: 'practice',
    currentSection: currentQuestion?.section || 'math',
    questionNumber: currentQuestionIndex + 1,
    timeRemaining,
    skillAreas: currentQuestion?.skillAreas || [],
    difficulty: currentQuestion?.difficulty || 'medium',
    personalizedProfile: studentProfile
  };

  // Timer countdown
  useEffect(() => {
    if (!isTestStarted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsTestStarted(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTestStarted, timeRemaining]);

  // Start test and voice session
  const handleStartTest = async () => {
    setIsTestStarted(true);
    
    if (isVoiceSupported && isVoiceReady) {
      try {
        await startVoiceSession(sessionContext);
        startTracking({
          id: `session_${Date.now()}`,
          userId: studentProfile.id,
          startTime: Date.now(),
          commands: [],
          responses: [],
          analytics: {
            totalCommands: 0,
            successfulCommands: 0,
            averageResponseTime: 0,
            stressLevel: 0,
            confidenceLevel: 0,
            engagementScore: 0,
            voicePatterns: {
              speakingRate: 0,
              pauseFrequency: 0,
              tonalVariation: 0,
              emotionalState: 'calm'
            }
          },
          context: sessionContext
        });
      } catch (error) {
        console.error('Failed to start voice session:', error);
      }
    }
  };

  // Stop test and voice session
  const handleStopTest = async () => {
    setIsTestStarted(false);
    
    if (voiceSession) {
      await stopVoiceSession();
      stopTracking();
    }
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < sampleQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      handleStopTest();
    }
  };

  // Navigate to previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(null);
    }
  };

  // Select answer
  const handleSelectAnswer = (index: number) => {
    setSelectedAnswer(index);
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isTestStarted) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card className="p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">SAT Practice Test with Voice Assistant</h1>
          <p className="text-muted-foreground mb-6">
            Experience hands-free test preparation with our advanced voice assistant. 
            Get hints, explanations, and strategies by simply speaking.
          </p>
          
          {isVoiceSupported ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-4">
                <Badge variant="default">Voice Assistant Ready</Badge>
                <Badge variant="secondary">Wake Word: "Hey Bonsai"</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">🎤 Voice Commands</h3>
                  <p className="text-sm text-muted-foreground">
                    "Give me a hint", "Explain this", "What strategy should I use?"
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">🧠 Smart Assistance</h3>
                  <p className="text-sm text-muted-foreground">
                    Contextual help based on question type and your learning style
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">📊 Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time stress and confidence monitoring
                  </p>
                </div>
              </div>
              
              <Button size="lg" onClick={handleStartTest} className="mt-6">
                Start Practice Test
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Badge variant="destructive">Voice Assistant Not Supported</Badge>
              <p className="text-sm text-muted-foreground">
                Please use Chrome, Safari, or Edge for voice features
              </p>
              <Button size="lg" onClick={handleStartTest}>
                Start Test (Without Voice)
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Test Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SAT Practice Test</h1>
          <p className="text-muted-foreground">
            Question {currentQuestionIndex + 1} of {sampleQuestions.length} • {currentQuestion?.section}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-mono">{formatTime(timeRemaining)}</div>
            <div className="text-xs text-muted-foreground">Time Remaining</div>
          </div>
          
          <Button variant="outline" onClick={handleStopTest}>
            End Test
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress 
        value={(currentQuestionIndex + 1) / sampleQuestions.length * 100} 
        className="w-full" 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Test Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Question */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{currentQuestion?.section}</Badge>
                <Badge variant="secondary">{currentQuestion?.difficulty}</Badge>
              </div>
              
              <h2 className="text-xl font-semibold">{currentQuestion?.question}</h2>
              
              {/* Answer Choices */}
              <div className="space-y-3">
                {currentQuestion?.choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectAnswer(index)}
                    className={`w-full p-4 text-left border rounded-lg transition-colors ${
                      selectedAnswer === index
                        ? 'border-primary bg-primary/5'
                        : 'border-input hover:bg-accent'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswer === index
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span>{choice}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            
            <div className="text-sm text-muted-foreground">
              Use voice commands: "Skip this question", "Give me a hint", "How much time left?"
            </div>
            
            <Button 
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === sampleQuestions.length - 1}
            >
              Next
            </Button>
          </div>
        </div>

        {/* Voice Assistant Panel */}
        <div className="space-y-6">
          <VoiceAssistantPanel
            sessionContext={sessionContext}
            studentProfile={studentProfile}
            onCommandProcessed={(command, response) => {
              console.log('Command processed:', command, response);
            }}
            onError={(error) => {
              console.error('Voice error:', error);
            }}
          />

          {/* Analytics Display */}
          {analytics && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Session Analytics</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Engagement:</span>
                  <Badge variant={analytics.engagementScore > 0.7 ? "default" : "secondary"}>
                    {Math.round(analytics.engagementScore * 100)}%
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Stress Level:</span>
                  <Badge variant={analytics.stressLevel > 0.6 ? "destructive" : "default"}>
                    {Math.round(analytics.stressLevel * 100)}%
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Confidence:</span>
                  <Badge variant={analytics.confidenceLevel > 0.6 ? "default" : "secondary"}>
                    {Math.round(analytics.confidenceLevel * 100)}%
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Commands:</span>
                  <span>{analytics.totalCommands}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Voice Status */}
          {voiceState && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Voice Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Listening:</span>
                  <Badge variant={voiceState.isListening ? "default" : "secondary"}>
                    {voiceState.isListening ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Wake Word:</span>
                  <Badge variant={voiceState.isWakeWordActive ? "default" : "secondary"}>
                    {voiceState.isWakeWordActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Processing:</span>
                  <Badge variant={voiceState.isProcessing ? "default" : "secondary"}>
                    {voiceState.isProcessing ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceIntegrationExample;
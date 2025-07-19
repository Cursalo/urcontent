"use client";

/**
 * Voice Assistant Panel Component
 * Main interface for voice assistant functionality
 */

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Settings, Play, Pause, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useVoiceAssistant } from '@/hooks/voice/useVoiceAssistant';
import { SessionContext, StudentProfile } from '@/lib/voice/voice-types';
import { VoiceStatusIndicator } from './voice-status-indicator';
import { VoiceCommandSuggestions } from './voice-command-suggestions';
import { VoiceSettingsPanel } from './voice-settings-panel';

interface VoiceAssistantPanelProps {
  sessionContext?: SessionContext;
  studentProfile?: StudentProfile;
  onCommandProcessed?: (command: string, response: string) => void;
  onError?: (error: string) => void;
  className?: string;
  compact?: boolean;
  floating?: boolean;
}

export const VoiceAssistantPanel: React.FC<VoiceAssistantPanelProps> = ({
  sessionContext,
  studentProfile,
  onCommandProcessed,
  onError,
  className = '',
  compact = false,
  floating = false
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [manualCommand, setManualCommand] = useState('');

  const {
    state,
    session,
    capabilities,
    settings,
    startSession,
    stopSession,
    pauseSession,
    resumeSession,
    startListening,
    stopListening,
    stopSpeaking,
    processCommand,
    updateSettings,
    isSupported,
    isReady,
    error
  } = useVoiceAssistant({
    enabled: true,
    enableWakeWord: true,
    enableAdvancedProcessing: true,
    enableRealTimeCoaching: true,
    studentProfile,
    onCommandProcessed: (command, response) => {
      onCommandProcessed?.(command.command, response.text);
    },
    onError: (voiceError) => {
      onError?.(voiceError.message);
    }
  });

  // Auto-start session when context is provided
  useEffect(() => {
    if (sessionContext && isReady && !session) {
      startSession(sessionContext).catch(console.error);
    }
  }, [sessionContext, isReady, session, startSession]);

  // Handle manual command submission
  const handleManualCommand = async () => {
    if (!manualCommand.trim()) return;

    try {
      await processCommand(manualCommand.trim());
      setManualCommand('');
    } catch (err) {
      console.error('Failed to process manual command:', err);
    }
  };

  // Handle voice control actions
  const handleStartListening = async () => {
    try {
      await startListening();
    } catch (err) {
      console.error('Failed to start listening:', err);
    }
  };

  const handleStopListening = async () => {
    try {
      await stopListening();
    } catch (err) {
      console.error('Failed to stop listening:', err);
    }
  };

  const handleToggleSession = async () => {
    if (!session) return;

    try {
      if (state.isPaused) {
        await resumeSession();
      } else {
        await pauseSession();
      }
    } catch (err) {
      console.error('Failed to toggle session:', err);
    }
  };

  const handleStopSession = async () => {
    try {
      await stopSession();
    } catch (err) {
      console.error('Failed to stop session:', err);
    }
  };

  if (!isSupported) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="text-center text-muted-foreground">
          <MicOff className="h-8 w-8 mx-auto mb-2" />
          <p>Voice features not supported in this browser</p>
          <p className="text-sm">Please use Chrome, Safari, or Edge for voice assistance</p>
        </div>
      </Card>
    );
  }

  if (!isReady) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Initializing voice assistant...</p>
        </div>
      </Card>
    );
  }

  const baseClasses = floating 
    ? 'fixed bottom-4 right-4 z-50 shadow-lg'
    : '';
  
  const cardClasses = `${baseClasses} ${className}`;

  return (
    <Card className={cardClasses}>
      <div className={`p-4 ${compact ? 'space-y-2' : 'space-y-4'}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <VoiceStatusIndicator 
              isListening={state.isListening}
              isSpeaking={state.isSpeaking}
              isProcessing={state.isProcessing}
              isWakeWordActive={state.isWakeWordActive}
              connectionStatus={state.connectionStatus}
            />
            <div>
              <h3 className={`font-semibold ${compact ? 'text-sm' : 'text-base'}`}>
                Voice Assistant
              </h3>
              {!compact && (
                <p className="text-xs text-muted-foreground">
                  {session ? 'Active session' : 'Ready to help'}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {/* Settings button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              title="Voice settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            {/* Stop session button */}
            {session && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStopSession}
                title="Stop session"
              >
                <Square className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Error display */}
        {(error || state.error) && (
          <div className="bg-destructive/10 text-destructive p-2 rounded text-sm">
            {error || state.error}
          </div>
        )}

        {/* Current activity */}
        {!compact && (
          <div className="space-y-2">
            {state.currentCommand && (
              <div className="bg-blue-50 dark:bg-blue-950 p-2 rounded text-sm">
                <span className="font-medium">Processing:</span> {state.currentCommand.command}
              </div>
            )}
            
            {state.currentResponse && (
              <div className="bg-green-50 dark:bg-green-950 p-2 rounded text-sm">
                <span className="font-medium">Response:</span> {state.currentResponse.text}
              </div>
            )}
          </div>
        )}

        {/* Main controls */}
        <div className="flex items-center justify-center space-x-2">
          {/* Microphone control */}
          <Button
            variant={state.isListening ? "destructive" : "default"}
            size={compact ? "sm" : "default"}
            onClick={state.isListening ? handleStopListening : handleStartListening}
            disabled={!session || state.isPaused}
            title={state.isListening ? "Stop listening" : "Start listening"}
          >
            {state.isListening ? (
              <MicOff className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
            ) : (
              <Mic className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
            )}
            {!compact && (
              <span className="ml-2">
                {state.isListening ? 'Stop' : 'Listen'}
              </span>
            )}
          </Button>
          

          {/* Session control */}
          {session && (
            <Button
              variant="outline"
              size={compact ? "sm" : "default"}
              onClick={handleToggleSession}
              title={state.isPaused ? "Resume session" : "Pause session"}
            >
              {state.isPaused ? (
                <Play className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
              ) : (
                <Pause className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
              )}
              {!compact && (
                <span className="ml-2">
                  {state.isPaused ? 'Resume' : 'Pause'}
                </span>
              )}
            </Button>
          )}

          {/* Speaker control */}
          <Button
            variant={state.isSpeaking ? "destructive" : "outline"}
            size={compact ? "sm" : "default"}
            onClick={state.isSpeaking ? stopSpeaking : undefined}
            title={state.isSpeaking ? "Stop speaking" : `Volume: ${Math.round(settings.volume * 100)}%`}
          >
            {settings.volume === 0 ? (
              <VolumeX className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
            ) : (
              <Volume2 className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
            )}
          </Button>
        </div>

        {/* Manual command input */}
        {!compact && (
          <div className="space-y-2">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type a command or question..."
                value={manualCommand}
                onChange={(e) => setManualCommand(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualCommand()}
                className="flex-1 px-3 py-2 border border-input rounded-md text-sm"
                disabled={!session}
              />
              <Button
                size="sm"
                onClick={handleManualCommand}
                disabled={!manualCommand.trim() || !session}
              >
                Send
              </Button>
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {state.isWakeWordActive ? 'Say "Hey Bonsai" to activate' : 'Click microphone to start listening'}
              </span>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={() => setShowSuggestions(!showSuggestions)}
              >
                {showSuggestions ? 'Hide' : 'Show'} suggestions
              </Button>
            </div>
          </div>
        )}

        {/* Command suggestions */}
        {showSuggestions && !compact && (
          <VoiceCommandSuggestions
            context={sessionContext}
            onSuggestionClick={(suggestion) => {
              setManualCommand(suggestion);
              setShowSuggestions(false);
            }}
          />
        )}

        {/* Session stats */}
        {session && !compact && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="text-center">
              <div className="text-lg font-semibold">{session.commands.length}</div>
              <div className="text-xs text-muted-foreground">Commands</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{session.responses.length}</div>
              <div className="text-xs text-muted-foreground">Responses</div>
            </div>
          </div>
        )}

        {/* Capabilities badges */}
        {!compact && (
          <div className="flex flex-wrap gap-1">
            {capabilities.speechRecognition && (
              <Badge variant="secondary" className="text-xs">Speech Recognition</Badge>
            )}
            {capabilities.textToSpeech && (
              <Badge variant="secondary" className="text-xs">Text-to-Speech</Badge>
            )}
            {capabilities.wakeWordDetection && (
              <Badge variant="secondary" className="text-xs">Wake Word</Badge>
            )}
            {capabilities.backgroundProcessing && (
              <Badge variant="secondary" className="text-xs">Live Coaching</Badge>
            )}
          </div>
        )}
      </div>

      {/* Settings panel */}
      {showSettings && (
        <VoiceSettingsPanel
          settings={settings}
          capabilities={capabilities}
          onChange={updateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </Card>
  );
};

export default VoiceAssistantPanel;
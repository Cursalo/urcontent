"use client";

/**
 * Voice Status Indicator Component
 * Visual feedback for voice assistant state
 */

import React from 'react';
import { Mic, MicOff, Volume2, Brain, Wifi, WifiOff, Ear } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';

interface VoiceStatusIndicatorProps {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  isWakeWordActive: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const VoiceStatusIndicator: React.FC<VoiceStatusIndicatorProps> = ({
  isListening,
  isSpeaking,
  isProcessing,
  isWakeWordActive,
  connectionStatus,
  showLabels = false,
  size = 'md',
  className = ''
}) => {
  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }[size];

  const badgeSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }[size];

  // Determine primary status
  const getPrimaryStatus = () => {
    if (isProcessing) {
      return {
        icon: Brain,
        color: 'bg-blue-500',
        pulse: true,
        label: 'Processing',
        tooltip: 'AI is processing your request'
      };
    }
    
    if (isSpeaking) {
      return {
        icon: Volume2,
        color: 'bg-green-500',
        pulse: true,
        label: 'Speaking',
        tooltip: 'AI is speaking a response'
      };
    }
    
    if (isListening) {
      return {
        icon: Mic,
        color: 'bg-red-500',
        pulse: true,
        label: 'Listening',
        tooltip: 'Actively listening for voice commands'
      };
    }
    
    if (isWakeWordActive) {
      return {
        icon: Ear,
        color: 'bg-yellow-500',
        pulse: false,
        label: 'Wake Word',
        tooltip: 'Listening for "Hey Bonsai"'
      };
    }

    return {
      icon: MicOff,
      color: 'bg-gray-400',
      pulse: false,
      label: 'Inactive',
      tooltip: 'Voice assistant is inactive'
    };
  };

  // Get connection status
  const getConnectionStatus = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: Wifi,
          color: 'text-green-500',
          tooltip: 'Connected to voice services'
        };
      case 'reconnecting':
        return {
          icon: Wifi,
          color: 'text-yellow-500',
          tooltip: 'Reconnecting to voice services'
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          color: 'text-red-500',
          tooltip: 'Disconnected from voice services'
        };
    }
  };

  const primaryStatus = getPrimaryStatus();
  const connectionInfo = getConnectionStatus();
  const PrimaryIcon = primaryStatus.icon;
  const ConnectionIcon = connectionInfo.icon;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Primary status indicator */}
      <div className="relative">
        <Tooltip content={primaryStatus.tooltip}>
          <div className={`
            rounded-full p-2 flex items-center justify-center
            ${primaryStatus.color}
            ${primaryStatus.pulse ? 'animate-pulse' : ''}
          `}>
            <PrimaryIcon className={`${iconSize} text-white`} />
          </div>
        </Tooltip>
        
        {/* Activity ring for active states */}
        {(isListening || isSpeaking || isProcessing) && (
          <div className="absolute inset-0 rounded-full border-2 border-current animate-ping opacity-75" />
        )}
      </div>

      {/* Status labels */}
      {showLabels && (
        <div className="flex flex-col">
          <Badge variant="outline" className={badgeSize}>
            {primaryStatus.label}
          </Badge>
          
          {/* Additional status info */}
          <div className="flex items-center space-x-1 mt-1">
            <Tooltip content={connectionInfo.tooltip}>
              <ConnectionIcon className={`h-3 w-3 ${connectionInfo.color}`} />
            </Tooltip>
            
            {isWakeWordActive && !isListening && (
              <Badge variant="secondary" className="text-xs">
                Wake Word
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Compact status indicators */}
      {!showLabels && (
        <div className="flex items-center space-x-1">
          {/* Connection status */}
          <Tooltip content={connectionInfo.tooltip}>
            <ConnectionIcon className={`h-3 w-3 ${connectionInfo.color}`} />
          </Tooltip>
          
          {/* Wake word indicator */}
          {isWakeWordActive && !isListening && (
            <Tooltip content="Wake word detection active">
              <div className="h-2 w-2 bg-yellow-400 rounded-full"></div>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceStatusIndicator;
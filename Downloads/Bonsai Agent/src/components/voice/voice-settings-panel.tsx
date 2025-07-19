"use client";

/**
 * Voice Settings Panel Component
 * Comprehensive voice assistant configuration interface
 */

import React, { useState } from 'react';
import { X, Volume2, Mic, Zap, Globe, Eye, Vibrate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VoiceSettings, VoiceCapabilities } from '@/lib/voice/voice-types';

interface VoiceSettingsPanelProps {
  settings: VoiceSettings;
  capabilities: VoiceCapabilities;
  onChange: (settings: Partial<VoiceSettings>) => void;
  onClose: () => void;
  className?: string;
}

export const VoiceSettingsPanel: React.FC<VoiceSettingsPanelProps> = ({
  settings,
  capabilities,
  onChange,
  onClose,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('audio');
  const [testingVoice, setTestingVoice] = useState(false);

  // Available languages
  const languages = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'es-ES', name: 'Spanish (Spain)', flag: '🇪🇸' },
    { code: 'es-MX', name: 'Spanish (Mexico)', flag: '🇲🇽' },
    { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
    { code: 'de-DE', name: 'German', flag: '🇩🇪' },
    { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
    { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳' },
    { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' }
  ];

  // TTS providers
  const ttsProviders = [
    { id: 'browser', name: 'Browser (Built-in)', free: true },
    { id: 'azure', name: 'Azure Cognitive Services', free: false },
    { id: 'google', name: 'Google Cloud TTS', free: false },
    { id: 'elevenlabs', name: 'ElevenLabs', free: false }
  ];

  // STT providers
  const sttProviders = [
    { id: 'browser', name: 'Browser (Built-in)', free: true },
    { id: 'azure', name: 'Azure Speech Services', free: false },
    { id: 'google', name: 'Google Cloud Speech', free: false },
    { id: 'openai', name: 'OpenAI Whisper', free: false }
  ];

  const handleSettingChange = (key: keyof VoiceSettings, value: any) => {
    onChange({ [key]: value });
  };

  const testVoice = async () => {
    setTestingVoice(true);
    try {
      // This would use the text-to-speech engine to test current settings
      console.log('Testing voice with current settings...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate TTS
    } catch (error) {
      console.error('Voice test failed:', error);
    } finally {
      setTestingVoice(false);
    }
  };

  const resetToDefaults = () => {
    onChange({
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
    });
  };

  return (
    <Card className={`fixed inset-4 z-50 overflow-auto ${className}`}>
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Voice Assistant Settings</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="audio">
              <Volume2 className="h-4 w-4 mr-2" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="speech">
              <Mic className="h-4 w-4 mr-2" />
              Speech
            </TabsTrigger>
            <TabsTrigger value="features">
              <Zap className="h-4 w-4 mr-2" />
              Features
            </TabsTrigger>
            <TabsTrigger value="accessibility">
              <Eye className="h-4 w-4 mr-2" />
              Accessibility
            </TabsTrigger>
          </TabsList>

          {/* Audio Settings */}
          <TabsContent value="audio" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium flex items-center">
                  <Volume2 className="h-4 w-4 mr-2" />
                  Audio Output
                </Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure voice synthesis and playback settings
                </p>

                <div className="space-y-4">
                  {/* Volume */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="volume">Volume</Label>
                      <Badge variant="secondary">
                        {Math.round(settings.volume * 100)}%
                      </Badge>
                    </div>
                    <Slider
                      id="volume"
                      min={0}
                      max={1}
                      step={0.1}
                      value={[settings.volume]}
                      onValueChange={([value]) => handleSettingChange('volume', value)}
                      className="w-full"
                    />
                  </div>

                  {/* Speech Speed */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="speed">Speech Speed</Label>
                      <Badge variant="secondary">
                        {settings.speed}x
                      </Badge>
                    </div>
                    <Slider
                      id="speed"
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      value={[settings.speed]}
                      onValueChange={([value]) => handleSettingChange('speed', value)}
                      className="w-full"
                    />
                  </div>

                  {/* Pitch */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="pitch">Pitch</Label>
                      <Badge variant="secondary">
                        {settings.pitch}x
                      </Badge>
                    </div>
                    <Slider
                      id="pitch"
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      value={[settings.pitch]}
                      onValueChange={([value]) => handleSettingChange('pitch', value)}
                      className="w-full"
                    />
                  </div>

                  {/* TTS Provider */}
                  <div className="space-y-2">
                    <Label htmlFor="tts-provider">Text-to-Speech Provider</Label>
                    <Select
                      value={settings.textToSpeechProvider}
                      onValueChange={(value) => 
                        handleSettingChange('textToSpeechProvider', value as any)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ttsProviders.map(provider => (
                          <SelectItem key={provider.id} value={provider.id}>
                            <div className="flex items-center justify-between w-full">
                              {provider.name}
                              {provider.free && (
                                <Badge variant="secondary" className="ml-2">Free</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Test Voice */}
                  <Button 
                    onClick={testVoice} 
                    disabled={testingVoice}
                    className="w-full"
                  >
                    {testingVoice ? 'Testing...' : 'Test Voice Settings'}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Speech Recognition Settings */}
          <TabsContent value="speech" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium flex items-center">
                  <Mic className="h-4 w-4 mr-2" />
                  Speech Recognition
                </Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure voice input and recognition settings
                </p>

                <div className="space-y-4">
                  {/* Language */}
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => handleSettingChange('language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map(lang => (
                          <SelectItem key={lang.code} value={lang.code}>
                            <div className="flex items-center">
                              <span className="mr-2">{lang.flag}</span>
                              {lang.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* STT Provider */}
                  <div className="space-y-2">
                    <Label htmlFor="stt-provider">Speech-to-Text Provider</Label>
                    <Select
                      value={settings.speechToTextProvider}
                      onValueChange={(value) => 
                        handleSettingChange('speechToTextProvider', value as any)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sttProviders.map(provider => (
                          <SelectItem key={provider.id} value={provider.id}>
                            <div className="flex items-center justify-between w-full">
                              {provider.name}
                              {provider.free && (
                                <Badge variant="secondary" className="ml-2">Free</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Noise Reduction */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="noise-reduction">Noise Reduction</Label>
                      <p className="text-sm text-muted-foreground">
                        Filter background noise for better recognition
                      </p>
                    </div>
                    <Switch
                      id="noise-reduction"
                      checked={settings.noiseReduction}
                      onCheckedChange={(checked) => 
                        handleSettingChange('noiseReduction', checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Features Settings */}
          <TabsContent value="features" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  Advanced Features
                </Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Enable or disable advanced voice assistant features
                </p>

                <div className="space-y-4">
                  {/* Wake Word */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="wake-word">Wake Word Detection</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable "Hey Bonsai" activation
                        </p>
                      </div>
                      <Switch
                        id="wake-word"
                        checked={settings.wakeWordEnabled}
                        onCheckedChange={(checked) => 
                          handleSettingChange('wakeWordEnabled', checked)
                        }
                        disabled={!capabilities.wakeWordDetection}
                      />
                    </div>

                    {settings.wakeWordEnabled && (
                      <div className="ml-4 space-y-2">
                        <Label htmlFor="wake-word-phrase">Wake Word Phrase</Label>
                        <Select
                          value={settings.wakeWord}
                          onValueChange={(value) => handleSettingChange('wakeWord', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hey bonsai">Hey Bonsai</SelectItem>
                            <SelectItem value="bonsai">Bonsai</SelectItem>
                            <SelectItem value="help me bonsai">Help me Bonsai</SelectItem>
                            <SelectItem value="tutor">Tutor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Voice Activation */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="voice-activated">Voice Activated Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically start listening after responses
                      </p>
                    </div>
                    <Switch
                      id="voice-activated"
                      checked={settings.voiceActivated}
                      onCheckedChange={(checked) => 
                        handleSettingChange('voiceActivated', checked)
                      }
                    />
                  </div>

                  {/* Real-time Processing */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Real-time Processing</Label>
                      <p className="text-sm text-muted-foreground">
                        Process speech as you speak for faster responses
                      </p>
                    </div>
                    <Badge variant={capabilities.realtimeProcessing ? "default" : "secondary"}>
                      {capabilities.realtimeProcessing ? "Enabled" : "Not Available"}
                    </Badge>
                  </div>

                  {/* Background Processing */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Background Processing</Label>
                      <p className="text-sm text-muted-foreground">
                        Continue processing when tab is not active
                      </p>
                    </div>
                    <Badge variant={capabilities.backgroundProcessing ? "default" : "secondary"}>
                      {capabilities.backgroundProcessing ? "Enabled" : "Not Available"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Accessibility Settings */}
          <TabsContent value="accessibility" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  Accessibility Options
                </Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure accessibility and feedback options
                </p>

                <div className="space-y-4">
                  {/* Visual Feedback */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="visual-feedback">Visual Feedback</Label>
                      <p className="text-sm text-muted-foreground">
                        Show visual indicators for voice activity
                      </p>
                    </div>
                    <Switch
                      id="visual-feedback"
                      checked={settings.visualFeedback}
                      onCheckedChange={(checked) => 
                        handleSettingChange('visualFeedback', checked)
                      }
                    />
                  </div>

                  {/* Haptic Feedback */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="haptics">
                        <div className="flex items-center">
                          <Vibrate className="h-4 w-4 mr-2" />
                          Haptic Feedback
                        </div>
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Vibration feedback for interactions (mobile only)
                      </p>
                    </div>
                    <Switch
                      id="haptics"
                      checked={settings.hapticsEnabled}
                      onCheckedChange={(checked) => 
                        handleSettingChange('hapticsEnabled', checked)
                      }
                    />
                  </div>

                  {/* Accessibility Features Status */}
                  <div className="space-y-3 p-3 bg-muted rounded-lg">
                    <Label className="text-sm font-medium">Feature Availability</Label>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Speech Recognition</span>
                        <Badge variant={capabilities.speechRecognition ? "default" : "secondary"}>
                          {capabilities.speechRecognition ? "✓" : "✗"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>Text-to-Speech</span>
                        <Badge variant={capabilities.textToSpeech ? "default" : "secondary"}>
                          {capabilities.textToSpeech ? "✓" : "✗"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>Wake Word</span>
                        <Badge variant={capabilities.wakeWordDetection ? "default" : "secondary"}>
                          {capabilities.wakeWordDetection ? "✓" : "✗"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>Offline Mode</span>
                        <Badge variant={capabilities.offline ? "default" : "secondary"}>
                          {capabilities.offline ? "✓" : "✗"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onClose}>
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VoiceSettingsPanel;
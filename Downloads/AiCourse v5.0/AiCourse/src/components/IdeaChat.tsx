import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Loader2, Send, Lightbulb, Sparkles, MessageCircle, Bot, User } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    ideaGenerated?: string;
    courseRecommendations?: any[];
}

interface IdeaChatProps {
    userId: string;
    onIdeaGenerated?: (idea: string) => void;
}

const IdeaChat: React.FC<IdeaChatProps> = ({ userId, onIdeaGenerated }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Inicializar nueva sesión de chat
    const initializeChat = async () => {
        try {
            const response = await fetch('/api/ideas/chat/new', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            
            const data = await response.json();
            if (data.success) {
                setSessionId(data.sessionId);
                setMessages(data.chat.messages);
            }
        } catch (error) {
            console.error('Error initializing chat:', error);
        }
    };

    useEffect(() => {
        if (userId) {
            initializeChat();
        }
    }, [userId]);

    const sendMessage = async () => {
        if (!currentMessage.trim() || !sessionId || isLoading) return;

        const userMessage = currentMessage.trim();
        setCurrentMessage('');
        setIsLoading(true);

        // Agregar mensaje del usuario inmediatamente
        const newUserMessage: Message = {
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, newUserMessage]);

        try {
            const response = await fetch('/api/ideas/chat/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    message: userMessage,
                    userId
                })
            });

            const data = await response.json();
            if (data.success) {
                const assistantMessage: Message = {
                    role: 'assistant',
                    content: data.response,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, assistantMessage]);

                // Si se generó una nueva idea
                if (data.chat.generatedIdeas) {
                    setGeneratedIdeas(data.chat.generatedIdeas);
                    const latestIdea = data.chat.generatedIdeas[data.chat.generatedIdeas.length - 1];
                    if (latestIdea && onIdeaGenerated) {
                        onIdeaGenerated(latestIdea);
                    }
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: 'Lo siento, hubo un error. ¿Podrías intentar de nuevo?',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatMessage = (content: string) => {
        // Convertir texto con formato básico a JSX
        const parts = content.split(/(\*\*.*?\*\*|•.*?(?=\n|$))/g);
        
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="font-semibold text-blue-600 dark:text-blue-400">
                    {part.slice(2, -2)}
                </strong>;
            } else if (part.startsWith('•')) {
                return <div key={index} className="ml-4 text-gray-700 dark:text-gray-300">
                    {part}
                </div>;
            }
            return <span key={index}>{part}</span>;
        });
    };

    const quickPrompts = [
        "Quiero aprender IA para mi profesión",
        "¿Cómo puedo crear una app web?",
        "Necesito ideas para emprender",
        "¿Qué curso de marketing me recomiendas?",
        "Quiero aprender diseño UX/UI",
        "¿Cómo analizar datos con Python?"
    ];

    const handleQuickPrompt = (prompt: string) => {
        setCurrentMessage(prompt);
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-full">
                        <Lightbulb className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Disparador de Ideas 💡</h2>
                        <p className="text-blue-100">
                            Tu asistente personal para descubrir cursos y generar ideas de aprendizaje
                        </p>
                    </div>
                </div>
                
                {generatedIdeas.length > 0 && (
                    <div className="mt-4">
                        <p className="text-sm text-blue-100 mb-2">Ideas generadas en esta sesión:</p>
                        <div className="flex flex-wrap gap-2">
                            {generatedIdeas.slice(-3).map((idea, index) => (
                                <Badge key={index} variant="secondary" className="bg-white/20 text-white border-white/30">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    {idea.length > 40 ? `${idea.substring(0, 40)}...` : idea}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {message.role === 'assistant' && (
                            <Avatar className="w-8 h-8 bg-blue-600">
                                <AvatarFallback>
                                    <Bot className="w-4 h-4 text-white" />
                                </AvatarFallback>
                            </Avatar>
                        )}
                        
                        <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                            <Card className={`${
                                message.role === 'user'
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                            }`}>
                                <CardContent className="p-3">
                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                        {message.role === 'assistant' 
                                            ? formatMessage(message.content)
                                            : message.content
                                        }
                                    </div>
                                    <div className={`text-xs mt-2 opacity-70 ${
                                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                                    }`}>
                                        {new Date(message.timestamp).toLocaleTimeString()}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {message.role === 'user' && (
                            <Avatar className="w-8 h-8 bg-gray-600">
                                <AvatarFallback>
                                    <User className="w-4 h-4 text-white" />
                                </AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3 justify-start">
                        <Avatar className="w-8 h-8 bg-blue-600">
                            <AvatarFallback>
                                <Bot className="w-4 h-4 text-white" />
                            </AvatarFallback>
                        </Avatar>
                        <Card className="bg-white dark:bg-gray-800">
                            <CardContent className="p-3">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Generando respuesta...
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 1 && (
                <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Prompts rápidos para empezar:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {quickPrompts.map((prompt, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="text-left justify-start h-auto p-2 text-xs"
                                onClick={() => handleQuickPrompt(prompt)}
                            >
                                <MessageCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                                {prompt}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
                <div className="flex gap-2">
                    <Input
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Cuéntame qué te gustaría aprender o en qué área necesitas ideas..."
                        className="flex-1"
                        disabled={isLoading}
                    />
                    <Button
                        onClick={sendMessage}
                        disabled={!currentMessage.trim() || isLoading}
                        size="icon"
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Presiona Enter para enviar • Shift + Enter para nueva línea
                </p>
            </div>
        </div>
    );
};

export default IdeaChat; 
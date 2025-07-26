import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  Send,
  MessageCircle,
  Loader2,
  Users,
  Search,
  MoreVertical
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { messagingService, Conversation, Message } from "@/services";

const Messages = () => {
  const { user, profile } = useAuth();
  const { conversationId } = useParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user || !profile) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await messagingService.getUserConversations(user.id);
        setConversations(data);
        
        // If there's a conversationId in URL, find and select it
        if (conversationId && data.length > 0) {
          const conversation = data.find(c => c.id === conversationId);
          if (conversation) {
            setSelectedConversation(conversation);
          }
        } else if (data.length > 0) {
          // Select first conversation by default
          setSelectedConversation(data[0]);
        }
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError('Error al cargar las conversaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user, profile, conversationId]);

  // Fetch messages for selected conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return;
      
      try {
        const data = await messagingService.getConversationMessages(selectedConversation.id);
        setMessages(data.reverse()); // Reverse to show oldest first
        
        // Mark messages as read
        if (user) {
          await messagingService.markMessagesAsRead(selectedConversation.id, user.id);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
  }, [selectedConversation, user]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Set up real-time subscription
  useEffect(() => {
    if (!selectedConversation) return;

    const subscription = messagingService.subscribeToConversation(
      selectedConversation.id,
      (newMessage) => {
        setMessages(prev => [...prev, newMessage]);
        // Mark as read if it's not from current user
        if (user && newMessage.sender_id !== user.id) {
          messagingService.markMessagesAsRead(selectedConversation.id, user.id);
        }
      },
      (updatedMessage) => {
        setMessages(prev => prev.map(msg => 
          msg.id === updatedMessage.id ? updatedMessage : msg
        ));
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedConversation, user]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user || sending) return;

    try {
      setSending(true);
      await messagingService.sendMessage(
        selectedConversation.id,
        user.id,
        newMessage.trim()
      );
      setNewMessage("");
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-20 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Cargando mensajes...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-20 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline" 
              className="rounded-full"
            >
              Reintentar
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-16 h-screen flex">
        {/* Conversations Sidebar */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-light text-black">Mensajes</h1>
              <Button variant="ghost" size="sm" className="rounded-full p-2">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar conversaciones..."
                className="pl-10 rounded-full border-gray-200"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No hay conversaciones</p>
                <p className="text-sm text-gray-500">Inicia una conversación desde una campaña</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isSelected={selectedConversation?.id === conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  currentUserId={user?.id}
                />
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage 
                      src={
                        profile?.role === 'business' 
                          ? selectedConversation.creator_profile?.user?.avatar_url 
                          : selectedConversation.business_profile?.user?.avatar_url
                      } 
                    />
                    <AvatarFallback>
                      {profile?.role === 'business' 
                        ? selectedConversation.creator_profile?.user?.full_name?.split(' ').map(n => n[0]).join('') || 'C'
                        : selectedConversation.business_profile?.user?.full_name?.split(' ').map(n => n[0]).join('') || 'B'
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium text-black">
                      {profile?.role === 'business' 
                        ? selectedConversation.creator_profile?.user?.full_name || 'Creador'
                        : selectedConversation.business_profile?.user?.full_name || 'Empresa'
                      }
                    </div>
                    <div className="text-sm text-gray-500">
                      {profile?.role === 'business' 
                        ? `@${selectedConversation.creator_profile?.username}`
                        : selectedConversation.business_profile?.company_name
                      }
                    </div>
                  </div>
                  {selectedConversation.collaboration && (
                    <Badge variant="outline" className="text-xs">
                      {selectedConversation.collaboration.title || 'Campaña'}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.sender_id === user?.id}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-end space-x-4">
                  <div className="flex-1">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Escribe un mensaje..."
                      className="rounded-full border-gray-200"
                      disabled={sending}
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="bg-black hover:bg-gray-800 text-white rounded-full px-6"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-black mb-2">Selecciona una conversación</h3>
                <p className="text-gray-600">Elige una conversación para comenzar a chatear</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ConversationItem = ({ 
  conversation, 
  isSelected, 
  onClick, 
  currentUserId 
}: { 
  conversation: Conversation; 
  isSelected: boolean; 
  onClick: () => void; 
  currentUserId?: string;
}) => {
  const isBusinessUser = currentUserId && conversation.business_profile?.user_id === currentUserId;
  const otherUser = isBusinessUser ? conversation.creator_profile : conversation.business_profile;
  
  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-gray-50 border-r-2 border-r-black' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src={otherUser?.user?.avatar_url || undefined} />
          <AvatarFallback>
            {otherUser?.user?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="font-medium text-black truncate">
              {otherUser?.user?.full_name || 'Usuario'}
            </div>
            {conversation.latest_message && (
              <div className="text-xs text-gray-500">
                {new Date(conversation.latest_message.created_at).toLocaleDateString()}
              </div>
            )}
          </div>
          
          <div className="text-sm text-gray-500 truncate">
            {isBusinessUser ? `@${conversation.creator_profile?.username}` : otherUser?.company_name}
          </div>
          
          {conversation.latest_message && (
            <div className="text-sm text-gray-600 truncate mt-1">
              {conversation.latest_message.content}
            </div>
          )}
          
          <div className="flex items-center justify-between mt-2">
            {conversation.collaboration && (
              <Badge variant="outline" className="text-xs">
                {conversation.collaboration.title || 'Campaña'}
              </Badge>
            )}
            {conversation.unread_count && conversation.unread_count > 0 && (
              <Badge className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {conversation.unread_count}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MessageBubble = ({ message, isOwn }: { message: Message; isOwn: boolean }) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
        {!isOwn && (
          <div className="flex items-center space-x-2 mb-1">
            <Avatar className="w-6 h-6">
              <AvatarImage src={message.sender?.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {message.sender?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-500 font-medium">
              {message.sender?.full_name}
            </span>
          </div>
        )}
        
        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwn
              ? 'bg-black text-white rounded-br-md'
              : 'bg-gray-100 text-black rounded-bl-md'
          }`}
        >
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        </div>
        
        <div className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
          {new Date(message.created_at).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
};

export default Messages;
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { ArrowLeft, Send, Users, Settings } from 'lucide-react';
import type { User, Room, Message } from '../App';

interface ChatRoomProps {
  user: User;
  room: Room;
  messages: Message[];
  onLeaveRoom: () => void;
  onSendMessage: (content: string) => void;
  onOpenSettings: () => void;
}

export function ChatRoom({ user, room, messages, onLeaveRoom, onSendMessage, onOpenSettings }: ChatRoomProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageContent = (content: string) => {
    // Handle bold text
    let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Handle italic text
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Handle links
    formatted = formatted.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline dark:text-blue-400">$1</a>'
    );
    
    return formatted;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 dark:bg-gray-900/80 dark:border-gray-700/50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLeaveRoom}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">#{room.name}</h1>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{room.participantCount} members</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => {
            const isOwnMessage = message.userId === user.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <Card
                  className={`max-w-xs sm:max-w-md lg:max-w-lg shadow-sm ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white/80 border-gray-200/50 dark:bg-gray-800/80 dark:border-gray-700/50'
                  }`}
                >
                  <CardContent className="p-3">
                    {!isOwnMessage && (
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-blue-600 dark:text-blue-400">
                          {message.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    )}
                    <div
                      className={`text-sm ${isOwnMessage ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}
                      dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                    />
                    {isOwnMessage && (
                      <div className="text-right mt-1">
                        <span className="text-xs text-blue-100">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 p-4 dark:bg-gray-900/80 dark:border-gray-700/50">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex space-x-4">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-white/50 border-gray-200/50 focus:border-blue-500 focus:ring-blue-500/20 dark:bg-gray-800/50"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg px-6"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <div className="max-w-4xl mx-auto mt-2">
          <p className="text-xs text-muted-foreground">
            Use **bold**, *italic*, or paste links. Press Enter to send.
          </p>
        </div>
      </div>
    </div>
  );
}
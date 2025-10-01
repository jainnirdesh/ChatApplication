import React, { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { ChatRoom } from './components/ChatRoom';
import { Settings } from './components/Settings';
import { ErrorBoundary } from './components/ErrorBoundary';

export interface User {
  id: string;
  username: string;
}

export interface Room {
  id: string;
  name: string;
  participantCount: number;
}

export interface Message {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
}

export type Screen = 'login' | 'signup' | 'dashboard' | 'chatroom' | 'settings';

// Demo data
const DEMO_ROOMS: Room[] = [
  { id: 'demo-1', name: 'General (Demo)', participantCount: 12 },
  { id: 'demo-2', name: 'Tech Talk (Demo)', participantCount: 8 },
  { id: 'demo-3', name: 'Random (Demo)', participantCount: 5 },
];

const DEMO_MESSAGES: { [roomId: string]: Message[] } = {
  'demo-1': [
    {
      id: 'demo-msg-1',
      roomId: 'demo-1',
      userId: 'demo-other-1',
      username: 'Alice',
      content: 'Welcome to the demo chat! This is running in demo mode.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: 'demo-msg-2',
      roomId: 'demo-1',
      userId: 'demo-other-2',
      username: 'Bob',
      content: 'You can try sending messages, but they won\'t persist since we\'re in demo mode.',
      timestamp: new Date(Date.now() - 1000 * 60 * 20),
    }
  ],
  'demo-2': [
    {
      id: 'demo-msg-3',
      roomId: 'demo-2',
      userId: 'demo-other-3',
      username: 'Charlie',
      content: 'This is the Tech Talk room in demo mode.',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
    }
  ],
  'demo-3': [
    {
      id: 'demo-msg-4',
      roomId: 'demo-3',
      userId: 'demo-other-4',
      username: 'Diana',
      content: 'Random discussions happen here!',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
    }
  ]
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [rooms, setRooms] = useState<Room[]>(DEMO_ROOMS);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [demoMode] = useState(true); // Always start in demo mode for now

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogin = async (username: string, password: string, isSignup = false) => {
    try {
      setLoading(true);
      
      // Demo mode - simulate authentication
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      setUser({
        id: 'demo-user',
        username: username
      });
      setCurrentScreen('dashboard');
    } catch (error: any) {
      console.error('Authentication error:', error);
      throw new Error('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = (roomId: string) => {
    setCurrentRoomId(roomId);
    // Load demo messages for this room
    const roomMessages = DEMO_MESSAGES[roomId] || [];
    setMessages(roomMessages);
    setCurrentScreen('chatroom');
  };

  const handleLeaveRoom = () => {
    setCurrentRoomId(null);
    setMessages([]);
    setCurrentScreen('dashboard');
  };

  const handleSendMessage = async (content: string) => {
    if (!user || !currentRoomId) return;

    // Demo mode - add message locally
    const newMessage: Message = {
      id: `demo-msg-${Date.now()}`,
      roomId: currentRoomId,
      userId: user.id,
      username: user.username,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleCreateRoom = async (roomName: string) => {
    // Demo mode - add room locally
    const newRoom: Room = {
      id: `demo-${Date.now()}`,
      name: `${roomName} (Demo)`,
      participantCount: 1,
    };
    setRooms(prev => [...prev, newRoom]);
  };

  const handleLogout = async () => {
    setUser(null);
    setCurrentScreen('login');
    setCurrentRoomId(null);
    setMessages([]);
  };

  const currentRoom = currentRoomId ? rooms.find(room => room.id === currentRoomId) : null;
  const currentRoomMessages = messages;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        {demoMode && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 dark:bg-yellow-900/20 dark:text-yellow-400">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">
                  Running in <strong>Demo Mode</strong> - Experience the chat interface with sample data.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {(currentScreen === 'login' || currentScreen === 'signup') && (
          <LoginScreen 
            onLogin={handleLogin} 
            loading={loading}
            isSignupMode={currentScreen === 'signup'}
            onToggleMode={() => setCurrentScreen(currentScreen === 'login' ? 'signup' : 'login')}
            demoMode={demoMode}
          />
        )}
        
        {currentScreen === 'dashboard' && user && (
          <Dashboard
            user={user}
            rooms={rooms}
            loading={loading}
            onJoinRoom={handleJoinRoom}
            onCreateRoom={handleCreateRoom}
            onOpenSettings={() => setCurrentScreen('settings')}
            onLogout={handleLogout}
          />
        )}
        
        {currentScreen === 'chatroom' && user && currentRoom && (
          <ChatRoom
            user={user}
            room={currentRoom}
            messages={currentRoomMessages}
            onLeaveRoom={handleLeaveRoom}
            onSendMessage={handleSendMessage}
            onOpenSettings={() => setCurrentScreen('settings')}
            onLogout={handleLogout}
          />
        )}
        
        {currentScreen === 'settings' && user && (
          <Settings
            user={user}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            onUpdateUsername={(newUsername) => setUser({...user, username: newUsername})}
            onBack={() => setCurrentScreen(currentRoomId ? 'chatroom' : 'dashboard')}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
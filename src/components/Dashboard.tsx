import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Plus, Users, Settings, MessageCircle } from 'lucide-react';
import type { User, Room } from '../App';

interface DashboardProps {
  user: User;
  rooms: Room[];
  onJoinRoom: (roomId: string) => void;
  onCreateRoom: (roomName: string) => void;
  onOpenSettings: () => void;
}

export function Dashboard({ user, rooms, onJoinRoom, onCreateRoom, onOpenSettings }: DashboardProps) {
  const [newRoomName, setNewRoomName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoomName.trim()) {
      onCreateRoom(newRoomName.trim());
      setNewRoomName('');
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-80 bg-white/80 backdrop-blur-sm shadow-xl border-r border-gray-200/50 dark:bg-gray-900/80 dark:border-gray-700/50">
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Chat Rooms</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenSettings}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Welcome back, {user.username}!</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {rooms.map((room) => (
              <Card
                key={room.id}
                className="hover:shadow-md transition-all duration-200 cursor-pointer bg-white/50 border-gray-200/50 hover:bg-blue-50/50 dark:bg-gray-800/50 dark:border-gray-700/50 dark:hover:bg-blue-900/20"
                onClick={() => onJoinRoom(room.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900/30">
                        <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{room.name}</h3>
                        <div className="flex items-center space-x-1 mt-1">
                          <Users className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{room.participantCount} members</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      Join
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Create New Room
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Room</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="roomName">Room Name</Label>
                  <Input
                    id="roomName"
                    placeholder="Enter room name"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    disabled={!newRoomName.trim()}
                  >
                    Create Room
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:from-blue-900/30 dark:to-indigo-900/30">
              <MessageCircle className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Select a room to start chatting
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Choose from the available rooms in the sidebar or create a new one to begin conversations with others.
            </p>
          </div>
          
          <div className="bg-white/50 rounded-lg p-6 border border-gray-200/50 dark:bg-gray-800/50 dark:border-gray-700/50">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Quick Tips</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Click on any room to join the conversation</li>
              <li>• Create custom rooms for specific topics</li>
              <li>• Use formatting like **bold** and *italics*</li>
              <li>• Share links and they'll be clickable</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
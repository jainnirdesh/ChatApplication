import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { ArrowLeft, User, Moon, Sun, Bell } from 'lucide-react';
import type { User } from '../App';

interface SettingsProps {
  user: User;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onUpdateUsername: (newUsername: string) => void;
  onBack: () => void;
}

export function Settings({ user, darkMode, onToggleDarkMode, onUpdateUsername, onBack }: SettingsProps) {
  const [newUsername, setNewUsername] = useState(user.username);
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername.trim() && newUsername !== user.username) {
      setIsUpdating(true);
      // Simulate API call
      setTimeout(() => {
        onUpdateUsername(newUsername.trim());
        setIsUpdating(false);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span>Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleUpdateUsername} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="username"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="flex-1 bg-white/50 border-gray-200/50 focus:border-blue-500 focus:ring-blue-500/20"
                      disabled={isUpdating}
                    />
                    <Button
                      type="submit"
                      disabled={!newUsername.trim() || newUsername === user.username || isUpdating}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    >
                      {isUpdating ? 'Updating...' : 'Update'}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This will be visible to other users in the chat.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {darkMode ? (
                  <Moon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <Sun className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                )}
                <span>Appearance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark themes
                  </p>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={onToggleDarkMode}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for new messages
                  </p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Sound Effects</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sounds for message notifications
                  </p>
                </div>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">Chat App v1.0</h3>
                <p className="text-sm text-muted-foreground">
                  A modern real-time chat application built with React and Tailwind CSS.
                </p>
                <p className="text-xs text-muted-foreground">
                  Created with ❤️ for seamless communication.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';

interface LoginScreenProps {
  onLogin: (username: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock list of taken usernames for demonstration
  const takenUsernames = ['admin', 'test', 'user', 'moderator'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (username.length < 2) {
      setError('Username must be at least 2 characters long');
      return;
    }

    if (takenUsernames.includes(username.toLowerCase())) {
      setError('This username is already taken. Please choose another one.');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      onLogin(username);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-60 h-60 bg-purple-400/10 rounded-full blur-2xl"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome to Chat
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Enter your username to join the conversation
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white/50 border-gray-200/50 focus:border-blue-500 focus:ring-blue-500/20"
                disabled={isLoading}
              />
            </div>
            
            {error && (
              <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
                <AlertDescription className="text-red-700 dark:text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? 'Joining...' : 'Join Chat'}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              By joining, you agree to be respectful and follow community guidelines.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
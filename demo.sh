#!/bin/bash

# Multi-User Chat Application Demo Script
# This script demonstrates the real-time chat functionality

echo "🚀 Real-Time Chat Application Demo"
echo "=================================="
echo ""

# Check if server is running
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Server is running on port 8000"
else
    echo "❌ Server is not running. Starting server..."
    cd "/Users/nirdeshjain/Documents/Unified Mentor/ChatApplication"
    node realtime-server.js &
    SERVER_PID=$!
    echo "🚀 Server started with PID: $SERVER_PID"
    sleep 3
fi

echo ""
echo "📋 Demo Instructions:"
echo "1. The multi-user test page will open automatically"
echo "2. Click the buttons to open multiple chat windows"
echo "3. Use different usernames in each window (e.g., Alice, Bob, Charlie)"
echo "4. Test real-time messaging between users"
echo "5. Try switching rooms and creating new ones"
echo "6. Observe user lists updating in real-time"
echo ""

echo "🌐 Opening multi-user test page..."
if command -v open &> /dev/null; then
    # macOS
    open "http://localhost:8000/test-multiuser.html"
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open "http://localhost:8000/test-multiuser.html"
elif command -v start &> /dev/null; then
    # Windows
    start "http://localhost:8000/test-multiuser.html"
else
    echo "Please open http://localhost:8000/test-multiuser.html in your browser"
fi

echo ""
echo "🎯 Key Features to Test:"
echo "• Real-time messaging across multiple users"
echo "• Instant room switching and synchronization"
echo "• Dynamic user list updates"
echo "• Room creation and deletion"
echo "• Connection status indicators"
echo "• Automatic reconnection handling"
echo "• Emoji and text formatting"
echo "• Responsive design on different screen sizes"
echo ""

echo "✨ The chat application now supports true multi-user real-time communication!"
echo "   Multiple users can chat simultaneously across different rooms."
echo ""

read -p "Press Enter to exit..."

# Cleanup if we started the server
if [ ! -z "$SERVER_PID" ]; then
    echo "🛑 Stopping server..."
    kill $SERVER_PID 2>/dev/null
fi

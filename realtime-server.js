const http = require('http');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');

const PORT = 8000;

// Store active users and room data
const activeUsers = new Map();
const roomMessages = {
    general: [
        {
            author: 'System',
            content: 'Welcome to the General chat room! This is for general discussions.',
            time: new Date().toLocaleTimeString(),
            id: 'system-1'
        }
    ],
    tech: [
        {
            author: 'System', 
            content: 'Welcome to Tech Talk! Discuss technology topics here.',
            time: new Date().toLocaleTimeString(),
            id: 'system-2'
        }
    ],
    random: [
        {
            author: 'System',
            content: 'Welcome to Random! Share anything and everything here.',
            time: new Date().toLocaleTimeString(),
            id: 'system-3'
        }
    ]
};

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Create HTTP server
const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Parse URL and remove query parameters
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = filePath.split('?')[0];
    
    // Build full file path
    const fullPath = path.join(__dirname, filePath);
    
    // Get file extension
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'text/plain';
    
    // Read and serve file
    fs.readFile(fullPath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>404 - Page Not Found</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                text-align: center;
                                background: #f0f0f0;
                                margin: 0;
                                padding: 50px;
                            }
                            .container {
                                background: white;
                                padding: 40px;
                                border-radius: 10px;
                                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                                display: inline-block;
                            }
                            h1 { color: #e74c3c; }
                            a { color: #3498db; text-decoration: none; }
                            a:hover { text-decoration: underline; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>404 - Page Not Found</h1>
                            <p>The requested file <strong>${filePath}</strong> was not found.</p>
                            <p><a href="/">← Go back to home</a></p>
                        </div>
                    </body>
                    </html>
                `);
            } else {
                // Server error
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 - Internal Server Error');
            }
        } else {
            // Success
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

// Create Socket.IO server
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Handle user joining
    socket.on('user-join', (data) => {
        const { username, room = 'general' } = data;
        
        // Check if username is already taken
        const existingUser = Array.from(activeUsers.values()).find(user => user.username === username);
        if (existingUser) {
            socket.emit('error', { message: 'Username already taken. Please choose another.' });
            return;
        }
        
        // Store user info
        activeUsers.set(socket.id, {
            username,
            currentRoom: room,
            joinTime: new Date()
        });
        
        // Join the room
        socket.join(room);
        
        console.log(`${username} joined room: ${room}`);
        
        // Send success confirmation to the joining user
        console.log(`Sending join-success to ${username}`);
        socket.emit('join-success', { username, room });
        
        // Send current room messages to the new user
        if (roomMessages[room]) {
            socket.emit('room-messages', {
                room,
                messages: roomMessages[room]
            });
        }
        
        // Send updated user list to everyone in the room
        updateRoomUsers(room);
        
        // Notify others that user joined
        socket.to(room).emit('user-joined', {
            username,
            message: `${username} joined the chat`,
            time: new Date().toLocaleTimeString()
        });
    });
    
    // Handle sending messages
    socket.on('send-message', (data) => {
        const user = activeUsers.get(socket.id);
        if (!user) return;
        
        const { content, room } = data;
        const message = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            author: user.username,
            content,
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now()
        };
        
        // Store message
        if (!roomMessages[room]) {
            roomMessages[room] = [];
        }
        roomMessages[room].push(message);
        
        // Keep only last 100 messages per room
        if (roomMessages[room].length > 100) {
            roomMessages[room] = roomMessages[room].slice(-100);
        }
        
        console.log(`Message from ${user.username} in ${room}: ${content}`);
        
        // Broadcast message to all users in the room
        io.to(room).emit('new-message', message);
    });
    
    // Handle room switching
    socket.on('switch-room', (data) => {
        const user = activeUsers.get(socket.id);
        if (!user) return;
        
        const { newRoom } = data;
        const oldRoom = user.room;
        
        // Leave old room
        socket.leave(oldRoom);
        
        // Join new room
        socket.join(newRoom);
        
        // Update user's room
        user.room = newRoom;
        activeUsers.set(socket.id, user);
        
        console.log(`${user.username} switched from ${oldRoom} to ${newRoom}`);
        
        // Send room messages
        if (roomMessages[newRoom]) {
            socket.emit('room-messages', {
                room: newRoom,
                messages: roomMessages[newRoom]
            });
        }
        
        // Update user lists for both rooms
        updateRoomUsers(oldRoom);
        updateRoomUsers(newRoom);
        
        // Notify about room switch
        socket.to(oldRoom).emit('user-left', {
            username: user.username,
            message: `${user.username} left the room`,
            time: new Date().toLocaleTimeString()
        });
        
        socket.to(newRoom).emit('user-joined', {
            username: user.username,
            message: `${user.username} joined the room`,
            time: new Date().toLocaleTimeString()
        });
    });
    
    // Handle room creation
    socket.on('create-room', (data) => {
        const user = activeUsers.get(socket.id);
        if (!user) return;
        
        const { roomId, roomName } = data;
        
        // Initialize room if it doesn't exist
        if (!roomMessages[roomId]) {
            roomMessages[roomId] = [
                {
                    id: `system-${roomId}`,
                    author: 'System',
                    content: `Welcome to ${roomName}! This room was just created.`,
                    time: new Date().toLocaleTimeString(),
                    timestamp: Date.now()
                }
            ];
        }
        
        console.log(`Room created: ${roomName} (${roomId}) by ${user.username}`);
        
        // Notify all users about new room
        io.emit('room-created', {
            roomId,
            roomName,
            creator: user.username
        });
    });
    
    // Handle room deletion
    socket.on('delete-room', (data) => {
        const user = activeUsers.get(socket.id);
        if (!user) return;
        
        const { roomId } = data;
        
        // Don't allow deletion of default rooms
        if (['general', 'tech', 'random'].includes(roomId)) {
            socket.emit('error', { message: 'Cannot delete default rooms' });
            return;
        }
        
        // Remove room messages
        delete roomMessages[roomId];
        
        console.log(`Room deleted: ${roomId} by ${user.username}`);
        
        // Move all users in deleted room to general
        const usersInRoom = Array.from(activeUsers.entries())
            .filter(([_, userData]) => userData.room === roomId);
        
        usersInRoom.forEach(([socketId, userData]) => {
            const userSocket = io.sockets.sockets.get(socketId);
            if (userSocket) {
                userSocket.leave(roomId);
                userSocket.join('general');
                userData.room = 'general';
                activeUsers.set(socketId, userData);
                
                // Send general room messages
                userSocket.emit('room-messages', {
                    room: 'general',
                    messages: roomMessages.general
                });
            }
        });
        
        // Notify all users about room deletion
        io.emit('room-deleted', {
            roomId,
            deletedBy: user.username
        });
        
        updateRoomUsers('general');
    });
    
    // Handle user disconnect
    socket.on('disconnect', () => {
        const user = activeUsers.get(socket.id);
        if (user) {
            console.log(`${user.username} disconnected`);
            
            // Notify others in the room
            socket.to(user.room).emit('user-left', {
                username: user.username,
                message: `${user.username} left the chat`,
                time: new Date().toLocaleTimeString()
            });
            
            // Remove user from active users
            activeUsers.delete(socket.id);
            
            // Update room user list
            updateRoomUsers(user.room);
        }
    });
    
    // Function to update user list for a room
    function updateRoomUsers(room) {
        const usersInRoom = Array.from(activeUsers.values())
            .filter(user => user.room === room)
            .map(user => user.username);
        
        io.to(room).emit('room-users-updated', {
            room,
            users: usersInRoom,
            count: usersInRoom.length
        });
    }
});

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Real-time Chat Server running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket server ready for connections`);
    console.log(`👥 Multi-user chat enabled!`);
    console.log(`\n📋 Available endpoints:`);
    console.log(`   • http://localhost:${PORT}/realtime-chat.html - Real-time multi-user chat`);
    console.log(`   • http://localhost:${PORT}/test-multiuser.html - Multi-user test interface`);
    console.log(`   • http://localhost:${PORT}/index.html - Legacy static version`);
    console.log(`\n💡 To test multi-user functionality:`);
    console.log(`   1. Open http://localhost:${PORT}/test-multiuser.html`);
    console.log(`   2. Click buttons to open multiple chat windows`);
    console.log(`   3. Use different usernames and chat in real-time!`);
    console.log(`\n🔍 Watching for connections...`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

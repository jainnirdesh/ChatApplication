// Chat Application JavaScript
class ChatApp {
    constructor() {
        this.currentUser = null;
        this.currentRoom = null;
        this.rooms = new Map();
        this.users = new Map();
        this.messages = new Map();
        this.isFormattingEnabled = false;
        
        // Clear any existing data
        this.users.clear();
        
        // Initialize default rooms
        this.initializeDefaultRooms();
        
        // Bind event listeners
        this.bindEventListeners();
        
        // Initialize WebSocket simulation
        this.initializeWebSocket();
    }

    initializeDefaultRooms() {
        const defaultRooms = [
            { id: 'general', name: 'General', description: 'General discussion for everyone' },
            { id: 'tech', name: 'Tech Talk', description: 'Discuss technology and programming' },
            { id: 'random', name: 'Random', description: 'Random conversations and fun' },
            { id: 'help', name: 'Help & Support', description: 'Get help and support from others' }
        ];

        defaultRooms.forEach(room => {
            this.rooms.set(room.id, {
                ...room,
                users: new Set(),
                createdBy: 'system',
                createdAt: new Date()
            });
            this.messages.set(room.id, []);
        });
    }

    bindEventListeners() {
        // Login screen
        const usernameInput = document.getElementById('username-input');
        const joinBtn = document.getElementById('join-btn');
        
        if (usernameInput) {
            usernameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleLogin();
                }
            });
        }
        
        if (joinBtn) {
            joinBtn.addEventListener('click', () => {
                this.handleLogin();
            });
        }

        // Main chat
        document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());
        document.getElementById('create-room-btn').addEventListener('click', () => this.showCreateRoomModal());
        document.getElementById('message-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        document.getElementById('send-btn').addEventListener('click', () => this.sendMessage());

        // Formatting and emojis
        document.getElementById('toggle-formatting').addEventListener('click', () => this.toggleFormatting());
        document.getElementById('toggle-emoji').addEventListener('click', () => this.toggleEmojiPicker());

        // Modal events
        document.getElementById('close-modal').addEventListener('click', () => this.hideCreateRoomModal());
        document.getElementById('cancel-room-btn').addEventListener('click', () => this.hideCreateRoomModal());
        document.getElementById('create-room-confirm-btn').addEventListener('click', () => this.createRoom());

        // Room name input
        document.getElementById('room-name-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.createRoom();
            }
        });

        // Formatting toolbar
        document.querySelectorAll('.formatting-toolbar button').forEach(btn => {
            btn.addEventListener('click', () => this.applyFormatting(btn.dataset.format));
        });

        // Emoji picker
        document.querySelectorAll('.emoji').forEach(emoji => {
            emoji.addEventListener('click', () => this.insertEmoji(emoji.dataset.emoji));
        });

        // Close emoji picker when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.emoji-picker') && !e.target.closest('#toggle-emoji')) {
                document.getElementById('emoji-picker').classList.remove('active');
            }
        });
    }

    initializeWebSocket() {
        // Simulate WebSocket connection
        // In a real application, this would connect to a WebSocket server
        this.socket = {
            connected: true,
            send: (data) => {
                // Simulate message broadcasting
                setTimeout(() => {
                    this.handleWebSocketMessage(data);
                }, 100);
            },
            close: () => {
                this.socket.connected = false;
            }
        };
    }

    handleWebSocketMessage(data) {
        const message = JSON.parse(data);
        
        switch (message.type) {
            case 'user_joined':
                this.handleUserJoined(message.data);
                break;
            case 'user_left':
                this.handleUserLeft(message.data);
                break;
            case 'message':
                this.handleNewMessage(message.data);
                break;
            case 'room_created':
                this.handleRoomCreated(message.data);
                break;
        }
    }

    handleLogin() {
        const usernameInput = document.getElementById('username-input');
        
        if (!usernameInput) {
            console.error('Username input element not found!');
            return;
        }
        
        const username = usernameInput.value.trim();
        
        if (!username) {
            this.showNotification('Please enter a username', 'error');
            return;
        }

        if (username.length < 3) {
            this.showNotification('Username must be at least 3 characters long', 'error');
            return;
        }

        if (username.length > 20) {
            this.showNotification('Username must be less than 20 characters', 'error');
            return;
        }

        // Check for valid characters (letters, numbers, underscores, hyphens)
        const validUsernamePattern = /^[a-zA-Z0-9_-]+$/;
        if (!validUsernamePattern.test(username)) {
            this.showNotification('Username can only contain letters, numbers, underscores, and hyphens', 'error');
            return;
        }

        // For demo purposes, skip duplicate username check
        // In production, you'd want to check against a server
        const lowerUsername = username.toLowerCase();
        
        // Clear any existing user with the same name (for demo)
        if (this.users.has(lowerUsername)) {
            this.users.delete(lowerUsername);
        }

        this.currentUser = username;
        this.users.set(lowerUsername, {
            username: username,
            joinedAt: new Date(),
            isOnline: true
        });

        console.log('About to show chat screen for user:', username);
        this.showChatScreen();
        this.updateUsersList();
        this.showNotification(`Welcome ${username}!`, 'success');
        
        // Simulate WebSocket message
        this.socket.send(JSON.stringify({
            type: 'user_joined',
            data: { username: username }
        }));
    }

    handleLogout() {
        if (this.currentUser) {
            this.users.delete(this.currentUser.toLowerCase());
            
            // Remove user from all rooms
            this.rooms.forEach(room => {
                room.users.delete(this.currentUser);
            });
            
            // Simulate WebSocket message
            this.socket.send(JSON.stringify({
                type: 'user_left',
                data: { username: this.currentUser }
            }));
        }

        this.currentUser = null;
        this.currentRoom = null;
        this.showLoginScreen();
        this.clearMessages();
        this.disableMessageInput();
    }

    showLoginScreen() {
        document.getElementById('login-screen').classList.add('active');
        document.getElementById('chat-screen').classList.remove('active');
        document.getElementById('username-input').value = '';
        document.getElementById('username-input').focus();
    }

    showChatScreen() {
        console.log('showChatScreen called');
        const loginScreen = document.getElementById('login-screen');
        const chatScreen = document.getElementById('chat-screen');
        const currentUserSpan = document.getElementById('current-user');
        
        console.log('Login screen element:', loginScreen);
        console.log('Chat screen element:', chatScreen);
        console.log('Current user span:', currentUserSpan);
        
        if (loginScreen) {
            loginScreen.classList.remove('active');
            console.log('Removed active class from login screen');
        }
        
        if (chatScreen) {
            chatScreen.classList.add('active');
            console.log('Added active class to chat screen');
        }
        
        if (currentUserSpan) {
            currentUserSpan.textContent = this.currentUser;
            console.log('Set current user text to:', this.currentUser);
        }
        
        this.updateRoomsList();
    }

    updateRoomsList() {
        const roomList = document.getElementById('room-list');
        roomList.innerHTML = '';

        this.rooms.forEach((room, roomId) => {
            const roomElement = document.createElement('div');
            roomElement.className = 'room-item';
            roomElement.dataset.roomId = roomId;
            
            if (this.currentRoom === roomId) {
                roomElement.classList.add('active');
            }

            roomElement.innerHTML = `
                <div class="room-name">${room.name}</div>
                <div class="room-users">${room.users.size} users</div>
            `;

            roomElement.addEventListener('click', () => this.joinRoom(roomId));
            roomList.appendChild(roomElement);
        });
    }

    updateUsersList() {
        const userList = document.getElementById('user-list');
        userList.innerHTML = '';

        this.users.forEach((user, username) => {
            if (user.isOnline) {
                const userElement = document.createElement('div');
                userElement.className = 'user-item';
                
                if (username === this.currentUser) {
                    userElement.classList.add('current-user');
                }

                userElement.innerHTML = `
                    <div class="user-status"></div>
                    <span>${username}</span>
                `;

                userList.appendChild(userElement);
            }
        });
    }

    joinRoom(roomId) {
        if (!this.rooms.has(roomId)) {
            this.showNotification('Room not found', 'error');
            return;
        }

        // Leave current room
        if (this.currentRoom) {
            this.rooms.get(this.currentRoom).users.delete(this.currentUser);
        }

        // Join new room
        this.currentRoom = roomId;
        this.rooms.get(roomId).users.add(this.currentUser);

        // Update UI
        this.updateRoomsList();
        this.updateRoomInfo();
        this.loadMessages();
        this.enableMessageInput();

        this.showNotification(`Joined room: ${this.rooms.get(roomId).name}`, 'info');
    }

    updateRoomInfo() {
        const room = this.rooms.get(this.currentRoom);
        document.getElementById('current-room').textContent = room.name;
        document.getElementById('room-users-count').textContent = `${room.users.size} users`;
    }

    loadMessages() {
        const messagesContainer = document.getElementById('messages');
        messagesContainer.innerHTML = '';

        const roomMessages = this.messages.get(this.currentRoom) || [];
        
        if (roomMessages.length === 0) {
            messagesContainer.innerHTML = `
                <div class="welcome-message">
                    <i class="fas fa-comments"></i>
                    <h3>Welcome to ${this.rooms.get(this.currentRoom).name}!</h3>
                    <p>Start a conversation by sending a message</p>
                </div>
            `;
            return;
        }

        roomMessages.forEach(message => {
            this.displayMessage(message);
        });

        this.scrollToBottom();
    }

    displayMessage(message) {
        const messagesContainer = document.getElementById('messages');
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        
        if (message.username === this.currentUser) {
            messageElement.classList.add('own');
        }

        const timeString = new Date(message.timestamp).toLocaleTimeString();
        
        messageElement.innerHTML = `
            <div class="message-header">
                <span class="message-author">${message.username}</span>
                <span class="message-time">${timeString}</span>
            </div>
            <div class="message-content">${this.formatMessage(message.content)}</div>
        `;

        messagesContainer.appendChild(messageElement);
        
        // Remove welcome message if it exists
        const welcomeMessage = messagesContainer.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }
    }

    formatMessage(content) {
        // Convert URLs to links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        content = content.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
        
        // Convert **text** to bold
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Convert *text* to italic
        content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Convert __text__ to underline
        content = content.replace(/__(.*?)__/g, '<u>$1</u>');
        
        // Convert `code` to code formatting
        content = content.replace(/`(.*?)`/g, '<code>$1</code>');
        
        return content;
    }

    sendMessage() {
        const input = document.getElementById('message-input');
        const content = input.value.trim();

        if (!content) {
            this.showNotification('Please enter a message', 'error');
            return;
        }

        if (!this.currentRoom) {
            this.showNotification('Please select a room first', 'error');
            return;
        }

        const message = {
            id: Date.now(),
            username: this.currentUser,
            content: content,
            timestamp: new Date(),
            roomId: this.currentRoom
        };

        // Add message to room
        this.messages.get(this.currentRoom).push(message);
        
        // Display message
        this.displayMessage(message);
        
        // Clear input
        input.value = '';
        
        // Scroll to bottom
        this.scrollToBottom();
        
        // Simulate WebSocket message
        this.socket.send(JSON.stringify({
            type: 'message',
            data: message
        }));

        // Simulate notification sound (you can add actual sound here)
        this.playNotificationSound();
    }

    enableMessageInput() {
        const input = document.getElementById('message-input');
        const sendBtn = document.getElementById('send-btn');
        
        input.disabled = false;
        sendBtn.disabled = false;
        input.placeholder = 'Type your message...';
        input.focus();
    }

    disableMessageInput() {
        const input = document.getElementById('message-input');
        const sendBtn = document.getElementById('send-btn');
        
        input.disabled = true;
        sendBtn.disabled = true;
        input.placeholder = 'Select a room to start chatting...';
    }

    disableMessageInput() {
        const input = document.getElementById('message-input');
        const sendBtn = document.getElementById('send-btn');
        
        input.disabled = true;
        sendBtn.disabled = true;
        input.placeholder = 'Select a room to start chatting...';
        input.value = '';
    }

    showCreateRoomModal() {
        document.getElementById('create-room-modal').classList.add('active');
        document.getElementById('room-name-input').focus();
    }

    hideCreateRoomModal() {
        document.getElementById('create-room-modal').classList.remove('active');
        document.getElementById('room-name-input').value = '';
        document.getElementById('room-description').value = '';
    }

    createRoom() {
        const roomName = document.getElementById('room-name-input').value.trim();
        const roomDescription = document.getElementById('room-description').value.trim();

        if (!roomName) {
            this.showNotification('Please enter a room name', 'error');
            return;
        }

        if (roomName.length < 3) {
            this.showNotification('Room name must be at least 3 characters long', 'error');
            return;
        }

        // Check if room name already exists
        const existingRoom = Array.from(this.rooms.values()).find(room => 
            room.name.toLowerCase() === roomName.toLowerCase()
        );

        if (existingRoom) {
            this.showNotification('Room name already exists', 'error');
            return;
        }

        const roomId = roomName.toLowerCase().replace(/\s+/g, '-');
        
        const newRoom = {
            id: roomId,
            name: roomName,
            description: roomDescription || 'No description',
            users: new Set(),
            createdBy: this.currentUser,
            createdAt: new Date()
        };

        this.rooms.set(roomId, newRoom);
        this.messages.set(roomId, []);
        
        this.hideCreateRoomModal();
        this.updateRoomsList();
        this.showNotification(`Room "${roomName}" created successfully!`, 'success');
        
        // Simulate WebSocket message
        this.socket.send(JSON.stringify({
            type: 'room_created',
            data: newRoom
        }));
    }

    toggleFormatting() {
        this.isFormattingEnabled = !this.isFormattingEnabled;
        const toolbar = document.getElementById('formatting-toolbar');
        const button = document.getElementById('toggle-formatting');
        
        if (this.isFormattingEnabled) {
            toolbar.classList.add('active');
            button.classList.add('active');
        } else {
            toolbar.classList.remove('active');
            button.classList.remove('active');
        }
    }

    toggleEmojiPicker() {
        const picker = document.getElementById('emoji-picker');
        picker.classList.toggle('active');
    }

    applyFormatting(format) {
        const input = document.getElementById('message-input');
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const selectedText = input.value.substring(start, end);
        
        if (!selectedText) {
            this.showNotification('Please select text to format', 'error');
            return;
        }

        let formattedText = '';
        switch (format) {
            case 'bold':
                formattedText = `**${selectedText}**`;
                break;
            case 'italic':
                formattedText = `*${selectedText}*`;
                break;
            case 'underline':
                formattedText = `__${selectedText}__`;
                break;
            case 'code':
                formattedText = `\`${selectedText}\``;
                break;
        }

        input.value = input.value.substring(0, start) + formattedText + input.value.substring(end);
        input.focus();
        input.setSelectionRange(start, start + formattedText.length);
    }

    insertEmoji(emoji) {
        const input = document.getElementById('message-input');
        const cursorPosition = input.selectionStart;
        const currentValue = input.value;
        
        input.value = currentValue.substring(0, cursorPosition) + emoji + currentValue.substring(cursorPosition);
        input.focus();
        input.setSelectionRange(cursorPosition + emoji.length, cursorPosition + emoji.length);
        
        document.getElementById('emoji-picker').classList.remove('active');
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    clearMessages() {
        document.getElementById('messages').innerHTML = `
            <div class="welcome-message">
                <i class="fas fa-comments"></i>
                <h3>Welcome to ChatApp!</h3>
                <p>Select a room from the sidebar to start chatting</p>
            </div>
        `;
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    playNotificationSound() {
        // You can implement actual sound notification here
        // For now, we'll just use a visual feedback
        document.getElementById('send-btn').style.transform = 'scale(0.95)';
        setTimeout(() => {
            document.getElementById('send-btn').style.transform = 'scale(1)';
        }, 100);
    }

    handleUserJoined(data) {
        this.users.set(data.username.toLowerCase(), {
            username: data.username,
            joinedAt: new Date(),
            isOnline: true
        });
        
        this.updateUsersList();
        
        if (data.username !== this.currentUser) {
            this.showNotification(`${data.username} joined the chat`, 'info');
        }
    }

    handleUserLeft(data) {
        this.users.delete(data.username.toLowerCase());
        
        // Remove user from all rooms
        this.rooms.forEach(room => {
            room.users.delete(data.username);
        });
        
        this.updateUsersList();
        this.updateRoomsList();
        
        if (data.username !== this.currentUser) {
            this.showNotification(`${data.username} left the chat`, 'info');
        }
    }

    handleNewMessage(message) {
        if (message.username !== this.currentUser && message.roomId === this.currentRoom) {
            this.displayMessage(message);
            this.scrollToBottom();
            this.playNotificationSound();
        }
    }

    handleRoomCreated(room) {
        if (room.createdBy !== this.currentUser) {
            this.showNotification(`New room created: ${room.name}`, 'info');
        }
    }

    // Utility method to validate input
    validateInput(input, minLength = 1, maxLength = 100) {
        const value = input.trim();
        return value.length >= minLength && value.length <= maxLength;
    }

    // Method to handle connection issues
    handleConnectionError() {
        this.showNotification('Connection lost. Please refresh the page.', 'error');
    }

    // Method to handle rate limiting
    handleRateLimit() {
        this.showNotification('Sending messages too fast. Please slow down.', 'error');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Simple initialization');
    
    // Initialize the app
    let chatApp;
    
    try {
        chatApp = new ChatApp();
        console.log('ChatApp initialized successfully');
    } catch (error) {
        console.error('Error initializing ChatApp:', error);
        
        // Fallback: Simple direct event handling
        console.log('Using fallback event handling');
        const joinBtn = document.getElementById('join-btn');
        const usernameInput = document.getElementById('username-input');
        
        if (joinBtn && usernameInput) {
            joinBtn.onclick = function() {
                console.log('Fallback: Join button clicked');
                const username = usernameInput.value.trim();
                
                if (!username) {
                    alert('Please enter a username');
                    return;
                }
                
                if (username.length < 3) {
                    alert('Username must be at least 3 characters long');
                    return;
                }
                
                // Simple screen switch
                document.getElementById('login-screen').classList.remove('active');
                document.getElementById('chat-screen').classList.add('active');
                document.getElementById('current-user').textContent = username;
                
                console.log('Fallback: Screen switched successfully');
            };
        }
        return; // Exit early if fallback is used
    }
    
    // Double-check event listeners
    setTimeout(() => {
        const joinBtn = document.getElementById('join-btn');
        const usernameInput = document.getElementById('username-input');
        
        if (joinBtn) {
            console.log('Adding backup event listener to join button');
            joinBtn.addEventListener('click', function(e) {
                console.log('Backup event listener triggered');
                e.preventDefault();
                e.stopPropagation();
                if (chatApp && typeof chatApp.handleLogin === 'function') {
                    chatApp.handleLogin();
                } else {
                    console.error('ChatApp or handleLogin not available');
                }
            });
        }
        
        if (usernameInput) {
            usernameInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    console.log('Enter key pressed in username input');
                    if (chatApp && typeof chatApp.handleLogin === 'function') {
                        chatApp.handleLogin();
                    }
                }
            });
        }
    }, 500);
    
    // Handle browser events
    window.addEventListener('beforeunload', () => {
        if (chatApp && chatApp.currentUser) {
            chatApp.handleLogout();
        }
    });
    
    window.addEventListener('online', () => {
        if (chatApp && typeof chatApp.showNotification === 'function') {
            chatApp.showNotification('Connection restored', 'success');
        }
    });
    
    window.addEventListener('offline', () => {
        if (chatApp && typeof chatApp.showNotification === 'function') {
            chatApp.showNotification('Connection lost', 'error');
        }
    });
});

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatApp;
}

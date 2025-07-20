/* ==========================================
   SkillSync AI - Socket.io Client Module
   Real-time Communication System
   ========================================== */

class SocketManager {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 5000;
        this.messageQueue = [];
        this.eventListeners = new Map();
        this.typingTimeouts = new Map();
        this.onlineUsers = new Set();
        this.currentRoom = null;
        this.serverUrl = this.getServerUrl();
        this.init();
    }

    init() {
        console.log('🔌 SkillSync Socket Manager Initializing...');
        this.setupConnectionMonitoring();
        this.initializeSocket();
    }

    // ==========================================
    // Socket Connection Management
    // ==========================================

    getServerUrl() {
        return window.location.hostname === 'localhost' 
            ? 'http://localhost:8000' 
            : 'https://skillsync-api.vercel.app';
    }

    initializeSocket() {
        try {
            const token = localStorage.getItem('skillsync_token') || 
                         window.authManager?.getAuthToken();

            if (!token && this.requiresAuth()) {
                console.warn('🔌 No auth token available for socket connection');
                return;
            }

            this.socket = io(this.serverUrl, {
                auth: {
                    token: token
                },
                transports: ['websocket', 'polling'],
                timeout: 20000,
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                maxHttpBufferSize: 1e6,
                pingTimeout: 60000,
                pingInterval: 25000
            });

            this.setupSocketEventListeners();
            console.log('🔌 Socket.io client initialized');

        } catch (error) {
            console.error('Failed to initialize socket:', error);
            this.handleConnectionError(error);
        }
    }

    setupSocketEventListeners() {
        // Connection Events
        this.socket.on('connect', () => {
            console.log('📝 Connected to SkillSync AI server');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.updateConnectionStatus(true);
            this.authenticateUser();
            this.processMessageQueue();
            this.emitUserOnline();
        });

        this.socket.on('disconnect', (reason) => {
            console.log(`❌ Disconnected from server: ${reason}`);
            this.isConnected = false;
            this.updateConnectionStatus(false);
            this.handleDisconnection(reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('🔌 Connection error:', error);
            this.handleConnectionError(error);
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
            this.updateConnectionStatus(true);
        });

        this.socket.on('reconnect_error', (error) => {
            console.error('🔄 Reconnection failed:', error);
            this.reconnectAttempts++;
            
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                this.showConnectionFailedMessage();
            }
        });

        // Authentication Events
        this.socket.on('authenticated', (data) => {
            console.log('🔐 Socket authenticated:', data.user);
            this.currentUser = data.user;
            this.joinUserRoom();
            this.setupUserSpecificListeners();
        });

        this.socket.on('authentication_error', (error) => {
            console.error('🔐 Authentication failed:', error);
            this.handleAuthenticationError(error);
        });

        // Real-time Application Events
        this.setupApplicationEventListeners();
    }

    setupApplicationEventListeners() {
        // Match Events
        this.socket.on('new_match', (data) => {
            console.log('🎯 New match received:', data);
            this.handleNewMatch(data);
        });

        this.socket.on('match_accepted', (data) => {
            console.log('📝 Match accepted:', data);
            this.handleMatchAccepted(data);
        });

        this.socket.on('match_declined', (data) => {
            console.log('❌ Match declined:', data);
            this.handleMatchDeclined(data);
        });

        // Message Events
        this.socket.on('new_message', (data) => {
            console.log('💬 New message received:', data);
            this.handleNewMessage(data);
        });

        this.socket.on('message_delivered', (data) => {
            this.handleMessageDelivered(data);
        });

        this.socket.on('message_read', (data) => {
            this.handleMessageRead(data);
        });

        this.socket.on('typing_start', (data) => {
            this.handleTypingStart(data);
        });

        this.socket.on('typing_stop', (data) => {
            this.handleTypingStop(data);
        });

        // User Status Events
        this.socket.on('user_online', (data) => {
            console.log('🟢 User came online:', data.userId);
            this.onlineUsers.add(data.userId);
            this.updateUserStatus(data.userId, 'online');
        });

        this.socket.on('user_offline', (data) => {
            console.log('🔴 User went offline:', data.userId);
            this.onlineUsers.delete(data.userId);
            this.updateUserStatus(data.userId, 'offline');
        });

        // Notification Events
        this.socket.on('notification', (data) => {
            console.log('🔔 Notification received:', data);
            this.handleNotification(data);
        });

        // System Events
        this.socket.on('system_announcement', (data) => {
            console.log('📢 System announcement:', data);
            this.handleSystemAnnouncement(data);
        });

        this.socket.on('maintenance_mode', (data) => {
            console.log('⚠️ Maintenance mode:', data);
            this.handleMaintenanceMode(data);
        });
    }

    // ==========================================
    // Authentication & User Management
    // ==========================================

    authenticateUser() {
        const token = localStorage.getItem('skillsync_token');
        const user = window.authManager?.getCurrentUser();

        if (token && user) {
            this.socket.emit('authenticate', {
                token: token,
                user: {
                    id: user.id,
                    name: user.name,
                    type: user.user_type,
                    avatar: user.avatar
                }
            });
        }
    }

    joinUserRoom() {
        if (this.currentUser) {
            const roomName = `user_${this.currentUser.id}`;
            this.socket.emit('join_room', roomName);
            console.log(`🏠 Joined personal room: ${roomName}`);
        }
    }

    emitUserOnline() {
        if (this.currentUser) {
            this.socket.emit('user_status', {
                userId: this.currentUser.id,
                status: 'online',
                lastSeen: new Date().toISOString()
            });
        }
    }

    requiresAuth() {
        // Check if current page requires authentication
        const authRequiredPages = ['/dashboard', '/chat', '/matches'];
        return authRequiredPages.some(page => window.location.pathname.includes(page));
    }

    // ==========================================
    // Real-time Messaging
    // ==========================================

    sendMessage(chatId, content, messageType = 'text') {
        if (!this.isConnected) {
            this.queueMessage('send_message', { chatId, content, messageType });
            return;
        }

        const messageData = {
            chatId: chatId,
            content: content,
            type: messageType,
            timestamp: new Date().toISOString(),
            tempId: this.generateTempId()
        };

        this.socket.emit('send_message', messageData);
        
        // Add message to UI optimistically
        this.addMessageToUI({
            ...messageData,
            sender: this.currentUser,
            status: 'sending'
        });

        return messageData.tempId;
    }

    sendTypingIndicator(chatId, isTyping = true) {
        if (!this.isConnected) return;

        this.socket.emit('typing', {
            chatId: chatId,
            isTyping: isTyping,
            userId: this.currentUser?.id
        });

        // Auto-stop typing after 3 seconds
        if (isTyping) {
            clearTimeout(this.typingTimeouts.get(chatId));
            this.typingTimeouts.set(chatId, setTimeout(() => {
                this.sendTypingIndicator(chatId, false);
            }, 3000));
        }
    }

    markMessageAsRead(messageId, chatId) {
        if (!this.isConnected) return;

        this.socket.emit('mark_read', {
            messageId: messageId,
            chatId: chatId,
            userId: this.currentUser?.id,
            readAt: new Date().toISOString()
        });
    }

    // ==========================================
    // Match System Integration
    // ==========================================

    sendMatchAction(matchId, action, data = {}) {
        if (!this.isConnected) {
            this.queueMessage('match_action', { matchId, action, data });
            return;
        }

        this.socket.emit('match_action', {
            matchId: matchId,
            action: action, // 'accept', 'decline', 'connect'
            userId: this.currentUser?.id,
            ...data
        });
    }

    requestMatches(preferences = {}) {
        if (!this.isConnected) return;

        this.socket.emit('request_matches', {
            userId: this.currentUser?.id,
            preferences: preferences,
            timestamp: new Date().toISOString()
        });
    }

    updateProfile(profileData) {
        if (!this.isConnected) return;

        this.socket.emit('profile_update', {
            userId: this.currentUser?.id,
            updates: profileData,
            timestamp: new Date().toISOString()
        });
    }

    // ==========================================
    // Event Handlers
    // ==========================================

    handleNewMatch(data) {
        // Show new match notification
        this.showNotification(`🎯 New ${data.matchScore}% match found!`, 'success');
        
        // Play notification sound
        this.playNotificationSound();
        
        // Add to matches list
        if (window.app && window.app.handleNewMatch) {
            window.app.handleNewMatch(data);
        }
        
        // Update match counter
        this.updateMatchCounter();
    }

    handleMatchAccepted(data) {
        this.showNotification(`📝 ${data.userName} accepted your connection!`, 'success');
        
        // Enable chat if not alcreate enabled
        this.createChatRoom(data.chatId, data.userId);
        
        // Trigger callback if provided
        this.triggerCallback('match_accepted', data);
    }

    handleMatchDeclined(data) {
        this.showNotification(`Match with ${data.userName} was declined`, 'info');
        
        // Remove from matches list
        this.removeMatchFromUI(data.matchId);
        
        // Trigger callback
        this.triggerCallback('match_declined', data);
    }

    handleNewMessage(data) {
        // Add message to chat UI
        this.addMessageToUI(data);
        
        // Show notification if chat not active
        if (!this.isChatActive(data.chatId)) {
            this.showMessageNotification(data);
            this.playNotificationSound();
        }
        
        // Update unread counter
        this.updateUnreadCounter(data.chatId);
        
        // Mark as delivered
        this.socket.emit('message_delivered', {
            messageId: data.id,
            chatId: data.chatId
        });
    }

    handleMessageDelivered(data) {
        // Update message status in UI
        this.updateMessageStatus(data.messageId, 'delivered');
    }

    handleMessageRead(data) {
        // Update message status in UI
        this.updateMessageStatus(data.messageId, 'read');
        
        // Clear unread indicators
        this.clearUnreadIndicators(data.chatId);
    }

    handleTypingStart(data) {
        if (data.userId !== this.currentUser?.id) {
            this.showTypingIndicator(data.chatId, data.userName);
        }
    }

    handleTypingStop(data) {
        if (data.userId !== this.currentUser?.id) {
            this.hideTypingIndicator(data.chatId, data.userName);
        }
    }

    handleNotification(data) {
        this.showNotification(data.message, data.type, data.duration);
        
        if (data.action) {
            // Add action button to notification
            this.addNotificationAction(data);
        }
    }

    handleSystemAnnouncement(data) {
        this.showSystemMessage(data.message, data.priority);
        
        if (data.requiresAction) {
            this.showSystemModal(data);
        }
    }

    handleMaintenanceMode(data) {
        this.showMaintenanceWarning(data);
        
        // Prepare for graceful shutdown
        this.prepareForMaintenance(data.scheduledTime);
    }

    // ==========================================
    // UI Integration Methods
    // ==========================================

    addMessageToUI(messageData) {
        const chatContainer = document.querySelector(`[data-chat-id="${messageData.chatId}"]`);
        if (!chatContainer) return;

        const messageElement = this.createMessageElement(messageData);
        const messagesContainer = chatContainer.querySelector('.chat-messages');
        
        if (messagesContainer) {
            messagesContainer.appendChild(messageElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            // Animate message appearance
            this.animateMessageAppearance(messageElement);
        }
    }

    createMessageElement(messageData) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${messageData.sender?.id === this.currentUser?.id ? 'sent' : 'received'}`;
        messageDiv.dataset.messageId = messageData.id || messageData.tempId;
        messageDiv.dataset.status = messageData.status || 'sent';

        messageDiv.innerHTML = `
            <div class="message-content">
                ${this.formatMessageContent(messageData.content, messageData.type)}
            </div>
            <div class="message-meta">
                <span class="message-time">${this.formatTime(messageData.timestamp)}</span>
                ${messageData.sender?.id === this.currentUser?.id ? 
                    `<span class="message-status ${messageData.status || 'sent'}">
                        <i class="fas fa-${this.getStatusIcon(messageData.status)}"></i>
                    </span>` : ''
                }
            </div>
        `;

        return messageDiv;
    }

    formatMessageContent(content, type) {
        switch (type) {
            case 'text':
                return this.escapeHtml(content).replace(/\n/g, '<br>');
            case 'image':
                return `<img src="${content}" alt="Shared image" class="message-image">`;
            case 'file':
                return `<a href="${content.url}" class="message-file">
                    <i class="fas fa-file"></i> ${content.name}
                </a>`;
            default:
                return this.escapeHtml(content);
        }
    }

    showTypingIndicator(chatId, userName) {
        const chatContainer = document.querySelector(`[data-chat-id="${chatId}"]`);
        if (!chatContainer) return;

        let typingIndicator = chatContainer.querySelector('.typing-indicator');
        if (!typingIndicator) {
            typingIndicator = document.createElement('div');
            typingIndicator.className = 'typing-indicator';
            const messagesContainer = chatContainer.querySelector('.chat-messages');
            messagesContainer.appendChild(typingIndicator);
        }

        typingIndicator.innerHTML = `
            <div class="typing-animation">
                <span>${userName} is typing</span>
                <div class="typing-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;

        // Auto-scroll to show typing indicator
        const messagesContainer = chatContainer.querySelector('.chat-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator(chatId, userName) {
        const chatContainer = document.querySelector(`[data-chat-id="${chatId}"]`);
        if (!chatContainer) return;

        const typingIndicator = chatContainer.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    updateUserStatus(userId, status) {
        const userElements = document.querySelectorAll(`[data-user-id="${userId}"]`);
        userElements.forEach(element => {
            const statusIndicator = element.querySelector('.status-indicator');
            if (statusIndicator) {
                statusIndicator.className = `status-indicator ${status}`;
                statusIndicator.title = status === 'online' ? 'Online' : 'Offline';
            }
        });
    }

    updateConnectionStatus(isConnected) {
        const statusIndicators = document.querySelectorAll('.connection-status');
        statusIndicators.forEach(indicator => {
            indicator.className = `connection-status ${isConnected ? 'online' : 'offline'}`;
            indicator.textContent = isConnected ? 'Connected' : 'Reconnecting...';
        });

        // Update page visibility
        if (!isConnected) {
            this.showOfflineMode();
        } else {
            this.hideOfflineMode();
        }
    }

    // ==========================================
    // Utility Methods
    // ==========================================

    queueMessage(event, data) {
        this.messageQueue.push({ event, data, timestamp: Date.now() });
        console.log(`📬 Message queued: ${event}`);
        
        // Show offline indicator
        this.showNotification('Message queued - will send when reconnected', 'info', 3000);
    }

    processMessageQueue() {
        console.log(`📮 Processing ${this.messageQueue.length} queued messages`);
        
        while (this.messageQueue.length > 0) {
            const { event, data } = this.messageQueue.shift();
            this.socket.emit(event, data);
        }
    }

    generateTempId() {
        return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    formatTime(timestamp) {
        const now = new Date();
        const messageTime = new Date(timestamp);
        const diffInMinutes = (now - messageTime) / (1000 * 60);

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        
        return messageTime.toLocaleDateString();
    }

    getStatusIcon(status) {
        const icons = {
            sending: 'clock',
            sent: 'check',
            delivered: 'check-double',
            read: 'check-double text-blue'
        };
        return icons[status] || 'clock';
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    showNotification(message, type = 'info', duration = 5000) {
        if (window.app && window.app.showNotification) {
            window.app.showNotification(message, type, duration);
        } else {
            console.log(`🔔 ${type.toUpperCase()}: ${message}`);
        }
    }

    playNotificationSound() {
        try {
            const audio = new Audio('/assets/sounds/notification.mp3');
            audio.volume = 0.3;
            audio.play().catch(() => {
                // Fallback to system beep or ignore if autoplay is blocked
                console.log('🔇 Notification sound blocked by browser');
            });
        } catch (error) {
            console.warn('Failed to play notification sound:', error);
        }
    }

    animateMessageAppearance(messageElement) {
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(20px)';
        
        requestAnimationFrame(() => {
            messageElement.style.transition = 'all 0.3s ease';
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
        });
    }

    // ==========================================
    // Connection Monitoring
    // ==========================================

    setupConnectionMonitoring() {
        // Monitor network status
        window.addEventListener('online', () => {
            console.log('🌐 Network back online');
            this.handleNetworkOnline();
        });

        window.addEventListener('offline', () => {
            console.log('🌐 Network went offline');
            this.handleNetworkOffline();
        });

        // Monitor page visibility
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.handlePageVisible();
            } else {
                this.handlePageHidden();
            }
        });

        // Heartbeat to detect connection issues
        this.startHeartbeat();
    }

    startHeartbeat() {
        setInterval(() => {
            if (this.socket && this.isConnected) {
                this.socket.emit('heartbeat', { timestamp: Date.now() });
            }
        }, 30000); // Every 30 seconds

        if (this.socket) {
            this.socket.on('heartbeat_ack', (data) => {
                const latency = Date.now() - data.timestamp;
                this.updateLatency(latency);
            });
        }
    }

    handleNetworkOnline() {
        if (!this.isConnected && this.socket) {
            this.socket.connect();
        }
        this.showNotification('Network connection restored', 'success', 2000);
    }

    handleNetworkOffline() {
        this.showNotification('Network connection lost', 'warning', 3000);
        this.showOfflineMode();
    }

    handlePageVisible() {
        // Refresh connection when page becomes visible
        if (this.socket && !this.isConnected) {
            this.socket.connect();
        }
    }

    handlePageHidden() {
        // Optional: Reduce connection frequency when page is hidden
        console.log('📱 Page hidden - reducing socket activity');
    }

    // ==========================================
    // Error Handling
    // ==========================================

    handleConnectionError(error) {
        console.error('🔌 Socket connection error:', error);
        
        if (error.message.includes('authentication')) {
            this.handleAuthenticationError(error);
        } else if (error.message.includes('timeout')) {
            this.showNotification('Connection timeout - retrying...', 'warning', 3000);
        } else {
            this.showNotification('Connection failed - check your network', 'error', 5000);
        }
    }

    handleAuthenticationError(error) {
        console.error('🔐 Authentication error:', error);
        this.showNotification('Authentication failed - please login again', 'error', 5000);
        
        // Redirect to login if authentication fails
        if (window.authManager) {
            window.authManager.logout();
        }
    }

    handleDisconnection(reason) {
        if (reason === 'io server disconnect') {
            // Server initiated disconnect
            this.showNotification('Disconnected by server', 'warning', 3000);
        } else if (reason === 'transport close') {
            // Network issues
            this.showNotification('Connection lost - reconnecting...', 'info', 3000);
        }
    }

    showConnectionFailedMessage() {
        this.showNotification(
            'Failed to connect after multiple attempts. Please check your connection and refresh the page.', 
            'error', 
            10000
        );
    }

    // ==========================================
    // Public API Methods
    // ==========================================

    connect() {
        if (this.socket && !this.isConnected) {
            this.socket.connect();
        } else if (!this.socket) {
            this.initializeSocket();
        }
    }

    disconnect() {
        if (this.socket && this.isConnected) {
            this.socket.disconnect();
        }
    }

    isSocketConnected() {
        return this.isConnected;
    }

    getOnlineUsers() {
        return Array.from(this.onlineUsers);
    }

    joinRoom(roomName) {
        if (this.isConnected) {
            this.socket.emit('join_room', roomName);
            this.currentRoom = roomName;
        }
    }

    leaveRoom(roomName) {
        if (this.isConnected) {
            this.socket.emit('leave_room', roomName);
            if (this.currentRoom === roomName) {
                this.currentRoom = null;
            }
        }
    }

    // Custom event listener system
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const callbacks = this.eventListeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    triggerCallback(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} callback:`, error);
                }
            });
        }
    }

    // Cleanup
    cleanup() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.eventListeners.clear();
        this.typingTimeouts.clear();
        this.messageQueue = [];
    }
}

// Initialize Socket Manager
const socketManager = new SocketManager();

// Export for global access
window.socketManager = socketManager;
window.socket = socketManager;

// Setup cleanup on page unload
window.addEventListener('beforeunload', () => {
    socketManager.cleanup();
});

console.log(`
🔌 SkillSync AI Socket Manager Loaded
⚡ Real-time Communication System create  
💬 Instant Messaging Capabilities Active
🎯 Match Notifications Enabled
🔔 Push Notifications Configured
`);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SocketManager;
}

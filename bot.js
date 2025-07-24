// studentai.js - Enhanced Student AI Chat Bot with Chat Reset & Professional UI

class StudentAIChatBot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.conversationHistory = [];
        // Gemini API Configuration
        this.GEMINI_API_KEY = 'AIzaSyAY2a_gtsVhymOw9G_AS_vM5AAHfxgtKJU'; // Replace with your actual API key
        this.GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        this.init();
    }

    init() {
        this.createChatBot();
        this.addStyles();
        this.bindEvents();
        this.loadWelcomeMessage();
    }

    createChatBot() {
        const chatBotHTML = `
            <!-- Enhanced Chat Toggle Button -->
            <div class="chat-widget-container">
                <button class="chat-toggle-btn" id="chatToggleBtn">
                    <div class="chat-icon">
                        <i class="fas fa-comments"></i>
                    </div>
                    <div class="chat-badge" id="chatBadge">
                        <span>AI</span>
                    </div>
                </button>
                
                <!-- Professional notification popup -->
                <div class="chat-notification" id="chatNotification">
                    <div class="notification-content">
                        <i class="fas fa-robot"></i>
                        <span>Hi! Need help with your career?</span>
                    </div>
                </div>
            </div>

            <!-- Enhanced Chat Box Container -->
            <div id="chatBox" class="chat-box-container">
                <div class="chat-box-header">
                    <div class="chat-header-info">
                        <div class="bot-avatar">
                            <div class="avatar-inner">
                                <i class="fas fa-graduation-cap"></i>
                            </div>
                            <div class="online-indicator"></div>
                        </div>
                        <div class="bot-info">
                            <h4>StudentAI Assistant</h4>
                            <p class="status">
                                <span class="status-text">Powered by SkillSync</span>
                            </p>
                        </div>
                    </div>
                    <div class="chat-header-actions">
                        <button class="action-btn minimize-btn" id="minimizeBtn" title="Minimize">
                            <i class="fas fa-minus"></i>
                        </button>
                        <button class="action-btn refresh-btn" id="refreshBtn" title="New Chat">
                            <i class="fas fa-refresh"></i>
                        </button>
                        <button class="action-btn close-btn" id="closeChatBtn" title="Close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div id="chatMessages" class="chat-messages">
                    <div class="chat-placeholder" id="chatPlaceholder">
                        <div class="placeholder-content">
                            <div class="placeholder-icon">
                                <i class="fas fa-robot"></i>
                            </div>
                            <h3>Welcome to StudentAI!</h3>
                            <p>Your personal AI assistant for career growth</p>
                            <div class="quick-actions">
                                <button class="quick-btn" onclick="window.studentAI.sendQuickMessage('How can I improve my skills?')">
                                    <i class="fas fa-chart-line"></i> Improve Skills
                                </button>
                                <button class="quick-btn" onclick="window.studentAI.sendQuickMessage('Help me find jobs')">
                                    <i class="fas fa-briefcase"></i> Find Jobs
                                </button>
                                <button class="quick-btn" onclick="window.studentAI.sendQuickMessage('Give me startup ideas')">
                                    <i class="fas fa-lightbulb"></i> Startup Ideas
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div id="typingIndicator" class="typing-indicator">
                    <div class="typing-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="typing-content">
                        <div class="typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <span class="typing-text">StudentAI is thinking...</span>
                    </div>
                </div>
                
                <div class="chat-input-container">
                    <div class="chat-input-wrapper">
                        <div class="input-group">
                            <input id="chatInput" type="text" placeholder="Type your message..." autocomplete="off">
                            <button id="emojiBtn" class="emoji-btn" title="Emoji">
                                <i class="fas fa-smile"></i>
                            </button>
                        </div>
                        <button id="sendBtn" class="send-btn">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                    <div class="input-footer">
                        <span class="footer-text">Powered by SkillSync</span>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatBotHTML);
    }

    addStyles() {
        const styles = `
            <style>
                /* Chat Widget Container */
                .chat-widget-container {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 9999;
                }

                /* Enhanced Chat Toggle Button */
                .chat-toggle-btn {
                    position: relative;
                    width: 64px;
                    height: 64px;
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
                    border: none;
                    border-radius: 50%;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    box-shadow: 0 8px 32px rgba(99, 102, 241, 0.4);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }

                .chat-toggle-btn::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
                    border-radius: 50%;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .chat-toggle-btn:hover {
                    transform: scale(1.1) rotate(5deg);
                    box-shadow: 0 12px 48px rgba(99, 102, 241, 0.6);
                }

                .chat-toggle-btn:hover::before {
                    opacity: 1;
                }

                .chat-toggle-btn.hidden {
                    transform: scale(0);
                    opacity: 0;
                    pointer-events: none;
                }

                .chat-icon {
                    transition: transform 0.3s ease;
                }

                .chat-toggle-btn:hover .chat-icon {
                    transform: scale(1.1);
                }

                .chat-badge {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: linear-gradient(135deg, #f59e0b, #ef4444);
                    color: white;
                    border-radius: 12px;
                    padding: 2px 6px;
                    font-size: 10px;
                    font-weight: bold;
                    animation: pulse 2s infinite;
                }

                /* Chat Notification */
                .chat-notification {
                    position: absolute;
                    bottom: 80px;
                    right: 0;
                    background: white;
                    border-radius: 16px;
                    padding: 12px 16px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.15);
                    min-width: 200px;
                    opacity: 0;
                    transform: translateY(20px);
                    pointer-events: none;
                    transition: all 0.3s ease;
                }

                .chat-notification.show {
                    opacity: 1;
                    transform: translateY(0);
                    pointer-events: all;
                }

                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #374151;
                    font-size: 14px;
                }

                .notification-content i {
                    color: #6366f1;
                }

                /* Enhanced Chat Box Container */
                .chat-box-container {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 400px;
                    height: 600px;
                    background: white;
                    border-radius: 24px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1);
                    display: none;
                    flex-direction: column;
                    z-index: 10000;
                    overflow: hidden;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
                    backdrop-filter: blur(20px);
                }

                .chat-box-container.active {
                    display: flex;
                    animation: chatBoxSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .chat-box-container.minimized {
                    height: 80px;
                }

                @keyframes chatBoxSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(40px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                /* Enhanced Header */
                .chat-box-header {
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    padding: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: relative;
                    overflow: hidden;
                }

                .chat-box-header::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
                    pointer-events: none;
                }

                .chat-header-info {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    position: relative;
                }

                .bot-avatar {
                    position: relative;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                }

                .avatar-inner {
                    color: #6366f1;
                    font-size: 22px;
                }

                .online-indicator {
                    position: absolute;
                    bottom: 2px;
                    right: 2px;
                    width: 12px;
                    height: 12px;
                    background: #10b981;
                    border: 2px solid white;
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                }

                .bot-info h4 {
                    margin: 0;
                    color: white;
                    font-size: 18px;
                    font-weight: 600;
                }

                .status-text {
                    color: rgba(255,255,255,0.8);
                    font-size: 12px;
                }

                .chat-header-actions {
                    display: flex;
                    gap: 8px;
                }

                .action-btn {
                    background: rgba(255,255,255,0.15);
                    border: none;
                    color: white;
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    backdrop-filter: blur(10px);
                }

                .action-btn:hover {
                    background: rgba(255,255,255,0.25);
                    transform: scale(1.05);
                }

                /* Enhanced Messages Area */
                .chat-messages {
                    flex: 1;
                    padding: 0;
                    overflow-y: auto;
                    background: #fafafa;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }

                .chat-messages::-webkit-scrollbar {
                    width: 6px;
                }

                .chat-messages::-webkit-scrollbar-track {
                    background: transparent;
                }

                .chat-messages::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 3px;
                }

                /* Chat Placeholder */
                .chat-placeholder {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    padding: 40px 20px;
                }

                .placeholder-content {
                    text-align: center;
                    max-width: 280px;
                }

                .placeholder-icon {
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    color: white;
                    font-size: 36px;
                    box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);
                }

                .placeholder-content h3 {
                    margin: 0 0 8px;
                    color: #1f2937;
                    font-size: 20px;
                    font-weight: 600;
                }

                .placeholder-content p {
                    margin: 0 0 24px;
                    color: #6b7280;
                    font-size: 14px;
                }

                .quick-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .quick-btn {
                    background: white;
                    border: 1px solid #e5e7eb;
                    color: #374151;
                    padding: 12px 16px;
                    border-radius: 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    transition: all 0.2s ease;
                    text-align: left;
                }

                .quick-btn:hover {
                    background: #f3f4f6;
                    border-color: #6366f1;
                    transform: translateY(-1px);
                }

                .quick-btn i {
                    color: #6366f1;
                    width: 16px;
                }

                /* Enhanced Messages */
                .message {
                    display: flex;
                    gap: 12px;
                    padding: 16px 20px;
                    animation: messageSlideIn 0.4s ease-out;
                }

                @keyframes messageSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .user-message {
                    flex-direction: row-reverse;
                    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
                }

                .bot-message {
                    background: white;
                }

                .message-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 16px;
                    flex-shrink: 0;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }

                .bot-message .message-avatar {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                }

                .user-message .message-avatar {
                    background: linear-gradient(135deg, #10b981, #059669);
                }

                .message-content {
                    max-width: 75%;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .message-bubble {
                    padding: 14px 18px;
                    border-radius: 18px;
                    position: relative;
                    line-height: 1.5;
                }

                .bot-message .message-bubble {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-bottom-left-radius: 6px;
                }

                .user-message .message-bubble {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: white;
                    border-bottom-right-radius: 6px;
                }

                .message-bubble p {
                    margin: 0;
                    font-size: 14px;
                    line-height: 1.5;
                }

                .message-time {
                    font-size: 11px;
                    color: #9ca3af;
                    align-self: flex-end;
                    margin-top: 4px;
                }

                .user-message .message-time {
                    align-self: flex-start;
                    color: rgba(255,255,255,0.7);
                }

                /* Enhanced Typing Indicator */
                .typing-indicator {
                    padding: 16px 20px;
                    background: white;
                    border-top: 1px solid #e5e7eb;
                    display: none;
                    align-items: center;
                    gap: 12px;
                }

                .typing-avatar {
                    width: 32px;
                    height: 32px;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 14px;
                }

                .typing-content {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .typing-dots {
                    display: flex;
                    gap: 4px;
                }

                .typing-dots span {
                    width: 8px;
                    height: 8px;
                    background: #6366f1;
                    border-radius: 50%;
                    animation: typingDots 1.4s infinite;
                }

                .typing-dots span:nth-child(2) {
                    animation-delay: 0.2s;
                }

                .typing-dots span:nth-child(3) {
                    animation-delay: 0.4s;
                }

                @keyframes typingDots {
                    0%, 60%, 100% {
                        transform: translateY(0);
                    }
                    30% {
                        transform: translateY(-8px);
                    }
                }

                .typing-text {
                    color: #6b7280;
                    font-size: 12px;
                }

                /* Enhanced Input Area */
                .chat-input-container {
                    padding: 20px;
                    background: white;
                    border-top: 1px solid #e5e7eb;
                }

                .chat-input-wrapper {
                    display: flex;
                    align-items: flex-end;
                    gap: 12px;
                    background: #f8fafc;
                    border-radius: 24px;
                    padding: 8px;
                    border: 2px solid transparent;
                    transition: all 0.2s ease;
                }

                .chat-input-wrapper:focus-within {
                    border-color: #6366f1;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                .input-group {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                #chatInput {
                    flex: 1;
                    border: none;
                    background: none;
                    outline: none;
                    padding: 12px 16px;
                    font-size: 14px;
                    color: #374151;
                    resize: none;
                    min-height: 20px;
                    max-height: 120px;
                    line-height: 1.5;
                }

                #chatInput::placeholder {
                    color: #9ca3af;
                }

                .emoji-btn {
                    background: none;
                    border: none;
                    color: #6b7280;
                    padding: 8px;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .emoji-btn:hover {
                    background: #f3f4f6;
                    color: #6366f1;
                }

                .send-btn {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    border: none;
                    color: white;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    font-size: 16px;
                    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
                }

                .send-btn:hover {
                    transform: scale(1.05);
                    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
                }

                .send-btn:active {
                    transform: scale(0.95);
                }

                .input-footer {
                    text-align: center;
                    margin-top: 12px;
                }

                .footer-text {
                    color: #9ca3af;
                    font-size: 11px;
                }

                /* Responsive Design */
                @media (max-width: 480px) {
                    .chat-box-container {
                        width: calc(100vw - 20px);
                        height: calc(100vh - 20px);
                        bottom: 10px;
                        right: 10px;
                        left: 10px;
                        border-radius: 20px;
                    }

                    .chat-widget-container {
                        bottom: 15px;
                        right: 15px;
                    }
                }

                /* Animations */
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    bindEvents() {
        const chatToggleBtn = document.getElementById('chatToggleBtn');
        const closeChatBtn = document.getElementById('closeChatBtn');
        const minimizeBtn = document.getElementById('minimizeBtn');
        const refreshBtn = document.getElementById('refreshBtn');
        const sendBtn = document.getElementById('sendBtn');
        const chatInput = document.getElementById('chatInput');

        // Toggle chat open/close
        chatToggleBtn.addEventListener('click', () => {
            this.toggleChat();
        });

        // Close chat and reset
        closeChatBtn.addEventListener('click', () => {
            this.closeAndResetChat();
        });

        // Minimize chat
        minimizeBtn.addEventListener('click', () => {
            this.minimizeChat();
        });

        // Refresh/New chat
        refreshBtn.addEventListener('click', () => {
            this.resetChat();
        });

        // Send message on button click
        sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });

        // Send message on Enter key
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Show notification periodically
        this.showNotificationPeriodically();
    }

    toggleChat() {
        if (this.isOpen) {
            this.closeAndResetChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        const chatBox = document.getElementById('chatBox');
        const toggleBtn = document.getElementById('chatToggleBtn');
        
        chatBox.classList.add('active');
        toggleBtn.classList.add('hidden');
        this.isOpen = true;
        
        // Focus on input
        setTimeout(() => {
            document.getElementById('chatInput').focus();
        }, 400);

        // Hide placeholder if messages exist
        if (this.messages.length > 0) {
            document.getElementById('chatPlaceholder').style.display = 'none';
        }
    }

    closeAndResetChat() {
        const chatBox = document.getElementById('chatBox');
        const toggleBtn = document.getElementById('chatToggleBtn');
        
        chatBox.classList.remove('active');
        toggleBtn.classList.remove('hidden');
        this.isOpen = false;

        // Reset chat after closing
        setTimeout(() => {
            this.resetChat();
        }, 400);
    }

    minimizeChat() {
        const chatBox = document.getElementById('chatBox');
        chatBox.classList.toggle('minimized');
    }

    resetChat() {
        // Clear all messages and conversation history
        this.messages = [];
        this.conversationHistory = [];
        
        // Clear messages container
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.innerHTML = `
            <div class="chat-placeholder" id="chatPlaceholder">
                <div class="placeholder-content">
                    <div class="placeholder-icon">
                        <i class="fas fa-robot"></i>
                    </div>
                    <h3>Welcome to StudentAI!</h3>
                    <p>Your personal AI assistant for career growth</p>
                    <div class="quick-actions">
                        <button class="quick-btn" onclick="window.studentAI.sendQuickMessage('How can I improve my skills?')">
                            <i class="fas fa-chart-line"></i> Improve Skills
                        </button>
                        <button class="quick-btn" onclick="window.studentAI.sendQuickMessage('Help me find jobs')">
                            <i class="fas fa-briefcase"></i> Find Jobs
                        </button>
                        <button class="quick-btn" onclick="window.studentAI.sendQuickMessage('Give me startup ideas')">
                            <i class="fas fa-lightbulb"></i> Startup Ideas
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Hide typing indicator
        this.hideTyping();
        
        // Load fresh welcome message after a short delay
        setTimeout(() => {
            this.loadWelcomeMessage();
        }, 500);
    }

    sendQuickMessage(message) {
        // Hide placeholder
        document.getElementById('chatPlaceholder').style.display = 'none';
        
        // Set input value and send
        document.getElementById('chatInput').value = message;
        this.sendMessage();
    }

    async sendMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        
        if (!message) return;

        // Hide placeholder when first message is sent
        document.getElementById('chatPlaceholder').style.display = 'none';

        this.addMessage(message, 'user');
        chatInput.value = '';

        this.showTyping();

        try {
            const response = await this.getGeminiResponse(message);
            this.hideTyping();
            this.addMessage(response, 'bot');
        } catch (error) {
            this.hideTyping();
            this.addMessage("Sorry, This type of conversation is not supported. Please try again later! 🔄", 'bot');
            console.error('sorry currently not supported', error);
        }
    }

    async getGeminiResponse(message) {
        // Check if API key is set
        if (this.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
            return "Please set your Gemini API key in the studentai.js file to enable AI responses. For now, I can help with basic student guidance! 🤖";
        }

        // Add to conversation history
        this.conversationHistory.push({role: 'user', content: message});

        const systemPrompt = `You are StudentAI, a helpful AI assistant specifically designed to help students with:

1. Skill development and learning resources
2. Job search strategies and career guidance  
3. Startup ideas and entrepreneurship for students
4. Interview preparation and resume building
5. Educational resources and study tips
6. Internship and placement guidance

Guidelines:
- Keep responses concise, practical, and actionable (max 200 words)
- Focus only on student-related topics
- Be encouraging and supportive
- Provide specific examples and resources when possible
- If asked about non-student topics, politely redirect to student-focused areas
- Use emojis to make responses engaging
- Remember previous conversation context

Conversation History:
${this.conversationHistory.slice(-5).map(h => `${h.role}: ${h.content}`).join('\n')}

Current question: ${message}`;

        const requestBody = {
            contents: [{
                parts: [{
                    text: systemPrompt
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 300,
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        };

        const response = await fetch(`${this.GEMINI_BASE_URL}?key=${this.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`request failed with status Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const aiResponse = data.candidates[0].content.parts[0].text.trim();
            // Add AI response to conversation history
            this.conversationHistory.push({role: 'assistant', content: aiResponse});
            return aiResponse;
        } else {
            throw new Error('Invalid response format');
        }
    }

    addMessage(text, sender) {
        const messagesContainer = document.getElementById('chatMessages');
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatarIcon = sender === 'bot' ? 'fa-robot' : 'fa-user';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas ${avatarIcon}"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    <p>${this.escapeHtml(text).replace(/\n/g, '<br>')}</p>
                </div>
                <span class="message-time">${time}</span>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        this.messages.push({text, sender, time});
        this.scrollToBottom();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showTyping() {
        document.getElementById('typingIndicator').style.display = 'flex';
        this.scrollToBottom();
    }

    hideTyping() {
        document.getElementById('typingIndicator').style.display = 'none';
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatMessages');
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }

    loadWelcomeMessage() {
        if (this.messages.length === 0) {
            setTimeout(() => {
                // Hide placeholder
                document.getElementById('chatPlaceholder').style.display = 'none';
                this.addMessage("👋 Hello! I'm StudentAI, powered by SkillSync! I'm here to help you with:\n\n• Skill development & learning 📚\n• Job search & career guidance 💼\n• Startup ideas & entrepreneurship 🚀\n• Interview preparation 🎯\n• Study tips & resources 📖\n\nWhat would you like to explore today?", 'bot');
            }, 1000);
        }
    }

    showNotificationPeriodically() {
        if (!this.isOpen) {
            setTimeout(() => {
                const notification = document.getElementById('chatNotification');
                notification.classList.add('show');
                
                setTimeout(() => {
                    notification.classList.remove('show');
                }, 5000);
                
                // Show again after 30 seconds if chat is still closed
                setTimeout(() => {
                    if (!this.isOpen) {
                        this.showNotificationPeriodically();
                    }
                }, 30000);
            }, 10000);
        }
    }
}

// Initialize the chat bot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.studentAI = new StudentAIChatBot();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StudentAIChatBot;
}

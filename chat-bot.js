// chat-bot.js - Complete Professional Chat Bot with Auto Clear on Close

class ChatBot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.init();
    }

    init() {
        this.createChatBox();
        this.bindEvents();
        this.loadWelcomeMessage();
    }

    createChatBox() {
        const chatBoxHTML = `
            <div id="chatBox" class="chat-box-container">
                <div class="chat-box-header">
                    <div class="chat-header-info">
                        <div class="bot-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="bot-info">
                            <h4>SkillSync AI Assistant</h4>
                            <p class="status">
                                <span class="status-dot"></span>
                                Online
                            </p>
                        </div>
                    </div>
                    <div class="chat-header-actions">
                        <button onclick="chatBot.minimizeChat()" class="minimize-btn" title="Minimize">
                            <i class="fas fa-minus"></i>
                        </button>
                        <button onclick="chatBot.closeAndClearChat()" class="close-chat" title="Close & Clear">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div class="chat-messages" id="chatMessages">
                    <!-- Messages will be added here dynamically -->
                </div>
                
                <div class="typing-indicator" id="typingIndicator">
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <span class="typing-text">AI is typing...</span>
                </div>
                
                <div class="chat-input-container">
                    <div class="quick-replies" id="quickReplies">
                        <button onclick="chatBot.sendQuickReply('How does matching work?')" class="quick-reply-btn">
                            🎯 How matching works?
                        </button>
                        <button onclick="chatBot.sendQuickReply('Pricing information')" class="quick-reply-btn">
                            💰 Pricing
                        </button>
                        <button onclick="chatBot.sendQuickReply('Contact support')" class="quick-reply-btn">
                            🆘 Support
                        </button>
                    </div>
                    <div class="chat-input-wrapper">
                        <input type="text" id="chatInput" placeholder="Type your message..." 
                               onkeypress="chatBot.handleKeyPress(event)"
                               autocomplete="off">
                        <button onclick="chatBot.sendMessage()" class="send-btn" id="sendBtn">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add chat box to body
        document.body.insertAdjacentHTML('beforeend', chatBoxHTML);
        
        // Add CSS styles
        this.addChatStyles();
    }

    addChatStyles() {
        const styles = `
            <style>
                /* Chat Box Container - Fixed Perfect Dimensions */
                .chat-box-container {
                    position: fixed;
                    bottom: 90px;
                    right: 20px;
                    width: 420px;
                    height: 680px;
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                    display: none;
                    flex-direction: column;
                    z-index: 9998;
                    transform: translateY(30px) scale(0.9);
                    opacity: 0;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                    border: 1px solid rgba(102, 126, 234, 0.1);
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                }

                .chat-box-container.active {
                    display: flex;
                    transform: translateY(0) scale(1);
                    opacity: 1;
                }

                .chat-box-container.minimized {
                    height: 60px;
                }

                .chat-box-container.minimized .chat-messages,
                .chat-box-container.minimized .typing-indicator,
                .chat-box-container.minimized .chat-input-container {
                    display: none;
                }

                /* Chat Header */
                .chat-box-header {
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: relative;
                    flex-shrink: 0;
                    height: 80px;
                    box-sizing: border-box;
                }

                .chat-box-header::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
                    pointer-events: none;
                }

                .chat-header-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    z-index: 1;
                }

                .bot-avatar {
                    width: 45px;
                    height: 45px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    backdrop-filter: blur(10px);
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    flex-shrink: 0;
                }

                .bot-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    min-width: 0;
                }

                .bot-info h4 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                    letter-spacing: -0.5px;
                    line-height: 1.2;
                    white-space: nowrap;
                }

                .status {
                    margin: 0;
                    font-size: 12px;
                    opacity: 0.9;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    line-height: 1;
                }

                .status-dot {
                    width: 8px;
                    height: 8px;
                    background: #4CAF50;
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                    flex-shrink: 0;
                }

                .chat-header-actions {
                    display: flex;
                    gap: 8px;
                    z-index: 1;
                    flex-shrink: 0;
                }

                .minimize-btn,
                .close-chat {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    backdrop-filter: blur(10px);
                    flex-shrink: 0;
                }

                .minimize-btn:hover,
                .close-chat:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: scale(1.05);
                }

                .close-chat:hover {
                    background: rgba(255, 99, 99, 0.3);
                    color: #ff6b6b;
                }

                /* Chat Messages - Perfect Scrollable Area */
                .chat-messages {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    overflow-x: hidden;
                    background: linear-gradient(135deg, #f8f9ff 0%, #f1f4ff 100%);
                    position: relative;
                    max-height: calc(680px - 80px - 150px);
                    min-height: 350px;
                }

                .chat-messages::-webkit-scrollbar {
                    width: 6px;
                }

                .chat-messages::-webkit-scrollbar-track {
                    background: transparent;
                }

                .chat-messages::-webkit-scrollbar-thumb {
                    background: rgba(102, 126, 234, 0.3);
                    border-radius: 3px;
                }

                .chat-messages::-webkit-scrollbar-thumb:hover {
                    background: rgba(102, 126, 234, 0.5);
                }

                /* Perfect Message Alignment - FIXED EDGE ALIGNMENT */
                .message {
                    display: flex;
                    margin-bottom: 20px;
                    opacity: 0;
                    transform: translateY(10px);
                    transition: all 0.3s ease;
                    width: 100%;
                    align-items: flex-start;
                    position: relative;
                }

                .message.animate {
                    opacity: 1;
                    transform: translateY(0);
                }

                /* Bot Messages - Left Edge Alignment */
                .bot-message {
                    justify-content: flex-start;
                    align-items: flex-start;
                }

                .bot-message .message-avatar {
                    margin-right: 12px;
                    margin-left: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                    order: 1;
                }

                .bot-message .message-content {
                    order: 2;
                    align-items: flex-start;
                    margin-left: 0;
                    margin-right: auto;
                }

                .bot-message .message-bubble {
                    background: white;
                    color: #333;
                    border: 1px solid rgba(102, 126, 234, 0.1);
                    text-align: left;
                }

                .bot-message .message-bubble::before {
                    content: '';
                    position: absolute;
                    left: -8px;
                    top: 15px;
                    width: 0;
                    height: 0;
                    border-top: 8px solid transparent;
                    border-bottom: 8px solid transparent;
                    border-right: 8px solid white;
                }

                .bot-message .message-time {
                    text-align: left;
                    padding-left: 4px;
                    align-self: flex-start;
                }

                /* User Messages - Right Edge Alignment */
                .user-message {
                    justify-content: flex-end;
                    align-items: flex-start;
                    margin-left: auto;
                    width: 100%;
                }

                .user-message .message-avatar {
                    margin-left: 12px;
                    margin-right: 0;
                    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                    color: white;
                    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
                    order: 2;
                }

                .user-message .message-content {
                    order: 1;
                    align-items: flex-end;
                    margin-left: auto;
                    margin-right: 0;
                    text-align: right;
                }

                .user-message .message-bubble {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    text-align: right;
                    margin-left: auto;
                    margin-right: 0;
                }

                .user-message .message-bubble::before {
                    content: '';
                    position: absolute;
                    right: -8px;
                    top: 15px;
                    width: 0;
                    height: 0;
                    border-top: 8px solid transparent;
                    border-bottom: 8px solid transparent;
                    border-left: 8px solid #667eea;
                }

                .user-message .message-time {
                    text-align: right;
                    padding-right: 4px;
                    align-self: flex-end;
                    width: 100%;
                }

                /* Message Components */
                .message-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    flex-shrink: 0;
                    margin-top: 4px;
                }

                .message-content {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    min-width: 0;
                    max-width: calc(100% - 60px);
                }

                .message-bubble {
                    padding: 14px 18px;
                    border-radius: 18px;
                    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
                    position: relative;
                    max-width: 280px;
                    min-width: 120px;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    line-height: 1.5;
                }

                .message-bubble p {
                    margin: 0;
                    line-height: 1.5;
                    white-space: pre-line;
                    font-size: 14px;
                    font-weight: 400;
                }

                .message-actions {
                    margin-top: 10px;
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .bot-message .message-actions {
                    justify-content: flex-start;
                }

                .user-message .message-actions {
                    justify-content: flex-end;
                }

                .action-btn {
                    background: rgba(102, 126, 234, 0.1);
                    border: 1px solid rgba(102, 126, 234, 0.3);
                    color: #667eea;
                    padding: 6px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-weight: 500;
                    text-decoration: none;
                    display: inline-block;
                }

                .action-btn:hover {
                    background: rgba(102, 126, 234, 0.2);
                    transform: translateY(-1px);
                    color: #667eea;
                    text-decoration: none;
                }

                .message-time {
                    font-size: 11px;
                    color: #999;
                    margin-top: 4px;
                    font-weight: 400;
                }

                /* Typing Indicator */
                .typing-indicator {
                    display: none;
                    align-items: center;
                    gap: 12px;
                    padding: 15px 20px;
                    background: linear-gradient(135deg, #f8f9ff 0%, #f1f4ff 100%);
                    border-top: 1px solid rgba(102, 126, 234, 0.1);
                    flex-shrink: 0;
                }

                .typing-dots {
                    display: flex;
                    gap: 4px;
                    align-items: center;
                }

                .typing-dots span {
                    width: 8px;
                    height: 8px;
                    background: #667eea;
                    border-radius: 50%;
                    animation: typing 1.4s infinite ease-in-out;
                }

                .typing-dots span:nth-child(2) {
                    animation-delay: 0.2s;
                }

                .typing-dots span:nth-child(3) {
                    animation-delay: 0.4s;
                }

                .typing-text {
                    font-size: 12px;
                    color: #667eea;
                    font-style: italic;
                    font-weight: 500;
                }

                /* Chat Input Container */
                .chat-input-container {
                    padding: 20px;
                    background: white;
                    border-top: 1px solid #f0f0f0;
                    flex-shrink: 0;
                    height: 150px;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    justify-content: space-between;
                }

                /* Quick Replies */
                .quick-replies {
                    display: flex;
                    gap: 8px;
                    overflow-x: auto;
                    padding-bottom: 4px;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(102, 126, 234, 0.3) transparent;
                    order: 1;
                }

                .quick-replies::-webkit-scrollbar {
                    height: 4px;
                }

                .quick-replies::-webkit-scrollbar-track {
                    background: transparent;
                }

                .quick-replies::-webkit-scrollbar-thumb {
                    background: rgba(102, 126, 234, 0.3);
                    border-radius: 2px;
                }

                .quick-reply-btn {
                    background: rgba(102, 126, 234, 0.08);
                    border: 1px solid rgba(102, 126, 234, 0.2);
                    color: #667eea;
                    padding: 8px 14px;
                    border-radius: 20px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                    flex-shrink: 0;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .quick-reply-btn:hover {
                    background: rgba(102, 126, 234, 0.15);
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
                }

                /* Chat Input Wrapper */
                .chat-input-wrapper {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    order: 2;
                }

                #chatInput {
                    flex: 1;
                    padding: 14px 18px;
                    border: 2px solid #e9ecef;
                    border-radius: 25px;
                    outline: none;
                    font-size: 14px;
                    transition: all 0.2s ease;
                    font-family: inherit;
                    line-height: 1.4;
                    background: #fafafa;
                    min-height: 20px;
                    resize: none;
                }

                #chatInput:focus {
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                    background: white;
                }

                #chatInput::placeholder {
                    color: #999;
                    font-weight: 400;
                }

                .send-btn {
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
                    flex-shrink: 0;
                    font-size: 16px;
                }

                .send-btn:hover {
                    transform: translateY(-2px) scale(1.05);
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
                }

                .send-btn:active {
                    transform: translateY(0) scale(0.95);
                }

                .send-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                /* Floating Button Updates */
                .floating-chat-btn button.chat-open {
                    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                    transform: rotate(45deg);
                }

                .floating-chat-btn button.chat-open .fa-robot {
                    transform: rotate(-45deg);
                }

                /* Clear Animation */
                .chat-messages.clearing {
                    opacity: 0.3;
                    transform: scale(0.95);
                    transition: all 0.3s ease;
                }

                /* Mobile Responsive */
                @media (max-width: 768px) {
                    .chat-box-container {
                        width: calc(100vw - 20px);
                        height: calc(100vh - 120px);
                        right: 10px;
                        bottom: 80px;
                        border-radius: 16px;
                    }
                    
                    .chat-box-header {
                        padding: 16px;
                        height: 70px;
                    }
                    
                    .chat-messages {
                        padding: 16px;
                        max-height: calc(100vh - 120px - 70px - 140px);
                    }
                    
                    .chat-input-container {
                        padding: 16px;
                        height: 140px;
                    }
                    
                    .message-bubble {
                        max-width: 240px;
                    }

                    .quick-reply-btn {
                        padding: 6px 12px;
                        font-size: 11px;
                    }

                    #chatInput {
                        padding: 12px 16px;
                        font-size: 13px;
                    }

                    .send-btn {
                        width: 44px;
                        height: 44px;
                        font-size: 14px;
                    }
                }

                /* Perfect Animations */
                @keyframes typing {
                    0%, 60%, 100% {
                        transform: translateY(0);
                    }
                    30% {
                        transform: translateY(-8px);
                    }
                }

                @keyframes pulse {
                    0% {
                        box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
                    }
                    70% {
                        box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
                    }
                    100% {
                        box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
                    }
                }

                /* Focus States */
                .quick-reply-btn:focus,
                .send-btn:focus,
                .minimize-btn:focus,
                .close-chat:focus {
                    outline: 2px solid rgba(102, 126, 234, 0.5);
                    outline-offset: 2px;
                }

                #chatInput:focus {
                    outline: none;
                }

                /* Smooth Scrollbar */
                * {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(102, 126, 234, 0.3) transparent;
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    bindEvents() {
        // Update floating button to trigger chat
        const floatingBtn = document.getElementById('floatingChatBtn');
        if (floatingBtn) {
            const button = floatingBtn.querySelector('button');
            if (button) {
                button.removeAttribute('onclick');
                button.addEventListener('click', () => this.toggleChat());
            }
        }

        // Prevent chat box content clicks from closing
        const chatBox = document.getElementById('chatBox');
        if (chatBox) {
            chatBox.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // Auto-resize input
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.addEventListener('input', () => {
                chatInput.style.height = 'auto';
                chatInput.style.height = Math.min(chatInput.scrollHeight, 100) + 'px';
            });
        }
    }

    toggleChat() {
        const chatBox = document.getElementById('chatBox');
        const floatingBtn = document.querySelector('.floating-chat-btn button');
        
        if (!chatBox) return;

        if (this.isOpen) {
            // Close chat normally (without clearing)
            chatBox.classList.remove('active');
            if (floatingBtn) floatingBtn.classList.remove('chat-open');
            setTimeout(() => {
                chatBox.style.display = 'none';
            }, 300);
            this.isOpen = false;
        } else {
            // Open chat - check if we need to reload welcome messages
            if (this.messages.length === 0) {
                this.loadWelcomeMessage();
            }
            
            chatBox.style.display = 'flex';
            setTimeout(() => {
                chatBox.classList.add('active');
                if (floatingBtn) floatingBtn.classList.add('chat-open');
                this.scrollToBottom();
                const input = document.getElementById('chatInput');
                if (input) input.focus();
            }, 10);
            this.isOpen = true;
        }
    }

    // NEW METHOD: Close and Clear Chat History
    closeAndClearChat() {
        const chatBox = document.getElementById('chatBox');
        const floatingBtn = document.querySelector('.floating-chat-btn button');
        const messagesContainer = document.getElementById('chatMessages');
        
        if (!chatBox) return;

        // Add clearing animation
        if (messagesContainer) {
            messagesContainer.classList.add('clearing');
        }

        // Show clearing notification
        if (typeof showNotification === 'function') {
            showNotification('💬 Chat cleared! Starting fresh conversation.', 'info');
        }

        // Clear messages with animation
        setTimeout(() => {
            this.clearAllMessages();
            
            // Close chat
            chatBox.classList.remove('active');
            if (floatingBtn) floatingBtn.classList.remove('chat-open');
            
            setTimeout(() => {
                chatBox.style.display = 'none';
                if (messagesContainer) {
                    messagesContainer.classList.remove('clearing');
                }
            }, 300);
            
            this.isOpen = false;
        }, 500);
    }

    // NEW METHOD: Clear all messages completely
    clearAllMessages() {
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
        
        // Clear input field
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.value = '';
            chatInput.style.height = 'auto';
        }
        
        // Hide typing indicator
        this.hideTyping();
        
        // Clear messages array
        this.messages = [];
        
        console.log('🗑️ Chat history completely cleared');
    }

    minimizeChat() {
        const chatBox = document.getElementById('chatBox');
        if (chatBox) {
            chatBox.classList.toggle('minimized');
        }
    }

    sendMessage() {
        const input = document.getElementById('chatInput');
        if (!input) return;
        
        const message = input.value.trim();
        
        if (!message) return;

        // Disable send button temporarily
        const sendBtn = document.getElementById('sendBtn');
        if (sendBtn) {
            sendBtn.disabled = true;
            setTimeout(() => {
                sendBtn.disabled = false;
            }, 1000);
        }

        // Add user message
        this.addMessage(message, 'user');
        input.value = '';
        input.style.height = 'auto';
        
        // Show typing indicator
        this.showTyping();
        
        // Get bot response with realistic delay
        setTimeout(() => {
            this.hideTyping();
            const botResponse = this.getBotResponse(message);
            this.addMessage(botResponse, 'bot');
        }, 1500 + Math.random() * 1500);
    }

    sendQuickReply(message) {
        const input = document.getElementById('chatInput');
        if (input) {
            input.value = message;
            this.sendMessage();
        }
    }

    addMessage(text, sender) {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const messageId = 'msg-' + Date.now();
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${sender === 'bot' ? 'robot' : 'user-circle'}"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble" id="${messageId}">
                    ${sender === 'bot' ? this.formatBotMessage(text) : `<p>${this.escapeHtml(text)}</p>`}
                </div>
                <span class="message-time">${time}</span>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        
        // Animate message
        setTimeout(() => {
            messageDiv.classList.add('animate');
        }, 50);
        
        this.scrollToBottom();
        
        // Store message
        this.messages.push({
            text: text,
            sender: sender,
            time: time,
            id: messageId
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatBotMessage(text) {
        let formattedText = this.escapeHtml(text);
        formattedText = formattedText.replace(/•\s/g, '<br>• ');
        formattedText = formattedText.replace(/\n•/g, '<br>•');
        
        let html = `<p>${formattedText}</p>`;
        
        // Add action buttons based on content
        if (text.includes('features') || text.includes('Features')) {
            html += `
                <div class="message-actions">
                    <button onclick="window.open('pages/features.html', '_blank')" class="action-btn">
                        View Features
                    </button>
                </div>`;
        }
        
        if (text.includes('how it works') || text.includes('How It Works')) {
            html += `
                <div class="message-actions">
                    <button onclick="window.open('pages/how-it-works.html', '_blank')" class="action-btn">
                        Learn More
                    </button>
                </div>`;
        }
        
        if (text.includes('pricing') || text.includes('Pricing')) {
            html += `
                <div class="message-actions">
                    <button onclick="window.open('pages/pricing.html', '_blank')" class="action-btn">
                        View Pricing
                    </button>
                </div>`;
        }
        
        if (text.includes('API') || text.includes('api')) {
            html += `
                <div class="message-actions">
                    <button onclick="window.open('pages/api.html', '_blank')" class="action-btn">
                        API Docs
                    </button>
                </div>`;
        }
        
        if (text.includes('Help Center')) {
            html += `
                <div class="message-actions">
                    <button onclick="window.open('pages/help.html', '_blank')" class="action-btn">
                        Help Center
                    </button>
                </div>`;
        }
        
        if (text.includes('Contact') || text.includes('contact')) {
            html += `
                <div class="message-actions">
                    <button onclick="window.open('pages/contact.html', '_blank')" class="action-btn">
                        Contact Us
                    </button>
                </div>`;
        }
        
        if (text.includes('System Status')) {
            html += `
                <div class="message-actions">
                    <button onclick="window.open('pages/status.html', '_blank')" class="action-btn">
                        System Status
                    </button>
                </div>`;
        }
        
        if (text.includes('Feedback') || text.includes('feedback')) {
            html += `
                <div class="message-actions">
                    <button onclick="window.open('pages/feedback.html', '_blank')" class="action-btn">
                        Give Feedback
                    </button>
                </div>`;
        }
        
        if (text.includes('about') || text.includes('About')) {
            html += `
                <div class="message-actions">
                    <button onclick="window.open('pages/about.html', '_blank')" class="action-btn">
                        About Us
                    </button>
                </div>`;
        }
        
        if (text.includes('careers') || text.includes('Careers')) {
            html += `
                <div class="message-actions">
                    <button onclick="window.open('pages/careers.html', '_blank')" class="action-btn">
                        View Jobs
                    </button>
                </div>`;
        }
        
        if (text.includes('press') || text.includes('Press')) {
            html += `
                <div class="message-actions">
                    <button onclick="window.open('pages/press.html', '_blank')" class="action-btn">
                        Press Kit
                    </button>
                </div>`;
        }
        
        if (text.includes('blog') || text.includes('Blog')) {
            html += `
                <div class="message-actions">
                    <button onclick="window.open('pages/blog.html', '_blank')" class="action-btn">
                        Read Blog
                    </button>
                </div>`;
        }
        
        if (text.includes('Privacy Policy')) {
            html += `
                <div class="message-actions">
                    <button onclick="window.open('pages/privacy.html', '_blank')" class="action-btn">
                        Privacy Policy
                    </button>
                </div>`;
        }
        
        if (text.includes('Terms of Service')) {
            html += `
                <div class="message-actions">
                    <button onclick="window.open('pages/terms.html', '_blank')" class="action-btn">
                        Terms of Service
                    </button>
                </div>`;
        }
        
        if (text.includes('security')) {
            html += `
                <div class="message-actions">
                    <button onclick="window.open('pages/security.html', '_blank')" class="action-btn">
                        Security Info
                    </button>
                </div>`;
        }
        
        if (text.includes('Cookie Policy')) {
            html += `
                <div class="message-actions">
                    <button onclick="window.open('pages/cookies.html', '_blank')" class="action-btn">
                        Cookie Policy
                    </button>
                </div>`;
        }
        
        return html;
    }

    showTyping() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'flex';
            this.scrollToBottom();
        }
    }

    hideTyping() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 100);
        }
    }

    handleKeyPress(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    loadWelcomeMessage() {
        setTimeout(() => {
            this.addMessage('👋 Hello! I\'m SkillSync AI Assistant. How can I help you today?', 'bot');
            
            setTimeout(() => {
                this.addMessage('I can help you with:\n• Student-Startup matching\n• Platform features\n• Account setup\n• Technical support\n\nJust ask me anything!', 'bot');
            }, 1500);
        }, 800);
    }

    getBotResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Complete response system with all footer links
        const responses = {
            // Greetings
            'hello': ['Hi there! 👋 How can I assist you with SkillSync AI today?', 'Hello! Welcome to SkillSync AI. What would you like to know?'],
            'hi': ['Hello! How can I help you today?', 'Hi! I\'m here to assist you with SkillSync AI.'],
            'hey': ['Hey! What can I help you with?', 'Hey there! How can I assist you today?'],
            'how are you': [
        'I\'m just a bot, but I\'m doing great! 😊 How can I help you?',
        'Feeling helpful as always! What can I do for you today?'
    ],
    'what can you do': [
        'I can help you navigate SkillSync AI, answer your queries, and assist with any issues.',
        'I\'m here to provide information, support, and guide you through SkillSync AI features.'
    ],
    'thank you': [
        'You\'re welcome! 😊',
        'Glad I could help!',
        'Anytime! Feel free to ask more.'
    ],
    'thanks': [
        'No problem at all!',
        'Happy to help!',
        'You got it!'
    ],
    'bye': [
        'Goodbye! Have a great day ahead! 👋',
        'See you later! Let me know if you need anything else.'
    ],
    'goodbye': [
        'Farewell! I\'m here whenever you need assistance.',
        'Take care! 👋'
    ],
     'what is skill sync ai': [
        'SkillSync AI is a platform that connects your skills with relevant job opportunities using AI matchmaking.',
        'It helps you showcase your skills and get personalized job recommendations.'
    ],
    'how does it work': [
        'Just sign up, input your skills, and let our AI match you with the best jobs.',
        'We use AI algorithms to analyze your skillset and suggest suitable job roles.'
    ],
    'is it free': [
        'Yes! SkillSync AI is free to use for job seekers.',
        'Absolutely! No charges for signing up or browsing jobs.'
    ],
      'how is your day': [
        'Going great! Always ready to help you.',
        'Fantastic! How can I assist you today?'
    ],
    'what\'s up': [
        'Just here, waiting to help you! 😊',
        'Not much, just assisting awesome users like you!'
    ],
    'nice to meet you': [
        'Nice to meet you too! 👋',
        'Pleasure’s all mine!'
    ],
    'who are you': [
        'I’m your virtual assistant at SkillSync AI.',
        'I’m SkillSync Bot — here to guide you.'
    ],
    'are you a robot': [
        'You could say that! I’m a smart bot built to assist you. 🤖',
        'Yes, but a helpful one!'
    ],

   
    'i need help': [
        'Sure! What do you need help with?',
        'I’m here to assist. Please tell me your issue.'
    ],
    'i have a problem': [
        'Sorry to hear that. Can you describe the issue?',
        'Let’s fix it! Tell me what’s going wrong.'
    ],
    'i don’t understand': [
        'No worries, I’ll try to explain better.',
        'Let me simplify that for you. What exactly is confusing?'
    ],

 
    'how to sign up': [
        'Click on the "Sign Up" button at the top right and follow the steps.',
        'Just go to the homepage and click "Sign Up" — it’s quick and easy!'
    ],
    'how to login': [
        'Click "Login" at the top and enter your credentials.',
        'You can log in using your email and password from the top navigation.'
    ],
    'how to update profile': [
        'Go to your dashboard, then click "Edit Profile".',
        'From your account section, you can update your profile anytime.'
    ],

   
    'that\'s all': [
        'Alright! If you need me again, I’m right here.',
        'Got it. Have a wonderful day!'
    ],
    'nothing': [
        'Okay! I’ll be around if you change your mind.',
        'No problem. Take care!'
    ],

  
    'i am nervous': [
        'Don’t worry — you’ve got this! 💪',
        'It’s normal to feel that way. Believe in yourself!'
    ],
    'thank you so much': [
        'You’re most welcome!',
        'Glad I could help. 😊'
    ],
 'how to apply for a job': [
        'Click on any job you like and press “Apply Now” — simple!',
        'Once you find a job, click “Apply” to submit your application.'
    ],
    'track my applications': [
        'Go to your dashboard > Applications to see job statuses.',
        'You can track your job applications in the “My Applications” section.'
    ],

    'is my resume good': [
        'You can use our AI-powered Resume Analyzer to check your resume.',
        'We offer resume tips in the Resources section — want me to open it?'
    ],
            // Platform Features (Footer: Platform Section)
            'features': 'SkillSync AI offers amazing features:\n\n✨ AI-powered matching (85%+ accuracy)\n💬 Real-time chat system\n🔒 Skill verification\n📊 Advanced analytics\n📱 Mobile responsive design\n🛡️ Enterprise security\n\nWould you like to explore our features page for detailed information?',
            
            'how it works': 'Our simple 3-step process:\n\n1️⃣ **Create Profile**: Add your skills and preferences\n2️⃣ **Get Matched**: AI finds perfect opportunities\n3️⃣ **Connect**: Chat and collaborate with matches\n\nFor students and startups alike! Want to see the detailed workflow?',
            
            'pricing': 'SkillSync AI pricing is designed to be accessible:\n\n🆓 **Free Plan**: Basic matching, profile creation, messaging\n⭐ **Premium Plan**: Priority matching, advanced analytics\n🏢 **Enterprise**: Custom solutions for large organizations\n\nVisit our pricing page to see detailed plans and features!',
            
            'api': 'SkillSync AI provides powerful APIs for developers:\n\n🔗 RESTful API endpoints\n📊 Real-time matching data\n🔒 Secure authentication\n📈 Analytics integration\n⚡ High-performance scaling\n\nExplore our API documentation for integration details!',
            
            // Support Section (Footer: Support)
            'help': 'I\'m here to help! 😊 Our support resources include:\n\n📚 Comprehensive Help Center\n💬 Live chat support (this!)\n📧 Email support team\n🔧 System status monitoring\n💭 Community feedback system\n\nWhat specific help do you need?',
            
            'support': 'SkillSync AI support channels:\n\n🏠 **Help Center**: Complete guides and FAQs\n📞 **Contact Us**: Direct support team access\n⚡ **System Status**: Real-time platform monitoring\n💬 **Feedback**: Share your suggestions\n\nAll available 24/7 for your convenience!',
            
            'contact': 'Get in touch with us:\n\n📧 support@skillsync.ai\n💬 Live chat (right here!)\n🌐 Contact form on website\n📱 +91-XXXXX-XXXXX\n🏢 Bangalore, India\n\nWe typically respond within 2 hours!',
            
            'status': 'Check our System Status for:\n\n✅ Platform uptime (99.9%)\n🔧 Scheduled maintenance\n⚡ Performance metrics\n🚨 Known issues\n📊 Historical data\n\nReal-time monitoring ensures optimal performance!',
            
            'feedback': 'We value your feedback! 💭\n\nShare your thoughts about:\n• Platform features\n• User experience\n• Bug reports\n• Feature requests\n• General suggestions\n\nYour input helps us improve SkillSync AI!',
            
            // Company Section (Footer: Company)
            'about': 'SkillSync AI is revolutionizing talent discovery:\n\n🎯 **Mission**: Bridge the gap between students and startups\n🚀 **Vision**: Democratize opportunities through AI\n💡 **Founded**: 2024, Bangalore\n👥 **Team**: Passionate developers and AI experts\n🏆 **Achievement**: 150+ successful matches, 85%+ accuracy\n\nLearn more about our journey and team!',
            
            'careers': 'Join the SkillSync AI team! 🚀\n\nWe\'re looking for:\n• Full-stack developers\n• AI/ML engineers\n• Product designers\n• Growth marketers\n• DevOps engineers\n\nCheck our careers page for open positions and amazing benefits!',
            
            'press': 'SkillSync AI in the news:\n\n📰 Featured in TechCrunch, YourStory\n🏆 Winner of multiple hackathons\n📊 Growing at 200% month-over-month\n🎤 Speaking at tech conferences\n📸 High-resolution logos and screenshots\n\nDownload our press kit for media resources!',
            
            'blog': 'Stay updated with SkillSync AI blog:\n\n📝 Latest AI matching insights\n💡 Startup hiring trends\n🎓 Student success stories\n🔬 Technical deep-dives\n📈 Industry analysis\n\nSubscribe for weekly updates and expert insights!',
            
            // Legal Section (Footer: Legal)
            'privacy': 'Your privacy is our priority! 🔒\n\nWe ensure:\n• End-to-end data encryption\n• GDPR compliance\n• No data selling to third parties\n• Transparent data usage\n• User control over personal info\n\nRead our complete Privacy Policy for details!',
            
            'terms': 'SkillSync AI Terms of Service:\n\n📋 Clear usage guidelines\n⚖️ Fair and transparent policies\n🛡️ User rights protection\n🤝 Mutual responsibilities\n🔄 Regular updates with notifications\n\nReview our Terms of Service for complete information!',
            
            'security': 'Enterprise-grade security measures:\n\n🔐 256-bit SSL encryption\n🛡️ Multi-factor authentication\n🔍 Regular security audits\n⚡ Real-time threat monitoring\n🏢 SOC 2 compliance\n\nYour data security is our top priority!',
            
            'cookies': 'SkillSync AI Cookie Policy:\n\n🍪 Essential cookies for functionality\n📊 Analytics for improving experience\n🎯 Preference cookies for personalization\n🚫 No tracking without consent\n⚙️ Easy cookie management\n\nManage your cookie preferences anytime!',
            
            // Enhanced Matching Information
            'matching': 'Our AI matching system is revolutionary:\n\n📊 Analyzes 15+ compatibility parameters\n🎯 85%+ matching accuracy\n⚡ Real-time processing\n🧠 Machine learning algorithms\n📈 Continuous improvement\n\nWant to see how our algorithm works in detail?',
            
            'algorithm': 'SkillSync AI matching algorithm breakdown:\n\n🔍 **Skill Analysis** (40%): Technical & soft skills\n🏢 **Culture Fit** (25%): Values & work style\n⏰ **Availability** (20%): Time zones & commitment\n🎨 **Interest Match** (10%): Project preferences\n📍 **Location** (5%): Geographic preferences\n\nThis multi-dimensional approach ensures perfect matches!',
            
            // Student & Startup Specific
            'student': 'For students, SkillSync AI offers:\n\n🎓 Professional profile showcase\n🔍 Smart startup discovery\n💼 Internship & job opportunities\n📈 Skill development tracking\n🤝 Networking with like-minded peers\n\nReady to find your perfect startup match?',
            
            'startup': 'For startups, SkillSync AI provides:\n\n👥 Intelligent talent discovery\n🎯 Precision matching technology\n⚡ Faster hiring process\n💡 Student insights & analytics\n📊 Comprehensive hiring dashboard\n\nFind your next star employee today!',
            
            // Cost & Registration
            'cost': 'Great news! SkillSync AI is completely free to get started:\n\n• Free profile creation\n• Basic AI matching\n• Essential messaging\n• Community access\n\nUpgrade anytime for premium features like priority matching!',
            
            'register': 'Registration is super easy! 🚀\n\n1. Click "Get Started" button\n2. Choose Student or Startup\n3. Fill your profile details\n4. Get matched instantly!\n\nYou can also sign up with Google for faster registration.',
            
            // Technical Support
            'error': 'Sorry to hear you\'re experiencing issues! 🔧\n\nQuick troubleshooting:\n• Refresh the page\n• Clear browser cache\n• Check internet connection\n• Try incognito mode\n• Update your browser\n\nIf problems persist, contact our support team!',
            
            'bug': 'Thanks for reporting! 🐛 Please provide:\n\n• What you were trying to do\n• What happened instead\n• Your browser and version\n• Any error messages\n• Screenshots if possible\n\nThis helps us fix issues quickly!',
            
            // Default responses
            'default': [
                'That\'s a great question! I can help you with information about SkillSync AI\'s features, pricing, support, company details, or any other topic. What interests you most?',
                'Thanks for asking! Feel free to inquire about our platform features, how it works, pricing plans, API documentation, support options, or company information.',
                'I\'m here to assist! You can ask about matching algorithms, pricing plans, support resources, company info, legal policies, or any other SkillSync AI topics.',
                'Great question! I can provide information about our features, support resources, company background, legal policies, or technical details. What would you like to know?'
            ]
        };
        
        // Find best match
        for (const [key, response] of Object.entries(responses)) {
            if (message.includes(key) && key !== 'default') {
                return Array.isArray(response) ? response[Math.floor(Math.random() * response.length)] : response;
            }
        }
        
        // Return random default response
        const defaultResponses = responses.default;
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }

    // Utility methods
    clearChat() {
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
            this.messages = [];
            this.loadWelcomeMessage();
        }
    }

    exportChat() {
        const chatData = {
            messages: this.messages,
            timestamp: new Date().toISOString(),
            platform: 'SkillSync AI'
        };
        
        const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `skillsync-chat-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    getChatStats() {
        return {
            totalMessages: this.messages.length,
            userMessages: this.messages.filter(m => m.sender === 'user').length,
            botMessages: this.messages.filter(m => m.sender === 'bot').length,
            isOpen: this.isOpen
        };
    }
}

// Initialize chat bot
let chatBot;

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        chatBot = new ChatBot();
        console.log('🤖 SkillSync AI Chat Bot with auto-clear functionality initialized!');
        
        setTimeout(() => {
            if (typeof showNotification === 'function') {
                showNotification('🤖 AI Chat Assistant ready! Close button will clear history.', 'success');
            }
        }, 2000);
    }, 1000);
});

// Global helper functions
window.toggleChatBot = function() {
    if (chatBot) chatBot.toggleChat();
};

window.sendChatMessage = function(message) {
    if (chatBot) {
        const input = document.getElementById('chatInput');
        if (input) {
            input.value = message;
            chatBot.sendMessage();
        }
    }
};

window.clearChatHistory = function() {
    if (chatBot) chatBot.clearAllMessages();
};

window.exportChatHistory = function() {
    if (chatBot) chatBot.exportChat();
};

// NEW: Force clear and restart chat
window.restartChat = function() {
    if (chatBot) {
        chatBot.closeAndClearChat();
        setTimeout(() => {
            chatBot.toggleChat();
        }, 1000);
    }
};

console.log('🚀 SkillSync AI Professional Chat Bot with auto-clear on close loaded!');

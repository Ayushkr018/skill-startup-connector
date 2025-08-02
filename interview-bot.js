// InterviewBot with Google Gemini AI Integration
// File: interview-bot.js

class InterviewBot {
    constructor() {
        this.isSessionActive = false;
        this.currentCategory = null;
        this.sessionType = null;
        this.messageHistory = [];
        this.questionCount = 0;
        this.sessionStartTime = null;
        this.geminiAPI = null;
        this.conversationHistory = [];
        
        // Gemini API configuration
        this.GEMINI_API_KEY = ''; // Replace with your actual API key
        this.GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
        
        this.init();
    }

    init() {
        console.log('🤖 InterviewBot with Gemini AI Initialized');
        this.setupEventListeners();
        
        // Validate API key
        if (!this.GEMINI_API_KEY || this.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            console.warn('⚠️  Gemini API key not configured. Using fallback responses.');
            this.showAPIKeyWarning();
        }
    }

    showAPIKeyWarning() {
        // Show notification about API key
        setTimeout(() => {
            if (typeof showNotification === 'function') {
                showNotification('⚠️ Gemini API key not configured. Using demo mode.', 'warning');
            }
        }, 1000);
    }

    setupEventListeners() {
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            messageInput.addEventListener('input', () => {
                this.autoResize(messageInput);
                this.updateSendButtonState();
            });
        }
    }

    startSession(category = 'general', type = 'quick') {
        console.log(`🚀 Starting ${category} interview session (${type})`);
        
        this.isSessionActive = true;
        this.currentCategory = category;
        this.sessionType = type;
        this.sessionStartTime = new Date();
        this.questionCount = 0;
        this.messageHistory = [];
        this.conversationHistory = [];
        
        this.clearMessages();
        setTimeout(() => {
            this.sendInitialGreeting();
        }, 800);
        
        this.updateQuickActions(category);
        this.updateBotStatus();
    }

    updateBotStatus() {
        const statusElement = document.getElementById('botStatus');
        if (statusElement) {
            const statusMessages = {
                'quick': 'Quick Practice Mode - 15 min',
                'full': 'Full Interview Mode - 45 min',
                'custom': 'Custom Session Mode'
            };
            statusElement.textContent = statusMessages[this.sessionType] || 'Interview Mode Active';
        }
    }

    async sendInitialGreeting() {
        const greetings = {
            technical: `Hello! I'm your AI Technical Interview Coach powered by SkillSync. 🚀

I'll help you practice coding problems, system design, and technical concepts. 

Let's begin with a fundamental question:

**Can you tell me about a challenging technical project you've worked on recently? Please walk me through your problem-solving approach, the technologies you used, and what you learned from the experience.**`,

            behavioral: `Hi there! I'm your AI Behavioral Interview Coach powered by SkillSync. 🗣️

I'll help you practice HR questions and improve your communication skills using proven frameworks like the STAR method.

Let's start with this question:

**Please tell me about yourself - your background, your current role or studies, and what motivates you in your career journey.**`,

            general: `Welcome! I'm your AI Interview Coach powered by SkillSync. 🎯

I'll help you practice both technical and behavioral questions to prepare for your upcoming interviews.

Let's begin:

**Please introduce yourself and tell me what type of role you're preparing for. This will help me tailor our practice session to your specific needs.**`
        };

        const greeting = greetings[this.currentCategory] || greetings.general;
        await this.addMessage('ai', greeting);
    }

    updateQuickActions(category) {
        const quickActionsContainer = document.getElementById('quickActions');
        if (!quickActionsContainer) return;

        const actions = {
            technical: [
                'Explain a complex algorithm you\'ve implemented',
                'Describe your experience with system design',
                'Walk me through debugging a difficult problem',
                'Tell me about a time you optimized performance'
            ],
            behavioral: [
                'Tell me about yourself',
                'Describe a challenging project you led',
                'How do you handle conflict in teams?',
                'What are your career goals?'
            ],
            general: [
                'Tell me about yourself',
                'What are your greatest strengths?',
                'Describe a recent accomplishment',
                'Why are you interested in this role?'
            ]
        };

        const categoryActions = actions[category] || actions.general;
        
        quickActionsContainer.innerHTML = categoryActions.map(action => 
            `<button class="action-btn" onclick="sendQuickMessage('${action}')">${action}</button>`
        ).join('');
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        
        if (!messageInput || !this.isSessionActive) {
            console.log('❌ Cannot send message: Input not found or session inactive');
            return;
        }
        
        const message = messageInput.value.trim();
        if (!message) {
            console.log('❌ Cannot send empty message');
            return;
        }

        console.log('📤 Sending message:', message);
        
        this.setLoadingState(true);
        
        // Add user message
        await this.addMessage('user', message);
        messageInput.value = '';
        this.autoResize(messageInput);
        
        // Store message in history
        this.messageHistory.push({
            role: 'user',
            content: message,
            timestamp: new Date()
        });

        this.conversationHistory.push({
            role: 'user',
            parts: [{ text: message }]
        });

        this.questionCount++;

        try {
            // Show typing indicator
            this.showTypingIndicator();
            
            // Get AI response from Gemini
            const aiResponse = await this.getGeminiResponse(message);
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Add AI response
            await this.addMessage('ai', aiResponse);
            
            // Store AI response in history
            this.messageHistory.push({
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date()
            });

            this.conversationHistory.push({
                role: 'model',
                parts: [{ text: aiResponse }]
            });

        } catch (error) {
            console.error('❌ Error getting AI response:', error);
            this.hideTypingIndicator();
            
            // Fallback to local response
            const fallbackResponse = this.getFallbackResponse(message);
            await this.addMessage('ai', fallbackResponse);
            
            if (typeof showNotification === 'function') {
                showNotification('Using offline mode. Check your internet connection.', 'warning');
            }
        }
        
        this.setLoadingState(false);
    }

    async getGeminiResponse(userMessage) {
        // Check if API key is configured
        if (!this.GEMINI_API_KEY || this.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            console.log('🔄 API key not configured, using fallback response');
            return this.getIntelligentFallbackResponse(userMessage);
        }

        try {
            // Create system prompt based on category and session type
            const systemPrompt = this.createSystemPrompt();
            
            // Build conversation history for context
            const contents = [
                {
                    role: 'user',
                    parts: [{ text: systemPrompt }]
                },
                ...this.conversationHistory,
                {
                    role: 'user',
                    parts: [{ text: userMessage }]
                }
            ];

            const requestBody = {
                contents: contents,
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            };

            console.log('🌐 Making request to Gemini API...');
            
            const response = await fetch(`${this.GEMINI_API_URL}?key=${this.GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const aiResponse = data.candidates[0].content.parts[0].text;
                console.log('✅ Received response from Gemini API');
                return aiResponse;
            } else {
                throw new Error('Invalid response format from Gemini API');
            }
            
        } catch (error) {
            console.error('❌error:', error);
            
            // Return intelligent fallback
            return this.getIntelligentFallbackResponse(userMessage);
        }
    }

    createSystemPrompt() {
        const basePrompt = `You are an expert AI interview coach conducting a ${this.sessionType} interview session. You should:

1. Ask relevant, challenging questions appropriate for the ${this.currentCategory} interview category
2. Provide constructive feedback on responses
3. Keep questions professional and realistic
4. Ask follow-up questions to dive deeper
5. Maintain an encouraging but professional tone
6. Focus only on interview-related topics

Current session: ${this.sessionType} (${this.currentCategory})
Question count: ${this.questionCount}

Keep your responses concise but insightful. Ask one question at a time.`;

        const categorySpecificPrompts = {
            technical: basePrompt + `

For technical interviews, focus on:
- Coding problems and algorithms
- System design concepts
- Technical decision-making
- Problem-solving approaches
- Technology stack knowledge
- Best practices and code quality

Ask about specific technical experiences and challenge their technical depth.`,

            behavioral: basePrompt + `

For behavioral interviews, focus on:
- Leadership and teamwork experiences
- Problem-solving in challenging situations
- Communication and interpersonal skills
- Career motivations and goals
- Handling conflict and pressure
- Learning and growth mindset

Use the STAR method framework to guide responses and ask for specific examples.`,

            general: basePrompt + `

For general interviews, balance between:
- Personal background and motivations
- Relevant technical skills
- Soft skills and communication
- Career goals and aspirations
- Cultural fit questions
- Situational scenarios

Adapt your questions based on their responses and stated interests.`
        };

        return categorySpecificPrompts[this.currentCategory] || categorySpecificPrompts.general;
    }

    getIntelligentFallbackResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Technical responses
        if (this.currentCategory === 'technical') {
            if (this.containsKeywords(message, ['algorithm', 'complexity', 'big o', 'time complexity'])) {
                return this.getRandomResponse([
                    "Great explanation! Can you walk me through the space complexity as well? How would you optimize this algorithm for large datasets?",
                    "Interesting approach! What would happen if we had memory constraints? Can you think of alternative algorithms?",
                    "Good analysis! How would you implement this in a distributed system? What challenges might arise?"
                ]);
            }
            
            if (this.containsKeywords(message, ['project', 'built', 'developed', 'created'])) {
                return this.getRandomResponse([
                    "That sounds like a comprehensive project! What was the most challenging technical decision you had to make? How did you evaluate different options?",
                    "Impressive work! Can you dive deeper into the architecture? How did you ensure scalability and maintainability?",
                    "Great project experience! What testing strategies did you implement? How did you handle edge cases and error scenarios?"
                ]);
            }

            if (this.containsKeywords(message, ['debug', 'bug', 'issue', 'problem'])) {
                return this.getRandomResponse([
                    "Excellent debugging skills! What tools and techniques do you typically use for debugging? Can you walk me through your systematic approach?",
                    "Good problem-solving! How do you approach debugging in production environments? What strategies do you use to minimize downtime?",
                    "That's a thorough approach! How do you prevent similar issues in the future? What coding practices do you follow?"
                ]);
            }
        }
        
        // Behavioral responses
        if (this.currentCategory === 'behavioral') {
            if (this.containsKeywords(message, ['team', 'teamwork', 'collaboration', 'worked with'])) {
                return this.getRandomResponse([
                    "Great teamwork example! Tell me about a time when you had to deal with a difficult team member. How did you handle the situation?",
                    "That shows good collaboration skills! How do you typically handle disagreements in technical decisions within your team?",
                    "Excellent team experience! What role do you usually take in team projects? How do you ensure everyone's voice is heard?"
                ]);
            }
            
            if (this.containsKeywords(message, ['challenge', 'difficult', 'hard', 'struggle'])) {
                return this.getRandomResponse([
                    "That sounds challenging! What did you learn from this experience that you still apply today? How did it change your approach?",
                    "Great perseverance! How do you typically handle stress and pressure in similar situations? What strategies work best for you?",
                    "Impressive problem-solving! If you faced a similar challenge today, what would you do differently based on this experience?"
                ]);
            }

            if (this.containsKeywords(message, ['leadership', 'led', 'managed', 'guided'])) {
                return this.getRandomResponse([
                    "Strong leadership example! How do you adapt your leadership style for different team members? Can you give me a specific example?",
                    "Great leadership skills! Tell me about a time when you had to make an unpopular decision as a leader. How did you handle it?",
                    "Excellent leadership experience! How do you motivate team members who are struggling or underperforming?"
                ]);
            }
        }
        
        // General follow-up questions
        const generalResponses = [
            "That's a thoughtful response! Can you give me a specific example that demonstrates this in action?",
            "Interesting perspective! How has this experience shaped your approach to similar situations since then?",
            "Good insight! What was the most challenging aspect of what you just described? How did you overcome it?",
            "I appreciate the detail! What would you do differently if you encountered this situation again? What did you learn?",
            "That demonstrates good thinking! How do you typically validate your approach before implementing solutions like this?"
        ];
        
        return this.getRandomResponse(generalResponses);
    }

    containsKeywords(text, keywords) {
        return keywords.some(keyword => text.includes(keyword.toLowerCase()));
    }

    getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getFallbackResponse() {
        const responses = [
            "That's an interesting point! Can you elaborate on that with a specific example from your experience?",
            "Good thinking! Let me ask you this: How do you handle unexpected challenges in your work?",
            "I appreciate your response! Tell me about a time when you had to learn something completely new under pressure."
        ];
        return this.getRandomResponse(responses);
    }

    sendQuickMessage(message) {
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.value = message;
            this.sendMessage();
        }
    }

    async addMessage(sender, text) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const currentTime = new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${sender === 'ai' ? '🤖' : 'A'}</div>
            <div class="message-content">
                <div class="message-bubble">${this.formatMessage(text)}</div>
                <div class="message-time">${currentTime}</div>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        this.scrollToBottom();

        // Add slight delay for better UX
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    formatMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    showTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.classList.add('show');
            this.scrollToBottom();
        }
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.classList.remove('show');
        }
    }

    scrollToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            setTimeout(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 100);
        }
    }

    setLoadingState(loading) {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        
        if (messageInput) {
            messageInput.disabled = loading;
        }
        
        if (sendBtn) {
            sendBtn.disabled = loading;
            if (loading) {
                sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            } else {
                sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
            }
        }
    }

    clearMessages() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            const typingIndicator = document.getElementById('typingIndicator');
            chatMessages.innerHTML = '';
            if (typingIndicator) {
                chatMessages.appendChild(typingIndicator);
            }
        }
    }

    autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    updateSendButtonState() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        
        if (messageInput && sendBtn) {
            const hasText = messageInput.value.trim().length > 0;
            sendBtn.disabled = !hasText || !this.isSessionActive;
        }
    }

    isActive() {
        return this.isSessionActive;
    }

    endSession() {
        console.log('🔚 Ending interview session');
        
        this.isSessionActive = false;
        
        const sessionDuration = this.sessionStartTime ? 
            Math.round((new Date() - this.sessionStartTime) / 60000) : 0;
        
        console.log(`📊 Session ended: ${sessionDuration}min, ${this.questionCount} questions`);
        
        // Add final message
        setTimeout(() => {
            const finalMessage = `🎉 **Interview Session Complete!**

**Session Summary:**
- Duration: ${sessionDuration} minutes
- Questions Asked: ${this.questionCount}
- Category: ${this.currentCategory || 'General'}
- Type: ${this.sessionType || 'Practice'}

Great job practicing! Remember, consistent practice is key to interview success. Keep refining your responses and stay confident!

**Tips for improvement:**
- Practice the STAR method for behavioral questions
- Keep technical explanations clear and structured  
- Always ask clarifying questions when needed
- Show enthusiasm and curiosity about the role

Good luck with your upcoming interviews! 🚀`;

            this.addMessage('ai', finalMessage);
        }, 500);
        
        // Reset session variables
        this.currentCategory = null;
        this.sessionType = null;
        this.messageHistory = [];
        this.conversationHistory = [];
        this.questionCount = 0;
        this.sessionStartTime = null;
    }
}

// Make InterviewBot available globally
window.InterviewBot = InterviewBot;

console.log('✅ InterviewBot with SkillSync  AI loaded successfully!');


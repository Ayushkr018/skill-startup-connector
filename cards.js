/* ==========================================
   SkillSync AI - Card Components Module
   Dynamic Interactive Card System
   ========================================== */

class CardManager {
    constructor() {
        this.cards = new Map();
        this.cardTemplates = new Map();
        this.animationQueue = [];
        this.observers = new Map();
        this.cardEventListeners = new WeakMap();
        this.init();
    }

    init() {
        console.log('🃏 Card Manager Initializing...');
        this.setupCardTemplates();
        this.setupIntersectionObserver();
        this.setupCardEventDelegation();
        this.initializeExistingCards();
        console.log('📝 Card Manager create');
    }

    // ==========================================
    // Card Template System
    // ==========================================

    setupCardTemplates() {
        // Match Card Template
        this.cardTemplates.set('match', {
            html: `
                <div class="match-card" data-card-type="match">
                    <div class="match-score-badge">
                        <span class="score">{{matchScore}}%</span>
                        <span class="label">Match</span>
                    </div>
                    <div class="match-card-content">
                        <div class="match-header">
                            <div class="match-avatar">{{avatar}}</div>
                            <div class="match-info">
                                <h3>{{name}}</h3>
                                <p>{{title}}</p>
                                <div class="match-location">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span>{{location}}</span>
                                </div>
                            </div>
                        </div>
                        <div class="match-description">
                            <p>{{description}}</p>
                        </div>
                        <div class="match-skills">{{skills}}</div>
                        <div class="match-details">
                            <div class="match-detail">
                                <i class="fas fa-briefcase"></i>
                                <span>{{experience}}</span>
                            </div>
                            <div class="match-detail">
                                <i class="fas fa-clock"></i>
                                <span>{{duration}}</span>
                            </div>
                            <div class="match-detail">
                                <i class="fas fa-dollar-sign"></i>
                                <span>{{salary}}</span>
                            </div>
                        </div>
                        <div class="match-actions">
                            <button class="btn-match-action btn-pass" data-action="pass">
                                <i class="fas fa-times"></i>
                                <span>Pass</span>
                            </button>
                            <button class="btn-match-action btn-connect" data-action="connect">
                                <i class="fas fa-heart"></i>
                                <span>Connect</span>
                            </button>
                        </div>
                    </div>
                </div>
            `,
            styles: `
                .match-card {
                    background: var(--card-primary);
                    border-radius: var(--border-radius-lg);
                    box-shadow: var(--card-shadow);
                    border: 1px solid var(--dashboard-border);
                    overflow: hidden;
                    transition: var(--transition-normal);
                    position: relative;
                    margin-bottom: var(--spacing-lg);
                }
                .match-card:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--card-shadow-hover);
                }
            `
        });

        // Profile Card Template
        this.cardTemplates.set('profile', {
            html: `
                <div class="profile-card" data-card-type="profile">
                    <div class="profile-header">
                        <div class="profile-avatar">{{avatar}}</div>
                        <h2 class="profile-name">{{name}}</h2>
                        <p class="profile-title">{{title}}</p>
                    </div>
                    <div class="profile-body">
                        <div class="profile-stats">{{stats}}</div>
                        <div class="profile-completeness">
                            <div class="completeness-header">
                                <span class="completeness-label">Profile Completeness</span>
                                <span class="completeness-percentage">{{completeness}}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: {{completeness}}%"></div>
                            </div>
                        </div>
                        <div class="profile-actions">{{actions}}</div>
                    </div>
                </div>
            `
        });

        // Notification Card Template
        this.cardTemplates.set('notification', {
            html: `
                <div class="notification-card" data-card-type="notification">
                    <div class="notification-icon">
                        <i class="fas fa-{{icon}}"></i>
                    </div>
                    <div class="notification-content">
                        <h4>{{title}}</h4>
                        <p>{{message}}</p>
                        <span class="notification-time">{{time}}</span>
                    </div>
                    <div class="notification-actions">
                        <button class="btn-notification-action" data-action="dismiss">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `
        });

        // Statistics Card Template
        this.cardTemplates.set('stat', {
            html: `
                <div class="stat-card" data-card-type="stat">
                    <div class="stat-header">
                        <div class="stat-icon {{iconClass}}">
                            <i class="fas fa-{{icon}}"></i>
                        </div>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value" data-count="{{value}}">0</div>
                        <div class="stat-label">{{label}}</div>
                        <div class="stat-change {{changeClass}}">
                            <i class="fas fa-{{changeIcon}}"></i>
                            <span>{{change}}</span>
                        </div>
                    </div>
                </div>
            `
        });
    }

    // ==========================================
    // Card Creation Methods
    // ==========================================

    createMatchCard(matchData) {
        const cardId = `match_${matchData.id}`;
        
        const cardData = {
            matchScore: this.getMatchScoreClass(matchData.matchScore),
            avatar: this.createAvatarHTML(matchData.avatar, matchData.name),
            name: this.escapeHtml(matchData.name),
            title: this.escapeHtml(matchData.title || matchData.role),
            location: this.escapeHtml(matchData.location || 'Remote'),
            description: this.truncateText(matchData.description, 120),
            skills: this.createSkillsHTML(matchData.skills, matchData.matchingSkills),
            experience: matchData.experience || 'Not specified',
            duration: matchData.duration || 'Flexible',
            salary: this.formatSalary(matchData.salary)
        };

        const card = this.createCardFromTemplate('match', cardData);
        card.dataset.matchId = matchData.id;
        card.dataset.cardId = cardId;

        // Add match score styling
        const scoreBadge = card.querySelector('.match-score-badge');
        if (scoreBadge) {
            scoreBadge.classList.add(this.getMatchScoreClass(matchData.matchScore));
        }

        // Setup card interactions
        this.setupMatchCardInteractions(card, matchData);

        return card;
    }

    createProfileCard(profileData) {
        const cardId = `profile_${profileData.id}`;
        
        const cardData = {
            avatar: this.createAvatarHTML(profileData.avatar, profileData.name),
            name: this.escapeHtml(profileData.name),
            title: this.escapeHtml(profileData.title || profileData.role),
            stats: this.createProfileStatsHTML(profileData.stats),
            completeness: profileData.completeness || 0,
            actions: this.createProfileActionsHTML(profileData.actions)
        };

        const card = this.createCardFromTemplate('profile', cardData);
        card.dataset.profileId = profileData.id;
        card.dataset.cardId = cardId;

        // Setup profile interactions
        this.setupProfileCardInteractions(card, profileData);

        return card;
    }

    createNotificationCard(notificationData) {
        const cardId = `notification_${notificationData.id}`;
        
        const cardData = {
            icon: this.getNotificationIcon(notificationData.type),
            title: this.escapeHtml(notificationData.title),
            message: this.escapeHtml(notificationData.message),
            time: this.formatRelativeTime(notificationData.timestamp)
        };

        const card = this.createCardFromTemplate('notification', cardData);
        card.dataset.notificationId = notificationData.id;
        card.dataset.cardId = cardId;

        // Add notification type styling
        card.classList.add(`notification-${notificationData.type}`);

        // Setup notification interactions
        this.setupNotificationCardInteractions(card, notificationData);

        return card;
    }

    createStatCard(statData) {
        const cardId = `stat_${statData.id}`;
        
        const cardData = {
            icon: statData.icon,
            iconClass: statData.iconClass || '',
            value: statData.value,
            label: this.escapeHtml(statData.label),
            change: statData.change,
            changeClass: statData.change >= 0 ? 'positive' : 'negative',
            changeIcon: statData.change >= 0 ? 'arrow-up' : 'arrow-down'
        };

        const card = this.createCardFromTemplate('stat', cardData);
        card.dataset.statId = statData.id;
        card.dataset.cardId = cardId;

        // Setup stat card interactions
        this.setupStatCardInteractions(card, statData);

        // Animate counter
        this.animateCounter(card.querySelector('.stat-value'), statData.value);

        return card;
    }

    createCardFromTemplate(templateName, data) {
        const template = this.cardTemplates.get(templateName);
        if (!template) {
            throw new Error(`Template '${templateName}' not found`);
        }

        let html = template.html;
        
        // Replace placeholders with data
        for (const [key, value] of Object.entries(data)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            html = html.replace(regex, value);
        }

        // Create DOM element
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const card = tempDiv.firstElementChild;

        // Add common card functionality
        this.addCardBase(card);

        return card;
    }

    // ==========================================
    // Card Interaction Setup
    // ==========================================

    setupMatchCardInteractions(card, matchData) {
        // Setup action buttons
        const actionButtons = card.querySelectorAll('.btn-match-action');
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const action = button.dataset.action;
                this.handleMatchAction(action, matchData.id, card);
            });
        });

        // Setup card click for details
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.btn-match-action')) {
                this.showMatchDetails(matchData);
            }
        });

        // Setup hover effects
        card.addEventListener('mouseenter', () => {
            this.showMatchPreview(card, matchData);
        });

        card.addEventListener('mouseleave', () => {
            this.hideMatchPreview(card);
        });
    }

    setupProfileCardInteractions(card, profileData) {
        // Setup edit button
        const editButton = card.querySelector('.btn-edit-profile');
        if (editButton) {
            editButton.addEventListener('click', () => {
                this.openProfileEditor(profileData);
            });
        }

        // Setup view button
        const viewButton = card.querySelector('.btn-view-profile');
        if (viewButton) {
            viewButton.addEventListener('click', () => {
                this.showFullProfile(profileData);
            });
        }
    }

    setupNotificationCardInteractions(card, notificationData) {
        // Setup dismiss button
        const dismissButton = card.querySelector('[data-action="dismiss"]');
        if (dismissButton) {
            dismissButton.addEventListener('click', () => {
                this.dismissNotification(notificationData.id, card);
            });
        }

        // Setup notification click
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-actions')) {
                this.handleNotificationClick(notificationData);
            }
        });

        // Auto-dismiss after delay
        if (notificationData.autoDismiss) {
            setTimeout(() => {
                this.dismissNotification(notificationData.id, card);
            }, notificationData.duration || 5000);
        }
    }

    setupStatCardInteractions(card, statData) {
        // Setup click for details
        card.addEventListener('click', () => {
            this.showStatDetails(statData);
        });

        // Setup tooltip
        this.addTooltip(card, statData.tooltip);
    }

    // ==========================================
    // Card Animation System
    // ==========================================

    animateCardEntry(card, animationType = 'slideUp') {
        card.style.opacity = '0';
        card.style.transform = this.getInitialTransform(animationType);

        // Add to animation queue
        this.animationQueue.push(() => {
            card.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'none';
        });

        // Process queue
        this.processAnimationQueue();
    }

    animateCardExit(card, animationType = 'slideOut') {
        return new Promise((resolve) => {
            card.style.transition = 'all 0.3s ease-in';
            card.style.transform = this.getExitTransform(animationType);
            card.style.opacity = '0';

            setTimeout(() => {
                card.remove();
                resolve();
            }, 300);
        });
    }

    animateCardUpdate(card, updates) {
        // Add pulse effect
        card.classList.add('updating');
        
        // Apply updates
        Object.entries(updates).forEach(([selector, value]) => {
            const element = card.querySelector(selector);
            if (element) {
                if (selector.includes('data-count')) {
                    this.animateCounter(element, value);
                } else {
                    element.textContent = value;
                }
            }
        });

        // Remove pulse effect
        setTimeout(() => {
            card.classList.remove('updating');
        }, 600);
    }

    animateCounter(element, targetValue, duration = 1000) {
        const startValue = parseInt(element.textContent) || 0;
        const increment = (targetValue - startValue) / (duration / 16);
        let currentValue = startValue;

        const timer = setInterval(() => {
            currentValue += increment;
            
            if ((increment > 0 && currentValue >= targetValue) ||
                (increment < 0 && currentValue <= targetValue)) {
                currentValue = targetValue;
                clearInterval(timer);
            }

            element.textContent = Math.floor(currentValue);
        }, 16);
    }

    processAnimationQueue() {
        if (this.animationQueue.length === 0) return;

        const animations = this.animationQueue.splice(0, 5); // Process 5 at a time
        
        animations.forEach((animation, index) => {
            setTimeout(animation, index * 100);
        });

        // Continue processing if more animations remain
        if (this.animationQueue.length > 0) {
            setTimeout(() => this.processAnimationQueue(), 600);
        }
    }

    // ==========================================
    // Card Event Handlers
    // ==========================================

    handleMatchAction(action, matchId, card) {
        const button = card.querySelector(`[data-action="${action}"]`);
        
        // Show loading state
        this.setButtonLoading(button, true);

        if (action === 'connect') {
            this.handleConnectAction(matchId, card);
        } else if (action === 'pass') {
            this.handlePassAction(matchId, card);
        }
    }

    async handleConnectAction(matchId, card) {
        try {
            // Call API
            const response = await this.apiCall(`/matches/${matchId}/connect`, {
                method: 'POST'
            });

            if (response.success) {
                // Update card state
                card.classList.add('connected');
                
                // Show success message
                this.showCardMessage(card, 'Connection request sent!', 'success');
                
                // Update button
                const connectBtn = card.querySelector('[data-action="connect"]');
                connectBtn.innerHTML = '<i class="fas fa-check"></i><span>Connected</span>';
                connectBtn.disabled = true;
                
                // Animate success
                this.animateCardSuccess(card);
                
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            this.showCardMessage(card, 'Failed to connect. Please try again.', 'error');
        } finally {
            const button = card.querySelector('[data-action="connect"]');
            this.setButtonLoading(button, false);
        }
    }

    async handlePassAction(matchId, card) {
        try {
            // Call API
            const response = await this.apiCall(`/matches/${matchId}/pass`, {
                method: 'POST'
            });

            if (response.success) {
                // Animate card removal
                await this.animateCardExit(card, 'slideLeft');
                
                // Remove from DOM
                this.removeCard(card.dataset.cardId);
                
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            this.showCardMessage(card, 'Failed to pass match. Please try again.', 'error');
        } finally {
            const button = card.querySelector('[data-action="pass"]');
            this.setButtonLoading(button, false);
        }
    }

    dismissNotification(notificationId, card) {
        // Animate exit
        this.animateCardExit(card, 'slideRight');
        
        // Mark as read
        this.markNotificationAsRead(notificationId);
        
        // Remove from cards map
        this.removeCard(card.dataset.cardId);
    }

    // ==========================================
    // Card Utility Methods
    // ==========================================

    createAvatarHTML(avatarUrl, name) {
        if (avatarUrl) {
            return `<img src="${avatarUrl}" alt="${name}" class="avatar-image">`;
        } else {
            const initial = name ? name.charAt(0).toUpperCase() : '?';
            return `<span class="avatar-initial">${initial}</span>`;
        }
    }

    createSkillsHTML(skills, matchingSkills = []) {
        if (!skills || skills.length === 0) return '';

        return skills.map(skill => {
            const skillName = typeof skill === 'string' ? skill : skill.name;
            const isMatched = matchingSkills.includes(skillName);
            return `<span class="skill-tag ${isMatched ? 'matched' : ''}">${this.escapeHtml(skillName)}</span>`;
        }).join('');
    }

    createProfileStatsHTML(stats) {
        if (!stats) return '';

        return Object.entries(stats).map(([key, value]) => `
            <div class="profile-stat">
                <span class="profile-stat-value">${value}</span>
                <span class="profile-stat-label">${this.escapeHtml(key)}</span>
            </div>
        `).join('');
    }

    createProfileActionsHTML(actions) {
        if (!actions) return '';

        return actions.map(action => `
            <button class="btn-profile-action btn-${action.type}" data-action="${action.type}">
                <i class="fas fa-${action.icon}"></i>
                <span>${this.escapeHtml(action.label)}</span>
            </button>
        `).join('');
    }

    getMatchScoreClass(score) {
        if (score >= 90) return 'excellent';
        if (score >= 75) return 'good';
        if (score >= 60) return 'average';
        return 'poor';
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle',
            match: 'heart',
            message: 'comment',
            system: 'cog'
        };
        return icons[type] || 'bell';
    }

    formatSalary(salary) {
        if (!salary) return 'Not specified';
        
        if (typeof salary === 'object') {
            return `₹${salary.min}k - ₹${salary.max}k`;
        }
        
        return `₹${salary}k`;
    }

    formatRelativeTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInMinutes = (now - time) / (1000 * 60);

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        
        return time.toLocaleDateString();
    }

    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
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

    // ==========================================
    // Card Management
    // ==========================================

    addCard(card, container, options = {}) {
        const cardId = card.dataset.cardId || this.generateCardId();
        card.dataset.cardId = cardId;

        // Store card reference
        this.cards.set(cardId, {
            element: card,
            container: container,
            data: options.data,
            created: Date.now()
        });

        // Add to container
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }

        if (container) {
            if (options.prepend) {
                container.insertBefore(card, container.firstChild);
            } else {
                container.appendChild(card);
            }

            // Animate entry
            if (options.animate !== false) {
                this.animateCardEntry(card, options.animation);
            }
        }

        return cardId;
    }

    removeCard(cardId) {
        const cardData = this.cards.get(cardId);
        if (cardData) {
            cardData.element.remove();
            this.cards.delete(cardId);
        }
    }

    updateCard(cardId, updates) {
        const cardData = this.cards.get(cardId);
        if (cardData) {
            this.animateCardUpdate(cardData.element, updates);
        }
    }

    getCard(cardId) {
        return this.cards.get(cardId);
    }

    getAllCards(type = null) {
        if (!type) {
            return Array.from(this.cards.values());
        }
        
        return Array.from(this.cards.values()).filter(cardData => 
            cardData.element.dataset.cardType === type
        );
    }

    clearCards(container) {
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }

        const cardsToRemove = [];
        this.cards.forEach((cardData, cardId) => {
            if (cardData.container === container) {
                cardsToRemove.push(cardId);
            }
        });

        cardsToRemove.forEach(cardId => this.removeCard(cardId));
    }

    // ==========================================
    // Event System
    // ==========================================

    setupCardEventDelegation() {
        document.addEventListener('click', (e) => {
            const card = e.target.closest('[data-card-type]');
            if (!card) return;

            const cardType = card.dataset.cardType;
            const action = e.target.dataset.action;

            if (action) {
                this.handleCardAction(card, action, e);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeCardModals();
            }
        });
    }

    handleCardAction(card, action, event) {
        const cardType = card.dataset.cardType;
        const cardId = card.dataset.cardId;
        
        // Emit custom event
        const customEvent = new CustomEvent('cardAction', {
            detail: {
                cardType,
                cardId,
                action,
                card,
                originalEvent: event
            }
        });
        
        document.dispatchEvent(customEvent);
    }

    // ==========================================
    // Intersection Observer for Lazy Loading
    // ==========================================

    setupIntersectionObserver() {
        this.cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    this.handleCardVisible(card);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });
    }

    observeCard(card) {
        if (this.cardObserver) {
            this.cardObserver.observe(card);
        }
    }

    handleCardVisible(card) {
        // Add visible class for animations
        card.classList.add('card-visible');
        
        // Load lazy content if needed
        const lazyElements = card.querySelectorAll('[data-lazy-src]');
        lazyElements.forEach(element => {
            element.src = element.dataset.lazySrc;
            element.removeAttribute('data-lazy-src');
        });
    }

    // ==========================================
    // Utility Methods
    // ==========================================

    addCardBase(card) {
        // Add common classes
        card.classList.add('app-card');
        
        // Add common attributes
        card.setAttribute('role', 'article');
        card.setAttribute('tabindex', '0');
        
        // Setup keyboard navigation
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });

        // Setup intersection observer
        this.observeCard(card);
    }

    generateCardId() {
        return `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    setButtonLoading(button, loading) {
        if (!button) return;

        if (loading) {
            button.disabled = true;
            button.classList.add('loading');
            const originalContent = button.innerHTML;
            button.dataset.originalContent = originalContent;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            if (button.dataset.originalContent) {
                button.innerHTML = button.dataset.originalContent;
                delete button.dataset.originalContent;
            }
        }
    }

    showCardMessage(card, message, type = 'info') {
        let messageElement = card.querySelector('.card-message');
        
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.className = 'card-message';
            card.appendChild(messageElement);
        }

        messageElement.className = `card-message ${type}`;
        messageElement.textContent = message;
        messageElement.style.display = 'block';

        // Auto-hide after 3 seconds
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 3000);
    }

    async apiCall(endpoint, options = {}) {
        const token = localStorage.getItem('skillsync_token');
        const apiUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:8000/api' 
            : 'https://skillsync-api.vercel.app/api';

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            },
            ...options
        };

        const response = await fetch(`${apiUrl}${endpoint}`, config);
        return response.json();
    }

    getInitialTransform(animationType) {
        const transforms = {
            slideUp: 'translateY(30px)',
            slideDown: 'translateY(-30px)',
            slideLeft: 'translateX(-30px)',
            slideRight: 'translateX(30px)',
            scale: 'scale(0.9)',
            fade: 'translateY(10px)'
        };
        return transforms[animationType] || transforms.slideUp;
    }

    getExitTransform(animationType) {
        const transforms = {
            slideUp: 'translateY(-100%)',
            slideDown: 'translateY(100%)',
            slideLeft: 'translateX(-100%)',
            slideRight: 'translateX(100%)',
            scale: 'scale(0.8)',
            fade: 'translateY(-10px)'
        };
        return transforms[animationType] || transforms.slideLeft;
    }

    // ==========================================
    // Public API Methods
    // ==========================================

    createAndAddMatchCard(matchData, container, options = {}) {
        const card = this.createMatchCard(matchData);
        return this.addCard(card, container, { ...options, data: matchData });
    }

    createAndAddProfileCard(profileData, container, options = {}) {
        const card = this.createProfileCard(profileData);
        return this.addCard(card, container, { ...options, data: profileData });
    }

    createAndAddNotificationCard(notificationData, container, options = {}) {
        const card = this.createNotificationCard(notificationData);
        return this.addCard(card, container, { ...options, data: notificationData });
    }

    createAndAddStatCard(statData, container, options = {}) {
        const card = this.createStatCard(statData);
        return this.addCard(card, container, { ...options, data: statData });
    }

    initializeExistingCards() {
        // Initialize any existing cards in the DOM
        document.querySelectorAll('[data-card-type]').forEach(card => {
            this.addCardBase(card);
            
            const cardId = card.dataset.cardId || this.generateCardId();
            card.dataset.cardId = cardId;
            
            this.cards.set(cardId, {
                element: card,
                container: card.parentElement,
                created: Date.now()
            });
        });
    }
}

// Initialize Card Manager
const cardManager = new CardManager();

// Export for global access
window.cardManager = cardManager;
window.cards = cardManager;

// Console welcome message
console.log(`
🃏 SkillSync AI Card System Loaded
📇 Dynamic Card Templates create
🎨 Animation System Active
⚡ Event Delegation Configured
`);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CardManager;
}

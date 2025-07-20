/* ==========================================
   SkillSync AI - Sidebar Component Module
   Professional Dashboard Sidebar Management
   ========================================== */

class SidebarManager {
    constructor() {
        this.isCollapsed = false;
        this.isMobileOpen = false;
        this.activeMenuItem = null;
        this.userType = null;
        this.notifications = 0;
        this.menuItems = {
            student: [
                { id: 'dashboard', icon: 'fas fa-tachometer-alt', text: 'Dashboard', href: 'student-dashboard.html', badge: null },
                { id: 'matches', icon: 'fas fa-heart', text: 'Matches', href: '#matches', badge: 'new' },
                { id: 'profile', icon: 'fas fa-user', text: 'My Profile', href: '#profile', badge: null },
                { id: 'applications', icon: 'fas fa-paper-plane', text: 'Applications', href: '#applications', badge: null },
                { id: 'messages', icon: 'fas fa-comments', text: 'Messages', href: '#messages', badge: null },
                { id: 'skills', icon: 'fas fa-code', text: 'Skills & Tests', href: '#skills', badge: null },
                { id: 'portfolio', icon: 'fas fa-briefcase', text: 'Portfolio', href: '#portfolio', badge: null },
                { id: 'analytics', icon: 'fas fa-chart-line', text: 'Analytics', href: '#analytics', badge: null }
            ],
            startup: [
                { id: 'dashboard', icon: 'fas fa-tachometer-alt', text: 'Dashboard', href: 'startup-dashboard.html', badge: null },
                { id: 'candidates', icon: 'fas fa-users', text: 'Candidates', href: '#candidates', badge: 'hot' },
                { id: 'jobs', icon: 'fas fa-briefcase', text: 'Job Posts', href: '#jobs', badge: null },
                { id: 'company', icon: 'fas fa-building', text: 'Company Profile', href: '#company', badge: null },
                { id: 'messages', icon: 'fas fa-comments', text: 'Messages', href: '#messages', badge: null },
                { id: 'interviews', icon: 'fas fa-video', text: 'Interviews', href: '#interviews', badge: null },
                { id: 'team', icon: 'fas fa-user-friends', text: 'Team', href: '#team', badge: null },
                { id: 'analytics', icon: 'fas fa-chart-line', text: 'Analytics', href: '#analytics', badge: null }
            ]
        };
        this.init();
    }

    init() {
        console.log('📋 Sidebar Manager Initializing...');
        this.detectUserType();
        this.setupEventListeners();
        this.renderSidebar();
        this.loadUserData();
        this.setupKeyboardShortcuts();
        this.initializeTooltips();
        console.log('📝 Sidebar Manager create');
    }

    // ==========================================
    // Sidebar Rendering
    // ==========================================

    renderSidebar() {
        const sidebarContainer = document.querySelector('.dashboard-sidebar');
        if (!sidebarContainer) {
            console.warn('Sidebar container not found');
            return;
        }

        sidebarContainer.innerHTML = this.generateSidebarHTML();
        this.attachSidebarEventListeners();
        this.updateActiveMenuItem();
        this.updateNotificationBadges();
    }

    generateSidebarHTML() {
        const menuItems = this.menuItems[this.userType] || this.menuItems.student;
        
        return `
            <!-- Sidebar Header -->
            <div class="sidebar-header">
                <a href="index.html" class="sidebar-logo">
                    <i class="fas fa-network-wired"></i>
                    <span class="logo-text">SkillSync AI</span>
                </a>
                <button class="sidebar-toggle" title="Toggle Sidebar">
                    <i class="fas fa-chevron-left"></i>
                </button>
            </div>

            <!-- Sidebar Navigation -->
            <nav class="sidebar-nav">
                <div class="sidebar-section">
                    <div class="sidebar-section-title">Main Menu</div>
                    <ul class="sidebar-menu">
                        ${menuItems.map(item => this.generateMenuItem(item)).join('')}
                    </ul>
                </div>

                <div class="sidebar-section">
                    <div class="sidebar-section-title">Tools</div>
                    <ul class="sidebar-menu">
                        ${this.generateToolsMenu()}
                    </ul>
                </div>

                <div class="sidebar-section">
                    <div class="sidebar-section-title">Support</div>
                    <ul class="sidebar-menu">
                        ${this.generateSupportMenu()}
                    </ul>
                </div>
            </nav>

            <!-- Sidebar User Profile -->
            <div class="sidebar-user">
                <div class="sidebar-user-info">
                    <div class="sidebar-user-avatar" id="sidebarUserAvatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="sidebar-user-details">
                        <div class="sidebar-user-name" id="sidebarUserName">Loading...</div>
                        <div class="sidebar-user-role" id="sidebarUserRole">${this.userType}</div>
                    </div>
                </div>
                <div class="sidebar-user-actions">
                    <button class="sidebar-action-btn" onclick="sidebar.openSettings()" title="Settings">
                        <i class="fas fa-cog"></i>
                    </button>
                    <button class="sidebar-action-btn" onclick="sidebar.logout()" title="Logout">
                        <i class="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            </div>
        `;
    }

    generateMenuItem(item) {
        const badgeHTML = item.badge ? `<span class="menu-badge badge-${item.badge}">${this.getBadgeText(item.badge)}</span>` : '';
        const isActive = this.activeMenuItem === item.id ? 'active' : '';
        
        return `
            <li class="sidebar-menu-item">
                <a href="${item.href}" 
                   class="sidebar-menu-link ${isActive}" 
                   data-menu-id="${item.id}"
                   title="${item.text}">
                    <span class="sidebar-menu-icon">
                        <i class="${item.icon}"></i>
                    </span>
                    <span class="sidebar-menu-text">${item.text}</span>
                    ${badgeHTML}
                </a>
            </li>
        `;
    }

    generateToolsMenu() {
        const toolsItems = [
            { id: 'resume-builder', icon: 'fas fa-file-alt', text: 'Resume Builder', href: '#resume-builder' },
            { id: 'skill-assessments', icon: 'fas fa-clipboard-check', text: 'Skill Tests', href: '#assessments' },
            { id: 'interview-prep', icon: 'fas fa-microphone', text: 'Interview Prep', href: '#interview-prep' },
            { id: 'career-guide', icon: 'fas fa-compass', text: 'Career Guide', href: '#career-guide' }
        ];

        return toolsItems.map(item => this.generateMenuItem(item)).join('');
    }

    generateSupportMenu() {
        const supportItems = [
            { id: 'help', icon: 'fas fa-question-circle', text: 'Help Center', href: '#help' },
            { id: 'feedback', icon: 'fas fa-comment-alt', text: 'Feedback', href: '#feedback' },
            { id: 'settings', icon: 'fas fa-cog', text: 'Settings', href: '#settings' }
        ];

        return supportItems.map(item => this.generateMenuItem(item)).join('');
    }

    getBadgeText(badgeType) {
        const badges = {
            'new': this.notifications > 0 ? this.notifications : '',
            'hot': '🔥',
            'beta': 'β',
            'pro': 'PRO'
        };
        return badges[badgeType] || '';
    }

    // ==========================================
    // Event Listeners
    // ==========================================

    setupEventListeners() {
        // Window resize handler
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));

        // Storage change handler for multi-tab sync
        window.addEventListener('storage', (e) => {
            if (e.key === 'sidebar_preferences') {
                this.loadSidebarPreferences();
            }
        });

        // Hash change handler for SPA navigation
        window.addEventListener('hashchange', () => {
            this.updateActiveMenuItem();
        });

        // Click outside handler for mobile
        document.addEventListener('click', (e) => {
            if (this.isMobileOpen && !e.target.closest('.dashboard-sidebar') && !e.target.closest('.mobile-menu-toggle')) {
                this.closeMobileSidebar();
            }
        });
    }

    attachSidebarEventListeners() {
        // Toggle button
        const toggleBtn = document.querySelector('.sidebar-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleCollapse();
            });
        }

        // Menu items
        document.querySelectorAll('.sidebar-menu-link').forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleMenuClick(e);
            });
        });

        // Mobile menu toggle
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                this.toggleMobileSidebar();
            });
        }

        // User profile click
        const userInfo = document.querySelector('.sidebar-user-info');
        if (userInfo) {
            userInfo.addEventListener('click', () => {
                this.showUserMenu();
            });
        }
    }

    // ==========================================
    // Navigation Handling
    // ==========================================

    handleMenuClick(e) {
        const link = e.currentTarget;
        const menuId = link.dataset.menuId;
        const href = link.getAttribute('href');

        // Don't prevent default for external links
        if (href.startsWith('http') || href.endsWith('.html')) {
            return;
        }

        e.preventDefault();

        // Update active menu item
        this.setActiveMenuItem(menuId);

        // Handle hash navigation for SPA
        if (href.startsWith('#')) {
            this.navigateToSection(href.slice(1));
        }

        // Close mobile sidebar after navigation
        if (this.isMobileOpen) {
            this.closeMobileSidebar();
        }

        // Track navigation analytics
        this.trackNavigation(menuId);
    }

    navigateToSection(sectionId) {
        // Hide all content sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            
            // Smooth scroll to section
            targetSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });

            // Update page title
            this.updatePageTitle(sectionId);

            // Load section data if needed
            this.loadSectionData(sectionId);
        } else {
            console.warn(`Section ${sectionId} not found`);
        }

        // Update URL hash without triggering hashchange event
        history.replaceState(null, null, `#${sectionId}`);
    }

    setActiveMenuItem(menuId) {
        // Remove active class from all menu items
        document.querySelectorAll('.sidebar-menu-link').forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to selected item
        const activeLink = document.querySelector(`[data-menu-id="${menuId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            this.activeMenuItem = menuId;
            
            // Save active menu to local storage
            localStorage.setItem('active_menu_item', menuId);
        }
    }

    updateActiveMenuItem() {
        const hash = window.location.hash.slice(1);
        const menuItems = this.menuItems[this.userType] || [];
        
        // Find menu item by hash
        const matchingItem = menuItems.find(item => 
            item.href === `#${hash}` || item.id === hash
        );

        if (matchingItem) {
            this.setActiveMenuItem(matchingItem.id);
        } else {
            // Default to dashboard
            this.setActiveMenuItem('dashboard');
        }
    }

    // ==========================================
    // Sidebar State Management
    // ==========================================

    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;
        const sidebar = document.querySelector('.dashboard-sidebar');
        const mainContent = document.querySelector('.dashboard-main');

        if (sidebar) {
            sidebar.classList.toggle('collapsed', this.isCollapsed);
        }

        if (mainContent) {
            mainContent.classList.toggle('expanded', this.isCollapsed);
        }

        // Update toggle button icon
        const toggleIcon = document.querySelector('.sidebar-toggle i');
        if (toggleIcon) {
            toggleIcon.className = this.isCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left';
        }

        // Save preference
        this.saveSidebarPreferences();

        // Trigger custom event
        this.dispatchSidebarEvent('sidebar-toggle', { collapsed: this.isCollapsed });
    }

    toggleMobileSidebar() {
        this.isMobileOpen = !this.isMobileOpen;
        const sidebar = document.querySelector('.dashboard-sidebar');
        const overlay = document.querySelector('.dashboard-overlay');

        if (sidebar) {
            sidebar.classList.toggle('mobile-open', this.isMobileOpen);
        }

        if (overlay) {
            overlay.classList.toggle('active', this.isMobileOpen);
        }

        // Prevent body scroll when mobile sidebar is open
        document.body.style.overflow = this.isMobileOpen ? 'hidden' : '';
    }

    closeMobileSidebar() {
        this.isMobileOpen = false;
        const sidebar = document.querySelector('.dashboard-sidebar');
        const overlay = document.querySelector('.dashboard-overlay');

        if (sidebar) {
            sidebar.classList.remove('mobile-open');
        }

        if (overlay) {
            overlay.classList.remove('active');
        }

        document.body.style.overflow = '';
    }

    handleResize() {
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // Force collapse on mobile
            if (!this.isCollapsed) {
                this.isCollapsed = true;
                const sidebar = document.querySelector('.dashboard-sidebar');
                if (sidebar) {
                    sidebar.classList.add('mobile-view');
                }
            }
        } else {
            // Remove mobile classes on desktop
            this.closeMobileSidebar();
            const sidebar = document.querySelector('.dashboard-sidebar');
            if (sidebar) {
                sidebar.classList.remove('mobile-view', 'mobile-open');
            }
        }
    }

    // ==========================================
    // User Data Management
    // ==========================================

    async loadUserData() {
        try {
            const user = this.getCurrentUser();
            if (user) {
                this.updateUserDisplay(user);
                await this.loadNotifications();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    updateUserDisplay(user) {
        const nameElement = document.getElementById('sidebarUserName');
        const roleElement = document.getElementById('sidebarUserRole');
        const avatarElement = document.getElementById('sidebarUserAvatar');

        if (nameElement) {
            nameElement.textContent = user.name || 'User';
        }

        if (roleElement) {
            roleElement.textContent = user.role || this.userType;
        }

        if (avatarElement) {
            if (user.avatar) {
                avatarElement.innerHTML = `<img src="${user.avatar}" alt="${user.name}" />`;
            } else {
                avatarElement.innerHTML = user.name ? user.name.charAt(0).toUpperCase() : 'U';
            }
        }
    }

    async loadNotifications() {
        try {
            const response = await this.apiCall('/notifications/count');
            if (response.success) {
                this.notifications = response.count;
                this.updateNotificationBadges();
            }
        } catch (error) {
            console.warn('Failed to load notifications:', error);
        }
    }

    updateNotificationBadges() {
        // Update messages badge
        const messagesBadge = document.querySelector('[data-menu-id="messages"] .menu-badge');
        if (messagesBadge && this.notifications > 0) {
            messagesBadge.textContent = this.notifications;
            messagesBadge.style.display = 'inline-block';
        }

        // Update matches badge for students
        if (this.userType === 'student') {
            const matchesBadge = document.querySelector('[data-menu-id="matches"] .menu-badge');
            if (matchesBadge) {
                // Could load new matches count here
                matchesBadge.style.display = 'inline-block';
            }
        }
    }

    // ==========================================
    // Settings and Preferences
    // ==========================================

    openSettings() {
        this.navigateToSection('settings');
    }

    showUserMenu() {
        const userMenu = this.createUserMenu();
        this.showContextMenu(userMenu, event.currentTarget);
    }

    createUserMenu() {
        return [
            { icon: 'fas fa-user', text: 'View Profile', action: () => this.navigateToSection('profile') },
            { icon: 'fas fa-cog', text: 'Account Settings', action: () => this.navigateToSection('settings') },
            { icon: 'fas fa-bell', text: 'Notifications', action: () => this.navigateToSection('notifications') },
            { icon: 'fas fa-question-circle', text: 'Help & Support', action: () => this.navigateToSection('help') },
            { separator: true },
            { icon: 'fas fa-sign-out-alt', text: 'Logout', action: () => this.logout(), danger: true }
        ];
    }

    saveSidebarPreferences() {
        const preferences = {
            collapsed: this.isCollapsed,
            activeMenuItem: this.activeMenuItem,
            userType: this.userType
        };

        localStorage.setItem('sidebar_preferences', JSON.stringify(preferences));
    }

    loadSidebarPreferences() {
        try {
            const saved = localStorage.getItem('sidebar_preferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                this.isCollapsed = preferences.collapsed || false;
                this.activeMenuItem = preferences.activeMenuItem || 'dashboard';
                
                // Apply preferences
                if (this.isCollapsed) {
                    this.toggleCollapse();
                }
            }
        } catch (error) {
            console.warn('Failed to load sidebar preferences:', error);
        }
    }

    // ==========================================
    // Keyboard Shortcuts
    // ==========================================

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when not in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            const shortcuts = {
                'KeyS': () => this.toggleCollapse(), // S key
                'KeyM': () => this.navigateToSection('messages'), // M key
                'KeyD': () => this.navigateToSection('dashboard'), // D key
                'KeyP': () => this.navigateToSection('profile'), // P key
                'Escape': () => this.closeMobileSidebar() // ESC key
            };

            if (e.ctrlKey || e.metaKey) {
                const shortcut = shortcuts[e.code];
                if (shortcut) {
                    e.preventDefault();
                    shortcut();
                }
            } else if (e.code === 'Escape') {
                this.closeMobileSidebar();
            }
        });
    }

    // ==========================================
    // Tooltips and Help
    // ==========================================

    initializeTooltips() {
        // Initialize tooltips for collapsed sidebar
        document.querySelectorAll('.sidebar-menu-link').forEach(link => {
            const tooltip = link.getAttribute('title');
            if (tooltip) {
                this.attachTooltip(link, tooltip);
            }
        });
    }

    attachTooltip(element, text) {
        let tooltip;

        element.addEventListener('mouseenter', (e) => {
            if (!this.isCollapsed) return; // Only show tooltips when collapsed

            tooltip = document.createElement('div');
            tooltip.className = 'sidebar-tooltip';
            tooltip.textContent = text;
            document.body.appendChild(tooltip);

            const rect = element.getBoundingClientRect();
            tooltip.style.left = rect.right + 10 + 'px';
            tooltip.style.top = rect.top + (rect.height / 2) - (tooltip.offsetHeight / 2) + 'px';
        });

        element.addEventListener('mouseleave', () => {
            if (tooltip) {
                tooltip.remove();
                tooltip = null;
            }
        });
    }

    // ==========================================
    // Context Menu
    // ==========================================

    showContextMenu(menuItems, targetElement) {
        // Remove existing context menu
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        
        menuItems.forEach(item => {
            if (item.separator) {
                const separator = document.createElement('div');
                separator.className = 'context-menu-separator';
                contextMenu.appendChild(separator);
            } else {
                const menuItem = document.createElement('button');
                menuItem.className = `context-menu-item ${item.danger ? 'danger' : ''}`;
                menuItem.innerHTML = `
                    <i class="${item.icon}"></i>
                    <span>${item.text}</span>
                `;
                menuItem.addEventListener('click', () => {
                    item.action();
                    contextMenu.remove();
                });
                contextMenu.appendChild(menuItem);
            }
        });

        document.body.appendChild(contextMenu);

        // Position context menu
        const rect = targetElement.getBoundingClientRect();
        contextMenu.style.left = rect.left + 'px';
        contextMenu.style.top = rect.bottom + 5 + 'px';

        // Close on outside click
        setTimeout(() => {
            const closeHandler = (e) => {
                if (!contextMenu.contains(e.target)) {
                    contextMenu.remove();
                    document.removeEventListener('click', closeHandler);
                }
            };
            document.addEventListener('click', closeHandler);
        }, 0);
    }

    // ==========================================
    // Utility Methods
    // ==========================================

    detectUserType() {
        // Try to get user type from various sources
        this.userType = 
            this.getCurrentUser()?.user_type ||
            localStorage.getItem('user_type') ||
            this.extractUserTypeFromURL() ||
            'student';
    }

    extractUserTypeFromURL() {
        const path = window.location.pathname;
        if (path.includes('student')) return 'student';
        if (path.includes('startup')) return 'startup';
        return null;
    }

    getCurrentUser() {
        try {
            const authData = localStorage.getItem('skillsync_auth');
            return authData ? JSON.parse(authData).user : null;
        } catch (error) {
            return null;
        }
    }

    async apiCall(endpoint, options = {}) {
        const token = localStorage.getItem('skillsync_token');
        const apiUrl = this.getApiUrl();

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(`${apiUrl}${endpoint}`, config);
            return await response.json();
        } catch (error) {
            console.error(`API call failed for ${endpoint}:`, error);
            throw error;
        }
    }

    getApiUrl() {
        return window.location.hostname === 'localhost' 
            ? 'http://localhost:8000/api' 
            : 'https://skillsync-api.vercel.app/api';
    }

    updatePageTitle(sectionId) {
        const titles = {
            dashboard: 'Dashboard',
            matches: 'Matches',
            profile: 'Profile',
            applications: 'Applications',
            messages: 'Messages',
            skills: 'Skills & Tests',
            portfolio: 'Portfolio',
            analytics: 'Analytics',
            candidates: 'Candidates',
            jobs: 'Job Posts',
            company: 'Company Profile',
            interviews: 'Interviews',
            team: 'Team'
        };

        const title = titles[sectionId] || 'SkillSync AI';
        document.title = `${title} - SkillSync AI`;
    }

    async loadSectionData(sectionId) {
        // Load section-specific data when navigating
        switch (sectionId) {
            case 'matches':
                if (window.matchingEngine) {
                    window.matchingEngine.loadMatches();
                }
                break;
            case 'messages':
                if (window.chat) {
                    window.chat.loadChatList();
                }
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
            default:
                break;
        }
    }

    async loadAnalytics() {
        try {
            const response = await this.apiCall('/analytics/dashboard');
            if (response.success && window.app) {
                window.app.updateAnalytics(response.data);
            }
        } catch (error) {
            console.warn('Failed to load analytics:', error);
        }
    }

    trackNavigation(menuId) {
        // Track navigation for analytics
        if (window.analytics) {
            window.analytics.track('sidebar_navigation', {
                menuId: menuId,
                userType: this.userType,
                timestamp: Date.now()
            });
        }
    }

    dispatchSidebarEvent(eventName, data = {}) {
        const event = new CustomEvent(eventName, {
            detail: { ...data, sidebar: this }
        });
        document.dispatchEvent(event);
    }

    debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            if (window.authManager) {
                window.authManager.logout();
            } else {
                localStorage.clear();
                window.location.href = 'index.html';
            }
        }
    }

    // ==========================================
    // Public API Methods
    // ==========================================

    setNotificationCount(count) {
        this.notifications = count;
        this.updateNotificationBadges();
    }

    addNotification() {
        this.notifications++;
        this.updateNotificationBadges();
    }

    clearNotifications() {
        this.notifications = 0;
        this.updateNotificationBadges();
    }

    navigateTo(sectionId) {
        this.navigateToSection(sectionId);
    }

    isActive(menuId) {
        return this.activeMenuItem === menuId;
    }

    getActiveMenuItem() {
        return this.activeMenuItem;
    }

    getUserType() {
        return this.userType;
    }

    setUserType(userType) {
        this.userType = userType;
        this.renderSidebar();
    }
}

// CSS for sidebar tooltips and context menu
const sidebarStyles = `
<style id="sidebar-component-styles">
.sidebar-tooltip {
    position: fixed;
    background: #2D3748;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.875rem;
    z-index: 1001;
    pointer-events: none;
    white-space: nowrap;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.context-menu {
    position: fixed;
    background: white;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
    z-index: 1002;
    min-width: 200px;
    padding: 8px 0;
}

.context-menu-item {
    width: 100%;
    padding: 12px 16px;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.875rem;
    color: #4A5568;
    transition: all 0.2s ease;
}

.context-menu-item:hover {
    background: #F7FAFC;
    color: #2D3748;
}

.context-menu-item.danger {
    color: #E53E3E;
}

.context-menu-item.danger:hover {
    background: #FED7D7;
}

.context-menu-separator {
    height: 1px;
    background: #E2E8F0;
    margin: 8px 0;
}

.menu-badge {
    background: #E53E3E;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 10px;
    margin-left: auto;
    min-width: 18px;
    text-align: center;
}

.menu-badge.badge-hot {
    background: #FF6B35;
}

.menu-badge.badge-new {
    background: #00D9FF;
}

.menu-badge.badge-beta {
    background: #805AD5;
}

.menu-badge.badge-pro {
    background: #F6AD55;
    color: #2D3748;
}

.sidebar-user-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.sidebar-user:hover .sidebar-user-actions {
    opacity: 1;
}

.sidebar-action-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.1);
    color: #A0AEC0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.sidebar-action-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
}

.collapsed .sidebar-user-actions {
    display: none;
}

@media (max-width: 768px) {
    .context-menu {
        min-width: 180px;
    }
    
    .sidebar-tooltip {
        display: none;
    }
}
</style>
`;

// Add styles to document head
if (!document.querySelector('#sidebar-component-styles')) {
    document.head.insertAdjacentHTML('beforeend', sidebarStyles);
}

// Initialize Sidebar Manager
const sidebarManager = new SidebarManager();

// Export for global access
window.sidebar = sidebarManager;
window.sidebarManager = sidebarManager;

// Console welcome message
console.log(`
📋 SkillSync AI Sidebar Component Loaded
🎯 Dynamic Navigation System Active
⌨️ Keyboard Shortcuts Enabled (Ctrl+S, Ctrl+M, etc.)
📱 Mobile-Responsive Design create
`);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SidebarManager;
}

/* ==========================================
   SkillSync AI - Header Component Module
   Professional Header Interactions & Navigation
   ========================================== */

class HeaderManager {
    constructor() {
        this.header = null;
        this.navbar = null;
        this.mobileMenu = null;
        this.userMenu = null;
        this.notificationBell = null;
        this.searchInput = null;
        this.isScrolled = false;
        this.isMobileMenuOpen = false;
        this.isUserMenuOpen = false;
        this.notifications = [];
        this.unreadCount = 0;
        this.init();
    }

    init() {
        console.log('🎯 Header Manager Initializing...');
        this.findElements();
        this.setupEventListeners();
        this.setupScrollEffects();
        this.setupMobileMenu();
        this.setupUserMenu();
        this.setupNotifications();
        this.setupSearch();
        this.loadUserData();
        console.log('📝 Header Initialized Successfully');
    }

    // ==========================================
    // Element Initialization
    // ==========================================

    findElements() {
        this.header = document.querySelector('.header');
        this.navbar = document.querySelector('.navbar');
        this.mobileMenu = document.querySelector('.nav-menu');
        this.hamburger = document.querySelector('.hamburger');
        this.userMenu = document.querySelector('.user-menu');
        this.userMenuToggle = document.querySelector('.user-menu-toggle');
        this.notificationBell = document.querySelector('.notification-bell');
        this.notificationDropdown = document.querySelector('.notification-dropdown');
        this.searchInput = document.querySelector('.header-search input');
        this.logo = document.querySelector('.logo');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.authButtons = document.querySelector('.nav-buttons');
    }

    // ==========================================
    // Event Listeners Setup
    // ==========================================

    setupEventListeners() {
        // Scroll events
        window.addEventListener('scroll', this.debounce(this.handleScroll.bind(this), 10));
        
        // Resize events
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
        
        // Click events
        document.addEventListener('click', this.handleDocumentClick.bind(this));
        
        // Keyboard events
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // Logo click
        if (this.logo) {
            this.logo.addEventListener('click', this.handleLogoClick.bind(this));
        }

        // Navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', this.handleNavLinkClick.bind(this));
        });
    }

    // ==========================================
    // Scroll Effects
    // ==========================================

    setupScrollEffects() {
        this.scrollThreshold = 50;
        this.lastScrollTop = 0;
        this.isHeaderHidden = false;
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollDirection = scrollTop > this.lastScrollTop ? 'down' : 'up';

        // Add/remove scrolled class
        if (scrollTop > this.scrollThreshold && !this.isScrolled) {
            this.isScrolled = true;
            this.header?.classList.add('scrolled');
            this.animateHeaderScroll(true);
        } else if (scrollTop <= this.scrollThreshold && this.isScrolled) {
            this.isScrolled = false;
            this.header?.classList.remove('scrolled');
            this.animateHeaderScroll(false);
        }

        // Hide/show header on scroll (mobile only)
        if (window.innerWidth <= 768) {
            this.handleMobileHeaderVisibility(scrollDirection, scrollTop);
        }

        // Update active nav link based on scroll position
        this.updateActiveNavLink();

        this.lastScrollTop = scrollTop;
    }

    animateHeaderScroll(isScrolled) {
        if (!this.header) return;

        if (isScrolled) {
            this.header.style.transform = 'translateY(-5px)';
            this.header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
            setTimeout(() => {
                this.header.style.transform = 'translateY(0)';
            }, 150);
        } else {
            this.header.style.boxShadow = 'none';
        }
    }

    handleMobileHeaderVisibility(direction, scrollTop) {
        if (direction === 'down' && scrollTop > 200 && !this.isHeaderHidden) {
            this.isHeaderHidden = true;
            this.header?.classList.add('header-hidden');
        } else if (direction === 'up' && this.isHeaderHidden) {
            this.isHeaderHidden = false;
            this.header?.classList.remove('header-hidden');
        }
    }

    updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                this.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // ==========================================
    // Mobile Menu Management
    // ==========================================

    setupMobileMenu() {
        if (this.hamburger) {
            this.hamburger.addEventListener('click', this.toggleMobileMenu.bind(this));
        }

        // Close mobile menu when clicking nav links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (this.isMobileMenuOpen) {
                    this.closeMobileMenu();
                }
            });
        });
    }

    toggleMobileMenu() {
        if (this.isMobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        this.isMobileMenuOpen = true;
        this.hamburger?.classList.add('active');
        this.mobileMenu?.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Animate menu items
        this.animateMobileMenuItems(true);
        
        this.logEvent('mobile_menu_opened');
    }

    closeMobileMenu() {
        this.isMobileMenuOpen = false;
        this.hamburger?.classList.remove('active');
        this.mobileMenu?.classList.remove('active');
        document.body.style.overflow = '';
        
        // Animate menu items
        this.animateMobileMenuItems(false);
        
        this.logEvent('mobile_menu_closed');
    }

    animateMobileMenuItems(isOpening) {
        const menuItems = this.mobileMenu?.querySelectorAll('.nav-link');
        if (!menuItems) return;

        menuItems.forEach((item, index) => {
            if (isOpening) {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                    item.style.transition = 'all 0.3s ease';
                }, index * 100);
            } else {
                item.style.transition = 'all 0.2s ease';
                item.style.opacity = '0';
                item.style.transform = 'translateY(-10px)';
            }
        });
    }

    // ==========================================
    // User Menu Management
    // ==========================================

    setupUserMenu() {
        if (this.userMenuToggle) {
            this.userMenuToggle.addEventListener('click', this.toggleUserMenu.bind(this));
        }
    }

    toggleUserMenu() {
        if (this.isUserMenuOpen) {
            this.closeUserMenu();
        } else {
            this.openUserMenu();
        }
    }

    openUserMenu() {
        this.isUserMenuOpen = true;
        this.userMenu?.classList.add('active');
        this.userMenuToggle?.classList.add('active');
        
        // Position menu correctly
        this.positionUserMenu();
        
        this.logEvent('user_menu_opened');
    }

    closeUserMenu() {
        this.isUserMenuOpen = false;
        this.userMenu?.classList.remove('active');
        this.userMenuToggle?.classList.remove('active');
        
        this.logEvent('user_menu_closed');
    }

    positionUserMenu() {
        if (!this.userMenu || !this.userMenuToggle) return;

        const toggleRect = this.userMenuToggle.getBoundingClientRect();
        const menuWidth = this.userMenu.offsetWidth;
        const viewportWidth = window.innerWidth;

        // Position menu to the right of toggle, but ensure it fits in viewport
        let left = toggleRect.right - menuWidth;
        if (left < 10) {
            left = 10;
        }

        this.userMenu.style.left = `${left}px`;
        this.userMenu.style.top = `${toggleRect.bottom + 10}px`;
    }

    // ==========================================
    // Notifications System
    // ==========================================

    setupNotifications() {
        if (this.notificationBell) {
            this.notificationBell.addEventListener('click', this.toggleNotifications.bind(this));
        }

        // Poll for new notifications
        this.startNotificationPolling();
    }

    toggleNotifications() {
        const isActive = this.notificationDropdown?.classList.contains('active');
        
        if (isActive) {
            this.closeNotifications();
        } else {
            this.openNotifications();
        }
    }

    openNotifications() {
        this.notificationDropdown?.classList.add('active');
        this.notificationBell?.classList.add('active');
        
        // Mark notifications as read
        this.markNotificationsAsRead();
        
        // Load latest notifications
        this.loadNotifications();
        
        this.logEvent('notifications_opened');
    }

    closeNotifications() {
        this.notificationDropdown?.classList.remove('active');
        this.notificationBell?.classList.remove('active');
        
        this.logEvent('notifications_closed');
    }

    async loadNotifications() {
        try {
            // Simulate API call
            const notifications = await this.fetchNotifications();
            this.renderNotifications(notifications);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    }

    async fetchNotifications() {
        // Demo notifications for now
        return [
            {
                id: 1,
                type: 'match',
                title: 'New Match Found!',
                message: 'You have a 92% match with TechStart Inc.',
                timestamp: new Date(Date.now() - 5 * 60 * 1000),
                read: false,
                icon: 'fa-heart',
                color: '#4CAF50'
            },
            {
                id: 2,
                type: 'message',
                title: 'New Message',
                message: 'Sarah from DesignCorp sent you a message',
                timestamp: new Date(Date.now() - 15 * 60 * 1000),
                read: false,
                icon: 'fa-envelope',
                color: '#2196F3'
            },
            {
                id: 3,
                type: 'profile',
                title: 'Profile Viewed',
                message: '3 companies viewed your profile today',
                timestamp: new Date(Date.now() - 60 * 60 * 1000),
                read: true,
                icon: 'fa-eye',
                color: '#FF9800'
            }
        ];
    }

    renderNotifications(notifications) {
        const container = this.notificationDropdown?.querySelector('.notifications-list');
        if (!container) return;

        container.innerHTML = '';

        if (notifications.length === 0) {
            container.innerHTML = `
                <div class="no-notifications">
                    <i class="fas fa-bell-slash"></i>
                    <p>No new notifications</p>
                </div>
            `;
            return;
        }

        notifications.forEach(notification => {
            const notificationElement = this.createNotificationElement(notification);
            container.appendChild(notificationElement);
        });

        // Update unread count
        this.updateNotificationCount(notifications.filter(n => !n.read).length);
    }

    createNotificationElement(notification) {
        const element = document.createElement('div');
        element.className = `notification-item ${notification.read ? 'read' : 'unread'}`;
        element.dataset.notificationId = notification.id;

        element.innerHTML = `
            <div class="notification-icon" style="color: ${notification.color}">
                <i class="fas ${notification.icon}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${this.formatNotificationTime(notification.timestamp)}</div>
            </div>
            <div class="notification-actions">
                <button class="mark-read" onclick="headerManager.markNotificationAsRead(${notification.id})">
                    <i class="fas fa-check"></i>
                </button>
                <button class="delete-notification" onclick="headerManager.deleteNotification(${notification.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        return element;
    }

    updateNotificationCount(count) {
        this.unreadCount = count;
        const badge = this.notificationBell?.querySelector('.notification-badge');
        
        if (badge) {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    markNotificationAsRead(notificationId) {
        const notification = document.querySelector(`[data-notification-id="${notificationId}"]`);
        if (notification) {
            notification.classList.remove('unread');
            notification.classList.add('read');
        }
        
        // Update backend
        this.updateNotificationStatus(notificationId, true);
    }

    deleteNotification(notificationId) {
        const notification = document.querySelector(`[data-notification-id="${notificationId}"]`);
        if (notification) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
        
        // Update backend
        this.removeNotification(notificationId);
    }

    startNotificationPolling() {
        // Poll for new notifications every 30 seconds
        setInterval(() => {
            this.checkForNewNotifications();
        }, 30000);
    }

    async checkForNewNotifications() {
        try {
            const newNotifications = await this.fetchNewNotifications();
            if (newNotifications.length > 0) {
                this.showNewNotificationBadge();
                this.playNotificationSound();
            }
        } catch (error) {
            console.error('Failed to check for new notifications:', error);
        }
    }

    // ==========================================
    // Search Functionality
    // ==========================================

    setupSearch() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
            this.searchInput.addEventListener('focus', this.showSearchSuggestions.bind(this));
            this.searchInput.addEventListener('keydown', this.handleSearchKeydown.bind(this));
        }
    }

    handleSearch(event) {
        const query = event.target.value.trim();
        
        if (query.length >= 2) {
            this.performSearch(query);
        } else {
            this.hideSearchResults();
        }
    }

    async performSearch(query) {
        try {
            const results = await this.searchAPI(query);
            this.displaySearchResults(results);
        } catch (error) {
            console.error('Search failed:', error);
        }
    }

    async searchAPI(query) {
        // Demo search results
        const demoResults = [
            { type: 'user', name: 'John Doe', title: 'Full Stack Developer', avatar: null },
            { type: 'company', name: 'TechStart Inc.', industry: 'Technology', logo: null },
            { type: 'skill', name: 'React.js', category: 'Frontend Development' },
            { type: 'skill', name: 'Node.js', category: 'Backend Development' }
        ].filter(item => 
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.title?.toLowerCase().includes(query.toLowerCase()) ||
            item.industry?.toLowerCase().includes(query.toLowerCase())
        );

        return demoResults;
    }

    displaySearchResults(results) {
        let dropdown = document.querySelector('.search-dropdown');
        
        if (!dropdown) {
            dropdown = this.createSearchDropdown();
        }

        const container = dropdown.querySelector('.search-results');
        container.innerHTML = '';

        if (results.length === 0) {
            container.innerHTML = '<div class="no-results">No results found</div>';
            return;
        }

        results.forEach(result => {
            const resultElement = this.createSearchResultElement(result);
            container.appendChild(resultElement);
        });

        dropdown.classList.add('active');
    }

    createSearchDropdown() {
        const dropdown = document.createElement('div');
        dropdown.className = 'search-dropdown';
        dropdown.innerHTML = `
            <div class="search-results"></div>
            <div class="search-footer">
                <a href="#" class="view-all-results">View all results</a>
            </div>
        `;

        this.searchInput.parentNode.appendChild(dropdown);
        return dropdown;
    }

    createSearchResultElement(result) {
        const element = document.createElement('div');
        element.className = `search-result ${result.type}`;
        
        const icon = this.getSearchResultIcon(result.type);
        const subtitle = result.title || result.industry || result.category || '';

        element.innerHTML = `
            <div class="result-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="result-content">
                <div class="result-name">${result.name}</div>
                ${subtitle ? `<div class="result-subtitle">${subtitle}</div>` : ''}
            </div>
        `;

        element.addEventListener('click', () => {
            this.handleSearchResultClick(result);
        });

        return element;
    }

    getSearchResultIcon(type) {
        const icons = {
            user: 'fa-user',
            company: 'fa-building',
            skill: 'fa-code',
            project: 'fa-project-diagram'
        };
        return icons[type] || 'fa-search';
    }

    handleSearchResultClick(result) {
        console.log('Search result clicked:', result);
        this.hideSearchResults();
        this.searchInput.value = result.name;
        
        // Navigate to result page
        this.navigateToResult(result);
    }

    hideSearchResults() {
        const dropdown = document.querySelector('.search-dropdown');
        if (dropdown) {
            dropdown.classList.remove('active');
        }
    }

    // ==========================================
    // Event Handlers
    // ==========================================

    handleDocumentClick(event) {
        // Close mobile menu if clicking outside
        if (this.isMobileMenuOpen && !this.mobileMenu?.contains(event.target) && !this.hamburger?.contains(event.target)) {
            this.closeMobileMenu();
        }

        // Close user menu if clicking outside
        if (this.isUserMenuOpen && !this.userMenu?.contains(event.target) && !this.userMenuToggle?.contains(event.target)) {
            this.closeUserMenu();
        }

        // Close notifications if clicking outside
        if (this.notificationDropdown?.classList.contains('active') && 
            !this.notificationDropdown.contains(event.target) && 
            !this.notificationBell?.contains(event.target)) {
            this.closeNotifications();
        }

        // Close search dropdown if clicking outside
        const searchDropdown = document.querySelector('.search-dropdown');
        if (searchDropdown?.classList.contains('active') && 
            !searchDropdown.contains(event.target) && 
            !this.searchInput?.contains(event.target)) {
            this.hideSearchResults();
        }
    }

    handleKeyDown(event) {
        // ESC key to close all dropdowns
        if (event.key === 'Escape') {
            this.closeAllDropdowns();
        }

        // Enter key in search
        if (event.key === 'Enter' && event.target === this.searchInput) {
            this.handleSearchSubmit();
        }
    }

    closeAllDropdowns() {
        this.closeMobileMenu();
        this.closeUserMenu();
        this.closeNotifications();
        this.hideSearchResults();
    }

    handleResize() {
        // Close mobile menu on desktop
        if (window.innerWidth > 768 && this.isMobileMenuOpen) {
            this.closeMobileMenu();
        }

        // Reposition user menu
        if (this.isUserMenuOpen) {
            this.positionUserMenu();
        }
    }

    handleLogoClick(event) {
        event.preventDefault();
        
        // Scroll to top or navigate to home
        if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.location.href = '/';
        }
        
        this.logEvent('logo_clicked');
    }

    handleNavLinkClick(event) {
        const link = event.target;
        const href = link.getAttribute('href');
        
        // Handle anchor links
        if (href && href.startsWith('#')) {
            event.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
        
        this.logEvent('nav_link_clicked', { href: href });
    }

    // ==========================================
    // User Data Management
    // ==========================================

    async loadUserData() {
        try {
            const user = window.authManager?.getCurrentUser();
            
            if (user) {
                this.updateHeaderForLoggedInUser(user);
            } else {
                this.updateHeaderForGuest();
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
            this.updateHeaderForGuest();
        }
    }

    updateHeaderForLoggedInUser(user) {
        // Hide auth buttons
        if (this.authButtons) {
            this.authButtons.style.display = 'none';
        }

        // Show user menu
        this.createUserMenuElements(user);
        
        // Show notification bell
        this.createNotificationElements();
        
        // Update search placeholder
        if (this.searchInput) {
            this.searchInput.placeholder = `Search matches, companies, ${user.name}...`;
        }
    }

    updateHeaderForGuest() {
        // Show auth buttons
        if (this.authButtons) {
            this.authButtons.style.display = 'flex';
        }

        // Hide user-specific elements
        const userElements = this.header?.querySelectorAll('.user-only');
        userElements?.forEach(el => el.style.display = 'none');
    }

    createUserMenuElements(user) {
        if (!this.header) return;

        // Create user menu toggle if it doesn't exist
        if (!this.userMenuToggle) {
            this.userMenuToggle = document.createElement('div');
            this.userMenuToggle.className = 'user-menu-toggle';
            this.userMenuToggle.innerHTML = `
                <div class="user-avatar">
                    ${user.avatar ? `<img src="${user.avatar}" alt="${user.name}">` : user.name.charAt(0)}
                </div>
                <div class="user-info">
                    <div class="user-name">${user.name}</div>
                    <div class="user-type">${user.user_type}</div>
                </div>
                <i class="fas fa-chevron-down"></i>
            `;

            this.navbar?.appendChild(this.userMenuToggle);
            this.userMenuToggle.addEventListener('click', this.toggleUserMenu.bind(this));
        }

        // Create user menu dropdown if it doesn't exist
        if (!this.userMenu) {
            this.userMenu = document.createElement('div');
            this.userMenu.className = 'user-menu';
            this.userMenu.innerHTML = `
                <div class="user-menu-header">
                    <div class="user-avatar-large">
                        ${user.avatar ? `<img src="${user.avatar}" alt="${user.name}">` : user.name.charAt(0)}
                    </div>
                    <div class="user-details">
                        <div class="user-name">${user.name}</div>
                        <div class="user-email">${user.email}</div>
                    </div>
                </div>
                <div class="user-menu-items">
                    <a href="/dashboard" class="menu-item">
                        <i class="fas fa-tachometer-alt"></i>
                        <span>Dashboard</span>
                    </a>
                    <a href="/profile" class="menu-item">
                        <i class="fas fa-user"></i>
                        <span>Profile</span>
                    </a>
                    <a href="/matches" class="menu-item">
                        <i class="fas fa-heart"></i>
                        <span>Matches</span>
                    </a>
                    <a href="/messages" class="menu-item">
                        <i class="fas fa-envelope"></i>
                        <span>Messages</span>
                    </a>
                    <a href="/settings" class="menu-item">
                        <i class="fas fa-cog"></i>
                        <span>Settings</span>
                    </a>
                    <div class="menu-divider"></div>
                    <button class="menu-item logout-btn" onclick="headerManager.handleLogout()">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </button>
                </div>
            `;

            document.body.appendChild(this.userMenu);
        }
    }

    createNotificationElements() {
        if (!this.header || this.notificationBell) return;

        // Create notification bell
        this.notificationBell = document.createElement('div');
        this.notificationBell.className = 'notification-bell';
        this.notificationBell.innerHTML = `
            <i class="fas fa-bell"></i>
            <span class="notification-badge">0</span>
        `;

        // Create notification dropdown
        this.notificationDropdown = document.createElement('div');
        this.notificationDropdown.className = 'notification-dropdown';
        this.notificationDropdown.innerHTML = `
            <div class="notification-header">
                <h3>Notifications</h3>
                <button class="mark-all-read" onclick="headerManager.markAllNotificationsAsRead()">
                    Mark all as read
                </button>
            </div>
            <div class="notifications-list"></div>
            <div class="notification-footer">
                <a href="/notifications" class="view-all">View all notifications</a>
            </div>
        `;

        // Add to header
        this.navbar?.appendChild(this.notificationBell);
        document.body.appendChild(this.notificationDropdown);

        // Setup event listener
        this.notificationBell.addEventListener('click', this.toggleNotifications.bind(this));
    }

    // ==========================================
    // Utility Methods
    // ==========================================

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

    formatNotificationTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInMinutes = (now - time) / (1000 * 60);

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        
        return time.toLocaleDateString();
    }

    showNewNotificationBadge() {
        this.notificationBell?.classList.add('has-new');
        setTimeout(() => {
            this.notificationBell?.classList.remove('has-new');
        }, 3000);
    }

    playNotificationSound() {
        try {
            const audio = new Audio('/assets/sounds/notification.mp3');
            audio.volume = 0.3;
            audio.play().catch(() => {
                // Ignore autoplay restrictions
            });
        } catch (error) {
            // Fallback - no sound
        }
    }

    logEvent(eventName, data = {}) {
        console.log(`📊 Header Event: ${eventName}`, data);
        
        // Send to analytics if available
        if (window.analytics) {
            window.analytics.track(eventName, data);
        }
    }

    // ==========================================
    // Public API Methods
    // ==========================================

    handleLogout() {
        if (window.authManager) {
            window.authManager.logout();
        } else {
            window.location.href = '/';
        }
    }

    markAllNotificationsAsRead() {
        const unreadNotifications = this.notificationDropdown?.querySelectorAll('.notification-item.unread');
        unreadNotifications?.forEach(notification => {
            notification.classList.remove('unread');
            notification.classList.add('read');
        });

        this.updateNotificationCount(0);
    }

    refreshNotifications() {
        this.loadNotifications();
    }

    updateUserInfo(userData) {
        // Update user menu with new data
        const userNameElements = this.header?.querySelectorAll('.user-name');
        userNameElements?.forEach(el => {
            el.textContent = userData.name;
        });

        const userEmailElements = this.header?.querySelectorAll('.user-email');
        userEmailElements?.forEach(el => {
            el.textContent = userData.email;
        });

        // Update avatar
        const avatarElements = this.header?.querySelectorAll('.user-avatar img, .user-avatar-large img');
        avatarElements?.forEach(el => {
            if (userData.avatar) {
                el.src = userData.avatar;
            }
        });
    }

    setActiveNavLink(sectionId) {
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }

    showSearchLoading() {
        const dropdown = document.querySelector('.search-dropdown');
        if (dropdown) {
            const container = dropdown.querySelector('.search-results');
            container.innerHTML = '<div class="search-loading">Searching...</div>';
        }
    }

    // Cleanup method
    cleanup() {
        // Remove event listeners
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('click', this.handleDocumentClick);
        document.removeEventListener('keydown', this.handleKeyDown);
    }
}

// Initialize Header Manager
const headerManager = new HeaderManager();

// Export for global access
window.headerManager = headerManager;

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    headerManager.cleanup();
});

console.log(`
🎯 SkillSync AI Header Manager Loaded
📱 Mobile Menu System Active
🔔 Notification System create
🔍 Search Functionality Enabled
👤 User Menu Integration Complete
`);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeaderManager;
}

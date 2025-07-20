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
    }

    async loadNotifications() {
        try {
            if (window.authManager && window.authManager.isAuthenticated()) {
                const response = await this.makeApiCall('/notifications?limit=10');
                if (response.success) {
                    this.notifications = response.notifications;
                    this.renderNotifications();
                    this.updateNotificationBadge();
                }
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    }

    renderNotifications() {
        const container = this.notificationDropdown?.querySelector('.notifications-list');
        if (!container) return;

        if (this.notifications.length === 0) {
            container.innerHTML = `
                <div class="notification-empty">
                    <i class="fas fa-bell-slash"></i>
                    <p>No new notifications</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.notifications.map(notification => `
            <div class="notification-item ${notification.read ? 'read' : 'unread'}" data-id="${notification.id}">
                <div class="notification-icon">
                    <i class="fas fa-${this.getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${this.escapeHtml(notification.title)}</div>
                    <div class="notification-message">${this.escapeHtml(notification.message)}</div>
                    <div class="notification-time">${this.formatTime(notification.created_at)}</div>
                </div>
                ${!notification.read ? '<div class="notification-dot"></div>' : ''}
            </div>
        `).join('');

        // Add click handlers
        container.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', this.handleNotificationClick.bind(this));
        });
    }

    updateNotificationBadge() {
        this.unreadCount = this.notifications.filter(n => !n.read).length;
        const badge = this.notificationBell?.querySelector('.notification-badge');
        
        if (badge) {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount.toString();
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    async markNotificationsAsRead() {
        const unreadIds = this.notifications
            .filter(n => !n.read)
            .map(n => n.id);

        if (unreadIds.length === 0) return;

        try {
            await this.makeApiCall('/notifications/mark-read', {
                method: 'POST',
                body: JSON.stringify({ notificationIds: unreadIds })
            });

            // Update local state
            this.notifications.forEach(n => {
                if (unreadIds.includes(n.id)) {
                    n.read = true;
                }
            });
            
            this.updateNotificationBadge();
        } catch (error) {
            console.error('Failed to mark notifications as read:', error);
        }
    }

    handleNotificationClick(event) {
        const notificationItem = event.currentTarget;
        const notificationId = notificationItem.dataset.id;
        const notification = this.notifications.find(n => n.id === notificationId);

        if (notification && notification.action_url) {
            window.location.href = notification.action_url;
        }

        this.logEvent('notification_clicked', { notificationId });
    }

    startNotificationPolling() {
        // Poll for new notifications every 30 seconds
        setInterval(() => {
            if (window.authManager && window.authManager.isAuthenticated()) {
                this.loadNotifications();
            }
        }, 30000);
    }

    // ==========================================
    // Search Functionality
    // ==========================================

    setupSearch() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
            this.searchInput.addEventListener('focus', this.handleSearchFocus.bind(this));
            this.searchInput.addEventListener('blur', this.handleSearchBlur.bind(this));
            this.searchInput.addEventListener('keydown', this.handleSearchKeydown.bind(this));
        }

        this.searchResults = [];
        this.selectedSearchIndex = -1;
    }

    handleSearch(event) {
        const query = event.target.value.trim();
        
        if (query.length === 0) {
            this.hideSearchResults();
            return;
        }

        if (query.length < 2) {
            return; // Wait for at least 2 characters
        }

        this.performSearch(query);
    }

    async performSearch(query) {
        try {
            const response = await this.makeApiCall(`/search?q=${encodeURIComponent(query)}&type=header`);
            if (response.success) {
                this.searchResults = response.results;
                this.renderSearchResults();
                this.logEvent('header_search', { query });
            }
        } catch (error) {
            console.error('Search failed:', error);
        }
    }

    renderSearchResults() {
        let dropdown = document.querySelector('.search-dropdown');
        
        if (!dropdown) {
            dropdown = this.createSearchDropdown();
        }

        if (this.searchResults.length === 0) {
            dropdown.innerHTML = `
                <div class="search-no-results">
                    <i class="fas fa-search"></i>
                    <p>No results found</p>
                </div>
            `;
        } else {
            dropdown.innerHTML = this.searchResults.map((result, index) => `
                <div class="search-result-item ${index === this.selectedSearchIndex ? 'selected' : ''}" 
                     data-index="${index}" data-url="${result.url}">
                    <div class="search-result-icon">
                        <i class="fas fa-${this.getSearchResultIcon(result.type)}"></i>
                    </div>
                    <div class="search-result-content">
                        <div class="search-result-title">${this.highlightSearchTerm(result.title, this.searchInput.value)}</div>
                        <div class="search-result-description">${this.escapeHtml(result.description)}</div>
                    </div>
                </div>
            `).join('');
        }

        dropdown.classList.add('active');

        // Add click handlers
        dropdown.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', this.handleSearchResultClick.bind(this));
        });
    }

    createSearchDropdown() {
        const dropdown = document.createElement('div');
        dropdown.className = 'search-dropdown';
        
        const searchContainer = this.searchInput.closest('.header-search');
        searchContainer.appendChild(dropdown);
        
        return dropdown;
    }

    handleSearchFocus() {
        if (this.searchResults.length > 0) {
            document.querySelector('.search-dropdown')?.classList.add('active');
        }
    }

    handleSearchBlur() {
        // Delay hiding to allow click events on results
        setTimeout(() => {
            this.hideSearchResults();
        }, 200);
    }

    handleSearchKeydown(event) {
        const dropdown = document.querySelector('.search-dropdown');
        if (!dropdown || !dropdown.classList.contains('active')) return;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.navigateSearchResults(1);
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.navigateSearchResults(-1);
                break;
            case 'Enter':
                event.preventDefault();
                this.selectSearchResult();
                break;
            case 'Escape':
                this.hideSearchResults();
                this.searchInput.blur();
                break;
        }
    }

    navigateSearchResults(direction) {
        const maxIndex = this.searchResults.length - 1;
        this.selectedSearchIndex += direction;

        if (this.selectedSearchIndex < 0) {
            this.selectedSearchIndex = maxIndex;
        } else if (this.selectedSearchIndex > maxIndex) {
            this.selectedSearchIndex = 0;
        }

        // Update visual selection
        const items = document.querySelectorAll('.search-result-item');
        items.forEach((item, index) => {
            item.classList.toggle('selected', index === this.selectedSearchIndex);
        });
    }

    selectSearchResult() {
        if (this.selectedSearchIndex >= 0 && this.searchResults[this.selectedSearchIndex]) {
            const result = this.searchResults[this.selectedSearchIndex];
            this.navigateToSearchResult(result);
        }
    }

    handleSearchResultClick(event) {
        const item = event.currentTarget;
        const index = parseInt(item.dataset.index);
        const result = this.searchResults[index];
        
        if (result) {
            this.navigateToSearchResult(result);
        }
    }

    navigateToSearchResult(result) {
        this.logEvent('search_result_clicked', { 
            title: result.title, 
            type: result.type,
            url: result.url 
        });

        if (result.url.startsWith('#')) {
            // Smooth scroll to section
            const element = document.querySelector(result.url);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            // Navigate to page
            window.location.href = result.url;
        }

        this.hideSearchResults();
        this.searchInput.blur();
    }

    hideSearchResults() {
        const dropdown = document.querySelector('.search-dropdown');
        if (dropdown) {
            dropdown.classList.remove('active');
        }
        this.selectedSearchIndex = -1;
    }

    // ==========================================
    // User Data Management
    // ==========================================

    async loadUserData() {
        if (window.authManager && window.authManager.isAuthenticated()) {
            const user = window.authManager.getCurrentUser();
            this.updateUserDisplay(user);
            this.showAuthenticatedHeader();
        } else {
            this.showGuestHeader();
        }
    }

    updateUserDisplay(user) {
        // Update user avatar
        const userAvatar = document.querySelector('.user-avatar');
        if (userAvatar) {
            if (user.avatar) {
                userAvatar.innerHTML = `<img src="${user.avatar}" alt="${user.name}">`;
            } else {
                userAvatar.textContent = user.name ? user.name.charAt(0).toUpperCase() : 'U';
            }
        }

        // Update user name
        const userName = document.querySelector('.user-name');
        if (userName) {
            userName.textContent = user.name || user.email;
        }

        // Update user role
        const userRole = document.querySelector('.user-role');
        if (userRole) {
            userRole.textContent = user.user_type === 'student' ? 'Student' : 'Startup';
        }
    }

    showAuthenticatedHeader() {
        // Hide auth buttons
        this.authButtons?.classList.add('hidden');
        
        // Show user menu and notifications
        const userSection = document.querySelector('.user-section');
        if (userSection) {
            userSection.classList.remove('hidden');
        }
    }

    showGuestHeader() {
        // Show auth buttons
        this.authButtons?.classList.remove('hidden');
        
        // Hide user menu and notifications
        const userSection = document.querySelector('.user-section');
        if (userSection) {
            userSection.classList.add('hidden');
        }
    }

    // ==========================================
    // Event Handlers
    // ==========================================

    handleDocumentClick(event) {
        // Close mobile menu if clicking outside
        if (this.isMobileMenuOpen && 
            !this.mobileMenu?.contains(event.target) && 
            !this.hamburger?.contains(event.target)) {
            this.closeMobileMenu();
        }

        // Close user menu if clicking outside
        if (this.isUserMenuOpen && 
            !this.userMenu?.contains(event.target) && 
            !this.userMenuToggle?.contains(event.target)) {
            this.closeUserMenu();
        }

        // Close notifications if clicking outside
        if (this.notificationDropdown?.classList.contains('active') &&
            !this.notificationDropdown.contains(event.target) &&
            !this.notificationBell?.contains(event.target)) {
            this.closeNotifications();
        }

        // Close search results if clicking outside
        if (document.querySelector('.search-dropdown.active') &&
            !this.searchInput?.contains(event.target) &&
            !event.target.closest('.search-dropdown')) {
            this.hideSearchResults();
        }
    }

    handleKeyDown(event) {
        // ESC key handling
        if (event.key === 'Escape') {
            if (this.isMobileMenuOpen) {
                this.closeMobileMenu();
            }
            if (this.isUserMenuOpen) {
                this.closeUserMenu();
            }
            if (this.notificationDropdown?.classList.contains('active')) {
                this.closeNotifications();
            }
        }

        // Quick search shortcut (Ctrl/Cmd + K)
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            this.searchInput?.focus();
        }
    }

    handleResize() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 768 && this.isMobileMenuOpen) {
            this.closeMobileMenu();
        }

        // Reposition user menu
        if (this.isUserMenuOpen) {
            this.positionUserMenu();
        }

        // Reset header visibility on resize
        if (window.innerWidth > 768) {
            this.header?.classList.remove('header-hidden');
            this.isHeaderHidden = false;
        }
    }

    handleLogoClick(event) {
        event.preventDefault();
        
        // Smooth scroll to top if on same page
        if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.location.href = '/';
        }
        
        this.logEvent('logo_clicked');
    }

    handleNavLinkClick(event) {
        const link = event.currentTarget;
        const href = link.getAttribute('href');
        
        // Handle smooth scrolling for anchor links
        if (href && href.startsWith('#')) {
            event.preventDefault();
            
            const targetElement = document.querySelector(href);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                this.updateActiveNavLink();
            }
        }
        
        this.logEvent('nav_link_clicked', { href, text: link.textContent });
    }

    // ==========================================
    // Utility Methods
    // ==========================================

    async makeApiCall(endpoint, options = {}) {
        if (window.authManager) {
            return window.authManager.apiCall(endpoint, options);
        } else {
            // Fallback API call
            const response = await fetch(`/api${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            return response.json();
        }
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

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    formatTime(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffInMinutes = (now - date) / (1000 * 60);

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
        
        return date.toLocaleDateString();
    }

    highlightSearchTerm(text, term) {
        if (!term) return this.escapeHtml(text);
        
        const regex = new RegExp(`(${term})`, 'gi');
        return this.escapeHtml(text).replace(regex, '<mark>$1</mark>');
    }

    getNotificationIcon(type) {
        const icons = {
            'match': 'heart',
            'message': 'comment',
            'system': 'info-circle',
            'success': 'check-circle',
            'warning': 'exclamation-triangle',
            'error': 'exclamation-circle'
        };
        return icons[type] || 'bell';
    }

    getSearchResultIcon(type) {
        const icons = {
            'page': 'file-alt',
            'user': 'user',
            'company': 'building',
            'skill': 'code',
            'feature': 'star'
        };
        return icons[type] || 'search';
    }

    logEvent(eventName, data = {}) {
        if (window.authManager && window.authManager.logAnalyticsEvent) {
            window.authManager.logAnalyticsEvent(eventName, {
                section: 'header',
                timestamp: Date.now(),
                ...data
            });
        }
        
        console.log(`📊 Header Event: ${eventName}`, data);
    }

    // ==========================================
    // Public API Methods
    // ==========================================

    updateNotificationCount(count) {
        this.unreadCount = count;
        this.updateNotificationBadge();
    }

    addNotification(notification) {
        this.notifications.unshift(notification);
        this.updateNotificationBadge();
        
        // Show toast notification
        if (window.app && window.app.showNotification) {
            window.app.showNotification(notification.message, notification.type || 'info');
        }
    }

    setSearchResults(results) {
        this.searchResults = results;
        this.renderSearchResults();
    }

    highlightNavLink(href) {
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === href) {
                link.classList.add('active');
            }
        });
    }

    showLoadingState(isLoading) {
        const loader = this.header?.querySelector('.header-loader');
        if (loader) {
            loader.style.display = isLoading ? 'block' : 'none';
        }
    }

    updateUserStatus(status) {
        const statusIndicator = this.userMenuToggle?.querySelector('.status-indicator');
        if (statusIndicator) {
            statusIndicator.className = `status-indicator status-${status}`;
        }
    }

    destroy() {
        // Clean up event listeners
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('click', this.handleDocumentClick);
        document.removeEventListener('keydown', this.handleKeyDown);
        
        // Clear intervals
        if (this.notificationInterval) {
            clearInterval(this.notificationInterval);
        }
        
        console.log('🗑️ Header Manager destroyed');
    }
}

// Initialize Header Manager
const headerManager = new HeaderManager();

// Export for global access
window.headerManager = headerManager;

// Console message
console.log(`
🎯 SkillSync AI Header Component Loaded
📱 Mobile Menu Support Active
🔔 Notification System create
🔍 Smart Search Enabled
👤 User Menu Configured
`);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeaderManager;
}

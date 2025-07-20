/* ==========================================
   SkillSync AI - Authentication Module
   Professional Authentication System
   ========================================== */

class AuthManager {
    constructor() {
        this.apiUrl = this.getApiUrl();
        this.currentUser = null;
        this.token = null;
        this.refreshToken = null;
        this.tokenExpiryTime = null;
        this.loginAttempts = 0;
        this.maxLoginAttempts = 5;
        this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
        this.passwordStrengthCache = new Map();
        this.init();
    }

    init() {
        console.log('🔐 Auth Manager Initialized');
        this.loadStoredAuth();
        this.setupAuthEventListeners();
        this.startTokenRefreshTimer();
        this.setupPasswordStrengthChecker();
        this.setupSecurityHeaders();
    }

    // ==========================================
    // API Configuration
    // ==========================================
    
    getApiUrl() {
        return window.location.hostname === 'localhost' 
            ? 'http://localhost:8000/api' 
            : 'https://skillsync-api.vercel.app/api';
    }

    setupSecurityHeaders() {
        // Add CSRF protection
        const csrfToken = this.generateCSRFToken();
        localStorage.setItem('csrf_token', csrfToken);
    }

    generateCSRFToken() {
        return Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    // ==========================================
    // Authentication API Methods
    // ==========================================

    async login(credentials) {
        try {
            // Check for account lockout
            if (this.isAccountLocked()) {
                throw new Error(`Account locked. Please try again after ${this.getRemainingLockoutTime()} minutes.`);
            }

            // Validate credentials before sending
            this.validateLoginCredentials(credentials);

            const response = await this.makeAuthRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: credentials.email.toLowerCase().trim(),
                    password: credentials.password,
                    userType: credentials.userType,
                    deviceId: this.getDeviceId(),
                    browserInfo: this.getBrowserInfo(),
                    ipAddress: await this.getUserIP()
                })
            });

            if (response.success) {
                await this.handleLoginSuccess(response);
                this.resetLoginAttempts();
                return response;
            } else {
                this.handleLoginFailure(response.message);
                throw new Error(response.message || 'Login failed');
            }

        } catch (error) {
            console.error('Login error:', error);
            this.logSecurityEvent('login_failed', { 
                email: credentials.email, 
                error: error.message 
            });
            throw error;
        }
    }

    async register(userData) {
        try {
            // Validate registration data
            this.validateRegistrationData(userData);

            // Check password strength
            const passwordStrength = this.checkPasswordStrength(userData.password);
            if (passwordStrength.score < 3) {
                throw new Error(`Password is too weak. ${passwordStrength.feedback.join(' ')}`);
            }

            // Check if email is alcreate registered
            const emailCheck = await this.checkEmailAvailability(userData.email);
            if (!emailCheck.available) {
                throw new Error('Email is alcreate registered. Please use a different email.');
            }

            const response = await this.makeAuthRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    ...userData,
                    email: userData.email.toLowerCase().trim(),
                    deviceId: this.getDeviceId(),
                    browserInfo: this.getBrowserInfo(),
                    ipAddress: await this.getUserIP(),
                    agreedToTerms: true,
                    emailVerificationRequired: true
                })
            });

            if (response.success) {
                await this.handleRegistrationSuccess(response);
                return response;
            } else {
                throw new Error(response.message || 'Registration failed');
            }

        } catch (error) {
            console.error('Registration error:', error);
            this.logSecurityEvent('registration_failed', { 
                email: userData.email, 
                error: error.message 
            });
            throw error;
        }
    }

    async logout() {
        try {
            if (this.token) {
                await this.makeAuthRequest('/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });
            }
        } catch (error) {
            console.warn('Logout API call failed:', error);
        } finally {
            this.clearAuthData();
            this.redirectToLogin();
            this.logSecurityEvent('user_logout');
        }
    }

    async refreshAccessToken() {
        try {
            if (!this.refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await this.makeAuthRequest('/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({
                    refreshToken: this.refreshToken,
                    deviceId: this.getDeviceId()
                })
            });

            if (response.success) {
                this.token = response.accessToken;
                this.tokenExpiryTime = Date.now() + (response.expiresIn * 1000);
                this.saveAuthData();
                return response;
            } else {
                throw new Error('Token refresh failed');
            }

        } catch (error) {
            console.error('Token refresh error:', error);
            this.clearAuthData();
            this.redirectToLogin();
            throw error;
        }
    }

    // ==========================================
    // Validation Methods
    // ==========================================

    validateLoginCredentials(credentials) {
        const errors = [];

        if (!credentials.email || !this.isValidEmail(credentials.email)) {
            errors.push('Please enter a valid email address');
        }

        if (!credentials.password || credentials.password.length < 1) {
            errors.push('Password is required');
        }

        if (!credentials.userType || !['student', 'startup'].includes(credentials.userType)) {
            errors.push('Please select a valid user type');
        }

        if (errors.length > 0) {
            throw new Error(errors.join('. '));
        }

        return true;
    }

    validateRegistrationData(userData) {
        const errors = [];

        // Email validation
        if (!userData.email || !this.isValidEmail(userData.email)) {
            errors.push('Please enter a valid email address');
        }

        // Password validation
        if (!userData.password || userData.password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        // User type validation
        if (!userData.userType || !['student', 'startup'].includes(userData.userType)) {
            errors.push('Please select a valid user type');
        }

        // User type specific validation
        if (userData.userType === 'student') {
            if (!userData.name || userData.name.trim().length < 2) {
                errors.push('Full name is required (minimum 2 characters)');
            }
            if (!userData.college || userData.college.trim().length < 2) {
                errors.push('College/University name is required');
            }
            if (!userData.skills || userData.skills.trim().length < 2) {
                errors.push('Please enter your primary skills');
            }
        } else if (userData.userType === 'startup') {
            if (!userData.company || userData.company.trim().length < 2) {
                errors.push('Company name is required');
            }
            if (!userData.size || !['1-5', '6-20', '21-50', '51+'].includes(userData.size)) {
                errors.push('Please select a valid company size');
            }
            if (!userData.industry || userData.industry.trim().length < 2) {
                errors.push('Industry information is required');
            }
        }

        if (errors.length > 0) {
            throw new Error(errors.join('. '));
        }

        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return emailRegex.test(email) && email.length <= 254;
    }

    // ==========================================
    // Password Security Methods
    // ==========================================

    checkPasswordStrength(password) {
        // Check cache first
        if (this.passwordStrengthCache.has(password)) {
            return this.passwordStrengthCache.get(password);
        }

        const result = {
            score: 0,
            feedback: [],
            strength: 'very-weak'
        };

        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            numbers: /\d/.test(password),
            symbols: /[^A-Za-z0-9]/.test(password),
            noCommon: !this.isCommonPassword(password),
            noPersonal: !this.containsPersonalInfo(password)
        };

        // Calculate score
        const passedChecks = Object.values(checks).filter(Boolean).length;
        result.score = Math.min(passedChecks, 5);

        // Generate feedback
        if (!checks.length) result.feedback.push('Use at least 8 characters');
        if (!checks.lowercase) result.feedback.push('Add lowercase letters');
        if (!checks.uppercase) result.feedback.push('Add uppercase letters');
        if (!checks.numbers) result.feedback.push('Add numbers');
        if (!checks.symbols) result.feedback.push('Add special characters');
        if (!checks.noCommon) result.feedback.push('Avoid common passwords');
        if (!checks.noPersonal) result.feedback.push('Avoid personal information');

        // Determine strength level
        const strengthLevels = ['very-weak', 'weak', 'fair', 'good', 'strong'];
        result.strength = strengthLevels[result.score] || 'very-weak';

        // Cache result
        this.passwordStrengthCache.set(password, result);

        return result;
    }

    isCommonPassword(password) {
        const commonPasswords = [
            'password', '123456', '123456789', 'qwerty', 'abc123',
            'password123', 'admin', 'letmein', 'welcome', 'monkey',
            'dragon', 'master', 'shadow', 'login', 'pass'
        ];
        return commonPasswords.includes(password.toLowerCase());
    }

    containsPersonalInfo(password) {
        // Check against user's email or name if available
        if (this.currentUser) {
            const personal = [
                this.currentUser.name?.toLowerCase(),
                this.currentUser.email?.split('@')[0].toLowerCase()
            ].filter(Boolean);

            return personal.some(info => password.toLowerCase().includes(info));
        }
        return false;
    }

    setupPasswordStrengthChecker() {
        document.addEventListener('input', (e) => {
            if (e.target.type === 'password' && e.target.value.length > 0) {
                this.updatePasswordStrengthUI(e.target);
            }
        });
    }

    updatePasswordStrengthUI(passwordInput) {
        const password = passwordInput.value;
        const strength = this.checkPasswordStrength(password);
        
        let strengthIndicator = passwordInput.parentNode.querySelector('.password-strength');
        if (!strengthIndicator) {
            strengthIndicator = this.createPasswordStrengthIndicator();
            passwordInput.parentNode.appendChild(strengthIndicator);
        }

        strengthIndicator.className = `password-strength strength-${strength.strength}`;
        strengthIndicator.innerHTML = `
            <div class="strength-bar">
                <div class="strength-fill" style="width: ${(strength.score / 5) * 100}%"></div>
            </div>
            <div class="strength-text">Password strength: ${strength.strength.replace('-', ' ')}</div>
            ${strength.feedback.length > 0 ? `
                <div class="strength-feedback">
                    ${strength.feedback.map(tip => `<div class="feedback-tip">• ${tip}</div>`).join('')}
                </div>
            ` : ''}
        `;
    }

    createPasswordStrengthIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'password-strength';
        
        // Add CSS if not alcreate present
        if (!document.querySelector('#password-strength-styles')) {
            const styles = document.createElement('style');
            styles.id = 'password-strength-styles';
            styles.textContent = `
                .password-strength {
                    margin-top: 0.5rem;
                    font-size: 0.875rem;
                }
                .strength-bar {
                    height: 4px;
                    background: #E2E8F0;
                    border-radius: 2px;
                    overflow: hidden;
                    margin-bottom: 0.25rem;
                }
                .strength-fill {
                    height: 100%;
                    transition: all 0.3s ease;
                }
                .strength-very-weak .strength-fill { background: #F56565; }
                .strength-weak .strength-fill { background: #ED8936; }
                .strength-fair .strength-fill { background: #ECC94B; }
                .strength-good .strength-fill { background: #48BB78; }
                .strength-strong .strength-fill { background: #38A169; }
                .strength-text {
                    font-weight: 500;
                    margin-bottom: 0.25rem;
                }
                .strength-feedback {
                    color: #718096;
                    font-size: 0.8rem;
                }
                .feedback-tip {
                    margin: 0.125rem 0;
                }
            `;
            document.head.appendChild(styles);
        }

        return indicator;
    }

    // ==========================================
    // Account Security Methods
    // ==========================================

    isAccountLocked() {
        const lockoutTime = localStorage.getItem('account_lockout_time');
        if (!lockoutTime) return false;

        const lockoutExpiry = parseInt(lockoutTime) + this.lockoutDuration;
        return Date.now() < lockoutExpiry;
    }

    getRemainingLockoutTime() {
        const lockoutTime = localStorage.getItem('account_lockout_time');
        if (!lockoutTime) return 0;

        const lockoutExpiry = parseInt(lockoutTime) + this.lockoutDuration;
        const remaining = lockoutExpiry - Date.now();
        return Math.ceil(remaining / (60 * 1000)); // Minutes
    }

    handleLoginFailure(message) {
        this.loginAttempts++;
        localStorage.setItem('login_attempts', this.loginAttempts.toString());
        localStorage.setItem('last_failed_login', Date.now().toString());

        if (this.loginAttempts >= this.maxLoginAttempts) {
            localStorage.setItem('account_lockout_time', Date.now().toString());
            this.logSecurityEvent('account_locked', { attempts: this.loginAttempts });
        }
    }

    resetLoginAttempts() {
        this.loginAttempts = 0;
        localStorage.removeItem('login_attempts');
        localStorage.removeItem('last_failed_login');
        localStorage.removeItem('account_lockout_time');
    }

    // ==========================================
    // Token Management
    // ==========================================

    startTokenRefreshTimer() {
        setInterval(() => {
            if (this.shouldRefreshToken()) {
                this.refreshAccessToken().catch(() => {
                    // Token refresh failed, user will be logged out
                });
            }
        }, 60000); // Check every minute
    }

    shouldRefreshToken() {
        if (!this.token || !this.tokenExpiryTime) return false;
        
        // Refresh token 5 minutes before expiry
        const refreshThreshold = 5 * 60 * 1000;
        return (this.tokenExpiryTime - Date.now()) < refreshThreshold;
    }

    isTokenValid() {
        if (!this.token || !this.tokenExpiryTime) return false;
        return Date.now() < this.tokenExpiryTime;
    }

    // ==========================================
    // Email Verification
    // ==========================================

    async sendEmailVerification(email) {
        try {
            const response = await this.makeAuthRequest('/auth/send-verification', {
                method: 'POST',
                body: JSON.stringify({ email: email.toLowerCase().trim() })
            });

            if (response.success) {
                return response;
            } else {
                throw new Error(response.message || 'Failed to send verification email');
            }
        } catch (error) {
            console.error('Email verification error:', error);
            throw error;
        }
    }

    async verifyEmail(token) {
        try {
            const response = await this.makeAuthRequest('/auth/verify-email', {
                method: 'POST',
                body: JSON.stringify({ token })
            });

            if (response.success) {
                if (this.currentUser) {
                    this.currentUser.email_verified = true;
                    this.saveAuthData();
                }
                return response;
            } else {
                throw new Error(response.message || 'Email verification failed');
            }
        } catch (error) {
            console.error('Email verification error:', error);
            throw error;
        }
    }

    async checkEmailAvailability(email) {
        try {
            const response = await this.makeAuthRequest('/auth/check-email', {
                method: 'POST',
                body: JSON.stringify({ email: email.toLowerCase().trim() })
            });

            return response;
        } catch (error) {
            console.error('Email check error:', error);
            return { available: true }; // Default to available on error
        }
    }

    // ==========================================
    // Password Reset
    // ==========================================

    async requestPasswordReset(email) {
        try {
            const response = await this.makeAuthRequest('/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({
                    email: email.toLowerCase().trim(),
                    resetUrl: window.location.origin + '/reset-password.html'
                })
            });

            if (response.success) {
                return response;
            } else {
                throw new Error(response.message || 'Failed to send reset email');
            }
        } catch (error) {
            console.error('Password reset request error:', error);
            throw error;
        }
    }

    async resetPassword(token, newPassword) {
        try {
            // Validate new password
            const passwordStrength = this.checkPasswordStrength(newPassword);
            if (passwordStrength.score < 3) {
                throw new Error(`New password is too weak. ${passwordStrength.feedback.join(' ')}`);
            }

            const response = await this.makeAuthRequest('/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({
                    token,
                    password: newPassword,
                    deviceId: this.getDeviceId()
                })
            });

            if (response.success) {
                this.logSecurityEvent('password_reset_success');
                return response;
            } else {
                throw new Error(response.message || 'Password reset failed');
            }
        } catch (error) {
            console.error('Password reset error:', error);
            this.logSecurityEvent('password_reset_failed', { error: error.message });
            throw error;
        }
    }

    // ==========================================
    // Session Management
    // ==========================================

    loadStoredAuth() {
        try {
            const storedAuth = localStorage.getItem('skillsync_auth');
            if (storedAuth) {
                const authData = JSON.parse(storedAuth);
                this.token = authData.token;
                this.refreshToken = authData.refreshToken;
                this.tokenExpiryTime = authData.tokenExpiryTime;
                this.currentUser = authData.user;

                // Validate stored token
                if (this.isTokenValid()) {
                    this.logSecurityEvent('session_restored');
                } else {
                    this.clearAuthData();
                }
            }

            // Load login attempts
            this.loginAttempts = parseInt(localStorage.getItem('login_attempts') || '0');
        } catch (error) {
            console.error('Error loading stored auth:', error);
            this.clearAuthData();
        }
    }

    saveAuthData() {
        try {
            const authData = {
                token: this.token,
                refreshToken: this.refreshToken,
                tokenExpiryTime: this.tokenExpiryTime,
                user: this.currentUser,
                savedAt: Date.now()
            };

            localStorage.setItem('skillsync_auth', JSON.stringify(authData));
            this.logSecurityEvent('session_saved');
        } catch (error) {
            console.error('Error saving auth data:', error);
        }
    }

    clearAuthData() {
        this.token = null;
        this.refreshToken = null;
        this.tokenExpiryTime = null;
        this.currentUser = null;

        localStorage.removeItem('skillsync_auth');
        localStorage.removeItem('skillsync_token'); // Legacy cleanup
        this.logSecurityEvent('session_cleared');
    }

    // ==========================================
    // Success Handlers
    // ==========================================

    async handleLoginSuccess(response) {
        this.token = response.token;
        this.refreshToken = response.refreshToken;
        this.tokenExpiryTime = Date.now() + (response.expiresIn * 1000);
        this.currentUser = response.user;

        this.saveAuthData();
        this.logSecurityEvent('login_success', { 
            userId: response.user.id,
            userType: response.user.user_type 
        });

        // Set up user session
        this.setupUserSession();
    }

    async handleRegistrationSuccess(response) {
        // Don't auto-login after registration if email verification is required
        if (response.emailVerificationRequired) {
            this.logSecurityEvent('registration_success_verification_required', {
                email: response.user.email
            });
        } else {
            await this.handleLoginSuccess(response);
        }
    }

    setupUserSession() {
        // Set up user-specific configurations
        this.setupUserPreferences();
        this.initializeUserAnalytics();
        this.checkSecurityRecommendations();
    }

    setupUserPreferences() {
        // Load user preferences from server or local storage
        const preferences = localStorage.getItem(`user_preferences_${this.currentUser.id}`);
        if (preferences) {
            try {
                const prefs = JSON.parse(preferences);
                this.applyUserPreferences(prefs);
            } catch (error) {
                console.error('Error loading user preferences:', error);
            }
        }
    }

    applyUserPreferences(preferences) {
        // Apply theme, language, notification settings, etc.
        if (preferences.theme) {
            document.body.className = `theme-${preferences.theme}`;
        }
        if (preferences.language) {
            document.documentElement.lang = preferences.language;
        }
    }

    initializeUserAnalytics() {
        // Track user engagement (privacy-compliant)
        this.logAnalyticsEvent('session_start', {
            userType: this.currentUser.user_type,
            timestamp: Date.now()
        });
    }

    checkSecurityRecommendations() {
        const recommendations = [];

        // Check if email is verified
        if (!this.currentUser.email_verified) {
            recommendations.push({
                type: 'email_verification',
                message: 'Please verify your email address to secure your account',
                action: 'verify_email'
            });
        }

        // Check if 2FA is enabled
        if (!this.currentUser.two_factor_enabled) {
            recommendations.push({
                type: 'two_factor',
                message: 'Enable two-factor authentication for better security',
                action: 'enable_2fa'
            });
        }

        // Show recommendations to user
        if (recommendations.length > 0) {
            this.showSecurityRecommendations(recommendations);
        }
    }

    showSecurityRecommendations(recommendations) {
        // Display security recommendations in UI
        recommendations.forEach(rec => {
            setTimeout(() => {
                if (window.app && window.app.showNotification) {
                    window.app.showNotification(rec.message, 'info', 10000);
                }
            }, 2000);
        });
    }

    // ==========================================
    // Event Listeners
    // ==========================================

    setupAuthEventListeners() {
        // Listen for auth-related form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'loginForm') {
                e.preventDefault();
                this.handleLoginFormSubmit(e.target);
            } else if (e.target.id === 'signupForm') {
                e.preventDefault();
                this.handleSignupFormSubmit(e.target);
            }
        });

        // Listen for password visibility toggles
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('password-toggle')) {
                this.togglePasswordVisibility(e.target);
            }
        });

        // Listen for form validation events
        document.addEventListener('blur', (e) => {
            if (e.target.type === 'email') {
                this.validateEmailField(e.target);
            }
        });

        // Listen for storage events (multi-tab sync)
        window.addEventListener('storage', (e) => {
            if (e.key === 'skillsync_auth') {
                this.handleStorageChange(e);
            }
        });

        // Listen for before unload to clean up
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    async handleLoginFormSubmit(form) {
        const formData = new FormData(form);
        const credentials = {
            email: formData.get('email'),
            password: formData.get('password'),
            userType: formData.get('userType')
        };

        try {
            await this.login(credentials);
            // Success handling is done in the main app
            if (window.app && window.app.showNotification) {
                window.app.showNotification('Login successful! Redirecting...', 'success');
            }
        } catch (error) {
            if (window.app && window.app.showNotification) {
                window.app.showNotification(error.message, 'error');
            }
        }
    }

    async handleSignupFormSubmit(form) {
        const formData = new FormData(form);
        const activeTab = document.querySelector('.signup-content.active').id;
        const userType = activeTab === 'studentSignup' ? 'student' : 'startup';

        const userData = {
            userType,
            email: formData.get('email'),
            password: formData.get('password')
        };

        // Add user type specific data
        if (userType === 'student') {
            userData.name = formData.get('name');
            userData.college = formData.get('college');
            userData.skills = formData.get('skills');
        } else {
            userData.company = formData.get('company');
            userData.size = formData.get('size');
            userData.industry = formData.get('industry');
        }

        try {
            await this.register(userData);
            if (window.app && window.app.showNotification) {
                window.app.showNotification('Registration successful! Welcome to SkillSync AI.', 'success');
            }
        } catch (error) {
            if (window.app && window.app.showNotification) {
                window.app.showNotification(error.message, 'error');
            }
        }
    }

    togglePasswordVisibility(toggleButton) {
        const passwordInput = toggleButton.previousElementSibling;
        if (passwordInput && passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleButton.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else if (passwordInput && passwordInput.type === 'text') {
            passwordInput.type = 'password';
            toggleButton.innerHTML = '<i class="fas fa-eye"></i>';
        }
    }

    validateEmailField(emailInput) {
        const email = emailInput.value.trim();
        if (email && !this.isValidEmail(email)) {
            this.showFieldError(emailInput, 'Please enter a valid email address');
        } else {
            this.clearFieldError(emailInput);
        }
    }

    showFieldError(input, message) {
        this.clearFieldError(input);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #F56565;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            margin-bottom: 0.5rem;
        `;
        
        input.style.borderColor = '#F56565';
        input.parentNode.appendChild(errorDiv);
    }

    clearFieldError(input) {
        const errorDiv = input.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
        input.style.borderColor = '';
    }

    handleStorageChange(e) {
        // Handle multi-tab authentication sync
        if (e.oldValue && !e.newValue) {
            // Auth data was cleared in another tab
            this.clearAuthData();
            this.redirectToLogin();
        } else if (!e.oldValue && e.newValue) {
            // User logged in from another tab
            this.loadStoredAuth();
        }
    }

    // ==========================================
    // Utility Methods
    // ==========================================

    async makeAuthRequest(endpoint, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-Token': localStorage.getItem('csrf_token'),
                ...options.headers
            },
            ...options
        };

        const response = await fetch(`${this.apiUrl}${endpoint}`, config);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    getDeviceId() {
        let deviceId = localStorage.getItem('device_id');
        if (!deviceId) {
            deviceId = this.generateDeviceId();
            localStorage.setItem('device_id', deviceId);
        }
        return deviceId;
    }

    generateDeviceId() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint', 2, 2);
        
        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            canvas.toDataURL()
        ].join('|');
        
        return this.hashCode(fingerprint).toString();
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    getBrowserInfo() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            screenResolution: `${screen.width}x${screen.height}`,
            colorDepth: screen.colorDepth,
            timezoneOffset: new Date().getTimezoneOffset()
        };
    }

    async getUserIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }

    logSecurityEvent(event, data = {}) {
        const logEntry = {
            event,
            timestamp: new Date().toISOString(),
            userId: this.currentUser?.id,
            deviceId: this.getDeviceId(),
            userAgent: navigator.userAgent,
            ...data
        };

        // Store security logs locally (could also send to server)
        const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
        logs.push(logEntry);
        
        // Keep only last 100 logs
        if (logs.length > 100) {
            logs.splice(0, logs.length - 100);
        }
        
        localStorage.setItem('security_logs', JSON.stringify(logs));
        console.log('🔒 Security Event:', event, data);
    }

    logAnalyticsEvent(event, data = {}) {
        // Privacy-compliant analytics logging
        const analyticsEntry = {
            event,
            timestamp: Date.now(),
            sessionId: this.getDeviceId(),
            ...data
        };

        // Store analytics data (could be sent to analytics service)
        const analytics = JSON.parse(localStorage.getItem('user_analytics') || '[]');
        analytics.push(analyticsEntry);
        
        // Keep only last 50 analytics entries
        if (analytics.length > 50) {
            analytics.splice(0, analytics.length - 50);
        }
        
        localStorage.setItem('user_analytics', JSON.stringify(analytics));
    }

    redirectToLogin() {
        if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
            window.location.href = '/index.html';
        } else if (window.app && window.app.openModal) {
            window.app.openModal('loginModal');
        }
    }

    redirectToDashboard() {
        if (this.currentUser) {
            const dashboardUrl = `pages/${this.currentUser.user_type}-dashboard.html`;
            window.location.href = dashboardUrl;
        }
    }

    cleanup() {
        // Clear sensitive data from memory
        if (this.passwordStrengthCache) {
            this.passwordStrengthCache.clear();
        }
        
        // Log session end
        this.logAnalyticsEvent('session_end', {
            duration: Date.now() - (this.currentUser?.session_start || Date.now())
        });
    }

    // ==========================================
    // Public API Methods
    // ==========================================

    getCurrentUser() {
        return this.currentUser;
    }

    getAuthToken() {
        return this.token;
    }

    isAuthenticated() {
        return !!(this.currentUser && this.isTokenValid());
    }

    getUserType() {
        return this.currentUser?.user_type;
    }

    isEmailVerified() {
        return this.currentUser?.email_verified || false;
    }

    getSecurityLogs() {
        return JSON.parse(localStorage.getItem('security_logs') || '[]');
    }

    getAnalyticsData() {
        return JSON.parse(localStorage.getItem('user_analytics') || '[]');
    }
}

// Initialize Auth Manager
const authManager = new AuthManager();

// Export for global access
window.authManager = authManager;
window.auth = authManager; // Shorter alias

// Console welcome message
console.log(`
🔐 SkillSync AI Authentication System Loaded
🛡️ Advanced Security Features Enabled
📧 Email Verification Support Active
🔄 Token Auto-Refresh Configured
`);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}

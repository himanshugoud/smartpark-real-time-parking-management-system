// ========================
// SmartPark - Professional Calling System
// Version 2.1.0 - Dark Theme Support
// ========================

const SmartParkCalling = (function() {
    'use strict';
    
    // ========================
    // Configuration
    // ========================
    const CONFIG = {
        phoneNumbers: {
            support: '+9195755228807',
            emergency: '+9195755228807',
            security: '+919301750723',
            office: '+9195755228807'
        },
        emails: {
            support: 'himanshugoud638@gmail.com',
            privacy: 'himanshugoud638@gmail.com',
            billing: 'himanshugoud638@gmail.com'
        },
        addresses: {
            main: '02 Ashok Colony Parking St, Gwalior, Madhya Pradesh, India',
            office: 'Ashok Colony, Gwalior, MP - 474001'
        },
        businessHours: {
            support: '24/7',
            chat: '9AM - 9PM EST',
            office: '8AM - 8PM'
        }
    };

    // ========================
    // Theme Detection
    // ========================
    const ThemeDetector = {
        getCurrentTheme: function() {
            const html = document.documentElement;
            const theme = html.getAttribute('data-theme') || 'light';
            return theme;
        },
        
        isDarkTheme: function() {
            const theme = this.getCurrentTheme();
            const darkThemes = ['dark', 'halloween', 'christmas', 'enterprise-blue', 'enterprise-green', 'enterprise-purple', 'enterprise-red'];
            return darkThemes.includes(theme);
        },
        
        getThemeColors: function() {
            const isDark = this.isDarkTheme();
            const theme = this.getCurrentTheme();
            
            // Default dark theme colors
            if (isDark) {
                return {
                    bg: '#1e293b',
                    bgSecondary: '#0f172a',
                    surface: '#334155',
                    surfaceHover: '#475569',
                    border: '#475569',
                    text: '#f1f5f9',
                    textSecondary: '#cbd5e1',
                    textMuted: '#94a3b8',
                    primary: '#60a5fa',
                    primaryGradient: 'linear-gradient(135deg, #60a5fa, #818cf8)',
                    success: '#4ade80',
                    warning: '#fbbf24',
                    error: '#f87171',
                    info: '#38bdf8',
                    whatsapp: '#25d366',
                    overlay: 'rgba(0, 0, 0, 0.8)'
                };
            }
            
            // Light theme colors (default)
            return {
                bg: '#ffffff',
                bgSecondary: '#f8fafc',
                surface: '#f1f5f9',
                surfaceHover: '#e2e8f0',
                border: '#e2e8f0',
                text: '#0f172a',
                textSecondary: '#334155',
                textMuted: '#64748b',
                primary: '#4361ee',
                primaryGradient: 'linear-gradient(135deg, #4361ee, #3a0ca3)',
                success: '#10b981',
                warning: '#f59e0b',
                error: '#ef4444',
                info: '#3b82f6',
                whatsapp: '#25d366',
                overlay: 'rgba(0, 0, 0, 0.5)'
            };
        },
        
        observeThemeChanges: function(callback) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'data-theme') {
                        callback(this.getCurrentTheme());
                    }
                });
            });
            
            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['data-theme']
            });
            
            return observer;
        }
    };

    // ========================
    // Device Detection
    // ========================
    const DeviceDetector = {
        isMobile: function() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent);
        },
        
        isIOS: function() {
            return /iPhone|iPad|iPod/i.test(navigator.userAgent);
        },
        
        isAndroid: function() {
            return /Android/i.test(navigator.userAgent);
        },
        
        isDesktop: function() {
            return !this.isMobile();
        },
        
        getPlatform: function() {
            if (this.isIOS()) return 'iOS';
            if (this.isAndroid()) return 'Android';
            if (this.isMobile()) return 'Mobile';
            return 'Desktop';
        }
    };

    // ========================
    // Clipboard Manager
    // ========================
    const ClipboardManager = {
        copyText: async function(text) {
            try {
                await navigator.clipboard.writeText(text);
                return { success: true, message: 'Number copied!' };
            } catch (err) {
                try {
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-999999px';
                    textArea.style.top = '-999999px';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    document.execCommand('copy');
                    textArea.remove();
                    return { success: true, message: 'Number copied!' };
                } catch (fallbackErr) {
                    return { success: false, message: 'Copy failed' };
                }
            }
        }
    };

    // ========================
    // Call Handler
    // ========================
    const CallHandler = {
        initiateCall: function(phoneNumber, callerType = 'support') {
            const cleanNumber = phoneNumber.replace(/\s+/g, '');
            const displayNumber = this.formatPhoneNumber(cleanNumber);
            
            if (DeviceDetector.isMobile()) {
                window.location.href = `tel:${cleanNumber}`;
                this.showToast(`Calling ${callerType}...`, 'info', 2000);
                this.logCallAttempt(cleanNumber, callerType, 'initiated');
                return { success: true, method: 'dialer', number: cleanNumber };
            } else {
                return this.showDesktopCallOptions(cleanNumber, displayNumber, callerType);
            }
        },

        formatPhoneNumber: function(number) {
            if (number.startsWith('+91')) {
                const parts = number.match(/^(\+91)(\d{5})(\d{5})$/);
                if (parts) {
                    return `${parts[1]} ${parts[2]} ${parts[3]}`;
                }
            }
            return number;
        },

        showDesktopCallOptions: function(number, displayNumber, callerType) {
            const modalId = 'smartpark-call-modal';
            
            const existingModal = document.getElementById(modalId);
            if (existingModal) existingModal.remove();

            const colors = ThemeDetector.getThemeColors();
            const isDark = ThemeDetector.isDarkTheme();

            const modal = document.createElement('div');
            modal.id = modalId;
            modal.className = 'smartpark-call-modal';
            modal.setAttribute('data-theme', ThemeDetector.getCurrentTheme());
            
            modal.innerHTML = `
                <div class="smartpark-call-modal-content" style="background: ${colors.bg};">
                    <div class="smartpark-call-modal-header" style="background: ${colors.bgSecondary}; border-bottom-color: ${colors.border};">
                        <div class="smartpark-call-icon-wrapper" style="background: ${colors.primaryGradient};">
                            <i class="fas fa-phone-alt"></i>
                        </div>
                        <div>
                            <h3 style="color: ${colors.text};">Call ${callerType}</h3>
                            <span class="smartpark-phone-number" style="background: ${isDark ? 'rgba(96, 165, 250, 0.15)' : 'rgba(67, 97, 238, 0.08)'}; color: ${colors.primary};">${displayNumber}</span>
                        </div>
                        <button class="smartpark-call-modal-close" onclick="SmartParkCalling.hideCallModal()" 
                                style="background: ${colors.surface}; color: ${colors.textMuted}; border-color: ${colors.border};">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="smartpark-call-modal-body">
                        <div class="smartpark-call-options">
                            <button class="smartpark-call-option-btn smartpark-copy-btn" data-number="${number}"
                                    style="background: ${colors.surface}; color: ${colors.textSecondary}; border-color: ${colors.border};">
                                <i class="fas fa-copy" style="color: ${colors.textMuted};"></i>
                                <span>Copy Number</span>
                            </button>
                            <button class="smartpark-call-option-btn smartpark-whatsapp-btn" onclick="SmartParkCalling.openWhatsApp('${number}')"
                                    style="background: ${colors.surface}; color: ${colors.textSecondary}; border-color: ${colors.border};">
                                <i class="fab fa-whatsapp" style="color: #25d366;"></i>
                                <span>WhatsApp</span>
                            </button>
                        </div>
                        <div class="smartpark-call-info" style="background: ${colors.surface}; border-color: ${colors.border}; color: ${colors.textMuted};">
                            <i class="fas fa-clock" style="color: ${colors.primary};"></i>
                            <span>Available ${CONFIG.businessHours.support}</span>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            
            setTimeout(() => modal.classList.add('active'), 10);

            const copyBtn = modal.querySelector('.smartpark-copy-btn');
            if (copyBtn) {
                copyBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const number = e.currentTarget.dataset.number;
                    const result = await ClipboardManager.copyText(number);
                    this.showToast(result.message, result.success ? 'success' : 'error', 1500);
                });
            }

            const whatsappBtn = modal.querySelector('.smartpark-whatsapp-btn');
            if (whatsappBtn) {
                whatsappBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openWhatsApp(number);
                });
            }

            this.logCallAttempt(number, callerType, 'desktop_view');
            return { success: true, method: 'desktop_modal', number: number };
        },

        hideCallModal: function() {
            const modal = document.getElementById('smartpark-call-modal');
            if (modal) {
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 200);
            }
        },

        openWhatsApp: function(phoneNumber) {
            const cleanNumber = phoneNumber.replace(/\s+/g, '').replace(/\+/g, '');
            window.open(`https://wa.me/${cleanNumber}`, '_blank');
            this.showToast('Opening WhatsApp...', 'info', 1500);
            this.logCallAttempt(phoneNumber, 'whatsapp', 'initiated');
        },

        showToast: function(message, type = 'success', duration = 2000) {
            const colors = ThemeDetector.getThemeColors();
            
            const toastId = 'smartpark-call-toast';
            const existingToast = document.getElementById(toastId);
            if (existingToast) existingToast.remove();

            const toast = document.createElement('div');
            toast.id = toastId;
            toast.className = `smartpark-call-toast smartpark-call-toast-${type}`;
            toast.setAttribute('data-theme', ThemeDetector.getCurrentTheme());
            
            let icon = 'check-circle';
            let iconColor = colors.success;
            
            if (type === 'error') {
                icon = 'exclamation-circle';
                iconColor = colors.error;
            }
            if (type === 'info') {
                icon = 'info-circle';
                iconColor = colors.info;
            }
            if (type === 'warning') {
                icon = 'exclamation-triangle';
                iconColor = colors.warning;
            }
            
            toast.style.background = colors.bg;
            toast.style.color = colors.text;
            toast.style.borderLeftColor = iconColor;
            
            toast.innerHTML = `
                <i class="fas fa-${icon}" style="color: ${iconColor};"></i>
                <span>${message}</span>
            `;
            
            document.body.appendChild(toast);
            
            setTimeout(() => toast.classList.add('active'), 10);
            setTimeout(() => {
                toast.classList.remove('active');
                setTimeout(() => toast.remove(), 200);
            }, duration);
        },

        logCallAttempt: function(number, type, status) {
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log(`📞 Call: ${number} (${type}) - ${status}`);
            }

            try {
                const callLogs = JSON.parse(localStorage.getItem('smartpark_call_logs') || '[]');
                callLogs.push({
                    number: number,
                    type: type,
                    status: status,
                    platform: DeviceDetector.getPlatform(),
                    theme: ThemeDetector.getCurrentTheme(),
                    timestamp: new Date().toISOString()
                });
                if (callLogs.length > 20) callLogs.shift();
                localStorage.setItem('smartpark_call_logs', JSON.stringify(callLogs));
            } catch (e) {}
        }
    };

    // ========================
    // Email Handler
    // ========================
    const EmailHandler = {
        sendEmail: function(emailAddress, subject = '', body = '') {
            window.location.href = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            this.showToast('Opening email...', 'info', 1500);
            return { success: true, method: 'mailto', email: emailAddress };
        },

        showEmailOptions: function(emailAddress, recipientType = 'support') {
            const subject = this.getEmailSubject(recipientType);
            const body = this.getEmailBody(recipientType);
            this.sendEmail(emailAddress, subject, body);
        },

        getEmailSubject: function(type) {
            const subjects = {
                support: 'Support Request - SmartPark',
                billing: 'Billing Inquiry - SmartPark',
                privacy: 'Privacy Question - SmartPark',
                general: 'SmartPark Customer Inquiry'
            };
            return subjects[type] || subjects.general;
        },

        getEmailBody: function(type) {
            const user = window.appState?.currentUser || null;
            const userName = user?.name || 'Customer';
            
            const bodies = {
                support: `Dear SmartPark Support Team,

I need assistance with my parking booking.

Name: ${userName}
Issue: [Please describe]

Thank you.`,
                billing: `Dear SmartPark Billing Team,

I have a question about my payment.

Name: ${userName}

Thank you.`
            };
            
            return bodies[type] || bodies.support;
        },

        showToast: CallHandler.showToast.bind(CallHandler)
    };

    // ========================
    // Directions Handler
    // ========================
    const DirectionsHandler = {
        getDirections: function(address, locationName = 'SmartPark') {
            const encodedAddress = encodeURIComponent(address);
            
            if (DeviceDetector.isMobile()) {
                if (DeviceDetector.isIOS()) {
                    window.open(`maps://?q=${encodedAddress}`, '_blank');
                } else if (DeviceDetector.isAndroid()) {
                    window.open(`geo:0,0?q=${encodedAddress}`, '_blank');
                } else {
                    window.open(`https://maps.google.com?q=${encodedAddress}`, '_blank');
                }
            } else {
                window.open(`https://maps.google.com?q=${encodedAddress}`, '_blank');
            }
            
            this.showToast('Opening maps...', 'info', 1500);
            return { success: true, address: address };
        },

        showToast: CallHandler.showToast.bind(CallHandler)
    };

    // ========================
    // Theme Updater
    // ========================
    const ThemeUpdater = {
        updateModalTheme: function() {
            const modal = document.getElementById('smartpark-call-modal');
            if (!modal) return;
            
            const colors = ThemeDetector.getThemeColors();
            const isDark = ThemeDetector.isDarkTheme();
            
            const content = modal.querySelector('.smartpark-call-modal-content');
            const header = modal.querySelector('.smartpark-call-modal-header');
            const iconWrapper = modal.querySelector('.smartpark-call-icon-wrapper');
            const phoneNumber = modal.querySelector('.smartpark-phone-number');
            const closeBtn = modal.querySelector('.smartpark-call-modal-close');
            const copyBtn = modal.querySelector('.smartpark-copy-btn');
            const whatsappBtn = modal.querySelector('.smartpark-whatsapp-btn');
            const info = modal.querySelector('.smartpark-call-info');
            
            if (content) content.style.background = colors.bg;
            if (header) {
                header.style.background = colors.bgSecondary;
                header.style.borderBottomColor = colors.border;
            }
            if (iconWrapper) iconWrapper.style.background = colors.primaryGradient;
            if (phoneNumber) {
                phoneNumber.style.background = isDark ? 'rgba(96, 165, 250, 0.15)' : 'rgba(67, 97, 238, 0.08)';
                phoneNumber.style.color = colors.primary;
            }
            if (closeBtn) {
                closeBtn.style.background = colors.surface;
                closeBtn.style.color = colors.textMuted;
                closeBtn.style.borderColor = colors.border;
            }
            if (copyBtn) {
                copyBtn.style.background = colors.surface;
                copyBtn.style.color = colors.textSecondary;
                copyBtn.style.borderColor = colors.border;
            }
            if (whatsappBtn) {
                whatsappBtn.style.background = colors.surface;
                whatsappBtn.style.color = colors.textSecondary;
                whatsappBtn.style.borderColor = colors.border;
            }
            if (info) {
                info.style.background = colors.surface;
                info.style.borderColor = colors.border;
                info.style.color = colors.textMuted;
                const infoIcon = info.querySelector('i');
                if (infoIcon) infoIcon.style.color = colors.primary;
            }
            
            modal.setAttribute('data-theme', ThemeDetector.getCurrentTheme());
        },
        
        updateToastTheme: function() {
            const toast = document.getElementById('smartpark-call-toast');
            if (!toast) return;
            
            const colors = ThemeDetector.getThemeColors();
            toast.style.background = colors.bg;
            toast.style.color = colors.text;
            toast.setAttribute('data-theme', ThemeDetector.getCurrentTheme());
        }
    };

    // ========================
    // Public API
    // ========================
    return {
        // Core functions
        call: function(number, type = 'support') {
            return CallHandler.initiateCall(number || CONFIG.phoneNumbers[type], type);
        },
        
        callSupport: function() {
            return this.call(CONFIG.phoneNumbers.support, 'support');
        },
        
        callEmergency: function() {
            return this.call(CONFIG.phoneNumbers.emergency, 'emergency');
        },
        
        callSecurity: function() {
            return this.call(CONFIG.phoneNumbers.security, 'security');
        },
        
        // Email functions
        email: function(email, type = 'support') {
            return EmailHandler.showEmailOptions(email || CONFIG.emails[type], type);
        },
        
        emailSupport: function() {
            return this.email(CONFIG.emails.support, 'support');
        },
        
        // Directions
        getDirections: function(address) {
            return DirectionsHandler.getDirections(address || CONFIG.addresses.main);
        },
        
        // Utility functions
        copyToClipboard: async function(text) {
            return await ClipboardManager.copyText(text);
        },
        
        hideCallModal: function() {
            CallHandler.hideCallModal();
        },
        
        openWhatsApp: function(number) {
            CallHandler.openWhatsApp(number);
        },
        
        showToast: function(message, type, duration) {
            CallHandler.showToast(message, type, duration);
        },
        
        // Theme functions
        updateTheme: function() {
            ThemeUpdater.updateModalTheme();
            ThemeUpdater.updateToastTheme();
        },
        
        getCurrentTheme: function() {
            return ThemeDetector.getCurrentTheme();
        },
        
        isDarkTheme: function() {
            return ThemeDetector.isDarkTheme();
        },
        
        // Device info
        getDeviceInfo: function() {
            return {
                platform: DeviceDetector.getPlatform(),
                isMobile: DeviceDetector.isMobile(),
                isDesktop: DeviceDetector.isDesktop(),
                theme: ThemeDetector.getCurrentTheme()
            };
        },
        
        // Initialize the system
        init: function() {
            this.injectStyles();
            this.setupEventListeners();
            
            // Watch for theme changes
            ThemeDetector.observeThemeChanges(() => {
                this.updateTheme();
            });
            
            console.log('✅ SmartPark Calling ready (Dark theme supported)');
            return this;
        },

        // Inject CSS styles - Dark Theme Support
        injectStyles: function() {
            if (document.getElementById('smartpark-calling-styles')) return;

            const styles = document.createElement('style');
            styles.id = 'smartpark-calling-styles';
            styles.textContent = `
                /* SmartPark Calling System - Dark Theme Support */
                .smartpark-call-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.2s ease, visibility 0.2s ease;
                    padding: 1rem;
                }
                
                .smartpark-call-modal.active {
                    opacity: 1;
                    visibility: visible;
                }
                
                .smartpark-call-modal-content {
                    border-radius: 12px;
                    max-width: 360px;
                    width: 100%;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
                    transform: translateY(10px);
                    transition: transform 0.2s ease;
                    overflow: hidden;
                }
                
                [data-theme="dark"] .smartpark-call-modal-content,
                [data-theme="halloween"] .smartpark-call-modal-content,
                [data-theme="christmas"] .smartpark-call-modal-content {
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
                }
                
                .smartpark-call-modal.active .smartpark-call-modal-content {
                    transform: translateY(0);
                }
                
                .smartpark-call-modal-header {
                    padding: 1.25rem;
                    border-bottom: 1px solid;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    position: relative;
                }
                
                .smartpark-call-icon-wrapper {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.25rem;
                    flex-shrink: 0;
                }
                
                .smartpark-call-modal-header h3 {
                    margin: 0 0 4px 0;
                    font-size: 1rem;
                    font-weight: 600;
                }
                
                .smartpark-phone-number {
                    font-size: 0.875rem;
                    font-weight: 500;
                    padding: 4px 8px;
                    border-radius: 6px;
                    display: inline-block;
                }
                
                .smartpark-call-modal-close {
                    width: 32px;
                    height: 32px;
                    border: 1px solid;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    margin-left: auto;
                    flex-shrink: 0;
                }
                
                .smartpark-call-modal-close:hover {
                    opacity: 0.8;
                }
                
                .smartpark-call-modal-body {
                    padding: 1.25rem;
                }
                
                .smartpark-call-options {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }
                
                .smartpark-call-option-btn {
                    padding: 0.75rem 0.5rem;
                    border: 1px solid;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-weight: 500;
                    font-size: 0.813rem;
                }
                
                .smartpark-call-option-btn:hover {
                    transform: translateY(-1px);
                }
                
                .smartpark-call-option-btn i {
                    font-size: 1.125rem;
                }
                
                .smartpark-whatsapp-btn i {
                    color: #25d366 !important;
                }
                
                .smartpark-call-info {
                    padding: 0.625rem;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.75rem;
                    border: 1px solid;
                }
                
                /* Toast Notifications - Dark Theme Support */
                .smartpark-call-toast {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    padding: 0.75rem 1.25rem;
                    border-radius: 10px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    display: flex;
                    align-items: center;
                    gap: 0.625rem;
                    z-index: 10001;
                    opacity: 0;
                    transform: translateX(100%);
                    transition: all 0.2s ease;
                    max-width: 280px;
                    font-size: 0.875rem;
                    border-left: 3px solid;
                }
                
                [data-theme="dark"] .smartpark-call-toast,
                [data-theme="halloween"] .smartpark-call-toast,
                [data-theme="christmas"] .smartpark-call-toast {
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                }
                
                .smartpark-call-toast.active {
                    opacity: 1;
                    transform: translateX(0);
                }
                
                .smartpark-call-toast i {
                    font-size: 1rem;
                }
                
                @media (max-width: 480px) {
                    .smartpark-call-modal-content {
                        max-width: 100%;
                        margin: 0 1rem;
                    }
                    
                    .smartpark-call-toast {
                        left: 20px;
                        right: 20px;
                        max-width: none;
                    }
                    
                    .smartpark-call-options {
                        gap: 0.5rem;
                    }
                    
                    .smartpark-call-option-btn {
                        padding: 0.625rem 0.5rem;
                        font-size: 0.75rem;
                    }
                }
            `;
            
            document.head.appendChild(styles);
        },

        setupEventListeners: function() {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.hideCallModal();
                }
            });
            
            // Listen for theme toggle events
            document.addEventListener('themeChanged', (e) => {
                this.updateTheme();
            });
            
            // Also listen for clicks on theme toggles
            document.addEventListener('click', (e) => {
                const themeToggle = e.target.closest('[data-theme-toggle], .theme-toggle, #theme-toggle, .theme-switcher');
                if (themeToggle) {
                    setTimeout(() => this.updateTheme(), 50);
                }
            });
        }
    };
})();

// ========================
// Initialize
// ========================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SmartParkCalling.init());
} else {
    SmartParkCalling.init();
}

// ========================
// Export to Global Scope
// ========================
window.SmartParkCalling = SmartParkCalling;

// ========================
// Auto-setup for buttons
// ========================
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        // Call Support Buttons
        document.querySelectorAll('.call-support-btn, [data-call="support"]').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                SmartParkCalling.callSupport();
            });
        });
        
        // Emergency Buttons
        document.querySelectorAll('.emergency-contact, [data-call="emergency"]').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const phoneEl = btn.querySelector('.phone-number');
                if (phoneEl) {
                    SmartParkCalling.call(phoneEl.textContent.trim(), 'emergency');
                } else {
                    SmartParkCalling.callEmergency();
                }
            });
        });
        
        // Email Buttons
        document.querySelectorAll('.email-support-btn, [data-email="support"]').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                SmartParkCalling.emailSupport();
            });
        });
        
        // Directions Buttons
        document.querySelectorAll('.directions-btn, [data-directions]').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                SmartParkCalling.getDirections();
            });
        });
        
        console.log('✅ SmartPark Calling: Buttons ready with dark theme support');
    }, 300);
});


// theme-integration.js
// Theme System Integration for SmartPark - UPDATED WITH QUICK ACTIONS SUPPORT

(function() {
    'use strict';
    
    console.log('Loading SmartPark Theme Integration with Quick Actions support...');
    
    // ========================
    // Configuration
    // ========================
    
    const config = {
        // Auto dark mode settings
        autoDarkStart: 19, // 7 PM
        autoDarkEnd: 6,    // 6 AM
        
        // Seasonal themes
        seasonalThemes: {
            christmas: { month: 12, days: '1-31' },
            halloween: { month: 10, days: '15-31' },
            summer: { month: '6-8', days: 'all' },
            winter: { month: '11-2', days: 'all', exclude: 12 }
        },
        
        // User theme preferences storage key
        storagePrefix: 'smartpark_theme_'
    };
    
    // ========================
    // Core Integration
    // ========================
    
    let themeManager = null;
    let appState = null;
    let integrationInitialized = false;
    
    // Wait for both systems to be available
    function waitForDependencies() {
        if (typeof window.themeManager !== 'undefined') {
            themeManager = window.themeManager;
        }
        
        if (typeof window.appState !== 'undefined') {
            appState = window.appState;
        }
        
        if (themeManager && document.readyState === 'complete') {
            initializeIntegration();
        } else {
            setTimeout(waitForDependencies, 100);
        }
    }
    
    function initializeIntegration() {
        if (integrationInitialized) return;
        
        console.log('Initializing SmartPark Theme Integration');
        
        // ========================
        // 1. Load User Theme Preference
        // ========================
        
        loadUserTheme();
        
        // ========================
        // 2. Setup Theme Change Listener
        // ========================
        
        setupThemeChangeListener();
        
        // ========================
        // 3. Create Theme UI Elements
        // ========================
        
        createThemeUI();
        
        // ========================
        // 4. Setup Automated Themes
        // ========================
        
        setupAutomatedThemes();
        
        // ========================
        // 5. Integrate with App Functions
        // ========================
        
        integrateWithApp();
        
        // ========================
        // 6. Apply initial theme to Quick Actions
        // ========================
        
        applyThemeToQuickActions();
        
        integrationInitialized = true;
        console.log('Theme Integration Ready');
        
        // Dispatch ready event
        document.dispatchEvent(new CustomEvent('themeintegration:ready'));
    }
    
    // ========================
    // NEW: Quick Actions Integration Functions
    // ========================
    
    function applyThemeToQuickActions() {
        const quickActionsSection = document.getElementById('quick-actions-section');
        if (!quickActionsSection) return;
        
        console.log('Applying theme to Quick Actions section');
        
        // Update section background
        quickActionsSection.style.backgroundColor = 'var(--bg-primary)';
        quickActionsSection.style.color = 'var(--text-primary)';
        
        // Update section title and subtitle
        const sectionTitle = quickActionsSection.querySelector('.section-title');
        const sectionSubtitle = quickActionsSection.querySelector('.section-subtitle');
        
        if (sectionTitle) {
            sectionTitle.style.color = 'var(--text-primary)';
        }
        
        if (sectionSubtitle) {
            sectionSubtitle.style.color = 'var(--text-secondary)';
        }
        
        // Update action cards
        updateQuickActionCards();
    }
    
    function updateQuickActionCards() {
        const actionCards = document.querySelectorAll('.action-card-horizontal');
        
        if (actionCards.length === 0) {
            console.log('No Quick Action cards found');
            return;
        }
        
        console.log(`Updating ${actionCards.length} Quick Action cards for theme`);
        
        actionCards.forEach((card, index) => {
            // Update card background and border
            card.style.backgroundColor = 'var(--bg-card)';
            card.style.borderColor = 'var(--border-color)';
            card.style.boxShadow = 'var(--shadow-sm)';
            
            // Update text colors
            card.style.color = 'var(--text-primary)';
            
            // Update title
            const title = card.querySelector('.action-title-horizontal');
            if (title) {
                title.style.color = 'var(--text-primary)';
            }
            
            // Update description
            const description = card.querySelector('.action-description-horizontal');
            if (description) {
                description.style.color = 'var(--text-secondary)';
            }
            
            // Update arrow icon
            const arrow = card.querySelector('.action-arrow-horizontal');
            if (arrow) {
                arrow.style.color = 'var(--primary)';
            }
            
            // Update icon container
            const icon = card.querySelector('.action-icon-horizontal');
            if (icon) {
                // Keep gradient background for icons
                icon.style.background = 'var(--gradient-primary)';
                icon.style.color = 'white';
                icon.style.boxShadow = 'var(--shadow)';
            }
            
            // Special handling for different themes
            const currentTheme = themeManager ? themeManager.currentTheme : 'light';
            
            if (currentTheme === 'dark') {
                // Dark theme specific adjustments
                card.style.backgroundColor = 'var(--bg-card)';
                card.style.borderColor = 'var(--border-color)';
                
                if (title) {
                    title.style.color = 'var(--text-primary)';
                    title.style.fontWeight = '600';
                }
                
                if (description) {
                    description.style.color = 'var(--text-secondary)';
                }
                
                // Dark theme hover effect
                card.addEventListener('mouseenter', () => {
                    card.style.backgroundColor = 'var(--bg-tertiary)';
                    card.style.borderColor = 'var(--primary)';
                });
                
                card.addEventListener('mouseleave', () => {
                    card.style.backgroundColor = 'var(--bg-card)';
                    card.style.borderColor = 'var(--border-color)';
                });
                
            } else if (currentTheme === 'high-contrast') {
                // High contrast theme specific adjustments
                card.style.borderWidth = '2px';
                card.style.borderColor = 'var(--border-color)';
                
                if (title) {
                    title.style.color = 'var(--text-primary)';
                    title.style.fontWeight = '700';
                }
                
                if (description) {
                    description.style.color = 'var(--text-secondary)';
                    description.style.fontWeight = '600';
                }
                
            } else if (currentTheme === 'dyslexia') {
                // Dyslexia theme specific adjustments
                if (title) {
                    title.style.letterSpacing = '0.1em';
                    title.style.lineHeight = '1.8';
                }
                
                if (description) {
                    description.style.letterSpacing = '0.1em';
                    description.style.lineHeight = '1.8';
                }
            }
            
            // Add hover effects
            const originalBgColor = getComputedStyle(card).backgroundColor;
            const originalBorderColor = getComputedStyle(card).borderColor;
            
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px)';
                card.style.boxShadow = 'var(--shadow-lg)';
                card.style.borderColor = 'var(--primary)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = 'var(--shadow-sm)';
                card.style.borderColor = originalBorderColor;
            });
        });
        
        console.log('Quick Action cards updated for theme');
    }
    
    // ========================
    // Core Functions
    // ========================
    
    function loadUserTheme() {
        // Check localStorage for saved theme
        const savedTheme = localStorage.getItem(`${config.storagePrefix}preference`);
        
        if (savedTheme && themeManager.themes[savedTheme]) {
            themeManager.setTheme(savedTheme);
            console.log(`Loaded saved theme: ${savedTheme}`);
        } else {
            // Check for business/enterprise user
            if (appState && appState.currentUser) {
                const email = appState.currentUser.email || '';
                if (email.includes('business') || email.includes('enterprise') || email.includes('corp')) {
                    themeManager.setTheme('enterprise-blue');
                    console.log('Applied enterprise theme for business user');
                }
            }
        }
    }
    
    function setupThemeChangeListener() {
        themeManager.addThemeChangeListener((event) => {
            const theme = event.detail.theme;
            const themeName = themeManager.themes[theme] || theme;
            
            console.log(`Theme changed to: ${theme} (${themeName})`);
            
            // Save preference
            localStorage.setItem(`${config.storagePrefix}preference`, theme);
            
            // Save user-specific theme if logged in
            if (appState && appState.isLoggedIn && appState.currentUser) {
                localStorage.setItem(`${config.storagePrefix}user_${appState.currentUser.id}`, theme);
            }
            
            // Update UI elements
            updateUIForTheme(theme);
            
            // Apply theme to Quick Actions
            applyThemeToQuickActions();
            
            // Show notification
            showThemeNotification(themeName);
            
            // Update parking map if it exists
            updateParkingMapForTheme();
        });
    }
    
    function updateUIForTheme(theme) {
        console.log(`Updating UI for theme: ${theme}`);
        
        // Update specific elements based on theme
        const isDark = theme === 'dark' || theme === 'halloween';
        const isHighContrast = theme === 'high-contrast';
        const isDyslexia = theme === 'dyslexia';
        
        // Update logo
        const logoIcon = document.querySelector('.logo-icon');
        if (logoIcon) {
            if (isDark) {
                logoIcon.style.filter = 'brightness(1.2) drop-shadow(0 2px 4px rgba(0,0,0,0.3))';
            } else if (isHighContrast) {
                logoIcon.style.border = '2px solid var(--text-primary)';
                logoIcon.style.boxShadow = '0 0 0 2px var(--bg-primary)';
            } else {
                logoIcon.style.filter = '';
                logoIcon.style.border = '';
                logoIcon.style.boxShadow = '';
            }
        }
        
        // Update parking slots in map
        const parkingSlots = document.querySelectorAll('.parking-slot-map');
        parkingSlots.forEach(slot => {
            if (isDark) {
                slot.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
            }
        });
        
        // Update modal backgrounds
        document.querySelectorAll('.modal-content').forEach(modal => {
            modal.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        });
        
        // Update dashboard cards
        document.querySelectorAll('.stat-card, .feature-card, .pricing-card').forEach(card => {
            card.style.transition = 'background-color 0.3s ease, border-color 0.3s ease';
        });
        
        // Update navigation
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.style.backgroundColor = 'var(--bg-navbar)';
            navbar.style.borderBottomColor = 'var(--border-color)';
        }
        
        // Update footer
        const footer = document.querySelector('.footer');
        if (footer) {
            footer.style.backgroundColor = 'var(--gray-900)';
        }
        
        console.log('UI updated for theme');
    }
    
    function updateParkingMapForTheme() {
        if (typeof window.renderParkingMap === 'function') {
            setTimeout(() => {
                try {
                    window.renderParkingMap();
                } catch (e) {
                    console.log('Could not update parking map:', e);
                }
            }, 100);
        }
    }
    
    function showThemeNotification(themeName) {
        if (typeof window.showToast === 'function') {
            window.showToast(`Theme: ${themeName}`, 'info');
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.className = 'theme-notification-fallback';
            notification.textContent = `Theme changed to ${themeName}`;
            notification.style.cssText = `
                position: fixed;
                bottom: 80px;
                right: 20px;
                background: var(--bg-card);
                color: var(--text-primary);
                padding: 10px 15px;
                border-radius: 8px;
                box-shadow: var(--shadow-lg);
                border: 1px solid var(--border-color);
                z-index: 9998;
                font-size: 14px;
                animation: slideInRight 0.3s ease;
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 2000);
        }
    }
    
    // ========================
    // UI Elements
    // ========================
    
    function createThemeUI() {
        // Add theme shortcuts to dashboard settings
        addThemeShortcutsToSettings();
        
        // Add quick theme toggle to navbar (optional)
        addThemeToggleToNavbar();
    }
    
    function addThemeShortcutsToSettings() {
        // Wait for settings panel to be available
        const checkInterval = setInterval(() => {
            const settingsPanel = document.getElementById('settings-panel');
            if (settingsPanel) {
                clearInterval(checkInterval);
                injectThemeShortcuts(settingsPanel);
            }
        }, 500);
    }
    
    function injectThemeShortcuts(settingsPanel) {
        const themeSection = document.createElement('div');
        themeSection.className = 'form-group';
        themeSection.innerHTML = `
            <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 15px;">
                <i class="fas fa-palette" style="color: var(--primary);"></i>
                <span style="font-weight: 600; color: var(--text-primary);">Theme Settings</span>
            </label>
            
            <div class="theme-quick-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px;">
                <button class="theme-quick-btn" data-theme="light" style="background: var(--gray-100); border: 2px solid var(--gray-300); border-radius: 8px; padding: 12px; text-align: center; cursor: pointer; transition: all 0.2s;">
                    <div style="display: flex; align-items: center; gap: 8px; justify-content: center;">
                        <i class="fas fa-sun" style="color: #f59e0b;"></i>
                        <span style="font-size: 14px; font-weight: 500; color: var(--text-primary);">Light</span>
                    </div>
                </button>
                
                <button class="theme-quick-btn" data-theme="dark" style="background: var(--gray-800); border: 2px solid var(--gray-600); border-radius: 8px; padding: 12px; text-align: center; cursor: pointer; transition: all 0.2s;">
                    <div style="display: flex; align-items: center; gap: 8px; justify-content: center;">
                        <i class="fas fa-moon" style="color: #e5e7eb;"></i>
                        <span style="font-size: 14px; font-weight: 500; color: white;">Dark</span>
                    </div>
                </button>
                
                <button class="theme-quick-btn" data-theme="high-contrast" style="background: var(--bg-primary); border: 3px solid var(--text-primary); border-radius: 8px; padding: 12px; text-align: center; cursor: pointer; transition: all 0.2s;">
                    <div style="display: flex; align-items: center; gap: 8px; justify-content: center;">
                        <i class="fas fa-eye" style="color: blue;"></i>
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">High Contrast</span>
                    </div>
                </button>
                
                <button class="theme-quick-btn" data-theme="dyslexia" style="background: var(--bg-primary); border: 2px solid var(--border-color); border-radius: 8px; padding: 12px; text-align: center; cursor: pointer; transition: all 0.2s;">
                    <div style="display: flex; align-items: center; gap: 8px; justify-content: center;">
                        <i class="fas fa-font" style="color: var(--primary);"></i>
                        <span style="font-size: 14px; font-weight: 500; color: var(--text-primary);">Dyslexia Friendly</span>
                    </div>
                </button>
            </div>
            
            <div style="font-size: 12px; color: var(--text-tertiary); margin-top: 10px; padding: 10px; background: var(--bg-tertiary); border-radius: 6px;">
                <i class="fas fa-info-circle" style="color: var(--primary);"></i> Themes change colors, fonts, and contrast for better accessibility.
            </div>
        `;
        
        const form = settingsPanel.querySelector('.settings-form');
        if (form) {
            // Insert after the first form-group or at the beginning
            const firstGroup = form.querySelector('.form-group');
            if (firstGroup) {
                form.insertBefore(themeSection, firstGroup);
            } else {
                form.prepend(themeSection);
            }
            
            // Add event listeners
            themeSection.querySelectorAll('.theme-quick-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const theme = this.dataset.theme;
                    themeManager.setTheme(theme);
                    
                    // Visual feedback
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 200);
                });
                
                // Theme button hover effects
                btn.addEventListener('mouseenter', function() {
                    this.style.boxShadow = 'var(--shadow)';
                });
                
                btn.addEventListener('mouseleave', function() {
                    this.style.boxShadow = 'none';
                });
            });
        }
    }
    
    function addThemeToggleToNavbar() {
        // Optional: Add small theme toggle to navbar
        const navbar = document.querySelector('.nav-actions');
        if (navbar) {
            const themeToggle = document.createElement('button');
            themeToggle.className = 'btn btn-outline btn-sm';
            themeToggle.innerHTML = '<i class="fas fa-palette"></i>';
            themeToggle.title = 'Change Theme';
            themeToggle.style.marginRight = '10px';
            themeToggle.style.borderColor = 'var(--primary)';
            themeToggle.style.color = 'var(--primary)';
            
            themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Open theme panel
                if (typeof themeManager !== 'undefined' && themeManager.openPanel) {
                    themeManager.openPanel();
                } else {
                    // Fallback: Cycle themes
                    themeManager.cycleThemes();
                }
            });
            
            // Update theme toggle on theme change
            themeManager.addThemeChangeListener(() => {
                themeToggle.style.borderColor = 'var(--primary)';
                themeToggle.style.color = 'var(--primary)';
            });
            
            navbar.insertBefore(themeToggle, navbar.firstChild);
        }
    }
    
    // ========================
    // Automated Themes
    // ========================
    
    function setupAutomatedThemes() {
        // Apply seasonal theme on load
        applySeasonalTheme();
        
        // Check for auto dark mode
        setupAutoDarkMode();
        
        // Check every hour for theme updates
        setInterval(checkForThemeUpdates, 3600000); // 1 hour
    }
    
    function applySeasonalTheme() {
        if (!themeManager.preferredTheme || themeManager.preferredTheme === 'auto') {
            const now = new Date();
            const month = now.getMonth() + 1; // 1-12
            const day = now.getDate();
            
            // Christmas (December)
            if (month === 12) {
                themeManager.setTheme('christmas');
                return;
            }
            
            // Halloween (October 15-31)
            if (month === 10 && day >= 15) {
                themeManager.setTheme('halloween');
                return;
            }
            
            // Summer (June-August)
            if (month >= 6 && month <= 8) {
                themeManager.setTheme('summer');
                return;
            }
            
            // Winter (November-February, excluding December)
            if ((month === 11 || month <= 2) && month !== 12) {
                themeManager.setTheme('winter');
                return;
            }
        }
    }
    
    function setupAutoDarkMode() {
        function checkTimeForDarkMode() {
            const hour = new Date().getHours();
            const isNight = hour >= config.autoDarkStart || hour < config.autoDarkEnd;
            
            if (isNight && themeManager.preferredTheme === 'auto') {
                // Only auto-switch if user hasn't manually selected a theme
                if (!localStorage.getItem(`${config.storagePrefix}manual_override`)) {
                    themeManager.setTheme('dark');
                }
            }
        }
        
        // Check now
        checkTimeForDarkMode();
        
        // Check every 30 minutes
        setInterval(checkTimeForDarkMode, 1800000);
    }
    
    function checkForThemeUpdates() {
        // Re-check seasonal themes
        applySeasonalTheme();
    }
    
    // ========================
    // App Integration
    // ========================
    
    function integrateWithApp() {
        // Override logout to save theme
        overrideLogout();
        
        // Update dashboard on theme change
        setupDashboardIntegration();
        
        // Apply theme to booking modal
        setupBookingModalIntegration();
    }
    
    function overrideLogout() {
        if (typeof window.logout === 'function') {
            const originalLogout = window.logout;
            
            window.logout = function() {
                // Save current theme before logout
                if (appState && appState.currentUser) {
                    localStorage.setItem(
                        `${config.storagePrefix}user_${appState.currentUser.id}`,
                        themeManager.currentTheme
                    );
                }
                
                // Reset to light theme
                setTimeout(() => {
                    themeManager.setTheme('light');
                }, 100);
                
                // Call original logout
                return originalLogout();
            };
            
            console.log('Theme logout integration enabled');
        }
    }
    
    function setupDashboardIntegration() {
        // Listen for dashboard updates
        if (typeof window.updateDashboard === 'function') {
            themeManager.addThemeChangeListener(() => {
                setTimeout(() => {
                    try {
                        window.updateDashboard();
                    } catch (e) {
                        console.log('Could not update dashboard:', e);
                    }
                }, 100);
            });
        }
    }
    
    function setupBookingModalIntegration() {
        // Update booking modal when theme changes
        themeManager.addThemeChangeListener(() => {
            const bookingModal = document.getElementById('booking-modal');
            if (bookingModal && bookingModal.classList.contains('active')) {
                // Force reflow to update colors
                bookingModal.style.display = 'none';
                bookingModal.offsetHeight; // Trigger reflow
                bookingModal.style.display = '';
            }
        });
    }
    
    // ========================
    // Public API
    // ========================
    
    window.ThemeIntegration = {
        // Core functions
        setTheme: function(theme) {
            if (themeManager && themeManager.themes[theme]) {
                themeManager.setTheme(theme);
                return true;
            }
            return false;
        },
        
        getCurrentTheme: function() {
            return themeManager ? themeManager.getThemeInfo() : null;
        },
        
        // Quick Actions functions
        updateQuickActions: function() {
            applyThemeToQuickActions();
            return true;
        },
        
        forceRefreshQuickActions: function() {
            updateQuickActionCards();
            return true;
        },
        
        // User preferences
        saveUserPreference: function(userId, theme) {
            if (!userId || !theme) return false;
            localStorage.setItem(`${config.storagePrefix}user_${userId}`, theme);
            return true;
        },
        
        loadUserPreference: function(userId) {
            if (!userId) return null;
            return localStorage.getItem(`${config.storagePrefix}user_${userId}`);
        },
        
        // Custom themes
        createCustomTheme: function(name, colors) {
            if (!themeManager || !themeManager.createCustomTheme) return null;
            return themeManager.createCustomTheme(name, colors);
        },
        
        // Automation control
        enableAutoDarkMode: function() {
            config.autoDarkStart = 19;
            config.autoDarkEnd = 6;
            localStorage.removeItem(`${config.storagePrefix}manual_override`);
        },
        
        disableAutoDarkMode: function() {
            localStorage.setItem(`${config.storagePrefix}manual_override`, 'true');
        },
        
        enableSeasonalThemes: function() {
            config.seasonalThemes.enabled = true;
            applySeasonalTheme();
        },
        
        disableSeasonalThemes: function() {
            config.seasonalThemes.enabled = false;
        },
        
        // UI control
        showThemePanel: function() {
            if (themeManager && themeManager.openPanel) {
                themeManager.openPanel();
            }
        },
        
        hideThemePanel: function() {
            if (themeManager && themeManager.closePanel) {
                themeManager.closePanel();
            }
        },
        
        // Debug functions
        debugQuickActions: function() {
            const quickActionsSection = document.getElementById('quick-actions-section');
            if (!quickActionsSection) {
                console.error('Quick Actions section not found');
                return false;
            }
            
            const actionCards = quickActionsSection.querySelectorAll('.action-card-horizontal');
            console.log(`Found ${actionCards.length} Quick Action cards`);
            
            actionCards.forEach((card, index) => {
                console.log(`Card ${index + 1}:`);
                console.log('  Background:', getComputedStyle(card).backgroundColor);
                console.log('  Color:', getComputedStyle(card).color);
                console.log('  Border:', getComputedStyle(card).borderColor);
                
                const title = card.querySelector('.action-title-horizontal');
                if (title) {
                    console.log('  Title color:', getComputedStyle(title).color);
                }
                
                const description = card.querySelector('.action-description-horizontal');
                if (description) {
                    console.log('  Description color:', getComputedStyle(description).color);
                }
            });
            
            return true;
        }
    };
    
    // ========================
    // Animation Styles
    // ========================
    
    function addAnimationStyles() {
        if (!document.getElementById('theme-integration-styles')) {
            const style = document.createElement('style');
            style.id = 'theme-integration-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
                
                .theme-quick-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow);
                }
                
                .theme-quick-btn:active {
                    transform: translateY(0);
                }
                
                /* Quick Actions card animation */
                .action-card-horizontal {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .action-card-horizontal:hover {
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                /* Smooth theme transitions */
                #quick-actions-section,
                .action-card-horizontal,
                .action-title-horizontal,
                .action-description-horizontal {
                    transition: background-color 0.3s ease, 
                                color 0.3s ease, 
                                border-color 0.3s ease,
                                box-shadow 0.3s ease;
                }
                
                /* High contrast theme enhancements */
                [data-theme="high-contrast"] .action-card-horizontal {
                    border-width: 2px !important;
                }
                
                [data-theme="high-contrast"] .action-title-horizontal {
                    font-weight: 700 !important;
                    text-decoration: underline;
                }
                
                /* Dark theme enhancements */
                [data-theme="dark"] #quick-actions-section {
                    background: var(--bg-primary) !important;
                }
                
                [data-theme="dark"] .action-card-horizontal {
                    background: var(--bg-card) !important;
                    border-color: var(--border-color) !important;
                }
                
                [data-theme="dark"] .action-card-horizontal:hover {
                    background: var(--bg-tertiary) !important;
                    border-color: var(--primary) !important;
                }
                
                /* Dyslexia theme enhancements */
                [data-theme="dyslexia"] .action-title-horizontal,
                [data-theme="dyslexia"] .action-description-horizontal {
                    font-family: var(--font-dyslexia) !important;
                    letter-spacing: 0.1em !important;
                    line-height: 1.8 !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // ========================
    // Initialization
    // ========================
    
    // Add animation styles
    addAnimationStyles();
    
    // Start waiting for dependencies
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForDependencies);
    } else {
        waitForDependencies();
    }
    
    // Fallback: Check again after 3 seconds
    setTimeout(() => {
        if (!integrationInitialized && window.themeManager) {
            themeManager = window.themeManager;
            initializeIntegration();
        }
    }, 3000);
    
    // Listen for Quick Actions section to be added dynamically
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        if (node.id === 'quick-actions-section' || 
                            node.querySelector && node.querySelector('#quick-actions-section')) {
                            console.log('Quick Actions section detected dynamically');
                            setTimeout(applyThemeToQuickActions, 100);
                        }
                    }
                });
            }
        });
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Also check for Quick Actions on window load
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (document.getElementById('quick-actions-section')) {
                console.log('Quick Actions section found on window load');
                applyThemeToQuickActions();
            }
        }, 500);
    });
    
})();


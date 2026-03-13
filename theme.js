// theme.js - Updated with Navbar Theme Toggle
// Advanced Theme System for SmartPark

class ThemeManager {
    constructor() {
        this.themes = {
            'light': 'Light',
            'dark': 'Dark'
        };
        
        this.currentTheme = 'light';
        this.preferredTheme = null;
        this.customColors = {};
        this.isPanelOpen = false;
        
        this.init();
    }
    
    init() {
        this.loadTheme();
        this.createThemeToggle();
        this.applyTheme();
        this.setupListeners();
    }
    
    loadTheme() {
        // Load saved theme from localStorage
        const savedTheme = localStorage.getItem('smartpark_theme');
        const savedPreferred = localStorage.getItem('smartpark_preferred_theme');
        
        console.log('Loading theme:', { savedTheme, savedPreferred });
        
        if (savedPreferred === 'auto') {
            this.preferredTheme = 'auto';
            this.detectSystemTheme();
        } else if (savedTheme && this.themes[savedTheme]) {
            this.currentTheme = savedTheme;
            this.preferredTheme = savedTheme;
        } else {
            // Default to light mode
            this.currentTheme = 'light';
            this.preferredTheme = null;
            console.log('Using default light theme');
        }
        
        this.applyTheme();
    }
    
    detectSystemTheme() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        console.log('System prefers dark mode:', prefersDark);
        
        if (prefersDark) {
            this.currentTheme = 'dark';
        } else {
            this.currentTheme = 'light';
        }
        
        console.log('Detected system theme:', this.currentTheme);
    }
    
    createThemeToggle() {
        // Create theme panel
        const themePanel = document.createElement('div');
        themePanel.className = 'theme-panel';
        themePanel.id = 'theme-panel';
        themePanel.innerHTML = `
            <div class="theme-panel-header">
                <h3><i class="fas fa-palette"></i> Theme Settings</h3>
                <button class="close-theme-panel" id="close-theme-panel">&times;</button>
            </div>
            
            <div class="theme-section">
                <h4><i class="fas fa-moon"></i> Theme Modes</h4>
                <div class="theme-options" id="theme-modes">
                    <label class="theme-option">
                        <input type="radio" name="theme-mode" value="auto" ${this.preferredTheme === 'auto' ? 'checked' : ''}>
                        <div class="theme-preview">
                            <div class="theme-preview-color">
                                <div style="background: linear-gradient(135deg, #f3f4f6 0%, #1f2937 100%);"></div>
                                <div style="background: linear-gradient(135deg, #e5e7eb 0%, #374151 100%);"></div>
                                <div style="background: linear-gradient(135deg, #d1d5db 0%, #4b5563 100%);"></div>
                            </div>
                            <div class="auto-theme-indicator">
                                <i class="fas fa-sync-alt"></i>
                            </div>
                        </div>
                        <span class="theme-name">Auto</span>
                    </label>
                    
                    <label class="theme-option">
                        <input type="radio" name="theme-mode" value="light" ${this.currentTheme === 'light' && this.preferredTheme !== 'auto' ? 'checked' : ''}>
                        <div class="theme-preview">
                            <div class="theme-preview-color">
                                <div style="background: #f9fafb;"></div>
                                <div style="background: #f3f4f6;"></div>
                                <div style="background: #e5e7eb;"></div>
                            </div>
                        </div>
                        <span class="theme-name">Light</span>
                    </label>
                    
                    <label class="theme-option">
                        <input type="radio" name="theme-mode" value="dark" ${this.currentTheme === 'dark' && this.preferredTheme !== 'auto' ? 'checked' : ''}>
                        <div class="theme-preview">
                            <div class="theme-preview-color">
                                <div style="background: #111827;"></div>
                                <div style="background: #1f2937;"></div>
                                <div style="background: #374151;"></div>
                            </div>
                        </div>
                        <span class="theme-name">Dark</span>
                    </label>
                </div>
            </div>
        `;
        
        document.body.appendChild(themePanel);
        
        // Create theme toggle button for navbar
        const themeToggleBtn = document.createElement('button');
        themeToggleBtn.className = 'theme-toggle-btn-navbar';
        themeToggleBtn.id = 'theme-toggle-btn';
        themeToggleBtn.title = 'Change Theme';
        themeToggleBtn.innerHTML = '<i class="fas fa-palette"></i>';
        
        // Add to navbar (next to Book Now button)
        const navActions = document.querySelector('.nav-actions');
        if (navActions) {
            const bookNowBtn = document.getElementById('book-now-btn');
            if (bookNowBtn) {
                navActions.insertBefore(themeToggleBtn, bookNowBtn);
            } else {
                navActions.appendChild(themeToggleBtn);
            }
        }
        
        this.updateToggleButton();
    }
    
    setupListeners() {
        // Add event listeners
        document.getElementById('theme-toggle-btn').addEventListener('click', () => {
            this.togglePanel();
        });
        
        document.getElementById('close-theme-panel').addEventListener('click', () => {
            this.closePanel();
        });
        
        document.querySelectorAll('input[name="theme-mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'auto') {
                    this.setAutoTheme();
                } else {
                    this.setTheme(e.target.value);
                }
            });
        });
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (this.preferredTheme === 'auto') {
                this.detectSystemTheme();
                this.applyTheme();
            }
        });
        
        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('theme-panel');
            const toggleBtn = document.getElementById('theme-toggle-btn');
            
            if (this.isPanelOpen && 
                !panel.contains(e.target) && 
                !toggleBtn.contains(e.target)) {
                this.closePanel();
            }
        });
        
        // Escape key to close panel
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isPanelOpen) {
                this.closePanel();
            }
        });
    }
    
    setTheme(theme) {
        if (!this.themes[theme]) return;
        
        console.log('Setting theme to:', theme);
        
        // Update theme
        this.currentTheme = theme;
        this.preferredTheme = theme;
        
        // Apply theme
        this.applyTheme();
        this.updateToggleButton();
        this.saveTheme();
        this.closePanel();
        
        // Show notification
        this.showNotification(`Theme changed to ${this.themes[theme]}`);
    }
    
    setAutoTheme() {
        console.log('Setting auto theme mode');
        this.preferredTheme = 'auto';
        this.detectSystemTheme();
        this.applyTheme();
        this.updateToggleButton();
        this.saveTheme();
        this.closePanel();
        this.showNotification('Theme set to Auto (follows system)');
    }
    
    applyTheme() {
        console.log('Applying theme:', this.currentTheme);
        
        // Remove all theme attributes
        document.documentElement.removeAttribute('data-theme');
        
        // Apply current theme
        if (this.currentTheme && this.currentTheme !== 'light') {
            document.documentElement.setAttribute('data-theme', this.currentTheme);
        }
        
        // Update UI elements
        this.updateToggleButton();
        
        // Dispatch theme change event
        document.dispatchEvent(new CustomEvent('themechange', {
            detail: { theme: this.currentTheme }
        }));
    }
    
    updateToggleButton() {
        const toggleBtn = document.getElementById('theme-toggle-btn');
        if (!toggleBtn) return;
        
        // Update button icon based on theme
        let icon = 'fa-palette';
        
        if (this.currentTheme === 'dark') {
            icon = 'fa-moon';
        } else if (this.currentTheme === 'light') {
            icon = 'fa-sun';
        }
        
        toggleBtn.innerHTML = `<i class="fas ${icon}"></i>`;
        
        // Update button title
        const themeName = this.themes[this.currentTheme] || 'Custom';
        toggleBtn.title = `Current Theme: ${themeName}\nClick to change`;
    }
    
    saveTheme() {
        localStorage.setItem('smartpark_theme', this.currentTheme);
        localStorage.setItem('smartpark_preferred_theme', this.preferredTheme);
        console.log('Saved theme:', { current: this.currentTheme, preferred: this.preferredTheme });
    }
    
    togglePanel() {
        const panel = document.getElementById('theme-panel');
        const toggleBtn = document.getElementById('theme-toggle-btn');
        
        if (!panel || !toggleBtn) return;
        
        if (this.isPanelOpen) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    }
    
    openPanel() {
        const panel = document.getElementById('theme-panel');
        const toggleBtn = document.getElementById('theme-toggle-btn');
        
        if (!panel || !toggleBtn) return;
        
        panel.classList.add('active');
        toggleBtn.classList.add('active');
        this.isPanelOpen = true;
    }
    
    closePanel() {
        const panel = document.getElementById('theme-panel');
        const toggleBtn = document.getElementById('theme-toggle-btn');
        
        if (!panel || !toggleBtn) return;
        
        panel.classList.remove('active');
        toggleBtn.classList.remove('active');
        this.isPanelOpen = false;
    }
    
    showNotification(message) {
        if (typeof showToast === 'function') {
            showToast(message, 'info');
            return;
        }
        
        // Fallback notification
        console.log('Theme notification:', message);
    }
}

// Initialize theme manager
let themeManager;

document.addEventListener('DOMContentLoaded', () => {
    themeManager = new ThemeManager();
    window.themeManager = themeManager;
});


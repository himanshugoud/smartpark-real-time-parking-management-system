// chat-integration.js
// Integration between SmartPark and Live Chat System

(function() {
    'use strict';
    
    console.log('Loading SmartPark Chat Integration...');
    
    // Wait for the live chat system to be available
    function waitForLiveChat() {
        if (typeof window.liveChat !== 'undefined') {
            initializeChatIntegration();
        } else {
            setTimeout(waitForLiveChat, 100);
        }
    }
    
    function initializeChatIntegration() {
        console.log('Initializing Chat Integration...');
        
        // ========================
        // 1. Chat Support Button Integration
        // ========================
        
        const chatSupportBtn = document.querySelector('.chat-support-btn');
        if (chatSupportBtn) {
            chatSupportBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Chat Support button clicked');
                
                // Open the chat bot
                window.liveChat.openChat();
                
                // Optional: Send a welcome message automatically
                setTimeout(() => {
                    if (window.liveChat && window.liveChat.isOpen) {
                        const chatInput = document.getElementById('chat-input');
                        if (chatInput) {
                            // Auto-type a support request
                            chatInput.value = "I need help with parking support";
                            chatInput.dispatchEvent(new Event('input'));
                            
                            // Enable send button
                            const sendBtn = document.getElementById('send-btn');
                            if (sendBtn && !sendBtn.disabled) {
                                sendBtn.click();
                            }
                        }
                    }
                }, 500);
                
                // Scroll to chat if needed
                const chatWidget = document.querySelector('.chat-widget');
                if (chatWidget) {
                    chatWidget.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
            
            // Update button text and icon
            chatSupportBtn.innerHTML = '<i class="fas fa-comment"></i> Start Live Chat';
            chatSupportBtn.title = 'Click to start a live chat with Parky, our SmartPark assistant';
        }
        
        // ========================
        // 2. Help Section Quick Actions
        // ========================
        
        // Find all "Chat Now" buttons and make them open the chat
        const chatNowButtons = document.querySelectorAll('.btn[class*="chat"], .btn[class*="Chat"]');
        chatNowButtons.forEach(btn => {
            if (!btn.classList.contains('chat-support-btn')) {
                btn.addEventListener('click', function(e) {
                    if (this.href && this.href.includes('chat')) {
                        e.preventDefault();
                        window.liveChat.openChat();
                    }
                });
            }
        });
        
        // ========================
        // 3. Chat Bot Auto-Suggestions
        // ========================
        
        // When user visits help section, show proactive chat
        const helpSection = document.getElementById('help');
        if (helpSection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // User is viewing help section
                        console.log('User viewing help section');
                        
                        // Show proactive notification after 3 seconds
                        setTimeout(() => {
                            if (window.liveChat && !window.liveChat.hasInteractedWithChat()) {
                                window.liveChat.showProactiveNotification();
                            }
                        }, 3000);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(helpSection);
        }
        
        // ========================
        // 4. FAQ Integration
        // ========================
        
        const faqQuestions = document.querySelectorAll('.faq-question');
        faqQuestions.forEach((question, index) => {
            question.addEventListener('click', function() {
                // When FAQ is opened, check if user might need more help
                setTimeout(() => {
                    if (window.liveChat && !window.liveChat.isOpen && !window.liveChat.hasInteractedWithChat()) {
                        // After 2 FAQ clicks, suggest chat
                        if (index >= 2) {
                            window.liveChat.showProactiveNotification();
                        }
                    }
                }, 1000);
            });
        });
        
        // ========================
        // 5. Emergency Contact Integration
        // ========================
        
        const emergencyContacts = document.querySelectorAll('.emergency-contact');
        emergencyContacts.forEach(contact => {
            contact.addEventListener('click', function() {
                // If emergency contact is clicked, suggest chat for non-emergency
                setTimeout(() => {
                    if (window.liveChat && !window.liveChat.isOpen) {
                        // Add a special message to chat
                        const chatBody = document.getElementById('chat-body');
                        if (chatBody) {
                            const emergencyMsg = document.createElement('div');
                            emergencyMsg.className = 'chat-suggestions';
                            emergencyMsg.innerHTML = `
                                <h5>Emergency Assistance</h5>
                                <p class="suggestion-item" data-message="I need emergency assistance">
                                    <i class="fas fa-ambulance"></i> I need emergency assistance
                                </p>
                                <p class="suggestion-item" data-message="My vehicle is stuck">
                                    <i class="fas fa-car-crash"></i> My vehicle is stuck
                                </p>
                                <p class="suggestion-item" data-message="Medical emergency in parking">
                                    <i class="fas fa-first-aid"></i> Medical emergency in parking
                                </p>
                            `;
                            chatBody.appendChild(emergencyMsg);
                            
                            // Add click handlers to suggestions
                            emergencyMsg.querySelectorAll('.suggestion-item').forEach(item => {
                                item.addEventListener('click', function() {
                                    const message = this.dataset.message;
                                    if (window.liveChat) {
                                        // Add user message
                                        window.liveChat.addMessage(message, 'user');
                                        window.liveChat.showTypingIndicator();
                                        
                                        // Process emergency response
                                        setTimeout(() => {
                                            window.liveChat.removeTypingIndicator();
                                            window.liveChat.addMessage(
                                                "I've detected this is an emergency. For immediate assistance, please call our 24/7 emergency hotline: +91 9575228807. I'm also connecting you with our security team. Please stay on the line.",
                                                'bot',
                                                'support'
                                            );
                                            window.liveChat.playSound('notification');
                                        }, 1000);
                                    }
                                });
                            });
                        }
                    }
                }, 500);
            });
        });
        
        // ========================
        // 6. Public API
        // ========================
        
        window.ChatIntegration = {
            openChat: function() {
                if (window.liveChat) {
                    window.liveChat.openChat();
                    return true;
                }
                return false;
            },
            
            sendMessage: function(message) {
                if (window.liveChat && window.liveChat.isOpen) {
                    const chatInput = document.getElementById('chat-input');
                    const sendBtn = document.getElementById('send-btn');
                    
                    if (chatInput && sendBtn) {
                        chatInput.value = message;
                        chatInput.dispatchEvent(new Event('input'));
                        
                        if (!sendBtn.disabled) {
                            sendBtn.click();
                            return true;
                        }
                    }
                }
                return false;
            },
            
            suggestChat: function(context) {
                if (window.liveChat && !window.liveChat.isOpen) {
                    let message = "Need help with parking?";
                    
                    if (context === 'booking') {
                        message = "Having trouble booking? I can help!";
                    } else if (context === 'payment') {
                        message = "Payment issues? Chat with me for assistance!";
                    } else if (context === 'emergency') {
                        message = "Emergency assistance available via chat!";
                    }
                    
                    // Update proactive notification message
                    const proactiveTitle = document.querySelector('.proactive-title');
                    const proactiveMessage = document.querySelector('.proactive-message');
                    
                    if (proactiveTitle) proactiveTitle.textContent = "Quick Assistance";
                    if (proactiveMessage) proactiveMessage.textContent = message;
                    
                    window.liveChat.showProactiveNotification();
                    return true;
                }
                return false;
            },
            
            // Integration with main app
            integrateWithApp: function() {
                // Override the help modal chat button
                const helpModal = document.getElementById('help-modal');
                if (helpModal) {
                    const modalChatBtn = helpModal.querySelector('.chat-support-btn');
                    if (modalChatBtn) {
                        modalChatBtn.addEventListener('click', function(e) {
                            e.preventDefault();
                            window.liveChat.openChat();
                        });
                    }
                }
                
                // Add chat button to booking modal
                const bookingModal = document.getElementById('booking-modal');
                if (bookingModal) {
                    const bookingHelpBtn = document.createElement('button');
                    bookingHelpBtn.className = 'btn btn-outline btn-sm';
                    bookingHelpBtn.innerHTML = '<i class="fas fa-comment"></i> Get Help';
                    bookingHelpBtn.style.marginLeft = '10px';
                    bookingHelpBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        window.liveChat.openChat();
                        setTimeout(() => {
                            window.liveChat.addMessage(
                                "I need help with the booking process",
                                'user'
                            );
                            window.liveChat.showTypingIndicator();
                            setTimeout(() => {
                                window.liveChat.removeTypingIndicator();
                                window.liveChat.processUserMessage("I need help with the booking process");
                            }, 1000);
                        }, 500);
                    });
                    
                    const bookingActions = bookingModal.querySelector('.modal-actions');
                    if (bookingActions) {
                        bookingActions.appendChild(bookingHelpBtn);
                    }
                }
                
                console.log('Chat integration with app completed');
            }
        };
        
        // Initialize integration with main app
        setTimeout(() => {
            if (typeof window.ChatIntegration !== 'undefined') {
                window.ChatIntegration.integrateWithApp();
            }
        }, 1000);
        
        console.log('Chat Integration initialized');
        
        // Dispatch event when integration is ready
        document.dispatchEvent(new CustomEvent('chatintegration:ready'));
    }
    
    // Start waiting for live chat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForLiveChat);
    } else {
        waitForLiveChat();
    }
    
    // Fallback: If live chat doesn't load, provide basic functionality
    setTimeout(() => {
        if (typeof window.liveChat === 'undefined') {
            console.warn('Live chat not loaded, providing fallback');
            
            const chatSupportBtn = document.querySelector('.chat-support-btn');
            if (chatSupportBtn) {
                chatSupportBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    alert('Live chat is currently unavailable. Please contact support at +91 9575228807 or himanshugoud638@gmail.com');
                });
            }
        }
    }, 5000);
})();


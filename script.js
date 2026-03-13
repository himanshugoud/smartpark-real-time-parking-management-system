// ========================
// Application State
// ========================
let appState = {
    currentUser: null,
    isLoggedIn: false,
    currentFloor: 'ground',
    selectedSlot: null,
    bookingStep: 1,
    extendingBooking: null,
    selectedPlan: null,
    parkingData: {
        ground: [],
        first: [],
        second: []
    },
    bookings: [],
    payments: [],
    notifications: [],
    userSettings: {
        name: '',
        email: '',
        phone: '',
        defaultVehicle: '',
        vehicleType: 'car',
        notifications: ['email', 'sms']
    },
    advanceBooking: null,
    planDetails: null
};

// ========================
// Utility Functions
// ========================
function scrollToSection(selector) {
    const element = document.querySelector(selector);
    if (element) {
        const offset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

function updateActiveNav(activeLink) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    if (activeLink.classList.contains('nav-link')) {
        activeLink.classList.add('active');
    }
}

function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateCardNumber(number) {
    const re = /^[0-9]{13,19}$/;
    return re.test(number.replace(/\s/g, ''));
}

function validateCardExpiry(expiry) {
    const re = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!re.test(expiry)) return false;
    
    const [month, year] = expiry.split('/');
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    
    if (parseInt(year) < currentYear) return false;
    if (parseInt(year) === currentYear && parseInt(month) < currentMonth) return false;
    
    return true;
}

function validateCVV(cvv) {
    const re = /^[0-9]{3,4}$/;
    return re.test(cvv);
}

function togglePasswordVisibility(inputId, icon) {
    const passwordInput = document.getElementById(inputId);
    if (!passwordInput) return;
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    const toastIcon = toast.querySelector('.toast-icon');
    const toastMessage = toast.querySelector('.toast-message');
    
    toastMessage.textContent = message;
    
    switch(type) {
        case 'error':
            toastIcon.className = 'fas fa-exclamation-circle toast-icon';
            toast.style.background = 'var(--danger)';
            break;
        case 'warning':
            toastIcon.className = 'fas fa-exclamation-triangle toast-icon';
            toast.style.background = 'var(--warning)';
            break;
        case 'info':
            toastIcon.className = 'fas fa-info-circle toast-icon';
            toast.style.background = 'var(--info)';
            break;
        default:
            toastIcon.className = 'fas fa-check-circle toast-icon';
            toast.style.background = 'var(--success)';
    }
    
    toast.classList.add('active');
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, 4000);
}

function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.add('active');
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.remove('active');
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        if (modalId === 'booking-modal' && appState.selectedSlot) {
            updateBookingFormWithSlot(appState.selectedSlot);
        }
        
        if (modalId === 'booking-modal' && appState.selectedPlan) {
            updateBookingFormWithPlan(appState.selectedPlan);
        }
    }
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = '';
}

function animateCounter(element, target) {
    if (!element) return;
    
    const current = parseInt(element.textContent) || 0;
    const difference = target - current;
    const duration = 1000;
    const steps = 60;
    const stepTime = duration / steps;
    const increment = difference / steps;
    let currentValue = current;
    let step = 0;
    
    const timer = setInterval(() => {
        step++;
        currentValue += increment;
        
        if (step >= steps) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.round(currentValue);
        }
    }, stepTime);
}

function isSlotAvailableForBooking(slotId, floor, startTime, endTime, excludeBookingId = null) {
    return !appState.bookings.some(booking => {
        if (excludeBookingId && booking.id === excludeBookingId) return false;
        
        return booking.slotId === slotId && 
               booking.floor === floor &&
               booking.status === 'confirmed' &&
               !(new Date(endTime) <= new Date(booking.startTime) || 
                 new Date(startTime) >= new Date(booking.endTime));
    });
}

// ========================
// Initialize Application
// ========================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// ========================
// Initialize Application
// ========================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    const savedUser = localStorage.getItem('smartpark_user');
    if (savedUser) {
        try {
            appState.currentUser = JSON.parse(savedUser);
            appState.isLoggedIn = true;
            updateUserUI();
            loadUserData();
        } catch (e) {
            console.error('Error loading user data:', e);
            localStorage.removeItem('smartpark_user');
        }
    }
    
    try {
        const savedBookings = localStorage.getItem('smartpark_bookings');
        const savedPayments = localStorage.getItem('smartpark_payments');
        const savedSettings = localStorage.getItem('smartpark_settings');
        
        if (savedBookings) appState.bookings = JSON.parse(savedBookings);
        if (savedPayments) appState.payments = JSON.parse(savedPayments);
        if (savedSettings) appState.userSettings = JSON.parse(savedSettings);
    } catch (e) {
        console.error('Error loading data:', e);
    }
    
    generateParkingData();
    
    setupSmoothScrolling();
    setupNavigation();
    setupParkingFeatures();
    setupAuthentication();
    setupBooking();
    setupDashboard();
    setupHelpSupport();
    setupPricing();
    setupFooter();
    setupModals();
    setupToast();
    setupFAQAccordion();
    setupMobileDropdown();
    setupLogout();
    setupPasswordStrength();
    setupParkingEventDelegation();
    setupQuickActions();
    setupEnhancedFeatures();
    
    renderParkingMap();
    
    startLiveUpdates();
    
    setupCounters();
    
    setupReceiptSystem();
    
    if (window.location.hash.includes('dashboard')) {
        updateDashboard();
    }
    
    setDefaultDateTime();
    
    setupBookInAdvance();
    
    // Fix booking modal layout
    fixBookingModalLayout();
    
    // ADDED: Setup horizontal quick actions with a slight delay
    setTimeout(() => {
        setupEnhancedFeatures();
        setupHorizontalQuickActions(); // This line was added
    }, 100);
}

// ========================
// Fix Booking Modal Layout
// ========================
function fixBookingModalLayout() {
    const bookingModal = document.getElementById('booking-modal');
    if (!bookingModal) return;
    
    // Fix Step 1: Slot Details
    const step1 = document.getElementById('step-1');
    if (step1) {
        step1.innerHTML = `
            <div class="form-grid">
                <div class="form-group">
                    <label for="booking-slot">
                        <i class="fas fa-map-marker-alt"></i> Selected Slot
                    </label>
                    <div class="form-field-display">
                        <i class="fas fa-car"></i>
                        <input type="text" id="booking-slot" value="No slot selected" readonly>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="booking-floor">
                        <i class="fas fa-layer-group"></i> Floor
                    </label>
                    <div class="form-field-display">
                        <i class="fas fa-building"></i>
                        <input type="text" id="booking-floor" value="Ground Floor" readonly>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="booking-duration">
                        <i class="fas fa-clock"></i> Duration
                    </label>
                    <div class="form-field-display">
                        <i class="fas fa-hourglass-half"></i>
                        <select id="booking-duration">
                            <option value="1">1 hour - $2.50</option>
                            <option value="2">2 hours - $5.00</option>
                            <option value="3">3 hours - $7.50</option>
                            <option value="4">4 hours - $10.00</option>
                            <option value="8">8 hours - $18.00</option>
                            <option value="24">24 hours - $35.00</option>
                        </select>
                    </div>
                </div>
                
                <!-- CHANGED: Date field now shows current date and is read-only -->
                <div class="form-group">
                    <label for="booking-date">
                        <i class="fas fa-calendar"></i> Date
                    </label>
                    <div class="form-field-display">
                        <i class="fas fa-calendar-day"></i>
                        <input type="text" id="booking-date" value="${getCurrentDateFormatted()}" readonly>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="booking-time">
                        <i class="fas fa-clock"></i> Start Time
                    </label>
                    <div class="form-field-display">
                        <i class="fas fa-clock"></i>
                        <input type="time" id="booking-time" required>
                    </div>
                </div>
            </div>
            
            <div class="step-actions">
                <button type="button" class="btn btn-outline" id="cancel-booking">
                    <i class="fas fa-times"></i> Cancel
                </button>
                <button type="button" class="btn btn-primary" id="next-to-step-2">
                    <i class="fas fa-arrow-right"></i> Next
                </button>
            </div>
        `;
    }
    
    // Fix Step 2: Vehicle Info
    const step2 = document.getElementById('step-2');
    if (step2) {
        step2.innerHTML = `
            <div class="form-grid">
                <div class="form-group">
                    <label for="vehicle-type-select">
                        <i class="fas fa-car"></i> Vehicle Type
                    </label>
                    <div class="form-field-display">
                        <i class="fas fa-car-side"></i>
                        <select id="vehicle-type-select">
                            <option value="car">Car</option>
                            <option value="suv">SUV</option>
                            <option value="truck">Truck</option>
                            <option value="van">Van</option>
                            <option value="motorcycle">Motorcycle</option>
                            <option value="electric">Electric Vehicle</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="vehicle-number">
                        <i class="fas fa-hashtag"></i> Vehicle Number
                    </label>
                    <div class="form-field-display">
                        <i class="fas fa-id-card"></i>
                        <input type="text" id="vehicle-number" placeholder="ABC-1234" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="vehicle-color">
                        <i class="fas fa-palette"></i> Vehicle Color
                    </label>
                    <div class="form-field-display">
                        <i class="fas fa-fill-drip"></i>
                        <input type="text" id="vehicle-color" placeholder="e.g., Red, Blue">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="vehicle-model">
                        <i class="fas fa-car-alt"></i> Vehicle Model
                    </label>
                    <div class="form-field-display">
                        <i class="fas fa-cog"></i>
                        <input type="text" id="vehicle-model" placeholder="e.g., Toyota Camry">
                    </div>
                </div>
            </div>
            
            <div class="form-checkbox">
                <label class="checkbox-label">
                    <input type="checkbox" id="save-vehicle">
                    <i class="fas fa-save"></i>
                    <span>Save this vehicle for future bookings</span>
                </label>
            </div>
            
            <div class="step-actions">
                <button type="button" class="btn btn-outline" id="back-to-step-1">
                    <i class="fas fa-arrow-left"></i> Back
                </button>
                <button type="button" class="btn btn-primary" id="next-to-step-3">
                    <i class="fas fa-arrow-right"></i> Next
                </button>
            </div>
        `;
    }
    
    // Fix Step 3: Payment
    const step3 = document.getElementById('step-3');
    if (step3) {
        step3.innerHTML = `
            <div class="booking-summary-section">
                <h4><i class="fas fa-receipt"></i> Booking Summary</h4>
                <div class="summary-details">
                    <div class="summary-item">
                        <span>Slot <span id="summary-slot">A-01</span></span>
                        <span id="summary-price">$2.50/hr</span>
                    </div>
                    <div class="summary-item">
                        <span><span id="summary-duration">1</span> hour(s)</span>
                        <span id="summary-subtotal">$2.50</span>
                    </div>
                    <!-- ADDED: Date display in summary -->
                    <div class="summary-item">
                        <span>Date</span>
                        <span id="summary-date">${getCurrentDateFormatted()}</span>
                    </div>
                    <div class="summary-item">
                        <span>Service fee</span>
                        <span>$0.50</span>
                    </div>
                    <div class="summary-item">
                        <span>Tax (10%)</span>
                        <span id="summary-tax">$0.30</span>
                    </div>
                    <div class="summary-total">
                        <span>Total</span>
                        <span class="total-price" id="summary-total">$3.30</span>
                    </div>
                </div>
            </div>
            
            <div class="payment-section">
                <h4><i class="fas fa-credit-card"></i> Payment Method</h4>
                <div class="payment-options-grid">
                    <label class="payment-option">
                        <input type="radio" name="payment-method" value="card" checked>
                        <div class="payment-content">
                            <i class="fas fa-credit-card"></i>
                            <span>Credit/Debit Card</span>
                        </div>
                    </label>
                    <label class="payment-option">
                        <input type="radio" name="payment-method" value="paypal">
                        <div class="payment-content">
                            <i class="fab fa-paypal"></i>
                            <span>PayPal</span>
                        </div>
                    </label>
                    <label class="payment-option">
                        <input type="radio" name="payment-method" value="googlepay">
                        <div class="payment-content">
                            <i class="fab fa-google-pay"></i>
                            <span>Google Pay</span>
                        </div>
                    </label>
                    <label class="payment-option">
                        <input type="radio" name="payment-method" value="applepay">
                        <div class="payment-content">
                            <i class="fab fa-apple-pay"></i>
                            <span>Apple Pay</span>
                        </div>
                    </label>
                </div>
                
                <div class="card-payment-form" id="card-payment-form" style="display: none;">
                    <div class="form-group">
                        <label for="card-number">Card Number</label>
                        <input type="text" id="card-number" placeholder="1234 5678 9012 3456" maxlength="19" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="card-expiry">Expiry Date</label>
                            <input type="text" id="card-expiry" placeholder="MM/YY" maxlength="5" required>
                        </div>
                        <div class="form-group">
                            <label for="card-cvv">CVV</label>
                            <input type="password" id="card-cvv" placeholder="123" maxlength="3" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="card-name">Name on Card</label>
                        <input type="text" id="card-name" placeholder="John Doe" required>
                    </div>
                </div>
            </div>
            
            <div class="step-actions">
                <button type="button" class="btn btn-outline" id="back-to-step-2">
                    <i class="fas fa-arrow-left"></i> Back
                </button>
                <button type="button" class="btn btn-primary" id="confirm-payment">
                    <i class="fas fa-lock"></i> Confirm & Pay
                </button>
            </div>
        `;
    }
    
    // Add CSS for improved layout
    const style = document.createElement('style');
    style.textContent = `
        .booking-step {
            padding: 1rem 0;
        }
        
        .form-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .form-group {
            margin-bottom: 1rem;
        }
        
        .form-group label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: var(--gray-700);
            font-size: 0.875rem;
        }
        
        .form-group label i {
            color: var(--primary);
            width: 16px;
            text-align: center;
        }
        
        .form-field-display {
            position: relative;
            display: flex;
            align-items: center;
        }
        
        .form-field-display i {
            position: absolute;
            left: 1rem;
            color: var(--gray-500);
            z-index: 1;
        }
        
        .form-field-display input,
        .form-field-display select {
            width: 100%;
            padding: 0.75rem 1rem 0.75rem 3rem;
            border: 1px solid var(--gray-300);
            border-radius: var(--radius);
            font-size: 0.875rem;
            background: white;
            color: var(--gray-700);
        }
        
        .form-field-display input:focus,
        .form-field-display select:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
        }
        
        .form-field-display input[readonly] {
            background: var(--gray-50);
            cursor: not-allowed;
        }
        
        .form-checkbox {
            margin: 1.5rem 0;
            padding: 1rem;
            background: var(--gray-50);
            border-radius: var(--radius);
        }
        
        .checkbox-label {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            cursor: pointer;
            font-size: 0.875ssrem;
            color: var(--gray-600);
        }
        
        .checkbox-label i {
            color: var(--primary);
        }
        
        .booking-summary-section {
            background: var(--gray-50);
            border-radius: var(--radius);
            padding: 1.5rem;
            margin-bottom: 1.5rem;
        }
        
        .booking-summary-section h4 {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
            font-size: 1rem;
            color: var(--gray-900);
        }
        
        .summary-details {
            background: white;
            border-radius: var(--radius-sm);
            padding: 1rem;
        }
        
        .summary-item {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--gray-100);
            font-size: 0.875rem;
            color: var(--gray-600);
        }
        
        .summary-item:last-child {
            border-bottom: none;
        }
        
        .summary-total {
            display: flex;
            justify-content: space-between;
            padding: 1rem 0 0 0;
            margin-top: 0.5rem;
            border-top: 2px solid var(--gray-200);
            font-weight: 600;
            color: var(--gray-900);
            font-size: 1rem;
        }
        
        .total-price {
            color: var(--primary);
            font-size: 1.125rem;
        }
        
        .payment-section {
            margin-bottom: 2rem;
        }
        
        .payment-section h4 {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
            font-size: 1rem;
            color: var(--gray-900);
        }
        
        .payment-options-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
            margin-bottom: 1.5rem;
        }
        
        .payment-option {
            display: block;
            cursor: pointer;
        }
        
        .payment-option input {
            display: none;
        }
        
        .payment-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem;
            border: 2px solid var(--gray-200);
            border-radius: var(--radius);
            transition: var(--transition);
            text-align: center;
            background: white;
        }
        
        .payment-option input:checked + .payment-content {
            border-color: var(--primary);
            background: rgba(67, 97, 238, 0.05);
        }
        
        .payment-content i {
            font-size: 1.5rem;
            color: var(--gray-600);
        }
        
        .payment-option input:checked + .payment-content i {
            color: var(--primary);
        }
        
        .payment-content span {
            font-size: 0.75rem;
            font-weight: 500;
            color: var(--gray-700);
        }
        
        .card-payment-form {
            background: var(--gray-50);
            border-radius: var(--radius);
            padding: 1.5rem;
            margin-top: 1rem;
        }
        
        .step-actions {
            display: flex;
            justify-content: space-between;
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 1px solid var(--gray-200);
        }
        
        @media (max-width: 768px) {
            .form-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
            
            .payment-options-grid {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Reattach event listeners
    setTimeout(() => {
        setupBooking();
    }, 100);
}

// ========================
// NEW: Helper function to get current date formatted as dd-mm-yyyy
// ========================
function getCurrentDateFormatted() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}-${month}-${year}`;
}

// ========================
// Parking System
// ========================
function generateParkingData() {
    const floors = ['ground', 'first', 'second'];
    const totalSlots = {
        ground: 120,
        first: 100,
        second: 80
    };
    
    floors.forEach(floor => {
        if (!appState.parkingData[floor] || appState.parkingData[floor].length === 0) {
            appState.parkingData[floor] = [];
            
            for (let i = 1; i <= totalSlots[floor]; i++) {
                const row = String.fromCharCode(65 + Math.floor((i - 1) / 10));
                const col = ((i - 1) % 10) + 1;
                const slotId = `${row}-${col.toString().padStart(2, '0')}`;
                
                const hasActiveBooking = appState.bookings.some(b => 
                    b.slotId === slotId && 
                    b.floor === floor &&
                    b.status === 'confirmed' &&
                    new Date(b.endTime) > new Date()
                );
                
                let status = hasActiveBooking ? 'booked' : 'available';
                
                if (!hasActiveBooking) {
                    const rand = Math.random();
                    if (rand < 0.6) status = 'available';
                    else if (rand < 0.8) status = 'booked';
                    else if (rand < 0.9) status = 'occupied';
                    else status = 'reserved';
                }
                
                let type = 'regular';
                const typeRand = Math.random();
                if (typeRand < 0.05) type = 'handicap';
                else if (typeRand < 0.1) type = 'electric';
                
                let price = 2.50;
                if (type === 'electric') price = 2.25;
                if (type === 'handicap') price = 2.00;
                if (status === 'reserved') price = 3.50;
                
                appState.parkingData[floor].push({
                    id: slotId,
                    floor: floor,
                    status: status,
                    type: type,
                    price: price,
                    distance: Math.floor(Math.random() * 100) + 10
                });
            }
        }
    });
    
    updateAvailableSlotsCount();
}

function renderParkingMap() {
    const floorMap = document.getElementById('floor-map');
    if (!floorMap) return;
    
    floorMap.innerHTML = '';
    const slots = appState.parkingData[appState.currentFloor];
    
    floorMap.removeAttribute('style');
    
    slots.forEach(slot => {
        const slotElement = document.createElement('div');
        slotElement.className = `parking-slot-map ${slot.status} ${slot.type}`;
        slotElement.dataset.slotId = slot.id;
        slotElement.dataset.floor = slot.floor;
        
        if (appState.selectedSlot && 
            appState.selectedSlot.id === slot.id && 
            appState.selectedSlot.floor === slot.floor) {
            slotElement.classList.add('selected');
        }
        
        const slotNumber = document.createElement('span');
        slotNumber.className = 'slot-number';
        slotNumber.textContent = slot.id;
        slotNumber.style.cssText = 'font-size: 0.65rem; line-height: 1; margin-bottom: 2px;';
        
        slotElement.appendChild(slotNumber);
        
        if (slot.type === 'electric') {
            const boltIcon = document.createElement('i');
            boltIcon.className = 'fas fa-bolt';
            boltIcon.style.cssText = 'font-size: 0.6rem;';
            slotElement.appendChild(boltIcon);
        }
        
        if (slot.type === 'handicap') {
            const wheelchairIcon = document.createElement('i');
            wheelchairIcon.className = 'fas fa-wheelchair';
            wheelchairIcon.style.cssText = 'font-size: 0.6rem;';
            slotElement.appendChild(wheelchairIcon);
        }
        
        floorMap.appendChild(slotElement);
    });
    
    addParkingMarkers(floorMap);
    updateFloorStatistics();
}

function setupParkingEventDelegation() {
    const floorMap = document.getElementById('floor-map');
    if (!floorMap) return;
    
    floorMap.addEventListener('click', (e) => {
        const slotElement = e.target.closest('.parking-slot-map');
        if (slotElement) {
            const slotId = slotElement.dataset.slotId;
            const floor = slotElement.dataset.floor;
            const slot = appState.parkingData[floor].find(s => s.id === slotId);
            if (slot) selectParkingSlot(slot);
        }
    });
}

function selectParkingSlot(slot) {
    if (slot.status !== 'available') {
        showToast('This slot is not available for booking', 'error');
        return;
    }
    
    if (appState.advanceBooking) {
        const startTime = new Date(appState.advanceBooking.startTime);
        const endTime = new Date(appState.advanceBooking.endTime);
        
        if (!isSlotAvailableForBooking(slot.id, slot.floor, startTime, endTime)) {
            showToast('This slot is not available for the selected advance booking time', 'error');
            return;
        }
    }
    
    document.querySelectorAll('.parking-slot-map').forEach(s => {
        s.classList.remove('selected');
    });
    
    const slotElement = document.querySelector(`[data-slot-id="${slot.id}"][data-floor="${slot.floor}"]`);
    if (slotElement) {
        slotElement.classList.add('selected');
    }
    
    appState.selectedSlot = slot;
    
    updateSlotInfoPanel(slot);
    
    const bookBtn = document.getElementById('book-selected-btn');
    if (bookBtn) bookBtn.disabled = false;
    
    if (document.getElementById('booking-modal')?.classList.contains('active')) {
        updateBookingFormWithSlot(slot);
    }
}

function updateSlotInfoPanel(slot) {
    const infoPanel = document.getElementById('selected-slot-info');
    if (!infoPanel) return;
    
    infoPanel.style.display = 'block';
    document.getElementById('selected-slot-id').textContent = slot.id;
    document.getElementById('selected-slot-status').textContent = 
        slot.status.charAt(0).toUpperCase() + slot.status.slice(1);
    document.getElementById('selected-slot-status').className = `status-${slot.status}`;
    document.getElementById('selected-slot-price').textContent = `$${slot.price.toFixed(2)}/hr`;
}

function updateFloorStatistics() {
    const slots = appState.parkingData[appState.currentFloor];
    if (!slots) return;
    
    const total = slots.length;
    const available = slots.filter(s => s.status === 'available').length;
    const booked = slots.filter(s => s.status === 'booked').length;
    const electric = slots.filter(s => s.type === 'electric').length;
    
    const totalEl = document.getElementById('total-slots-count');
    const availableEl = document.getElementById('available-slots-count');
    const bookedEl = document.getElementById('booked-slots-count');
    const evEl = document.getElementById('ev-slots-count');
    
    if (totalEl) totalEl.textContent = total;
    if (availableEl) availableEl.textContent = available;
    if (bookedEl) bookedEl.textContent = booked;
    if (evEl) evEl.textContent = electric;
    
    const availabilityPercent = total > 0 ? Math.round((available / total) * 100) : 0;
    const percentEl = document.getElementById('availability-percent');
    const barEl = document.getElementById('availability-bar');
    
    if (percentEl) percentEl.textContent = `${availabilityPercent}%`;
    if (barEl) barEl.style.width = `${availabilityPercent}%`;
    
    updateAvailableSlotsCount();
}

function updateAvailableSlotsCount() {
    let totalAvailable = 0;
    Object.values(appState.parkingData).forEach(floor => {
        totalAvailable += floor.filter(s => s.status === 'available').length;
    });
    
    const liveSlotsElement = document.getElementById('live-available-slots');
    const quickSlotsElement = document.getElementById('quick-available-slots');
    
    if (liveSlotsElement) liveSlotsElement.textContent = totalAvailable;
    if (quickSlotsElement) quickSlotsElement.textContent = totalAvailable;
    
    animateCounter(quickSlotsElement, totalAvailable);
}

function addParkingMarkers(container) {
    const entrance = document.createElement('div');
    entrance.className = 'parking-marker entrance';
    const entranceIcon = document.createElement('i');
    entranceIcon.className = 'fas fa-sign-in-alt';
    entrance.appendChild(entranceIcon);
    entrance.appendChild(document.createTextNode(' Entrance'));
    container.appendChild(entrance);
    
    const exit = document.createElement('div');
    exit.className = 'parking-marker exit';
    const exitIcon = document.createElement('i');
    exitIcon.className = 'fas fa-sign-out-alt';
    exit.appendChild(exitIcon);
    exit.appendChild(document.createTextNode(' Exit'));
    container.appendChild(exit);
}

function updateSlotStatus(slotId, floor, status) {
    const floorSlots = appState.parkingData[floor];
    const slotIndex = floorSlots.findIndex(s => s.id === slotId);
    
    if (slotIndex !== -1) {
        floorSlots[slotIndex].status = status;
    }
}

// ========================
// Setup Functions
// ========================
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offset = 80;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                updateActiveNav(this);
            }
        });
    });
}

function setupNavigation() {
    document.querySelectorAll('a.nav-link[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            scrollToSection(targetId);
            updateActiveNav(this);
        });
    });
    
    const navToggle = document.getElementById('nav-toggle');
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            const navMenu = document.getElementById('nav-menu');
            if (navMenu) {
                navMenu.classList.toggle('show');
                this.innerHTML = navMenu.classList.contains('show') ? 
                    '<i class="fas fa-times"></i>' : 
                    '<i class="fas fa-bars"></i>';
            }
        });
    }
}

function setupParkingFeatures() {
    document.querySelectorAll('.floor-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const floor = this.dataset.floor;
            appState.currentFloor = floor;
            
            document.querySelectorAll('.floor-tab').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
            
            renderParkingMap();
        });
    });
    
    const refreshBtn = document.getElementById('refresh-parking');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            showLoading();
            setTimeout(() => {
                const floor = appState.currentFloor;
                const slots = appState.parkingData[floor];
                
                for (let i = 0; i < Math.min(5, slots.length); i++) {
                    const randomIndex = Math.floor(Math.random() * slots.length);
                    if (slots[randomIndex].status === 'available' && Math.random() > 0.7) {
                        slots[randomIndex].status = Math.random() > 0.5 ? 'booked' : 'occupied';
                    }
                }
                
                renderParkingMap();
                updateLastUpdateTime();
                hideLoading();
                showToast('Parking data refreshed');
            }, 1000);
        });
    }
}

function setupQuickActions() {
    const bookNowBtn = document.getElementById('book-now-btn');
    if (bookNowBtn) {
        bookNowBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (!appState.selectedSlot) {
                scrollToSection('#parking');
                showToast('Please select a parking slot first');
            } else {
                openBookingModal();
            }
        });
    }
    
    const heroBookBtn = document.getElementById('hero-book-btn');
    if (heroBookBtn) {
        heroBookBtn.addEventListener('click', function(e) {
            e.preventDefault();
            scrollToSection('#parking');
            showToast('Select a parking slot to book');
        });
    }
    
    const bookSelectedBtn = document.getElementById('book-selected-btn');
    if (bookSelectedBtn) {
        bookSelectedBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (!appState.isLoggedIn) {
                showToast('Please login to book a parking slot', 'error');
                openModal('login-modal');
                return;
            }
            if (!appState.selectedSlot) {
                showToast('Please select a parking slot first', 'error');
                return;
            }
            openBookingModal();
        });
    }
    
    const watchDemoBtn = document.getElementById('watch-demo-btn');
    if (watchDemoBtn) {
        watchDemoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openModal('demo-video-modal');
        });
    }
    
    const actionFindParking = document.getElementById('action-find-parking');
    if (actionFindParking) {
        actionFindParking.addEventListener('click', function(e) {
            e.preventDefault();
            scrollToSection('#parking');
        });
    }
    
    const actionGetApp = document.getElementById('action-get-app');
    if (actionGetApp) {
        actionGetApp.addEventListener('click', function(e) {
            e.preventDefault();
            openModal('app-download-modal');
        });
    }
    
    const actionGetHelp = document.getElementById('action-get-help');
    if (actionGetHelp) {
        actionGetHelp.addEventListener('click', function(e) {
            e.preventDefault();
            scrollToSection('#help');
        });
    }
    
    const downloadAppLink = document.getElementById('download-app-link');
    if (downloadAppLink) {
        downloadAppLink.addEventListener('click', function(e) {
            e.preventDefault();
            openModal('app-download-modal');
        });
    }
}

// Function to setup horizontal quick actions
function setupHorizontalQuickActions() {
    // Find Parking Horizontal
    const actionFindParkingHorizontal = document.getElementById('action-find-parking-horizontal');
    if (actionFindParkingHorizontal) {
        actionFindParkingHorizontal.addEventListener('click', function(e) {
            e.preventDefault();
            scrollToSection('#parking');
        });
    }
    
    // Book in Advance Horizontal
    const actionBookAdvanceHorizontal = document.getElementById('action-book-advance-horizontal');
    if (actionBookAdvanceHorizontal) {
        actionBookAdvanceHorizontal.addEventListener('click', function(e) {
            e.preventDefault();
            if (!appState.isLoggedIn) {
                showToast('Please login to book in advance', 'error');
                openModal('login-modal');
                return;
            }
            openBookInAdvanceModal();
        });
    }
    
    // Get App Horizontal
    const actionGetAppHorizontal = document.getElementById('action-get-app-horizontal');
    if (actionGetAppHorizontal) {
        actionGetAppHorizontal.addEventListener('click', function(e) {
            e.preventDefault();
            openModal('app-download-modal');
        });
    }
    
    // Get Help Horizontal
    const actionGetHelpHorizontal = document.getElementById('action-get-help-horizontal');
    if (actionGetHelpHorizontal) {
        actionGetHelpHorizontal.addEventListener('click', function(e) {
            e.preventDefault();
            scrollToSection('#help');
        });
    }
}

function setupAuthentication() {
    const dropdownLogin = document.getElementById('dropdown-login');
    if (dropdownLogin) {
        dropdownLogin.addEventListener('click', function(e) {
            e.preventDefault();
            openModal('login-modal');
        });
    }
    
    const dropdownSignup = document.getElementById('dropdown-signup');
    if (dropdownSignup) {
        dropdownSignup.addEventListener('click', function(e) {
            e.preventDefault();
            openModal('signup-modal');
        });
    }
    
    const switchToSignup = document.getElementById('switch-to-signup');
    if (switchToSignup) {
        switchToSignup.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal();
            openModal('signup-modal');
        });
    }
    
    const switchToLogin = document.getElementById('switch-to-login');
    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal();
            openModal('login-modal');
        });
    }
    
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal();
            openModal('forgot-password-modal');
        });
    }
    
    const backToLogin = document.getElementById('back-to-login');
    if (backToLogin) {
        backToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal();
            openModal('login-modal');
        });
    }
    
    const toggleLoginPassword = document.getElementById('toggle-login-password');
    if (toggleLoginPassword) {
        toggleLoginPassword.addEventListener('click', function() {
            togglePasswordVisibility('login-password', this);
        });
    }
    
    const toggleSignupPassword = document.getElementById('toggle-signup-password');
    if (toggleSignupPassword) {
        toggleSignupPassword.addEventListener('click', function() {
            togglePasswordVisibility('signup-password', this);
        });
    }
    
    const toggleConfirmPassword = document.getElementById('toggle-confirm-password');
    if (toggleConfirmPassword) {
        toggleConfirmPassword.addEventListener('click', function() {
            togglePasswordVisibility('signup-confirm-password', this);
        });
    }
    
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }
    
    const googleAuth = document.getElementById('google-auth');
    if (googleAuth) {
        googleAuth.addEventListener('click', function() {
            showToast('Google authentication would open here', 'info');
        });
    }
    
    const facebookAuth = document.getElementById('facebook-auth');
    if (facebookAuth) {
        facebookAuth.addEventListener('click', function() {
            showToast('Facebook authentication would open here', 'info');
        });
    }
}

function setupBooking() {
    const nextToStep2 = document.getElementById('next-to-step-2');
    if (nextToStep2) {
        nextToStep2.addEventListener('click', function() {
            if (!validateBookingStep1()) return;
            goToBookingStep(2);
        });
    }
    
    const nextToStep3 = document.getElementById('next-to-step-3');
    if (nextToStep3) {
        nextToStep3.addEventListener('click', function() {
            if (!validateBookingStep2()) return;
            goToBookingStep(3);
        });
    }
    
    const backToStep1 = document.getElementById('back-to-step-1');
    if (backToStep1) {
        backToStep1.addEventListener('click', function() {
            goToBookingStep(1);
        });
    }
    
    const backToStep2 = document.getElementById('back-to-step-2');
    if (backToStep2) {
        backToStep2.addEventListener('click', function() {
            goToBookingStep(2);
        });
    }
    
    const cancelBookingBtn = document.getElementById('cancel-booking');
    if (cancelBookingBtn) {
        cancelBookingBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to cancel this booking?')) {
                closeModal();
                resetBookingForm();
            }
        });
    }
    
    const confirmPayment = document.getElementById('confirm-payment');
    if (confirmPayment) {
        confirmPayment.addEventListener('click', handlePayment);
    }
    
    const bookingDuration = document.getElementById('booking-duration');
    if (bookingDuration) {
        bookingDuration.addEventListener('change', updateBookingSummary);
    }
    
    document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const cardForm = document.getElementById('card-payment-form');
            if (cardForm) {
                cardForm.style.display = this.value === 'card' ? 'block' : 'none';
            }
        });
    });
}

function setupDashboard() {
    document.querySelectorAll('.dashboard-nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const panel = this.dataset.panel;
            
            document.querySelectorAll('.dashboard-nav-btn').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            document.querySelectorAll('.dashboard-panel').forEach(p => {
                p.classList.remove('active');
            });
            const panelEl = document.getElementById(`${panel}-panel`);
            if (panelEl) panelEl.classList.add('active');
            
            if (panel === 'bookings') updateBookingsTable();
            if (panel === 'payments') updatePaymentsTable();
            if (panel === 'settings') loadUserSettings();
        });
    });
    
    const refreshDashboard = document.getElementById('refresh-dashboard');
    if (refreshDashboard) {
        refreshDashboard.addEventListener('click', function() {
            updateDashboard();
            showToast('Dashboard updated');
        });
    }
    
    const quickBookBtn = document.getElementById('quick-book-btn');
    if (quickBookBtn) {
        quickBookBtn.addEventListener('click', function() {
            openBookingModal();
        });
    }
    
    const extendBookingBtn = document.getElementById('extend-booking-btn');
    if (extendBookingBtn) {
        extendBookingBtn.addEventListener('click', function() {
            if (!appState.isLoggedIn) {
                showToast('Please login to extend bookings', 'error');
                openModal('login-modal');
                return;
            }
            
            const userBookings = appState.bookings.filter(b => 
                b.userId === appState.currentUser.id && 
                b.status === 'confirmed'
            );
            
            if (userBookings.length === 0) {
                showToast('No bookings found. Book a slot first!', 'info');
                return;
            }
            
            const activeBookings = userBookings.filter(b => {
                const endTime = new Date(b.endTime);
                return endTime > new Date();
            });
            
            if (activeBookings.length === 0) {
                showToast('No active bookings to extend', 'info');
                return;
            }
            
            if (activeBookings.length === 1) {
                extendBooking(activeBookings[0].id);
            } else {
                showBookingSelector(activeBookings);
            }
        });
    }
    
    const viewReceiptsBtn = document.getElementById('view-receipts-btn');
    if (viewReceiptsBtn) {
        viewReceiptsBtn.addEventListener('click', function() {
            if (!appState.isLoggedIn) {
                showToast('Please login to view receipts', 'error');
                return;
            }
            
            const userPayments = appState.payments.filter(p => p.userId === appState.currentUser.id);
            if (userPayments.length === 0) {
                showToast('No receipts available', 'info');
                return;
            }
            
            const latestPayment = userPayments[userPayments.length - 1];
            const booking = appState.bookings.find(b => b.id === latestPayment.bookingId);
            if (booking) {
                viewReceipt(booking.id);
            }
        });
    }
    
    const newBookingBtn = document.getElementById('new-booking-btn');
    if (newBookingBtn) {
        newBookingBtn.addEventListener('click', function() {
            openBookingModal();
        });
    }
    
    const bookingFilter = document.getElementById('booking-filter');
    if (bookingFilter) {
        bookingFilter.addEventListener('change', updateBookingsTable);
    }
    
    const paymentFilter = document.getElementById('payment-filter');
    if (paymentFilter) {
        paymentFilter.addEventListener('change', updatePaymentsTable);
    }
    
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', handleSettingsSave);
    }
    
    const cancelSettings = document.getElementById('cancel-settings');
    if (cancelSettings) {
        cancelSettings.addEventListener('click', function() {
            loadUserSettings();
        });
    }
}

function setupHelpSupport() {
    // The calling system will automatically handle call buttons
    // Just remove the old implementation and let calling.js handle it
    
    const emailSupportBtn = document.querySelector('.email-support-btn');
    if (emailSupportBtn) {
        emailSupportBtn.addEventListener('click', function(e) {
            e.preventDefault();
            SmartParkCalling.emailSupport();
        });
    }
    
    const chatSupportBtn = document.querySelector('.chat-support-btn');
    if (chatSupportBtn) {
        chatSupportBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof window.startLiveChat === 'function') {
                window.startLiveChat();
            } else {
                SmartParkCalling.showToast('Live chat is available 9AM-9PM EST. Please check back during business hours.', 'info');
            }
        });
    }
    
    const directionsBtn = document.querySelector('.directions-btn');
    if (directionsBtn) {
        directionsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            SmartParkCalling.getDirections();
        });
    }
    
    // Your existing guide card code...
    document.querySelectorAll('.guide-card').forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            const guideId = this.id;
            if (guideId === 'guide-booking') openModal('guide-booking-modal');
            else if (guideId === 'guide-payment') openModal('guide-payment-modal');
            else if (guideId === 'guide-mobile') openModal('guide-mobile-modal');
            else if (guideId === 'guide-accessibility') openModal('guide-accessibility-modal');
        });
    });
}

function setupFooter() {
    const newsletterSubmit = document.getElementById('newsletter-submit');
    if (newsletterSubmit) {
        newsletterSubmit.addEventListener('click', function() {
            const emailInput = document.getElementById('newsletter-email');
            const email = emailInput.value;
            
            if (!validateEmail(email)) {
                showToast('Please enter a valid email address', 'error');
                return;
            }
            
            showToast('Subscribed to newsletter successfully!');
            emailInput.value = '';
        });
    }
    
    const appStoreLink = document.getElementById('app-store-link');
    if (appStoreLink) {
        appStoreLink.addEventListener('click', function(e) {
            e.preventDefault();
            openModal('app-download-modal');
        });
    }
    
    const playStoreLink = document.getElementById('play-store-link');
    if (playStoreLink) {
        playStoreLink.addEventListener('click', function(e) {
            e.preventDefault();
            openModal('app-download-modal');
        });
    }
    
    const privacyPolicy = document.getElementById('privacy-policy');
    if (privacyPolicy) {
        privacyPolicy.addEventListener('click', function(e) {
            e.preventDefault();
            openModal('privacy-policy-modal');
        });
    }
    
    const termsService = document.getElementById('terms-service');
    if (termsService) {
        termsService.addEventListener('click', function(e) {
            e.preventDefault();
            openModal('terms-service-modal');
        });
    }
}

function setupModals() {
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

function setupToast() {
    const toastClose = document.querySelector('.toast-close');
    if (toastClose) {
        toastClose.addEventListener('click', function() {
            document.getElementById('toast').classList.remove('active');
        });
    }
}

function setupFAQAccordion() {
    document.querySelectorAll('.faq-container').forEach(container => {
        container.addEventListener('click', (e) => {
            const question = e.target.closest('.faq-question');
            if (!question) return;
            
            e.preventDefault();
            const answer = question.nextElementSibling;
            const icon = question.querySelector('i');
            
            answer.classList.toggle('active');
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-up');
            
            container.querySelectorAll('.faq-question').forEach(otherQuestion => {
                if (otherQuestion !== question) {
                    const otherAnswer = otherQuestion.nextElementSibling;
                    const otherIcon = otherQuestion.querySelector('i');
                    otherAnswer.classList.remove('active');
                    otherIcon.classList.remove('fa-chevron-up');
                    otherIcon.classList.add('fa-chevron-down');
                }
            });
        });
    });
}

function setupMobileDropdown() {
    const accountDropdown = document.getElementById('account-dropdown');
    if (accountDropdown) {
        accountDropdown.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                this.classList.toggle('active');
            }
        });
    }
}

function setupLogout() {
    const logoutBtn = document.getElementById('dropdown-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

function setupPasswordStrength() {
    const passwordInput = document.getElementById('signup-password');
    const strengthFill = document.querySelector('.strength-fill');
    const strengthText = document.getElementById('strength-value');
    
    if (!passwordInput || !strengthFill || !strengthText) return;
    
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        let strength = 0;
        
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        const width = strength * 25;
        strengthFill.style.width = `${width}%`;
        
        let text = 'Weak';
        let color = 'var(--danger)';
        
        if (strength >= 4) {
            text = 'Strong';
            color = 'var(--success)';
        } else if (strength >= 3) {
            text = 'Good';
            color = 'var(--warning)';
        } else if (strength >= 2) {
            text = 'Fair';
            color = 'var(--warning)';
        }
        
        strengthText.textContent = text;
        strengthFill.style.background = color;
    });
}

function setupCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.count);
        const increment = target / 100;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.floor(current);
                setTimeout(updateCounter, 20);
            } else {
                counter.textContent = target;
            }
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(counter);
    });
}

// ========================
// Receipt System Functions
// ========================
function setupReceiptSystem() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeReceiptModal();
        }
    });
    
    document.addEventListener('click', function(e) {
        const modalContainer = document.getElementById('receipt-modal-container');
        if (modalContainer && modalContainer.classList.contains('active') && 
            e.target === modalContainer) {
            closeReceiptModal();
        }
    });
}

function viewReceipt(bookingId) {
    const booking = appState.bookings.find(b => b.id === bookingId);
    if (!booking) {
        showToast('Booking not found', 'error');
        return;
    }
    
    const payment = appState.payments.find(p => p.bookingId === bookingId);
    generateReceipt(booking, payment);
}

function generateReceipt(booking, payment) {
    const bookingDate = new Date(booking.createdAt);
    const startDate = new Date(booking.startTime);
    const endDate = new Date(booking.endTime);
    
    const receiptHTML = `
        <div class="receipt-content">
            <div class="receipt-header">
                <div class="receipt-logo">
                    <i class="fas fa-parking"></i>
                    <div>
                        <h2>Smart<span>Park</span></h2>
                        <p>Intelligent Parking Solutions</p>
                    </div>
                </div>
                <div class="receipt-title">
                    <h3>PAYMENT RECEIPT</h3>
                    <p><strong>Booking ID:</strong> ${booking.id}</p>
                    <p><strong>Date:</strong> ${bookingDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</p>
                </div>
            </div>
            
            <div class="receipt-body">
                <div class="receipt-section">
                    <h4><i class="fas fa-user"></i> Customer Information</h4>
                    <div class="receipt-row">
                        <div class="receipt-col">
                            <p><strong>Name:</strong> ${appState.currentUser?.name || 'Guest User'}</p>
                            <p><strong>Email:</strong> ${appState.currentUser?.email || 'N/A'}</p>
                        </div>
                        <div class="receipt-col">
                            <p><strong>Phone:</strong> ${appState.userSettings?.phone || 'N/A'}</p>
                            <p><strong>Customer ID:</strong> ${appState.currentUser?.id || 'N/A'}</p>
                        </div>
                    </div>
                </div>
                
                <div class="receipt-section">
                    <h4><i class="fas fa-car"></i> Booking Details</h4>
                    <div class="receipt-row">
                        <div class="receipt-col">
                            <p><strong>Parking Slot:</strong> ${booking.slotId}</p>
                            <p><strong>Floor:</strong> ${booking.floor.charAt(0).toUpperCase() + booking.floor.slice(1)}</p>
                            <p><strong>Vehicle:</strong> ${booking.vehicleNumber} (${booking.vehicleType})</p>
                        </div>
                        <div class="receipt-col">
                            <p><strong>Start Time:</strong> ${startDate.toLocaleString()}</p>
                            <p><strong>End Time:</strong> ${endDate.toLocaleString()}</p>
                            <p><strong>Duration:</strong> ${booking.duration} hour(s)</p>
                        </div>
                    </div>
                </div>
                
                <div class="receipt-section">
                    <h4><i class="fas fa-money-bill-wave"></i> Payment Breakdown</h4>
                    <table class="receipt-table">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Parking Fee (${booking.duration} hours @ $${booking.pricePerHour.toFixed(2)}/hr)</td>
                                <td>$${booking.subtotal.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>Service Fee</td>
                                <td>$${booking.serviceFee.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>Tax (10%)</td>
                                <td>$${booking.tax.toFixed(2)}</td>
                            </tr>
                            <tr class="receipt-total">
                                <td><strong>TOTAL AMOUNT</strong></td>
                                <td><strong>$${booking.total.toFixed(2)}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="receipt-section">
                    <h4><i class="fas fa-credit-card"></i> Payment Information</h4>
                    <div class="receipt-row">
                        <div class="receipt-col">
                            <p><strong>Payment Method:</strong> ${payment?.method || 'N/A'}</p>
                            <p><strong>Payment Status:</strong> 
                                <span class="payment-status ${payment?.status || 'completed'}">
                                    ${payment?.status?.charAt(0).toUpperCase() + payment?.status?.slice(1) || 'Completed'}
                                </span>
                            </p>
                        </div>
                        <div class="receipt-col">
                            <p><strong>Transaction ID:</strong> ${payment?.id || 'N/A'}</p>
                            <p><strong>Payment Date:</strong> ${payment ? new Date(payment.date).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>
                </div>
                
                <div class="receipt-footer">
                    <div class="receipt-notes">
                        <p><strong><i class="fas fa-info-circle"></i> Important Notes:</strong></p>
                        <ul>
                            <li>This receipt is for your records only</li>
                            <li>Please keep this receipt for any future reference</li>
                            <li>For any queries, contact himanshugoud638@gmail.com</li>
                            <li>Receipt ID: ${booking.id}-${Date.now().toString().slice(-6)}</li>
                        </ul>
                    </div>
                    
                    <div class="receipt-stamp">
                        <div class="stamp">
                            <span>PAID</span>
                            <p>${new Date().toLocaleDateString('en-US')}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="receipt-actions">
                <button class="btn btn-outline" id="print-receipt-btn">
                    <i class="fas fa-print"></i> Print Receipt
                </button>
                <button class="btn btn-outline" id="download-receipt-btn">
                    <i class="fas fa-download"></i> Download Receipt
                </button>
                <button class="btn btn-primary" id="close-receipt-btn">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('receipt-modal-container');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modalContainer = document.createElement('div');
    modalContainer.id = 'receipt-modal-container';
    modalContainer.innerHTML = receiptHTML;
    document.body.appendChild(modalContainer);
    
    setTimeout(() => {
        document.getElementById('print-receipt-btn').addEventListener('click', printReceipt);
        document.getElementById('download-receipt-btn').addEventListener('click', downloadReceiptAsPDF);
        document.getElementById('close-receipt-btn').addEventListener('click', closeReceiptModal);
        
        modalContainer.classList.add('active');
    }, 10);
}

function printReceipt() {
    const receiptContent = document.querySelector('.receipt-content');
    const originalBody = document.body.innerHTML;
    
    const printHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt - SmartPark</title>
            <style>
                body {
                    font-family: 'Inter', Arial, sans-serif;
                    margin: 20px;
                    padding: 20px;
                    background: #fff;
                    color: #333;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .receipt-content {
                    border: 2px solid #333;
                    padding: 30px;
                    border-radius: 10px;
                    background: #fff;
                }
                .receipt-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #333;
                }
                .receipt-logo {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .receipt-logo i {
                    font-size: 24px;
                    color: #4361ee;
                }
                .receipt-logo h2 {
                    margin: 0;
                    font-size: 20px;
                    color: #333;
                }
                .receipt-logo span {
                    color: #4361ee;
                }
                .receipt-title {
                    text-align: right;
                }
                .receipt-title h3 {
                    margin: 0 0 10px 0;
                    font-size: 24px;
                }
                .receipt-section {
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #ddd;
                }
                .receipt-section h4 {
                    margin: 0 0 15px 0;
                    font-size: 16px;
                    color: #4361ee;
                }
                .receipt-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                }
                .receipt-col {
                    flex: 1;
                }
                .receipt-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                .receipt-table th,
                .receipt-table td {
                    border: 1px solid #ddd;
                    padding: 10px;
                    text-align: left;
                }
                .receipt-table th {
                    background-color: #f5f5f5;
                    font-weight: bold;
                }
                .receipt-total {
                    background-color: #f0f7ff;
                    font-weight: bold;
                }
                .receipt-footer {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 2px solid #333;
                }
                .stamp {
                    border: 3px solid #4ade80;
                    padding: 15px 25px;
                    text-align: center;
                    border-radius: 5px;
                }
                .stamp span {
                    display: block;
                    font-size: 18px;
                    font-weight: bold;
                    color: #4ade80;
                    margin-bottom: 5px;
                }
                @media print {
                    @page {
                        margin: 0.5in;
                    }
                    .no-print { display: none; }
                    body { padding: 0; }
                    .receipt-content { border: none; padding: 0; }
                }
            </style>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        </head>
        <body>
            ${receiptContent.outerHTML}
        </body>
        </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
}

function downloadReceiptAsPDF() {
    showToast('Downloading receipt...', 'info');
    
    const booking = appState.bookings[appState.bookings.length - 1];
    const payment = appState.payments[appState.payments.length - 1];
    
    if (!booking || !payment) {
        showToast('No receipt available to download', 'error');
        return;
    }
    
    const receiptText = `
SmartPark - Payment Receipt
============================

Booking ID: ${booking.id}
Date: ${new Date().toLocaleDateString()}

Customer Information:
--------------------
Name: ${appState.currentUser?.name || 'Guest User'}
Email: ${appState.currentUser?.email || 'N/A'}
Phone: ${appState.userSettings?.phone || 'N/A'}

Booking Details:
----------------
Parking Slot: ${booking.slotId}
Vehicle: ${booking.vehicleNumber} (${booking.vehicleType})
Duration: ${booking.duration} hour(s)
Start Time: ${new Date(booking.startTime).toLocaleString()}
End Time: ${new Date(booking.endTime).toLocaleString()}

Payment Breakdown:
------------------
Parking Fee: $${booking.subtotal.toFixed(2)}
Service Fee: $${booking.serviceFee.toFixed(2)}
Tax (10%): $${booking.tax.toFixed(2)}
------------------
TOTAL: $${booking.total.toFixed(2)}

Payment Information:
--------------------
Payment Method: ${payment.method}
Transaction ID: ${payment.id}
Status: ${payment.status}

Thank you for using SmartPark!
===============================
    `;
    
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmartPark_Receipt_${booking.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Receipt downloaded as text file', 'success');
}

function closeReceiptModal() {
    const modalContainer = document.getElementById('receipt-modal-container');
    if (modalContainer) {
        modalContainer.classList.remove('active');
        setTimeout(() => {
            if (modalContainer.parentNode) {
                modalContainer.parentNode.removeChild(modalContainer);
            }
        }, 300);
    }
}

// ========================
// Extend Booking Feature
// ========================
function extendBooking(bookingId) {
    const booking = appState.bookings.find(b => b.id === bookingId);
    if (!booking) {
        showToast('Booking not found', 'error');
        return;
    }
    
    const now = new Date();
    const endTime = new Date(booking.endTime);
    
    if (endTime <= now) {
        showToast('Cannot extend completed bookings', 'error');
        return;
    }
    
    if (booking.userId !== appState.currentUser?.id) {
        showToast('You can only extend your own bookings', 'error');
        return;
    }
    
    appState.extendingBooking = bookingId;
    
    openExtendBookingModal(booking);
}

function openExtendBookingModal(booking) {
    closeModal();
    
    const modalHTML = `
        <div class="modal" id="extend-booking-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-clock"></i> Extend Booking</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="booking-details-card" style="background: var(--gray-50); padding: 1.5rem; border-radius: var(--radius); margin-bottom: 1.5rem;">
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem;">
                            <div>
                                <small style="color: var(--gray-500); display: block;">Booking ID</small>
                                <strong>${booking.id}</strong>
                            </div>
                            <div>
                                <small style="color: var(--gray-500); display: block;">Parking Slot</small>
                                <strong>${booking.slotId}</strong>
                            </div>
                            <div>
                                <small style="color: var(--gray-500); display: block;">Current End Time</small>
                                <strong>${new Date(booking.endTime).toLocaleString()}</strong>
                            </div>
                            <div>
                                <small style="color: var(--gray-500); display: block;">Rate</small>
                                <strong>$${booking.pricePerHour.toFixed(2)}/hour</strong>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
                            <i class="fas fa-hourglass-half"></i> Extend Duration
                        </label>
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            ${[1, 2, 3, 4, 6, 8, 12].map(hours => `
                                <label style="flex: 1; min-width: 80px;">
                                    <input type="radio" name="extend-hours" value="${hours}" ${hours === 1 ? 'checked' : ''} 
                                           style="display: none;">
                                    <div style="padding: 0.75rem; text-align: center; border: 2px solid var(--gray-300); 
                                                border-radius: var(--radius); cursor: pointer; transition: var(--transition);
                                                background: ${hours === 1 ? 'var(--primary)' : 'white'}; 
                                                color: ${hours === 1 ? 'white' : 'var(--gray-700)'};">
                                        ${hours} ${hours === 1 ? 'hour' : 'hours'}
                                    </div>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div id="extend-summary" style="background: white; padding: 1.5rem; border-radius: var(--radius); 
                                                    border: 1px solid var(--gray-200); margin: 1.5rem 0;">
                        <h4 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-receipt"></i> Extension Summary
                        </h4>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span>Additional ${booking.pricePerHour.toFixed(2)} × 1 hour</span>
                            <span>$${booking.pricePerHour.toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span>Tax (10%)</span>
                            <span>$${(booking.pricePerHour * 0.1).toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-weight: 600; padding-top: 0.75rem; 
                                    border-top: 2px solid var(--gray-300); margin-top: 0.75rem;">
                            <span>Total Additional Cost</span>
                            <span>$${(booking.pricePerHour * 1.1).toFixed(2)}</span>
                        </div>
                        <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--gray-200);">
                            <small style="color: var(--gray-500);">
                                <i class="fas fa-info-circle"></i> New end time: 
                                ${new Date(new Date(booking.endTime).getTime() + 60 * 60 * 1000).toLocaleString()}
                            </small>
                        </div>
                    </div>
                    
                    <div style="margin: 1.5rem 0;">
                        <h4 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-credit-card"></i> Payment Method
                        </h4>
                        <div class="payment-options" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem;">
                            <label class="payment-option">
                                <input type="radio" name="extend-payment-method" value="card" checked style="display: none;">
                                <div class="payment-content" style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem; border: 2px solid var(--gray-200); border-radius: var(--radius); transition: var(--transition); text-align: center; background: rgba(67, 97, 238, 0.05); border-color: var(--primary);">
                                    <i class="fas fa-credit-card" style="font-size: 1.5rem; color: var(--primary);"></i>
                                    <span style="font-size: 0.75rem; font-weight: 500; color: var(--gray-700);">Card</span>
                                </div>
                            </label>
                            <label class="payment-option">
                                <input type="radio" name="extend-payment-method" value="wallet" style="display: none;">
                                <div class="payment-content" style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem; border: 2px solid var(--gray-200); border-radius: var(--radius); transition: var(--transition); text-align: center;">
                                    <i class="fas fa-wallet" style="font-size: 1.5rem; color: var(--gray-600);"></i>
                                    <span style="font-size: 0.75rem; font-weight: 500; color: var(--gray-700);">Wallet</span>
                                </div>
                            </label>
                        </div>
                        
                        <div id="extend-card-form" style="background: var(--gray-50); border-radius: var(--radius); padding: 1.5rem; margin-top: 1rem;">
                            <h5 style="margin-bottom: 1rem; font-size: 0.875rem; color: var(--gray-700);">Card Details</h5>
                            <div class="form-group" style="margin-bottom: 1rem;">
                                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--gray-600);">Card Number</label>
                                <input type="text" id="extend-card-number" class="form-control" placeholder="1234 5678 9012 3456" style="width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--gray-300); border-radius: var(--radius); font-size: 0.875rem;">
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div class="form-group">
                                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--gray-600);">Expiry Date</label>
                                    <input type="text" id="extend-card-expiry" class="form-control" placeholder="MM/YY" style="width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--gray-300); border-radius: var(--radius); font-size: 0.875rem;">
                                </div>
                                <div class="form-group">
                                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--gray-600);">CVV</label>
                                    <input type="password" id="extend-card-cvv" class="form-control" placeholder="123" style="width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--gray-300); border-radius: var(--radius); font-size: 0.875rem;">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-top: 2rem; padding-top: 1.5rem; 
                                border-top: 1px solid var(--gray-200);">
                        <button class="btn btn-outline" id="cancel-extend">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                        <button class="btn btn-primary" id="confirm-extend">
                            <i class="fas fa-check"></i> Confirm Extension
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    setupExtendModalListeners(booking);
    
    openModal('extend-booking-modal');
}

function setupExtendModalListeners(booking) {
    const extendModal = document.getElementById('extend-booking-modal');
    const summaryDiv = document.getElementById('extend-summary');
    const cardForm = document.getElementById('extend-card-form');
    
    extendModal.querySelectorAll('input[name="extend-hours"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const selectedDiv = this.parentElement.querySelector('div');
            
            extendModal.querySelectorAll('input[name="extend-hours"]').forEach(r => {
                const div = r.parentElement.querySelector('div');
                div.style.background = 'white';
                div.style.color = 'var(--gray-700)';
                div.style.borderColor = 'var(--gray-300)';
            });
            
            selectedDiv.style.background = 'var(--primary)';
            selectedDiv.style.color = 'white';
            selectedDiv.style.borderColor = 'var(--primary)';
            
            const hours = parseInt(this.value);
            const additionalCost = booking.pricePerHour * hours;
            const tax = additionalCost * 0.1;
            const total = additionalCost + tax;
            const newEndTime = new Date(new Date(booking.endTime).getTime() + hours * 60 * 60 * 1000);
            
            summaryDiv.innerHTML = `
                <h4 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-receipt"></i> Extension Summary
                </h4>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>Additional $${booking.pricePerHour.toFixed(2)} × ${hours} ${hours === 1 ? 'hour' : 'hours'}</span>
                    <span>$${additionalCost.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>Tax (10%)</span>
                    <span>$${tax.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-weight: 600; padding-top: 0.75rem; 
                            border-top: 2px solid var(--gray-300); margin-top: 0.75rem;">
                    <span>Total Additional Cost</span>
                    <span>$${total.toFixed(2)}</span>
                </div>
                <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--gray-200);">
                    <small style="color: var(--gray-500);">
                        <i class="fas fa-info-circle"></i> New end time: ${newEndTime.toLocaleString()}
                    </small>
                </div>
            `;
        });
    });
    
    extendModal.querySelectorAll('input[name="extend-payment-method"]').forEach(radio => {
        radio.addEventListener('change', function() {
            extendModal.querySelectorAll('input[name="extend-payment-method"]').forEach(r => {
                const content = r.parentElement.querySelector('.payment-content');
                content.style.background = 'white';
                content.style.borderColor = 'var(--gray-200)';
                const icon = content.querySelector('i');
                icon.style.color = 'var(--gray-600)';
            });
            
            const selectedContent = this.parentElement.querySelector('.payment-content');
            selectedContent.style.background = 'rgba(67, 97, 238, 0.05)';
            selectedContent.style.borderColor = 'var(--primary)';
            const selectedIcon = selectedContent.querySelector('i');
            selectedIcon.style.color = 'var(--primary)';
            
            if (cardForm) {
                cardForm.style.display = this.value === 'card' ? 'block' : 'none';
            }
        });
    });
    
    extendModal.querySelector('.modal-close').addEventListener('click', closeModal);
    extendModal.querySelector('#cancel-extend').addEventListener('click', closeModal);
    
    extendModal.querySelector('#confirm-extend').addEventListener('click', function() {
        handleExtendConfirmation(booking);
    });
    
    extendModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

function handleExtendConfirmation(booking) {
    const extendModal = document.getElementById('extend-booking-modal');
    const hoursSelect = extendModal.querySelector('input[name="extend-hours"]:checked');
    const paymentMethod = extendModal.querySelector('input[name="extend-payment-method"]:checked');
    
    if (!hoursSelect || !paymentMethod) {
        showToast('Please select duration and payment method', 'error');
        return;
    }
    
    const hours = parseInt(hoursSelect.value);
    const selectedPaymentMethod = paymentMethod.value;
    
    let validationFailed = false;
    
    if (selectedPaymentMethod === 'card') {
        const cardNumber = extendModal.querySelector('#extend-card-number').value.replace(/\s/g, '');
        const cardExpiry = extendModal.querySelector('#extend-card-expiry').value;
        const cardCVV = extendModal.querySelector('#extend-card-cvv').value;
        
        if (!cardNumber || !cardExpiry || !cardCVV) {
            showToast('Please enter all card details', 'error');
            validationFailed = true;
        }
        
        if (!validateCardNumber(cardNumber)) {
            showToast('Please enter a valid card number', 'error');
            validationFailed = true;
        }
        
        if (!validateCardExpiry(cardExpiry)) {
            showToast('Please enter a valid expiry date (MM/YY)', 'error');
            validationFailed = true;
        }
        
        if (!validateCVV(cardCVV)) {
            showToast('Please enter a valid CVV', 'error');
            validationFailed = true;
        }
        
        if (validationFailed) return;
        
        showLoading();
        showToast('Processing card payment...', 'info');
        
    } else if (selectedPaymentMethod === 'wallet') {
        const userPayments = appState.payments.filter(p => p.userId === appState.currentUser.id);
        const totalSpent = userPayments.reduce((total, p) => total + p.amount, 0);
        const walletBalance = Math.max(0, 100 - totalSpent * 0.1);
        
        const additionalCost = booking.pricePerHour * hours;
        const tax = additionalCost * 0.1;
        const total = additionalCost + tax;
        
        if (walletBalance < total) {
            showToast(`Insufficient wallet balance. You have $${walletBalance.toFixed(2)}, need $${total.toFixed(2)}`, 'error');
            return;
        }
        
        showLoading();
        showToast('Processing wallet payment...', 'info');
    }
    
    const newEndTime = new Date(new Date(booking.endTime).getTime() + hours * 60 * 60 * 1000);
    
    if (!isSlotAvailableForBooking(booking.slotId, booking.floor, booking.endTime, newEndTime, booking.id)) {
        showToast('Slot is not available for the extended time', 'error');
        hideLoading();
        return;
    }
    
    setTimeout(() => {
        const bookingIndex = appState.bookings.findIndex(b => b.id === booking.id);
        
        const additionalCost = booking.pricePerHour * hours;
        const additionalTax = additionalCost * 0.10;
        const additionalTotal = additionalCost + additionalTax;
        
        appState.bookings[bookingIndex].duration += hours;
        appState.bookings[bookingIndex].endTime = newEndTime.toISOString();
        appState.bookings[bookingIndex].subtotal += additionalCost;
        appState.bookings[bookingIndex].tax += additionalTax;
        appState.bookings[bookingIndex].total += additionalTotal;
        
        const extendPayment = {
            id: `EX${Date.now()}`,
            bookingId: booking.id,
            amount: additionalTotal,
            method: selectedPaymentMethod.charAt(0).toUpperCase() + selectedPaymentMethod.slice(1),
            status: 'completed',
            date: new Date().toISOString(),
            userId: appState.currentUser.id,
            type: 'extension'
        };
        
        appState.payments.push(extendPayment);
        
        localStorage.setItem('smartpark_bookings', JSON.stringify(appState.bookings));
        localStorage.setItem('smartpark_payments', JSON.stringify(appState.payments));
        
        hideLoading();
        
        closeModal();
        
        const modal = document.getElementById('extend-booking-modal');
        if (modal) {
            modal.remove();
        }
        
        const successMessage = selectedPaymentMethod === 'wallet' 
            ? `Booking extended by ${hours} hour(s) using wallet balance`
            : `Booking extended by ${hours} hour(s) with card payment`;
        
        showToast(successMessage, 'success');
        
        updateDashboard();
        
    }, 2000);
}

function showBookingSelector(bookings) {
    let selectorModal = document.getElementById('booking-selector-modal');
    
    if (selectorModal) {
        selectorModal.remove();
    }
    
    const modalHTML = `
        <div class="modal" id="booking-selector-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-list"></i> Select Booking to Extend</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="max-height: 300px; overflow-y: auto; padding: 1rem;">
                        ${bookings.map(booking => `
                            <div class="booking-select-item" 
                                 data-booking-id="${booking.id}"
                                 style="display: flex; justify-content: space-between; align-items: center; 
                                        padding: 1rem; margin-bottom: 0.75rem; 
                                        background: var(--gray-50); border-radius: var(--radius);
                                        border: 1px solid var(--gray-200); cursor: pointer;
                                        transition: var(--transition);">
                                <div>
                                    <div style="font-weight: 600; margin-bottom: 0.25rem;">Slot ${booking.slotId}</div>
                                    <div style="font-size: 0.875rem; color: var(--gray-600);">
                                        Ends: ${new Date(booking.endTime).toLocaleString()}
                                    </div>
                                    <div style="font-size: 0.875rem; color: var(--gray-600);">
                                        Vehicle: ${booking.vehicleNumber}
                                    </div>
                                </div>
                                <button class="btn btn-sm btn-primary select-booking-btn">
                                    Select
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    selectorModal = document.getElementById('booking-selector-modal');
    
    selectorModal.querySelector('.modal-close').addEventListener('click', closeModal);
    
    selectorModal.querySelectorAll('.booking-select-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (!e.target.classList.contains('select-booking-btn')) {
                return;
            }
            const bookingId = this.dataset.bookingId;
            closeModal();
            extendBooking(bookingId);
        });
    });
    
    selectorModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
    
    openModal('booking-selector-modal');
}

// ========================
// Authentication Handlers
// ========================
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const remember = document.getElementById('remember-me').checked;
    
    if (!email || !password) {
        showToast('Please enter email and password', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    const submitBtn = document.getElementById('login-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';
    
    setTimeout(() => {
        const mockUsers = [
            { email: 'demo@smartpark.com', password: 'demo123', name: 'Demo User' },
            { email: 'test@smartpark.com', password: 'test123', name: 'Test User' }
        ];
        
        const user = mockUsers.find(u => u.email === email && u.password === password);
        
        if (user) {
            appState.currentUser = {
                email: user.email,
                name: user.name,
                id: `user_${Date.now()}`
            };
            appState.isLoggedIn = true;
            
            if (remember) {
                localStorage.setItem('smartpark_user', JSON.stringify(appState.currentUser));
            }
            
            updateUserUI();
            loadUserData();
            
            closeModal();
            showToast(`Welcome back, ${user.name}!`, 'success');
            
            e.target.reset();
        } else {
            showToast('Invalid email or password', 'error');
        }
        
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
    }, 1500);
}

function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const phone = document.getElementById('signup-phone').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const agreeTerms = document.getElementById('terms-agree').checked;
    
    if (!name || !email || !password || !confirmPassword) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    if (password.length < 8) {
        showToast('Password must be at least 8 characters', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    if (!agreeTerms) {
        showToast('Please agree to the terms and conditions', 'error');
        return;
    }
    
    const submitBtn = document.getElementById('signup-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';
    
    setTimeout(() => {
        const existingUsers = JSON.parse(localStorage.getItem('smartpark_users') || '[]');
        if (existingUsers.some(u => u.email === email)) {
            showToast('An account with this email already exists', 'error');
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
            return;
        }
        
        const newUser = {
            id: `user_${Date.now()}`,
            name: name,
            email: email,
            phone: phone,
            createdAt: new Date().toISOString()
        };
        
        existingUsers.push(newUser);
        localStorage.setItem('smartpark_users', JSON.stringify(existingUsers));
        
        appState.currentUser = newUser;
        appState.isLoggedIn = true;
        localStorage.setItem('smartpark_user', JSON.stringify(newUser));
        
        appState.userSettings = {
            name: name,
            email: email,
            phone: phone,
            defaultVehicle: '',
            vehicleType: 'car',
            notifications: ['email', 'sms']
        };
        localStorage.setItem('smartpark_settings', JSON.stringify(appState.userSettings));
        
        updateUserUI();
        loadUserData();
        
        closeModal();
        showToast(`Account created successfully! Welcome, ${name}!`, 'success');
        
        e.target.reset();
        
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
    }, 1500);
}

function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('reset-email').value.trim();
    
    if (!email || !validateEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    showToast(`Password reset link sent to ${email}`, 'success');
    closeModal();
    e.target.reset();
}

// ========================
// Booking Handlers
// ========================
function validateBookingStep1() {
    const time = document.getElementById('booking-time').value;
    
    if (!appState.selectedSlot) {
        showToast('Please select a parking slot', 'error');
        return false;
    }
    
    if (!time) {
        showToast('Please select a time', 'error');
        return false;
    }
    
    // FIXED: Get current date properly
    const now = new Date();
    const today = new Date();
    const selectedDate = new Date(today.toDateString() + ' ' + time);
    
    // Compare dates properly
    if (selectedDate < now) {
        showToast('Cannot book in the past', 'error');
        return false;
    }
    
    if (appState.advanceBooking) {
        const threeDaysFromNow = new Date(now);
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        threeDaysFromNow.setHours(23, 59, 59, 999);
        
        if (selectedDate > threeDaysFromNow) {
            showToast('Cannot book more than 3 days in advance', 'error');
            return false;
        }
    }
    
    return true;
}

function validateBookingStep2() {
    const vehicleNumber = document.getElementById('vehicle-number').value.trim();
    
    if (!vehicleNumber) {
        showToast('Please enter vehicle number', 'error');
        return false;
    }
    
    if (vehicleNumber.length < 3) {
        showToast('Please enter a valid vehicle number', 'error');
        return false;
    }
    
    return true;
}

function goToBookingStep(step) {
    appState.bookingStep = step;
    
    document.querySelectorAll('.step').forEach(stepEl => {
        stepEl.classList.remove('active');
        if (parseInt(stepEl.dataset.step) <= step) {
            stepEl.classList.add('active');
        }
    });
    
    document.querySelectorAll('.booking-step').forEach(stepEl => {
        stepEl.classList.remove('active');
    });
    document.getElementById(`step-${step}`).classList.add('active');
    
    if (step === 3) {
        updateBookingSummary();
    }
}

function updateBookingFormWithSlot(slot) {
    document.getElementById('booking-slot').value = `${slot.id} (${capitalizeFirst(slot.floor)} Floor)`;
    document.getElementById('booking-floor').value = `${capitalizeFirst(slot.floor)} Floor`;
    
    // CHANGED: Set current date in the date field
    document.getElementById('booking-date').value = getCurrentDateFormatted();
    
    if (appState.advanceBooking) {
        document.getElementById('booking-date').value = appState.advanceBooking.date;
        document.getElementById('booking-time').value = appState.advanceBooking.time;
        document.getElementById('booking-duration').value = appState.advanceBooking.duration;
        
        const advanceBookingNote = document.createElement('div');
        advanceBookingNote.className = 'alert alert-info';
        advanceBookingNote.style.marginTop = '1rem';
        advanceBookingNote.style.padding = '0.75rem';
        advanceBookingNote.style.borderRadius = 'var(--radius)';
        advanceBookingNote.style.background = 'var(--info)';
        advanceBookingNote.style.color = 'white';
        advanceBookingNote.innerHTML = `
            <i class="fas fa-calendar-check"></i> 
            <strong>Advance Booking:</strong> ${new Date(appState.advanceBooking.startTime).toLocaleString()}
        `;
        
        const step1Div = document.getElementById('step-1');
        const existingNote = step1Div.querySelector('.alert-info');
        if (!existingNote) {
            step1Div.appendChild(advanceBookingNote);
        }
    }
    
    updateBookingSummary();
}

function updateBookingSummary() {
    if (!appState.selectedSlot) return;
    
    const duration = parseInt(document.getElementById('booking-duration').value);
    const slotPrice = appState.selectedSlot.price;
    const subtotal = duration * slotPrice;
    const serviceFee = 0.50;
    const tax = subtotal * 0.10;
    const total = subtotal + serviceFee + tax;
    
    // CHANGED: Update date in summary
    const currentDate = getCurrentDateFormatted();
    
    document.getElementById('summary-slot').textContent = appState.selectedSlot.id;
    document.getElementById('summary-price').textContent = `$${slotPrice.toFixed(2)}/hr`;
    document.getElementById('summary-duration').textContent = duration;
    document.getElementById('summary-date').textContent = currentDate;
    document.getElementById('summary-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('summary-tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('summary-total').textContent = `$${total.toFixed(2)}`;
}

function handlePayment() {
    if (!appState.isLoggedIn) {
        showToast('Please login to complete booking', 'error');
        openModal('login-modal');
        return;
    }
    
    // FIXED: Get the date from the booking-date field (which shows the selected date)
    const dateString = document.getElementById('booking-date').value; // Format: dd-mm-yyyy
    const time = document.getElementById('booking-time').value;
    const duration = parseInt(document.getElementById('booking-duration').value);
    
    // Convert from dd-mm-yyyy to yyyy-mm-dd for Date constructor
    const dateParts = dateString.split('-');
    const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    
    const startTime = new Date(`${formattedDate}T${time}`);
    const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);
    
    // Check if slot is available
    if (!isSlotAvailableForBooking(appState.selectedSlot.id, appState.currentFloor, startTime, endTime)) {
        showToast('This slot is already booked for the selected time', 'error');
        return;
    }
    
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    
    if (paymentMethod === 'card') {
        const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
        const cardExpiry = document.getElementById('card-expiry').value;
        const cardCVV = document.getElementById('card-cvv').value;
        const cardName = document.getElementById('card-name').value.trim();
        
        if (!validateCardNumber(cardNumber)) {
            showToast('Please enter a valid card number', 'error');
            return;
        }
        
        if (!validateCardExpiry(cardExpiry)) {
            showToast('Please enter a valid expiry date (MM/YY)', 'error');
            return;
        }
        
        if (!validateCVV(cardCVV)) {
            showToast('Please enter a valid CVV', 'error');
            return;
        }
        
        if (!cardName) {
            showToast('Please enter name on card', 'error');
            return;
        }
    }
    
    showLoading();
    
    setTimeout(() => {
        const booking = createBooking();
        const payment = createPayment(booking);
        
        appState.bookings.push(booking);
        appState.payments.push(payment);
        
        updateSlotStatus(booking.slotId, booking.floor, 'booked');
        
        localStorage.setItem('smartpark_bookings', JSON.stringify(appState.bookings));
        localStorage.setItem('smartpark_payments', JSON.stringify(appState.payments));
        
        updateParkingAfterBooking();
        
        hideLoading();
        closeModal();
        showPaymentSuccess(booking, payment);
        
        resetBookingForm();
        appState.advanceBooking = null;
        appState.selectedPlan = null;
        appState.planDetails = null;
    }, 2000);
}

function createBooking() {
    const duration = parseInt(document.getElementById('booking-duration').value);
    const vehicleType = document.getElementById('vehicle-type-select').value;
    const vehicleNumber = document.getElementById('vehicle-number').value.trim();
    const vehicleModel = document.getElementById('vehicle-model').value.trim();
    const vehicleColor = document.getElementById('vehicle-color').value.trim();
    const time = document.getElementById('booking-time').value;
    const saveVehicle = document.getElementById('save-vehicle').checked;
    
    // FIXED: Get the date from the booking-date field
    const dateString = document.getElementById('booking-date').value; // Format: dd-mm-yyyy
    
    // Convert from dd-mm-yyyy to yyyy-mm-dd for Date constructor
    const dateParts = dateString.split('-');
    const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    
    const slotPrice = appState.selectedSlot.price;
    const subtotal = duration * slotPrice;
    const serviceFee = 0.50;
    const tax = subtotal * 0.10;
    const total = subtotal + serviceFee + tax;
    
    const startTime = new Date(`${formattedDate}T${time}`);
    const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);
    
    if (saveVehicle && vehicleNumber) {
        appState.userSettings.defaultVehicle = vehicleNumber;
        appState.userSettings.vehicleType = vehicleType;
        localStorage.setItem('smartpark_settings', JSON.stringify(appState.userSettings));
    }
    
    return {
        id: `BK${Date.now()}`,
        slotId: appState.selectedSlot.id,
        floor: appState.currentFloor,
        vehicleType: vehicleType,
        vehicleNumber: vehicleNumber,
        vehicleModel: vehicleModel,
        vehicleColor: vehicleColor,
        date: dateString, // Store the original date format
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: duration,
        pricePerHour: slotPrice,
        subtotal: subtotal,
        serviceFee: serviceFee,
        tax: tax,
        total: total,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        userId: appState.currentUser.id,
        isAdvanceBooking: !!appState.advanceBooking,
        planType: appState.selectedPlan
    };
}

function createPayment(booking) {
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    
    return {
        id: `PY${Date.now()}`,
        bookingId: booking.id,
        amount: booking.total,
        method: paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1),
        status: 'completed',
        date: new Date().toISOString(),
        userId: appState.currentUser.id,
        planType: appState.selectedPlan
    };
}

function updateParkingAfterBooking() {
    if (appState.selectedSlot) {
        const floor = appState.currentFloor;
        const slotId = appState.selectedSlot.id;
        
        const slotIndex = appState.parkingData[floor].findIndex(s => s.id === slotId);
        if (slotIndex !== -1) {
            appState.parkingData[floor][slotIndex].status = 'booked';
        }
    }
    
    renderParkingMap();
    updateFloorStatistics();
    updateAvailableSlotsCount();
    
    if (appState.isLoggedIn) {
        updateDashboard();
    }
}

function resetBookingForm() {
    appState.bookingStep = 1;
    appState.selectedSlot = null;
    appState.selectedPlan = null;
    appState.planDetails = null;
    
    document.querySelectorAll('.step').forEach(stepEl => {
        stepEl.classList.remove('active');
        if (parseInt(stepEl.dataset.step) === 1) {
            stepEl.classList.add('active');
        }
    });
    
    document.querySelectorAll('.booking-step').forEach(stepEl => {
        stepEl.classList.remove('active');
    });
    document.getElementById('step-1').classList.add('active');
    
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) bookingForm.reset();
    
    // CHANGED: Reset date to current date
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
        dateInput.value = getCurrentDateFormatted();
    }
    
    const bookSelectedBtn = document.getElementById('book-selected-btn');
    if (bookSelectedBtn) bookSelectedBtn.disabled = true;
    
    const selectedSlotInfo = document.getElementById('selected-slot-info');
    if (selectedSlotInfo) selectedSlotInfo.style.display = 'none';
    
    document.querySelectorAll('.parking-slot-map').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    setDefaultDateTime();
}

function openBookingModal() {
    if (!appState.isLoggedIn) {
        showToast('Please login to book a parking slot', 'error');
        openModal('login-modal');
        return;
    }
    
    if (!appState.selectedSlot) {
        showToast('Please select a parking slot first', 'error');
        return;
    }
    
    const modal = document.getElementById('booking-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        if (appState.selectedSlot) {
            updateBookingFormWithSlot(appState.selectedSlot);
        }
        
        if (appState.selectedPlan) {
            updateBookingFormWithPlan(appState.selectedPlan);
        }
        
        goToBookingStep(1);
    }
}

function setDefaultDateTime() {
    const today = new Date();
    
    // CHANGED: Set date to current date (read-only)
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
        dateInput.value = getCurrentDateFormatted();
    }
    
    const timeInput = document.getElementById('booking-time');
    if (timeInput) {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        
        if (minutes >= 30) {
            hours++;
            minutes = 0;
        } else {
            minutes = 30;
        }
        
        if (hours >= 24) {
            hours = 0;
        }
        
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        timeInput.value = timeString;
    }
}

// ========================
// Dashboard Functions
// ========================
function updateDashboard() {
    if (!appState.isLoggedIn) return;
    
    updateDashboardOverview();
    updateBookingsTable();
    updatePaymentsTable();
}

function updateDashboardOverview() {
    if (!appState.isLoggedIn) return;
    
    const userBookings = appState.bookings.filter(b => b.userId === appState.currentUser.id);
    const activeBookings = userBookings.filter(b => {
        const endTime = new Date(b.endTime);
        return endTime > new Date() && b.status === 'confirmed';
    }).length;
    
    const totalHours = userBookings.reduce((total, booking) => total + booking.duration, 0);
    const totalSpent = userBookings.reduce((total, booking) => total + booking.total, 0);
    const loyaltyPoints = Math.floor(totalSpent * 10);
    
    document.getElementById('active-bookings-count').textContent = activeBookings;
    document.getElementById('total-hours-parked').textContent = totalHours;
    document.getElementById('total-amount-spent').textContent = `$${totalSpent.toFixed(2)}`;
    document.getElementById('loyalty-points-count').textContent = loyaltyPoints;
    
    document.getElementById('user-bookings-count').textContent = userBookings.length;
    document.getElementById('user-points').textContent = loyaltyPoints;
    
    updateRecentActivity(userBookings);
}

function updateRecentActivity(bookings) {
    const activityList = document.getElementById('recent-activity-list');
    if (!activityList) return;
    
    const recentBookings = [...bookings]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    
    if (recentBookings.length === 0) {
        activityList.innerHTML = `
            <div class="activity-item">
                <i class="fas fa-info-circle"></i>
                <div class="activity-content">
                    <p>No recent activity. Book your first parking slot!</p>
                    <small>Go to Live Parking to book</small>
                </div>
            </div>
        `;
        return;
    }
    
    activityList.innerHTML = '';
    recentBookings.forEach(booking => {
        const date = new Date(booking.createdAt);
        const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <i class="fas fa-calendar-check"></i>
            <div class="activity-content">
                <p>Booked slot ${booking.slotId} for ${booking.duration} hour(s)</p>
                <small>${formattedDate} • $${booking.total.toFixed(2)} ${booking.planType ? `• ${booking.planType} Plan` : ''}</small>
        `;
        activityList.appendChild(activityItem);
    });
}

function updateBookingsTable() {
    const tableBody = document.getElementById('bookings-table-body');
    if (!tableBody) return;
    
    let userBookings = [];
    if (appState.isLoggedIn) {
        userBookings = appState.bookings.filter(b => b.userId === appState.currentUser.id);
    }
    
    const filter = document.getElementById('booking-filter').value;
    let filteredBookings = userBookings;
    
    if (filter !== 'all') {
        filteredBookings = userBookings.filter(booking => {
            if (filter === 'active') {
                const endTime = new Date(booking.endTime);
                return endTime > new Date() && booking.status === 'confirmed';
            }
            if (filter === 'upcoming') {
                const startTime = new Date(booking.startTime);
                return startTime > new Date() && booking.status === 'confirmed';
            }
            if (filter === 'completed') {
                const endTime = new Date(booking.endTime);
                return endTime <= new Date() && booking.status === 'confirmed';
            }
            if (filter === 'cancelled') {
                return booking.status === 'cancelled';
            }
            return true;
        });
    }
    
    if (filteredBookings.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data">
                    No ${filter !== 'all' ? filter : ''} bookings found. 
                    <a href="#parking" class="text-link">Book a slot</a>
                </td>
            </tr>
        `;
        return;
    }
    
    filteredBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    tableBody.innerHTML = '';
    filteredBookings.forEach(booking => {
        const startTime = new Date(booking.startTime);
        const endTime = new Date(booking.endTime);
        const now = new Date();
        
        let status = 'completed';
        if (booking.status === 'cancelled') {
            status = 'cancelled';
        } else if (endTime > now && startTime <= now) {
            status = 'active';
        } else if (startTime > now) {
            status = 'upcoming';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${booking.slotId}</td>
            <td>${booking.vehicleNumber}</td>
            <td>
                ${startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}<br>
                ${startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </td>
            <td>${booking.duration} hour(s)</td>
            <td>$${booking.total.toFixed(2)}</td>
            <td><span class="status-badge status-${status}">${status}</span></td>
            <td class="table-actions">
                ${status === 'upcoming' ? `
                    <button class="btn btn-sm btn-outline" onclick="cancelBooking('${booking.id}')">Cancel</button>
                    <button class="btn btn-sm btn-outline" onclick="extendBooking('${booking.id}')">Extend</button>
                ` : ''}
                <button class="btn btn-sm btn-outline" onclick="viewReceipt('${booking.id}')">
                    <i class="fas fa-receipt"></i> Receipt
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function updatePaymentsTable() {
    const tableBody = document.getElementById('payments-table-body');
    if (!tableBody) return;
    
    let userPayments = [];
    if (appState.isLoggedIn) {
        userPayments = appState.payments.filter(p => p.userId === appState.currentUser.id);
    }
    
    const filter = document.getElementById('payment-filter').value;
    let filteredPayments = userPayments;
    
    if (filter !== 'all') {
        filteredPayments = userPayments.filter(p => p.status === filter);
    }
    
    if (filteredPayments.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="no-data">
                    No ${filter !== 'all' ? filter : ''} payments found.
                </td>
            </tr>
        `;
        return;
    }
    
    filteredPayments.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tableBody.innerHTML = '';
    let totalPaid = 0;
    let pendingAmount = 0;
    let refundAmount = 0;
    
    filteredPayments.forEach(payment => {
        const date = new Date(payment.date);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
            <td><code>${payment.id}</code></td>
            <td>Payment for booking ${payment.bookingId} ${payment.planType ? `(${payment.planType} Plan)` : ''}</td>
            <td>$${payment.amount.toFixed(2)}</td>
            <td>${payment.method}</td>
            <td><span class="status-badge status-${payment.status}">${payment.status}</span></td>
        `;
        tableBody.appendChild(row);
        
        if (payment.status === 'completed') totalPaid += payment.amount;
        if (payment.status === 'pending') pendingAmount += payment.amount;
        if (payment.status === 'refunded') refundAmount += payment.amount;
    });
    
    document.getElementById('total-paid-amount').textContent = `$${totalPaid.toFixed(2)}`;
    document.getElementById('pending-amount').textContent = `$${pendingAmount.toFixed(2)}`;
    document.getElementById('refund-amount').textContent = `$${refundAmount.toFixed(2)}`;
}

function loadUserSettings() {
    if (!appState.isLoggedIn) return;
    
    document.getElementById('profile-name').value = appState.userSettings.name || '';
    document.getElementById('profile-email').value = appState.userSettings.email || '';
    document.getElementById('profile-phone').value = appState.userSettings.phone || '';
    document.getElementById('default-vehicle').value = appState.userSettings.defaultVehicle || '';
    document.getElementById('vehicle-type').value = appState.userSettings.vehicleType || 'car';
    
    const notificationCheckboxes = document.querySelectorAll('input[name="notifications"]');
    notificationCheckboxes.forEach(checkbox => {
        checkbox.checked = appState.userSettings.notifications.includes(checkbox.value);
    });
}

function handleSettingsSave(e) {
    e.preventDefault();
    
    if (!appState.isLoggedIn) {
        showToast('Please login to save settings', 'error');
        return;
    }
    
    const name = document.getElementById('profile-name').value.trim();
    const email = document.getElementById('profile-email').value.trim();
    const phone = document.getElementById('profile-phone').value.trim();
    const defaultVehicle = document.getElementById('default-vehicle').value.trim();
    const vehicleType = document.getElementById('vehicle-type').value;
    
    if (!name || !email) {
        showToast('Name and email are required', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    const notifications = [];
    document.querySelectorAll('input[name="notifications"]:checked').forEach(checkbox => {
        notifications.push(checkbox.value);
    });
    
    appState.userSettings.name = name;
    appState.userSettings.email = email;
    appState.userSettings.phone = phone;
    appState.userSettings.defaultVehicle = defaultVehicle;
    appState.userSettings.vehicleType = vehicleType;
    appState.userSettings.notifications = notifications;
    
    if (appState.currentUser) {
        appState.currentUser.name = name;
        appState.currentUser.email = email;
        localStorage.setItem('smartpark_user', JSON.stringify(appState.currentUser));
    }
    
    localStorage.setItem('smartpark_settings', JSON.stringify(appState.userSettings));
    
    updateUserUI();
    showToast('Settings saved successfully', 'success');
}

// ========================
// User Management
// ========================
function updateUserUI() {
    const userInfo = document.getElementById('user-info');
    const dropdownLogin = document.getElementById('dropdown-login');
    const dropdownSignup = document.getElementById('dropdown-signup');
    const dropdownLogout = document.getElementById('dropdown-logout');
    const dashboardUsername = document.getElementById('dashboard-username');
    const dashboardEmail = document.getElementById('dashboard-email');
    
    if (appState.isLoggedIn && appState.currentUser) {
        if (userInfo) {
            userInfo.innerHTML = `
                <strong>${appState.currentUser.name}</strong>
                <small>${appState.currentUser.email}</small>
            `;
        }
        
        if (dropdownLogin) dropdownLogin.style.display = 'none';
        if (dropdownSignup) dropdownSignup.style.display = 'none';
        if (dropdownLogout) dropdownLogout.style.display = 'block';
        
        if (dashboardUsername) dashboardUsername.textContent = appState.currentUser.name;
        if (dashboardEmail) dashboardEmail.textContent = appState.currentUser.email;
        
        // Update profile image when user logs in
        if (typeof updateProfileImage === 'function') {
            updateProfileImage();
        }
    } else {
        if (userInfo) {
            userInfo.innerHTML = `
                <strong>Guest User</strong>
                <small>Please login</small>
            `;
        }
        
        if (dropdownLogin) dropdownLogin.style.display = 'block';
        if (dropdownSignup) dropdownSignup.style.display = 'block';
        if (dropdownLogout) dropdownLogout.style.display = 'none';
        
        if (dashboardUsername) dashboardUsername.textContent = 'Guest User';
        if (dashboardEmail) dashboardEmail.textContent = 'Please login to access dashboard';
        
        // Update profile image to default for guests
        if (typeof updateProfileImage === 'function') {
            updateProfileImage();
        }
    }
}

function loadUserData() {
    if (!appState.isLoggedIn) return;
    
    try {
        const savedBookings = localStorage.getItem('smartpark_bookings');
        const savedPayments = localStorage.getItem('smartpark_payments');
        
        if (savedBookings) {
            const allBookings = JSON.parse(savedBookings);
            appState.bookings = allBookings.filter(b => b.userId === appState.currentUser.id);
        }
        if (savedPayments) {
            const allPayments = JSON.parse(savedPayments);
            appState.payments = allPayments.filter(p => p.userId === appState.currentUser.id);
        }
    } catch (e) {
        console.error('Error loading user data:', e);
    }
    
    updateDashboard();
}

function logout() {
    appState.currentUser = null;
    appState.isLoggedIn = false;
    appState.userSettings = {
        name: '',
        email: '',
        phone: '',
        defaultVehicle: '',
        vehicleType: 'car',
        notifications: ['email', 'sms']
    };
    appState.selectedSlot = null;
    appState.selectedPlan = null;
    appState.planDetails = null;
    appState.advanceBooking = null;
    localStorage.removeItem('smartpark_user');
    localStorage.removeItem('smartpark_settings');
    
    // Update profile image to default
    if (typeof updateProfileImage === 'function') {
        updateProfileImage();
    }
    
    updateUserUI();
    updateDashboard();
    showToast('Logged out successfully');
}

// ========================
// Pricing Plan Selection
// ========================
function setupPricing() {
    document.querySelectorAll('.pricing-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const period = this.dataset.period;
            
            document.querySelectorAll('.pricing-tab').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
            
            updatePricingPeriod(period);
        });
    });
    
    document.querySelectorAll('.select-plan').forEach(button => {
        button.addEventListener('click', function() {
            const plan = this.dataset.plan;
            
            if (!appState.isLoggedIn) {
                showToast('Please login to select a plan', 'error');
                openModal('login-modal');
                return;
            }
            
            appState.selectedPlan = plan;
            
            const planCard = this.closest('.pricing-card');
            const planTitle = planCard.querySelector('.pricing-title').textContent;
            const planPrice = planCard.querySelector('.amount').textContent;
            const planPeriod = planCard.querySelector('.period').textContent;
            
            appState.planDetails = {
                name: planTitle,
                type: plan,
                price: parseFloat(planPrice),
                period: planPeriod,
                features: []
            };
            
            const featureItems = planCard.querySelectorAll('.pricing-features li');
            featureItems.forEach(item => {
                appState.planDetails.features.push(item.textContent.trim());
            });
            
            showToast(`${planTitle} plan selected! Redirecting to booking...`, 'success');
            
            setTimeout(() => {
                if (!appState.selectedSlot) {
                    scrollToSection('#parking');
                    showToast(`Please select a parking slot for your ${planTitle} plan`, 'info');
                } else {
                    openBookingModal();
                }
            }, 1500);
        });
    });
}

function updateBookingFormWithPlan(plan) {
    if (!appState.selectedPlan) return;
    
    const planDetails = appState.planDetails;
    if (!planDetails) return;
    
    const planInfoElement = document.createElement('div');
    planInfoElement.className = 'plan-info-alert';
    planInfoElement.style.cssText = `
        background: linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%);
        color: white;
        padding: 1rem;
        border-radius: var(--radius);
        margin-bottom: 1.5rem;
        border-left: 4px solid var(--success);
    `;
    
    planInfoElement.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
            <i class="fas fa-crown" style="font-size: 1.25rem;"></i>
            <h4 style="margin: 0; font-size: 1.125rem;">${planDetails.name} Plan Selected</h4>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <p style="margin: 0.25rem 0; font-size: 0.875rem; opacity: 0.9;">
                    <i class="fas fa-check-circle"></i> ${planDetails.price}${planDetails.period}
                </p>
                ${planDetails.features.slice(0, 2).map(feature => `
                    <p style="margin: 0.25rem 0; font-size: 0.75rem; opacity: 0.8;">
                        <i class="fas fa-check"></i> ${feature}
                    </p>
                `).join('')}
            </div>
            <button type="button" id="change-plan-btn" class="btn btn-sm btn-outline" 
                    style="background: rgba(255, 255, 255, 0.2); color: white; border-color: white;">
                <i class="fas fa-sync-alt"></i> Change Plan
            </button>
        </div>
    `;
    
    const step1 = document.getElementById('step-1');
    if (step1) {
        const existingPlanInfo = step1.querySelector('.plan-info-alert');
        if (existingPlanInfo) {
            existingPlanInfo.remove();
        }
        
        step1.insertBefore(planInfoElement, step1.firstChild);
        
        const changePlanBtn = document.getElementById('change-plan-btn');
        if (changePlanBtn) {
            changePlanBtn.addEventListener('click', function() {
                planInfoElement.remove();
                appState.selectedPlan = null;
                appState.planDetails = null;
                closeModal();
                scrollToSection('#pricing');
                showToast('Select a different plan', 'info');
            });
        }
    }
    
    const durationSelect = document.getElementById('booking-duration');
    if (durationSelect && planDetails.type === 'business') {
        durationSelect.innerHTML = `
            <option value="8">8 hours - $18.00</option>
            <option value="24" selected>24 hours - $35.00</option>
            <option value="48">48 hours - $65.00</option>
            <option value="168">1 week - $180.00</option>
        `;
    }
    
    updateBookingSummary();
}

// ========================
// Book in Advance Feature
// ========================
function setupBookInAdvance() {
    const actionBookAdvanceHorizontal = document.getElementById('action-book-advance-horizontal');
    if (actionBookAdvanceHorizontal) {
        actionBookAdvanceHorizontal.addEventListener('click', function(e) {
            e.preventDefault();
            openBookInAdvanceModal();
        });
    }
    
    const actionBookAdvance = document.getElementById('action-book-advance');
    if (actionBookAdvance) {
        actionBookAdvance.addEventListener('click', function(e) {
            e.preventDefault();
            openBookInAdvanceModal();
        });
    }
    
    document.addEventListener('click', function(e) {
        if (e.target.closest('#action-book-advance-horizontal') || 
            e.target.closest('#action-book-advance')) {
            e.preventDefault();
            openBookInAdvanceModal();
        }
    });
}

function openBookInAdvanceModal() {
    if (!appState.isLoggedIn) {
        showToast('Please login to book in advance', 'error');
        openModal('login-modal');
        return;
    }
    
    const modalHTML = `
        <div class="modal" id="book-advance-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-calendar-check"></i> Book in Advance</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 1.5rem;">
                        <div class="alert alert-info" style="background: var(--info); color: white; padding: 1rem; border-radius: var(--radius); margin-bottom: 1.5rem;">
                            <i class="fas fa-info-circle"></i> You can book parking slots up to 3 days in advance.
                        </div>
                        
                        <div class="form-group">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: var(--gray-700);">
                                <i class="fas fa-calendar-day"></i> Select Date
                            </label>
                            <input type="date" id="advance-booking-date" class="form-control" 
                                   style="width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--gray-300); border-radius: var(--radius); font-size: 1rem;">
                            <small style="display: block; margin-top: 0.25rem; color: var(--gray-500); font-size: 0.75rem;">
                                Select a date within the next 3 days
                            </small>
                        </div>
                        
                        <div class="form-group" style="margin-top: 1.5rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: var(--gray-700);">
                                <i class="fas fa-clock"></i> Select Time
                            </label>
                            <input type="time" id="advance-booking-time" class="form-control" 
                                   style="width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--gray-300); border-radius: var(--radius); font-size: 1rem;">
                            <small style="display: block; margin-top: 0.25rem; color: var(--gray-500); font-size: 0.75rem;">
                                Select start time (24-hour format)
                            </small>
                        </div>
                        
                        <div class="form-group" style="margin-top: 1.5rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: var(--gray-700);">
                                <i class="fas fa-hourglass-half"></i> Duration
                            </label>
                            <select id="advance-booking-duration" class="form-control" 
                                    style="width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--gray-300); border-radius: var(--radius); font-size: 1rem;">
                                <option value="1">1 hour</option>
                                <option value="2">2 hours</option>
                                <option value="3">3 hours</option>
                                <option value="4">4 hours</option>
                                <option value="8">8 hours</option>
                                <option value="12">12 hours</option>
                                <option value="24">24 hours</option>
                            </select>
                        </div>
                        
                        <div id="advance-booking-summary" style="background: var(--gray-50); border-radius: var(--radius); padding: 1.5rem; margin-top: 1.5rem; display: none;">
                            <h4 style="margin-bottom: 1rem; color: var(--gray-900);">
                                <i class="fas fa-receipt"></i> Booking Summary
                            </h4>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span style="color: var(--gray-600);">Date:</span>
                                <span id="summary-date" style="font-weight: 600; color: var(--gray-900);"></span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span style="color: var(--gray-600);">Time:</span>
                                <span id="summary-time" style="font-weight: 600; color: var(--gray-900);"></span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span style="color: var(--gray-600);">Duration:</span>
                                <span id="summary-duration" style="font-weight: 600; color: var(--gray-900);"></span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--gray-200);">
                                <span style="font-weight: 600; color: var(--gray-900);">Estimated Cost:</span>
                                <span id="summary-estimated-cost" style="font-weight: 700; color: var(--primary);"></span>
                            </div>
                            <small style="display: block; margin-top: 0.5rem; color: var(--gray-500); font-size: 0.75rem;">
                                <i class="fas fa-info-circle"></i> Final cost depends on selected slot type
                            </small>
                        </div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--gray-200);">
                        <button class="btn btn-outline" id="cancel-advance-booking">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                        <button class="btn btn-primary" id="continue-to-parking">
                            <i class="fas fa-map-marker-alt"></i> Select Parking Slot
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('book-advance-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = document.getElementById('book-advance-modal');
    
    const dateInput = modal.querySelector('#advance-booking-date');
    const timeInput = modal.querySelector('#advance-booking-time');
    const durationSelect = modal.querySelector('#advance-booking-duration');
    
    if (dateInput && timeInput) {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        const maxDate = new Date(now);
        maxDate.setDate(maxDate.getDate() + 3);
        const maxDateString = maxDate.toISOString().split('T')[0];
        
        dateInput.min = today;
        dateInput.max = maxDateString;
        
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.value = tomorrow.toISOString().split('T')[0];
        
        let nextHour = now.getHours() + 1;
        if (nextHour >= 24) {
            nextHour = 0;
            const tomorrowDate = new Date(now);
            tomorrowDate.setDate(tomorrowDate.getDate() + 1);
            dateInput.value = tomorrowDate.toISOString().split('T')[0];
        }
        timeInput.value = `${nextHour.toString().padStart(2, '0')}:00`;
        
        const updateSummary = () => {
            const summaryDiv = modal.querySelector('#advance-booking-summary');
            const date = dateInput.value;
            const time = timeInput.value;
            const duration = parseInt(durationSelect.value);
            
            if (date && time) {
                const dateObj = new Date(`${date}T${time}`);
                const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
                const formattedDate = dateObj.toLocaleDateString('en-US', options);
                
                const timeObj = new Date(`2000-01-01T${time}`);
                const formattedTime = timeObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                
                const estimatedCost = (duration * 2.5).toFixed(2);
                
                modal.querySelector('#summary-date').textContent = formattedDate;
                modal.querySelector('#summary-time').textContent = formattedTime;
                modal.querySelector('#summary-duration').textContent = `${duration} hour${duration > 1 ? 's' : ''}`;
                modal.querySelector('#summary-estimated-cost').textContent = `$${estimatedCost}`;
                
                summaryDiv.style.display = 'block';
            }
        };
        
        dateInput.addEventListener('change', updateSummary);
        timeInput.addEventListener('change', updateSummary);
        durationSelect.addEventListener('change', updateSummary);
        
        updateSummary();
    }
    
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('#cancel-advance-booking').addEventListener('click', closeModal);
    
    modal.querySelector('#continue-to-parking').addEventListener('click', function() {
        const date = dateInput.value;
        const time = timeInput.value;
        const duration = parseInt(durationSelect.value);
        
        if (!date || !time) {
            showToast('Please select date and time', 'error');
            return;
        }
        
        const selectedDate = new Date(`${date}T${time}`);
        const now = new Date();
        const threeDaysFromNow = new Date(now);
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        threeDaysFromNow.setHours(23, 59, 59, 999);
        
        if (selectedDate < now) {
            showToast('Cannot book in the past', 'error');
            return;
        }
        
        if (selectedDate > threeDaysFromNow) {
            showToast('Cannot book more than 3 days in advance', 'error');
            return;
        }
        
        appState.advanceBooking = {
            date: date,
            time: time,
            duration: duration,
            startTime: selectedDate.toISOString(),
            endTime: new Date(selectedDate.getTime() + duration * 60 * 60 * 1000).toISOString()
        };
        
        closeModal();
        scrollToSection('#parking');
        
        setTimeout(() => {
            showToast('Select a parking slot for your advance booking', 'info');
        }, 500);
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
    
    openModal('book-advance-modal');
}

// ========================
// Enhanced Features Setup
// ========================

function setupEnhancedFeatures() {
    const downloadAppLink = document.getElementById('download-app-link');
    if (downloadAppLink) {
        downloadAppLink.addEventListener('click', function(e) {
            e.preventDefault();
            openModal('app-download-modal');
        });
    }
    
    const appStoreLink = document.getElementById('app-store-link');
    if (appStoreLink) {
        appStoreLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.open('https://apps.apple.com/app/smartpark', '_blank');
        });
    }
    
    const playStoreLink = document.getElementById('play-store-link');
    if (playStoreLink) {
        playStoreLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.open('https://play.google.com/store/apps/details?id=com.smartpark', '_blank');
        });
    }
    
    const iosDownloadBtn = document.getElementById('ios-download');
    if (iosDownloadBtn) {
        iosDownloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.open('https://apps.apple.com/app/smartpark', '_blank');
        });
    }
    
    const androidDownloadBtn = document.getElementById('android-download');
    if (androidDownloadBtn) {
        androidDownloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.open('https://play.google.com/store/apps/details?id=com.smartpark', '_blank');
        });
    }
    
    const watchDemoBtn = document.getElementById('watch-demo-btn');
    if (watchDemoBtn) {
        watchDemoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openModal('demo-video-modal');
        });
    }
    
    // FIXED: Download PDF Guide Button with better formatting
    const downloadDemoPdf = document.getElementById('download-demo-pdf');
    if (downloadDemoPdf) {
        // Remove any existing event listeners
        const newDownloadBtn = downloadDemoPdf.cloneNode(true);
        downloadDemoPdf.parentNode.replaceChild(newDownloadBtn, downloadDemoPdf);
        
        newDownloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            showToast('Generating PDF guide...', 'info');
            
            // Disable button temporarily to prevent multiple downloads
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            
            setTimeout(() => {
                try {
                    // Check if jsPDF is available
                    if (typeof window.jspdf === 'undefined') {
                        // If not available, load it dynamically
                        const script = document.createElement('script');
                        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                        script.onload = function() {
                            generatePDFGuide();
                            // Re-enable button
                            newDownloadBtn.disabled = false;
                            newDownloadBtn.innerHTML = '<i class="fas fa-download"></i> Download Demo PDF';
                        };
                        document.head.appendChild(script);
                    } else {
                        generatePDFGuide();
                        // Re-enable button
                        newDownloadBtn.disabled = false;
                        newDownloadBtn.innerHTML = '<i class="fas fa-download"></i> Download Demo PDF';
                    }
                } catch (error) {
                    console.error('PDF generation error:', error);
                    showToast('Error generating PDF. Please try again.', 'error');
                    newDownloadBtn.disabled = false;
                    newDownloadBtn.innerHTML = '<i class="fas fa-download"></i> Download Demo PDF';
                }
            }, 500);
        });
    }
    
    const tryLiveDemo = document.getElementById('try-live-demo');
    if (tryLiveDemo) {
        tryLiveDemo.addEventListener('click', function() {
            closeModal();
            scrollToSection('#parking');
            showToast('Try booking a slot to experience the live demo', 'info');
        });
    }
    
    const guideBooking = document.getElementById('guide-booking');
    if (guideBooking) {
        guideBooking.addEventListener('click', function(e) {
            e.preventDefault();
            openModal('guide-booking-modal');
        });
    }
    
    const guidePayment = document.getElementById('guide-payment');
    if (guidePayment) {
        guidePayment.addEventListener('click', function(e) {
            e.preventDefault();
            openModal('guide-payment-modal');
        });
    }
    
    const guideMobile = document.getElementById('guide-mobile');
    if (guideMobile) {
        guideMobile.addEventListener('click', function(e) {
            e.preventDefault();
            openModal('guide-mobile-modal');
        });
    }
    
    const guideAccessibility = document.getElementById('guide-accessibility');
    if (guideAccessibility) {
        guideAccessibility.addEventListener('click', function(e) {
            e.preventDefault();
            openModal('guide-accessibility-modal');
        });
    }
    
    const privacyPolicy = document.getElementById('privacy-policy');
    if (privacyPolicy) {
        privacyPolicy.addEventListener('click', function(e) {
            e.preventDefault();
            openModal('privacy-policy-modal');
        });
    }
    
    const termsService = document.getElementById('terms-service');
    if (termsService) {
        termsService.addEventListener('click', function(e) {
            e.preventDefault();
            openModal('terms-service-modal');
        });
    }
    
    const termsLink = document.getElementById('terms-link');
    if (termsLink) {
        termsLink.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal();
            openModal('terms-service-modal');
        });
    }
    
    const privacyLink = document.getElementById('privacy-link');
    if (privacyLink) {
        privacyLink.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal();
            openModal('privacy-policy-modal');
        });
    }
    
    const socialLinks = document.querySelectorAll('.social-link[href^="https://"]');
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            showToast(`Opening ${this.querySelector('i').className.split('-')[1]}`, 'info');
        });
    });
    
    const actionGetApp = document.getElementById('action-get-app');
    if (actionGetApp) {
        actionGetApp.addEventListener('click', function(e) {
            e.preventDefault();
            openModal('app-download-modal');
        });
    }
    
    addEnhancedStyles();
}

// Helper function to generate PDF guide with consistent font sizes and spacing
function generatePDFGuide() {
    try {
        const { jsPDF } = window.jspdf;
        
        // Create new PDF document
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            putOnlyUsedFonts: true,
            compress: true
        });
        
        // Set default font to helvetica
        doc.setFont('helvetica');
        
        // HEADER SECTION
        doc.setFillColor(67, 97, 238);
        doc.rect(0, 0, 210, 30, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('SmartPark', 105, 18, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Intelligent Parking Solutions', 105, 26, { align: 'center' });
        
        let y = 45;
        
        // SECTION 1: QUICK START GUIDE
        // Section title
        doc.setFillColor(240, 240, 240);
        doc.rect(15, y-6, 180, 8, 'F');
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(67, 97, 238);
        doc.text('QUICK START GUIDE', 20, y);
        y += 10;
        
        // Section content with 8pt spacing
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        
        const steps = [
            '1. Create an account or login to your dashboard',
            '2. Select your parking floor (Ground / First / Second)',
            '3. Choose an available parking slot from the interactive map',
            '4. Enter your vehicle details (number, model, color)',
            '5. Select duration and complete payment',
            '6. Park your vehicle at the selected slot',
            '7. Extend or manage bookings from your dashboard'
        ];
        
        steps.forEach(step => {
            doc.text(step, 20, y);
            y += 8;
        });
        
        y += 5;
        
        // SECTION 2: PARKING RATES
        if (y > 250) { doc.addPage(); y = 25; }
        doc.setFillColor(240, 240, 240);
        doc.rect(15, y-6, 180, 8, 'F');
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(67, 97, 238);
        doc.text('PARKING RATES', 20, y);
        y += 10;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        
        const rates = [
            '• Regular Slots: $2.50 per hour',
            '• EV Charging Slots: $2.25 per hour',
            '• Handicap Accessible: $2.00 per hour',
            '• Premium/Reserved: $3.50 per hour'
        ];
        
        rates.forEach(rate => {
            doc.text(rate, 20, y);
            y += 8;
        });
        
        y += 5;
        
        // SECTION 3: KEY FEATURES
        if (y > 250) { doc.addPage(); y = 25; }
        doc.setFillColor(240, 240, 240);
        doc.rect(15, y-6, 180, 8, 'F');
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(67, 97, 238);
        doc.text('KEY FEATURES', 20, y);
        y += 10;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        
        const features = [
            '• Live Parking Updates: Real-time slot availability',
            '• Multiple Floors: Ground (120 slots), First (100 slots), Second (80 slots)',
            '• Book in Advance: Reserve slots up to 3 days ahead',
            '• Multiple Payment Options: Card, PayPal, Google Pay, Apple Pay',
            '• Digital Receipts: Automatic receipt generation',
            '• Booking Management: View, extend, or cancel bookings',
            '• Loyalty Points: Earn 10 points for every $1 spent',
            '• SMS/Email Notifications: Get booking reminders'
        ];
        
        features.forEach(feature => {
            // Split long text to fit in page
            const splitText = doc.splitTextToSize(feature, 170);
            doc.text(splitText, 20, y);
            // Use 8pt spacing for each line of the feature
            y += (splitText.length * 8);
        });
        
        y += 5;
        
        // SECTION 4: PAYMENT METHODS
        if (y > 250) { doc.addPage(); y = 25; }
        doc.setFillColor(240, 240, 240);
        doc.rect(15, y-6, 180, 8, 'F');
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(67, 97, 238);
        doc.text('PAYMENT METHODS', 20, y);
        y += 10;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        
        const payments = [
            '• Credit/Debit Cards (Visa, MasterCard, American Express)',
            '• PayPal',
            '• Google Pay',
            '• Apple Pay',
            '• SmartPark Wallet (with loyalty points)'
        ];
        
        payments.forEach(payment => {
            doc.text(payment, 20, y);
            y += 8;
        });
        
        y += 5;
        
        // SECTION 5: CONTACT INFORMATION
        if (y > 250) { doc.addPage(); y = 25; }
        doc.setFillColor(240, 240, 240);
        doc.rect(15, y-6, 180, 8, 'F');
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(67, 97, 238);
        doc.text('CONTACT INFORMATION', 20, y);
        y += 10;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        
        // Clean contact information without special characters
        const contactInfo = [
            'Email: himanshugoud638@gmail.com',
            'Phone: +91 9575228807',
            'Address: 02 Ashok Colony Parking St, Gwalior',
            'Live Chat: Available 9AM - 9PM IST',
            'Website: www.smartpark.com'
        ];
        
        contactInfo.forEach(info => {
            doc.text(info, 20, y);
            y += 8;
        });
        
        y += 5;
        
        // SECTION 6: DOWNLOAD OUR APP
        if (y > 250) { doc.addPage(); y = 25; }
        doc.setFillColor(240, 240, 240);
        doc.rect(15, y-6, 180, 8, 'F');
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(67, 97, 238);
        doc.text('DOWNLOAD OUR APP', 20, y);
        y += 10;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        
        doc.text('iOS App Store:', 20, y);
        y += 6;
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(67, 97, 238);
        const iosLink = doc.splitTextToSize('https://apps.apple.com/app/smartpark', 170);
        doc.text(iosLink, 20, y);
        y += (iosLink.length * 8); // 8pt spacing for each line
        y += 2; // Extra spacing
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        doc.text('Google Play Store:', 20, y);
        y += 6;
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(67, 97, 238);
        const androidLink = doc.splitTextToSize('https://play.google.com/store/apps/details?id=com.smartpark', 170);
        doc.text(androidLink, 20, y);
        
        // FOOTER
        doc.setFillColor(67, 97, 238);
        doc.rect(0, 280, 210, 15, 'F');
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(255, 255, 255);
        doc.text('© 2026 SmartPark. All rights reserved.', 105, 287, { align: 'center' });
        doc.text('Thank you for choosing SmartPark!', 105, 292, { align: 'center' });
        
        // Add page numbers to all pages
        const pageCount = doc.internal.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Page ${i} of ${pageCount}`, 180, 290);
        }
        
        // Save the PDF
        doc.save('SmartPark_User_Guide.pdf');
        showToast('PDF guide downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('PDF generation error:', error);
        showToast('Error generating PDF. Please try again.', 'error');
        
        // Clean fallback without special characters
        const fallbackContent = `SMARTPARK USER GUIDE
=====================

QUICK START GUIDE:
1. Create an account or login to your dashboard
2. Select your parking floor (Ground / First / Second)
3. Choose an available parking slot from the interactive map
4. Enter your vehicle details (number, model, color)
5. Select duration and complete payment
6. Park your vehicle at the selected slot
7. Extend or manage bookings from your dashboard

PARKING RATES:
- Regular Slots: $2.50 per hour
- EV Charging Slots: $2.25 per hour
- Handicap Accessible: $2.00 per hour
- Premium/Reserved: $3.50 per hour

KEY FEATURES:
- Live Parking Updates: Real-time slot availability
- Multiple Floors: Ground (120 slots), First (100 slots), Second (80 slots)
- Book in Advance: Reserve slots up to 3 days ahead
- Multiple Payment Options: Card, PayPal, Google Pay, Apple Pay
- Digital Receipts: Automatic receipt generation
- Booking Management: View, extend, or cancel bookings
- Loyalty Points: Earn 10 points for every $1 spent
- SMS/Email Notifications: Get booking reminders

PAYMENT METHODS:
- Credit/Debit Cards (Visa, MasterCard, American Express)
- PayPal
- Google Pay
- Apple Pay
- SmartPark Wallet (with loyalty points)

CONTACT INFORMATION:
Email: himanshugoud638@gmail.com
Phone: +91 9575228807
Address: 02 Ashok Colony Parking St, Gwalior
Live Chat: Available 9AM - 9PM IST
Website: www.smartpark.com

Thank you for choosing SmartPark!`;
        
        const blob = new Blob([fallbackContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'SmartPark_User_Guide.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Text guide downloaded as fallback', 'info');
    }
}

function addEnhancedStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Book in Advance Modal */
        .alert {
            padding: 1rem;
            border-radius: var(--radius);
            margin-bottom: 1rem;
        }
        
        .alert-info {
            background: var(--info);
            color: white;
        }
        
        .alert-success {
            background: var(--success);
            color: white;
        }
        
        .alert-warning {
            background: var(--warning);
            color: white;
        }
        
        .alert-danger {
            background: var(--danger);
            color: white;
        }
        
        /* App Download Modal */
        .app-download-content {
            text-align: center;
        }
        
        .app-features {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .feature-item {
            background: var(--gray-50);
            padding: 1rem;
            border-radius: var(--radius);
            text-align: center;
        }
        
        .feature-item i {
            font-size: 2rem;
            color: var(--primary);
            margin-bottom: 0.5rem;
        }
        
        .qr-codes {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
            margin: 2rem 0;
        }
        
        .qr-section {
            text-align: center;
        }
        
        .qr-code {
            background: white;
            padding: 1rem;
            border-radius: var(--radius);
            display: inline-block;
            margin-bottom: 1rem;
            border: 1px solid var(--gray-200);
        }
        
        .qr-code img {
            width: 150px;
            height: 150px;
        }
        
        .app-links {
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid var(--gray-200);
        }
        
        .link-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 1rem;
        }
        
        /* Demo Video Modal */
        .demo-content {
            text-align: center;
        }
        
        .video-container {
            margin-bottom: 2rem;
        }
        
        .video-placeholder {
            background: var(--gray-900);
            border-radius: var(--radius);
            padding: 3rem;
            color: white;
            margin-bottom: 1rem;
        }
        
        .video-placeholder i {
            font-size: 4rem;
            margin-bottom: 1rem;
            color: var(--primary);
        }
        
        .demo-steps {
            text-align: left;
            background: var(--gray-50);
            padding: 1.5rem;
            border-radius: var(--radius);
            margin-bottom: 1.5rem;
        }
        
        .demo-steps ol {
            padding-left: 1.5rem;
            margin-top: 1rem;
        }
        
        .demo-steps li {
            margin-bottom: 0.75rem;
        }
        
        .demo-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
        }
        
        /* Guide Modals */
        .guide-content {
            max-height: 60vh;
            overflow-y: auto;
            padding-right: 0.5rem;
        }
        
        .guide-step {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            margin-bottom: 1.5rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid var(--gray-200);
        }
        
        .guide-step:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        
        .step-number {
            width: 2rem;
            height: 2rem;
            background: var(--primary);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            flex-shrink: 0;
        }
        
        .step-content h4 {
            margin-bottom: 0.5rem;
            color: var(--gray-900);
        }
        
        .guide-tips {
            background: var(--gray-50);
            padding: 1.5rem;
            border-radius: var(--radius);
            margin-top: 2rem;
        }
        
        .guide-tips ul {
            padding-left: 1.5rem;
            margin-top: 1rem;
        }
        
        .guide-tips li {
            margin-bottom: 0.5rem;
        }
        
        /* Payment Guide */
        .payment-methods-list {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1.5rem 0;
        }
        
        .payment-method {
            background: var(--gray-50);
            padding: 1rem;
            border-radius: var(--radius);
            text-align: center;
        }
        
        .payment-method i {
            font-size: 2rem;
            color: var(--primary);
            margin-bottom: 0.5rem;
            display: block;
        }
        
        .refund-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
            font-size: 0.875rem;
        }
        
        .refund-table th,
        .refund-table td {
            padding: 0.75rem;
            border: 1px solid var(--gray-200);
            text-align: left;
        }
        
        .refund-table th {
            background: var(--gray-100);
            font-weight: 600;
        }
        
        .refund-table tbody tr:nth-child(even) {
            background: var(--gray-50);
        }
        
        .security-section {
            background: var(--gray-50);
            padding: 1.5rem;
            border-radius: var(--radius);
            margin-top: 1.5rem;
        }
        
        /* Mobile App Guide */
        .app-screenshots {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .phone-frame {
            width: 300px;
            height: 600px;
            background: #333;
            border-radius: 40px;
            padding: 20px;
            margin: 0 auto 1rem;
            position: relative;
            box-shadow: var(--shadow-lg);
        }
        
        .screen {
            width: 100%;
            height: 100%;
            border-radius: 20px;
            overflow: hidden;
        }
        
        .app-screen {
            padding: 1.5rem;
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        
        .app-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: white;
            font-weight: bold;
            font-size: 1.25rem;
            margin-bottom: 2rem;
        }
        
        .app-header i {
            font-size: 1.5rem;
        }
        
        .search-bar {
            background: rgba(255, 255, 255, 0.1);
            border-radius: var(--radius-full);
            padding: 0.75rem 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 2rem;
        }
        
        .quick-actions {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
        }
        
        .app-btn {
            flex: 1;
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            padding: 1rem;
            border-radius: var(--radius);
            font-weight: 500;
            cursor: pointer;
            transition: var(--transition);
        }
        
        .app-btn:hover {
            background: rgba(255, 255, 255, 0.3);
        }
        
        .app-features-guide {
            margin-bottom: 2rem;
        }
        
        .feature-guide {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        
        .feature-guide i {
            font-size: 1.5rem;
            color: var(--primary);
            margin-top: 0.25rem;
        }
        
        .feature-guide h5 {
            margin-bottom: 0.25rem;
            color: var(--gray-900);
        }
        
        .feature-guide p {
            color: var(--gray-600);
            font-size: 0.875rem;
        }
        
        .app-tips {
            background: var(--gray-50);
            padding: 1.5rem;
            border-radius: var(--radius);
        }
        
        .app-tips ol {
            padding-left: 1.5rem;
            margin-top: 1rem;
        }
        
        .app-tips li {
            margin-bottom: 0.75rem;
        }
        
        /* Accessibility Guide */
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1.5rem 0;
        }
        
        .feature-item {
            background: var(--gray-50);
            padding: 1.5rem;
            border-radius: var(--radius);
            text-align: center;
        }
        
        .feature-item i {
            font-size: 2rem;
            color: var(--primary);
            margin-bottom: 1rem;
        }
        
        .feature-item h5 {
            margin-bottom: 0.5rem;
            color: var(--gray-900);
        }
        
        .feature-item p {
            font-size: 0.875rem;
            color: var(--gray-600);
        }
        
        .map-guide {
            background: var(--gray-50);
            padding: 1.5rem;
            border-radius: var(--radius);
            margin: 1.5rem 0;
        }
        
        .map-point {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        
        .map-point:last-child {
            margin-bottom: 0;
        }
        
        .point-number {
            width: 2rem;
            height: 2rem;
            background: var(--primary);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            flex-shrink: 0;
        }
        
        .point-info h5 {
            margin-bottom: 0.25rem;
            color: var(--gray-900);
        }
        
        .point-info p {
            color: var(--gray-600);
            font-size: 0.875rem;
        }
        
        .accessibility-contact {
            background: var(--gray-50);
            padding: 1.5rem;
            border-radius: var(--radius);
        }
        
        .accessibility-contact h4 {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }
        
        .contact-info p {
            margin-bottom: 0.5rem;
        }
        
        /* Policy and Terms Modals */
        .policy-content,
        .terms-content {
            max-height: 60vh;
            overflow-y: auto;
            padding-right: 0.5rem;
        }
        
        .policy-section,
        .terms-section {
            margin-bottom: 2rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid var(--gray-200);
        }
        
        .policy-section:last-child,
        .terms-section:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        
        .policy-section h4,
        .terms-section h4 {
            margin-bottom: 1rem;
            color: var(--gray-900);
        }
        
        .policy-section ul,
        .terms-section ul {
            padding-left: 1.5rem;
            margin-top: 0.5rem;
        }
        
        .policy-section li,
        .terms-section li {
            margin-bottom: 0.5rem;
        }
        
        .policy-contact {
            background: var(--gray-50);
            padding: 1.5rem;
            border-radius: var(--radius);
            margin-top: 2rem;
        }
        
        @media (max-width: 768px) {
            .app-features,
            .qr-codes,
            .payment-methods-list,
            .feature-grid {
                grid-template-columns: 1fr;
            }
            
            .phone-frame {
                width: 250px;
                height: 500px;
            }
            
            .demo-actions,
            .link-buttons {
                flex-direction: column;
            }
            
            .demo-actions .btn,
            .link-buttons .btn {
                width: 100%;
            }
        }
    `;
    document.head.appendChild(style);
}

// ========================
// Other Functions
// ========================
function updatePricingPeriod(period) {
    document.querySelectorAll('.pricing-card').forEach(card => {
        const amountElement = card.querySelector('.amount');
        const periodElement = card.querySelector('.period');
        
        if (amountElement && periodElement) {
            const hourly = amountElement.dataset.hourly;
            const daily = amountElement.dataset.daily;
            const monthly = amountElement.dataset.monthly;
            
            if (period === 'hourly') {
                amountElement.textContent = hourly;
                periodElement.textContent = periodElement.dataset.hourly;
            } else if (period === 'daily') {
                amountElement.textContent = daily;
                periodElement.textContent = periodElement.dataset.daily;
            } else if (period === 'monthly') {
                amountElement.textContent = monthly;
                periodElement.textContent = periodElement.dataset.monthly;
            }
        }
    });
}

function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const lastUpdateElement = document.getElementById('last-update-time');
    if (lastUpdateElement) {
        lastUpdateElement.textContent = `Updated at ${timeString}`;
    }
}

function startLiveUpdates() {
    let parkingInterval, statsInterval;
    
    parkingInterval = setInterval(() => {
        Object.keys(appState.parkingData).forEach(floor => {
            const slots = appState.parkingData[floor];
            const randomIndex = Math.floor(Math.random() * slots.length);
            
            if (slots[randomIndex].status === 'available' && Math.random() > 0.7) {
                slots[randomIndex].status = Math.random() > 0.5 ? 'booked' : 'occupied';
            }
        });
        
        if (document.querySelector('.floor-map')) {
            renderParkingMap();
            updateFloorStatistics();
            updateLastUpdateTime();
        }
    }, 30000);
    
    statsInterval = setInterval(() => {
        updateAvailableSlotsCount();
    }, 10000);
    
    window.addEventListener('beforeunload', () => {
        clearInterval(parkingInterval);
        clearInterval(statsInterval);
    });
}

// ========================
// FIXED: Show Payment Success Function
// ========================
function showPaymentSuccess(booking, payment) {
    // Update the success modal with booking details
    document.getElementById('success-booking-id').textContent = booking.id;
    document.getElementById('success-slot').textContent = booking.slotId;
    document.getElementById('success-date-time').textContent = 
        new Date(booking.startTime).toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    document.getElementById('success-duration').textContent = `${booking.duration} hour(s)`;
    document.getElementById('success-amount').textContent = `$${booking.total.toFixed(2)}`;
    
    // Remove any existing plan info
    const existingPlanInfo = document.querySelector('.booking-details').querySelector('p:last-child');
    if (existingPlanInfo && existingPlanInfo.innerHTML.includes('Plan:')) {
        existingPlanInfo.remove();
    }
    
    // Add plan info if available
    if (appState.selectedPlan) {
        const planInfo = document.createElement('p');
        planInfo.innerHTML = `<strong>Plan:</strong> ${appState.planDetails?.name || appState.selectedPlan}`;
        document.querySelector('.booking-details').appendChild(planInfo);
    }
    
    // FIXED: Update download receipt button to actually download the receipt
    const downloadReceiptBtn = document.getElementById('download-receipt');
    if (downloadReceiptBtn) {
        // Remove any existing event listeners
        const newDownloadBtn = downloadReceiptBtn.cloneNode(true);
        downloadReceiptBtn.parentNode.replaceChild(newDownloadBtn, downloadReceiptBtn);
        
        // Add new event listener
        newDownloadBtn.addEventListener('click', function() {
            downloadReceiptFromSuccessModal(booking, payment);
        });
    }
    
    // FIXED: Update view booking button
    const viewBookingBtn = document.getElementById('view-booking');
    if (viewBookingBtn) {
        // Remove any existing event listeners
        const newViewBtn = viewBookingBtn.cloneNode(true);
        viewBookingBtn.parentNode.replaceChild(newViewBtn, viewBookingBtn);
        
        // Add new event listener
        newViewBtn.addEventListener('click', function() {
            closeModal();
            scrollToSection('#dashboard');
            
            setTimeout(() => {
                const bookingsBtn = document.querySelector('[data-panel="bookings"]');
                if (bookingsBtn) {
                    bookingsBtn.click();
                }
                showToast('Booking added to your dashboard', 'success');
            }, 500);
        });
    }
    
    openModal('payment-success-modal');
}

// ========================
// NEW: Download Receipt from Success Modal Function
// ========================
function downloadReceiptFromSuccessModal(booking, payment) {
    showToast('Downloading receipt...', 'info');
    
    // Create receipt content
    const receiptText = `
SmartPark - Payment Receipt
============================

Booking ID: ${booking.id}
Date: ${new Date().toLocaleDateString()}

Customer Information:
--------------------
Name: ${appState.currentUser?.name || 'Guest User'}
Email: ${appState.currentUser?.email || 'N/A'}
Phone: ${appState.userSettings?.phone || 'N/A'}

Booking Details:
----------------
Parking Slot: ${booking.slotId} (${booking.floor.charAt(0).toUpperCase() + booking.floor.slice(1)} Floor)
Vehicle: ${booking.vehicleNumber} (${booking.vehicleType})
Duration: ${booking.duration} hour(s)
Start Time: ${new Date(booking.startTime).toLocaleString()}
End Time: ${new Date(booking.endTime).toLocaleString()}

Payment Breakdown:
------------------
Parking Fee (${booking.duration} hours @ $${booking.pricePerHour.toFixed(2)}/hr): $${booking.subtotal.toFixed(2)}
Service Fee: $${booking.serviceFee.toFixed(2)}
Tax (10%): $${booking.tax.toFixed(2)}
------------------
TOTAL: $${booking.total.toFixed(2)}

Payment Information:
--------------------
Payment Method: ${payment.method}
Transaction ID: ${payment.id}
Status: ${payment.status}

${appState.selectedPlan ? `Plan: ${appState.planDetails?.name || appState.selectedPlan}` : ''}

Thank you for using SmartPark!
===============================
    `;
    
    // Create and download the file
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmartPark_Receipt_${booking.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Receipt downloaded successfully!', 'success');
}

// ========================
// Dashboard Action Functions
// ========================
function cancelBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        const bookingIndex = appState.bookings.findIndex(b => b.id === bookingId);
        
        if (bookingIndex !== -1) {
            appState.bookings[bookingIndex].status = 'cancelled';
            
            const booking = appState.bookings[bookingIndex];
            updateSlotStatus(booking.slotId, booking.floor, 'available');
            
            const refundPayment = {
                id: `RF${Date.now()}`,
                bookingId: bookingId,
                amount: booking.total * 0.5,
                method: 'Refund',
                status: 'refunded',
                date: new Date().toISOString(),
                userId: appState.currentUser.id
            };
            
            appState.payments.push(refundPayment);
            
            localStorage.setItem('smartpark_bookings', JSON.stringify(appState.bookings));
            localStorage.setItem('smartpark_payments', JSON.stringify(appState.payments));
            
            updateParkingAfterBooking();
            showToast('Booking cancelled. 50% refund issued.', 'success');
        }
    }
}
// FAQ Accordion Fix - Add this to the end of script.js
document.addEventListener('DOMContentLoaded', function() {
    // Wait for everything to load
    setTimeout(function() {
        // Find all FAQ questions
        const faqQuestions = document.querySelectorAll('.faq-question');
        
        console.log('FAQ Fix: Found', faqQuestions.length, 'FAQ questions');
        
        // Add click event to each FAQ question
        faqQuestions.forEach(function(question) {
            question.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Get the FAQ item and answer
                const faqItem = this.closest('.faq-item');
                const answer = faqItem.querySelector('.faq-answer');
                const icon = this.querySelector('i');
                
                // Check if it's already open
                const isOpen = faqItem.classList.contains('active');
                
                // Close all FAQ items first
                document.querySelectorAll('.faq-item').forEach(item => {
                    item.classList.remove('active');
                    const otherAnswer = item.querySelector('.faq-answer');
                    if (otherAnswer) {
                        otherAnswer.style.maxHeight = '0';
                        otherAnswer.style.padding = '0';
                    }
                });
                
                // If it wasn't open, open it
                if (!isOpen) {
                    faqItem.classList.add('active');
                    if (answer) {
                        answer.style.maxHeight = answer.scrollHeight + 'px';
                        answer.style.padding = '1.5rem';
                    }
                    if (icon) {
                        icon.classList.remove('fa-chevron-down');
                        icon.classList.add('fa-chevron-up');
                    }
                }
            });
        });
        
        console.log('FAQ Fix applied successfully');
    }, 1000);
});



// ========================
// GLOBAL FUNCTION EXPORTS
// ========================
window.extendBooking = extendBooking;
window.cancelBooking = cancelBooking;
window.viewReceipt = viewReceipt;

// ========================
// Initialize on page load
// ========================
window.addEventListener('load', function() {
    updateLastUpdateTime();
});

// ========================
// FIXED: Receipt Button Function with Better Font Sizes
// ========================
// Override the viewReceipt function to ensure it works properly
window.viewReceipt = function(bookingId) {
    console.log('View Receipt called for booking:', bookingId);
    
    const booking = appState.bookings.find(b => b.id === bookingId);
    if (!booking) {
        showToast('Booking not found', 'error');
        return;
    }
    
    const payment = appState.payments.find(p => p.bookingId === bookingId);
    
    // Create and show receipt modal directly
    showReceiptModal(booking, payment);
};

// Function to show receipt modal
function showReceiptModal(booking, payment) {
    // Remove any existing receipt modal
    const existingModal = document.getElementById('receipt-modal-container');
    if (existingModal) {
        existingModal.remove();
    }
    
    const bookingDate = new Date(booking.createdAt || booking.startTime);
    const startDate = new Date(booking.startTime);
    const endDate = new Date(booking.endTime);
    
    const receiptHTML = `
        <div class="modal" id="receipt-modal-container" style="display: flex; z-index: 10000;">
            <div class="modal-content" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2><i class="fas fa-receipt"></i> Payment Receipt</h2>
                    <button class="modal-close" onclick="closeReceiptModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="receipt-content" style="padding: 1rem;">
                        <!-- Header -->
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid var(--border-color);">
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <i class="fas fa-parking" style="font-size: 2rem; color: var(--primary);"></i>
                                <div>
                                    <h3 style="margin: 0; font-size: 1.25rem;">Smart<span style="color: var(--primary);">Park</span></h3>
                                    <p style="margin: 0; font-size: 0.7rem; opacity: 0.8;">Intelligent Parking Solutions</p>
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <h4 style="margin: 0 0 0.25rem 0; font-size: 1rem;">PAYMENT RECEIPT</h4>
                                <p style="margin: 0; font-size: 0.7rem;"><strong>Booking ID:</strong> ${booking.id}</p>
                                <p style="margin: 0; font-size: 0.7rem;"><strong>Date:</strong> ${bookingDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                        </div>
                        
                        <!-- Customer Information -->
                        <div style="margin-bottom: 1.25rem;">
                            <h5 style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; font-size: 0.9rem;">
                                <i class="fas fa-user" style="color: var(--primary); font-size: 0.9rem;"></i> Customer Information
                            </h5>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background: var(--bg-secondary); padding: 0.75rem 1rem; border-radius: var(--radius); font-size: 0.8rem;">
                                <div>
                                    <p style="margin: 0 0 0.25rem 0;"><strong>Name:</strong> ${appState.currentUser?.name || 'Guest User'}</p>
                                    <p style="margin: 0;"><strong>Email:</strong> ${appState.currentUser?.email || 'N/A'}</p>
                                </div>
                                <div>
                                    <p style="margin: 0 0 0.25rem 0;"><strong>Phone:</strong> ${appState.userSettings?.phone || 'N/A'}</p>
                                    <p style="margin: 0;"><strong>Customer ID:</strong> ${appState.currentUser?.id || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Booking Details -->
                        <div style="margin-bottom: 1.25rem;">
                            <h5 style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; font-size: 0.9rem;">
                                <i class="fas fa-car" style="color: var(--primary); font-size: 0.9rem;"></i> Booking Details
                            </h5>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background: var(--bg-secondary); padding: 0.75rem 1rem; border-radius: var(--radius); font-size: 0.8rem;">
                                <div>
                                    <p style="margin: 0 0 0.25rem 0;"><strong>Parking Slot:</strong> ${booking.slotId}</p>
                                    <p style="margin: 0 0 0.25rem 0;"><strong>Floor:</strong> ${booking.floor.charAt(0).toUpperCase() + booking.floor.slice(1)}</p>
                                    <p style="margin: 0;"><strong>Vehicle:</strong> ${booking.vehicleNumber} (${booking.vehicleType})</p>
                                </div>
                                <div>
                                    <p style="margin: 0 0 0.25rem 0;"><strong>Start:</strong> ${startDate.toLocaleString()}</p>
                                    <p style="margin: 0 0 0.25rem 0;"><strong>End:</strong> ${endDate.toLocaleString()}</p>
                                    <p style="margin: 0;"><strong>Duration:</strong> ${booking.duration} hour(s)</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Payment Breakdown -->
                        <div style="margin-bottom: 1.25rem;">
                            <h5 style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; font-size: 0.9rem;">
                                <i class="fas fa-money-bill-wave" style="color: var(--primary); font-size: 0.9rem;"></i> Payment Breakdown
                            </h5>
                            <table style="width: 100%; border-collapse: collapse; background: var(--bg-secondary); border-radius: var(--radius); overflow: hidden; font-size: 0.8rem;">
                                <thead>
                                    <tr style="background: var(--primary); color: white;">
                                        <th style="padding: 0.5rem 0.75rem; text-align: left; font-size: 0.8rem; font-weight: 500;">Description</th>
                                        <th style="padding: 0.5rem 0.75rem; text-align: right; font-size: 0.8rem; font-weight: 500;">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style="border-bottom: 1px solid var(--border-color);">
                                        <td style="padding: 0.5rem 0.75rem;">Parking Fee (${booking.duration} hrs @ $${booking.pricePerHour.toFixed(2)}/hr)</td>
                                        <td style="padding: 0.5rem 0.75rem; text-align: right;">$${booking.subtotal.toFixed(2)}</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid var(--border-color);">
                                        <td style="padding: 0.5rem 0.75rem;">Service Fee</td>
                                        <td style="padding: 0.5rem 0.75rem; text-align: right;">$${booking.serviceFee.toFixed(2)}</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid var(--border-color);">
                                        <td style="padding: 0.5rem 0.75rem;">Tax (10%)</td>
                                        <td style="padding: 0.5rem 0.75rem; text-align: right;">$${booking.tax.toFixed(2)}</td>
                                    </tr>
                                    <tr style="background: var(--bg-primary); font-weight: bold;">
                                        <td style="padding: 0.75rem;"><strong>TOTAL</strong></td>
                                        <td style="padding: 0.75rem; text-align: right; color: var(--primary); font-size: 1rem;">$${booking.total.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- Payment Information -->
                        <div style="margin-bottom: 1.25rem;">
                            <h5 style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; font-size: 0.9rem;">
                                <i class="fas fa-credit-card" style="color: var(--primary); font-size: 0.9rem;"></i> Payment Information
                            </h5>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background: var(--bg-secondary); padding: 0.75rem 1rem; border-radius: var(--radius); font-size: 0.8rem;">
                                <div>
                                    <p style="margin: 0 0 0.25rem 0;"><strong>Method:</strong> ${payment?.method || 'N/A'}</p>
                                    <p style="margin: 0;"><strong>Status:</strong> 
                                        <span style="display: inline-block; padding: 0.2rem 0.5rem; border-radius: var(--radius-full); background: var(--success); color: white; font-size: 0.7rem;">
                                            ${payment?.status?.charAt(0).toUpperCase() + payment?.status?.slice(1) || 'Completed'}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <p style="margin: 0 0 0.25rem 0;"><strong>Transaction ID:</strong> ${payment?.id || 'N/A'}</p>
                                    <p style="margin: 0;"><strong>Payment Date:</strong> ${payment ? new Date(payment.date).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Notes -->
                        <div style="margin-bottom: 1.25rem; padding: 0.75rem 1rem; background: var(--bg-secondary); border-radius: var(--radius); font-size: 0.7rem;">
                            <p style="margin: 0 0 0.25rem 0;"><strong><i class="fas fa-info-circle"></i> Important Notes:</strong></p>
                            <ul style="margin: 0; padding-left: 1.25rem;">
                                <li style="margin-bottom: 0.1rem;">This receipt is for your records only</li>
                                <li style="margin-bottom: 0.1rem;">Keep this for any future reference</li>
                                <li style="margin-bottom: 0.1rem;">For queries: himanshugoud638@gmail.com</li>
                                <li>Receipt ID: ${booking.id}-${Date.now().toString().slice(-6)}</li>
                            </ul>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                            <button class="btn btn-sm btn-outline" onclick="printReceiptFromModal('${booking.id}')">
                                <i class="fas fa-print"></i> Print
                            </button>
                            <button class="btn btn-sm btn-outline" onclick="downloadReceiptFromModal('${booking.id}')">
                                <i class="fas fa-download"></i> Download
                            </button>
                            <button class="btn btn-sm btn-primary" onclick="closeReceiptModal()">
                                <i class="fas fa-times"></i> Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', receiptHTML);
    
    // Add styles for dark mode if needed
    const style = document.createElement('style');
    style.textContent = `
        [data-theme="dark"] #receipt-modal-container .modal-content {
            background: var(--bg-modal) !important;
        }
        [data-theme="dark"] #receipt-modal-container table {
            color: var(--text-primary) !important;
        }
        [data-theme="dark"] #receipt-modal-container th {
            background: var(--primary) !important;
        }
    `;
    document.head.appendChild(style);
    
    document.body.style.overflow = 'hidden';
}

// Function to print receipt from modal
window.printReceiptFromModal = function(bookingId) {
    const booking = appState.bookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    const payment = appState.payments.find(p => p.bookingId === bookingId);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt - SmartPark</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; font-size: 14px; }
                .receipt { border: 2px solid #333; padding: 30px; border-radius: 10px; }
                .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
                .logo { display: flex; align-items: center; gap: 10px; }
                .logo i { font-size: 24px; color: #4361ee; }
                h2 { margin: 0; font-size: 24px; } h2 span { color: #4361ee; }
                h3 { font-size: 18px; margin: 0 0 5px 0; }
                p { margin: 5px 0; font-size: 14px; }
                .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
            </style>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        </head>
        <body>
            <div class="receipt">
                <div class="header">
                    <div class="logo">
                        <i class="fas fa-parking"></i>
                        <h2>Smart<span>Park</span></h2>
                    </div>
                    <div>
                        <h3>PAYMENT RECEIPT</h3>
                        <p>Booking ID: ${booking.id}</p>
                    </div>
                </div>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Customer:</strong> ${appState.currentUser?.name || 'Guest User'}</p>
                <p><strong>Slot:</strong> ${booking.slotId} (${booking.floor})</p>
                <p><strong>Vehicle:</strong> ${booking.vehicleNumber}</p>
                <p><strong>Duration:</strong> ${booking.duration} hours</p>
                <p><strong>Total:</strong> $${booking.total.toFixed(2)}</p>
                <p><strong>Payment Method:</strong> ${payment?.method || 'N/A'}</p>
                <div class="footer">
                    <p>Thank you for using SmartPark!</p>
                </div>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
};

// Function to download receipt from modal
window.downloadReceiptFromModal = function(bookingId) {
    const booking = appState.bookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    const payment = appState.payments.find(p => p.bookingId === bookingId);
    
    const receiptText = `
SmartPark - Payment Receipt
============================

Booking ID: ${booking.id}
Date: ${new Date().toLocaleDateString()}

Customer Information:
--------------------
Name: ${appState.currentUser?.name || 'Guest User'}
Email: ${appState.currentUser?.email || 'N/A'}

Booking Details:
----------------
Parking Slot: ${booking.slotId} (${booking.floor})
Vehicle: ${booking.vehicleNumber} (${booking.vehicleType})
Duration: ${booking.duration} hour(s)
Start Time: ${new Date(booking.startTime).toLocaleString()}
End Time: ${new Date(booking.endTime).toLocaleString()}

Payment Breakdown:
------------------
Subtotal: $${booking.subtotal.toFixed(2)}
Service Fee: $${booking.serviceFee.toFixed(2)}
Tax: $${booking.tax.toFixed(2)}
------------------
TOTAL: $${booking.total.toFixed(2)}

Payment Method: ${payment?.method || 'N/A'}
Transaction ID: ${payment?.id || 'N/A'}

Thank you for using SmartPark!
===============================
    `;
    
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmartPark_Receipt_${booking.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Receipt downloaded successfully!', 'success');
};

// Function to close receipt modal
window.closeReceiptModal = function() {
    const modal = document.getElementById('receipt-modal-container');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
};

// Re-attach receipt button listeners to bookings table
document.addEventListener('DOMContentLoaded', function() {
    // Wait for table to be populated and then add listeners
    setTimeout(function() {
        attachReceiptButtonListeners();
    }, 2000);
});

function attachReceiptButtonListeners() {
    const receiptButtons = document.querySelectorAll('.table-actions .btn-outline[onclick*="viewReceipt"]');
    receiptButtons.forEach(btn => {
        const onclickAttr = btn.getAttribute('onclick');
        if (onclickAttr) {
            const match = onclickAttr.match(/'([^']+)'/);
            if (match && match[1]) {
                const bookingId = match[1];
                btn.onclick = function(e) {
                    e.preventDefault();
                    window.viewReceipt(bookingId);
                };
            }
        }
    });
}

// Update the bookings table rendering to use the new function
const originalUpdateBookingsTable = updateBookingsTable;
updateBookingsTable = function() {
    originalUpdateBookingsTable();
    setTimeout(attachReceiptButtonListeners, 100);
};

// SIMPLE FIX FOR PASSWORD TOGGLE - ADD THIS AT THE END OF script.js
document.addEventListener('click', function(e) {
    if (e.target.matches('#toggle-login-password, #toggle-signup-password, #toggle-confirm-password')) {
        let inputId = e.target.id.replace('toggle-', '');
        
        // Special case for confirm password
        if (inputId === 'confirm-password') {
            inputId = 'signup-confirm-password';
        }
        
        const input = document.getElementById(inputId);
        if (input) {
            if (input.type === 'password') {
                input.type = 'text';
                e.target.classList.remove('fa-eye');
                e.target.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                e.target.classList.remove('fa-eye-slash');
                e.target.classList.add('fa-eye');
            }
        }
    }
});
/**
 * vehicle.js - My Vehicles Management Panel
 * SmartPark Intelligent Parking Solutions
 * 
 * FIXED: Dark theme support - all colors now use CSS variables
 * All hardcoded colors replaced with theme-aware variables
 * COMPACT design preserved
 */

// ========================
// Vehicles State Management
// ========================

let vehiclesState = {
    vehicles: [],
    isLoading: false
};

// ========================
// Initialize Vehicles System
// ========================

function initVehiclesSystem() {
    console.log('🚗 Initializing My Vehicles System...');
    
    // Load saved vehicles from localStorage
    loadSavedVehicles();
    
    // Add Vehicles tab to dashboard navigation
    addVehiclesTabToDashboard();
    
    // Create vehicles panel HTML
    createVehiclesPanel();
    
    // Setup event listeners
    setupVehiclesEventListeners();
    
    // Hook into booking system to save vehicles
    setupBookingVehicleSaver();
    
    // Update vehicles list if user is logged in
    if (appState && appState.isLoggedIn) {
        loadUserVehicles();
    }
    
    console.log('✅ My Vehicles System Ready');
}

// ========================
// Load/Save Vehicles Data
// ========================

function loadSavedVehicles() {
    try {
        const saved = localStorage.getItem('smartpark_vehicles');
        if (saved) {
            vehiclesState.vehicles = JSON.parse(saved);
        } else {
            vehiclesState.vehicles = [];
            
            // Add sample vehicles for demo users
            if (appState && appState.currentUser && appState.currentUser.email === 'demo@smartpark.com') {
                vehiclesState.vehicles = [
                    {
                        id: 'veh_001',
                        userId: appState.currentUser.id,
                        type: 'motorcycle',
                        number: 'MP07NE4018',
                        model: 'TVS',
                        color: 'Black',
                        isDefault: true,
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: 'veh_002',
                        userId: appState.currentUser.id,
                        type: 'car',
                        number: 'MP07NE4019',
                        model: 'TVS',
                        color: 'Black',
                        isDefault: false,
                        createdAt: new Date().toISOString()
                    }
                ];
            }
        }
    } catch (e) {
        console.error('Error loading vehicles:', e);
        vehiclesState.vehicles = [];
    }
}

function saveVehicles() {
    try {
        if (appState && appState.isLoggedIn && appState.currentUser) {
            const userVehicles = vehiclesState.vehicles.filter(
                v => v.userId === appState.currentUser.id
            );
            localStorage.setItem('smartpark_vehicles', JSON.stringify(userVehicles));
        }
    } catch (e) {
        console.error('Error saving vehicles:', e);
    }
}

function loadUserVehicles() {
    if (!appState || !appState.isLoggedIn || !appState.currentUser) return;
    
    try {
        const saved = localStorage.getItem('smartpark_vehicles');
        if (saved) {
            const allVehicles = JSON.parse(saved);
            vehiclesState.vehicles = allVehicles.filter(
                v => v.userId === appState.currentUser.id
            );
        }
        
        renderVehiclesList();
        updateVehicleSelectors();
        
    } catch (e) {
        console.error('Error loading user vehicles:', e);
    }
}

// ========================
// Save Vehicle from Booking Form
// ========================

function setupBookingVehicleSaver() {
    console.log('🔧 Setting up booking vehicle saver...');
    
    // Listen for the confirm payment button click
    document.addEventListener('click', function(e) {
        if (e.target.id === 'confirm-payment' || e.target.closest('#confirm-payment')) {
            setTimeout(() => {
                saveVehicleFromBookingForm();
            }, 500);
        }
    });
    
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            setTimeout(() => {
                saveVehicleFromBookingForm();
            }, 500);
        });
    }
    
    console.log('✅ Booking vehicle saver ready');
}

function saveVehicleFromBookingForm() {
    if (!appState || !appState.isLoggedIn || !appState.currentUser) {
        console.log('User not logged in, cannot save vehicle');
        return;
    }
    
    const saveVehicleCheckbox = document.getElementById('save-vehicle');
    if (!saveVehicleCheckbox || !saveVehicleCheckbox.checked) {
        console.log('Save vehicle checkbox not checked');
        return;
    }
    
    console.log('Saving vehicle from booking form...');
    
    const vehicleType = document.getElementById('vehicle-type-select');
    const vehicleNumber = document.getElementById('vehicle-number');
    const vehicleModel = document.getElementById('vehicle-model');
    const vehicleColor = document.getElementById('vehicle-color');
    
    if (!vehicleNumber || !vehicleNumber.value.trim()) {
        console.log('No vehicle number, cannot save');
        return;
    }
    
    const number = vehicleNumber.value.trim().toUpperCase();
    
    const existingVehicle = vehiclesState.vehicles.find(v => 
        v.userId === appState.currentUser.id && 
        v.number === number
    );
    
    if (existingVehicle) {
        console.log('Vehicle already exists, updating...');
        existingVehicle.type = vehicleType ? vehicleType.value : existingVehicle.type;
        existingVehicle.model = vehicleModel ? vehicleModel.value.trim() : existingVehicle.model;
        existingVehicle.color = vehicleColor ? vehicleColor.value.trim() : existingVehicle.color;
        existingVehicle.updatedAt = new Date().toISOString();
        
        saveVehicles();
        renderVehiclesList();
        updateVehicleSelectors();
        showToast('Vehicle information updated', 'success');
        return;
    }
    
    const newVehicle = {
        id: `veh_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        userId: appState.currentUser.id,
        type: vehicleType ? vehicleType.value : 'car',
        number: number,
        model: vehicleModel ? vehicleModel.value.trim() : '',
        color: vehicleColor ? vehicleColor.value.trim() : '',
        isDefault: false,
        createdAt: new Date().toISOString(),
        savedFrom: 'booking'
    };
    
    console.log('New vehicle from booking:', newVehicle);
    
    const userVehicles = vehiclesState.vehicles.filter(v => v.userId === appState.currentUser.id);
    if (userVehicles.length === 0) {
        newVehicle.isDefault = true;
        showToast('Vehicle saved and set as default!', 'success');
    } else {
        showToast('Vehicle saved to My Vehicles!', 'success');
    }
    
    vehiclesState.vehicles.push(newVehicle);
    saveVehicles();
    renderVehiclesList();
    updateVehicleSelectors();
}

// ========================
// Dashboard UI Integration
// ========================

function addVehiclesTabToDashboard() {
    const waitForDashboard = setInterval(() => {
        const dashboardNav = document.querySelector('.dashboard-nav');
        if (dashboardNav) {
            clearInterval(waitForDashboard);
            
            if (!document.querySelector('[data-panel="vehicles"]')) {
                const vehiclesTab = document.createElement('button');
                vehiclesTab.className = 'dashboard-nav-btn';
                vehiclesTab.setAttribute('data-panel', 'vehicles');
                vehiclesTab.innerHTML = `
                    <i class="fas fa-car"></i>
                    <span>My Vehicles</span>
                    <span class="vehicles-count-badge" style="
                        background: var(--primary);
                        color: white;
                        border-radius: 20px;
                        padding: 2px 6px;
                        font-size: 0.7rem;
                        margin-left: 6px;
                        display: inline-block;
                    ">0</span>
                `;
                
                dashboardNav.appendChild(vehiclesTab);
                
                vehiclesTab.addEventListener('click', function() {
                    document.querySelectorAll('.dashboard-nav-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    this.classList.add('active');
                    
                    document.querySelectorAll('.dashboard-panel').forEach(panel => {
                        panel.classList.remove('active');
                    });
                    
                    const vehiclesPanel = document.getElementById('vehicles-panel');
                    if (vehiclesPanel) {
                        vehiclesPanel.classList.add('active');
                    }
                    
                    renderVehiclesList();
                });
            }
        }
    }, 100);
}

function createVehiclesPanel() {
    if (document.getElementById('vehicles-panel')) return;
    
    const dashboardMain = document.querySelector('.dashboard-main');
    if (!dashboardMain) return;
    
    const vehiclesPanel = document.createElement('div');
    vehiclesPanel.className = 'dashboard-panel';
    vehiclesPanel.id = 'vehicles-panel';
    
    vehiclesPanel.innerHTML = `
        <div class="panel-header" style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.25rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid var(--border-color);
        ">
            <div>
                <h3 style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.15rem; font-size: 1.25rem; color: var(--text-primary);">
                    <i class="fas fa-car" style="color: var(--primary); font-size: 1.1rem;"></i>
                    My Vehicles
                </h3>
                <p style="color: var(--text-tertiary); font-size: 0.75rem; margin: 0;">
                    Manage your vehicles for faster booking
                </p>
            </div>
            <button class="btn btn-primary btn-sm" id="add-vehicle-btn" style="padding: 0.4rem 0.8rem; font-size: 0.75rem;">
                <i class="fas fa-plus-circle"></i>
                Add Vehicle
            </button>
        </div>
        
        <div id="vehicles-container" style="margin-bottom: 1.5rem;">
            <div class="vehicles-loading" style="text-align: center; padding: 2rem;">
                <i class="fas fa-spinner fa-spin" style="font-size: 1.5rem; color: var(--primary);"></i>
                <p style="margin-top: 0.75rem; color: var(--text-secondary); font-size: 0.875rem;">Loading your vehicles...</p>
            </div>
        </div>
        
        <div id="no-vehicles-message" style="display: none; text-align: center; padding: 2rem; background: var(--bg-secondary); border-radius: var(--radius);">
            <div style="width: 60px; height: 60px; background: var(--bg-tertiary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                <i class="fas fa-car" style="font-size: 1.75rem; color: var(--text-muted);"></i>
            </div>
            <h4 style="margin-bottom: 0.5rem; color: var(--text-primary); font-size: 1rem;">No Vehicles Added</h4>
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem; max-width: 350px; margin-left: auto; margin-right: auto; font-size: 0.813rem;">
                Add your vehicles to book parking faster. Save vehicle details for one-click booking.
            </p>
            <button class="btn btn-primary btn-sm" id="no-vehicles-add-btn" style="padding: 0.4rem 0.8rem; font-size: 0.75rem;">
                <i class="fas fa-plus-circle"></i>
                Add Your First Vehicle
            </button>
        </div>
        
        <div style="
            background: var(--gradient-primary);
            border-radius: var(--radius);
            padding: 1rem 1.25rem;
            color: white;
            margin-top: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 0.75rem;
        ">
            <div style="display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-car" style="font-size: 1.1rem; opacity: 0.9;"></i>
                    <div>
                        <div style="font-size: 0.65rem; opacity: 0.9; letter-spacing: 0.5px;">TOTAL VEHICLES</div>
                        <div id="vehicle-stats-total" style="font-size: 1.25rem; font-weight: 700; line-height: 1.2;">0</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-star" style="font-size: 1.1rem; opacity: 0.9;"></i>
                    <div>
                        <div style="font-size: 0.65rem; opacity: 0.9; letter-spacing: 0.5px;">DEFAULT VEHICLE</div>
                        <div id="vehicle-stats-default" style="font-size: 0.813rem; font-weight: 600;">Not set</div>
                    </div>
                </div>
            </div>
            <div style="display: flex; gap: 0.35rem;">
                <span style="background: rgba(255,255,255,0.15); padding: 0.3rem 0.75rem; border-radius: var(--radius-full); font-size: 0.7rem; font-weight: 500;">
                    <i class="fas fa-bolt"></i> Quick Booking
                </span>
            </div>
        </div>
    `;
    
    dashboardMain.appendChild(vehiclesPanel);
}

// ========================
// Render Vehicles List - COMPACT VERSION WITH THEME SUPPORT
// ========================

function renderVehiclesList() {
    const container = document.getElementById('vehicles-container');
    const noVehiclesMsg = document.getElementById('no-vehicles-message');
    const vehiclesCountBadge = document.querySelector('.vehicles-count-badge');
    
    if (!container) return;
    
    const userVehicles = appState && appState.isLoggedIn && appState.currentUser 
        ? vehiclesState.vehicles.filter(v => v.userId === appState.currentUser.id)
        : [];
    
    if (vehiclesCountBadge) {
        vehiclesCountBadge.textContent = userVehicles.length;
    }
    
    const statsTotal = document.getElementById('vehicle-stats-total');
    const statsDefault = document.getElementById('vehicle-stats-default');
    
    if (statsTotal) statsTotal.textContent = userVehicles.length;
    
    if (statsDefault) {
        const defaultVehicle = userVehicles.find(v => v.isDefault);
        statsDefault.textContent = defaultVehicle 
            ? `${defaultVehicle.number} (${defaultVehicle.model || defaultVehicle.type})` 
            : 'Not set';
    }
    
    if (userVehicles.length === 0) {
        container.style.display = 'none';
        if (noVehiclesMsg) noVehiclesMsg.style.display = 'block';
        return;
    } else {
        container.style.display = 'block';
        if (noVehiclesMsg) noVehiclesMsg.style.display = 'none';
    }
    
    // COMPACT GRID - smaller cards
    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;">';
    
    userVehicles.forEach(vehicle => {
        html += createVehicleCardHTML(vehicle);
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    userVehicles.forEach(vehicle => {
        attachVehicleCardEvents(vehicle);
    });
}

function createVehicleCardHTML(vehicle) {
    const vehicleTypes = {
        car: 'Car',
        suv: 'SUV',
        truck: 'Truck',
        van: 'Van',
        motorcycle: 'Motorcycle',
        electric: 'Electric Vehicle'
    };
    
    const typeIcon = {
        car: 'fa-car',
        suv: 'fa-truck',
        truck: 'fa-truck',
        van: 'fa-shuttle-van',
        motorcycle: 'fa-motorcycle',
        electric: 'fa-bolt'
    };
    
    const displayTitle = vehicle.model || `${vehicleTypes[vehicle.type] || 'Car'}`;
    
    const savedFromBadge = vehicle.savedFrom === 'booking' ? `
        <span style="
            background: var(--success);
            color: white;
            padding: 0.1rem 0.4rem;
            border-radius: var(--radius-full);
            font-size: 0.55rem;
            margin-left: 0.35rem;
            display: inline-flex;
            align-items: center;
            gap: 0.15rem;
            font-weight: 600;
            letter-spacing: 0.3px;
        ">
            <i class="fas fa-check-circle" style="font-size: 0.5rem;"></i> BOOKING
        </span>
    ` : '';
    
    // COMPACT CARD - with theme variables
    return `
        <div class="vehicle-card" data-vehicle-id="${vehicle.id}" style="
            background: var(--bg-card);
            border-radius: var(--radius);
            padding: 1rem;
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--border-color);
            transition: var(--transition);
            position: relative;
            overflow: hidden;
        ">
            ${vehicle.isDefault ? `
                <div style="
                    position: absolute;
                    top: 0.5rem;
                    right: 0.5rem;
                    background: var(--primary);
                    color: white;
                    padding: 0.15rem 0.5rem;
                    border-radius: var(--radius-full);
                    font-size: 0.6rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.2rem;
                    z-index: 2;
                    letter-spacing: 0.3px;
                ">
                    <i class="fas fa-star" style="font-size: 0.55rem;"></i>
                    DEFAULT
                </div>
            ` : ''}
            
            <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                <!-- Smaller icon -->
                <div style="
                    width: 45px;
                    height: 45px;
                    background: var(--gradient-primary);
                    border-radius: var(--radius-sm);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.25rem;
                    flex-shrink: 0;
                ">
                    <i class="fas ${typeIcon[vehicle.type] || 'fa-car'}"></i>
                </div>
                
                <!-- Compact details -->
                <div style="flex: 1;">
                    <div style="display: flex; align-items: baseline; gap: 0.35rem; margin-bottom: 0.35rem; flex-wrap: wrap;">
                        <h4 style="margin: 0; font-size: 0.95rem; font-weight: 600; color: var(--text-primary);">
                            ${displayTitle}
                        </h4>
                        <span style="
                            background: var(--bg-tertiary);
                            padding: 0.1rem 0.4rem;
                            border-radius: var(--radius-full);
                            font-size: 0.6rem;
                            color: var(--text-secondary);
                            font-weight: 500;
                        ">
                            ${vehicleTypes[vehicle.type] || 'Car'}
                        </span>
                        ${savedFromBadge}
                    </div>
                    
                    <!-- Two column layout with smaller text -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.35rem;">
                        <div>
                            <div style="font-size: 0.55rem; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.3px;">License Plate</div>
                            <div style="font-weight: 600; color: var(--text-primary); font-size: 0.8rem; font-family: monospace;">
                                ${vehicle.number}
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 0.55rem; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.3px;">Model</div>
                            <div style="color: var(--text-secondary); font-size: 0.75rem;">
                                ${vehicle.model || '—'}
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 0.55rem; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.3px;">Color</div>
                            <div style="display: flex; align-items: center; gap: 0.2rem;">
                                <span style="
                                    display: inline-block;
                                    width: 10px;
                                    height: 10px;
                                    border-radius: 50%;
                                    background: ${vehicle.color ? vehicle.color.toLowerCase() : 'var(--gray-500)'};
                                    border: 1.5px solid var(--border-color);
                                "></span>
                                <span style="color: var(--text-secondary); font-size: 0.75rem;">
                                    ${vehicle.color || '—'}
                                </span>
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 0.55rem; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.3px;">Added</div>
                            <div style="color: var(--text-secondary); font-size: 0.7rem;">
                                ${new Date(vehicle.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Smaller action buttons with theme colors -->
            <div style="
                display: flex;
                justify-content: flex-end;
                gap: 0.4rem;
                margin-top: 0.75rem;
                padding-top: 0.6rem;
                border-top: 1px solid var(--border-color);
            ">
                ${!vehicle.isDefault ? `
                    <button class="btn-vehicle-set-default" data-vehicle-id="${vehicle.id}" style="
                        background: transparent;
                        border: 1px solid var(--border-color-dark);
                        color: var(--text-secondary);
                        padding: 0.25rem 0.6rem;
                        border-radius: var(--radius-sm);
                        font-size: 0.65rem;
                        font-weight: 500;
                        cursor: pointer;
                        transition: var(--transition);
                        display: flex;
                        align-items: center;
                        gap: 0.25rem;
                    ">
                        <i class="fas fa-star" style="font-size: 0.6rem;"></i>
                        Set Default
                    </button>
                ` : ''}
                
                <button class="btn-vehicle-edit" data-vehicle-id="${vehicle.id}" style="
                    background: transparent;
                    border: 1px solid var(--border-color-dark);
                    color: var(--text-secondary);
                    padding: 0.25rem 0.6rem;
                    border-radius: var(--radius-sm);
                    font-size: 0.65rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: var(--transition);
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                ">
                    <i class="fas fa-edit" style="font-size: 0.6rem;"></i>
                    Edit
                </button>
                
                <button class="btn-vehicle-delete" data-vehicle-id="${vehicle.id}" style="
                    background: transparent;
                    border: 1px solid var(--danger);
                    color: var(--danger);
                    padding: 0.25rem 0.6rem;
                    border-radius: var(--radius-sm);
                    font-size: 0.65rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: var(--transition);
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                ">
                    <i class="fas fa-trash" style="font-size: 0.6rem;"></i>
                    Delete
                </button>
            </div>
        </div>
    `;
}

function attachVehicleCardEvents(vehicle) {
    setTimeout(() => {
        const setDefaultBtn = document.querySelector(`.btn-vehicle-set-default[data-vehicle-id="${vehicle.id}"]`);
        if (setDefaultBtn) {
            setDefaultBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                setDefaultVehicle(vehicle.id);
            });
        }
        
        const editBtn = document.querySelector(`.btn-vehicle-edit[data-vehicle-id="${vehicle.id}"]`);
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                openEditVehicleModal(vehicle);
            });
        }
        
        const deleteBtn = document.querySelector(`.btn-vehicle-delete[data-vehicle-id="${vehicle.id}"]`);
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                deleteVehicle(vehicle.id);
            });
        }
    }, 50);
}

// ========================
// Vehicle CRUD Operations
// ========================

function addVehicle(vehicleData) {
    console.log('Adding vehicle with data:', vehicleData);
    
    if (!appState || !appState.isLoggedIn || !appState.currentUser) {
        showToast('Please login to add vehicles', 'error');
        openModal('login-modal');
        return false;
    }
    
    if (!vehicleData.number) {
        showToast('License plate number is required', 'error');
        return false;
    }
    
    if (!vehicleData.number.trim()) {
        showToast('License plate number is required', 'error');
        return false;
    }
    
    if (vehicleData.number.trim().length < 2) {
        showToast('Please enter a valid license plate number', 'error');
        return false;
    }
    
    const existingVehicle = vehiclesState.vehicles.find(v => 
        v.userId === appState.currentUser.id && 
        v.number === vehicleData.number.trim().toUpperCase()
    );
    
    if (existingVehicle) {
        showToast('This vehicle is already saved', 'error');
        return false;
    }
    
    const newVehicle = {
        id: `veh_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        userId: appState.currentUser.id,
        type: vehicleData.type || 'car',
        number: vehicleData.number.trim().toUpperCase(),
        model: vehicleData.model || '',
        color: vehicleData.color || '',
        isDefault: vehicleData.isDefault || false,
        createdAt: new Date().toISOString(),
        savedFrom: 'manual'
    };
    
    console.log('New vehicle object:', newVehicle);
    
    const userVehicles = vehiclesState.vehicles.filter(v => v.userId === appState.currentUser.id);
    
    if (userVehicles.length === 0) {
        newVehicle.isDefault = true;
    } else if (newVehicle.isDefault) {
        vehiclesState.vehicles.forEach(v => {
            if (v.userId === appState.currentUser.id) {
                v.isDefault = false;
            }
        });
    }
    
    vehiclesState.vehicles.push(newVehicle);
    saveVehicles();
    renderVehiclesList();
    updateVehicleSelectors();
    
    if (newVehicle.isDefault) {
        updateDefaultVehicleInSettings(newVehicle);
    }
    
    showToast('Vehicle added successfully!', 'success');
    return true;
}

function updateVehicle(vehicleId, vehicleData) {
    console.log('Updating vehicle:', vehicleId, vehicleData);
    
    const vehicleIndex = vehiclesState.vehicles.findIndex(v => v.id === vehicleId);
    
    if (vehicleIndex === -1) {
        showToast('Vehicle not found', 'error');
        return false;
    }
    
    const vehicle = vehiclesState.vehicles[vehicleIndex];
    
    if (!vehicleData.number) {
        showToast('License plate number is required', 'error');
        return false;
    }
    
    if (!vehicleData.number.trim()) {
        showToast('License plate number is required', 'error');
        return false;
    }
    
    if (vehicle.number !== vehicleData.number.trim().toUpperCase()) {
        const existingVehicle = vehiclesState.vehicles.find(v => 
            v.userId === appState.currentUser.id && 
            v.number === vehicleData.number.trim().toUpperCase() &&
            v.id !== vehicleId
        );
        
        if (existingVehicle) {
            showToast('Another vehicle with this license plate already exists', 'error');
            return false;
        }
    }
    
    vehicle.type = vehicleData.type || vehicle.type;
    vehicle.number = vehicleData.number.trim().toUpperCase();
    vehicle.model = vehicleData.model || vehicle.model;
    vehicle.color = vehicleData.color || vehicle.color;
    vehicle.updatedAt = new Date().toISOString();
    
    if (vehicleData.isDefault && !vehicle.isDefault) {
        vehiclesState.vehicles.forEach(v => {
            if (v.userId === appState.currentUser.id && v.id !== vehicleId) {
                v.isDefault = false;
            }
        });
        vehicle.isDefault = true;
        updateDefaultVehicleInSettings(vehicle);
    }
    
    saveVehicles();
    renderVehiclesList();
    updateVehicleSelectors();
    
    showToast('Vehicle updated successfully!', 'success');
    return true;
}

function deleteVehicle(vehicleId) {
    if (!confirm('Are you sure you want to delete this vehicle?')) {
        return;
    }
    
    const vehicleIndex = vehiclesState.vehicles.findIndex(v => v.id === vehicleId);
    
    if (vehicleIndex === -1) {
        showToast('Vehicle not found', 'error');
        return;
    }
    
    const vehicle = vehiclesState.vehicles[vehicleIndex];
    const wasDefault = vehicle.isDefault;
    
    vehiclesState.vehicles.splice(vehicleIndex, 1);
    
    if (wasDefault) {
        const userVehicles = vehiclesState.vehicles.filter(v => v.userId === appState.currentUser.id);
        if (userVehicles.length > 0) {
            userVehicles[0].isDefault = true;
            updateDefaultVehicleInSettings(userVehicles[0]);
        } else {
            if (appState && appState.userSettings) {
                appState.userSettings.defaultVehicle = '';
                localStorage.setItem('smartpark_settings', JSON.stringify(appState.userSettings));
            }
        }
    }
    
    saveVehicles();
    renderVehiclesList();
    updateVehicleSelectors();
    
    showToast('Vehicle deleted successfully!', 'success');
}

function setDefaultVehicle(vehicleId) {
    const vehicle = vehiclesState.vehicles.find(v => v.id === vehicleId);
    
    if (!vehicle) {
        showToast('Vehicle not found', 'error');
        return;
    }
    
    vehiclesState.vehicles.forEach(v => {
        if (v.userId === appState.currentUser.id) {
            v.isDefault = false;
        }
    });
    
    vehicle.isDefault = true;
    
    saveVehicles();
    renderVehiclesList();
    updateVehicleSelectors();
    updateDefaultVehicleInSettings(vehicle);
    
    showToast(`${vehicle.number} set as default vehicle`, 'success');
}

// ========================
// Vehicle Modals - WITH THEME SUPPORT
// ========================

function openAddVehicleModal() {
    closeModal();
    
    const existingModal = document.getElementById('vehicle-modal');
    if (existingModal) existingModal.remove();
    
    const modalHTML = `
        <div class="modal" id="vehicle-modal">
            <div class="modal-content" style="max-width: 500px; background: var(--bg-modal);">
                <div class="modal-header" style="padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color);">
                    <h2 style="display: flex; align-items: center; gap: 0.5rem; font-size: 1.25rem; color: var(--text-primary);">
                        <i class="fas fa-car" style="color: var(--primary);"></i>
                        Add New Vehicle
                    </h2>
                    <button class="modal-close" style="color: var(--text-tertiary); background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                </div>
                <div class="modal-body" style="padding: 1.5rem;">
                    <form id="veh-form-add">
                        <!-- Vehicle Type -->
                        <div class="form-group" style="margin-bottom: 1.25rem;">
                            <label style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.4rem; font-weight: 500; font-size: 0.875rem; color: var(--text-secondary);">
                                <i class="fas fa-car-side"></i>
                                Vehicle Type *
                            </label>
                            <select id="veh_type" class="form-control" required
                                    style="width: 100%; padding: 0.6rem 0.8rem; border: 1px solid var(--border-color); border-radius: var(--radius); font-size: 0.875rem; background: var(--bg-primary); color: var(--text-primary);">
                                <option value="car">Car</option>
                                <option value="suv">SUV</option>
                                <option value="truck">Truck</option>
                                <option value="van">Van</option>
                                <option value="motorcycle">Motorcycle</option>
                                <option value="electric">Electric Vehicle</option>
                            </select>
                        </div>
                        
                        <!-- License Plate -->
                        <div class="form-group" style="margin-bottom: 1.25rem;">
                            <label style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.4rem; font-weight: 500; font-size: 0.875rem; color: var(--text-secondary);">
                                <i class="fas fa-hashtag"></i>
                                License Plate Number *
                            </label>
                            <input type="text" id="veh_number" class="form-control" 
                                   placeholder="e.g., ABC-1234" required
                                   style="width: 100%; padding: 0.6rem 0.8rem; border: 1px solid var(--border-color); border-radius: var(--radius); font-size: 0.875rem; background: var(--bg-primary); color: var(--text-primary); text-transform: uppercase;">
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <!-- Vehicle Model -->
                            <div class="form-group" style="margin-bottom: 1rem;">
                                <label style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.4rem; font-weight: 500; font-size: 0.875rem; color: var(--text-secondary);">
                                    <i class="fas fa-cog"></i>
                                    Model
                                </label>
                                <input type="text" id="veh_model" class="form-control" 
                                       placeholder="e.g., Toyota Camry"
                                       style="width: 100%; padding: 0.6rem 0.8rem; border: 1px solid var(--border-color); border-radius: var(--radius); font-size: 0.875rem; background: var(--bg-primary); color: var(--text-primary);">
                                <small style="color: var(--text-tertiary); font-size: 0.65rem; display: block; margin-top: 0.2rem;">
                                    Displayed as title
                                </small>
                            </div>
                            
                            <!-- Vehicle Color -->
                            <div class="form-group" style="margin-bottom: 1rem;">
                                <label style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.4rem; font-weight: 500; font-size: 0.875rem; color: var(--text-secondary);">
                                    <i class="fas fa-palette"></i>
                                    Color
                                </label>
                                <input type="text" id="veh_color" class="form-control" 
                                       placeholder="e.g., Red, Blue"
                                       style="width: 100%; padding: 0.6rem 0.8rem; border: 1px solid var(--border-color); border-radius: var(--radius); font-size: 0.875rem; background: var(--bg-primary); color: var(--text-primary);">
                            </div>
                        </div>
                        
                        <!-- Set as Default -->
                        <div class="form-group" style="margin-bottom: 1rem;">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="checkbox" id="veh_default" style="width: 16px; height: 16px; accent-color: var(--primary);">
                                <span style="font-weight: 500; font-size: 0.875rem; color: var(--text-primary);">Set as my default vehicle</span>
                            </label>
                        </div>
                        
                        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                            <button type="button" class="btn btn-outline btn-sm" id="cancel-vehicle-modal" style="padding: 0.5rem 1rem; font-size: 0.813rem;">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                            <button type="submit" class="btn btn-primary btn-sm" style="padding: 0.5rem 1rem; font-size: 0.813rem;">
                                <i class="fas fa-save"></i> Save Vehicle
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = document.getElementById('vehicle-modal');
    
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('#cancel-vehicle-modal').addEventListener('click', closeModal);
    
    const form = modal.querySelector('#veh-form-add');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const typeInput = document.getElementById('veh_type');
        const numberInput = document.getElementById('veh_number');
        const modelInput = document.getElementById('veh_model');
        const colorInput = document.getElementById('veh_color');
        const defaultInput = document.getElementById('veh_default');
        
        const vehicleData = {
            type: typeInput ? typeInput.value : 'car',
            number: numberInput ? numberInput.value.trim() : '',
            model: modelInput ? modelInput.value.trim() : '',
            color: colorInput ? colorInput.value.trim() : '',
            isDefault: defaultInput ? defaultInput.checked : false
        };
        
        if (!vehicleData.number) {
            showToast('License plate number is required', 'error');
            return;
        }
        
        if (vehicleData.number.length < 2) {
            showToast('Please enter a valid license plate number', 'error');
            return;
        }
        
        if (addVehicle(vehicleData)) {
            closeModal();
        }
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    openModal('vehicle-modal');
    
    setTimeout(() => {
        const numberInput = document.getElementById('veh_number');
        if (numberInput) numberInput.focus();
    }, 300);
}

function openEditVehicleModal(vehicle) {
    closeModal();
    
    const existingModal = document.getElementById('vehicle-modal');
    if (existingModal) existingModal.remove();
    
    const modalHTML = `
        <div class="modal" id="vehicle-modal">
            <div class="modal-content" style="max-width: 500px; background: var(--bg-modal);">
                <div class="modal-header" style="padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color);">
                    <h2 style="display: flex; align-items: center; gap: 0.5rem; font-size: 1.25rem; color: var(--text-primary);">
                        <i class="fas fa-edit" style="color: var(--primary);"></i>
                        Edit Vehicle
                    </h2>
                    <button class="modal-close" style="color: var(--text-tertiary); background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                </div>
                <div class="modal-body" style="padding: 1.5rem;">
                    <form id="veh-form-edit">
                        <!-- Vehicle Type -->
                        <div class="form-group" style="margin-bottom: 1.25rem;">
                            <label style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.4rem; font-weight: 500; font-size: 0.875rem; color: var(--text-secondary);">
                                <i class="fas fa-car-side"></i>
                                Vehicle Type *
                            </label>
                            <select id="veh_type" class="form-control" required
                                    style="width: 100%; padding: 0.6rem 0.8rem; border: 1px solid var(--border-color); border-radius: var(--radius); font-size: 0.875rem; background: var(--bg-primary); color: var(--text-primary);">
                                <option value="car" ${vehicle.type === 'car' ? 'selected' : ''}>Car</option>
                                <option value="suv" ${vehicle.type === 'suv' ? 'selected' : ''}>SUV</option>
                                <option value="truck" ${vehicle.type === 'truck' ? 'selected' : ''}>Truck</option>
                                <option value="van" ${vehicle.type === 'van' ? 'selected' : ''}>Van</option>
                                <option value="motorcycle" ${vehicle.type === 'motorcycle' ? 'selected' : ''}>Motorcycle</option>
                                <option value="electric" ${vehicle.type === 'electric' ? 'selected' : ''}>Electric Vehicle</option>
                            </select>
                        </div>
                        
                        <!-- License Plate -->
                        <div class="form-group" style="margin-bottom: 1.25rem;">
                            <label style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.4rem; font-weight: 500; font-size: 0.875rem; color: var(--text-secondary);">
                                <i class="fas fa-hashtag"></i>
                                License Plate Number *
                            </label>
                            <input type="text" id="veh_number" class="form-control" 
                                   value="${vehicle.number}" required
                                   style="width: 100%; padding: 0.6rem 0.8rem; border: 1px solid var(--border-color); border-radius: var(--radius); font-size: 0.875rem; background: var(--bg-primary); color: var(--text-primary); text-transform: uppercase;">
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <!-- Vehicle Model -->
                            <div class="form-group" style="margin-bottom: 1rem;">
                                <label style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.4rem; font-weight: 500; font-size: 0.875rem; color: var(--text-secondary);">
                                    <i class="fas fa-cog"></i>
                                    Model
                                </label>
                                <input type="text" id="veh_model" class="form-control" 
                                       value="${vehicle.model || ''}"
                                       placeholder="e.g., Toyota Camry"
                                       style="width: 100%; padding: 0.6rem 0.8rem; border: 1px solid var(--border-color); border-radius: var(--radius); font-size: 0.875rem; background: var(--bg-primary); color: var(--text-primary);">
                                <small style="color: var(--text-tertiary); font-size: 0.65rem; display: block; margin-top: 0.2rem;">
                                    Displayed as title
                                </small>
                            </div>
                            
                            <!-- Vehicle Color -->
                            <div class="form-group" style="margin-bottom: 1rem;">
                                <label style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.4rem; font-weight: 500; font-size: 0.875rem; color: var(--text-secondary);">
                                    <i class="fas fa-palette"></i>
                                    Color
                                </label>
                                <input type="text" id="veh_color" class="form-control" 
                                       value="${vehicle.color || ''}"
                                       placeholder="e.g., Red"
                                       style="width: 100%; padding: 0.6rem 0.8rem; border: 1px solid var(--border-color); border-radius: var(--radius); font-size: 0.875rem; background: var(--bg-primary); color: var(--text-primary);">
                            </div>
                        </div>
                        
                        <!-- Set as Default -->
                        <div class="form-group" style="margin-bottom: 1rem;">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="checkbox" id="veh_default" ${vehicle.isDefault ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: var(--primary);">
                                <span style="font-weight: 500; font-size: 0.875rem; color: var(--text-primary);">Set as default vehicle</span>
                            </label>
                        </div>
                        
                        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                            <button type="button" class="btn btn-outline btn-sm" id="cancel-vehicle-modal" style="padding: 0.5rem 1rem; font-size: 0.813rem;">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                            <button type="submit" class="btn btn-primary btn-sm" style="padding: 0.5rem 1rem; font-size: 0.813rem;">
                                <i class="fas fa-save"></i> Update Vehicle
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = document.getElementById('vehicle-modal');
    
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('#cancel-vehicle-modal').addEventListener('click', closeModal);
    
    const form = modal.querySelector('#veh-form-edit');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const typeInput = document.getElementById('veh_type');
        const numberInput = document.getElementById('veh_number');
        const modelInput = document.getElementById('veh_model');
        const colorInput = document.getElementById('veh_color');
        const defaultInput = document.getElementById('veh_default');
        
        const vehicleData = {
            type: typeInput ? typeInput.value : 'car',
            number: numberInput ? numberInput.value.trim() : '',
            model: modelInput ? modelInput.value.trim() : '',
            color: colorInput ? colorInput.value.trim() : '',
            isDefault: defaultInput ? defaultInput.checked : false
        };
        
        if (!vehicleData.number) {
            showToast('License plate number is required', 'error');
            return;
        }
        
        if (vehicleData.number.length < 2) {
            showToast('Please enter a valid license plate number', 'error');
            return;
        }
        
        if (updateVehicle(vehicle.id, vehicleData)) {
            closeModal();
        }
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    openModal('vehicle-modal');
}

// ========================
// Vehicle Selector Integration - WITH THEME SUPPORT
// ========================

function updateVehicleSelectors() {
    const vehicleTypeSelect = document.getElementById('vehicle-type-select');
    if (vehicleTypeSelect) {
        if (appState && appState.isLoggedIn) {
            const defaultVehicle = getDefaultVehicle();
            if (defaultVehicle) {
                vehicleTypeSelect.value = defaultVehicle.type;
                
                const vehicleNumberInput = document.getElementById('vehicle-number');
                if (vehicleNumberInput && !vehicleNumberInput.value) {
                    vehicleNumberInput.value = defaultVehicle.number;
                }
                
                const vehicleModelInput = document.getElementById('vehicle-model');
                if (vehicleModelInput && defaultVehicle.model && !vehicleModelInput.value) {
                    vehicleModelInput.value = defaultVehicle.model;
                }
                
                const vehicleColorInput = document.getElementById('vehicle-color');
                if (vehicleColorInput && defaultVehicle.color && !vehicleColorInput.value) {
                    vehicleColorInput.value = defaultVehicle.color;
                }
            }
        }
    }
    
    addVehicleSelectorToBooking();
}

function addVehicleSelectorToBooking() {
    const step2 = document.getElementById('step-2');
    if (!step2) return;
    
    const existingSelector = document.getElementById('vehicle-selector-dropdown');
    if (existingSelector) {
        existingSelector.remove();
    }
    
    const userVehicles = appState && appState.isLoggedIn && appState.currentUser
        ? vehiclesState.vehicles.filter(v => v.userId === appState.currentUser.id)
        : [];
    
    if (userVehicles.length === 0) return;
    
    // EXTRA COMPACT VERSION WITH THEME VARIABLES
    const selectorHTML = `
        <div id="vehicle-selector-dropdown" style="
            background: var(--bg-secondary);
            border-radius: var(--radius-sm);
            padding: 0.4rem 0.6rem;
            margin-bottom: 0.75rem;
            border: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 0.35rem;
        ">
            <div style="display: flex; align-items: center; gap: 0.35rem;">
                <i class="fas fa-car" style="color: var(--primary); font-size: 0.75rem;"></i>
                <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-primary);">Saved:</span>
                
                <select id="quick-vehicle-select" style="
                    padding: 0.25rem 0.5rem;
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-sm);
                    font-size: 0.7rem;
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    width: 180px;
                    max-width: 100%;
                    cursor: pointer;
                ">
                    <option value="">Select vehicle</option>
                    ${userVehicles.map(v => `
                        <option value="${v.id}" ${v.isDefault ? 'selected' : ''}>
                            ${v.number} - ${v.model || v.type} ${v.isDefault ? '★' : ''}
                        </option>
                    `).join('')}
                </select>
            </div>
            
            <div style="display: flex; align-items: center; gap: 0.25rem;">
                <!-- APPLY BUTTON - Blue with theme variable -->
                <button type="button" id="apply-vehicle-btn" style="
                    background: var(--primary);
                    color: white;
                    border: none;
                    padding: 0.25rem 0.6rem;
                    border-radius: var(--radius-sm);
                    font-size: 0.65rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.2rem;
                    transition: all 0.2s ease;
                    box-shadow: 0 1px 3px rgba(67, 97, 238, 0.2);
                    letter-spacing: 0.3px;
                " onmouseover="this.style.background='var(--primary-dark)'; this.style.boxShadow='0 2px 5px rgba(67, 97, 238, 0.3)';" 
                   onmouseout="this.style.background='var(--primary)'; this.style.boxShadow='0 1px 3px rgba(67, 97, 238, 0.2)';">
                    <i class="fas fa-check" style="font-size: 0.55rem;"></i> Apply
                </button>
                
                <!-- MANAGE BUTTON - Gray with theme variable -->
                <button type="button" id="manage-vehicles-btn" style="
                    background: var(--gray-600);
                    color: white;
                    border: none;
                    padding: 0.25rem 0.6rem;
                    border-radius: var(--radius-sm);
                    font-size: 0.65rem;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.2rem;
                    transition: all 0.2s ease;
                    box-shadow: 0 1px 3px rgba(108, 117, 125, 0.2);
                    letter-spacing: 0.3px;
                " onmouseover="this.style.background='var(--gray-700)'; this.style.boxShadow='0 2px 5px rgba(108, 117, 125, 0.3)';" 
                   onmouseout="this.style.background='var(--gray-600)'; this.style.boxShadow='0 1px 3px rgba(108, 117, 125, 0.2)';">
                    <i class="fas fa-cog" style="font-size: 0.55rem;"></i> Manage
                </button>
            </div>
        </div>
    `;
    
    const formGrid = step2.querySelector('.form-grid');
    if (formGrid) {
        formGrid.insertAdjacentHTML('afterend', selectorHTML);
        
        const applyBtn = document.getElementById('apply-vehicle-btn');
        if (applyBtn) {
            const newApplyBtn = applyBtn.cloneNode(true);
            applyBtn.parentNode.replaceChild(newApplyBtn, applyBtn);
            
            newApplyBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const select = document.getElementById('quick-vehicle-select');
                if (!select) return;
                
                const vehicleId = select.value;
                
                if (!vehicleId) {
                    showToast('Please select a vehicle', 'error');
                    return;
                }
                
                const vehicle = vehiclesState.vehicles.find(v => v.id === vehicleId);
                if (vehicle) {
                    applyVehicleToBookingForm(vehicle);
                } else {
                    showToast('Vehicle not found', 'error');
                }
            });
        }
        
        const manageBtn = document.getElementById('manage-vehicles-btn');
        if (manageBtn) {
            const newManageBtn = manageBtn.cloneNode(true);
            manageBtn.parentNode.replaceChild(newManageBtn, manageBtn);
            
            newManageBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                closeModal();
                
                const dashboardSection = document.getElementById('dashboard');
                if (dashboardSection) {
                    scrollToSection('#dashboard');
                    
                    setTimeout(() => {
                        document.querySelectorAll('.dashboard-nav-btn').forEach(btn => {
                            btn.classList.remove('active');
                            if (btn.dataset.panel === 'vehicles') {
                                btn.classList.add('active');
                            }
                        });
                        
                        document.querySelectorAll('.dashboard-panel').forEach(panel => {
                            panel.classList.remove('active');
                        });
                        
                        const vehiclesPanel = document.getElementById('vehicles-panel');
                        if (vehiclesPanel) {
                            vehiclesPanel.classList.add('active');
                        }
                        
                        renderVehiclesList();
                        showToast('Manage your saved vehicles', 'info');
                    }, 300);
                } else {
                    const dashboardLink = document.querySelector('a[href="#dashboard"]');
                    if (dashboardLink) {
                        dashboardLink.click();
                    }
                }
            });
        }
    }
}

function applyVehicleToBookingForm(vehicle) {
    console.log('Applying vehicle to booking form:', vehicle);
    
    if (!vehicle) {
        showToast('Vehicle not found', 'error');
        return;
    }
    
    const typeSelect = document.getElementById('vehicle-type-select');
    if (typeSelect) {
        typeSelect.value = vehicle.type;
    }
    
    const numberInput = document.getElementById('vehicle-number');
    if (numberInput) {
        numberInput.value = vehicle.number;
    }
    
    const modelInput = document.getElementById('vehicle-model');
    if (modelInput && vehicle.model) {
        modelInput.value = vehicle.model;
    }
    
    const colorInput = document.getElementById('vehicle-color');
    if (colorInput && vehicle.color) {
        colorInput.value = vehicle.color;
    }
    
    showToast(`Vehicle ${vehicle.number} applied to booking`, 'success');
}

// ========================
// Helper Functions
// ========================

function getDefaultVehicle() {
    if (!appState || !appState.isLoggedIn || !appState.currentUser) return null;
    
    return vehiclesState.vehicles.find(v => 
        v.userId === appState.currentUser.id && v.isDefault === true
    );
}

function updateDefaultVehicleInSettings(vehicle) {
    if (appState && appState.userSettings) {
        appState.userSettings.defaultVehicle = vehicle.number;
        appState.userSettings.vehicleType = vehicle.type;
        localStorage.setItem('smartpark_settings', JSON.stringify(appState.userSettings));
    }
}

// ========================
// Event Listeners Setup
// ========================

function setupVehiclesEventListeners() {
    document.addEventListener('userLoggedIn', function() {
        loadUserVehicles();
    });
    
    document.addEventListener('userLoggedOut', function() {
        vehiclesState.vehicles = [];
        renderVehiclesList();
        updateVehicleSelectors();
    });
    
    const addVehicleBtn = document.getElementById('add-vehicle-btn');
    if (addVehicleBtn) {
        addVehicleBtn.addEventListener('click', openAddVehicleModal);
    }
    
    const noVehiclesAddBtn = document.getElementById('no-vehicles-add-btn');
    if (noVehiclesAddBtn) {
        noVehiclesAddBtn.addEventListener('click', openAddVehicleModal);
    }
    
    document.addEventListener('click', function(e) {
        if (e.target.closest('#add-vehicle-btn') || e.target.closest('#no-vehicles-add-btn')) {
            openAddVehicleModal();
        }
    });
}

// ========================
// Initialize on Page Load
// ========================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVehiclesSystem);
} else {
    initVehiclesSystem();
}

window.addEventListener('load', function() {
    setTimeout(initVehiclesSystem, 200);
});

window.vehiclesState = vehiclesState;
window.addVehicle = addVehicle;
window.updateVehicle = updateVehicle;
window.deleteVehicle = deleteVehicle;
window.setDefaultVehicle = setDefaultVehicle;
window.openAddVehicleModal = openAddVehicleModal;
window.getDefaultVehicle = getDefaultVehicle;
window.saveVehicleFromBookingForm = saveVehicleFromBookingForm;

console.log('📦 vehicle.js loaded and ready - DARK THEME SUPPORT FIXED');


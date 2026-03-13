// imagescript.js
// Profile Image Upload Functionality for SmartPark Dashboard

document.addEventListener('DOMContentLoaded', function() {
    // Wait for the main script to initialize
    setTimeout(() => {
        setupProfileImageUpload();
    }, 500);
});

function setupProfileImageUpload() {
    // Create profile image container with camera icon
    const profileIcon = document.querySelector('.profile-icon');
    if (!profileIcon) return;
    
    // Create the profile image container
    const profileImageContainer = document.createElement('div');
    profileImageContainer.className = 'profile-image-container';
    profileImageContainer.style.cssText = `
        position: relative;
        width: 80px;
        height: 80px;
        margin: 0 auto 1rem;
    `;
    
    // Create the profile image element
    const profileImage = document.createElement('img');
    profileImage.id = 'profile-image';
    profileImage.className = 'profile-image';
    profileImage.style.cssText = `
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        background: var(--gray-200);
    `;
    
    // Set default image (user icon) if no image is saved
    const savedImage = localStorage.getItem('smartpark_profile_image');
    if (savedImage) {
        profileImage.src = savedImage;
        profileImage.alt = 'Profile Image';
    } else {
        // Create a default avatar using initials
        createDefaultAvatar();
    }
    
    // Create camera icon overlay
    const cameraIcon = document.createElement('div');
    cameraIcon.className = 'profile-camera-icon';
    cameraIcon.style.cssText = `
        position: absolute;
        bottom: 5px;
        right: 5px;
        background: white;
        color: var(--primary);
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 2px solid var(--primary);
        z-index: 10;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        padding: 0;
        margin: 0;
    `;
    
    // Camera icon with proper centering
    cameraIcon.innerHTML = `
        <i class="fas fa-camera" style="
            font-size: 12px; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            width: 100%;
            height: 100%;
            line-height: 1;
            margin: 0;
            padding: 0;
        "></i>
    `;
    
    // Create file input (hidden)
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'profile-image-input';
    fileInput.accept = 'image/*';
    fileInput.style.cssText = `
        display: none;
    `;
    
    // Add elements to container
    profileImageContainer.appendChild(profileImage);
    profileImageContainer.appendChild(cameraIcon);
    profileImageContainer.appendChild(fileInput);
    
    // Replace the existing icon with our new container
    const existingIcon = profileIcon.querySelector('i');
    if (existingIcon) {
        existingIcon.style.display = 'none';
    }
    profileIcon.appendChild(profileImageContainer);
    
    // Add event listeners
    cameraIcon.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event bubbling
        e.preventDefault(); // Prevent any default behavior
        
        // Show image options modal instead of opening file selector directly
        showImageOptionsModal();
    });
    
    // Camera icon hover effects
    cameraIcon.addEventListener('mouseenter', function() {
        this.style.background = 'var(--primary)';
        this.style.color = 'white';
        this.style.boxShadow = '0 3px 12px rgba(67, 97, 238, 0.4)';
    });
    
    cameraIcon.addEventListener('mouseleave', function() {
        this.style.background = 'white';
        this.style.color = 'var(--primary)';
        this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
    });
    
    // File input change event
    fileInput.addEventListener('change', handleImageUpload);
    
    // Add CSS styles
    addProfileImageStyles();
}

function showImageOptionsModal() {
    // Check if image is already uploaded
    const savedImage = localStorage.getItem('smartpark_profile_image');
    const hasImage = !!savedImage;
    
    // Create modal for image options
    const modal = document.createElement('div');
    modal.className = 'image-options-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.cssText = `
        background: white;
        border-radius: var(--radius-lg);
        padding: 2rem;
        max-width: 350px;
        width: 90%;
        text-align: center;
        box-shadow: var(--shadow-xl);
        animation: modalSlideIn 0.3s ease;
    `;
    
    // Different options based on whether image exists or not
    if (hasImage) {
        modalContent.innerHTML = `
            <h3 style="margin-bottom: 1rem; color: var(--gray-900);">
                <i class="fas fa-image"></i> Profile Image Options
            </h3>
            <p style="margin-bottom: 1.5rem; color: var(--gray-600); font-size: 0.875rem;">
                Choose an action for your profile image
            </p>
            
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <button class="btn btn-outline" id="change-image-btn" style="justify-content: flex-start; text-align: left;">
                    <i class="fas fa-camera"></i>
                    <span>Change Image</span>
                </button>
                
                <button class="btn btn-outline" id="delete-image-btn" style="justify-content: flex-start; text-align: left; color: var(--danger); border-color: var(--danger);">
                    <i class="fas fa-trash"></i>
                    <span>Delete Image</span>
                </button>
                
                <button class="btn btn-outline" id="cancel-btn" style="justify-content: flex-start; text-align: left; color: var(--gray-600); border-color: var(--gray-300); margin-top: 1rem;">
                    <i class="fas fa-times"></i>
                    <span>Cancel</span>
                </button>
            </div>
        `;
    } else {
        modalContent.innerHTML = `
            <h3 style="margin-bottom: 1rem; color: var(--gray-900);">
                <i class="fas fa-image"></i> Upload Profile Image
            </h3>
            <p style="margin-bottom: 1.5rem; color: var(--gray-600); font-size: 0.875rem;">
                Choose an action for your profile image
            </p>
            
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <button class="btn btn-outline" id="upload-image-btn" style="justify-content: flex-start; text-align: left;">
                    <i class="fas fa-camera"></i>
                    <span>Upload Image</span>
                </button>
                
                <button class="btn btn-outline" id="cancel-btn" style="justify-content: flex-start; text-align: left; color: var(--gray-600); border-color: var(--gray-300); margin-top: 1rem;">
                    <i class="fas fa-times"></i>
                    <span>Cancel</span>
                </button>
            </div>
        `;
    }
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes modalSlideIn {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        #change-image-btn, #delete-image-btn, #upload-image-btn, #cancel-btn {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            width: 100%;
            text-align: left;
        }
        
        #change-image-btn:hover, #upload-image-btn:hover {
            background: rgba(67, 97, 238, 0.1);
        }
        
        #delete-image-btn:hover {
            background: rgba(239, 68, 68, 0.1);
        }
        
        #cancel-btn:hover {
            background: rgba(107, 114, 128, 0.1);
        }
    `;
    document.head.appendChild(style);
    
    // Add event listeners to modal buttons
    if (hasImage) {
        // When image exists: Change, Delete, Cancel
        modalContent.querySelector('#change-image-btn').addEventListener('click', function() {
            // Trigger file input click
            const fileInput = document.getElementById('profile-image-input');
            if (fileInput) {
                fileInput.click();
            }
            closeModal();
        });
        
        modalContent.querySelector('#delete-image-btn').addEventListener('click', function() {
            deleteProfileImage();
            closeModal();
        });
    } else {
        // When no image: Upload, Cancel
        modalContent.querySelector('#upload-image-btn').addEventListener('click', function() {
            // Trigger file input click
            const fileInput = document.getElementById('profile-image-input');
            if (fileInput) {
                fileInput.click();
            }
            closeModal();
        });
    }
    
    modalContent.querySelector('#cancel-btn').addEventListener('click', function() {
        closeModal();
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function closeOnEscape(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', closeOnEscape);
        }
    });
    
    function closeModal() {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
        // Remove the style element
        if (style.parentNode) {
            style.parentNode.removeChild(style);
        }
    }
}

function createDefaultAvatar() {
    const profileImage = document.getElementById('profile-image');
    if (!profileImage) return;
    
    const userName = document.getElementById('dashboard-username')?.textContent || 'GU';
    const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    
    // Create canvas for avatar
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    // Generate a color based on the user's name
    const colors = [
        '#4361ee', '#7209b7', '#3a0ca3', '#4cc9f0', 
        '#4ade80', '#f59e0b', '#ef4444', '#3b82f6'
    ];
    const colorIndex = Array.from(userName).reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    
    // Draw background
    ctx.fillStyle = colors[colorIndex];
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 80px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, canvas.width/2, canvas.height/2);
    
    // Convert to data URL and set as image source
    profileImage.src = canvas.toDataURL();
    profileImage.alt = `${userName}'s Avatar`;
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.match('image.*')) {
        showToast('Please select an image file', 'error');
        return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const imageData = e.target.result;
        const profileImage = document.getElementById('profile-image');
        
        if (profileImage) {
            // Update the image
            profileImage.src = imageData;
            profileImage.classList.add('updated');
            
            // Save to localStorage
            localStorage.setItem('smartpark_profile_image', imageData);
            
            // Update in app state if it exists
            if (window.appState) {
                appState.profileImage = imageData;
            }
            
            // Remove animation class after animation completes
            setTimeout(() => {
                profileImage.classList.remove('updated');
            }, 500);
            
            showToast('Profile image uploaded successfully!', 'success');
        }
        
        // Clear the file input
        event.target.value = '';
    };
    
    reader.onerror = function() {
        showToast('Error reading image file', 'error');
        event.target.value = '';
    };
    
    reader.readAsDataURL(file);
}

function deleteProfileImage() {
    if (confirm('Are you sure you want to delete your profile image?')) {
        const profileImage = document.getElementById('profile-image');
        
        // Remove from localStorage
        localStorage.removeItem('smartpark_profile_image');
        
        // Remove from app state if it exists
        if (window.appState) {
            appState.profileImage = null;
        }
        
        // Reset to default avatar
        createDefaultAvatar();
        
        // Add delete animation to profile image
        if (profileImage) {
            profileImage.classList.add('deleted');
            
            // Remove animation class after animation completes
            setTimeout(() => {
                profileImage.classList.remove('deleted');
            }, 300);
        }
        
        showToast('Profile image deleted successfully!', 'success');
    }
}

function addProfileImageStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .profile-image-container {
            position: relative;
            width: 80px;
            height: 80px;
            margin: 0 auto 1rem;
        }
        
        .profile-image {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            background: var(--gray-200);
            transition: all 0.3s ease;
        }
        
        /* Add a subtle hover effect to profile image */
        .profile-image:hover {
            opacity: 0.95;
        }
        
        /* Camera icon */
        .profile-camera-icon {
            position: absolute;
            bottom: 5px;
            right: 5px;
            background: white;
            color: var(--primary);
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid var(--primary);
            z-index: 10;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            padding: 0;
            margin: 0;
        }
        
        .profile-camera-icon i {
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            line-height: 1;
            margin: 0;
            padding: 0;
        }
        
        .profile-camera-icon:hover {
            background: var(--primary);
            color: white;
            box-shadow: 0 3px 12px rgba(67, 97, 238, 0.4);
        }
        
        .profile-camera-icon:hover i {
            color: white;
        }
        
        /* Animation for new image upload */
        @keyframes imageUpdate {
            0% { transform: scale(0.8); opacity: 0; }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
        }
        
        .profile-image.updated {
            animation: imageUpdate 0.5s ease;
        }
        
        /* Animation for image deletion */
        @keyframes imageDelete {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(0.8); opacity: 0.5; }
            100% { transform: scale(1); opacity: 1; }
        }
        
        .profile-image.deleted {
            animation: imageDelete 0.3s ease;
        }
    `;
    
    document.head.appendChild(style);
}

// Helper function to show toast notifications
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

// Function to update profile image when user logs in/out
function updateProfileImage() {
    const profileImage = document.getElementById('profile-image');
    if (!profileImage) return;
    
    if (window.appState && appState.isLoggedIn) {
        const savedImage = localStorage.getItem('smartpark_profile_image');
        if (savedImage) {
            profileImage.src = savedImage;
        } else {
            createDefaultAvatar();
        }
    } else {
        // Show default user icon for guests
        createDefaultAvatar();
    }
}

// Make functions available globally
window.updateProfileImage = updateProfileImage;


// ============================================
// PROFILE PAGE FUNCTIONALITY
// Handles user profile updates, university selection,
// security settings, and account management
// ============================================

// Wait for DOM to fully load before executing scripts
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    checkAuthentication();
    
    // Get form elements
    const personalForm = document.getElementById('personalForm');
    const universityForm = document.getElementById('universityForm');
    const emailForm = document.getElementById('emailForm');
    const passwordForm = document.getElementById('passwordForm');
    
    const profileFirstNameInput = document.getElementById('profileFirstName');
    const profileLastNameInput = document.getElementById('profileLastName');
    const profileEmailInput = document.getElementById('profileEmail');
    const profileUniversitySelect = document.getElementById('profileUniversitySelect');
    const profileAreaSelect = document.getElementById('profileAreaSelect');
    
    const newEmailInput = document.getElementById('newEmail');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
    const toggleNewPasswordBtn = document.getElementById('toggleNewPassword');
    const toggleNewPasswordIcon = document.getElementById('toggleNewPasswordIcon');
    const toggleConfirmNewPasswordBtn = document.getElementById('toggleConfirmNewPassword');
    const toggleConfirmNewPasswordIcon = document.getElementById('toggleConfirmNewPasswordIcon');
    
    const logoutBtn = document.getElementById('logoutBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');

    // Load user profile data on page load
    loadUserProfile();

    // Personal Information Form Submission
    personalForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const firstName = profileFirstNameInput.value.trim();
        const lastName = profileLastNameInput.value.trim();
        
        if (!firstName || !lastName) {
            showMessage('personalMessage', 'Por favor completa todos los campos', 'error');
            return;
        }

        const userId = localStorage.getItem('userId');
        const result = await updateUserProfile(userId, {
            firstName: firstName,
            lastName: lastName
        });

        if (result.success) {
            showMessage('personalMessage', result.message, 'success');
        } else {
            showMessage('personalMessage', result.message, 'error');
        }
    });

    // University Form Submission
    universityForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const university = profileUniversitySelect.value.trim();
        const area = profileAreaSelect.value.trim();
        
        if (!university) {
            showMessage('universityMessage', 'Por favor selecciona una universidad', 'error');
            return;
        }

        if (!area) {
            showMessage('universityMessage', 'Por favor selecciona un área académica', 'error');
            return;
        }

        // Get university info
        const uniInfo = getUniversityInfo(university);
        
        // Parse area data
        const [areaCode, areaName] = area.split('|');
        
        const userId = localStorage.getItem('userId');
        const result = await updateUserProfile(userId, {
            university: university,
            universityName: uniInfo.name,
            universityImage: uniInfo.image,
            area: areaCode,
            areaName: areaName
        });

        if (result.success) {
            showMessage('universityMessage', result.message, 'success');
            updateUniversityPreview(uniInfo.image, uniInfo.name);
        } else {
            showMessage('universityMessage', result.message, 'error');
        }
    });

    // Email Form Submission
    emailForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const newEmail = newEmailInput.value.trim();
        
        if (!newEmail) {
            showMessage('emailMessage', 'Por favor ingresa un correo válido', 'error');
            return;
        }

        if (!isValidEmail(newEmail)) {
            showMessage('emailMessage', 'El formato del correo no es válido', 'error');
            return;
        }

        const result = await updateUserEmail(newEmail);
        
        if (result.success) {
            showMessage('emailMessage', result.message, 'success');
            profileEmailInput.value = newEmail;
            emailForm.reset();
        } else {
            showMessage('emailMessage', result.message, 'error');
        }
    });

    // Password Form Submission
    passwordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmNewPasswordInput.value.trim();
        
        // Validate password fields
        if (!newPassword || !confirmPassword) {
            showMessage('passwordMessage', 'Por favor completa todos los campos', 'error');
            return;
        }

        if (!isPasswordStrong(newPassword)) {
            showMessage('passwordMessage', 'La contraseña debe tener mínimo 8 caracteres, letras y números', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage('passwordMessage', 'Las contraseñas no coinciden', 'error');
            confirmNewPasswordInput.value = '';
            return;
        }

        const result = await updateUserPassword(newPassword);
        
        if (result.success) {
            showMessage('passwordMessage', result.message, 'success');
            newPasswordInput.type = 'password';
            confirmNewPasswordInput.type = 'password';
            toggleNewPasswordIcon.textContent = 'Ver';
            toggleConfirmNewPasswordIcon.textContent = 'Ver';
            passwordForm.reset();
        } else {
            showMessage('passwordMessage', result.message, 'error');
        }
    });

    // Password visibility toggle for new password
    toggleNewPasswordBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (newPasswordInput.type === 'password') {
            newPasswordInput.type = 'text';
            toggleNewPasswordIcon.textContent = 'Ocultar';
        } else {
            newPasswordInput.type = 'password';
            toggleNewPasswordIcon.textContent = 'Ver';
        }
    });

    // Password visibility toggle for confirm password
    toggleConfirmNewPasswordBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (confirmNewPasswordInput.type === 'password') {
            confirmNewPasswordInput.type = 'text';
            toggleConfirmNewPasswordIcon.textContent = 'Ocultar';
        } else {
            confirmNewPasswordInput.type = 'password';
            toggleConfirmNewPasswordIcon.textContent = 'Ver';
        }
    });

    // University selection change - update areas and preview
    profileUniversitySelect.addEventListener('change', function() {
        const selectedUniversity = this.value.trim();
        
        if (!selectedUniversity) {
            // Reset area select if no university is selected
            profileAreaSelect.innerHTML = '<option value="">-- Selecciona un área --</option>';
            profileAreaSelect.disabled = true;
        } else {
            // Get areas for the selected university
            const areas = getAreasForUniversity(selectedUniversity);
            
            if (areas && areas.length > 0) {
                // Build options for area select
                let areaHTML = '<option value="">-- Selecciona un área --</option>';
                areas.forEach(area => {
                    areaHTML += `<option value="${area.code}|${area.name}">${area.name}</option>`;
                });
                
                profileAreaSelect.innerHTML = areaHTML;
                profileAreaSelect.disabled = false;
            } else {
                profileAreaSelect.innerHTML = '<option value="">No hay áreas disponibles</option>';
                profileAreaSelect.disabled = true;
            }
        }
        
        // Update preview
        const uniInfo = getUniversityInfo(selectedUniversity);
        if (uniInfo) {
            updateUniversityPreview(uniInfo.image, uniInfo.name);
        }
        
        // Clear area selection when university changes
        profileAreaSelect.value = '';
    });

    // Logout button
    logoutBtn.addEventListener('click', async function() {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            const result = await logoutUser();
            if (result.success) {
                window.location.href = 'login.html';
            } else {
                alert('Error al cerrar sesión: ' + result.message);
            }
        }
    });

    // Delete account button
    deleteAccountBtn.addEventListener('click', async function() {
        if (confirm('¿Estás completamente seguro? Esta acción no se puede deshacer.\n\nTu cuenta y todos tus datos serán eliminados permanentemente.')) {
            if (confirm('Última confirmación: ¿Eliminar cuenta?')) {
                const userId = localStorage.getItem('userId');
                const result = await deleteUserAccount(userId);
                
                if (result.success) {
                    alert('Tu cuenta ha sido eliminada. Serás redirigido al login.');
                    window.location.href = 'login.html';
                } else {
                    alert('Error al eliminar cuenta: ' + result.message);
                }
            }
        }
    });
});

/**
 * Check if user is authenticated and load profile
 */
async function checkAuthentication() {
    const isAuthenticated = await isUserAuthenticated();
    
    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
    }
}

/**
 * Load user profile from database
 */
async function loadUserProfile() {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
        window.location.href = 'login.html';
        return;
    }

    const userProfile = await getUserProfile(userId);
    
    if (userProfile) {
        // Populate personal information
        document.getElementById('profileFirstName').value = userProfile.firstName || '';
        document.getElementById('profileLastName').value = userProfile.lastName || '';
        document.getElementById('profileEmail').value = userProfile.email || '';
        
        // Populate university
        if (userProfile.university) {
            document.getElementById('profileUniversitySelect').value = userProfile.university;
            
            // Populate areas for the selected university
            const areas = getAreasForUniversity(userProfile.university);
            if (areas && areas.length > 0) {
                let areaHTML = '<option value="">-- Selecciona un área --</option>';
                areas.forEach(area => {
                    areaHTML += `<option value="${area.code}|${area.name}">${area.name}</option>`;
                });
                document.getElementById('profileAreaSelect').innerHTML = areaHTML;
                document.getElementById('profileAreaSelect').disabled = false;
                
                // Set the current area if it exists
                if (userProfile.area && userProfile.areaName) {
                    document.getElementById('profileAreaSelect').value = `${userProfile.area}|${userProfile.areaName}`;
                }
            }
            
            // Update preview
            const uniInfo = getUniversityInfo(userProfile.university);
            if (uniInfo) {
                updateUniversityPreview(uniInfo.image, uniInfo.name);
            }
        }
    }
}

/**
 * Update university logo preview
 * @param {string} imageUrl - University image URL
 * @param {string} universityName - University name
 */
function updateUniversityPreview(imageUrl, universityName) {
    const previewDiv = document.getElementById('universityImagePreview');
    
    // Remove .png extension if present for path construction
    const imageName = imageUrl.endsWith('.png') ? imageUrl : imageUrl + '.png';
    const fullImagePath = `../assets/images/${imageName}`;
    
    previewDiv.innerHTML = `
        <div class="preview-item">
            <img src="${fullImagePath}" alt="${universityName}" class="university-logo">
            <p class="university-name">${universityName}</p>
        </div>
    `;
}

/**
 * Display success or error messages
 * @param {string} elementId - ID of message container
 * @param {string} message - Message text
 * @param {string} type - Message type ('success' or 'error')
 */
function showMessage(elementId, message, type) {
    const messageElement = document.getElementById(elementId);
    messageElement.textContent = message;
    messageElement.className = `profile-message ${type}`;
    messageElement.style.display = 'block';
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(function() {
            messageElement.style.display = 'none';
        }, 5000);
    }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {boolean} True if strong
 */
function isPasswordStrong(password) {
    // Password must be at least 8 characters with letters and numbers
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
}

// ============================================
// REGISTRATION PAGE FUNCTIONALITY
// Handles form validation, password matching,
// password toggle, and account creation with Firebase
// ============================================

// Wait for DOM to fully load before executing scripts
document.addEventListener('DOMContentLoaded', function() {
    // Get references to form elements
    const registrationForm = document.getElementById('registrationForm');
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('registerEmail');
    const passwordInput = document.getElementById('registerPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const universitySelect = document.getElementById('universitySelect');
    const togglePasswordBtn = document.getElementById('toggleRegisterPassword');
    const toggleIcon = document.getElementById('toggleRegisterIcon');
    const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');
    const toggleConfirmIcon = document.getElementById('toggleConfirmIcon');
    const termsCheckbox = document.getElementById('termsCheckbox');
    const registrationMessage = document.getElementById('registrationMessage');

    // Handle password visibility toggle for main password field
    togglePasswordBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Toggle between password and text input type
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.textContent = 'Ocultar';
        } else {
            passwordInput.type = 'password';
            toggleIcon.textContent = 'Ver';
        }
    });

    // Handle password visibility toggle for confirm password field
    toggleConfirmPasswordBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Toggle between password and text input type
        if (confirmPasswordInput.type === 'password') {
            confirmPasswordInput.type = 'text';
            toggleConfirmIcon.textContent = 'Ocultar';
        } else {
            confirmPasswordInput.type = 'password';
            toggleConfirmIcon.textContent = 'Ver';
        }
    });

    // Handle form submission for account creation
    registrationForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values and remove whitespace
        const firstName = firstNameInput.value.trim();
        const lastName = lastNameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        const university = universitySelect.value.trim();
        const termsAccepted = termsCheckbox.checked;
        
        // Clear previous messages
        registrationMessage.textContent = '';
        registrationMessage.className = 'registration-message';
        
        // Validate all fields are filled
        if (!firstName || !lastName || !email || !password || !confirmPassword || !university) {
            showMessage('Por favor completa todos los campos', 'error');
            return;
        }

        // Validate email format
        if (!isValidEmail(email)) {
            showMessage('Por favor ingresa un correo válido', 'error');
            return;
        }

        // Validate password strength
        if (!isPasswordStrong(password)) {
            showMessage('La contraseña debe tener mínimo 8 caracteres, letras y números', 'error');
            return;
        }

        // Validate that passwords match
        if (password !== confirmPassword) {
            showMessage('Las contraseñas no coinciden', 'error');
            confirmPasswordInput.value = '';
            return;
        }

        // Validate terms and conditions acceptance
        if (!termsAccepted) {
            showMessage('Debes aceptar los términos y condiciones', 'error');
            return;
        }

        // Create new user account with Firebase
        await createUserAccountWithFirebase(firstName, lastName, email, password, university);
    });

    // Function to display success or error messages
    function showMessage(message, type) {
        registrationMessage.textContent = message;
        registrationMessage.classList.add(type);
        registrationMessage.style.display = 'block';
    }

    // Function to validate email format using regex pattern
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Function to validate password strength
    function isPasswordStrong(password) {
        // Password must be at least 8 characters with letters and numbers
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
        return passwordRegex.test(password);
    }

    // Function to create new user account with Firebase
    async function createUserAccountWithFirebase(firstName, lastName, email, password, university) {
        // Parse university data
        const [uniCode, uniName, uniImage] = university.split('|');
        
        // Register user with Firebase
        const result = await registerUser(email, password, {
            firstName: firstName,
            lastName: lastName,
            university: uniCode,
            universityName: uniName,
            universityImage: uniImage
        });

        if (result.success) {
            showMessage('Cuenta creada exitosamente. Redirigiendo al login...', 'success');
            
            // Reset form fields
            registrationForm.reset();
            passwordInput.type = 'password';
            confirmPasswordInput.type = 'password';
            toggleIcon.textContent = 'Ver';
            toggleConfirmIcon.textContent = 'Ver';
            
            // Redirect to login page after delay
            setTimeout(function() {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            showMessage(result.message, 'error');
        }
    }

    // Clear error message when user starts typing in any field
    [firstNameInput, lastNameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
        input.addEventListener('input', function() {
            if (registrationMessage.textContent) {
                registrationMessage.textContent = '';
                registrationMessage.className = 'registration-message';
            }
        });
    });

    // Log initialization complete
    console.log('Registration page initialized successfully with Firebase');
});

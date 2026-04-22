// ============================================
// LOGIN PAGE FUNCTIONALITY
// Handles form validation, password toggle,
// and error message display with Firebase
// ============================================

// Wait for DOM to fully load before executing scripts
document.addEventListener('DOMContentLoaded', function() {
    // Get references to form elements
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const toggleIcon = document.getElementById('toggleIcon');
    const errorMessage = document.getElementById('errorMessage');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');

    // Handle password visibility toggle
    togglePasswordBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Check current input type and toggle between 'password' and 'text'
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.textContent = 'Ocultar';
        } else {
            passwordInput.type = 'password';
            toggleIcon.textContent = 'Ver';
        }
    });

    // Handle form submission (login attempt)
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get input values
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        // Clear previous error message
        errorMessage.textContent = '';
        errorMessage.classList.remove('show');
        
        // Validate that both fields are filled
        if (!email || !password) {
            showError('Por favor completa todos los campos');
            return;
        }

        // Validate email format if input looks like an email
        if (email.includes('@') && !isValidEmail(email)) {
            showError('Por favor ingresa un correo válido');
            return;
        }

        // Attempt login with Firebase
        await loginWithFirebase(email, password);
    });

    // Function to display error messages
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        
        // Reset password field on error for security
        passwordInput.value = '';
        passwordInput.type = 'password';
        toggleIcon.textContent = 'Ver';
    }

    // Function to validate email format using regex pattern
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Function to login with Firebase
    async function loginWithFirebase(email, password) {
        const result = await loginUser(email, password);
        
        if (result.success) {
            // Successful login - store user info and redirect to dashboard
            if (result.userProfile) {
                localStorage.setItem('currentUser', JSON.stringify(result.userProfile));
            }
            window.location.href = 'dashboard.html';
        } else {
            // Failed login - show error message
            showError(result.message);
            // Make forgot password link more visible after failed login
            forgotPasswordLink.style.fontWeight = '700';
        }
    }

    // Clear error message when user starts typing in email field
    emailInput.addEventListener('input', function() {
        if (errorMessage.classList.contains('show')) {
            errorMessage.classList.remove('show');
            forgotPasswordLink.style.fontWeight = '600';
        }
    });

    // Clear error message when user starts typing in password field
    passwordInput.addEventListener('input', function() {
        if (errorMessage.classList.contains('show')) {
            errorMessage.classList.remove('show');
            forgotPasswordLink.style.fontWeight = '600';
        }
    });

    // Log initialization complete
    console.log('Login page initialized successfully with Firebase');

});


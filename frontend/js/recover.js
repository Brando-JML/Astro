// ============================================
// PASSWORD RECOVERY PAGE FUNCTIONALITY
// Handles password recovery form submission,
// email validation, and success/error messaging
// ============================================

// Wait for DOM to fully load before executing scripts
document.addEventListener('DOMContentLoaded', function() {
    // Get references to form elements
    const recoveryForm = document.getElementById('recoveryForm');
    const recoveryEmailInput = document.getElementById('recoveryEmail');
    const recoveryMessage = document.getElementById('recoveryMessage');

    // Handle form submission for password recovery
    recoveryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get email value and remove whitespace
        const email = recoveryEmailInput.value.trim();
        
        // Clear previous messages
        recoveryMessage.textContent = '';
        recoveryMessage.className = 'recovery-message';
        
        // Validate email field is not empty
        if (!email) {
            showMessage('Por favor ingresa tu correo electrónico', 'error');
            return;
        }

        // Validate email format
        if (!isValidEmail(email)) {
            showMessage('Por favor ingresa un correo válido', 'error');
            return;
        }

        // Simulate processing recovery request
        // In a real application, send request to backend API
        setTimeout(function() {
            showMessage('Hemos enviado instrucciones de recuperación a ' + email + '. Por favor revisa tu bandeja de entrada.', 'success');
            recoveryEmailInput.value = '';
        }, 1000);
    });

    // Function to display success or error messages
    function showMessage(message, type) {
        recoveryMessage.textContent = message;
        recoveryMessage.classList.add(type);
        recoveryMessage.style.display = 'block';
    }

    // Function to validate email format using regex pattern
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Clear any displayed messages when user starts typing
    recoveryEmailInput.addEventListener('input', function() {
        if (recoveryMessage.textContent) {
            recoveryMessage.textContent = '';
            recoveryMessage.className = 'recovery-message';
        }
    });

    // Log initialization complete
    console.log('Recovery page initialized successfully');
});

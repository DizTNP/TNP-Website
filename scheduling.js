// Scheduling Form JavaScript with Stripe Payment Integration
document.addEventListener('DOMContentLoaded', function() {
    const appointmentForm = document.getElementById('appointment-form');
    const submitButton = document.getElementById('submit-appointment');
    
    // Set minimum date to today
    const dateInput = document.getElementById('preferred-date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    
    // Check for payment success/cancel URL parameters
    checkPaymentStatus();
    
    // Form validation and submission
    appointmentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            processPayment();
        }
    });
    
    // Real-time validation
    const formInputs = appointmentForm.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
    
    // Service type change handler
    const serviceTypeSelect = document.getElementById('service-type');
    serviceTypeSelect.addEventListener('change', function() {
        handleServiceTypeChange(this.value);
    });
    
    // Emergency checkbox handler
    const emergencyCheckbox = document.getElementById('emergency');
    emergencyCheckbox.addEventListener('change', function() {
        handleEmergencyChange(this.checked);
    });
});

// Send customer to QuickBooks via Netlify Function
async function sendToQuickBooks(appointmentData) {
    try {
        // Map scheduling data to QuickBooks expected payload
        const {
            customerName = '',
            customerEmail = '',
            customerPhone = '',
            serviceAddress = ''
        } = appointmentData || {};

        // Parse address "Street, City, ST, ZIP"
        let addressLine1 = serviceAddress || '';
        let city = '';
        let state = '';
        let zip = '';

        if (serviceAddress && serviceAddress.includes(',')) {
            const parts = serviceAddress.split(',').map(p => p.trim());
            addressLine1 = parts[0] || '';
            city = parts[1] || '';
            // Handle state and zip from third or fourth part
            const stateZipRaw = (parts[2] || '') + ' ' + (parts[3] || '');
            const stateZipTokens = stateZipRaw.trim().split(/\s+/);
            // Find a 2-letter state token
            const stateToken = stateZipTokens.find(t => /^[A-Za-z]{2}$/.test(t));
            // Find a 5-digit zip (or 9-digit with dash)
            const zipToken = stateZipTokens.find(t => /^\d{5}(-\d{4})?$/.test(t));
            state = stateToken || '';
            zip = zipToken || '';
        }

        const payload = {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            'address-line1': addressLine1,
            city,
            state,
            zip
        };

        const response = await fetch('/.netlify/functions/add-customer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json().catch(() => ({ success: false, error: 'Invalid JSON response' }));

        if (!response.ok) {
            const errorMessage = result?.error || 'Failed to add customer to QuickBooks';
            throw new Error(errorMessage);
        }

        return { success: true, data: result };
    } catch (err) {
        console.error('sendToQuickBooks error:', err);
        return { success: false, error: err.message || 'Unknown error' };
    }
}

// Check payment status from URL parameters
function checkPaymentStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const sessionId = urlParams.get('session_id');
    const canceled = urlParams.get('canceled');
    
    if (success === 'true' && sessionId) {
        showPaymentSuccessModal();
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (canceled === 'true') {
        showPaymentErrorModal('Payment was canceled. Please try again or call us at (270) 681-8162.');
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// Process payment with Stripe
async function processPayment() {
    const submitButton = document.getElementById('submit-appointment');
    const form = document.getElementById('appointment-form');
    
    // Show loading state
    submitButton.classList.add('loading');
    submitButton.textContent = 'Processing...';
    
    try {
        // Collect form data
        const formData = new FormData(form);
        const paymentData = {
            customerName: `${formData.get('first-name')} ${formData.get('last-name')}`,
            customerEmail: formData.get('email'),
            customerPhone: formData.get('phone'),
            serviceAddress: formData.get('address'),
            serviceType: formData.get('service-type'),
            serviceDescription: formData.get('service-description'),
            appointmentDate: formData.get('preferred-date'),
            appointmentTime: formData.get('preferred-time'),
            isEmergency: formData.get('emergency') === 'on' ? 'true' : 'false',
            specialInstructions: formData.get('special-instructions') || ''
        };
        
        // Create Stripe checkout session
        const response = await fetch('/.netlify/functions/create-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData)
        });
        
        const result = await response.json();
        
        if (result.success && result.url) {
            // Redirect to Stripe Checkout
            window.location.href = result.url;
        } else {
            throw new Error(result.error || 'Failed to create payment session');
        }
        
    } catch (error) {
        console.error('Payment processing error:', error);
        showPaymentErrorModal('There was an error processing your payment. Please try again or call us at (270) 681-8162.');
    } finally {
        // Reset button state
        submitButton.classList.remove('loading');
        submitButton.textContent = 'Continue to Payment';
    }
}

// Show payment success modal
function showPaymentSuccessModal() {
    const modal = document.getElementById('payment-success-modal');
    const appointmentId = 'APT-' + Date.now();
    const appointmentDate = document.getElementById('preferred-date').value;
    const appointmentTime = document.getElementById('preferred-time').value;
    
    // Set appointment details
    document.getElementById('appointment-id').textContent = appointmentId;
    document.getElementById('appointment-date').textContent = formatDate(appointmentDate);
    document.getElementById('appointment-time').textContent = formatTime(appointmentTime);
    
    // Show modal
    modal.style.display = 'flex';
    
    // Reset form
    document.getElementById('appointment-form').reset();
}

// Show payment error modal
function showPaymentErrorModal(message) {
    const modal = document.getElementById('payment-error-modal');
    const messageElement = document.getElementById('payment-error-message');
    
    messageElement.textContent = message;
    modal.style.display = 'flex';
}

// Close payment success modal
function closePaymentSuccessModal() {
    document.getElementById('payment-success-modal').style.display = 'none';
}

// Close payment error modal
function closePaymentErrorModal() {
    document.getElementById('payment-error-modal').style.display = 'none';
}

// Form validation
function validateForm() {
    let isValid = true;
    const requiredFields = [
        'first-name', 'last-name', 'email', 'phone', 'address',
        'service-type', 'service-description', 'preferred-date', 'preferred-time'
    ];
    
    // Clear previous errors
    clearErrors();
    
    // Validate required fields
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    // Validate email format
    const emailField = document.getElementById('email');
    if (emailField.value && !isValidEmail(emailField.value)) {
        showError(emailField, 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate phone format
    const phoneField = document.getElementById('phone');
    if (phoneField.value && !isValidPhone(phoneField.value)) {
        showError(phoneField, 'Please enter a valid phone number');
        isValid = false;
    }
    
    // Validate date is not in the past
    const dateField = document.getElementById('preferred-date');
    if (dateField.value && new Date(dateField.value) < new Date()) {
        showError(dateField, 'Please select a future date');
        isValid = false;
    }
    
    // Validate contact permission checkbox
    const contactPermission = document.getElementById('contact-permission');
    if (!contactPermission.checked) {
        showError(contactPermission, 'You must agree to be contacted regarding your appointment');
        isValid = false;
    }
    
    return isValid;
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    
    // Remove existing error
    clearFieldError(field);
    
    // Check if required field is empty
    if (field.hasAttribute('required') && !value) {
        const fieldLabel = field.previousElementSibling?.textContent.replace(' *', '') || fieldName;
        showError(field, `${fieldLabel} is required`);
        return false;
    }
    
    // Field-specific validation
    if (value) {
        switch (fieldName) {
            case 'email':
                if (!isValidEmail(value)) {
                    showError(field, 'Please enter a valid email address');
                    return false;
                }
                break;
            case 'phone':
                if (!isValidPhone(value)) {
                    showError(field, 'Please enter a valid phone number');
                    return false;
                }
                break;
            case 'preferred-date':
                if (new Date(value) < new Date()) {
                    showError(field, 'Please select a future date');
                    return false;
                }
                break;
        }
    }
    
    // Mark as valid
    showSuccess(field);
    return true;
}

// Show error for field
function showError(field, message) {
    const formGroup = field.closest('.form-group');
    formGroup.classList.add('error');
    
    // Remove existing error message
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorMessage = document.createElement('span');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    formGroup.appendChild(errorMessage);
}

// Show success for field
function showSuccess(field) {
    const formGroup = field.closest('.form-group');
    formGroup.classList.remove('error');
    formGroup.classList.add('success');
    
    // Remove error message
    const errorMessage = formGroup.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// Clear field error
function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    formGroup.classList.remove('error', 'success');
    
    const errorMessage = formGroup.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// Clear all errors
function clearErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
    
    const errorFields = document.querySelectorAll('.form-group.error');
    errorFields.forEach(field => field.classList.remove('error'));
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone validation
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone);
}

// Handle service type change
function handleServiceTypeChange(serviceType) {
    const emergencyCheckbox = document.getElementById('emergency');
    const dateField = document.getElementById('preferred-date');
    const timeField = document.getElementById('preferred-time');
    
    if (serviceType === 'emergency') {
        emergencyCheckbox.checked = true;
        emergencyCheckbox.disabled = true;
        
        // For emergencies, allow same-day scheduling
        const today = new Date().toISOString().split('T')[0];
        dateField.min = today;
        
        // Set default time to morning for emergencies
        timeField.value = 'morning';
    } else {
        emergencyCheckbox.disabled = false;
        
        // For non-emergencies, require at least 1 day advance notice
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        dateField.min = tomorrowStr;
    }
}

// Handle emergency checkbox change
function handleEmergencyChange(isEmergency) {
    const dateField = document.getElementById('preferred-date');
    
    if (isEmergency) {
        // Allow same-day scheduling for emergencies
        const today = new Date().toISOString().split('T')[0];
        dateField.min = today;
    } else {
        // Require at least 1 day advance notice for non-emergencies
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        dateField.min = tomorrowStr;
    }
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Format time for display
function formatTime(timeSlot) {
    const timeMap = {
        'morning': '8:00 AM - 12:00 PM',
        'afternoon': '12:00 PM - 4:00 PM',
        'evening': '4:00 PM - 8:00 PM'
    };
    return timeMap[timeSlot] || timeSlot;
}

// Export functions for potential external use
window.SchedulingForm = {
    validateForm,
    processPayment,
    showPaymentSuccessModal,
    showPaymentErrorModal,
    closePaymentSuccessModal,
    closePaymentErrorModal,
    sendToQuickBooks
};

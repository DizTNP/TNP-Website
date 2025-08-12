// Scheduling Form JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const appointmentForm = document.getElementById('appointment-form');
    const submitButton = document.getElementById('submit-appointment');
    
    // Set minimum date to today
    const dateInput = document.getElementById('preferred-date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    
    // Form validation and submission
    appointmentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            submitAppointment();
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

// Submit appointment
async function submitAppointment() {
    const submitButton = document.getElementById('submit-appointment');
    const form = document.getElementById('appointment-form');
    
    // Show loading state
    submitButton.classList.add('loading');
    submitButton.textContent = 'Scheduling...';
    
    try {
        // Collect form data
        const formData = new FormData(form);
        const appointmentData = {
            customer: {
                firstName: formData.get('first-name'),
                lastName: formData.get('last-name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                isNewCustomer: formData.get('new-customer') === 'on'
            },
            service: {
                type: formData.get('service-type'),
                description: formData.get('service-description'),
                isEmergency: formData.get('emergency') === 'on'
            },
            appointment: {
                preferredDate: formData.get('preferred-date'),
                preferredTime: formData.get('preferred-time'),
                alternateDates: formData.get('alternate-dates'),
                specialInstructions: formData.get('special-instructions')
            },
            metadata: {
                submittedAt: new Date().toISOString(),
                source: 'website_scheduling_form'
            }
        };
        
        // TODO: Replace with actual API endpoint
        // For now, simulate API call
        await simulateApiCall(appointmentData);
        
        // Show success message
        showSuccessMessage(appointmentData);
        
        // Reset form
        form.reset();
        
        // Scroll to success message
        document.querySelector('.success-message').scrollIntoView({ 
            behavior: 'smooth' 
        });
        
    } catch (error) {
        console.error('Error submitting appointment:', error);
        showErrorMessage('There was an error scheduling your appointment. Please try again or call us at (270) 681-8162.');
    } finally {
        // Reset button state
        submitButton.classList.remove('loading');
        submitButton.textContent = 'Schedule Appointment';
    }
}

// Simulate API call (replace with actual API endpoint)
async function simulateApiCall(appointmentData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate 90% success rate
            if (Math.random() > 0.1) {
                resolve({
                    success: true,
                    appointmentId: 'APT-' + Date.now(),
                    message: 'Appointment scheduled successfully'
                });
            } else {
                reject(new Error('Simulated API error'));
            }
        }, 2000);
    });
}

// Show success message
function showSuccessMessage(appointmentData) {
    const form = document.getElementById('appointment-form');
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
        <h4>✅ Appointment Scheduled Successfully!</h4>
        <p>Thank you, ${appointmentData.customer.firstName}! Your appointment has been scheduled for ${formatDate(appointmentData.appointment.preferredDate)} at ${formatTime(appointmentData.appointment.preferredTime)}.</p>
        <p>We'll send a confirmation email to ${appointmentData.customer.email} within 2 hours with additional details.</p>
        <p><strong>Appointment ID:</strong> ${'APT-' + Date.now()}</p>
    `;
    
    form.insertBefore(successMessage, form.firstChild);
    
    // TODO: Send data to QuickBooks API
    // sendToQuickBooks(appointmentData);
}

// Show error message
function showErrorMessage(message) {
    const form = document.getElementById('appointment-form');
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.style.cssText = `
        background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
        color: #721c24;
        padding: 1.5rem;
        border-radius: 8px;
        border: 1px solid #f5c6cb;
        margin-bottom: 2rem;
        text-align: center;
        font-weight: 500;
    `;
    errorMessage.textContent = message;
    
    form.insertBefore(errorMessage, form.firstChild);
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

// TODO: QuickBooks Integration Function
function sendToQuickBooks(appointmentData) {
    // This function will be implemented when QuickBooks integration is set up
    console.log('Sending to QuickBooks:', appointmentData);
    
    // Example QuickBooks API call structure:
    /*
    const quickbooksData = {
        customer: {
            name: `${appointmentData.customer.firstName} ${appointmentData.customer.lastName}`,
            email: appointmentData.customer.email,
            phone: appointmentData.customer.phone,
            address: appointmentData.customer.address
        },
        service: {
            name: appointmentData.service.type,
            description: appointmentData.service.description
        },
        appointment: {
            date: appointmentData.appointment.preferredDate,
            time: appointmentData.appointment.preferredTime
        }
    };
    
    // Make API call to QuickBooks
    fetch('/api/quickbooks/customer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(quickbooksData)
    });
    */
}

// Export functions for potential external use
window.SchedulingForm = {
    validateForm,
    submitAppointment,
    sendToQuickBooks
};

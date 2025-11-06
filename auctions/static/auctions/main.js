// Initialize AOS (Animate on Scroll)
document.addEventListener('DOMContentLoaded', function() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            offset: 100
        });
    }

    // Form validation enhancement
    enhanceFormValidation();

    // Smooth scrolling for anchor links
    setupSmoothScrolling();

    // Image lazy loading fallback
    setupImageLazyLoading();

    // Auto-dismiss alerts
    setupAutoDismissAlerts();

    // Bid form validation
    setupBidValidation();

    // Search/Filter functionality
    setupSearch();
});

// Enhanced form validation
function enhanceFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('is-invalid');
                    showFieldError(field, 'This field is required');
                } else {
                    field.classList.remove('is-invalid');
                    removeFieldError(field);
                }
            });

            // Email validation
            const emailFields = form.querySelectorAll('input[type="email"]');
            emailFields.forEach(field => {
                if (field.value && !isValidEmail(field.value)) {
                    isValid = false;
                    field.classList.add('is-invalid');
                    showFieldError(field, 'Please enter a valid email address');
                }
            });

            if (!isValid) {
                e.preventDefault();
            }
        });

        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.hasAttribute('required') && !this.value.trim()) {
                    this.classList.add('is-invalid');
                    showFieldError(this, 'This field is required');
                } else {
                    this.classList.remove('is-invalid');
                    removeFieldError(this);
                }
            });

            input.addEventListener('input', function() {
                if (this.classList.contains('is-invalid')) {
                    this.classList.remove('is-invalid');
                    removeFieldError(this);
                }
            });
        });
    });
}

function showFieldError(field, message) {
    removeFieldError(field);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.color = '#ef4444';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

function removeFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Smooth scrolling
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Image lazy loading
function setupImageLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Auto-dismiss alerts
function setupAutoDismissAlerts() {
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    
    alerts.forEach(alert => {
        // Add close button
        if (!alert.querySelector('.alert-close')) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'alert-close';
            closeBtn.innerHTML = '&times;';
            closeBtn.style.cssText = `
                position: absolute;
                right: 1rem;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                opacity: 0.7;
                transition: opacity 0.3s;
            `;
            closeBtn.addEventListener('mouseenter', function() {
                this.style.opacity = '1';
            });
            closeBtn.addEventListener('mouseleave', function() {
                this.style.opacity = '0.7';
            });
            closeBtn.addEventListener('click', () => dismissAlert(alert));
            alert.style.position = 'relative';
            alert.appendChild(closeBtn);
        }

        // Auto-dismiss after 5 seconds for success messages
        if (alert.classList.contains('alert-success')) {
            setTimeout(() => dismissAlert(alert), 5000);
        }
    });
}

function dismissAlert(alert) {
    alert.style.opacity = '0';
    alert.style.transform = 'translateX(20px)';
    setTimeout(() => alert.remove(), 300);
}

// Bid validation
function setupBidValidation() {
    const bidForms = document.querySelectorAll('form:has(input[name="bid"])');
    
    bidForms.forEach(form => {
        const bidInput = form.querySelector('input[name="bid"]');
        const currentBidElement = document.querySelector('[data-current-bid]');
        
        if (bidInput && currentBidElement) {
            const currentBid = parseFloat(currentBidElement.dataset.currentBid);
            
            bidInput.addEventListener('input', function() {
                const bidValue = parseFloat(this.value);
                const submitBtn = form.querySelector('button[type="submit"]');
                
                if (bidValue <= currentBid) {
                    this.style.borderColor = '#ef4444';
                    if (submitBtn) {
                        submitBtn.disabled = true;
                        submitBtn.style.opacity = '0.5';
                    }
                } else {
                    this.style.borderColor = '#10b981';
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.style.opacity = '1';
                    }
                }
            });
        }
    });
}

// Search functionality
function setupSearch() {
    const searchInput = document.getElementById('listing-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', debounce(function() {
        const searchTerm = this.value.toLowerCase();
        const listings = document.querySelectorAll('.listing-card');

        listings.forEach(listing => {
            const title = listing.querySelector('.listing-title').textContent.toLowerCase();
            const description = listing.querySelector('.listing-description')?.textContent.toLowerCase() || '';
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                listing.style.display = '';
                listing.classList.add('fade-in');
            } else {
                listing.style.display = 'none';
            }
        });
    }, 300));
}

// Utility: Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add to watchlist with animation
function setupWatchlistAnimation() {
    const watchlistButtons = document.querySelectorAll('[data-watchlist-toggle]');
    
    watchlistButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const icon = this.querySelector('.watchlist-icon');
            if (icon) {
                icon.style.transform = 'scale(1.3)';
                setTimeout(() => {
                    icon.style.transform = 'scale(1)';
                }, 200);
            }
        });
    });
}

// Number animation for prices
function animateNumbers() {
    const numbers = document.querySelectorAll('[data-animate-number]');
    
    numbers.forEach(element => {
        const target = parseFloat(element.dataset.animateNumber);
        const duration = 1000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        let step = 0;

        const timer = setInterval(() => {
            current += increment;
            step++;
            element.textContent = '$' + current.toFixed(2);

            if (step >= steps) {
                clearInterval(timer);
                element.textContent = '$' + target.toFixed(2);
            }
        }, duration / steps);
    });
}

// Toast notification system
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
    `;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }

    .fade-in {
        animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    .is-invalid {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1) !important;
    }
`;
document.head.appendChild(style);
// modal.js - Handles modal display and form switching
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const overlay = document.getElementById('modal-overlay');
    
    // Buttons that open modals
    const loginBtns = document.querySelectorAll('.btn-login');
    const registerBtns = document.querySelectorAll('.btn-register');
    const heroRegisterBtn = document.getElementById('hero-register-btn');
    
    // Close buttons
    const closeLoginBtn = document.getElementById('close-login-modal');
    const closeRegisterBtn = document.getElementById('close-register-modal');
    
    // Switch links
    const switchToRegisterLink = document.getElementById('switch-to-register');
    const switchToLoginLink = document.getElementById('switch-to-login');
    
    // Lazy-load Firebase SDK and auth module once when any modal opens
    let firebaseLoaded = false;
    async function ensureFirebaseLoaded() {
        if (firebaseLoaded) return;
        try {
            // Load Firebase app/auth/firestore modules on demand
            await Promise.all([
                import('https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js'),
                import('https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js'),
                import('https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js')
            ]);
            // Initialize only once using config present on page
            if (!window.firebaseApp) {
                const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js');
                const { getAuth } = await import('https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js');
                const { getFirestore } = await import('https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js');
                const firebaseConfig = window.firebaseConfig || null;
                if (firebaseConfig) {
                    const app = initializeApp(firebaseConfig);
                    window.firebaseApp = app;
                    window.firebaseAuth = getAuth(app);
                    window.firebaseDB = getFirestore(app);
                }
            }
            // Load auth UI module only when needed
            await import('./firebase-auth.js');
            firebaseLoaded = true;
        } catch (e) {
            console.error('Failed to dynamically load Firebase:', e);
        }
    }

    // Function to open login modal
    async function openLoginModal() {
        ensureFirebaseLoaded();
        // Lazy-load modal CSS if not present
        if (!document.querySelector('link[href="modal-styles.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'modal-styles.css';
            document.head.appendChild(link);
        }
        resetForms();
        registerModal.classList.remove('active');
        loginModal.classList.add('active');
        overlay.classList.add('active');
        document.body.classList.add('modal-open');
    }
    
    // Function to open register modal
    async function openRegisterModal() {
        ensureFirebaseLoaded();
        if (!document.querySelector('link[href="modal-styles.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'modal-styles.css';
            document.head.appendChild(link);
        }
        resetForms();
        loginModal.classList.remove('active');
        registerModal.classList.add('active');
        overlay.classList.add('active');
        document.body.classList.add('modal-open');
    }
    
    // Function to close all modals
    function closeModals() {
        loginModal.classList.remove('active');
        registerModal.classList.remove('active');
        overlay.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
    
    // Reset forms and messages
    function resetForms() {
        const forms = document.querySelectorAll('form');
        const errorMessages = document.querySelectorAll('.error-message');
        const successMessages = document.querySelectorAll('.success-message');
        
        // Reset all forms
        forms.forEach(form => form.reset());
        
        // Hide all error messages
        errorMessages.forEach(error => error.style.display = 'none');
        
        // Hide all success messages
        successMessages.forEach(success => success.style.display = 'none');
    }
    
    // Event listeners for buttons that open modals
    loginBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            openLoginModal();
        });
    });
    
    registerBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            openRegisterModal();
        });
    });
    
    // Hero register button
    if (heroRegisterBtn) {
        heroRegisterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openRegisterModal();
        });
    }
    
    // Close buttons
    closeLoginBtn.addEventListener('click', closeModals);
    closeRegisterBtn.addEventListener('click', closeModals);
    
    // Close when clicking on overlay
    overlay.addEventListener('click', closeModals);
    
    // Switch between login and register
    switchToRegisterLink.addEventListener('click', function(e) {
        e.preventDefault();
        openRegisterModal();
    });
    
    switchToLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        openLoginModal();
    });
    
    // Function to switch to login modal with a message
    window.switchToLoginWithMessage = function(message) {
        openLoginModal();
        
        // Display success message if provided
        if (message) {
            const loginSuccess = document.getElementById('login-success');
            if (loginSuccess) {
                loginSuccess.style.display = 'block';
                const messageElement = loginSuccess.querySelector('p');
                if (messageElement) {
                    messageElement.innerHTML = `<i class='fas fa-check-circle'></i> ${message}`;
                }
            }
        }
    };
    
    // Close modals when pressing Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModals();
        }
    });
});
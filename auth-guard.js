// auth-guard.js - Protect pages that require authentication

// Initialize Firebase Auth check on page load
document.addEventListener('DOMContentLoaded', function() {
    // Wait for Firebase to be initialized
    const waitForFirebase = () => {
        if (window.firebase && window.firebase.auth) {
            initAuthGuard();
        } else {
            // Check Firebase initialization every 100ms
            setTimeout(waitForFirebase, 100);
        }
    };

    waitForFirebase();
});

function initAuthGuard() {
    console.log("Initializing authentication guard");
    const auth = window.firebase.auth();
    
    // Set a flag to track authentication state
    let isAuthenticated = false;

    // Check if user is authenticated
    auth.onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in
            console.log("User authenticated:", user.uid);
            isAuthenticated = true;
            showPageContent();
        } else {
            // No user is signed in
            console.log("User not authenticated");
            isAuthenticated = false;
            
            // If we're on a protected page (dashboard), redirect to login
            if (isProtectedPage()) {
                redirectToLogin();
            }
        }
    });

    // Add a flag to prevent redirect loops
    let redirecting = false;

    function redirectToLogin() {
        if (!redirecting) {
            redirecting = true;
            
            // Show error message before redirect
            showAuthError();
            
            // Redirect after a short delay to allow the message to be seen
            setTimeout(() => {
                window.location.href = '/index.html'; // Redirect to your login page
            }, 2000);
        }
    }

    function isProtectedPage() {
        // List of pages that require authentication
        const protectedPages = [
            '/dashboard.html',
            '/settings.html',
            '/profile.html'
            // Add other protected pages here
        ];
        
        const currentPath = window.location.pathname;
        return protectedPages.some(page => currentPath.endsWith(page));
    }

    function showAuthError() {
        // Create and show an authentication error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'auth-error';
        errorDiv.innerHTML = `
            <div class="auth-error-content">
                <h2>Authentication Required</h2>
                <p>You need to be logged in to access this page.</p>
                <p>Redirecting to login page...</p>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .auth-error {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            }
            
            .auth-error-content {
                background-color: #fff;
                padding: 30px;
                border-radius: 5px;
                text-align: center;
                max-width: 500px;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
            }
            
            .auth-error h2 {
                color: #d9534f;
                margin-top: 0;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(errorDiv);
    }

    function showPageContent() {
        // Only needed if you're initially hiding the content
        const content = document.querySelector('.main-content');
        if (content) {
            content.style.display = 'block';
        }
    }
}
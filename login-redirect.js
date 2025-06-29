// login-redirect.js - Redirect already authenticated users to dashboard

document.addEventListener('DOMContentLoaded', function() {
    // Wait for Firebase to be initialized
    const waitForFirebase = () => {
        if (window.firebase && window.firebase.auth) {
            initLoginRedirect();
        } else {
            // Check Firebase initialization every 100ms
            setTimeout(waitForFirebase, 100);
        }
    };

    waitForFirebase();
});

function initLoginRedirect() {
    console.log("Initializing login page redirector");
    const auth = window.firebase.auth();
    
    // Check if we're on the login/index page
    const isLoginPage = window.location.pathname === '/' || 
                        window.location.pathname === '/index.html';
    
    if (isLoginPage) {
        // Check authentication state
        auth.onAuthStateChanged(function(user) {
            if (user) {
                // User is already logged in, redirect to dashboard
                console.log("User already authenticated, redirecting to dashboard");
                
                // Show success message
                showLoginSuccess();
                
                // Redirect after a short delay
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 1500);
            } else {
                // Not logged in, stay on login page
                console.log("User not authenticated, staying on login page");
            }
        });
    }
}

function showLoginSuccess() {
    // Show a success message if needed
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        // Try to find success message element
        let successElement = document.getElementById('login-success');
        
        if (successElement) {
            // Show existing success element
            successElement.style.display = 'block';
            if (successElement.querySelector('p')) {
                successElement.querySelector('p').innerHTML = 
                    "<i class='fas fa-check-circle'></i> Already logged in! Redirecting to dashboard...";
            }
        } else {
            // Create new success element if it doesn't exist
            successElement = document.createElement('div');
            successElement.id = 'login-success';
            successElement.className = 'alert alert-success';
            successElement.style.display = 'block';
            successElement.innerHTML = 
                "<p><i class='fas fa-check-circle'></i> Already logged in! Redirecting to dashboard...</p>";
            
            // Insert after the form
            loginForm.parentNode.insertBefore(successElement, loginForm.nextSibling);
        }
    }
}
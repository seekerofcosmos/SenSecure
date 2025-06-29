// firebase-auth.js - Authentication and Modal Functionality
// Convert to ES module format for proper Firebase import handling

import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function() {
    // Wait for Firebase to be initialized
    const waitForFirebase = () => {
        if (window.firebaseAuth && window.firebaseDB) {
            initializeAuth();
        } else {
            // If not ready yet, check again in 100ms
            setTimeout(waitForFirebase, 100);
        }
    };

    waitForFirebase();

    function initializeAuth() {
        console.log("Initializing auth functionality");
        
        // Access Firebase modules from window object (set by the main script)
        const auth = window.firebaseAuth;
        const db = window.firebaseDB;
        
        // Form Elements
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        // Function to show error message
        function showError(elementId, message) {
            const errorElement = document.getElementById(elementId);
            const errorTextElement = document.getElementById(`${elementId}-text`);
            
            if (errorElement && errorTextElement) {
                errorElement.style.display = 'block';
                errorTextElement.textContent = message;
                console.log(`Showing error in ${elementId}: ${message}`);
            } else {
                console.error(`Error elements not found: ${elementId} or ${elementId}-text`);
            }
        }
        
        // Function to hide error message
        function hideError(elementId) {
            const errorElement = document.getElementById(elementId);
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        }
        
        // Function to show success message
        function showSuccess(elementId, message = null) {
            const successElement = document.getElementById(elementId);
            
            if (successElement) {
                successElement.style.display = 'block';
                if (message && successElement.querySelector('p')) {
                    successElement.querySelector('p').innerHTML = message;
                }
                console.log(`Showing success in ${elementId}: ${message}`);
            } else {
                console.error(`Success element not found: ${elementId}`);
            }
        }
        
        // Function to hide success message
        function hideSuccess(elementId) {
            const successElement = document.getElementById(elementId);
            if (successElement) {
                successElement.style.display = 'none';
            }
        }
        
        // Forgot Password Functionality
        const forgotPasswordLink = document.getElementById('forgot-password-link');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', function(e) {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                
                if (!email) {
                    showError('login-error', "Please enter your email address to reset your password.");
                    return;
                }
                
                // Set display name for password reset email
                const actionCodeSettings = {
                    url: window.location.origin + '/login',
                    handleCodeInApp: false
                };
                
                sendPasswordResetEmail(auth, email, actionCodeSettings)
                    .then(() => {
                        showSuccess('login-success', "<p><i class='fas fa-check-circle'></i> Password reset email sent! Please check your inbox.</p>");
                    })
                    .catch((error) => {
                        showError('login-error', error.message);
                    });
            });
        }
        
        // Login Form Submission
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                console.log("Login form submitted");
                
                // Hide previous messages
                hideError('login-error');
                hideSuccess('login-success');
                
                const email = document.getElementById('login-email')?.value;
                const password = document.getElementById('login-password')?.value;
                
                // Basic validation
                if (!email || !password) {
                    showError('login-error', "Please enter both email and password.");
                    return;
                }
                
                // Show a loading message
                showSuccess('login-success', "<p><i class='fas fa-spinner fa-spin'></i> Logging in...</p>");
                
                // Sign in with Firebase
                signInWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {
                        // Login successful
                        showSuccess('login-success', "<p><i class='fas fa-check-circle'></i> Login successful! Redirecting to dashboard...</p>");
                        
                        // Redirect to dashboard after 2 seconds
                        setTimeout(() => {
                            window.location.href = '/dashboard.html'; // Change to your dashboard URL
                        }, 2000);
                    })
                    .catch((error) => {
                        // Hide loading spinner on error
                        hideSuccess('login-success');
                        
                        // Handle specific error codes
                        let errorMessage = "Login failed. Please check your credentials and try again.";
                        
                        if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                            errorMessage = "Invalid email or password.";
                        } else if (error.code === 'auth/too-many-requests') {
                            errorMessage = "Too many failed login attempts. Please try again later.";
                        }
                        
                        showError('login-error', errorMessage);
                    });
            });
        } else {
            console.error("Login form not found");
        }
        
        // Register Form Submission - FIXED
        if (registerForm) {
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                console.log("Register form submitted");
                
                // Reset messages
                hideError('register-error');
                hideSuccess('register-success');
                
                const email = document.getElementById('register-email').value;
                const password = document.getElementById('register-password').value;
                const firstName = document.getElementById('register-firstname').value;
                const lastName = document.getElementById('register-lastname').value;
                const city = document.getElementById('register-city').value;

                // Show loading state
                showSuccess('register-success', "<p><i class='fas fa-spinner fa-spin'></i> Creating account...</p>");

                createUserWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {
                        const user = userCredential.user;
                        console.log('Auth UID:', user.uid);
                        
                        return setDoc(doc(db, "users", user.uid), {
                            firstName,
                            lastName,
                            email,
                            city,
                            createdAt: new Date()
                        });
                    })
                    .then(() => {
                        // Success case - hide loading spinner
                        hideSuccess('register-success');
                        
                        // Use the window function to switch to login
                        console.log("Registration successful, switching to login");
                        if (typeof window.switchToLoginWithMessage === 'function') {
                            window.switchToLoginWithMessage("Registration successful! Please login.");
                        } else {
                            console.error("switchToLoginWithMessage function not available");
                            showSuccess('register-success', "<p><i class='fas fa-check-circle'></i> Registration successful! Please login.</p>");
                        }
                        registerForm.reset();
                    })
                    .catch((error) => {
                        // Hide loading spinner
                        hideSuccess('register-success');
                        console.error("Registration error:", error);
                        
                        // Handle specific error cases
                        if (error.code === 'auth/email-already-in-use') {
                            showError('register-error', "Email already registered. Please login instead.");
                        } 
                        else if (error.code === 'permission-denied') {
                            showError('register-error', "Database error. Contact support.");
                        }
                        else {
                            // Show appropriate error message
                            showError('register-error', error.message || "Registration failed. Please try again.");
                        }
                    });
            });
        } else {
            console.error("Register form not found");
        }
        
        // Check if user is already logged in
        auth.onAuthStateChanged(function(user) {
            if (user) {
                // User is signed in, update UI accordingly
                console.log("User is logged in:", user.email);
                // Here you might hide login/register buttons and show user info
            } else {
                // No user is signed in, show login/register buttons
                console.log("No user logged in");
            }
        });

        console.log("Firebase auth functionality initialized");
    }
});
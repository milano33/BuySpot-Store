"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginForm = document.getElementById("loginForm");
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const clearEmailIcon = document.getElementById("clearEmailIcon");
    const envelopeIcon = document.getElementById("envelopeIcon");

    // التحقق من وجود العناصر
    if (!loginForm || !emailInput || !passwordInput) {
        console.error(" Login form elements not found:", {
            loginForm: !!loginForm,
            emailInput: !!emailInput,
            passwordInput: !!passwordInput,
        });
        return;
    }

    /* ===============================
       Load Draft Email
    ================================= */
    const draftEmail = sessionStorage.getItem("loginEmail") || "";
    if (draftEmail && emailInput) {
        emailInput.value = draftEmail;
        if (clearEmailIcon && envelopeIcon) {
            clearEmailIcon.classList.remove("hidden");
            envelopeIcon.classList.add("hidden");
        }
    }

    /* ===============================
       Save Draft Email on Input
    ================================= */
    emailInput.addEventListener("input", () => {
        sessionStorage.setItem("loginEmail", emailInput.value);
    });

    /* ===============================
       Clear Input Icon Setup
    ================================= */
    function setupClearIcon(inputId, clearIconId, defaultIconId, sessionKey = null) {
        const input = document.getElementById(inputId);
        const clearIcon = document.getElementById(clearIconId);
        const defaultIcon = document.getElementById(defaultIconId);

        if (!input || !clearIcon || !defaultIcon) {
            // console.warn(" setupClearIcon skipped:", { inputId, clearIconId, defaultIconId });
            return;
        }

        input.addEventListener("input", () => {
            if (sessionKey) sessionStorage.setItem(sessionKey, input.value);

            if (input.value.trim() !== "") {
                defaultIcon.classList.add("hidden");
                clearIcon.classList.remove("hidden");
            } else {
                defaultIcon.classList.remove("hidden");
                clearIcon.classList.add("hidden");
            }
        });

        clearIcon.addEventListener("click", () => {
            input.value = "";
            if (sessionKey) sessionStorage.removeItem(sessionKey);
            defaultIcon.classList.remove("hidden");
            clearIcon.classList.add("hidden");
            input.focus();
        });
    }

    // تطبيق على الايميل
    setupClearIcon("email", "clearEmailIcon", "envelopeIcon", "loginEmail");

    /* ===============================
       Show / Hide Password
    ================================= */
    window.togglePassword = function (fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) {
            // console.warn(" togglePassword: Field not found:", fieldId);
            return;
        }

        const icon = field.nextElementSibling;
        if (!icon) {
            // console.warn(" togglePassword: Icon not found for field:", fieldId);
            return;
        }

        if (field.type === "password") {
            field.type = "text";
            icon.classList.replace("fa-eye", "fa-eye-slash");
        } else {
            field.type = "password";
            icon.classList.replace("fa-eye-slash", "fa-eye");
        }
    };

    /* ===============================
       Handle Login Form Submission
    ================================= */
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Reset errors
        if (emailError) emailError.classList.add("hidden");
        if (passwordError) passwordError.classList.add("hidden");

        // Empty fields check
        if (email === "") {
            if (emailError) {
                emailError.textContent = "Email is required";
                emailError.classList.remove("hidden");
            }
            return;
        }
        if (password === "") {
            if (passwordError) {
                passwordError.textContent = "Password is required";
                passwordError.classList.remove("hidden");
            }
            return;
        }

        // Fetch users
        let users = [];
        try {
            const usersData = localStorage.getItem("users");
            if (!usersData) {
                if (passwordError) {
                    passwordError.textContent = "No registered users found. Please sign up.";
                    passwordError.classList.remove("hidden");
                }
                // console.warn(" No users found in localStorage");
                return;
            }
            users = JSON.parse(usersData) || [];
        } catch (err) {
            // console.error(" Error parsing users:", err);
            if (passwordError) {
                passwordError.textContent = "Error loading user data";
                passwordError.classList.remove("hidden");
            }
            return;
        }

        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            if (passwordError) {
                passwordError.textContent = "Invalid email or password";
                passwordError.classList.remove("hidden");
            }
            return;
        }

        // Add name field if it doesn't exist
        user.name = user.name || user.username || user.email.split('@')[0] || "غير محدد";
        // Fallback default image
        if (!user.image || user.image === "") {
            user.image = window.location.pathname.includes('pages/') ? "../img/Avatar.webp" : "./img/Avatar.webp";
        }

        // Save logged-in user
        try {
            localStorage.setItem("loggedInUser", JSON.stringify(user));
            // console.log(" Logged in user:", user);

            // Load cart and favorites for this user
            const cart = JSON.parse(localStorage.getItem(`cart_${email}`)) || [];
            const favorites = JSON.parse(localStorage.getItem(`favorites_${email}`)) || [];
            localStorage.setItem("cart", JSON.stringify(cart));
            localStorage.setItem("favorites", JSON.stringify(favorites));
            // console.log(" Loaded cart:", cart);
            // console.log(" Loaded favorites:", favorites);

            // Sync with currentUser
            localStorage.setItem("currentUser", JSON.stringify(user));
        } catch (err) {
            // console.error(" Error saving loggedInUser or loading cart/favorites:", err);
            if (passwordError) {
                passwordError.textContent = "Error saving user data or loading cart/favorites";
                passwordError.classList.remove("hidden");
            }
            return;
        }

        // Clear draft email
        sessionStorage.removeItem("loginEmail");

        // Show success message and redirect
        Swal.fire({
            title: 'تم بنجاح!',
            text: 'تم تسجيل الدخول !',
            icon: 'success',
            showConfirmButton: false,
            timer: 300,
            timerProgressBar: true,
            didClose: () => {
                const redirectPath = window.location.pathname.includes('pages/')
                    ? "../index.html"
                    : "./index.html";
                window.location.href = redirectPath;
            }
        });
    });
});
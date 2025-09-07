"use strict";

const CONFIG = {
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB max file size
    CANVAS_SIZE: 120, // 120x120px for better quality
    IMAGE_QUALITY: 0.8, // JPEG quality
    INITIALS_COLOR: '#ff8716', // Color for initials
    BACKGROUND_COLOR: '#cccccc',
    VALID_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    MAX_OUTPUT_SIZE: 50 * 1024 // 50KB max for saved image
};

/* ===============================
   Load Draft from sessionStorage
================================= */
window.addEventListener("load", () => {
    const draft = JSON.parse(sessionStorage.getItem("draftUser")) || {};
    if (draft.firstName) document.getElementById("firstName").value = draft.firstName;
    if (draft.lastName) document.getElementById("lastName").value = draft.lastName;
    if (draft.email) document.getElementById("email").value = draft.email;
    if (draft.phone) document.getElementById("phone").value = draft.phone;
    if (draft.image) {
        const preview = document.getElementById("profileImagePreview");
        const cameraIcon = document.getElementById("cameraIcon");
        if (preview && cameraIcon) {
            preview.src = draft.image;
            preview.classList.remove("hidden");
            cameraIcon.classList.add("hidden");
        }
    }
});

/* ===============================
   Save Draft Function
================================= */
function saveDraft(key, value) {
    let draft = JSON.parse(sessionStorage.getItem("draftUser")) || {};
    draft[key] = value;
    sessionStorage.setItem("draftUser", JSON.stringify(draft));
}

/* ===============================
   Profile Image Upload Preview + Save Draft
================================= */
const profileInput = document.getElementById("profileImage");
if (profileInput) {
    profileInput.addEventListener("change", function () {
        const file = this.files[0];
        const preview = document.getElementById("profileImagePreview");
        const cameraIcon = document.getElementById("cameraIcon");
        const imageError = document.getElementById("imageError");

        if (!file) return;

        // Validation size & type
        if (file.size > CONFIG.MAX_IMAGE_SIZE) {
            if (imageError) {
                imageError.textContent = "The file is larger than 5MB";
                imageError.classList.remove("hidden");
            }
            this.value = "";
            return;
        }
        if (!CONFIG.VALID_IMAGE_TYPES.includes(file.type)) {
            if (imageError) {
                imageError.textContent = "Only JPG, PNG, or WebP images are allowed.";
                imageError.classList.remove("hidden");
            }
            this.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            if (preview && cameraIcon) {
                preview.src = e.target.result;
                preview.classList.remove("hidden");
                cameraIcon.classList.add("hidden");
            }
            compressImageFast(file).then(compressedImage => {
                saveDraft("image", compressedImage);
                if (imageError) {
                    imageError.textContent = "";
                    imageError.classList.add("hidden");
                }
            }).catch(error => {
                console.error('Failed to compress image:', error);
                if (imageError) {
                    imageError.textContent = "Failed to upload image, try again";
                    imageError.classList.remove("hidden");
                }
            });
        };
        reader.onerror = () => {
            if (imageError) {
                imageError.textContent = "Failed to read file";
                imageError.classList.remove("hidden");
            }
        };
        reader.readAsDataURL(file);
    });
}

/* ===============================
   Clear Input Icons
================================= */
function setupClearIcon(inputId, clearIconId, defaultIconId) {
    const input = document.getElementById(inputId);
    const clearIcon = document.getElementById(clearIconId);
    const defaultIcon = document.getElementById(defaultIconId);

    if (!input || !clearIcon || !defaultIcon) {
        console.warn(`Missing elements for ${inputId}: input=${!!input}, clearIcon=${!!clearIcon}, defaultIcon=${!!defaultIcon}`);
        return;
    }

    input.addEventListener("input", () => {
        saveDraft(inputId, input.value);
        clearIcon.classList.toggle("hidden", input.value.trim() === "");
        defaultIcon.classList.toggle("hidden", input.value.trim() !== "");
    });

    clearIcon.addEventListener("click", () => {
        input.value = "";
        saveDraft(inputId, "");
        defaultIcon.classList.remove("hidden");
        clearIcon.classList.add("hidden");
        input.focus();
    });
}

// Apply to fields with unique icon IDs
setupClearIcon("firstName", "clearFirstNameIcon", "userIconFirstName");
setupClearIcon("lastName", "clearLastNameIcon", "userIconLastName");
setupClearIcon("email", "clearEmailIcon", "envelopeIcon");
setupClearIcon("phone", "clearPhoneIcon", "phoneIcon");

/* ===============================
   Password Strength Validation
================================= */
const passwordInput = document.getElementById("password");
const passwordStrengthBox = document.getElementById("passwordStrengthBox");
const passwordStrengthBar = document.getElementById("passwordStrength");
const passwordStrengthText = document.getElementById("passwordStrengthText");
const strengthValue = document.getElementById("strengthValue");
const passwordRequirements = document.getElementById("passwordRequirements");

function validatePasswordStrength(password) {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    // Calculate strength score
    const score = Object.values(requirements).filter(Boolean).length;
    let strengthClass = '';
    let strengthText = '';
    if (score <= 2) {
        strengthClass = 'weak';
        strengthText = 'Weak';
    } else if (score <= 4) {
        strengthClass = 'medium';
        strengthText = 'Medium';
    } else {
        strengthClass = 'strong';
        strengthText = 'Strong';
    }

    return { requirements, strengthClass, strengthText };
}

function updatePasswordUI(password) {
    // Check if elements exist
    if (!passwordStrengthBox || !passwordStrengthBar || !passwordStrengthText || !strengthValue || !passwordRequirements) {
        console.error("Password strength elements not found in the DOM:", {
            passwordStrengthBox: !!passwordStrengthBox,
            passwordStrengthBar: !!passwordStrengthBar,
            passwordStrengthText: !!passwordStrengthText,
            strengthValue: !!strengthValue,
            passwordRequirements: !!passwordRequirements
        });
        return;
    }

    if (password.trim() === "") {
        // Hide all elements when password is empty
        passwordStrengthBox.classList.add("hidden");
        passwordStrengthText.classList.add("hidden");
        passwordRequirements.classList.add("hidden");
        strengthValue.textContent = "";
        passwordStrengthBar.className = "password-strength-bar";
        return;
    }

    // Show strength bar, text, and requirements
    passwordStrengthBox.classList.remove("hidden");
    passwordStrengthText.classList.remove("hidden");
    passwordRequirements.classList.remove("hidden");

    // Validate password
    const { requirements, strengthClass, strengthText } = validatePasswordStrength(password);

    // Update strength bar and text
    passwordStrengthBar.className = `password-strength-bar ${strengthClass}`;
    strengthValue.textContent = strengthText;

    // Update requirements checklist
    const requirementsMap = [
        { id: "req-length", valid: requirements.length },
        { id: "req-uppercase", valid: requirements.uppercase },
        { id: "req-lowercase", valid: requirements.lowercase },
        { id: "req-number", valid: requirements.number },
        { id: "req-special", valid: requirements.special }
    ];

    requirementsMap.forEach(({ id, valid }) => {
        const element = document.getElementById(id);
        if (element) {
            element.className = valid ? "valid" : "invalid";
            const icon = element.querySelector("i");
            if (icon) {
                icon.className = valid ? "fas fa-check-circle" : "fas fa-times-circle";
            } else {
                console.warn(`Icon not found for requirement ${id}`);
            }
        } else {
            console.warn(`Requirement element ${id} not found`);
        }
    });
}

if (passwordInput) {
    passwordInput.addEventListener("input", () => {
        const password = passwordInput.value;
        updatePasswordUI(password);
        saveDraft("password", password);
    });
}

/* ===============================
   Form Validation + Save to LocalStorage
================================= */
document.getElementById("registerForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    let isValid = true;
    let firstErrorInput = null;

    // Clear previous errors and highlights
    document.querySelectorAll(".error-message").forEach(el => {
        el.textContent = "";
        el.classList.add("hidden");
    });
    document.querySelectorAll(".input-container input").forEach(input => {
        input.classList.remove("error-highlight");
    });

    function validateInput(input, errorElement, regex, emptyMessage, invalidMessage) {
        const value = input.value.trim();
        if (!value) {
            if (errorElement) {
                errorElement.textContent = emptyMessage;
                errorElement.classList.remove("hidden");
                if (!firstErrorInput) firstErrorInput = input; // Track first error input
            }
            return false;
        } else if (regex && !regex.test(value)) {
            if (errorElement) {
                errorElement.textContent = invalidMessage;
                errorElement.classList.remove("hidden");
                if (!firstErrorInput) firstErrorInput = input; // Track first error input
            }
            return false;
        }
        return true;
    }

    // Validate firstName
    const firstNameInput = document.getElementById("firstName");
    const firstNameError = document.getElementById("firstNameError");
    const nameRegex = /^[\u0600-\u06FFa-zA-Z\s]+$/;
    if (!validateInput(firstNameInput, firstNameError, nameRegex, "First name is required", "First name must contain letters only")) isValid = false;

    // Validate lastName
    const lastNameInput = document.getElementById("lastName");
    const lastNameError = document.getElementById("lastNameError");
    if (!validateInput(lastNameInput, lastNameError, nameRegex, "Last name is required", "Last name must contain letters only")) isValid = false;

    // Validate email
    const emailInput = document.getElementById("email");
    const emailError = document.getElementById("emailError");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!validateInput(emailInput, emailError, emailRegex, "Email is required", "Invalid email address")) isValid = false;

    // Validate phone
    const phoneInput = document.getElementById("phone");
    const phoneError = document.getElementById("phoneError");
    const phoneRegex = /^(?:01[0125]\d{8}|\+?20(?:[\s-]?1[0125])(?:[\s-]?\d){8}|\+?[1-9](?:[\s-]?\d){9,14})$/;
    if (!validateInput(phoneInput, phoneError, phoneRegex, "Phone number is required", "Please enter a valid phone number")) isValid = false;

    // Validate password
    const passwordInput = document.getElementById("password");
    const passwordError = document.getElementById("passwordError");
    if (!passwordInput.value.trim()) {
        if (passwordError) {
            passwordError.textContent = "Password is required";
            passwordError.classList.remove("hidden");
            if (!firstErrorInput) firstErrorInput = passwordInput;
        }
        isValid = false;
    } else {
        const { requirements } = validatePasswordStrength(passwordInput.value);
        if (!requirements.length || !requirements.uppercase || !requirements.lowercase || !requirements.number || !requirements.special) {
            if (passwordError) {
                passwordError.textContent = "Password must contain at least 8 characters, an uppercase letter, a lowercase letter, a number, and a special character";
                passwordError.classList.remove("hidden");
                if (!firstErrorInput) firstErrorInput = passwordInput;
            }
            isValid = false;
        }
    }

    // Validate confirm password
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const confirmPasswordError = document.getElementById("confirmPasswordError");
    if (confirmPasswordInput.value !== passwordInput.value) {
        if (confirmPasswordError) {
            confirmPasswordError.textContent = "Passwords do not match";
            confirmPasswordError.classList.remove("hidden");
            if (!firstErrorInput) firstErrorInput = confirmPasswordInput;
        }
        isValid = false;
    }

    // Scroll to first error input
    if (firstErrorInput) {
        firstErrorInput.classList.add("error-highlight");
        firstErrorInput.scrollIntoView({ behavior: "smooth", block: "center" });
        firstErrorInput.focus();
        setTimeout(() => {
            firstErrorInput.classList.remove("error-highlight");
        }, 2000); // Remove highlight after 2 seconds
        return;
    }

    // Check if email already exists
    const users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.some(user => user.email === emailInput.value.trim())) {
        if (emailError) {
            emailError.textContent = "This email is already in use";
            emailError.classList.remove("hidden");
            if (!firstErrorInput) firstErrorInput = emailInput;
            firstErrorInput.classList.add("error-highlight");
            firstErrorInput.scrollIntoView({ behavior: "smooth", block: "center" });
            firstErrorInput.focus();
            setTimeout(() => {
                firstErrorInput.classList.remove("error-highlight");
            }, 2000);
        }
        return;
    }

    // Process image
    let userImage = window.location.pathname.includes('pages/') ? "../img/Avatar.webp" : "./img/Avatar.webp";
    let isInitialsImage = false;
    try {
        const imageInput = document.getElementById("profileImage");
        const draft = JSON.parse(sessionStorage.getItem("draftUser")) || {};

        if (imageInput && imageInput.files && imageInput.files[0]) {
            const imageFile = imageInput.files[0];
            if (CONFIG.VALID_IMAGE_TYPES.includes(imageFile.type) && imageFile.size <= CONFIG.MAX_IMAGE_SIZE) {
                userImage = await compressImageFast(imageFile);
            } else {
                userImage = generateInitialsImage(`${firstNameInput.value.trim()} ${lastNameInput.value.trim()}`);
                isInitialsImage = true;
            }
        } else if (draft.image && draft.image !== "" && !draft.image.includes("Avatar.webp")) {
            userImage = draft.image;
        } else {
            userImage = generateInitialsImage(`${firstNameInput.value.trim()} ${lastNameInput.value.trim()}`);
            isInitialsImage = true;
        }
    } catch (error) {
        console.error('Error processing image:', error);
        userImage = generateInitialsImage(`${firstNameInput.value.trim()} ${lastNameInput.value.trim()}`);
        isInitialsImage = true;
    }

    // Create user object
    const user = {
        userId: emailInput.value.trim(),
        firstName: firstNameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        name: `${firstNameInput.value.trim()} ${lastNameInput.value.trim()}`.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        password: passwordInput.value.trim(),
        image: userImage,
        isInitialsImage: isInitialsImage,
        isLoggedIn: true,
        loginTime: new Date().toISOString(),
        token: generateToken()
    };

    // Save user
    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    localStorage.setItem("currentUser", JSON.stringify(user));

    // Save user data in userData_ key
    const userData = {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        isInitialsImage: user.isInitialsImage,
        cart: [],
        favorites: [],
        lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(`userData_${user.email}`, JSON.stringify(userData));

    // Clear any old conflicting data
    localStorage.removeItem(`cart_${user.email}`);
    localStorage.removeItem(`favorites_${user.email}`);
    localStorage.setItem("cart", JSON.stringify([]));
    localStorage.setItem("favorites", JSON.stringify([]));

    // Clear draft
    sessionStorage.removeItem("draftUser");

    // Show success message and redirect
    Swal.fire({
        title: 'Account created successfully!',
        text: 'You have been logged in automatically.',
        icon: 'success',
        confirmButtonColor: '#ff8716',
        customClass: { confirmButton: 'btn btn-primary' },
        timer: 300,
        timerProgressBar: true,
        didClose: () => {
            const redirectPath = window.location.pathname.includes('pages/') ? "../index.html" : "./index.html";
            window.location.href = redirectPath;
        }
    });

    // Reset form UI
    resetFormUI();
});

/* ===============================
   Image Compression
================================= */
async function compressImageFast(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                let { width, height } = img;
                const maxSize = CONFIG.CANVAS_SIZE;

                if (width > height) {
                    if (width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                const compressedDataURL = canvas.toDataURL('image/jpeg', CONFIG.IMAGE_QUALITY);
                resolve(compressedDataURL);
            };
            img.onerror = () => reject(new Error('Failed to load image'));
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

/* ===============================
   Generate Initials Image
================================= */
function generateInitialsImage(name) {
    const canvas = document.createElement('canvas');
    const DISPLAY_SIZE = CONFIG.CANVAS_SIZE;
    const SCALE = 2;
    canvas.width = DISPLAY_SIZE * SCALE;
    canvas.height = DISPLAY_SIZE * SCALE;

    const ctx = canvas.getContext('2d');
    ctx.scale(SCALE, SCALE);

    // Background
    ctx.fillStyle = CONFIG.BACKGROUND_COLOR;
    ctx.fillRect(0, 0, DISPLAY_SIZE, DISPLAY_SIZE);

    // Initials
    const initials = name.trim()
        .split(/\s+/)
        .map(word => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    ctx.fillStyle = CONFIG.INITIALS_COLOR;
    ctx.font = `bold ${DISPLAY_SIZE * 0.4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, DISPLAY_SIZE / 2, DISPLAY_SIZE / 2);

    return canvas.toDataURL('image/png');
}

/* ===============================
   Generate Token
================================= */
function generateToken() {
    return Math.random().toString(36).substr(2) + Date.now().toString(36);
}

/* ===============================
   Reset Form UI
================================= */
function resetFormUI() {
    const form = document.getElementById("registerForm");
    const preview = document.getElementById("profileImagePreview");
    const cameraIcon = document.getElementById("cameraIcon");
    const fileInput = document.getElementById("profileImage");
    const clearIcons = [
        "clearFirstNameIcon",
        "clearLastNameIcon",
        "clearEmailIcon",
        "clearPhoneIcon"
    ];

    if (form) form.reset();
    if (preview) {
        preview.src = "";
        preview.classList.add("hidden");
    }
    if (cameraIcon) cameraIcon.classList.remove("hidden");
    if (fileInput) fileInput.value = "";

    clearIcons.forEach(iconId => {
        const icon = document.getElementById(iconId);
        if (icon) icon.classList.add("hidden");
    });

    document.querySelectorAll(".icon:not(.cursor-pointer)").forEach(icon => {
        icon.classList.remove("hidden");
    });

    document.querySelectorAll(".error-message").forEach(el => {
        el.textContent = "";
        el.classList.add("hidden");
    });

    document.querySelectorAll(".input-container input").forEach(input => {
        input.classList.remove("error-highlight");
    });

    if (passwordStrengthBox && passwordStrengthText && passwordRequirements && strengthValue) {
        passwordStrengthBox.classList.add("hidden");
        passwordStrengthText.classList.add("hidden");
        passwordRequirements.classList.add("hidden");
        strengthValue.textContent = "";
        passwordStrengthBar.className = "password-strength-bar";
        document.querySelectorAll(".password-requirements li").forEach(li => {
            li.className = "";
            li.querySelector("i").className = "far fa-circle";
        });
    }

    sessionStorage.removeItem("draftUser");
}

/* ===============================
   Show / Hide Password Toggle
================================= */
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const icon = field.nextElementSibling;

    if (field && icon) {
        if (field.type === "password") {
            field.type = "text";
            icon.classList.replace("fa-eye", "fa-eye-slash");
        } else {
            field.type = "password";
            icon.classList.replace("fa-eye-slash", "fa-eye");
        }
    }
}
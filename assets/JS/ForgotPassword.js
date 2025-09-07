"use strict";

/* ===============================
   Setup Clear Icon for Email Input
================================= */
function setupClearIcon(inputId, clearIconId, defaultIconId) {
    const input = document.getElementById(inputId);
    const clearIcon = document.getElementById(clearIconId);
    const defaultIcon = document.getElementById(defaultIconId);

    input.addEventListener("input", () => {
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
        defaultIcon.classList.remove("hidden");
        clearIcon.classList.add("hidden");
        input.focus();
    });
}

setupClearIcon("email", "clearEmailIcon", "envelopeIcon");

document.getElementById("forgotPasswordForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const emailInput = document.getElementById("email");
    const emailError = document.getElementById("emailError");
    const successMessage = document.getElementById("successMessage");
    const sentToEmail = document.getElementById("sentToEmail");
    const cardHeader = document.querySelector(".card-header"); //  عشان نخفي العنوان كمان

    // Hide errors and message
    emailError.classList.add("hidden");
    successMessage.classList.add("hidden");

    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email === "") {
        emailError.textContent = "Email is required";
        emailError.classList.remove("hidden");
        return;
    } else if (!emailRegex.test(email)) {
        emailError.textContent = "Invalid email format";
        emailError.classList.remove("hidden");
        return;
    }

    // Check if email exists
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const userExists = users.some(u => u.email === email);

    if (!userExists) {
        emailError.textContent = "Email not found";
        emailError.classList.remove("hidden");
        return;
    }

    //  All good
    console.log(`Password reset link sent to: ${email}`);

    // Hide the form and header
    document.getElementById("forgotPasswordForm").classList.add("hidden");
    if (cardHeader) cardHeader.classList.add("hidden");

    // Show success message
    sentToEmail.textContent = email;
    successMessage.classList.remove("hidden");
});

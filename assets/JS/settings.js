
"use strict";

// Configuration for image handling
const CONFIG = {
    CANVAS_SIZE: 100,
    BACKGROUND_COLOR: '#7b7b7b',
    INITIALS_COLOR: '#ffffff',
    VALID_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    IMAGE_QUALITY: 0.7
};

// Load user data from localStorage
let user = null;
document.addEventListener('DOMContentLoaded', () => {
    // إعادة تحميل بيانات المستخدم
    try {
        user = JSON.parse(localStorage.getItem('loggedInUser'));
    } catch (e) {
        console.error('Error loading user data:', e);
        user = null;
    }

    // Debug - تحقق من البيانات
    console.log('Loaded user:', user);
    console.log('FirstName:', user?.firstName);
    console.log('LastName:', user?.lastName);

    if (!user) {
        // كود إعادة التوجيه...
        return;
    }

    // عرض البيانات مباشرة
    document.getElementById('userName').textContent = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || "مستخدم جديد";
    document.getElementById('firstNameDisplay').textContent = user.firstName || "غير محدد";
    document.getElementById('lastNameDisplay').textContent = user.lastName || "غير محدد";

    // باقي الكود...
});
// Check if user is logged in and UserDataManager is available
document.addEventListener('DOMContentLoaded', () => {
    if (!window.userDataManager || !window.logoutUser) {
        Swal.fire({
            title: 'خطأ',
            text: 'فشل تحميل النظام، يرجى إعادة تحميل الصفحة',
            icon: 'error',
            confirmButtonColor: '#ff8716',
            customClass: { confirmButton: 'btn btn-primary' }
        });
        return;
    }

    if (!user) {
        Swal.fire({
            title: 'خطأ',
            text: 'يرجى تسجيل الدخول أولاً',
            icon: 'error',
            confirmButtonColor: '#ff8716',
            customClass: { confirmButton: 'btn btn-primary' }
        }).then(() => {
            window.location.href = './Login.html';
        });
        return;
    }


    // Initialize isInitialsImage if not set
    if (!('isInitialsImage' in user)) {
        user.isInitialsImage = !user.image || user.image.includes('data:image');
    }

    // Set default image if not present
    if (!user.image || user.image === "") {
        user.image = generateInitialsImage(user.name || `${user.firstName || 'User'} ${user.lastName || 'Name'}`);
        user.isInitialsImage = true;
    }

    // عرض البيانات الأساسية
    document.getElementById('userName').textContent = user.name || "مستخدم جديد";
    document.getElementById('userEmail').textContent = user.email || "غير محدد";

    // عرض البيانات الشخصية بالقيم الصحيحة
    document.getElementById('firstNameDisplay').textContent = user.firstName || "غير محدد";
    document.getElementById('lastNameDisplay').textContent = user.lastName || "غير محدد";
    document.getElementById('emailDisplay').textContent = user.email || "غير محدد";
    document.getElementById('phoneDisplay').textContent = user.phone || "غير محدد";
    document.getElementById('addressDisplay').textContent = user.address || "غير محدد";
    document.getElementById('governorateDisplay').textContent = user.governorate || "غير محدد";

    // ملء حقول التعديل
    document.getElementById('firstNameInput').value = user.firstName || "";
    document.getElementById('lastNameInput').value = user.lastName || "";
    document.getElementById('emailInput').value = user.email || "";
    document.getElementById('phoneInput').value = user.phone || "";
    document.getElementById('addressInput').value = user.address || "";
    document.getElementById('governorateInput').value = user.governorate || "";
    document.getElementById('currentEmail').value = user.email || "غير محدد";

    // عرض الصورة
    document.getElementById('userAvatar').src = user.image;
    document.getElementById('avatarPreview').src = user.image;

    // Show/hide clear icon for inputs
    ['newEmail', 'confirmDelete', 'firstNameInput', 'lastNameInput'].forEach(id => {
        const input = document.getElementById(id);
        const clearIcon = document.getElementById(`clear${id.charAt(0).toUpperCase() + id.slice(1)}Icon`);
        if (input && clearIcon) {
            input.addEventListener('input', () => {
                clearIcon.classList.toggle('hidden', !input.value);
            });
        }
    });

    // Avatar input preview with compression
    const avatarInput = document.getElementById('avatarInput');
    if (avatarInput) {
        avatarInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            const preview = document.getElementById('avatarPreview');
            const avatarError = document.getElementById('avatarError');

            if (avatarError) {
                avatarError.textContent = "";
                avatarError.style.display = 'none';
            }

            if (!file) {
                if (preview) {
                    preview.src = user.image;
                }
                return;
            }

            if (!CONFIG.VALID_IMAGE_TYPES.includes(file.type)) {
                if (avatarError) {
                    avatarError.textContent = 'يرجى رفع صورة بصيغة JPEG أو PNG أو WebP';
                    avatarError.style.display = 'block';
                }
                if (preview) preview.src = user.image;
                e.target.value = "";
                return;
            }

            if (file.size > CONFIG.MAX_IMAGE_SIZE) {
                if (avatarError) {
                    avatarError.textContent = 'حجم الصورة كبير جدًا (الحد الأقصى 5 ميجابايت)';
                    avatarError.style.display = 'block';
                }
                if (preview) preview.src = user.image;
                e.target.value = "";
                return;
            }

            compressImageFast(file).then(compressedImage => {
                if (preview) {
                    preview.src = compressedImage;
                }
            }).catch(error => {
                if (avatarError) {
                    avatarError.textContent = 'فشل في تحميل الصورة، حاول مرة أخرى';
                    avatarError.style.display = 'block';
                }
                if (preview) preview.src = user.image;
                e.target.value = "";
            });
        });
    }

    // Initialize orders
    syncCartWithOrders();
    displayOrders();

    // Order search
    document.getElementById('orderSearch')?.addEventListener('input', debounce((e) => {
        displayOrders(e.target.value);
    }, 300));

    // Forgot password link
    document.getElementById('forgotPasswordLink')?.addEventListener('click', () => {
        openModal('forgotPasswordModal');
    });

    // Send reset link
    document.getElementById('sendResetLinkBtn')?.addEventListener('click', () => {
        const resetEmail = document.getElementById('resetEmail');
        const resetEmailError = document.getElementById('resetEmailError');
        const resetSpinner = document.getElementById('resetSpinner');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        resetEmailError.style.display = 'none';
        resetEmail.classList.remove('error');
        resetSpinner.style.display = 'block';
        document.getElementById('sendResetLinkBtn').disabled = true;

        setTimeout(() => {
            if (!resetEmail.value.match(emailRegex)) {
                resetEmailError.textContent = 'البريد الإلكتروني غير صالح';
                resetEmailError.style.display = 'block';
                resetEmail.classList.add('error');
                resetSpinner.style.display = 'none';
                document.getElementById('sendResetLinkBtn').disabled = false;
                return;
            }

            Swal.fire({
                title: 'تم!',
                text: `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${resetEmail.value}`,
                icon: 'success',
                confirmButtonColor: '#ff8716',
                customClass: { confirmButton: 'btn btn-primary' }
            });
            closeModal('forgotPasswordModal');
            resetSpinner.style.display = 'none';
            document.getElementById('sendResetLinkBtn').disabled = false;
        }, 500);
    });
});

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Compress image function
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

            img.onerror = () => reject(new Error('فشل في تحميل الصورة'));
        };

        reader.onerror = () => reject(new Error('فشل في قراءة الملف'));
        reader.readAsDataURL(file);
    });
}

// Generate initials image
function generateInitialsImage(name) {
    const canvas = document.createElement('canvas');

    const DISPLAY_SIZE = CONFIG.CANVAS_SIZE; // الحجم اللي هيظهر على الصفحة
    const SCALE = 2; // مضاعف الدقة
    canvas.width = DISPLAY_SIZE * SCALE;
    canvas.height = DISPLAY_SIZE * SCALE;

    const ctx = canvas.getContext('2d');
    ctx.scale(SCALE, SCALE); // نخلي الرسم متناسب مع الحجم المعروض

    // خلفية
    ctx.fillStyle = CONFIG.BACKGROUND_COLOR;
    ctx.fillRect(0, 0, DISPLAY_SIZE, DISPLAY_SIZE);

    // حروف الاسم
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

// Update avatar
const updateAvatarBtn = document.getElementById('updateAvatarBtn');
if (updateAvatarBtn) {
    updateAvatarBtn.addEventListener('click', () => {
        const avatarSpinner = document.getElementById('avatarSpinner');
        avatarSpinner.style.display = 'block';
        updateAvatarBtn.disabled = true;

        setTimeout(() => {
            const avatarInput = document.getElementById('avatarInput');
            const avatarPreview = document.getElementById('avatarPreview');
            const avatarError = document.getElementById('avatarError');

            if (!avatarInput.files[0]) {
                avatarError.textContent = 'يرجى اختيار صورة';
                avatarError.style.display = 'block';
                avatarSpinner.style.display = 'none';
                updateAvatarBtn.disabled = false;
                return;
            }

            compressImageFast(avatarInput.files[0]).then(compressedImage => {
                user.image = compressedImage;
                user.isInitialsImage = false;
                document.getElementById('userAvatar').src = user.image;
                updateUserInStorage(user);
                document.getElementById('userAvatar').classList.add('highlight');
                setTimeout(() => {
                    document.getElementById('userAvatar').classList.remove('highlight');
                }, 1000);
                Swal.fire({
                    title: 'تم بنجاح!',
                    text: 'تم تحديث الصورة الشخصية بنجاح!',
                    icon: 'success',
                    confirmButtonColor: '#ff8716',
                    customClass: { confirmButton: 'btn btn-primary' }
                });
                closeModal('changeAvatarModal');
                avatarSpinner.style.display = 'none';
                updateAvatarBtn.disabled = false;
            }).catch(error => {
                avatarError.textContent = 'فشل في تحميل الصورة، حاول مرة أخرى';
                avatarError.style.display = 'block';
                avatarSpinner.style.display = 'none';
                updateAvatarBtn.disabled = false;
            });
        }, 500);
    });
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggleIcon = input.parentElement.querySelector('.icon.toggle-password');
    if (input.type === 'password') {
        input.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
    updateIcons();
}

// Clear input
function clearInput(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.value = '';
        updateIcons();
    }
}

// Update user in localStorage
function updateUserInStorage(updatedUser) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === user.email);
    if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
    } else {
        users.push(updatedUser);
        localStorage.setItem('users', JSON.stringify(users));
    }
    localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
    localStorage.setItem('currentUser', JSON.stringify(updatedUser)); // Ensure currentUser is updated
    user = updatedUser; // Update global user object
}

// Sync cart with orders
function syncCartWithOrders() {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    let cart = JSON.parse(localStorage.getItem(`cart_${user.email}`)) || [];
    let userData = JSON.parse(localStorage.getItem(`userData_${user.email}`)) || {};

    const orderedItemIds = orders
        .filter(order => order.user.email === user.email)
        .flatMap(order => order.items.map(item => item.id));

    cart = cart.filter(cartItem => !orderedItemIds.includes(cartItem.id));
    userData.cart = userData.cart ? userData.cart.filter(cartItem => !orderedItemIds.includes(cartItem.id)) : [];

    localStorage.setItem(`cart_${user.email}`, JSON.stringify(cart));
    localStorage.setItem(`userData_${user.email}`, JSON.stringify({
        ...userData,
        userId: user.email,
        cart: userData.cart,
        favorites: userData.favorites || [],
        lastUpdated: new Date().toISOString()
    }));
}

// Edit personal info
const editInfoBtn = document.getElementById('editInfoBtn');
const editActions = document.getElementById('editActions');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const saveInfoBtn = document.getElementById('saveInfoBtn');
const firstNameDisplay = document.getElementById('firstNameDisplay');
const lastNameDisplay = document.getElementById('lastNameDisplay');
const emailDisplay = document.getElementById('emailDisplay');
const phoneDisplay = document.getElementById('phoneDisplay');
const addressDisplay = document.getElementById('addressDisplay');
const governorateDisplay = document.getElementById('governorateDisplay');
const firstNameInput = document.getElementById('firstNameInput');
const lastNameInput = document.getElementById('lastNameInput');
const emailInput = document.getElementById('emailInput');
const phoneInput = document.getElementById('phoneInput');
const addressInput = document.getElementById('addressInput');
const governorateInput = document.getElementById('governorateInput');
const firstNameError = document.getElementById('firstNameError');
const lastNameError = document.getElementById('lastNameError');
const emailError = document.getElementById('emailError');
const phoneError = document.getElementById('phoneError');
const addressError = document.getElementById('addressError');
const governorateError = document.getElementById('governorateError');

if (editInfoBtn) {
    editInfoBtn.addEventListener('click', () => {
        editInfoBtn.style.display = 'none';
        editActions.style.display = 'flex';
        firstNameDisplay.style.display = 'none';
        lastNameDisplay.style.display = 'none';
        emailDisplay.style.display = 'none';
        phoneDisplay.style.display = 'none';
        addressDisplay.style.display = 'none';
        governorateDisplay.style.display = 'none';
        firstNameInput.style.display = 'block';
        lastNameInput.style.display = 'block';
        emailInput.style.display = 'block';
        phoneInput.style.display = 'block';
        addressInput.style.display = 'block';
        governorateInput.style.display = 'block';
    });
}

if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
        editInfoBtn.style.display = 'block';
        editActions.style.display = 'none';
        firstNameDisplay.style.display = 'block';
        lastNameDisplay.style.display = 'block';
        emailDisplay.style.display = 'block';
        phoneDisplay.style.display = 'block';
        addressDisplay.style.display = 'block';
        governorateDisplay.style.display = 'block';
        firstNameInput.style.display = 'none';
        lastNameInput.style.display = 'none';
        emailInput.style.display = 'none';
        phoneInput.style.display = 'none';
        addressInput.style.display = 'none';
        governorateInput.style.display = 'none';
        firstNameInput.value = user.firstName || "";
        lastNameInput.value = user.lastName || "";
        emailInput.value = user.email || "";
        phoneInput.value = user.phone || "";
        addressInput.value = user.address || "";
        governorateInput.value = user.governorate || "";
        firstNameError.style.display = 'none';
        lastNameError.style.display = 'none';
        emailError.style.display = 'none';
        phoneError.style.display = 'none';
        addressError.style.display = 'none';
        governorateError.style.display = 'none';
        firstNameInput.classList.remove('error');
        lastNameInput.classList.remove('error');
        emailInput.classList.remove('error');
        phoneInput.classList.remove('error');
        addressInput.classList.remove('error');
        governorateInput.classList.remove('error');
    });
}

if (saveInfoBtn) {
    saveInfoBtn.addEventListener('click', () => {
        let hasError = false;
        firstNameError.style.display = 'none';
        lastNameError.style.display = 'none';
        emailError.style.display = 'none';
        phoneError.style.display = 'none';
        addressError.style.display = 'none';
        governorateError.style.display = 'none';
        firstNameInput.classList.remove('error');
        lastNameInput.classList.remove('error');
        emailInput.classList.remove('error');
        phoneInput.classList.remove('error');
        addressInput.classList.remove('error');
        governorateInput.classList.remove('error');

        // Validate firstName
        const nameRegex = /^[\u0600-\u06FFa-zA-Z\s]+$/;
        if (!firstNameInput.value.trim()) {
            firstNameError.textContent = 'الاسم الأول مطلوب';
            firstNameError.style.display = 'block';
            firstNameInput.classList.add('error');
            hasError = true;
        } else if (!nameRegex.test(firstNameInput.value.trim())) {
            firstNameError.textContent = 'الاسم الأول يجب أن يحتوي على حروف ومسافات فقط';
            firstNameError.style.display = 'block';
            firstNameInput.classList.add('error');
            hasError = true;
        }

        // Validate lastName
        if (!lastNameInput.value.trim()) {
            lastNameError.textContent = 'اسم العائلة مطلوب';
            lastNameError.style.display = 'block';
            lastNameInput.classList.add('error');
            hasError = true;
        } else if (!nameRegex.test(lastNameInput.value.trim())) {
            lastNameError.textContent = 'اسم العائلة يجب أن يحتوي على حروف ومسافات فقط';
            lastNameError.style.display = 'block';
            lastNameInput.classList.add('error');
            hasError = true;
        }

        // Validate email only if it has changed
        const newEmail = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (newEmail !== user.email) {
            if (!newEmail.match(emailRegex)) {
                emailError.textContent = 'البريد الإلكتروني غير صالح';
                emailError.style.display = 'block';
                emailInput.classList.add('error');
                hasError = true;
            }
        }

        // Validate phone
        const phoneRegex = /^01[0125][0-9]{8}$/;
        if (phoneInput.value.trim() && !phoneRegex.test(phoneInput.value.trim())) {
            phoneError.textContent = 'رقم الهاتف غير صالح (يجب أن يكون 11 رقمًا يبدأ بـ 01)';
            phoneError.style.display = 'block';
            phoneInput.classList.add('error');
            hasError = true;
        }

        // Validate address
        if (addressInput.value.trim() && addressInput.value.trim().length < 5) {
            addressError.textContent = 'العنوان يجب أن يكون 5 أحرف على الأقل';
            addressError.style.display = 'block';
            addressInput.classList.add('error');
            hasError = true;
        }

        // Validate governorate
        if (governorateInput.value.trim() && !nameRegex.test(governorateInput.value.trim())) {
            governorateError.textContent = 'المحافظة يجب أن تحتوي على حروف ومسافات فقط';
            governorateError.style.display = 'block';
            governorateInput.classList.add('error');
            hasError = true;
        }

        if (!hasError) {
            const oldEmail = user.email;
            user.firstName = firstNameInput.value.trim();
            user.lastName = lastNameInput.value.trim();
            user.name = `${user.firstName} ${user.lastName}`.trim();
            user.email = newEmail;
            user.phone = phoneInput.value.trim() || "";
            user.address = addressInput.value.trim() || "";
            user.governorate = governorateInput.value.trim() || "";

            // Update initials image if it was an initials image
            if (user.isInitialsImage) {
                user.image = generateInitialsImage(user.name);
            }

            // Migrate cart and favorites if email changes
            if (newEmail !== oldEmail) {
                const userData = JSON.parse(localStorage.getItem(`userData_${user.email}`) || '{}');
                if (userData.cart || userData.favorites) {
                    localStorage.setItem(`userData_${user.email}`, JSON.stringify({
                        ...userData,
                        userId: user.email,
                        cart: userData.cart || [],
                        favorites: userData.favorites || [],
                        lastUpdated: new Date().toISOString()
                    }));
                    localStorage.removeItem(`cart_${oldEmail}`);
                    localStorage.removeItem(`favorites_${oldEmail}`);
                }
            }

            // Update orders with new user information
            let orders = JSON.parse(localStorage.getItem('orders')) || [];
            orders = orders.map(order => {
                if (order.user.email === oldEmail || order.user.email === user.email) {
                    order.user = {
                        ...order.user,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        phone: user.phone,
                        address: user.address,
                        governorate: user.governorate
                    };
                }
                return order;
            });

            localStorage.setItem('orders', JSON.stringify(orders));

            // Update display fields with highlight effect
            document.getElementById('userName').textContent = user.name || "غير محدد";
            document.getElementById('userEmail').textContent = user.email || "غير محدد";
            document.getElementById('firstNameDisplay').textContent = user.firstName || "غير محدد";
            document.getElementById('lastNameDisplay').textContent = user.lastName || "غير محدد";
            document.getElementById('emailDisplay').textContent = user.email || "غير محدد";
            document.getElementById('phoneDisplay').textContent = user.phone || "غير محدد";
            document.getElementById('addressDisplay').textContent = user.address || "غير محدد";
            document.getElementById('governorateDisplay').textContent = user.governorate || "غير محدد";
            document.getElementById('currentEmail').value = user.email || "غير محدد";
            document.getElementById('userAvatar').src = user.image;
            document.getElementById('avatarPreview').src = user.image;

            // Apply highlight effect
            [firstNameDisplay, lastNameDisplay, emailDisplay, phoneDisplay, addressDisplay, governorateDisplay].forEach(field => {
                field.classList.add('highlight');
                setTimeout(() => field.classList.remove('highlight'), 1000);
            });

            updateUserInStorage(user);
            syncCartWithOrders();
            Swal.fire({
                title: 'تم بنجاح!',
                text: 'تم حفظ التغييرات بنجاح!',
                icon: 'success',
                confirmButtonColor: '#ff8716',
                customClass: { confirmButton: 'btn btn-primary' }
            });
            cancelEditBtn.click();
        }
    });
}

// Modal handling
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        const inputs = modal.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.id !== 'currentEmail') {
                input.value = '';
                input.classList.remove('error');
                const error = document.getElementById(`${input.id}Error`);
                if (error) error.style.display = 'none';
            }
            const eyeIcon = input.parentElement?.querySelector('.fa-eye, .fa-eye-slash');
            if (eyeIcon && input.type === 'text') {
                input.type = 'password';
                eyeIcon.classList.remove('fa-eye-slash');
                eyeIcon.classList.add('fa-eye');
            }
            const clearIcon = input.parentElement?.querySelector('.fa-xmark');
            if (clearIcon) clearIcon.classList.add('hidden');
        });
        if (modalId === 'changeAvatarModal') {
            document.getElementById('avatarInput').value = '';
            document.getElementById('avatarPreview').src = user.image;
            document.getElementById('avatarError').style.display = 'none';
            document.getElementById('avatarSpinner').style.display = 'none';
            document.getElementById('updateAvatarBtn').disabled = false;
        }
    }
}

// Close modal when clicking outside
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', e => {
        if (e.target === modal) {
            closeModal(modal.id);
        }
    });
});

// Display orders
function displayOrders(searchQuery = '') {
    const ordersList = document.getElementById('ordersList');
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders = orders.filter(order => order.user.email === user.email);
    if (searchQuery) {
        orders = orders.filter(order =>
            order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            new Date(order.date).toLocaleString('ar-EG').includes(searchQuery)
        );
    }
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (orders.length === 0) {
        ordersList.innerHTML = '<div class="no-orders">لا توجد طلبات مطابقة</div>';
        return;
    }

    ordersList.innerHTML = orders.map((order, index) => `
        <div class="order-item ${index === 0 ? 'latest' : ''}" onclick="showOrderDetails('${order.orderNumber}')">
            <div class="order-info">
                <div class="order-number">رقم الطلب: ${order.orderNumber}</div>
                <div class="order-date">التاريخ: ${new Date(order.date).toLocaleString('ar-EG')}</div>
                <div class="order-status">الحالة: ${order.status || 'قيد المعالجة'}</div>
                <div class="order-total">الإجمالي: ${order.total} جنيه</div>
            </div>
            <i class="fas fa-trash-alt delete-order" onclick="deleteOrder('${order.orderNumber}', event)"></i>
        </div>
    `).join('');
}

// Delete order
window.deleteOrder = function (orderNumber, event) {
    event.stopPropagation();
    Swal.fire({
        title: 'هل أنت متأكد؟',
        text: 'سيتم حذف الطلب نهائيًا ولن تتمكن من استعادته!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff8716',
        cancelButtonColor: '#c82333',
        confirmButtonText: 'نعم، احذف الطلب',
        cancelButtonText: 'إلغاء',
        customClass: { confirmButton: 'btn btn-primary', cancelButton: 'btn btn-destructive' }
    }).then((result) => {
        if (result.isConfirmed) {
            let orders = JSON.parse(localStorage.getItem('orders')) || [];
            const order = orders.find(o => o.orderNumber === orderNumber);
            if (order) {
                orders = orders.filter(o => o.orderNumber !== orderNumber);
                localStorage.setItem('orders', JSON.stringify(orders));

                // Remove order items from cart
                let cart = JSON.parse(localStorage.getItem(`cart_${user.email}`)) || [];
                if (order.items && order.items.length > 0) {
                    order.items.forEach(orderItem => {
                        cart = cart.filter(cartItem => cartItem.id !== orderItem.id);
                    });
                    localStorage.setItem(`cart_${user.email}`, JSON.stringify(cart));
                }

                // Update userData cart
                let userData = JSON.parse(localStorage.getItem(`userData_${user.email}`)) || {};
                if (userData.cart) {
                    userData.cart = userData.cart.filter(cartItem => !order.items.some(orderItem => orderItem.id === cartItem.id));
                    localStorage.setItem(`userData_${user.email}`, JSON.stringify({
                        ...userData,
                        lastUpdated: new Date().toISOString()
                    }));
                }

                syncCartWithOrders();
                displayOrders();
                Swal.fire({
                    title: 'تم الحذف!',
                    text: 'تم حذف الطلب بنجاح!',
                    icon: 'success',
                    confirmButtonColor: '#ff8716',
                    customClass: { confirmButton: 'btn btn-primary' }
                });
            }
        }
    });
};

// Show order details
window.showOrderDetails = function (orderNumber) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.orderNumber === orderNumber);
    if (!order) {
        Swal.fire({
            title: 'خطأ',
            text: 'لم يتم العثور على الطلب',
            icon: 'error',
            confirmButtonColor: '#ff8716',
            customClass: { confirmButton: 'btn btn-primary' }
        });
        return;
    }

    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (order.orderNumber === orders[0].orderNumber) {
        Swal.fire({
            title: 'أحدث طلب!',
            text: 'هذا هو أحدث طلب قمت به.',
            icon: 'info',
            confirmButtonColor: '#ff8716',
            customClass: { confirmButton: 'btn btn-primary' }
        });
    }

    const orderDetailsContent = document.getElementById('orderDetailsContent');
    orderDetailsContent.innerHTML = `
        <div class="order-details">
            <h3>تفاصيل الطلب ${order.orderNumber}</h3>
            <p><strong>التاريخ:</strong> ${new Date(order.date).toLocaleString('ar-EG')}</p>
            <p><strong>الحالة:</strong> ${order.status || 'قيد المعالجة'}</p>
            <p><strong>الاسم الأول:</strong> ${order.user.firstName || 'غير محدد'}</p>
            <p><strong>اسم العائلة:</strong> ${order.user.lastName || 'غير محدد'}</p>
            <p><strong>البريد الإلكتروني:</strong> ${order.user.email}</p>
            <p><strong>رقم الهاتف:</strong> ${order.user.phone || 'غير محدد'}</p>
            <p><strong>العنوان:</strong> ${order.user.address || 'غير محدد'}, ${order.user.address2 || ''}, ${order.user.city || 'غير محدد'}, ${order.user.governorate || 'غير محدد'}, ${order.user.postcode || 'غير محدد'}</p>
            <p><strong>طريقة الدفع:</strong> ${order.paymentMethod}</p>
            <p><strong>ملاحظات الطلب:</strong> ${order.orderNotes || 'لا توجد ملاحظات'}</p>
            <h4>العناصر:</h4>
            <ul style="list-style: none; padding: 0;">
            ${order.items.map(item => `
                <li style="display: flex; align-items: center; justify-content: flex-start; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                    <img src="../${item.img}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px; border-radius: 4px;">
                    <div style="flex: 1; display: flex; flex-direction: column;">
                        <a href="../pages/product_details.html?id=${item.id}" target="_blank" style="font-weight: 600;">
                            ${item.name}
                        </a>
                        <div style="color: #555; font-size: 14px; display: flex; gap: 15px; margin-right: 22px;">
                            <span>Quantity: <strong>${item.quantity}</strong></span>
                            <span>Price: <strong>EGP ${item.price.toLocaleString('en-EG')}</strong></span>
                            <span>Total: <strong>EGP ${(item.quantity * item.price).toLocaleString('en-EG')}</strong></span>
                        </div>
                    </div>
                </li>
            `).join('')}
            </ul>
            <p><strong>الإجمالي الفرعي:</strong> EGP ${order.subtotal.toLocaleString('en-EG')}</p>
            <p><strong>الخصم:</strong> EGP ${order.discountAmount.toLocaleString('en-EG')} (${order.discount})</p>
            <p><strong>الشحن:</strong> ${order.shipping} جنيه</p>
            <p><strong>الإجمالي:</strong> ${order.total} جنيه</p>
        </div>
    `;
    document.getElementById('orderStatusSelect').value = order.status || 'Pending';
    openModal('orderDetailsModal');

    // Update order status
    document.getElementById('updateStatusBtn').onclick = () => {
        const orderStatusSelect = document.getElementById('orderStatusSelect');
        const orderSpinner = document.getElementById('orderSpinner');
        orderSpinner.style.display = 'block';
        document.getElementById('updateStatusBtn').disabled = true;

        setTimeout(() => {
            let orders = JSON.parse(localStorage.getItem('orders')) || [];
            const orderToUpdate = orders.find(o => o.orderNumber === orderNumber);
            if (orderToUpdate) {
                orderToUpdate.status = orderStatusSelect.value;
                localStorage.setItem('orders', JSON.stringify(orders));
                displayOrders();
                showOrderDetails(orderNumber);
                Swal.fire({
                    title: 'تم!',
                    text: 'تم تحديث حالة الطلب بنجاح!',
                    icon: 'success',
                    confirmButtonColor: '#ff8716',
                    customClass: { confirmButton: 'btn btn-primary' }
                });
            }
            orderSpinner.style.display = 'none';
            document.getElementById('updateStatusBtn').disabled = false;
        }, 500);
    };

    // Email order button
    document.getElementById('emailOrderBtn').onclick = () => emailOrderDetails(order);
};

// Email order details (simulated)
function emailOrderDetails(order) {
    const subject = `تفاصيل الطلب ${order.orderNumber}`;
    const body = `
    تفاصيل الطلب ${order.orderNumber}
    التاريخ: ${new Date(order.date).toLocaleString('ar-EG')}
    الحالة: ${order.status || 'قيد المعالجة'}
    الاسم الأول: ${order.user.firstName || 'غير محدد'}
    اسم العائلة: ${order.user.lastName || 'غير محدد'}
    البريد الإلكتروني: ${order.user.email}
    رقم الهاتف: ${order.user.phone || 'غير محدد'}
    العنوان: ${order.user.address || 'غير محدد'}, ${order.user.address2 || ''}, ${order.user.city || 'غير محدد'}, ${order.user.governorate || 'غير محدد'}, ${order.user.postcode || 'غير محدد'}
    طريقة الدفع: ${order.paymentMethod}
    ملاحظات الطلب: ${order.orderNotes || 'لا توجد ملاحظات'}

    العناصر:
    ${order.items.map(item => `- ${item.name} - ${item.quantity} × ${item.price} جنيه = ${item.quantity * item.price} جنيه`).join('\n')}

    الإجمالي الفرعي: ${order.subtotal} جنيه
    الخصم: ${order.discountAmount} جنيه (${order.discount * 100}%)
    الشحن: ${order.shipping} جنيه
    الإجمالي: ${order.total} جنيه
    `;
    window.location.href = `mailto:${order.user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    Swal.fire({
        title: 'تم!',
        text: 'تم فتح تطبيق البريد الإلكتروني مع تفاصيل الطلب!',
        icon: 'success',
        confirmButtonColor: '#ff8716',
        customClass: { confirmButton: 'btn btn-primary' }
    });
}

// Toggle personal info view
window.showPersonalInfo = function () {
    document.getElementById('personalInfoCard').style.display = 'block';
    document.getElementById('securityCard').style.display = 'block';
    document.getElementById('ordersCard').style.display = 'none';
    document.querySelector('.sidebar li.active').classList.remove('active');
    document.querySelector('.sidebar li:nth-child(1)').classList.add('active');
};

// Toggle orders view
window.showOrders = function () {
    document.getElementById('personalInfoCard').style.display = 'none';
    document.getElementById('securityCard').style.display = 'none';
    document.getElementById('ordersCard').style.display = 'block';
    document.querySelector('.sidebar li.active').classList.remove('active');
    document.querySelector('.sidebar li:nth-child(2)').classList.add('active');
    displayOrders();
};

// Change Password
const changePasswordBtn = document.getElementById('changePasswordBtn');
if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', () => openModal('changePasswordModal'));
}

const updatePasswordBtn = document.getElementById('updatePasswordBtn');
if (updatePasswordBtn) {
    updatePasswordBtn.addEventListener('click', () => {
        const currentPassword = document.getElementById('currentPassword');
        const newPassword = document.getElementById('newPassword');
        const confirmPassword = document.getElementById('confirmPassword');
        let hasError = false;

        document.getElementById('currentPasswordError').style.display = 'none';
        document.getElementById('newPasswordError').style.display = 'none';
        document.getElementById('confirmPasswordError').style.display = 'none';
        currentPassword.classList.remove('error');
        newPassword.classList.remove('error');
        confirmPassword.classList.remove('error');

        if (!currentPassword.value) {
            document.getElementById('currentPasswordError').textContent = 'كلمة المرور الحالية مطلوبة';
            document.getElementById('currentPasswordError').style.display = 'block';
            currentPassword.classList.add('error');
            hasError = true;
        } else if (currentPassword.value !== user.password) {
            document.getElementById('currentPasswordError').textContent = 'كلمة المرور الحالية غير صحيحة';
            document.getElementById('currentPasswordError').style.display = 'block';
            currentPassword.classList.add('error');
            hasError = true;
        }
        if (!newPassword.value) {
            document.getElementById('newPasswordError').textContent = 'كلمة المرور الجديدة مطلوبة';
            document.getElementById('newPasswordError').style.display = 'block';
            newPassword.classList.add('error');
            hasError = true;
        } else if (newPassword.value.length < 6) {
            document.getElementById('newPasswordError').textContent = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
            document.getElementById('newPasswordError').style.display = 'block';
            newPassword.classList.add('error');
            hasError = true;
        } else if (newPassword.value === user.password) {
            Swal.fire({
                title: 'خطأ',
                text: 'كلمة المرور الجديدة مطابقة لكلمة المرور الحالية',
                icon: 'error',
                confirmButtonColor: '#ff8716',
                customClass: { confirmButton: 'btn btn-primary' }
            });
            hasError = true;
        }
        if (newPassword.value !== confirmPassword.value) {
            document.getElementById('confirmPasswordError').textContent = 'كلمة المرور غير متطابقة';
            document.getElementById('confirmPasswordError').style.display = 'block';
            confirmPassword.classList.add('error');
            hasError = true;
        }

        if (!hasError) {
            user.password = newPassword.value;
            updateUserInStorage(user);
            Swal.fire({
                title: 'تم بنجاح!',
                text: 'تم تحديث كلمة المرور بنجاح!',
                icon: 'success',
                confirmButtonColor: '#ff8716',
                customClass: { confirmButton: 'btn btn-primary' }
            });
            closeModal('changePasswordModal');
        }
    });
}

// Change Email
const changeEmailBtn = document.getElementById('changeEmailBtn');
if (changeEmailBtn) {
    changeEmailBtn.addEventListener('click', () => openModal('changeEmailModal'));
}

const updateEmailBtn = document.getElementById('updateEmailBtn');
if (updateEmailBtn) {
    updateEmailBtn.addEventListener('click', () => {
        const emailPassword = document.getElementById('emailPassword');
        const newEmail = document.getElementById('newEmail');
        let hasError = false;

        document.getElementById('emailPasswordError').style.display = 'none';
        document.getElementById('newEmailError').style.display = 'none';
        emailPassword.classList.remove('error');
        newEmail.classList.remove('error');

        if (!emailPassword.value) {
            document.getElementById('emailPasswordError').textContent = 'كلمة المرور مطلوبة';
            document.getElementById('emailPasswordError').style.display = 'block';
            emailPassword.classList.add('error');
            hasError = true;
        } else if (emailPassword.value !== user.password) {
            document.getElementById('emailPasswordError').textContent = 'كلمة المرور غير صحيحة';
            document.getElementById('emailPasswordError').style.display = 'block';
            emailPassword.classList.add('error');
            hasError = true;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!newEmail.value.match(emailRegex)) {
            document.getElementById('newEmailError').textContent = 'البريد الإلكتروني غير صالح';
            document.getElementById('newEmailError').style.display = 'block';
            newEmail.classList.add('error');
            hasError = true;
        } else if (newEmail.value.trim() === user.email) {
            Swal.fire({
                title: 'خطأ',
                text: 'البريد الإلكتروني الجديد مطابق للبريد الحالي',
                icon: 'error',
                confirmButtonColor: '#ff8716',
                customClass: { confirmButton: 'btn btn-primary' }
            });
            hasError = true;
        }

        if (!hasError) {
            const oldEmail = user.email;
            user.email = newEmail.value;
            // Migrate user data for new email
            const userData = JSON.parse(localStorage.getItem(`userData_${user.email}`) || '{}');
            if (userData.cart || userData.favorites) {
                localStorage.setItem(`userData_${user.email}`, JSON.stringify({
                    ...userData,
                    userId: user.email,
                    cart: userData.cart || [],
                    favorites: userData.favorites || [],
                    lastUpdated: new Date().toISOString()
                }));
                localStorage.removeItem(`cart_${oldEmail}`);
                localStorage.removeItem(`favorites_${oldEmail}`);
            }
            // Update orders with new email
            let orders = JSON.parse(localStorage.getItem('orders')) || [];
            orders = orders.map(order => {
                if (order.user.email === oldEmail) {
                    order.user.email = user.email;
                }
                return order;
            });
            localStorage.setItem('orders', JSON.stringify(orders));

            document.getElementById('userEmail').textContent = user.email || "غير محدد";
            document.getElementById('emailDisplay').textContent = user.email || "غير محدد";
            document.getElementById('emailInput').value = user.email;
            document.getElementById('currentEmail').value = user.email || "غير محدد";
            updateUserInStorage(user);
            Swal.fire({
                title: 'تم بنجاح!',
                text: 'تم تحديث البريد الإلكتروني بنجاح!',
                icon: 'success',
                confirmButtonColor: '#ff8716',
                customClass: { confirmButton: 'btn btn-primary' }
            });
            closeModal('changeEmailModal');
        }
    });
}

// Delete Account
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', () => openModal('deleteAccountModal'));
}

const deleteAccountConfirmBtn = document.getElementById('deleteAccountConfirmBtn');
if (deleteAccountConfirmBtn) {
    deleteAccountConfirmBtn.addEventListener('click', () => {
        const deletePassword = document.getElementById('deletePassword');
        const confirmDelete = document.getElementById('confirmDelete');
        let hasError = false;

        document.getElementById('deletePasswordError').style.display = 'none';
        document.getElementById('confirmDeleteError').style.display = 'none';
        deletePassword.classList.remove('error');
        confirmDelete.classList.remove('error');

        if (!deletePassword.value) {
            document.getElementById('deletePasswordError').textContent = 'كلمة المرور مطلوبة';
            document.getElementById('deletePasswordError').style.display = 'block';
            deletePassword.classList.add('error');
            hasError = true;
        } else if (deletePassword.value !== user.password) {
            document.getElementById('deletePasswordError').textContent = 'كلمة المرور غير صحيحة';
            document.getElementById('deletePasswordError').style.display = 'block';
            deletePassword.classList.add('error');
            hasError = true;
        }
        if (confirmDelete.value !== 'DELETE') {
            document.getElementById('confirmDeleteError').textContent = 'يجب كتابة "DELETE" للتأكيد';
            document.getElementById('confirmDeleteError').style.display = 'block';
            confirmDelete.classList.add('error');
            hasError = true;
        }

        if (!hasError) {
            // Delete user from users array
            let users = JSON.parse(localStorage.getItem('users')) || [];
            users = users.filter(u => u.email !== user.email);
            localStorage.setItem('users', JSON.stringify(users));

            // Delete comments related to the user
            let comments = JSON.parse(localStorage.getItem('comments')) || [];
            comments = comments.filter(comment => comment.userEmail !== user.email);
            localStorage.setItem('comments', JSON.stringify(comments));

            // Delete user-related data from UserDataManager
            if (user.email) {
                localStorage.removeItem(`userData_${user.email}`);
                localStorage.removeItem(`cart_${user.email}`);
                localStorage.removeItem(`favorites_${user.email}`);
            }

            // Delete orders related to the user
            let orders = JSON.parse(localStorage.getItem('orders')) || [];
            orders = orders.filter(order => order.user.email !== user.email);
            localStorage.setItem('orders', JSON.stringify(orders));

            // Delete standard user-related keys
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('cart');
            localStorage.removeItem('favorites');

            // Trigger logout event
            window.logoutUser();

            Swal.fire({
                title: 'تم بنجاح!',
                text: 'تم حذف الحساب وجميع البيانات المتعلقة به بنجاح!',
                icon: 'success',
                confirmButtonColor: '#ff8716',
                customClass: { confirmButton: 'btn btn-primary' }
            }).then(() => {
                window.location.href = '../index.html';
            });
        }
    });
}

function goToHome() {
    window.location.href = '../index.html';
}
function updateIcons() {
    const inputs = [
        'firstNameInput', 'lastNameInput', 'emailInput', 'phoneInput', 'addressInput',
        'governorateInput', 'newEmail', 'confirmDelete', 'resetEmail'
    ];

    inputs.forEach(id => {
        const input = document.getElementById(id);
        const checkIcon = document.getElementById(`check${id.charAt(0).toUpperCase() + id.slice(1)}Icon`);
        if (input && checkIcon) {
            checkIcon.classList.toggle('hidden', !input.value.trim());
            const defaultIcon = input.parentElement.querySelector('.icon.default');
            if (defaultIcon) {
                defaultIcon.classList.toggle('hidden', input.value.trim());
            }
        }
    });

    const passwordInputs = ['currentPassword', 'newPassword', 'confirmPassword', 'emailPassword', 'deletePassword'];
    passwordInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            const toggleIcon = input.parentElement.querySelector('.icon.toggle-password');
            if (toggleIcon) {
                toggleIcon.classList.toggle('hidden', !input.value.trim());
                const defaultIcon = input.parentElement.querySelector('.icon.default');
                if (defaultIcon) {
                    defaultIcon.classList.toggle('hidden', input.value.trim());
                }
            }
        }
    });
}
// Logout
function logout() {
    window.logoutUser();
    Swal.fire({
        title: 'تم بنجاح!',
        text: 'تم تسجيل الخروج بنجاح!',
        icon: 'success',
        confirmButtonColor: '#ff8716',
        customClass: { confirmButton: 'btn btn-primary' }
    }).then(() => {
        window.location.href = '../index.html';
    });
}


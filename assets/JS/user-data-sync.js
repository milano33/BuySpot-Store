"use strict";

class UserDataManager {
    constructor() {
        this.currentUser = null;
        this.cart = [];
        this.favorites = [];
        this.postLogoutExpirationDays = 7;
        this.updateUITimeout = null;
        this.initializeSystem();
    }

    initializeSystem() {
        // console.log(' Initializing User Data Manager');
        // Fix old localStorage data
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                if (parsedUser && !parsedUser.userId) {
                    parsedUser.userId = parsedUser.email;
                    parsedUser.isLoggedIn = true;
                    localStorage.setItem('currentUser', JSON.stringify(parsedUser));
                    localStorage.setItem('loggedInUser', JSON.stringify(parsedUser));
                }
                if (parsedUser && !('isLoggedIn' in parsedUser)) {
                    parsedUser.isLoggedIn = true;
                    localStorage.setItem('currentUser', JSON.stringify(parsedUser));
                    localStorage.setItem('loggedInUser', JSON.stringify(parsedUser));
                }
            } catch (err) {
                console.error(' Error fixing old currentUser data:', err);
            }
        }

        this.checkLoginStatus();
        this.cleanupExpiredPostLogoutData();
        document.addEventListener('userLogin', (e) => {
            this.loadUserSpecificData();
        });
        document.addEventListener('userLogout', () => {
            this.updateUI();
        });
        // Removed auto-save interval; explicit saves are sufficient
    }

    cleanupExpiredPostLogoutData() {
        const currentTime = new Date().getTime();
        const expirationTime = this.postLogoutExpirationDays * 24 * 60 * 60 * 1000;

        ['postLogoutTempCart', 'postLogoutTempFavorites'].forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                try {
                    const { timestamp } = JSON.parse(data);
                    if (currentTime - timestamp > expirationTime) {
                        localStorage.removeItem(key);
                    }
                } catch (err) {
                    console.error(` Error parsing ${key}:`, err);
                    localStorage.removeItem(key);
                }
            }
        });
    }

    checkLoginStatus() {
        const startTime = performance.now();
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
                if (!this.currentUser.userId) {
                    this.currentUser.userId = this.currentUser.email;
                    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                    localStorage.setItem('loggedInUser', JSON.stringify(this.currentUser));
                }
                if (!('isLoggedIn' in this.currentUser)) {
                    this.currentUser.isLoggedIn = true;
                    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                    localStorage.setItem('loggedInUser', JSON.stringify(this.currentUser));
                }
                if (this.currentUser.isLoggedIn) {
                    this.loadUserSpecificData();
                } else {
                    this.currentUser = null;
                    localStorage.removeItem('currentUser');
                    localStorage.removeItem('loggedInUser');
                    this.resetToGuestState();
                }
            } catch (err) {
                console.error(' Error parsing currentUser:', err);
                this.currentUser = null;
                localStorage.removeItem('currentUser');
                localStorage.removeItem('loggedInUser');
                this.resetToGuestState();
            }
        } else {
            localStorage.removeItem('loggedInUser');
            this.resetToGuestState();
        }
        this.updateUI();
        const endTime = performance.now();
        // console.log(` checkLoginStatus took ${endTime - startTime}ms`);
    }

    async loginUser({ userId, username, email, token, image = '', isInitialsImage = false }) {
        const startTime = performance.now();
        userId = userId || email;
        this.currentUser = {
            userId,
            username,
            email,
            token,
            isLoggedIn: true,
            loginTime: new Date().toISOString(),
            image,
            isInitialsImage
        };

        try {
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            localStorage.setItem('loggedInUser', JSON.stringify(this.currentUser));

            // Merge guest and post-logout data
            const sessionCart = JSON.parse(localStorage.getItem('cart') || '[]');
            const sessionFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            let postLogoutCart = [];
            let postLogoutFavorites = [];
            const currentTime = new Date().getTime();
            const expirationTime = this.postLogoutExpirationDays * 24 * 60 * 60 * 1000;

            const postLogoutTempCart = localStorage.getItem('postLogoutTempCart');
            if (postLogoutTempCart) {
                try {
                    const { timestamp, email: storedEmail, cart } = JSON.parse(postLogoutTempCart);
                    if (currentTime - timestamp <= expirationTime && storedEmail === email) {
                        postLogoutCart = cart;
                    }
                } catch (err) {
                    console.error(' Error parsing postLogoutTempCart:', err);
                }
            }

            const postLogoutTempFavorites = localStorage.getItem('postLogoutTempFavorites');
            if (postLogoutTempFavorites) {
                try {
                    const { timestamp, email: storedEmail, favorites } = JSON.parse(postLogoutTempFavorites);
                    if (currentTime - timestamp <= expirationTime && storedEmail === email) {
                        postLogoutFavorites = favorites;
                    }
                } catch (err) {
                    console.error(' Error parsing postLogoutTempFavorites:', err);
                }
            }

            const existingUserData = JSON.parse(localStorage.getItem(`userData_${userId}`) || '{}');
            const existingCart = Array.isArray(existingUserData.cart) ? existingUserData.cart : [];
            const existingFavorites = Array.isArray(existingUserData.favorites) ? existingUserData.favorites : [];

            this.cart = this.mergeCarts([...existingCart, ...sessionCart, ...postLogoutCart]);
            this.favorites = [...new Set([...existingFavorites, ...sessionFavorites, ...postLogoutFavorites].map(item => item.id))].map(id =>
                [...existingFavorites, ...sessionFavorites, ...postLogoutFavorites].find(item => item.id === id)
            );

            await this.saveCurrentDataToUser();
            localStorage.setItem('cart', JSON.stringify(this.cart));
            localStorage.setItem('favorites', JSON.stringify(this.favorites));
            localStorage.removeItem('postLogoutTempCart');
            localStorage.removeItem('postLogoutTempFavorites');

            document.dispatchEvent(new CustomEvent('userLogin', { detail: this.currentUser }));
            this.updateUI();
            if (typeof window.updateAuthUI === 'function') {
                window.updateAuthUI();
            }
            const endTime = performance.now();
            // console.log(` loginUser took ${endTime - startTime}ms`);
        } catch (err) {
            console.error(' Error during login:', err);
            this.currentUser = null;
            localStorage.removeItem('currentUser');
            localStorage.removeItem('loggedInUser');
            this.resetToGuestState();
            this.updateUI();
        }
    }

    mergeCarts(carts) {
        const mergedCart = {};
        carts.forEach(item => {
            if (mergedCart[item.id]) {
                mergedCart[item.id].quantity = (mergedCart[item.id].quantity || 1) + (item.quantity || 1);
            } else {
                mergedCart[item.id] = { ...item, quantity: item.quantity || 1 };
            }
        });
        return Object.values(mergedCart);
    }

    async handleUserLogout(redirectUrl = '/index.html') {
        const startTime = performance.now();
        try {
            if (this.currentUser?.userId) {
                const currentTime = new Date().getTime();
                localStorage.setItem('postLogoutTempCart', JSON.stringify({
                    timestamp: currentTime,
                    email: this.currentUser.email,
                    cart: this.cart
                }));
                localStorage.setItem('postLogoutTempFavorites', JSON.stringify({
                    timestamp: currentTime,
                    email: this.currentUser.email,
                    favorites: this.favorites
                }));
                await this.saveCurrentDataToUser();
            }

            this.currentUser = null;
            localStorage.removeItem('currentUser');
            localStorage.removeItem('loggedInUser');
            this.resetToGuestState();
            document.dispatchEvent(new CustomEvent('userLogout'));

            if (typeof Swal !== 'undefined') {
                await Swal.fire({
                    title: 'تم تسجيل الخروج بنجاح!',
                    text: 'بياناتك محفوظة مؤقتًا لمدة 7 أيام.',
                    icon: 'success',
                    confirmButtonColor: '#ff8716',
                    customClass: { confirmButton: 'btn btn-primary' },
                    timer: 800,
                    timerProgressBar: true
                });
            } else {
                alert('تم تسجيل الخروج بنجاح! بياناتك محفوظة مؤقتًا لمدة 7 أيام.');
            }

            this.updateUI();
            if (typeof window.updateAuthUI === 'function') {
                window.updateAuthUI();
            }

            setTimeout(() => {
                window.location.replace(redirectUrl);
            }, 1000);
            const endTime = performance.now();
            // console.log(` handleUserLogout took ${endTime - startTime}ms`);
        } catch (err) {
            console.error(' Error during logout:', err);
            this.resetToGuestState();
            this.updateUI();
        }
    }

    resetToGuestState() {
        this.currentUser = null;
        this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
        this.favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        localStorage.setItem('cart', JSON.stringify(this.cart));
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        this.updateUI();
        if (typeof window.updateAuthUI === 'function') {
            window.updateAuthUI();
        }
    }

    async saveCurrentDataToUser() {
        const startTime = performance.now();
        try {
            this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
            this.favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

            if (!this.currentUser?.userId) {
                localStorage.setItem('cart', JSON.stringify(this.cart));
                localStorage.setItem('favorites', JSON.stringify(this.favorites));
                return;
            }

            const userData = {
                userId: this.currentUser.userId,
                email: this.currentUser.email,
                cart: this.cart,
                favorites: this.favorites,
                lastUpdated: new Date().toISOString()
            };

            localStorage.setItem(`userData_${this.currentUser.userId}`, JSON.stringify(userData));
            localStorage.setItem(`cart_${this.currentUser.email}`, JSON.stringify(this.cart));
            localStorage.setItem(`favorites_${this.currentUser.email}`, JSON.stringify(this.favorites));
            const endTime = performance.now();
            // console.log(` saveCurrentDataToUser took ${endTime - startTime}ms`);
        } catch (err) {
            console.error(' Error saving user data:', err);
        }
    }

    async loadUserSpecificData() {
        if (!this.currentUser?.userId) {
            this.resetToGuestState();
            return;
        }

        try {
            const userData = JSON.parse(localStorage.getItem(`userData_${this.currentUser.userId}`) || '{}');
            const sessionCart = JSON.parse(localStorage.getItem('cart') || '[]');
            const sessionFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');

            this.cart = sessionCart.length > 0 ? sessionCart : (Array.isArray(userData.cart) ? userData.cart : []);
            this.favorites = sessionFavorites.length > 0 ? sessionFavorites : (Array.isArray(userData.favorites) ? userData.favorites : []);

            await this.saveCurrentDataToUser();
            localStorage.setItem('cart', JSON.stringify(this.cart));
            localStorage.setItem('favorites', JSON.stringify(this.favorites));
            this.updateUI();
        } catch (err) {
            console.error(' Error loading user data:', err);
            this.resetToGuestState();
        }
    }

    addToCart(product) {
        const startTime = performance.now();
        try {
            const minimalProduct = {
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: product.quantity || 1,
                img: product.img,
                description: product.description,
                category: product.category,
                rating: product.rating,
                stock: product.stock
            };

            const existingItemIndex = this.cart.findIndex(item => item.id === product.id);
            if (existingItemIndex >= 0) {
                this.cart[existingItemIndex].quantity += (product.quantity || 1);
            } else {
                this.cart.push(minimalProduct);
            }

            localStorage.setItem('cart', JSON.stringify(this.cart));
            this.saveCurrentDataToUser();
            this.updateUI();

            const buttons = document.querySelectorAll(`.cart-button[data-id="${product.id}"]`);
            buttons.forEach(btn => {
                btn.classList.add("active");
                btn.innerHTML = 'Added to Cart';
                btn.setAttribute('disabled', 'disabled');
            });

            const endTime = performance.now();
            // console.log(` addToCart took ${endTime - startTime}ms`);
        } catch (err) {
            console.error(' Error adding to cart:', err);
        }
    }

    deleteFromCart(index) {
        const startTime = performance.now();
        try {
            if (index >= 0 && index < this.cart.length) {
                const removedProduct = this.cart.splice(index, 1)[0];
                localStorage.setItem('cart', JSON.stringify(this.cart));
                this.saveCurrentDataToUser();
                this.updateUI();
                if (typeof window.updateCart === 'function') {
                    window.updateCart();
                }
                const buttons = document.querySelectorAll(`.cart-button[data-id="${removedProduct.id}"]`);
                buttons.forEach(btn => {
                    btn.classList.remove("active");
                    btn.innerHTML = 'Add to Cart';
                    btn.removeAttribute('disabled');
                });
            }
            const endTime = performance.now();
            // console.log(` deleteFromCart took ${endTime - startTime}ms`);
        } catch (err) {
            console.error(' Error deleting from cart:', err);
        }
    }

    increaseQuantity(index) {
        const startTime = performance.now();
        try {
            if (index >= 0 && index < this.cart.length) {
                this.cart[index].quantity = (this.cart[index].quantity || 1) + 1;
                localStorage.setItem('cart', JSON.stringify(this.cart));
                this.saveCurrentDataToUser();
                this.updateUI();
                if (typeof window.updateCart === 'function') {
                    window.updateCart();
                }
            }
            const endTime = performance.now();
            // console.log(` increaseQuantity took ${endTime - startTime}ms`);
        } catch (err) {
            console.error(' Error increasing quantity:', err);
        }
    }

    decreaseQuantity(index) {
        const startTime = performance.now();
        try {
            if (index >= 0 && index < this.cart.length) {
                if (this.cart[index].quantity > 1) {
                    this.cart[index].quantity -= 1;
                } else {
                    this.deleteFromCart(index);
                    return;
                }
                localStorage.setItem('cart', JSON.stringify(this.cart));
                this.saveCurrentDataToUser();
                this.updateUI();
                if (typeof window.updateCart === 'function') {
                    window.updateCart();
                }
            }
            const endTime = performance.now();
            // console.log(` decreaseQuantity took ${endTime - startTime}ms`);
        } catch (err) {
            console.error(' Error decreasing quantity:', err);
        }
    }

    addToFavorites(product) {
        const startTime = performance.now();
        try {
            const minimalProduct = {
                id: product.id,
                name: product.name,
                price: product.price,
                img: product.img,
                description: product.description,
                category: product.category,
                rating: product.rating,
                stock: product.stock
            };

            if (!this.favorites.some(item => item.id === product.id)) {
                this.favorites.push(minimalProduct);
                localStorage.setItem('favorites', JSON.stringify(this.favorites));
                this.saveCurrentDataToUser();
                this.updateUI();
                if (typeof window.updateFavorites === 'function') {
                    window.updateFavorites();
                }
                const buttons = document.querySelectorAll(`.icon-product[data-id="${product.id}"], .btn-favorite[data-id="${product.id}"]`);
                buttons.forEach(btn => {
                    btn.classList.add("active");
                    const icon = btn.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-regular');
                        icon.classList.add('fa-solid', 'active');
                    }
                    if (btn.classList.contains('btn-favorite')) {
                        btn.innerHTML = '<i class="fa-solid fa-heart"></i> In Favorites';
                        btn.setAttribute('disabled', 'disabled');
                    }
                });
            }
            const endTime = performance.now();
            // console.log(` addToFavorites took ${endTime - startTime}ms`);
        } catch (err) {
            console.error(' Error adding to favorites:', err);
        }
    }

    deleteFromFavorites(index) {
        const startTime = performance.now();
        try {
            if (index >= 0 && index < this.favorites.length) {
                const removedProduct = this.favorites.splice(index, 1)[0];
                localStorage.setItem('favorites', JSON.stringify(this.favorites));
                this.saveCurrentDataToUser();
                this.updateUI();
                if (typeof window.updateFavorites === 'function') {
                    window.updateFavorites();
                }
                const buttons = document.querySelectorAll(`.icon-product[data-id="${removedProduct.id}"], .btn-favorite[data-id="${removedProduct.id}"]`);
                buttons.forEach(btn => {
                    btn.classList.remove("active");
                    const icon = btn.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-solid', 'active');
                        icon.classList.add('fa-regular');
                    }
                    if (btn.classList.contains('btn-favorite')) {
                        btn.innerHTML = '<i class="fa-regular fa-heart"></i> Add to Favorites';
                        btn.removeAttribute('disabled');
                    }
                });
            }
            const endTime = performance.now();
            // console.log(` deleteFromFavorites took ${endTime - startTime}ms`);
        } catch (err) {
            console.error(' Error deleting from favorites:', err);
        }
    }

    updateUI() {
        if (this.updateUITimeout) clearTimeout(this.updateUITimeout);
        this.updateUITimeout = setTimeout(() => {
            const startTime = performance.now();
            try {
                const cartCount = this.cart.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
                const favoritesCount = this.favorites.length || 0;

                document.querySelectorAll('.count_item_header, .count-items-cart').forEach(element => {
                    element.textContent = cartCount;
                });
                document.querySelectorAll('.count_favourite').forEach(element => {
                    element.textContent = favoritesCount;
                });

                const authButtons = document.getElementById("authButtons");
                const userDropdownContainer = document.getElementById("userDropdownContainer");
                const headerProfileImage = document.getElementById("headerProfileImage");
                const dropdownMenu = document.getElementById("dropdownMenu");

                const defaultImage = window.location.pathname.includes('pages/')
                    ? "../assets/img/Avatar.webp"
                    : "./assets/img/Avatar.webp";

                if (this.currentUser?.isLoggedIn) {
                    if (authButtons) authButtons.classList.add("hidden");
                    if (userDropdownContainer) userDropdownContainer.classList.remove("hidden");
                    if (headerProfileImage) {
                        headerProfileImage.src = this.currentUser.image && this.currentUser.image.trim() !== ""
                            ? this.currentUser.image
                            : defaultImage;
                        headerProfileImage.classList.remove("hidden");
                    }
                    if (dropdownMenu) dropdownMenu.classList.add("hidden");
                } else {
                    if (authButtons) authButtons.classList.remove("hidden");
                    if (userDropdownContainer) userDropdownContainer.classList.add("hidden");
                    if (headerProfileImage) {
                        headerProfileImage.classList.add("hidden");
                        headerProfileImage.src = defaultImage;
                    }
                    if (dropdownMenu) dropdownMenu.classList.add("hidden");
                }

                document.dispatchEvent(new CustomEvent('authUIUpdate'));
                if (typeof window.updateCart === 'function') {
                    window.updateCart();
                }
                if (typeof window.updateFavorites === 'function') {
                    window.updateFavorites();
                }
                const endTime = performance.now();
                // console.log(` updateUI took ${endTime - startTime}ms`);
            } catch (err) {
                console.error(' Error updating UI:', err);
            }
        }, 50); // 50ms debounce
    }

    isUserLoggedIn() {
        return !!this.currentUser?.isLoggedIn;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getCart() {
        return this.cart;
    }

    getFavorites() {
        return this.favorites;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const redirectUrl = window.location.pathname.includes('pages/') ? "../index.html" : "../../index.html";
            window.userDataManager.handleUserLogout(redirectUrl);
        });
    }
});

window.userDataManager = new UserDataManager();

window.loginUser = function (userData) {
    window.userDataManager.loginUser(userData);
};

window.logoutUser = function () {
    window.userDataManager.handleUserLogout();
};

// Optimized UI rendering functions
window.updateCart = function () {
    const startTime = performance.now();
    try {
        const cartItems = window.userDataManager.getCart();
        const cartContainer = document.querySelector('#cart-container');
        if (cartContainer) {
            cartContainer.innerHTML = '';
            cartItems.forEach((item, index) => {
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `
                    <img src="${item.img}" alt="${item.name}" loading="lazy">
                    <h3>${item.name}</h3>
                    <p>Price: $${item.price}</p>
                    <p>Quantity: ${item.quantity || 1}</p>
                    <button onclick="window.userDataManager.increaseQuantity(${index})">+</button>
                    <button onclick="window.userDataManager.decreaseQuantity(${index})">-</button>
                    <button onclick="window.userDataManager.deleteFromCart(${index})">Remove</button>
                `;
                cartContainer.appendChild(itemElement);
            });
        }
        const endTime = performance.now();
        // console.log(` updateCart took ${endTime - startTime}ms`);
    } catch (err) {
        console.error(' Error updating cart UI:', err);
    }
};

window.updateFavorites = function () {
    const startTime = performance.now();
    try {
        const favorites = window.userDataManager.getFavorites();
        const favoritesContainer = document.querySelector('#favorites-container');
        if (favoritesContainer) {
            favoritesContainer.innerHTML = '';
            favorites.forEach((item, index) => {
                const itemElement = document.createElement('div');
                itemElement.className = 'favorite-item';
                itemElement.innerHTML = `
                    <img src="${item.img}" alt="${item.name}" loading="lazy">
                    <h3>${item.name}</h3>
                    <p>Price: $${item.price}</p>
                    <button onclick="window.userDataManager.deleteFromFavorites(${index})">Remove</button>
                `;
                favoritesContainer.appendChild(itemElement);
            });
        }
        const endTime = performance.now();
        // console.log(` updateFavorites took ${endTime - startTime}ms`);
    } catch (err) {
        console.error(' Error updating favorites UI:', err);
    }
};
"use strick";

const categorybtn = document.querySelector("header .category-btn");
const category_list_btn = document.querySelector("header .nav-category-list");
const category_list_element = document.querySelectorAll("header .nav-category .nav-category-list a");
const overlay = document.querySelector(".overlay");

// تعريف nav_Links بشكل صحيح
const nav_Links = document.querySelectorAll("header nav a");
const cart = document.querySelector("header .cart"); // لو موجود

if (categorybtn) {
    categorybtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (category_list_btn) category_list_btn.classList.toggle("active");


        if (nav_Links) nav_Links.forEach(link => link.classList.remove("active"));
        if (cart) cart.classList.remove("active");
    });
}

category_list_element.forEach(element => {
    element.addEventListener("click", () => {
        if (category_list_btn) category_list_btn.classList.remove("active");
    });
});

// 3) اضغط في أي مكان برا القائمة → يخفيها
document.addEventListener("DOMContentLoaded", function () {
    document.addEventListener("click", (e) => {
        if (categorybtn && category_list_btn && !categorybtn.contains(e.target) && !category_list_btn.contains(e.target)) {
            category_list_btn.classList.remove("active");
        }
    });
});

// -------------------------------------------------

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("header .bottom-header .nav-links li a");
const reviewsLink = document.getElementById("Reviews");

// دالة لتفعيل لينك معين
function setActiveLink(targetLink) {
    navLinks.forEach(link => link.parentElement.classList.remove("active"));
    targetLink.parentElement.classList.add("active");
}

// نشوف هل الصفحة دي فيها reviews-section ؟
const isReviewsPage = document.querySelector(".reviews-section") !== null;

if (isReviewsPage) {
    // لو دي صفحة الريفيوز → خلي All Reviews active على طول
    if (reviewsLink) {
        setActiveLink(reviewsLink);
    }
} else {
    // لو مش صفحة الريفيوز → شغّل Scroll Spy عادي
    window.addEventListener("scroll", () => {
        let current = "";

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollY >= sectionTop - sectionHeight / 3) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            const li = link.parentElement;
            li.classList.remove("active");

            if (link.getAttribute("href") === `#${current}`) {
                li.classList.add("active");
            }
        });
    });
}




//Cart =>
const cart_shopping = document.querySelector("header .top-header .container .header-icon .icon:nth-of-type(2)");
const cartItems = document.querySelector(".cart");
const close_cart = document.querySelector(".cart .close-cart");
const checkout_cart = document.querySelector(".checkout-btn");
const shopMore_cart = document.querySelector(".shop-more-btn");

if (cart_shopping && cartItems) {
    cart_shopping.addEventListener("click", (e) => {
        e.stopPropagation();
        cartItems.classList.add("active");
        overlay?.classList.add("active");
        navMenu?.classList.remove("active");
        category_list_btn?.classList.remove("active");

        localStorage.setItem("cartOpen", "true");
    });
}

if (close_cart && cartItems) {
    close_cart.addEventListener("click", () => {
        cartItems.classList.remove("active");
        overlay?.classList.remove("active");
        localStorage.setItem("cartOpen", "false");
    });
}

if (shopMore_cart && cartItems) {
    shopMore_cart.addEventListener("click", () => {
        cartItems.classList.remove("active");
        overlay?.classList.remove("active");
        localStorage.setItem("cartOpen", "false");
    });
}

if (checkout_cart && cartItems) {
    checkout_cart.addEventListener("click", () => {
        cartItems.classList.remove("active");
        overlay?.classList.remove("active");
        localStorage.setItem("cartOpen", "false");
    });
}



cartItems.addEventListener("click", (e) => {
    e.stopPropagation();
});
// تمسح حالة cartOpen أول ما تتنقل لصفحة تانية
window.addEventListener("pagehide", () => {
    localStorage.removeItem("cartOpen");
});


document.addEventListener("click", (e) => {
    if (!cart_shopping.contains(e.target) && !close_cart.contains(e.target) && !cartItems.contains(e.target)) {
        cartItems.classList.remove("active");
        overlay.classList.remove("active")

        localStorage.setItem("cartOpen", "false");
    }
});


window.addEventListener("load", () => {
    const cartState = localStorage.getItem("cartOpen");
    if (cartState == "true") {
        cartItems.classList.add("active");
        overlay.classList.add("active");
    }
});
// --------------------------------------------------------------


document.addEventListener('DOMContentLoaded', () => {
    // Search and Category handling
    const searchForm = document.getElementById('searchForm');
    const categoryListItems = document.querySelectorAll('.nav-category-list a');

    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const searchTerm = document.getElementById('search').value.trim();
            const category = document.getElementById('category').value;
            let url = window.location.pathname.includes('pages/') ? '../pages/products_list.html' : './pages/products_list.html';
            if (searchTerm) {
                url += `?search=${encodeURIComponent(searchTerm)}`;
            }
            if (category !== 'All Categories') {
                url += searchTerm ? `&category=${encodeURIComponent(category)}` : `?category=${encodeURIComponent(category)}`;
            }
            window.location.href = url;
        });
    }

    if (categoryListItems) {
        categoryListItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const category = item.textContent.trim();
                const url = window.location.pathname.includes('pages/')
                    ? `../pages/products_list.html?category=${encodeURIComponent(category)}`
                    : `./pages/products_list.html?category=${encodeURIComponent(category)}`;
                window.location.href = url;
            });
        });
    }

    // Menu handling
    const open_Menu = document.querySelector(".open-menu");
    const close_Menu = document.querySelector("header .bottom-header .container .nav-links .close-menu ");
    const navMenu = document.querySelector("header .bottom-header .container .nav-links");
    const nav_Links = document.querySelectorAll(".nav-links li a");
    const category_list_btn = document.querySelector(".category-btn");
    const overlay = document.querySelector(".overlay");
    const cart = document.querySelector(".cart");
    const favorites = document.querySelector(".favorites");

    if (open_Menu && navMenu) {
        open_Menu.addEventListener("click", (e) => {
            e.stopPropagation();
            navMenu.classList.toggle("active");
            cart?.classList.remove("active");
            favorites?.classList.remove("active");
            category_list_btn?.classList.remove("active");
        });
    }

    if (close_Menu && navMenu) {
        close_Menu.addEventListener("click", () => {
            navMenu.classList.remove("active");
        });
    }

    if (navMenu) {
        document.addEventListener("click", (e) => {
            if (!open_Menu?.contains(e.target) && !close_Menu?.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove("active");
            }
        });
    }

    nav_Links.forEach(link => {
        link.addEventListener("click", () => {
            navMenu?.classList.remove("active");
        });
    });

    // Cart handling
    const cart_shopping = document.querySelector("header .top-header .container .header-icon .icon:nth-of-type(2)");
    const close_cart = document.querySelector(".cart .close-cart");
    const checkout_cart = document.querySelector(".checkout-btn");
    const shopMore_cart = document.querySelector(".shop-more-btn");

    if (cart_shopping && cart) {
        cart_shopping.addEventListener("click", (e) => {
            e.stopPropagation();
            cart.classList.add("active");
            overlay?.classList.add("active");
            navMenu?.classList.remove("active");
            category_list_btn?.classList.remove("active");
            favorites?.classList.remove("active");
            localStorage.setItem("cartOpen", "true");
        });
    }

    if (close_cart && cart) {
        close_cart.addEventListener("click", () => {
            cart.classList.remove("active");
            overlay?.classList.remove("active");
            localStorage.setItem("cartOpen", "false");
        });
    }

    if (shopMore_cart && cart) {
        shopMore_cart.addEventListener("click", () => {
            cart.classList.remove("active");
            overlay?.classList.remove("active");
            localStorage.setItem("cartOpen", "false");
        });
    }

    if (checkout_cart && cart) {
        checkout_cart.addEventListener("click", () => {
            cart.classList.remove("active");
            overlay?.classList.remove("active");
            localStorage.setItem("cartOpen", "false");
        });
    }

    if (cart) {
        cart.addEventListener("click", (e) => {
            e.stopPropagation();
        });

        document.addEventListener("click", (e) => {
            if (!cart_shopping?.contains(e.target) && !close_cart?.contains(e.target) && !cart.contains(e.target)) {
                cart.classList.remove("active");
                overlay?.classList.remove("active");
                localStorage.setItem("cartOpen", "false");
            }
        });
    }

    // Favorites handling
    const favoriteIcon = document.querySelector('.header-icon .icon a');
    const closeFavorites = document.querySelector('.close-favorites');

    if (favoriteIcon && favorites) {
        favoriteIcon.addEventListener('click', (e) => {
            e.preventDefault();
            favorites.classList.add('active');
            navMenu?.classList.remove("active");
            cart?.classList.remove("active");
            category_list_btn?.classList.remove("active");
        });
    }

    if (closeFavorites && favorites) {
        closeFavorites.addEventListener('click', () => {
            favorites.classList.remove('active');
        });
    }

    if (favorites) {
        document.addEventListener("click", (e) => {
            if (!favoriteIcon?.contains(e.target) && !closeFavorites?.contains(e.target) && !favorites.contains(e.target)) {
                favorites.classList.remove("active");
            }
        });
    }


    window.addEventListener("pagehide", () => {
        localStorage.removeItem("cartOpen");
    });


    window.addEventListener("load", () => {
        const cartState = localStorage.getItem("cartOpen");
        if (cartState === "true") {
            cart?.classList.add("active");
            overlay?.classList.add("active");
        }
    });

    //  REMOVED: Duplicate product fetching - now handled by items_home.js
    // The items_home.js already handles all product loading and event listeners
    // This prevents conflicts and duplicate functionality

    // Initial cart and favorites update
    updateCart();
    updateFavorites();

    /* ===============================
       Header Auth / User Dropdown
      ================================= */
    const authButtons = document.getElementById("authButtons");
    const userDropdownContainer = document.getElementById("userDropdownContainer");
    const headerProfileImage = document.getElementById("headerProfileImage");
    const dropdownMenu = document.getElementById("dropdownMenu");
    const logoutBtn = document.getElementById("logoutBtn");

    // Get user data from localStorage
    let loggedInUser = null;
    try {
        loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    } catch (err) {
        console.error(" Error parsing loggedInUser:", err);
    }

    // If user is logged in → hide buttons and show profile
    if (loggedInUser?.email) {
        if (authButtons) {
            authButtons.classList.add("hidden");
        }
        if (userDropdownContainer) {
            userDropdownContainer.classList.remove("hidden");
        }

        if (headerProfileImage) {
            headerProfileImage.src =
                loggedInUser.image && loggedInUser.image.trim() !== ""
                    ? loggedInUser.image
                    : "./assets/img/";

            // Toggle dropdown menu when clicking profile image
            headerProfileImage.addEventListener("click", (e) => {
                e.stopPropagation();
                dropdownMenu?.classList.toggle("hidden");
            });

            // Close dropdown when clicking outside
            document.addEventListener("click", (e) => {
                if (dropdownMenu && !dropdownMenu.contains(e.target) && e.target !== headerProfileImage) {
                    dropdownMenu.classList.add("hidden");
                }
            });
        }

        // Logout functionality
        if (logoutBtn) {
            logoutBtn.addEventListener("click", (e) => {
                e.preventDefault();
                // console.log(' Logout button clicked');
                const redirectUrl = window.location.pathname.includes('pages/') ? "../index.html" : "./index.html";
                window.userDataManager.handleUserLogout(redirectUrl);
            });
        }
    } else {
        // If no user → show buttons and hide profile
        if (authButtons) {
            authButtons.classList.remove("hidden");
        }
        if (userDropdownContainer) {
            userDropdownContainer.classList.add("hidden");
        }
        if (headerProfileImage) {
            headerProfileImage.classList.add("hidden");
        }
    }
});

//  Global functions that can be called from items_home.js
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id == product.id);
    if (existingItem) {
        existingItem.quantity += 1;
        // console.log(` Updated quantity for ${product.name}: ${existingItem.quantity}`);
    } else {
        cart.push({ ...product, quantity: 1 });
        // console.log(` Added ${product.name} to cart`);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
}

function updateCart() {
    const containerCartItems = document.getElementById("cart-items");
    const checkout_items = document.getElementById("checkout_items");
    const topCart = document.querySelector(".top-cart");
    const bottomCart = document.querySelector(".bottom-cart");

    let total_Price = 0;
    let total_Count = 0;
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (containerCartItems) containerCartItems.innerHTML = "";
    if (checkout_items) checkout_items.innerHTML = "";

    if (cart.length === 0) {
        if (containerCartItems) {
            containerCartItems.innerHTML = `
                <div class="empty-cart">
                    <svg data-icon="icon-checkout" width="56" height="56" viewBox="0 0 24 24" class="fkcart-icon-checkout" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 2.71411C2 2.31972 2.31972 2 2.71411 2H3.34019C4.37842 2 4.97454 2.67566 5.31984 3.34917C5.55645 3.8107 5.72685 4.37375 5.86764 4.86133H20.5709C21.5186 4.86133 22.2035 5.7674 21.945 6.67914L19.809 14.2123C19.4606 15.4413 18.3384 16.2896 17.0609 16.2896H9.80665C8.51866 16.2896 7.39 15.4276 7.05095 14.185L6.13344 10.8225C6.12779 10.8073 6.12262 10.7917 6.11795 10.7758L4.64782 5.78023C4.59738 5.61449 4.55096 5.45386 4.50614 5.29878C4.36354 4.80529 4.23716 4.36794 4.04891 4.00075C3.82131 3.55681 3.61232 3.42822 3.34019 3.42822H2.71411C2.31972 3.42822 2 3.1085 2 2.71411ZM7.49529 10.3874L8.4288 13.8091C8.59832 14.4304 9.16266 14.8613 9.80665 14.8613H17.0609C17.6997 14.8613 18.2608 14.4372 18.435 13.8227L20.5709 6.28955H6.28975L7.49529 10.3874ZM12.0017 19.8577C12.0017 21.0408 11.0426 22 9.85941 22C8.67623 22 7.71708 21.0408 7.71708 19.8577C7.71708 18.6745 8.67623 17.7153 9.85941 17.7153C11.0426 17.7153 12.0017 18.6745 12.0017 19.8577ZM10.5735 19.8577C10.5735 19.4633 10.2538 19.1436 9.85941 19.1436C9.46502 19.1436 9.1453 19.4633 9.1453 19.8577C9.1453 20.2521 9.46502 20.5718 9.85941 20.5718C10.2538 20.5718 10.5735 20.2521 10.5735 19.8577ZM19.1429 19.8577C19.1429 21.0408 18.1837 22 17.0005 22C15.8173 22 14.8582 21.0408 14.8582 19.8577C14.8582 18.6745 15.8173 17.7153 17.0005 17.7153C18.1837 17.7153 19.1429 18.6745 19.1429 19.8577ZM17.7146 19.8577C17.7146 19.4633 17.3949 19.1436 17.0005 19.1436C16.6061 19.1436 16.2864 19.4633 16.2864 19.8577C16.2864 20.2521 16.6061 20.5718 17.0005 20.5718C17.3949 20.5718 17.7146 20.2521 17.7146 19.8577Z" fill="currentColor"></path>
                    </svg>
                    <p>Your Cart is Empty</p>
                    <p>Fill your cart with BuySpot favorites</p>
                    <a href="${window.location.pathname.includes('pages/') ? '../../pages/products_list.html' : './index.html'}" class="btn shop-now-btn">Shop Now</a>
                </div>
            `;
        }
        if (checkout_items) {
            checkout_items.innerHTML = `
                <div class="empty-cart">
                    <svg data-icon="icon-checkout" width="56" height="56" viewBox="0 0 24 24" class="fkcart-icon-checkout" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 2.71411C2 2.31972 2.31972 2 2.71411 2H3.34019C4.37842 2 4.97454 2.67566 5.31984 3.34917C5.55645 3.8107 5.72685 4.37375 5.86764 4.86133H20.5709C21.5186 4.86133 22.2035 5.7674 21.945 6.67914L19.809 14.2123C19.4606 15.4413 18.3384 16.2896 17.0609 16.2896H9.80665C8.51866 16.2896 7.39 15.4276 7.05095 14.185L6.13344 10.8225C6.12779 10.8073 6.12262 10.7917 6.11795 10.7758L4.64782 5.78023C4.59738 5.61449 4.55096 5.45386 4.50614 5.29878C4.36354 4.80529 4.23716 4.36794 4.04891 4.00075C3.82131 3.55681 3.61232 3.42822 3.34019 3.42822H2.71411C2.31972 3.42822 2 3.1085 2 2.71411ZM7.49529 10.3874L8.4288 13.8091C8.59832 14.4304 9.16266 14.8613 9.80665 14.8613H17.0609C17.6997 14.8613 18.2608 14.4372 18.435 13.8227L20.5709 6.28955H6.28975L7.49529 10.3874ZM12.0017 19.8577C12.0017 21.0408 11.0426 22 9.85941 22C8.67623 22 7.71708 21.0408 7.71708 19.8577C7.71708 18.6745 8.67623 17.7153 9.85941 17.7153C11.0426 17.7153 12.0017 18.6745 12.0017 19.8577ZM10.5735 19.8577C10.5735 19.4633 10.2538 19.1436 9.85941 19.1436C9.46502 19.1436 9.1453 19.4633 9.1453 19.8577C9.1453 20.2521 9.46502 20.5718 9.85941 20.5718C10.2538 20.5718 10.5735 20.2521 10.5735 19.8577ZM19.1429 19.8577C19.1429 21.0408 18.1837 22 17.0005 22C15.8173 22 14.8582 21.0408 14.8582 19.8577C14.8582 18.6745 15.8173 17.7153 17.0005 17.7153C18.1837 17.7153 19.1429 18.6745 19.1429 19.8577ZM17.7146 19.8577C17.7146 19.4633 17.3949 19.1436 17.0005 19.1436C16.6061 19.1436 16.2864 19.4633 16.2864 19.8577C16.2864 20.2521 16.6061 20.5718 17.0005 20.5718C17.3949 20.5718 17.7146 20.2521 17.7146 19.8577Z" fill="currentColor"></path>
                    </svg>
                    <p>Your Cart is Empty</p>
                    <p>Fill your cart with BuySpot favorites</p>
                    <a href="../index.html" class="btn shop-now-btn">Shop Now</a>
                </div>
            `;
        }

        if (bottomCart) bottomCart.style.display = "none";

        const price_cart_total = document.querySelector(".price-cart-total");
        const count_item_cart = document.querySelector(".count-items-cart");
        const count_item_header = document.querySelector(".count_item_header");

        if (price_cart_total) price_cart_total.textContent = "EGP 0";
        if (count_item_cart) count_item_cart.textContent = 0;
        if (count_item_header) count_item_header.textContent = 0;

        const price_cart_total_checkout = document.querySelector(".total-checkout");
        const subtotal = document.getElementById("subtotal");
        const totalCount = document.getElementById("total_Count");

        if (price_cart_total_checkout) price_cart_total_checkout.textContent = "EGP 0";
        if (subtotal) subtotal.textContent = "EGP 0";
        if (totalCount) totalCount.textContent = "Subtotal (0 items):";

        const progressBar = document.querySelector(".a-meter-bar");
        if (progressBar) {
            progressBar.style.width = "0%";
            progressBar.style.backgroundColor = "red";
        }
        return;
    }

    if (bottomCart) bottomCart.style.display = "block";

    cart.forEach((item, index) => {
        let total_price_items = item.price * item.quantity;
        total_Price += total_price_items;
        total_Count += item.quantity;

        const imagePath = item.img.startsWith('./assets/') ? item.img.replace('./assets/', window.location.pathname.includes('pages/') ? '../assets/' : 'assets/') :
            item.img.startsWith('http') ? item.img : (window.location.pathname.includes('pages/') ? '../' : '') + item.img;

        if (containerCartItems) {
            containerCartItems.innerHTML += `
                <div class="item-cart">
                    <img src="${imagePath}" alt="">
                    <div class="content">
                        <p class="name-product"><a href="${window.location.pathname.includes('pages/') ? '../' : ''}pages/product_details.html?id=${item.id}"><h4>${item.name}</h4></a></p>
                        <p class="price-cart">EGP ${total_price_items}</p>
                        <div class="quantity-control">
                            <button class="decrease-quantity" data-index="${index}">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="increase-quantity" data-index="${index}">+</button>
                        </div>
                    </div>
                    <button class="delete-item" data-index="${index}"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `;
        }

        if (checkout_items) {
            checkout_items.innerHTML += `
                <div class="item-cart">
                    <div class="image_name">
                        <img src="${imagePath}" alt="">
                        <div class="content">
                            <p class="name-product"><a href="../pages/product_details.html?id=${item.id}"><h4>${item.name}</h4></a></p>
                            <p class="price_cart">EGP ${total_price_items}</p>
                            <div class="quantity_control">
                                <button class="decrease-quantity" data-index="${index}">-</button>
                                <span class="quantity">${item.quantity}</span>
                                <button class="increase-quantity" data-index="${index}">+</button>
                            </div>
                        </div>
                    </div>
                    <button class="delete-item" data-index="${index}"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `;
        }
    });

    const price_cart_total = document.querySelector(".price-cart-total");
    const count_item_cart = document.querySelector(".count-items-cart");
    const count_item_header = document.querySelector(".count_item_header");

    const formattedTotal = `EGP ${Number(total_Price).toLocaleString('en-EG')}`;

    if (price_cart_total) price_cart_total.textContent = formattedTotal;
    if (count_item_cart) count_item_cart.textContent = total_Count;
    if (count_item_header) count_item_header.textContent = total_Count;

    if (checkout_items) {
        const price_cart_total_checkout = document.querySelector(".total-checkout");
        const subtotal = document.getElementById("subtotal");
        const totalCount = document.getElementById("total_Count");

        if (price_cart_total_checkout) price_cart_total_checkout.textContent = formattedTotal;
        if (subtotal) subtotal.textContent = formattedTotal;
        if (totalCount) {
            totalCount.textContent = `Subtotal (${total_Count} item${total_Count !== 1 ? 's' : ''}):`;
        }
    }

    // Add event listeners for cart controls
    const increaseButton = document.querySelectorAll(".increase-quantity");
    const decreaseButton = document.querySelectorAll(".decrease-quantity");
    const deleteButton = document.querySelectorAll(".delete-item");

    increaseButton.forEach(button => {
        button.removeEventListener("click", handleIncrease);
        button.addEventListener("click", handleIncrease);
    });
    decreaseButton.forEach(button => {
        button.removeEventListener("click", handleDecrease);
        button.addEventListener("click", handleDecrease);
    });
    deleteButton.forEach(button => {
        button.removeEventListener("click", handleDelete);
        button.addEventListener("click", handleDelete);
    });

    function handleIncrease(e) {
        e.stopPropagation();
        const itemIndex = e.target.getAttribute("data-index");
        increaseQuantity(itemIndex);
    }
    function handleDecrease(e) {
        e.stopPropagation();
        const itemIndex = e.target.getAttribute("data-index");
        decreaseQuantity(itemIndex);
    }
    function handleDelete(e) {
        e.stopPropagation();
        const itemIndex = e.target.closest("button").getAttribute("data-index");
        deleteFromCart(itemIndex);
    }

    // Progress bar for free shipping
    const freeShippingLimit = 1400;
    const progressBar = document.querySelector(".a-meter-bar");
    if (progressBar) {
        let progress = (total_Price / freeShippingLimit) * 100;
        if (progress > 100) progress = 100;
        progressBar.style.width = `${progress}%`;
        progressBar.style.backgroundColor = total_Price >= freeShippingLimit ? "#0b7b3c" : "red";
    }

    // console.log(` Cart updated: ${total_Count} items, Total: EGP ${total_Price}`);
}

function updateFavorites() {
    const favoritesItems = document.getElementById('favorites-items');
    const favoriteCountElements = document.querySelectorAll('.count_favourite');
    if (!favoritesItems) return;

    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    favoriteCountElements.forEach(count => {
        count.textContent = favorites.length;
    });

    if (favorites.length === 0) {
        favoritesItems.innerHTML = `
            <div class="empty-favorites">
                <svg data-icon="icon-favorite" width="56" height="56" viewBox="0 0 24 24" class="fkcart-icon-favorite" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"></path>
                </svg>
                <p>Your Favorites List is Empty</p>
                <p>Add your favorite products from BuySpot</p>
                <a href="${window.location.pathname.includes('pages/') ? '../pages/products_list.html' : './index.html'}" class="btn shop-now-btn">Shop Now</a>
            </div>
        `;
        return;
    }

    favoritesItems.innerHTML = "";
    favorites.forEach((item, index) => {
        const imagePath = item.img.startsWith('./assets/')
            ? item.img.replace('./assets/', window.location.pathname.includes('pages/') ? '../assets/' : 'assets/')
            : item.img.startsWith('http') ? item.img : (window.location.pathname.includes('pages/') ? '../' : '') + item.img;

        favoritesItems.innerHTML += `
            <div class="item-favorite">
                <img src="${imagePath}" alt="">
                <div class="content">
                    <p class="name-product"><a href="${window.location.pathname.includes('pages/') ? '../' : ''}pages/product_details.html?id=${item.id}"><h4>${item.name}</h4></a></p>
                    <p class="price">EGP ${item.price}</p>
                    <span class="icon-product active" data-id="${item.id}"><i class="fa-solid fa-heart active"></i></span>
                </div>
                <button class="delete-favorite" data-index="${index}"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;
    });

    document.querySelectorAll('.delete-favorite').forEach(button => {
        button.removeEventListener('click', handleDeleteFavorite);
        button.addEventListener('click', handleDeleteFavorite);
    });

    document.querySelectorAll('.item-favorite .icon-product').forEach(button => {
        button.removeEventListener('click', handleFavoriteClick);
        button.addEventListener('click', handleFavoriteClick);
    });
    function handleFavoriteClick(e) {
        e.stopPropagation();
        const productId = e.target.closest('.icon-product').getAttribute('data-id');
        deleteFromFavorites(favorites.findIndex(item => item.id == productId));
    }

    // console.log(` Favorites updated: ${favorites.length} items`);
}

function deleteFromFavorites(index) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (index < 0 || index >= favorites.length) return;

    const removedProduct = favorites.splice(index, 1)[0];
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavorites();

    // Update all favorite buttons for this product
    const buttons = document.querySelectorAll(`.icon-product[data-id="${removedProduct.id}"]`);
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

    const favoriteCountElements = document.querySelectorAll('.count_favourite');
    favoriteCountElements.forEach(count => {
        count.textContent = favorites.length;
    });

    // console.log(` Removed ${removedProduct.name} from favorites`);
}





// ========================================
// Cart & Favorites Management Functions
// ========================================

/**
 * Removes item from cart by index
 * @param {number} index - Index of item in cart array
 */
function deleteFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Validate index
    if (index < 0 || index >= cart.length) {
        console.warn(' Invalid cart index:', index);
        return;
    }

    const removedProduct = cart.splice(index, 1)[0];
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update UI
    updateCart();
    updateButtonState(removedProduct.id);

    // console.log(` Removed ${removedProduct.name} from cart`);
}

/**
 * Updates the state of Add to Cart buttons for a specific product
 * @param {string|number} productId - Product ID
 */
function updateButtonState(productId) {
    const allMatchingButtons = document.querySelectorAll(`.btn-add-cart[data-id="${productId}"]`);

    allMatchingButtons.forEach(btn => {
        btn.classList.remove("active");
        btn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Add to Cart`;
        btn.removeAttribute('disabled');
    });

    // console.log(` Updated button state for product ID: ${productId}`);
}

/**
 * Updates cart button state based on whether item is in cart
 * @param {string|number} productId - Product ID
 * @param {HTMLElement} btn - Button element to update
 */
function updateCartButtonState(productId, btn) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const isInCart = cart.some(item => item.id == productId);

    if (isInCart) {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fa-solid fa-cart-shopping"></i> Item in Cart';
        btn.setAttribute('disabled', 'true');
    } else {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fa-solid fa-cart-shopping"></i> Add to Cart';
        btn.removeAttribute('disabled');
    }
}

/**
 * Increases quantity of item in cart
 * @param {number} index - Index of item in cart array
 */
function increaseQuantity(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Validate index
    if (index < 0 || index >= cart.length) {
        console.warn(' Invalid cart index:', index);
        return;
    }

    cart[index].quantity += 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();

    // console.log(` Increased quantity for ${cart[index].name}: ${cart[index].quantity}`);
}

/**
 * Decreases quantity of item in cart (removes if quantity becomes 0)
 * @param {number} index - Index of item in cart array
 */
function decreaseQuantity(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Validate index
    if (index < 0 || index >= cart.length) {
        console.warn(' Invalid cart index:', index);
        return;
    }

    // If quantity is 1, remove item completely
    if (cart[index].quantity === 1) {
        deleteFromCart(index);
        return;
    }

    cart[index].quantity -= 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();

    // console.log(` Decreased quantity for ${cart[index].name}: ${cart[index].quantity}`);
}

/**
 * Toggles product in/out of favorites
 * @param {Object} product - Product object with id, name, price, img, etc.
 */
function toggleFavorite(product) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const existingItem = favorites.find(item => item.id == product.id);
    const wasInFavorites = !!existingItem;

    if (existingItem) {
        // Remove from favorites
        favorites = favorites.filter(item => item.id != product.id);
        // console.log(` Removed ${product.name} from favorites`);
    } else {
        // Add to favorites
        favorites.push({ ...product });
        // console.log(` Added ${product.name} to favorites`);
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));

    // Update all favorite buttons for this product
    updateFavoriteButtons(product.id, !wasInFavorites);

    // Update favorite count in header/UI
    updateFavoriteCount(favorites.length);

    // Refresh favorites UI if open
    updateFavorites();
}

/**
 * Updates all favorite buttons for a specific product
 * @param {string|number} productId - Product ID
 * @param {boolean} isInFavorites - Whether product is now in favorites
 */
function updateFavoriteButtons(productId, isInFavorites) {
    const buttons = document.querySelectorAll(`.icon-product[data-id="${productId}"]`);

    buttons.forEach(btn => {
        const icon = btn.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-regular', 'fa-solid', 'active');
            icon.classList.add(isInFavorites ? 'fa-solid' : 'fa-regular');
            if (isInFavorites) icon.classList.add('active');
        }

        btn.classList.toggle('active', isInFavorites);

        // Handle favorite button text updates
        if (btn.classList.contains('btn-favorite')) {
            btn.innerHTML = isInFavorites
                ? '<i class="fa-solid fa-heart active"></i> Item in Favorites'
                : '<i class="fa-regular fa-heart"></i> Add to Favorites';
            btn.toggleAttribute('disabled', isInFavorites);
        }
    });
}

/**
 * Updates favorite count in UI elements
 * @param {number} count - Number of items in favorites
 */
function updateFavoriteCount(count) {
    const favoriteCountElements = document.querySelectorAll('.count_favourite');
    favoriteCountElements.forEach(element => {
        element.textContent = count;
    });
}

/**
 * Handle delete from favorites (called from favorites UI)
 * @param {Event} e - Click event
 */
function handleDeleteFavorite(e) {
    e.stopPropagation();
    const button = e.target.closest('.delete-favorite');
    const index = parseInt(button.getAttribute('data-index'));
    deleteFromFavorites(index);
}


// ========================================
// Export functions for global access
// ========================================
window.deleteFromCart = deleteFromCart;
window.updateButtonState = updateButtonState;
window.updateCartButtonState = updateCartButtonState;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.toggleFavorite = toggleFavorite;
window.updateFavoriteButtons = updateFavoriteButtons;
window.updateFavoriteCount = updateFavoriteCount;

// Load external scripts
function loadScript(src) {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.body.appendChild(script);
}



//& ===========================================================================================
/* ===============================
    الايقونة الي في الهيدر اللي بتظهر مكان الاتنين زراير التسجيل والانشاءUser Avatar / Header Profile 
================================= */


/* ===============================
   Setup Clear Icon for Input
================================= */
function setupClearIcon(inputId, clearIconId, defaultIconId) {
    const input = document.getElementById(inputId);
    const clearIcon = document.getElementById(clearIconId);
    const defaultIcon = document.getElementById(defaultIconId);

    if (!input || !clearIcon || !defaultIcon) return;

    input.addEventListener("input", () => {
        //  مسح رسائل النجاح / الخطأ عند الكتابة
        const emailError = document.getElementById("emailError");
        const emailSuccess = document.getElementById("emailSuccess");
        if (emailError) emailError.classList.add("hidden");
        if (emailSuccess) emailSuccess.classList.add("hidden");

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

// Example for Forgot Password email input
setupClearIcon("email", "clearEmailIcon", "envelopeIcon");

/* ===============================
   Handle Forgot Password Form Submission
================================= */
const forgotForm = document.getElementById("forgotPasswordForm");
if (forgotForm) {
    forgotForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const emailInput = document.getElementById("email");
        const emailError = document.getElementById("emailError");
        const emailSuccess = document.getElementById("emailSuccess");

        emailError.classList.add("hidden");
        emailSuccess.classList.add("hidden");

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

        const users = JSON.parse(localStorage.getItem("users")) || [];
        const userExists = users.some(u => u.email === email);

        if (!userExists) {
            emailError.textContent = "Email not found";
            emailError.classList.remove("hidden");
            return;
        }

        //  Simulate sending reset link
        emailSuccess.classList.remove("hidden");
        // console.log(`Password reset link sent to: ${email}`);

        setTimeout(() => {
            emailInput.value = "";
            document.getElementById("clearEmailIcon").classList.add("hidden");
            document.getElementById("envelopeIcon").classList.remove("hidden");
            emailSuccess.classList.add("hidden");
        }, 3000);
    });
}

/* ===============================
   Load Login / Signup JS
================================= */
function loadScript(src) {
    if (document.querySelector(`script[src="${src}"]`)) return; //  مايحملش مرتين
    const script = document.createElement("script");
    script.src = src;
    document.body.appendChild(script);
}






// Back to Top Button
document.addEventListener("DOMContentLoaded", function () {
    const backToTopButton = document.getElementById("back-to-top");
    if (backToTopButton) {
        backToTopButton.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});




//!======================================================================================

//  *######### just for preload when you preload this website .. it will appear load-circle 

document.addEventListener('DOMContentLoaded', () => {
    const loadingEl = document.querySelector('.loading');
    if (!loadingEl) return; // لو مفيش العنصر، نخرج مباشرة

    setTimeout(() => {
        loadingEl.classList.add('loading-end');
        setTimeout(() => loadingEl.style.display = 'none', 300);
    }, 2000);
});


//!======================================================================================


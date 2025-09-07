"use strict";

let productsData = []; // Global cache for products

// Wait for main.js functions
function waitForMainFunctions(callback, maxAttempts = 50) {
    let attempts = 0;
    const checkFunctions = () => {
        attempts++;
        if (typeof window.addToCart === 'function' &&
            typeof window.updateCart === 'function' &&
            typeof window.toggleFavorite === 'function') {
            callback();
        } else if (attempts < maxAttempts) {
            setTimeout(checkFunctions, 50);
        } else {
            console.error('Failed to load main.js functions after maximum attempts');
        }
    };
    checkFunctions();
}

// Generate stars based on rating
const generateStars = (rating) => {
    let starsHTML = '';
    const maxStars = 5;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    for (let i = 0; i < maxStars; i++) {
        if (i < fullStars) {
            starsHTML += '<i class="fa-solid fa-star"></i>';
        } else if (i === fullStars && hasHalfStar) {
            starsHTML += '<i class="fa-solid fa-star-half-alt"></i>';
        } else {
            starsHTML += '<i class="fa-regular fa-star"></i>';
        }
    }
    return starsHTML;
};

// Normalize category names
const normalizeCategory = (category) => {
    if (!category) return ['unknown'];
    if (Array.isArray(category)) {
        return category.map(cat => cat.toLowerCase()
            .replace('smart-phones', 'smartphones')
            .replace('skin-care', 'skincare')
            .replace('men clothing', 'men-clothing')
            .replace('kitchen-accessories', 'kitchen')
            .replace(/\s+/g, '-'));
    }
    return [category.toLowerCase()
        .replace('smart-phones', 'smartphones')
        .replace('skin-care', 'skincare')
        .replace('men clothing', 'men-clothing')
        .replace('kitchen-accessories', 'kitchen')
        .replace(/\s+/g, '-')];
};

// Check if product matches category
const productMatchesCategory = (product, targetCategory) => {
    const productCategories = Array.isArray(product.category)
        ? product.category
        : [product.category];
    const normalizedTarget = normalizeCategory(targetCategory)[0];
    return productCategories.some(cat => normalizeCategory(cat)[0] === normalizedTarget);
};

// Debounce function
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
};

// Fuzzy match for autocomplete with Arabic support
const fuzzyMatch = (query, text) => {
    const normalizeArabic = (str) => {
        if (typeof str !== 'string' || str == null) {
            return '';
        }
        return str
            .replace(/[أإآ]/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/[يى]/g, 'ي')
            .normalize('NFKD')
            .replace(/[\u064B-\u065F]/g, '')
            .toLowerCase()
            .trim();
    };
    query = normalizeArabic(query);
    text = normalizeArabic(text);
    const regex = new RegExp(query.split('').join('.*'), 'i');
    return regex.test(text);
};

// Levenshtein distance for spelling suggestions
const levenshteinDistance = (a, b) => {
    const matrix = Array(b.length + 1).fill().map(() => Array(a.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
    for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
            const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + indicator
            );
        }
    }
    return matrix[b.length][a.length];
};

// Generate spelling suggestions
const getSpellingSuggestions = (query, terms) => {
    return terms
        .map(term => ({
            term,
            distance: levenshteinDistance(query.toLowerCase(), term.toLowerCase())
        }))
        .filter(item => item.distance <= 3 && item.distance > 0)
        .sort((a, b) => a.distance - b.distance)
        .map(item => item.term)
        .slice(0, 3);
};


// Common search terms
const commonSearchTerms = [
    // Electronics
    'iPhone', 'آيفون', 'iPad', 'آيباد', 'Samsung', 'سامسونج', 'Huawei', 'هواوي',
    'Oppo', 'أوبو', 'Laptop', 'لابتوب', 'Gaming Laptop', 'لابتوب ألعاب',
    'Headphones', 'سماعات', 'Earbuds', 'إيربودز', 'Smartwatch', 'ساعة ذكية',
    'Charger', 'شاحن', 'Powerbank', 'باور بنك', 'Tablet', 'تابلت',
    'TV', 'تلفزيون', 'Camera', 'كاميرا',

    // Home & Kitchen
    'Blender', 'خلاط', 'Microwave', 'ميكروويف', 'Fridge', 'ثلاجة',
    'Citrus Squeezer', 'عصارة', 'Cookware', 'أواني طهي', 'Non-stick Pan', 'طاسة تفال',
    'Knife Set', 'طقم سكاكين', 'Water Bottle', 'زجاجة مياه', 'Vacuum Cleaner', 'مكنسة كهربائية',
    'Air Fryer', 'قلاية هوائية', 'Coffee Maker', 'ماكينة قهوة', 'Kitchen Tools', 'أدوات مطبخ',

    // Fashion
    'T-shirt', 'تيشيرت', 'Jeans', 'بنطلون جينز', 'Shoes', 'أحذية',
    'Sneakers', 'سنيكرز', 'Watch', 'ساعة', 'Backpack', 'حقيبة ظهر', 'Jacket', 'جاكيت',

    // Fragrances & Skincare
    'Perfume', 'عطر', 'Cologne', 'كولونيا', 'Deodorant', 'مزيل عرق',
    'Skincare', 'عناية بالبشرة', 'Moisturizer', 'مرطب', 'Face Wash', 'غسول وجه', 'Sunscreen', 'واقي شمس',

    // Books & Toys
    'Novel', 'رواية', 'Story Book', 'قصص', 'Children Toys', 'ألعاب أطفال',
    'Action Figure', 'مجسمات', 'Board Game', 'ألعاب طاولة',

    // Groceries
    'Rice', 'أرز', 'Pasta', 'مكرونة', 'Oil', 'زيت', 'Milk', 'لبن',
    'Snacks', 'سناكس', 'Coffee', 'قهوة', 'Tea', 'شاي'
];


// Load products from products.json with smart caching
async function loadProducts(category = null) {
    try {
        const cacheKey = category ? `products_cache_${category}` : "products_cache";
        const cacheTimestampKey = `${cacheKey}_timestamp`;
        const cacheDuration = 24 * 60 * 60 * 1000; // 24 hours

        // Check if we already have products in global cache
        if (productsData.length && (!category || productsData.some(p => productMatchesCategory(p, category)))) {
            // console.log(` Using cached products: ${productsData.length} products for category: ${category || 'all'}`);
            return category ? productsData.filter(p => productMatchesCategory(p, category)) : productsData;
        }

        // Check localStorage cache
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(cacheTimestampKey);
        const now = Date.now();

        if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp) < cacheDuration)) {
            productsData = JSON.parse(cachedData);
            // console.log(` Loaded ${productsData.length} products from localStorage for category: ${category || 'all'}`);
            return category ? productsData.filter(p => productMatchesCategory(p, category)) : productsData;
        }

        // Fetch from products.json
        const url = window.location.pathname.includes('pages/') ? '../products.json' : 'products.json';
        const res = await fetch(url, { cache: "default" });
        if (!res.ok) throw new Error(`Failed to fetch products.json: ${res.status}`);

        const data = await res.json();
        productsData = (data.products || data).filter(product => product.id && product.name && product.category)
            .map(product => ({
                id: product.id,
                name: product.name || 'Unknown Product',
                price: product.price || 0,
                old_price: product.old_price || null,
                img: product.img ? (
                    product.img.toLowerCase().includes('assets/')
                        ? product.img.replace(/assets\//i, window.location.pathname.includes('pages/') ? '../assets/' : 'assets/')
                        : product.img
                ) : 'assets/img/placeholder.png',
                category: Array.isArray(product.category) ? product.category.map(normalizeCategory) : [normalizeCategory(product.category)],
                rating: product.rating || 5,
                stock: product.stock || 0,
                description: product.description || ''
            }));

        // Filter by category if specified
        if (category) {
            productsData = productsData.filter(p => productMatchesCategory(p, category));
        }

        // Save to localStorage
        localStorage.setItem(cacheKey, JSON.stringify(productsData));
        localStorage.setItem(cacheTimestampKey, now);
        // console.log(` Cache updated with ${productsData.length} products for category: ${category || 'all'}`);
        // console.log(` Cache size: ${new Blob([JSON.stringify(productsData)]).size / 1024} KB`);

        return productsData;
    } catch (err) {
        // console.error(' Error loading products:', err);
        return [];
    }
}

// Populate Swiper slide for a category
const populateCategorySlide = (category, container, products) => {
    if (!container || !(container instanceof HTMLElement)) {
        // console.error(` Invalid or missing container for category: ${category}, container ID: ${container?.id || 'undefined'}`);
        return;
    }
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    container.innerHTML = '';

    const matchingProducts = category === 'hot_deals'
        ? products.filter(product => product.old_price)
        : products.filter(product => productMatchesCategory(product, category));

    const productCount = matchingProducts.length;

    if (productCount === 0) {
        container.innerHTML = `
            <div class="empty-category-message" style="text-align: center; padding: 40px; color: #666;">
                <i class="fa-solid fa-box-open" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                <h3>لا توجد منتجات في هذا القسم</h3>
                <p>نعمل على إضافة منتجات جديدة قريباً</p>
            </div>
        `;
        // console.error(` No products found for category: ${category}`);
        return;
    }

    matchingProducts.forEach(product => {
        const isInCart = cart.some(cartItem => cartItem.id == product.id);
        const isInFavorites = favorites.some(favItem => favItem.id == product.id);
        const percentDiscSpan = product.old_price
            ? `<span class="sale-present">%${Math.floor((product.old_price - product.price) / product.old_price * 100)}</span>`
            : '';
        const percentDiscParagraph = product.old_price ? `<p class="old-price">EGP ${product.old_price}</p>` : '';
        const imagePath = product.img || 'assets/img/placeholder.png';

        container.innerHTML += `
            <div class="swiper-slide product">
                ${percentDiscSpan}
                <div class="img-product">
                    <a href="${window.location.pathname.includes('pages/') ? '../' : ''}pages/product_details.html?id=${product.id}">
                        ${imagePath ? `<img src="${imagePath}" alt="${product.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="no-image" style="display: none;">No Image Available</div>` : `<div class="no-image">No Image Available</div>`}
                    </a>
                </div>
                <div class="stars">${generateStars(product.rating)}</div>
                <p class="name-product">
                    <a href="${window.location.pathname.includes('pages/') ? '../' : ''}pages/product_details.html?id=${product.id}">${product.name}</a>
                </p>
                <div class="price">
                    <p><span>EGP ${product.price}</span></p>
                    ${percentDiscParagraph}
                </div>
                <div class="icons">
                    <span class="btn-add-cart ${isInCart ? 'active' : ''}" data-id="${product.id}">
                        <i class="fa-solid fa-cart-shopping"></i> ${isInCart ? 'Item in cart' : 'Add to cart'}
                    </span>
                    <span class="icon-product ${isInFavorites ? 'active' : ''}" data-id="${product.id}">
                        <i class="fa-${isInFavorites ? 'solid' : 'regular'} fa-heart ${isInFavorites ? 'active' : ''}"></i>
                    </span>
                </div>
            </div>
        `;
    });

    // Products Slider
    (function () {
        const productSlides = document.querySelectorAll(".slide-product .swiper-slide").length;
        const minSlidesForLoop = 5;

        var swiperProducts = new Swiper(".slide-product", {
            slidesPerView: productSlides < 5 ? productSlides : 5,
            spaceBetween: 20,
            autoplay: productSlides > minSlidesForLoop ? {
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: false
            } : false,
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev"
            },
            loop: productSlides > minSlidesForLoop,
            loopedSlides: productSlides > minSlidesForLoop ? 5 : productSlides,
            speed: 900,
            watchSlidesProgress: true,
            breakpoints: {
                1200: { slidesPerView: Math.min(productSlides, 5), spaceBetween: 20 },
                992: { slidesPerView: Math.min(productSlides, 4), spaceBetween: 20 },
                768: { slidesPerView: Math.min(productSlides, 3), spaceBetween: 15 },
                508: { slidesPerView: Math.min(productSlides, 2), spaceBetween: 10 },
                0: { slidesPerView: 1, spaceBetween: 5 }
            }
        });
    })();
};














document.addEventListener('DOMContentLoaded', () => {
    // CSS styles for suggestions and overlay
    const style = document.createElement('style');
    style.innerHTML = `
        .suggestions {
            display: none;
            position: absolute;
            top: 88%;
            left: 0;
            width: 100%;
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            margin-top: 8px;
            box-shadow: 0 6px 12px rgba(0,0,0,0.15);
            max-height: 300px;
            overflow-y: auto;
            z-index: 1000;
            opacity: 0;
            transform: translateY(-10px);
            transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .suggestions.show {
            display: block;
            opacity: 1;
            transform: translateY(0);
        }
        .suggestions div {
            padding: 12px 15px;
            cursor: pointer;
            font-size: 15px;
            color: #333;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid #f0f0f0;
        }
        .suggestions div:hover {
            background: #f5f7fa;
        }
        .suggestions div img {
            width: 35px;
            height: 35px;
            object-fit: cover;
            border-radius: 6px;
        }
        .suggestions div a {
            color: #333;
            text-decoration: none;
            flex-grow: 1;
        }
        .suggestions .suggested-term { color: #007bff; font-style: italic; }
        .suggestions .suggested-term::before { content: 'Suggested: '; color: #555; font-style: normal; font-size: 13px; }
        .suggestions.show { display: block; opacity: 1; transform: translateY(0); }
        .search-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            z-index: 900;
            transition: opacity 0.3s ease;
        }
        .search-overlay.show {
            display: block;
            opacity: 1;
        }
        @media (max-width: 768px) {
            .search-box {
                max-width: 100%;
            }
            .suggestions {
                width: 100%;
                margin-top: 4px;
            }
            .suggestions div {
                font-size: 14px;
                padding: 10px 12px;
            }
        }
    `;
    document.head.appendChild(style);

    // Category map for normalization
    const categoryMap = {
        "Today's Deals": "hot_deals",
        "Electronics": "electronics",
        "Appliances": "appliances",
        "Mobiles": "mobiles",
        "Smartphones": "smartphones",
        "Laptops": "laptops",
        "Fragrances": "fragrances",
        "Skincare": "skincare",
        "Groceries": "groceries",
        "Home Decoration": "home-decoration",
        "Books": "books",
        "Kitchen": "kitchen",
        "Men's Clothing": "men-clothing",
        "Home": "home",
        "Toys": "toys",
        "اليوم": "hot_deals",
        "إلكترونيات": "electronics",
        "أجهزة منزلية": "appliances",
        "موبايلات": "mobiles",
        "هواتف ذكية": "smartphones",
        "لاب توب": "laptops",
        "عطور": "fragrances",
        "عناية بالبشرة": "skincare",
        "بقالة": "groceries",
        "ديكور منزلي": "home-decoration",
        "كتب": "books",
        "مطبخ": "kitchen",
        "ملابس رجالي": "men-clothing",
        "منزل": "home",
        "ألعاب": "toys"
    };


















    // Common search terms (including Arabic)
    const commonSearchTerms = [
        // Electronics
        'iPhone', 'آيفون', 'iPad', 'آيباد', 'Samsung', 'سامسونج', 'Huawei', 'هواوي',
        'Oppo', 'أوبو', 'Xiaomi', 'شاومي', 'Realme', 'ريلمي',
        'Laptop', 'لابتوب', 'Gaming Laptop', 'لابتوب ألعاب', 'MacBook', 'ماك بوك',
        'Headphones', 'سماعات', 'Earbuds', 'إيربودز', 'Bluetooth Headset', 'سماعات بلوتوث',
        'Smartwatch', 'ساعة ذكية', 'Charger', 'شاحن', 'Powerbank', 'باور بنك',
        'Tablet', 'تابلت', 'TV', 'تلفزيون', 'Smart TV', 'شاشة ذكية',
        'Camera', 'كاميرا', 'DSLR', 'كاميرا احترافية',

        // Home & Kitchen
        'Blender', 'خلاط', 'Microwave', 'ميكروويف', 'Fridge', 'ثلاجة',
        'Citrus Squeezer', 'عصارة', 'Cookware', 'أواني طهي', 'Non-stick Pan', 'طاسة تفال',
        'Knife Set', 'طقم سكاكين', 'Water Bottle', 'زجاجة مياه', 'Vacuum Cleaner', 'مكنسة كهربائية',
        'Air Fryer', 'قلاية هوائية', 'Coffee Maker', 'ماكينة قهوة', 'Kitchen Tools', 'أدوات مطبخ',
        'Toaster', 'محمص خبز', 'Kettle', 'غلاية مياه',

        // Fashion
        'T-shirt', 'تيشيرت', 'Jeans', 'بنطلون جينز', 'Shoes', 'أحذية',
        'Sneakers', 'سنيكرز', 'Watch', 'ساعة', 'Backpack', 'حقيبة ظهر',
        'Jacket', 'جاكيت', 'Shirt', 'قميص', 'Dress', 'فستان', 'Bag', 'شنطة',

        // Fragrances & Skincare
        'Perfume', 'عطر', 'Cologne', 'كولونيا', 'Deodorant', 'مزيل عرق',
        'Skincare', 'عناية بالبشرة', 'Moisturizer', 'مرطب', 'Face Wash', 'غسول وجه',
        'Sunscreen', 'واقي شمس', 'Body Lotion', 'لوشن للجسم', 'Face Cream', 'كريم وجه',

        // Books & Toys
        'Novel', 'رواية', 'Story Book', 'قصص', 'Children Toys', 'ألعاب أطفال',
        'Action Figure', 'مجسمات', 'Board Game', 'ألعاب طاولة',
        'Puzzle', 'بازل', 'Coloring Book', 'كتب تلوين',

        // Groceries
        'Rice', 'أرز', 'Pasta', 'مكرونة', 'Oil', 'زيت', 'Milk', 'لبن',
        'Snacks', 'سناكس', 'Coffee', 'قهوة', 'Tea', 'شاي',
        'Sugar', 'سكر', 'Flour', 'دقيق', 'Juice', 'عصير', 'Water', 'مياه'
    ];


    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Fuzzy match for autocomplete with Arabic support
    const fuzzyMatch = (query, text) => {
        const normalizeArabic = (str) => {
            if (typeof str !== 'string' || str == null) {
                return '';
            }
            return str
                .replace(/[أإآ]/g, 'ا')
                .replace(/ة/g, 'ه')
                .replace(/[يى]/g, 'ي')
                .normalize('NFKD')
                .replace(/[\u064B-\u065F]/g, '')
                .toLowerCase()
                .trim();
        };
        query = normalizeArabic(query);
        text = normalizeArabic(text);
        const regex = new RegExp(query.split('').join('.*'), 'i');
        return regex.test(text);
    };

    // Load products from products.json with smart caching
    async function loadProducts(category = null) {
        try {
            const cacheKey = category ? `products_cache_${category}` : "products_cache";
            const cacheTimestampKey = `${cacheKey}_timestamp`;
            const cacheDuration = 24 * 60 * 60 * 1000; // 24 hours

            if (productsData.length && (!category || productsData.some(p => productMatchesCategory(p, category)))) {
                return category ? productsData.filter(p => productMatchesCategory(p, category)) : productsData;
            }

            const cachedData = localStorage.getItem(cacheKey);
            const cacheTimestamp = localStorage.getItem(cacheTimestampKey);
            const now = Date.now();

            if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp) < cacheDuration)) {
                productsData = JSON.parse(cachedData);
                return category ? productsData.filter(p => productMatchesCategory(p, category)) : productsData;
            }

            const url = window.location.pathname.includes('pages/') ? '../products.json' : 'products.json';
            const res = await fetch(url, { cache: "default" });
            if (!res.ok) throw new Error(`Failed to fetch products.json: ${res.status}`);

            const data = await res.json();
            const basePath = window.location.pathname.includes('pages/') ? '../assets/' : 'assets/';
            productsData = (data.products || data)
                .filter(product => product.id && product.name)
                .map(product => ({
                    id: product.id,
                    name: product.name && typeof product.name === 'string' ? product.name : 'Unknown Product',
                    price: product.price || 0,
                    old_price: product.old_price || null,
                    img: product.img ? (
                        // التعامل مع مسارات مختلفة بما فيها ./assets /
                        product.img.match(/^(?:\.\/)?(?:assets\/|assets\/|img\/|product\/)/i)
                            ? `${basePath}img/product/${product.img.split('/').pop()}`
                            : product.img.startsWith('http') ? product.img : `${basePath}img/product/${product.img}`
                    ) : `${basePath}img/placeholder.png`,
                    category: normalizeCategory(product.category || 'unknown'),
                    rating: product.rating || 5,
                    stock: product.stock || 0,
                    description: product.description && typeof product.description === 'string' ? product.description : '',
                    tags: Array.isArray(product.tags) ? product.tags : []
                }));

            if (category) {
                productsData = productsData.filter(p => productMatchesCategory(p, category));
            }

            localStorage.setItem(cacheKey, JSON.stringify(productsData));
            localStorage.setItem(cacheTimestampKey, now);
            return productsData;
        } catch (err) {
            console.error('Error loading products:', err);
            return [];
        }
    }

    // Search autocomplete setup
    const searchBox = document.querySelector("header .top-header .container .search-box");
    const searchInput = searchBox?.querySelector(".search") || document.getElementById('search');
    const searchForm = document.getElementById('searchForm');
    const categorySelect = document.getElementById('category');

    if (!searchBox || !searchInput) {
        // console.error(' Search box or input not found. Please ensure .search-box and #search elements exist in the HTML.');
        return;
    }

    // Create overlay
    const overlay = document.createElement('div');
    overlay.classList.add('search-overlay');
    document.body.appendChild(overlay);

    // Create suggestions container
    const suggestionsContainer = document.createElement("div");
    suggestionsContainer.classList.add("suggestions");
    searchBox.appendChild(suggestionsContainer);

    // Load products for suggestions
    let data = [];
    loadProducts().then(products => {
        data = products;
        // console.log(` Products loaded for autocomplete: ${data.length}`);
    });

    // Categories for suggestions
    const categories = Object.keys(categoryMap).map(key => ({
        category: categoryMap[key]
    }));

    // Search input event listeners
    searchInput.addEventListener("focus", () => {
        if (searchInput.value.trim().length > 0 || suggestionsContainer.children.length > 0) {
            suggestionsContainer.style.display = "block";
            suggestionsContainer.classList.add("show");
            overlay.classList.add("show");
            // console.log(' Search input focused, showing suggestions if available');
        }
    });

    searchInput.addEventListener("input", debounce(async (e) => {
        const query = e.target.value.trim();
        suggestionsContainer.innerHTML = "";
        suggestionsContainer.classList.remove('show');

        if (!query) {
            suggestionsContainer.style.display = "none";
            overlay.classList.remove('show');
            localStorage.setItem('searchOpen', 'false');
            return;
        }

        if (!productsData.length) {
            productsData = await loadProducts();
            if (!productsData.length) {
                suggestionsContainer.innerHTML = '<div style="padding: 12px; color: #666;">جاري تحميل المنتجات...</div>';
                suggestionsContainer.style.display = "block";
                suggestionsContainer.classList.add("show");
                overlay.classList.add("show");
                localStorage.setItem('searchOpen', 'true');
                return;
            }
        }

        const selectedCategory = categorySelect ? categorySelect.value : 'All Categories';
        const matchingProducts = productsData
            .map(p => {
                const nameMatch = fuzzyMatch(query, p.name || '');
                const descMatch = p.description ? fuzzyMatch(query, p.description) : false;
                const catMatch = p.category.some(cat => fuzzyMatch(query, cat || ''));
                const tagMatch = p.tags && Array.isArray(p.tags) ? p.tags.some(tag => fuzzyMatch(query, tag || '')) : false;
                const score = (nameMatch ? 100 : 0) + (descMatch ? 50 : 0) + (tagMatch ? 30 : 0) + (catMatch ? 20 : 0);
                return { product: p, score, nameMatch };
            })
            .filter(p => p.score > 0 && (selectedCategory === 'All Categories' || p.product.category.includes(normalizeCategory(selectedCategory)[0])))
            .sort((a, b) => {
                if (a.score !== b.score) return b.score - a.score;
                if (a.nameMatch && !b.nameMatch) return -1;
                if (!a.nameMatch && b.nameMatch) return 1;
                return a.product.name.localeCompare(b.product.name);
            })
            .map(p => p.product);

        const matchingCategories = Object.keys(categoryMap)
            .filter(cat => fuzzyMatch(query, cat || '') || fuzzyMatch(query, normalizeCategory(cat || '')))
            .map(cat => ({
                name: cat,
                slug: categoryMap[cat] || normalizeCategory(cat)[0],
                score: fuzzyMatch(query, cat) ? 80 : 60
            }));

        const matchingTerms = commonSearchTerms
            .filter(term => fuzzyMatch(query, term || ''))
            .map(term => ({ name: term, score: 40 }));

        const spellingSuggestions = (matchingProducts.length === 0 && matchingCategories.length === 0)
            ? getSpellingSuggestions(query, [...productsData.map(p => p.name || ''), ...Object.keys(categoryMap), ...commonSearchTerms])
                .map(term => ({ name: term, score: 20 }))
            : [];

        const allSuggestions = [
            ...matchingProducts.map(p => ({ type: "product", name: p.name, id: p.id, img: p.img, score: 100 })),
            ...matchingCategories.map(cat => ({
                type: "category",
                name: cat.name.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
                slug: cat.slug,
                score: cat.score
            })),
            ...matchingTerms.map(term => ({ type: "term", name: term.name, score: term.score })),
            ...spellingSuggestions.map(term => ({ type: "suggested", name: term.name, score: term.score }))
        ].sort((a, b) => b.score - a.score)
            .slice(0, 20);

        allSuggestions.forEach(s => {
            const div = document.createElement("div");
            if (s.type === "product") {
                const imagePath = s.img && (s.img.toLowerCase().includes('assets/') || s.img.toLowerCase().includes('assets/'))
                    ? s.img.replace(/assets\//i, window.location.pathname.includes('pages/') ? '../assets/' : 'assets/')
                    : s.img && s.img.startsWith('http') ? s.img : '';
                div.innerHTML = `
                    ${imagePath ? `<img src="${imagePath}" alt="${s.name}" style="width: 35px; height: 35px; object-fit: cover; border-radius: 6px;" onerror="this.style.display='none'">` : ''}
                    <span>${s.name}</span>
                `;
                div.addEventListener("click", () => {
                    window.location.href = `${window.location.pathname.includes("pages/") ? "../" : ""}pages/product_details.html?id=${s.id}`;
                    suggestionsContainer.style.display = "none";
                    overlay.classList.remove('show');
                    localStorage.setItem('searchOpen', 'false');
                });
            } else if (s.type === "category") {
                div.innerHTML = `<span>${s.name}</span>`;
                div.addEventListener("click", () => {
                    window.location.href = `${window.location.pathname.includes("pages/") ? "../" : ""}pages/products_list.html?category=${encodeURIComponent(s.slug)}`;
                    suggestionsContainer.style.display = "none";
                    overlay.classList.remove('show');
                    localStorage.setItem('searchOpen', 'false');
                });
            } else if (s.type === "suggested") {
                div.innerHTML = `<span class="suggested-term">${s.name}</span>`;
                div.addEventListener("click", () => {
                    searchInput.value = s.name;
                    suggestionsContainer.style.display = "none";
                    overlay.classList.remove('show');
                    localStorage.setItem('searchOpen', 'false');
                    searchInput.dispatchEvent(new Event('input'));
                });
            } else {
                div.innerHTML = `<span>${s.name}</span>`;
                div.addEventListener("click", () => {
                    window.location.href = `${window.location.pathname.includes("pages/") ? "../" : ""}pages/products_list.html?search=${encodeURIComponent(s.name)}`;
                    suggestionsContainer.style.display = "none";
                    overlay.classList.remove('show');
                    localStorage.setItem('searchOpen', 'false');
                });
            }
            suggestionsContainer.appendChild(div);
        });

        suggestionsContainer.style.display = allSuggestions.length ? "block" : "none";
        if (allSuggestions.length) {
            suggestionsContainer.classList.add('show');
            overlay.classList.add('show');
            localStorage.setItem('searchOpen', 'true');
        } else {
            overlay.classList.remove('show');
            localStorage.setItem('searchOpen', 'false');
        }
    }, 300));

    // Hide suggestions and overlay when clicking outside
    document.addEventListener("click", (e) => {
        if (!searchBox.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.style.display = "none";
            suggestionsContainer.classList.remove("show");
            overlay.classList.remove("show");
            // console.log(' Clicked outside search box, hiding suggestions and overlay');
        }
    });

    // Form submission
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            const selectedCategory = categorySelect ? categorySelect.value : 'All Categories';
            if (query) {
                if (selectedCategory === 'All Categories') {
                    window.location.href = `index.html?search=${encodeURIComponent(query)}`;
                } else {
                    window.location.href = `pages/products_list.html?search=${encodeURIComponent(query)}&category=${encodeURIComponent(selectedCategory)}`;
                }
            }
        });
    }

    // Initialize other functionality
    function initializeItemsHome() {

        const updateCounts = () => {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);
            const favoritesCount = favorites.length;

            document.querySelectorAll('.count_item_header, .count-items-cart').forEach(element => {
                element.textContent = cartCount;
            });

            document.querySelectorAll('.count_favourite').forEach(element => {
                element.textContent = favoritesCount;
            });
            // console.log(`🛒 Cart count: ${cartCount}, ❤️ Favorites count: ${favoritesCount}`);
        };

        const toggleFavorite = debounce((product) => {
            if (!product || !product.id) {
                // console.error(' Invalid product for favorites');
                return;
            }
            let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            const existingItem = favorites.find(item => item.id == product.id);
            if (existingItem) {
                favorites = favorites.filter(item => item.id != product.id);
                // console.log(` Removed ${product.name} from favorites`);
            } else {
                favorites.push({ ...product });
                // console.log(` Added ${product.name} to favorites`);
            }
            localStorage.setItem('favorites', JSON.stringify(favorites));
            window.dispatchEvent(new Event('storage'));
            const buttons = document.querySelectorAll(`.icon-product[data-id="${product.id}"]`);
            buttons.forEach(btn => {
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-regular', 'fa-solid', 'active');
                    icon.classList.add(existingItem ? 'fa-regular' : 'fa-solid');
                    if (!existingItem) icon.classList.add('active');
                }
            });
            updateCounts();
            if (typeof window.updateFavorites === 'function') {
                window.updateFavorites();
            }
        }, 200);

        const localAddToCart = debounce((product) => {
            if (!product || !product.id) {
                // console.error(' Invalid product for cart');
                return;
            }
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingItem = cart.find(item => item.id == product.id);
            const maxQuantity = product.stock || 10; // Assume max 10 if stock not specified
            if (existingItem) {
                if (existingItem.quantity >= maxQuantity) {
                    // console.warn(` Maximum quantity reached for ${product.name} (Qty: ${existingItem.quantity})`);
                    alert(`لا يمكن إضافة المزيد من ${product.name}. الكمية القصوى: ${maxQuantity}`);
                    return;
                }
                existingItem.quantity = (existingItem.quantity || 1) + 1;
                // console.log(` Increased quantity for ${product.name} to ${existingItem.quantity}`);
            } else {
                cart.push({ ...product, quantity: 1 });
                // console.log(` Added ${product.name} to cart with quantity 1`);
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            const allMatchingButtons = document.querySelectorAll(`.btn-add-cart[data-id="${product.id}"]`);
            allMatchingButtons.forEach(btn => {
                btn.classList.add('active');
                btn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Item in cart (${existingItem ? existingItem.quantity + 1 : 1})`;
                btn.setAttribute('disabled', 'true');
            });
            window.dispatchEvent(new Event('storage'));
            updateCounts();
            // Optional: Show user feedback
            alert(`${product.name} تم إضافته إلى السلة!`);
        }, 300); // Increased debounce to 300ms for better handling

        const handleFavoriteClick = (e, allProducts) => {
            e.preventDefault();
            e.stopPropagation();
            const button = e.target.closest('.icon-product');
            if (!button) return;
            const productId = button.getAttribute('data-id');
            // console.log(` Favorite clicked for product ID: ${productId}`);
            const selectProduct = allProducts.find(product => product.id == productId);
            if (!selectProduct) {
                // console.error(` Product with ID ${productId} not found`);
                return;
            }
            try {
                window.toggleFavorite ? window.toggleFavorite(selectProduct) : toggleFavorite(selectProduct);
            } catch (error) {
                // console.warn(` window.toggleFavorite not found, using local toggleFavorite`);
                toggleFavorite(selectProduct);
            }
        };

        const handleAddToCart = (e, allProducts) => {
            e.preventDefault();
            e.stopPropagation();
            const button = e.target.closest('.btn-add-cart');
            if (!button || button.hasAttribute('disabled')) {
                // console.log(` Add to cart button disabled or not found for click`);
                return;
            }
            const productId = button.getAttribute('data-id');
            console.log(` Add to cart clicked for product ID: ${productId}`);
            const selectProduct = allProducts.find(product => product.id == productId);
            if (!selectProduct) {
                // console.error(` Product with ID ${productId} not found`);
                return;
            }
            try {
                window.addToCart ? window.addToCart(selectProduct) : localAddToCart(selectProduct);
                if (window.updateCart) window.updateCart();
            } catch (error) {
                // console.warn(` window.addToCart not found, using localAddToCart`);
                localAddToCart(selectProduct);
            }
        };

        const categories = [
            { id: 'swiper_items_sale', category: 'hot_deals' },
            { id: 'swiper_Electronics', category: 'electronics' },
            { id: 'swiper_Smartphones', category: 'smartphones' },
            { id: 'swiper_Laptops', category: 'laptops' },
            { id: 'swiper_Appliances', category: 'appliances' },
            { id: 'swiper_kitchen', category: 'kitchen' },
            { id: 'swiper_Skincare', category: 'skincare' },
            { id: 'swiper_Fragrances', category: 'fragrances' },
            { id: 'swiper_MenClothing', category: 'men-clothing' },
            { id: 'swiper_Home', category: 'home' },
            { id: 'swiper_Toys', category: 'toys' },
            { id: 'swiper_Books', category: 'books' }
        ];

        const containers = categories.reduce((acc, { id, category }) => {
            const element = document.getElementById(id);
            if (element) {
                acc[category] = element.querySelector('.swiper-wrapper') || element;
            }
            return acc;
        }, {});

        // Load products once and handle all functionality
        loadProducts().then(data => {
            productsData = data;
            if (!productsData.length) {
                categories.forEach(({ id, category }) => {
                    const container = containers[category];
                    if (container) {
                        container.innerHTML = `
                            <div class="error-message">
                                <p>خطأ في تحميل المنتجات، تأكد من وجود ملف products.json</p>
                                <button onclick="window.location.reload()">إعادة المحاولة</button>
                            </div>
                        `;
                    }
                });
                // console.error(' No products loaded, check products.json');
                return;
            }

            // Populate categories
            categories.forEach(({ category }) => {
                const container = containers[category];
                if (container) {
                    populateCategorySlide(category, container, productsData);
                }
            });

            // Sync initial cart state
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            cart.forEach(item => {
                const buttons = document.querySelectorAll(`.btn-add-cart[data-id="${item.id}"]`);
                buttons.forEach(btn => {
                    btn.classList.add('active');
                    btn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Item in cart (${item.quantity})`;
                    btn.setAttribute('disabled', 'true');
                });
            });

            // Event delegation for cart and favorites
            document.addEventListener('click', async (e) => {
                if (e.target.closest('.btn-add-cart')) {
                    const button = e.target.closest('.btn-add-cart');
                    if (!button.hasAttribute('disabled')) {
                        const productId = button.getAttribute('data-id');
                        const selectProduct = productsData.find(product => product.id == productId);
                        if (selectProduct) {
                            addToCart(selectProduct);
                            button.classList.add('active');
                            button.innerHTML = '<i class="fa-solid fa-cart-shopping"></i> Item in cart';
                            button.setAttribute('disabled', 'true');
                        } else {
                            // console.error(` Product with ID ${productId} not found`);
                        }
                    }
                }
                if (e.target.closest('.icon-product')) {
                    const button = e.target.closest('.icon-product');
                    const productId = button.getAttribute('data-id');
                    const selectProduct = productsData.find(product => product.id == productId);
                    if (selectProduct) {
                        toggleFavorite(selectProduct);
                    } else {
                        // console.error(` Product with ID ${productId} not found`);
                    }
                }
            });

            updateCounts();
            // console.log(` Initialized home page with ${productsData.length} products`);
        }).catch(err => {
            console.error(' Error loading products:', err);
        });
    }

    waitForMainFunctions(() => {
        initializeItemsHome();
    });
});
"use strict";

document.addEventListener('DOMContentLoaded', () => {
    // Translation cache to reduce API calls
    const translationCache = new Map();

    // Translate using MyMemory API
    const translateText = async (text, sourceLang, targetLang) => {
        const cacheKey = `${text}_${sourceLang}_${targetLang}`;
        if (translationCache.has(cacheKey)) {
            return translationCache.get(cacheKey);
        }

        try {
            const response = await fetch(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
            );

            if (!response.ok) {
                throw new Error(`Translation API error: ${response.status}`);
            }

            const data = await response.json();
            const translatedText = data.responseData.translatedText || text;
            translationCache.set(cacheKey, translatedText);
            return translatedText;
        } catch (error) {
            console.error("Translation error:", error);
            const fallback = `Translation unavailable: ${text}`;
            translationCache.set(cacheKey, fallback);
            return fallback;
        }
    };

    // Update favorite count in header and cart
    const updateFavoriteCount = () => {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const favoriteCountElements = document.querySelectorAll('.count_favourite');
        favoriteCountElements.forEach(count => {
            count.textContent = favorites.length;
        });
    };

    // Update cart count in header and cart
    const updateCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        const countElement = document.querySelector('.count_item_header');
        if (countElement) {
            countElement.textContent = totalCount;
        }
        const countItemsCart = document.querySelector('.count-items-cart');
        if (countItemsCart) {
            countItemsCart.textContent = cart.length;
        }
        updateFavoriteCount();
    };

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

    // Check if user is logged in
    const isLoggedIn = () => {
        const userData = localStorage.getItem('loggedInUser');
        try {
            const user = JSON.parse(userData);
            return user && (user.email || user.name) && userData !== 'null' && userData !== 'undefined';
        } catch (e) {
            console.error('Error parsing loggedInUser:', e);
            return false;
        }
    };

    // Detect text direction
    const isArabic = (text) => /[\u0600-\u06FF]/.test(text);
    const getTextDirection = (text) => (isArabic(text) ? 'rtl' : 'ltr');
    const getReviewLabel = (text) => (isArabic(text) ? 'تعليقك:' : 'Your Review:');

    // Update user dropdown visibility
    const updateUserDropdown = () => {
        const userDropdown = document.getElementById('userDropdownContainer');
        if (isLoggedIn()) {
            const userData = JSON.parse(localStorage.getItem('loggedInUser'));
            const profileImage = document.getElementById('headerProfileImage');
            profileImage.src = userData.image || '../assets/img/Avatar.webp';
            userDropdown.classList.remove('hidden');
        } else {
            userDropdown.classList.add('hidden');
        }
    };

    // Pagination settings
    const reviewsPerPage = 10;
    let currentPage = 1;
    let allReviews = [];
    let productsData = [];

    // Elements
    const productFilter = document.getElementById('product-filter');
    const ratingFilter = document.getElementById('rating-filter');
    const sortBy = document.getElementById('sort-by');
    const searchInput = document.getElementById('search');
    const categorySelect = document.getElementById('category');
    const searchForm = document.getElementById('searchForm');
    const reviewsContainer = document.getElementById('all-reviews-list');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    const addReviewForm = document.getElementById('add-review-form');
    const reviewProduct = document.getElementById('review-product');
    const reviewRating = document.getElementById('review-rating');
    const reviewText = document.getElementById('review-text');
    const reviewTextLabel = document.getElementById('review-text-label');
    const cartItems = document.querySelector('.cart');
    const favoritesModal = document.querySelector('.favorites');
    const navMenu = document.querySelector('.nav-links');

    // Search-related elements
    const suggestionsContainer = document.createElement("div");
    suggestionsContainer.classList.add("suggestions");
    if (searchInput) {
        searchInput.parentNode.appendChild(suggestionsContainer);
    } else {
        console.error('Search input with id="search" not found');
    }

    const overlay = document.createElement('div');
    overlay.classList.add('search-overlay');
    document.body.appendChild(overlay);

    // CSS styles for search (aligned with items_home.js)
    const style = document.createElement('style');
    style.innerHTML = `
        .suggestions {
            display: none;
            position: absolute;
            top: 100%;
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

    // Common search terms (from items_home.js)
    const commonSearchTerms = [
        'iPhone', 'آيفون', 'iPad', 'آيباد', 'Samsung', 'سامسونج', 'Huawei', 'هواوي',
        'Oppo', 'أوبو', 'Xiaomi', 'شاومي', 'Realme', 'ريلمي',
        'Laptop', 'لابتوب', 'Gaming Laptop', 'لابتوب ألعاب', 'MacBook', 'ماك بوك',
        'Headphones', 'سماعات', 'Earbuds', 'إيربودز', 'Bluetooth Headset', 'سماعات بلوتوث',
        'Smartwatch', 'ساعة ذكية', 'Charger', 'شاحن', 'Powerbank', 'باور بنك',
        'Tablet', 'تابلت', 'TV', 'تلفزيون', 'Smart TV', 'شاشة ذكية',
        'Camera', 'كاميرا', 'DSLR', 'كاميرا احترافية',
        'Blender', 'خلاط', 'Microwave', 'ميكروويف', 'Fridge', 'ثلاجة',
        'Citrus Squeezer', 'عصارة', 'Cookware', 'أواني طهي', 'Non-stick Pan', 'طاسة تفال',
        'Knife Set', 'طقم سكاكين', 'Water Bottle', 'زجاجة مياه', 'Vacuum Cleaner', 'مكنسة كهربائية',
        'Air Fryer', 'قلاية هوائية', 'Coffee Maker', 'ماكينة قهوة', 'Kitchen Tools', 'أدوات مطبخ',
        'Toaster', 'محمص خبز', 'Kettle', 'غلاية مياه',
        'T-shirt', 'تيشيرت', 'Jeans', 'بنطلون جينز', 'Shoes', 'أحذية',
        'Sneakers', 'سنيكرز', 'Watch', 'ساعة', 'Backpack', 'حقيبة ظهر',
        'Jacket', 'جاكيت', 'Shirt', 'قميص', 'Dress', 'فستان', 'Bag', 'شنطة',
        'Perfume', 'عطر', 'Cologne', 'كولونيا', 'Deodorant', 'مزيل عرق',
        'Skincare', 'عناية بالبشرة', 'Moisturizer', 'مرطب', 'Face Wash', 'غسول وجه',
        'Sunscreen', 'واقي شمس', 'Body Lotion', 'لوشن للجسم', 'Face Cream', 'كريم وجه',
        'Novel', 'رواية', 'Story Book', 'قصص', 'Children Toys', 'ألعاب أطفال',
        'Action Figure', 'مجسمات', 'Board Game', 'ألعاب طاولة',
        'Puzzle', 'بازل', 'Coloring Book', 'كتب تلوين',
        'Rice', 'أرز', 'Pasta', 'مكرونة', 'Oil', 'زيت', 'Milk', 'لبن',
        'Snacks', 'سناكس', 'Coffee', 'قهوة', 'Tea', 'شاي',
        'Sugar', 'سكر', 'Flour', 'دقيق', 'Juice', 'عصير', 'Water', 'مياه'
    ];

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

    // Normalize category
    function normalizeCategory(cat) {
        if (!cat) return ['unknown'];
        if (Array.isArray(cat)) {
            return cat.map(c => c.toLowerCase()
                .replace(/\s+/g, '-')
                .replace('smart-phones', 'smartphones')
                .replace('skin-care', 'skincare')
                .replace('men clothing', 'men-clothing')
                .replace('kitchen-accessories', 'kitchen'));
        }
        return [cat.toLowerCase()
            .replace(/\s+/g, '-')
            .replace('smart-phones', 'smartphones')
            .replace('skin-care', 'skincare')
            .replace('men clothing', 'men-clothing')
            .replace('kitchen-accessories', 'kitchen')];
    }

    // Check if product matches category
    const productMatchesCategory = (product, targetCategory) => {
        const productCategories = Array.isArray(product.category)
            ? product.category
            : [product.category];
        const normalizedTarget = normalizeCategory(targetCategory)[0];
        return productCategories.some(cat => normalizeCategory(cat)[0] === normalizedTarget);
    };

    // Levenshtein Distance for spell correction
    function levenshteinDistance(a, b) {
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
    }

    // Spell correction suggestions
    function getSpellingSuggestions(query, terms, maxDistance = 3) {
        return terms
            .map(term => ({ term, distance: levenshteinDistance(query.toLowerCase(), term.toLowerCase()) }))
            .filter(item => item.distance <= maxDistance && item.distance > 0)
            .sort((a, b) => a.distance - b.distance)
            .map(item => item.term)
            .slice(0, 3);
    }

    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Fuzzy match for autocomplete
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

    // Load products into filter and review form dropdowns
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
            productsData = (data.products || data)
                .filter(product => product.id && product.name)
                .map(product => ({
                    id: product.id,
                    name: product.name && typeof product.name === 'string' ? product.name : 'Unknown Product',
                    price: product.price || 0,
                    old_price: product.old_price || null,
                    img: product.img ? (
                        product.img.toLowerCase().includes('assets/')
                            ? product.img.replace(/assets\//i, window.location.pathname.includes('pages/') ? '../assets/' : 'assets/')
                            : product.img
                    ) : 'assets/img/placeholder.png',
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

    // Load products into filter dropdown
    async function loadProductsFilter() {
        const products = await loadProducts();
        productsData = products;
        productFilter.innerHTML = '<option value="all">All Products</option>';
        reviewProduct.innerHTML = '<option value="">Select a Product</option>';
        products.forEach(product => {
            productFilter.innerHTML += `<option value="${product.id}">${product.name}</option>`;
            reviewProduct.innerHTML += `<option value="${product.id}">${product.name}</option>`;
        });
    }

    // Search autocomplete for reviews
    if (searchInput) {
        searchInput.addEventListener("focus", () => {
            if (searchInput.value.trim().length > 0 || suggestionsContainer.children.length > 0) {
                suggestionsContainer.style.display = "block";
                suggestionsContainer.classList.add("show");
                overlay.classList.add("show");
                localStorage.setItem('searchOpen', 'true');
                cartItems?.classList.remove('active');
                favoritesModal?.classList.remove('active');
                navMenu?.classList.remove('active');
                localStorage.setItem('cartOpen', 'false');
                localStorage.setItem('favoritesOpen', 'false');
                localStorage.setItem('menuOpen', 'false');
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
                currentPage = 1;
                loadAllReviews();
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
                    if (!b.nameMatch && a.nameMatch) return 1;
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

            // Filter reviews based on search query
            currentPage = 1;
            loadAllReviews();
        }, 300));
    }

    // Hide suggestions when clicking outside
    document.addEventListener("click", (e) => {
        if (searchInput && !searchInput.parentNode.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.style.display = "none";
            suggestionsContainer.classList.remove("show");
            overlay.classList.remove("show");
            localStorage.setItem('searchOpen', 'false');
        }
    });

    // Form submission
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            const selectedCategory = categorySelect ? categorySelect.value : 'All Categories';
            if (query) {
                window.location.href = `${window.location.pathname.includes('pages/') ? '../' : ''}pages/products_list.html?search=${encodeURIComponent(query)}&category=${encodeURIComponent(selectedCategory)}`;
            }
        });
    }

    // Handle add review form submission
    addReviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!isLoggedIn()) {
            Swal.fire({
                title: 'غير مسجل الدخول',
                text: 'يرجى تسجيل الدخول لإضافة تعليق.',
                icon: 'warning',
                confirmButtonText: 'حسنًا',
                customClass: {
                    popup: 'swal2-rtl'
                }
            });
            return;
        }

        const productId = reviewProduct.value;
        const rating = parseInt(reviewRating.value);
        const text = reviewText.value.trim();

        if (!productId || !text) {
            Swal.fire({
                title: isArabic(text) ? 'خطأ' : 'Error',
                text: isArabic(text) ? 'يرجى اختيار منتج وكتابة تعليق.' : 'Please select a product and write a review.',
                icon: 'error',
                confirmButtonText: isArabic(text) ? 'حسنًا' : 'OK',
                direction: getTextDirection(text)
            });
            return;
        }

        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const reviewer = users.find(u => u.email === user.email) || {};
        const name = reviewer.name || user.name || 'User';
        const reviews = JSON.parse(localStorage.getItem(`reviews_${productId}`)) || [];
        reviews.push({
            user: name,
            rating,
            text,
            timestamp: Date.now()
        });
        localStorage.setItem(`reviews_${productId}`, JSON.stringify(reviews));
        addReviewForm.reset();
        reviewText.style.direction = 'ltr';
        reviewTextLabel.textContent = 'Your Review:';
        await loadAllReviews();
        Swal.fire({
            title: isArabic(text) ? 'تم الإرسال!' : 'Review Submitted!',
            text: isArabic(text) ? 'تم إضافة تعليقك بنجاح.' : 'Your review has been submitted successfully.',
            icon: 'success',
            confirmButtonText: isArabic(text) ? 'حسنًا' : 'OK',
            direction: getTextDirection(text)
        });
    });

    // Update text direction dynamically for add review form
    reviewText.addEventListener('input', () => {
        reviewText.style.direction = getTextDirection(reviewText.value);
        reviewTextLabel.textContent = getReviewLabel(reviewText.value);
    });

    // Load all reviews with filters, pagination, and translations
    const loadAllReviews = async () => {
        if (!isLoggedIn()) {
            reviewsContainer.innerHTML = '<p>Please log in to view or manage reviews.</p>';
            return;
        }

        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        const selectedProduct = productFilter.value;
        const selectedRating = ratingFilter.value;
        const sortOrder = sortBy.value;
        const searchQuery = searchInput.value.trim().toLowerCase();

        if (!productsData.length) {
            productsData = await loadProducts();
            if (!productsData.length) {
                reviewsContainer.innerHTML = '<p>Loading products...</p>';
                return;
            }
        }

        allReviews = [];
        productsData.forEach(product => {
            const reviews = JSON.parse(localStorage.getItem(`reviews_${product.id}`)) || [];
            reviews.forEach((review, index) => {
                allReviews.push({ productId: product.id, productName: product.name, index, ...review });
            });
        });

        // Apply filters
        let filteredReviews = allReviews.filter(review => {
            const matchesProduct = selectedProduct === 'all' || review.productId == selectedProduct;
            const matchesRating = selectedRating === 'all' || review.rating == selectedRating;
            const matchesSearch = searchQuery === '' || fuzzyMatch(searchQuery, review.text || '') || fuzzyMatch(searchQuery, review.productName || '');
            return matchesProduct && matchesRating && matchesSearch;
        });

        // Sort reviews
        filteredReviews.sort((a, b) => {
            const dateA = a.timestamp || Date.now();
            const dateB = b.timestamp || Date.now();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        // Pagination
        const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
        currentPage = Math.min(currentPage, Math.max(1, totalPages));
        const start = (currentPage - 1) * reviewsPerPage;
        const end = start + reviewsPerPage;
        const paginatedReviews = filteredReviews.slice(start, end);

        // Update UI
        reviewsContainer.innerHTML = '';
        const users = JSON.parse(localStorage.getItem('users')) || [];
        for (let i = 0; i < paginatedReviews.length; i++) {
            const review = paginatedReviews[i];
            const reviewer = users.find(u => u.name === review.user || u.email === review.user) || {};
            const reviewerName = reviewer.name || 'User';
            const reviewerImage = reviewer.image || '../assets/img/Avatar.webp';
            const isOwnReview = loggedInUser && (review.user === loggedInUser.name || review.user === loggedInUser.email);
            const sourceLang = isArabic(review.text) ? 'ar' : 'en';
            const targetLang = isArabic(review.text) ? 'en' : 'ar';
            const translation = await translateText(review.text, sourceLang, targetLang);

            const reviewElement = document.createElement('div');
            reviewElement.classList.add('review');
            reviewElement.style.opacity = '0';
            reviewElement.style.transform = 'translateY(20px)';
            reviewElement.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            reviewElement.style.direction = getTextDirection(review.text);
            reviewElement.innerHTML = `
                <div class="review-header">
                    <img src="${reviewerImage}" alt="${reviewerName}" class="review-user-img" loading="lazy">
                    <span class="review-user">${reviewerName}</span>
                    <div class="review-stars">${generateStars(review.rating)}</div>
                </div>
                <p class="review-text"><strong>Product:</strong> <a href="product_details.html?id=${review.productId}">${review.productName}</a></p>
                <p class="review-text" style="direction: ${getTextDirection(review.text)}">${review.text}</p>
                <p class="review-translation" style="direction: ${isArabic(review.text) ? 'ltr' : 'rtl'}; display: none;">${translation}</p>
                <a href="#" class="translate-link" data-index="${i}">${isArabic(review.text) ? 'Translate to English' : 'ترجم إلى العربية'}</a>
                <p class="review-date">Posted on: ${new Date(review.timestamp || Date.now()).toLocaleDateString()}</p>
                ${isOwnReview ? `
                    <div class="review-actions">
                        <button class="edit-review-btn" data-product-id="${review.productId}" data-index="${review.index}"><i class="fa-solid fa-edit"></i> Edit</button>
                        <button class="delete-review-btn" data-product-id="${review.productId}" data-index="${review.index}"><i class="fa-solid fa-trash"></i> Delete</button>
                    </div>
                ` : ''}
            `;
            reviewsContainer.appendChild(reviewElement);
            setTimeout(() => {
                reviewElement.style.opacity = '1';
                reviewElement.style.transform = 'translateY(0)';
            }, i * 100);
        }

        // Add translation link event listeners
        document.querySelectorAll('.translate-link').forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const index = e.target.dataset.index;
                const translationElement = reviewsContainer.querySelector(`.review:nth-child(${parseInt(index) + 1}) .review-translation`);
                const isVisible = translationElement.style.display !== 'none';
                translationElement.style.display = isVisible ? 'none' : 'block';
                e.target.textContent = isVisible
                    ? (isArabic(paginatedReviews[index].text) ? 'Translate to English' : 'ترجم إلى العربية')
                    : (isArabic(paginatedReviews[index].text) ? 'Hide Translation' : 'إخفاء الترجمة');
            });
        });

        // Update pagination
        pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
        if (!paginatedReviews.length) {
            reviewsContainer.innerHTML = '<p>No reviews match your filters.</p>';
        }

        // Add edit/delete event listeners
        document.querySelectorAll('.edit-review-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                const index = e.target.dataset.index;
                editReview(productId, index);
            });
        });

        document.querySelectorAll('.delete-review-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                const index = e.target.dataset.index;
                deleteReview(productId, index);
            });
        });
    };

    // Edit review
    const editReview = async (productId, index) => {
        const reviews = JSON.parse(localStorage.getItem(`reviews_${productId}`)) || [];
        const review = allReviews.find(r => r.productId == productId && r.index == index);
        if (!review) return;

        const reviewElement = document.querySelector(`.review:nth-child(${parseInt(index) + 1})`);
        reviewElement.innerHTML = `
            <form class="review-form">
                <h3>${isArabic(review.text) ? 'تعديل تعليقك' : 'Edit Your Review'}</h3>
                <div class="form-group">
                    <label for="edit-rating-${index}">Rating:</label>
                    <select id="edit-rating-${index}" required>
                        <option value="1" ${review.rating == 1 ? 'selected' : ''}>1 Star</option>
                        <option value="2" ${review.rating == 2 ? 'selected' : ''}>2 Stars</option>
                        <option value="3" ${review.rating == 3 ? 'selected' : ''}>3 Stars</option>
                        <option value="4" ${review.rating == 4 ? 'selected' : ''}>4 Stars</option>
                        <option value="5" ${review.rating == 5 ? 'selected' : ''}>5 Stars</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit-text-${index}">${getReviewLabel(review.text)}</label>
                    <textarea id="edit-text-${index}" required style="direction: ${getTextDirection(review.text)}">${review.text}</textarea>
                </div>
                <button type="submit" class="btn">Save Changes</button>
                <button type="button" class="btn cancel-btn">Cancel</button>
            </form>
        `;
        reviewElement.style.opacity = '1';
        const textarea = reviewElement.querySelector(`#edit-text-${index}`);
        textarea.focus();

        // Update text direction dynamically
        textarea.addEventListener('input', () => {
            const label = reviewElement.querySelector(`label[for="edit-text-${index}"]`);
            textarea.style.direction = getTextDirection(textarea.value);
            label.textContent = getReviewLabel(textarea.value);
        });

        // Handle form submission
        reviewElement.querySelector('.review-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const newRating = reviewElement.querySelector(`#edit-rating-${index}`).value;
            const newText = reviewElement.querySelector(`#edit-text-${index}`).value;
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
            const reviewer = users.find(u => u.email === loggedInUser.email) || {};
            const name = reviewer.name || loggedInUser.name || 'User';
            reviews[index] = { ...reviews[index], user: name, rating: parseInt(newRating), text: newText, timestamp: Date.now() };
            localStorage.setItem(`reviews_${productId}`, JSON.stringify(reviews));
            await loadAllReviews();
            Swal.fire({
                title: isArabic(newText) ? 'تم الحفظ!' : 'Changes Saved!',
                text: isArabic(newText) ? 'تم حفظ تعديلاتك بنجاح.' : 'Your changes have been saved successfully.',
                icon: 'success',
                confirmButtonText: isArabic(newText) ? 'حسنًا' : 'OK',
                direction: getTextDirection(newText)
            });
        });

        // Handle cancel
        reviewElement.querySelector('.cancel-btn').addEventListener('click', () => {
            loadAllReviews();
        });
    };

    // Delete review
    const deleteReview = (productId, index) => {
        const reviews = JSON.parse(localStorage.getItem(`reviews_${productId}`)) || [];
        const review = reviews[index];
        Swal.fire({
            title: isArabic(review.text) ? 'هل أنت متأكد؟' : 'Are you sure?',
            text: isArabic(review.text) ? 'هل تريد حذف هذا التعليق؟' : 'Do you want to delete this review?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: isArabic(review.text) ? 'نعم، احذف' : 'Yes, delete',
            cancelButtonText: isArabic(review.text) ? 'إلغاء' : 'Cancel',
            direction: getTextDirection(review.text)
        }).then((result) => {
            if (result.isConfirmed) {
                reviews.splice(index, 1);
                localStorage.setItem(`reviews_${productId}`, JSON.stringify(reviews));
                loadAllReviews();
                Swal.fire({
                    title: isArabic(review.text) ? 'تم الحذف!' : 'Deleted!',
                    text: isArabic(review.text) ? 'تم حذف التعليق بنجاح.' : 'The review has been deleted successfully.',
                    icon: 'success',
                    confirmButtonText: isArabic(review.text) ? 'حسنًا' : 'OK',
                    direction: getTextDirection(review.text)
                });
            }
        });
    };

    // Pagination event listeners
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadAllReviews();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(allReviews.length / reviewsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            loadAllReviews();
        }
    });

    // Add event listeners for filters
    productFilter.addEventListener('change', () => { currentPage = 1; loadAllReviews(); });
    ratingFilter.addEventListener('change', () => { currentPage = 1; loadAllReviews(); });
    sortBy.addEventListener('change', () => { currentPage = 1; loadAllReviews(); });
    if (searchInput) {
        searchInput.addEventListener('input', () => { currentPage = 1; loadAllReviews(); });
    }

    // Initialize
    updateUserDropdown();
    loadProductsFilter();
    updateCartCount();
    updateFavoriteCount();
    loadAllReviews();
});
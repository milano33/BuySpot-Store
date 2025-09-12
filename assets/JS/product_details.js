"use strict";
// إضافة هذا الكود في بداية ملف JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // إصلاح مشكلة العرض على الموبايل
    const fixMobileViewport = () => {
        let viewport = document.querySelector('meta[name=viewport]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';

        // منع الـ horizontal scroll
        document.body.style.overflowX = 'hidden';
        document.documentElement.style.overflowX = 'hidden';
        document.body.style.maxWidth = '100vw';
        document.documentElement.style.maxWidth = '100vw';

        // إصلاح السلة والـ overlay
        const cart = document.querySelector('.cart');
        const overlay = document.querySelector('.search-overlay');
        if (cart) {
            cart.style.maxWidth = '100vw';
            cart.style.overflowX = 'hidden';
        }
        if (overlay) {
            overlay.style.maxWidth = '100vw';
            overlay.style.overflowX = 'hidden';
        }
    };
    // إصلاح مشاكل النصوص الطويلة
    const fixLongTextMobile = () => {
        if (window.innerWidth <= 578) {
            // إصلاح أسماء المنتجات الطويلة
            const productNames = document.querySelectorAll('.name-product, .product-info h1');
            productNames.forEach(name => {
                name.style.wordWrap = 'break-word';
                name.style.overflowWrap = 'break-word';
                name.style.hyphens = 'auto';
                name.style.maxWidth = '100%';
            });

            // إصلاح النصوص في المراجعات
            const reviewTexts = document.querySelectorAll('.review-text');
            reviewTexts.forEach(text => {
                text.style.wordWrap = 'break-word';
                text.style.overflowWrap = 'break-word';
                text.style.maxWidth = '100%';
            });
        }
    };

    // تشغيل جميع الإصلاحات
    fixMobileViewport();

    fixLongTextMobile();

    // إعادة تشغيل الإصلاحات عند تغيير حجم الشاشة
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {


            fixLongTextMobile();
        }, 250);
    });

    // إصلاح مشكلة التمدد المفاجئ
    const preventHorizontalOverflow = () => {
    const observer = new MutationObserver(() => {
        if (window.innerWidth <= 578) {
            const allElements = document.querySelectorAll('.cart, .cart-item, .search-overlay, .suggestions');
            allElements.forEach(element => {
                const styles = window.getComputedStyle(element);
                if (styles.width && styles.width !== 'auto') {
                    const widthValue = parseFloat(styles.width);
                    const viewportWidth = window.innerWidth;
                    if (widthValue > viewportWidth) {
                        element.style.maxWidth = '100vw';
                        element.style.overflowX = 'hidden';
                        element.style.boxSizing = 'border-box';
                    }
                }
            });
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
    });
};

    // تشغيل منع التمدد الأفقي
    if (window.innerWidth <= 578) {
        preventHorizontalOverflow();
    }
});
document.addEventListener('DOMContentLoaded', () => {
    // Normalize category to always be an array
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

    // Check if product matches any category in the given array
    const hasCommonCategory = (productCategories, targetCategories) => {
        const normalizedProductCats = normalizeCategory(productCategories);
        const normalizedTargetCats = normalizeCategory(targetCategories);
        return normalizedProductCats.some(cat => normalizedTargetCats.includes(cat));
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

    // Debounce function
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(null, args), delay);
        };
    };

    // Update cart count in header
    const updateCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        const countElement = document.querySelector('.count_item_header');
        if (countElement) {
            countElement.textContent = totalCount;
        }
        const countItemsCart = document.querySelector('.count-items-cart');
        if (countItemsCart) {
            countItemsCart.textContent = cart.length;
        }
    };

    // Update favorite count in header
    const updateFavoriteCount = () => {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const favoriteCountElements = document.querySelectorAll('.count_favourite');
        favoriteCountElements.forEach(count => {
            count.textContent = favorites.length;
        });
        const countFavorites = document.querySelector('.count-favorites');
        if (countFavorites) {
            countFavorites.textContent = favorites.length;
        }
    };

    // Delete item from favorites
    function deleteFromFavorites(index) {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const removedProduct = favorites.splice(index, 1)[0];
        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateFavorites();
        const buttons = document.querySelectorAll(`.icon-product[data-id="${removedProduct.id}"]`);
        buttons.forEach(btn => {
            btn.classList.remove("active");
            const icon = btn.querySelector('i');
            icon.classList.remove('fa-solid', 'active');
            icon.classList.add('fa-regular');
            if (btn.classList.contains('btn-favorite')) {
                btn.innerHTML = '<i class="fa-regular fa-heart"></i> Add to Favorites';
                btn.removeAttribute('disabled');
            }
        });
        updateFavoriteCount();
    }

    // Toggle favorite status
    function toggleFavorite(product) {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const existingItem = favorites.find(item => item.id == product.id);
        if (existingItem) {
            favorites = favorites.filter(item => item.id != product.id);
        } else {
            favorites.push({ ...product, category: normalizeCategory(product.category) });
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
        const buttons = document.querySelectorAll(`.icon-product[data-id="${product.id}"]`);
        buttons.forEach(btn => {
            const icon = btn.querySelector('i');
            icon.classList.remove('fa-regular', 'fa-solid', 'active');
            icon.classList.add(existingItem ? 'fa-regular' : 'fa-solid');
            if (!existingItem) icon.classList.add('active');
            btn.classList.toggle('active', !existingItem);
            if (btn.classList.contains('btn-favorite')) {
                btn.innerHTML = existingItem
                    ? '<i class="fa-regular fa-heart"></i> Add to Favorites'
                    : '<i class="fa-solid fa-heart active"></i> Item in Favorites';
                btn.toggleAttribute('disabled', !existingItem);
            }
        });
        updateFavoriteCount();
        updateFavorites();
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

    // Check if user is logged in
    const isLoggedIn = () => {
        const userData = localStorage.getItem('loggedInUser');
        try {
            const user = JSON.parse(userData);
            return user && (user.email || user.name) && userData !== 'null' && userData !== 'undefined';
        } catch (e) {
            return false;
        }
    };

    // Update cart button state
    const updateCartButtonState = (productId, btn) => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.some(item => item.id == productId)) {
            btn.classList.add('active');
            btn.innerHTML = '<i class="fa-solid fa-cart-shopping"></i> Item in Cart';
            btn.setAttribute('disabled', 'true');
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '<i class="fa-solid fa-cart-shopping"></i> Add to Cart';
            btn.removeAttribute('disabled');
        }
    };

    // Update favorite button state
    const updateFavoriteButton = (productId) => {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const isFavorite = favorites.some(item => item.id == productId);
        const buttons = document.querySelectorAll(`.icon-product[data-id="${productId}"]`);
        buttons.forEach(btn => {
            const icon = btn.querySelector('i');
            icon.classList.remove('fa-regular', 'fa-solid', 'active');
            icon.classList.add(isFavorite ? 'fa-solid' : 'fa-regular', 'fa-heart');
            btn.classList.toggle('active', isFavorite);
        });
    };

    // Initialize cart, favorites, menu, and search state
    const cartItems = document.querySelector('.cart');
    const favoritesModal = document.querySelector('.favorites');
    const navMenu = document.querySelector('.nav-links');
    const searchBox = document.querySelector("header .top-header .container .search-box");
    const searchInput = searchBox?.querySelector(".search") || document.getElementById('search');
    const searchForm = document.getElementById('searchForm');
    const categorySelect = document.getElementById('category');
    const overlay = document.createElement('div');
    overlay.classList.add('search-overlay');
    document.body.appendChild(overlay);

    // Create suggestions container
    const suggestionsContainer = document.createElement("div");
    suggestionsContainer.classList.add("suggestions");
    if (searchBox) searchBox.appendChild(suggestionsContainer);

    // Ensure all modals are closed on page load
    if (cartItems) cartItems.classList.remove('active');
    if (favoritesModal) favoritesModal.classList.remove('active');
    if (navMenu) navMenu.classList.remove('active');
    if (suggestionsContainer) suggestionsContainer.classList.remove('show');
    if (overlay) overlay.classList.remove('show');
    localStorage.setItem('cartOpen', 'false');
    localStorage.setItem('favoritesOpen', 'false');
    localStorage.setItem('menuOpen', 'false');
    localStorage.setItem('searchOpen', 'false');

    // CSS styles for suggestions and overlay
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

    // Load products
    let allProducts = [];
    async function loadProducts(category = null) {
        try {
            const cacheKey = category ? `products_cache_${category}` : "products_cache";
            const cacheTimestampKey = `${cacheKey}_timestamp`;
            const cacheDuration = 24 * 60 * 60 * 1000; // 24 hours

            if (allProducts.length && (!category || allProducts.some(p => hasCommonCategory(p.category, category)))) {
                return category ? allProducts.filter(p => hasCommonCategory(p.category, category)) : allProducts;
            }

            const cachedData = localStorage.getItem(cacheKey);
            const cacheTimestamp = localStorage.getItem(cacheTimestampKey);
            const now = Date.now();

            if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp) < cacheDuration)) {
                allProducts = JSON.parse(cachedData);
                return category ? allProducts.filter(p => hasCommonCategory(p.category, category)) : allProducts;
            }

            const url = window.location.pathname.includes('pages/') ? '../products.json' : 'products.json';
            const res = await fetch(url, { cache: "default" });
            if (!res.ok) throw new Error(`Failed to fetch products.json: ${res.status}`);

            const data = await res.json();
            allProducts = (data.products || data)
                .filter(product => product.id && product.name) // التأكد من وجود id و name
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
                allProducts = allProducts.filter(p => hasCommonCategory(p.category, category));
            }

            localStorage.setItem(cacheKey, JSON.stringify(allProducts));
            localStorage.setItem(cacheTimestampKey, now);
            return allProducts;
        } catch (err) {
            console.error('Error loading products:', err);
            return [];
        }
    }

    // Search autocomplete setup with priority for product names
    if (searchInput && searchBox) {
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
                return;
            }

            if (!allProducts.length) {
                allProducts = await loadProducts();
                if (!allProducts.length) {
                    suggestionsContainer.innerHTML = '<div style="padding: 12px; color: #666;">جاري تحميل المنتجات...</div>';
                    suggestionsContainer.style.display = "block";
                    suggestionsContainer.classList.add("show");
                    overlay.classList.add("show");
                    localStorage.setItem('searchOpen', 'true');
                    return;
                }
            }

            const selectedCategory = categorySelect ? categorySelect.value : 'All Categories';
            const matchingProducts = allProducts
                .map(p => {
                    const nameMatch = fuzzyMatch(query, p.name || '');
                    const descMatch = p.description ? fuzzyMatch(query, p.description) : false;
                    const catMatch = p.category.some(cat => fuzzyMatch(query, cat || ''));
                    const tagMatch = p.tags && Array.isArray(p.tags) ? p.tags.some(tag => fuzzyMatch(query, tag || '')) : false;
                    // Calculate score: prioritize name matches, then description/tags, then category
                    const score = (nameMatch ? 100 : 0) + (descMatch ? 50 : 0) + (tagMatch ? 30 : 0) + (catMatch ? 20 : 0);
                    return { product: p, score, nameMatch };
                })
                .filter(p => p.score > 0 && (selectedCategory === 'All Categories' || p.product.category.includes(normalizeCategory(selectedCategory))))
                .sort((a, b) => {
                    // Sort by score (higher is better), and prioritize name matches
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
                    slug: categoryMap[cat] || normalizeCategory(cat),
                    score: fuzzyMatch(query, cat) ? 80 : 60
                }));

            const matchingTerms = commonSearchTerms
                .filter(term => fuzzyMatch(query, term || ''))
                .map(term => ({ name: term, score: 40 }));

            const spellingSuggestions = (matchingProducts.length === 0 && matchingCategories.length === 0)
                ? getSpellingSuggestions(query, [...allProducts.map(p => p.name || ''), ...Object.keys(categoryMap), ...commonSearchTerms])
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
                    if (selectedCategory === 'All Categories') {
                        window.location.href = `${window.location.pathname.includes("pages/") ? "../" : ""}index.html?search=${encodeURIComponent(query)}`;
                    } else {
                        window.location.href = `${window.location.pathname.includes("pages/") ? "../" : ""}pages/products_list.html?search=${encodeURIComponent(query)}&category=${encodeURIComponent(selectedCategory)}`;
                    }
                }
            });
        }
    }

    // Menu handling for small screens
    const openMenu = document.querySelector('.open-menu');
    const closeMenu = document.querySelector('.close-menu');
    const navLinks = document.querySelectorAll('.nav-links li a');

    if (openMenu && navMenu) {
        openMenu.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            navMenu.classList.add('active');
            overlay.classList.remove('show');
            cartItems?.classList.remove('active');
            favoritesModal?.classList.remove('active');
            suggestionsContainer?.classList.remove('show');
            localStorage.setItem('menuOpen', 'true');
            localStorage.setItem('cartOpen', 'false');
            localStorage.setItem('favoritesOpen', 'false');
            localStorage.setItem('searchOpen', 'false');
        });
    }

    if (closeMenu && navMenu) {
        closeMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.remove('active');
            overlay.classList.remove('show');
            localStorage.setItem('menuOpen', 'false');
        });
    }

    if (navMenu) {
        document.addEventListener('click', (e) => {
            if (!openMenu?.contains(e.target) && !closeMenu?.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                overlay.classList.remove('show');
                localStorage.setItem('menuOpen', 'false');
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.remove('active');
            overlay.classList.remove('show');
            localStorage.setItem('menuOpen', 'false');
        });
    });

    // Category menu handling
    const categoryBtn = document.querySelector('.category-btn');
    const categoryList = document.querySelector('.nav-category-list');
    if (categoryBtn && categoryList) {
        categoryBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            categoryList.classList.toggle('active');
            overlay.classList.toggle('show');
            cartItems?.classList.remove('active');
            favoritesModal?.classList.remove('active');
            suggestionsContainer?.classList.remove('show');
            navMenu?.classList.remove('active');
            localStorage.setItem('categoryOpen', categoryList.classList.contains('active') ? 'true' : 'false');
            localStorage.setItem('cartOpen', 'false');
            localStorage.setItem('favoritesOpen', 'false');
            localStorage.setItem('searchOpen', 'false');
            localStorage.setItem('menuOpen', 'false');
        });
    }

    if (categoryList) {
        document.addEventListener('click', (e) => {
            if (!categoryBtn?.contains(e.target) && !categoryList.contains(e.target)) {
                categoryList.classList.remove('active');
                overlay.classList.remove('show');
                localStorage.setItem('categoryOpen', 'false');
            }
        });
    }

    // Cart handling
    const cartIcon = document.querySelector('.cart-icon a');
    const closeCart = document.querySelector('.close-cart');
    const checkoutCart = document.querySelector('.checkout-btn');
    const shopMoreCart = document.querySelector('.shop-more-btn');

    if (cartIcon && cartItems) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            cartItems.classList.add('active');
            overlay.classList.remove('show');
            favoritesModal?.classList.remove('active');
            navMenu?.classList.remove('active');
            suggestionsContainer?.classList.remove('show');
            updateCart();
            localStorage.setItem('cartOpen', 'true');
            localStorage.setItem('favoritesOpen', 'false');
            localStorage.setItem('menuOpen', 'false');
            localStorage.setItem('searchOpen', 'false');
            window.location.href = '../pages/ProceedToBuy.html';
        });
    }

    if (closeCart && cartItems) {
        closeCart.addEventListener('click', (e) => {
            e.stopPropagation();
            cartItems.classList.remove('active');
            overlay.classList.remove('show');
            localStorage.setItem('cartOpen', 'false');
        });
    }

    if (shopMoreCart && cartItems) {
        shopMoreCart.addEventListener('click', (e) => {
            e.stopPropagation();
            cartItems.classList.remove('active');
            overlay.classList.remove('show');
            localStorage.setItem('cartOpen', 'false');
        });
    }

    if (checkoutCart && cartItems) {
        checkoutCart.addEventListener('click', (e) => {
            e.stopPropagation();
            cartItems.classList.remove('active');
            overlay.classList.remove('show');
            localStorage.setItem('cartOpen', 'false');
            window.location.href = '../pages/Checkoutdetails.html';
        });
    }

    if (cartItems) {
        document.addEventListener('click', (e) => {
            if (!cartIcon?.contains(e.target) && !closeCart?.contains(e.target) && !cartItems.contains(e.target) && !document.getElementById('add-to-cart')?.contains(e.target) && !document.getElementById('buy-now')?.contains(e.target)) {
                cartItems.classList.remove('active');
                overlay.classList.remove('show');
                localStorage.setItem('cartOpen', 'false');
            }
        });
    }

    // Favorites handling
    const favoriteIcon = document.querySelector('.favorite-icon a');
    const closeFavorites = document.querySelector('.close-favorites');

    if (favoriteIcon && favoritesModal) {
        favoriteIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            favoritesModal.classList.add('active');
            overlay.classList.add('show');
            cartItems?.classList.remove('active');
            navMenu?.classList.remove('active');
            suggestionsContainer?.classList.remove('show');
            updateFavorites();
            localStorage.setItem('favoritesOpen', 'true');
            localStorage.setItem('cartOpen', 'false');
            localStorage.setItem('menuOpen', 'false');
            localStorage.setItem('searchOpen', 'false');
        });
    }

    if (closeFavorites && favoritesModal) {
        closeFavorites.addEventListener('click', (e) => {
            e.stopPropagation();
            favoritesModal.classList.remove('active');
            overlay.classList.remove('show');
            localStorage.setItem('favoritesOpen', 'false');
        });
    }

    if (favoritesModal) {
        document.addEventListener('click', (e) => {
            if (!favoriteIcon?.contains(e.target) && !closeFavorites?.contains(e.target) && !favoritesModal.contains(e.target)) {
                favoritesModal.classList.remove('active');
                overlay.classList.remove('show');
                localStorage.setItem('favoritesOpen', 'false');
            }
        });
    }

    // Fetch product data
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    loadProducts().then(data => {
        allProducts = data;
        const product = allProducts.find(p => p.id == productId);
        if (!product) {
            document.querySelector('.product-details').innerHTML = '<p>Product not found</p>';
            return;
        }

        // Populate product details
        const productImg = document.getElementById('product-img');
        const imagePath = product.img.startsWith('./assets/') ? product.img.replace('./assets/', '../assets/') : `../${product.img}`;
        productImg.src = imagePath || '../assets/img/Avatar.webp';
        productImg.alt = product.name;
        productImg.onerror = () => {
            productImg.src = '../assets/img/Avatar.webp';
        };

        document.getElementById('product-name').textContent = product.name;
        document.getElementById('product-price').textContent = `EGP ${product.price}`;
        document.getElementById('product-old-price').textContent = product.old_price ? `EGP ${product.old_price}` : '';
        document.getElementById('product-discount').textContent = product.old_price ? `%${Math.floor((product.old_price - product.price) / product.old_price * 100)}` : '';
        document.getElementById('product-description').textContent = product.description || 'No description available';
        document.getElementById('product-stock').textContent = product.stock ? `In Stock: ${product.stock} units` : 'Out of stock';

        // Add brand, sku, tags
        const brandElement = document.createElement('p');
        brandElement.innerHTML = `<strong>Brand:</strong> ${product.brand || 'N/A'}`;
        document.querySelector('.product-info').insertBefore(brandElement, document.getElementById('product-description'));

        const skuElement = document.createElement('p');
        skuElement.innerHTML = `<strong>SKU:</strong> ${product.sku || 'N/A'}`;
        document.querySelector('.product-info').insertBefore(skuElement, document.getElementById('product-description'));

        const tagsElement = document.createElement('p');
        tagsElement.innerHTML = `<strong>Tags:</strong> ${product.tags ? product.tags.join(', ') : 'N/A'}`;
        document.querySelector('.product-info').insertBefore(tagsElement, document.getElementById('product-description'));

        // Populate specifications
        const specsList = document.getElementById('product-specifications');
        if (product.specifications && typeof product.specifications === 'object') {
            Object.entries(product.specifications).forEach(([key, value]) => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${key}:</strong> ${value}`;
                specsList.appendChild(li);
            });
        } else {
            specsList.innerHTML = '<li>No specifications available</li>';
        }

        // Populate rating
        const ratingContainer = document.getElementById('product-rating');
        ratingContainer.innerHTML = generateStars(product.rating || 5);

        // Add to Cart functionality
        // Add to Cart functionality
        const addToCartBtn = document.getElementById('add-to-cart');
        addToCartBtn.dataset.id = product.id;
        updateCartButtonState(product.id, addToCartBtn);

        addToCartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            if (!cart.some(item => item.id == product.id)) {
                cart.push({ ...product, quantity: 1 });
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartButtonState(product.id, addToCartBtn);
                updateCartCount();
                updateCart();
                // فتح السلة وإظهار الـ overlay
                if (cartItems) {
                    cartItems.classList.add('active');
                    overlay.classList.remove('show');
                    favoritesModal?.classList.remove('active');
                    navMenu?.classList.remove('active');
                    suggestionsContainer?.classList.remove('show');
                    localStorage.setItem('cartOpen', 'true');
                    localStorage.setItem('favoritesOpen', 'false');
                    localStorage.setItem('menuOpen', 'false');
                    localStorage.setItem('searchOpen', 'false');
                }
                document.querySelectorAll(`.btn-add-cart[data-id="${product.id}"]`).forEach(btn => {
                    updateCartButtonState(product.id, btn);
                });
            }
        });

        // Buy Now functionality
        const buyNowBtn = document.getElementById('buy-now');
        if (buyNowBtn) {
            buyNowBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                if (!cart.some(item => item.id == product.id)) {
                    cart.push({ ...product, quantity: 1 });
                    localStorage.setItem('cart', JSON.stringify(cart));
                    updateCartCount();
                    updateCart();
                    updateCartButtonState(product.id, addToCartBtn);
                    document.querySelectorAll(`.btn-add-cart[data-id="${product.id}"]`).forEach(btn => {
                        updateCartButtonState(product.id, btn);
                    });
                }
                // إعادة التوجيه مباشرة دون فتح السلة أو إظهار الـ overlay
                window.location.href = '../pages/Checkoutdetails.html';
            });
        }

        // Add Favorite functionality
        const favoriteBtn = document.getElementById('favorite-btn');
        if (favoriteBtn) {
            favoriteBtn.dataset.id = product.id;
            updateFavoriteButton(product.id);
            favoriteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(product);
            });
        }

        // Load and display reviews
        const reviewsContainer = document.getElementById('reviews-list');
        const loadReviews = () => {
            const reviews = JSON.parse(localStorage.getItem(`reviews_${productId}`)) || [];
            const userData = JSON.parse(localStorage.getItem('loggedInUser')) || {};
            const currentUser = userData.name || userData.email || 'User';
            if (reviewsContainer) {
                reviewsContainer.innerHTML = '';
                reviews.forEach((review, index) => {
                    const reviewElement = document.createElement('div');
                    reviewElement.classList.add('review');
                    reviewElement.style.opacity = '0';
                    reviewElement.style.transform = 'translateY(20px)';
                    reviewElement.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    const users = JSON.parse(localStorage.getItem('users')) || [];
                    const reviewer = users.find(u => u.email === review.user || u.name === review.user) || {};
                    const reviewerName = reviewer.name || review.user || 'User';
                    const reviewerImage = reviewer.image || '../assets/img/Avatar.webp';

                    const isCurrentUserReview = review.user === currentUser || review.user === userData.email;
                    reviewElement.innerHTML = `
                        <div class="review-header">
                            <img src="${reviewerImage}" alt="${reviewerName}" class="review-user-img">
                            <span class="review-user">${reviewerName}</span>
                            <div class="review-stars">${generateStars(review.rating)}</div>
                        </div>
                        <p class="review-text">${review.text}</p>
                        <p class="review-date">Posted on: ${new Date(review.timestamp || Date.now()).toLocaleDateString()}</p>
                        ${isCurrentUserReview ? `
                            <div class="review-actions">
                                <button class="edit-review-btn" data-index="${index}"><i class="fa-solid fa-edit"></i> Edit</button>
                                <button class="delete-review-btn" data-index="${index}"><i class="fa-solid fa-trash"></i> Delete</button>
                            </div>
                        ` : ''}
                    `;
                    reviewsContainer.appendChild(reviewElement);
                    setTimeout(() => {
                        reviewElement.style.opacity = '1';
                        reviewElement.style.transform = 'translateY(0)';
                    }, index * 100);
                });

                document.querySelectorAll('.edit-review-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const index = e.target.dataset.index;
                        const reviews = JSON.parse(localStorage.getItem(`reviews_${productId}`)) || [];
                        const review = reviews[index];
                        document.getElementById('review-rating').value = review.rating;
                        document.getElementById('review-text').value = review.text;
                        document.getElementById('review-form').dataset.editIndex = index;
                        document.getElementById('review-form').querySelector('button[type="submit"]').textContent = 'Update Review';
                    });
                });

                document.querySelectorAll('.delete-review-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this review?')) {
                            const index = e.target.dataset.index;
                            const reviews = JSON.parse(localStorage.getItem(`reviews_${productId}`)) || [];
                            reviews.splice(index, 1);
                            localStorage.setItem(`reviews_${productId}`, JSON.stringify(reviews));
                            loadReviews();
                        }
                    });
                });
            }
        };

        // Handle review submission
        const reviewForm = document.getElementById('review-form');
        if (reviewForm) {
            reviewForm.addEventListener('submit', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isLoggedIn()) {
                    window.location.href = `../pages/Login.html?redirect=product_details.html?id=${productId}`;
                    return;
                }
                const userData = JSON.parse(localStorage.getItem('loggedInUser'));
                const user = userData.name || 'User';
                const rating = parseInt(document.getElementById('review-rating').value);
                const text = document.getElementById('review-text').value.trim();
                if (text && rating > 0) {
                    const reviews = JSON.parse(localStorage.getItem(`reviews_${productId}`)) || [];
                    if (reviewForm.dataset.editIndex) {
                        const index = parseInt(reviewForm.dataset.editIndex);
                        reviews[index] = { user, rating, text, timestamp: reviews[index].timestamp };
                        localStorage.setItem(`reviews_${productId}`, JSON.stringify(reviews));
                        delete reviewForm.dataset.editIndex;
                        reviewForm.querySelector('button[type="submit"]').textContent = 'Submit Review';
                        alert('Review updated successfully!');
                    } else {
                        reviews.push({ user, rating, text, timestamp: Date.now() });
                        localStorage.setItem(`reviews_${productId}`, JSON.stringify(reviews));
                        alert('Review submitted successfully!');
                    }
                    loadReviews();
                    reviewForm.reset();
                } else {
                    alert('Please provide a rating and review text.');
                }
            });
        }

        // Load related products
        const relatedProductsContainer = document.getElementById('related-products-swiper');
        if (relatedProductsContainer) {
            const relatedProducts = allProducts.filter(p => p.id != productId && hasCommonCategory(p.category, product.category)).slice(0, 6);
            relatedProducts.forEach(p => {
                const discount = (p.old_price && p.old_price > p.price) ? `%${Math.floor((p.old_price - p.price) / p.old_price * 100)}` : '';
                const slide = document.createElement('div');
                slide.classList.add('swiper-slide');
                slide.innerHTML = `
                    <div class="product">
                        ${discount ? `<span class="sale-present">${discount}</span>` : ''}
                        <div class="img-product">
                            <a href="product_details.html?id=${p.id}">
                                <img src="${p.img.startsWith('./assets/') ? p.img.replace('./assets/', '../assets/') : `../${p.img}`}" alt="${p.name}">
                            </a>
                        </div>
                        <div class="stars">${generateStars(p.rating || 5)}</div>
                        <h4 class="name-product"><a href="product_details.html?id=${p.id}">${p.name}</a></h4>
                        <div class="price">
                            <span>EGP ${p.price}</span>
                            <p class="old-price">${p.old_price ? `EGP ${p.old_price}` : ''}</p>
                        </div>
                        <div class="icons">
                            <span class="btn-add-cart" data-id="${p.id}"><i class="fa-solid fa-cart-shopping"></i> Add to Cart</span>
                            <span class="icon-product" data-id="${p.id}"><i class="fa-regular fa-heart"></i></span>
                        </div>
                    </div>
                `;
                relatedProductsContainer.appendChild(slide);
                updateCartButtonState(p.id, slide.querySelector('.btn-add-cart'));
                updateFavoriteButton(p.id);
            });

            // Initialize Swiper for related products
            new Swiper('.related-products-swiper', {
                slidesPerView: 4,
                spaceBetween: 20,
                loop: relatedProducts.length >= 4,
                loopedSlides: relatedProducts.length >= 4 ? 4 : relatedProducts.length,
                speed: 1300,
                autoplay: {
                    delay: 3000,
                    disableOnInteraction: false,
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                breakpoints: {
                    1200: { slidesPerView: Math.min(relatedProducts.length, 4), spaceBetween: 20 },
                    992: { slidesPerView: Math.min(relatedProducts.length, 4), spaceBetween: 20 },
                    768: { slidesPerView: Math.min(relatedProducts.length, 3), spaceBetween: 15 },
                    508: { slidesPerView: Math.min(relatedProducts.length, 2), spaceBetween: 10 },
                    0: { slidesPerView: 1, spaceBetween: 5 }
                }
            });

            // Add to cart for related products
            document.querySelectorAll('.related-products-swiper .btn-add-cart').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const id = btn.getAttribute('data-id');
                    const productToAdd = allProducts.find(p => p.id == id);
                    let cart = JSON.parse(localStorage.getItem('cart')) || [];
                    if (!cart.some(item => item.id == id)) {
                        cart.push({ ...productToAdd, quantity: 1 });
                        localStorage.setItem('cart', JSON.stringify(cart));
                        updateCartButtonState(id, btn);
                        updateCartCount();
                        updateCart();
                        document.querySelectorAll(`.btn-add-cart[data-id="${id}"]`).forEach(otherBtn => {
                            updateCartButtonState(id, otherBtn);
                        });
                        if (cartItems) {
                            cartItems.classList.add('active');
                            overlay.classList.remove('show');
                            favoritesModal?.classList.remove('active');
                            navMenu?.classList.remove('active');
                            suggestionsContainer?.classList.remove('show');
                            localStorage.setItem('cartOpen', 'true');
                            localStorage.setItem('favoritesOpen', 'false');
                            localStorage.setItem('menuOpen', 'false');
                            localStorage.setItem('searchOpen', 'false');
                        }
                    }
                });
            });

            // Add to favorites for related products
            document.querySelectorAll('.related-products-swiper .icon-product').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const id = btn.getAttribute('data-id');
                    const productToAdd = allProducts.find(p => p.id == id);
                    toggleFavorite(productToAdd);
                });
            });
        }

        // Update cart items display
        const updateCart = () => {
            const cartItemsContainer = document.getElementById('cart-items');
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            if (cartItemsContainer) {
                cartItemsContainer.innerHTML = '';
                let total = 0;
                cart.forEach((item, index) => {
                    total += item.price * item.quantity;
                    const imagePath = item.img.startsWith('./assets/') ? item.img.replace('./assets/', '../assets/') : `../${item.img}`;
                    const cartItem = document.createElement('div');
                    cartItem.classList.add('cart-item');
                    cartItem.innerHTML = `
                        <img src="${imagePath}" alt="${item.name}">
                        <div class="cart-item-info">
                            <h4><a href="product_details.html?id=${item.id}">${item.name}</a></h4>
                            <p>EGP ${item.price} x ${item.quantity}</p>
                            <div class="quantity-control">
                                <button class="decrease-quantity" data-index="${index}">-</button>
                                <span class="quantity">${item.quantity}</span>
                                <button class="increase-quantity" data-index="${index}">+</button>
                            </div>
                        </div>
                        <button class="delete-cart-item" data-index="${index}"><i class="fa-solid fa-trash-can"></i></button>
                    `;
                    cartItemsContainer.appendChild(cartItem);
                });

                document.querySelectorAll('.delete-cart-item').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const index = e.target.closest('button').dataset.index;
                        let cart = JSON.parse(localStorage.getItem('cart')) || [];
                        const removedProduct = cart.splice(index, 1)[0];
                        localStorage.setItem('cart', JSON.stringify(cart));
                        updateCart();
                        updateCartCount();
                        document.querySelectorAll(`.btn-add-cart[data-id="${removedProduct.id}"]`).forEach(otherBtn => {
                            updateCartButtonState(removedProduct.id, otherBtn);
                        });
                        if (document.getElementById('add-to-cart').dataset.id === removedProduct.id) {
                            updateCartButtonState(removedProduct.id, document.getElementById('add-to-cart'));
                        }
                    });
                });

                document.querySelectorAll('.increase-quantity').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const index = btn.dataset.index;
                        let cart = JSON.parse(localStorage.getItem('cart')) || [];
                        cart[index].quantity += 1;
                        localStorage.setItem('cart', JSON.stringify(cart));
                        updateCart();
                        updateCartCount();
                    });
                });

                document.querySelectorAll('.decrease-quantity').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const index = btn.dataset.index;
                        let cart = JSON.parse(localStorage.getItem('cart')) || [];
                        if (cart[index].quantity > 1) {
                            cart[index].quantity -= 1;
                        } else {
                            cart.splice(index, 1);
                        }
                        localStorage.setItem('cart', JSON.stringify(cart));
                        updateCart();
                        updateCartCount();
                        if (cart[index]) {
                            document.querySelectorAll(`.btn-add-cart[data-id="${cart[index].id}"]`).forEach(otherBtn => {
                                updateCartButtonState(cart[index].id, otherBtn);
                            });
                            if (document.getElementById('add-to-cart').dataset.id === cart[index].id) {
                                updateCartButtonState(cart[index].id, document.getElementById('add-to-cart'));
                            }
                        }
                    });
                });

                document.querySelector('.price-cart-total').textContent = `EGP ${Number(total).toLocaleString('en-EG')}`;
                document.querySelector('.count-items-cart').textContent = cart.length;
            }
        };

        // Update favorites items display
        function updateFavorites() {
            const favoritesItems = document.getElementById('favorites-items');
            if (!favoritesItems) return;

            let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            if (favorites.length === 0) {
                favoritesItems.innerHTML = `
                    <div class="empty-favorites">
                        <svg data-icon="icon-favorite" width="56" height="56" viewBox="0 0 24 24" class="fkcart-icon-favorite" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"></path>
                        </svg>
                        <p>Your Favorites List is Empty</p>
                        <p>Add your favorite products from BuySpot</p>
                        <a href="./index.html" class="btn shop-now-btn">Shop Now</a>
                    </div>
                `;
                return;
            }

            favoritesItems.innerHTML = "";
            favorites.forEach((item, index) => {
                const imagePath = item.img.startsWith('./assets/')
                    ? item.img.replace('./assets/', '../assets/')
                    : `../${item.img}`;
                favoritesItems.innerHTML += `
                    <div class="item-favorite">
                        <img src="${imagePath}" alt="">
                        <div class="content">
                            <p class="name-product"><a href="../pages/product_details.html?id=${item.id}"><h4>${item.name}</h4></a></p>
                            <p class="price">EGP ${item.price}</p>
                            <span class="icon-product active" data-id="${item.id}"><i class="fa-solid fa-heart active"></i></span>
                        </div>
                        <button class="delete-favorite" data-index="${index}"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                `;
            });

            document.querySelectorAll('.delete-favorite').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const index = e.target.closest('button').getAttribute('data-index');
                    deleteFromFavorites(index);
                });
            });

            document.querySelectorAll('.item-favorite .icon-product').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const productId = e.target.closest('.icon-product').getAttribute('data-id');
                    deleteFromFavorites(favorites.findIndex(item => item.id == productId));
                });
            });
        }

        // Initial updates
        updateCartCount();
        updateFavoriteCount();
        updateCart();
        updateFavorites();
        loadReviews();
    }).catch(err => {
        document.querySelector('.product-details').innerHTML = '<p>Error loading product data</p>';
        console.error('❌ Error loading product data:', err);
    });
});
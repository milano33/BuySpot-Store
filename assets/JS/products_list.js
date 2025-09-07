"use strict";

document.addEventListener('DOMContentLoaded', () => {
    // Products container
    const container = document.getElementById('products-container');
    if (!container) {
        console.error('❌ Products container not found');
        return;
    }

    // Search and filter elements
    const searchBox = document.querySelector("header .top-header .container .search-box");
    const searchInput = searchBox?.querySelector(".search") || document.getElementById('search');
    const searchForm = document.getElementById('searchForm');
    const categorySelect = document.getElementById('category');
    const suggestionsContainer = document.createElement("div");
    suggestionsContainer.classList.add("suggestions");
    if (searchInput) {
        searchInput.parentNode.appendChild(suggestionsContainer);
    }

    // Overlay for search
    const overlay = document.createElement('div');
    overlay.classList.add('search-overlay');
    document.body.appendChild(overlay);

    // Filter and pagination containers
    const filterContainer = document.createElement('div');
    filterContainer.classList.add('filter-container');
    container.parentNode.insertBefore(filterContainer, container);

    const paginationContainer = document.createElement('div');
    paginationContainer.classList.add('pagination-container');
    container.parentNode.appendChild(paginationContainer);

    // Loading spinner
    const loadingSpinner = document.createElement('div');
    loadingSpinner.classList.add('loading-spinner');
    loadingSpinner.innerHTML = '<div class="spinner"></div>';
    container.parentNode.insertBefore(loadingSpinner, container);

    // CSS styles
    const style = document.createElement('style');
    style.innerHTML = `
        .filter-container { display: flex; flex-wrap: wrap; gap: 12px; margin: 25px 0px 15px; align-items: center; padding: 15px; border-radius: 8px; }
        .filter-container select, .filter-container input { padding: 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 15px; background: #fff; transition: border-color 0.3s ease; min-height: 36px; min-width: 80px; touch-action: manipulation; }
        .filter-container select:focus, .filter-container input:focus { border-color: #007bff; outline: none; }
        .filter-container button { padding: 10px 20px; min-height: 36px; background: linear-gradient(45deg, #007bff, #00c4ff); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 15px; transition: transform 0.2s, box-shadow 0.2s; touch-action: manipulation; }
        .filter-container button:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,123,255,0.3); }
        .filter-container .input-wrapper { display: flex; align-items: center; gap: 8px; }
        .filter-container .input-wrapper i { font-size: 16px; color: #555; }
        .filter-container .checkbox-wrapper { display: flex; align-items: center; gap: 4px; }
        .filter-container .checkbox-wrapper input { width: 14px; height: 14px; margin: 0; }
        .filter-container .checkbox-wrapper label { font-size: 15px; font-weight: 500; white-space: nowrap; }
        .pagination-container { display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 30px; margin-bottom: 15px; padding: 8px; }
        .pagination-container button { padding: 10px 20px; min-height: 40px; border: none; background: linear-gradient(45deg, #007bff, #00c4ff); color: white; cursor: pointer; border-radius: 6px; font-size: 15px; transition: transform 0.2s, box-shadow 0.2s; touch-action: manipulation; }
        .pagination-container button:disabled { background: #ccc; cursor: not-allowed; opacity: 0.5; }
        .pagination-container button:not(:disabled):hover { transform: scale(1.05); box-shadow: 0 4px 10px rgba(0,123,255,0.3); }
        .pagination-container span { font-size: 15px; color: #333; font-weight: 500; }
        .product { position: relative; transition: transform 0.3s ease, box-shadow 0.3s ease; background: #fff; border-radius: 8px; padding: 10px; }
        .product:hover { transform: translateY(-5px); box-shadow: 0 6px 12px rgba(0,0,0,0.1); }
        .suggestions { display: none; position: absolute; top: 100%; left: 0; width: 100%; background: #fff; border: 1px solid #ddd; border-radius: 8px; margin-top: 8px; box-shadow: 0 6px 12px rgba(0,0,0,0.15); max-height: 300px; overflow-y: auto; z-index: 1000; opacity: 0; transform: translateY(-10px); transition: opacity 0.3s ease, transform 0.3s ease; }
        .suggestions.show { display: block; opacity: 1; transform: translateY(0); }
        .suggestions div { padding: 12px 15px; cursor: pointer; font-size: 15px; color: #333; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #f0f0f0; }
        .suggestions div:hover { background: #f5f7fa; }
        .suggestions div img { width: 35px; height: 35px; object-fit: cover; border-radius: 6px; }
        .suggestions .suggested-term { color: #007bff; font-style: italic; }
        .suggestions .suggested-term::before { content: 'Suggested: '; color: #555; font-style: normal; font-size: 13px; }
        .search-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 900; transition: opacity 0.3s ease; }
        .search-overlay.show { display: block; opacity: 1; }
        .icon-product { transition: transform 0.2s ease; }
        .loading-spinner { display: none; text-align: center; padding: 20px; }
        .spinner { margin: 50vh auto; width: 50px; height: 50px; border-radius: 50%; border: 10px solid #e8e8e8; border-top: 8px solid #f47600; animation: spin 1.2s infinite linear; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @media (max-width: 768px) {
            .filter-container { flex-wrap: wrap; gap: 12px; padding: 12px; overflow-x: auto; }
            .filter-container select, .filter-container input, .filter-container button { padding: 8px; font-size: 14px; min-width: 80px; min-height: 36px; }
            .filter-container .checkbox-wrapper input { width: 14px; height: 14px; }
            .filter-container .checkbox-wrapper label { font-size: 14px; font-weight: 500; white-space: nowrap; }
            .pagination-container { gap: 12px; padding: 6px; }
            .pagination-container button { padding: 8px 16px; min-height: 36px; font-size: 14px; }
            .pagination-container span { font-size: 14px; }
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


    // Pagination settings
    const itemsPerPage = 12;
    let currentPage = 1;
    let productsData = []; // Store products globally

    // Levenshtein Distance for spell correction
    function levenshteinDistance(a, b) {
        const matrix = Array(b.length + 1).fill().map(() => Array(a.length + 1).fill(0));
        for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
        for (let j = 1; j <= b.length; j++) {
            for (let i = 1; i <= a.length; i++) {
                const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1, // deletion
                    matrix[j - 1][i] + 1, // insertion
                    matrix[j - 1][i - 1] + indicator // substitution
                );
            }
        }
        return matrix[b.length][a.length];
    }

    // Spell correction suggestions
    function getSpellingSuggestions(query, terms, maxDistance = 3) {
        return terms
            .map(term => ({ term, distance: levenshteinDistance(query, term.toLowerCase()) }))
            .filter(item => item.distance <= maxDistance && item.distance > 0)
            .sort((a, b) => a.distance - b.distance)
            .map(item => item.term)
            .slice(0, 3);
    }

    // Generate star ratings
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

    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Fuzzy match for autocomplete (with Arabic support)
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

    // Simple translation map for Arabic to English
    const arabicToEnglishMap = {
        'آيفون': 'iPhone',
        'لاب توب': 'Laptop',
        'سماعات': 'Headphones',
        'ساعة ذكية': 'Smartwatch',
        'تلفزيون': 'TV',
        'كاميرا': 'Camera',
        'العاب': 'Gaming',
        'تابلت': 'Tablet',
        'سماعة': 'Speaker',
        'شاحن': 'Charger',
        'عطر': 'Perfume',
        'عناية بالبشرة': 'Skincare',
        'مطبخ': 'Kitchen',
        'ملابس': 'Clothing',
        'منزل': 'Home',
        'العاب اطفال': 'Toys',
        'كتب': 'Books'
    };



    // Normalize category
    function normalizeCategory(cat) {
        return cat.toLowerCase().replace(/\s+/g, '-');
    }

    // Load products from JSON
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

    // Cache search results
    function cacheSearchResults(query, category, results) {
        const cache = { query, category, results, timestamp: Date.now() };
        localStorage.setItem('search_results_cache', JSON.stringify(cache));
    }

    // Load cached search results
    function loadCachedSearchResults(query, category) {
        const cache = JSON.parse(localStorage.getItem('search_results_cache'));
        if (cache && cache.query === query && cache.category === category && (Date.now() - cache.timestamp) < 24 * 60 * 60 * 1000) {
            return cache.results;
        }
        return null;
    }

    // Add product to cart
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
    }, 300);
    // Toggle favorite with debounce
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
                btn.style.transition = 'transform 0.2s ease';
                btn.style.transform = existingItem ? 'scale(1)' : 'scale(1.2)';
                setTimeout(() => { btn.style.transform = 'scale(1)'; }, 200);
            }
        });
        updateCounts();
        if (typeof window.updateFavorites === 'function') {
            window.updateFavorites();
        }
    }, 300);

    // Update cart and favorites counts
    function updateCounts() {
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
    }

    // Categories and containers
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
            acc[category] = element;
        }
        return acc;
    }, {});

    // Render filters
    function renderFilters() {
        filterContainer.innerHTML = `
            <div class="input-wrapper">
                <i class="fa-solid fa-dollar-sign"></i>
                <input type="number" id="min-price" placeholder="Min Price" min="0">
            </div>
            <div class="input-wrapper">
                <i class="fa-solid fa-dollar-sign"></i>
                <input type="number" id="max-price" placeholder="Max Price" min="0">
            </div>
            <select id="sort-by">
                <option value="default">Default Sorting</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Rating: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
            </select>
            <select id="brand-filter">
                <option value="">All Brands</option>
            </select>
            <div class="checkbox-wrapper">
                <input type="checkbox" id="in-stock">
                <label for="in-stock">In Stock Only</label>
            </div>
            <button id="apply-filters"><i class="fa-solid fa-filter"></i> Apply Filters</button>
        `;
    }

    // Display products with pagination
    async function displayProducts(page = 1) {
        loadingSpinner.style.display = 'block';
        const params = new URLSearchParams(window.location.search);
        const searchTerm = params.get('search')?.toLowerCase();
        const category = params.get('category');

        const cachedResults = loadCachedSearchResults(searchTerm, category);
        let filteredProducts;

        if (cachedResults) {
            filteredProducts = cachedResults;
        } else {
            productsData = await loadProducts();
            if (productsData.length === 0) {
                container.innerHTML = '<div class="no-products"><p>خطأ في تحميل المنتجات، تأكد من وجود ملف products.json</p></div>';
                loadingSpinner.style.display = 'none';
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
                return;
            }

            filteredProducts = productsData.filter(product => {
                const matchesSearch = searchTerm
                    ? product.name.toLowerCase().includes(searchTerm) ||
                    (product.description && product.description.toLowerCase().includes(searchTerm))
                    : true;
                const matchesCategory = category && category !== 'All Categories'
                    ? product.category.includes(categoryMap[category] || category.toLowerCase())
                    : true;
                return matchesSearch && matchesCategory;
            });

            cacheSearchResults(searchTerm, category, filteredProducts);
        }

        // Populate brand filter
        const brands = [...new Set(productsData.map(product => product.brand))];
        const brandFilter = document.getElementById('brand-filter');
        if (brandFilter) {
            brandFilter.innerHTML = '<option value="">All Brands</option>' + brands.map(brand => `<option value="${brand}">${brand}</option>`).join('');
        }

        // Apply filters
        const sortBy = document.getElementById('sort-by')?.value || 'default';
        const minPrice = parseFloat(document.getElementById('min-price')?.value) || 0;
        const maxPrice = parseFloat(document.getElementById('max-price')?.value) || Infinity;
        const brand = document.getElementById('brand-filter')?.value || '';
        const inStock = document.getElementById('in-stock')?.checked || false;

        let finalProducts = filteredProducts.filter(product => {
            const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
            const matchesBrand = brand ? product.brand === brand : true;
            const matchesStock = inStock ? product.stock > 0 : true;
            return matchesPrice && matchesBrand && matchesStock;
        });

        // Special handling for Today's Deals
        if (category === 'hot_deals') {
            finalProducts = finalProducts
                .filter(product => product.old_price !== null)
                .sort((a, b) => {
                    const salesA = a.sales_count || 0;
                    const salesB = b.sales_count || 0;
                    if (salesA !== salesB) return salesB - salesA;
                    const discountA = a.old_price ? (a.old_price - a.price) / a.old_price * 100 : 0;
                    const discountB = b.old_price ? (b.old_price - b.price) / b.old_price * 100 : 0;
                    return discountB - discountA;
                });
        } else {
            if (sortBy === 'price-asc') {
                finalProducts.sort((a, b) => a.price - b.price);
            } else if (sortBy === 'price-desc') {
                finalProducts.sort((a, b) => b.price - a.price);
            } else if (sortBy === 'rating-desc') {
                finalProducts.sort((a, b) => b.rating - a.rating);
            } else if (sortBy === 'name-asc') {
                finalProducts.sort((a, b) => a.name.localeCompare(b.name));
            }
        }

        // Pagination
        const totalPages = Math.ceil(finalProducts.length / itemsPerPage);
        currentPage = page > totalPages ? totalPages : page;
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedProducts = finalProducts.slice(start, end);

        loadingSpinner.style.display = 'none';
        if (paginatedProducts.length === 0) {
            container.innerHTML = '<div class="no-products"><p>لا توجد منتجات مطابقة 😕</p><a href="products_list.html?category=hot_deals" class="btn">عروض اليوم</a></div>';
            renderPagination(totalPages);
            return;
        }

        container.innerHTML = '';
        paginatedProducts.forEach(product => {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            const isInCart = cart.some(cartItem => cartItem.id == product.id);
            const isInFavorites = favorites.some(favItem => favItem.id == product.id);
            const percentDisc = product.old_price
                ? `<span class="sale-present">%${Math.floor((product.old_price - product.price) / product.old_price * 100)}</span>`
                : '';
            const oldPrice = product.old_price ? `<p class="old-price">EGP ${product.old_price}</p>` : '';
            const imagePath = product.img && (product.img.toLowerCase().includes('assets/') || product.img.toLowerCase().includes('assets/'))
                ? product.img.replace(/assets\//i, window.location.pathname.includes('pages/') ? '../assets/' : 'assets/')
                : product.img.startsWith('http') ? product.img : '';
            const isNew = product.tags?.includes('new') ? '<span class="badge-new">New</span>' : '';

            container.innerHTML += `
                <div class="product">
                    ${percentDisc}
                    ${isNew}
                    <div class="img-product">
                        <a href="product_details.html?id=${product.id}">
                            ${imagePath ? `<img src="${imagePath}" alt="${product.name}" loading="lazy" onerror="this.style.display='none'">` : `<div class="no-image">No Image Available</div>`}
                        </a>
                    </div>
                    <div class="stars">
                        ${generateStars(product.rating || 5)}
                    </div>
                    <p class="name-product"><a href="product_details.html?id=${product.id}">${product.name}</a></p>
                    <div class="price">
                        <p><span>EGP ${product.price}</span></p>
                        ${oldPrice}
                    </div>
                    <div class="icons">
                        <button class="btn-add-cart ${isInCart ? 'active' : ''}" data-id="${product.id}" ${isInCart ? 'disabled' : ''}>
                            <i class="fa-solid fa-cart-shopping"></i> ${isInCart ? 'Item in cart' : 'Add to cart'}
                        </button>
                        <span class="icon-product ${isInFavorites ? 'active' : ''}" data-id="${product.id}">
                            <i class="fa-${isInFavorites ? 'solid' : 'regular'} fa-heart ${isInFavorites ? 'active' : ''}"></i>
                        </span>
                    </div>
                </div>
            `;
        });

        renderPagination(totalPages);
    }

    // Render pagination
    function renderPagination(totalPages) {
        paginationContainer.innerHTML = `
            <button id="prev-page" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
            <span>Page ${currentPage} of ${totalPages}</span>
            <button id="next-page" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
        `;

        document.getElementById('prev-page')?.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayProducts(currentPage);
                window.scrollTo({ top: container.offsetTop, behavior: 'smooth' });
            }
        });

        document.getElementById('next-page')?.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                displayProducts(currentPage);
                window.scrollTo({ top: container.offsetTop, behavior: 'smooth' });
            }
        });
    }

    // Search autocomplete with spell correction
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

    // Search form submission
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            const selectedCategory = categorySelect.value;
            if (query) {
                if (selectedCategory === 'All Categories') {
                    window.location.href = `index.html?search=${encodeURIComponent(query)}`;
                } else {
                    window.location.href = `pages/products_list.html?search=${encodeURIComponent(query)}&category=${encodeURIComponent(selectedCategory)}`;
                }
            }
        });
    }

    // Handle Today's Deals link
    const todaysDealsLink = document.querySelector('.nav-category-list a[href="#hotDeals"]');
    if (todaysDealsLink) {
        todaysDealsLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = `${window.location.pathname.includes("pages/") ? "../" : ""}pages/products_list.html?category=hot_deals`;
        });
    }

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

    // Populate category slides
    function populateCategorySlide(category, container, data) {
        let products;
        if (category === 'hot_deals') {
            products = data.filter(product => product.old_price !== null);
        } else {
            products = data.filter(product => product.category.includes(category));
        }
        container.innerHTML = '';
        if (products.length === 0) {
            container.innerHTML = `
                <div class="error-message">
                    <p>لا توجد منتجات في هذا القسم</p>
                </div>
            `;
            // console.warn(` No products found for category: ${category}`);
            return;
        }
        products.forEach(product => {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            const isInCart = cart.some(cartItem => cartItem.id == product.id);
            const isInFavorites = favorites.some(favItem => favItem.id == product.id);
            const percentDisc = product.old_price
                ? `<span class="sale-present">%${Math.floor((product.old_price - product.price) / product.old_price * 100)}</span>`
                : '';
            const imagePath = product.img && (product.img.toLowerCase().includes('assets/') || product.img.toLowerCase().includes('assets/'))
                ? product.img.replace(/assets\//i, window.location.pathname.includes('pages/') ? '../assets/' : 'assets/')
                : product.img.startsWith('http') ? product.img : '';
            container.innerHTML += `
                <div class="swiper-slide">
                    <div class="product">
                        ${percentDisc}
                        <div class="img-product">
                            <a href="product_details.html?id=${product.id}">
                                ${imagePath ? `<img src="${imagePath}" alt="${product.name}" loading="lazy" onerror="this.style.display='none'">` : `<div class="no-image">No Image Available</div>`}
                            </a>
                        </div>
                        <div class="stars">
                            ${generateStars(product.rating || 5)}
                        </div>
                        <p class="name-product"><a href="product_details.html?id=${product.id}">${product.name}</a></p>
                        <div class="price">
                            <p><span>EGP ${product.price}</span></p>
                            ${product.old_price ? `<p class="old-price">EGP ${product.old_price}</p>` : ''}
                        </div>
                        <div class="icons">
                            <button class="btn-add-cart ${isInCart ? 'active' : ''}" data-id="${product.id}" ${isInCart ? 'disabled' : ''}>
                                <i class="fa-solid fa-cart-shopping"></i> ${isInCart ? 'Item in cart' : 'Add to cart'}
                            </button>
                            <span class="icon-product ${isInFavorites ? 'active' : ''}" data-id="${product.id}">
                                <i class="fa-${isInFavorites ? 'solid' : 'regular'} fa-heart ${isInFavorites ? 'active' : ''}"></i>
                            </span>
                        </div>
                    </div>
                </div>
            `;
        });
        // console.log(` Populated ${category} with ${products.length} products`);
    }

    // Load and populate products
    loadProducts().then(data => {
        if (data.length === 0) {
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
            return;
        }

        categories.forEach(({ category }) => {
            const container = containers[category];
            if (container) {
                populateCategorySlide(category, container, data);
            }
        });

        updateCounts();
    }).catch(err => {
        // console.error(' Error loading products:', err);
    });

    // Apply filters
    function applyFilters() {
        currentPage = 1;
        displayProducts(1);
    }

    // Initialize
    renderFilters();
    updateCounts();
    displayProducts();

    // Event listener for Apply Filters
    document.getElementById('apply-filters')?.addEventListener('click', applyFilters);

    // Listen for storage changes
    window.addEventListener('storage', updateCounts);
});
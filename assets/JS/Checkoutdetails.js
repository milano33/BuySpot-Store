"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const placeOrderBtn = document.getElementById("place-order");
    const governorateSelect = document.getElementById("Governorate");
    const citySelect = document.getElementById("billing_city");
    const shippingCostSpan = document.getElementById("shipping-cost");
    const subtotalSpan = document.getElementById("subtotal");
    const discountSpan = document.getElementById("discount");
    const totalSpan = document.getElementById("total-checkout");
    const couponInput = document.getElementById("coupon");
    const couponMsg = document.getElementById("coupon-msg");
    const checkoutItems = document.getElementById("checkout_items");
    const countItemHeader = document.querySelector(".count_item_header");
    const checkoutForm = document.getElementById("checkout-form");

    // Valid coupons
    const validCoupons = {
        "SAVE10": 0.10,
        "SAVE20": 0.20
    };

    const FREE_SHIPPING_LIMIT = 1400;

    // Define regions and centers for each governorate in Arabic
    const governorateCities = {
        "القاهرة": ["مدينة نصر", "المعادي", "هليوبوليس", "القاهرة الجديدة", "6 أكتوبر", "شبرا", "الزمالك", "الدقي", "العجوزة", "مدينتي", "الرحاب", "السيدة زينب", "النزهة", "عين شمس", "المقطم"],
        "الجيزة": ["6 أكتوبر", "الشيخ زايد", "الدقي", "المهندسين", "إمبابة", "الهرم", "فيصل", "الوراق", "بولاق الدكرور", "العياط", "البدرشين", "الحوامدية", "أوسيم", "كرداسة"],
        "الاسكندرية": ["ميامي", "سيدي جابر", "سموحة", "سبورتنج", "سان ستيفانو", "المنتزه", "السيوف", "العجمي", "الدخيلة", "المندرة", "أبو قير", "الرمل", "الإبراهيمية", "لوران"],
        "أسوان": ["مدينة أسوان", "كوم أمبو", "إدفو", "أبو سمبل", "نصر النوبة", "كلابشة", "دراو", "البصيلية", "الرديسية", "السباعية"],
        "أسيوط": ["مدينة أسيوط", "أبو تيج", "منفلوط", "ديروط", "القوصية", "أبنوب", "الفتح", "ساحل سليم", "البداري", "صدفا", "الغنايم"],
        "بحيرة": ["دمنهور", "كفر الدوار", "رشيد", "إدكو", "أبو المطامير", "أبو حمص", "الدلنجات", "المحمودية", "الرحمانية", "إيتاي البارود", "حوش عيسى", "شبراخيت", "كوم حمادة", "بدر"],
        "بني سويف": ["مدينة بني سويف", "ناصر", "ببا", "الفشن", "الواسطى", "إهناسيا", "سمسطا"],
        "دقهلية": ["المنصورة", "طلخا", "ميت غمر", "دكرنس", "أجا", "السنبلاوين", "بلقاس", "شربين", "منية النصر", "ميت سلسيل", "جمصة", "المنزلة", "بني عبيد", "تمي الأمديد", "الكردي"],
        "دمياط": ["مدينة دمياط", "دمياط الجديدة", "رأس البر", "كفر سعد", "فارسكور", "الزرقا", "كفر البطيخ", "السرو"],
        "فيوم": ["مدينة الفيوم", "سنورس", "طامية", "إبشواي", "يوسف الصديق", "أطسا"],
        "الغربية": ["طنطا", "المحلة الكبرى", "كفر الزيات", "زفتى", "سمنود", "بسيون", "السنطة", "قطور"],
        "الإسماعيلية": ["مدينة الإسماعيلية", "فايد", "القنطرة شرق", "القنطرة غرب", "التل الكبير", "أبو صوير", "القصاصين"],
        "كفر الشيخ": ["مدينة كفر الشيخ", "دسوق", "فوه", "بلتيم", "الرياض", "سيدي سالم", "قلين", "الحامول", "بيلا", "مطوبس"],
        "الأقصر": ["مدينة الأقصر", "إسنا", "أرمنت", "القرنة", "الطود", "الزينية", "البياضية"],
        "مطروح": ["مرسى مطروح", "سيوة", "العلمين", "الضبعة", "الحمام", "النجيلة", "سيدي براني", "السلوم"],
        "منيا": ["مدينة المنيا", "ملوي", "سمالوط", "مطاي", "بني مزار", "مغاغة", "أبو قرقاص", "دير مواس", "العدوة"],
        "المنوفية": ["شبين الكوم", "منوف", "أشمون", "قويسنا", "الباجور", "بركة السبع", "تلا", "الشهداء", "سرس الليان"],
        "الوادي الجديد": ["الخارجة", "الداخلة", "الفرافرة", "باريس", "بلاط"],
        "شمال سيناء": ["العريش", "الشيخ زويد", "رفح", "بئر العبد", "الحسنة", "نخل"],
        "بورسعيد": ["مدينة بورسعيد", "بورسفود", "المناخ", "الدواوين", "الشرق", "الضواحي", "الزهور"],
        "قليوبية": ["بنها", "قليوب", "شبرا الخيمة", "مدينة العبور", "الخانكة", "كفر شكر", "القناطر الخيرية", "شبين القناطر", "طوخ"],
        "قنا": ["مدينة قنا", "قفط", "قوص", "نجع حمادي", "دشنا", "أبو تشت", "نقادة", "الوقف", "فرشوط"],
        "البحر الأحمر": ["الغردقة", "سفاجا", "مرسى علم", "القصير", "رأس غارب", "شلاتين", "حلايب"],
        "الشرقية": ["أبو حماد", "أبو كبير", "مدينة العاشر من رمضان", "الإبراهيمية", "أولاد صقر", "بلبيس", "درب نجم", "القرين", "فاقوس", "ههيا", "الحسينية", "كفر صقر", "مشتول السوق", "منيا القمح", "القنايات", "الزقازيق", "ديرب نجم", "الصالحية الجديدة", "العزيزية", "كفر الحمام"],
        "سوهاج": ["مدينة سوهاج", "أخميم", "جرجا", "طهطا", "المراغة", "المنشأة", "البلينا", "دار السلام", "ساقلتة", "طما", "جهينة", "الكوثر"],
        "جنوب سيناء": ["شرم الشيخ", "دهب", "نويبع", "طابا", "رأس سدر", "أبو رديس", "أبو زنيمة", "سانت كاترين"],
        "السويس": ["مدينة السويس", "الأربعين", "عطاكة", "فيصل", "الجناين"]
    };

    // Load user data from localStorage
    let loggedInUser = null;
    try {
        loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    } catch (e) {
        console.error("Error parsing loggedInUser from localStorage:", e);
    }

    if (loggedInUser && loggedInUser.email) {
        document.getElementById("first_name").value = loggedInUser.name?.split(" ")[0] || "";
        document.getElementById("last_name").value = loggedInUser.name?.split(" ")[1] || "";
        document.getElementById("email").value = loggedInUser.email || "";
        document.getElementById("phone").value = loggedInUser.phone || "";
        document.getElementById("address").value = loggedInUser.address || "";
    }

    // Load cart from localStorage
    let cart = [];
    try {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
            cart = JSON.parse(storedCart);
            if (!Array.isArray(cart)) {
                cart = [];
                console.error("Cart data is not an array, resetting to empty array.");
            }
        }
    } catch (e) {
        console.error("Error parsing cart from localStorage:", e);
        cart = [];
    }
    let subtotal = 0;

    function updateCartUI() {
        checkoutItems.innerHTML = "";
        subtotal = 0;
        let totalCount = 0;

        if (!cart || cart.length === 0) {
            checkoutItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
            subtotalSpan.textContent = "EGP 0";
            discountSpan.textContent = "EGP 0";
            shippingCostSpan.textContent = "Free";
            totalSpan.textContent = "EGP 0";
            if (countItemHeader) countItemHeader.textContent = "0";
            placeOrderBtn.classList.add("disabled");
            placeOrderBtn.disabled = true;
            return;
        }

        try {
            cart.forEach((item, index) => {
                if (!item || !item.price || !item.quantity || !item.name || !item.id || !item.img) {
                    console.warn(`Invalid cart item at index ${index}:`, item);
                    return;
                }

                const totalPriceItems = (parseFloat(item.price) * parseInt(item.quantity)) || 0;
                subtotal += totalPriceItems;
                totalCount += parseInt(item.quantity);

                const imagePath = item.img.startsWith('./assets/')
                    ? item.img.replace('./assets/', '../assets/')
                    : `../${item.img}`;

                const itemDiv = document.createElement("div");
                itemDiv.className = "item-cart";
                itemDiv.innerHTML = `
                    <div class="image_name">
                        <img src="${imagePath}" alt="${item.name}" onerror="this.src='../assets/fallback-image.jpg'">
                        <div class="content">
                            <p class="name-product"><a href="../../pages/product_details.html?id=${item.id}"><h4>${item.name}</h4></a></p>
                            <p class="price_cart">EGP ${totalPriceItems.toLocaleString('en-EG')}</p>
                            <div class="quantity_control">
                                <button class="decrease-quantity" data-index="${index}" aria-label="Decrease quantity of ${item.name}">-</button>
                                <span class="quantity">${item.quantity}</span>
                                <button class="increase-quantity" data-index="${index}" aria-label="Increase quantity of ${item.name}">+</button>
                            </div>
                        </div>
                    </div>
                    <button class="delete-item" data-index="${index}" aria-label="Remove ${item.name} from cart"><i class="fa-solid fa-trash-can"></i></button>
                `;
                checkoutItems.appendChild(itemDiv);
            });

            subtotalSpan.textContent = `EGP ${subtotal.toLocaleString('en-EG')}`;
            if (countItemHeader) countItemHeader.textContent = totalCount.toString();
            updateTotal(parseFloat(couponInput.dataset.discount || 0));
            updatePlaceOrderButton();
        } catch (e) {
            console.error("Error in updateCartUI:", e);
            checkoutItems.innerHTML = '<div class="empty-cart">Error loading cart items</div>';
            placeOrderBtn.classList.add("disabled");
            placeOrderBtn.disabled = true;
        }
    }

    function updateTotal(discount = 0) {
        const discountAmount = subtotal * discount;
        const shippingCost = subtotal >= FREE_SHIPPING_LIMIT ? 0 : parseFloat(governorateSelect.selectedOptions[0]?.dataset.shipping || 0);
        const total = subtotal - discountAmount + shippingCost;

        discountSpan.textContent = discountAmount > 0 ? `- EGP ${discountAmount.toLocaleString('en-EG')}` : "EGP 0";
        shippingCostSpan.textContent = subtotal >= FREE_SHIPPING_LIMIT ? "Free" : `EGP ${shippingCost.toLocaleString('en-EG')}`;
        totalSpan.textContent = `EGP ${total.toLocaleString('en-EG')}`;
    }

    function updatePlaceOrderButton() {
        let isValid = true;
        document.querySelectorAll('#checkout-form input[required], #checkout-form select[required]').forEach(field => {
            if (field.value.trim() === '') {
                isValid = false;
            }
        });
        if (!cart || cart.length === 0 || !isValid) {
            placeOrderBtn.classList.add("disabled");
            placeOrderBtn.disabled = true;
        } else {
            placeOrderBtn.classList.remove("disabled");
            placeOrderBtn.disabled = false;
        }
    }

    // Populate cities based on governorate selection
    governorateSelect.addEventListener("change", function () {
        citySelect.innerHTML = '<option value="">Select City</option>';
        citySelect.disabled = true;

        const selectedGovernorate = governorateSelect.value;
        if (selectedGovernorate && governorateCities[selectedGovernorate]) {
            governorateCities[selectedGovernorate].forEach(city => {
                const option = document.createElement("option");
                option.value = city;
                option.textContent = city;
                citySelect.appendChild(option);
            });
            citySelect.disabled = false;
        }
        updateTotal(parseFloat(couponInput.dataset.discount || 0));
        // Trigger validation for governorate
        const errorElement = getErrorElement(governorateSelect);
        if (governorateSelect.value === "") {
            if (errorElement) {
                errorElement.textContent = "Governorate is required";
                errorElement.classList.remove("hidden");
                errorElement.style.opacity = "1";
            }
            governorateSelect.classList.add("touched");
        } else {
            if (errorElement) {
                errorElement.style.opacity = "0";
                setTimeout(() => {
                    errorElement.textContent = "";
                    errorElement.classList.add("hidden");
                }, 500);
            }
            governorateSelect.classList.remove("touched");
        }
        updatePlaceOrderButton();
    });

    // Validate coupon
    couponInput.addEventListener("input", function () {
        const couponCode = couponInput.value.trim().toUpperCase();
        if (couponCode === "") {
            couponMsg.textContent = "";
            couponMsg.style.color = "";
            couponInput.dataset.discount = 0;
            updateTotal();
            return;
        }
        if (validCoupons[couponCode]) {
            couponMsg.textContent = `Coupon applied! ${validCoupons[couponCode] * 100}% discount`;
            couponMsg.style.color = "green";
            couponInput.dataset.discount = validCoupons[couponCode];
            updateTotal(validCoupons[couponCode]);
        } else {
            couponMsg.textContent = "Invalid coupon code";
            couponMsg.style.color = "red";
            couponInput.dataset.discount = 0;
            updateTotal();
        }
    });

    // Handle quantity controls and item deletion
    checkoutItems.addEventListener("click", function (e) {
        const target = e.target.closest("button");
        if (!target) return;
        const index = parseInt(target.getAttribute("data-index"));
        if (isNaN(index)) return;

        if (target.classList.contains("increase-quantity")) {
            cart[index].quantity = parseInt(cart[index].quantity) + 1;
            localStorage.setItem("cart", JSON.stringify(cart));
            window.userDataManager.increaseQuantity(index);
            updateCartUI();
        } else if (target.classList.contains("decrease-quantity")) {
            if (cart[index].quantity <= 1) {
                if (confirm("Do you want to remove this product from the cart?")) {
                    window.userDataManager.deleteFromCart(index);
                    updateCartUI();
                }
                return;
            }
            window.userDataManager.decreaseQuantity(index);
            updateCartUI();
        } else if (target.classList.contains("delete-item")) {
            window.userDataManager.deleteFromCart(index);
            updateCartUI();
        }
    });

    function updateButtonState(productId) {
        const allMatchingButtons = document.querySelectorAll(`.btn-add-cart[data-id="${productId}"]`);
        allMatchingButtons.forEach(btn => {
            btn.classList.remove("active");
            btn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Add to Cart`;
        });
    }

    // ========== Validation ==========
    const firstName = document.getElementById("first_name");
    const lastName = document.getElementById("last_name");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");
    const address = document.getElementById("address");
    const governorate = document.getElementById("Governorate");
    const city = document.getElementById("billing_city");
    const postcode = document.getElementById("billing_postcode");

    const nameRegex = /^[\u0621-\u064Aa-zA-Z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(?:01[0125]\d{8}|\+?20(?:[\s-]?1[0125])(?:[\s-]?\d){8}|\+?[1-9](?:[\s-]?\d){9,14})$/;
    const postcodeRegex = /^\d{4,6}$/;

    function getErrorElement(input) {
        if (input.nextElementSibling && input.nextElementSibling.classList.contains("error-message")) {
            return input.nextElementSibling;
        }
        const errorInParent = input.parentElement.querySelector(".error-message");
        return errorInParent || null;
    }

    function validateInput(input, regex, emptyMsg, invalidMsg, optional = false) {
        const value = input.value.trim();
        const errorElement = getErrorElement(input);

        if (value === "") {
            if (!optional) {
                if (errorElement) {
                    errorElement.textContent = emptyMsg;
                    errorElement.classList.remove("hidden");
                    errorElement.style.opacity = "1";
                }
                input.classList.add("touched");
                return false;
            }
            // input اختياري وفاضي
            if (errorElement) {
                errorElement.textContent = "";
                errorElement.classList.add("hidden");
                errorElement.style.opacity = "0";
            }
            input.classList.remove("touched");
            return true;
        }

        if (regex && !regex.test(value)) {
            if (errorElement) {
                errorElement.textContent = invalidMsg;
                errorElement.classList.remove("hidden");
                errorElement.style.opacity = "1";
            }
            input.classList.add("touched");
            return false;
        }

        //  valid input
        if (errorElement) {
            errorElement.textContent = "";
            errorElement.classList.add("hidden");
            errorElement.style.opacity = "0";
        }
        input.classList.remove("touched");
        return true;
    }


    // إضافة التحقق الفوري لكل input
    [firstName, lastName, email, phone, address, postcode].forEach(input => {
        input.addEventListener('input', () => {
            if (input === firstName) validateInput(firstName, nameRegex, "First name is required", "Only letters allowed");
            if (input === lastName) validateInput(lastName, nameRegex, "Last name is required", "Only letters allowed");
            if (input === email) validateInput(email, emailRegex, "", "Invalid email format", true);
            if (input === phone) validateInput(phone, phoneRegex, "Phone is required", "Invalid phone number");
            if (input === address) validateInput(address, null, "Address is required", "");
            if (input === postcode) validateInput(postcode, postcodeRegex, "Postcode required", "4–6 digits");
            updatePlaceOrderButton();
        });
    });

    // إضافة التحقق الفوري لـ city
    city.addEventListener('change', () => {
        const errorElement = getErrorElement(city);
        if (city.value === "") {
            if (errorElement) {
                errorElement.textContent = "City is required";
                errorElement.classList.remove("hidden");
                errorElement.style.opacity = "1";
            }
            city.classList.add("touched");
        } else {
            if (errorElement) {
                errorElement.style.opacity = "0";
                setTimeout(() => {
                    errorElement.textContent = "";
                    errorElement.classList.add("hidden");
                }, 500);
            }
            city.classList.remove("touched");
        }
        updatePlaceOrderButton();
    });

    // ========== Place Order ==========
    placeOrderBtn.addEventListener("click", function (e) {
        e.preventDefault();

        //  Check empty cart first
        if (!cart || cart.length === 0) {
            Swal.fire({
                title: "Oops!",
                text: "Your cart is empty. Please add products before placing an order 🛒",
                icon: "error",
                confirmButtonColor: "#ff8716"
            });
            placeOrderBtn.classList.add("disabled");
            placeOrderBtn.disabled = true;
            return;
        }

        //  Validate form
        let isValid = true;
        let firstInvalidField = null;

        if (!validateInput(firstName, nameRegex, "First name is required", "Only letters allowed")) {
            isValid = false;
            if (!firstInvalidField) firstInvalidField = firstName;
        }
        if (!validateInput(lastName, nameRegex, "Last name is required", "Only letters allowed")) {
            isValid = false;
            if (!firstInvalidField) firstInvalidField = lastName;
        }
        if (!validateInput(email, emailRegex, "", "Invalid email format", true)) {
            isValid = false;
            if (!firstInvalidField) firstInvalidField = email;
        }
        if (!validateInput(phone, phoneRegex, "Phone is required", "Invalid phone number")) {
            isValid = false;
            if (!firstInvalidField) firstInvalidField = phone;
        }
        if (!validateInput(address, null, "Address is required", "")) {
            isValid = false;
            if (!firstInvalidField) firstInvalidField = address;
        }
        if (!validateInput(postcode, postcodeRegex, "Postcode required", "4–6 digits")) {
            isValid = false;
            if (!firstInvalidField) firstInvalidField = postcode;
        }
        if (governorate.value === "") {
            const errorElement = getErrorElement(governorate);
            if (errorElement) {
                errorElement.textContent = "Governorate is required";
                errorElement.classList.remove("hidden");
                errorElement.style.opacity = "1";
            }
            governorate.classList.add("touched");
            if (!firstInvalidField) firstInvalidField = governorate;
            isValid = false;
        }
        if (city.value === "") {
            const errorElement = getErrorElement(city);
            if (errorElement) {
                errorElement.textContent = "City is required";
                errorElement.classList.remove("hidden");
                errorElement.style.opacity = "1";
            }
            city.classList.add("touched");
            if (!firstInvalidField) firstInvalidField = city;
            isValid = false;
        }

        if (!isValid) {
            Swal.fire({
                title: "Form Error",
                text: "Please correct the highlighted fields before placing your order ⚠️",
                icon: "warning",
                confirmButtonColor: "#ff8716"
            });
            if (firstInvalidField) {
                firstInvalidField.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            return;
        }

        //  Generate order number
        const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const randomPart = Math.floor(1000 + Math.random() * 9000);
        const orderNumber = `ORD-${datePart}-${randomPart}`;

        //  Save order
        const discountRate = parseFloat(couponInput.dataset.discount || 0); // 0.2
        const discountPercentage = (discountRate * 100) + "%"; // "20%"
        const discountAmount = subtotal * discountRate; // 299 مثلاً
        const shippingCost = subtotal >= FREE_SHIPPING_LIMIT ? 0 : parseFloat(governorateSelect.selectedOptions[0]?.dataset.shipping || 0);
        const total = subtotal - discountAmount + shippingCost;

        const shippingText = subtotal >= FREE_SHIPPING_LIMIT
            ? "Free Shipping"
            : `EGP ${shippingCost.toFixed(2)}`;

        const order = {
            orderNumber,
            user: {
                firstName: firstName.value.trim(),
                lastName: lastName.value.trim(),
                email: email.value.trim(),
                phone: phone.value.trim(),
                address: address.value.trim(),
                address2: document.getElementById("address_2").value.trim(),
                governorate: governorate.value,
                city: city.value,
                postcode: postcode.value.trim()
            },
            items: cart,
            subtotal,
            discount: discountPercentage, //  "20%"
            discountAmount,               //  299
            shipping: shippingText,
            total,
            paymentMethod: "Cash on Delivery",
            orderNotes: document.getElementById("order_comments").value.trim(),
            date: new Date().toISOString()
        };


        let orders = JSON.parse(localStorage.getItem("orders")) || [];
        orders.push(order);
        localStorage.setItem("orders", JSON.stringify(orders));
        localStorage.setItem("latestOrder", JSON.stringify(order));


        // Clear cart using userDataManager
        if (typeof window.clearCartAfterOrder === 'function') {
            window.clearCartAfterOrder();
        } else {
            console.error("window.clearCartAfterOrder is not defined");
            localStorage.removeItem("cart");
            cart = [];
        }


        //  Reset form & cart
        checkoutForm.reset();
        citySelect.innerHTML = '<option value="">Select City</option>';
        citySelect.disabled = true;
        cart = [];
        localStorage.removeItem("cart");
        updateCartUI();
        couponMsg.textContent = "";
        couponMsg.style.color = "";
        couponInput.dataset.discount = 0;

        // Clear .touched class on reset
        document.querySelectorAll('#checkout-form input[required], #checkout-form select[required]').forEach(field => {
            field.classList.remove("touched");
        });

        //  Success message
        Swal.fire({
            title: "Order Placed!..Success",
            html: `
                <p>Your order has been placed successfully 🎉</p>
                <p><strong>Order Number:</strong> ${orderNumber}</p>
            `,
            icon: "success",
            confirmButtonText: "OK",
            confirmButtonColor: "#ff8716"
        }).then(() => {
            window.open("./PrintOrder.html", "_blank");
        });
    });

    // Back to Top Button
    const backToTopButton = document.getElementById("back-to-top");
    if (backToTopButton) {
        backToTopButton.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Initialize cart UI
    updateCartUI();
});
"use strict";

document.addEventListener("DOMContentLoaded", function () {
    console.log("Loading PrintOrder.html"); // Debugging
    const order = JSON.parse(localStorage.getItem("latestOrder")) || {};
    console.log("Loaded order:", order); // Debugging

    // Populate order details
    document.getElementById("order-number").textContent = order.orderNumber ? `#${order.orderNumber}` : "Not available";
    document.getElementById("order-date").textContent = order.date ? new Date(order.date).toLocaleDateString('en-EG', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "Not available";
    const orderItems = document.getElementById("order-items");
    orderItems.innerHTML = ""; // Clear default message
    if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>EGP ${item.price.toLocaleString('en-EG')}</td>
                <td>EGP ${(item.price * item.quantity).toLocaleString('en-EG')}</td>
            `;
            orderItems.appendChild(row);
        });
    } else {
        orderItems.innerHTML = '<tr><td colspan="4">No products</td></tr>';
    }
    document.getElementById("subtotal").textContent = order.subtotal ? `EGP ${order.subtotal.toLocaleString('en-EG')}` : "EGP 0";
    document.getElementById("discount").textContent = order.discountAmount > 0 ? `- EGP ${order.discountAmount.toLocaleString('en-EG')}` : "EGP 0";
    const shippingText = typeof order.shipping === 'number'
        ? (order.shipping === 0 ? "Free Shipping" : `EGP ${order.shipping.toLocaleString('en-EG')}`)
        : order.shipping; // لو بالفعل نص زي "Free Shipping"

    document.getElementById("shipping").textContent = shippingText;

    document.getElementById("total").textContent = order.total ? `EGP ${order.total.toLocaleString('en-EG')}` : "EGP 0";
    document.getElementById("order-notes").textContent = order.orderNotes || "No notes";

    // Populate billing details
    document.getElementById("billing-name").textContent = `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || "Not provided";
    document.getElementById("billing-address").textContent = order.user?.address || "Not provided";
    document.getElementById("billing-address2").textContent = order.user?.address2 || "";
    document.getElementById("billing-city").textContent = order.user?.city || "Not provided";
    document.getElementById("billing-governorate").textContent = order.user?.governorate || "Not provided";
    document.getElementById("billing-postcode").textContent = order.user?.postcode || "Not provided";
    document.getElementById("billing-phone").textContent = order.user?.phone || "Not provided";
    document.getElementById("billing-email").textContent = order.user?.email || "Not provided";

    // Terms and Conditions based on device language
    const termsContainer = document.getElementById("terms-conditions");
    const termsTitle = document.getElementById("terms-title");
    const term1 = document.getElementById("term-1");
    const term2 = document.getElementById("term-2");
    const term3 = document.getElementById("term-3");
    const term4 = document.getElementById("term-4");
    const userLang = navigator.language || navigator.userLanguage;

    if (userLang.startsWith("ar")) {
        termsContainer.classList.add("rtl");
        termsTitle.textContent = "الشروط والأحكام";
        term1.textContent = "1. جميع الطلبات تخضع للتوافر.";
        term2.textContent = "2. الدفع عند التسليم (الدفع نقدًا عند الاستلام).";
        term3.textContent = "3. يتم قبول المرتجعات خلال 14 يومًا من التسليم، بشرط أن تكون المنتجات في حالتها الأصلية.";
        term4.textContent = "4. لأي استفسارات، تواصلوا معنا على support@buyspot.com أو +20 123 456 7890.";
    } else {
        termsContainer.classList.add("ltr");
        termsTitle.textContent = "Terms and Conditions";
        term1.textContent = "1. All orders are subject to availability.";
        term2.textContent = "2. Payments are due upon delivery (Cash on Delivery).";
        term3.textContent = "3. Returns are accepted within 14 days of delivery, provided items are in original condition.";
        term4.textContent = "4. For any inquiries, contact us at support@buyspot.com or +20 123 456 7890.";
    }

    const printButton = document.getElementById("print-button");
    if (printButton) {
        printButton.addEventListener("click", function () {
            if (!window.jspdf || !window.jspdf.jsPDF) {
                console.error("jsPDF is not loaded");
                return;
            }
            const { jsPDF } = window.jspdf;

            html2canvas(document.querySelector(".print-container"), {
                scale: 2,
                ignoreElements: (element) => {
                    // يخفي الزرارين أو أي عناصر مش عايزها في الطباعة
                    return element.id === "print-button";
                }
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                const pageWidth = 210;   // عرض A4
                const pageHeight = 305;  // طول A4
                const margin = 4;        // هامش أصغر عشان توسّع المحتوى

                // قص الطول: هنقص مثلاً 50px من تحت
                const cropHeight = canvas.height - 135; // قص 100px من تحت
                const croppedCanvas = document.createElement("canvas");
                croppedCanvas.width = canvas.width;
                croppedCanvas.height = cropHeight;
                const ctx = croppedCanvas.getContext("2d");
                ctx.drawImage(canvas, 0, 0, canvas.width, cropHeight, 0, 0, canvas.width, cropHeight);

                const croppedImgData = croppedCanvas.toDataURL("image/png");

                // تكبير العرض (خليها أكبر من قبل)
                const imgWidth = pageWidth - margin * 2;
                const imgHeight = (cropHeight * imgWidth) / canvas.width;

                // لو الصورة طويلة قصها عشان متعديش حدود الصفحة
                let finalWidth = imgWidth;
                let finalHeight = imgHeight;
                if (imgHeight > pageHeight - margin * 2) {
                    finalHeight = pageHeight - margin * 2;
                    finalWidth = (canvas.width * finalHeight) / cropHeight;
                }

                // تمركز أفقي (الطول تم ظبطه بالقص)
                const x = (pageWidth - finalWidth) / 2;
                const y = margin;

                // إدخال الصورة بعد القص والتوسيع
                pdf.addImage(croppedImgData, "PNG", x, y, finalWidth, finalHeight);

                pdf.save(`BuySpot_Order_#${order.orderNumber || 'unknown'}.pdf`);
            }).catch(error => {
                console.error("Error generating PDF:", error);
            });
        });
    }

    // Back button
    const backButton = document.getElementById("back-button");
    if (backButton) {
        backButton.addEventListener("click", function () {
            window.location.href = "../index.html"; 
        });
    }
});




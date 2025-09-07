"use strict";

// Hero Slider
(function () {
    const heroSlides = document.querySelectorAll(".slide-swp .swiper-slide").length;

    new Swiper(".slide-swp", {
        pagination: {
            el: ".swiper-pagination",
            dynamicBullets: true,
            clickable: true
        },
        autoplay: heroSlides > 1 ? {
            delay: 2500,
            disableOnInteraction: false,
            pauseOnMouseEnter: false
        } : false,
        loop: heroSlides > 1,
        speed: 900,
        watchSlidesProgress: true
    });
})();

// Products Slider
(function () {
    const productContainer = document.querySelector(".slide-product");
    if (!productContainer) return;

    const productSlides = productContainer.querySelectorAll(".swiper-slide").length;
    const maxVisible = 5; // ثابت – مش هيتغير
    const enableLoop = productSlides > maxVisible;

    // دالة تساعدنا نحدد العرض المناسب
    const getSlidesPerView = (wanted) => Math.min(productSlides, wanted);

    new Swiper(".slide-product", {
        slidesPerView: getSlidesPerView(maxVisible),
        spaceBetween: 20,
        autoplay: productSlides > maxVisible ? {
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: false
        } : false,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev"
        },
        loop: enableLoop,
        loopedSlides: enableLoop ? getSlidesPerView(maxVisible) : 0,
        speed: 900,
        watchSlidesProgress: true,
        // breakpoints ثابتة مش هتتغير مع resize
        breakpoints: {
            1200: { slidesPerView: getSlidesPerView(5), spaceBetween: 20 },
            992: { slidesPerView: getSlidesPerView(4), spaceBetween: 20 },
            768: { slidesPerView: getSlidesPerView(3), spaceBetween: 15 },
            508: { slidesPerView: getSlidesPerView(2), spaceBetween: 10 },
            0: { slidesPerView: 1, spaceBetween: 5 }
        }
    });
})();

// التحكم بالكيبورد (Enter = slide next)
document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        const productSlider = document.querySelector(".slide-product")?.swiper;
        if (productSlider) {
            productSlider.slideNext();
        }
    }
});

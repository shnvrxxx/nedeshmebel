(function() {
    'use strict';

    // --------------------------------------------------------------
    // 1. ТЁМНАЯ ТЕМА (переключатель + localStorage)
    // --------------------------------------------------------------
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    // Проверяем сохранённую тему
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        const isDark = body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });

    // --------------------------------------------------------------
    // 2. АКТИВНЫЙ ПУНКТ МЕНЮ (Intersection Observer)
    // --------------------------------------------------------------
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-list a');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -40% 0px',
        threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach((link) => {
                    link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                });
            }
        });
    }, observerOptions);

    sections.forEach((section) => observer.observe(section));

    // --------------------------------------------------------------
    // 3. ПЛАВНЫЙ СКРОЛЛ ПО ЯКОРЯМ
    // --------------------------------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerHeight = document.querySelector('.header').offsetHeight;
                const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                window.scrollTo({ top, behavior: 'smooth' });
                closeMobileMenu();
            }
        });
    });

    // --------------------------------------------------------------
    // 4. МОБИЛЬНОЕ МЕНЮ (гамбургер)
    // --------------------------------------------------------------
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const mobileLinks = mobileMenu.querySelectorAll('a');

    function toggleMobileMenu() {
        const isOpen = mobileMenu.classList.toggle('open');
        mobileOverlay.classList.toggle('active', isOpen);
        hamburger.classList.toggle('active', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    function closeMobileMenu() {
        mobileMenu.classList.remove('open');
        mobileOverlay.classList.remove('active');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', toggleMobileMenu);
    mobileOverlay.addEventListener('click', closeMobileMenu);
    mobileLinks.forEach((link) => link.addEventListener('click', closeMobileMenu));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
            closeMobileMenu();
        }
    });

    // --------------------------------------------------------------
    // 5. ШАПКА — ТЕНЬ ПРИ СКРОЛЛЕ
    // --------------------------------------------------------------
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 30);
    });

    // --------------------------------------------------------------
    // 6. КАТАЛОГ — СЛАЙДЕР (без изменений)
    // --------------------------------------------------------------
    const sliderTrack = document.getElementById('sliderTrack');
    const slides = sliderTrack.querySelectorAll('.slider-slide');
    const totalSlides = slides.length;
    let currentSlide = 0;
    let sliderInterval = null;
    const slideDelay = 4000;

    const dotsContainer = document.getElementById('sliderDots');
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('button');
        dot.setAttribute('data-index', i);
        dot.setAttribute('aria-label', `Перейти к слайду ${i + 1}`);
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }
    const dots = dotsContainer.querySelectorAll('button');

    function goToSlide(index) {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;
        currentSlide = index;
        sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
        dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
    }

    function nextSlide() { goToSlide(currentSlide + 1); }
    function prevSlide() { goToSlide(currentSlide - 1); }

    document.getElementById('sliderPrev').addEventListener('click', () => { prevSlide(); resetSliderTimer(); });
    document.getElementById('sliderNext').addEventListener('click', () => { nextSlide(); resetSliderTimer(); });

    function startSliderTimer() {
        if (sliderInterval) clearInterval(sliderInterval);
        sliderInterval = setInterval(nextSlide, slideDelay);
    }
    function resetSliderTimer() {
        if (sliderInterval) clearInterval(sliderInterval);
        startSliderTimer();
    }
    startSliderTimer();

    const sliderWrapper = document.getElementById('catalogSlider');
    sliderWrapper.addEventListener('mouseenter', () => { if (sliderInterval) clearInterval(sliderInterval); });
    sliderWrapper.addEventListener('mouseleave', startSliderTimer);
    sliderWrapper.addEventListener('touchstart', () => { if (sliderInterval) clearInterval(sliderInterval); });
    sliderWrapper.addEventListener('touchend', startSliderTimer);

    let touchStartX = 0, touchEndX = 0;
    sliderWrapper.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    sliderWrapper.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 40) {
            if (diff > 0) { nextSlide(); resetSliderTimer(); } else { prevSlide(); resetSliderTimer(); }
        }
    }, { passive: true });

    // --------------------------------------------------------------
    // 7. ОТЗЫВЫ — КАРУСЕЛЬ (без изменений)
    // --------------------------------------------------------------
    const testimonialTrack = document.getElementById('testimonialsTrack');
    const testimonialItems = testimonialTrack.querySelectorAll('.testimonial-item');
    const totalTestimonials = testimonialItems.length;
    let currentTestimonial = 0;
    let testimonialInterval = null;
    let itemsPerView = 1;

    function getItemsPerView() {
        return window.innerWidth >= 768 ? 2 : 1;
    }

    function updateTestimonialCarousel() {
        itemsPerView = getItemsPerView();
        const slideWidth = 100 / itemsPerView;
        const offset = currentTestimonial * slideWidth;
        testimonialTrack.style.transform = `translateX(-${offset}%)`;
        testimonialItems.forEach((item) => { item.style.display = 'block'; });
    }

    function nextTestimonial() {
        const max = totalTestimonials - itemsPerView;
        if (currentTestimonial >= max) { currentTestimonial = 0; } else { currentTestimonial++; }
        updateTestimonialCarousel();
    }
    function prevTestimonial() {
        if (currentTestimonial <= 0) { currentTestimonial = totalTestimonials - itemsPerView; } else { currentTestimonial--; }
        updateTestimonialCarousel();
    }

    function startTestimonialTimer() {
        if (testimonialInterval) clearInterval(testimonialInterval);
        testimonialInterval = setInterval(nextTestimonial, 5000);
    }
    function resetTestimonialTimer() {
        if (testimonialInterval) clearInterval(testimonialInterval);
        startTestimonialTimer();
    }

    document.getElementById('testimonialPrev').addEventListener('click', () => { prevTestimonial(); resetTestimonialTimer(); });
    document.getElementById('testimonialNext').addEventListener('click', () => { nextTestimonial(); resetTestimonialTimer(); });

    const carousel = document.getElementById('testimonialsCarousel');
    carousel.addEventListener('mouseenter', () => { if (testimonialInterval) clearInterval(testimonialInterval); });
    carousel.addEventListener('mouseleave', startTestimonialTimer);
    carousel.addEventListener('touchstart', () => { if (testimonialInterval) clearInterval(testimonialInterval); });
    carousel.addEventListener('touchend', startTestimonialTimer);

    let tTouchStartX = 0, tTouchEndX = 0;
    carousel.addEventListener('touchstart', (e) => { tTouchStartX = e.changedTouches[0].screenX; }, { passive: true });
    carousel.addEventListener('touchend', (e) => {
        tTouchEndX = e.changedTouches[0].screenX;
        const diff = tTouchStartX - tTouchEndX;
        if (Math.abs(diff) > 40) {
            if (diff > 0) { nextTestimonial(); resetTestimonialTimer(); } else { prevTestimonial(); resetTestimonialTimer(); }
        }
    }, { passive: true });

    function initTestimonials() {
        itemsPerView = getItemsPerView();
        currentTestimonial = 0;
        updateTestimonialCarousel();
        startTestimonialTimer();
    }
    initTestimonials();

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const newItemsPerView = getItemsPerView();
            if (newItemsPerView !== itemsPerView) {
                itemsPerView = newItemsPerView;
                if (currentTestimonial > totalTestimonials - itemsPerView) {
                    currentTestimonial = totalTestimonials - itemsPerView;
                }
                if (currentTestimonial < 0) currentTestimonial = 0;
                updateTestimonialCarousel();
            }
        }, 200);
    });

    // --------------------------------------------------------------
    // 8. АНИМАЦИИ ПРИ СКРОЛЛЕ (fade-in)
    // --------------------------------------------------------------
    const fadeSections = document.querySelectorAll('.fade-section');
    const fadeItems = document.querySelectorAll('.fade-item');

    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
    });

    fadeSections.forEach((el) => animationObserver.observe(el));
    fadeItems.forEach((el) => animationObserver.observe(el));

    // --------------------------------------------------------------
    // 9. ФУТЕР: ДИНАМИЧЕСКИЙ ГОД
    // --------------------------------------------------------------
    document.getElementById('footerYear').textContent = new Date().getFullYear();

    // --------------------------------------------------------------
    // 10. ПЕРВОНАЧАЛЬНАЯ ПРОВЕРКА ВИДИМЫХ СЕКЦИЙ (для активного меню)
    // --------------------------------------------------------------
    setTimeout(() => {
        sections.forEach((section) => {
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.6 && rect.bottom > 0) {
                const id = section.getAttribute('id');
                navLinks.forEach((link) => {
                    link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                });
            }
        });
    }, 100);

    window.addEventListener('load', () => {
        setTimeout(() => {
            sections.forEach((section) => {
                const rect = section.getBoundingClientRect();
                if (rect.top < window.innerHeight * 0.5 && rect.bottom > 0) {
                    const id = section.getAttribute('id');
                    navLinks.forEach((link) => {
                        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                    });
                }
            });
        }, 200);
    });

    console.log('✅ Сайт-визитка мебельной фирмы загружен! (тёмная тема + Telegram)');
})();
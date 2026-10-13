// =========================================================================
// 1. ГЛОБАЛЬНЫЕ НАСТРОЙКИ И ДИНАМИЧЕСКОЕ ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ
// =========================================================================

const modes = ['supplier', 'customer', 'transport'];
let currentModeIndex = 0;
let menuTouchStartX = 0;

function switchMode(mode) {
    modes.forEach(m => {
        // Переключаем видимость блоков групп ссылок в меню
        document.querySelectorAll(`.group-${m}`).forEach(el => {
            el.style.setProperty('display', m === mode ? 'flex' : 'none', 'important');
        });
        
        // Переключаем Bento-сетки на странице
        const gridEl = document.getElementById(`grid-${m}`);
        if (gridEl) {
            if (m === mode) {
                gridEl.classList.add('active');
                gridEl.style.setProperty('display', 'grid', 'important');
            } else {
                gridEl.classList.remove('active');
                gridEl.style.setProperty('display', 'none', 'important');
            }
        }
    });

    // Обновляем статус-текст текущего режима в меню
    const titles = { supplier: 'Поставщик', customer: 'Заказчик', transport: 'Грузоперевозки' };
    const statusText = document.querySelector('.menu-status-text');
    if (statusText && titles[mode]) {
        statusText.textContent = titles[mode];
    }

    currentModeIndex = modes.indexOf(mode);

    // Подсвечиваем активную кнопку под шапкой
    document.querySelectorAll('.mode-btn').forEach(btn => {
        if (btn.getAttribute('data-mode') === mode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function initModeButtons() {
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetMode = btn.getAttribute('data-mode');
            if (targetMode) {
                switchMode(targetMode);
            }
        });
    });
}
// =========================================================================
// 2. УПРАВЛЕНИЕ МОБИЛЬНЫМ МЕНЮ (БУРГЕР)
// =========================================================================

function initMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            
            // Включаем / выключаем класс СТРОГО по правилам проекта
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Закрываем меню при тапе по ссылкам
        navLinks.querySelectorAll('.menu-item-link').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }
}
// =========================================================================
// 3. СВАЙПЫ И СТРЕЛОЧКИ ДЛЯ ПЕРЕКЛЮЧЕНИЯ РЕЖИМОВ
// =========================================================================

function initMenuSwipes() {
    const bentoGrid = document.querySelector('.bento-grid-container') || document.body;
    if (!bentoGrid) return;

    bentoGrid.addEventListener('touchstart', (e) => {
        if (e.target.closest('.bento-card-back') || e.target.closest('.bento-card-front.is-flipped')) return;
        menuTouchStartX = e.touches[0].clientX;
    }, { passive: true });

    bentoGrid.addEventListener('touchend', (e) => {
        if (e.target.closest('.bento-card-back') || e.target.closest('.bento-card-front.is-flipped')) return;
        const diffX = menuTouchStartX - e.changedTouches[0].clientX;

        if (Math.abs(diffX) > 70) {
            if (diffX > 0) {
                currentModeIndex = (currentModeIndex + 1) % modes.length;
            } else {
                currentModeIndex = (currentModeIndex - 1 + modes.length) % modes.length;
            }
            switchMode(modes[currentModeIndex]);
        }
    }, { passive: true });

    // Обработчики кликов по стрелочкам навигации меню
    const prevBtn = document.querySelector('.btn-menu-prev');
    const nextBtn = document.querySelector('.btn-menu-next');

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            currentModeIndex = (currentModeIndex - 1 + modes.length) % modes.length;
            switchMode(modes[currentModeIndex]);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            currentModeIndex = (currentModeIndex + 1) % modes.length;
            switchMode(modes[currentModeIndex]);
        });
    }
}

// =========================================================================
// 4. ИНТЕРАКТИВНЫЙ 3D-РАЗВОРОТ КАРТОЧЕК И ГЛОБАЛЬНЫЙ ЗАПУСК
// =========================================================================

function initBentoCards() {
    document.querySelectorAll('.bento-card').forEach(card => {
        const frontSide = card.querySelector('.bento-card-front');
        const closeBtn = card.querySelector('.bento-card-close-icon');

        if (frontSide) {
            frontSide.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!card.classList.contains('is-expanded')) {
                    card.classList.add('is-flipped');
                    setTimeout(() => {
                        if (card.classList.contains('is-flipped')) {
                            card.classList.add('is-expanded');
                        }
                    }, 150);
                }
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Включаем фазу закрытия для удержания координат и запускаем обратный разворот
                card.classList.add('is-closing');
                card.classList.remove('is-flipped');
                
                // Через 350мс, когда анимация полностью завершится, очищаем всё
                setTimeout(() => {
               card.classList.remove('is-expanded', 'is-closing');
                }, 350);
            });
        }

// 5. ГЛОБАЛЬНЫЙ ИНИЦИАТОР ВСЕХ СКРИПТОВ
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initModeButtons();
    initMenuSwipes();
    initBentoCards();
    switchMode('supplier');
});
        

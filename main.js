// =========================================================================
// ГЛОБАЛЬНЫЕ ФУНКЦИИ И ИНИЦИАЛИЗАЦИЯ ИНТЕРФЕЙСА TENDERPILOT
// =========================================================================

const modes = ['supplier', 'customer', 'transport'];
let currentModeIndex = 0;
let menuTouchStartX = 0;

// 1. ДИНАМИЧЕСКОЕ ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ (Привязываем к window, чтобы работали onclick в HTML)
window.switchMode = function(mode, event) {
    if (event) event.preventDefault();
    
    // Переключаем видимость блоков групп
    modes.forEach(m => {
        document.querySelectorAll(`.group-${m}`).forEach(el => {
            el.style.setProperty('display', m === mode ? 'block' : 'none', 'important');
        });
    });

    // Обновляем статус-текст текущего режима
    const titles = { supplier: 'Поставщик', customer: 'Заказчик', transport: 'Грузоперевозки' };
    const statusText = document.querySelector('.mode-status-text');
    if (statusText && titles[mode]) {
        statusText.textContent = `Режим: ${titles[mode]}`;
    }
    
    // Корректируем индекс для свайпов
    currentModeIndex = modes.indexOf(mode);

    // Подсвечиваем активную кнопку режима в меню
    document.querySelectorAll('.mode-btn').forEach(btn => {
        const onclickAttr = btn.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(mode)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
};

// 2. УПРАВЛЕНИЕ МОБИЛЬНЫМ МЕНЮ (БУРГЕР)
function initMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const iconBurger = document.querySelector('.icon-burger');
    const iconClose = document.querySelector('.icon-close');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            navLinks.classList.toggle('active');

            if (iconBurger && iconClose) {
                iconBurger.style.display = !isExpanded ? 'none' : 'block';
                iconClose.style.display = !isExpanded ? 'block' : 'none';
            }
        });
    }
}

// 3. СВАЙПЫ ДЛЯ ПЕРЕКЛЮЧЕНИЯ РЕЖИМОВ ПАЛЬЦЕМ
function initMenuSwipes() {
    const bentoGrid = document.querySelector('.bento-grid');
    if (!bentoGrid) return;

    bentoGrid.addEventListener('touchstart', (e) => {
        // Если открыто модальное окно карточки, свайп сетки не работает
        if (e.target.closest('.bento-card.is-expanded')) return;
        menuTouchStartX = e.touches[0].clientX;
    }, { passive: true });

    bentoGrid.addEventListener('touchend', (e) => {
        if (e.target.closest('.bento-card.is-expanded')) return;
        const diffX = menuTouchStartX - e.changedTouches[0].clientX;

        // Порог свайпа в 70 пикселей для защиты от случайных сдвигов
        if (Math.abs(diffX) > 70) {
            if (diffX > 0 && currentModeIndex < modes.length - 1) {
                currentModeIndex++;
            } else if (diffX < 0 && currentModeIndex > 0) {
                currentModeIndex--;
            }
            window.switchMode(modes[currentModeIndex]);
        }
    }, { passive: true });
}

// 4. ИНТЕРАКТИВНЫЙ 3D-РАЗВОРOТ БЕНТО-КАРТОЧЕК
function initBentoCards() {
    document.querySelectorAll('.bento-card').forEach(card => {
        const frontSide = card.querySelector('.bento-card-front');
        const closeBtn = card.querySelector('.bento-card-close-icon');

        if (frontSide) {
            frontSide.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!card.classList.contains('is-flipped')) {
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
                
                // Включаем фазу плавного сжатия
                card.classList.add('is-closing');
                setTimeout(() => {
                    // После завершения анимации полностью очищаем классы
                    card.classList.remove('is-expanded', 'is-flipped', 'is-closing');
                }, 350);
            });
        }
    });
}

// 5. ГЛОБАЛЬНЫЙ ЗАПУСК ВСЕХ СКРИПТОВ
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initMenuSwipes();
    initBentoCards();
});

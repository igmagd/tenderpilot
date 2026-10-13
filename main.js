// =========================================================================
// ГЛОБАЛЬНЫЕ ФУНКЦИИ И ИНИЦИАЛИЗАЦИЯ ИНТЕРФЕЙСА TENDERPILOT
// =========================================================================

const modes = ['supplier', 'customer', 'transport'];
let currentModeIndex = 0;
let menuTouchStartX = 0;

// 1. ДИНАМИЧЕСКОЕ ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ
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

    // Подсвечиваем активную кнопку
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
                 switchMode(modes[currentModeIndex]);
            }
        }
    }, { passive: true });

    // Инициализация стрелочек в шапке мобильного меню
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
                
                // Сразу убираем полноэкранный режим, запуская плавное сжатие в сетку
                card.classList.remove('is-expanded');
                setTimeout(() => {
                    // Разворачиваем карточку рубашкой к пользователю после её уменьшения
                    card.classList.remove('is-flipped');
                }, 150);
            });
        }
    });
}

// 5. ГЛОБАЛЬНЫЕ ЗАПУСК ВСЕХ СКРИПТОВ
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initModeButtons(); // ВОТ ЭТА СТРОКА ЗАПУСТИТ НАШИ КНОПКИ
    initMenuSwipes();
    initBentoCards();
    switchMode('supplier'); // Включаем режим поставщика на старте
});

// =========================================================================
// ИЗОЛИРОВАННЫЙ И ОБЪЕДИНЕННЫЙ ФАЙЛ MAIN.JS
// =========================================================================

// 1. Управление мобильным меню (бургер)
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

// 2. Свайпы для меню и переключение режимов (табы)
let menuTouchStartX = 0;
const modes = ['supplier', 'customer', 'transport'];
let currentModeIndex = 0;

function initMenuSwipes() {
    const bentoGrid = document.querySelector('.bento-grid');
    if (!bentoGrid) return;

    bentoGrid.addEventListener('touchstart', (e) => {
        if (e.target.closest('.bento-card.is-expanded')) return;
        menuTouchStartX = e.touches[0].clientX;
    }, { passive: true });

    bentoGrid.addEventListener('touchend', (e) => {
        if (e.target.closest('.bento-card.is-expanded')) return;
        const diffX = menuTouchStartX - e.changedTouches[0].clientX;

        if (Math.abs(diffX) > 70) {
            if (diffX > 0 && currentModeIndex < modes.length - 1) currentModeIndex++;
            else if (diffX < 0 && currentModeIndex > 0) currentModeIndex--;
            switchMode(modes[currentModeIndex]);
        }
    }, { passive: true });
}

function switchMode(mode, event) {
    if (event) event.preventDefault();
    ['supplier', 'customer', 'transport'].forEach(m => {
        document.querySelectorAll(`.group-${m}`).forEach(el => el.style.setProperty('display', m === mode ? 'block' : 'none', 'important'));
    });

    const titles = { supplier: 'Поставщик', customer: 'Заказчик', transport: 'Грузоперевозки' };
    const statusText = document.querySelector('.mode-status-text');
    if (statusText && titles[mode]) statusText.textContent = `Режим: ${titles[mode]}`;
    currentModeIndex = modes.indexOf(mode);

    document.querySelectorAll('.mode-btn').forEach(btn => {
        const onclickAttr = btn.getAttribute('onclick');
        btn.classList.toggle('active', !!(onclickAttr && onclickAttr.includes(mode)));
    });
}

// 3. Интерактивный 3D-разворот бенто-карточек
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
                        if (card.classList.contains('is-flipped')) card.classList.add('is-expanded');
                    }, 150);
                }
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                card.classList.add('is-closing');
                setTimeout(() => {
                    card.classList.remove('is-expanded', 'is-flipped', 'is-closing');
                }, 350);
            });
        }
    });
}

// 5. Глобальный запуск
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initMenuSwipes();
    initBentoCards();
});

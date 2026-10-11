// ==========================================================================
//   АРХИТЕКТУРНЫЙ СКРИПТ ПЛАТФОРМЫ TENDERPILOT (ЖЕЛЕЗНЫЙ СТАНДАРТ 2026)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;

    // Массив режимов для циклического перелистывания по стрелочкам и свайпам в меню
    const modesChain = ['supplier', 'customer', 'transport'];

    // 1. ОЖИВЛЯЕМ БУРГЕР: Открытие и закрытие меню
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            body.classList.toggle('menu-open');
        });
    }

    // Закрытие меню при клике на любую ссылку внутри шторки
    const menuLinks = document.querySelectorAll('.menu-item-link');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks) navLinks.classList.remove('open');
            if (body) body.classList.remove('menu-open');
        });
    });

    // 2. УПРАВЛЕНИЕ СТРЕЛОЧКАМИ ВНУТРИ МЕНЮ
    const btnNext = document.querySelector('.btn-menu-next');
    const btnPrev = document.querySelector('.btn-menu-prev');

    function getActiveMode() {
        const groupCustomer = document.querySelector('.menu-group-customer');
        const groupTransport = document.querySelector('.menu-group-transport');
        if (groupCustomer && groupCustomer.style.display === 'flex') return 'customer';
        if (groupTransport && groupTransport.style.display === 'flex') return 'transport';
        return 'supplier';
    }

    function shiftMode(direction) {
        const currentMode = getActiveMode();
        let currentIndex = modesChain.indexOf(currentMode);
        
        if (direction === 'next') {
            currentIndex = (currentIndex + 1) % modesChain.length;
        } else if (direction === 'prev') {
            currentIndex = (currentIndex - 1 + modesChain.length) % modesChain.length;
        }
        
        animateModeSwitch(modesChain[currentIndex]);
    }

    if (btnNext) btnNext.addEventListener('click', () => shiftMode('next'));
    if (btnPrev) btnPrev.addEventListener('click', () => shiftMode('prev'));

    // 3. РЕВОЛЮЦИОННЫЕ СВАЙПЫ ПАЛЬЦЕМ НА ТЕЛЕФОНЕ ДЛЯ МЕНЮ (С ФИКСОМ СДВИГА)
    let touchStartX = 0;
    let touchStartY = 0;
    const swipeThreshold = 40;

    if (navLinks) {
        navLinks.addEventListener('touchstart', (event) => {
            touchStartX = event.touches.clientX;
            touchStartY = event.touches.clientY;
        }, { passive: true });

        navLinks.addEventListener('touchmove', (event) => {
            const currentX = event.touches.clientX;
            const currentY = event.touches.clientY;
            
            const diffX = Math.abs(currentX - touchStartX);
            const diffY = Math.abs(currentY - touchStartY);

            if (diffX > diffY && diffX > 10) {
                if (event.cancelable) event.preventDefault();
            }
        }, { passive: false });

        navLinks.addEventListener('touchend', (event) => {
            const touchEndX = event.changedTouches.clientX;
            const diffX = touchEndX - touchStartX;
            
            if (diffX < -swipeThreshold) {
                shiftMode('next');
            } else if (diffX > swipeThreshold) {
                shiftMode('prev');
            }
        }, { passive: true });
    }

    // 4. СИНХРОННАЯ АНИМАЦИЯ ПЕРЕКЛЮЧЕНИЯ МЕНЮ (0.35s)
    function animateModeSwitch(targetMode) {
        const activeGroup = document.querySelector(`.menu-group-${getActiveMode()}`);
        const allItems = activeGroup ? activeGroup.querySelectorAll('.menu-item-link') : [];

        if (allItems.length > 0) {
            allItems.forEach(item => {
                item.style.transition = 'opacity 0.2s cubic-bezier(0.25, 1, 0.5, 1)';
                item.style.opacity = '0';
            });
            
            setTimeout(() => {
                switchMode(targetMode);
                fadeInNewLinks(targetMode);
            }, 150);
        } else {
            switchMode(targetMode);
        }
    }

    function fadeInNewLinks(targetMode) {
        const newGroup = document.querySelector(`.menu-group-${targetMode}`);
        const newItems = newGroup ? newGroup.querySelectorAll('.menu-item-link') : [];
        
        if (newItems.length > 0) {
            newItems.forEach(item => {
                item.style.opacity = '0';
                item.style.transition = 'none';
            });
            
            setTimeout(() => {
                newItems.forEach(item => {
                    item.style.transition = 'opacity 0.35s cubic-bezier(0.25, 1, 0.5, 1)';
                    item.style.opacity = '1';
                });
            }, 20);
        }
    }

    // 5. РЕВОЛЮЦИОННАЯ ИНТЕГРАЦИЯ УПРАВЛЕНИЯ BENTO-КАРТОЧКАМИ (СВАЙПЫ И КЛИКИ 3D)
    const bentoCards = document.querySelectorAll('.bento-card');

    bentoCards.forEach(card => {
        const frontIcon = card.querySelector('.bento-card-front .bento-card-flip-icon');
        const backIcon = card.querySelector('.bento-card-back .bento-card-flip-icon');

        // Фаза А: Переворот и расширение карточки при клике на иконку "Вперед"
        if (frontIcon) {
            frontIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                card.classList.add('is-expanded');
            });
        }

        // Фаза Б: Сворачивание карточки обратно в сетку при клике на иконку "Назад"
        if (backIcon) {
            backIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                card.classList.remove('is-expanded');
            });
        }

        // Фаза В: Жесты свайпа для переворота и роста плашки на весь экран пальцем
        let cardTouchStartX = 0;
        let cardTouchStartY = 0;

        card.addEventListener('touchstart', (e) => {
            cardTouchStartX = e.touches.clientX;
            cardTouchStartY = e.touches.clientY;
        }, { passive: true });

        card.addEventListener('touchend', (e) => {
            const cardTouchEndX = e.changedTouches.clientX;
            const cardTouchEndY = e.changedTouches.clientY;
            
            const cardDiffX = cardTouchEndX - cardTouchStartX;
            const cardDiffY = Math.abs(cardTouchEndY - cardTouchStartY);

            // Если палец смахнули горизонтально и превысили порог в 40px
            if (Math.abs(cardDiffX) > cardDiffY && Math.abs(cardDiffX) > 40) {
                // Если карточка компактная и её смахнули влево — взрываем на весь экран
                if (!card.classList.contains('is-expanded') && cardDiffX < 0) {
                    card.classList.add('is-expanded');
                } 
                // If карточка на весь экран и её смахнули вправо — сворачиваем обратно в сетку
                else if (card.classList.contains('is-expanded') && cardDiffX > 0) {
                    card.classList.remove('is-expanded');
                }
            }
        }, { passive: true });
    });
});

// 6. ДИНАМИЧЕСКОЕ ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ (Синхронизация меню и Bento-сеток)
function switchMode(mode, event) {
    const groupSupplier = document.querySelector('.menu-group-supplier');
    const groupCustomer = document.querySelector('.menu-group-customer');
    const groupTransport = document.querySelector('.menu-group-transport');
    const statusText = document.querySelector('.menu-status-text');

    if (groupSupplier) groupSupplier.style.setProperty('display', 'none', 'important');
    if (groupCustomer) groupCustomer.style.setProperty('display', 'none', 'important');
    if (groupTransport) groupTransport.style.setProperty('display', 'none', 'important');

    if (mode === 'supplier' && groupSupplier) {
        groupSupplier.style.setProperty('display', 'flex', 'important');
        if (statusText) statusText.textContent = 'Поставщик';
    } else if (mode === 'customer' && groupCustomer) {
        groupCustomer.style.setProperty('display', 'flex', 'important');
        if (statusText) statusText.textContent = 'Заказчик';
    } else if (mode === 'transport' && groupTransport) {
        groupTransport.style.setProperty('display', 'flex', 'important');
        if (statusText) statusText.textContent = 'Транспорт';
    }

    const buttons = document.querySelectorAll('.toggle-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    } else {
        const activeBtn = document.querySelector(`.${mode}-btn`);
        if (activeBtn) activeBtn.classList.add('active');
    }
    
    const grids = document.querySelectorAll('.bento-grid');
    grids.forEach(grid => grid.classList.remove('active'));
    
    const targetGrid = document.getElementById(`grid-${mode}`);
    if (targetGrid) {
        targetGrid.classList.add('active');
    }
}

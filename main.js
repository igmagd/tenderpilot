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

    // 3. БРОНЕБОЙНЫЕ СВАЙПЫ ПАЛЬЦЕМ ДЛЯ ШТОРКИ МЕНЮ (НА СТАНДАРТЕ TOUCHES)
    let touchStartX = 0;
    const swipeThreshold = 50;

    if (navLinks) {
        navLinks.addEventListener('touchstart', (event) => {
            if (event.touches && event.touches.length > 0) {
                touchStartX = event.touches[0].clientX;
            }
        }, { passive: true });

        navLinks.addEventListener('touchend', (event) => {
            // Для touchend берем данные из changedTouches безопасным методом
            if (event.changedTouches && event.changedTouches.length > 0) {
                const touchEndX = event.changedTouches[0].clientX;
                const diffX = touchEndX - touchStartX;
                
                if (diffX < -swipeThreshold) {
                    shiftMode('next'); // Смахнули влево — вперед
                } else if (diffX > swipeThreshold) {
                    shiftMode('prev'); // Смахнули вправо — назад
                }
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

    // 5. ОЖИВЛЯЕМ BENTO-КАРТОЧКУ: ГИБРИДНЫЙ 3D-РАЗВОРOT И РОСТ ВО ВЕСЬ ЭКРАН
    const bentoCards = document.querySelectorAll('.bento-card');

    bentoCards.forEach(card => {
        const frontIcon = card.querySelector('.bento-card-front .bento-card-flip-icon');
        const backIcon = card.querySelector('.bento-card-back .bento-card-flip-icon');

        // Клик по стрелочке на лицевой стороне — переворачиваем и взрываем во весь экран
        if (frontIcon) {
            frontIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                card.classList.add('is-flipped', 'is-expanded');
            });
        }

        // Клик по стрелочке назад на рубашке — возвращаем плашку компактно в сетку
        if (backIcon) {
            backIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                card.classList.remove('is-flipped', 'is-expanded');
            });
        }

    // Бронебойные мобильные свайпы при зажатии пальцем на карточке
    let cardTouchStartX = 0;

    card.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length > 0) {
            cardTouchStartX = e.touches[0].clientX;
        }
    }, { passive: true });

    card.addEventListener('touchend', (e) => {
        if (e.changedTouches && e.changedTouches.length > 0) {
            const cardTouchEndX = e.changedTouches[0].clientX;
            const cardDiffX = cardTouchStartX - cardTouchEndX;

            if (Math.abs(cardDiffX) > 50) {
                if (cardDiffX > 0) {
                    if (!card.classList.contains('is-flipped')) {
                        card.classList.add('is-expanded', 'is-flipped');
                    }
                } else {
                    if (card.classList.contains('is-flipped')) {
                        card.classList.remove('is-flipped', 'is-expanded');
                    }
                }
            }
        }
    }, { passive: true });

    }); // ЗАКРЫВАЕМ card ВНУТРИ bentoCards.forEach
}); // ЗАКРЫВАЕМ ВСЁ ОБХОЖДЕНИЕ bentoCards.forEach

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

// ПРИВЯЗЫВАЕМ ФУНКЦИЮ К ГЛОБАЛЬНОМУ ОКНУ ДЛЯ РАБОТЫ ONCLICK
window.switchMode = switchMode;
            

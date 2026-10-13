// 1. УПРАВЛЕНИЕ МОБИЛЬНЫМ МЕНЮ (БУРГЕР)
document.addEventListener('DOMContentLoaded', () => {
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
                if (!isExpanded) {
                    iconBurger.style.display = 'none';
                    iconClose.style.display = 'block';
                } else {
                    iconBurger.style.display = 'block';
                    iconClose.style.display = 'none';
                }
            }
        });
    }

    // СВАЙПЫ ДЛЯ ТРЕХ МЕНЮ В ОДНОМ (ИЗОЛИРОВАННЫЕ ДЛЯ НАВИГАЦИИ)
    let menuTouchStartX = 0;
    const modes = ['supplier', 'customer', 'transport'];

    if (navLinks) {
        navLinks.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches.length > 0) {
                menuTouchStartX = e.touches[0].clientX;
            }
        }, { passive: true });

        navLinks.addEventListener('touchend', (e) => {
            if (e.changedTouches && e.changedTouches.length > 0) {
                const menuTouchEndX = e.changedTouches[0].clientX;
                const menuDiffX = menuTouchStartX - menuTouchEndX;

                if (Math.abs(menuDiffX) > 50) {
                    const activeBtn = document.querySelector('.toggle-btn.active');
                    if (!activeBtn) return;
                    
                    let currentMode = 'supplier';
                    if (activeBtn.classList.contains('customer-btn')) currentMode = 'customer';
                    if (activeBtn.classList.contains('transport-btn')) currentMode = 'transport';
                    
                    let currentIndex = modes.indexOf(currentMode);

                    if (menuDiffX > 0) {
                        if (currentIndex < modes.length - 1) {
                            switchMode(modes[currentIndex + 1]);
                        }
                    } else {
                        if (currentIndex > 0) {
                            switchMode(modes[currentIndex - 1]);
                        }
                    }
                }
            }
        }, { passive: true });
    }
});

// КЛИК ПО СТРЕЛОЧКАМ ВНУТРИ МЕНЮ
document.addEventListener('DOMContentLoaded', () => {
    const btnPrev = document.querySelector('.btn-menu-prev');
    const btnNext = document.querySelector('.btn-menu-next');
    const modes = ['supplier', 'customer', 'transport'];

    function getNextMode(direction) {
        const activeBtn = document.querySelector('.toggle-btn.active');
        if (!activeBtn) return 'supplier';
        
        let currentMode = 'supplier';
        if (activeBtn.classList.contains('customer-btn')) currentMode = 'customer';
        if (activeBtn.classList.contains('transport-btn')) currentMode = 'transport';
        
        let index = modes.indexOf(currentMode);
        if (direction === 'next' && index < modes.length - 1) return modes[index + 1];
        if (direction === 'prev' && index > 0) return modes[index - 1];
        return null;
    }

    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            const nextMode = getNextMode('prev');
            if (nextMode) switchMode(nextMode);
        });
    }

    if (btnNext) {
        btnNext.addEventListener('click', () => {
            const nextMode = getNextMode('next');
            if (nextMode) switchMode(nextMode);
        });
    }
});

// 2. ИНТЕРАКТИВНЫЙ 3D-РАЗВОРOТ КАРТОЧЕК С ЗАЩИТОЙ ОТ СКРОЛЛА
function initBentoCards() {
    document.querySelectorAll('.bento-card').forEach(card => {
        var frontSide = card.querySelector('.bento-card-front');
        var closeBtn = card.querySelector('.bento-card-close-icon');
        var startX = 0;
        var startY = 0;

        if (frontSide) {
            frontSide.addEventListener('touchstart', (e) => {
                if (e.touches.length > 0) {
                    startX = e.touches[0].clientX;
                    startY = e.touches[0].clientY;
                }
            }, { passive: true });

            frontSide.addEventListener('touchend', (e) => {
                if (e.changedTouches.length > 0) {
                    var diffX = Math.abs(startX - e.changedTouches[0].clientX);
                    var diffY = Math.abs(startY - e.changedTouches[0].clientY);

                    // 20px на погрешность пальца при тапе
                    if (diffX < 20 && diffY < 20) {
                        e.stopPropagation();
                        
                        if (!card.classList.contains('is-flipped')) {
                            // 1. Сначала плавно переворачиваем рубашкой вверх
                            card.classList.add('is-flipped');
                            
                            // 2. Через 150мс, когда карточка «на ребре», плавно разворачиваем на весь экран
                            setTimeout(() => {
                                if (card.classList.contains('is-flipped')) {
                                    card.classList.add('is-expanded');
                                }
                            }, 150);
                        }
                    }
                }
            }, { passive: true });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // 1. Сначала плавно сжимаем карточку в точку на экране
                card.classList.add('is-closing');
                
                // 2. Ждем 350мс, пока завершится визуальная анимация уменьшения
                setTimeout(() => {
                    // 3. Только теперь полностью сбрасываем все fullscreen-режимы
                    card.classList.remove('is-expanded');
                    card.classList.remove('is-flipped');
                    card.classList.remove('is-closing');
                }, 350);
            });
        }
    });
}


// 3. ДИНАМИЧЕСКОЕ ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ
function switchMode(mode, event) {
    const groupSupplier = document.querySelector('.menu-group-links.menu-group-supplier');
    const groupCustomer = document.querySelector('.menu-group-links.menu-group-customer');
    const groupTransport = document.querySelector('.menu-group-links.menu-group-transport');
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
        const activeBtn = document.querySelector('.' + mode + '-btn');
        if (activeBtn) activeBtn.classList.add('active');
    }

    const grids = document.querySelectorAll('.bento-grid');
    grids.forEach(grid => grid.classList.remove('active'));

    const targetGrid = document.getElementById(`grid-${mode}`);
    if (targetGrid) targetGrid.classList.add('active');

    // Намертво привязываем тапы к карточкам новой Bento-сетки при смене вкладки
    initBentoCards();
}

// Глобальный экспорт функции для внешних вызовов (из кликов и стрелок шапки)
window.switchMode = switchMode;

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

    // ВОЗВРАЩАЕМ СВАЙПЫ ДЛЯ ТРЕХ МЕНЮ В ОДНОМ (ТО, ЧТО РАБОТАЛО!)
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

                // Если свайпнули достаточно сильно (больше 50px)
                if (Math.abs(menuDiffX) > 50) {
                    // Определяем текущий активный режим
                    const activeBtn = document.querySelector('.toggle-btn.active');
                    if (!activeBtn) return;
                    
                    let currentMode = 'supplier';
                    if (activeBtn.classList.contains('customer-btn')) currentMode = 'customer';
                    if (activeBtn.classList.contains('transport-btn')) currentMode = 'transport';
                    
                    let currentIndex = modes.indexOf(currentMode);

                    if (menuDiffX > 0) {
                        // Свайп влево -> следующий режим
                        if (currentIndex < modes.length - 1) {
                            switchMode(modes[currentIndex + 1]);
                        }
                    } else {
                        // Свайп вправо -> предыдущий режим
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

// 2. ИНТЕРАКТИВНЫЙ 3D-РАЗВОРОТ КАРТОЧЕК С ЗАЩИТОЙ ОТ СКРОЛЛА
const bentoCards = document.querySelectorAll('.bento-card');

bentoCards.forEach(card => {
    const frontSide = card.querySelector('.bento-card-front');
const closeBtn = card.querySelector('.bento-card-close-icon');


    let touchStartY = 0;
    let touchStartX = 0;

    if (frontSide) {
        frontSide.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches.length > 0) {
                touchStartY = e.touches[0].clientY;
                touchStartX = e.touches[0].clientX;
            }
        }, { passive: true });

        frontSide.addEventListener('touchend', (e) => {
            if (e.changedTouches && e.changedTouches.length > 0) {
                const touchEndY = e.changedTouches[0].clientY;
                const touchEndX = e.changedTouches[0].clientX;
                
                const diffY = Math.abs(touchStartY - touchEndY);
                const diffX = Math.abs(touchStartX - touchEndX);

                if (diffY > 10 || diffX > 10) return; 

                if (!card.classList.contains('is-flipped')) {
                    card.classList.add('is-flipped');
                    setTimeout(() => {
                        if (card.classList.contains('is-flipped')) {
                            card.classList.add('is-expanded');
                        }
                    }, 150);
                }
            }
        }, { passive: true });
    }

    if (closeBtn) {
      // Тап по крестику закрывает карточку и НЕ трогает свайпы меню
      closeBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation(); // Изолируем тап, чтобы меню не перехватывало его
        card.classList.remove('is-expanded');
        setTimeout(() => {
          card.classList.remove('is-flipped');
        }, 150);
      }, { passive: false });
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
        const activeBtn = document.querySelector(`.${mode}-btn`);
        if (activeBtn) activeBtn.classList.add('active');
    }

    const grids = document.querySelectorAll('.bento-grid');
    grids.forEach(grid => grid.classList.remove('active'));

    const targetGrid = document.getElementById(`grid-${mode}`);
    if (targetGrid) targetGrid.classList.add('active');
}

window.switchMode = switchMode;

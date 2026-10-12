// 1. УПРАВЛЕНИЕ МОБИЛЬНЫМ МЕНЮ (ВАША РОДНАЯ РАБОЧАЯ ВЕРСИЯ)
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
});

// 2. ИНТЕРАКТИВНЫЙ 3D-РАЗВОРОТ КАРТОЧЕК С ЗАЩИТОЙ ОТ СКРОЛЛА
const bentoCards = document.querySelectorAll('.bento-card');

bentoCards.forEach(card => {
    const frontSide = card.querySelector('.bento-card-front');
    const closeBtn = card.querySelector('.bento-card-close-btn');

    let touchStartY = 0;
    let touchStartX = 0;

    if (frontSide) {
        frontSide.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches.length > 0) {
                touchStartY = e.touches.clientY;
                touchStartX = e.touches.clientX;
            }
        }, { passive: true });

        frontSide.addEventListener('touchend', (e) => {
            if (e.changedTouches && e.changedTouches.length > 0) {
                const touchEndY = e.changedTouches.clientY;
                const touchEndX = e.changedTouches.clientX;
                
                const diffY = Math.abs(touchStartY - touchEndY);
                const diffX = Math.abs(touchStartX - touchEndX);

                // Если палец сдвинулся больше чем на 10px — это обычный скролл страницы сайта
                if (diffY > 10 || diffX > 10) {
                    return; 
                }

                // Чистый тап: запускаем элитный 3D-переворот
                if (!card.classList.contains('is-flipped')) {
                    card.classList.add('is-flipped');
                    
                    // Ровно в момент прохождения 90 градусов (через 150мс) раскрываем во весь экран
                    setTimeout(() => {
                        if (card.classList.contains('is-flipped')) {
                            card.classList.add('is-expanded');
                        }
                    }, 150);
                }
            }
        }, { passive: true });
    }

    // Закрытие карточки строго по нашему новому крестику
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            card.classList.remove('is-expanded');
            
            setTimeout(() => {
                card.classList.remove('is-flipped');
            }, 150);
        });
    }
});

// 3. ДИНАМИЧЕСКОЕ ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ (Поставщик / Заказчик / Транспорт)
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

window.switchMode = switchMode;

// ==========================================================================
//   АРХИТЕКТУРНЫЙ СКРИПТ ПЛАТФОРМЫ TENDERPILOT (ЖЕЛЕЗНЫЙ СТАНДАРТ 2026)
// ==========================================================================
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
});

// 2. ИНТЕРАКТИВНЫЙ 3D-РАЗВОРОТ КАРТОЧЕК С ЗАЩИТОЙ ОТ СКРОЛЛА
const bentoCards = document.querySelectorAll('.bento-card');

bentoCards.forEach(card => {
    const frontSide = card.querySelector('.bento-card-front');
    const closeBtn = card.querySelector('.bento-card-close-btn');

    let touchStartY = 0;
    let touchStartX = 0;

    if (frontSide) {
        // Ловим точку первого прикосновения к лицу карточки
        frontSide.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches.length > 0) {
                touchStartY = e.touches[0].clientY;
                touchStartX = e.touches[0].clientX;
            }
        }, { passive: true });

        // Проверяем сдвиг пальца при отпускании
        frontSide.addEventListener('touchend', (e) => {
            if (e.changedTouches && e.changedTouches.length > 0) {
                const touchEndY = e.changedTouches[0].clientY;
                const touchEndX = e.changedTouches[0].clientX;
                
                const diffY = Math.abs(touchStartY - touchEndY);
                const diffX = Math.abs(touchStartX - touchEndX);

                // Если палец сдвинулся больше чем на 10px — это обычный скролл страницы!
                if (diffY > 10 || diffX > 10) {
                    return; // Полностью игнорируем ложное нажатие
                }

                // Это чистый тап: запускаем элитный пошаговый переворот
                if (!card.classList.contains('is-flipped')) {
                    card.classList.add('is-flipped');
                    
                    // Мягко разворачиваем во весь экран строго на 90 градусах (через 150мс)
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
            
            // Сначала плавно уменьшаем карточку обратно в сетку
            card.classList.remove('is-expanded');
            
            // Спустя 150мс мягко возвращаем её лицом к пользователю
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

// Привязываем функцию переключения к глобальному окну
window.switchMode = switchMode;

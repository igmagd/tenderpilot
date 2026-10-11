// ==========================================================================
//   АРХИТЕКТУРНЫЙ СКРИПТ ПЛАТФОРМЫ TENDERPILOT (ЖЕЛЕЗНЫЙ СТАНДАРТ 2026)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;

    // Массив режимов для циклического перелистывания по стрелочкам и свайпам
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
        
        // Запускаем синхронизированное премиальное переключение
        animateModeSwitch(modesChain[currentIndex]);
    }

    if (btnNext) btnNext.addEventListener('click', () => shiftMode('next'));
    if (btnPrev) btnPrev.addEventListener('click', () => shiftMode('prev'));

    // 3. РЕВОЛЮЦИОННЫЕ СВАЙПЫ ПАЛЬЦЕМ НА ТЕЛЕФОНЕ (С ФИКСОМ СДВИГА)
    let touchStartX = 0;
    let touchStartY = 0;
    const swipeThreshold = 40; // Оптимальный порог чувствительности в пикселях

    if (navLinks) {
        navLinks.addEventListener('touchstart', (event) => {
            touchStartX = event.touches[0].clientX;
            touchStartY = event.touches[0].clientY;
        }, { passive: true });

        navLinks.addEventListener('touchmove', (event) => {
            const currentX = event.touches[0].clientX;
            const currentY = event.touches[0].clientY;
            
            const diffX = Math.abs(currentX - touchStartX);
            const diffY = Math.abs(currentY - touchStartY);

            // ФИКС ШИРИНЫ: Если юзер ведет пальцем горизонтально — блокируем стандартный сдвиг экрана браузером
            if (diffX > diffY && diffX > 10) {
                if (event.cancelable) event.preventDefault();
            }
        }, { passive: false });

        navLinks.addEventListener('touchend', (event) => {
            const touchEndX = event.changedTouches[0].clientX;
            const diffX = touchEndX - touchStartX;
            
            // Если свайпнули влево (жест "Вперед")
            if (diffX < -swipeThreshold) {
                shiftMode('next');
            } 
            // Если свайпнули вправо (жест "Назад")
            else if (diffX > swipeThreshold) {
                shiftMode('prev');
            }
        }, { passive: true });
    }

    // 4. СИНХРОННАЯ АНИМАЦИЯ ПЕРЕКЛЮЧЕНИЯ (Единый стиль 0.35s с кубическим сглаживанием)
    function animateModeSwitch(targetMode) {
        const activeGroup = document.querySelector(`.menu-group-${getActiveMode()}`);
        const allItems = activeGroup ? activeGroup.querySelectorAll('.menu-item-link') : [];

        // Шаг А: Мягко тушим текущие ссылки за 0.2s, подготавливая сцену
        if (allItems.length > 0) {
            allItems.forEach(item => {
                item.style.transition = 'opacity 0.2s cubic-bezier(0.25, 1, 0.5, 1)';
                item.style.opacity = '0';
            });
            
            // Ждем 150мс (наша зеркальная пауза) и переключаем контент в тени
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
            // Изначально обнуляем прозрачность новых элементов перед проявлением
            newItems.forEach(item => {
                item.style.opacity = '0';
                item.style.transition = 'none';
            });
            
            // Проявляем новые ссылки в точном ритме открытия меню: 0.35s с кубическим сглаживанием
            setTimeout(() => {
                newItems.forEach(item => {
                    item.style.transition = 'opacity 0.35s cubic-bezier(0.25, 1, 0.5, 1)';
                    item.style.opacity = '1';
                });
            }, 20);
        }
    }
});

// 5. ДИНАМИЧЕСКОЕ ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ (Синхронизация меню и Bento-сеток)
function switchMode(mode, event) {
    const groupSupplier = document.querySelector('.menu-group-supplier');
    const groupCustomer = document.querySelector('.menu-group-customer');
    const groupTransport = document.querySelector('.menu-group-transport');
    const statusText = document.querySelector('.menu-status-text');

    // Прячем все три группы меню
    if (groupSupplier) groupSupplier.style.setProperty('display', 'none', 'important');
    if (groupCustomer) groupCustomer.style.setProperty('display', 'none', 'important');
    if (groupTransport) groupTransport.style.setProperty('display', 'none', 'important');

    // Включаем только нужную группу с высшим приоритетом и обновляем статус-бар
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

    // Переключение кнопок активности в шапке сайта
    const buttons = document.querySelectorAll('.toggle-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    } else {
        const activeBtn = document.querySelector(`.${mode}-btn`);
        if (activeBtn) activeBtn.classList.add('active');
    }
    
    // Переключение отображения Bento-сеток на главном экране под меню
    const grids = document.querySelectorAll('.bento-grid');
    grids.forEach(grid => grid.classList.remove('active'));
    
    const targetGrid = document.getElementById(`grid-${mode}`);
    if (targetGrid) {
        targetGrid.classList.add('active');
    }
}

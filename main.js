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
        // Вычисляем текущий активный режим по открытой группе ссылок
        if (document.querySelector('.menu-group-customer').style.display === 'flex') return 'customer';
        if (document.querySelector('.menu-group-transport').style.display === 'flex') return 'transport';
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
        
        // Вызываем глобальную функцию переключения (она обновит и меню, и сетки на фоне)
        switchMode(modesChain[currentIndex]);
    }

    if (btnNext) btnNext.addEventListener('click', () => shiftMode('next'));
    if (btnPrev) btnPrev.addEventListener('click', () => shiftMode('prev'));

    // 3. РЕВОЛЮЦИОННЫЕ СВАЙПЫ ПАЛЬЦЕМ НА ТЕЛЕФОНЕ
    let touchStartX = 0;
    let touchEndX = 0;
    const swipeThreshold = 50; // Порог в 50 пикселей для защиты от случайных дрожаний

    if (navLinks) {
        navLinks.addEventListener('touchstart', (event) => {
            touchStartX = event.changedTouches[0].screenX;
        }, { passive: true });

        navLinks.addEventListener('touchend', (event) => {
            touchEndX = event.changedTouches[0].screenX;
            handleSwipeGesture();
        }, { passive: true });
    }

    function handleSwipeGesture() {
        const diffX = touchEndX - touchStartX;
        
        // Если палец смахнули влево (жест "Вперед")
        if (diffX < -swipeThreshold) {
            shiftMode('next');
        } 
        // Если палец смахнули вправо (жест "Назад")
        else if (diffX > swipeThreshold) {
            shiftMode('prev');
        }
    }
});

// 4. ДИНАМИЧЕСКОЕ ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ (Синхронизация меню и Bento-сеток)
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

// ==========================================================================
//   АРХИТЕКТУРНЫЙ СКРИПТ ПЛАТФОРМЫ TENDERPILOT (ЖЕЛЕЗНЫЙ СТАНДАРТ 2026)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;

    // 1. ОЖИВЛЯЕМ БУРГЕР: Клик на кнопку открытия/закрытия меню
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            // Переключаем класс открытия для шторки
            navLinks.classList.toggle('open');
            // Переключаем класс на body для мгновенного скрытия кнопок шапки
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
});

// 2. ДИНАМИЧЕСКОЕ ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ (Поставщик, Заказчик, Транспорт)
function switchMode(mode, event) {
    // Находим все группы ссылок в бургер-меню для SEO
    const groupSupplier = document.querySelector('.menu-group-supplier');
    const groupCustomer = document.querySelector('.menu-group-customer');
    const groupTransport = document.querySelector('.menu-group-transport');
    const statusText = document.querySelector('.menu-status-text');

    // Прячем все три группы меню
    if (groupSupplier) groupSupplier.style.display = 'none';
    if (groupCustomer) groupCustomer.style.display = 'none';
    if (groupTransport) groupTransport.style.display = 'none';

    // Включаем только нужную группу и обновляем верхний статус-бар в бургере
    if (mode === 'supplier' && groupSupplier) {
        groupSupplier.style.display = 'flex';
        if (statusText) statusText.textContent = 'Поставщик';
    } else if (mode === 'customer' && groupCustomer) {
        groupCustomer.style.display = 'flex';
        if (statusText) statusText.textContent = 'Заказчик';
    } else if (mode === 'transport' && groupTransport) {
        groupTransport.style.display = 'flex';
        if (statusText) statusText.textContent = 'Транспорт';
    }

    // Логика переключения кнопок активности в шапке
    const buttons = document.querySelectorAll('.toggle-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    } else {
        const activeBtn = document.querySelector(`.${mode}-btn`);
        if (activeBtn) activeBtn.classList.add('active');
    }
    
    // Логика переключения отображения Bento-сеток на главном экране
    const grids = document.querySelectorAll('.bento-grid');
    grids.forEach(grid => grid.classList.remove('active'));
    
    const targetGrid = document.getElementById(`grid-${mode}`);
    if (targetGrid) {
        targetGrid.classList.add('active');
    }
        }

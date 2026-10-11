// ==========================================================================
//   АРХИТЕКТУРНЫЙ СКРИПТ ПЛАТФОРМЫ TENDERPILOT (ЖЕЛЕЗНЫЙ СТАНДАРТ 2026)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    
    // ----------------------------------------------------------------------
    // 1. УПРАВЛЕНИЕ МОБИЛЬНЫМ МЕНЮ (БУРГЕР)
    // ----------------------------------------------------------------------
    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");

    if (menuToggle && navLinks) {
        menuToggle.onclick = (e) => {
            e.stopPropagation();
            const isOpen = navLinks.classList.toggle("open");
            menuToggle.classList.toggle("is-open", isOpen);
            document.body.classList.toggle("menu-open", isOpen);
            document.body.style.overflow = isOpen ? "hidden" : "";
        };

        // Закрытие меню при клике на любую ссылку внутри него
        navLinks.onclick = () => {
            navLinks.classList.remove("open");
            menuToggle.classList.remove("is-open");
            document.body.classList.remove("menu-open");
            document.body.style.overflow = "";
        };
    }

    // ----------------------------------------------------------------------
    // 2. БАННЕР КУКИ
    // ----------------------------------------------------------------------
    const cookieBanner = document.getElementById("cookie-banner");
    const cookieAccept = document.getElementById("cookie-accept");

    if (cookieBanner && cookieAccept) {
        cookieAccept.addEventListener("click", () => {
            cookieBanner.style.display = "none";
        });
    }
});

// ----------------------------------------------------------------------
// 3. СИСТЕМНОЕ ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ (BENTO GRIDS)
// ----------------------------------------------------------------------
function switchMode(mode, event) {
    // 1. Управление группами ссылок в бургер-меню для SEO
    const groupSupplier = document.querySelector('.menu-group-supplier');
    const groupCustomer = document.querySelector('.menu-group-customer');
    const groupTransport = document.querySelector('.menu-group-transport');
    const statusText = document.querySelector('.menu-status-text');

    // Прячем все группы меню
    if (groupSupplier) groupSupplier.style.display = 'none';
    if (groupCustomer) groupCustomer.style.display = 'none';
    if (groupTransport) groupTransport.style.display = 'none';

    // Включаем нужную группу и обновляем верхний статус-бар в бургере
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

    // 2. Оригинальная логика переключения кнопок активности и Bento-сеток
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

// ----------------------------------------------------------------------
// 4. ГЛОБАЛЬНЫЙ МОДУЛЬ УПРАВЛЕНИЯ МОДАЛЬНЫМИ ОКНАМИ
// ----------------------------------------------------------------------
function openModal(modalId) {
    const modal = document.getElementById(`modal-${modalId}`);
    if (modal) {
        modal.classList.add("open");
        document.body.style.overflow = "hidden"; // Блокируем скролл фона
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(`modal-${modalId}`);
    if (modal) {
        modal.classList.remove("open");
        // Возвращаем скролл, только если нет других открытых модалок или бургер-меню
        const isBurgerOpen = document.getElementById("nav-links")?.classList.contains("open");
        if (!isBurgerOpen) {
            document.body.style.overflow = "";
        }
    }
}

// Старые функции-заглушки перенаправляем в наш новый универсальный модуль модалок:
function openGuaranteeModal() { openModal("guarantee"); }
function closeGuaranteeModal() { closeModal("guarantee"); }

function openTkModal() { openModal("tk"); }
function closeTkModal() { closeModal("tk"); }

function openCalcModal() { openModal("calc"); }
function closeCalcModal() { closeModal("calc"); }

function openLegalModal() { openModal("legal"); }
function closeLegalModal() { closeModal("legal"); }

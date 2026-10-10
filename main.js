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
function switchMode(mode, e) {
    if (e && e.currentTarget) {
        e.currentTarget.blur();
    }
    // 1. Находим и отличаем активное состояние кнопок...
    const buttons = [
        document.getElementById("btn-supplier"),
        document.getElementById("btn-customer"),
        document.getElementById("btn-transport")
    ];
    buttons.forEach(btn => btn?.classList.remove("active"));

    // 2. Находим абсолютно все бенто-сетки на странице
    const grids = [
        document.getElementById("grid-supplier"),
        document.getElementById("grid-customer"),
        document.getElementById("grid-transport")
    ];
    // Прячем их системным классом по умолчанию
    grids.forEach(grid => grid?.classList.add("hidden"));

    // 3. Включаем целевую кнопку и целевую сетку по переданному аргументу
    const targetButton = document.getElementById(`btn-${mode}`);
    const targetGrid = document.getElementById(`grid-${mode}`);

    if (targetButton && targetGrid) {
        targetButton.classList.add("active");
        targetGrid.classList.remove("hidden");
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

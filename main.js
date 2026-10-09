// ==========================================
// 1. МОБИЛЬНОЕ МЕНЮ И НАВИГАЦИЯ
// ==========================================
const menuToggle = document.getElementById("menu-toggle");
const nav = document.getElementById("nav-links");

if (menuToggle && nav) {
  // Открытие и закрытие шторки при клике на бургер
  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = nav.classList.toggle("open");
    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", isOpen);
  });

  // Автозакрытие шторки при клике на любую из 10 ссылок
  const menuLinks = nav.querySelectorAll("a");
  menuLinks.forEach(link => {
    link.addEventListener("click", () => {
      closeAllMobileMenus();
    });
  });
}

function closeAllMobileMenus() {
  if (nav && menuToggle) {
    nav.classList.remove('open');
    menuToggle.classList.remove('is-open');
    menuToggle.setAttribute("aria-expanded", "false");
  }
}

// ==========================================
// 2. БАННЕР КУКИ
// ==========================================
const cookieBanner = document.getElementById('cookie-banner');
const cookieAccept = document.getElementById('cookie-accept');

if (cookieBanner && cookieAccept) {
  cookieAccept.addEventListener('click', () => {
    cookieBanner.style.display = 'none';
  });
}

// ==========================================
// 3. ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ (BENTO GRID)
// ==========================================
function switchMode(mode) {
  // Находим все три кнопки и убираем у них активный класс
  document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
  
  // Находим все три сетки
  const supplierGrid = document.getElementById('supplier-grid');
  const customerGrid = document.getElementById('customer-grid');
  const transportGrid = document.getElementById('transport-grid');
  
  // Прячем абсолютно все сетки по умолчанию
  if (supplierGrid) supplierGrid.classList.add('hidden');
  if (customerGrid) customerGrid.classList.add('hidden');
  if (transportGrid) transportGrid.classList.add('hidden');
  
  // Включаем нужную кнопку и показываем соответствующую сетку
  if (mode === 'supplier') {
    document.querySelector('.supplier-btn')?.classList.add('active');
    supplierGrid?.classList.remove('hidden');
  } else if (mode === 'customer') {
    document.querySelector('.customer-btn')?.classList.add('active');
    customerGrid?.classList.remove('hidden');
  } else if (mode === 'transport') {
    document.querySelector('.transport-btn')?.classList.add('active');
    transportGrid?.classList.remove('hidden');
  }
    }

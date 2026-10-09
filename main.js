// ==========================================
// 1. МОБИЛЬНОЕ МЕНЮ И НАВИГАЦИЯ
// ==========================================
const menuToggle = document.getElementById("menuToggle");
const nav = document.querySelector(".nav-links");
if (menuToggle && nav) {
    menuToggle.onclick = (e) => {
        e.stopPropagation();
        const isOpen = nav.classList.toggle("open");
        menuToggle.classList.toggle("is-open", isOpen);
        document.body.classList.toggle("menu-open", isOpen);
        document.body.style.overflow = isOpen ? "hidden" : "";
    };
    nav.onclick = () => {
        nav.classList.remove('open');
        menuToggle.classList.remove('is-open');
        document.body.classList.remove("menu-open");
        document.body.style.overflow = '';
    };
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
// 3. ПЕР ЕКЛЮЧЕНИЕ РЕЖИМОВ (BENTO GRID)
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

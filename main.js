// ==========================================
// 1. МОБИЛЬНОЕ МЕНЮ И НАВИГАЦИЯ
// ==========================================
const menuToggle = document.getElementById('menuToggle') || document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links') || document.getElementById('nav-links');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = menuToggle.classList.toggle('is-open');
        navLinks.classList.toggle('open', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('is-open');
            navLinks.classList.remove('open');
            document.body.style.overflow = '';
        });
    });
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

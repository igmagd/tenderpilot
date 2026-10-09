// Модальные окна

function openGuaranteeModal() { document.getElementById('guarantee-modal').classList.add('open'); }
function closeGuaranteeModal() { document.getElementById('guarantee-modal').classList.remove('open'); }

function openTkModal() { document.getElementById('tk-modal').classList.add('open'); }
function closeTkModal() { document.getElementById('tk-modal').classList.remove('open'); }

function openCalcModal() { document.getElementById('calc-modal').classList.add('open'); }
function closeCalcModal() { document.getElementById('calc-modal').classList.remove('open'); }

function openLegalModal() { document.getElementById('legal-modal').classList.add('open'); } 
function closeLegalModal() { document.getElementById('legal-modal').classList.remove('open'); }

function openModal(service) { alert('Демо-режим для сервиса: ' + service); }

const menuToggle = document.getElementById("menu-toggle");
const nav = document.getElementById("nav-links");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = nav.classList.toggle("open");
    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", isOpen);
  });

  // Автозакрытие меню: ищем все 10 ссылок внутри шторки и вешаем на них закрытие
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

const cookieBanner = document.getElementById('cookie-banner');
const cookieAccept = document.getElementById('cookie-accept');

if (cookieBanner && cookieAccept) {
    cookieAccept.addEventListener('click', () => {
        cookieBanner.style.display = 'none';
    });
          }

function switchMode(mode) {
    // Находим все три кнопки и убираем у них класс активности
    document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
    
    // Находим все три сетки
    const supplierGrid = document.getElementById('supplier-grid');
    const customerGrid = document.getElementById('customer-grid');
    const transportGrid = document.getElementById('transport-grid');

    // Прячем абсолютно все сетки по умолчанию
    if (supplierGrid) supplierGrid.classList.add('hidden');
    if (customerGrid) customerGrid.classList.add('hidden');
    if (transportGrid) transportGrid.classList.add('hidden');

    // Включаем нужную кнопку и показываем только её сетку
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

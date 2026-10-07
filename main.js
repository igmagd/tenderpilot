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
        menuToggle.textContent = isOpen ? "×" : "☰";
        menuToggle.setAttribute("aria-expanded", isOpen);
    });
}

function closeAllMobileMenus() {
    if (nav && menuToggle) {
        nav.classList.remove('open');
        menuToggle.classList.remove('is-open');
        menuToggle.textContent = "☰";
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


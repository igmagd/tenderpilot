// 1. ГЛОБАЛЬНЫЙ СТЕЙТ ПЛАТФОРМЫ TENDERPILOT
window.tenderpilot = {
    'current-mode-index': 0,
    'modes-list': ['supplier', 'customer', 'transport'],
    'modes-titles': {
        'supplier': 'Панель Поставщика',
        'customer': 'Панель Заказчика',
        'transport': 'Панель Логистики'
    },
    'touch-start-x': 0,
    'touch-end-x': 0
};

function switch_app_mode(target_mode) {
    var state = window.tenderpilot;
    if (!state['modes-list'].includes(target_mode)) return;
    
    document.body.setAttribute('data-world', target_mode);

    state['modes-list'].forEach(function (mode) {
        var grid = document.getElementById('grid-' + mode);
        if (grid) { grid.style.display = (mode === target_mode) ? 'grid' : 'none'; }
    });

    var status_text = document.querySelector('.menu-status-text');
    if (status_text) status_text.textContent = state['modes-titles'][target_mode];
    state['current-mode-index'] = state['modes-list'].indexOf(target_mode);

    document.querySelectorAll('.mode-btn').forEach(function (btn) {
        btn.classList.toggle('active', btn.getAttribute('data-mode') === target_mode);
    });
}

// 2. НАВИГАЦИЯ, МЕНЮ И СВАЙПЫ
function init_core_events() {
    document.querySelectorAll('.mode-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            switch_app_mode(btn.getAttribute('data-mode'));
        });
    });

    var toggle = document.getElementById('menu-toggle');
    if (toggle) {
        toggle.addEventListener('click', function (e) {
            e.preventDefault();
            var nav = document.querySelector('.nav-links');
            if (!nav) return;
            var active = toggle.classList.toggle('active');
            nav.classList.toggle('active', active);
            document.body.style.overflow = active ? 'hidden' : '';
        });
    }

    var navLinksContainer = document.querySelector('.nav-links');
    if (navLinksContainer) {
        navLinksContainer.querySelectorAll('.menu-item-link').forEach(function (link) {
            link.addEventListener('click', function () {
                var toggle_btn = document.getElementById('menu-toggle');
                if (toggle_btn) toggle_btn.classList.remove('active');
                navLinksContainer.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
}

function shift(dir) {
    var state = window.tenderpilot;
    var max = state['modes-list'].length;
    var next = (state['current-mode-index'] + dir + max) % max;
    switch_app_mode(state['modes-list'][next]);
}
// Инициализация стрелок мобильного статус-бара
var prev = document.querySelector('.menu-status-arrows .menu-arrow-icon:first-child');
var next = document.querySelector('.menu-status-arrows .menu-arrow-icon:last-child');
if (prev) prev.addEventListener('click', function () { shift(-1); });
if (next) next.addEventListener('click', function () { shift(1); });

// Реализация отказоустойчивых тач-свайпов по экрану (порог 70px)
document.body.addEventListener('touchstart', function (e) {
    if (e.target.closest('.bento-card-back') || e.target.closest('.is-flipped') || e.target.closest('.nav-links')) return;
    window.tenderpilot['touch-start-x'] = e.changedTouches[0].screenX;
}, { passive: true });

document.body.addEventListener('touchend', function (e) {
    if (e.target.closest('.bento-card-back') || e.target.closest('.is-flipped') || e.target.closest('.nav-links')) return;
    window.tenderpilot['touch-end-x'] = e.changedTouches[0].screenX;
    var diff = window.tenderpilot['touch-start-x'] - window.tenderpilot['touch-end-x'];
    if (Math.abs(diff) > 70) { shift(diff > 0 ? 1 : -1); }
}, { passive: true });

// МОНОЛИТНАЯ 3D-ЛОГИКА BENTO-КАРТОЧЕК (БЕЗ POSITION: FIXED)
document.querySelectorAll('.bento-grid').forEach(function (grid) {
    grid.addEventListener('click', function (e) {
        var card = e.target.closest('.bento-card');
        if (!card) return;

        var inner = card.querySelector('.bento-card-inner');
        var close = e.target.closest('.bento-card-close-icon');

        if (close) {
            e.stopPropagation();
            card.classList.remove('is-expanded');
            setTimeout(function () { card.classList.remove('is-flipped'); }, 150);
            return;
        }

        if (!card.classList.contains('is-flipped')) {
            card.classList.add('is-flipped');
        } else if (!card.classList.contains('is-expanded') && !e.target.closest('.bento-card-back-header')) {
            var rect = card.getBoundingClientRect();
            var scaleX = window.innerWidth / rect.width;
            var scaleY = window.innerHeight / rect.height;
            var translateX = (window.innerWidth / 2) - (rect.left + rect.width / 2);
            var translateY = (window.innerHeight / 2) - (rect.top + rect.height / 2);

            inner.style.setProperty('--target-transform', 'translate3d(' + translateX + 'px, ' + translateY + 'px, 0) scale3d(' + scaleX + ', ' + scaleY + ', 1)');
            card.classList.add('is-expanded');
        }
    });
});

// Запуск всех базовых событий после полной загрузки DOM-дерева
document.addEventListener('DOMContentLoaded', function () {
    init_core_events();
});

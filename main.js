(function () {
    'use strict';

    // 1. ГЛОБАЛЬНЫЙ СТЭЙТ И РЕАКТИВНОЕ ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ
    window.tenderpilot = {
        'current-mode-index': 0,
        'modes-list': ['supplier', 'customer', 'transport'],
        'touch-start-x': 0,
        'modes-titles': { 'supplier': 'Поставщик', 'customer': 'Заказчик', 'transport': 'Грузоперевозки' }
    };

    function switch_app_mode(target_mode) {
        var state = window.tenderpilot;
        if (!state['modes-list'].includes(target_mode)) return;

        state['modes-list'].forEach(function (mode) {
            var groups = document.querySelectorAll('.group-' + mode);
            groups.forEach(function (el) { el.style.display = (mode === target_mode) ? 'flex' : 'none'; });

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
        var nav = document.querySelector('.nav-links');

        if (toggle && nav) {
            function closeMenu() {
                toggle.classList.remove('active');
                nav.classList.remove('active');
                setTimeout(function () {
                    document.body.classList.remove('menu-open');
                }, 250);
            }

            toggle.addEventListener('click', function (e) {
                e.preventDefault();
                if (toggle.classList.contains('active')) {
                    closeMenu();
                } else {
                    toggle.classList.add('active');
                    nav.classList.add('active');
                    document.body.classList.add('menu-open');
                }
            });

            nav.querySelectorAll('.menu-item-link').forEach(function (link) {
                link.addEventListener('click', function () {
                    closeMenu();
                });
            });
        }

        function shift(dir) {
            var state = window.tenderpilot;
            var max = state['modes-list'].length;
            var next = (state['current-mode-index'] + dir + max) % max;
            switch_app_mode(state['modes-list'][next]);
        }

        var prev = document.querySelector('.btn-menu-prev');
        var next = document.querySelector('.btn-menu-next');

        if (prev) prev.addEventListener('click', function (e) { e.preventDefault(); shift(-1); });
        if (next) next.addEventListener('click', function (e) { e.preventDefault(); shift(1); });

        // ИСПРАВЛЕННАЯ ЗАЩИТА СВАЙПОВ: Добавили исключение для нового оверлея
        document.body.addEventListener('touchstart', function (e) {
            if (e.target.closest('.bento-card-back') || e.target.closest('.bento-overlay-modal')) return;
            window.tenderpilot['touch-start-x'] = e.touches.clientX;
        }, { passive: true });

        document.body.addEventListener('touchend', function (e) {
            if (e.target.closest('.bento-card-back') || e.target.closest('.bento-overlay-modal')) return;
            var diff = window.tenderpilot['touch-start-x'] - e.changedTouches.clientX;
            if (Math.abs(diff) > 70) shift(diff > 0 ? 1 : -1);
        }, { passive: true });
    }

    // 3. БЫСТРОЕ ВСПЛЫТИЕ (ФИНАЛЬНАЯ ОПТИМИЗИРОВАННАЯ ВЕРСИЯ)
    function init_bento() {
        document.body.addEventListener('click', function (e) {
            var card = e.target.closest('.bento-card');
            
            // Если кликнули по крестику закрытия внутри уже открытого оверлея
            if (e.target.closest('.bento-card-close-icon')) {
                e.stopPropagation();
                e.preventDefault();
                var overlay = document.querySelector('.bento-overlay-modal');
                if (overlay) {
                    overlay.classList.remove('active');
                    document.body.classList.remove('bento-active');
                    setTimeout(function() {
                        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                    }, 250);
                }
                return;
            }

            // Исключения: если нет карточки, это главная hero-карточка или кликнули внутри открытого оверлея
            if (!card || card.classList.contains('main-hero') || e.target.closest('.bento-overlay-modal')) return;

            e.stopPropagation();
            e.preventDefault();
            
            var backCard = card.querySelector('.bento-card-back');
            var backContent = backCard ? backCard.innerHTML : '';
            
            var overlay = document.createElement('div');
            overlay.classList.add('bento-overlay-modal');
            overlay.innerHTML = backContent;
            
            document.body.appendChild(overlay);
            
            // Принудительно сбрасываем старые стили невидимости контента изнанки в окне
            overlay.style.setProperty('opacity', '1', 'important');
            
            // Заставляем шторку модалки плавно выехать на GPU за 250мс
            window.getComputedStyle(overlay).opacity; // Force reflow
            
            overlay.classList.add('active');
            document.body.classList.add('bento-active');
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        init_core_events();
        init_bento();
        switch_app_mode('supplier');
    });
})();
                        

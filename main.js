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


    // 3. ИСПРАВЛЕННАЯ ИДЕАЛЬНАЯ АНИМАЦИЯ БЕНТО-КАРТОЧЕК С ПРЕДОХРАНИТЕЛЕМ
    function init_bento() {
        document.body.addEventListener('click', function (e) {
            var card = e.target.closest('.bento-card');
            
            // Если кликнули не по карте, или по крестику, или карта уже клонирована — игнорируем
            if (!card || e.target.closest('.bento-card-close-icon') || card.classList.contains('is-cloned')) return;

            // ПРОФЕССИОНАЛЬНЫЙ ПРЕДОХРАНИТЕЛЬ: Главная карточка-баннер не должна открываться
            if (card.classList.contains('main-hero')) return;

            e.stopPropagation();

            var rect = card.getBoundingClientRect();
            var clone = card.cloneNode(true);
            clone.id = card.id + '-clone';
            clone.classList.add('bento-card-clone');
            
            clone.style.top = rect.top + 'px';
            clone.style.left = rect.left + 'px';
            clone.style.width = rect.width + 'px';
            clone.style.height = rect.height + 'px';
            clone.style.borderRadius = window.getComputedStyle(card).borderRadius;

            document.body.appendChild(clone);
            window.getComputedStyle(clone).transform;

            card.classList.add('is-cloned');
            document.body.classList.add('bento-active');

            requestAnimationFrame(function () {
                clone.classList.add('is-expanded', 'is-flipped');
            });

            var closeIcon = clone.querySelector('.bento-card-close-icon');
            if (closeIcon) {
                closeIcon.addEventListener('click', function (event) {
                    event.stopPropagation();
                    
                    var actualRect = card.getBoundingClientRect();
                    
                    clone.classList.remove('is-expanded', 'is-flipped');
                    clone.style.top = actualRect.top + 'px';
                    clone.style.left = actualRect.left + 'px';
                    clone.style.width = actualRect.width + 'px';
                    clone.style.height = actualRect.height + 'px';
                    clone.style.borderRadius = window.getComputedStyle(card).borderRadius;

                    clone.addEventListener('transitionend', function () {
                        if (!clone.classList.contains('is-expanded')) {
                            card.classList.remove('is-cloned');
                            
                            clone.style.transition = 'opacity 150ms ease';
                            clone.style.opacity = '0';
                            
                            setTimeout(function () {
                                document.body.classList.remove('bento-active');
                                if (clone.parentNode) clone.parentNode.removeChild(clone);
                            }, 150);
                        }
                    }, { once: true });
                });
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        init_core_events();
        init_bento();
        switch_app_mode('supplier');
    });
})();

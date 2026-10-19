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
            // Переключение видимости групп
            var groups = document.querySelectorAll('.group-' + mode);
            groups.forEach(function (el) { 
                el.style.setProperty('display', (mode === target_mode) ? 'flex' : 'none', 'important'); 
            });

            // Переключение видимости гридов
            var grid = document.getElementById('grid-' + mode);
            if (grid) { 
                grid.style.setProperty('display', (mode === target_mode) ? 'grid' : 'none', 'important'); 
            }
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
            var closeMenu = function() {
                toggle.classList.remove('active');
                nav.classList.remove('active');
                setTimeout(function () {
                    document.body.classList.remove('menu-open');
                }, 250);
            };

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

        document.body.addEventListener('touchstart', function (e) {
            if (e.target.closest('.bento-card-back') || e.target.closest('.is-flipped')) return;
            window.tenderpilot['touch-start-x'] = e.touches.clientX;
        }, { passive: true });

        document.body.addEventListener('touchend', function (e) {
            if (e.target.closest('.bento-card-back') || e.target.closest('.is-flipped')) return;
            var diff = window.tenderpilot['touch-start-x'] - e.changedTouches.clientX;
            if (Math.abs(diff) > 70) shift(diff > 0 ? 1 : -1);
        }, { passive: true });
    }

    // 3. СТАБИЛИЗИРОВАННАЯ АНИМАЦИЯ БЕНТО-КАРТОЧЕК
    function init_bento() {
        var bentoGrid = document.querySelector('.bento-grid');
        if (!bentoGrid) return;

        bentoGrid.querySelectorAll('.bento-card').forEach(function (card) {
            card.addEventListener('click', function (e) {
                e.stopPropagation();
                if (e.target.closest('.bento-card-close-icon') || card.classList.contains('is-cloned')) return;

                var rect = card.getBoundingClientRect();
                var clone = card.cloneNode(true);
                clone.id = card.id + '-clone';
                clone.classList.add('bento-card-clone');
                
                // Фиксируем стартовую геометрию клона через !important, перебивая жесткий CSS
                clone.style.setProperty('position', 'fixed', 'important');
                clone.style.setProperty('top', rect.top + 'px', 'important');
                clone.style.setProperty('left', rect.left + 'px', 'important');
                clone.style.setProperty('width', rect.width + 'px', 'important');
                clone.style.setProperty('height', rect.height + 'px', 'important');
                clone.style.setProperty('border-radius', window.getComputedStyle(card).borderRadius, 'important');

                document.body.appendChild(clone);
                
                // Принудительный reflow для регистрации стартовой точки анимации
                window.getComputedStyle(clone).transform;

                card.classList.add('is-cloned');
                document.body.classList.add('bento-active');

                // Двойной фрейм для обеспечения бесшовного старта анимации расширения
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                        clone.classList.add('is-expanded', 'is-flipped');
                        clone.style.setProperty('top', '0px', 'important');
                        clone.style.setProperty('left', '0px', 'important');
                        clone.style.setProperty('width', '100vw', 'important');
                        clone.style.setProperty('height', '100dvh', 'important');
                    });
                });

                var closeIcon = clone.querySelector('.bento-card-close-icon');
                if (closeIcon) {
                    closeIcon.addEventListener('click', function (event) {
                        event.stopPropagation();
                        
                        // Возвращаем в исходный размер
                        clone.classList.remove('is-expanded', 'is-flipped');
                        clone.style.setProperty('top', rect.top + 'px', 'important');
                        clone.style.setProperty('left', rect.left + 'px', 'important');
                        clone.style.setProperty('width', rect.width + 'px', 'important');
                        clone.style.setProperty('height', rect.height + 'px', 'important');

                        var onTransitionEnd = function () {
                            if (!clone.classList.contains('is-expanded')) {
                                document.body.classList.remove('bento-active');
                                if (clone.parentNode) clone.parentNode.removeChild(clone);
                                card.classList.remove('is-cloned');
                            }
                        };
                        clone.addEventListener('transitionend', onTransitionEnd, { once: true });
                    });
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        init_core_events();
        init_bento();
        switch_app_mode('supplier');
    });
})();


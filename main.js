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

        document.body.addEventListener('touchstart', function (e) {
            if (e.target.closest('.bento-card-back') || e.target.closest('.bento-card-clone')) return;
            window.tenderpilot['touch-start-x'] = e.touches.clientX;
        }, { passive: true });

        document.body.addEventListener('touchend', function (e) {
            if (e.target.closest('.bento-card-back') || e.target.closest('.bento-card-clone')) return;
            var diff = window.tenderpilot['touch-start-x'] - e.changedTouches.clientX;
            if (Math.abs(diff) > 70) shift(diff > 0 ? 1 : -1);
        }, { passive: true });
    }

    // 3. ФИНАЛЬНЫЙ БЕСШОВНЫЙ 3D-ВЗЛЕТ НА GPU (БЕЗ ТОЛЧКОВ КОНТЕНТА)
    function init_bento() {
        document.body.addEventListener('click', function (e) {
            var card = e.target.closest('.bento-card');
            
            if (!card || card.classList.contains('main-hero') || e.target.closest('.bento-card-close-icon') || card.classList.contains('is-cloned')) return;

            e.stopPropagation();

            var rect = card.getBoundingClientRect();
            
            // Создаем чистый, изолированный 3D-контейнер для разворота
            var clone = document.createElement('div');
            clone.classList.add('bento-card-clone');
            
            // Копируем только заднюю структуру (контент разворота), чтобы не тащить кашу стилей лица
            var backContent = card.querySelector('.bento-card-back') ? card.querySelector('.bento-card-back').innerHTML : '';
            
            clone.innerHTML = `
                <div class="bento-card-inner">
                    <div class="bento-card-front"></div>
                    <div class="bento-card-back">${backContent}</div>
                </div>
            `;
            
            // Фиксируем стартовую геометрию строго поверх оригинальной карточки
            clone.style.top = rect.top + 'px';
            clone.style.left = rect.left + 'px';
            clone.style.width = rect.width + 'px';
            clone.style.height = rect.height + 'px';
            clone.style.borderRadius = window.getComputedStyle(card).borderRadius;

            document.body.appendChild(clone);
            window.getComputedStyle(clone).transform; // Force reflow

            card.classList.add('is-cloned');
            document.body.classList.add('bento-active');

            // Запускаем взлет на весь экран и 3D поворот на GPU
            requestAnimationFrame(function () {
                clone.classList.add('is-expanded', 'is-flipped');
            });

            var closeIcon = clone.querySelector('.bento-card-close-icon');
            if (closeIcon) {
                closeIcon.addEventListener('click', function (event) {
                    event.stopPropagation();
                    clone.style.pointerEvents = 'none';
                    
                    var actualRect = card.getBoundingClientRect();
                    
                    // ОБРАТНЫЙ ПОЛЕТ: Возвращаем клон ровно в границы оригинальной рамки
                    clone.classList.remove('is-expanded', 'is-flipped');
                    clone.style.top = actualRect.top + 'px';
                    clone.style.left = actualRect.left + 'px';
                    clone.style.width = actualRect.width + 'px';
                    clone.style.height = actualRect.height + 'px';
                    clone.style.borderRadius = window.getComputedStyle(card).borderRadius;

                    // За 100мс до посадки плавно включаем видимость оригинальной карточки в сетке
                    setTimeout(function() {
                        card.classList.remove('is-cloned');
                    }, 300);

                    // Полное удаление структуры по окончании анимации (400мс)
                    setTimeout(function () {
                        clone.style.setProperty('transition', 'opacity 100ms ease', 'important');
                        clone.style.opacity = '0';
                        
                        setTimeout(function () {
                            document.body.classList.remove('bento-active');
                            if (clone.parentNode) clone.parentNode.removeChild(clone);
                        }, 100);
                    }, 400);
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

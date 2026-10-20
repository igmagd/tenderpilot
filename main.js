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
            // Переключаем группы ссылок в меню
            var groups = document.querySelectorAll('.group-' + mode);
            groups.forEach(function (el) { 
                if (mode === target_mode) {
                    el.classList.add('mode-visible');
                } else {
                    el.classList.remove('mode-visible');
                }
            });

            // Переключаем сетки бенто
            var grid = document.getElementById('grid-' + mode);
            if (grid) { 
                grid.style.display = (mode === target_mode) ? 'grid' : 'none'; 
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

    // 3. ИСПРАВЛЕННАЯ АНИМАЦИЯ БЕНТО-КАРТОЧЕК С ФИКСАЦИЕЙ КООРДИНАТ
    function init_bento() {
        document.body.addEventListener('click', function (e) {
            var card = e.target.closest('.bento-card');
            
            if (!card || e.target.closest('.bento-card-close-icon') || card.classList.contains('is-cloned')) return;
            if (card.classList.contains('main-hero')) return;

            e.stopPropagation();

            // ЗАПОМИНАЕМ ИСХОДНЫЕ КООРДИНАТЫ ДО СДВИГОВ СЕТКИ
            var startRect = card.getBoundingClientRect();
            var startTop = startRect.top;
            var startLeft = startRect.left;
            var startWidth = startRect.width;
            var startHeight = startRect.height;
            var startBorderRadius = window.getComputedStyle(card).borderRadius;

            var clone = card.cloneNode(true);
            clone.id = card.id + '-clone';
            clone.classList.add('bento-card-clone');
            
            clone.style.top = startTop + 'px';
            clone.style.left = startLeft + 'px';
            clone.style.width = startWidth + 'px';
            clone.style.height = startHeight + 'px';
            clone.style.borderRadius = startBorderRadius;

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
                    
                    // ВОЗВРАЩАЕМ КЛОН СТРОГО В ТЕ КООРДИНАТЫ, ОТКУДА ОН СТАРТОВАЛ
                    clone.classList.remove('is-expanded', 'is-flipped');
                    clone.style.top = startTop + 'px';
                    clone.style.left = startLeft + 'px';
                    clone.style.width = startWidth + 'px';
                    clone.style.height = startHeight + 'px';
                    clone.style.borderRadius = startBorderRadius;

                    // Ждем окончания движения
                    clone.addEventListener('transitionend', function handleClose(e) {
                        if (e.propertyName === 'top' || e.propertyName === 'left' || e.propertyName === 'width') {
                            clone.removeEventListener('transitionend', handleClose);
                            
                            // Показываем оригинальную карту
                            card.classList.remove('is-cloned');
                            
                            // Плавно растворяем на месте
                            clone.style.opacity = '0';
                            
                            setTimeout(function () {
                                document.body.classList.remove('bento-active');
                                if (clone.parentNode) clone.parentNode.removeChild(clone);
                            }, 150);
                        }
                    });
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

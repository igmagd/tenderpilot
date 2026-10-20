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

    // 3. АППАРАТНЫЙ БЕСШОВНЫЙ ВЗЛЕТ НА GPU НА СВОЙСТВЕ TRANSFORM (БЕЗ ШЛЕЙФОВ И РАССИНХРОНА)
    function init_bento() {
        document.body.addEventListener('click', function (e) {
            var card = e.target.closest('.bento-card');
            if (!card || card.classList.contains('main-hero') || e.target.closest('.bento-card-close-icon') || card.classList.contains('is-cloned')) return;

            e.stopPropagation();

            var rect = card.getBoundingClientRect();
            var clone = document.createElement('div');
            clone.classList.add('bento-card-clone');
            
            // Затаскиваем только контент изнанки — без лишних оберток и лицевых пустышек
            var backContent = card.querySelector('.bento-card-back') ? card.querySelector('.bento-card-back').innerHTML : '';
            clone.innerHTML = backContent;
            
            // Изначально клон создается сразу в координатах фуллскрина
            clone.style.top = '0px';
            clone.style.left = '0px';
            clone.style.width = '100vw';
            clone.style.height = '100dvh';
            clone.style.borderRadius = '0px';

            // Но через transform мы мгновенно сжимаем его до размеров ячейки
            var scaleX = rect.width / window.innerWidth;
            var scaleY = rect.height / window.innerHeight;
            var translateX = rect.left - (window.innerWidth - rect.width) / 2;
            var translateY = rect.top - (window.innerHeight - rect.height) / 2;

            // Стартовая точка на GPU: сжата на месте ячейки, повернута в 0
            clone.style.transform = 'translate3d(' + translateX + 'px, ' + translateY + 'px, 0) scale3d(' + scaleX + ', ' + scaleY + ', 1) rotateY(0deg)';

            document.body.appendChild(clone);
            window.getComputedStyle(clone).transform; // Силовой рендер GPU

            card.classList.add('is-cloned');
            document.body.classList.add('bento-active');

            // ВЗЛЕТ: Возвращаем масштаб в 1 и крутим на 180 градусов в одной команде
            requestAnimationFrame(function () {
                clone.style.transform = 'translate3d(0, 0, 0) scale3d(1, 1, 1) rotateY(180deg)';
                clone.classList.add('is-expanded');
            });

            var closeIcon = clone.querySelector('.bento-card-close-icon');
            if (closeIcon) {
                closeIcon.addEventListener('click', function (event) {
                    event.stopPropagation();
                    clone.style.pointerEvents = 'none';
                    
                    var actualRect = card.getBoundingClientRect();
                    var actScaleX = actualRect.width / window.innerWidth;
                    var actScaleY = actualRect.height / window.innerHeight;
                    var actTranslateX = actualRect.left - (window.innerWidth - actualRect.width) / 2;
                    var actTranslateY = actualRect.top - (window.innerHeight - actualRect.height) / 2;

                    // ПОСАДКА: Сжатие, перемещение и разворот идут строго в одном свойстве transform!
                    clone.style.transform = 'translate3d(' + actTranslateX + 'px, ' + actTranslateY + 'px, 0) scale3d(' + actScaleX + ', ' + actScaleY + ', 1) rotateY(0deg)';
                    clone.classList.remove('is-expanded');

                    // За 100мс до падения мягко проявляем оригинальную карточку в фоне
                    setTimeout(function() {
                        card.classList.remove('is-cloned');
                    }, 280);

                    // Убиваем клон ровно по финишу анимации (380ms)
                    setTimeout(function () {
                        clone.style.setProperty('transition', 'opacity 100ms ease', 'important');
                        clone.style.opacity = '0';
                        
                        setTimeout(function () {
                            document.body.classList.remove('bento-active');
                            if (clone.parentNode) clone.parentNode.removeChild(clone);
                        }, 100);
                    }, 380);
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

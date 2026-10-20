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

    // 3. ЧИСТАЯ АППАРАТНАЯ FLIP-АНИМАЦИЯ НА GPU (БЕЗ СИНТАКСИЧЕСКИХ ОШИБОК С PROPERTY)
    function init_bento() {
        document.body.addEventListener('click', function (e) {
            var card = e.target.closest('.bento-card');
            if (!card || card.classList.contains('main-hero') || e.target.closest('.bento-card-close-icon') || card.classList.contains('is-cloned')) return;

            e.stopPropagation();

            var rect = card.getBoundingClientRect();
            var bRadius = window.getComputedStyle(card).borderRadius;

            // 1. Создаем клон ЛИЦЕВОЙ стороны
            var frontClone = document.createElement('div');
            frontClone.classList.add('bento-flip-front');
            var frontContent = card.querySelector('.bento-card-front') ? card.querySelector('.bento-card-front').innerHTML : '';
            frontClone.innerHTML = frontContent;

            // 2. Создаем клон ЗАДНЕЙ стороны
            var backClone = document.createElement('div');
            backClone.classList.add('bento-flip-back');
            var backContent = card.querySelector('.bento-card-back') ? card.querySelector('.bento-card-back').innerHTML : '';
            backClone.innerHTML = backContent;

            // Расчет геометрии для видеокарты смартфона
            var scaleX = rect.width / window.innerWidth;
            var scaleY = rect.height / window.innerHeight;
            var translateX = rect.left - (window.innerWidth - rect.width) / 2;
            var translateY = rect.top - (window.innerHeight - rect.height) / 2;

            // Стартовая точка: жестко ужимаем оба слоя прямо на место ячейки
            var baseStyle = 'position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100dvh !important; margin: 0 !important;';
            
            frontClone.style.cssText = baseStyle + 'z-index: 9998 !important; opacity: 1 !important; border-radius: ' + bRadius + ' !important; transform: translate3d(' + translateX + 'px, ' + translateY + 'px, 0) scale3d(' + scaleX + ', ' + scaleY + ', 1) !important;';
            backClone.style.cssText = baseStyle + 'z-index: 9999 !important; opacity: 0 !important; pointer-events: none !important; border-radius: ' + bRadius + ' !important; transform: translate3d(' + translateX + 'px, ' + translateY + 'px, 0) scale3d(' + scaleX + ', ' + scaleY + ', 1) !important;';

            document.body.appendChild(frontClone);
            document.body.appendChild(backClone);
            
            // Заставляем мобильный браузер железно зафиксировать стартовую точку
            window.getComputedStyle(frontClone).transform;
            window.getComputedStyle(backClone).transform;

            card.classList.add('is-cloned');
            document.body.classList.add('bento-active');

            // ВЗЛЕТ: Возвращаем масштаб в 1 и меняем прозрачность слоев
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    frontClone.style.setProperty('transform', 'translate3d(0, 0, 0) scale3d(1, 1, 1)', 'important');
                    frontClone.style.setProperty('opacity', '0', 'important');
                    frontClone.style.setProperty('border-radius', '0px', 'important');
                    
                    backClone.style.setProperty('transform', 'translate3d(0, 0, 0) scale3d(1, 1, 1)', 'important');
                    backClone.style.setProperty('opacity', '1', 'important');
                    backClone.style.setProperty('border-radius', '0px', 'important');
                    backClone.style.pointerEvents = "auto";
                });
            });

            var closeIcon = backClone.querySelector('.bento-card-close-icon');
            if (closeIcon) {
                closeIcon.addEventListener('click', function (event) {
                    event.stopPropagation();
                    backClone.style.pointerEvents = 'none';

                    var actualRect = card.getBoundingClientRect();
                    var actScaleX = actualRect.width / window.innerWidth;
                    var actScaleY = actualRect.height / window.innerHeight;
                    var actTranslateX = actualRect.left - (window.innerWidth - actualRect.width) / 2;
                    var actTranslateY = actualRect.top - (window.innerHeight - actualRect.height) / 2;

                    // ПОСАДКА НА GPU: Сжимаем слои обратно в ячейку с восстановлением скруглений
                    frontClone.style.setProperty('transform', 'translate3d(' + actTranslateX + 'px, ' + actTranslateY + 'px, 0) scale3d(' + actScaleX + ', ' + actScaleY + ', 1)', 'important');
                    frontClone.style.setProperty('opacity', '1', 'important');
                    frontClone.style.setProperty('border-radius', bRadius, 'important');

                    backClone.style.setProperty('transform', 'translate3d(' + actTranslateX + 'px, ' + actTranslateY + 'px, 0) scale3d(' + actScaleX + ', ' + actScaleY + ', 1)', 'important');
                    backClone.style.setProperty('opacity', '0', 'important');
                    backClone.style.setProperty('border-radius', bRadius, 'important');

                    // За 100мс до полной посадки мягко включаем оригинальную ячейку
                    setTimeout(function() {
                        card.classList.remove('is-cloned');
                    }, 280);

                    // Чистим DOM после завершения полета
                    setTimeout(function () {
                        document.body.classList.remove('bento-active');
                        if (frontClone.parentNode) frontClone.parentNode.removeChild(frontClone);
                        if (backClone.parentNode) backClone.parentNode.removeChild(backClone);
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

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
        // Функция плавного закрытия шторки
        function closeMenu() {
            toggle.classList.remove('active');
            nav.classList.remove('active');
            
            // Ждём 350мс (пока улетает шторка) и только потом возвращаем кнопки и скролл!
            setTimeout(function () {
                document.body.classList.remove('menu-open');
                document.body.style.overflow = '';
            }, 250);
        }

        // Клик по бургеру / крестику
        toggle.addEventListener('click', function (e) {
            e.preventDefault();
            if (toggle.classList.contains('active')) {
                closeMenu();
            } else {
                toggle.classList.add('active');
                nav.classList.add('active');
                document.body.classList.add('menu-open'); // Фиксируем чистоту шапки
                document.body.style.overflow = 'hidden';  // Блокируем скролл основного сайта
            }
        });

        // Плавное закрытие при клике на ссылки внутри меню
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

  // 3. АНИМАЦИЯ БЕНТО-КАРТОЧЕК (РАСЧЕТ МАТРИЦЫ GPU)
function init_bento() {
    var headerElement = document.querySelector('header');
    var bodyElement = document.body;

    document.querySelectorAll('.bento-card').forEach(function (card) {
        var front = card.querySelector('.bento-card-front');
        var inner = card.querySelector('.bento-card-inner');
        if (!front || !inner) return;

        front.addEventListener('click', function (e) {
            e.stopPropagation();
            if (card.classList.contains('is-cloned')) return;

            // 1. Снимаем точный слепок координат оригинала
            var rect = card.getBoundingClientRect();
            var currentScrollY = window.scrollY;

// 2. Создаем глубокий клон всей карточки целиком со структурой inner
var clone = card.cloneNode(true);
clone.id = card.id + '-clone'; 
clone.classList.add('bento-card-clone');

            // 3. Выставляем стартовые пиксельные размеры ровно над оригиналом
            clone.style.top = (rect.top + currentScrollY) + 'px';
            clone.style.left = rect.left + 'px';
            clone.style.width = rect.width + 'px';
            clone.style.height = rect.height + 'px';

            bodyElement.appendChild(clone);
            card.classList.add('is-cloned');

            // ТРЮК REFLOW: заставляем браузер зафиксировать стартовую маленькую точку
            var forceReflow = clone.offsetHeight;

            // 4. Плавно переводим ПИКСЕЛИ В ПИКСЕЛИ размеров экрана (включаем transition)
            clone.classList.add('is-flipped');
            clone.classList.add('is-expanded');
            
            clone.style.top = currentScrollY + 'px';
            clone.style.left = '0px';
            clone.style.width = window.innerWidth + 'px';
            clone.style.height = window.innerHeight + 'px';
            clone.style.borderRadius = '0px';

            if (headerElement) headerElement.classList.add('header-hidden');
            if (bodyElement) bodyElement.classList.add('modal-open');

            // 5. Вешаем обработчик на КРЕСТИК внутри созданного клона
            var closeIcon = clone.querySelector('.bento-card-close-icon');
            if (closeIcon) {
                closeIcon.addEventListener('click', function (ev) {
                    ev.preventDefault();
                    ev.stopPropagation();

                    // ЛЕТИМ ОБРАТНО: сжимаем клон обратно в пиксельные габариты ячейки
                    clone.classList.remove('is-expanded', 'is-flipped');
                    
                    clone.style.top = (rect.top + currentScrollY) + 'px';
                    clone.style.left = rect.left + 'px';
                    clone.style.width = rect.width + 'px';
                    clone.style.height = rect.height + 'px';
                    clone.style.borderRadius = '12px';

                    if (headerElement) headerElement.classList.remove('header-hidden');
                    if (bodyElement) bodyElement.classList.remove('modal-open');

                    // Ждем окончания transition (0.4с) и полностью удаляем клон из DOM
                    setTimeout(function () {
                        if (clone.parentNode) clone.parentNode.removeChild(clone);
                        card.classList.remove('is-cloned');
                    }, 350);
                });
            }
        });
    });
}

// ТОЧКА ВХОДА (Оставляем без изменений)
document.addEventListener('DOMContentLoaded', function () {
    init_core_events();
    init_bento();
    switch_app_mode('supplier');
});

})();

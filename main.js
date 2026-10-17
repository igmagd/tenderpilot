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
  var bentoGrid = document.querySelector('.bento-grid');
  if (!bentoGrid) return;

  var cards = bentoGrid.querySelectorAll('.bento-card');
  var bodyElement = document.body;

  cards.forEach(function (card) {
    card.addEventListener('click', function (e) {
      if (e.target.closest('.bento-card-close-icon')) return;
      if (card.classList.contains('is-cloned')) return;

      // 1. Считаем ЧИСТЫЕ координаты относительно видимого окна экрана
      var rect = card.getBoundingClientRect();

      // 2. Создаем глубокий клон всей карточки целиком
      var clone = card.cloneNode(true);
      clone.id = card.id + '-clone';
      clone.classList.add('bento-card-clone');

      // 3. Задаем фиксированную стартовую позицию без учета скролла документа
      clone.style.position = 'fixed';
      clone.style.top = rect.top + 'px';
      clone.style.left = rect.left + 'px';
      clone.style.width = rect.width + 'px';
      clone.style.height = rect.height + 'px';
      
      var computedStyle = window.getComputedStyle(card);
      clone.style.borderRadius = computedStyle.borderRadius;

bodyElement.appendChild(clone);

      // Трюк Reflow для фиксации стартовой точки перед 3D-анимацией
      window.getComputedStyle(clone).transform;

      // 5. Включаем классы полета и переворота
      card.classList.add('is-cloned');
      clone.classList.add('is-expanded', 'is-flipped');
      bodyElement.classList.add('bento-active');

      // 6. Логика закрытия (клик на крестик)
      var closeIcon = clone.querySelector('.bento-card-close-icon');
      if (closeIcon) {
        closeIcon.addEventListener('click', function (event) {
          event.stopPropagation();

          // Возвращаем клон точно в стартовые фиксированные координаты окна
          clone.classList.remove('is-expanded', 'is-flipped');
          bodyElement.classList.remove('bento-active');

          // Удаляем строго ПОСЛЕ полной остановки CSS-анимации
          clone.addEventListener('transitionend', function() {
            if (!clone.classList.contains('is-expanded')) {
              if (clone) clone.remove();
              card.classList.remove('is-cloned');
            }
          }, { once: true });

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

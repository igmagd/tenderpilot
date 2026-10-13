// =========================================================================
// ТЕНДЕРПИЛОТ (TENDERPILOT) — MAIN.JS (ЧАСТЬ 1 ИЗ 3)
// ГЛОБАЛЬНЫЙ СТЭЙТ И РЕАКТИВНОЕ ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ
// =========================================================================

(function () {
  'use strict';

  // Единый глобальный стейт приложения в kebab-case формате
  const app-state = {
    'current-mode-index': 0,
    'modes-list': ['supplier', 'customer', 'transport'],
    'touch-start-x': 0,
    'modes-titles': {
      'supplier': 'Поставщик',
      'customer': 'Заказчик',
      'transport': 'Грузоперевозки'
    }
  };

  /**
   * Главная функция переключения режимов (миров) TenderPilot
   * @param {string} target-mode - Название режима ('supplier', 'customer', 'transport')
   */
  function switch-app-mode(target-mode) {
    if (!app-state['modes-list'].includes(target-mode)) return;

    // 1. Управляем видимостью групп ссылок в мобильном меню
    app-state['modes-list'].forEach(function (mode-item) {
      const target-group = document.querySelectorAll('.group-' + mode-item);
      target-group.forEach(function (element) {
        element.style.setProperty('display', mode-item === target-mode ? 'flex' : 'none', 'important');
      });

      // 2. Управляем видимостью Bento-сеток на странице
      const target-grid = document.getElementById('grid-' + mode-item);
      if (target-grid) {
        if (mode-item === target-mode) {
          target-grid.classList.add('active');
          target-grid.style.setProperty('display', 'grid', 'important');
        } else {
          target-grid.classList.remove('active');
          target-grid.style.setProperty('display', 'none', 'important');
        }
      }
    });

    // 3. Обновляем текстовый статус в мобильном меню-баре
    const menu-status-text = document.querySelector('.menu-status-text');
    if (menu-status-text && app-state['modes-titles'][target-mode]) {
      menu-status-text.textContent = app-state['modes-titles'][target-mode];
    }

    // 4. Синхронизируем индекс текущего режима
    app-state['current-mode-index'] = app-state['modes-list'].indexOf(target-mode);

    // 5. Подсвечиваем активные десктопные кнопки-переключатели под шапкой
    const all-mode-buttons = document.querySelectorAll('.mode-btn');
    all-mode-buttons.forEach(function (button) {
      if (button.getAttribute('data-mode') === target-mode) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }

  /**
   * Инициализация кликов по десктопным переключателям режимов
   */
  function init-mode-buttons() {
    const all-mode-buttons = document.querySelectorAll('.mode-btn');
    all-mode-buttons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        const target-mode = button.getAttribute('data-mode');
        if (target-mode) {
          switch-app-mode(target-mode);
        }
      });
    });
  }

  // Экспортируем ключевые элементы для сборки в следующих частях скрипта
  window['tenderpilot-core'] = {
    'app-state': app-state,
    'switch-app-mode': switch-app-mode,
    'init-mode-buttons': init-mode-buttons
  };

})();
// =========================================================================
// ТЕНДЕРПИЛОТ — ЧАСТЬ 2-А: МОБИЛЬНОЕ МЕНЮ (БУРГЕР)
// =========================================================================

function init_mobile_menu() {
  var toggle = document.getElementById('menu-toggle');
  var nav = document.querySelector('.nav-links');
  var body = document.body;

  if (!toggle || !nav) return;

  // Клик по бургеру
  toggle.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();

    var active = toggle.classList.toggle('active');
    nav.classList.toggle('active');
    toggle.setAttribute('aria-expanded', active ? 'true' : 'false');

    // Фикс скролла: если меню открыто, body не должен прокручиваться
    if (active) {
      body.style.setProperty('overflow', 'hidden', 'important');
    } else {
      body.style.removeProperty('overflow');
    }
  });

  // Автозакрытие меню при клике на любую ссылку внутри
  var links = nav.querySelectorAll('.menu-item-link');
  links.forEach(function (link) {
    link.addEventListener('click', function () {
      toggle.classList.remove('active');
      nav.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      body.style.removeProperty('overflow');
    });
  });
}

// Экспортируем функцию в глобальную сборку проекта
window['tenderpilot-menu'] = init_mobile_menu;
        // =========================================================================
// ТЕНДЕРПИЛОТ — ЧАСТЬ 2-Б: СТРЕЛОЧКИ И ТАЧ-СВАЙПЫ
// =========================================================================

function init_navigation_mechanics() {
  var core = window['tenderpilot-core'];
  if (!core) return;

  var state = core['app-state'];
  var prev_btn = document.querySelector('.btn-menu-prev');
  var next_btn = document.querySelector('.btn-menu-next');

  // Функция циклического сдвига индекса
  function shift_mode(direction) {
    var max = state['modes-list'].length;
    var next_index = (state['current-mode-index'] + direction + max) % max;
    core['switch-app-mode'](state['modes-list'][next_index]);
  }

  // Навешиваем клики на стрелочки в баре меню
  if (prev_btn) {
    prev_btn.addEventListener('click', function (e) {
      e.preventDefault();
      shift_mode(-1);
    });
  }

  if (next_btn) {
    next_btn.addEventListener('click', function (e) {
      e.preventDefault();
      shift_mode(1);
    });
  }

  // Обработка горизонтальных свайпов (по всему телу, кроме раскрытых карт)
  document.body.addEventListener('touchstart', function (e) {
    if (e.target.closest('.bento-card-back') || e.target.closest('.is-flipped')) return;
    state['touch-start-x'] = e.touches[0].clientX;
  }, { passive: true });

  document.body.addEventListener('touchend', function (e) {
    if (e.target.closest('.bento-card-back') || e.target.closest('.is-flipped')) return;
    
    var diff_x = state['touch-start-x'] - e.changedTouches[0].clientX;
    // Порог чувствительности свайпа — 70 пикселей строго по ТЗ
    if (Math.abs(diff_x) > 70) {
      if (diff_x > 0) {
        shift_mode(1);  // Свайп влево -> вперед
      } else {
        shift_mode(-1); // Свайп вправо -> назад
      }
    }
  }, { passive: true });
}

// Экспортируем в глобальный скоуп проекта
window['tenderpilot-nav'] = init_navigation_mechanics;
      // =========================================================================
// ТЕНДЕРПИЛОТ — ЧАСТЬ 3-А: МАТЕМАТИКА РАСЧЕТА И ФЛИП BENTO-КАРТОЧЕК
// =========================================================================

function init_bento_cards_system() {
  var cards = document.querySelectorAll('.bento-card');

  cards.forEach(function (card) {
    var front = card.querySelector('.bento-card-front');
    var inner = card.querySelector('.bento-card-inner');
    var close_btn = card.querySelector('.bento-card-close-icon');

    if (!front || !inner) return;

    // Фаза 1: Клик по лицевой стороне и раскрытие
    front.addEventListener('click', function (e) {
      e.stopPropagation();

      if (card.classList.contains('is-expanded')) return;

      // 1. Вычисляем точные координаты карточки на экране до анимации
      var rect = card.getBoundingClientRect();
      
      // Сохраняем исходные параметры прямо в дата-атрибуты для обратной фазы
      card.setAttribute('data-orig-top', rect.top);
      card.setAttribute('data-orig-left', rect.left);
      card.setAttribute('data-orig-width', rect.width);
      card.setAttribute('data-orig-height', rect.height);

      // 2. Рассчитываем масштаб и сдвиг относительно окна браузера
      var scale_x = window.innerWidth / rect.width;
      var scale_y = window.innerHeight / rect.height;
      var translate_x = -rect.left;
      var translate_y = -rect.top;

      // 3. Запоминаем эту матрицу трансформации для внутреннего контейнера
      card.style.setProperty('--target-transform', 
        'translate3d(' + translate_x + 'px, ' + translate_y + 'px, 0) ' +
        'scale3d(' + scale_x + ', ' + scale_y + ', 1)'
      );

      // Этап 1 по ТЗ: Запускаем 3D-поворот на 180 градусов
      card.classList.add('is-flipped');

      // Этап 2 по ТЗ: На 90 градусах (через 150мс) добавляем финальный класс расширения
      setTimeout(function () {
        if (card.classList.contains('is-flipped')) {
          card.classList.add('is-expanded');
        }
      }, 150);
    });
    // Фаза 2: Зеркальное закрытие по клику на крестик (.bento-card-close-icon)
    if (close_btn) {
      close_btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        // Добавляем класс обратной фазы для удержания анимации
        card.classList.add('is-closing');
        
        // Синхронно с CSS-таймингом убираем состояния разворота и переворота
        card.classList.remove('is-expanded', 'is-flipped');

        // Через 350мс (время окончания transition) полностью очищаем стили
        setTimeout(function () {
          card.classList.remove('is-closing');
          card.style.removeProperty('--target-transform');
        }, 350);
      });
    }
  });
}

// =========================================================================
// ГЛОБАЛЬНЫЙ ЗАПУСК ВСЕХ МОДУЛЕЙ ПРИ ЗАГРУЗКЕ DOM
// =========================================================================
document.addEventListener('DOMContentLoaded', function () {
  var core = window['tenderpilot-core'];
  
  if (core) {
    // 1. Включаем базовые кнопки переключения режимов
    core['init-mode-buttons']();
    
    // 2. Включаем мобильное меню (бургер)
    if (window['tenderpilot-menu']) {
      window['tenderpilot-menu']();
    }
    
    // 3. Включаем стрелочки и свайпы навигации
    if (window['tenderpilot-nav']) {
      window['tenderpilot-nav']();
    }
    
    // 4. Оживляем систему Bento-карточек
    init_bento_cards_system();
    
    // 5. Выставляем стартовый режим по умолчанию строго по ТЗ
    core['switch-app-mode']('supplier');
  }
});

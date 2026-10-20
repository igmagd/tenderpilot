(function() {
  'use strict';

  // 1. ИНИЦИАЛИЗАЦИЯ И НАСТРОЙКА ПЛАТФОРМЫ TENDERPILOT
  window.tenderpilot = {
    'current-mode-index': 0,
    'modes-list': ['supplier', 'customer', 'transport'],
    'touch-start-x': 0
  };

  document.addEventListener('DOMContentLoaded', function() {
    init_core_events();
    init_bento();
  });

  function switch_app_mode(mode_id) {
    var modes = window.tenderpilot['modes-list'];
    var idx = modes.indexOf(mode_id);
    if (idx === -1) return;

    window.tenderpilot['current-mode-index'] = idx;

    document.querySelectorAll('.mode-btn').forEach(function(btn) {
      if (btn.getAttribute('data-mode') === mode_id) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    var prefix = 'group-' + mode_id;
    document.querySelectorAll('.bento-grid').forEach(function(grid) {
      if (grid.id === prefix) {
        grid.style.display = 'grid';
      } else {
        grid.style.display = 'none';
      }
    });
  }

  // ЯДЕРНЫЕ СОБЫТИЯ: ПОЛНОСТЬЮ ИЗБАВЛЕНЫ ОТ КОНФЛИКТНЫХ СВАЙПОВ DOCUMENT.BODY
  function init_core_events() {
    document.querySelectorAll('.mode-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var mode = this.getAttribute('data-mode');
        switch_app_mode(mode);
      });
    });

    function shift(dir) {
      var state = window.tenderpilot;
      var max = state['modes-list'].length;
      var next = (state['current-mode-index'] + dir + max) % max;
      switch_app_mode(state['modes-list'][next]);
    }

    var prev = document.querySelector('.mode-arrow.prev');
    var next = document.querySelector('.mode-arrow.next');

    if (prev) prev.addEventListener('click', function() { shift(-1); });
    if (next) next.addEventListener('click', function() { shift(1); });
  }

  // 2. ИНТЕРАКТИВНАЯ БЕНТО-АНИМАЦИЯ С КОРРЕКТНЫМ ЗАКРЫТИЕМ КАРТОЧЕК
  function init_bento() {
    var grids = document.querySelectorAll('.bento-grid');
    if (!grids.length) return;

    grids.forEach(function(grid) {
      grid.addEventListener('click', function(e) {
        var card = e.target.closest('.bento-card');
        if (!card) return;

        // Предохранитель: игнорируем клики по большой карточке-герою
        if (card.classList.contains('main-hero')) return;

        if (e.target.closest('.bento-card-close')) {
          e.stopPropagation();
          close_active_card(card);
          return;
        }

        if (!card.classList.contains('active-fullscreen')) {
          open_card_fullscreen(card);
        }
      });
    });
  }

  function open_card_fullscreen(card) {
    var rect = card.getBoundingClientRect();
    var clone = card.cloneNode(true);
    
    clone.classList.add('bento-card-clone');
    
    Object.assign(clone.style, {
      position: 'fixed',
      top: rect.top + 'px',
      left: rect.left + 'px',
      width: rect.width + 'px',
      height: rect.height + 'px',
      margin: '0',
      zIndex: '9999',
      transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
    });

    document.body.appendChild(clone);
    card.style.opacity = '0';

    var close_btn = clone.querySelector('.bento-card-close');
    if (close_btn) close_btn.style.display = 'block';

    requestAnimationFrame(function() {
      clone.classList.add('active-fullscreen');
      Object.assign(clone.style, {
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        borderRadius: '0'
      });
    });
  }

  function close_active_card(card) {
    var clone = document.querySelector('.bento-card-clone');
    if (!clone) return;

    var rect = card.getBoundingClientRect();
    var close_btn = clone.querySelector('.bento-card-close');
    if (close_btn) close_btn.style.display = 'none';

    clone.classList.remove('active-fullscreen');

    // Плавный возврат геометрии в исходную точку
    Object.assign(clone.style, {
      top: rect.top + 'px',
      left: rect.left + 'px',
      width: rect.width + 'px',
      height: rect.height + 'px',
      borderRadius: '24px'
    });

    // ТЕХНИЧЕСКИЙ ФИКС: Растворяем правую грань за 100ms до удаления клона, убирая толчок
    setTimeout(function() {
      clone.style.transition = 'opacity 0.1s ease';
      clone.style.opacity = '0';
      card.style.opacity = '1'; // Оригинальная карточка встает на место бесшовно
    }, 400);

    // Полное удаление клонированного элемента из памяти страницы
    setTimeout(function() {
      clone.remove();
    }, 500);
  }
})();

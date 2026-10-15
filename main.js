(function () {
  'use strict';

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

  function init_core_events() {
    document.querySelectorAll('.mode-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        switch_app_mode(btn.getAttribute('data-mode'));
      });
    });

    var toggle = document.getElementById('menu-toggle');
    var nav = document.querySelector('.nav-links');
    var headerContainer = document.querySelector('.header-container');

    if (toggle && nav) {
      toggle.addEventListener('click', function (e) {
        e.preventDefault();
        var active = toggle.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.style.overflow = active ? 'hidden' : '';
        if (headerContainer) {
          headerContainer.style.zIndex = active ? '2000000' : '';
        }
      });

      nav.querySelectorAll('.menu-item-link').forEach(function (link) {
        link.addEventListener('click', function () {
          toggle.classList.remove('active');
          nav.classList.remove('active');
          document.body.style.overflow = '';
          if (headerContainer) headerContainer.style.zIndex = '';
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

  function init_bento() {
    document.querySelectorAll('.bento-card').forEach(function (card) {
      var front = card.querySelector('.bento-card-front');
      var inner = card.querySelector('.bento-card-inner');
      var close = card.querySelector('.bento-card-close-icon');
      if (!front || !inner) return;

      front.addEventListener('click', function (e) {
        e.stopPropagation();
        if (card.classList.contains('is-expanded')) return;
        var rect = card.getBoundingClientRect();
        var scale_x = window.innerWidth / rect.width;
        var scale_y = window.innerHeight / rect.height;
        
        card.style.setProperty('--target-transform',
          'translate3d(' + (-rect.left) + 'px, ' + (-rect.top) + 'px, 0) ' +
          'scale3d(' + scale_x + ', ' + scale_y + ', 1)'
        );
        card.classList.add('is-flipped');
        setTimeout(function () {
          if (card.classList.contains('is-flipped')) {
            card.classList.add('is-expanded');
            card.style.zIndex = '3000000';
          }
        }, 150);
      });

      if (close) {
        close.addEventListener('click', function (e) {
          e.preventDefault(); e.stopPropagation();
          card.classList.add('is-closing');
          card.classList.remove('is-expanded', 'is-flipped');
          setTimeout(function () {
            card.classList.remove('is-closing');
            card.style.removeProperty('--target-transform');
            card.style.zIndex = '';
          }, 350);
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

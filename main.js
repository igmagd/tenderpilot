(function () {
    'use strict';

    // 1. НАВИГАЦИЯ И МЕНЮ
    function init_core_events() {
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
    }

// 2. ИДЕАЛЬНАЯ АНИМАЦИЯ БЕНТО-КАРТОЧЕК (УМНЫЙ МОРФИНГ)
function init_bento() {
    var isAnimating = false;
    var SPEED = 300; // Наша идеальная скорость 300мс
    var MID = SPEED / 2; // Экватор для смены контента (150мс)

    document.body.addEventListener('click', function (e) {
        var card = e.target.closest('.bento-card');
        
        if (!card || isAnimating || card.classList.contains('main-hero') || card.classList.contains('is-hidden')) return;
        if (e.target.closest('.bento-card-close-icon')) return;
        if (e.target.closest('a')) return;

        e.stopPropagation();
        isAnimating = true;

        var rect = card.getBoundingClientRect();
        var clone = card.cloneNode(true);
        clone.classList.add('bento-card-clone');
        
        // Сажаем клон на место оригинала. Принудительно задаем цвет #161b22 и скорость 0.3s
        clone.style.cssText += 'position: fixed !important; background: #161b22 !important; ' +
                              'top: ' + rect.top + 'px !important; left: ' + rect.left + 'px !important; ' +
                              'width: ' + rect.width + 'px !important; height: ' + rect.height + 'px !important; ' +
                              'border-radius: 24px !important; margin: 0 !important; z-index: 10000 !important; transform: none !important; ' +
                              'transition: top 0.3s cubic-bezier(0.16, 1, 0.3, 1), left 0.3s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s cubic-bezier(0.16, 1, 0.3, 1), height 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.3s ease !important;';

        var inner = clone.querySelector('.bento-card-inner');
        if (inner) {
            inner.style.cssText += 'width: 100% !important; height: 100% !important; position: relative !important;';
        }

        document.body.appendChild(clone);
        
        // Скрываем оригинал. Скроллбар на месте, страница мертва и не шевелится!
        card.classList.add('is-hidden');

        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                // Молниеносный и чистый полет коробки на весь экран
                clone.style.cssText += 'top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; border-radius: 0 !important;';
                clone.classList.add('is-expanded');

                // ЭКВАТОР (150мс): Карточка в воздухе плавно меняет лицо на изнанку формы
                setTimeout(function() {
                    clone.classList.add('show-back');
                }, MID);

                // ФИНИШ ПОЛЕТА (300мс): Все встало на места. Теперь незаметно блокируем скролл фона
                setTimeout(function() {
                    document.body.classList.add('bento-active');
                    isAnimating = false;
                }, SPEED);
            });
        });

        var closeIcon = clone.querySelector('.bento-card-close-icon');
        if (closeIcon) {
            closeIcon.addEventListener('click', function (event) {
                event.stopPropagation();
                if (isAnimating) return;
                isAnimating = true;
                
                // 1. Возвращаем лицо вместо изнанки
                clone.classList.remove('show-back');
                
                // 2. Сразу разблокируем body, чтобы геометрия сайта вернулась в исходное состояние
                document.body.classList.remove('bento-active');
                
                // Даем сайту 30мс вернуть скроллбар и занять точные координаты в пазах
                setTimeout(function() {
                    var targetRect = card.getBoundingClientRect();
                    
                    // Схлопываем коробку обратно точно в пазы оригинальной карточки за 300мс
                    clone.style.cssText += 'top: ' + targetRect.top + 'px !important; left: ' + targetRect.left + 'px !important; width: ' + targetRect.width + 'px !important; height: ' + targetRect.height + 'px !important; border-radius: 24px !important;';
                    clone.classList.remove('is-expanded');

                    // За 50мс до полного удаления бесшовно подменяем клон оригиналом
                    setTimeout(function() {
                        card.classList.remove('is-hidden');
                    }, SPEED - 50);

                    // Полная зачистка DOM
                    setTimeout(function() {
                        clone.remove();
                        isAnimating = false;
                    }, SPEED);
                    
                }, 30); 
            });
        }
    });
}

    document.addEventListener('DOMContentLoaded', function () {
        init_core_events();
        init_bento();
    });
})();

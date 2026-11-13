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
        var SPEED = 300;
        var MID = SPEED / 2;

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
            card.classList.add('is-hidden');

            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    clone.style.cssText += 'top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; border-radius: 0 !important;';
                    clone.classList.add('is-expanded');

                    setTimeout(function() {
                        clone.classList.add('show-back');
                    }, MID);

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
                    
                    clone.classList.remove('show-back');
                    document.body.classList.remove('bento-active');
                    
                    setTimeout(function() {
                        var targetRect = card.getBoundingClientRect();
                        
                        clone.style.cssText += 'top: ' + targetRect.top + 'px !important; left: ' + targetRect.left + 'px !important; width: ' + targetRect.width + 'px !important; height: ' + targetRect.height + 'px !important; border-radius: 24px !important;';
                        clone.classList.remove('is-expanded');

                        setTimeout(function() {
                            card.classList.remove('is-hidden');
                        }, SPEED - 50);

                        setTimeout(function() {
                            clone.remove();
                            isAnimating = false;
                        }, SPEED);
                        
                    }, 30); 
                });
            }
        });
    }

    // 3. ИНТЕРАКТИВНЫЙ ПРЕДФУТЕР V3 (ОТКРЫТИЕ ВНИЗ + ПОШТУЧНЫЙ FAQ)
    function init_interactive_panels() {
        var buttons = document.querySelectorAll(".shutter-trigger-btn");
        var panels = document.querySelectorAll(".shutter-panel-item");

        if (!buttons.length || !panels.length) return;

        // Функция обновления высоты родительской панели (нужна при раскрытии вложенных аккордеонов)
        function refreshPanelHeight(panel) {
            if (panel.classList.contains("is-active")) {

                panel.style.maxHeight = "none";
                var newHeight = panel.scrollHeight + 40;
                panel.style.maxHeight = newHeight + "px";
            }
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                var targetId = button.getAttribute("data-panel");
                var targetPanel = document.getElementById(targetId);
                
                if (!targetPanel) return;
                
                var isAlreadyActive = targetPanel.classList.contains("is-active");

                // Сворачиваем шторки
                panels.forEach(function (panel) {
                    panel.classList.remove("is-active");
                    panel.style.maxHeight = "0px";
                });
                buttons.forEach(function (btn) {
                    btn.classList.remove("is-active");
                });

                // Раскрываем нужную вниз (оригинальный плавный расчет высоты)
                if (!isAlreadyActive) {
                    button.classList.add("is-active");
                    targetPanel.classList.add("is-active");
                    targetPanel.style.maxHeight = (targetPanel.scrollHeight + 40) + "px";
                }
            });
        });

        // ЛОГИКА ДЛЯ ВЛОЖЕННЫХ АККОРДЕОНОВ FAQ И ВОЗМОЖНОСТЕЙ
        var faqTriggers = document.querySelectorAll(".shutter-accordion-trigger");
        faqTriggers.forEach(function (trigger) {
            trigger.addEventListener("click", function () {
                var item = trigger.parentNode;
                var content = item.querySelector(".shutter-accordion-content");
                var parentPanel = item.closest(".shutter-panel-item");
                
                var isOpen = item.classList.contains("is-open");

                // Закрываем другие вопросы в этой панели, чтобы было аккуратно
                var siblings = parentPanel.querySelectorAll(".shutter-accordion-item");
                siblings.forEach(function (sib) {
                    sib.classList.remove("is-open");
                    var sibContent = sib.querySelector(".shutter-accordion-content");
                    if (sibContent) sibContent.style.maxHeight = "0px";
                    if (sibContent) sibContent.style.opacity = "0";
                });

                // УПРАВЛЕНИЕ КАРТИНКАМИ: Гасим абсолютно все кадры в правой зоне
                var visualContainer = parentPanel.querySelector(".shutter-features-visual");
                if (visualContainer) {
                    visualContainer.querySelectorAll(".feat-showcase-img").forEach(function (img) {
                        img.classList.remove("active");
                    });
                }

                // Открываем/закрываем текущий
                if (!isOpen) {
                    item.classList.add("is-open");
                    content.style.opacity = "1";
                    content.style.maxHeight = content.scrollHeight + "px";

                    // ПРОЯВЛЕНИЕ КАРТИНКИ: зажигаем нужный кадр на сером фоне
                    var imgIndex = item.getAttribute("data-image");
                    if (imgIndex && visualContainer) {
                        var targetImg = visualContainer.querySelector('.feat-showcase-img[data-img="' + imgIndex + '"]');
                        if (targetImg) targetImg.classList.add("active");
                    }
                } else {
                    item.classList.remove("is-open");
                    content.style.maxHeight = "0px";
                    content.style.opacity = "0";
                }

                // Пересчитываем высоту главной шторки с задержкой под анимацию
                setTimeout(function() {
                    refreshPanelHeight(parentPanel);
                }, 310);
            });
        });

        // Кнопка выбор -> контакты
        document.querySelectorAll(".js-open-contacts").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var contactBtn = document.querySelector('[data-panel="panel-contacts"]');
                if (contactBtn) contactBtn.click();
            });
        });
    }

    // Инициализация всех систем хаба без конфликтов
    document.addEventListener('DOMContentLoaded', function () {
        init_core_events();
        init_bento();
        init_interactive_panels(); 
    });
})();



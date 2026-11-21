(function () {
    'use strict';

    // 1. НАВИГАЦИЯ И МЕНЮ
    function init_core_events() {
        var toggle = document.getElementById('menu-toggle');
        var nav = document.querySelector('.nav-links');

        if (toggle && nav) {
            var closeTimer = null;
            var isClosing = false;

            function closeMenu() {
                if (isClosing) return;
                isClosing = true;
                toggle.classList.remove('active');
                nav.classList.remove('active');
                document.body.classList.remove('menu-is-open');
                clearTimeout(closeTimer);
                closeTimer = setTimeout(function () {
                    document.documentElement.classList.remove('menu-open');
                    document.body.classList.remove('menu-open');
                    isClosing = false;
                }, 420);
            }

            toggle.addEventListener('click', function (e) {
                e.preventDefault();
                if (toggle.classList.contains('active')) {
                    closeMenu();
                } else {
                    clearTimeout(closeTimer);
                    isClosing = false;
                    toggle.classList.add('active');
                    nav.classList.add('active');
                    document.body.classList.add('menu-is-open');
                    document.documentElement.classList.add('menu-open');
                    document.body.classList.add('menu-open');
                }
            });

            nav.querySelectorAll('.menu-item-link').forEach(function (link) {
                link.addEventListener('click', function (e) {
                    var href = link.getAttribute('href');
                    if (href && href.charAt(0) === '#') {
                        var target = document.querySelector(href);
                        if (target) {
                            e.preventDefault();
                            document.documentElement.classList.remove('menu-open');
                            document.body.classList.remove('menu-open');
                            closeMenu();
                            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            return;
                        }
                    }
                    closeMenu();
                });
            });
        }

        // Тактильная световая вспышка иконок в шапке при тапе
        document.querySelectorAll('#menu-toggle, .lk-btn').forEach(function (btn) {
            var triggerTap = function () {
                btn.classList.remove('is-tapped');
                void btn.offsetWidth;
                btn.classList.add('is-tapped');
                clearTimeout(btn._tapTimer);
                btn._tapTimer = setTimeout(function () {
                    btn.classList.remove('is-tapped');
                }, 220);
            };
            btn.addEventListener('touchstart', triggerTap, { passive: true });
            btn.addEventListener('pointerdown', triggerTap);
        });

        // Управляемое тактильное нажатие карточек хаба без залипания в Android Chrome и iOS Safari
        var hubCards = document.querySelectorAll('a.hub-card');
        function clearAllHubCards() {
            hubCards.forEach(function (c) {
                c.classList.remove('is-pressed');
                c.blur();
            });
        }

        hubCards.forEach(function (card) {
            var triggerPress = function () {
                clearAllHubCards();
                card.classList.add('is-pressed');
                clearTimeout(card._pressTimer);
                card._pressTimer = setTimeout(function () {
                    card.classList.remove('is-pressed');
                }, 240);
            };

            card.addEventListener('pointerdown', triggerPress);
            card.addEventListener('touchstart', triggerPress, { passive: true });

            card.addEventListener('touchend', function () {
                setTimeout(function () {
                    card.classList.remove('is-pressed');
                }, 140);
            }, { passive: true });

            card.addEventListener('touchcancel', clearAllHubCards, { passive: true });
        });

        window.addEventListener('pagehide', clearAllHubCards);
        window.addEventListener('pageshow', clearAllHubCards);
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) clearAllHubCards();
        });
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

            clone.style.cssText +=
                'position: fixed !important;' +
                'background: #161b22 !important;' +
                'top: ' + rect.top + 'px !important;' +
                'left: ' + rect.left + 'px !important;' +
                'width: ' + rect.width + 'px !important;' +
                'height: ' + rect.height + 'px !important;' +
                'border-radius: 24px !important;' +
                'margin: 0 !important;' +
                'z-index: 10000 !important;' +
                'transform: none !important;' +
                'transition: top 0.3s cubic-bezier(0.16, 1, 0.3, 1), ' +
                'left 0.3s cubic-bezier(0.16, 1, 0.3, 1), ' +
                'width 0.3s cubic-bezier(0.16, 1, 0.3, 1), ' +
                'height 0.3s cubic-bezier(0.16, 1, 0.3, 1), ' +
                'border-radius 0.3s ease !important;';

            var inner = clone.querySelector('.bento-card-inner');
            if (inner) {
                inner.style.cssText += 'width: 100% !important; height: 100% !important; position: relative !important;';
            }

            document.body.appendChild(clone);
            card.classList.add('is-hidden');

            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    clone.style.cssText +=
                        'top: 0 !important;' +
                        'left: 0 !important;' +
                        'width: 100vw !important;' +
                        'height: 100vh !important;' +
                        'border-radius: 0 !important;';
                    clone.classList.add('is-expanded');

                    setTimeout(function () {
                        clone.classList.add('show-back');
                    }, MID);

                    setTimeout(function () {
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

                    setTimeout(function () {
                        var targetRect = card.getBoundingClientRect();

                        clone.style.cssText +=
                            'top: ' + targetRect.top + 'px !important;' +
                            'left: ' + targetRect.left + 'px !important;' +
                            'width: ' + targetRect.width + 'px !important;' +
                            'height: ' + targetRect.height + 'px !important;' +
                            'border-radius: 24px !important;';
                        clone.classList.remove('is-expanded');

                        setTimeout(function () {
                            card.classList.remove('is-hidden');
                        }, SPEED - 50);

                        setTimeout(function () {
                            clone.remove();
                            isAnimating = false;
                        }, SPEED);
                    }, 30);
                });
            }
        });
    }

    // 3. ИНТЕРАКТИВНЫЙ ПРЕДФУТЕР V4 (НАТИВНЫЙ CSS GRID — 120 FPS БЕЗ РАСЧЕТОВ ВЫСОТЫ)
    function init_interactive_panels() {
        var buttons = document.querySelectorAll('.shutter-trigger-btn');
        var panels = document.querySelectorAll('.shutter-panel-item');

        if (!buttons.length || !panels.length) return;

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                var targetId = button.getAttribute('data-panel');
                var targetPanel = document.getElementById(targetId);

                if (!targetPanel) return;

                var isAlreadyActive = targetPanel.classList.contains('is-active');

                panels.forEach(function (panel) {
                    panel.classList.remove('is-active');
                });
                buttons.forEach(function (btn) {
                    btn.classList.remove('is-active');
                });

                if (!isAlreadyActive) {
                    button.classList.add('is-active');
                    targetPanel.classList.add('is-active');
                }
            });
        });

        // ВЛОЖЕННЫЕ АККОРДЕОНЫ FAQ И ВОЗМОЖНОСТЕЙ
        var faqTriggers = document.querySelectorAll('.shutter-accordion-trigger');
        faqTriggers.forEach(function (trigger) {
            trigger.addEventListener('click', function () {
                var item = trigger.parentNode;
                var parentPanel = item.closest('.shutter-panel-item');
                var isOpen = item.classList.contains('is-open');

                // Закрываем соседние пункты
                var siblings = parentPanel.querySelectorAll('.shutter-accordion-item');
                siblings.forEach(function (sib) {
                    if (sib !== item) {
                        sib.classList.remove('is-open');
                    }
                });

                // Гасим картинки в правой зоне
                var visualContainer = parentPanel.querySelector('.shutter-features-visual');
                if (visualContainer) {
                    visualContainer.querySelectorAll('.feat-showcase-img').forEach(function (img) {
                        img.classList.remove('active');
                    });
                }
                // Переключаем текущий класс — всю анимацию делает CSS Grid
                if (!isOpen) {
                    item.classList.add('is-open');

                    var imgIndex = item.getAttribute('data-image');
                    if (imgIndex && visualContainer) {
                        var targetImg = visualContainer.querySelector('.feat-showcase-img[data-img="' + imgIndex + '"]');
                        if (targetImg) targetImg.classList.add('active');
                    }
                } else {
                    item.classList.remove('is-open');
                }
            });
        });

        // Кнопка выбор -> контакты
        document.querySelectorAll('.js-open-contacts').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var contactBtn = document.querySelector('[data-panel="panel-contacts"]');
                if (contactBtn) contactBtn.click();
            });
        });
    }

    // 4. ОТДЕЛЬНАЯ МОБИЛЬНАЯ СТРОКА «ВСЕ РАЗДЕЛЫ» + ГОРИЗОНТАЛЬНЫЕ ТАБЫ В ФУТЕРЕ
    function init_mobile_footer_tabs() {
        var toggleBtn = document.getElementById('mobile-sections-toggle');
        var fatFooter = document.querySelector('.hub-fat-footer');
        var footerContainer = document.querySelector('.fat-footer-container');
        var columns = document.querySelectorAll('.fat-footer-column');

        if (!toggleBtn || !fatFooter || !footerContainer || !columns.length) return;

        // Определяем текущую страницу для автоподсветки нужного раздела
        var currentPath = window.location.pathname.split('/').pop() || 'index.html';
        var initialIndex = 0;

        columns.forEach(function (col, idx) {
            if (col.getAttribute('data-page') === currentPath) {
                initialIndex = idx;
            }
        });

        // Внутренняя обертка для плавного CSS Grid 0fr -> 1fr
        var collapseInner = document.createElement('div');
        collapseInner.className = 'mobile-footer-collapse-inner';
        footerContainer.parentNode.insertBefore(collapseInner, footerContainer);
        collapseInner.appendChild(footerContainer);

        // Горизонтальная лента табов на основе заголовков h4
        var tabsWrap = document.createElement('div');
        tabsWrap.className = 'mobile-footer-tabs-wrap';

        var tabsTrack = document.createElement('div');
        tabsTrack.className = 'mobile-footer-tabs-track';

        columns.forEach(function (col, index) {
            var heading = col.querySelector('h4');
            var tabTitle = heading ? heading.textContent.trim() : 'Раздел ' + (index + 1);

            var tabBtn = document.createElement('button');
            tabBtn.type = 'button';
            tabBtn.className = 'mobile-footer-tab' + (index === initialIndex ? ' is-active' : '');
            tabBtn.textContent = tabTitle;

            if (index === initialIndex) {
                col.classList.add('is-tab-active');
            }

            tabBtn.addEventListener('click', function () {
                tabsTrack.querySelectorAll('.mobile-footer-tab').forEach(function (t) {
                    t.classList.remove('is-active');
                });
                columns.forEach(function (c) {
                    c.classList.remove('is-tab-active');
                });

                tabBtn.classList.add('is-active');
                col.classList.add('is-tab-active');

                tabBtn.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            });

            tabsTrack.appendChild(tabBtn);
        });

        // Тонкая стрелка справа как индикатор и кнопка прокрутки вбок
        var nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'mobile-footer-tabs-next';
        nextBtn.setAttribute('aria-label', 'Прокрутить разделы вправо');
        nextBtn.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"></polyline></svg>';

        nextBtn.addEventListener('click', function () {
            tabsTrack.scrollBy({ left: 160, behavior: 'smooth' });
        });

        function updateNextArrowState() {
            var maxScroll = tabsTrack.scrollWidth - tabsTrack.clientWidth;
            if (maxScroll <= 4 || tabsTrack.scrollLeft >= maxScroll - 6) {
                nextBtn.classList.add('is-hidden');
            } else {
                nextBtn.classList.remove('is-hidden');
            }
        }

        tabsTrack.addEventListener('scroll', updateNextArrowState, { passive: true });
        window.addEventListener('resize', updateNextArrowState);

        tabsWrap.appendChild(tabsTrack);
        tabsWrap.appendChild(nextBtn);
        collapseInner.insertBefore(tabsWrap, footerContainer);

        // Открытие/закрытие по клику на полосу «Все разделы»
        toggleBtn.addEventListener('click', function () {
            var isOpen = fatFooter.classList.toggle('is-mobile-open');
            toggleBtn.classList.toggle('active', isOpen);
            toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

            if (isOpen) {
                requestAnimationFrame(function () {
                    var activeTab = tabsTrack.querySelector('.mobile-footer-tab.is-active');
                    if (activeTab && initialIndex > 0) {
                        activeTab.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
                    }
                    updateNextArrowState();
                });
            }
        });
    }

    // 5. ВИТРИНА ПЛОЩАДОК В ГЛАВНОЙ КАРТОЧКЕ (ЭФФЕКТ ВЫТЕСНЕНИЯ И СЖАТИЯ)
    function init_platforms_showcase() {
        var seoList = document.getElementById('platformsList');
        var stage = document.getElementById('platformsStage');
        if (!seoList || !stage) return;

        var platforms = Array.from(seoList.querySelectorAll('li'))
            .map(function (li) { return li.textContent.trim(); })
            .filter(Boolean);

        if (!platforms.length) return;

        var currentIndex = 0;
        var activeGroupEl = null;

        // Скрытый измеритель ширины слов, чтобы помещались только целые названия
        var measurer = document.createElement('span');
        measurer.className = 'platform-word';
        measurer.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;left:-9999px;top:-9999px;';
        document.body.appendChild(measurer);

        function getWordWidth(text) {
            measurer.textContent = text;
            return measurer.offsetWidth;
        }

        function buildNextBatch() {
            var stageWidth = stage.clientWidth || window.innerWidth;
            var isMobile = window.innerWidth <= 768;
            var sidePadding = isMobile ? 36 : 48;
            var minGap = isMobile ? 28 : 48;
            var maxWords = isMobile ? 2 : 5;
            var availableWidth = stageWidth - sidePadding;

            var batch = [];
            var usedWidth = 0;

            for (var i = 0; i < maxWords; i++) {
                var word = platforms[(currentIndex + i) % platforms.length];
                var w = getWordWidth(word);
                var needed = batch.length === 0 ? w : w + minGap;

                if (batch.length === 0 || usedWidth + needed <= availableWidth) {
                    batch.push(word);
                    usedWidth += needed;
                } else {
                    break;
                }
            }

            currentIndex = (currentIndex + batch.length) % platforms.length;
            return batch;
        }

        function createGroupElement(words, stateClass) {
            var group = document.createElement('div');
            group.className = 'platforms-group ' + stateClass;
            words.forEach(function (word) {
                var span = document.createElement('span');
                span.className = 'platform-word';
                span.textContent = word;
                group.appendChild(span);
            });
            return group;
        }

        function showInitial() {
            stage.innerHTML = '';
            var words = buildNextBatch();
            activeGroupEl = createGroupElement(words, 'is-active');
            stage.appendChild(activeGroupEl);
        }

        function pushNext() {
            if (document.hidden) return;

            var words = buildNextBatch();
            var incomingGroup = createGroupElement(words, 'is-entering');
            stage.appendChild(incomingGroup);

            void incomingGroup.offsetWidth;

            var outgoingGroup = activeGroupEl;
            if (outgoingGroup) {
                outgoingGroup.classList.remove('is-active');
                outgoingGroup.classList.add('is-exiting');
                setTimeout(function () {
                    outgoingGroup.remove();
                }, 900);
            }

            incomingGroup.classList.remove('is-entering');
            incomingGroup.classList.add('is-active');
            activeGroupEl = incomingGroup;
        }

        showInitial();
        setInterval(pushNext, 3500);

        var resizeTimeout;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function () {
                showInitial();
            }, 200);
        });
    }

    // Инициализация всех систем хаба без конфликтов
    document.addEventListener('DOMContentLoaded', function () {
        init_core_events();
        init_bento();
        init_interactive_panels();
        init_mobile_footer_tabs();
        init_platforms_showcase();
    });
})();


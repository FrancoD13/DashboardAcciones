(function () {
    const ORIGINAL_MARKUP_KEY = '__tvOriginalMarkup';

    initViewNavigation();
    initTradingViewEmbeds();

    function initViewNavigation() {
        const viewButtons = document.querySelectorAll('[data-view-target]');
        const views = document.querySelectorAll('.view');

        if (!viewButtons.length || !views.length) {
            return;
        }

        const viewList = Array.from(views);

        const showView = (target) => {
            const targetView = viewList.find((view) => view.dataset.view === target);
            if (!targetView) {
                return false;
            }

            let hasChanged = false;

            viewList.forEach((view) => {
                const shouldBeActive = view === targetView;
                const wasActive = view.classList.contains('is-active');

                view.classList.toggle('is-active', shouldBeActive);

                if (wasActive !== shouldBeActive) {
                    hasChanged = true;
                }
            });

            return hasChanged;
        };

        viewButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const target = button.dataset.viewTarget;
                if (!target) {
                    return;
                }

                const changed = showView(target);
                if (!changed) {
                    return;
                }

                resetTradingViewEmbeds();
                initTradingViewEmbeds();
            });
        });
    }

    function resetTradingViewEmbeds() {
        const widgetContainers = document.querySelectorAll('[data-widget-src]');
        widgetContainers.forEach((container) => {
            const generatedScript = container.querySelector('script[data-generated="tradingview"]');
            if (generatedScript) {
                generatedScript.remove();
            }

            if (container[ORIGINAL_MARKUP_KEY]) {
                container.innerHTML = container[ORIGINAL_MARKUP_KEY];
            }
        });
    }

    function initTradingViewEmbeds() {
        const widgetContainers = document.querySelectorAll('[data-widget-src]');
        if (!widgetContainers.length) {
            return;
        }

        widgetContainers.forEach((container) => {
            if (!container[ORIGINAL_MARKUP_KEY]) {
                container[ORIGINAL_MARKUP_KEY] = container.innerHTML;
            }

            const configNode = container.querySelector('.tradingview-config');
            if (!configNode) {
                return;
            }

            const configText = configNode.textContent.trim();
            if (!configText) {
                return;
            }

            const existingScript = container.querySelector('script[data-generated="tradingview"]');
            if (existingScript) {
                return;
            }

            const script = document.createElement('script');
            script.src = container.dataset.widgetSrc;
            script.async = true;
            script.type = 'text/javascript';
            script.text = configText;
            script.dataset.generated = 'tradingview';

            container.appendChild(script);
        });
    }
})();

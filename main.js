(function () {
    initTabs();
    initTradingViewEmbeds();

    function initTabs() {
        const panels = document.querySelectorAll('.panel');

        panels.forEach(panel => {
            const tabs = panel.querySelectorAll('.tab');
            const panes = panel.querySelectorAll('.tab-pane');

            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const target = tab.dataset.target;

                    tabs.forEach(t => t.classList.toggle('is-active', t === tab));
                    panes.forEach(pane => {
                        const isActive = pane.dataset.content === target;
                        pane.classList.toggle('is-active', isActive);
                    });
                });
            });
        });
    }

    function initTradingViewEmbeds() {
        const widgetContainers = document.querySelectorAll('[data-widget-src]');
        if (!widgetContainers.length) {
            return;
        }

        widgetContainers.forEach(container => {
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
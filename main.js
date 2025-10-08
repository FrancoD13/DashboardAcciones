(function () {
    const ORIGINAL_MARKUP_KEY = '__tvOriginalMarkup';

    obtenerCotizacionDolar();
    initViewNavigation();
    initTradingViewEmbeds();
    

    function initViewNavigation() {
        const viewButtons = document.querySelectorAll('[data-view-target]');
        const views = document.querySelectorAll('.view');

        if (!viewButtons.length || !views.length) {
            return;
        }

        const showView = (target) => {
            const targetView = document.querySelector(`.view[data-view="${target}"]`);
            if (!targetView) {
                return false;
            }

            const activeView = document.querySelector('.view.is-active');
            if (activeView === targetView) {
                return false;
            }

            if (activeView) {
                activeView.classList.remove('is-active');
            }

            targetView.classList.add('is-active');
            return true;
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
                obtenerCotizacionDolar();
                
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

    async function obtenerCotizacionDolar() {

            const urlDolarActual = "https://dolarapi.com/v1/dolares/oficial";
            const url = "https://api.bcra.gob.ar/estadisticascambiarias/v1.0/Cotizaciones/USD";
            const bloqueCotizacion = document.getElementById('valor-cotizacion');
            const bloqueFecha = document.getElementById('fecha-cotizacion');
            const bloqueVariacion = document.getElementById('variacion-diaria');

            // Asegurarse de que el bloque diga "Cargando..."
            bloqueCotizacion.textContent = "Cargando...";
            bloqueFecha.textContent = "";

            try {
                // 1. Realizar la solicitud a la API
                const respuestaActual = await fetch(urlDolarActual);
                if (!respuestaActual.ok) {
                    throw new Error(`Error HTTP: ${respuestaActual.status}`);
                }

                const respuesta = await fetch(url);
                if (!respuesta.ok) {
                    throw new Error(`Error HTTP: ${respuesta.status}`);
                }

                // 2. Convertir la respuesta a JSON
                const datosActual = await respuestaActual.json();
                const datos = await respuesta.json();

                // La API del BCRA devuelve un array de objetos. Se asume que el primer elemento
                // contiene la cotización más reciente.

                if(datosActual && datos && datos.results && datos.results.length > 0) {

                    const cotizacionAnterior = datos.results[0].detalle[0];
                    const valorAnterior = cotizacionAnterior.tipoCotizacion;
                    const fechaAnterior = datos.results[0].fecha; // Ej. "2023-10-06T00:00:00"

                    const valorActual = datosActual.venta;
                    const fechaActual = datosActual.fechaActualizacion;
                    let variacion = (valorActual/valorAnterior)-1;
                    const variacionFormateada = new Intl.NumberFormat('es-AR', {
                            style: 'percent',
                            minimumFractionDigits: 2 // La API devuelve varios decimales
                        }).format(variacion);

                    if (valorActual) {
                        const valorFormateado = new Intl.NumberFormat('es-AR', {
                            style: 'currency',
                            currency: 'ARS',
                            minimumFractionDigits: 2 // La API devuelve varios decimales
                        }).format(valorActual);
                        bloqueCotizacion.textContent = valorFormateado;
                        bloqueVariacion.textContent = `(${variacionFormateada})`;
                        if (variacion >= 0) {
                            bloqueVariacion.classList.add('positivo');
                        } else {
                            bloqueVariacion.classList.add('negativo');
                        }
                    } else {
                        bloqueCotizacion.textContent = "Valor no encontrado";
                    }

                    if (fechaActual) {
                        const fechaActual = new Date();
                        const fechaFormateada = fechaActual.toLocaleDateString('es-AR', {
                            hour: 'numeric',
                            minute: 'numeric',
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric'
                        });
                        bloqueFecha.textContent = `Actualizado: ${fechaFormateada}`;
                    }
                } else {
                    bloqueCotizacion.textContent = "Datos de cotización no disponibles.";
                }
                

                

            } catch (error) {
                // 5. Manejar errores (ej. problemas de red o de la API)
                console.error("Error al obtener la cotización:", error);
                bloqueCotizacion.textContent = "Error al cargar los datos.";
            }
        }

})();

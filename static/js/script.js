document.addEventListener("DOMContentLoaded", function () {
    const paginaActual = document.body.dataset.page;
    const etiquetaHtml = document.documentElement;
    iniciarAccesibilidad();
    iniciarMenuDeNavegacion();
    iniciarFormularioTriaje();
    if (paginaActual === "inicio") {
        iniciarCalculadoraDeAire();
    } else if (paginaActual === "linea") {
        iniciarLineaDeTiempo();
        iniciarFiltros();
        iniciarMenuLateral();
        iniciarCuestionarioSencillo();
        iniciarTemporizadorDeInactividad();
    } else if (paginaActual === "guia") {
        iniciarMapaInteractivo();
        iniciarCalculadoraPresupuesto();
    } else if (paginaActual === "mitos") {
        iniciarJuegoDeMitos();
        iniciarFormularioDeRumores();
        iniciarAcordeonFAQ();
    }

    function iniciarAccesibilidad() {
        const memoriaTexto = localStorage.getItem("chile-respira-a11y");
        let preferencias = {};
        if (memoriaTexto) {
            try {
                preferencias = JSON.parse(memoriaTexto);
            } catch (e) { }
        }
        if (preferencias.contrast) etiquetaHtml.classList.add("contrast");
        if (preferencias.dyslexia) etiquetaHtml.classList.add("dyslexia");
        if (preferencias.font) etiquetaHtml.dataset.font = preferencias.font;
        const botones = document.querySelectorAll("[data-a11y]");
        botones.forEach(function (boton) {
            boton.addEventListener("click", function () {
                const accion = boton.dataset.a11y;
                if (accion === "contrast") {
                    etiquetaHtml.classList.toggle("contrast");
                } else if (accion === "dyslexia") {
                    etiquetaHtml.classList.toggle("dyslexia");
                    boton.setAttribute(
                        "aria-pressed",
                        String(etiquetaHtml.classList.contains("dyslexia")),
                    );
                } else if (accion === "font-up") {
                    let tamaño = Number(etiquetaHtml.dataset.font || 0);
                    if (tamaño < 3) etiquetaHtml.dataset.font = String(tamaño + 1);
                } else if (accion === "font-down") {
                    let tamaño = Number(etiquetaHtml.dataset.font || 0);
                    if (tamaño > 0)
                        etiquetaHtml.dataset.font =
                            tamaño - 1 === 0 ? "" : String(tamaño - 1);
                } else if (accion === "speech") {
                    leerPantallaEnVozAlta(boton);
                }
                localStorage.setItem(
                    "chile-respira-a11y",
                    JSON.stringify({
                        contrast: etiquetaHtml.classList.contains("contrast"),
                        dyslexia: etiquetaHtml.classList.contains("dyslexia"),
                        font: etiquetaHtml.dataset.font || "",
                    }),
                );
            });
        });
    }

    function leerPantallaEnVozAlta(boton) {
        if (!window.speechSynthesis) return;
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
            boton.setAttribute("aria-pressed", "false");
            return;
        }
        const mainText = document.querySelector("main")?.innerText || "";
        const voz = new SpeechSynthesisUtterance(mainText.slice(0, 4000));
        voz.lang = "es-CL";
        voz.onend = function () {
            boton.setAttribute("aria-pressed", "false");
        };
        speechSynthesis.speak(voz);
        boton.setAttribute("aria-pressed", "true");
    }

    function iniciarMenuDeNavegacion() {
        const botonMenu = document.querySelector(".nav-toggle");
        const menuPrincipal = document.getElementById("nav-principal");
        if (botonMenu && menuPrincipal) {
            botonMenu.addEventListener("click", function () {
                const estaAbierto = menuPrincipal.classList.toggle("is-open");
                botonMenu.setAttribute("aria-expanded", String(estaAbierto));
            });
        }
    }

    function iniciarFormularioTriaje() {
        const ventanaModal = document.getElementById("modal-triaje");
        const cajaResultado = document.getElementById("triaje-resultado");
        const mensajes = document.querySelectorAll(".triaje-msg");
        if (!ventanaModal) return;
        document.querySelectorAll("[data-open-triaje]").forEach((btn) => {
            btn.addEventListener("click", () => {
                ventanaModal.classList.remove("is-hidden");
            });
        });
        ventanaModal.querySelectorAll("[data-close-modal]").forEach((btn) => {
            btn.addEventListener("click", () => {
                ventanaModal.classList.add("is-hidden");
            });
        });
        ventanaModal.querySelectorAll("input[name='triaje']").forEach((opcion) => {
            opcion.addEventListener("change", function () {
                if (cajaResultado) {
                    cajaResultado.classList.remove("is-hidden");
                    mensajes.forEach((msg) => msg.classList.add("is-hidden"));
                    const activo = document.getElementById("msg-" + this.value);
                    if (activo) activo.classList.remove("is-hidden");
                }
            });
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && !ventanaModal.classList.contains("is-hidden")) {
                ventanaModal.classList.add("is-hidden");
            }
        });
    }

    function iniciarCalculadoraDeAire() {
        const formulario = document.getElementById("form-aire");
        const cajaResultado = document.getElementById("aire-resultado");
        const textoResultado = document.getElementById("aire-texto");
        if (!formulario) return;
        formulario.addEventListener("submit", function (evento) {
            evento.preventDefault();
            const largo = Number(formulario.largo.value);
            const ancho = Number(formulario.ancho.value);
            const alto = Number(formulario.alto.value);
            const personas = Number(formulario.personas.value);
            const volumenTotal = largo * ancho * alto;
            const espacioPorPersona = volumenTotal / personas;
            let minutosDeVentilacion = 5;
            if (espacioPorPersona < 8) minutosDeVentilacion = 8;
            else if (espacioPorPersona >= 12) minutosDeVentilacion = 3;
            cajaResultado.classList.remove("is-hidden");
            textoResultado.textContent = `Volumen aproximado: ${volumenTotal.toFixed(1)} m³ (${espacioPorPersona.toFixed(1)} m³ por persona). Microventilación cruzada: ${minutosDeVentilacion} minutos cada hora, rendija de 5 cm en ventanas opuestas. Si hay vaho o CO₂ > 700 ppm, ventila de inmediato.`;
        });
    }

    function iniciarLineaDeTiempo() {
        const botonesDeLinea = document.querySelectorAll(".timeline-trigger");
        const videos = document.querySelectorAll(".media-layer");
        if (botonesDeLinea.length === 0 || videos.length === 0) return;

        const observador = new IntersectionObserver(
            function (elementos) {
                elementos.forEach(function (elemento) {
                    if (elemento.isIntersecting) {
                        const epoca = elemento.target.dataset.era;
                        botonesDeLinea.forEach((b) => b.classList.remove("active"));
                        elemento.target.classList.add("active");
                        videos.forEach((capa) => {
                            capa.classList.remove("active");
                            const reproductor = capa.querySelector("video");
                            if (capa.id === "media-" + epoca) {
                                capa.classList.add("active");
                                if (reproductor) reproductor.play().catch(() => { });
                            } else if (reproductor) {
                                reproductor.pause();
                            }
                        });
                    }
                });
            },
            { threshold: 0.5 },
        );
        botonesDeLinea.forEach((b) => observador.observe(b));
    }

    function iniciarFiltros() {
        const botonesDeFiltro = document.querySelectorAll(".filter-bar .chip");
        const textosDeLectura = document.querySelectorAll(".era-block");
        const botonesDeLinea = document.querySelectorAll(".timeline-trigger");
        const enlacesDelMenuLateral = document.querySelectorAll(".era-link");
        if (botonesDeFiltro.length === 0) return;

        botonesDeFiltro.forEach(function (botonPresionado) {
            botonPresionado.addEventListener("click", function () {
                const categoria = botonPresionado.dataset.category;
                botonesDeFiltro.forEach((b) => b.classList.remove("is-on"));
                botonPresionado.classList.add("is-on");
                const filtrarElemento = (el) => {
                    const cat = el.dataset.category || el.dataset.topic || "";
                    if (categoria === "all" || cat.includes(categoria)) {
                        el.classList.remove("is-hidden");
                        el.style.display = "";
                    } else {
                        el.classList.add("is-hidden");
                        el.style.display = "none";
                    }
                };
                botonesDeLinea.forEach(filtrarElemento);
                textosDeLectura.forEach(filtrarElemento);

                enlacesDelMenuLateral.forEach(function (enlace) {
                    const targetId = enlace.getAttribute("href").substring(1);
                    const bloque = document.getElementById(targetId);
                    if (bloque) {
                        const cat = bloque.dataset.category || "";
                        enlace.style.display =
                            categoria === "all" || cat.includes(categoria) ? "" : "none";
                    }
                });
            });
        });
    }

    function iniciarMenuLateral() {
        const enlacesMenu = document.querySelectorAll(".era-link");
        const bloquesTexto = document.querySelectorAll(".era-block");

        enlacesMenu.forEach(function (enlace) {
            enlace.addEventListener("click", function (evento) {
                evento.preventDefault();
                const targetId = enlace.getAttribute("href").substring(1);
                const bloque = document.getElementById(targetId);
                if (bloque)
                    bloque.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        });

        const vigilante = new IntersectionObserver(
            function (elementos) {
                elementos.forEach(function (elemento) {
                    if (elemento.isIntersecting) {
                        const idVisible = elemento.target.id;
                        enlacesMenu.forEach((enlace) => {
                            enlace.classList.toggle(
                                "active",
                                enlace.getAttribute("href") === "#" + idVisible,
                            );
                        });
                    }
                });
            },
            { threshold: 0.3 },
        );
        bloquesTexto.forEach((b) => vigilante.observe(b));
    }

    function iniciarCuestionarioSencillo() {
        const opciones = document.querySelectorAll(".quiz-option");
        const mensajeCaja = document.getElementById("quiz-feedback");
        if (!mensajeCaja) return;

        opciones.forEach(function (opcion) {
            opcion.addEventListener("click", function () {
                const esCorrecta = opcion.dataset.correct === "true";
                opciones.forEach((opt) => opt.classList.remove("correct", "incorrect"));
                if (esCorrecta) {
                    opcion.classList.add("correct");
                    mensajeCaja.textContent =
                        "¡Correcto! El Plan de Invierno se enfocó en mitigar la mortalidad infantil por neumonías e Influenza A.";
                    mensajeCaja.className = "quiz-feedback success";
                } else {
                    opcion.classList.add("incorrect");
                    mensajeCaja.textContent =
                        "Vuelve a intentarlo. El Plan de Invierno no se centró en emisiones industriales ni vacunación masiva en esa época.";
                    mensajeCaja.className = "quiz-feedback error";
                }
                mensajeCaja.classList.remove("is-hidden");
            });
        });
    }

    function iniciarTemporizadorDeInactividad() {
        const LIMITE_DE_TIEMPO = 5000;
        let relojTemporizador = null;
        let yaCambioPantalla = false;
        const areaPrincipal = document.querySelector(
            ".timeline-cinematic-container",
        );
        if (!areaPrincipal) return;

        function reiniciarElReloj(evento) {
            if (yaCambioPantalla) return;
            if (evento && areaPrincipal.contains(evento.target)) return;
            clearTimeout(relojTemporizador);
            relojTemporizador = setTimeout(activarEfecto, LIMITE_DE_TIEMPO);
        }
        ["mousemove", "scroll", "keydown", "click", "touchstart"].forEach((evt) => {
            window.addEventListener(evt, reiniciarElReloj, { passive: true });
        });
        reiniciarElReloj();

        function activarEfecto() {
            yaCambioPantalla = true;
            const videoActivo = document.querySelector(".media-layer.active");
            if (videoActivo) {
                videoActivo.classList.add("is-metamorphosed");
                const reproductor = videoActivo.querySelector(".video-metamorfosis");
                if (reproductor) reproductor.play().catch(() => { });
            }
        }
    }

    function iniciarMapaInteractivo() {
        const zonasDelMapa = document.querySelectorAll(".map-region-vector");
        const cuadroFlotante = document.getElementById("nyt-live-tooltip");
        const mapWrapper = document.querySelector(".map-wrapper");
        if (zonasDelMapa.length === 0 || !cuadroFlotante || !mapWrapper) return;

        zonasDelMapa.forEach(function (zonaShape) {
            zonaShape.addEventListener("mousemove", function (evento) {
                cuadroFlotante.classList.remove("is-hidden");
                const rectContenedor = mapWrapper.getBoundingClientRect();
                cuadroFlotante.style.left =
                    evento.clientX - rectContenedor.left + 15 + "px";
                cuadroFlotante.style.top =
                    evento.clientY - rectContenedor.top + 15 + "px";
                document.getElementById("tt-name").textContent = zonaShape.dataset.name;
                document.getElementById("tt-positivity").textContent =
                    zonaShape.dataset.positivity + "%";
                document.getElementById("tt-cobertura").textContent =
                    zonaShape.dataset.cobertura + "%";
            });
            zonaShape.addEventListener("mouseleave", () =>
                cuadroFlotante.classList.add("is-hidden"),
            );
        });
    }

    function iniciarCalculadoraPresupuesto() {
        const formulario = document.getElementById("form-presupuesto");
        const cajaDeResultado = document.getElementById("presupuesto-resultado");
        if (!formulario || !cajaDeResultado) return;

        formulario.addEventListener("submit", function (evento) {
            evento.preventDefault();
            const numeroSalas = Number(document.getElementById("salas").value);
            const perfilElegido = document.getElementById("perfil").value;
            cajaDeResultado.classList.remove("is-hidden");
            document.getElementById("presupuesto-rural").classList.add("is-hidden");
            document
                .getElementById("presupuesto-institucional")
                .classList.add("is-hidden");
            if (perfilElegido === "rural") {
                document
                    .getElementById("presupuesto-rural")
                    .classList.remove("is-hidden");
                document.getElementById("titulo-rural").textContent =
                    `Kit rural para ${numeroSalas} recintos`;
                document.getElementById("desc-rural").textContent =
                    `Cloro: ~${numeroSalas} L/semana (10 mL/L, renovar cada 24 h). Deflectores de cartón: ${numeroSalas * 2}. Costo referencial $0–$${(numeroSalas * 500).toLocaleString("es-CL")} CLP.`;
            } else {
                document
                    .getElementById("presupuesto-institucional")
                    .classList.remove("is-hidden");
                const numeroDispensadores = Math.ceil(numeroSalas / 2);
                document.getElementById("titulo-institucional").textContent =
                    `Kit institucional para ${numeroSalas} recintos`;
                document.getElementById("desc-institucional").textContent =
                    `1 sensor CO₂ y 1–2 deflectores por sala. Dispensadores: ${numeroDispensadores}. Inversión $${(numeroSalas * 40000).toLocaleString("es-CL")} – $${(numeroSalas * 120000).toLocaleString("es-CL")} CLP. Reducción estimada de carga viral hasta 85% con umbral 700 ppm.`;
            }
        });
    }

    function iniciarJuegoDeMitos() {
        const listaDeCartas = [
            {
                pregunta:
                    "La vacuna contra la Influenza me enferma o me produce una gripe fuerte.",
                esVerdadera: false,
                explicacion:
                    "Las vacunas del PNI usan virus inactivados o fracciones proteicas que no se replican. Dolor local o febrícula es respuesta inmune, no la enfermedad.",
                fuenteDatos: "SOCHINF / MINSAL",
                accionClave:
                    "Vacúnate cada año; la protección plena llega a las 2 semanas.",
                textoParaCompartir:
                    "¿Sabías que la vacuna no te enferma? Son virus inactivados. Mira la explicación en Chile Respira.",
            },
            {
                pregunta:
                    "Si tengo fiebre y dolor de cuerpo por Influenza, debo tomar antibióticos.",
                esVerdadera: false,
                explicacion:
                    "La Influenza es viral. Los antibióticos no actúan sobre virus y generan resistencia bacteriana. Solo un médico indica antivirales en alto riesgo.",
                fuenteDatos: "OPS/OMS / ISP",
                accionClave:
                    "Reposo, hidratación y analgésicos bajo indicación médica.",
                textoParaCompartir:
                    "Los antibióticos no curan la Influenza. Es un virus, no una bacteria.",
            },
            {
                pregunta: "Si soy una persona joven y sana, no necesito vacunarme.",
                esVerdadera: false,
                explicacion:
                    "Las personas jóvenes son vectores hacia lactantes, mayores y crónicos. En sanos puede haber neumonía y ausentismo laboral de más de 7 días.",
                fuenteDatos: "CDC / DEIS Chile",
                accionClave:
                    "Si convives con grupos de riesgo, tu dosis protege a la comunidad.",
                textoParaCompartir:
                    "Aunque seas joven y sano, la vacuna reduce la transmisión comunitaria.",
            },
            {
                pregunta:
                    "El aire helado de la ventana es lo que produce el virus de la Influenza.",
                esVerdadera: false,
                explicacion:
                    "El frío no genera patógenos. El contagio ocurre en espacios cerrados donde los aerosoles flotan horas. La ventilación cruzada reduce el contagio hasta un 80%.",
                fuenteDatos: "MINVU / OMS",
                accionClave:
                    "Ventila a diario: el enemigo es el aire viciado, no el fresco.",
                textoParaCompartir:
                    "El frío no causa Influenza. Cerrar todo concentra el virus en aerosoles.",
            },
            {
                pregunta:
                    "La vacuna que me puse el año pasado me sirve para este invierno.",
                esVerdadera: false,
                explicacion:
                    "El virus muta (variación antigénica). La OMS actualiza la fórmula cada año y los anticuerpos bajan a los 6–8 meses.",
                fuenteDatos: "ISP / WHO",
                accionClave: "Asiste cada año a un punto oficial de vacunación.",
                textoParaCompartir:
                    "La vacuna de Influenza se actualiza cada año porque el virus muta.",
            },
        ];

        let numeroDeCarta = 0;
        let puntosAcumulados = 0;
        const marcoTarjeta = document.getElementById("quiz-card");
        const textoPregunta = document.getElementById("mito-afirmacion");
        const textoVeredicto = document.getElementById("mito-veredicto");
        const textoExplicacion = document.getElementById("mito-explicacion");
        const textoFuente = document.getElementById("mito-fuente");
        const textoAccion = document.getElementById("mito-accion");
        const barraGrafica = document.getElementById("quiz-barra");
        const textoProgreso = document.getElementById("quiz-progreso");
        const botonSiguiente = document.getElementById("quiz-siguiente");
        const enlaceCompartir = document.getElementById("share-wa");
        const resultadoCard = document.getElementById("quiz-result-card");
        const resultText = document.getElementById("result-text");
        const btnCertAction = document.getElementById("btn-cert-action");
        if (!marcoTarjeta) return;
        if (resultadoCard) resultadoCard.style.display = "none";

        function dibujarPantalla() {
            marcoTarjeta.classList.remove("is-flipped");
            textoPregunta.textContent = listaDeCartas[numeroDeCarta].pregunta;
            const total = listaDeCartas.length;
            textoProgreso.textContent = `Tarjeta ${numeroDeCarta + 1} de ${total}`;
            barraGrafica.style.width = `${((numeroDeCarta + 1) / total) * 100}%`;
        }

        function evaluarRespuesta(respuestaDelJugador) {
            const esVerdadera = listaDeCartas[numeroDeCarta].esVerdadera;
            if (respuestaDelJugador === esVerdadera) {
                puntosAcumulados++;
                textoVeredicto.textContent = "¡Correcto!";
                textoVeredicto.style.color = "#10B981";
            } else {
                textoVeredicto.textContent = "Incorrecto";
                textoVeredicto.style.color = "var(--creative-coral)";
            }
            textoExplicacion.textContent = listaDeCartas[numeroDeCarta].explicacion;
            textoFuente.textContent =
                "Fuente: " + listaDeCartas[numeroDeCarta].fuenteDatos;
            textoAccion.textContent =
                "Acción clave: " + listaDeCartas[numeroDeCarta].accionClave;
            const mensajeBase =
                listaDeCartas[numeroDeCarta].textoParaCompartir +
                " " +
                window.location.href;
            enlaceCompartir.href =
                "https://wa.me/?text=" + encodeURIComponent(mensajeBase);
            marcoTarjeta.classList.add("is-flipped");
        }

        document.querySelectorAll("[data-answer]").forEach((boton) => {
            boton.addEventListener("click", function () {
                evaluarRespuesta(this.dataset.answer === "true");
            });
        });

        botonSiguiente.addEventListener("click", function () {
            numeroDeCarta++;
            if (numeroDeCarta >= listaDeCartas.length) {
                marcoTarjeta.style.display = "none";
                if (resultadoCard) {
                    resultadoCard.style.display = "block";
                    resultText.textContent = `Completaste la trivia. Acertaste ${puntosAcumulados} de ${listaDeCartas.length} afirmaciones.`;
                }
            } else {
                dibujarPantalla();
            }
        });

        if (btnCertAction) {
            btnCertAction.addEventListener("click", function () {
                generarYMostrarModalCertificado(puntosAcumulados, listaDeCartas.length);
            });
        }
        dibujarPantalla();
    }

    function generarYMostrarModalCertificado(puntos, total) {
        const modalCert = document.getElementById("modal-certificado");
        if (!modalCert) return;
        const cerrarModal = () => {
            modalCert.classList.add("is-hidden");
        };
        const btnCloseX = document.getElementById("btn-close-cert-modal");
        const btnCloseFoot = document.getElementById("btn-close-cert-modal-foot");
        const backdrop = document.getElementById("close-cert-backdrop");
        if (btnCloseX) btnCloseX.onclick = cerrarModal;
        if (btnCloseFoot) btnCloseFoot.onclick = cerrarModal;
        if (backdrop) backdrop.onclick = cerrarModal;
        document.getElementById("cert-puntos").textContent = puntos;
        document.getElementById("cert-total").textContent = total;
        const fechaHoy = new Date().toLocaleDateString("es-CL", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
        document.getElementById("cert-fecha").textContent = fechaHoy;
        modalCert.classList.remove("is-hidden");
    }

    function iniciarFormularioDeRumores() {
        const formularioCaja = document.getElementById("form-mitos");
        if (!formularioCaja) return;

        formularioCaja.addEventListener("submit", function (eventoSubmit) {
            eventoSubmit.preventDefault();
            const campoTexto = document.getElementById("rumor");
            const etiquetaMensaje = document.getElementById("form-mitos-msg");
            if (campoTexto.value.trim().length < 12) {
                etiquetaMensaje.textContent =
                    "Describe el mito con al menos 12 caracteres.";
                campoTexto.focus();
            } else {
                etiquetaMensaje.textContent =
                    "Solicitud registrada con éxito. El equipo revisará tu inquietud.";
                formularioCaja.reset();
            }
        });
    }

    function iniciarAcordeonFAQ() {
        document
            .querySelectorAll(".faq-body")
            .forEach((cuerpo) => (cuerpo.style.display = "none"));
        document
            .querySelectorAll(".faq-icon")
            .forEach((icono) => (icono.textContent = "+"));
    }

    window.toggleFaq = function (headerElement) {
        const faqCard = headerElement.parentElement;
        const faqBody = faqCard.querySelector(".faq-body");
        const faqIcon = faqCard.querySelector(".faq-icon");
        if (faqBody.style.display === "block") {
            faqBody.style.display = "none";
            if (faqIcon) faqIcon.textContent = "+";
        } else {
            faqBody.style.display = "block";
            if (faqIcon) faqIcon.textContent = "-";
        }
    };
});

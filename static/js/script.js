document.addEventListener("DOMContentLoaded", function () {
    
    let paginaActual = document.body.dataset.page;
    let etiquetaHtml = document.documentElement;

    iniciarAccesibilidad();
    iniciarMenuDeNavegacion();
    iniciarFormularioTriaje();

    if (paginaActual === "inicio") {
        iniciarCalculadoraDeAire();
    }
    
    if (paginaActual === "linea") {
        iniciarLineaDeTiempo();
        iniciarFiltros();
        iniciarMenuLateral();
        iniciarCuestionarioSencillo();
        iniciarTemporizadorDeInactividad();
    }
    
    if (paginaActual === "guia") {
        iniciarMapaInteractivo();
        iniciarCalculadoraPresupuesto();
    }
    
    if (paginaActual === "mitos") {
        iniciarJuegoDeMitos();
        iniciarFormularioDeRumores();
    }

    function iniciarAccesibilidad() {
        let memoriaTexto = localStorage.getItem("chile-respira-a11y");
        let preferencias = {};
        
        if (memoriaTexto !== null) {
            preferencias = JSON.parse(memoriaTexto);
        }

        if (preferencias.contrast === true) {
            etiquetaHtml.classList.add("contrast");
        }
        if (preferencias.dyslexia === true) {
            etiquetaHtml.classList.add("dyslexia");
        }
        if (preferencias.font !== undefined && preferencias.font !== "") {
            etiquetaHtml.dataset.font = preferencias.font;
        }

        let botones = document.querySelectorAll("[data-a11y]");
        
        botones.forEach(function (boton) {
            boton.addEventListener("click", function () {
                let accionDelBoton = boton.dataset.a11y;

                if (accionDelBoton === "contrast") {
                    etiquetaHtml.classList.toggle("contrast");
                }
                
                if (accionDelBoton === "dyslexia") {
                    etiquetaHtml.classList.toggle("dyslexia");
                    let tieneDislexia = etiquetaHtml.classList.contains("dyslexia");
                    boton.setAttribute("aria-pressed", String(tieneDislexia));
                }
                
                if (accionDelBoton === "font-up") {
                    let tamañoActual = Number(etiquetaHtml.dataset.font || 0);
                    if (tamañoActual < 3) {
                        etiquetaHtml.dataset.font = String(tamañoActual + 1);
                    }
                }
                
                if (accionDelBoton === "font-down") {
                    let tamañoActual = Number(etiquetaHtml.dataset.font || 0);
                    if (tamañoActual > 0) {
                        let nuevoTamaño = tamañoActual - 1;
                        if (nuevoTamaño === 0) {
                            etiquetaHtml.dataset.font = "";
                        } else {
                            etiquetaHtml.dataset.font = String(nuevoTamaño);
                        }
                    }
                }
                
                if (accionDelBoton === "speech") {
                    leerPantallaEnVozAlta(boton);
                }

                let datosParaGuardar = {
                    contrast: etiquetaHtml.classList.contains("contrast"),
                    dyslexia: etiquetaHtml.classList.contains("dyslexia"),
                    font: etiquetaHtml.dataset.font || ""
                };
                localStorage.setItem("chile-respira-a11y", JSON.stringify(datosParaGuardar));
            });
        });
    }

    function leerPantallaEnVozAlta(boton) {
        if (!window.speechSynthesis) {
            return;
        }
        
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
            boton.setAttribute("aria-pressed", "false");
            return;
        }
        
        let textoPrincipal = document.querySelector("main").innerText;
        let primeros4000Caracteres = textoPrincipal.slice(0, 4000);
        
        let voz = new SpeechSynthesisUtterance(primeros4000Caracteres);
        voz.lang = "es-CL";
        speechSynthesis.speak(voz);
        
        boton.setAttribute("aria-pressed", "true");
    }

    function iniciarMenuDeNavegacion() {
        let botonMenu = document.querySelector(".nav-toggle");
        let menuPrincipal = document.getElementById("nav-principal");
        
        if (botonMenu !== null && menuPrincipal !== null) {
            botonMenu.addEventListener("click", function () {
                let estaAbierto = menuPrincipal.classList.toggle("is-open");
                botonMenu.setAttribute("aria-expanded", String(estaAbierto));
            });
        }
    }

    function iniciarFormularioTriaje() {
        let ventanaModal = document.getElementById("modal-triaje");
        let cajaResultado = document.getElementById("triaje-resultado");
        
        if (ventanaModal === null) return;

        let mensajes = {
            critico: '<p class="status-badge">Alerta</p><h3>Alerta crítica</h3><p>Acude de inmediato a SAPU, CESFAM u hospital más cercano.</p>',
            moderado: "<h3>Sintomático moderado</h3><p>Reposo, hidratación, aislamiento preventivo y llama a Salud Responde 600 360 7777.</p>",
            leve: "<h3>Control preventivo</h3><p>Mascarilla en público, lavado frecuente de manos y monitoreo de temperatura.</p>"
        };

        let botonesAbrir = document.querySelectorAll("[data-open-triaje]");
        botonesAbrir.forEach(function (boton) {
            boton.addEventListener("click", function () {
                ventanaModal.hidden = false;
            });
        });

        let botonesCerrar = ventanaModal.querySelectorAll("[data-close-modal]");
        botonesCerrar.forEach(function (boton) {
            boton.addEventListener("click", function () {
                ventanaModal.hidden = true;
            });
        });

        let opciones = ventanaModal.querySelectorAll("input[name='triaje']");
        opciones.forEach(function (opcion) {
            opcion.addEventListener("change", function () {
                cajaResultado.hidden = false;
                let valorSeleccionado = opcion.value;
                cajaResultado.innerHTML = mensajes[valorSeleccionado];
            });
        });

        document.addEventListener("keydown", function (evento) {
            if (evento.key === "Escape") {
                ventanaModal.hidden = true;
            }
        });
    }

    function iniciarCalculadoraDeAire() {
        let formulario = document.getElementById("form-aire");
        let cajaResultado = document.getElementById("aire-resultado");
        let textoResultado = document.getElementById("aire-texto");
        
        if (formulario === null) return;

        formulario.addEventListener("submit", function (evento) {
            evento.preventDefault();
            
            let largo = Number(formulario.largo.value);
            let ancho = Number(formulario.ancho.value);
            let alto = Number(formulario.alto.value);
            let personas = Number(formulario.personas.value);
            
            let volumenTotal = largo * ancho * alto;
            let espacioPorPersona = volumenTotal / personas;
            
            let minutosDeVentilacion = 5;
            
            if (espacioPorPersona < 8) {
                minutosDeVentilacion = 8;
            } else if (espacioPorPersona >= 12) {
                minutosDeVentilacion = 3;
            }
            
            cajaResultado.hidden = false;
            textoResultado.textContent = "Volumen aproximado: " + volumenTotal.toFixed(1) + " m³ (" + espacioPorPersona.toFixed(1) + " m³ por persona). Microventilación cruzada: " + minutosDeVentilacion + " minutos cada hora, rendija de 5 cm en ventanas opuestas. Si hay vaho o CO₂ > 700 ppm, ventila de inmediato.";
        });
    }

    function iniciarLineaDeTiempo() {
        let botonesDeLinea = document.querySelectorAll('.timeline-trigger');
        let videos = document.querySelectorAll('.media-layer');

        if (botonesDeLinea.length === 0 || videos.length === 0) return;

        let observadorDePantalla = new IntersectionObserver(function (elementos) {
            elementos.forEach(function (elementoVisto) {
                
                if (elementoVisto.isIntersecting === true) {
                    let epoca = elementoVisto.target.dataset.era;

                    botonesDeLinea.forEach(function (boton) {
                        boton.classList.remove('active');
                    });
                    
                    elementoVisto.target.classList.add('active');

                    videos.forEach(function (capaVideo) {
                        capaVideo.classList.remove('active');
                        let reproductor = capaVideo.querySelector('video');
                        
                        if (capaVideo.id === 'media-' + epoca) {
                            capaVideo.classList.add('active');
                            if (reproductor !== null) {
                                reproductor.play();
                            }
                        } else {
                            if (reproductor !== null) {
                                reproductor.pause();
                            }
                        }
                    });
                }
            });
        }, { threshold: 0.5 });

        botonesDeLinea.forEach(function (boton) {
            observadorDePantalla.observe(boton);
        });
    }

    function iniciarFiltros() {
        let botonesDeFiltro = document.querySelectorAll(".filter-bar .chip");
        let textosDeLectura = document.querySelectorAll(".era-block");
        let botonesDeLinea = document.querySelectorAll(".timeline-trigger");
        let enlacesDelMenuLateral = document.querySelectorAll(".era-link");

        if (botonesDeFiltro.length === 0) return;

        botonesDeFiltro.forEach(function (botonPresionado) {
            botonPresionado.addEventListener("click", function () {
                let categoriaSeleccionada = botonPresionado.dataset.category;

                botonesDeFiltro.forEach(function (boton) {
                    boton.classList.remove("is-on");
                });
                botonPresionado.classList.add("is-on");

                botonesDeLinea.forEach(function (elementoLinea) {
                    let categoriasDelElemento = elementoLinea.dataset.category || elementoLinea.dataset.topic || "";
                    
                    if (categoriaSeleccionada === "all" || categoriasDelElemento.includes(categoriaSeleccionada)) {
                        elementoLinea.classList.remove("hidden");
                        elementoLinea.style.display = "";
                    } else {
                        elementoLinea.classList.add("hidden");
                        elementoLinea.style.display = "none";
                    }
                });

                textosDeLectura.forEach(function (bloqueTexto) {
                    let categoriasDelBloque = bloqueTexto.dataset.category || bloqueTexto.dataset.topic || "";
                    
                    if (categoriaSeleccionada === "all" || categoriasDelBloque.includes(categoriaSeleccionada)) {
                        bloqueTexto.classList.remove("hidden");
                        bloqueTexto.style.display = "";
                    } else {
                        bloqueTexto.classList.add("hidden");
                        bloqueTexto.style.display = "none";
                    }
                });

                enlacesDelMenuLateral.forEach(function (enlace) {
                    let idDelDestino = enlace.getAttribute("href").substring(1);
                    let bloqueDestino = document.getElementById(idDelDestino);
                    
                    if (bloqueDestino !== null) {
                        let categoriasDestino = bloqueDestino.dataset.category || "";
                        if (categoriaSeleccionada === "all" || categoriasDestino.includes(categoriaSeleccionada)) {
                            enlace.style.display = "";
                        } else {
                            enlace.style.display = "none";
                        }
                    }
                });
            });
        });
    }

    function iniciarMenuLateral() {
        let enlacesMenu = document.querySelectorAll(".era-link");
        let bloquesTexto = document.querySelectorAll(".era-block");

        enlacesMenu.forEach(function (enlace) {
            enlace.addEventListener("click", function (evento) {
                evento.preventDefault();
                let idDelBloque = enlace.getAttribute("href").substring(1);
                let bloqueDeDestino = document.getElementById(idDelBloque);
                
                if (bloqueDeDestino !== null) {
                    bloqueDeDestino.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });
        });

        let vigilanteDeScroll = new IntersectionObserver(function (elementos) {
            elementos.forEach(function (elementoVisible) {
                if (elementoVisible.isIntersecting === true) {
                    let idVisible = elementoVisible.target.id;
                    
                    enlacesMenu.forEach(function (enlace) {
                        enlace.classList.remove("active");
                        if (enlace.getAttribute("href") === "#" + idVisible) {
                            enlace.classList.add("active");
                        }
                    });
                }
            });
        }, { threshold: 0.3 });

        bloquesTexto.forEach(function (bloque) {
            vigilanteDeScroll.observe(bloque);
        });
    }

    function iniciarCuestionarioSencillo() {
        let opciones = document.querySelectorAll(".quiz-option");
        let mensajeCaja = document.getElementById("quiz-feedback");

        opciones.forEach(function (opcion) {
            opcion.addEventListener("click", function () {
                let respuestaEsVerdadera = opcion.dataset.correct === "true";

                opciones.forEach(function (opt) {
                    opt.classList.remove("correct");
                    opt.classList.remove("incorrect");
                });

                if (respuestaEsVerdadera === true) {
                    opcion.classList.add("correct");
                    mensajeCaja.textContent = "¡Correcto! El Plan de Invierno se enfocó en mitigar la mortalidad infantil por neumonías e Influenza A.";
                    mensajeCaja.classList.remove("error");
                    mensajeCaja.classList.add("success");
                } else {
                    opcion.classList.add("incorrect");
                    mensajeCaja.textContent = "Vuelve a intentarlo. El Plan de Invierno no se centró en emisiones industriales ni vacunación masiva en esa época.";
                    mensajeCaja.classList.remove("success");
                    mensajeCaja.classList.add("error");
                }
                
                mensajeCaja.classList.remove("hidden");
            });
        });
    }

    function iniciarTemporizadorDeInactividad() {
        let LIMITE_DE_TIEMPO = 5000;
        let relojTemporizador = null;
        let yaCambioPantalla = false;

        let areaPrincipal = document.querySelector('.timeline-cinematic-container');
        if (areaPrincipal === null) return;

        function reiniciarElReloj(evento) {
            if (yaCambioPantalla === true) return;

            if (evento !== undefined && areaPrincipal.contains(evento.target)) {
                return;
            }

            clearTimeout(relojTemporizador);
            relojTemporizador = setTimeout(activarSustoMagico, LIMITE_DE_TIEMPO);
        }

        window.addEventListener('mousemove', reiniciarElReloj);
        window.addEventListener('scroll', reiniciarElReloj, { passive: true });
        window.addEventListener('keydown', reiniciarElReloj);
        window.addEventListener('click', reiniciarElReloj);
        window.addEventListener('touchstart', reiniciarElReloj, { passive: true });

        reiniciarElReloj();

        function activarSustoMagico() {
            yaCambioPantalla = true;

            window.removeEventListener('mousemove', reiniciarElReloj);
            window.removeEventListener('scroll', reiniciarElReloj);
            window.removeEventListener('keydown', reiniciarElReloj);
            window.removeEventListener('click', reiniciarElReloj);
            window.removeEventListener('touchstart', reiniciarElReloj);

            let videoActivo = document.querySelector('.media-layer.active');
            if (videoActivo !== null) {
                videoActivo.classList.add('is-metamorphosed');
                
                let reproductorMagico = videoActivo.querySelector('.video-metamorfosis');
                if (reproductorMagico !== null) {
                    reproductorMagico.play();
                }
            }
        }
    }

    function iniciarMapaInteractivo() {
        let zonasDelMapa = document.querySelectorAll('.map-region-vector');
        let cuadroFlotante = document.getElementById('nyt-live-tooltip');
        
        let tituloAbajo = document.getElementById('tarjeta-titulo');
        let textoAbajo = document.getElementById('tarjeta-contenido');

        if (zonasDelMapa.length > 0 && cuadroFlotante !== null) {
            zonasDelMapa.forEach(function (zonaShape) {
                
                zonaShape.addEventListener('mousemove', function (eventoDelRaton) {
                    let nombreZona = zonaShape.dataset.name;
                    let positividad = zonaShape.dataset.positivity;
                    let cobertura = zonaShape.dataset.cobertura;

                    cuadroFlotante.classList.remove('hidden');
                    let posicionHorizontal = eventoDelRaton.offsetX + 15;
                    let posicionVertical = eventoDelRaton.offsetY + 15;
                    cuadroFlotante.style.left = posicionHorizontal + 'px';
                    cuadroFlotante.style.top = posicionVertical + 'px';

                    cuadroFlotante.innerHTML = `
                        <div style="font-size: 10px; color: var(--tech-cyan); font-weight: bold; letter-spacing: 1px;">📡 BOLETÍN EPIDEMIOLÓGICO DEIS</div>
                        <div style="font-size: 14px; font-weight: bold; color: var(--text-title); margin: 4px 0 8px;">${nombreZona}</div>
                        <div style="display: flex; gap: 15px; border-top: 1px solid var(--tech-muted); padding-top: 6px;">
                            <div>
                                <span style="font-size: 10px; color: var(--text-muted); display: block;">POSITIVIDAD ISP</span>
                                <span style="font-size: 13px; font-weight: bold; color: var(--creative-coral);">${positividad}%</span>
                            </div>
                            <div>
                                <span style="font-size: 10px; color: var(--text-muted); display: block;">COBERTURA PNI</span>
                                <span style="font-size: 13px; font-weight: bold; color: var(--tech-cyan);">${cobertura}%</span>
                            </div>
                        </div>
                    `;
                });

                zonaShape.addEventListener('mouseleave', function () {
                    cuadroFlotante.classList.add('hidden');
                });

                zonaShape.addEventListener('click', function () {
                    if (tituloAbajo !== null && textoAbajo !== null) {
                        let nombreSeleccionado = zonaShape.dataset.name || 'Zona seleccionada';
                        let textoDetallado = zonaShape.dataset.detalle || 'No hay información epidemiológica detallada disponible para esta región en este momento.';
                        
                        tituloAbajo.textContent = nombreSeleccionado;
                        textoAbajo.innerHTML = "<p>" + textoDetallado + "</p>";
                    }
                });
            });
        }
    }

    function iniciarCalculadoraPresupuesto() {
        let formulario = document.getElementById("form-presupuesto");
        let cajaDeResultado = document.getElementById("presupuesto-resultado");
        
        if (formulario === null) return;
        
        formulario.addEventListener("submit", function (evento) {
            evento.preventDefault();
            
            let numeroSalas = Number(document.getElementById("salas").value);
            let perfilElegido = document.getElementById("perfil").value;
            
            cajaDeResultado.hidden = false;
            
            if (perfilElegido === "rural") {
                let costoReferencia = numeroSalas * 500;
                let textoFinal = "<h3>Kit rural para " + numeroSalas + " recintos</h3>";
                textoFinal += "<p>Cloro: ~" + numeroSalas + " L/semana (10 mL/L, renovar cada 24 h). Deflectores de cartón: " + (numeroSalas * 2) + ". Costo referencial $0–$" + costoReferencia.toLocaleString("es-CL") + " CLP.</p>";
                cajaDeResultado.innerHTML = textoFinal;
            } else {
                let numeroDispensadores = Math.ceil(numeroSalas / 2);
                let costoMinimo = numeroSalas * 40000;
                let costoMaximo = numeroSalas * 120000;
                
                let textoFinal = "<h3>Kit institucional para " + numeroSalas + " recintos</h3>";
                textoFinal += "<p>1 sensor CO₂ y 1–2 deflectores por sala. Dispensadores: " + numeroDispensadores + ". Inversión $" + costoMinimo.toLocaleString("es-CL") + " – $" + costoMaximo.toLocaleString("es-CL") + " CLP. Reducción estimada de carga viral hasta 85% con umbral 700 ppm.</p>";
                cajaDeResultado.innerHTML = textoFinal;
            }
        });
    }

    function iniciarJuegoDeMitos() {
        let listaDeCartas = [
            {
                pregunta: "La vacuna contra la Influenza me enferma o me produce una gripe fuerte.",
                esVerdadera: false,
                explicacion: "Las vacunas del PNI usan virus inactivados o fracciones proteicas que no se replican. Dolor local o febrícula es respuesta inmune, no la enfermedad.",
                fuenteDatos: "SOCHINF / MINSAL",
                accionClave: "Vacúnate cada año; la protección plena llega a las 2 semanas.",
                textoParaCompartir: "¿Sabías que la vacuna no te enferma? Son virus inactivados. Mira la explicación en Chile Respira."
            },
            {
                pregunta: "Si tengo fiebre y dolor de cuerpo por Influenza, debo tomar antibióticos.",
                esVerdadera: false,
                explicacion: "La Influenza es viral. Los antibióticos no actúan sobre virus y generan resistencia bacteriana. Solo un médico indica antivirales en alto riesgo.",
                fuenteDatos: "OPS/OMS / ISP",
                accionClave: "Reposo, hidratación y analgésicos bajo indicación médica.",
                textoParaCompartir: "Los antibióticos no curan la Influenza. Es un virus, no una bacteria."
            },
            {
                pregunta: "Si soy una persona joven y sana, no necesito vacunarme.",
                esVerdadera: false,
                explicacion: "Las personas jóvenes son vectores hacia lactantes, mayores y crónicos. En sanos puede haber neumonía y ausentismo laboral de más de 7 días.",
                fuenteDatos: "CDC / DEIS Chile",
                accionClave: "Si convives con grupos de riesgo, tu dosis protege a la comunidad.",
                textoParaCompartir: "Aunque seas joven y sano, la vacuna reduce la transmisión comunitaria."
            },
            {
                pregunta: "El aire helado de la ventana es lo que produce el virus de la Influenza.",
                esVerdadera: false,
                explicacion: "El frío no genera patógenos. El contagio ocurre en espacios cerrados donde los aerosoles flotan horas. La ventilación cruzada puede reducir el contagio hasta un 80%.",
                fuenteDatos: "MINVU / OMS",
                accionClave: "Ventila a diario: el enemigo es el aire viciado, no el fresco.",
                textoParaCompartir: "El frío no causa Influenza. Cerrar todo concentra el virus en aerosoles."
            },
            {
                pregunta: "La vacuna que me puse el año pasado me sirve para este invierno.",
                esVerdadera: false,
                explicacion: "El virus muta (variación antigénica). La OMS actualiza la fórmula cada año y los anticuerpos bajan a los 6–8 meses.",
                fuenteDatos: "ISP / WHO",
                accionClave: "Asiste cada año a un punto oficial de vacunación.",
                textoParaCompartir: "La vacuna de Influenza se actualiza cada año porque el virus muta."
            }
        ];
        
        let numeroDeCarta = 0;
        let puntosAcumulados = 0;
        
        let marcoTarjeta = document.getElementById("quiz-card");
        let textoPregunta = document.getElementById("mito-afirmacion");
        let textoVeredicto = document.getElementById("mito-veredicto");
        let textoExplicacion = document.getElementById("mito-explicacion");
        let textoFuente = document.getElementById("mito-fuente");
        let textoAccion = document.getElementById("mito-accion");
        
        let barraGrafica = document.getElementById("quiz-barra");
        let textoProgreso = document.getElementById("quiz-progreso");
        let botonSiguiente = document.getElementById("quiz-siguiente");
        let enlaceCompartir = document.getElementById("share-wa");
        
        let seccionCierre = document.getElementById("quiz-cierre");
        let textoPuntajeFinal = document.getElementById("quiz-score");

        if (marcoTarjeta === null) return;

        function dibujarPantalla() {
            marcoTarjeta.classList.remove("is-flipped");
            
            textoPregunta.textContent = listaDeCartas[numeroDeCarta].pregunta;
            let totalPreguntas = listaDeCartas.length;
            textoProgreso.textContent = "Tarjeta " + (numeroDeCarta + 1) + " de " + totalPreguntas;
            
            let porcentajeLleno = (numeroDeCarta / totalPreguntas) * 100;
            if (porcentajeLleno === 0) {
                porcentajeLleno = 20;
            }
            barraGrafica.style.width = porcentajeLleno + "%";
        }

        function evaluarBoton(respuestaDelJugador) {
            let respuestaReal = listaDeCartas[numeroDeCarta].esVerdadera;
            let adivinoCorrectamente = false;
            
            if (respuestaDelJugador === respuestaReal) {
                adivinoCorrectamente = true;
                puntosAcumulados = puntosAcumulados + 1;
                textoVeredicto.textContent = "Correcto · FALSO";
            } else {
                textoVeredicto.textContent = "Incorrecto · FALSO";
            }
            
            textoExplicacion.textContent = listaDeCartas[numeroDeCarta].explicacion;
            textoFuente.textContent = "Fuente: " + listaDeCartas[numeroDeCarta].fuenteDatos;
            textoAccion.textContent = "Acción clave: " + listaDeCartas[numeroDeCarta].accionClave;
            
            let mensajeBase = listaDeCartas[numeroDeCarta].textoParaCompartir + " " + location.href;
            enlaceCompartir.href = "https://wa.me/?text=" + encodeURIComponent(mensajeBase);
            
            marcoTarjeta.classList.add("is-flipped");
        }

        let botonesRespuesta = document.querySelectorAll("[data-answer]");
        botonesRespuesta.forEach(function (boton) {
            boton.addEventListener("click", function () {
                let eligioVerdadero = false;
                if (boton.dataset.answer === "true") {
                    eligioVerdadero = true;
                }
                evaluarBoton(eligioVerdadero);
            });
        });

        botonSiguiente.addEventListener("click", function () {
            numeroDeCarta = numeroDeCarta + 1;
            let totalDeCartas = listaDeCartas.length;
            
            if (numeroDeCarta >= totalDeCartas) {
                marcoTarjeta.hidden = true;
                seccionCierre.hidden = false;
                barraGrafica.style.width = "100%";
                
                let mensajeFinal = "Acertaste " + puntosAcumulados + " de " + totalDeCartas + ". ";
                if (puntosAcumulados === 5) {
                    mensajeFinal += "Insignia Embajador de Aire Limpio desbloqueada.";
                } else {
                    mensajeFinal += "Revisa las explicaciones y vuelve a intentar cuando quieras.";
                }
                textoPuntajeFinal.textContent = mensajeFinal;
            } else {
                dibujarPantalla();
            }
        });

        let botonCertificado = document.getElementById("btn-certificado");
        if (botonCertificado !== null) {
            botonCertificado.addEventListener("click", function () {
                let lienzo = document.getElementById("certificado");
                let herramientasDibujo = lienzo.getContext("2d");
                lienzo.hidden = false;
                herramientasDibujo.fillStyle = "#0B0F19";
                herramientasDibujo.fillRect(0, 0, 900, 520);
                herramientasDibujo.strokeStyle = "#38BDF8";
                herramientasDibujo.strokeRect(24, 24, 852, 472);
                herramientasDibujo.fillStyle = "#FFFFFF";
                herramientasDibujo.font = "bold 32px Inter, sans-serif";
                herramientasDibujo.fillText("Embajador de Aire Limpio", 80, 180);
                herramientasDibujo.font = "20px Inter, sans-serif";
                herramientasDibujo.fillStyle = "#E2E8F0";
                herramientasDibujo.fillText("Chile Respira · Trivia Mitos vs Realidades", 80, 230);
                let fechaHoy = new Date().toLocaleDateString("es-CL");
                let textoFinal = "Puntaje: " + puntosAcumulados + " / 5 · " + fechaHoy;
                herramientasDibujo.fillText(textoFinal, 80, 280);
                let enlaceDeDescarga = document.getElementById("descargar-cert");
                enlaceDeDescarga.hidden = false;
                enlaceDeDescarga.href = lienzo.toDataURL("image/png");
            });
        }
        dibujarPantalla();
    }

    function iniciarFormularioDeRumores() {
        let formularioCaja = document.getElementById("form-mitos");
        if (formularioCaja === null) return;
        formularioCaja.addEventListener("submit", function (eventoSubmit) {
            eventoSubmit.preventDefault();
            let campoTexto = document.getElementById("rumor");
            let etiquetaMensaje = document.getElementById("form-mitos-msg");
            let textoEscrito = campoTexto.value.trim();
            if (textoEscrito.length < 12) {
                etiquetaMensaje.textContent = "Describe el mito con al menos 12 caracteres.";
                campoTexto.focus();
            } else {
                etiquetaMensaje.textContent = "Solicitud registrada en este dispositivo. El equipo publicará las dudas más frecuentes con evidencia.";
                formularioCaja.reset();
            }
        });
    }
});
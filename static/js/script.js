// ==========================================
// CHILE RESPIRA - JavaScript con conceptos conocidos
// Basado en: HTML5, CSS3, JavaScript básico
// ==========================================

// ==========================================
// Variables y Datos Globales
// ==========================================
const html = document.documentElement;
const body = document.body;
const page = body.dataset.page;

// Objeto literal para almacenar textos de accesibilidad
const textosA11y = {
    contrast: {
        activo: "Modo alto contraste activado",
        inactivo: "Modo alto contraste desactivado"
    }
};

// Objeto literal para almacenar respuestas de triaje
const respuestasTriaje = {
    critico: '<p class="status-badge">Alerta</p><h3>Alerta crítica</h3><p>Acude de inmediato a SAPU, CESFAM u hospital más cercano.</p>',
    moderado: "<h3>Sintomático moderado</h3><p>Reposo, hidratación, aislamiento preventivo y llama a Salud Responde 600 360 7777.</p>",
    leve: "<h3>Control preventivo</h3><p>Mascarilla en público, lavado frecuente de manos y monitoreo de temperatura.</p>"
};

// Variables de estado
let modoContraste = false;

// ==========================================
// Funciones de Accesibilidad
// ==========================================
function alternarContraste() {
    modoContraste = !modoContraste;
    if (modoContraste) {
        html.classList.add("contrast");
    } else {
        html.classList.remove("contrast");
    }
    guardarPreferencias();
}

function guardarPreferencias() {
    const preferencias = {
        contrast: modoContraste,
        dyslexia: modoDyslexia,
        font: nivelFuente
    };
    localStorage.setItem("chile-respira-a11y", JSON.stringify(preferencias));
}

function cargarPreferencias() {
    const guardadas = localStorage.getItem("chile-respira-a11y");
    if (guardadas) {
        const preferencias = JSON.parse(guardadas);
        if (preferencias.contrast) {
            modoContraste = true;
            html.classList.add("contrast");
        }
        if (preferencias.dyslexia) {
            modoDyslexia = true;
            html.classList.add("dyslexia");
        }
        if (preferencias.font) {
            nivelFuente = preferencias.font;
            html.dataset.font = String(nivelFuente);
        }
    }
}

// ==========================================
// Funciones de Navegación
// ==========================================
function alternarMenu() {
    const nav = document.getElementById("nav-principal");
    const toggle = document.querySelector(".nav-toggle");
    if (nav && toggle) {
        const estaAbierto = nav.classList.contains("is-open");
        if (estaAbierto) {
            nav.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
        } else {
            nav.classList.add("is-open");
            toggle.setAttribute("aria-expanded", "true");
        }
    }
}

// ==========================================
// Funciones de Modal (Triaje)
// ==========================================
function abrirModalTriaje() {
    const modal = document.getElementById("modal-triaje");
    if (modal) {
        modal.hidden = false;
    }
}

function cerrarModalTriaje() {
    const modal = document.getElementById("modal-triaje");
    if (modal) {
        modal.hidden = true;
    }
}

function mostrarResultadoTriaje(valor) {
    const resultado = document.getElementById("triaje-resultado");
    if (resultado && respuestasTriaje[valor]) {
        resultado.innerHTML = respuestasTriaje[valor];
        resultado.hidden = false;
    }
}

// ==========================================
// Funciones de Calculadora de Aire (Página Inicio)
// ==========================================
function calcularVentilacion(evento) {
    evento.preventDefault();
    
    const largo = Number(document.getElementById("largo").value);
    const ancho = Number(document.getElementById("ancho").value);
    const alto = Number(document.getElementById("alto").value);
    const personas = Number(document.getElementById("personas").value);
    
    const volumen = largo * ancho * alto;
    const volumenPorPersona = volumen / personas;
    
    let minutos = 5;
    if (volumenPorPersona < 8) {
        minutos = 8;
    } else if (volumenPorPersona >= 12) {
        minutos = 3;
    }
    
    const resultado = document.getElementById("aire-resultado");
    const texto = document.getElementById("aire-texto");
    
    if (resultado && texto) {
        texto.textContent = "Volumen aproximado: " + 
            volumen.toFixed(1) + " m³ (" + 
            volumenPorPersona.toFixed(1) + " m³ por persona). " +
            "Microventilación cruzada: " + minutos + 
            " minutos cada hora, rendija de 5 cm en ventanas opuestas. " +
            "Si hay vaho o CO₂ > 700 ppm, ventila de inmediato.";
        resultado.hidden = false;
    }
}


    // ==========================================
    // Timeline Storytelling Cinemático
    // ==========================================
    function initCinematicTimeline() {
        const triggers = document.querySelectorAll('.timeline-trigger');
        const mediaLayers = document.querySelectorAll('.media-layer');

        if (triggers.length === 0 || mediaLayers.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const era = entry.target.dataset.era;

                    // Activar trigger visual
                    triggers.forEach((t) => t.classList.remove('active'));
                    entry.target.classList.add('active');

                    // Cambiar capa multimedia
                    mediaLayers.forEach((layer) => {
                        layer.classList.remove('active');
                        if (layer.id === 'media-' + era) {
                            layer.classList.add('active');
                            // Pausar videos que no están activos
                            const video = layer.querySelector('video');
                            if (video) video.play();
                        } else {
                            const video = layer.querySelector('video');
                            if (video) video.pause();
                        }
                    });
                }
            });
        }, { threshold: 0.5 });

        triggers.forEach((trigger) => observer.observe(trigger));
    }

    // ==========================================
    // Filtros Dinámicos de Categoría
    // ==========================================
    function initCategoryFilters() {
        const filterChips = document.querySelectorAll(".filter-bar .chip");
        const eraBlocks = document.querySelectorAll(".era-block");
        const timelineTriggers = document.querySelectorAll(".timeline-trigger");
        const eraLinks = document.querySelectorAll(".era-link");

        if (filterChips.length === 0) return;

        filterChips.forEach((chip) => {
            chip.addEventListener("click", () => {
                const category = chip.dataset.category;

                // Actualizar estado visual de los botones
                filterChips.forEach((c) => c.classList.remove("is-on"));
                chip.classList.add("is-on");

                // Función reutilizable para mostrar/ocultar elementos
                const toggleVisibility = (elements) => {
                    elements.forEach((el) => {
                        const itemCategories = el.dataset.category || el.dataset.topic || "";

                        if (category === "all" || itemCategories.includes(category)) {
                            el.classList.remove("hidden");
                            el.style.display = "";
                        } else {
                            el.classList.add("hidden");
                            el.style.display = "none";
                        }
                    });
                };

                // Filtrar la vista Cinemática
                toggleVisibility(timelineTriggers);

                // Filtrar la vista Web.dev
                toggleVisibility(eraBlocks);

                // Sincronizar el menú lateral
                eraLinks.forEach((link) => {
                    const targetId = link.getAttribute("href").substring(1);
                    const targetBlock = document.getElementById(targetId);
                    if (targetBlock) {
                        const blockCategories = targetBlock.dataset.category || "";
                        if (category === "all" || blockCategories.includes(category)) {
                            link.style.display = "";
                        } else {
                            link.style.display = "none";
                        }
                    }
                });
            });
        });
    }

    // ==========================================
    // Sidebar web.dev con ScrollSync
    // ==========================================
    function initWebdevSidebar() {
        const eraLinks = document.querySelectorAll(".era-link");
        const eraBlocks = document.querySelectorAll(".era-block");

        eraLinks.forEach((link) => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const targetId = link.getAttribute("href").substring(1);
                const targetBlock = document.getElementById(targetId);
                if (targetBlock) {
                    targetBlock.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });
        });

        // Sincronizar activación al scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const eraId = entry.target.id;
                    eraLinks.forEach((link) => {
                        link.classList.remove("active");
                        if (link.getAttribute("href") === "#" + eraId) {
                            link.classList.add("active");
                        }
                    });
                }
            });
        }, { threshold: 0.3 });

        eraBlocks.forEach((block) => observer.observe(block));
    }

// ==========================================
// Funciones de Mapa Interactivo
// ==========================================
function mostrarTooltipMapa(evento, elemento) {
    const tooltip = document.getElementById('nyt-live-tooltip');
    if (!tooltip) return;
    
    const nombre = elemento.dataset.name;
    const positividad = elemento.dataset.positivity;
    const cobertura = elemento.dataset.cobertura;
    
    tooltip.classList.remove('hidden');
    tooltip.style.left = (evento.offsetX + 15) + 'px';
    tooltip.style.top = (evento.offsetY + 15) + 'px';
    
    tooltip.innerHTML = `
        <div style="font-size: 10px; color: var(--tech-cyan); font-weight: bold; letter-spacing: 1px;">📡 BOLETÍN EPIDEMIOLÓGICO DEIS</div>
        <div style="font-size: 14px; font-weight: bold; color: var(--text-title); margin: 4px 0 8px;">${nombre}</div>
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
}

function ocultarTooltipMapa() {
    const tooltip = document.getElementById('nyt-live-tooltip');
    if (tooltip) {
        tooltip.classList.add('hidden');
    }
}

// ==========================================
// Funciones de Calculadora Presupuestaria
// ==========================================
function calcularPresupuesto(evento) {
    evento.preventDefault();
    
    const salas = Number(document.getElementById("salas").value);
    const perfil = document.getElementById("perfil").value;
    const resultado = document.getElementById("presupuesto-resultado");
    
    if (!resultado) return;
    
    resultado.hidden = false;
    
    if (perfil === "rural") {
        resultado.innerHTML = "<h3>Kit rural para " + salas + 
            " recintos</h3><p>Cloro: ~" + salas + 
            " L/semana (10 mL/L, renovar cada 24 h). Deflectores de cartón: " + 
            (salas * 2) + ". Costo referencial $0–$" + 
            (salas * 500).toLocaleString("es-CL") + " CLP.</p>";
    } else {
        resultado.innerHTML = "<h3>Kit institucional para " + salas + 
            " recintos</h3><p>1 sensor CO₂ y 1–2 deflectores por sala. Dispensadores: " + 
            Math.ceil(salas / 2) + ". Inversión $" + 
            (salas * 40000).toLocaleString("es-CL") + " – $" + 
            (salas * 120000).toLocaleString("es-CL") + 
            " CLP. Reducción estimada de carga viral hasta 85% con umbral 700 ppm.</p>";
    }
}

// ==========================================
// Funciones de Trivia Mitos vs Realidades
// ==========================================
const preguntasTrivia = [
    {
        pregunta: "La vacuna contra la Influenza me enferma o me produce una gripe fuerte.",
        respuesta: false,
        explicacion: "Las vacunas del PNI usan virus inactivados o fracciones proteicas que no se replican. Dolor local o febrícula es respuesta inmune, no la enfermedad.",
        fuente: "SOCHINF / MINSAL",
        accion: "Vacúnate cada año; la protección plena llega a las 2 semanas.",
        compartir: "¿Sabías que la vacuna no te enferma? Son virus inactivados. Mira la explicación en Chile Respira."
    },
    {
        pregunta: "Si tengo fiebre y dolor de cuerpo por Influenza, debo tomar antibióticos.",
        respuesta: false,
        explicacion: "La Influenza es viral. Los antibióticos no actúan sobre virus y generan resistencia bacteriana. Solo un médico indica antivirales en alto riesgo.",
        fuente: "OPS/OMS / ISP",
        accion: "Reposo, hidratación y analgésicos bajo indicación médica.",
        compartir: "Los antibióticos no curan la Influenza. Es un virus, no una bacteria."
    },
    {
        pregunta: "Si soy una persona joven y sana, no necesito vacunarme.",
        respuesta: false,
        explicacion: "Las personas jóvenes son vectores hacia lactantes, mayores y crónicos. En sanos puede haber neumonía y ausentismo laboral de más de 7 días.",
        fuente: "CDC / DEIS Chile",
        accion: "Si convives con grupos de riesgo, tu dosis protege a la comunidad.",
        compartir: "Aunque seas joven y sano, la vacuna reduce la transmisión comunitaria."
    },
    {
        pregunta: "El aire helado de la ventana es lo que produce el virus de la Influenza.",
        respuesta: false,
        explicacion: "El frío no genera patógenos. El contagio ocurre en espacios cerrados donde los aerosoles flotan horas. La ventilación cruzada puede reducir el contagio hasta un 80%.",
        fuente: "MINVU / OMS",
        accion: "Ventila a diario: el enemigo es el aire viciado, no el fresco.",
        compartir: "El frío no causa Influenza. Cerrar todo concentra el virus en aerosoles."
    },
    {
        pregunta: "La vacuna que me puse el año pasado me sirve para este invierno.",
        respuesta: false,
        explicacion: "El virus muta (variación antigénica). La OMS actualiza la fórmula cada año y los anticuerpos bajan a los 6–8 meses.",
        fuente: "ISP / WHO",
        accion: "Asiste cada año a un punto oficial de vacunación.",
        compartir: "La vacuna de Influenza se actualiza cada año porque el virus muta."
    }
];

let indicePregunta = 0;
let puntajeTrivia = 0;

function renderizarPreguntaTrivia() {
    const tarjeta = document.getElementById("quiz-card");
    const textoPregunta = document.getElementById("mito-afirmacion");
    const barraProgreso = document.getElementById("quiz-barra");
    const textoProgreso = document.getElementById("quiz-progreso");
    
    if (!tarjeta || !textoPregunta || !barraProgreso || !textoProgreso) return;
    
    tarjeta.classList.remove("is-flipped");
    textoPregunta.textContent = preguntasTrivia[indicePregunta].pregunta;
    textoProgreso.textContent = "Tarjeta " + (indicePregunta + 1) + " de " + preguntasTrivia.length;
    barraProgreso.style.width = ((indicePregunta / preguntasTrivia.length) * 100 || 20) + "%";
}

function revelarRespuestaTrivia(usuarioDijoVerdadero) {
    const esCorrecto = usuarioDijoVerdadero === preguntasTrivia[indicePregunta].respuesta;
    
    if (esCorrecto) {
        puntajeTrivia = puntajeTrivia + 1;
    }
    
    const veredicto = document.getElementById("mito-veredicto");
    const explicacion = document.getElementById("mito-explicacion");
    const fuente = document.getElementById("mito-fuente");
    const accion = document.getElementById("mito-accion");
    const compartir = document.getElementById("share-wa");
    const tarjeta = document.getElementById("quiz-card");
    
    if (veredicto) {
        veredicto.textContent = esCorrecto ? "Correcto · FALSO" : "Incorrecto · FALSO";
    }
    if (explicacion) {
        explicacion.textContent = preguntasTrivia[indicePregunta].explicacion;
    }
    if (fuente) {
        fuente.textContent = "Fuente: " + preguntasTrivia[indicePregunta].fuente;
    }
    if (accion) {
        accion.textContent = "Acción clave: " + preguntasTrivia[indicePregunta].accion;
    }
    if (compartir) {
        compartir.href = "https://wa.me/?text=" + encodeURIComponent(preguntasTrivia[indicePregunta].compartir + " " + window.location.href);
    }
    if (tarjeta) {
        tarjeta.classList.add("is-flipped");
    }
}

function siguientePreguntaTrivia() {
    indicePregunta = indicePregunta + 1;
    
    if (indicePregunta >= preguntasTrivia.length) {
        finalizarTrivia();
        return;
    }
    
    renderizarPreguntaTrivia();
}

function finalizarTrivia() {
    const tarjeta = document.getElementById("quiz-card");
    const cierre = document.getElementById("quiz-cierre");
    const barraProgreso = document.getElementById("quiz-barra");
    const textoPuntaje = document.getElementById("quiz-score");
    
    if (tarjeta) tarjeta.hidden = true;
    if (cierre) cierre.hidden = false;
    if (barraProgreso) barraProgreso.style.width = "100%";
    
    if (textoPuntaje) {
        let mensaje = "Acertaste " + puntajeTrivia + " de " + preguntasTrivia.length + ". ";
        if (puntajeTrivia === 5) {
            mensaje = mensaje + "Insignia Embajador de Aire Limpio desbloqueada.";
        } else {
            mensaje = mensaje + "Revisa las explicaciones y vuelve a intentar cuando quieras.";
        }
        textoPuntaje.textContent = mensaje;
    }
}

function generarCertificado() {
    const canvas = document.getElementById("certificado");
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    canvas.hidden = false;
    
    ctx.fillStyle = "#0B0F19";
    ctx.fillRect(0, 0, 900, 520);
    
    ctx.strokeStyle = "#38BDF8";
    ctx.strokeRect(24, 24, 852, 472);
    
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 32px Inter, sans-serif";
    ctx.fillText("Embajador de Aire Limpio", 80, 180);
    
    ctx.font = "20px Inter, sans-serif";
    ctx.fillStyle = "#E2E8F0";
    ctx.fillText("Chile Respira · Trivia Mitos vs Realidades", 80, 230);
    ctx.fillText("Puntaje: " + puntajeTrivia + " / 5 · " + new Date().toLocaleDateString("es-CL"), 80, 280);
    
    const enlace = document.getElementById("descargar-cert");
    if (enlace) {
        enlace.hidden = false;
        enlace.href = canvas.toDataURL("image/png");
    }
}

// ==========================================
// Funciones de Formulario de Mitos
// ==========================================
function enviarFormularioMitos(evento) {
    evento.preventDefault();
    
    const rumor = document.getElementById("rumor");
    const mensaje = document.getElementById("form-mitos-msg");
    
    if (!rumor || !mensaje) return;
    
    if (rumor.value.trim().length < 12) {
        mensaje.textContent = "Describe el mito con al menos 12 caracteres.";
        rumor.focus();
        return;
    }
    
    mensaje.textContent = "Solicitud registrada en este dispositivo. El equipo publicará las dudas más frecuentes con evidencia.";
    document.getElementById("form-mitos").reset();
}

// ==========================================
// Inicialización
// ==========================================
function inicializarSitio() {
    // Cargar preferencias guardadas
    cargarPreferencias();
    
    // Configurar eventos de accesibilidad
    const botonesA11y = document.querySelectorAll("[data-a11y]");
    botonesA11y.forEach(function(boton) {
        boton.addEventListener("click", function() {
            const accion = boton.dataset.a11y;
            if (accion === "contrast") alternarContraste();
            if (accion === "dyslexia") alternarDyslexia();
            if (accion === "font-up") aumentarFuente();
            if (accion === "font-down") disminuirFuente();
        });
    });
    
    // Configurar toggle de navegación
    const navToggle = document.querySelector(".nav-toggle");
    if (navToggle) {
        navToggle.addEventListener("click", alternarMenu);
    }
    
    // Configurar modal de triaje
    const botonesAbrirTriaje = document.querySelectorAll("[data-open-triaje]");
    botonesAbrirTriaje.forEach(function(boton) {
        boton.addEventListener("click", abrirModalTriaje);
    });
    
    const botonesCerrarTriaje = document.querySelectorAll("[data-close-modal]");
    botonesCerrarTriaje.forEach(function(boton) {
        boton.addEventListener("click", cerrarModalTriaje);
    });
    
    const opcionesTriaje = document.querySelectorAll("input[name='triaje']");
    opcionesTriaje.forEach(function(opcion) {
        opcion.addEventListener("change", function() {
            mostrarResultadoTriaje(opcion.value);
        });
    });
    
    // Cerrar modal con Escape
    document.addEventListener("keydown", function(evento) {
        if (evento.key === "Escape") {
            cerrarModalTriaje();
        }
    });
    
    // Inicializar componentes específicos por página
    if (page === "inicio") {
        const formAire = document.getElementById("form-aire");
        if (formAire) {
            formAire.addEventListener("submit", calcularVentilacion);
        }
    }
    
    if (page === "linea") {
        // Configurar filtros de categoría
        const chipsFiltro = document.querySelectorAll(".filter-bar .chip");
        chipsFiltro.forEach(function(chip) {
            chip.addEventListener("click", function() {
                filtrarPorCategoria(chip.dataset.category);
            });
        });
        
        // Configurar enlaces de era
        const enlacesEra = document.querySelectorAll(".era-link");
        enlacesEra.forEach(function(enlace) {
            enlace.addEventListener("click", function(evento) {
                evento.preventDefault();
                const targetId = enlace.getAttribute("href").substring(1);
                navegarAEra(targetId);
            });
        });
        
        // Configurar cuestionario
        const opcionesQuiz = document.querySelectorAll(".quiz-option");
        opcionesQuiz.forEach(function(opcion) {
            opcion.addEventListener("click", function() {
                verificarRespuestaQuiz(opcion);
            });
        });
    }
    
    if (page === "guia") {
        // Configurar mapa interactivo
        const regionesMapa = document.querySelectorAll('.map-region-vector');
        regionesMapa.forEach(function(region) {
            region.addEventListener('mousemove', function(evento) {
                mostrarTooltipMapa(evento, region);
            });
            region.addEventListener('mouseleave', ocultarTooltipMapa);
        });
        
        // Configurar calculadora presupuestaria
        const formPresupuesto = document.getElementById("form-presupuesto");
        if (formPresupuesto) {
            formPresupuesto.addEventListener("submit", calcularPresupuesto);
        }
    }
    
    if (page === "mitos") {
        // Configurar trivia
        const botonesRespuesta = document.querySelectorAll("[data-answer]");
        botonesRespuesta.forEach(function(boton) {
            boton.addEventListener("click", function() {
                const usuarioDijoVerdadero = boton.dataset.answer === "true";
                revelarRespuestaTrivia(usuarioDijoVerdadero);
            });
        });
        
        const botonSiguiente = document.getElementById("quiz-siguiente");
        if (botonSiguiente) {
            botonSiguiente.addEventListener("click", siguientePreguntaTrivia);
        }
        
        const botonCertificado = document.getElementById("btn-certificado");
        if (botonCertificado) {
            botonCertificado.addEventListener("click", generarCertificado);
        }
        
        // Configurar formulario de mitos
        const formMitos = document.getElementById("form-mitos");
        if (formMitos) {
            formMitos.addEventListener("submit", enviarFormularioMitos);
        }
        
        // Renderizar primera pregunta
        renderizarPreguntaTrivia();
    }
}

// Ejecutar inicialización cuando el DOM esté listo
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarSitio);
} else {
    inicializarSitio();
}
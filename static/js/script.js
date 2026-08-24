(function () {
    const page = document.body.dataset.page;
    const html = document.documentElement;
    initA11y();
    initNav();
    initTriage();
    if (page === "inicio") initAirCalc();
    if (page === "linea") {
        initTimelineFilters(); // Filtros existentes
        initScrollytelling(); // INJERTO: Scrollytelling
    }
    if (page === "guia") {
        initMap(); // INJERTO: Mapa interactivo NYTimes
        initBudget();
    }
    if (page === "mitos") {
        initQuiz();
        initMythForm();
    }
    
    function initA11y() {
        const stored = JSON.parse(localStorage.getItem("chile-respira-a11y") || "{}");
        if (stored.contrast) html.classList.add("contrast");
        if (stored.dyslexia) html.classList.add("dyslexia");
        if (stored.font) html.dataset.font = stored.font;
        document.querySelectorAll("[data-a11y]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const action = btn.dataset.a11y;
                if (action === "contrast") html.classList.toggle("contrast");
                if (action === "dyslexia") {
                    html.classList.toggle("dyslexia");
                    btn.setAttribute("aria-pressed", String(html.classList.contains("dyslexia")));
                }
                if (action === "font-up") {
                    html.dataset.font = String(Math.min(3, Number(html.dataset.font || 0) + 1));
                }
                if (action === "font-down") {
                    const n = Math.max(0, Number(html.dataset.font || 0) - 1);
                    html.dataset.font = n ? String(n) : "";
                }
                if (action === "speech") toggleSpeech(btn);
                localStorage.setItem(
                    "chile-respira-a11y",
                    JSON.stringify({
                        contrast: html.classList.contains("contrast"),
                        dyslexia: html.classList.contains("dyslexia"),
                        font: html.dataset.font || ""
                    })
                );
            });
        });
    }
    
    function toggleSpeech(btn) {
        if (!window.speechSynthesis) return;
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
            btn.setAttribute("aria-pressed", "false");
            return;
        }
        const utter = new SpeechSynthesisUtterance(document.querySelector("main").innerText.slice(0, 4000));
        utter.lang = "es-CL";
        speechSynthesis.speak(utter);
        btn.setAttribute("aria-pressed", "true");
    }
    
    function initNav() {
        const toggle = document.querySelector(".nav-toggle");
        const nav = document.getElementById("nav-principal");
        if (!toggle || !nav) return;
        toggle.addEventListener("click", () => {
            const open = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", String(open));
        });
    }
    
    function initTriage() {
        const modal = document.getElementById("modal-triaje");
        if (!modal) return;
        const result = document.getElementById("triaje-resultado");
        const copy = {
            critico:
                '<p class="status-badge">Alerta</p><h3>Alerta crítica</h3><p>Acude de inmediato a SAPU, CESFAM u hospital más cercano.</p>',
            moderado:
                "<h3>Sintomático moderado</h3><p>Reposo, hidratación, aislamiento preventivo y llama a Salud Responde 600 360 7777.</p>",
            leve:
                "<h3>Control preventivo</h3><p>Mascarilla en público, lavado frecuente de manos y monitoreo de temperatura.</p>"
        };
        document.querySelectorAll("[data-open-triaje]").forEach((b) =>
            b.addEventListener("click", () => {
                modal.hidden = false;
            })
        );
        modal.querySelectorAll("[data-close-modal]").forEach((b) =>
            b.addEventListener("click", () => {
                modal.hidden = true;
            })
        );
        modal.querySelectorAll("input[name='triaje']").forEach((input) => {
            input.addEventListener("change", () => {
                result.hidden = false;
                result.innerHTML = copy[input.value];
            });
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") modal.hidden = true;
        });
    }
    
    function initAirCalc() {
        const form = document.getElementById("form-aire");
        const box = document.getElementById("aire-resultado");
        const text = document.getElementById("aire-texto");
        if (!form) return;
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const volume = Number(form.largo.value) * Number(form.ancho.value) * Number(form.alto.value);
            const perPerson = volume / Number(form.personas.value);
            let minutes = 5;
            if (perPerson < 8) minutes = 8;
            else if (perPerson >= 12) minutes = 3;
            box.hidden = false;
            text.textContent =
                "Volumen aproximado: " +
                volume.toFixed(1) +
                " m³ (" +
                perPerson.toFixed(1) +
                " m³ por persona). Microventilación cruzada: " +
                minutes +
                " minutos cada hora, rendija de 5 cm en ventanas opuestas. Si hay vaho o CO₂ > 700 ppm, ventila de inmediato.";
        });
    }
    
    function initTimelineFilters() {
        const items = [...document.querySelectorAll(".timeline-item")];
        const chips = document.querySelectorAll("[data-filter]");
        items.forEach((item) => {
            const activate = () => {
                items.forEach((el) => el.classList.remove("is-active"));
                item.classList.add("is-active");
            };
            item.addEventListener("click", activate);
            item.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    activate();
                }
            });
        });
        chips.forEach((chip) => {
            chip.addEventListener("click", () => {
                chips.forEach((c) => c.classList.remove("is-on"));
                chip.classList.add("is-on");
                const f = chip.dataset.filter;
                document.querySelectorAll("[data-topic]").forEach((p) => {
                    p.hidden = f !== "all" && p.dataset.topic !== f;
                });
            });
        });
    }
    
    // ==========================================
    // INJERTO: SCROLLYTELLING CINEMÁTICO (ArtVersion)
    // ==========================================
    function initScrollytelling() {
        const eras = document.querySelectorAll('.timeline-trigger');
        const mediaLayers = document.querySelectorAll('.media-layer');

        if (eras.length > 0 && mediaLayers.length > 0) {
            const scrollerObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const currentEra = entry.target.dataset.era;
                        
                        // Sincronizar clases de texto explicativo firme
                        eras.forEach(e => e.classList.remove('active-era-text'));
                        entry.target.classList.add('active-era-text');

                        // Transición cruzada con desenfoque de movimiento en panel multimedia
                        mediaLayers.forEach(layer => {
                            layer.classList.remove('active');
                            const video = layer.querySelector('video');
                            if (video) {
                                video.pause(); // Control estricto de hilos de video en segundo plano
                                video.currentTime = 0;
                            }
                        });

                        const targetMedia = document.getElementById(`media-${currentEra}`);
                        if (targetMedia) {
                            targetMedia.classList.add('active');
                            const activeVideo = targetMedia.querySelector('video');
                            if (activeVideo) {
                                // Autoejecución asíncrona segura (Muted)
                                activeVideo.play().catch(error => console.log("Autoplay mitigado por navegador"));
                            }
                        }
                    }
                });
            }, {
                root: null,
                threshold: 0.6 // Dispara la animación cuando el elemento ocupa el 60% de visualización
            });

            eras.forEach(era => scrollerObserver.observe(era));
        }
    }
    
    // ==========================================
    // INJERTO: CARTOGRAFÍA SENSIBLE AL PUNTERO (Mapa - NYTimes)
    // ==========================================
    function initMap() {
        const regions = document.querySelectorAll('.map-region-vector');
        const nytTooltip = document.getElementById('nyt-live-tooltip');

        if (regions.length > 0 && nytTooltip) {
            regions.forEach(vector => {
                vector.addEventListener('mousemove', (e) => {
                    const name = vector.dataset.name;
                    const positivity = vector.dataset.positivity;
                    const cobertura = vector.dataset.cobertura;

                    // Modificar el filete neón instantáneo al pasar el cursor
                    vector.style.fill = 'var(--bg-surface-elevated)';
                    vector.style.stroke = 'var(--creative-violet)';
                    vector.style.filter = 'drop-shadow(0 0 6px var(--creative-violet))';

                    // Proyectar y calcular la persecución del Tooltip dinámico en ejes X/Y
                    nytTooltip.classList.remove('hidden');
                    nytTooltip.style.left = `${e.offsetX + 15}px`;
                    nytTooltip.style.top = `${e.offsetY + 15}px`;

                    nytTooltip.innerHTML = `
                        <div style="font-size: 10px; color: var(--tech-cyan); font-weight: bold; letter-spacing: 1px;">📡 BOLETÍN EPIDEMIOLÓGICO DEIS</div>
                        <div style="font-size: 14px; font-weight: bold; color: var(--text-title); margin: 4px 0 8px;">${name}</div>
                        <div style="display: flex; gap: 15px; border-top: 1px solid var(--tech-muted); padding-top: 6px;">
                            <div>
                                <span style="font-size: 10px; color: var(--text-muted); display: block;">POSITIVIDAD ISP</span>
                                <span style="font-size: 13px; font-weight: bold; color: var(--creative-coral);">${positivity}%</span>
                            </div>
                            <div>
                                <span style="font-size: 10px; color: var(--text-muted); display: block;">COBERTURA PNI</span>
                                <span style="font-size: 13px; font-weight: bold; color: var(--tech-cyan);">${cobertura}%</span>
                            </div>
                        </div>
                    `;
                });

                vector.addEventListener('mouseleave', () => {
                    // Restablecer al estado corporativo sobrio de reposo
                    vector.style.fill = 'var(--bg-surface)';
                    vector.style.stroke = 'var(--tech-muted)';
                    vector.style.filter = 'none';
                    nytTooltip.classList.add('hidden');
                });
            });
        }
    }
    
    function initBudget() {
        const form = document.getElementById("form-presupuesto");
        const out = document.getElementById("presupuesto-resultado");
        if (!form) return;
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const n = Number(document.getElementById("salas").value);
            const perfil = document.getElementById("perfil").value;
            out.hidden = false;
            if (perfil === "rural") {
                out.innerHTML =
                    "<h3>Kit rural para " +
                    n +
                    " recintos</h3><p>Cloro: ~" +
                    n +
                    " L/semana (10 mL/L, renovar cada 24 h). Deflectores de cartón: " +
                    n * 2 +
                    ". Costo referencial $0–$" +
                    (n * 500).toLocaleString("es-CL") +
                    " CLP.</p>";
            } else {
                out.innerHTML =
                    "<h3>Kit institucional para " +
                    n +
                    " recintos</h3><p>1 sensor CO₂ y 1–2 deflectores por sala. Dispensadores: " +
                    Math.ceil(n / 2) +
                    ". Inversión $" +
                    (n * 40000).toLocaleString("es-CL") +
                    " – $" +
                    (n * 120000).toLocaleString("es-CL") +
                    " CLP. Reducción estimada de carga viral hasta 85% con umbral 700 ppm.</p>";
            }
        });
    }
    
    function initQuiz() {
        const cards = [
            {
                q: "La vacuna contra la Influenza me enferma o me produce una gripe fuerte.",
                answer: false,
                explain:
                    "Las vacunas del PNI usan virus inactivados o fracciones proteicas que no se replican. Dolor local o febrícula es respuesta inmune, no la enfermedad.",
                source: "SOCHINF / MINSAL",
                action: "Vacúnate cada año; la protección plena llega a las 2 semanas.",
                share: "¿Sabías que la vacuna no te enferma? Son virus inactivados. Mira la explicación en Chile Respira."
            },
            {
                q: "Si tengo fiebre y dolor de cuerpo por Influenza, debo tomar antibióticos.",
                answer: false,
                explain:
                    "La Influenza es viral. Los antibióticos no actúan sobre virus y generan resistencia bacteriana. Solo un médico indica antivirales en alto riesgo.",
                source: "OPS/OMS / ISP",
                action: "Reposo, hidratación y analgésicos bajo indicación médica.",
                share: "Los antibióticos no curan la Influenza. Es un virus, no una bacteria."
            },
            {
                q: "Si soy una persona joven y sana, no necesito vacunarme.",
                answer: false,
                explain:
                    "Las personas jóvenes son vectores hacia lactantes, mayores y crónicos. En sanos puede haber neumonía y ausentismo laboral de más de 7 días.",
                source: "CDC / DEIS Chile",
                action: "Si convives con grupos de riesgo, tu dosis protege a la comunidad.",
                share: "Aunque seas joven y sano, la vacuna reduce la transmisión comunitaria."
            },
            {
                q: "El aire helado de la ventana es lo que produce el virus de la Influenza.",
                answer: false,
                explain:
                    "El frío no genera patógenos. El contagio ocurre en espacios cerrados donde los aerosoles flotan horas. La ventilación cruzada puede reducir el contagio hasta un 80%.",
                source: "MINVU / OMS",
                action: "Ventila a diario: el enemigo es el aire viciado, no el fresco.",
                share: "El frío no causa Influenza. Cerrar todo concentra el virus en aerosoles."
            },
            {
                q: "La vacuna que me puse el año pasado me sirve para este invierno.",
                answer: false,
                explain:
                    "El virus muta (variación antigénica). La OMS actualiza la fórmula cada año y los anticuerpos bajan a los 6–8 meses.",
                source: "ISP / WHO",
                action: "Asiste cada año a un punto oficial de vacunación.",
                share: "La vacuna de Influenza se actualiza cada año porque el virus muta."
            }
        ];
        let i = 0;
        let score = 0;
        const cardEl = document.getElementById("quiz-card");
        const qEl = document.getElementById("mito-afirmacion");
        const vEl = document.getElementById("mito-veredicto");
        const eEl = document.getElementById("mito-explicacion");
        const sEl = document.getElementById("mito-fuente");
        const aEl = document.getElementById("mito-accion");
        const bar = document.getElementById("quiz-barra");
        const prog = document.getElementById("quiz-progreso");
        const next = document.getElementById("quiz-siguiente");
        const share = document.getElementById("share-wa");
        const cierre = document.getElementById("quiz-cierre");
        const scoreEl = document.getElementById("quiz-score");
        
        function render() {
            cardEl.classList.remove("is-flipped");
            qEl.textContent = cards[i].q;
            prog.textContent = "Tarjeta " + (i + 1) + " de " + cards.length;
            bar.style.width = ((i / cards.length) * 100 || 20) + "%";
        }
        
        function reveal(userTrue) {
            const ok = userTrue === cards[i].answer;
            if (ok) score += 1;
            vEl.textContent = ok ? "Correcto · FALSO" : "Incorrecto · FALSO";
            eEl.textContent = cards[i].explain;
            sEl.textContent = "Fuente: " + cards[i].source;
            aEl.textContent = "Acción clave: " + cards[i].action;
            share.href =
                "https://wa.me/?text=" + encodeURIComponent(cards[i].share + " " + location.href);
            cardEl.classList.add("is-flipped");
        }
        
        document.querySelectorAll("[data-answer]").forEach((btn) => {
            btn.addEventListener("click", () => reveal(btn.dataset.answer === "true"));
        });
        
        next.addEventListener("click", () => {
            i += 1;
            if (i >= cards.length) {
                cardEl.hidden = true;
                cierre.hidden = false;
                bar.style.width = "100%";
                scoreEl.textContent =
                    "Acertaste " +
                    score +
                    " de " +
                    cards.length +
                    ". " +
                    (score === 5
                        ? "Insignia Embajador de Aire Limpio desbloqueada."
                        : "Revisa las explicaciones y vuelve a intentar cuando quieras.");
                return;
            }
            render();
        });
        
        document.getElementById("btn-certificado").addEventListener("click", () => {
            const canvas = document.getElementById("certificado");
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
            ctx.fillText("Puntaje: " + score + " / 5 · " + new Date().toLocaleDateString("es-CL"), 80, 280);
            const link = document.getElementById("descargar-cert");
            link.hidden = false;
            link.href = canvas.toDataURL("image/png");
        });
        
        render();
    }
    
    function initMythForm() {
        const form = document.getElementById("form-mitos");
        if (!form) return;
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const rumor = document.getElementById("rumor");
            const msg = document.getElementById("form-mitos-msg");
            if (rumor.value.trim().length < 12) {
                msg.textContent = "Describe el mito con al menos 12 caracteres.";
                rumor.focus();
                return;
            }
            msg.textContent = "Solicitud registrada en este dispositivo. El equipo publicará las dudas más frecuentes con evidencia.";
            form.reset();
        });
    }
})();

if (page === "linea") {
    initCategoryFilters(); // INJERTO: Filtros dinámicos con data-category
    initScrollytelling(); // INJERTO: Scrollytelling
    initWebdevSidebar(); // INJERTO: Sidebar web.dev
    initQuiz(); // INJERTO: Cuestionario web.dev
}

if (page === "guia") {
    initMapNYTimes(); // INJERTO: Mapa interactivo NYTimes (hover)
    initMapHubs(); // INJERTO: Puntos interactivos (clic)
    initBudget();
}

// ==========================================
// INJERTO: Filtros Dinámicos de Categoría
// ==========================================
function initCategoryFilters() {
    const chips = document.querySelectorAll("[data-category]");
    const timelineTriggers = document.querySelectorAll(".timeline-trigger");

    chips.forEach((chip) => {
        chip.addEventListener("click", () => {
            const category = chip.dataset.category;

            // Actualizar estado visual de chips
            chips.forEach((c) => c.classList.remove("is-on"));
            chip.classList.add("is-on");

            // Filtrar timeline triggers con transición suave
            timelineTriggers.forEach((trigger) => {
                if (category === "all") {
                    trigger.classList.remove("hidden");
                } else {
                    const triggerCategories = trigger.dataset.category;
                    if (triggerCategories && triggerCategories.includes(category)) {
                        trigger.classList.remove("hidden");
                    } else {
                        trigger.classList.add("hidden");
                    }
                }
            });
        });
    });
}

// ==========================================
// INJERTO: Sidebar web.dev con ScrollSync
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
// INJERTO: Cuestionario web.dev
// ==========================================
function initQuiz() {
    const options = document.querySelectorAll(".quiz-option");
    const feedback = document.getElementById("quiz-feedback");

    options.forEach((option) => {
        option.addEventListener("click", () => {
            const isCorrect = option.dataset.correct === "true";

            // Limpiar clases previas
            options.forEach((opt) => {
                opt.classList.remove("correct", "incorrect");
            });

            // Aplicar resultado
            option.classList.add(isCorrect ? "correct" : "incorrect");

            // Mostrar feedback
            feedback.classList.remove("hidden");
            feedback.classList.remove("success", "error");
            feedback.classList.add(isCorrect ? "success" : "error");
            feedback.textContent = isCorrect ? "¡Correcto! El Plan de Invierno se enfocó en mitigar la mortalidad infantil por neumonías e Influenza A." : "Vuelve a intentarlo. El Plan de Invierno no se centró en emisiones industriales ni vacunación masiva en esa época.";
        });
    });
}

// ==========================================
// INJERTO: CARTOGRAFÍA SENSIBLE AL PUNTERO (Mapa - NYTimes)
// ==========================================
function initMapNYTimes() {
    const regions = document.querySelectorAll('.map-region-vector');
    const nytTooltip = document.getElementById('nyt-live-tooltip');

    if (regions.length > 0 && nytTooltip) {
        regions.forEach(vector => {
            vector.addEventListener('mousemove', (e) => {
                const name = vector.dataset.name;
                const positivity = vector.dataset.positivity;
                const cobertura = vector.dataset.cobertura;

                // Modificar el filete neón instantáneo al pasar el cursor
                vector.style.fill = 'var(--bg-surface-elevated)';
                vector.style.stroke = 'var(--creative-violet)';
                vector.style.filter = 'drop-shadow(0 0 6px var(--creative-violet))';

                // Proyectar y calcular la persecución del Tooltip dinámico en ejes X/Y
                nytTooltip.classList.remove('hidden');
                nytTooltip.style.left = `${e.offsetX + 15}px`;
                nytTooltip.style.top = `${e.offsetY + 15}px`;

                nytTooltip.innerHTML = `
                    <div style="font-size: 10px; color: var(--tech-cyan); font-weight: bold; letter-spacing: 1px;">📡 BOLETÍN EPIDEMIOLÓGICO DEIS</div>
                    <div style="font-size: 14px; font-weight: bold; color: var(--text-title); margin: 4px 0 8px;">${name}</div>
                    <div style="display: flex; gap: 15px; border-top: 1px solid var(--tech-muted); padding-top: 6px;">
                        <div>
                            <span style="font-size: 10px; color: var(--text-muted); display: block;">POSITIVIDAD ISP</span>
                            <span style="font-size: 13px; font-weight: bold; color: var(--creative-coral);">${positivity}%</span>
                        </div>
                        <div>
                            <span style="font-size: 10px; color: var(--text-muted); display: block;">COBERTURA PNI</span>
                            <span style="font-size: 13px; font-weight: bold; color: var(--tech-cyan);">${cobertura}%</span>
                        </div>
                    </div>
                `;
            });

            vector.addEventListener('mouseleave', () => {
                // Restablecer al estado corporativo sobrio de reposo
                vector.style.fill = 'var(--bg-surface)';
                vector.style.stroke = 'var(--tech-muted)';
                vector.style.filter = 'none';
                nytTooltip.classList.add('hidden');
            });
        });
    }
}

// ==========================================
// INJERTO: Puntos Interactivos del Mapa (clic)
// ==========================================
function initMapHubs() {
    const hubs = [
        { x: 132, y: 48, level: "low", name: "Arica", type: "Operativo móvil", hours: "Ferias locales · horario variable", heat: "Bajo" },
        { x: 140, y: 118, level: "mid", name: "Antofagasta", type: "CESFAM urbano", hours: "Lun–Vie 08:00–17:00", heat: "Medio" },
        { x: 122, y: 188, level: "mid", name: "La Serena", type: "CESFAM + feria", hours: "Lun–Sáb 08:00–14:00", heat: "Medio" },
        { x: 118, y: 248, level: "high", name: "Valparaíso", type: "Hub regional", hours: "Red SAPU 24 h", heat: "Máximo" },
        { x: 130, y: 268, level: "high", name: "Santiago", type: "Hub metropolitano", hours: "Vacunatorios DEIS / PNI", heat: "Máximo" },
        { x: 128, y: 318, level: "mid", name: "Talca", type: "CESFAM", hours: "Lun–Vie 08:00–17:00", heat: "Medio" },
        { x: 124, y: 368, level: "high", name: "Concepción", type: "Hub sur-centro", hours: "Hospital + CESFAM", heat: "Máximo" },
        { x: 120, y: 418, level: "mid", name: "Temuco", type: "CESFAM + operativo rural", hours: "Móvil en ferias de fin de semana", heat: "Medio" },
        { x: 118, y: 478, level: "low", name: "Puerto Montt", type: "Operativo costero", hours: "Consultorio y ronda isleña", heat: "Bajo" },
        { x: 122, y: 575, level: "low", name: "Punta Arenas", type: "Punto austral", hours: "CESFAM Magallanes", heat: "Bajo" }
    ];
    const g = document.getElementById("map-hubs");
    const panel = document.getElementById("map-detalle");
    if (!g) return;
    const flow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    flow.setAttribute("class", "map-flow");
    flow.setAttribute("d", "M130 268 C 90 300, 170 340, 124 368");
    g.appendChild(flow);
    hubs.forEach((hub) => {
        if (hub.level === "high") {
            const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            ring.setAttribute("class", "hub-ring");
            ring.setAttribute("cx", hub.x);
            ring.setAttribute("cy", hub.y);
            ring.setAttribute("r", 16);
            g.appendChild(ring);
        }
        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("class", "hub " + hub.level);
        c.setAttribute("cx", hub.x);
        c.setAttribute("cy", hub.y);
        c.setAttribute("r", hub.level === "high" ? 8 : hub.level === "mid" ? 6 : 5);
        c.setAttribute("tabindex", "0");
        c.setAttribute("role", "button");
        c.setAttribute("aria-label", hub.name);
        const show = () => {
            panel.innerHTML =
                '<p class="status-badge">' +
                hub.heat +
                "</p><h3>" +
                hub.name +
                "</h3><p>" +
                hub.type +
                "</p><p>Horario referencial: " +
                hub.hours +
                "</p><p>Consulta el CESFAM de tu comuna en la red MINSAL. Mapa esquemático, no GPS en tiempo real.</p>";
        };
        c.addEventListener("click", show);
        c.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                show();
            }
        });
        g.appendChild(c);
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("class", "geo-label");
        label.setAttribute("x", hub.x + 10);
        label.setAttribute("y", hub.y + 3);
        label.textContent = hub.name;
        g.appendChild(label);
    });
}

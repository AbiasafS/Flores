// =============================================================================
// 🌻 CONFIGURACIÓN DE LA CANCIÓN Y DEL RECORRIDO FLORAL 🌻
// =============================================================================
// Aquí puedes personalizar directamente la música y la dirección del movimiento:
//
// 1. cancionUrl:
//    - YouTube:   "https://youtu.be/D_TFJGqblis?si=FqLZPnBSFXwVdIZX"
//                 (acepta enlaces normales, cortos youtu.be, shorts o ID directo)
//    - Spotify:   "https://open.spotify.com/track/..."
//    - MP3/Audio: "cancion.mp3" (en la misma carpeta del proyecto) o enlace web
//    - Vacío "":  Sonará la dulce melodía en sintetizador (cajita de música 100% offline)
//
// 2. direccion:
//    - "derecha"  -> El recorrido avanza hacia la derecha (paisaje fluye suavemente)
//    - "izquierda" -> El recorrido avanza hacia la izquierda
//
// 3. velocidadTour:
//    - Velocidad del movimiento suave automático (recomendado 1.5 a 2.5)
// =============================================================================
const CONFIG_FLORES = {
  // Pega aquí tu enlace de YouTube, Spotify o archivo MP3:
  cancionUrl: "https://open.spotify.com/intl-es/track/571mGQF4y8U8ra2C6PUnAH?si=6754c75fc5f742e8",

  // Dirección del recorrido al presionar el botón: "derecha" o "izquierda"
  direccion: "derecha",

  // Velocidad del recorrido panorámico
  velocidadTour: 1.8
};

window.onload = () => {
  const btnStart = document.getElementById("btn-start");
  const body = document.body;

  // 1. Evento para el botón principal "Haz algo mágico ✨"
  if (btnStart) {
    btnStart.addEventListener("click", (e) => {
      e.stopPropagation();
      
      // Inicia el florecimiento
      body.classList.remove("container");
      
      // Oculta el botón de bienvenida
      btnStart.classList.add("hidden");
      
      // Desbloquear audio en móviles con el primer toque
      desbloquearAudioMovil();

      // Inicia la lluvia de pétalos infinita
      iniciarLluviaPetalos();

      // Inicia el jardín infinito con efecto de planeta
      iniciarJardinInfinito();
    });
  }

  // 2. Evento para el botón de dedicatoria: activa música y recorrido automático
  const messageBtn = document.getElementById("message-btn");
  if (messageBtn) {
    messageBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMusicAndTour(e);
    });
  }

  // 3. Efecto de luciérnagas al hacer clic / tocar en la pantalla
  document.addEventListener("click", (e) => {
    if (!body.classList.contains("container") && e.clientX !== undefined && e.clientY !== undefined) {
      crearGrupoLuciernagas(e.clientX, e.clientY);
    }
  });
};

/* --- FUNCIÓN DE LUCIÉRNAGAS --- */
function crearGrupoLuciernagas(x, y) {
  const cantidad = 12; 

  for (let i = 0; i < cantidad; i++) {
    const particle = document.createElement('div');
    particle.classList.add('firefly-click');
    
    const angulo = Math.random() * Math.PI * 2;
    const radio = Math.random() * 50; 
    const offsetX = Math.cos(angulo) * radio;
    const offsetY = Math.sin(angulo) * radio;
    
    particle.style.left = `${x + offsetX}px`;
    particle.style.top = `${y + offsetY}px`;
    
    const size = Math.random() * 5 + 4;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    const duracion = Math.random() * 1.5 + 1.5;
    particle.style.animationDuration = `${duracion}s`;
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
      particle.remove();
    }, duracion * 1000);
  }
}

/* --- EXPLOSIÓN DE CORAZONES Y DESTELLOS AL ACTIVAR EL BOTÓN --- */
function crearExplosionCorazones() {
  const btn = document.getElementById("message-btn");
  let originX = window.innerWidth / 2;
  let originY = window.innerHeight - 80;

  if (btn) {
    const rect = btn.getBoundingClientRect();
    originX = rect.left + rect.width / 2;
    originY = rect.top + rect.height / 2;
  }

  const simbolos = ["💛", "✨", "🌸", "🌻", "💛", "✨", "💛", "💐"];
  for (let i = 0; i < 22; i++) {
    const p = document.createElement("div");
    p.className = "heart-particle";
    p.textContent = simbolos[Math.floor(Math.random() * simbolos.length)];

    const angle = (Math.PI * 2 * i) / 22 + (Math.random() - 0.5) * 0.35;
    const dist = Math.random() * 110 + 40;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist - 80; // Elevarse hacia arriba

    p.style.setProperty("--tx", `${tx.toFixed(1)}px`);
    p.style.setProperty("--ty", `${ty.toFixed(1)}px`);
    p.style.left = `${originX}px`;
    p.style.top = `${originY}px`;
    p.style.fontSize = `${Math.random() * 8 + 18}px`;

    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1700);
  }
}

/* --- GESTIÓN DE AUDIO Y PARSEO DE CANCIÓN CONFIGURADA --- */
let audioCtx = null;
let isMusicPlaying = false;
let melodyTimeout = null;
let isCinematicActive = false;
let triggerTourImpulse = null;

let ytPlayer = null;
let ytReady = false;
let pendingPlay = false;

function desbloquearAudioMovil() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!audioCtx && AudioContextClass) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function extractYouTubeId(url) {
  if (!url) return null;
  const clean = url.trim();
  const match = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;
  return null;
}

function parseCancion(url) {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return { tipo: "synth" };
  }
  const clean = url.trim();

  // 1. YouTube
  const ytId = extractYouTubeId(clean);
  if (ytId) {
    return { tipo: "youtube", id: ytId };
  }

  // 2. Spotify
  const spotRegex = /open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|album|playlist)\/([a-zA-Z0-9]+)/;
  const spotMatch = clean.match(spotRegex);
  if (spotMatch) {
    const type = spotMatch[1];
    const id = spotMatch[2];
    return { 
      tipo: "spotify", 
      embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0&autoplay=1` 
    };
  }

  // 3. Archivo de audio local o URL MP3
  return { tipo: "audio", src: clean };
}

let cancionConfig = parseCancion(CONFIG_FLORES.cancionUrl);

// Notificación flotante estética si hay algún detalle con el video/audio
function mostrarAvisoCancion(texto) {
  let notice = document.getElementById("music-notice");
  if (!notice) {
    notice = document.createElement("div");
    notice.id = "music-notice";
    notice.style.position = "fixed";
    notice.style.top = "70px";
    notice.style.left = "50%";
    notice.style.transform = "translateX(-50%)";
    notice.style.background = "rgba(35, 20, 5, 0.94)";
    notice.style.border = "1px solid rgba(252, 231, 0, 0.6)";
    notice.style.color = "#fff8b0";
    notice.style.padding = "10px 22px";
    notice.style.borderRadius = "20px";
    notice.style.fontSize = "13px";
    notice.style.fontFamily = "Poppins, sans-serif";
    notice.style.fontWeight = "600";
    notice.style.zIndex = "99999";
    notice.style.boxShadow = "0 6px 25px rgba(0,0,0,0.7), 0 0 15px rgba(252,231,0,0.25)";
    notice.style.pointerEvents = "none";
    notice.style.textAlign = "center";
    notice.style.maxWidth = "90%";
    notice.style.transition = "opacity 0.6s ease";
    document.body.appendChild(notice);
  }
  notice.textContent = texto;
  notice.style.opacity = "1";
  setTimeout(() => {
    if (notice) notice.style.opacity = "0";
  }, 7000);
}

window.onYouTubeIframeAPIReady = function() {
  const initialYtId = cancionConfig.tipo === "youtube" ? cancionConfig.id : "S7gMzYqXIZc";

  if (window.location.protocol === "file:") {
    console.warn("⚠️ YouTube IFrame API requiere ejecutarse desde un servidor web (http://localhost o Docker). Si abres el archivo con doble clic (file://), YouTube bloqueará la reproducción.");
  }

  try {
    ytPlayer = new YT.Player('yt-player', {
      height: '200',
      width: '200',
      videoId: initialYtId,
      playerVars: {
        'autoplay': 0,
        'controls': 0,
        'loop': 1,
        'playlist': initialYtId,
        'playsinline': 1,
        'rel': 0,
        'modestbranding': 1,
        'origin': (window.location.origin && window.location.origin !== "null") ? window.location.origin : undefined
      },
      events: {
        'onReady': () => {
          ytReady = true;
          console.log("YouTube Player listo con video:", initialYtId);
          if (pendingPlay) {
            try {
              ytPlayer.playVideo();
            } catch(e) {
              console.warn("Error iniciando reproducción YouTube:", e);
            }
            pendingPlay = false;
          }
        },
        'onStateChange': (event) => {
          if (event.data === 1) {
            console.log("YouTube reproduciendo exitosamente 🎵");
          }
        },
        'onError': (event) => {
          console.warn("Error en YouTube Player (código " + event.data + ")");
          if (event.data === 101 || event.data === 150) {
            mostrarAvisoCancion("⚠️ Este video no permite inserción externa (bloqueado por discográfica). Reproduciendo cajita de música.");
          } else if (event.data === 100) {
            mostrarAvisoCancion("⚠️ Video de YouTube no encontrado o eliminado. Reproduciendo cajita de música.");
          } else if (event.data === 2) {
            mostrarAvisoCancion("⚠️ Enlace de YouTube no válido. Reproduciendo cajita de música.");
          }
          if (isMusicPlaying) {
            desbloquearAudioMovil();
            reproducirSecuenciaMelodia();
          }
        }
      }
    });
  } catch(e) {
    console.error("Error al inicializar YT.Player:", e);
  }
};

const NOTE_FREQS = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, Fs5: 739.99, G5: 783.99, A5: 880.00
};

// Melodía romántica y dulce en cajita de música: "Flores Amarillas"
const MELODIA_FLORES = [
  // Acorde arpegiado introductorio
  { note: "G4", dur: 0.35, pause: 0.4 },
  { note: "B4", dur: 0.35, pause: 0.4 },
  { note: "D5", dur: 0.5,  pause: 0.55 },
  { note: "G5", dur: 0.7,  pause: 0.8 },

  // Verso 1: "Él la estaba esperando con una flor amarilla..."
  { note: "D4", dur: 0.28, pause: 0.32 },
  { note: "E4", dur: 0.28, pause: 0.32 },
  { note: "Fs4", dur: 0.28, pause: 0.32 },
  { note: "G4", dur: 0.45, pause: 0.5 },
  { note: "A4", dur: 0.35, pause: 0.4 },
  { note: "B4", dur: 0.5,  pause: 0.55 },
  { note: "A4", dur: 0.35, pause: 0.4 },
  { note: "G4", dur: 0.35, pause: 0.4 },
  { note: "Fs4", dur: 0.35, pause: 0.4 },
  { note: "G4", dur: 0.75, pause: 0.85 },

  // Verso 2: "Ella lo estaba soñando con la luz en su pupila..."
  { note: "D4", dur: 0.28, pause: 0.32 },
  { note: "E4", dur: 0.28, pause: 0.32 },
  { note: "Fs4", dur: 0.28, pause: 0.32 },
  { note: "G4", dur: 0.45, pause: 0.5 },
  { note: "A4", dur: 0.35, pause: 0.4 },
  { note: "B4", dur: 0.5,  pause: 0.55 },
  { note: "A4", dur: 0.35, pause: 0.4 },
  { note: "G4", dur: 0.35, pause: 0.4 },
  { note: "Fs4", dur: 0.35, pause: 0.4 },
  { note: "E4", dur: 0.75, pause: 0.85 },

  // Verso 3: "Y el amarillo del sol iluminaba la esquina..."
  { note: "B4", dur: 0.35, pause: 0.38 },
  { note: "C5", dur: 0.35, pause: 0.38 },
  { note: "B4", dur: 0.35, pause: 0.38 },
  { note: "A4", dur: 0.35, pause: 0.38 },
  { note: "G4", dur: 0.35, pause: 0.38 },
  { note: "Fs4", dur: 0.35, pause: 0.38 },
  { note: "G4", dur: 0.42, pause: 0.46 },
  { note: "A4", dur: 0.65, pause: 0.8 },

  // Estribillo: "Ella sabía que él sabía, que algún día pasaría..."
  { note: "B4", dur: 0.32, pause: 0.36 },
  { note: "B4", dur: 0.32, pause: 0.36 },
  { note: "B4", dur: 0.32, pause: 0.36 },
  { note: "B4", dur: 0.48, pause: 0.52 },
  { note: "A4", dur: 0.32, pause: 0.36 },
  { note: "G4", dur: 0.32, pause: 0.36 },
  { note: "A4", dur: 0.32, pause: 0.36 },
  { note: "B4", dur: 0.65, pause: 0.75 },

  // "Que vendría a buscarla con sus flores amarillas..."
  { note: "B4", dur: 0.32, pause: 0.36 },
  { note: "B4", dur: 0.32, pause: 0.36 },
  { note: "B4", dur: 0.32, pause: 0.36 },
  { note: "B4", dur: 0.48, pause: 0.52 },
  { note: "A4", dur: 0.32, pause: 0.36 },
  { note: "G4", dur: 0.32, pause: 0.36 },
  { note: "Fs4", dur: 0.35, pause: 0.4 },
  { note: "G4", dur: 0.95, pause: 1.25 }
];

function playNote(freq, startTime, duration = 0.5, volume = 0.16) {
  if (!audioCtx || !isMusicPlaying) return;

  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  osc1.type = "sine";
  osc1.frequency.setValueAtTime(freq, startTime);

  osc2.type = "triangle";
  osc2.frequency.setValueAtTime(freq * 2, startTime);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(2200, startTime);

  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc1.connect(gainNode);
  osc2.connect(gainNode);
  gainNode.connect(filter);
  filter.connect(audioCtx.destination);

  osc1.start(startTime);
  osc2.start(startTime);
  osc1.stop(startTime + duration + 0.1);
  osc2.stop(startTime + duration + 0.1);
}

function reproducirSecuenciaMelodia() {
  if (!isMusicPlaying) return;
  if (!audioCtx) return;

  let currentTimeOffset = 0;
  const now = audioCtx.currentTime;

  for (let item of MELODIA_FLORES) {
    const freq = NOTE_FREQS[item.note];
    if (freq) {
      playNote(freq, now + currentTimeOffset, item.dur, 0.15);
    }
    currentTimeOffset += item.pause;
  }

  melodyTimeout = setTimeout(() => {
    if (isMusicPlaying) {
      reproducirSecuenciaMelodia();
    }
  }, currentTimeOffset * 1000);
}

function iniciarMusica() {
  isMusicPlaying = true;
  cancionConfig = parseCancion(CONFIG_FLORES.cancionUrl);

  // 1. YouTube
  if (cancionConfig.tipo === "youtube") {
    if (typeof YT === "undefined" || !YT.Player) {
      console.warn("YouTube API no disponible en este momento, usando sintetizador");
      desbloquearAudioMovil();
      reproducirSecuenciaMelodia();
      return;
    }

    if (ytPlayer && ytReady) {
      try {
        const currentUrl = ytPlayer.getVideoUrl ? ytPlayer.getVideoUrl() : "";
        if (!currentUrl.includes(cancionConfig.id)) {
          ytPlayer.loadVideoById(cancionConfig.id);
        } else {
          ytPlayer.playVideo();
        }
        return;
      } catch (err) {
        console.warn("Error reproduciendo YouTube, activando sintetizador:", err);
      }
    } else {
      pendingPlay = true;
      setTimeout(() => {
        if (isMusicPlaying && (!ytPlayer || !ytReady)) {
          console.warn("YouTube tardó demasiado en responder, activando sintetizador");
          desbloquearAudioMovil();
          reproducirSecuenciaMelodia();
        }
      }, 3000);
      return;
    }
  }

  // 2. Spotify
  if (cancionConfig.tipo === "spotify") {
    const spotContainer = document.getElementById("spotify-player-container");
    if (spotContainer) {
      spotContainer.classList.remove("hidden");
      if (!document.getElementById("spotify-iframe")) {
        spotContainer.innerHTML = `
          <iframe 
            id="spotify-iframe"
            style="border-radius:12px; border:none; width:100%; height:80px;" 
            src="${cancionConfig.embedUrl}" 
            frameBorder="0" 
            allowfullscreen="" 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy">
          </iframe>
        `;
      }
    }
    return;
  }

  // 3. Archivo de audio local o remoto (.mp3, etc.)
  if (cancionConfig.tipo === "audio") {
    const bgAudio = document.getElementById("bg-audio");
    if (bgAudio) {
      if (bgAudio.src !== cancionConfig.src && !bgAudio.src.endsWith(cancionConfig.src)) {
        bgAudio.src = cancionConfig.src;
      }
      bgAudio.play().catch(err => {
        console.warn("Audio MP3 no accesible, activando sintetizador:", err);
        desbloquearAudioMovil();
        reproducirSecuenciaMelodia();
      });
      return;
    }
  }

  // 4. Melodía en sintetizador Web Audio (100% offline)
  desbloquearAudioMovil();
  reproducirSecuenciaMelodia();
}

function detenerMusica() {
  isMusicPlaying = false;
  pendingPlay = false;

  if (ytPlayer && ytReady) {
    try {
      ytPlayer.pauseVideo();
    } catch (e) {}
  }

  const spotContainer = document.getElementById("spotify-player-container");
  if (spotContainer) {
    spotContainer.classList.add("hidden");
    spotContainer.innerHTML = "";
  }

  const bgAudio = document.getElementById("bg-audio");
  if (bgAudio && !bgAudio.paused) {
    bgAudio.pause();
  }

  if (melodyTimeout) {
    clearTimeout(melodyTimeout);
    melodyTimeout = null;
  }

  if (audioCtx && audioCtx.state === 'running') {
    audioCtx.suspend();
  }
}

function toggleMusicAndTour(e) {
  isCinematicActive = !isCinematicActive;
  const messageBtn = document.getElementById("message-btn");
  const musicIndicator = document.getElementById("music-indicator");

  crearExplosionCorazones();

  if (isCinematicActive) {
    if (messageBtn) messageBtn.classList.add("active");
    if (musicIndicator) musicIndicator.textContent = "🎶";
    if (triggerTourImpulse) triggerTourImpulse();
    iniciarMusica();
  } else {
    if (messageBtn) messageBtn.classList.remove("active");
    if (musicIndicator) musicIndicator.textContent = "🎵";
    detenerMusica();
  }
}

/* --- FUNCIÓN DE PÉTALOS INFINITOS --- */
function iniciarLluviaPetalos() {
  setInterval(crearPetalo, 400); 
}

function crearPetalo() {
  const petal = document.createElement("div");
  petal.classList.add("petal");
  
  petal.style.left = `${Math.random() * 92 + 4}vw`;
  
  const fallDuration = Math.random() * 5 + 5;
  petal.style.animationDuration = `${fallDuration}s`;
  
  const size = Math.random() * 10 + 10;
  petal.style.width = `${size}px`;
  petal.style.height = `${size}px`;
  
  document.body.appendChild(petal);
  
  setTimeout(() => {
    petal.remove();
  }, fallDuration * 1000);
}

/* --- SISTEMA DEL PLANETA Y JARDÍN INFINITO --- */
function iniciarJardinInfinito() {
  const layerBg = document.getElementById("layer-bg");
  const layerMid = document.getElementById("layer-mid");
  const layerFg = document.getElementById("layer-fg");
  const mainBouquet = document.getElementById("main-bouquet");
  const scrollHint = document.getElementById("scroll-hint");

  if (!layerBg || !layerMid || !layerFg) return;

  if (scrollHint) {
    setTimeout(() => {
      scrollHint.classList.add("visible");
    }, 2800);
  }

  const miniBouquetHtml = `
    <div class="flower flower--1">
      <div class="flower__leafs flower__leafs--1">
        <div class="flower__leaf flower__leaf--1"></div>
        <div class="flower__leaf flower__leaf--2"></div>
        <div class="flower__leaf flower__leaf--3"></div>
        <div class="flower__leaf flower__leaf--4"></div>
        <div class="flower__white-circle"></div>
      </div>
      <div class="flower__line">
        <div class="flower__line__leaf flower__line__leaf--1"></div>
        <div class="flower__line__leaf flower__line__leaf--2"></div>
        <div class="flower__line__leaf flower__line__leaf--3"></div>
        <div class="flower__line__leaf flower__line__leaf--4"></div>
        <div class="flower__line__leaf flower__line__leaf--5"></div>
        <div class="flower__line__leaf flower__line__leaf--6"></div>
        <div class="flower__line__leaf flower__line__leaf--7"></div>
        <div class="flower__line__leaf flower__line__leaf--8"></div>
      </div>
    </div>
    <div class="flower flower--2">
      <div class="flower__leafs flower__leafs--2">
        <div class="flower__leaf flower__leaf--1"></div>
        <div class="flower__leaf flower__leaf--2"></div>
        <div class="flower__leaf flower__leaf--3"></div>
        <div class="flower__leaf flower__leaf--4"></div>
        <div class="flower__white-circle"></div>
      </div>
      <div class="flower__line">
        <div class="flower__line__leaf flower__line__leaf--1"></div>
        <div class="flower__line__leaf flower__line__leaf--2"></div>
        <div class="flower__line__leaf flower__line__leaf--3"></div>
        <div class="flower__line__leaf flower__line__leaf--4"></div>
        <div class="flower__line__leaf flower__line__leaf--5"></div>
        <div class="flower__line__leaf flower__line__leaf--6"></div>
        <div class="flower__line__leaf flower__line__leaf--7"></div>
        <div class="flower__line__leaf flower__line__leaf--8"></div>
      </div>
    </div>
    <div class="flower flower--3">
      <div class="flower__leafs flower__leafs--3">
        <div class="flower__leaf flower__leaf--1"></div>
        <div class="flower__leaf flower__leaf--2"></div>
        <div class="flower__leaf flower__leaf--3"></div>
        <div class="flower__leaf flower__leaf--4"></div>
        <div class="flower__white-circle"></div>
      </div>
      <div class="flower__line">
        <div class="flower__line__leaf flower__line__leaf--1"></div>
        <div class="flower__line__leaf flower__line__leaf--2"></div>
        <div class="flower__line__leaf flower__line__leaf--3"></div>
        <div class="flower__line__leaf flower__line__leaf--4"></div>
        <div class="flower__line__leaf flower__line__leaf--5"></div>
        <div class="flower__line__leaf flower__line__leaf--6"></div>
        <div class="flower__line__leaf flower__line__leaf--7"></div>
        <div class="flower__line__leaf flower__line__leaf--8"></div>
      </div>
    </div>
    <div class="growing-grass">
      <div class="flower__grass flower__grass--1">
        <div class="flower__grass--top"></div>
        <div class="flower__grass--bottom"></div>
        <div class="flower__grass__leaf flower__grass__leaf--1"></div>
        <div class="flower__grass__leaf flower__grass__leaf--2"></div>
        <div class="flower__grass__leaf flower__grass__leaf--3"></div>
        <div class="flower__grass__leaf flower__grass__leaf--4"></div>
        <div class="flower__grass__leaf flower__grass__leaf--5"></div>
        <div class="flower__grass__leaf flower__grass__leaf--6"></div>
        <div class="flower__grass__leaf flower__grass__leaf--7"></div>
        <div class="flower__grass__leaf flower__grass__leaf--8"></div>
      </div>
    </div>
  `;

  const isMobile = window.innerWidth <= 768;

  // 1. Crear flores de fondo (Background)
  const bgClusters = [];
  const bgCount = 24;
  const bgSpan = 3200;
  for (let i = 0; i < bgCount; i++) {
    const el = document.createElement("div");
    el.className = "flower-cluster cluster--bg";
    el.innerHTML = miniBouquetHtml;
    layerBg.appendChild(el);
    bgClusters.push({
      el,
      baseX: (i / bgCount) * bgSpan - bgSpan / 2,
      baseScale: (isMobile ? 0.65 : 0.42) * (0.88 + Math.random() * 0.22),
      yShift: -38 + Math.random() * 24,
      span: bgSpan,
      parallax: 0.42
    });
  }

  // 2. Crear flores de plano medio (Midground)
  const midClusters = [];
  const midCount = 18;
  const midSpan = 2800;
  for (let i = 0; i < midCount; i++) {
    const el = document.createElement("div");
    el.className = "flower-cluster cluster--mid";
    el.innerHTML = miniBouquetHtml;
    layerMid.appendChild(el);
    midClusters.push({
      el,
      baseX: (i / midCount) * midSpan - midSpan / 2 + 40,
      baseScale: (isMobile ? 0.95 : 0.68) * (0.88 + Math.random() * 0.22),
      yShift: -22 + Math.random() * 20,
      span: midSpan,
      parallax: 0.72
    });
  }

  // 3. Capa frontal: incluye el ramo principal original (#main-bouquet) y 10 racimos adicionales
  const fgClusters = [];
  const fgSpan = 2500;

  if (mainBouquet) {
    mainBouquet.classList.add("flower-cluster", "cluster--fg");
    fgClusters.push({
      el: mainBouquet,
      baseX: 0,
      baseScale: isMobile ? 1.35 : 0.98,
      yShift: 0,
      span: fgSpan,
      parallax: 1.0
    });
  }

  const fgOffsets = [-960, -780, -600, -420, -220, 220, 420, 600, 780, 960];
  for (let offset of fgOffsets) {
    const el = document.createElement("div");
    el.className = "flower-cluster cluster--fg";
    el.innerHTML = miniBouquetHtml;
    layerFg.appendChild(el);
    fgClusters.push({
      el,
      baseX: offset,
      baseScale: (isMobile ? 1.15 : 0.88) * (0.88 + Math.random() * 0.22),
      yShift: -14 + Math.random() * 26,
      span: fgSpan,
      parallax: 1.0
    });
  }

  const allClusters = [...bgClusters, ...midClusters, ...fgClusters];

  // Estado de la cámara y controles interactivos
  let cameraX = 0;
  let targetCameraX = 0;
  let velocity = 0;
  let zoom = 1.0;
  let targetZoom = 1.0;
  let isDragging = false;
  let startX = 0;
  let lastX = 0;
  let userHasInteracted = false;
  let initialPinchDist = null;
  let initialPinchZoom = 1.0;
  let isUserInteracting = false;
  let userInteractionTimeout = null;

  // Multiplicador de dirección según CONFIG_FLORES.direccion:
  // "derecha": -1 (avanza hacia la derecha del planeta, revelando lo que está a la derecha)
  // "izquierda": 1 (avanza hacia la izquierda del planeta)
  const dirTour = (CONFIG_FLORES.direccion === "izquierda" ? 1 : -1);

  triggerTourImpulse = function() {
    isUserInteracting = false;
    if (userInteractionTimeout) {
      clearTimeout(userInteractionTimeout);
      userInteractionTimeout = null;
    }
    velocity = dirTour * 2.5; // Empuje suave inmediato hacia la derecha al presionar el botón
  };

  function markUserActivity() {
    isUserInteracting = true;
    if (userInteractionTimeout) {
      clearTimeout(userInteractionTimeout);
      userInteractionTimeout = null;
    }
  }

  function releaseUserActivity() {
    if (userInteractionTimeout) clearTimeout(userInteractionTimeout);
    userInteractionTimeout = setTimeout(() => {
      isUserInteracting = false;
    }, 2800);
  }

  function getPlanetRadius() {
    return window.innerWidth <= 768 ? 750 : 1100;
  }

  // Bucle de renderizado a 60 FPS
  function updateGarden() {
    // Si el modo cinemático está activo y el usuario no está arrastrando, avanzar automáticamente hacia la derecha
    if (isCinematicActive) {
      if (!isDragging && !isUserInteracting) {
        targetCameraX += dirTour * CONFIG_FLORES.velocidadTour;
      }
    } else {
      // Deriva ambiental sutil cuando no se interactúa
      if (!userHasInteracted || Math.abs(velocity) < 0.1) {
        targetCameraX += dirTour * 0.25;
      }
    }

    // Interpolación suave de cámara y zoom
    cameraX += (targetCameraX - cameraX) * 0.12;
    zoom += (targetZoom - zoom) * 0.1;

    // Desaceleración por inercia
    if (!isDragging) {
      targetCameraX += velocity;
      velocity *= 0.92;
      if (Math.abs(velocity) < 0.05) velocity = 0;
    }

    const R = getPlanetRadius();
    const halfScreen = window.innerWidth / 2 + 180;

    for (let item of allClusters) {
      const L = item.span;
      let x = ((item.baseX + cameraX * item.parallax + L / 2) % L + L) % L - L / 2;

      // Frustum culling
      if (Math.abs(x) > halfScreen) {
        if (item.el.style.display !== "none") item.el.style.display = "none";
        continue;
      }

      if (item.el.style.display === "none") item.el.style.display = "";

      const rad = x / R;
      const rot = (rad * 180) / Math.PI;
      const drop = (x * x) / (2 * R) + item.yShift;
      const currentScale = item.baseScale * Math.max(0.6, Math.cos(rad)) * zoom;

      item.el.style.transform = `translate3d(${x.toFixed(1)}px, ${drop.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${currentScale.toFixed(3)})`;
    }

    requestAnimationFrame(updateGarden);
  }

  requestAnimationFrame(updateGarden);

  function markInteraction() {
    if (!userHasInteracted) {
      userHasInteracted = true;
      if (scrollHint) {
        scrollHint.classList.add("fade-out");
        setTimeout(() => scrollHint.remove(), 1000);
      }
    }
  }

  // --- CONTROLES EN PC: RUEDA Y ARRASTRE ---
  window.addEventListener("wheel", (e) => {
    markInteraction();
    markUserActivity();
    if (e.ctrlKey) {
      e.preventDefault();
      targetZoom = Math.max(0.7, Math.min(1.4, targetZoom - e.deltaY * 0.002));
    } else {
      const delta = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * 1.4;
      targetCameraX -= delta;
    }
    releaseUserActivity();
  }, { passive: false });

  window.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    startX = e.clientX;
    lastX = e.clientX;
    velocity = 0;
    markUserActivity();
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    markInteraction();
    markUserActivity();
    const delta = e.clientX - lastX;
    targetCameraX += delta * 1.3;
    velocity = delta * 0.8;
    lastX = e.clientX;
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
    releaseUserActivity();
  });

  // --- CONTROLES EN MÓVIL: DESLIZAMIENTO Y PINCH TO ZOOM ---
  window.addEventListener("touchstart", (e) => {
    markUserActivity();
    if (e.touches.length === 1) {
      isDragging = true;
      startX = e.touches[0].clientX;
      lastX = e.touches[0].clientX;
      velocity = 0;
    } else if (e.touches.length === 2) {
      isDragging = false;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      initialPinchDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      initialPinchZoom = targetZoom;
    }
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    markInteraction();
    markUserActivity();
    if (e.touches.length === 1 && isDragging) {
      const currentX = e.touches[0].clientX;
      const delta = currentX - lastX;
      targetCameraX += delta * 1.4;
      velocity = delta * 0.9;
      lastX = currentX;
    } else if (e.touches.length === 2 && initialPinchDist) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const factor = currentDist / initialPinchDist;
      targetZoom = Math.max(0.7, Math.min(1.4, initialPinchZoom * factor));
    }
  }, { passive: true });

  window.addEventListener("touchend", (e) => {
    if (e.touches.length === 0) {
      isDragging = false;
      initialPinchDist = null;
      releaseUserActivity();
    }
  }, { passive: true });

  window.addEventListener("dblclick", () => {
    markInteraction();
    targetCameraX = 0;
    targetZoom = 1.0;
    velocity = 0;
  });
}
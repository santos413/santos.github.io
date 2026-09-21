/**
 * =========================================================
 * NEUROCIRCUIT LAB - SCRIPT PRINCIPAL
 * JavaScript puro (Vanilla JS), sin librerías externas.
 * Cada módulo/demo está aislado en su propio IIFE autónomo.
 * Autor: Santo Miguel Coria Suma
 * =========================================================
 */

/* =========================================================
   IIFE 1: CANVAS DE FONDO INTERACTIVO (RED NEURONAL / NODOS)
   ========================================================= */
(function initBackgroundCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Respetar prefers-reduced-motion
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mediaQuery.matches) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  // Reducir partículas en pantallas móviles
  const isMobile = width < 768;
  const particleCount = isMobile ? 32 : 75;
  const maxDistance = isMobile ? 85 : 125;

  const particles = [];
  const mouse = { x: -1000, y: -1000, radius: 120 };

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = (Math.random() - 0.5) * 0.7;
      this.radius = Math.random() * 1.8 + 1.2;
      // Naranja o Morado alternado
      this.color = Math.random() > 0.45 ? 'rgba(139, 92, 246, ' : 'rgba(255, 122, 26, ';
      this.alpha = Math.random() * 0.4 + 0.3;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Interacción suave con el cursor
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius && dist > 0) {
        const force = (mouse.radius - dist) / mouse.radius;
        this.x -= (dx / dist) * force * 1.5;
        this.y -= (dy / dist) * force * 1.5;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.alpha + ')';
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  let animationId;
  let isTabVisible = true;

  function animate() {
    if (!isTabVisible) return;
    ctx.clearRect(0, 0, width, height);

    // Conexiones sinápticas entre nodos
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          const opacity = (1 - dist / maxDistance) * 0.22;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(139, 92, 246, ' + opacity + ')';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Dibujar nodos
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    animationId = requestAnimationFrame(animate);
  }

  // Escuchar visibilidad para pausar animación y ahorrar CPU
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      isTabVisible = false;
      cancelAnimationFrame(animationId);
    } else {
      isTabVisible = true;
      animate();
    }
  });

  window.addEventListener('resize', function () {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  window.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseout', function () {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  animate();
})();

/* =========================================================
   IIFE 2: NAVEGACIÓN, MENÚ MÓVIL Y SCROLLSPY
   ========================================================= */
(function initNavigation() {
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  const links = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      menuToggle.textContent = isOpen ? '[✕ Cerrar]' : '[☰ Menú]';
    });

    // Cerrar al pulsar un enlace
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.textContent = '[☰ Menú]';
      });
    });
  }

  // ScrollSpy para resaltar sección activa
  window.addEventListener('scroll', function () {
    let currentId = '';
    const scrollPos = window.scrollY + 140;

    sections.forEach(function (section) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    links.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + currentId) {
        link.classList.add('active');
      }
    });
  });
})();

/* =========================================================
   IIFE 3: INDICADORES ANIMADOS DEL HERO
   ========================================================= */
(function initHeroMetrics() {
  const metricElements = document.querySelectorAll('[data-target-metric]');
  if (!metricElements.length) return;

  function countUp(el) {
    const target = parseFloat(el.getAttribute('data-target-metric') || '0');
    const suffix = el.getAttribute('data-suffix') || '';
    const isDecimal = target % 1 !== 0;
    const duration = 1600;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing cúbico
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = target * ease;

      el.textContent = (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  // Iniciar al cargar
  window.addEventListener('DOMContentLoaded', function () {
    metricElements.forEach(function (el) {
      countUp(el);
    });
  });
})();

/* =========================================================
   IIFE 4: DEMO MACHINE LEARNING - PREDICCIÓN DE FALLAS EN SENSORES
   ========================================================= */
(function initMachineLearningDemo() {
  const vInput = document.getElementById('ml-param-voltage');
  const fInput = document.getElementById('ml-param-freq');
  const dInput = document.getElementById('ml-param-duty');
  const tInput = document.getElementById('ml-param-temp');

  const vVal = document.getElementById('ml-val-voltage');
  const fVal = document.getElementById('ml-val-freq');
  const dVal = document.getElementById('ml-val-duty');
  const tVal = document.getElementById('ml-val-temp');

  const statusBadge = document.getElementById('ml-status-badge');
  const failProbBar = document.getElementById('ml-fail-prob-bar');
  const failProbText = document.getElementById('ml-fail-prob-text');
  const mtbfText = document.getElementById('ml-mtbf-text');
  const diagText = document.getElementById('ml-diag-text');

  if (!vInput || !fInput || !dInput || !tInput) return;

  function updateMLPrediction() {
    const voltage = parseFloat(vInput.value);
    const freq = parseFloat(fInput.value);
    const duty = parseFloat(dInput.value);
    const temp = parseFloat(tInput.value);

    // Actualizar etiquetas
    if (vVal) vVal.textContent = voltage.toFixed(1) + ' V';
    if (fVal) fVal.textContent = freq.toFixed(0) + ' kHz';
    if (dVal) dVal.textContent = duty.toFixed(0) + ' %';
    if (tVal) tVal.textContent = temp.toFixed(0) + ' °C';

    // Modelo de inferencia de estrés térmico y eléctrico simulado:
    // P_estrés = (V / 12)^1.8 * (f / 100)^0.9 * (duty / 50)^1.2 + (temp - 25) * 0.8
    const vFactor = Math.pow(voltage / 12, 1.7);
    const fFactor = Math.pow(freq / 100, 0.85);
    const dFactor = Math.pow(duty / 50, 1.1);
    const tFactor = Math.max(0, temp - 25) * 0.75;

    let rawScore = (vFactor * fFactor * dFactor * 32) + tFactor;
    rawScore = Math.min(Math.max(rawScore, 4), 99.4);

    const probFalla = rawScore;
    if (failProbBar) failProbBar.style.width = probFalla.toFixed(1) + '%';
    if (failProbText) failProbText.textContent = probFalla.toFixed(1) + '%';

    // MTBF estimado (horas)
    const mtbf = Math.max(800, Math.round(50000 * Math.exp(-probFalla / 22)));
    if (mtbfText) mtbfText.textContent = mtbf.toLocaleString('es-ES') + ' horas';

    // Actualización de estado
    if (statusBadge && diagText) {
      statusBadge.className = 'status-badge';
      if (probFalla < 35) {
        statusBadge.classList.add('normal');
        statusBadge.textContent = '● ESTADO: OPERACIÓN ÓPTIMA';
        diagText.textContent = 'Margen de disipación seguro. Conmutación en zona SOA (Safe Operating Area). Rendimiento electromagnético estable.';
      } else if (probFalla < 70) {
        statusBadge.classList.add('warning');
        statusBadge.textContent = '▲ ESTADO: ALERTA DE ESTRÉS TÉRMICO';
        diagText.textContent = 'La temperatura de unión Tj excede los 85°C recomendados. Aumenta la probabilidad de deriva en lecturas analógicas del sensor.';
      } else {
        statusBadge.classList.add('danger');
        statusBadge.textContent = '✖ ESTADO: CRÍTICO / FALLA INMINENTE';
        diagText.textContent = 'Peligro de ruptura térmica o saturación en etapa de potencia. Se recomienda activar corte PWM o redundancia inmediata.';
      }
    }
  }

  [vInput, fInput, dInput, tInput].forEach(function (slider) {
    slider.addEventListener('input', updateMLPrediction);
  });

  updateMLPrediction();
})();

/* =========================================================
   IIFE 5: CIENCIA DE DATOS & FILTRO DE SEÑAL DE SENSOR (CANVAS)
   ========================================================= */
(function initDataScienceSignalDemo() {
  const canvas = document.getElementById('signal-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const noiseSlider = document.getElementById('ds-noise-slider');
  const noiseVal = document.getElementById('ds-noise-val');
  const filterBtn = document.getElementById('ds-filter-btn');
  const resetBtn = document.getElementById('ds-reset-btn');
  const snrVal = document.getElementById('ds-snr-val');
  const filterStatus = document.getElementById('ds-filter-status');

  let noiseLevel = 35;
  let isFilterApplied = false;
  const samples = 220;
  let baseSignal = [];
  let noisySignal = [];

  // Generar señal base limpia (seno fundamental + armónico)
  function generateBaseSignal() {
    baseSignal = [];
    for (let i = 0; i < samples; i++) {
      const t = (i / samples) * 4 * Math.PI;
      // Onda típica de señal de transductor (e.g. deformímetro o tacómetro)
      const val = Math.sin(t) * 0.7 + Math.sin(t * 3) * 0.25;
      baseSignal.push(val);
    }
  }

  function applyNoise() {
    noisySignal = [];
    const scale = (noiseLevel / 100) * 0.9;
    for (let i = 0; i < samples; i++) {
      // Ruido pseudo-gaussiano
      const noise = ((Math.random() + Math.random() + Math.random()) / 3 - 0.5) * 2 * scale;
      noisySignal.push(baseSignal[i] + noise);
    }
  }

  // Filtro de media móvil (Moving Average Filter)
  function computeMovingAverage(data, windowSize) {
    const result = [];
    const half = Math.floor(windowSize / 2);
    for (let i = 0; i < data.length; i++) {
      let sum = 0;
      let count = 0;
      for (let j = -half; j <= half; j++) {
        const idx = i + j;
        if (idx >= 0 && idx < data.length) {
          sum += data[idx];
          count++;
        }
      }
      result.push(sum / count);
    }
    return result;
  }

  function draw() {
    const w = (canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : 600);
    const h = (canvas.height = 240);
    ctx.clearRect(0, 0, w, h);

    const midY = h / 2;
    const amp = h * 0.35;

    // Cuadrícula tipo osciloscopio
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.12)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Eje central
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(w, midY);
    ctx.stroke();

    // 1. Dibujar señal ruidosa (Naranja difuso)
    ctx.beginPath();
    for (let i = 0; i < samples; i++) {
      const x = (i / (samples - 1)) * w;
      const y = midY - noisySignal[i] * amp;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = isFilterApplied ? 'rgba(255, 122, 26, 0.35)' : 'rgba(255, 122, 26, 0.9)';
    ctx.lineWidth = isFilterApplied ? 1 : 1.6;
    ctx.stroke();

    // 2. Si el filtro está activo, dibujar señal filtrada (Cyan brillante)
    if (isFilterApplied) {
      const filtered = computeMovingAverage(noisySignal, 7);
      ctx.beginPath();
      for (let i = 0; i < samples; i++) {
        const x = (i / (samples - 1)) * w;
        const y = midY - filtered[i] * amp;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2.4;
      ctx.shadowColor = 'rgba(0, 229, 255, 0.6)';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 3. Señal de referencia original limpia (Línea punteada morada)
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    for (let i = 0; i < samples; i++) {
      const x = (i / (samples - 1)) * w;
      const y = midY - baseSignal[i] * amp;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(181, 124, 255, 0.7)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.setLineDash([]);

    // Cálculo estimado de SNR en dB
    const effectiveNoise = isFilterApplied ? noiseLevel * 0.28 : noiseLevel;
    const snr = Math.max(2, Math.round(35 - (effectiveNoise * 0.32)));
    if (snrVal) snrVal.textContent = snr + ' dB';
  }

  generateBaseSignal();
  applyNoise();
  draw();

  if (noiseSlider) {
    noiseSlider.addEventListener('input', function () {
      noiseLevel = parseInt(noiseSlider.value, 10);
      if (noiseVal) noiseVal.textContent = noiseLevel + '%';
      applyNoise();
      draw();
    });
  }

  if (filterBtn) {
    filterBtn.addEventListener('click', function () {
      isFilterApplied = !isFilterApplied;
      filterBtn.textContent = isFilterApplied ? 'Quitar filtro digital' : 'Aplicar filtro (Media móvil)';
      if (filterStatus) {
        filterStatus.textContent = isFilterApplied ? 'Filtro ACTIVO (Ventana N=7)' : 'Sin filtrar (Señal cruda)';
        filterStatus.style.color = isFilterApplied ? '#00e5ff' : 'var(--accent-orange)';
      }
      draw();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      generateBaseSignal();
      applyNoise();
      draw();
    });
  }

  window.addEventListener('resize', draw);
})();

/* =========================================================
   IIFE 6: REDES NEURONALES - VISUALIZADOR INTERACTIVO (CANVAS)
   ========================================================= */
(function initNeuralNetworkViewer() {
  const canvas = document.getElementById('nn-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const inputSlider = document.getElementById('nn-input-count');
  const layersSlider = document.getElementById('nn-layers-count');
  const neuronsSlider = document.getElementById('nn-neurons-count');
  const outputSlider = document.getElementById('nn-output-count');

  const inputVal = document.getElementById('nn-input-val');
  const layersVal = document.getElementById('nn-layers-val');
  const neuronsVal = document.getElementById('nn-neurons-val');
  const outputVal = document.getElementById('nn-output-val');

  const propagateBtn = document.getElementById('nn-propagate-btn');
  const nnOutputLog = document.getElementById('nn-output-log');

  let inputCount = 3;
  let hiddenLayersCount = 2;
  let neuronsPerHidden = 4;
  let outputCount = 2;

  let signalPulses = [];
  let isPropagating = false;

  function buildArchitecture() {
    const arch = [inputCount];
    for (let i = 0; i < hiddenLayersCount; i++) {
      arch.push(neuronsPerHidden);
    }
    arch.push(outputCount);
    return arch;
  }

  function getLayerPositions(arch, width, height) {
    const layers = [];
    const layerSpacing = width / (arch.length + 1);

    for (let l = 0; l < arch.length; l++) {
      const count = arch[l];
      const neuronSpacing = height / (count + 1);
      const layerNeurons = [];

      for (let n = 0; n < count; n++) {
        layerNeurons.push({
          x: layerSpacing * (l + 1),
          y: neuronSpacing * (n + 1),
          layerIndex: l,
          neuronIndex: n
        });
      }
      layers.push(layerNeurons);
    }
    return layers;
  }

  function drawNetwork() {
    const w = (canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : 700);
    const h = (canvas.height = 420);
    ctx.clearRect(0, 0, w, h);

    const arch = buildArchitecture();
    const layers = getLayerPositions(arch, w, h);

    // 1. Dibujar conexiones sinápticas (pesos)
    for (let l = 0; l < layers.length - 1; l++) {
      const currentLayer = layers[l];
      const nextLayer = layers[l + 1];

      for (let i = 0; i < currentLayer.length; i++) {
        for (let j = 0; j < nextLayer.length; j++) {
          const from = currentLayer[i];
          const to = nextLayer[j];

          // Determinismo para color de peso estático
          const seed = (l * 13 + i * 7 + j * 19) % 10;
          const isExcited = seed > 4;

          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.strokeStyle = isExcited ? 'rgba(139, 92, 246, 0.28)' : 'rgba(255, 122, 26, 0.25)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // 2. Dibujar pulsos de propagación activos
    if (signalPulses.length > 0) {
      for (let p = signalPulses.length - 1; p >= 0; p--) {
        const pulse = signalPulses[p];
        pulse.progress += 0.045;

        const currentX = pulse.from.x + (pulse.to.x - pulse.from.x) * pulse.progress;
        const currentY = pulse.from.y + (pulse.to.y - pulse.from.y) * pulse.progress;

        ctx.beginPath();
        ctx.arc(currentX, currentY, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffa04d';
        ctx.shadowColor = '#ff7a1a';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (pulse.progress >= 1) {
          signalPulses.splice(p, 1);
        }
      }
    }

    // 3. Dibujar neuronas (círculos iluminados)
    for (let l = 0; l < layers.length; l++) {
      const layer = layers[l];
      const isInput = l === 0;
      const isOutput = l === layers.length - 1;

      for (let n = 0; n < layer.length; n++) {
        const neuron = layer[n];

        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, 14, 0, Math.PI * 2);

        if (isInput) {
          ctx.fillStyle = '#1c1533';
          ctx.strokeStyle = '#ffa04d';
        } else if (isOutput) {
          ctx.fillStyle = '#1c1533';
          ctx.strokeStyle = '#00e5ff';
        } else {
          ctx.fillStyle = '#140e26';
          ctx.strokeStyle = '#8b5cf6';
        }

        ctx.lineWidth = 2.5;
        ctx.fill();
        ctx.stroke();

        // Núcleo brillante
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = isInput ? '#ffa04d' : isOutput ? '#00e5ff' : '#b57cff';
        ctx.fill();
      }
    }

    if (signalPulses.length > 0) {
      requestAnimationFrame(drawNetwork);
    } else if (isPropagating) {
      isPropagating = false;
    }
  }

  function triggerSignalPropagation() {
    if (isPropagating) return;
    isPropagating = true;
    signalPulses = [];

    const arch = buildArchitecture();
    const layers = getLayerPositions(arch, canvas.width, canvas.height);

    // Secuenciar pulsos desde la entrada hasta la salida
    for (let l = 0; l < layers.length - 1; l++) {
      const currentLayer = layers[l];
      const nextLayer = layers[l + 1];

      for (let i = 0; i < currentLayer.length; i++) {
        for (let j = 0; j < nextLayer.length; j++) {
          signalPulses.push({
            from: currentLayer[i],
            to: nextLayer[j],
            progress: -l * 0.4 // Retardo secuencial por capa
          });
        }
      }
    }

    if (nnOutputLog) {
      const sampleOutputs = [];
      for (let o = 0; o < outputCount; o++) {
        sampleOutputs.push('y' + (o + 1) + ': ' + (Math.random() * 0.8 + 0.1).toFixed(3));
      }
      nnOutputLog.textContent = 'Propagación activa -> ' + sampleOutputs.join(' | ');
    }

    drawNetwork();
  }

  function updateParams() {
    inputCount = parseInt(inputSlider.value, 10);
    hiddenLayersCount = parseInt(layersSlider.value, 10);
    neuronsPerHidden = parseInt(neuronsSlider.value, 10);
    outputCount = parseInt(outputSlider.value, 10);

    if (inputVal) inputVal.textContent = inputCount;
    if (layersVal) layersVal.textContent = hiddenLayersCount;
    if (neuronsVal) neuronsVal.textContent = neuronsPerHidden;
    if (outputVal) outputVal.textContent = outputCount;

    drawNetwork();
  }

  [inputSlider, layersSlider, neuronsSlider, outputSlider].forEach(function (s) {
    if (s) s.addEventListener('input', updateParams);
  });

  if (propagateBtn) {
    propagateBtn.addEventListener('click', triggerSignalPropagation);
  }

  window.addEventListener('resize', drawNetwork);
  updateParams();
})();

/* =========================================================
   IIFE 7: IA GENERATIVA - DEMO SIMULADA TYPEWRITER
   ========================================================= */
(function initGenerativeAIDemo() {
  const promptSelect = document.getElementById('gen-prompt-select');
  const runBtn = document.getElementById('gen-run-btn');
  const clearBtn = document.getElementById('gen-clear-btn');
  const outputBox = document.getElementById('gen-output-box');

  if (!promptSelect || !runBtn || !outputBox) return;

  const responses = {
    firmware: `// ======================================================
// FIRMWARE ESP32: FILTRO DIGITAL IIR + SENSOR I2C
// Auto-generado por NeuroCircuit Generative Engine
// ======================================================
#include <Wire.h>

#define SENSOR_ADDR 0x68
#define ALPHA 0.85f // Coeficiente de suavizado IIR

static float filtered_voltage = 0.0f;

float readSensorRaw() {
  Wire.beginTransmission(SENSOR_ADDR);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(SENSOR_ADDR, 2, true);
  int16_t raw = (Wire.read() << 8) | Wire.read();
  return ((float)raw / 32768.0f) * 3.3f;
}

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22); // SDA=21, SCL=22
  filtered_voltage = readSensorRaw();
  Serial.println("[OK] Sistema de inferencia listo.");
}

void loop() {
  float raw_val = readSensorRaw();
  // Filtro pasa-bajas digital en tiempo discreto: y[k] = alpha*y[k-1] + (1-alpha)*x[k]
  filtered_voltage = (ALPHA * filtered_voltage) + ((1.0f - ALPHA) * raw_val);
  
  Serial.printf("Raw: %.3f V | Filtrado: %.3f V\\n", raw_val, filtered_voltage);
  delay(20); // Muestreo a 50 Hz
}`,

    spectral: `======================================================
REPORTE DE DIAGNÓSTICO ESPECTRAL (FFT) - INVERSOR PWM
Análisis de armónicos y estabilidad de potencia
======================================================
[+] Señal muestreada: 4096 puntos a Fs = 100 kHz
[+] Frecuencia Fundamental: 50.00 Hz (Amplitud: 220.4 V RMS)

ESPECTRO ARMÓNICO DETECTADO:
  - 3er Armónico (150 Hz) : 1.2% THD  [Dentro de norma IEEE 519]
  - 5to Armónico (250 Hz) : 3.8% THD  [Moderado - revisar snubber]
  - 7mo Armónico (350 Hz) : 0.9% THD  [Aceptable]
  - Banda de conmutación: Pico resonante en 19.8 kHz (+4.2 dB)

DIAGNÓSTICO DEL MODELO:
El inversor presenta una distorsión armónica total (THD_v) del 4.1%.
Recomendación de ingeniería: Rediseñar filtro LC de salida; ajustar
frecuencia de corte f_c a 2.5 kHz para atenuar resonancia de puente H.`,

    schematic: `======================================================
DESCRIPCIÓN DE ACONDICIONAMIENTO: TERMOPAR TIPO K + AD620
Topología recomendada para adquisición de alta precisión
======================================================
1. ETAPA DE ENTRADA:
   - Termopar conectado a pines 2 (IN-) y 3 (IN+) del AD620.
   - Resistencia de Ganancia Rg entre pines 1 y 8:
     Formula: Rg = 49.4 kΩ / (G - 1)
     Para G = 100 -> Rg = 498.9 Ω (Valor comercial estándar 499 Ω 1%).

2. COMPENSACIÓN DE UNIÓN FRÍA (CJC):
   - Sensor de temperatura local (LM35 o PT100) en el bloque de terminales.
   - Señal sumada analógicamente o en firmware ADC con offset térmico (41 µV/°C).

3. FILTRADO ANALÓGICO ANTI-ALIASING:
   - Filtro pasivo RC de entrada diferencial: R = 1 kΩ, C_diff = 100 nF, C_cm = 10 nF.
   - Atenuación de ruido de red (50/60 Hz): > 40 dB CMRR.`,

    tinyml: `======================================================
ARQUITECTURA TINYML CUANTIZADA (INT8) PARA CORTEX-M4
Modelo de detección de anomalías por vibración piezoeléctrica
======================================================
Topología: 1D-CNN Cuantizada (TFLite Micro)
- Entrada: Tensor 1x128 (Ventana de acelerómetro en 3 ejes, 128 muestras)
- Capa 1: Conv1D (16 filtros, kernel 5, activación ReLU) [Pesos: INT8]
- Capa 2: MaxPooling1D (stride 2)
- Capa 3: Conv1D (32 filtros, kernel 3, activación ReLU) [Pesos: INT8]
- Capa 4: GlobalAveragePooling1D
- Salida: Densa (3 neuronas, Softmax: Normal, Rodamiento Dañado, Desbalance)

MÉTRICAS EN HARDWARE EMBEBIDO (STM32F401RE @ 84 MHz):
  - Consumo Flash: 18.4 KB (vs 72 KB en FP32)
  - Memoria RAM (Tensor Arena): 6.2 KB
  - Latencia por inferencia: 3.4 milisegundos
  - Consumo dinámico adicional: < 2.8 mA durante cómputo`
  };

  let typingTimer = null;

  function typeText(fullText) {
    if (typingTimer) clearInterval(typingTimer);
    outputBox.textContent = '';
    let index = 0;
    const speed = 12; // ms por carácter

    typingTimer = setInterval(function () {
      if (index < fullText.length) {
        outputBox.textContent += fullText.charAt(index);
        index++;
        outputBox.scrollTop = outputBox.scrollHeight;
      } else {
        clearInterval(typingTimer);
        typingTimer = null;
      }
    }, speed);
  }

  runBtn.addEventListener('click', function () {
    const key = promptSelect.value;
    const textToType = responses[key] || 'Opción no disponible.';
    typeText(textToType);
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      if (typingTimer) clearInterval(typingTimer);
      outputBox.textContent = '// Presiona "Generar respuesta simulada" para iniciar la inferencia...';
    });
  }
})();

/* =========================================================
   IIFE 8: PLAYGROUND INTERACTIVO CON PESTAÑAS
   ========================================================= */
(function initPlayground() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      const target = tab.getAttribute('data-tab');

      tabs.forEach(function (t) { t.classList.remove('active'); });
      panels.forEach(function (p) { p.classList.remove('active'); });

      tab.classList.add('active');
      const activePanel = document.getElementById(target);
      if (activePanel) activePanel.classList.add('active');
    });
  });

  // 1. Sub-demo Clasificación (Tolerancia de componentes electrónicos)
  (function initPlaygroundClassification() {
    const resSlider = document.getElementById('play-res-slider');
    const tempDriftSlider = document.getElementById('play-temp-slider');
    const resVal = document.getElementById('play-res-val');
    const tempVal = document.getElementById('play-temp-val');
    const classResult = document.getElementById('play-class-result');

    if (!resSlider || !tempDriftSlider || !classResult) return;

    function evalComponent() {
      const tolerance = parseFloat(resSlider.value);
      const drift = parseFloat(tempDriftSlider.value);

      if (resVal) resVal.textContent = '± ' + tolerance.toFixed(1) + ' %';
      if (tempVal) tempVal.textContent = drift.toFixed(0) + ' ppm/°C';

      // Criterio de clasificación de grado electrónico
      if (tolerance <= 1.0 && drift <= 50) {
        classResult.className = 'status-badge normal';
        classResult.textContent = '● GRADO MILITAR / MÉDICO (Alta precisión)';
      } else if (tolerance <= 5.0 && drift <= 200) {
        classResult.className = 'status-badge warning';
        classResult.textContent = '▲ GRADO INDUSTRIAL (Conforme)';
      } else {
        classResult.className = 'status-badge danger';
        classResult.textContent = '✖ FUERA DE NORMA (Rechazado por QA)';
      }
    }

    resSlider.addEventListener('input', evalComponent);
    tempDriftSlider.addEventListener('input', evalComponent);
    evalComponent();
  })();

  // 2. Sub-demo Predicción (Consumo de potencia vs Frecuencia de Reloj)
  (function initPlaygroundPrediction() {
    const clockSlider = document.getElementById('play-clock-slider');
    const clockVal = document.getElementById('play-clock-val');
    const powerResult = document.getElementById('play-power-result');

    if (!clockSlider || !powerResult) return;

    function evalPower() {
      const clockMhz = parseFloat(clockSlider.value);
      if (clockVal) clockVal.textContent = clockMhz.toFixed(0) + ' MHz';

      // P_dinamica = C * V^2 * f + P_estatica
      // Para MCU a 3.3V: mA ~= 0.35 * clock + 2.5
      const current_mA = (0.32 * clockMhz + 2.1).toFixed(1);
      const power_mW = (current_mA * 3.3).toFixed(1);

      powerResult.textContent = current_mA + ' mA (' + power_mW + ' mW)';
    }

    clockSlider.addEventListener('input', evalPower);
    evalPower();
  })();

  // 3. Sub-demo Clustering K-Means 2D
  (function initPlaygroundClustering() {
    const canvas = document.getElementById('play-cluster-canvas');
    const iterBtn = document.getElementById('play-cluster-btn');
    const resetBtn = document.getElementById('play-cluster-reset');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let points = [];
    let centroids = [];
    const k = 3;
    const colors = ['#ff7a1a', '#8b5cf6', '#00e5ff'];

    function initData() {
      points = [];
      const w = canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : 500;
      const h = canvas.height = 240;

      // 3 grupos de sensores IoT simulados
      const centers = [
        { x: w * 0.25, y: h * 0.4 },
        { x: w * 0.75, y: h * 0.3 },
        { x: w * 0.5, y: h * 0.75 }
      ];

      for (let c = 0; c < 3; c++) {
        for (let i = 0; i < 24; i++) {
          points.push({
            x: centers[c].x + (Math.random() - 0.5) * (w * 0.22),
            y: centers[c].y + (Math.random() - 0.5) * (h * 0.3),
            cluster: c
          });
        }
      }

      centroids = [
        { x: w * 0.2, y: h * 0.2 },
        { x: w * 0.8, y: h * 0.2 },
        { x: w * 0.5, y: h * 0.5 }
      ];
      drawClusters();
    }

    function iterateKMeans() {
      // Asignar puntos al centroide más cercano
      points.forEach(function (p) {
        let minDist = Infinity;
        let chosenCluster = 0;
        centroids.forEach(function (c, idx) {
          const d = Math.hypot(p.x - c.x, p.y - c.y);
          if (d < minDist) {
            minDist = d;
            chosenCluster = idx;
          }
        });
        p.cluster = chosenCluster;
      });

      // Recalcular centroides
      centroids.forEach(function (c, idx) {
        const clusterPoints = points.filter(function (p) { return p.cluster === idx; });
        if (clusterPoints.length > 0) {
          const avgX = clusterPoints.reduce(function (sum, p) { return sum + p.x; }, 0) / clusterPoints.length;
          const avgY = clusterPoints.reduce(function (sum, p) { return sum + p.y; }, 0) / clusterPoints.length;
          c.x = avgX;
          c.y = avgY;
        }
      });

      drawClusters();
    }

    function drawClusters() {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Puntos
      points.forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = colors[p.cluster];
        ctx.fill();
      });

      // Centroides
      centroids.forEach(function (c, idx) {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 9, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.fillStyle = colors[idx];
        ctx.fill();
      });
    }

    if (iterBtn) iterBtn.addEventListener('click', iterateKMeans);
    if (resetBtn) resetBtn.addEventListener('click', initData);
    window.addEventListener('resize', initData);
    initData();
  })();

  // 4. Sub-demo Generador de Datos de Telemetría IoT
  (function initPlaygroundDataGen() {
    const genBtn = document.getElementById('play-gen-data-btn');
    const tableBody = document.getElementById('play-data-table-body');
    const countBadge = document.getElementById('play-data-count');

    if (!genBtn || !tableBody) return;

    let totalRows = 0;

    function generateRow() {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0] + '.' + Math.floor(now.getMilliseconds() / 100);
      const sensorId = 'NODE_ESP32_' + (Math.floor(Math.random() * 4) + 1);
      const temp = (22.5 + (Math.random() - 0.5) * 6).toFixed(2);
      const hum = (52.0 + (Math.random() - 0.5) * 12).toFixed(1);
      const volt = (3.28 + (Math.random() - 0.5) * 0.15).toFixed(3);
      const rssi = '-' + Math.floor(55 + Math.random() * 25) + ' dBm';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="padding: 8px; font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted);">${timeStr}</td>
        <td style="padding: 8px; font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-orange-light);">${sensorId}</td>
        <td style="padding: 8px; font-family: var(--font-mono); font-size: 0.8rem;">${temp} °C</td>
        <td style="padding: 8px; font-family: var(--font-mono); font-size: 0.8rem;">${hum} %</td>
        <td style="padding: 8px; font-family: var(--font-mono); font-size: 0.8rem;">${volt} V</td>
        <td style="padding: 8px; font-family: var(--font-mono); font-size: 0.8rem; color: #00e5ff;">${rssi}</td>
      `;
      tableBody.prepend(tr);

      // Mantener máximo 8 filas
      if (tableBody.children.length > 8) {
        tableBody.removeChild(tableBody.lastChild);
      }

      totalRows++;
      if (countBadge) countBadge.textContent = totalRows + ' muestras generadas';
    }

    genBtn.addEventListener('click', function () {
      for (let i = 0; i < 4; i++) {
        generateRow();
      }
    });

    // Semilla inicial
    for (let i = 0; i < 4; i++) generateRow();
  })();
})();

/* =========================================================
   IIFE 9: DASHBOARD CON 4 GRÁFICOS VIVOS (CANVAS NATIVO)
   ========================================================= */
(function initDashboardCharts() {
  const lineCanvas = document.getElementById('dash-line-canvas');
  const barCanvas = document.getElementById('dash-bar-canvas');
  const donutCanvas = document.getElementById('dash-donut-canvas');
  const scatterCanvas = document.getElementById('dash-scatter-canvas');

  if (!lineCanvas || !barCanvas || !donutCanvas || !scatterCanvas) return;

  const lineCtx = lineCanvas.getContext('2d');
  const barCtx = barCanvas.getContext('2d');
  const donutCtx = donutCanvas.getContext('2d');
  const scatterCtx = scatterCanvas.getContext('2d');

  // Datos simulados en tiempo real
  let lineData = [12.02, 12.04, 12.01, 11.98, 12.05, 12.03, 12.06, 12.01, 12.07, 12.04];
  const barData = [
    { label: 'MOSFET', count: 32 },
    { label: 'Cap. Elec.', count: 48 },
    { label: 'Sensores', count: 18 },
    { label: 'Bobinas', count: 12 },
    { label: 'MCU SPI', count: 8 }
  ];
  let donutData = [65, 23, 12]; // Normal, Advertencia, Crítico
  let scatterPoints = [];

  function initScatter() {
    scatterPoints = [];
    for (let i = 0; i < 30; i++) {
      const temp = 30 + Math.random() * 50;
      const vib = 0.5 + (temp / 60) * Math.random() * 2.2;
      scatterPoints.push({ x: temp, y: vib });
    }
  }
  initScatter();

  function drawLineChart() {
    const w = (lineCanvas.width = lineCanvas.parentElement.clientWidth);
    const h = (lineCanvas.height = 180);
    lineCtx.clearRect(0, 0, w, h);

    const min = 11.8;
    const max = 12.2;

    lineCtx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
    lineCtx.beginPath();
    lineCtx.moveTo(0, h / 2);
    lineCtx.lineTo(w, h / 2);
    lineCtx.stroke();

    lineCtx.beginPath();
    for (let i = 0; i < lineData.length; i++) {
      const x = (i / (lineData.length - 1)) * w;
      const y = h - ((lineData[i] - min) / (max - min)) * h;
      if (i === 0) lineCtx.moveTo(x, y);
      else lineCtx.lineTo(x, y);
    }
    lineCtx.strokeStyle = '#ff7a1a';
    lineCtx.lineWidth = 2.4;
    lineCtx.stroke();

    // Área bajo la curva
    lineCtx.lineTo(w, h);
    lineCtx.lineTo(0, h);
    lineCtx.fillStyle = 'rgba(255, 122, 26, 0.08)';
    lineCtx.fill();
  }

  function drawBarChart() {
    const w = (barCanvas.width = barCanvas.parentElement.clientWidth);
    const h = (barCanvas.height = 180);
    barCtx.clearRect(0, 0, w, h);

    const maxCount = 55;
    const barWidth = w / (barData.length * 1.6);
    const gap = (w - barWidth * barData.length) / (barData.length + 1);

    barData.forEach(function (item, idx) {
      const x = gap + idx * (barWidth + gap);
      const barHeight = (item.count / maxCount) * (h - 35);
      const y = h - barHeight - 20;

      // Barra
      barCtx.fillStyle = idx % 2 === 0 ? '#8b5cf6' : '#ffa04d';
      barCtx.fillRect(x, y, barWidth, barHeight);

      // Etiqueta
      barCtx.fillStyle = '#9f96b8';
      barCtx.font = '10px monospace';
      barCtx.textAlign = 'center';
      barCtx.fillText(item.label, x + barWidth / 2, h - 5);
      barCtx.fillText(item.count.toString(), x + barWidth / 2, y - 4);
    });
  }

  function drawDonutChart() {
    const w = (donutCanvas.width = donutCanvas.parentElement.clientWidth);
    const h = (donutCanvas.height = 180);
    donutCtx.clearRect(0, 0, w, h);

    const total = donutData.reduce(function (a, b) { return a + b; }, 0);
    const centerX = w / 2;
    const centerY = h / 2;
    const radius = 60;
    const innerRadius = 38;
    const colors = ['#10b981', '#f59e0b', '#ef4444'];

    let startAngle = -Math.PI / 2;
    donutData.forEach(function (val, idx) {
      const sliceAngle = (val / total) * 2 * Math.PI;
      donutCtx.beginPath();
      donutCtx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      donutCtx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
      donutCtx.closePath();
      donutCtx.fillStyle = colors[idx];
      donutCtx.fill();
      startAngle += sliceAngle;
    });

    // Texto central
    donutCtx.fillStyle = '#ffffff';
    donutCtx.font = '12px monospace';
    donutCtx.textAlign = 'center';
    donutCtx.fillText(donutData[0] + '% OK', centerX, centerY + 4);
  }

  function drawScatterChart() {
    const w = (scatterCanvas.width = scatterCanvas.parentElement.clientWidth);
    const h = (scatterCanvas.height = 180);
    scatterCtx.clearRect(0, 0, w, h);

    // Ejes
    scatterCtx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
    scatterCtx.strokeRect(20, 10, w - 30, h - 30);

    scatterPoints.forEach(function (pt) {
      const px = 20 + ((pt.x - 20) / 70) * (w - 40);
      const py = (h - 20) - (pt.y / 3.0) * (h - 40);

      scatterCtx.beginPath();
      scatterCtx.arc(px, py, 3.5, 0, Math.PI * 2);
      scatterCtx.fillStyle = pt.y > 2.0 ? '#ef4444' : '#00e5ff';
      scatterCtx.fill();
    });
  }

  function renderAll() {
    drawLineChart();
    drawBarChart();
    drawDonutChart();
    drawScatterChart();
  }

  // Actualización periódica cada 3.5 segundos con nuevos datos simulados
  setInterval(function () {
    if (document.hidden) return;

    // Actualizar serie temporal
    const last = lineData[lineData.length - 1];
    const next = 12.0 + (Math.random() - 0.5) * 0.12;
    lineData.shift();
    lineData.push(parseFloat(next.toFixed(2)));

    // Actualizar conteo aleatorio de fallas
    const randomIdx = Math.floor(Math.random() * barData.length);
    barData[randomIdx].count = Math.max(5, barData[randomIdx].count + (Math.random() > 0.5 ? 1 : -1));

    // Agregar nuevo punto de dispersión
    scatterPoints.shift();
    const temp = 30 + Math.random() * 55;
    const vib = 0.4 + (temp / 60) * Math.random() * 2.2;
    scatterPoints.push({ x: temp, y: vib });

    renderAll();
  }, 3500);

  window.addEventListener('resize', renderAll);
  renderAll();
})();

/* =========================================================
   IIFE 10: CIBERSEGURIDAD EN IOT & REDES EMBEBIDAS
   ========================================================= */
(function initSecurityDemo() {
  const normalBtn = document.getElementById('sec-btn-normal');
  const attackBtn = document.getElementById('sec-btn-attack');
  const mitmBtn = document.getElementById('sec-btn-mitm');

  const trafficStatus = document.getElementById('sec-traffic-status');
  const aiStatus = document.getElementById('sec-ai-status');
  const detectionStatus = document.getElementById('sec-detection-status');
  const alertStatus = document.getElementById('sec-alert-status');
  const logBox = document.getElementById('sec-log-box');

  if (!normalBtn || !attackBtn || !logBox) return;

  function setPipeline(traffic, ai, det, alert, alertClass) {
    if (trafficStatus) trafficStatus.textContent = traffic;
    if (aiStatus) aiStatus.textContent = ai;
    if (detectionStatus) detectionStatus.textContent = det;
    if (alertStatus) {
      alertStatus.textContent = alert;
      alertStatus.className = 'sec-node ' + (alertClass || '');
    }
  }

  function appendLog(msg, color) {
    const div = document.createElement('div');
    div.style.color = color || 'var(--text-muted)';
    div.style.marginBottom = '4px';
    div.textContent = `[${new Date().toTimeString().split(' ')[0]}] ${msg}`;
    logBox.prepend(div);
    if (logBox.children.length > 8) logBox.removeChild(logBox.lastChild);
  }

  normalBtn.addEventListener('click', function () {
    setPipeline('MQTT QoS0 (Normal)', 'Clasificador SVM: 0.02% anom.', 'Sin patrones hostiles', 'ESTADO: SEGURO', 'status-badge normal');
    appendLog('Telemetría de sensores procesada: 142 paquetes/s. Verificación de checksum CRC32 OK.', '#34d399');
  });

  attackBtn.addEventListener('click', function () {
    setPipeline('Broker Inundado (DDoS)', 'Modelo RNN: Tráfico anómalo', 'Patrón SYN Flood / CoAP', '¡ALERTA CRÍTICA!', 'status-badge danger');
    appendLog('¡ATAQUE DETECTADO! 4,800 req/s desde 3 IPs spoofeadas. Activando rate-limiting en firewall de borde.', '#f87171');
  });

  if (mitmBtn) {
    mitmBtn.addEventListener('click', function () {
      setPipeline('Inyección de Trama CAN', 'Autoencoder: Desviación > 3σ', 'ID de arbitraje adulterado', 'INTRUSIÓN AISLADA', 'status-badge warning');
      appendLog('Advertencia: Paquete CAN 0x1A4 duplicado sin firma digital. Nodo transmisor puesto en cuarentena.', '#fbbf24');
    });
  }
})();

/* =========================================================
   IIFE 11: TERMINAL SIMULADA CYBERPUNK
   ========================================================= */
(function initSimulatedTerminal() {
  const input = document.getElementById('term-input');
  const output = document.getElementById('term-output');

  if (!input || !output) return;

  const commandHistory = [];
  let historyIndex = -1;

  const commands = {
    help: `Comandos disponibles en NeuroCircuit Lab:
  - ai.status       : Estado del motor de inferencia neuronal en borde
  - ml.models       : Modelos de aprendizaje automático entrenados
  - data.analyze    : Análisis estadístico de lecturas de sensores
  - neural.network  : Topología de la red neuronal activa y función de pérdida
  - security.scan   : Escaneo de vulnerabilidades en nodos IoT
  - system.info     : Parámetros del sistema embebido y firmware
  - sensor.read     : Lectura instantánea de transductores I2C/SPI
  - about           : Datos del autor y perfil académico
  - clear           : Limpiar la pantalla de la terminal`,

    'ai.status': `[AI INFERENCE CORE - ACTIVO]
  - Motor de ejecución: Tensor Micro Embedded v2.4
  - Latencia media de inferencia: 2.14 ms
  - Acelerador hardware: Instrucciones SIMD / FPU DSP activadas
  - Estado de memoria Tensor Arena: 14.8 KB / 32.0 KB asignada
  - Precisión de cuantización: INT8 calibrado por entropía KL`,

    'ml.models': `[MODELOS ENTRENADOS EN LABORATORIO]
  1. RandomForest_Failures_v2   | F1-Score: 0.984 | Aplicado a: MOSFETs y PWM
  2. CNN1D_Audio_Anomaly        | F1-Score: 0.971 | Aplicado a: Rodamientos
  3. KMeans_PowerProfiling      | K = 3 Clústeres | Aplicado a: Redes IoT
  4. Kalman_PredictiveFilter    | Adaptativo      | Aplicado a: IMU 6-DOF`,

    'data.analyze': `[RESUMEN DE TELEMETRÍA - 10,000 MUESTRAS]
  - Tensión media Vbus: 12.04 V (Desviación típica: 0.06 V)
  - Temperatura de juntura Tj: 48.2 °C (Máx: 64.1 °C)
  - Relación Señal-Ruido (SNR): 28.6 dB
  - Tasa de pérdida de paquetes en bus CAN: 0.003%`,

    'neural.network': `[TOPOLOGÍA RED NEURONAL MLP]
  - Capa de Entrada   : 3 neuronas (V, I, Temp)
  - Capas Ocultas     : 2 capas densas (8 neuronas c/u, ReLU)
  - Capa de Salida    : 2 neuronas (Probabilidad de falla, Softmax)
  - Función de pérdida: Categorical Cross-Entropy (0.0412)
  - Optimizador       : Adam (Learning Rate = 0.001)`,

    'security.scan': `[ESCANEO DE SEGURIDAD EN RED LOCAL IoT]
  - Nodo 01 (ESP32_Gateway) : Puerto 8883 (MQTTS con TLS 1.3) [SEGURO]
  - Nodo 02 (STM32_Sensor)  : Bus SPI aislado [SEGURO]
  - Nodo 03 (RPi_EdgeNode)  : SSH Key-Only [SEGURO]
  - Estado del cortafuegos  : 0 intrusiones activas detectadas`,

    'system.info': `[SISTEMA EMBEBIDO SIMULADO]
  - Plataforma: Arquitectura ARM Cortex-M4 @ 168 MHz
  - Sistema Operativo: FreeRTOS v10.4.3 (Kernel de tiempo real)
  - Conectividad: Wi-Fi 802.11 b/g/n + BLE 5.0 + Bus CAN 2.0B
  - Consumo de corriente en reposo: 42 µA (Modo Deep Sleep)`,

    'sensor.read': `[LECTURA INSTANTÁNEA DE BANCO DE SENSORES]
  - BME280  (I2C 0x76) : Temp = 22.8 °C | Hum = 48.4 % | Pres = 1013.2 hPa
  - MPU6050 (I2C 0x68) : AccX = 0.02 g  | AccY = -0.01 g | AccZ = 0.99 g
  - INA219  (I2C 0x40) : Vbus = 12.03 V | Corriente = 345 mA | Potencia = 4.15 W
  - Termopar K + MAX6675: Temp_Juntura = 74.2 °C`,

    about: `======================================================
AUTOR: Santo Miguel Coria Suma
Ingeniero Electrónico - UPEA (Universidad Pública de El Alto)
Estudiante de Maestría en Inteligencia Artificial,
Machine Learning y Data Science.
Contacto: miguelstcors.etn@gmail.com
======================================================`,

    clear: 'CLEAR'
  };

  function printLine(text, isCommand) {
    const line = document.createElement('div');
    line.className = 'term-output-line';
    if (isCommand) {
      line.style.color = 'var(--accent-orange)';
      line.textContent = 'neurocircuit@lab:~$ ' + text;
    } else {
      line.textContent = text;
    }
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      const rawCmd = input.value.trim();
      if (!rawCmd) return;

      commandHistory.push(rawCmd);
      historyIndex = commandHistory.length;

      printLine(rawCmd, true);
      input.value = '';

      const cmdLower = rawCmd.toLowerCase();
      if (cmdLower === 'clear') {
        output.innerHTML = '';
        return;
      }

      if (commands[cmdLower]) {
        printLine(commands[cmdLower], false);
      } else {
        printLine(`Comando no reconocido: "${rawCmd}". Escribe "help" para ver la lista de comandos disponibles.`, false);
      }
    } else if (e.key === 'ArrowUp') {
      if (historyIndex > 0) {
        historyIndex--;
        input.value = commandHistory[historyIndex];
      }
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        input.value = commandHistory[historyIndex];
      } else {
        historyIndex = commandHistory.length;
        input.value = '';
      }
      e.preventDefault();
    }
  });
})();

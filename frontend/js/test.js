/* ═══════════════════════════════════════════════════════════════════════════
   TEST.JS - Lógica del Test tipo Cisco
   Cronómetro | Navegación | Respuestas | Resultados
═══════════════════════════════════════════════════════════════════════════ */

// ── Banco de preguntas (por ahora ejemplos) ──
const preguntas = [
  {
    id: 1,
    texto: "¿Cuál es el protocolo de capa 3 (Red) de TCP/IP?",
    dificultad: "Básico",
    opciones: [
      { letra: "A", texto: "TCP", correcta: false },
      { letra: "B", texto: "IP (Internet Protocol)", correcta: true },
      { letra: "C", texto: "UDP", correcta: false },
      { letra: "D", texto: "Ethernet", correcta: false }
    ]
  },
  {
    id: 2,
    texto: "¿Qué significa CIDR en redes?",
    dificultad: "Intermedio",
    opciones: [
      { letra: "A", texto: "Classless Inter-Domain Routing", correcta: true },
      { letra: "B", texto: "Central Internet Device Routing", correcta: false },
      { letra: "C", texto: "Cisco Internet Distributed Router", correcta: false },
      { letra: "D", texto: "Computer Internal Domain Reference", correcta: false }
    ]
  },
  {
    id: 3,
    texto: "¿Cuál es el rango de puertos privados según IANA?",
    dificultad: "Básico",
    opciones: [
      { letra: "A", texto: "0 a 1023", correcta: false },
      { letra: "B", texto: "1024 a 49151", correcta: true },
      { letra: "C", texto: "49152 a 65535", correcta: false },
      { letra: "D", texto: "Todos los anteriores", correcta: false }
    ]
  },
  {
    id: 4,
    texto: "¿Qué protocolo utiliza el puerto 443 por defecto?",
    dificultad: "Básico",
    opciones: [
      { letra: "A", texto: "HTTP", correcta: false },
      { letra: "B", texto: "HTTPS", correcta: true },
      { letra: "C", texto: "FTP", correcta: false },
      { letra: "D", texto: "SMTP", correcta: false }
    ]
  },
  {
    id: 5,
    texto: "¿Cuál es la máscara de subred para una red /24?",
    dificultad: "Intermedio",
    opciones: [
      { letra: "A", texto: "255.255.255.0", correcta: true },
      { letra: "B", texto: "255.255.0.0", correcta: false },
      { letra: "C", texto: "255.0.0.0", correcta: false },
      { letra: "D", texto: "255.255.255.128", correcta: false }
    ]
  },
  {
    id: 6,
    texto: "¿Qué comando se utiliza para probar conectividad en Windows?",
    dificultad: "Básico",
    opciones: [
      { letra: "A", texto: "tracert", correcta: false },
      { letra: "B", texto: "ping", correcta: true },
      { letra: "C", texto: "nslookup", correcta: false },
      { letra: "D", texto: "ipconfig /release", correcta: false }
    ]
  },
  {
    id: 7,
    texto: "¿Cuál es la dirección de broadcast para 192.168.1.0/24?",
    dificultad: "Intermedio",
    opciones: [
      { letra: "A", texto: "192.168.1.1", correcta: false },
      { letra: "B", texto: "192.168.1.254", correcta: false },
      { letra: "C", texto: "192.168.1.255", correcta: true },
      { letra: "D", texto: "192.168.2.0", correcta: false }
    ]
  },
  {
    id: 8,
    texto: "¿Qué protocolo de capa 2 se utiliza para resolver direcciones IP?",
    dificultad: "Avanzado",
    opciones: [
      { letra: "A", texto: "ICMP", correcta: false },
      { letra: "B", texto: "ARP (Address Resolution Protocol)", correcta: true },
      { letra: "C", texto: "IGMP", correcta: false },
      { letra: "D", texto: "DHCP", correcta: false }
    ]
  },
  {
    id: 9,
    texto: "¿Cuál es el número máximo de hosts en una subred /25?",
    dificultad: "Avanzado",
    opciones: [
      { letra: "A", texto: "128", correcta: false },
      { letra: "B", texto: "126", correcta: true },
      { letra: "C", texto: "254", correcta: false },
      { letra: "D", texto: "256", correcta: false }
    ]
  },
  {
    id: 10,
    texto: "¿Qué es un gateway por defecto?",
    dificultad: "Intermedio",
    opciones: [
      { letra: "A", texto: "El router que conecta a Internet", correcta: true },
      { letra: "B", texto: "La dirección IP del servidor DNS", correcta: false },
      { letra: "C", texto: "El puerto de acceso a la red", correcta: false },
      { letra: "D", texto: "La puerta del cortafuegos", correcta: false }
    ]
  }
];

// ── Estado del test ──
const estado = {
  preguntaActual: 0,
  respuestas: [], // Array de indices de respuestas seleccionadas
  respondidas: 0,
  correctas: 0,
  incorrectas: 0,
  tiempoInicio: null,
  tiempoTranscurrido: 0,
  cronometroId: null,
  testCompletado: false
};

// ── Inicialización ──
document.addEventListener('DOMContentLoaded', () => {
  inicializarTest();
  cargarPregunta();
  iniciarCronometro();
  generarIndicadores();
});

function inicializarTest() {
  // Inicializar array de respuestas
  estado.respuestas = new Array(preguntas.length).fill(null);
  estado.tiempoInicio = Date.now();
}

function iniciarCronometro() {
  estado.cronometroId = setInterval(() => {
    estado.tiempoTranscurrido = Math.floor((Date.now() - estado.tiempoInicio) / 1000);
    actualizarCronometro();
  }, 100);
}

function actualizarCronometro() {
  const minutos = Math.floor(estado.tiempoTranscurrido / 60);
  const segundos = estado.tiempoTranscurrido % 60;
  const timerDisplay = document.getElementById('timerDisplay');
  timerDisplay.textContent = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

function cargarPregunta() {
  const pregunta = preguntas[estado.preguntaActual];
  const container = document.getElementById('optionsContainer');

  // Actualizar pregunta
  document.getElementById('questionText').textContent = pregunta.texto;
  document.getElementById('questionNum').textContent = `Pregunta ${estado.preguntaActual + 1} de ${preguntas.length}`;
  document.getElementById('difficultyBadge').textContent = pregunta.dificultad;

  // Limpiar opciones
  container.innerHTML = '';

  // Cargar opciones
  pregunta.opciones.forEach((opcion, index) => {
    const optionDiv = document.createElement('div');
    optionDiv.className = 'option';
    optionDiv.innerHTML = `
      <div class="option-letter">${opcion.letra}</div>
      <div class="option-text">${opcion.texto}</div>
    `;

    // Si ya tiene respuesta seleccionada
    if (estado.respuestas[estado.preguntaActual] === index) {
      optionDiv.classList.add('selected');
    }

    // Si el test está completado, mostrar respuesta correcta/incorrecta
    if (estado.testCompletado) {
      optionDiv.classList.add('answered');
      if (opcion.correcta) {
        optionDiv.classList.add('correct');
      } else if (estado.respuestas[estado.preguntaActual] === index) {
        optionDiv.classList.add('incorrect');
      }
      optionDiv.style.cursor = 'default';
    } else {
      // Click para seleccionar
      optionDiv.addEventListener('click', () => seleccionarRespuesta(index));
    }

    container.appendChild(optionDiv);
  });

  // Actualizar barra de progreso
  const porcentaje = ((estado.preguntaActual + 1) / preguntas.length) * 100;
  document.getElementById('progressFill').style.width = porcentaje + '%';
  document.getElementById('progressSmall').textContent = `${estado.preguntaActual + 1} / ${preguntas.length}`;

  // Actualizar botones de navegación
  document.getElementById('btnPrev').disabled = estado.preguntaActual === 0;
  document.getElementById('btnNext').disabled = estado.preguntaActual === preguntas.length - 1;

  // Actualizar indicador activo
  actualizarIndicadores();
}

function seleccionarRespuesta(index) {
  const pregunta = preguntas[estado.preguntaActual];
  const yaRespondida = estado.respuestas[estado.preguntaActual] !== null;

  // Si ya había respuesta, restar del contador
  if (yaRespondida) {
    const respuestaAnterior = estado.respuestas[estado.preguntaActual];
    if (pregunta.opciones[respuestaAnterior].correcta) {
      estado.correctas--;
    } else {
      estado.incorrectas--;
    }
  } else {
    // Primera respuesta a esta pregunta
    estado.respondidas++;
  }

  // Nueva respuesta
  estado.respuestas[estado.preguntaActual] = index;

  if (pregunta.opciones[index].correcta) {
    estado.correctas++;
  } else {
    estado.incorrectas++;
  }

  // Actualizar UI
  cargarPregunta();
  actualizarEstadisticas();
}

function generarIndicadores() {
  const container = document.getElementById('questionIndicator');
  container.innerHTML = '';

  preguntas.forEach((_, index) => {
    const btn = document.createElement('button');
    btn.className = 'q-indicator-btn';
    btn.textContent = index + 1;

    if (index === estado.preguntaActual) {
      btn.classList.add('current');
    }

    if (estado.respuestas[index] !== null) {
      btn.classList.add('answered');
    }

    btn.addEventListener('click', () => {
      estado.preguntaActual = index;
      cargarPregunta();
    });

    container.appendChild(btn);
  });
}

function actualizarIndicadores() {
  document.querySelectorAll('.q-indicator-btn').forEach((btn, index) => {
    btn.classList.remove('current');
    if (index === estado.preguntaActual) {
      btn.classList.add('current');
    }
  });
}

function actualizarEstadisticas() {
  document.getElementById('answered').textContent = estado.respondidas;
  document.getElementById('remaining').textContent = preguntas.length - estado.respondidas;
  document.getElementById('correct').textContent = estado.correctas;
  document.getElementById('incorrect').textContent = estado.incorrectas;
}

// ── Navegación ──
document.getElementById('btnPrev').addEventListener('click', () => {
  if (estado.preguntaActual > 0) {
    estado.preguntaActual--;
    cargarPregunta();
  }
});

document.getElementById('btnNext').addEventListener('click', () => {
  if (estado.preguntaActual < preguntas.length - 1) {
    estado.preguntaActual++;
    cargarPregunta();
  }
});

// ── Enviar test ──
document.getElementById('btnSubmit').addEventListener('click', () => {
  if (estado.respondidas === preguntas.length) {
    completarTest();
  } else {
    mostrarToast(`Aún faltan ${preguntas.length - estado.respondidas} preguntas por responder`);
  }
});

function completarTest() {
  estado.testCompletado = true;
  clearInterval(estado.cronometroId);

  // Recargar todas las preguntas en modo visualización
  cargarPregunta();

  // Mostrar modal de resultados
  const porcentaje = Math.round((estado.correctas / preguntas.length) * 100);

  document.getElementById('resultScore').textContent = `${estado.correctas}/${preguntas.length}`;
  document.getElementById('resultCorrect').textContent = estado.correctas;
  document.getElementById('resultIncorrect').textContent = estado.incorrectas;
  document.getElementById('resultPercentage').textContent = `${porcentaje}%`;

  const minutos = Math.floor(estado.tiempoTranscurrido / 60);
  const segundos = estado.tiempoTranscurrido % 60;
  document.getElementById('resultTime').textContent = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;

  abrirModal('modalResult');

  // Ocultar botones de navegación
  document.getElementById('btnPrev').style.display = 'none';
  document.getElementById('btnNext').style.display = 'none';
  document.getElementById('btnSubmit').style.display = 'none';
}

// ── Salir del test ──
document.getElementById('btnExit').addEventListener('click', () => {
  abrirModal('modalExitConfirm');
});

document.getElementById('btnConfirmCancel').addEventListener('click', () => {
  cerrarModal('modalExitConfirm');
});

document.getElementById('btnConfirmExit').addEventListener('click', () => {
  clearInterval(estado.cronometroId);
  window.location.href = 'dashboard.html';
});

// ── Modal de resultados ──
document.getElementById('btnRetry').addEventListener('click', () => {
  location.reload();
});

document.getElementById('btnBackDashboard').addEventListener('click', () => {
  window.location.href = 'dashboard.html';
});

// ── Utilidades ──
function abrirModal(id) {
  document.getElementById(id).classList.add('active');
}

function cerrarModal(id) {
  document.getElementById(id).classList.remove('active');
}

function mostrarToast(msg) {
  // Crear toast si no existe
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(21, 83, 168, 0.95);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 6px;
      border: 1px solid #6B9DE8;
      z-index: 999;
      display: none;
      animation: slideUp 0.3s ease;
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = msg;
  toast.style.display = 'block';

  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

// ── Cerrar modales al hacer clic fuera ──
document.getElementById('modalExitConfirm').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    cerrarModal('modalExitConfirm');
  }
});

document.getElementById('modalResult').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    // No permitir cerrar modal de resultados haciendo clic afuera
  }
});

// ── Teclas de atajo ──
document.addEventListener('keydown', (e) => {
  if (estado.testCompletado) return;

  if (e.key === 'ArrowLeft' && estado.preguntaActual > 0) {
    estado.preguntaActual--;
    cargarPregunta();
  } else if (e.key === 'ArrowRight' && estado.preguntaActual < preguntas.length - 1) {
    estado.preguntaActual++;
    cargarPregunta();
  }
});

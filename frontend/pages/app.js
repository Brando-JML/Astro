/* ═══════════════════════════════════════════════
   app.js — Dashboard Estudio
   Métodos: cambiarNombre, cambiarCorreo,
            cambiarUniversidad, cambiarFotografia,
            confirmarCambios, guardarPerfil
═══════════════════════════════════════════════ */

// ── Estado global del perfil ──────────────────
const perfil = {
  nombre:       'Usuario',
  correo:       'usuario@correo.com',
  universidad:  'UNAM',
  uniCompleto:  'Universidad Nacional Autónoma de México',
  uniImage:     'UNAM.png',
  fotoBase64:   null,   // null = usa iniciales
};

// Copia temporal mientras el usuario edita (antes de confirmar)
let perfilPendiente = {};

// ── Referencias al DOM ────────────────────────
const dom = {
  // topbar
  displayName:     () => document.getElementById('displayName'),
  displayEmail:    () => document.getElementById('displayEmail'),
  greetingName:    () => document.getElementById('greetingName'),
  avatarInitials:  () => document.getElementById('avatarInitials'),
  avatarPhoto:     () => document.getElementById('avatarPhoto'),

  // uni panel
  uniLogo:  () => document.getElementById('uniLogo'),
  uniName:  () => document.getElementById('uniName'),
  uniSub:   () => document.getElementById('uniSub'),

  // modal ajustes
  modalAjustes:    () => document.getElementById('modalAjustes'),
  inputNombre:     () => document.getElementById('inputNombre'),
  inputCorreo:     () => document.getElementById('inputCorreo'),
  inputUniversidad:() => document.getElementById('inputUniversidad'),
  inputFoto:       () => document.getElementById('inputFoto'),
  previewInitials: () => document.getElementById('previewInitials'),
  previewPhoto:    () => document.getElementById('previewPhoto'),

  // modal confirmación
  modalConfirm:    () => document.getElementById('modalConfirm'),
  confirmChanges:  () => document.getElementById('confirmChanges'),

  // toast
  toast:           () => document.getElementById('toast'),
};

// ════════════════════════════════════════════════
//  MÉTODOS PRINCIPALES
// ════════════════════════════════════════════════

/**
 * Actualiza el nombre de usuario en el perfil y en el DOM.
 * @param {string} nombre - Nuevo nombre de usuario.
 */
function cambiarNombre(nombre) {
  const n = nombre.trim();
  if (!n) return;
  perfil.nombre = n;
  dom.displayName().textContent  = n;
  dom.greetingName().textContent = n;
  actualizarIniciales(n);
}

/**
 * Actualiza el correo electrónico en el perfil y en el DOM.
 * @param {string} correo - Nuevo correo electrónico.
 */
function cambiarCorreo(correo) {
  const c = correo.trim();
  if (!c) return;
  perfil.correo = c;
  dom.displayEmail().textContent = c;
}

/**
 * Actualiza la universidad seleccionada.
 * @param {string} valor - "SIGLA|Nombre completo|Imagen" (value del <select>).
 */
function cambiarUniversidad(valor) {
  if (!valor) return;
  const [sigla, completo, imagen] = valor.split('|');
  perfil.universidad = sigla;
  perfil.uniCompleto = completo;
  perfil.uniImage = imagen;
  dom.uniLogo().textContent = sigla;
  dom.uniName().textContent = sigla;
  dom.uniSub().textContent  = completo;
  renderizarUniversidades();
}

/**
 * Actualiza la fotografía de perfil desde un Base64.
 * @param {string|null} base64 - Imagen en base64, o null para eliminar.
 */
function cambiarFotografia(base64) {
  perfil.fotoBase64 = base64;

  // Topbar
  const foto = dom.avatarPhoto();
  if (base64) {
    foto.src = base64;
    foto.classList.add('visible');
  } else {
    foto.src = '';
    foto.classList.remove('visible');
  }
}

/**
 * Construye la lista de cambios detectados comparando
 * perfilPendiente con perfil actual. Devuelve array de objetos.
 */
function detectarCambios() {
  const cambios = [];

  if (perfilPendiente.nombre !== undefined &&
      perfilPendiente.nombre !== perfil.nombre)
    cambios.push({ key: 'Nombre', val: perfilPendiente.nombre });

  if (perfilPendiente.correo !== undefined &&
      perfilPendiente.correo !== perfil.correo)
    cambios.push({ key: 'Correo', val: perfilPendiente.correo });

  if (perfilPendiente.universidad !== undefined &&
      perfilPendiente.universidad !== perfil.universidad)
    cambios.push({ key: 'Universidad', val: perfilPendiente.universidad });

  if (perfilPendiente.fotoBase64 !== undefined &&
      perfilPendiente.fotoBase64 !== perfil.fotoBase64)
    cambios.push({
      key: 'Foto',
      val: perfilPendiente.fotoBase64 ? 'Nueva imagen cargada' : 'Eliminada',
    });

  return cambios;
}

/**
 * Muestra el modal de confirmación con los cambios detectados.
 * Si no hay cambios, muestra un toast informativo.
 */
function confirmarCambios() {
  const cambios = detectarCambios();

  if (cambios.length === 0) {
    mostrarToast('Sin cambios que guardar.');
    return;
  }

  // Renderizar la lista de cambios en el modal
  const container = dom.confirmChanges();
  container.innerHTML = cambios
    .map(c => `
      <div class="change-row">
        <span class="change-key">${c.key}</span>
        <span class="change-val">${c.val}</span>
      </div>`)
    .join('');

  cerrarModal('modalAjustes');
  abrirModal('modalConfirm');
}

/**
 * Aplica todos los cambios pendientes al perfil y actualiza el DOM.
 * Llamado cuando el usuario acepta en el modal de confirmación.
 */
function guardarPerfil() {
  const cambios = detectarCambios();
  if (cambios.length === 0) return;

  // Aplicar cada cambio
  if (perfilPendiente.nombre !== undefined &&
      perfilPendiente.nombre !== perfil.nombre)
    cambiarNombre(perfilPendiente.nombre);

  if (perfilPendiente.correo !== undefined &&
      perfilPendiente.correo !== perfil.correo)
    cambiarCorreo(perfilPendiente.correo);

  if (perfilPendiente.universidad !== undefined &&
      perfilPendiente.universidad !== perfil.universidad)
    cambiarUniversidad(perfilPendiente.universidad);

  if (perfilPendiente.fotoBase64 !== undefined &&
      perfilPendiente.fotoBase64 !== perfil.fotoBase64) {
    cambiarFotografia(perfilPendiente.fotoBase64);
    // Sincronizar también el preview del modal
    sincronizarPreviewFoto(perfilPendiente.fotoBase64);
  }

  cerrarModal('modalConfirm');
  mostrarToast('✓ Cambios guardados correctamente');

  // Limpiar pendiente
  perfilPendiente = {};
}

// ════════════════════════════════════════════════
//  HELPERS UI
// ════════════════════════════════════════════════

function actualizarIniciales(nombre) {
  const palabras = nombre.trim().split(/\s+/);
  const iniciales = palabras.length >= 2
    ? (palabras[0][0] + palabras[1][0]).toUpperCase()
    : nombre.substring(0, 2).toUpperCase();

  document.querySelectorAll('.avatar-initials').forEach(el => {
    el.textContent = iniciales;
  });
}

function sincronizarPreviewFoto(base64) {
  const prev = dom.previewPhoto();
  if (base64) {
    prev.src = base64;
    prev.classList.add('visible');
  } else {
    prev.src = '';
    prev.classList.remove('visible');
  }
}

function abrirModal(id) {
  document.getElementById(id).classList.add('open');
}
function cerrarModal(id) {
  document.getElementById(id).classList.remove('open');
}

let toastTimer = null;
function mostrarToast(msg) {
  const t = dom.toast();
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ── Pre-rellenar el modal con los valores actuales ──
function abrirModalAjustes() {
  dom.inputNombre().value      = perfil.nombre;
  dom.inputCorreo().value      = perfil.correo;

  // Seleccionar la opción correcta en el <select>
  const sel = dom.inputUniversidad();
  Array.from(sel.options).forEach(opt => {
    if (opt.value.startsWith(perfil.universidad + '|')) {
      sel.value = opt.value;
    }
  });

  // Sincronizar preview de foto
  sincronizarPreviewFoto(perfil.fotoBase64);

  // Resetear pendiente
  perfilPendiente = {};

  abrirModal('modalAjustes');
}

// ════════════════════════════════════════════════
//  TEMAS (datos de ejemplo)
// ════════════════════════════════════════════════
const temas = [
  { nombre: 'Matemáticas', pct: 82, nivel: 'high' },
  { nombre: 'Español',     pct: 67, nivel: 'mid'  },
  { nombre: 'Historia',    pct: 45, nivel: 'low'  },
  { nombre: 'Ciencias',    pct: 71, nivel: 'mid'  },
  { nombre: 'Geografía',   pct: 38, nivel: 'low'  },
];

function renderizarTemas() {
  const lista = document.getElementById('temaList');
  const badge = document.getElementById('temasBadge');

  lista.innerHTML = temas
    .map(t => `
      <div class="tema-item">
        <span class="tema-name">${t.nombre}</span>
        <div class="tema-bar-wrap">
          <div class="tema-bar ${t.nivel}" style="width:${t.pct}%"></div>
        </div>
        <span class="tema-pct">${t.pct}%</span>
      </div>`)
    .join('');

  badge.textContent = `${temas.length} activos`;
}

// ════════════════════════════════════════════════
//  UNIVERSIDADES - Renderizar con imagen
// ════════════════════════════════════════════════

function renderizarUniversidades() {
  const lista = document.getElementById('universidadesList');
  if (!lista) return;

  const imagenPath = `../assets/images/${perfil.uniImage}`;
  
  lista.innerHTML = `
    <div class="universidad-item">
      <div class="uni-item-image">
        <img src="${imagenPath}" alt="${perfil.uniCompleto}" onerror="this.src='https://via.placeholder.com/150x100?text=${perfil.universidad}'">
      </div>
      <div class="uni-item-content">
        <h4 class="uni-item-name">${perfil.uniCompleto}</h4>
        <p class="uni-item-code">Código: ${perfil.universidad}</p>
      </div>
    </div>
  `;
}

// ════════════════════════════════════════════════
//  EVENTS
// ════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {

  // Cargar datos del usuario desde localStorage
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    const user = JSON.parse(currentUser);
    perfil.nombre = user.name;
    perfil.correo = user.email;
    perfil.universidad = user.university;
    perfil.uniCompleto = user.universityName;
    perfil.uniImage = user.universityImage;
  }

  // Actualizar datos en la UI
  dom.displayName().textContent  = perfil.nombre;
  dom.displayEmail().textContent = perfil.correo;
  dom.greetingName().textContent = perfil.nombre;
  dom.uniLogo().textContent      = perfil.universidad;
  dom.uniName().textContent      = perfil.universidad;
  dom.uniSub().textContent       = perfil.uniCompleto;

  // Actualizar iniciales del avatar
  actualizarIniciales(perfil.nombre);

  renderizarTemas();
  renderizarUniversidades();

  // ── Modal Ajustes ────
  document.getElementById('btnAjustes').addEventListener('click', abrirModalAjustes);
  document.getElementById('modalClose').addEventListener('click', () => cerrarModal('modalAjustes'));
  document.getElementById('btnCancelar').addEventListener('click', () => cerrarModal('modalAjustes'));
  document.getElementById('btnGuardar').addEventListener('click', confirmarCambios);

  // ── Modal Confirmación ────
  document.getElementById('btnConfirmCancel').addEventListener('click', () => cerrarModal('modalConfirm'));
  document.getElementById('btnConfirmOk').addEventListener('click', guardarPerfil);

  // ── Cambiar Universidad ────
  document.getElementById('btnCambiarUni')?.addEventListener('click', abrirModalAjustes);

  // ── Capturar cambios en los inputs ────
  dom.inputNombre().addEventListener('change', (e) => {
    perfilPendiente.nombre = e.target.value;
  });

  dom.inputCorreo().addEventListener('change', (e) => {
    perfilPendiente.correo = e.target.value;
  });

  dom.inputUniversidad().addEventListener('change', (e) => {
    perfilPendiente.universidad = e.target.value;
  });

  // ── Foto ────
  dom.inputFoto().addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const base64 = evt.target.result;
        perfilPendiente.fotoBase64 = base64;
        sincronizarPreviewFoto(base64);
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('btnRemovePhoto')?.addEventListener('click', () => {
    perfilPendiente.fotoBase64 = null;
    sincronizarPreviewFoto(null);
    dom.inputFoto().value = '';
  });

  // ── Cerrar modales al hacer click afuera ────
  [dom.modalAjustes(), dom.modalConfirm()].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          cerrarModal(modal.id);
        }
      });
    }
  });

  console.log('Dashboard initialized successfully');
});

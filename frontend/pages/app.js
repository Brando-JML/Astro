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
  profileImage: null,   // nombre de imagen en user_icons/
  fotoBase64:   null,   // null = usa iniciales (deprecado)
};

// ── Imágenes disponibles ──────────────────────
const imagenesPerfil = [
  'ahri.jpg', 'aurelio_sol.jpg', 'cepibolla.jpeg', 'diku.jpg', 'ekko.jpg',
  'gato1.jpg', 'gato2.jpg', 'gato_gojo.jpg', 'gato_maid.jpg', 'gato_pasto.jpg',
  'godman.jpg', 'jolunai.jpg', 'kirbo.jpg', 'kirby.jpeg', 'lisandra.jpg',
  'meowl.jpg', 'mimikiu.jpg', 'reze.jpg', 'silly.jpg', 'tresh.jpg'
];

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
  previewInitials: () => document.getElementById('previewInitials'),
  previewPhoto:    () => document.getElementById('previewPhoto'),

  // modal galería
  modalGallery:    () => document.getElementById('modalGallery'),
  galleryGrid:     () => document.getElementById('galleryGrid'),

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
 * Actualiza la fotografía de perfil desde el nombre de imagen.
 * @param {string|null} imageName - Nombre del archivo de imagen, o null para eliminar.
 */
function cambiarFotografia(imageName) {
  perfil.profileImage = imageName;

  // Topbar
  const foto = dom.avatarPhoto();
  if (imageName) {
    foto.src = `../assets/user_icons/${imageName}`;
    foto.classList.add('visible');
    // Ocultar iniciales cuando hay imagen
    document.querySelectorAll('.avatar-initials').forEach(el => {
      el.classList.add('hidden');
    });
  } else {
    foto.src = '';
    foto.classList.remove('visible');
    // Mostrar iniciales cuando NO hay imagen
    document.querySelectorAll('.avatar-initials').forEach(el => {
      el.classList.remove('hidden');
    });
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

  if (perfilPendiente.profileImage !== undefined &&
      perfilPendiente.profileImage !== perfil.profileImage)
    cambios.push({
      key: 'Foto',
      val: perfilPendiente.profileImage ? 'Imagen seleccionada' : 'Eliminada',
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

  if (perfilPendiente.profileImage !== undefined &&
      perfilPendiente.profileImage !== perfil.profileImage) {
    cambiarFotografia(perfilPendiente.profileImage);
    sincronizarPreviewFoto(perfilPendiente.profileImage);
  }

  cerrarModal('modalConfirm');
  mostrarToast('✓ Cambios guardados correctamente');

  // Persistir para que no se pierdan cambios al recargar dashboard
  guardarUsuarioEnLocalStorage();
  
  // Guardar en Firebase
  guardarPerfilEnFirebase();

  // Limpiar pendiente
  perfilPendiente = {};
}

// ════════════════════════════════════════════════
//  HELPERS UI
// ════════════════════════════════════════════════

function actualizarIniciales(nombre) {
  const nombreSeguro = typeof nombre === 'string' ? nombre.trim() : '';
  const palabras = nombreSeguro ? nombreSeguro.split(/\s+/) : [];
  const iniciales = palabras.length >= 2
    ? (palabras[0][0] + palabras[1][0]).toUpperCase()
    : (nombreSeguro.substring(0, 2).toUpperCase() || 'US');

  document.querySelectorAll('.avatar-initials').forEach(el => {
    el.textContent = iniciales;
  });
}

function sincronizarPreviewFoto(imageName) {
  const prev = dom.previewPhoto();
  if (imageName) {
    prev.src = `../assets/user_icons/${imageName}`;
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

function obtenerPartesNombre(nombreCompleto) {
  const tokens = String(nombreCompleto || '').trim().split(/\s+/).filter(Boolean);
  const firstName = tokens.shift() || '';
  const lastName = tokens.join(' ');
  return { firstName, lastName };
}

function guardarUsuarioEnLocalStorage() {
  const { firstName, lastName } = obtenerPartesNombre(perfil.nombre);
  const userData = {
    name: perfil.nombre,
    email: perfil.correo,
    university: perfil.universidad,
    universityName: perfil.uniCompleto,
    universityImage: perfil.uniImage,
    profileImage: perfil.profileImage,
    firstName,
    lastName,
  };

  localStorage.setItem('currentUser', JSON.stringify(userData));
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
  sincronizarPreviewFoto(perfil.profileImage);

  // Resetear pendiente
  perfilPendiente = {};

  // Renderizar galería
  renderizarGaleria();

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

function renderizarGaleria() {
  const grid = dom.galleryGrid();
  if (!grid) return;

  grid.innerHTML = imagenesPerfil
    .map(img => `
      <div class="gallery-item ${perfil.profileImage === img ? 'selected' : ''}" data-image="${img}">
        <img src="../assets/user_icons/${img}" alt="${img}" />
        <div class="gallery-item-overlay">
          <svg viewBox="0 0 24 24" fill="currentColor" class="gallery-checkmark">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        </div>
      </div>
    `)
    .join('');

  // Agregar event listeners a cada imagen
  grid.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const imageName = item.dataset.image;
      seleccionarImagen(imageName);
    });
  });
}

function seleccionarImagen(imageName) {
  // Marcar la imagen como seleccionada en perfilPendiente
  perfilPendiente.profileImage = imageName;
  
  // Actualizar preview en el modal de ajustes
  sincronizarPreviewFoto(imageName);
  
  // Actualizar visual de la galería
  const grid = dom.galleryGrid();
  if (grid) {
    grid.querySelectorAll('.gallery-item').forEach(item => {
      item.classList.remove('selected');
    });
    grid.querySelector(`[data-image="${imageName}"]`)?.classList.add('selected');
  }
  
  // Cerrar modal de galería
  cerrarModal('modalGallery');
}

async function guardarPerfilEnFirebase() {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.warn('No userId found, skipping Firebase save');
      return;
    }

    const updates = {
      name: perfil.nombre,
      email: perfil.correo,
      university: perfil.universidad,
      universityName: perfil.uniCompleto,
      universityImage: perfil.uniImage,
      profileImage: perfil.profileImage,
      updatedAt: new Date().toISOString()
    };

    const result = await updateUserProfile(userId, updates);
    if (result.success) {
      console.log('Perfil guardado en Firebase correctamente');
    } else {
      console.error('Error al guardar en Firebase:', result.error);
    }
  } catch (error) {
    console.error('Error en guardarPerfilEnFirebase:', error);
  }
}

// ════════════════════════════════════════════════
//  EVENTS
// ════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {

  // Cargar datos del usuario desde localStorage
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    try {
      const user = JSON.parse(currentUser);
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();

      perfil.nombre = String(user.name || fullName || user.nombre || perfil.nombre || 'Usuario').trim();
      perfil.correo = String(user.email || user.correo || perfil.correo || 'usuario@correo.com').trim();
      perfil.universidad = String(user.university || user.universidad || perfil.universidad || 'UNAM').trim();
      perfil.uniCompleto = String(user.universityName || user.uniCompleto || perfil.uniCompleto || 'Universidad Nacional Autónoma de México').trim();
      perfil.uniImage = String(user.universityImage || user.uniImage || perfil.uniImage || 'UNAM.png').trim();
      perfil.profileImage = user.profileImage || null;
    } catch (error) {
      console.warn('No se pudo parsear currentUser, se usarán valores por defecto.', error);
    }
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

  // Cargar imagen de perfil si existe
  if (perfil.profileImage) {
    cambiarFotografia(perfil.profileImage);
  }

  renderizarTemas();
  renderizarUniversidades();

  // ── Modal Ajustes ────
  document.getElementById('btnAjustes')?.addEventListener('click', abrirModalAjustes);
  document.getElementById('modalClose')?.addEventListener('click', () => cerrarModal('modalAjustes'));
  document.getElementById('btnCancelar')?.addEventListener('click', () => cerrarModal('modalAjustes'));
  document.getElementById('btnGuardar')?.addEventListener('click', confirmarCambios);

  // ── Modal Confirmación ────
  document.getElementById('btnConfirmCancel')?.addEventListener('click', () => cerrarModal('modalConfirm'));
  document.getElementById('btnConfirmOk')?.addEventListener('click', guardarPerfil);

  // ── Cambiar Universidad ────
  document.getElementById('btnCambiarUni')?.addEventListener('click', abrirModalAjustes);

  // ── Capturar cambios en los inputs ────
  const inputNombre = dom.inputNombre();
  const inputCorreo = dom.inputCorreo();
  const inputUniversidad = dom.inputUniversidad();

  inputNombre?.addEventListener('change', (e) => {
    perfilPendiente.nombre = e.target.value;
  });

  inputCorreo?.addEventListener('change', (e) => {
    perfilPendiente.correo = e.target.value;
  });

  inputUniversidad?.addEventListener('change', (e) => {
    perfilPendiente.universidad = e.target.value;
  });

  // ── Galería de imágenes ────
  document.getElementById('btnOpenGallery')?.addEventListener('click', () => {
    abrirModal('modalGallery');
  });

  document.getElementById('modalGalleryClose')?.addEventListener('click', () => {
    cerrarModal('modalGallery');
  });

  dom.modalGallery()?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      cerrarModal('modalGallery');
    }
  });

  document.getElementById('btnRemovePhoto')?.addEventListener('click', () => {
    perfilPendiente.profileImage = null;
    sincronizarPreviewFoto(null);
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

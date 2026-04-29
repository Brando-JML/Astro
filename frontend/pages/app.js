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
  area:         null,
  areaName:     'Área Académica',
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

  // area panel
  areaLogo: () => document.getElementById('areaLogo'),
  areaName: () => document.getElementById('areaName'),
  areaSub:  () => document.getElementById('areaSub'),

  // modal ajustes
  modalAjustes:    () => document.getElementById('modalAjustes'),
  inputNombre:     () => document.getElementById('inputNombre'),
  inputCorreo:     () => document.getElementById('inputCorreo'),
  inputUniversidad:() => document.getElementById('inputUniversidad'),
  inputArea:       () => document.getElementById('inputArea'),
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
  
  const displayName = dom.displayName();
  const greetingName = dom.greetingName();
  
  if (displayName) displayName.textContent = n;
  if (greetingName) greetingName.textContent = n;
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
  
  const displayEmail = dom.displayEmail();
  if (displayEmail) displayEmail.textContent = c;
}

/**
 * Actualiza la universidad seleccionada.
 * @param {string} valor - Código de universidad (e.g., 'UNAM').
 */
function cambiarUniversidad(valor) {
  if (!valor) return;
  const uniInfo = getUniversityInfo(valor);
  if (!uniInfo) return;
  
  perfil.universidad = valor;
  perfil.uniCompleto = uniInfo.name;
  perfil.uniImage = uniInfo.image;
  
  // Actualizar el DOM de forma segura
  const uniLogo = dom.uniLogo();
  const uniName = dom.uniName();
  const uniSub = dom.uniSub();
  
  if (uniLogo) uniLogo.textContent = valor;
  if (uniName) uniName.textContent = valor;
  if (uniSub) uniSub.textContent = uniInfo.name;
  
  actualizarImagenUniversidad();
  renderizarUniversidades();
}

/**
 * Actualiza la imagen del logo de la universidad en el panel
 */
function actualizarImagenUniversidad() {
  const uniLogoElement = dom.uniLogo();
  if (!uniLogoElement) return;
  
  // Crear elemento de imagen si no existe
  const existingImg = uniLogoElement.querySelector('img');
  if (existingImg) {
    existingImg.remove();
  }
  
  const imagenPath = `../assets/images/${perfil.uniImage}`;
  const img = document.createElement('img');
  img.src = imagenPath;
  img.alt = perfil.uniCompleto;
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.objectFit = 'contain';
  img.onerror = function() {
    this.src = `https://via.placeholder.com/100x100?text=${perfil.universidad}`;
  };
  
  // Limpiar contenido anterior (excepto la imagen)
  uniLogoElement.textContent = '';
  uniLogoElement.appendChild(img);
}

/**
 * Actualiza el área académica seleccionada.
 * @param {string} valor - "CODIGO|Nombre del área" (value del <select>).
 */
function cambiarArea(valor) {
  if (!valor) return;
  const [codigo, nombre] = valor.split('|');
  perfil.area = codigo;
  perfil.areaName = nombre;
  
  const areaLogo = dom.areaLogo();
  const areaName = dom.areaName();
  const areaSub = dom.areaSub();
  
  if (areaLogo) areaLogo.textContent = codigo.substring(0, 3).toUpperCase();
  if (areaName) areaName.textContent = nombre;
  if (areaSub) areaSub.textContent = perfil.uniCompleto;
}

/**
 * Actualiza la fotografía de perfil desde el nombre de imagen.
 * @param {string|null} imageName - Nombre del archivo de imagen, o null para eliminar.
 */
function cambiarFotografia(imageName) {
  perfil.profileImage = imageName;

  // Topbar
  const foto = dom.avatarPhoto();
  if (!foto) return;
  
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

  if (perfilPendiente.area !== undefined &&
      perfilPendiente.area !== perfil.area)
    cambios.push({ key: 'Área Académica', val: perfilPendiente.areaName });

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

  if (perfilPendiente.area !== undefined &&
      perfilPendiente.area !== perfil.area)
    cambiarArea(`${perfilPendiente.area}|${perfilPendiente.areaName}`);

  if (perfilPendiente.profileImage !== undefined &&
      perfilPendiente.profileImage !== perfil.profileImage) {
    cambiarFotografia(perfilPendiente.profileImage);
    sincronizarPreviewFoto(perfilPendiente.profileImage);
  }

  cerrarModal('modalConfirm');

  // Persistir para que no se pierdan cambios al recargar dashboard
  guardarUsuarioEnLocalStorage();
  
  // Guardar en Firebase y esperar a que termine
  guardarPerfilEnFirebase().then(() => {
    mostrarToast('✓ Cambios guardados correctamente');
  }).catch((error) => {
    console.error('Error al guardar en Firebase:', error);
    mostrarToast('⚠ Error al guardar cambios');
  });

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
    area: perfil.area,
    areaName: perfil.areaName,
    profileImage: perfil.profileImage,
    user_icon: perfil.profileImage,
    firstName,
    lastName,
  };

  localStorage.setItem('currentUser', JSON.stringify(userData));
}

// ── Pre-rellenar el modal con los valores actuales ──
function abrirModalAjustes() {
  const inputNombre = dom.inputNombre();
  const inputCorreo = dom.inputCorreo();
  const uniSel = dom.inputUniversidad();
  const areaSel = dom.inputArea();

  if (inputNombre) inputNombre.value = perfil.nombre;
  if (inputCorreo) inputCorreo.value = perfil.correo;

  // Seleccionar la universidad correcta
  if (uniSel) {
    uniSel.value = perfil.universidad;
    // Poblar áreas basado en la universidad actual
    poblarAreasEnModal(perfil.universidad);
  }

  // Seleccionar el área correcta
  if (perfil.area && perfil.areaName && areaSel) {
    areaSel.value = `${perfil.area}|${perfil.areaName}`;
  }

  // Sincronizar preview de foto
  sincronizarPreviewFoto(perfil.profileImage);

  // Resetear pendiente
  perfilPendiente = {};

  // Renderizar galería
  renderizarGaleria();

  abrirModal('modalAjustes');
}

// Función para poblar las áreas en el modal
function poblarAreasEnModal(universidadCodigo) {
  const areaSel = dom.inputArea();
  
  if (!areaSel) {
    console.warn('inputArea no encontrado en el DOM');
    return;
  }

  if (!universidadCodigo) {
    areaSel.innerHTML = '<option value="">— Primero selecciona una universidad —</option>';
    areaSel.disabled = true;
    return;
  }

  const areas = getAreasForUniversity(universidadCodigo);
  
  if (areas && areas.length > 0) {
    let areaHTML = '<option value="">— Selecciona un área —</option>';
    areas.forEach(area => {
      areaHTML += `<option value="${area.code}|${area.name}">${area.name}</option>`;
    });
    areaSel.innerHTML = areaHTML;
    areaSel.disabled = false;
  } else {
    areaSel.innerHTML = '<option value="">No hay áreas disponibles</option>';
    areaSel.disabled = true;
  }
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
      return { success: false, message: 'No user ID' };
    }

    const updates = {
      name: perfil.nombre,
      email: perfil.correo,
      university: perfil.universidad,
      universityName: perfil.uniCompleto,
      universityImage: perfil.uniImage,
      area: perfil.area,
      areaName: perfil.areaName,
      user_icon: perfil.profileImage,
      updatedAt: new Date().toISOString()
    };

    const result = await updateUserProfile(userId, updates);
    if (result.success) {
      console.log('Perfil guardado en Firebase correctamente');
      // Actualizar localStorage después de guardar en Firebase
      guardarUsuarioEnLocalStorage();
      return result;
    } else {
      console.error('Error al guardar en Firebase:', result.error);
      return result;
    }
  } catch (error) {
    console.error('Error en guardarPerfilEnFirebase:', error);
    return { success: false, error: error.message };
  }
}

// ════════════════════════════════════════════════
//  EVENTS
// ════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {

  // Intentar cargar desde Firebase primero (datos más recientes)
  const userId = localStorage.getItem('userId');
  let perfilCargado = false;
  
  if (userId) {
    try {
      const userProfile = await getUserProfile(userId);
      if (userProfile) {
        const user = userProfile;
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();

        perfil.nombre = String(user.name || fullName || user.nombre || perfil.nombre || 'Usuario').trim();
        perfil.correo = String(user.email || user.correo || perfil.correo || 'usuario@correo.com').trim();
        perfil.universidad = String(user.university || user.universidad || perfil.universidad || 'UNAM').trim();
        perfil.uniCompleto = String(user.universityName || user.uniCompleto || perfil.uniCompleto || 'Universidad Nacional Autónoma de México').trim();
        perfil.uniImage = String(user.universityImage || user.uniImage || perfil.uniImage || 'UNAM.png').trim();
        perfil.area = user.area || null;
        perfil.areaName = String(user.areaName || perfil.areaName || 'Área Académica').trim();
        // Cargar user_icon desde Firebase
        perfil.profileImage = user.user_icon || user.profileImage || null;
        perfilCargado = true;
        
        // Actualizar localStorage con datos frescos de Firebase
        guardarUsuarioEnLocalStorage();
      }
    } catch (error) {
      console.warn('Error cargando desde Firebase, usando localStorage:', error);
    }
  }

  // Si no se cargó desde Firebase, intentar desde localStorage
  if (!perfilCargado) {
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
        perfil.area = user.area || null;
        perfil.areaName = String(user.areaName || perfil.areaName || 'Área Académica').trim();
        // Cargar user_icon desde Firebase o usar profileImage como fallback
        perfil.profileImage = user.user_icon || user.profileImage || null;
      } catch (error) {
        console.warn('No se pudo parsear currentUser, se usarán valores por defecto.', error);
      }
    }
  }

  // Actualizar datos en la UI
  const displayName = dom.displayName();
  const displayEmail = dom.displayEmail();
  const greetingName = dom.greetingName();
  const uniLogo = dom.uniLogo();
  const uniName = dom.uniName();
  const uniSub = dom.uniSub();
  const areaLogo = dom.areaLogo();
  const areaName = dom.areaName();
  const areaSub = dom.areaSub();

  if (displayName) displayName.textContent = perfil.nombre;
  if (displayEmail) displayEmail.textContent = perfil.correo;
  if (greetingName) greetingName.textContent = perfil.nombre;
  if (uniLogo) uniLogo.textContent = perfil.universidad;
  if (uniName) uniName.textContent = perfil.universidad;
  if (uniSub) uniSub.textContent = perfil.uniCompleto;

  // Actualizar área en el panel
  if (perfil.area && perfil.areaName) {
    const areaCode = String(perfil.area).substring(0, 3).toUpperCase();
    if (areaLogo) areaLogo.textContent = areaCode;
    if (areaName) areaName.textContent = perfil.areaName;
    if (areaSub) areaSub.textContent = perfil.uniCompleto;
  } else {
    if (areaLogo) areaLogo.textContent = 'ÁREA';
    if (areaName) areaName.textContent = 'Área Académica';
    if (areaSub) areaSub.textContent = perfil.uniCompleto;
  }

  // Actualizar iniciales del avatar
  actualizarIniciales(perfil.nombre);

  // Cargar imagen de perfil si existe
  if (perfil.profileImage) {
    cambiarFotografia(perfil.profileImage);
  }

  // Actualizar imagen de la universidad
  actualizarImagenUniversidad();

  renderizarTemas();
  renderizarUniversidades();

  // ── Tarjeta Practicar ────
  const cardPracticar = document.querySelector('.main-grid .card.accent');
  if (cardPracticar) {
    cardPracticar.addEventListener('click', () => {
      window.location.href = 'test.html';
    });
    cardPracticar.style.cursor = 'pointer';
  }

  // ── Modal Ajustes - Botón de perfil ────
  const btnAjustes = document.getElementById('btnAjustes');
  if (btnAjustes) {
    btnAjustes.addEventListener('click', abrirModalAjustes);
  }

  // ── Modal Close button ────
  const modalClose = document.getElementById('modalClose');
  if (modalClose) {
    modalClose.addEventListener('click', () => cerrarModal('modalAjustes'));
  }

  // ── Modal Botones ────
  const btnCancelar = document.getElementById('btnCancelar');
  if (btnCancelar) {
    btnCancelar.addEventListener('click', () => cerrarModal('modalAjustes'));
  }

  const btnGuardar = document.getElementById('btnGuardar');
  if (btnGuardar) {
    btnGuardar.addEventListener('click', confirmarCambios);
  }

  // ── Modal Confirmación ────
  const btnConfirmCancel = document.getElementById('btnConfirmCancel');
  if (btnConfirmCancel) {
    btnConfirmCancel.addEventListener('click', () => cerrarModal('modalConfirm'));
  }

  const btnConfirmOk = document.getElementById('btnConfirmOk');
  if (btnConfirmOk) {
    btnConfirmOk.addEventListener('click', guardarPerfil);
  }

  // ── Cambiar Universidad ----
  const btnCambiarUni = document.getElementById('btnCambiarUni');
  if (btnCambiarUni) {
    btnCambiarUni.addEventListener('click', abrirModalAjustes);
  }

  // ── Cambiar Área ----
  const btnCambiarArea = document.getElementById('btnCambiarArea');
  if (btnCambiarArea) {
    btnCambiarArea.addEventListener('click', abrirModalAjustes);
  }

  // ── Capturar cambios en los inputs ────
  const inputNombre = dom.inputNombre();
  if (inputNombre) {
    inputNombre.addEventListener('change', (e) => {
      perfilPendiente.nombre = e.target.value;
    });
  }

  const inputCorreo = dom.inputCorreo();
  if (inputCorreo) {
    inputCorreo.addEventListener('change', (e) => {
      perfilPendiente.correo = e.target.value;
    });
  }

  const inputUniversidad = dom.inputUniversidad();
  if (inputUniversidad) {
    inputUniversidad.addEventListener('change', (e) => {
      perfilPendiente.universidad = e.target.value;
      // Actualizar areas cuando cambia la universidad
      poblarAreasEnModal(e.target.value);
      // Resetear area selection
      const inputArea = dom.inputArea();
      if (inputArea) {
        inputArea.value = '';
      }
    });
  }

  // ── Capturar cambio en el área académica ----
  const inputArea = dom.inputArea();
  if (inputArea) {
    inputArea.addEventListener('change', (e) => {
      const areaValue = e.target.value;
      if (areaValue) {
        const [areaCode, areaName] = areaValue.split('|');
        perfilPendiente.area = areaCode;
        perfilPendiente.areaName = areaName;
      }
    });
  }

  // ── Galería de imágenes ────
  const btnOpenGallery = document.getElementById('btnOpenGallery');
  if (btnOpenGallery) {
    btnOpenGallery.addEventListener('click', () => {
      abrirModal('modalGallery');
    });
  }

  const modalGalleryClose = document.getElementById('modalGalleryClose');
  if (modalGalleryClose) {
    modalGalleryClose.addEventListener('click', () => {
      cerrarModal('modalGallery');
    });
  }

  const modalGallery = dom.modalGallery();
  if (modalGallery) {
    modalGallery.addEventListener('click', (e) => {
      if (e.target === modalGallery) {
        cerrarModal('modalGallery');
      }
    });
  }

  const btnRemovePhoto = document.getElementById('btnRemovePhoto');
  if (btnRemovePhoto) {
    btnRemovePhoto.addEventListener('click', () => {
      perfilPendiente.profileImage = null;
      sincronizarPreviewFoto(null);
      const inputFoto = document.getElementById('inputFoto');
      if (inputFoto) {
        inputFoto.value = '';
      }
    });
  }

  // ── Cerrar modales al hacer click afuera ────
  const modalAjustes = dom.modalAjustes();
  if (modalAjustes) {
    modalAjustes.addEventListener('click', (e) => {
      if (e.target === modalAjustes) {
        cerrarModal('modalAjustes');
      }
    });
  }

  const modalConfirm = dom.modalConfirm();
  if (modalConfirm) {
    modalConfirm.addEventListener('click', (e) => {
      if (e.target === modalConfirm) {
        cerrarModal('modalConfirm');
      }
    });
  }

  console.log('Dashboard initialized successfully');
});

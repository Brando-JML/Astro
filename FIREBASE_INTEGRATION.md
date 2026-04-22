# Documentación: Integración de Firebase y Nueva Ruta de Perfil

## Resumen de Cambios

Se ha agregado la integración completa de Firebase al proyecto CRYSTAL, permitiendo autenticación de usuarios en tiempo real y almacenamiento de datos en Firebase. Además, se ha creado una nueva ruta para el perfil del usuario donde puede actualizar su información, incluyendo la selección de universidad.

## Archivos Creados

### 1. **firebase-config.js** (`frontend/js/firebase-config.js`)
**Propósito:** Configuración e inicialización de Firebase

**Contenido:**
- Objeto `firebaseConfig` con credenciales de Firebase
- Inicialización de Firebase, Auth y Database
- Variables globales: `app`, `auth`, `database`

**Cómo usarlo:**
```javascript
// Las variables globales están disponibles en todo el proyecto
// auth - para autenticación
// database - para la base de datos en tiempo real
```

### 2. **firebase-auth.js** (`frontend/js/firebase-auth.js`)
**Propósito:** Módulo con todas las funciones de autenticación y gestión de usuarios

**Funciones disponibles:**
- `registerUser(email, password, userProfile)` - Registra nuevo usuario
- `loginUser(email, password)` - Autentica usuario
- `logoutUser()` - Cierra sesión
- `getCurrentUser()` - Obtiene usuario autenticado actual
- `saveUserProfile(userId, profileData)` - Guarda perfil en BD
- `getUserProfile(userId)` - Obtiene datos del perfil
- `updateUserProfile(userId, updates)` - Actualiza perfil
- `updateUserEmail(newEmail)` - Cambia correo
- `updateUserPassword(newPassword)` - Cambia contraseña
- `sendPasswordReset(email)` - Envía correo de recuperación
- `isUserAuthenticated()` - Verifica autenticación
- `deleteUserAccount(userId)` - Elimina cuenta
- `getFirebaseErrorMessage(code)` - Convierte errores a mensajes amigables

### 3. **profile.html** (`frontend/pages/profile.html`)
**Propósito:** Nueva página de perfil de usuario con funcionalidades completas

**Secciones:**
1. **Información Personal**
   - Editar nombre y apellidos
   - Ver correo actual (solo lectura)

2. **Universidad**
   - Selector de universidad con todas las opciones
   - Vista previa del logo de la universidad
   - Cambios persistentes en Firebase

3. **Seguridad**
   - Cambio de correo electrónico
   - Cambio de contraseña con confirmación
   - Cerrar sesión
   - Eliminar cuenta (con doble confirmación)

**Características:**
- Interfaz con tabs/pestañas para organizar secciones
- Diseño responsivo
- Carga automática de datos del usuario
- Validaciones en cliente
- Mensajes de éxito/error
- Protección: Redirige al login si no está autenticado

### 4. **profile.js** (`frontend/js/profile.js`)
**Propósito:** Lógica y manejo de eventos para la página de perfil

**Funcionalidades:**
- Carga datos del usuario al abrir la página
- Maneja envío de todos los formularios
- Valida datos antes de guardar
- Muestra mensajes de éxito/error
- Toggle de visibilidad de contraseña
- Actualiza vista previa de logo de universidad
- Maneja cambios de correo, contraseña y eliminación de cuenta

### 5. **profile.css** (`frontend/css/profile.css`)
**Propósito:** Estilos para la página de perfil

**Características:**
- Diseño moderno con gradientes
- Sistema de pestañas (tabs)
- Animaciones suaves
- Responsive para móviles y tablets
- Variables CSS para colores y estilos consistentes
- Validaciones visuales

## Archivos Modificados

### 1. **new_user.html** (`frontend/pages/new_user.html`)
**Cambios:**
- Se agregaron los scripts de Firebase SDK
- Se agregó referencia a `firebase-config.js`
- Se agregó referencia a `firebase-auth.js`

### 2. **new_user.js** (`frontend/js/new_user.js`)
**Cambios:**
- Cambio de evento `submit` a `async`
- Reemplazo de lógica de localStorage por Firebase
- Llamada a función `registerUser()` del módulo de auth
- Mensajes de error mejorados usando `getFirebaseErrorMessage()`

**Antes:**
```javascript
function createUserAccount() {
    localStorage.setItem('userAccount', JSON.stringify(userData));
}
```

**Después:**
```javascript
async function createUserAccountWithFirebase() {
    const result = await registerUser(email, password, {
        firstName: firstName,
        lastName: lastName,
        university: uniCode,
        universityName: uniName,
        universityImage: uniImage
    });
}
```

### 3. **login.html** (`frontend/pages/login.html`)
**Cambios:**
- Se agregaron los scripts de Firebase SDK
- Se agregó referencia a `firebase-config.js`
- Se agregó referencia a `firebase-auth.js`

### 4. **login.js** (`frontend/js/login.js`)
**Cambios:**
- Cambio de evento `submit` a `async`
- Reemplazo de validación local por Firebase Authentication
- Eliminación de funciones `validateCredentials()` y `getUserData()`
- Integración con función `loginUser()` del módulo de auth

**Antes:**
```javascript
if (validateCredentials(email, password)) {
    const userData = getUserData(email);
    localStorage.setItem('currentUser', JSON.stringify(userData));
}
```

**Después:**
```javascript
async function loginWithFirebase(email, password) {
    const result = await loginUser(email, password);
    if (result.success) {
        localStorage.setItem('currentUser', JSON.stringify(result.userProfile));
    }
}
```

### 5. **package.json**
**Cambios:**
- Se agregó `firebase` como dependencia principal
- Se agregó `firebase-tools` como dependencia de desarrollo

```json
"dependencies": {
    "firebase": "^10.5.0",
    "gridstack": "^12.4.2",
    "bootstrap": "^5.3.0"
}
```

## Estructura de Datos en Firebase

### Realtime Database

```
users/
├── {userId}/
│   ├── email: string
│   ├── firstName: string
│   ├── lastName: string
│   ├── university: string (código de universidad)
│   ├── universityName: string
│   ├── universityImage: string
│   ├── createdAt: ISO string
│   └── updatedAt: ISO string
```

### Authentication

Firebase Authentication maneja:
- Creación de usuarios (email + contraseña)
- Login/Logout
- Cambio de contraseña
- Cambio de correo
- Recuperación de contraseña

## Flujo de Usuario

### Nuevo Usuario (Registro)

```
1. Accede a new_user.html
2. Completa formulario con:
   - Nombre/Apellidos
   - Correo
   - Contraseña (validación de fuerza)
   - Universidad
   - Acepta términos
3. Sistema registra en Firebase Auth
4. Sistema guarda perfil en Realtime Database
5. Redirige a login.html
```

### Usuario Existente (Login)

```
1. Accede a login.html
2. Ingresa correo y contraseña
3. Sistema autentica con Firebase Auth
4. Sistema carga perfil de Realtime Database
5. Guarda info en localStorage
6. Redirige a dashboard.html
```

### Actualización de Perfil

```
1. Usuario autenticado accede a profile.html
2. Página carga datos del perfil desde Realtime Database
3. Usuario puede editar:
   - Nombre/Apellidos (tab: Información Personal)
   - Universidad (tab: Universidad)
   - Correo (tab: Seguridad)
   - Contraseña (tab: Seguridad)
4. Cambios se guardan en Realtime Database
5. Se muestra mensaje de éxito/error
```

## Variables Globales en localStorage

El proyecto utiliza localStorage para algunos valores globales:

- `userId` - ID del usuario autenticado (establecido al login/registro)
- `currentUser` - Objeto con datos del perfil del usuario autenticado

```javascript
// Acceder
const userId = localStorage.getItem('userId');
const userProfile = JSON.parse(localStorage.getItem('currentUser'));

// Guardar
localStorage.setItem('userId', user.uid);
localStorage.setItem('currentUser', JSON.stringify(userProfile));
```

## Validaciones Implementadas

### En Cliente (JavaScript)

**Registro:**
- Email válido (formato)
- Contraseña fuerte (mínimo 8 caracteres, letras y números)
- Confirmación de contraseña coincide
- Todos los campos completos
- Términos y condiciones aceptados

**Login:**
- Campos completos
- Email válido (si incluye @)

**Perfil:**
- Nombre y apellidos no vacíos
- Universidad seleccionada
- Email válido para cambios
- Contraseña fuerte para cambios
- Confirmación de contraseña en cambios

### En Firebase (Backend)

**Authentication:**
- Email único
- Contraseña mínimo 6 caracteres (Firebase)
- Intentos limitados de login

**Realtime Database:**
- Reglas de seguridad: Solo el usuario puede leer/escribir sus datos

## Consideraciones de Seguridad

1. **Contraseñas:** Nunca se transmiten en texto plano, Firebase maneja encriptación
2. **Tokens:** Firebase maneja automáticamente JWT tokens
3. **Base de Datos:** Reglas de seguridad limitan acceso a datos propios
4. **localStorage:** Almacena solo userId y datos públicos del perfil
5. **HTTPS:** Requerido en producción (Firebase lo proporciona)

## Cómo Completar la Configuración

1. Crear proyecto en Firebase Console
2. Habilitar Authentication (Email/Password)
3. Crear Realtime Database
4. Copiar credenciales a `firebase-config.js`
5. Establecer reglas de seguridad en Realtime Database
6. Testear flujos de registro, login y perfil

Ver `FIREBASE_SETUP.md` para instrucciones detalladas.

## Próximas Mejoras Sugeridas

1. **Verificación de Email:** Enviar link de verificación en registro
2. **Avatar de Usuario:** Implementar Firebase Storage para fotos
3. **Recuperación de Contraseña:** Usar email de recuperación
4. **Roles y Permisos:** Añadir niveles de acceso
5. **Auditoría:** Registrar cambios de datos críticos
6. **Notificaciones:** Alertar cambios de seguridad
7. **2FA:** Autenticación de dos factores
8. **Exportación de Datos:** Permitir GDPR data export

## Estructura Final del Proyecto

```
frontend/
├── pages/
│   ├── login.html (actualizado)
│   ├── new_user.html (actualizado)
│   ├── profile.html (NUEVO)
│   ├── dashboard.html
│   └── ...
├── js/
│   ├── firebase-config.js (NUEVO)
│   ├── firebase-auth.js (NUEVO)
│   ├── login.js (actualizado)
│   ├── new_user.js (actualizado)
│   ├── profile.js (NUEVO)
│   └── ...
├── css/
│   ├── profile.css (NUEVO)
│   └── ...
└── assets/
    └── images/
```

## Pruebas Recomendadas

1. ✅ Registrar nuevo usuario
2. ✅ Intentar registrar con email duplicado
3. ✅ Intentar registrar con contraseña débil
4. ✅ Login con credenciales correctas
5. ✅ Login con credenciales incorrectas
6. ✅ Cambiar información personal
7. ✅ Cambiar universidad
8. ✅ Cambiar correo
9. ✅ Cambiar contraseña
10. ✅ Cerrar sesión
11. ✅ Acceso a perfil sin autenticar (debe redirigir a login)
12. ✅ Eliminar cuenta (verificar que desaparece de BD)

---

**Versión:** 1.0  
**Fecha:** 2024  
**Autor:** Sistema de Configuración Firebase

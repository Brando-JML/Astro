# Quick Start - Firebase Integration

## ⚡ Inicio Rápido

### Paso 1: Configurar Firebase
1. Accede a [Firebase Console](https://console.firebase.google.com)
2. Crea un nuevo proyecto llamado "CRYSTAL"
3. En **Autenticación**: Habilita "Correo electrónico/Contraseña"
4. En **Realtime Database**: Crea una base de datos (modo prueba)

### Paso 2: Obtener Credenciales
1. Ve a **Configuración del Proyecto** (engranaje)
2. En **Tu aplicaciones**, selecciona tu app web
3. Copia el objeto `firebaseConfig`

### Paso 3: Actualizar el Proyecto
1. Abre `frontend/js/firebase-config.js`
2. Reemplaza `firebaseConfig` con tus credenciales:

```javascript
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
```

### Paso 4: Actualizar Reglas de Seguridad
En **Realtime Database** → **Reglas**, reemplaza con:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

## 📋 Nuevas Rutas

### 🆕 Perfil de Usuario
- **URL:** `frontend/pages/profile.html`
- **Acceso:** Requiere estar autenticado
- **Funcionalidades:**
  - ✏️ Editar nombre y apellidos
  - 🎓 Cambiar universidad
  - 📧 Cambiar correo
  - 🔐 Cambiar contraseña
  - 🚪 Cerrar sesión
  - 🗑️ Eliminar cuenta

## 🧪 Testing Quick Checklist

```
☐ Registrar nuevo usuario en /new_user.html
☐ Iniciar sesión en /login.html
☐ Acceder a /profile.html
☐ Editar información personal
☐ Cambiar universidad
☐ Cambiar contraseña
☐ Cerrar sesión
☐ Intentar acceder a /profile.html sin sesión (debe redirigir a login)
☐ Eliminar cuenta (verificar en Firebase Console)
```

## 📁 Archivos Nuevos

| Archivo | Propósito |
|---------|----------|
| `frontend/js/firebase-config.js` | Configuración de Firebase |
| `frontend/js/firebase-auth.js` | Funciones de autenticación |
| `frontend/pages/profile.html` | Nueva página de perfil |
| `frontend/js/profile.js` | Lógica de perfil |
| `frontend/css/profile.css` | Estilos de perfil |
| `FIREBASE_SETUP.md` | Guía completa de setup |
| `FIREBASE_INTEGRATION.md` | Documentación de cambios |

## 📝 Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `frontend/pages/login.html` | +Scripts Firebase |
| `frontend/pages/new_user.html` | +Scripts Firebase |
| `frontend/js/login.js` | Integración Firebase Auth |
| `frontend/js/new_user.js` | Integración Firebase Auth |
| `package.json` | +Firebase dependencies |

## 🔗 URLs Clave

| Página | URL |
|--------|-----|
| Registro | `/frontend/pages/new_user.html` |
| Login | `/frontend/pages/login.html` |
| **Perfil** | `/frontend/pages/profile.html` |
| Dashboard | `/frontend/pages/dashboard.html` |

## ⚙️ Funciones Principales

```javascript
// Registro
await registerUser(email, password, userProfile)

// Login
await loginUser(email, password)

// Cerrar sesión
await logoutUser()

// Obtener perfil
await getUserProfile(userId)

// Actualizar perfil
await updateUserProfile(userId, updates)

// Cambiar correo
await updateUserEmail(newEmail)

// Cambiar contraseña
await updateUserPassword(newPassword)

// Verificar autenticación
await isUserAuthenticated()

// Eliminar cuenta
await deleteUserAccount(userId)
```

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| "Firebase is not defined" | Verifica que los scripts estén en el orden correcto en el HTML |
| Credenciales no validas | Copia nuevamente desde Firebase Console |
| Los datos no se guardan | Verifica las reglas de seguridad de Realtime Database |
| Login falla | Revisa que el usuario exista en Firebase Authentication |
| Perfil no carga | Abre consola (F12) y busca errores específicos |

## 📖 Documentación Completa

Para más detalles, consulta:
- **FIREBASE_SETUP.md** - Guía paso a paso
- **FIREBASE_INTEGRATION.md** - Documentación técnica completa

## ✅ Verificación Final

Antes de considerar completado el setup:

1. ✅ Firebase proyecto creado
2. ✅ Credenciales en firebase-config.js
3. ✅ Firebase SDK cargando sin errores
4. ✅ Auth y Realtime Database habilitados
5. ✅ Reglas de seguridad configuradas
6. ✅ Registro funcional
7. ✅ Login funcional
8. ✅ Perfil funcional
9. ✅ Universidad actualizable
10. ✅ Datos persistentes en Firebase

---

**¿Necesitas ayuda?** Revisa FIREBASE_SETUP.md para instrucciones detalladas.

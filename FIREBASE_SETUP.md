# Firebase Setup Guide - CRYSTAL

## Descripción General

Este documento proporciona instrucciones para configurar Firebase en el proyecto CRYSTAL. Firebase es usado para autenticación de usuarios y almacenamiento de datos en tiempo real.

## Requisitos Previos

- Cuenta de Google
- Acceso a [Firebase Console](https://console.firebase.google.com)
- Node.js instalado (opcional, para usar Firebase CLI)

## Pasos de Configuración

### 1. Crear un Proyecto en Firebase

1. Accede a [Firebase Console](https://console.firebase.google.com)
2. Haz clic en **"Crear un proyecto"**
3. Ingresa un nombre para tu proyecto (ej: "CRYSTAL")
4. Acepta los términos y haz clic en **"Crear proyecto"**
5. Espera a que se inicialice el proyecto

### 2. Habilitar Métodos de Autenticación

1. En la consola de Firebase, ve a **"Autenticación"** en el menú izquierdo
2. Haz clic en la pestaña **"Método de acceso"**
3. Haz clic en **"Correo electrónico/Contraseña"**
4. Activa esta opción y haz clic en **"Guardar"**

### 3. Crear una Base de Datos en Tiempo Real

1. Ve a **"Realtime Database"** en el menú izquierdo
2. Haz clic en **"Crear base de datos"**
3. Selecciona **"Empezar en modo de prueba"** (para desarrollo)
4. Selecciona la ubicación más cercana (ej: us-central1)
5. Haz clic en **"Habilitar"**

### 4. Configurar las Reglas de Seguridad de la Base de Datos

1. En la sección Realtime Database, ve a **"Reglas"**
2. Reemplaza las reglas por:

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

3. Haz clic en **"Publicar"**

### 5. Obtener las Credenciales de Firebase

1. En la consola de Firebase, haz clic en el ícono de **engranaje** (Configuración del proyecto)
2. Ve a **"Tu aplicaciones"** o **"Apps"**
3. Haz clic en **"Agregar una aplicación"** y selecciona **"Web"** (</> símbolo)
4. Ingresa un nombre para tu aplicación (ej: "CRYSTAL Web")
5. Haz clic en **"Registrar aplicación"**
6. Se mostrarán las credenciales de Firebase. Copia toda la configuración.

### 6. Actualizar la Configuración en el Proyecto

1. Abre el archivo `frontend/js/firebase-config.js`
2. Reemplaza los valores de `firebaseConfig` con los obtenidos en el paso anterior:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

**Ejemplo completo:**
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyDg3pXN2B4kJ5mL8pQ9rS1tU2vW3xY4z5a",
    authDomain: "crystal-project.firebaseapp.com",
    projectId: "crystal-project",
    storageBucket: "crystal-project.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:1a2b3c4d5e6f7g8h9"
};
```

## Estructura de Datos en Firebase

### Usuarios (Realtime Database)

Los datos de usuarios se almacenan en la ruta: `/users/{userId}`

**Ejemplo de estructura:**
```json
{
  "users": {
    "user123": {
      "email": "usuario@example.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "university": "UNAM",
      "universityName": "Universidad Nacional Autónoma de México",
      "universityImage": "UNAM.png",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

## Rutas y Funcionalidades

### Nueva Ruta: Perfil de Usuario

**Archivo:** `frontend/pages/profile.html`
**Script:** `frontend/js/profile.js`
**Estilos:** `frontend/css/profile.css`

#### Funcionalidades Disponibles:

1. **Información Personal**
   - Editar nombre y apellidos
   - Ver correo actual

2. **Universidad**
   - Cambiar universidad
   - Vista previa del logo de la universidad
   - Persistencia en Firebase Realtime Database

3. **Seguridad**
   - Cambiar correo electrónico
   - Cambiar contraseña
   - Cerrar sesión
   - Eliminar cuenta (irreversible)

### Acceso a la Ruta de Perfil

- **Desde el Dashboard:** Incluye un enlace al perfil
- **URL Directa:** `frontend/pages/profile.html`
- **Protección:** Requiere autenticación. Si no estás autenticado, serás redirigido al login.

## Módulos Firebase Disponibles

### `firebase-auth.js`

Contiene todas las funciones para autenticación y gestión de usuarios:

```javascript
// Registrar nuevo usuario
await registerUser(email, password, userProfile)

// Iniciar sesión
await loginUser(email, password)

// Cerrar sesión
await logoutUser()

// Obtener usuario actual
await getCurrentUser()

// Obtener perfil de usuario
await getUserProfile(userId)

// Actualizar perfil
await updateUserProfile(userId, updates)

// Cambiar correo
await updateUserEmail(newEmail)

// Cambiar contraseña
await updateUserPassword(newPassword)

// Enviar correo de recuperación
await sendPasswordReset(email)

// Eliminar cuenta
await deleteUserAccount(userId)

// Verificar si está autenticado
await isUserAuthenticated()
```

## Integración con Páginas Existentes

### Login (`frontend/pages/login.html`)
- ✅ Integrado con Firebase Authentication
- Autentica usuarios usando email y contraseña
- Almacena ID de usuario en localStorage
- Redirige al dashboard en login exitoso

### Registro (`frontend/pages/new_user.html`)
- ✅ Integrado con Firebase Authentication
- Crea nuevo usuario con email y contraseña
- Guarda información de perfil en Realtime Database
- Permite seleccionar universidad en el registro
- Redirige al login después de registro exitoso

### Perfil (`frontend/pages/profile.html`)
- ✅ Nueva ruta completamente funcional
- Carga datos del usuario desde Firebase
- Permite editar todos los campos del perfil
- Cambio de contraseña y correo
- Eliminación de cuenta

## Probar la Funcionalidad

### 1. Registrar un Nuevo Usuario
1. Abre `frontend/pages/new_user.html`
2. Completa el formulario con:
   - Nombre y apellidos
   - Correo válido
   - Contraseña (mínimo 8 caracteres, letras y números)
   - Selecciona una universidad
   - Acepta términos y condiciones
3. Haz clic en "Crear Cuenta"

### 2. Iniciar Sesión
1. Abre `frontend/pages/login.html`
2. Ingresa el correo y contraseña registrados
3. Haz clic en "Iniciar Sesión"
4. Serás redirigido al dashboard

### 3. Acceder al Perfil
1. Desde el dashboard, busca el enlace al perfil
2. O accede directamente a `frontend/pages/profile.html`
3. Edita tus datos
4. Cambia tu universidad
5. Actualiza seguridad si es necesario

## Monitorear la Base de Datos

1. En Firebase Console, ve a **"Realtime Database"**
2. En la pestaña **"Datos"**, puedes ver:
   - Estructura de usuarios creados
   - Datos almacenados en tiempo real
   - Realiza cambios manuales si es necesario

## Troubleshooting

### Error: "Firebase is not defined"
- Verifica que los scripts de Firebase estén cargados en el HTML
- Asegúrate de que el orden sea:
  1. Firebase SDK scripts
  2. firebase-config.js
  3. firebase-auth.js
  4. Tu script específico

### Error: "La configuración de Firebase no es válida"
- Revisa que las credenciales en `firebase-config.js` sean correctas
- Verifica que hayas copiado todos los campos

### Los datos no se guardan en la base de datos
- Verifica que la Realtime Database esté habilitada
- Comprueba las reglas de seguridad
- Abre la consola del navegador (F12) para ver errores específicos

## Próximos Pasos

1. **Validación adicional:** Implementar validación de email (verificación)
2. **Seguridad:** Usar HTTPS en producción
3. **Almacenamiento de archivos:** Implementar Firebase Storage para avatares
4. **Funciones en la nube:** Usar Cloud Functions para lógica más compleja
5. **Mantenimiento de datos:** Implementar respaldos automáticos

## Referencias

- [Documentación oficial de Firebase](https://firebase.google.com/docs)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Realtime Database](https://firebase.google.com/docs/database)
- [SDK de JavaScript para Firebase](https://firebase.google.com/docs/reference/js)

## Soporte

Para más información o ayuda con Firebase:
- Revisa la consola del navegador (F12) para mensajes de error
- Consulta los logs de Firebase en la consola de Firebase
- Abre un issue en el repositorio del proyecto

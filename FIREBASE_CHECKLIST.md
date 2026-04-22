# ✅ Firebase Configuration Checklist

## ANTES DE USAR LA APLICACIÓN

### 1. Crear Proyecto Firebase ✓
- [ ] Ir a [Firebase Console](https://console.firebase.google.com)
- [ ] Crear nuevo proyecto llamado "CRYSTAL" (o similar)
- [ ] Esperar a que se inicialice

### 2. Configurar Authentication ✓
- [ ] Ir a "Authentication" en la consola
- [ ] Click en "Empezar"
- [ ] Activar "Correo electrónico/Contraseña"
- [ ] Hacer clic en "Guardar"

### 3. Crear Realtime Database ✓
- [ ] Ir a "Realtime Database" en la consola
- [ ] Click en "Crear base de datos"
- [ ] Seleccionar "Empezar en modo de prueba"
- [ ] Seleccionar región (us-central1 recomendado)
- [ ] Click en "Habilitar"

### 4. Configurar Reglas de Seguridad ✓
- [ ] Ir a la pestaña "Reglas" en Realtime Database
- [ ] Copiar las reglas de `firebase-rules.json`
- [ ] Pegar en la consola
- [ ] Click en "Publicar"

### 5. Obtener Credenciales ✓
- [ ] Click en ⚙️ (Configuración del Proyecto)
- [ ] Click en "Tu aplicaciones" o "Apps"
- [ ] Click en "Agregar una aplicación" → "Web"
- [ ] Ingresa nombre: "CRYSTAL Web"
- [ ] Click en "Registrar aplicación"
- [ ] Se mostrará la configuración - **COPIA TODA**

### 6. Configurar en el Proyecto ✓
- [ ] Abre `frontend/js/firebase-config.js`
- [ ] Reemplaza los valores en `firebaseConfig`:
  - `apiKey`: Copia aquí
  - `authDomain`: Copia aquí
  - `projectId`: Copia aquí
  - `storageBucket`: Copia aquí
  - `messagingSenderId`: Copia aquí
  - `appId`: Copia aquí
- [ ] **Guarda el archivo**

### 7. Verificar Configuración ✓
- [ ] Abre `frontend/pages/test-firebase.html` en el navegador
- [ ] Debería mostrar ✅ en todos los tests
- [ ] Si hay ❌, revisa los errores y corrígelos

## ARCHIVOS IMPORTANTES

| Archivo | Descripción |
|---------|-------------|
| `frontend/js/firebase-config.js` | Configuración con tus credenciales |
| `frontend/js/firebase-auth.js` | Módulo de autenticación |
| `frontend/pages/test-firebase.html` | Página de prueba |
| `frontend/pages/new_user.html` | Registro |
| `frontend/pages/login.html` | Login |
| `frontend/pages/profile.html` | Perfil del usuario |

## RUTAS DISPONIBLES

- **Registro**: `/frontend/pages/new_user.html`
- **Login**: `/frontend/pages/login.html`
- **Perfil**: `/frontend/pages/profile.html` (requiere autenticación)
- **Test**: `/frontend/pages/test-firebase.html`

## ¿QUÉ HACER SI HAY ERRORES?

### Error: "Firebase is not defined"
1. Abre la consola del navegador (F12)
2. Verifica que los scripts de Firebase SDK se carguen
3. El orden debe ser:
   - firebase-app.js
   - firebase-auth.js
   - firebase-database.js
   - firebase-config.js
   - firebase-auth.js (módulo)
   - tu-script.js

### Error: "La credencial de API es inválida"
1. Revisa que la API Key sea correcta en firebase-config.js
2. Cópiala nuevamente desde Firebase Console
3. Verifica que no haya espacios extras

### Error: "Permiso denegado" en Base de Datos
1. Verifica las reglas en Realtime Database
2. Asegúrate de que estén publicadas
3. El usuario debe estar autenticado

### La base de datos no guarda datos
1. Verifica que Realtime Database esté "Online" (no "Disabled")
2. Revisa la pestaña "Datos" para ver si se crean usuarios
3. Abre consola (F12) para ver mensajes de error específicos

## DATOS QUE SE GUARDAN

Cuando un usuario se registra, se guardan en Realtime Database:
```
users/
└── {userId}/
    ├── email: string
    ├── firstName: string
    ├── lastName: string
    ├── university: string
    ├── universityName: string
    ├── universityImage: string
    ├── createdAt: ISO date string
    └── updatedAt: ISO date string
```

## PRÓXIMOS PASOS DESPUÉS DE VERIFICAR

1. ✅ Abre `test-firebase.html` - debe pasar todos los tests
2. ✅ Ve a `new_user.html` - intenta registrarte
3. ✅ Ve a `login.html` - intenta iniciar sesión
4. ✅ Ve a `profile.html` - edita tu perfil
5. ✅ Verifica en Firebase Console que los datos se guardan

## DESARROLLO LOCAL vs PRODUCCIÓN

**Para Desarrollo Local (ahora):**
- Las reglas en "Modo de Prueba" permiten cualquier acceso
- Perfecto para testing
- NO usar en producción

**Para Producción (después):**
- Cambiar a reglas de seguridad estrictas
- Usar HTTPS obligatoriamente
- Verificar email de usuarios
- Implementar límites de rate
- Hacer respaldos automáticos

## ¿NECESITAS AYUDA?

1. Revisa la página de test: `frontend/pages/test-firebase.html`
2. Abre la consola del navegador: F12
3. Mira los logs en Firebase Console
4. Consulta la documentación: https://firebase.google.com/docs

---
**¡Con estos pasos, Firebase debería funcionar perfectamente!** 🚀

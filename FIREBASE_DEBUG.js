// ==================================================
// VERIFICACIÓN Y TROUBLESHOOTING DE FIREBASE
// ==================================================

/**
 * PASO 1: Verificar Configuración
 * 
 * Abre este archivo en la consola del navegador (F12 → Console)
 * y copia-pega los comandos para verificar todo
 */

// 1.1 Verificar que Firebase está cargado
console.log("✓ Firebase versión:", firebase.SDK_VERSION);

// 1.2 Verificar credenciales
console.log("✓ Proyecto:", firebaseConfig.projectId);
console.log("✓ Auth Domain:", firebaseConfig.authDomain);

// 1.3 Verificar módulos
console.log("✓ Firebase Auth disponible:", typeof firebase.auth === 'function');
console.log("✓ Firebase Database disponible:", typeof firebase.database === 'function');

// 1.4 Verificar funciones de autenticación
console.log("✓ registerUser disponible:", typeof registerUser === 'function');
console.log("✓ loginUser disponible:", typeof loginUser === 'function');
console.log("✓ logoutUser disponible:", typeof logoutUser === 'function');

/**
 * PASO 2: Probar Registro
 * 
 * En la consola, ejecuta:
 * 
 * await registerUser('test@example.com', 'Test1234', {
 *     firstName: 'Test',
 *     lastName: 'User',
 *     university: 'UNAM',
 *     universityName: 'Universidad Nacional Autónoma de México',
 *     universityImage: 'UNAM.png'
 * });
 * 
 * Deberías ver: { success: true, userId: "...", message: "..." }
 */

/**
 * PASO 3: Probar Login
 * 
 * En la consola, ejecuta:
 * 
 * await loginUser('test@example.com', 'Test1234');
 * 
 * Deberías ver: { success: true, userId: "...", userProfile: {...} }
 */

/**
 * PASO 4: Verificar Base de Datos
 * 
 * En Firebase Console:
 * 1. Ve a Realtime Database
 * 2. Pestaña "Datos"
 * 3. Deberías ver estructura: users > {userId} > datos
 * 
 * Si NO ves nada:
 * - Verifica que Realtime Database no esté "Disabled"
 * - Revisa las reglas de seguridad
 * - Abre consola del navegador (F12) para ver errores
 */

/**
 * PASO 5: Verificar Autenticación en Firebase Console
 * 
 * 1. Ve a Authentication
 * 2. Pestaña "Usuarios"
 * 3. Deberías ver los usuarios registrados
 * 
 * Si NO ves usuarios:
 * - Verifica que Authentication esté habilitado
 * - Intenta registrar desde el formulario (new_user.html)
 * - Abre consola del navegador (F12) para ver errores
 */

/**
 * ERRORES COMUNES Y SOLUCIONES
 */

// Error: "Cannot read property 'initializeApp' of undefined"
// Solución: Los scripts de Firebase SDK no están cargados
// Verifica que en el HTML están en este orden:
// 1. firebase-app.js
// 2. firebase-auth.js
// 3. firebase-database.js

// Error: "The project ID is invalid. Ensure you use the project ID, not the project name."
// Solución: Verifica firebaseConfig.projectId en firebase-config.js

// Error: "auth/operation-not-allowed"
// Solución: Habilita "Correo electrónico/Contraseña" en Authentication

// Error: "Database reference is offline"
// Solución: Verifica que Realtime Database esté online en Firebase Console

// Error: "Permission denied" al escribir en base de datos
// Solución: Verifica las reglas de seguridad en Realtime Database

/**
 * COMANDOS ÚTILES PARA LA CONSOLA
 */

// Ver usuario autenticado actual
firebase.auth().currentUser;

// Obtener usuario y esperar a que cargue
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        console.log("Usuario autenticado:", user.email);
    } else {
        console.log("No hay usuario autenticado");
    }
});

// Cerrar sesión desde consola
firebase.auth().signOut();

// Ver todos los usuarios en localStorage
localStorage.getItem('userId');
localStorage.getItem('currentUser');

// Limpiar localStorage
localStorage.clear();

/**
 * VERIFICACIÓN RÁPIDA
 */

async function verificarTodo() {
    console.log("🔍 Verificando todo...\n");
    
    // 1. Firebase cargado
    try {
        if (firebase.apps.length > 0) {
            console.log("✅ Firebase inicializado correctamente");
        } else {
            console.log("❌ Firebase NO está inicializado");
            return;
        }
    } catch (error) {
        console.log("❌ Error con Firebase:", error.message);
        return;
    }
    
    // 2. Credenciales
    try {
        console.log("✅ Credenciales cargadas");
        console.log("   - Proyecto:", firebaseConfig.projectId);
        console.log("   - Auth Domain:", firebaseConfig.authDomain);
    } catch (error) {
        console.log("❌ Error con credenciales:", error.message);
    }
    
    // 3. Módulos
    try {
        if (typeof registerUser === 'function' && typeof loginUser === 'function') {
            console.log("✅ Funciones de autenticación cargadas");
        } else {
            console.log("❌ Funciones NO están disponibles");
        }
    } catch (error) {
        console.log("❌ Error con funciones:", error.message);
    }
    
    // 4. Estado de autenticación
    try {
        const user = await new Promise(resolve => {
            firebase.auth().onAuthStateChanged(user => resolve(user));
        });
        
        if (user) {
            console.log("✅ Usuario autenticado:", user.email);
        } else {
            console.log("⚠️  No hay usuario autenticado (normal en la primera vez)");
        }
    } catch (error) {
        console.log("❌ Error al verificar autenticación:", error.message);
    }
    
    console.log("\n✅ ¡Verificación completa!");
}

// Ejecutar en consola: verificarTodo();

/**
 * SI ALGO NO FUNCIONA:
 * 
 * 1. Abre test-firebase.html para verificación automática
 * 2. Revisa consola del navegador (F12)
 * 3. Verifica Firebase Console:
 *    - Authentication debe estar habilitado
 *    - Realtime Database debe estar online
 *    - Reglas de seguridad deben ser correctas
 * 4. Comprueba que firebase-config.js tiene credenciales válidas
 * 5. Revisa que los scripts estén en el orden correcto en HTML
 */

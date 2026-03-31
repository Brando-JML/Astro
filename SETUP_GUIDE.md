# Setup Guía - Proyecto CRYSTAL

## Configuración Inicial - Bootstrap y Dependencias

### 1. Instalar Dependencias NPM

Si aún no has instalado las dependencias del proyecto, ejecuta:

```bash
npm install
```

Esto instalará:
- Bootstrap 5.3.0
- GridStack 12.4.2

### 2. Bootstrap CDN (Ya Incluido)

Todos los archivos HTML ya incluyen Bootstrap desde CDN:

```html
<!-- Bootstrap CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

<!-- Bootstrap JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
```

No necesitas hacer nada extra - Bootstrap ya está funcionando.

### 3. Estructura de Archivos CSS

Los archivos CSS están organizados así:

```
frontend/css/
├── colors.css          # Variables de color (paleta CRYSTAL)
├── index.css           # Estilos página de inicio
├── login.css           # Estilos página de login
├── new_user.css        # Estilos página de registro
├── recover.css         # Estilos página de recuperación
└── dashboard.css       # Estilos dashboard (próximo)
```

### 4. Rutas de Importación Correctas

Asegúrate que los archivos HTML tengan las rutas correctas:

**En index.html (raíz de frontend):**
```html
<link rel="stylesheet" href="css/colors.css">
<link rel="stylesheet" href="css/index.css">
<script src="js/index.js"></script>
```

**En pages/login.html (dentro de pages):**
```html
<link rel="stylesheet" href="../css/colors.css">
<link rel="stylesheet" href="../css/login.css">
<script src="../js/login.js"></script>
```

### 5. Cargar Imágenes (Assets)

Las imágenes deben colocarse en: `frontend/assets/images/`

Archivos esperados:
- `hero-university.jpg` - Imagen héroe de inicio
- `about-section.jpg` - Imagen sección acerca de
- `university-1.jpg` - Universidad 1
- `university-2.jpg` - Universidad 2
- `university-3.jpg` - Universidad 3

**Nota:** Si la imagen no existe, se mostrará un placeholder automáticamente.

### 6. Colores CRYSTAL - Variables CSS

Los colores están disponibles como variables CSS en `colors.css`:

```css
:root {
    --color-azul-profundo: #03174F;
    --color-azul-medio: #1553A8;
    --color-azul-claro: #6B9DE8;
    --color-amarillo-vivo: #F5C400;
    --color-amarillo-suave: #F7D774;
    --color-amarillo-palido: #FDF3C2;
}
```

Úsalas en tu CSS así:
```css
.elemento {
    color: var(--color-azul-profundo);
    background-color: var(--color-amarillo-vivo);
}
```

### 7. Testing Local

Para ver el sitio localmente:

1. **Opción 1 - Abrir directamente:**
   - Abre `frontend/index.html` en tu navegador

2. **Opción 2 - Usar Live Server (recomendado):**
   ```bash
   # Si tienes Live Server instalado
   live-server frontend
   ```

3. **Opción 3 - Usando Python:**
   ```bash
   # Python 3.x
   python -m http.server 8000 --directory frontend
   
   # Luego abre: http://localhost:8000
   ```

### 8. Credenciales de Prueba - Login

Para probar el login, usa estas credenciales:

| Usuario | Contraseña |
|---------|-----------|
| admin@crystal.com | password123 |
| user | 12345 |

### 9. Página de Registro

La página de registro (`new_user.html`) requiere:
- Nombre
- Apellido
- Email válido
- Contraseña (mín. 8 caracteres con letras y números)
- Confirmación de contraseña
- Aceptar términos y condiciones

### 10. Página de Recuperación

La página de recuperación (`recover.html`):
- Solo requiere email válido
- Simula envío de instrucciones de recuperación
- Muestra mensaje de éxito

## Estructura Completa del Proyecto

```
CRYSTAL/
├── package.json
├── frontend/
│   ├── index.html                    # Página de inicio
│   ├── css/
│   │   ├── colors.css               # Paleta de colores
│   │   ├── index.css                # Estilos de inicio
│   │   ├── login.css                # Estilos login
│   │   ├── new_user.css             # Estilos registro
│   │   └── recover.css              # Estilos recuperación
│   ├── js/
│   │   ├── index.js                 # Funciones de inicio
│   │   ├── login.js                 # Funciones login
│   │   ├── new_user.js              # Funciones registro
│   │   └── recover.js               # Funciones recuperación
│   ├── pages/
│   │   ├── login.html               # Página de login
│   │   ├── new_user.html            # Página de registro
│   │   ├── dashboard.html           # Dashboard (próximo)
│   │   └── recover.html             # Recuperación contraseña
│   └── assets/
│       └── images/                  # Carpeta de imágenes
│
└── README.md                         # Esta documentación
```

## Problemas Comunes

### Los estilos CSS no cargan

**Solución:**
1. Verifica que `colors.css` esté en `frontend/css/`
2. Verifica las rutas en el HTML
3. Abre la consola (F12) y busca errores de carga de recursos

### Bootstrap no funciona

**Solución:**
1. Verifica conexión a internet (CDN necesita internet)
2. Abre la consola del navegador (F12)
3. Busca errores de CORS o cargas fallidas

### Las imágenes no aparecen

**Solución:**
1. Coloca las imágenes en `frontend/assets/images/`
2. Verifica los nombres de los archivos
3. La página mostrará un placeholder si no encuentra la imagen

## Próximos Pasos

1. Conectar a base de datos para persistencia de datos
2. Implementar backend API
3. Añadir página de dashboard
4. Implementar autenticación real
5. Integrar búsqueda de universidades

## Soporte

Para problemas, verifica:
1. Consola del navegador (F12)
2. Rutas de archivos
3. Conexión a internet (para CDN)
4. Permisos de archivos

---

**CRYSTAL - Tu plataforma educativa** | v1.0 | 2026

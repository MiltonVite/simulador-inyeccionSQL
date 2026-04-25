# Simulador de SQL Injection (SQLi)

Este proyecto es un entorno educativo diseñado para entender cómo funcionan las vulnerabilidades de Inyección SQL (SQLi) y cómo mitigarlas mediante prácticas seguras de codificación (Consultas Preparadas).

## 🛠️ Archivos del Proyecto

- **`sqli-demo.html`**: Un simulador interactivo que puedes abrir en tu navegador. Utiliza `sql.js` (WebAssembly) para ejecutar un motor SQLite real en el cliente, permitiéndote ver en tiempo real cómo se procesan las inyecciones SQL.
- **`crear_db.js`**: Un script de Node.js que crea una base de datos SQLite física (`usuarios.db`) para que puedas usarla en tus pruebas de backend.
- **`simulador.js`**: Un script de consola de Node.js que demuestra la diferencia entre código vulnerable y código seguro.

## 🚀 Cómo utilizar el Simulador Web (`sqli-demo.html`)

1. Haz doble clic en el archivo `sqli-demo.html` para abrirlo en tu navegador.
2. Al cargar, el sistema creará automáticamente una base de datos en memoria con algunos usuarios (como `admin`).
3. En el campo **Usuario**, deja `admin`.
4. En el campo **Contraseña**, pega alguno de los payloads (inyecciones) de prueba que aparecen en la interfaz.
5. Haz clic en **Login (Vulnerable)** para observar cómo la base de datos procesa la cadena de texto y te otorga acceso indebidamente.
6. Haz clic en **Login (Seguro)** utilizando el mismo payload para verificar cómo las consultas parametrizadas neutralizan el ataque.

## 🗄️ Cómo crear la Base de Datos física

Si deseas hacer pruebas en un entorno Node.js o conectar otra herramienta, puedes generar la base de datos ejecutando:

```bash
node crear_db.js
```

Esto generará un archivo llamado `usuarios.db` con una tabla `usuarios` y datos de prueba.

---
**Aviso Legal**: Este proyecto tiene fines estrictamente educativos. Las técnicas demostradas aquí solo deben usarse en entornos de laboratorio propios para comprender los fallos de seguridad y aprender a proteger aplicaciones.

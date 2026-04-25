const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const crypto = require('crypto');

const dbFile = 'usuarios.db';

// Eliminar la base de datos anterior si existe para empezar limpio
if (fs.existsSync(dbFile)) {
    fs.unlinkSync(dbFile);
    console.log(`[INFO] Archivo ${dbFile} anterior eliminado.`);
}

// Crear una nueva base de datos física
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log(`[INFO] Conectado a la base de datos ${dbFile}.`);
});

db.serialize(() => {
    // 1. Crear la tabla de usuarios
    console.log("[INFO] Creando tabla 'usuarios'...");
    db.run("CREATE TABLE usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)");

    // 2. Insertar usuarios de prueba
    console.log("[INFO] Insertando registros de prueba (con contraseñas hasheadas)...");
    const stmt = db.prepare("INSERT INTO usuarios (username, password) VALUES (?, ?)");
    
    // Función de ayuda para hashear contraseñas
    const hashPassword = (password) => {
        return crypto.createHash('sha256').update(password).digest('hex');
    };

    stmt.run('admin', hashPassword('admin1234_super_seguro'));
    stmt.run('usuario1', hashPassword('clave_secreta'));
    stmt.run('invitado', hashPassword('12345'));
    
    stmt.finalize();

    // 3. Verificar que los datos se insertaron correctamente
    db.each("SELECT id, username, password FROM usuarios", (err, row) => {
        if (err) {
            console.error(err.message);
        }
        console.log(` -> Usuario Creado: ID=${row.id}, Username=${row.username}, Password=${row.password}`);
    });
});

db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log("[ÉXITO] Base de datos creada y lista para pruebas.");
});

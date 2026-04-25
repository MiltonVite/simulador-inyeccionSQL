const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname)); // Servir archivos estáticos (como el HTML)

// Función auxiliar para hashear contraseñas
const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

// Usar base de datos en memoria para compatibilidad completa con Vercel Serverless
const db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos en memoria:', err.message);
    } else {
        console.log(`Conectado a la base de datos SQLite en memoria.`);
        
        // Inicializar tabla y datos cada vez que la función (o servidor) arranca
        db.serialize(() => {
            db.run("CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)");
            
            const stmt = db.prepare("INSERT INTO usuarios (username, password) VALUES (?, ?)");
            stmt.run('admin', hashPassword('admin1234_super_seguro'));
            stmt.run('usuario1', hashPassword('clave_secreta'));
            stmt.run('invitado', hashPassword('12345'));
            stmt.finalize();
        });
    }
});

// --- ENDPOINT VULNERABLE ---
app.post('/api/login/vulnerable', (req, res) => {
    const { username, password } = req.body;
    
    const query = `SELECT * FROM usuarios WHERE username = '${username}' AND password = '${password}'`;
    
    console.log(`\n\x1b[41m\x1b[37m[ ALERTA ]\x1b[0m Petición a Endpoint Vulnerable`);
    console.log(`\x1b[36m-> Username ingresado :\x1b[0m ${username}`);
    console.log(`\x1b[36m-> Password ingresado :\x1b[0m ${password}`);
    console.log(`\x1b[33m-> SQL Concatenado  :\x1b[0m ${query}`);

    db.get(query, (err, row) => {
        if (err) {
            console.log(`\x1b[31m[!] Error en SQLite:\x1b[0m ${err.message}`);
            return res.json({ success: false, error: err.message, query });
        }
        if (row) {
            console.log(`\x1b[32m[✓] Acceso concedido a:\x1b[0m ${row.username} (ID: ${row.id})`);
            return res.json({ success: true, message: `Bienvenido, ${row.username}`, query, user: row });
        } else {
            console.log(`\x1b[90m[x] Acceso denegado.\x1b[0m`);
            return res.json({ success: false, message: 'Credenciales incorrectas.', query });
        }
    });
});

// --- ENDPOINT SEGURO ---
app.post('/api/login/seguro', (req, res) => {
    const { username, password } = req.body;
    
    const hashedInput = hashPassword(password);
    const query = `SELECT * FROM usuarios WHERE username = ? AND password = ?`;
    
    console.log(`\n\x1b[42m\x1b[37m[ SEGURO ]\x1b[0m Petición a Endpoint Protegido`);
    console.log(`\x1b[36m-> Username recibido :\x1b[0m ${username}`);
    console.log(`\x1b[36m-> Payload recibido  :\x1b[0m ${password}`);
    console.log(`\x1b[35m-> Hash Generado     :\x1b[0m ${hashedInput.substring(0,20)}...`);
    console.log(`\x1b[33m-> SQL Parametrizado :\x1b[0m ${query}`);

    db.get(query, [username, hashedInput], (err, row) => {
        if (err) {
            console.log(`\x1b[31m[!] Error en SQLite:\x1b[0m ${err.message}`);
            return res.json({ success: false, error: err.message, query });
        }
        if (row) {
            console.log(`\x1b[32m[✓] Acceso legítimo concedido a:\x1b[0m ${row.username}`);
            return res.json({ success: true, message: `Bienvenido, ${row.username}`, query, user: row });
        } else {
            console.log(`\x1b[90m[x] Ataque neutralizado / Acceso denegado.\x1b[0m`);
            return res.json({ success: false, message: 'Credenciales incorrectas.', query });
        }
    });
});

// Solo iniciamos el servidor si NO estamos en Vercel (Vercel usa el module.exports)
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Servidor backend local corriendo en http://localhost:${PORT}`);
        console.log(`Abre http://localhost:${PORT}/sqli-demo.html en tu navegador`);
    });
}

// Exportar la aplicación para que Vercel la pueda consumir como Serverless Function
module.exports = app;

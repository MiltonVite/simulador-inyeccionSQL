const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname)); // Servir archivos estáticos (como el HTML)

// Conectar a la base de datos
const db = new sqlite3.Database('usuarios.db', (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos usuarios.db');
    }
});

// Función auxiliar para hashear contraseñas
const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

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

app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
    console.log(`Abre http://localhost:${PORT}/sqli-demo.html en tu navegador`);
});

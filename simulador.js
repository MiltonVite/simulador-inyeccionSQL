const sqlite3 = require('sqlite3').verbose();

// Creamos una base de datos temporal en la memoria RAM
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    // 1. Configuración de la base de datos de prueba
    db.run("CREATE TABLE usuarios (id INT, username TEXT, password TEXT)");
    db.run("INSERT INTO usuarios VALUES (1, 'admin', 'clave_super_secreta_del_sistema')");
    db.run("INSERT INTO usuarios VALUES (2, 'aldair', 'mi_clave_123')");

    console.log("=========================================");
    console.log("   SIMULACIÓN DE ATAQUE SQL INJECTION    ");
    console.log("=========================================\n");

    // --- ESCENARIO VULNERABLE ---
    function loginVulnerable(username, password) {
        // EL ERROR CRÍTICO: Concatenar strings directamente en la consulta
        const query = `SELECT * FROM usuarios WHERE username = '${username}' AND password = '${password}'`;
        console.log(`[Consulta Ejecutada] -> ${query}`);

        db.get(query, (err, row) => {
            if (row) {
                console.log(`🔴 [¡VULNERADO!] Acceso concedido como: ${row.username}\n`);
            } else {
                console.log("🟢 [BLOQUEADO] Credenciales incorrectas\n");
            }
        });
    }

    // --- ESCENARIO SEGURO (MITIGACIÓN) ---
    function loginSeguro(username, password) {
        // LA SOLUCIÓN: Usar consultas parametrizadas (?)
        const query = `SELECT * FROM usuarios WHERE username = ? AND password = ?`;
        console.log(`[Consulta Segura] -> ${query} (Parámetros: ['${username}', '${password}'])`);

        db.get(query, [username, password], (err, row) => {
            if (row) {
                console.log(`🟢 [ÉXITO] Acceso concedido legítimamente como: ${row.username}\n`);
            } else {
                console.log("🟢 [BLOQUEADO] El ataque no funcionó. Credenciales incorrectas.\n");
            }
        });
    }

    // ---------------------------------------------------------
    // EJECUCIÓN DE LA DEMOSTRACIÓN
    // ---------------------------------------------------------

    console.log("--- CASO 1: Intento normal fallido ---");
    loginVulnerable('admin', 'clave_equivocada');

    console.log("--- CASO 2: EL ATAQUE SQLi ---");
    // El atacante inyecta código SQL en el campo de la contraseña
    // La comilla simple (') cierra el string esperado, y el OR '1'='1' fuerza a que la condición sea verdadera
    loginVulnerable('admin', "' OR '1'='1");

    console.log("--- CASO 3: Defendiéndonos del ataque ---");
    // Probamos el mismo ataque en la función segura
    loginSeguro('admin', "' OR '1'='1");
});

// Cerramos la base de datos al terminar
db.close();
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require('body-parser');

const app = express();
const con = mysql.createConnection({
    host: '',      
    user: '',      
    password: '',  
    database: ''   
});
con.connect();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Agregar usuario
app.post('/agregarUsuario', (req, res) => {
    const { id, nombre } = req.body;
    con.query(
        'INSERT INTO usuario (id_usuario, nombre) VALUES (?, ?)', 
        [id, nombre], 
        (err) => {
            if (err) {
                console.log("Error al conectar", err);
                return res.status(500).send("Error al conectar");
            }
            res.send(`<h1>Nombre:</h1> ${nombre}`);
        }
    );
});

// Consultar todos los usuarios
app.get('/obtenerUsuario', (req, res) => {
    con.query('SELECT * FROM usuario', (err, respuesta) => {
        if (err) {
            console.log('ERROR: ', err);
            return res.status(500).send('Error al obtener usuarios');
        }
        let userHTML = '';
        respuesta.forEach(user => {
            userHTML += `<tr><td>${user.id_usuario}</td><td>${user.nombre}</td></tr>`;
        });
        res.send(`
            <table>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                </tr>
                ${userHTML}
            </table>
        `);
    });
});

// Buscar usuario por ID o nombre
app.get('/buscarUsuarioAcciones', (req, res) => {
    const { id, nombre } = req.query;
    let query = 'SELECT * FROM usuario';
    let where = [];
    let values = [];

    if (id) {
        where.push('id_usuario = ?');
        values.push(id);
    }
    if (nombre) {
        where.push('nombre LIKE ?');
        values.push('%' + nombre + '%');
    }
    if (where.length > 0) {
        query += ' WHERE ' + where.join(' AND ');
    }

    con.query(query, values, (err, resultados) => {
        if (err) return res.status(500).send('Error al buscar usuario');
        if (resultados.length === 0) return res.send('Usuario no encontrado');

        let html = '<h3>Resultados:</h3>';
        resultados.forEach(usuario => {
            html += `
                <div style="border:1px solid #ccc; padding:10px; margin:10px;">
                    <p>ID: ${usuario.id_usuario}</p>
                    <p>Nombre: ${usuario.nombre}</p>
                    <form style="display:inline;" action="/editarUsuario" method="POST">
                        <input type="hidden" name="id" value="${usuario.id_usuario}" />
                        <input type="text" name="nuevoNombre" placeholder="Nuevo nombre" required />
                        <button type="submit">Modificar</button>
                    </form>
                    <form style="display:inline;" action="/eliminarUsuario" method="POST" onsubmit="return confirm('¿Seguro que deseas eliminar este usuario?');">
                        <input type="hidden" name="id" value="${usuario.id_usuario}" />
                        <button type="submit">Eliminar</button>
                    </form>
                </div>
            `;
        });
        res.send(html);
    });
});

// Editar usuario por ID
app.post('/editarUsuario', (req, res) => {
    const { id, nuevoNombre } = req.body;
    con.query(
        'UPDATE usuario SET nombre = ? WHERE id_usuario = ?',
        [nuevoNombre, id],
        (err, resultado) => {
            if (err) return res.status(500).send('Error al actualizar usuario');
            if (resultado.affectedRows === 0) return res.send('Usuario no encontrado');
            res.send(`✅ Usuario con ID ${id} actualizado a: ${nuevoNombre}`);
        }
    );
});

// Eliminar usuario por ID
app.post('/eliminarUsuario', (req, res) => {
    const { id } = req.body;
    con.query(
        'DELETE FROM usuario WHERE id_usuario = ?',
        [id],
        (err, resultado) => {
            if (err) return res.status(500).send('Error al eliminar usuario');
            if (resultado.affectedRows === 0) return res.send('Usuario no encontrado');
            res.send(`❌ Usuario con ID ${id} eliminado correctamente.`);
        }
    );
});

app.listen(5000, () => {
    console.log('Servidor escuchando en el puerto 5000');
});
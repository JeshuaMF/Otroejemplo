
//declaramos una varible para ocupar el framework expres
const express = require("express")
const mysql= require("mysql2")

let bodyParser=require('body-parser')
let app=express()
let con=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'root',
    database:'5iv8'
})
con.connect();

//crud create,read,update, delete
app.use(bodyParser.json())

app.use(bodyParser.urlencoded({
    extended:true
}))
// en public esta todo el front
app.use(express.static('public'))

// métodos para el crud insertar usuario

app.post('/agregarUsuario',(req,res)=>{
        let nombre=req.body.nombre
        let id=req.body.id

        con.query('INSERT INTO usuario (id_usuario, nombre) VALUES (?, ?)', [id, nombre], (err, respuesta, fields) => {
            if (err) {
                console.log("Error al conectar", err);
                return res.status(500).send("Error al conectar");
            }
           
            return res.send(`<h1>Nombre:</h1> ${nombre}`);
        });
})

//Función para consultar todos los usuarios

app.get('/obtenerUsuario',(req,res)=>{
    con.query('select * from usuario', (err,respuesta, fields)=>{
        if(err)return console.log('ERROR: ', err);
        var userHTML=``;
        var i=0;

        respuesta.forEach(user => {
            i++;
            userHTML+= `<tr><td>${i}</td><td>${user.nombre}</td></tr>`;

        });
          
        
        return res.send(`<table>
                <tr>
                    <th>id</th>
                    <th>Nombre:</th>
                <tr>
                ${userHTML}
                </table>`
        );


    });
});



app.listen(5000,()=>{
    console.log('Servidor escuchando en el puerto 5000')
})
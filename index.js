'use strict'
var fs = require('fs');
var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/DBtwiter',{useNewUrlParser: true, useUnifiedTopology:true, useFindAndModify:false})
    .then(()=>{
        console.log("La conexion a la base de datos es exitosa");
        app.listen(port,()=>{
            console.log('El servidor esta corriendo en el puerto ' + port);
            fs.readFile('Readme.txt','utf8', function (err, data) {
                if(err){
                    console.log(err);
                }else if(data){
                    console.log(data);
                }
            });
        });
    })
    .catch(err=>{
        console.log('No se logro conectar a la base de datos');
    })
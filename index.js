'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3977;

mongoose.connect('mongodb://localhost:27017/cm2', (err, res) => {
    if(err){
        throw err;
    } else {
        console.log("La base de datos se está ejecutando correctamente!");

        app.listen(port, function(){
            console.log("El servidor de API REST de musica se está ejecutando en http://localhost:" + port);
        });
    }
});
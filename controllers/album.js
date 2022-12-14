'use strict'

var fs = require('fs');
var path = require('path');
var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');
const album = require('../models/album');
const { param } = require('../routes/album');
const { find } = require('../models/artist');

function getAlbum (req, res) {
    var albumId = req.params.id;

    Album.findById(albumId).populate({path: 'artist'}).exec((err, album) => {
        if(err){
            res.status(500).send({message: 'Error en la petición de Album a la base de datos'});
        } else {
            if (!album) {
                res.status(404).send({message: 'Error en la busqueda de Album, el album no existe!'});
            } else {
                res.status(200).send({album});
            }
        }
    });
    
}

function saveAlbum(req, res){
    var album = new Album();

    var params = req.body;
    album.title = params.title;
    album.description = params.description;
    album.year = params.year;
    album.image = 'null';
    album.artist = params.artist;

    album.save((err, albumStored) => {
        if(err){
            res.status(500).send({message: 'Error en la petición de consulta de album'});
        } else {
            if(!albumStored){
                res.status(404).send({message: 'El album no ha sido guardado'});
            } else {
                res.status(200).send({albumStored});
            }
        }
    });

}

function getAlbums(req, res){
    var artistId = req.params.artist;

    if(!artistId){
        //Listar todos los albums de la base de datos
        var find = Album.find({}).sort('title');
    } else {
        //Listar todos los albums del artista indicado
        var find = Album.find({artist: artistId}).sort('year');
    }

    find.populate({path: 'artist'}).exec((err, albums) => {
        if(err){
            res.status(500).send({message: 'Error en la petición de consulta de albums'});
        } else {
            if(!albums){
                res.status(404).send({message: 'No existen albums'});
            } else {
                res.status(200).send({albums});
            }
        }
    });

}

function updateAlbum(req, res){
    var albumId = req.params.id;
    var update = req.body;

    Album.findByIdAndUpdate(albumId, update, (err, albumUpdated) => {
        if(err){
            res.status(500).send({message: 'Error en la petición para actualizar Album en la base de datos'});
        } else {
            if(!albumUpdated){
                res.status(404).send({message: 'Error en actualización de Album, probablemente no existe'});
            } else {
                res.status(200).send({album: albumUpdated});
            }
        }
    });
}

function deleteAlbum(req, res){
    var albumId = req.params.id;

    Album.findByIdAndRemove(albumId, (err, albumRemoved) => {
        if(err){
            res.status(500).send({message: 'Error en la petición de eliminar albums del artista.'});
        } else {
            if(!albumRemoved){
                res.status(404).send({message: 'No se han eliminado albums del artista o no existen.'});
            } else {
                Song.find({album: albumRemoved._id}).remove((err, songRemoved) => {
                    if(err){
                        res.status(500).send({message: 'Error en la petición de eliminar canciones del album.'});
                    } else {
                        if(!songRemoved){
                            res.status(404).send({message: 'No se han eliminado canciones del album o artista. No existen las canciones'});
                        } else {
                            res.status(200).send({album: albumRemoved});
                        }
                    }
                });
            }
        }
    });

}

function uploadImage(req, res){
    var albumId = req.params.id;
    var file_name = 'No subido...';

    if(req.files){
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'bmp') {
            Album.findByIdAndUpdate(albumId, {image: file_name}, (err, albumUpdated) => {
                if(err){
                    res.status(500).send({message: 'Error al actualizar el album'});
                } else {
                    if(!albumUpdated){
                        res.status(404).send({message: 'No se ha podido actualizar la imágen del album'});
                    } else {
                        res.status(200).send({album: albumUpdated});
                    }
                }
            });
        } else {
            res.status(200).send({message: 'Extensión de archivo no válida'});
        }

    } else {
        res.status(200).send({message: 'No has subido ninguna imágen de album...'});
    }

}

function getImageFile(req, res){
    
    var imageFile = req.params.imageFile;
    var path_file = './uploads/albums/' + imageFile;
    
    console.log(path_file);

    fs.exists(path_file, function(exists){
        if (exists){
            res.sendFile(path.resolve(path_file))
        } else {
            res.status(200).send({message: 'No existe la imágen indicada...'});
        }
    });
}


module.exports = {
    getAlbum,
    getAlbums,
    saveAlbum,
    updateAlbum,
    deleteAlbum,
    uploadImage,
    getImageFile
};
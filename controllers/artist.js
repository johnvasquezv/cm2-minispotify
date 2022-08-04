'use strict'

var fs = require('fs');
var path = require('path');
var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');
const album = require('../models/album');

function getArtist (req, res) {
    var artistId = req.params.id;

    Artist.findById(artistId, (err, artist) => {
        if(err){
            res.status(500).send({message: 'Error en la petición de consulta de artista'});
        } else {
            if(!artist){
                res.status(404).send({message: 'El artista no existe...'});
            } else {
                res.status(200).send({artist});
            }
        }
    });

    
}

function saveArtist(req, res) {
    var artist = new Artist();

    var params = req.body;
    artist.name = params.name;
    artist.description = params.description;
    artist.image = 'null';

    artist.save((err, artistStored) => {
        if(err){
            res.status(500).send({message: 'Error al guardar el artista'});
        } else {
            if(!artistStored) {
                res.status(404).send({message: 'El artista no ha sido guardado'});
            } else {
                res.status(200).send({artist: artistStored});
            }
        }
    });

}

function getArtists(req, res){

    if(req.params.page){
        var page = req.params.page;  
    } else {
        var page = 1;
    }

    var itemsPerPage = 3;

    Artist.find().sort('name').paginate(page, itemsPerPage, function(err, artists, total){
        if (err){
            res.status(500).send({message: 'Error en la petición de listado de artistas'});
        } else {
            if (!artists) {
                res.status(404).send({message: 'No hay ningun artista que listar'});
            } else {
                return res.status(200).send({
                    total_items: total,
                    artists: artists
                });
            }
        }
    });

}

function updateArtist(req, res){
    var artistId = req.params.id;
    var update = req.body;

    Artist.findByIdAndUpdate(artistId, update, (err, artistUpdated) => {
        if(err){
            res.status(500).send({message: 'Error en la petición de actualización de artistas.'});
        } else {
            if(!artistUpdated){
                res.status(404).send({message: 'No se ha actualizado ningun artista, el artista no existe.'});
            } else {
                res.status(200).send({artist: artistUpdated});
            }
        }
    });


}

function deleteArtist(req, res){
    var artistId = req.params.id;

    Artist.findByIdAndRemove(artistId, (err, artistRemoved) => {
        if(err){
            res.status(500).send({message: 'Error en la petición de eliminación de artistas.'});
        } else {
            if(!artistRemoved){
                res.status(404).send({message: 'El artista no ha sido eliminado, o no existe.'});
            } else {
                Album.find({artist: artistRemoved._id}).remove((err, albumRemoved) => {
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
                                        res.status(200).send({artistRemoved})
                                    }
                                }
                            });
                        }
                    }
                });

            }
        }
    });
}

function uploadImage(req, res){
    var artistId = req.params.id;
    var file_name = 'No subido...';

    if(req.files){
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'bmp') {
            Artist.findByIdAndUpdate(artistId, {image: file_name}, (err, artistUpdated) => {
                if(err){
                    res.status(500).send({message: 'Error al actualizar el usuario'});
                } else {
                    if(!artistUpdated){
                        res.status(404).send({message: 'No se ha podido actualizar la imágen del usuario'});
                    } else {
                        res.status(200).send({artist: artistUpdated});
                    }
                }
            });
        } else {
            res.status(200).send({message: 'Extensión de archivo no válida'});
        }

    } else {
        res.status(200).send({message: 'No has subido ninguna imágen de usuario...'});
    }

}

function getImageFile(req, res){
    
    var imageFile = req.params.imageFile;
    var path_file = './uploads/artists/' + imageFile;
    
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
    getArtist,
    getArtists,
    saveArtist,
    updateArtist,
    deleteArtist,
    uploadImage,
    getImageFile
}
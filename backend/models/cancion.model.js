const { Schema, model } = require('mongoose');

const CancionSchema = new Schema({
    titulo: { type: String, required: true, trim: true },
    autor: { type: String, default: "Desconocido", trim: true },
    categorias: { type: [String], required: true },
    letra: { type: [String], required: true },
    tonoBase: { type: String, required: true },
    numeroCancion: { type: Number, unique: true, index: true },
    videoUrl: { type: String, default: "#" }
}, {timestamps: true });

module.exports = model('Cancion', CancionSchema, 'canciones');
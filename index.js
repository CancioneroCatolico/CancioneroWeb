
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {res.send('API del cancionero funcionando');

});

app.listen(PORT, () => {console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

const canciones = [
  {
    id: 1,
    titulo: "Abba Padre",
    autor: "Desconocido",
    categoria: "Entrada",
    tono: "C"
  },
  {
    id: 2,
    titulo: "Santo, Santo, Santo",
    autor: "Desconocido",
    categoria: "Santo",
    tono: "Am"
  }
];

app.get('/api/canciones', (req, res) => {
  res.json(canciones);
});

app.get('/api/canciones/:id', (req, res) => {
    const cancion = canciones.find(c => c.id == req.params.id);
    if(cancion){
        res.json(cancion);
    }else{
        res.status(404).json({error: "Canción no encontrada"});
    }
});

app.post('/api/canciones', (req, res) => {
    const {titulo, autor, categoria, tono} = req.body;
    if(!titulo || !autor || !categoria || !tono){
        return res.status(400).json({error: "Faltan datos"});
    }
    const nuevaCancion = {
        id: canciones.length + 1,
        titulo,
        autor,
        categoria,
        tono
    };

    canciones.push(nuevaCancion);
    res.status(201).json(nuevaCancion);
});

app.delete('/api/canciones/:id', (req, res) => {
    const index = canciones.findIndex(c => c.id == req.params.id);
    if(index !== -1){
        canciones.splice(index, 1);
        res.json({ mensaje: "Cancion eliminada"});
    } else {
        res.status(404).json({ error: "Canción no encontrada"});
    }
});

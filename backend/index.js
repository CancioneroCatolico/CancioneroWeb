
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./db');
const cancionesRouter = require('./routes/canciones.routes');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => { res.send('API del cancionero funcionando 🎵'); });
app.use('/canciones', cancionesRouter);

connectDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
});
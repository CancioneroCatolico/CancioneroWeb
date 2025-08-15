
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const cancionesRouter = require('./routes/canciones.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {res.send('API del cancionero funcionando 🎵');});
app.use('/api/canciones', cancionesRouter);

app.listen(PORT, () => {console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
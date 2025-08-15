let canciones = [
    { id: 1, titulo: "Abba Padre", autor: "Desconocido", categoria: "Entrada", tono: "LAm"},
    { id: 2, titulo: "Santo, Santo, Santo", autor: "Desconocido", categoria: "Santo", tono: "SOL"}
];

function listar(_req,res) { res.json(canciones); }

function obtenerPorId(req, res) {
    const cancion = canciones.find(c => c.id === Number(req.params.id));
    if (!cancion) 
        return res.status(404).json({ error: "Canción no encontrada"});
    res.json(cancion);
}

function crear(req, res) {
    const { titulo, autor, categoria, tono } = req.body;
    if (!titulo || !autor || !categoria || !tono)
        return res.status(400).json({ error: "Faltan datos"});

    const id = canciones.length ? Math.max(...canciones.map(c => c.id)) + 1 : 1;
    const nueva = { id, titulo, autor, categoria, tono };
    canciones.push(nueva);
    res.status(201).json(nueva);
}

function actualizar(req, res) {
    const { titulo, autor, categoria, tono } = req.body;
    const cancion = canciones.find(c => c.id === Number(req.params.id));

    if(!cancion)
        return res.status(404).json({ error: "Canción no encontrada"});
    if(!titulo || !autor || !categoria || !tono)
        return res.status(400).json({ error: "Faltan datos"});
    Object.assign(cancion, { titulo, autor, categoria, tono });
    res.json(cancion);
}

function eliminar(req, res) {
    const i = canciones.findIndex(c => c.id === Number(req.params.id));
    if(i === -1)
        return res.status(404).json({ error: "Canción no encontrada"});
    canciones.splice(i, 1);
    res.json({ mensaje: "Canción eliminada"});
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
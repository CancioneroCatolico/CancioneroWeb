const ADMIN_KEY = process.env.ADMIN_KEY;

function requireAdmin(req, res, next){
    const key = req.header('x-admin-key') || '';

    if (ADMIN_KEY && key === ADMIN_KEY) 
        return next();

    return res.status(401).json({ error: 'No autorizado'});
}

module.exports = { requireAdmin };
const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middlewares/auth');
const ctrl = require('../controllers/canciones.controller');

router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtenerPorId);

router.post('/', requireAdmin, ctrl.crear);
router.put('/:id', requireAdmin, ctrl.actualizar);
router.delete('/:id', requireAdmin, ctrl.eliminar);

module.exports = router;
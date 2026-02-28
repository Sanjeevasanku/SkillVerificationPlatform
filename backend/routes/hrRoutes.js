const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hrController');
const auth = require('../middleware/authMiddleware');
const hrMiddleware = require('../middleware/hrMiddleware');

// Base path is /api/hr in server.js

router.post('/roles', [auth, hrMiddleware], hrController.createRole);
router.get('/roles', [auth, hrMiddleware], hrController.getAllRoles);
router.get('/search/students', [auth, hrMiddleware], hrController.searchStudents);
router.get('/roles/:id', [auth, hrMiddleware], hrController.getRoleWithReadiness);
router.delete('/roles/:id', [auth, hrMiddleware], hrController.deleteRole);

module.exports = router;

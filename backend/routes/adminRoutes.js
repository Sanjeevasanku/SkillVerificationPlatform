const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Base path is /api/admin in server.js

// User management
router.get('/students', [auth, adminMiddleware], adminController.getAllStudents);
router.get('/hrs', [auth, adminMiddleware], adminController.getAllHRs);
router.get('/roles', [auth, adminMiddleware], adminController.getAllRoles);
router.delete('/students/:id', [auth, adminMiddleware], adminController.deleteStudent);
router.delete('/hrs/:id', [auth, adminMiddleware], adminController.deleteHR);

// Repository review queue
router.get('/repositories/review-queue', [auth, adminMiddleware], adminController.getReviewQueue);
router.get('/repositories/:id/review-details', [auth, adminMiddleware], adminController.getReviewDetails);
router.post('/repositories/:id/approve', [auth, adminMiddleware], adminController.approveRepository);
router.post('/repositories/:id/reject', [auth, adminMiddleware], adminController.rejectRepository);

module.exports = router;

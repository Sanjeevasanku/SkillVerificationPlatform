const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
    createProject,
    getMyProjects
} = require("../controllers/projectController");

router.post("/", auth, createProject);
router.get("/my", auth, getMyProjects);

module.exports = router;

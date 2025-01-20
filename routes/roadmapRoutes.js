const express = require("express");
const router = express.Router();
const roadmapController = require("../controller/roadmapController");
const authController = require("../controller/authController");

router.post("/:id", authController.protect, roadmapController.createRoadmap);
router.get("/:id", roadmapController.getRoadmapById);
router.patch("/:id", authController.protect, roadmapController.updateRoadmap);
router.delete("/:id", authController.protect, roadmapController.deleteRoadmap);

module.exports = router;

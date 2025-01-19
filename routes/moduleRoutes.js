const express = require("express");
const router = express.Router();
const moduleController = require("../controllers/moduleController");
const authController = require("../controllers/authController");

router.post("/", authController.protect, moduleController.createModule);
router.get("/", moduleController.getAllModules);
router.get("/:id", moduleController.getModule);
router.post("/resource", authController.protect, moduleController.addResource);
router.patch("/:id", authController.protect, moduleController.updateModule);
router.delete("/:id", authController.protect, moduleController.deleteModule);

module.exports = router;

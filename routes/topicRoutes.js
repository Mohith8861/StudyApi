const express = require("express");
const router = express.Router();
const topicController = require("../controllers/topicController");
const authController = require("../controllers/authController");

router.post("/", authController.protect, topicController.createTopic);
router.get("/", topicController.getAllTopics);
router.get("/:id", topicController.getTopic);
router.post("/resource", authController.protect, topicController.addResource);
router.patch("/:id", authController.protect, topicController.updateTopic);
router.delete("/:id", authController.protect, topicController.deleteTopic);

module.exports = router;

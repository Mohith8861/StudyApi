const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const authController = require("../controllers/authController");
router.post("/", courseController.createCourse);
router.get("/", courseController.searchCourses);
router.get("/:id", courseController.getCourse);
// router.get(":/field", courseController.getCoursesByField);
router.patch("/:id", authController.protect, courseController.updateCourse);
router.delete("/:id", authController.protect, courseController.deleteCourse);

module.exports = router;

const express = require("express");
const router = express.Router();
const courseController = require("../controller/courseController");
const authController = require("../controller/authController");
router.post("/", authController.protect, courseController.createCourse);
router.get("/", courseController.searchCourses);
router.get("/:id", courseController.getCourse);
// router.get(":/field", courseController.getCoursesByField);
router.patch("/:id", authController.protect, courseController.updateCourse);
router.delete("/:id", authController.protect, courseController.deleteCourse);

module.exports = router;

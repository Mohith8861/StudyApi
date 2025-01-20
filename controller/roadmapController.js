const Course = require("../models/course");
const Roadmap = require("../models/roadmap");

class RoadmapController {
  // Create a new roadmap module
  async createRoadmap(req, res) {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: "Course not found",
        });
      }
      // Check if user owns the course
      if (course.uId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: "User not authorized to delete this course",
        });
      }
      const roadmap = new Roadmap({
        Modules: req.body,
      });
      roadmap.courseId = course.id;
      roadmap.uId = req.user.id;
      const savedRoadmap = await roadmap.save();
      course.roadmap = savedRoadmap.id;
      await course.save();
      res.status(201).json({
        success: true,
        data: savedRoadmap,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getRoadmapById(req, res) {
    try {
      const roadmap = await Roadmap.findById(req.params.id);

      if (!roadmap) {
        return res.status(404).json({
          success: false,
          error: "Roadmap not found",
        });
      }

      res.status(200).json({
        success: true,
        data: roadmap,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateRoadmap(req, res) {
    try {
      const roadmap = await Roadmap.findById(req.params.id);

      if (!roadmap) {
        return res.status(404).json({
          success: false,
          error: "Roadmap not found",
        });
      }

      // Check if user owns the course
      if (roadmap.uId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: "User not authorized to update this roadmap",
        });
      }

      roadmap.Modules = req.body;

      const updatedRoadmap = await roadmap.save();

      res.status(200).json({
        success: true,
        data: updatedRoadmap,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // // Add resources to a module
  // async addResources(req, res) {
  //   try {
  //     const { resources } = req.body;
  //     const roadmap = await Roadmap.findById(req.params.id);

  //     if (!roadmap) {
  //       return res.status(404).json({
  //         success: false,
  //         error: "Roadmap not found",
  //       });
  //     }

  //     roadmap.Modules.resources.push(...resources);
  //     const updatedRoadmap = await roadmap.save();

  //     res.status(200).json({
  //       success: true,
  //       data: updatedRoadmap,
  //     });
  //   } catch (error) {
  //     res.status(400).json({
  //       success: false,
  //       error: error.message,
  //     });
  //   }
  // }

  // Delete a module
  async deleteRoadmap(req, res) {
    try {
      const roadmap = await Roadmap.findByIdAndDelete(req.params.id);

      if (!roadmap) {
        return res.status(404).json({
          success: false,
          error: "Roadmap not found",
        });
      }
      // Check if user owns the course
      if (roadmap.uId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: "User not authorized to delete this roadmap",
        });
      }
      await roadmap.deleteOne();

      res.status(200).json({
        success: true,
        message: "Roadmap deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new RoadmapController();

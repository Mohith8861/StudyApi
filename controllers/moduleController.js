const Course = require("../models/course");
const Module = require("../models/module");
const Resource = require("../models/resource");
const Topic = require("../models/topic");
const { stack } = require("../routes/moduleRoutes");

class ModuleController {
  // Create a new module
  async createModule(req, res) {
    try {
      if (req.body.hasOwnProperty("topics")) {
        delete req.body.topics;
      }
      if (req.body.hasOwnProperty("resources")) {
        delete req.body.resources;
      }
      const course = await Course.findById(req.body.courseId);
      // Check if user owns the course
      if (course.uId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: "User not authorized to edit this course modules",
        });
      }

      const module = new Module(req.body);

      course.modules.push(module.id);
      await course.save();
      await module.save();

      res.status(201).json({
        success: true,
        data: module,
      });
    } catch (error) {
      Error.captureStackTrace(error);
      res.status(400).json({
        success: false,
        error: error.message,
        stack: error.stack,
      });
    }
  }

  // Get all modules
  async getAllModules(req, res) {
    try {
      const modules = await Module.find().populate("resources").populate({
        path: "topics",
        populate: "resources",
      });

      res.status(200).json({
        success: true,
        count: modules.length,
        data: modules,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get single module
  async getModule(req, res) {
    try {
      const module = await Module.findById(req.params.id)
        .populate("resources")
        .populate({
          path: "topics",
          populate: "resources",
        });

      if (!module) {
        return res.status(404).json({
          success: false,
          error: "Module not found",
        });
      }

      res.status(200).json({
        success: true,
        data: module,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Update module
  async updateModule(req, res) {
    try {
      if (req.body.hasOwnProperty("topics")) {
        delete req.body.topics;
      }
      if (req.body.hasOwnProperty("resources")) {
        delete req.body.resources;
      }
      if (req.body.hasOwnProperty("courseId")) {
        delete req.body.courseId;
      }
      if (req.body.hasOwnProperty("uId")) {
        delete req.body.uId;
      }
      const module = await Module.findById(req.params.id);

      if (!module) {
        return res.status(404).json({
          success: false,
          error: "Module not found",
        });
      }
      if (module.uId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: "User not authorized to edit this course modules",
        });
      }
      module.updateOne(req.body, {
        new: true,
        runValidators: true,
      });
      res.status(200).json({
        success: true,
        data: module,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Delete module
  async deleteModule(req, res) {
    try {
      const module = await Module.findById(req.params.id);

      if (!module) {
        return res.status(404).json({
          success: false,
          error: "Module not found",
        });
      }
      if (module.uId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: "User not authorized to delete this module",
        });
      }
      let course = await Course.findById(module.courseId);
      await module.deleteOne();
      await course.updateOne({
        $pull: {
          modules: module.id,
        },
      });
      res.status(200).json({
        success: true,
        data: {},
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Add resource to module
  async addResource(req, res) {
    try {
      const resource = await Resource.findById(req.body.resourceId);
      if (!resource) {
        return res.status(404).json({
          success: false,
          error: "resource not found",
        });
      }
      const module = await Module.findById(req.body.moduleId);

      if (!module) {
        return res.status(404).json({
          success: false,
          error: "Module not found",
        });
      }
      module.resources.push(resource.id);
      module.save();

      res.status(200).json({
        success: true,
        data: module,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Update module progress
  async updateProgress(req, res) {
    try {
      const module = await Module.findByIdAndUpdate(
        req.params.id,
        { progress: req.body.progress },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!module) {
        return res.status(404).json({
          success: false,
          error: "Module not found",
        });
      }

      res.status(200).json({
        success: true,
        data: module,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Add topic to module
  async addTopic(req, res) {
    try {
      let topic = await Topic.findById(req.params.id);
      if (!topic) {
        return res.status(404).json({
          success: false,
          error: "topic not found",
        });
      }
      const module = await Module.findByIdAndUpdate(
        req.params.moduleId,
        { $addToSet: { topics: req.params.topicId } },
        { new: true }
      );

      if (!module) {
        return res.status(404).json({
          success: false,
          error: "Module not found",
        });
      }
      topic.moduleId = module.id;
      topic.save();

      res.status(200).json({
        success: true,
        data: module,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new ModuleController();

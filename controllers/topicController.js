const { Model } = require("mongoose");
const Topic = require("../models/topic");
const Module = require("../models/module");
const Resource = require("../models/resource");

class TopicController {
  // Create a new topic
  async createTopic(req, res) {
    try {
      const topic = new Topic(req.body);
      let module = await Module.findById(topic.moduleId);
      module.topics.push(topic.id);
      await topic.save();
      await module.save();

      res.status(201).json({
        success: true,
        data: topic,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get all topics
  async getAllTopics(req, res) {
    try {
      const topics = await Topic.find().populate("resources");

      res.status(200).json({
        success: true,
        count: topics.length,
        data: topics,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get single topic
  async getTopic(req, res) {
    try {
      const topic = await Topic.findById(req.params.id).populate("resources");

      if (!topic) {
        return res.status(404).json({
          success: false,
          error: "Topic not found",
        });
      }

      res.status(200).json({
        success: true,
        data: topic,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Update topic
  async updateTopic(req, res) {
    try {
      if (req.body.hasOwnProperty("resources")) {
        delete req.body.resources;
      }
      if (req.body.hasOwnProperty("moduleId")) {
        delete req.body.moduleId;
      }
      const topic = await Topic.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!topic) {
        return res.status(404).json({
          success: false,
          error: "Topic not found",
        });
      }

      res.status(200).json({
        success: true,
        data: topic,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Delete topic
  async deleteTopic(req, res) {
    try {
      const topic = await Topic.findById(req.params.id);

      if (!topic) {
        return res.status(404).json({
          success: false,
          error: "Topic not found",
        });
      }
      let module = await Module.findById(topic.moduleId);
      await topic.deleteOne();
      await module.updateOne({
        $pull: { topics: module.id },
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

  // Add resource to topic
  async addResource(req, res) {
    try {
      const resource = await Resource.findById(req.body.resourceId);
      if (!resource) {
        return res.status(404).json({
          success: false,
          error: "resource not found",
        });
      }

      const topic = await Topic.findById(req.body.topicId);

      if (!topic) {
        return res.status(404).json({
          success: false,
          error: "Topic not found",
        });
      }

      topic.resources.push(resource.id);
      topic.save();

      res.status(200).json({
        success: true,
        data: topic,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get topics by difficulty
  async getTopicsByDifficulty(req, res) {
    try {
      const topics = await Topic.find({
        difficulty: req.params.difficulty,
      }).populate("resources");

      res.status(200).json({
        success: true,
        count: topics.length,
        data: topics,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new TopicController();
// // controllers/topicController.js
// const Topic = require("../models/topic");
// const Module = require("../models/module");
// const Course = require("../models/course");

// exports.createTopic = async (req, res, next) => {
//   try {
//     const { moduleId } = req.params;
//     const module = await Module.findById(moduleId);

//     if (!module) {
//       return next(new AppError("No module found with that ID", 404));
//     }

//     // Find the course that contains this module
//     const course = await Course.findOne({ modules: moduleId });
//     if (!course) {
//       return next(
//         new AppError("Module is not associated with any course", 404)
//       );
//     }

//     // Check if user owns the course
//     if (course.uId.toString() !== req.user._id.toString()) {
//       return next(
//         new AppError(
//           "You do not have permission to add topics to this module",
//           403
//         )
//       );
//     }

//     const topic = await Topic.create(req.body);

//     // Add topic to module
//     await Module.findByIdAndUpdate(moduleId, { $push: { topics: topic._id } });

//     res.status(201).json({
//       status: "success",
//       data: { topic },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// exports.updateTopic = async (req, res, next) => {
//   try {
//     const topic = await Topic.findById(req.params.id);
//     if (!topic) {
//       return next(new AppError("No topic found with that ID", 404));
//     }

//     // Find the module that contains this topic
//     const module = await Module.findOne({ topics: req.params.id });
//     if (!module) {
//       return next(new AppError("Topic is not associated with any module", 404));
//     }

//     // Find the course that contains this module
//     const course = await Course.findOne({ modules: module._id });
//     if (!course) {
//       return next(
//         new AppError("Module is not associated with any course", 404)
//       );
//     }

//     // Check if user owns the course
//     if (course.uId.toString() !== req.user._id.toString()) {
//       return next(
//         new AppError("You do not have permission to modify this topic", 403)
//       );
//     }

//     const updatedTopic = await Topic.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     );

//     res.status(200).json({
//       status: "success",
//       data: { topic: updatedTopic },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// exports.deleteTopic = async (req, res, next) => {
//   try {
//     const topic = await Topic.findById(req.params.id);
//     if (!topic) {
//       return next(new AppError("No topic found with that ID", 404));
//     }

//     // Find the module that contains this topic
//     const module = await Module.findOne({ topics: req.params.id });
//     if (!module) {
//       return next(new AppError("Topic is not associated with any module", 404));
//     }

//     // Find the course that contains this module
//     const course = await Course.findOne({ modules: module._id });
//     if (!course) {
//       return next(
//         new AppError("Module is not associated with any course", 404)
//       );
//     }

//     // Check if user owns the course
//     if (course.uId.toString() !== req.user._id.toString()) {
//       return next(
//         new AppError("You do not have permission to delete this topic", 403)
//       );
//     }

//     await Topic.findByIdAndDelete(req.params.id);

//     // Remove topic from module
//     await Module.findByIdAndUpdate(module._id, {
//       $pull: { topics: req.params.id },
//     });

//     res.status(204).json({
//       status: "success",
//       data: null,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

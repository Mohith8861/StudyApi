const Course = require("../models/course");
const User = require("../models/user");
const Module = require("../models/module");
const Topic = require("../models/topic");

class CourseController {
  // Create a new course
  async createCourse(req, res) {
    if (req.body.hasOwnProperty("modules")) {
      delete req.body.modules;
    }
    try {
      let course = new Course(req.body);
      await course.save();

      res.status(201).json({
        success: true,
        data: course,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get all courses
  async getAllCourses(req, res) {
    try {
      const courses = await Course.find()
        .populate("uId", "name email")
        .populate({
          path: "modules",
          populate: {
            path: "topics",
            populate: "resources",
          },
        });

      res.status(200).json({
        success: true,
        count: courses.length,
        data: courses,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get single course
  async getCourse(req, res) {
    try {
      const course = await Course.findById(req.params.id)
        .populate("uId", "name email")
        .populate({
          path: "modules",
          populate: {
            path: "topics",
            populate: "resources",
          },
        });

      if (!course) {
        return res.status(404).json({
          success: false,
          error: "Course not found",
        });
      }

      res.status(200).json({
        success: true,
        data: course,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Update course
  async updateCourse(req, res) {
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
          error: "User not authorized to update this course",
        });
      }
      if (req.body.hasOwnProperty("modules")) {
        delete req.body.modules;
      }

      const updatedCourse = await Course.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      res.status(200).json({
        success: true,
        data: updatedCourse,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Delete course
  async deleteCourse(req, res) {
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

      await course.deleteOne();

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

  // Get courses by field
  async getCoursesByField(req, res) {
    try {
      const courses = await Course.find({ field: req.params.field })
        .populate("uId", "name email")
        .populate({
          path: "modules",
          populate: {
            path: "topics",
            populate: "resources",
          },
        });

      res.status(200).json({
        success: true,
        count: courses.length,
        data: courses,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async searchCourses(req, res) {
    try {
      let searchQuery = req.query.q || "";
      let page = req.query.page || 1;
      let limit = req.query.limit || 10;
      let sortField = req.query.sort || "name";
      let sortOrder = req.query.ord || "asc";
      let filterField = req.query.field || "";

      // Convert page and limit to numbers and handle invalid inputs
      const currentPage = Math.max(1, parseInt(page));
      const itemsPerPage = Math.max(1, parseInt(limit));
      const skip = (currentPage - 1) * itemsPerPage;

      // Build search criteria
      const searchCriteria = searchQuery
        ? { $text: { $search: searchQuery } }
        : {};

      if (req.query.field) {
        searchCriteria.field = filterField;
      }
      // Build sort configuration
      const sortConfig = searchQuery
        ? { score: { $meta: "textScore" } } // Sort by relevance if there's a search query
        : { [sortField]: sortOrder === "desc" ? -1 : 1 };

      // Execute search query with sorting and pagination
      const courses = await Course.find(
        searchCriteria
        // Add relevance score to results
      )
        .sort(sortConfig)
        .skip(skip)
        .limit(itemsPerPage)
        .populate("uId", "name email") // Populate basic user info
        .lean(); // Convert to plain JavaScript objects

      // Get total count for pagination
      const totalCourses = await Course.countDocuments(searchCriteria);
      const totalPages = Math.ceil(totalCourses / itemsPerPage);

      res.status(200).json({
        success: true,
        courses,
        pagination: {
          currentPage,
          itemsPerPage,
          totalCourses,
          totalPages,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get course by slug
  async getCourseBySlug(req, res) {
    try {
      const course = await Course.findOne({ slug: req.params.slug })
        .populate("uId", "name email")
        .populate({
          path: "modules",
          populate: {
            path: "topics",
            populate: "resources",
          },
        });

      if (!course) {
        return res.status(404).json({
          success: false,
          error: "Course not found",
        });
      }

      res.status(200).json({
        success: true,
        data: course,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Add module to course
  async addModule(req, res) {
    try {
      const module = await Module.findById(req.params.moduleId);
      if (!module) {
        return res.status(404).json({
          success: false,
          error: "Module not found",
        });
      }
      let course = await Course.findById(req.params.courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: "Course not found",
        });
      }
      if (course.uId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: "User not authorized to delete this course",
        });
      }
      course = await course.updateOne(
        { $addToSet: { modules: req.params.moduleId } },
        { new: true }
      );

      module.courseId = course.id;
      module.save();

      res.status(200).json({
        success: true,
        data: course,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new CourseController();
// const Course = require("../models/course");
// // Controller methods
// const courseController = {
//   // Create a new course
//   async createCourse(req, res) {
//     try {
//       const courseData = {
//         ...req.body,
//         createdBy: req.user._id,
//       };

//       const course = await Course.create(courseData);
//       res.status(201).json({
//         success: true,
//         data: course,
//       });
//     } catch (error) {
//       res.status(400).json({
//         success: false,
//         error: error.message,
//       });
//     }
//   },

//   // Get all courses with filtering and sorting
//   async getCourses(req, res) {
//     try {
//       const page = parseInt(req.query.page, 10) || 1;
//       const limit = parseInt(req.query.limit, 10) || 10;
//       const skip = (page - 1) * limit;

//       const query = {};

//       // Apply filters
//       if (req.query.difficulty) {
//         query.difficulty = req.query.difficulty;
//       }
//       if (req.query.search) {
//         query.name = { $regex: req.query.search, $options: "i" };
//       }
//       if (req.query.category) {
//         query.category = req.query.category;
//       }

//       const courses = await Course.find(query)
//         .populate("createdBy", "name email")
//         .populate("category", "name")
//         .skip(skip)
//         .limit(limit)
//         .sort(req.query.sort || "-createdAt");

//       const total = await Course.countDocuments(query);

//       res.status(200).json({
//         success: true,
//         data: courses,
//         pagination: {
//           page,
//           limit,
//           total,
//           pages: Math.ceil(total / limit),
//         },
//       });
//     } catch (error) {
//       res.status(400).json({
//         success: false,
//         error: error.message,
//       });
//     }
//   },

//   // Get single course by ID or slug
//   async getCourse(req, res) {
//     try {
//       const query = req.params.slug
//         ? { slug: req.params.slug }
//         : { _id: req.params.id };

//       const course = await Course.findOne(query)
//         .populate("createdBy", "name email")
//         .populate("category", "name");

//       if (!course) {
//         return res.status(404).json({
//           success: false,
//           error: "Course not found",
//         });
//       }

//       res.status(200).json({
//         success: true,
//         data: course,
//       });
//     } catch (error) {
//       res.status(400).json({
//         success: false,
//         error: error.message,
//       });
//     }
//   },

//   // Update course
//   async updateCourse(req, res) {
//     try {
//       const course = await Course.findById(req.params.id);

//       if (!course) {
//         return res.status(404).json({
//           success: false,
//           error: "Course not found",
//         });
//       }

//       // Check if user is course creator or admin
//       if (
//         course.createdBy.toString() !== req.user._id.toString() &&
//         req.user.role !== "admin"
//       ) {
//         return res.status(403).json({
//           success: false,
//           error: "Not authorized to update this course",
//         });
//       }

//       const updatedCourse = await Course.findByIdAndUpdate(
//         req.params.id,
//         req.body,
//         {
//           new: true,
//           runValidators: true,
//         }
//       );

//       res.status(200).json({
//         success: true,
//         data: updatedCourse,
//       });
//     } catch (error) {
//       res.status(400).json({
//         success: false,
//         error: error.message,
//       });
//     }
//   },

//   // Delete course
//   async deleteCourse(req, res) {
//     try {
//       const course = await Course.findById(req.params.id);

//       if (!course) {
//         return res.status(404).json({
//           success: false,
//           error: "Course not found",
//         });
//       }

//       // Check if user is course creator or admin
//       if (
//         course.createdBy.toString() !== req.user._id.toString() &&
//         req.user.role !== "admin"
//       ) {
//         return res.status(403).json({
//           success: false,
//           error: "Not authorized to delete this course",
//         });
//       }

//       await course.remove();

//       res.status(200).json({
//         success: true,
//         data: {},
//       });
//     } catch (error) {
//       res.status(400).json({
//         success: false,
//         error: error.message,
//       });
//     }
//   },

//   // Add module to course
//   async addModule(req, res) {
//     try {
//       const course = await Course.findById(req.params.id);

//       if (!course) {
//         return res.status(404).json({
//           success: false,
//           error: "Course not found",
//         });
//       }

//       course.modules.push(req.body);
//       await course.save();

//       res.status(200).json({
//         success: true,
//         data: course,
//       });
//     } catch (error) {
//       res.status(400).json({
//         success: false,
//         error: error.message,
//       });
//     }
//   },

//   // Add topic to module
//   async addTopic(req, res) {
//     try {
//       const course = await Course.findById(req.params.courseId);

//       if (!course) {
//         return res.status(404).json({
//           success: false,
//           error: "Course not found",
//         });
//       }

//       const module = course.modules.id(req.params.moduleId);
//       if (!module) {
//         return res.status(404).json({
//           success: false,
//           error: "Module not found",
//         });
//       }

//       module.topics.push(req.body);
//       await course.save();

//       res.status(200).json({
//         success: true,
//         data: course,
//       });
//     } catch (error) {
//       res.status(400).json({
//         success: false,
//         error: error.message,
//       });
//     }
//   },
// };

// module.exports = courseController;

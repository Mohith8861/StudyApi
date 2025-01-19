const Resource = require("../models/resource");
const User = require("../models/user");

class ResourceController {
  // Create a new resource
  async createResource(req, res) {
    try {
      console.log(req.user, "\n", req.body);
      const resource = new Resource({
        ...req.body,
        createdBy: req.user.id,
      });

      await resource.save();

      // Add resource to user's resources array
      await User.findByIdAndUpdate(req.user.id, {
        $push: { resources: resource.id },
      });

      res.status(201).json({
        success: true,
        data: resource,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get all resources
  async getAllResources(req, res) {
    try {
      const resources = await Resource.find().populate("createdBy", "name");

      res.status(200).json({
        success: true,
        count: resources.length,
        data: resources,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getResourcesByUser(req, res) {
    try {
      const resources = await Resource.find({
        createdBy: req.params.userId,
      }).populate("createdBy", "name");

      res.status(200).json({
        success: true,
        count: resources.length,
        data: resources,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get single resource
  async getResource(req, res) {
    try {
      const resource = await Resource.findById(req.params.id).populate(
        "createdBy",
        "name"
      );

      if (!resource) {
        return res.status(404).json({
          success: false,
          error: "Resource not found",
        });
      }

      res.status(200).json({
        success: true,
        data: resource,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Update resource
  async updateResource(req, res) {
    try {
      const resource = await Resource.findById(req.params.id);

      if (!resource) {
        return res.status(404).json({
          success: false,
          error: "Resource not found",
        });
      }

      // Check if user owns the resource
      if (resource.createdBy.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: "User not authorized to update this resource",
        });
      }

      const updatedResource = await Resource.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      res.status(200).json({
        success: true,
        data: updatedResource,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Delete resource
  async deleteResource(req, res) {
    try {
      const resource = await Resource.findById(req.params.id);

      if (!resource) {
        return res.status(404).json({
          success: false,
          error: "Resource not found",
        });
      }

      // Check if user owns the resource
      if (resource.createdBy.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: "User not authorized to delete this resource",
        });
      }

      await resource.remove();

      // Remove resource from user's resources array
      await User.findByIdAndUpdate(req.user.id, {
        $pull: { resources: resource._id },
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
}

module.exports = new ResourceController();

// const Resource = require("../models/resource");
// const User = require("../models/user");

// const resourceController = {
//   // Create a new resource
//   createResource: async (req, res) => {
//     try {
//       const user = await User.findById(req.body.createdBy);
//       if (!user) {
//         return res.status(404).json({ error: "User not found" });
//       }

//       const resource = new Resource(req.body);
//       await resource.save();

//       user.resources.push(resource._id);
//       await user.save();

//       res.status(201).json(resource);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   },

//   // Get all resource
//   getAllResource: async (req, res) => {
//     try {
//       const resource = await Resource.find().populate(
//         "createdBy",
//         "name email"
//       );
//       res.json(resource);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // Get a single resource by ID
//   getResourceById: async (req, res) => {
//     try {
//       const resource = await Resource.findById(req.params.id).populate(
//         "createdBy",
//         "name email"
//       );
//       if (!resource) {
//         return res.status(404).json({ error: "Resource not found" });
//       }
//       res.json(resource);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // Get resource by user ID
//   getResourceByUser: async (req, res) => {
//     try {
//       const resource = await Resource.find({
//         createdBy: req.params.userId,
//       }).populate("createdBy", "name email");
//       res.json(resource);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // Update a resource
//   updateResource: async (req, res) => {
//     const updates = Object.keys(req.body);
//     const allowedUpdates = ["name", "drive_link", "size"];
//     const isValidOperation = updates.every((update) =>
//       allowedUpdates.includes(update)
//     );

//     if (!isValidOperation) {
//       return res.status(400).json({ error: "Invalid updates!" });
//     }

//     try {
//       const resource = await Resource.findById(req.params.id);
//       if (!resource) {
//         return res.status(404).json({ error: "Resource not found" });
//       }

//       updates.forEach((update) => (resource[update] = req.body[update]));
//       await resource.save();
//       res.json(resource);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   },

//   // Delete a resource
//   deleteResource: async (req, res) => {
//     try {
//       const resource = await Resource.findById(req.params.id);
//       if (!resource) {
//         return res.status(404).json({ error: "Resource not found" });
//       }

//       // Remove resource reference from user
//       await User.findByIdAndUpdate(resource.createdBy, {
//         $pull: { resource: resource._id },
//       });

//       await resource.deleteOne();
//       res.json({ message: "Resource deleted successfully" });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },
// };

// module.exports = resourceController;

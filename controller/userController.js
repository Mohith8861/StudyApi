const User = require("../models/user");

class UserController {
  // Create a new user
  async createUser(req, res) {
    try {
      const user = new User(req.body);
      await user.save();

      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get all users
  async getAllUsers(req, res) {
    try {
      const users = await User.find().select("-password");

      res.status(200).json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get single user
  async getUser(req, res) {
    try {
      const user = await User.findById(req.params.id).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Update user
  async updateUser(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }
      if (user.id.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: "User not authorized to update",
        });
      }
      if (req.body.name) {
        user.name = req.body.name;
      }
      await user.save();

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Delete user
  async deleteUser(req, res) {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }
      if (user.id.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: "User not authorized to update",
        });
      }
      await user.remove();

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

module.exports = new UserController();

// const User = require("../models/User");

// const userController = {
//   // Create a new user
//   createUser: async (req, res) => {
//     try {
//       const user = new User(req.body);
//       await user.save();
//       res.status(201).json(user);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   },

//   // Get all users
//   getAllUsers: async (req, res) => {
//     try {
//       const users = await User.find().populate("resources");
//       res.json(users);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // Get a single user by ID
//   getUserById: async (req, res) => {
//     try {
//       const user = await User.findById(req.params.id).populate("resources");
//       if (!user) {
//         return res.status(404).json({ error: "User not found" });
//       }
//       res.json(user);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // Update a user
//   updateUser: async (req, res) => {
//     const updates = Object.keys(req.body);
//     const allowedUpdates = ["name", "email"];
//     const isValidOperation = updates.every((update) =>
//       allowedUpdates.includes(update)
//     );

//     if (!isValidOperation) {
//       return res.status(400).json({ error: "Invalid updates!" });
//     }

//     try {
//       const user = await User.findById(req.params.id);
//       if (!user) {
//         return res.status(404).json({ error: "User not found" });
//       }

//       updates.forEach((update) => (user[update] = req.body[update]));
//       await user.save();
//       res.json(user);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   },

//   // Delete a user
//   deleteUser: async (req, res) => {
//     try {
//       const user = await User.findByIdAndDelete(req.params.id);
//       if (!user) {
//         return res.status(404).json({ error: "User not found" });
//       }
//       res.json({ message: "User deleted successfully" });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },
// };

// module.exports = userController;

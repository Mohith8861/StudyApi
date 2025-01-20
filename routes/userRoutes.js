const express = require("express");
const userController = require("./../controller/userController");
const authController = require("./../controller/authController");

const router = express.Router();

router.post("/signup", authController.signUp);
router.post("/login", authController.logIn);

router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword
);

// router.patch("/updateMe", authController.protect, userController.updateMe);
// router.delete("/deleteMe", authController.protect, userController.deleteMe);

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(authController.protect, userController.updateUser)
  .delete(authController.protect, userController.deleteUser);

module.exports = router;

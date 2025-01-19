const jwt = require("jsonwebtoken");

const { promisify } = require("util");

const user = require("../models/user");

// eslint-disable-next-line arrow-body-style
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (User, statusCode, message, res) => {
  const token = signToken(User._id);
  const cookieOptions = {
    expiresIn: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: false,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
  User.password = undefined;
  res.status(statusCode).json({
    status: "success",
    message,
    token,
    User,
  });
};

exports.signUp = async (req, res, next) => {
  const newUser = await user.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    role: req.body.role,
  });
  createSendToken(newUser, 200, "success", res);
};

exports.logIn = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new Error("Please provide email and password", 400));
  }
  const User = await user.findOne({ email }).select("+password");
  if (!User || !(await User.correctPassword(password, User.password))) {
    return next(new Error("Incorrect email or password", 401));
  }
  createSendToken(User, 200, "Success", res);
};

exports.logout = (req, res) => {
  res.cookie("jwt", "", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

exports.protect = async (req, res, next) => {
  let token;
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        new Error("You are not logged in! Please log in to get access.", 401)
      );
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await user.findById(decoded.id);
    if (!currentUser) {
      return next(
        new Error("The user belonging to this token does no longer exist.", 401)
      );
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new Error("User recently changed password! Please log in again.", 401)
      );
    }

    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (err) {
    return next();
  }
};

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      const currentUser = await user.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      res.locals.user = currentUser;

      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.updatePassword = async (req, res, next) => {
  const user1 = await user.findById(req.params.id).select("+password");
  if (!user1) {
    return next(new Error("User not found", 404));
  }
  if (!(await user1.correctPassword(req.body.password, user1.password))) {
    return next(new Error("Password entered is Incorrect", 400));
  }
  user1.password = req.body.password;
  user1.confirmPassword = req.body.confirmPassword;
  user1.save();
  createSendToken(user1, 200, "Password updated successfully", res);
};

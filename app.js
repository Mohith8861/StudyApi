// app.js
const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const topicRoutes = require("./routes/topicRoutes");
const moduleRoutes = require("./routes/moduleRoutes");
const courseRoutes = require("./routes/courseRoutes");
const globalErrorHandler = require("./globalErrorHandler");
require("dotenv").config();
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/resource", resourceRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/module", moduleRoutes);

// app.all('*', (req, res, next) => {
//   next(new AppError(`Cant find ${req.originalUrl} on this server!!`, 404));
// });

app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

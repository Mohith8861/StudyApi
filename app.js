// app.js
const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const courseRoutes = require("./routes/courseRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");
const mapRoutes = require("./routes/mapRoutes");
const globalErrorHandler = require("./globalErrorHandler");
require("dotenv").config();
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/resource", resourceRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/map", mapRoutes);

app.all("*", (req, res, next) => {
  next(new Error(`Cant find ${req.originalUrl} on this server!!`, 404));
});

app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

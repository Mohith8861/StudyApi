const { mongoose } = require("mongoose");

const roadmapSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  uId: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  Modules: [
    {
      Module: {
        type: String,
        required: true,
      },
      mid: {
        type: String,
        required: true,
      },
      Progress: {
        type: Number,
        required: true,
      },

      Topics: {
        Easy: [
          {
            tid: {
              type: String,
              required: true,
            },
            title: {
              type: String,
              required: true,
            },
            status: {
              type: String,
              required: true,
              enum: ["not-started", "in-progress", "completed"],
            },
          },
        ],
        Medium: [
          {
            tid: {
              type: String,
              required: true,
            },
            title: {
              type: String,
              required: true,
            },
            status: {
              type: String,
              required: true,
              enum: ["not-started", "in-progress", "completed"],
            },
          },
        ],
        Hard: [
          {
            tid: {
              type: String,
              required: true,
            },
            title: {
              type: String,
              required: true,
            },
            status: {
              type: String,
              required: true,
              enum: ["not-started", "in-progress", "completed"],
            },
          },
        ],
      },
    },
  ],
  resources: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
    },
  ],
});

const Roadmap = mongoose.model("Roadmap", roadmapSchema);
module.exports = Roadmap;

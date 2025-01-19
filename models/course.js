const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
      maxLength: [1000, "Description cannot be more than 1000 characters"],
    },
    uId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    field: {
      type: String,
      trim: true,
    },
    modules: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Module",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// courseSchema.virtual("totalDuration").get(function () {
//   let totalHours = 0;
//   let totalMinutes = 0;

//   this.modules.forEach((module) => {
//     totalHours += module.duration.hours || 0;
//     totalMinutes += module.duration.minutes || 0;
//   });

//   totalHours += Math.floor(totalMinutes / 60);
//   totalMinutes = totalMinutes % 60;

//   return { hours: totalHours, minutes: totalMinutes };
// });

// Generate slug before saving
courseSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-");
  }
  next();
});

// courseSchema.pre("save", function (next) {});

courseSchema.index(
  { name: "text", slug: "text" },
  {
    weights: {
      name: 2,
      slug: 1,
    },
  }
);

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;

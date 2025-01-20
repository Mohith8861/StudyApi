const mongoose = require("mongoose");

const mapSchema = new mongoose.Schema({
  entityId: {
    type: mongoose.Schema.ObjectId,
    require: true,
  },
  entityType: {
    type: String,
    require: true,
    enum: ["Roadmap", "Topic"],
  },
  resourceId: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: "Resource",
  },
});

const Map = mongoose.model("Map", mapSchema);
module.exports = Map;

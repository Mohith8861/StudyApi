const mongoose = require("mongoose");

const mapSchema = new mongoose.Schema({
  entityId: {
    type: mongoose.Schema.ObjectId,
    require: true,
  },
  resourceId: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: "Resource",
  },
});

const Map = mongoose.model("Map", mapSchema);
module.exports = Map;

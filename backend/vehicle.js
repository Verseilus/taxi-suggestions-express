const mongoose = require("mongoose");

// define Mongoose schema with validation
const vehicleSchema = new mongoose.Schema({
  capacity: {
    type: Number,
    validate: {
      validator: Number.isInteger,
      message: "{VALUE} is not an integer value",
    },
    min: [1, "Must be greater than 0, got {VALUE}"],
    required: true,
  },
  range: {
    type: Number,
    min: [1, "Must be greater than 0, got {VALUE}"],
    required: true,
  },
  fuel: {
    type: String,
    enum: ["gasoline", "mild hybrid", "pure electric"],
    required: true,
  },
});

// create and export Mongoose model for MongoDB
const Vehicle = mongoose.model("Vehicle", vehicleSchema);
module.exports = Vehicle;

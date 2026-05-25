const mongoose = require("mongoose");

// Faculty Schema
const facultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

// IMPORTANT: correct export
module.exports = mongoose.model("Faculty", facultySchema);
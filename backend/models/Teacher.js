// Teacher model

const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    default: "teacher",
  },
});

module.exports = mongoose.model("Teacher", teacherSchema);
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },

  rollNumber: { type: String, required: true, unique: true },

  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty",
    required: true,
  },

  semester: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
},
});

module.exports = mongoose.model("Student", studentSchema);



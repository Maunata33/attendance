// Attendance model

const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },

  status: {
    type: String,
    enum: ["Present", "Absent"],
    required: true,
  },

date: {
  type: Date,
  default: Date.now,
},
});

module.exports = mongoose.model("Attendance", attendanceSchema);
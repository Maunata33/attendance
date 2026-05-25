const Teacher = require("./models/Teacher");
const Attendance = require("./models/Attendance");
const User = require("./models/User");
const Student = require("./models/Student");
const Faculty = require("./models/Faculty");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// =====================
// JWT TOKEN GENERATOR
// =====================
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      username: user.username,
    },
    "SECRET_KEY",
    { expiresIn: "1d" }
  );
};

// =====================
// VERIFY TOKEN MIDDLEWARE
// =====================
const verifyToken = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth) {
    return res.status(401).json({
      message: "No token provided",
    });
  }

  try {
    const token = auth.split(" ")[1];

    const decoded = jwt.verify(token, "SECRET_KEY");

    req.user = decoded;

    next();

  } catch (err) {
    res.status(401).json({
      message: "Invalid token",
    });
  }
};

// =====================
// MONGODB CONNECTION
// =====================
console.log("MONGO URI:", process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected SUCCESS");
  })
  .catch((err) => {
    console.log("MongoDB FAILED:");
    console.log(err);
  });

// =====================
// CREATE ADMIN (TEMP)
// =====================

// =====================
// REGISTER
// =====================
app.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = await User.create({
      username: req.body.username,
      password: hashedPassword,
      role: req.body.role || "admin",
    });

    res.json(user);

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// =====================
// LOGIN
// =====================
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("BODY:", req.body);

    // CHECK USERS
    let user = await User.findOne({ username });

    // CHECK TEACHERS
    if (!user) {
      user = await Teacher.findOne({ username });
    }

    let student = null;

if (user.role === "student") {
  student = await Student.findOne({ userId: user._id });

  if (!student) {
    console.log("❌ No student linked to this user");
  }
}

    console.log("FOUND USER:", user);

    // USER NOT FOUND
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // PASSWORD CHECK
    const isMatch = password === user.password;

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    // GENERATE TOKEN
    const token = generateToken(user);

    // RESPONSE
    res.json({
  message: "Login successful",
  token,
  user: {
    id: user._id,
    username: user.username,
    role: user.role,
    studentId: student ? student._id : null, // 🔥 IMPORTANT
  },
});

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// =====================
// ADD STUDENT
// =====================
app.post("/students", async (req, res) => {
  try {
    const student = await Student.create(req.body);

    res.json(student);

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// =====================
// GET STUDENTS
// =====================
app.get("/students", verifyToken, async (req, res) => {
  try {
    const students = await Student.find().populate("faculty");

    res.json(students);

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// =====================
// ADD ATTENDANCE
// =====================
app.post("/attendance", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize date

    const existing = await Attendance.findOne({
      studentId: req.body.studentId,
      date: today,
    });

    if (existing) {
      return res.status(400).json({
        message: "Already marked today",
      });
    }

    const attendance = await Attendance.create({
      studentId: req.body.studentId,
      status:
        req.body.status === "present" ? "Present" : "Absent",
      date: today,
    });

    res.json(attendance);
  } catch (error) {
    if (error.code === 11000) {
      const fields = Object.keys(error.keyPattern || {}).join(", ");
      return res.status(400).json({
        message: `${fields} already exists. Please choose a different value.`,
      });
    }

    res.status(500).json({ error: error.message });
  }
});

// =====================
// GET ATTENDANCE
// =====================
app.get("/attendance/:studentId", async (req, res) => {
  try {
    const attendance = await Attendance.find({
      studentId: req.params.studentId,
    });

    res.json(attendance);

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// =====================
// ATTENDANCE SUMMARY
// =====================
app.get("/attendance-summary/:studentId", async (req, res) => {
  try {
    const records = await Attendance.find({
      studentId: req.params.studentId,
    });

    const totalClasses = records.length;

    const presentCount = records.filter(
      (record) => record.status === "present"
    ).length;

    const absentCount = records.filter(
      (record) => record.status === "absent"
    ).length;

    const percentage =
      totalClasses === 0
        ? 0
        : ((presentCount / totalClasses) * 100).toFixed(2);

    res.json({
      totalClasses,
      presentCount,
      absentCount,
      percentage,
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

app.get("/report", async (req, res) => {
  try {
    const { studentId, faculty, semester } = req.query;

    let attendanceFilter = {};

    // =========================
    // STUDENT REPORT FILTER
    // =========================
    if (studentId) {
      attendanceFilter.studentId = studentId;
    }

    // =========================
    // FACULTY + SEMESTER FILTER
    // =========================
    if (faculty || semester) {

      let studentFilter = {};

      if (faculty) {
        studentFilter.faculty = faculty;
      }

      if (semester) {
        studentFilter.semester = semester;
      }

      const students = await Student.find(studentFilter);

      const studentIds = students.map((s) => s._id);

      attendanceFilter.studentId = {
        $in: studentIds,
      };
    }

    // =========================
    // GET ATTENDANCE
    // =========================
    const records = await Attendance.find(attendanceFilter)
      .populate("studentId");

    const grouped = {};

    records.forEach((r) => {

      const id = r.studentId?._id?.toString();

      if (!id) return;

      if (!grouped[id]) {
        grouped[id] = {
          student: r.studentId,
          total: 0,
          present: 0,
          absent: 0,
          records: [],
        };
      }

      grouped[id].total += 1;

      grouped[id].records.push(r);

      if (r.status === "Present") {
        grouped[id].present += 1;
      }

      if (r.status === "Absent") {
        grouped[id].absent += 1;
      }
    });

    const result = Object.values(grouped).map((g) => ({
      ...g,
      percentage:
        g.total === 0
          ? 0
          : ((g.present / g.total) * 100).toFixed(2),
    }));

    res.json(result);

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// =====================
// GET USERS
// =====================
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();

    res.json(users);

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// =====================
// ADD FACULTY
// =====================
app.post("/faculties", async (req, res) => {
  try {
    const faculty = await Faculty.create(req.body);

    res.json(faculty);

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// =====================
// GET FACULTIES
// =====================
app.get("/faculties", async (req, res) => {
  try {
    const faculties = await Faculty.find();

    res.json(faculties);

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// =====================
// ADD TEACHER
// =====================
app.post("/teachers", async (req, res) => {
  try {
    const teacher = await Teacher.create(req.body);

    res.json(teacher);

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// GET ALL TEACHERS
app.get("/teachers", async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// GET REPORT
// =====================
app.get("/report/:studentId", async (req, res) => {
  try {
    const studentId = req.params.studentId;

    const totalClasses = await Attendance.countDocuments({
      studentId,
    });

    const presentCount = await Attendance.countDocuments({
      studentId,
      status: { $in: ["Present", "present"] },
    });

    const absentCount = await Attendance.countDocuments({
      studentId,
      status: { $in: ["Absent", "absent"] },
    });

    const percentage =
      totalClasses === 0
        ? 0
        : ((presentCount / totalClasses) * 100).toFixed(2);

    res.json({
      totalClasses,
      presentCount,
      absentCount,
      percentage,
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

app.post("/create-student-user", async (req, res) => {
  const user = await User.create({
    username: req.body.username,
    password: req.body.password,
    role: "student",
  });

  res.json(user);
});

app.post("/admin/create-student", async (req, res) => {
  try {
    console.log("[route] POST /admin/create-student called");
    console.log("[route] body:", req.body);

    try {
      const { username, password, name, rollNumber, faculty, semester } =
        req.body;

    if (
      !username ||
      !password ||
      !name ||
      !rollNumber ||
      !faculty ||
      !semester
    ) {
      return res.status(400).json({
        message: "All student creation fields are required.",
      });
    }

    // 1. create login user
    const user = await User.create({
      username,
      password, // (later we can hash this)
      role: "student",
    });

    // 2. create student profile
    const student = await Student.create({
      name,
      rollNumber,
      faculty,
      semester,
      userId: user._id,
    });

    res.json({
      message: "Student created successfully",
      user,
      student,
    });
  } catch (error) {
    console.error("[route] /admin/create-student error:", error);

      if (error.code === 11000) {
        const fields = Object.keys(error.keyPattern || {}).join(", ");
        return res.status(400).json({
          message: `${fields} already exists. Please choose a different value.`,
        });
      }

      return res.status(500).json({
        message: "Internal server error while creating student",
        detail: error.message,
      });
  }
  }catch(error){
    console.log(error);
    
  }
});
// =====================
// GET ALL ATTENDANCE (FIX FOR TEACHER DASHBOARD)
// =====================
app.get("/attendance", async (req, res) => {
  try {
    const records = await Attendance.find();
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// HOME
// =====================
app.get("/", (req, res) => {
  res.send("Attendance Backend Running");
});

// =====================
// SERVER
// =====================
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


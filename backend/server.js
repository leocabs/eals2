const express = require("express");
const db = require("./db");
const studentRoutes = require("./StudentManagementServer");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(
  cors({
    origin: "http://localhost:5173", // Vite frontend
    credentials: true,
  })
);

app.use(express.json());

app.use("/students", studentRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Fetch all users
app.get("/users", (req, res) => {
  db.query("SELECT * FROM students", (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error retrieving users");
    } else {
      res.json(result);
    }
  });
});

// Login route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // 1. Check in students table
  const studentQuery =
    "SELECT * FROM students WHERE als_email = ? AND password = ?";
  db.query(studentQuery, [email, password], (err, studentResults) => {
    if (err) {
      console.error("Student query error:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }

    if (studentResults.length > 0) {
      const student = studentResults[0];
      return res.json({
        success: true,
        message: "Login successful",
        role: "student",
        user: {
          id: student.student_id,
          firstName: student.first_name,
          lastName: student.last_name,
          email: student.email,
          role_id: student.role_id,
          profile_pic: student.profile_pic,
        },
      });
    }

    // 2. Check in admin table
    const adminQuery = "SELECT * FROM admin WHERE email = ? AND password = ?";
    db.query(adminQuery, [email, password], (err, adminResults) => {
      if (err) {
        console.error("Admin query error:", err);
        return res
          .status(500)
          .json({ success: false, message: "Server error" });
      }

      if (adminResults.length > 0) {
        const admin = adminResults[0];
        return res.json({
          success: true,
          message: "Login successful",
          role: "admin",
          user: {
            id: admin.admin_id,
            name: admin.admin_name,
            email: admin.email,
            role_id: admin.role_id,
          },
        });
      }

      // 3. Check in teachers table
      const teacherQuery =
        "SELECT * FROM teachers WHERE email = ? AND password = ?";
      db.query(teacherQuery, [email, password], (err, teacherResults) => {
        if (err) {
          console.error("Teacher query error:", err);
          return res
            .status(500)
            .json({ success: false, message: "Server error" });
        }

        if (teacherResults.length > 0) {
          const teacher = teacherResults[0];
          return res.json({
            success: true,
            message: "Login successful",
            role: "teacher",
            user: {
              id: teacher.teacher_id,
              firstName: teacher.first_name,
              lastName: teacher.last_name,
              email: teacher.email,
              role_id: teacher.role_id,
            },
          });
        } else {
          return res
            .status(401)
            .json({ success: false, message: "Invalid credentials" });
        }
      });
    });
  });
});

//STUDENT MODULE
app.get("/student-dashboard", (req, res) => {
  const studentId = req.query.student_id; // ✅ Get student_id from URL query

  if (!studentId) {
    return res.status(400).json({ error: "student_id is required" });
  }

  const query = `
    SELECT u.student_id, u.first_name, u.last_name, r.role_name, u.email, u.date_of_birth, u.password  
    FROM students u
    INNER JOIN roles r ON u.role_id = r.role_id
    WHERE u.student_id = ?;
  `;

  db.query(query, [studentId], (err, results) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(results[0]);
  });
});

//AE Readiness Prediction --DSSystem
app.post("/save-prediction", (req, res) => {
  // Log the incoming request body for debugging
  console.log("Received prediction data:", req.body);

  // Destructure the data from the request body
  const {
    user_id,
    pis_score,
    flt_score,
    ls1_total_english,
    ls1_total_filipino,
    ls2_slct,
    ls3_mpss,
    ls4_lcs,
    ls5_uss,
    ls6_dc,
  } = req.body;

  // Get the current date for date_taken
  const date_taken = new Date();

  // SQL query to insert the data
  const query = `
  INSERT INTO assessment_scores (
    user_id, date_taken, pis_score, flt_score,
    ls1_total_english, ls1_total_filipino, 
    ls2_slct, ls3_mpss, ls4_lcs, ls5_uss, ls6_dc
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

  // Values array to pass to the query
  const values = [
    user_id,
    date_taken,
    pis_score,
    flt_score,
    ls1_total_english,
    ls1_total_filipino,
    ls2_slct,
    ls3_mpss,
    ls4_lcs,
    ls5_uss,
    ls6_dc,
  ];

  // Perform the query
  db.query(query, values, (err, results) => {
    if (err) {
      // Log the error for debugging
      console.error("Error saving prediction to database:", err);

      return res.status(500).json({
        message: "Error saving prediction.",
        error: err.message,
      });
    }
    console.log("Prediction saved successfully:", results);

    // Send the saved data back in the response
    res.status(200).json({
      message: "Prediction saved successfully.",
      data: req.body,
    });
  });
});

//Fetch questions
app.get("/questions", (req, res) => {
  db.query("SELECT * FROM questions", (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error retrieving users");
    } else {
      res.json(result);
    }
  });
});

//Submit answers
app.post("/api/submit", (req, res) => {
  const { subject, answers } = req.body;

  const ids = Object.keys(answers);
  const placeholders = ids.map(() => "?").join(",");
  const sql = `SELECT id, correct_answer FROM questions WHERE id IN (${placeholders})`;

  db.query(sql, ids, (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });

    let score = 0;
    rows.forEach((row) => {
      if (answers[row.id] === row.correct_answer) score++;
    });

    const percentage = Math.round((score / rows.length) * 100);
    const passed = percentage >= 70;

    res.json({ score: percentage, passed });
  });
});

// Mock Test Result Submission
app.post("/ae-mock-test-result", (req, res) => {
  const {
    student_id,
    total_time_taken,
    questions_answered,
    correct_answers,
    incorrect_answers,
    score,
    date_taken,
  } = req.body;

  // Check required fields
  if (
    !student_id ||
    total_time_taken == null ||
    questions_answered == null ||
    correct_answers == null ||
    incorrect_answers == null ||
    score == null ||
    !date_taken
  ) {
    return res.status(400).json({ error: "Missing or invalid fields." });
  }

  const insertQuery = `
      INSERT INTO \`eals\`.\`aemock_results\`
      (\`student_id\`, \`total_time_taken\`, \`questions_answered\`, \`correct_answers\`, \`incorrect_answers\`, \`score\`, \`date_taken\`)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

  const values = [
    student_id,
    total_time_taken,
    questions_answered,
    correct_answers,
    incorrect_answers,
    score,
    date_taken,
  ];

  db.query(insertQuery, values, (err, result) => {
    if (err) {
      console.error("Insert error:", err);
      return res.status(500).json({ error: "Failed to save result." });
    }

    return res.status(200).json({ success: true, score });
  });
});

// Fetch AE Mock Test Results
app.get("/aemock-results", (req, res) => {
  const studentId = req.headers["user_id"];

  if (!studentId) {
    console.error("Missing student_id");
    return res.status(400).json({ error: "student_id is required" });
  }

  const query = `
      SELECT * FROM aemock_results WHERE student_id = ?`;

  db.query(query, [studentId], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    res.json(results);
  });
});

//Teacher Dash
app.get("/teacher-dashboard", (req, res) => {
  const teacherID = req.query.teacher_id; // 

  if (!teacherID) {
    return res.status(400).json({ error: "teacher_id is required" });
  }

  const query = `
    SELECT t.teacher_id, t.first_name, t.last_name, r.role_name, t.email, t.date_of_birth, t.password  
    FROM teachers t
    INNER JOIN roles r ON t.role_id = r.role_id
    WHERE t.teacher_id = ?
  `;

  db.query(query, [teacherID], (err, results) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(results[0]);
  });
});



//ADMIN MODULE
app.get("/teacher/activity", (req, res) => {
  const sql =
    "SELECT id, action, timestamp, details FROM teacher_activity_log ORDER BY timestamp DESC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching teacher activity log:", err);
      return res.status(500).json({ error: "Failed to fetch activity log" });
    }
    res.json(results);
  });
});

app.delete("/teacher/activity/clear", (req, res) => {
  const sql = "DELETE FROM teacher_activity_log";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error clearing teacher activity log:", err);
      return res.status(500).json({ error: "Failed to clear activity log" });
    }
    res.json({ message: "Teacher activity log cleared successfully" });
  });
});

app.delete("/teacher/activity/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM teacher_activity_log WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(`Error deleting activity log with ID ${id}:`, err);
      return res
        .status(500)
        .json({ error: `Failed to delete activity log with ID ${id}` });
    }
    if (result.affectedRows > 0) {
      res.json({ message: `Activity log with ID ${id} deleted successfully` });
    } else {
      res.status(404).json({ message: `Activity log with ID ${id} not found` });
    }
  });
});

app.get("/student/count", (req, res) => {
  const sql = "SELECT COUNT(*) AS total FROM students";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ count: results[0].total });
  });
});

app.get("/teacher/count", (req, res) => {
  db.query("SELECT COUNT(*) AS total FROM teachers", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json({ count: results[0].total });
  });
});

app.get("/teachers", (req, res) => {
  db.query("SELECT * FROM teachers", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

const logTeacherActivity = (db, teacherId, action, details = null) => {
  const sql =
    "INSERT INTO teacher_activity_log (teacher_id, action, timestamp, details) VALUES (?, ?, NOW(), ?)";
  db.query(sql, [teacherId, action, JSON.stringify(details)], (err, result) => {
    if (err) {
      console.error("Error logging teacher activity:", err);
    }
  });
};

app.post("/teacher/add", (req, res) => {
  const {
    email,
    first_name,
    middle_name,
    last_name,
    date_of_birth,
    sex,
    contact_number,
    address,
    bachelors_degree,
    masters_degree,
    doctorate_degree,
    bachelors_school,
    masters_school,
    doctorate_school,
    password,
  } = req.body;

  const sql = `
      INSERT INTO teachers (
        email, first_name, middle_name, last_name, date_of_birth, sex, contact_number, address,
        bachelors_degree, masters_degree, doctorate_degree,
        bachelors_school, masters_school, doctorate_school, password
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  db.query(
    sql,
    [
      email,
      first_name,
      middle_name,
      last_name,
      date_of_birth,
      sex,
      contact_number,
      address,
      bachelors_degree,
      masters_degree,
      doctorate_degree,
      bachelors_school,
      masters_school,
      doctorate_school,
      password,
    ],
    (err, result) => {
      if (err) return res.status(500).send(err);

      const newTeacher = {
        teacher_id: result.insertId,
        email,
        first_name,
        middle_name,
        last_name,
        date_of_birth,
        sex,
        contact_number,
        address,
        bachelors_degree,
        masters_degree,
        doctorate_degree,
        bachelors_school,
        masters_school,
        doctorate_school,
        password,
      };

      logTeacherActivity(db, result.insertId, "add", {
        name: `${first_name} ${last_name}`,
        details: newTeacher,
      });
      res.json(newTeacher);
    }
  );
});

app.delete("/teacher/remove/:teacher_id", (req, res) => {
  const { teacher_id } = req.params;
  // First, get the teacher's information for logging
  db.query(
    "SELECT * FROM teachers WHERE teacher_id = ?",
    [teacher_id],
    (err, results) => {
      if (err) {
        console.error("Error fetching teacher for deletion log:", err);
        return res.status(500).send(err);
      }
      const teacherToDelete = results[0];
      const sql = "DELETE FROM teachers WHERE teacher_id = ?";
      db.query(sql, [teacher_id], (err, result) => {
        if (err) return res.status(500).send(err);
        if (teacherToDelete) {
          logTeacherActivity(db, teacher_id, "delete", {
            name: `${teacherToDelete.first_name} ${teacherToDelete.last_name}`,
          });
        }
        res.json({ message: "Teacher deleted" });
      });
    }
  );
});

app.put("/teacher/update/:id", (req, res) => {
  const { id } = req.params;
  const {
    email,
    first_name,
    middle_name,
    last_name,
    date_of_birth,
    sex,
    contact_number,
    address,
    bachelors_degree,
    masters_degree,
    doctorate_degree,
    bachelors_school,
    masters_school,
    doctorate_school,
    password,
  } = req.body;

  // Ensure you are not updating `teacher_id` if it's auto-incremented
  const sql = `
      UPDATE teachers SET
        email = ?, 
        first_name = ?, 
        middle_name = ?, 
        last_name = ?, 
        date_of_birth = ?, 
        sex = ?, 
        contact_number = ?, 
        address = ?, 
        bachelors_degree = ?, 
        masters_degree = ?, 
        doctorate_degree = ?, 
        bachelors_school = ?, 
        masters_school = ?, 
        doctorate_school = ?, 
        password = ? 
      WHERE teacher_id = ?`;

  db.query(
    sql,
    [
      email,
      first_name,
      middle_name,
      last_name,
      date_of_birth,
      sex,
      contact_number,
      address,
      bachelors_degree,
      masters_degree,
      doctorate_degree,
      bachelors_school,
      masters_school,
      doctorate_school,
      password,
      id, // Use the `id` to update the teacher's information
    ],
    (err, result) => {
      if (err) return res.status(500).send(err);

      const updatedTeacher = {
        id,
        email,
        first_name,
        middle_name,
        last_name,
        date_of_birth,
        sex,
        contact_number,
        address,
        bachelors_degree,
        masters_degree,
        doctorate_degree,
        bachelors_school,
        masters_school,
        doctorate_school,
        password,
      };

      logTeacherActivity(db, id, "update", {
        name: `${first_name} ${last_name}`,
        details: updatedTeacher,
      });

      res.json(updatedTeacher);
    }
  );
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

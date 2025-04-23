const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const db = require("./db");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const path = require('path');




router.get("/hello", (req, res) => {
  res.send("Hello");
});

// Endpoint to fetch students
router.get("/students", (req, res) => {
  const { teacher_id } = req.query;

  if (!teacher_id) {
    return res.status(400).json({ message: "teacher_id is required" });
  }

  const query = `
    SELECT
  s.student_id,
  s.first_name,
  s.middle_name,
  s.last_name,
  s.extension_name, 
  s.date_of_birth,  
  s.sex,
  s.marital_status, 
  s.occupation,     -- Add this
  s.monthly_salary, -- Add this
  s.mother_name,    -- Add this
  s.mother_occupation, -- Add this
  s.father_name,    -- Add this
  s.father_occupation, -- Add this
  s.household_salary, -- Add this
  s.housing,        -- Add this
  s.living_arrangement, -- Add this
  s.school,
  s.grade_level,    -- Add this
  s.email,          -- Add this
  s.psi_level,      -- Add this
  s.lrn,
  s.address,        
  s.teacher_id
    FROM 
      students s
    WHERE
      s.teacher_id = ?
  `;

  db.query(query, [teacher_id], (err, results) => {
    if (err) {
      console.error("Error fetching students:", err);
      return res.status(500).json({ error: err });
    }
    res.json(results);
  });
});

//do not remove
/*router.get('/:student_id', (req, res) => {
    const studentId = req.params.student_id;
  
    const query = 'SELECT * FROM students WHERE student_id = ?';
  
    db.query(query, [studentId], (err, result) => {
      if (err) {
        console.error('Error fetching student:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
  
      if (result.length > 0) {
        res.json({ success: true, data: result[0] });
      } else {
        res.status(404).json({ success: false, message: 'Student not found' });
      }
    });
  });*/

// Fetch learning_materials using callback-style
router.get("/reading_materials", (req, res) => {
  const query = "SELECT * FROM learning_materials ORDER BY ls_id";

  db.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching materials:", error);
      return res.status(500).json({ error: "Server error" });
    }

    res.json(results);
  });
});

// Express.js route handler
router.get("/reading_materials/:ls_id", (req, res) => {
  const { ls_id } = req.params;

  const query = "SELECT * FROM learning_materials WHERE ls_id = ?";
  db.query(query, [ls_id], (err, results) => {
    if (err) {
      console.error("Error fetching materials:", err);
      return res.status(500).json({ message: "Error fetching materials" });
    }
    res.json(results); // Send materials as JSON
  });
});



// Set up storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder where the files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Add a unique timestamp to file name
  }
});

const upload = multer({ storage: storage });

// Route to upload material
router.post("/upload_material", upload.single('file'), (req, res) => {
  const { ls_id, material_title, description } = req.body;
  
  // Check if file is uploaded
  if (!req.file) {
    return res.status(400).json({ error: "File is required" });
  }

  // File type validation (optional: allow only PDF or Word files, for example)
  const fileExtension = path.extname(req.file.originalname).toLowerCase();
  const allowedExtensions = ['.pdf', '.docx', '.txt']; // Customize as needed
  if (!allowedExtensions.includes(fileExtension)) {
    return res.status(400).json({ error: "Invalid file type. Allowed types are .pdf, .docx, .txt" });
  }

  const file_url = `/uploads/${req.file.filename}`;

  // Insert material into the database
  const sql = `INSERT INTO learning_materials (ls_id, material_title, description, file_url) VALUES (?, ?, ?, ?)`;

  db.query(sql, [ls_id, material_title, description, file_url], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Failed to upload material" });
    }
    res.status(201).json({ message: "Material uploaded successfully" });
  });
});




router.get("/count", (req, res) => {
  const { user_id } = req.query;

  const query = "SELECT COUNT(*) as total FROM students WHERE teacher_id = ?";
  db.query(query, [user_id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result[0]);
  });
});

router.get("/dashboard-data", (req, res) => {
  const { teacher_id } = req.query;

  if (!teacher_id) {
    return res
      .status(400)
      .json({ success: false, message: "teacher_id is required" });
  }

  const query = `
    SELECT 
        s.student_id,
        s.first_name,
        s.middle_name,
        s.last_name,
        s.school,
        a.score_id,
        a.flt_score
    FROM 
        students s
    JOIN 
        assessment_scores a ON s.student_id = a.user_id
    WHERE 
        s.teacher_id = ?
        AND a.score_id = (
          SELECT MAX(score_id) 
          FROM assessment_scores 
          WHERE user_id = s.student_id
        );
  `;

  db.query(query, [teacher_id], (err, results) => {
    if (err) return res.status(500).send(err);

    const atRiskStudents = results.filter((r) => r.flt_score < 75);
    const readyStudents = results.filter((r) => r.flt_score >= 75);

    const total = results.length;
    const atRiskCount = atRiskStudents.length;
    const readyCount = readyStudents.length;

    const averageScore =
      atRiskCount === 0
        ? 0
        : atRiskStudents.reduce((acc, r) => acc + r.flt_score, 0) / atRiskCount;

    const completionRate =
      total === 0 ? 0 : Math.round((readyCount / total) * 100);

    res.json({
      total,
      readyCount,
      atRiskCount,
      averageScore,
      completionRate,
      readyStudents,
      atRiskStudents,
    });
  });
});

router.post("/create-student", async (req, res) => {
  const student = req.body;
  console.log("Incoming student data:", student);

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(student.password, salt);
    student.password = hashedPassword;

    // SQL query for inserting student data into the 'students' table
    const insertQuery = `
      INSERT INTO eals.students (
        student_id, role_id, teacher_id, psi_level, lrn, address, first_name,
        middle_name, last_name, extension_name, als_email, password, date_of_birth,
        sex, marital_status, occupation, status, age, salary, living_with_parents,
        rented_house, monthly_salary, mother_name, mother_occupation, father_name,
        father_occupation, household_salary, housing, living_arrangement, school,
        grade_level, email
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      null, // student_id (auto-increment)
      3, // role_id fixed to 3 for student
      student.teacher_id,
      student.psi_level,
      student.lrn,
      student.address || '',
      student.first_name,
      student.middle_name || '',
      student.last_name,
      student.extension_name || '',
      student.als_email,
      student.password,
      student.date_of_birth,
      student.sex,
      student.marital_status,
      student.occupation || null,
      'active', // status
      student.age || null,
      parseFloat(student.monthly_salary) || null,
      student.living_with_parents || null,
      student.rented_house || null,
      student.monthly_salary || null,
      student.mother_name || '',
      student.mother_occupation || '',
      student.father_name || '',
      student.father_occupation || '',
      parseFloat(student.household_salary) || null,
      student.housing || '',
      student.living_arrangement || '',
      student.school || '',
      student.grade_level || '',
      student.email
    ];

    db.query(insertQuery, values, (err, result) => {
      if (err) {
        console.error("Error inserting into students:", err);
        return res.status(500).json({ error: err });
      }

      const newStudentId = result.insertId;
      console.log("New student ID:", newStudentId);

      if (!newStudentId || newStudentId === 0) {
        console.error("Insert failed: No valid student ID returned.");
        return res
          .status(500)
          .json({ error: "Student insert failed. Invalid ID returned." });
      }
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: err.message });
  }
});


router.put("/update-student/:id", (req, res) => {
  const student = req.body;
  db.query(
    "UPDATE students SET ? WHERE student_id = ?",
    [student, req.params.id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.sendStatus(200);
    }
  );
});

// DELETE student
router.delete("/delete-student/:id", (req, res) => {
  db.query(
    "DELETE FROM students WHERE student_id = ?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.sendStatus(200);
    }
  );
});

router.get("/performance-history", (req, res) => {
  const { teacher_id } = req.query;

  if (!teacher_id) {
    return res.status(400).json({ message: "teacher_id is required" });
  }

  const query = `
      SELECT
      a.user_id,
      s.first_name,
      s.last_name,
      a.flt_score,
      a.date_taken
    FROM 
      assessment_scores a
    JOIN 
      students s ON a.user_id = s.student_id
    WHERE 
      s.teacher_id = ?
    ORDER BY 
      a.date_taken ASC
 `;

  db.query(query, [teacher_id], (err, results) => {
    if (err) {
      console.error("Error fetching performance history:", err);
      return res.status(500).json({ error: err });
    }
    res.json(results);
  });
});

router.delete("/aemock-results/delete-by-student/:studentId", (req, res) => {
  const { studentId } = req.params;

  db.query(
    "DELETE FROM aemock_results WHERE student_id = ?",
    [studentId],
    (error, result) => {
      if (error) {
        console.error("Error deleting aemock_results records:", error);
        return res.status(500).json({ error: "Failed to delete records." });
      }

      if (result.affectedRows > 0) {
        res.status(200).json({ message: "Records deleted successfully." });
      } else {
        res.status(404).json({ message: "No records found to delete." });
      }
    }
  );
});


// GET: Real students and their LS scores
router.get("/progress-report", (req, res) => {
  const teacherId = req.query.teacher_id;

  if (!teacherId) return res.status(400).json({ error: "Missing teacher_id" });

  const query = `
   SELECT 
  s.student_id, s.first_name, s.middle_name, s.last_name, s.lrn, s.school,
  a.ls1_total_english, a.ls1_total_filipino, a.ls2_slct,
  a.ls3_mpss, a.ls4_lcs, a.ls5_uss, a.ls6_dc
FROM students s
JOIN (
  SELECT user_id, 
         MAX(date_taken) AS latest_score_date
  FROM assessment_scores
  GROUP BY user_id
) latest_scores ON latest_scores.user_id = s.student_id
JOIN assessment_scores a ON a.user_id = latest_scores.user_id AND a.date_taken = latest_scores.latest_score_date
WHERE s.teacher_id = ?
GROUP BY s.student_id, a.ls1_total_english, a.ls1_total_filipino, a.ls2_slct,
         a.ls3_mpss, a.ls4_lcs, a.ls5_uss, a.ls6_dc
LIMIT 0, 1000;

  `;

  db.query(query, [teacherId], (err, results) => {
    if (err) return res.status(500).json({ error: err });

    const formatted = results.map((student) => ({
      student_id: student.student_id, // ✅ Add this line
      name: `${student.first_name} ${student.middle_name} ${student.last_name}`,
      lrn: student.lrn,
      class: student.school,
      progress: [
        { strand: "LS 1 Communication-English", score: student.ls1_total_english },
        { strand: "LS 1 Communication-Filipino", score: student.ls1_total_filipino },
        { strand: "LS 2 - SLCT", score: student.ls2_slct },
        { strand: "LS 3 - MPSS", score: student.ls3_mpss },
        { strand: "LS 4 - LCS", score: student.ls4_lcs },
        { strand: "LS 5 - USS", score: student.ls5_uss },
        { strand: "LS 6 - DC", score: student.ls6_dc },
      ],
    }));

    res.json(formatted);
  });
});

router.get("/questions/:ls_id", (req, res) => {
  const { ls_id } = req.params;

  if (!ls_id) {
    return res.status(400).json({ error: "ls_id is required" });
  }
  db.query("SELECT * FROM questions WHERE ls_id = ?", [ls_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });

      // Transform the results for frontend compatibility
      const formatted = results.map((q) => ({
        id: q.q_id,
        text: q.question,
        choices: [q.option_a, q.option_b, q.option_c, q.option_d],
        answer: q.correct_answer,
        difficulty: q.difficulty,
      }));

    res.json(formatted);
  });
});

// POST create new question
router.post("/questions", (req, res) => {
  const { ls_id, question, option_a, option_b, option_c, option_d, correct_answer, difficulty } = req.body;
  db.query(
    `INSERT INTO questions 
      (ls_id, question, option_a, option_b, option_c, option_d, correct_answer, difficulty) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [ls_id, question, option_a, option_b, option_c, option_d, correct_answer, difficulty || 'medium'],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ q_id: result.insertId });
    }
  );
});

// PUT update question
router.put("/questions/:q_id", (req, res) => {
  const { q_id } = req.params;
  const { question, option_a, option_b, option_c, option_d, correct_answer, difficulty } = req.body;
  db.query(
    `UPDATE questions
     SET question = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_answer = ?, difficulty = ?
     WHERE q_id = ?`,
    [question, option_a, option_b, option_c, option_d, correct_answer, difficulty, q_id],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.sendStatus(200);
    }
  );
});

// DELETE question
router.delete("/questions/:q_id", (req, res) => {
  db.query("DELETE FROM questions WHERE q_id = ?", [req.params.q_id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.sendStatus(200);
  });
});

// Modified endpoint to count unique students below threshold per subject
router.get("/students-below-threshold", (req, res) => {
  const teacherId = req.query.teacher_id;

  // If teacher_id is not provided, return a 400 error
  if (!teacherId) {
    return res.status(400).json({ error: "teacher_id is required" });
  }

  const query = `
    WITH unique_scores AS (
      SELECT 
        s.student_id,
        MAX(a.score_id) as latest_score_id
      FROM 
        students s
      JOIN 
        assessment_scores a ON s.student_id = a.user_id
      WHERE 
        s.teacher_id = ?
      GROUP BY 
        s.student_id
    ),
    student_strand_scores AS (
      SELECT 
        s.student_id,
        a.ls1_total_english,
        a.ls1_total_filipino,
        a.ls2_slct,
        a.ls3_mpss,
        a.ls4_lcs,
        a.ls5_uss,
        a.ls6_dc
      FROM 
        students s
      JOIN 
        unique_scores us ON s.student_id = us.student_id
      JOIN 
        assessment_scores a ON us.latest_score_id = a.score_id
      WHERE 
        s.teacher_id = ?
    )

    SELECT 'LS 1 English' AS strand, COUNT(DISTINCT student_id) AS student_count 
    FROM student_strand_scores
    WHERE ls1_total_english < 5
    
    UNION
    
    SELECT 'LS 1 Filipino' AS strand, COUNT(DISTINCT student_id) AS student_count 
    FROM student_strand_scores
    WHERE ls1_total_filipino < 5
    
    UNION
    
    SELECT 'LS 2' AS strand, COUNT(DISTINCT student_id) AS student_count 
    FROM student_strand_scores
    WHERE ls2_slct < 5
    
    UNION
    
    SELECT 'LS 3' AS strand, COUNT(DISTINCT student_id) AS student_count 
    FROM student_strand_scores
    WHERE ls3_mpss < 5
    
    UNION
    
    SELECT 'LS 4' AS strand, COUNT(DISTINCT student_id) AS student_count 
    FROM student_strand_scores
    WHERE ls4_lcs < 5
    
    UNION
    
    SELECT 'LS 5' AS strand, COUNT(DISTINCT student_id) AS student_count 
    FROM student_strand_scores
    WHERE ls5_uss < 5
    
    UNION
    
    SELECT 'LS 6' AS strand, COUNT(DISTINCT student_id) AS student_count 
    FROM student_strand_scores
    WHERE ls6_dc < 5
  `;

  db.query(query, [teacherId, teacherId], (err, results) => {
    if (err) {
      console.error("Error fetching low-score students per subject:", err);
      return res.status(500).json({ error: err });
    }
    res.json(results);
  });
});

// Modified endpoint to get students below threshold for specific strand
router.get("/students-below-threshold/:strand", (req, res) => {
  const strand = req.params.strand;
  const teacherId = req.query.teacher_id;

  if (!teacherId) {
    return res.status(400).json({ error: "teacher_id is required" });
  }

  let column;
  switch (strand) {
    case "LS 1 English":
      column = "ls1_total_english";
      break;
    case "LS 1 Filipino":
      column = "ls1_total_filipino";
      break;
    case "LS 2":
      column = "ls2_slct";
      break;
    case "LS 3":
      column = "ls3_mpss";
      break;
    case "LS 4":
      column = "ls4_lcs";
      break;
    case "LS 5":
      column = "ls5_uss";
      break;
    case "LS 6":
      column = "ls6_dc";
      break;
    default:
      return res.status(400).json({ error: "Unknown strand" });
  }

  // Query to get only the latest assessment score for each student
  const query = `
    WITH latest_scores AS (
      SELECT 
        user_id,
        MAX(score_id) as latest_score_id
      FROM 
        assessment_scores
      GROUP BY 
        user_id
    )
    
    SELECT 
      s.student_id, 
      s.first_name, 
      s.last_name, 
      a.${column} AS score
    FROM 
      students s
    JOIN 
      latest_scores ls ON s.student_id = ls.user_id
    JOIN 
      assessment_scores a ON ls.latest_score_id = a.score_id
    WHERE 
      a.${column} < 5 
      AND s.teacher_id = ?
    ORDER BY 
      s.last_name, s.first_name
  `;

  db.query(query, [teacherId], (err, result) => {
    if (err) {
      console.error("Error retrieving students for strand:", err);
      res.status(500).send("Server error");
    } else {
      res.json(result);
    }
  });
});

// Modified endpoint to get failing students for a specific subject
router.get("/failing-subject/:subject", (req, res) => {
  const subject = req.params.subject;
  const teacherId = req.query.teacher_id;

  if (!teacherId) {
    return res.status(400).json({ error: "teacher_id is required" });
  }

  let column;
  switch (subject) {
    case "LS 1 English":
      column = "ls1_total_english";
      break;
    case "LS 1 Filipino":
      column = "ls1_total_filipino";
      break;
    case "LS 2":
      column = "ls2_slct";
      break;
    case "LS 3":
      column = "ls3_mpss";
      break;
    case "LS 4":
      column = "ls4_lcs";
      break;
    case "LS 5":
      column = "ls5_uss";
      break;
    case "LS 6":
      column = "ls6_dc";
      break;
    default:
      return res.status(400).json({ error: "Unknown subject" });
  }

  // Query to get only the latest assessment score for each student
  const query = `
    WITH latest_scores AS (
      SELECT 
        user_id,
        MAX(score_id) as latest_score_id
      FROM 
        assessment_scores
      GROUP BY 
        user_id
    )
    
    SELECT 
      s.student_id AS student_id, 
      s.first_name AS first_name, 
      s.last_name AS last_name, 
      a.${column} AS score
    FROM 
      students s
    JOIN 
      latest_scores ls ON s.student_id = ls.user_id
    JOIN 
      assessment_scores a ON ls.latest_score_id = a.score_id
    WHERE 
      a.${column} < 5 
      AND s.teacher_id = ?
    ORDER BY 
      s.last_name, s.first_name
  `;

  console.log("➡️ Subject received:", subject);
  console.log("➡️ Teacher ID:", teacherId);

  db.query(query, [teacherId], (err, result) => {
    if (err) {
      console.error("Error retrieving failing students for subject:", err);
      res.status(500).send("Server error");
    } else {
      res.json(result);
    }
  });
});
module.exports = router;
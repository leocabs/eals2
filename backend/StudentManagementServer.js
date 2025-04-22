const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const db = require("./db");
const bcrypt = require("bcryptjs");

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
      s.sex,
      s.school,
      s.lrn,
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

// Create materials
router.post("/upload-material", async (req, res) => {
  const { ls_id, material_title, description, file_url } = req.body;

  try {
    const sql = `INSERT INTO learning_materials (ls_id, material_title, description, file_url) 
                 VALUES (?, ?, ?, ?)`;
    await db.query(sql, [ls_id, material_title, description, file_url]);
    res.status(201).json({ message: "Material uploaded successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload material" });
  }
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

    db.query("INSERT INTO students SET ?", student, (err, result) => {
      if (err) {
        console.error("Error inserting into student_info:", err);
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

      const psiScore = student.psi_level || 0; // from student object

      db.query(
        "INSERT INTO assessment_scores (user_id, pis_score) VALUES (?, ?)",
        [newStudentId, psiScore],
        (err3) => {
          if (err3) {
            console.error("Error inserting into assessment_scores:", err3);
            return res.status(500).json({ error: err3 });
          }

          res.status(201).json({ id: newStudentId });
        }
      );
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
      s.teacher_id = 5
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

router.delete(
  "/aemock-results/delete-by-student/:studentId",
  async (req, res) => {
    const { studentId } = req.params;

    try {
      // Delete all aemock_results records related to the student using student_id
      const result = await db.query(
        "DELETE FROM aemock_results WHERE student_id = ?",
        [studentId] // Ensure the student_id is used in the query
      );

      if (result.affectedRows > 0) {
        res.status(200).json({
          message: "Related aemock_results records deleted successfully.",
        });
      } else {
        res
          .status(404)
          .json({ message: "No related records found to delete." });
      }
    } catch (error) {
      console.error("Error deleting aemock_results records:", error);
      res
        .status(500)
        .json({ error: "Failed to delete related aemock_results records." });
    }
  }
);

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

    res.json(results);
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

module.exports = router;

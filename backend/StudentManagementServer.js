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
    const totalAtRisk = atRiskStudents.length;
    const readyCount = results.filter((r) => r.flt_score >= 75).length;
    const averageScore =
      totalAtRisk === 0
        ? 0
        : atRiskStudents.reduce((acc, r) => acc + r.flt_score, 0) / totalAtRisk;
    const total = results.length;
    const completionRate =
      total === 0 ? 0 : Math.round((readyCount / total) * 100);

    res.json({
      total,
      atRiskCount: totalAtRisk,
      readyCount,
      completionRate,
      averageScore,
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

module.exports = router;

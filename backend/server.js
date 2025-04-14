const express = require('express');
const db = require('./db');
const cors = require('cors');

const app = express();
const PORT = 3000;
app.use(cors({
    origin: 'http://localhost:5173', // Adjust this to your frontend's URL
    credentials: true,
}));
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Fetch all users
app.get('/users', (req, res) => {
    db.query('SELECT * FROM students', (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving users');
        } else {
            res.json(result);
        }
    });
});



// Login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM students WHERE email = ? AND password = ?';
    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }

        if (results.length > 0) {
            const user = results[0];
            res.json({
                success: true,
                message: 'Login successful',
                user: {
                    student_id: user.student_id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email, 
                    role_id: user.role_id,
                    profile_pic: user.profile_pic,
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    });
});

app.get('/student-dashboard', (req, res) => {
  const studentId = req.query.student_id; // ✅ Get student_id from URL query

  if (!studentId) {
    return res.status(400).json({ error: "student_id is required" });
  }

  const query = `
    SELECT u.student_id, u.first_name, u.last_name, r.role_name  
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
  

// Example weak strands function (adjust based on actual logic)
function getWeakStrands() {
    return {
        "Communication (ENGLISH)": "https://example.com/english-module",
        "Scientific Literacy and Critical Thinking": "https://example.com/science-module",
        // Add more weak strands and corresponding links
    };
}

//Fetch questions  
app.get('/questions', (req, res) => {
  db.query('SELECT * FROM questions', (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error retrieving users');
      } else {
          res.json(result);
      }
  });
});

  //Submit answers
  app.post('/api/submit', (req, res) => {
    const { subject, answers } = req.body;
  
    const ids = Object.keys(answers);
    const placeholders = ids.map(() => '?').join(',');
    const sql = `SELECT id, correct_answer FROM questions WHERE id IN (${placeholders})`;
  
    db.query(sql, ids, (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
  
      let score = 0;
      rows.forEach(row => {
        if (answers[row.id] === row.correct_answer) score++;
      });
  
      const percentage = Math.round((score / rows.length) * 100);
      const passed = percentage >= 70;
      
      res.json({ score: percentage, passed });
    });
  });

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
  
  app.get('/aemock-results', (req, res) => {
    const studentId = req.headers['user_id'];
  
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
  

  
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});

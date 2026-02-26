const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// APPLY FOR A JOB
router.post("/", async (req, res) => {
  const { job_id, candidate_id } = req.body;
  try {
    // Check if already applied
    const existing = await pool.query(
      "SELECT * FROM applications WHERE job_id = $1 AND candidate_id = $2",
      [job_id, candidate_id]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Already applied for this job!" });
    }

    const application = await pool.query(
      "INSERT INTO applications (job_id, candidate_id) VALUES ($1, $2) RETURNING *",
      [job_id, candidate_id]
    );
    res.status(201).json({ message: "Applied successfully! 🎉", application: application.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET ALL APPLICATIONS FOR A CANDIDATE
router.get("/candidate/:id", async (req, res) => {
  try {
    const applications = await pool.query(
      "SELECT a.*, j.title, j.company, j.location FROM applications a JOIN jobs j ON a.job_id = j.id WHERE a.candidate_id = $1",
      [req.params.id]
    );
    res.json(applications.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET ALL APPLICATIONS FOR A JOB
router.get("/job/:id", async (req, res) => {
  try {
    const applications = await pool.query(
      "SELECT a.*, u.first_name, u.last_name, u.email FROM applications a JOIN users u ON a.candidate_id = u.id WHERE a.job_id = $1",
      [req.params.id]
    );
    res.json(applications.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// UPDATE APPLICATION STATUS
router.put("/:id", async (req, res) => {
  const { status } = req.body;
  try {
    const updated = await pool.query(
      "UPDATE applications SET status = $1 WHERE id = $2 RETURNING *",
      [status, req.params.id]
    );
    res.json({ message: "Status updated!", application: updated.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
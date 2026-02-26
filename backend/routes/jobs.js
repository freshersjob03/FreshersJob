const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// GET ALL JOBS
router.get("/", async (req, res) => {
  try {
    const jobs = await pool.query(
      "SELECT * FROM jobs ORDER BY created_at DESC"
    );
    res.json(jobs.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET SINGLE JOB
router.get("/:id", async (req, res) => {
  try {
    const job = await pool.query(
      "SELECT * FROM jobs WHERE id = $1", [req.params.id]
    );
    if (job.rows.length === 0) {
      return res.status(404).json({ message: "Job not found!" });
    }
    res.json(job.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST A JOB
router.post("/", async (req, res) => {
  const { title, company, location, job_type, salary_min, salary_max, description, requirements, skills, employer_id } = req.body;
  try {
    const newJob = await pool.query(
      "INSERT INTO jobs (title, company, location, job_type, salary_min, salary_max, description, requirements, skills, employer_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
      [title, company, location, job_type, salary_min, salary_max, description, requirements, skills, employer_id]
    );
    res.status(201).json({ message: "Job posted successfully! 🎉", job: newJob.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE A JOB
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM jobs WHERE id = $1", [req.params.id]);
    res.json({ message: "Job deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
// SAVE A JOB
router.post("/save", async (req, res) => {
  const { job_id, user_id } = req.body;
  try {
    const existing = await pool.query(
      "SELECT * FROM saved_jobs WHERE job_id = $1 AND user_id = $2",
      [job_id, user_id]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Job already saved!" });
    }
    await pool.query(
      "INSERT INTO saved_jobs (job_id, user_id) VALUES ($1, $2)",
      [job_id, user_id]
    );
    res.json({ message: "Job saved successfully! 🔖" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET SAVED JOBS
router.get("/saved/:user_id", async (req, res) => {
  try {
    const saved = await pool.query(
      "SELECT s.*, j.title, j.company, j.location, j.job_type, j.salary_min, j.salary_max, j.skills FROM saved_jobs s JOIN jobs j ON s.job_id = j.id WHERE s.user_id = $1",
      [req.params.user_id]
    );
    res.json(saved.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
module.exports = router;
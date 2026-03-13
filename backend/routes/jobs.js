const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// GET ALL JOBS
router.get("/", async (req, res) => {
  try {
    let query = "SELECT * FROM jobs";
    const params = [];
    const conditions = [];
    
    // Handle filtering
    if (req.query.employer_id) {
      conditions.push(`employer_id = $${params.length + 1}`);
      params.push(req.query.employer_id);
    }
    
    if (req.query.status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(req.query.status);
    }
    
    if (req.query.id) {
      conditions.push(`id = $${params.length + 1}`);
      params.push(req.query.id);
    }

    if (req.query.state) {
      conditions.push(`state = $${params.length + 1}`);
      params.push(req.query.state);
    }

    if (req.query.city) {
      conditions.push(`city = $${params.length + 1}`);
      params.push(req.query.city);
    }

    if (req.query.locality) {
      conditions.push(`locality = $${params.length + 1}`);
      params.push(req.query.locality);
    }
    
    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    
    // Handle ordering
    if (req.query.order) {
      const orderField = req.query.order.startsWith('-') ? req.query.order.slice(1) : req.query.order;
      const orderDirection = req.query.order.startsWith('-') ? 'DESC' : 'ASC';
      
      // Validate order field to prevent SQL injection
      const allowedFields = ['created_at', 'title', 'company', 'company_name', 'state', 'city', 'locality', 'location'];
      if (allowedFields.includes(orderField)) {
        query += ` ORDER BY ${orderField} ${orderDirection}`;
      } else {
        query += " ORDER BY created_at DESC";
      }
    } else {
      query += " ORDER BY created_at DESC";
    }
    
    // Handle limiting
    if (req.query.limit) {
      const limit = parseInt(req.query.limit);
      if (!isNaN(limit) && limit > 0) {
        query += ` LIMIT ${limit}`;
      }
    }
    
    const jobs = await pool.query(query, params);
    res.json(jobs.rows);
  } catch (err) {
    console.error('Error fetching jobs:', err);
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
    const {
      title,
      company,
      company_name,
      state,
      city,
      locality,
      location,
      job_type,
      experience_level,
      salary_min,
      salary_max,
    description,
    requirements,
    skills,
    employer_id
  } = req.body;
  try {
    const resolvedCompany = company || company_name || null;
    const resolvedCompanyName = company_name || company || null;
    const resolvedLocation = location || [city, state].filter(Boolean).join(', ');

    const newJob = await pool.query(
      "INSERT INTO jobs (title, company_name, company, state, city, locality, location, job_type, experience_level, salary_min, salary_max, description, requirements, skills, employer_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *",
      [title, resolvedCompanyName, resolvedCompany, state || null, city || null, locality || null, resolvedLocation || null, job_type, experience_level, salary_min, salary_max, description, requirements, skills, employer_id]
    );
    res.status(201).json({ message: "Job posted successfully! ", job: newJob.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// UPDATE A JOB (partial)
router.put("/:id", async (req, res) => {
  try {
    const allowedFields = [
      "title",
      "company",
      "company_name",
      "state",
      "city",
      "location",
      "job_type",
      "experience_level",
      "salary_min",
      "salary_max",
      "description",
      "requirements",
      "skills",
      "status",
      "applications_count",
      "company_logo",
      "created_by",
      "created_date",
      "created_at",
      "employer_id",
    ];

    const payload = req.body || {};
    if ((payload.state || payload.city) && payload.location === undefined) {
      payload.location = [payload.city, payload.state].filter(Boolean).join(', ');
    }
    const entries = Object.entries(payload).filter(([key, value]) =>
      allowedFields.includes(key) && value !== undefined
    );

    if (entries.length === 0) {
      return res.status(400).json({ message: "No valid fields to update." });
    }

    const setClause = entries
      .map(([key], index) => `${key} = $${index + 1}`)
      .join(", ");
    const values = entries.map(([, value]) => value);
    values.push(req.params.id);

    const query = `UPDATE jobs SET ${setClause} WHERE id = $${values.length} RETURNING *`;
    const updated = await pool.query(query, values);

    if (updated.rows.length === 0) {
      return res.status(404).json({ message: "Job not found!" });
    }

    res.json({ message: "Job updated successfully!", job: updated.rows[0] });
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
      "SELECT s.*, j.title, j.company
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
module.exports = router;

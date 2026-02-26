const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// SIGNUP
router.post("/signup", async (req, res) => {
  const { first_name, last_name, email, password, phone, role } = req.body;

  try {
    // Check if user already exists
    const existing = await pool.query(
      "SELECT * FROM users WHERE email = $1", [email]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered!" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const newUser = await pool.query(
      "INSERT INTO users (first_name, last_name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [first_name, last_name, email, hashedPassword, phone, role]
    );

    res.status(201).json({ message: "Account created successfully! 🎉", user: newUser.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await pool.query(
      "SELECT * FROM users WHERE email = $1", [email]
    );
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Email not found!" });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: "Wrong password!" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET || "freshersjob_secret",
      { expiresIn: "7d" }
    );

    res.json({ message: "Login successful! 🎉", token, user: user.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
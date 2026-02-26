const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "FreshersJob",
  user: "postgres",
  password: "FreshersJob",
});

pool.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Connected to PostgreSQL database!");
  }
});

module.exports = pool;
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// اتصال به دیتابیس Neon
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_ZPsqD6AG5OVK@ep-quiet-base-a9vxlc7n-pooler.gwc.azure.neon.tech/Media-and-Digital-Event?sslmode=require&channel_binding=require",
  ssl: { rejectUnauthorized: false }
});

// تست اتصال
pool.connect()
  .then(() => console.log("✅ Connected to Neon PostgreSQL"))
  .catch(err => console.error("❌ Connection error", err.stack));

// ذخیره کلیک
app.post("/click", async (req, res) => {
  const { user } = req.body;
  try {
    await pool.query(
      "INSERT INTO clicks (username) VALUES ($1)",
      [user]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error inserting click:", err);
    res.status(500).json({ success: false });
  }
});

// گرفتن کاربر با بیشترین کلیک
app.get("/leader", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT username, COUNT(*) as clicks FROM clicks GROUP BY username ORDER BY clicks DESC LIMIT 1"
    );
    res.json(result.rows[0] || {});
  } catch (err) {
    console.error("❌ Error fetching leader:", err);
    res.status(500).json({ success: false });
  }
});

app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));

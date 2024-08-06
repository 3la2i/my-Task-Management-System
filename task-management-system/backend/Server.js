const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();

app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "taskData",
  password: "Alaa#ata87",
  port: 5432,
});

const JWT_SECRET = "your_jwt_secret";

// Sign Up
app.post("/signup", async (req, res) => {
  const { email, password, first_name, last_name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  await pool.query(
    "INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)",
    [first_name, last_name, email, hashedPassword]
  );
  res.send("User created");
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  const user = result.rows[0];
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    res.json({ token });
  } else {
    res.status(401).send("Invalid credentials");
  }
});

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Create Task
app.post("/tasks", authenticateToken, async (req, res) => {
  const { title, description } = req.body;
  await pool.query(
    "INSERT INTO tasks (user_id, title, description) VALUES ($1, $2, $3)",
    [req.user.id, title, description]
  );
  res.send("Task created");
});

// View Tasks
app.get("/tasks", authenticateToken, async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM tasks WHERE user_id = $1 AND deleted = FALSE",
    [req.user.id]
  );
  res.json(result.rows);
});

// Update Task
app.patch("/tasks/:id", authenticateToken, async (req, res) => {
  const { title, description, completed } = req.body;
  const { id } = req.params;
  await pool.query(
    "UPDATE tasks SET title = $1, description = $2, completed = $3 WHERE id = $4 AND user_id = $5",
    [title, description, completed, id, req.user.id]
  );
  res.send("Task updated");
});

// Delete Task (Soft Delete)
app.delete("/tasks/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  await pool.query(
    "UPDATE tasks SET deleted = TRUE WHERE id = $1 AND user_id = $2",
    [id, req.user.id]
  );
  res.send("Task deleted");
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

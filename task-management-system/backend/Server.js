

const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
const cors = require("cors")



app.use(express.json());

app.use(cors());
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

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});



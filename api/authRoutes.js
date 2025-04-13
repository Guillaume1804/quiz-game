// ✅ authRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const USERS_PATH = path.join(__dirname, "data", "users.json");
const SECRET = process.env.JWT_SECRET || "dev-secret";

function loadUsers() {
  if (!fs.existsSync(USERS_PATH)) return [];
  return JSON.parse(fs.readFileSync(USERS_PATH, "utf-8"));
}

function saveUsers(users) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), "utf-8");
}

// 📝 POST /register
router.post("/register", async (req, res) => {
  const { email, pseudo, password } = req.body;
  if (!email || !pseudo || !password) return res.status(400).json({ error: "Champs manquants." });

  const users = loadUsers();
  if (users.find((u) => u.email === email)) return res.status(409).json({ error: "Email déjà utilisé." });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: Date.now(), email, pseudo, password: hashedPassword };
  users.push(newUser);
  saveUsers(users);

  const token = jwt.sign({ id: newUser.id, pseudo }, SECRET, { expiresIn: "7d" });
  res.json({ token, pseudo });
});

// 📝 POST /login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Champs manquants." });

  const users = loadUsers();
  const user = users.find((u) => u.email === email);
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé." });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: "Mot de passe incorrect." });

  const token = jwt.sign({ id: user.id, pseudo: user.pseudo }, SECRET, { expiresIn: "7d" });
  res.json({ token, pseudo: user.pseudo });
});

module.exports = router;

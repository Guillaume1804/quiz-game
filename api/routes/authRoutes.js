// ✅ Correction des bugs signalés
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// ✅ Chemin du fichier utilisateurs
const USERS_PATH = path.join(__dirname, "data", "users.json");

function load(file) {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function save(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

// ✅ REGISTER
router.post("/register", (req, res) => {
  const { username, password } = req.body;
  const users = load(USERS_PATH);

  if (!username || !password) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  if (users.find((u) => u.username === username)) {
    return res.status(409).json({ error: "Utilisateur déjà existant." });
  }

  const hash = bcrypt.hashSync(password, 10);
  users.push({ username, password: hash });
  save(USERS_PATH, users);
  const token = jwt.sign({ username }, process.env.JWT_SECRET || "secret123", {
    expiresIn: "2h",
  });
  res.json({ token });
});

// ✅ LOGIN
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const users = load(USERS_PATH);

  const user = users.find((u) => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Identifiants invalides" });
  }

  const token = jwt.sign({ username }, process.env.JWT_SECRET || "secret123", {
    expiresIn: "2h",
  });
  res.json({ token });
});

module.exports = router;

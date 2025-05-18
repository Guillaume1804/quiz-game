const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const supabase = require("../config/supabaseClient");
const crypto = require("crypto");

// REGISTER
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  const { data: existingUser } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (existingUser) {
    return res.status(409).json({ error: "Email déjà utilisé." });
  }

  const hash = bcrypt.hashSync(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert({ username, email, password_hash: hash, role: "user" })
    .select()
    .single();

  if (error) return res.status(500).json({ error });

  const token = jwt.sign(
    { id: data.id, username: data.username, role: data.role },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.json({ token });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Identifiants invalides" });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.json({ token });
});

// 🆘 Demande de réinitialisation
router.post("/request-reset", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email requis." });

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (userError || !user) {
    return res.status(404).json({ error: "Utilisateur non trouvé." });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30);
  console.log("⏱ Expire à (locale):", expiresAt.toLocaleString());

  const { error: insertError } = await supabase
    .from("password_reset_tokens")
    .insert([
      {
        user_id: user.id,
        token,
        expires_at: expiresAt,
      },
    ]);

  if (insertError) return res.status(500).json({ error: "Erreur interne." });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  console.log("🔗 Lien de réinitialisation :", resetLink);
  const sendEmail = require("../utils/sendEmail");

  await sendEmail(
    email,
    "Réinitialisation de votre mot de passe - Quiz Game",
    `<p>Bonjour,<br>Voici le lien pour réinitialiser votre mot de passe :<br>
  <a href="${resetLink}">${resetLink}</a><br><br>
  Ce lien est valable 30 minutes.</p>`
  );

  res.json({ success: true });
});

// 🔒 Réinitialisation du mot de passe
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password)
    return res.status(400).json({ error: "Champs requis." });

  const { data: tokenEntry, error: tokenError } = await supabase
    .from("password_reset_tokens")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (
    tokenError ||
    !tokenEntry ||
    new Date(tokenEntry.expires_at) < new Date()
  ) {
    return res.status(400).json({ error: "Token invalide ou expiré." });
  }

  const hashed = await bcrypt.hash(password, 10);

  const { error: updateError } = await supabase
    .from("users")
    .update({ password_hash: hashed })
    .eq("id", tokenEntry.user_id);

  if (updateError)
    return res.status(500).json({ error: "Erreur mise à jour." });

  await supabase.from("password_reset_tokens").delete().eq("token", token);
  res.json({ success: true });
});

module.exports = router;

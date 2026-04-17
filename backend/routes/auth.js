const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, result) => {
            if (err) return res.status(500).json({ message: "Database error" });

            if (result.length > 0) {
                return res.status(400).json({ message: "User already registered" });
            }

            const hashed = await bcrypt.hash(password, 10);

            db.query(
                "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
                [username, email, hashed, role],
                (err) => {
                    if (err) return res.status(500).json({ message: "Insert error" });

                    res.json({ message: "User Registered Successfully" });
                }
            );
        }
    );
});

/* ================= LOGIN ================= */
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
    }

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, result) => {
            if (err) return res.status(500).json({ message: "Database error" });

            if (result.length === 0) {
                return res.status(400).json({ message: "User not found" });
            }

            const user = result[0];

            const valid = await bcrypt.compare(password, user.password);

            if (!valid) {
                return res.status(400).json({ message: "Invalid password" });
            }

            const token = jwt.sign(
                { id: user.id, role: user.role },
                "secretkey",
                { expiresIn: "1d" }
            );

            const { password: _, ...safeUser } = user;

            res.json({
                token,
                user: safeUser
            });
        }
    );
});

module.exports = router;
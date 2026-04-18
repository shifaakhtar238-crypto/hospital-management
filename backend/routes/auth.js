const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ================= REGISTER =================
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // ✅ FIXED validation (strict check)
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "All fields required" });
        }

        // check existing user (safe)
        const { data: existingUser, error: checkError } = await supabase
            .from("patient")
            .select("id")
            .eq("email", email);

        if (checkError) {
            return res.status(500).json({ message: "DB error", error: checkError.message });
        }

        if (existingUser && existingUser.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // insert user
        const { data, error } = await supabase
            .from("patient")
            .insert([
                {
                    name,
                    email,
                    password: hashedPassword,
                    role
                }
            ])
            .select("id, name, email, role");

        if (error) {
            return res.status(500).json({ message: "Insert error", error: error.message });
        }

        res.status(201).json({
            message: "User registered successfully",
            data
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
});


// ================= LOGIN =================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // validation
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }

        // get user
        const { data: user, error } = await supabase
            .from("patient")
            .select("*")
            .eq("email", email)
            .maybeSingle();

        if (error) {
            return res.status(500).json({ message: "DB error", error: error.message });
        }

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // password check
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // remove password
        const { password: _, ...safeUser } = user;

        res.json({
            token,
            user: safeUser
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
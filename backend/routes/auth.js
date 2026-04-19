const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//  fallback if ENV not working
const JWT_SECRET = process.env.JWT_SECRET || "akhtar@123";


// ================= REGISTER =================
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // validation
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "All fields required" });
        }

        // check existing user
        const { data: existingUser, error: checkError } = await supabase
            .from("patient")
            .select("id")
            .eq("email", email);

        if (checkError) {
            console.log("DB ERROR:", checkError.message);
            return res.status(500).json({ message: "Database error" });
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
            console.log("INSERT ERROR:", error.message);
            return res.status(500).json({ message: "Insert error" });
        }

        res.status(201).json({
            message: "User registered successfully",
            data
        });

    } catch (err) {
        console.log("REGISTER ERROR:", err.message);
        res.status(500).json({ message: "Server error" });
    }
});


// ================= LOGIN =================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }

        // get user
        const { data: user, error } = await supabase
            .from("patient")
            .select("*")
            .eq("email", email)
            .single();

        if (error) {
            console.log("DB ERROR:", error.message);
            return res.status(500).json({ message: "Database error" });
        }

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // compare password
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // generate token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        // remove password
        const { password: _, ...safeUser } = user;

        res.json({
            token,
            user: safeUser
        });

    } catch (err) {
        console.log("LOGIN ERROR:", err.message);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/auth");

/* ================= GET ================= */
router.get("/", verifyToken, (req, res) => {

    const userId = req.user.id;

    db.query(
        "SELECT * FROM appointments WHERE user_id = ?",
        [userId],
        (err, result) => {
            if (err) return res.status(500).json({ message: "Database error" });

            res.json(result);
        }
    );
});

/* ================= BOOK ================= */
router.post("/", verifyToken, (req, res) => {

    const { name, doctor, date, time } = req.body;
    const userId = req.user.id;   //  FROM JWT

    db.query(
        "INSERT INTO appointments (user_id, name, doctor, date, time, status) VALUES (?, ?, ?, ?, ?, ?)",
        [userId, name, doctor, date, time, "Pending"],
        (err) => {
            if (err) return res.status(500).json({ message: "Insert error" });

            res.json({ message: "Appointment booked successfully" });
        }
    );
});

/* ================= CANCEL ================= */
router.put("/cancel/:id", verifyToken, (req, res) => {

    const { id } = req.params;

    db.query(
        "UPDATE appointments SET status = ? WHERE id = ?",
        ["Cancelled", id],
        (err) => {
            if (err) return res.status(500).json({ message: "Cancel error" });

            res.json({ message: "Appointment cancelled" });
        }
    );
});

/* ================= RESCHEDULE ================= */
router.put("/reschedule/:id", verifyToken, (req, res) => {

    const { id } = req.params;
    const { date, time } = req.body;

    if (!date || !time) {
        return res.status(400).json({ message: "Date and time required" });
    }

    db.query(
        "UPDATE appointments SET date = ?, time = ?, status = ? WHERE id = ?",
        [date, time, "Rescheduled", id],
        (err) => {
            if (err) return res.status(500).json({ message: "Reschedule error" });

            res.json({ message: "Appointment rescheduled" });
        }
    );
});

module.exports = router;
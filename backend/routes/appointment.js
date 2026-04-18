const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const verifyToken = require("../middleware/auth");


// ================= GET APPOINTMENTS =================
router.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const { data, error } = await supabase
            .from("appointment")
            .select("*")
            .eq("patient_id", userId);

        if (error) {
            return res.status(500).json({ message: "Database error", error });
        }

        res.json(data || []);

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
});


// ================= BOOK APPOINTMENT =================
router.post("/", verifyToken, async (req, res) => {
    try {
        const { name, date, time } = req.body;
        const userId = req.user.id;

        // ✅ validation FIX
        if (!name || !date || !time) {
            return res.status(400).json({ message: "All fields required" });
        }

        const { data, error } = await supabase
            .from("appointment")
            .insert([
                {
                    patient_id: userId,
                    name,
                    date,
                    time,
                    status: "pending"
                }
            ])
            .select();

        if (error) {
            return res.status(500).json({ message: "Insert error", error });
        }

        res.json({
            message: "Appointment booked successfully",
            data
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
});


// ================= CANCEL APPOINTMENT =================
router.put("/cancel/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const { error } = await supabase
            .from("appointment")
            .update({ status: "cancelled" })
            .eq("id", id)
            .eq("patient_id", userId);

        if (error) {
            return res.status(500).json({ message: "Cancel error", error });
        }

        res.json({ message: "Appointment cancelled" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
});


// ================= RESCHEDULE =================
router.put("/reschedule/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { date, time } = req.body;
        const userId = req.user.id;

        // ✅ validation FIX
        if (!date || !time) {
            return res.status(400).json({ message: "Date and time required" });
        }

        const { error } = await supabase
            .from("appointment")
            .update({
                date,
                time,
                status: "rescheduled"
            })
            .eq("id", id)
            .eq("patient_id", userId);

        if (error) {
            return res.status(500).json({ message: "Reschedule error", error });
        }

        res.json({ message: "Appointment rescheduled" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
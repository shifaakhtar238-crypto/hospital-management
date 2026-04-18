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
            console.log("GET ERROR:", error);
            return res.status(500).json({ message: "Database error" });
        }

        res.json(data || []);

    } catch (err) {
        console.log("SERVER ERROR:", err.message);
        res.status(500).json({ message: "Server error" });
    }
});


// ================= BOOK APPOINTMENT =================
router.post("/", verifyToken, async (req, res) => {
    try {
        const { name, date, time } = req.body;
        const userId = req.user.id;

        // validation
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
            console.log("INSERT ERROR:", error);
            return res.status(500).json({ message: "Insert error" });
        }

        res.json({
            message: "Appointment booked successfully",
            data
        });

    } catch (err) {
        console.log("SERVER ERROR:", err.message);
        res.status(500).json({ message: "Server error" });
    }
});


// ================= CANCEL APPOINTMENT =================
router.put("/cancel/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const { data, error } = await supabase
            .from("appointment")
            .update({ status: "cancelled" })
            .eq("id", id)
            .eq("patient_id", userId)
            .select();

        if (error) {
            console.log("CANCEL ERROR:", error);
            return res.status(500).json({ message: "Cancel error" });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        res.json({ message: "Appointment cancelled" });

    } catch (err) {
        console.log("SERVER ERROR:", err.message);
        res.status(500).json({ message: "Server error" });
    }
});


// ================= RESCHEDULE =================
router.put("/reschedule/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { date, time } = req.body;
        const userId = req.user.id;

        if (!date || !time) {
            return res.status(400).json({ message: "Date and time required" });
        }

        const { data, error } = await supabase
            .from("appointment")
            .update({
                date,
                time,
                status: "rescheduled"
            })
            .eq("id", id)
            .eq("patient_id", userId)
            .select();

        if (error) {
            console.log("RESCHEDULE ERROR:", error);
            return res.status(500).json({ message: "Reschedule error" });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        res.json({ message: "Appointment rescheduled" });

    } catch (err) {
        console.log("SERVER ERROR:", err.message);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
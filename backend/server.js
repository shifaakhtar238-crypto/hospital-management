const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();


// ================= PORT =================
const PORT = process.env.PORT || 5000;


// ================= MIDDLEWARE =================

// CORS
app.use(cors({
    origin: "*", // production me frontend URL daalna
    methods: ["GET", "POST", "PUT", "DELETE"],
}));

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ================= TEST ROUTE =================
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Hospital Management API is running 🚀"
    });
});


// ================= ROUTES =================
app.use("/api/auth", require("./routes/auth"));
app.use("/api/appointments", require("./routes/appointment"));


// ================= 404 HANDLER =================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});


// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
    console.error("SERVER ERROR:", err.message);

    res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
});


// ================= START SERVER =================
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
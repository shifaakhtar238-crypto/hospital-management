const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./db"); 

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/appointments", require("./routes/appointment"));

// ✅ IMPORTANT: use dynamic PORT for deployment
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
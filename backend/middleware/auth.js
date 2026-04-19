const jwt = require("jsonwebtoken");

//  same fallback as auth.js
const JWT_SECRET = process.env.JWT_SECRET || "akhtar@123";

module.exports = function (req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        // 1. Check header exists
        if (!authHeader) {
            return res.status(401).json({
                message: "Authorization header missing"
            });
        }

        // 2. Validate format: Bearer token
        const parts = authHeader.split(" ");

        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({
                message: "Invalid token format. Use: Bearer <token>"
            });
        }

        const token = parts[1];

        // ENV check remove (not needed now)

        // 3. Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // 4. Attach user to request
        req.user = decoded;

        next();

    } catch (err) {
        console.log("JWT AUTH ERROR:", err.message);

        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};
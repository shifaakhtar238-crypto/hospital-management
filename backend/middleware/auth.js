const jwt = require("jsonwebtoken");

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

        // 3. Check env variable
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: "Server misconfiguration: JWT_SECRET missing"
            });
        }

        // 4. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 5. Attach user to request
        req.user = decoded;

        next();

    } catch (err) {
        console.log("JWT AUTH ERROR:", err.message);

        // token expired or invalid
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};
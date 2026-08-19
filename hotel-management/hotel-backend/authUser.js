const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

module.exports = function (req, res, next) {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ message: "No Token Sent" });

  const parts = header.split(" ");
  const token = parts.length === 2 ? parts[1] : parts[0];

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid Token" });

    req.user = decoded;
    next();
  });
};

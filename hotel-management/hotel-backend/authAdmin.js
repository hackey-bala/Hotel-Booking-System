const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {

  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "No Token" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token Missing" });

  jwt.verify(token, "secret123", (err, decoded) => {
    if (err) {
      console.log("JWT Failed:", err.message);
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.admin = decoded;
    next();
  });

};

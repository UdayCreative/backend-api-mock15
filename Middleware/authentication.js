const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.headers?.authorization?.split(" ")[1];
  if (token) {
    const decoded = jwt.sign(token, "shhhhh");
    if (decoded) {
      const userId = decoded.userId;
      req.body.userId = userId;
      next();
    } else {
      res.send("Please insert login creadential");
    }
  } else {
    res.send("Please insert login creadential");
  }
};

module.exports = { auth };

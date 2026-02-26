const { clerkClient } = require("@clerk/clerk-sdk-node");

const clerkAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided!" });
    }

    const session = await clerkClient.sessions.verifySession(token, token);
    req.userId = session.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token!" });
  }
};

module.exports = clerkAuth;
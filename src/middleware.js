import jwt from "jsonwebtoken";
import User from "./models/user.model.js";

const protect = async (req, res, next) => {
  let token;

  // Check for a correctly formatted token in the authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 1. Extract the token from the "Bearer <token>" string
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify the token's signature
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Find the user from the ID in the token and attach to the request
      req.user = await User.findById(decoded.id).select("-password");

      // 4. If the user associated with the token no longer exists
      if (!req.user) {
        return res
          .status(401)
          .json({ error: "Not authorized, user not found" });
      }

      // 5. If everything is ok, proceed to the protected route
      next();
    } catch (error) {
      // This catches errors like an expired token or invalid signature
      return res.status(401).json({ error: "Not authorized, token failed" });
    }
  } else {
    // This runs if the authorization header is missing or badly formatted
    return res.status(401).json({ error: "Not authorized, no token" });
  }
};

export default protect;

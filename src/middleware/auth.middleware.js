import jwt from "jsonwebtoken";
import config from "../config/config.js";
import prisma from "../services/prisma.service.js";

export const authenticate = async (req, res, next) => {
  try {
    // Debug logging
    // console.log('Request Headers:', req.headers);
    // console.log('JWT Secret:', config.jwt.secret);
    // console.log('JWT Config:', config.jwt);

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      // console.error('No Authorization header');
      return res.status(401).json({
        error: "No Authorization header",
        details: "Authorization header is missing",
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.error("Token is missing");
      return res.status(401).json({
        error: "Token format invalid",
        details: 'Use "Bearer <token>"',
      });
    }

    console.log("Received Token:", token);

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
      console.log("Decoded Token:", decoded);
    } catch (verifyError) {
      console.error("Token Verification Error:", verifyError);

      if (verifyError.name === "TokenExpiredError") {
        return res.status(401).json({
          error: "Token expired",
          details: "Please log in again",
        });
      }

      if (verifyError.name === "JsonWebTokenError") {
        return res.status(401).json({
          error: "Invalid token",
          details: verifyError.message,
        });
      }

      throw verifyError;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, isSuperAgent: true },
    });

    if (!user) {
      console.error("User not found for ID:", decoded.userId);
      return res.status(401).json({
        error: "User not found",
        details: "No user associated with this token",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication Middleware Error:", error);
    res.status(401).json({
      error: "Authentication failed",
      details: error.message,
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    next();
  };
};

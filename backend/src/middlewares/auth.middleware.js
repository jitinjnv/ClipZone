import { User } from "../models/User.model.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyToken = asyncHandler(async (req, _res, next) => {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!accessToken) {
      return next(new ApiError(401, "Unauthorized request: No token provided"));
    }

    const decodedUser = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    // Log the decoded user ID to make sure it's correct
    console.log("Decoded User ID:", decodedUser._id);

    const user = await User.findById(decodedUser._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return next(new ApiError(401, "Invalid access token: User not found"));
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Error during token verification:", err);
    return next(new ApiError(401, err?.message || "Invalid access token"));
  }
});

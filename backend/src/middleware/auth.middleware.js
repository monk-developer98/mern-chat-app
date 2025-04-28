import  jwt  from "jsonwebtoken";
import  User  from "../models/user.model.js";


export const protectRoute = async (req, res, next) => {
    try {
        const reqToken = req.cookies.token || req.headers.authorization?.split(" ")[1];

        if(!reqToken) {
            return res.status(401).json({ message: "Unauthorized  No  token-Provided" });
        }
        const decoded = jwt.verify(reqToken, process.env.JWT_SECRET);

        if(!decoded) {
            return res.status(401).json({ message: "Unauthorized  " });
        }
        const user = await User.findById(decoded.id).select("-password");
        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        console.log("Error in protectRoute middleware", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}
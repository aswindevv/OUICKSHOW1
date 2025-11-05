import { clerkClient } from "@clerk/express";

export const protectAdmin = async (req, res, next) => {
    try {
        const { userId } = req.auth();  // Call req.auth() as a function to get the userId

        // Fetch the user details from Clerk
        const user = await clerkClient.users.getUser(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if the user has the 'admin' role in their privateMetadata
        if (user.privateMetadata.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Not authorized as admin" });
        }

        // If the user is an admin, proceed to the next middleware/route handler
        next();

    } catch (error) {
        console.error(error);  // Log the error for debugging purposes
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

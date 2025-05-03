import { clerkClient } from "@clerk/express";
import User from '../models/User.js';

export const protectEducator = async (req, res, next) => {
    try {
        const userId = req.auth.userId;
        const clerkUser = await clerkClient.users.getUser(userId);

        if (clerkUser.publicMetadata.role !== 'educator') {
            return res.status(403).json({ success: false, message: 'Unauthorized Access' });
        }

        // Get or create user in our database
        let user = await User.findById(userId);
        if (!user) {
            user = await User.create({
                _id: userId,
                name: `${clerkUser.firstName} ${clerkUser.lastName}`,
                email: clerkUser.emailAddresses[0].emailAddress,
                imageUrl: clerkUser.imageUrl,
            });
        }

        // Set user in request object
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: error.message });
    }
};


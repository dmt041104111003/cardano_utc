import { clerkClient } from '@clerk/clerk-sdk-node';

export const isAuthenticated = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Please login to access this resource'
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Please login to access this resource'
            });
        }

        try {
            // Verify the session token with Clerk
            const session = await clerkClient.sessions.verifySession(token);
            const user = await clerkClient.users.getUser(session.userId);
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            req.user = {
                _id: user.id,
                email: user.emailAddresses[0]?.emailAddress,
                name: `${user.firstName} ${user.lastName}`,
                role: user.publicMetadata.role || 'student'
            };
            next();
        } catch (clerkError) {
            console.error('Clerk verification error:', clerkError);
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            message: 'Authentication error'
        });
    }
};

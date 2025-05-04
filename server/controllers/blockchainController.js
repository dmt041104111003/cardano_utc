import { createUnsignedMintTx } from '../utils/BlockchainUtils.js';
import User from '../models/User.js';
import { Purchase } from '../models/Purchase.js';

export const createCourseTx = async (req, res) => {
    try {
        const { courseData, utxos, collateral, address } = req.body;
        const educatorId = req.auth.userId;

        // Validate required fields
        if (!courseData || !utxos || !collateral || !address) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Check if user is premium
        const user = await User.findById(educatorId);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }

        // Only check minting limit if not premium
        if (!user.isPremium) {
            const now = new Date();
            if (user.lastCourseCreatedAt) {
                const diff = now - user.lastCourseCreatedAt;
                const ONE_MIN = 10 * 60 * 1000;
                if (diff < ONE_MIN) {
                    const timeLeft = ONE_MIN - diff;
                    return res.status(400).json({
                        success: false,
                        message: 'You can only mint a course every 1 minute. Please wait before minting another course.',
                        timeLeft: timeLeft
                    });
                }
            }
            // Update lastCourseCreatedAt
            user.lastCourseCreatedAt = now;
            await user.save();
        }

        // Validate address format
        if (!address.startsWith('addr_')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid wallet address format'
            });
        }

        // Validate UTXO array
        if (!Array.isArray(utxos) || utxos.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid UTXOs'
            });
        }

        // Validate collateral
        if (!Array.isArray(collateral) || collateral.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid collateral'
            });
        }

        // Create unsigned transaction
        let unsignedTx;
        try {
            unsignedTx = await createUnsignedMintTx(
                utxos,
                address,
                collateral,
                address,
                courseData
            );
        } catch (txError) {
            return res.status(400).json({
                success: false,
                message: 'Blockchain transaction failed. Please check your wallet, UTXOs, and try again.',
                error: txError.message || txError
            });
        }

        if (!unsignedTx) {
            return res.status(400).json({
                success: false,
                message: 'Failed to create transaction. Please check your wallet, UTXOs, and try again.'
            });
        }

        return res.json({
            success: true,
            unsignedTx
        });

    } catch (error) {
        console.error('Error in createCourseTx:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

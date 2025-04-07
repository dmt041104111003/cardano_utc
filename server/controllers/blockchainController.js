import { createUnsignedMintTx } from '../utils/BlockchainUtils.js';

export const createCourseTx = async (req, res) => {
    try {
        const { courseData, utxos, collateral, address } = req.body;

        // Validate required fields
        if (!courseData || !utxos || !collateral || !address) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
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
        const unsignedTx = await createUnsignedMintTx(
            utxos,
            address,
            collateral,
            address,
            courseData
        );

        if (!unsignedTx) {
            return res.status(400).json({
                success: false,
                message: 'Failed to create transaction'
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

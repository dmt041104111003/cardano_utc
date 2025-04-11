import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import Course from '../models/Course.js';

// Initialize Blockfrost API client
const blockfrost = new BlockFrostAPI({
    projectId: process.env.BLOCKFROST_API_KEY,
    network: 'preprod', // since you're using preprod API key
});

export const getNFTInfo = async (req, res) => {
    const courseId = req.params.courseId;
    console.log(' [NFT Query] Starting for courseId:', courseId);
    
    try {
        // Get course details
        const course = await Course.findById(courseId);
        if (!course) {
            console.log(' [NFT Query] Course not found:', courseId);
            return res.status(404).json({ 
                success: false, 
                message: 'Course not found' 
            });
        }

        console.log(' [NFT Query] Found course:', course.courseTitle);

        try {
            // Get transaction hash from course
            const txHash = course.txHash;
            if (!txHash) {
                throw new Error('Transaction hash not found');
            }

            console.log(' [NFT Query] Getting transaction:', txHash);
            const txDetails = await blockfrost.txs(txHash);
            console.log(' [NFT Query] Transaction details:', txDetails);

            // Get metadata from transaction
            const txMetadata = await blockfrost.txsMetadata(txHash);
            console.log(' [NFT Query] Transaction metadata:', txMetadata);

            // Get minted assets from transaction
            const txUtxos = await blockfrost.txsUtxos(txHash);
            console.log(' [NFT Query] Transaction UTXOs:', txUtxos);

            // Find the NFT in the outputs
            const mintedAsset = txUtxos.outputs.find(output => 
                output.amount.find(amt => amt.unit !== 'lovelace')
            );

            if (!mintedAsset) {
                throw new Error('No NFT found in transaction outputs');
            }

            const assetInfo = mintedAsset.amount.find(amt => amt.unit !== 'lovelace');
            if (!assetInfo) {
                throw new Error('No NFT found in transaction outputs');
            }

            console.log(' [NFT Query] Found NFT:', assetInfo.unit);

            // Get policy ID and asset name
            const policyId = assetInfo.unit.slice(0, 56);
            const assetName = assetInfo.unit.slice(56);

            // Get asset details
            const assetDetails = await blockfrost.assetsById(assetInfo.unit);
            console.log(' [NFT Query] Asset details:', assetDetails);

            // Format metadata theo CIP-721
            const nftMetadata = {
                "721": {
                    [policyId]: {
                        [assetName]: {
                            name: assetDetails.onchain_metadata?.name || course.courseTitle,
                            image: assetDetails.onchain_metadata?.image || {},
                            mediaType: assetDetails.onchain_metadata?.mediaType || "image/png",
                            description: assetDetails.onchain_metadata?.description || "",
                            properties: assetDetails.onchain_metadata?.properties || {
                                courseId: courseId,
                                created: txDetails.block_time,
                                price: course.coursePrice || 0,
                                discount: course.discount || 0
                            }
                        }
                    }
                }
            };

            return res.json({
                success: true,
                policyId,
                assetName,
                courseTitle: course.courseTitle,
                metadata: nftMetadata,
                mintTransaction: {
                    txHash,
                    block: txDetails.block_height,
                    timestamp: txDetails.block_time
                },
                blockchainData: {
                    assetDetails,
                    transaction: txDetails,
                    metadata: txMetadata
                }
            });

        } catch (blockchainError) {
            console.error(' [NFT Query] Blockchain query error:', blockchainError);
            throw new Error('Failed to fetch blockchain data: ' + blockchainError.message);
        }

    } catch (error) {
        console.error(' [NFT Query] Error:', error);
        console.error('Stack:', error.stack);
        
        res.status(500).json({ 
            success: false, 
            message: 'Error querying NFT information',
            error: error.message 
        });
    }
};

export const getNFTInfoByTx = async (req, res) => {
    const { txHash } = req.params;
    console.log(' [NFT Query] Starting for txHash:', txHash);
    
    try {
        // Get transaction details
        const txDetails = await blockfrost.txs(txHash);
        console.log(' [NFT Query] Transaction details:', txDetails);

        // Get minted assets from transaction
        const txUtxos = await blockfrost.txsUtxos(txHash);
        console.log(' [NFT Query] Transaction UTXOs:', txUtxos);

        // Find the NFT in the outputs
        const mintedAsset = txUtxos.outputs.find(output => 
            output.amount.find(amt => amt.unit !== 'lovelace')
        );

        if (!mintedAsset) {
            throw new Error('No NFT found in transaction outputs');
        }

        const assetInfo = mintedAsset.amount.find(amt => amt.unit !== 'lovelace');
        if (!assetInfo) {
            throw new Error('No NFT found in transaction outputs');
        }

        // Get policy ID from unit
        const policyId = assetInfo.unit.slice(0, 56);

        res.json({
            success: true,
            policyId,
            txHash
        });

    } catch (error) {
        console.error(' [NFT Query] Error:', error);
        console.error('Stack:', error.stack);
        
        res.status(500).json({ 
            success: false, 
            message: 'Error querying NFT information',
            error: error.message 
        });
    }
};

export const getNFTInfoByPolicy = async (req, res) => {
    const { policyId, txHash } = req.params;
    console.log(' [NFT Query] Starting for policyId:', policyId, 'and txHash:', txHash);
    
    try {
        try {
            console.log(' [NFT Query] Getting transaction:', txHash);
            const txDetails = await blockfrost.txs(txHash);
            console.log(' [NFT Query] Transaction details:', txDetails);

            // Get metadata from transaction
            const txMetadata = await blockfrost.txsMetadata(txHash);
            console.log(' [NFT Query] Transaction metadata:', txMetadata);

            // Get minted assets from transaction
            const txUtxos = await blockfrost.txsUtxos(txHash);
            console.log(' [NFT Query] Transaction UTXOs:', txUtxos);

            // Find the NFT in the outputs with matching policy ID
            const mintedAsset = txUtxos.outputs.find(output => 
                output.amount.find(amt => amt.unit !== 'lovelace' && amt.unit.startsWith(policyId))
            );

            if (!mintedAsset) {
                throw new Error('No NFT found in transaction outputs');
            }

            const assetInfo = mintedAsset.amount.find(amt => amt.unit !== 'lovelace' && amt.unit.startsWith(policyId));
            if (!assetInfo) {
                throw new Error('No NFT found in transaction outputs');
            }

            console.log(' [NFT Query] Found NFT:', assetInfo.unit);

            // Get asset name from unit
            const assetName = assetInfo.unit.slice(56);

            // Get asset details
            const assetDetails = await blockfrost.assetsById(assetInfo.unit);
            console.log(' [NFT Query] Asset details:', assetDetails);

            // Get the raw metadata
            let metadata = assetDetails.onchain_metadata;
            if (!metadata) {
                throw new Error('Asset metadata not found');
            }

            console.log(' [NFT Query] Raw metadata:', metadata);

            // Extract full CIP-721 metadata
            let nftMetadata;
            if (metadata['721'] && metadata['721'][policyId]) {
                // If metadata is already in CIP-721 format
                console.log(' [NFT Query] Using existing CIP-721 metadata');
                nftMetadata = metadata;
            } else {
                // Format metadata according to CIP-721
                console.log(' [NFT Query] Formatting as CIP-721 metadata');
                nftMetadata = metadata; // Return raw metadata instead of formatting
            }

            console.log(' [NFT Query] Final metadata:', nftMetadata);

            return res.json({
                success: true,
                policyId,
                assetName,
                courseTitle: metadata.course_title || metadata.name,
                metadata: nftMetadata,
                rawMetadata: metadata, // Include raw metadata as well
                mintTransaction: {
                    txHash,
                    block: txDetails.block_height,
                    timestamp: txDetails.block_time
                },
                blockchainData: {
                    assetDetails,
                    transaction: txDetails,
                    metadata: txMetadata
                }
            });

        } catch (blockchainError) {
            console.error(' [NFT Query] Blockchain query error:', blockchainError);
            throw new Error('Failed to fetch blockchain data: ' + blockchainError.message);
        }

    } catch (error) {
        console.error(' [NFT Query] Error:', error);
        console.error('Stack:', error.stack);
        
        res.status(500).json({ 
            success: false, 
            message: 'Error querying NFT information',
            error: error.message 
        });
    }
};

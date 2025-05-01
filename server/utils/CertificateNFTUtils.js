import { stringToHex, BlockfrostProvider, MeshTxBuilder, ForgeScript, Transaction } from '@meshsdk/core';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import dotenv from 'dotenv';
import CustomInitiator from './CustomInitiator.js';

dotenv.config();

/**
 * Create unsigned transaction for minting NFT certificate
 */
async function createCertificateNFT({
    utxos,
    userAddress,
    collateral,
    courseData
}) {
    try {
        if (!userAddress) {
            throw new Error('User address is required');
        }

        // Generate unique asset name
        const timestamp = Math.floor(Date.now() / 1000).toString(36);
        const shortCourseId = courseData._id.toString().substring(0, 4);
        const assetName = `CERT_${shortCourseId}_${timestamp}`;
        const assetNameHex = stringToHex(assetName);

        console.log('NFT Certificate asset:', {
            name: assetName,
            nameHex: assetNameHex,
            length: assetName.length
        });

        // Create forging script with expiration using educator's address
        const educatorAddress = courseData.creatorAddress;
        if (!educatorAddress) {
            throw new Error('Educator address is required');
        }
        console.log('Creating forging script with educator address:', educatorAddress);

        // Create policy script and get policy ID directly
        const forgingScript = await ForgeScript.withOneSignature(educatorAddress);
        
        // Since forgingScript is a hex string, use it directly as policy ID
        const policyId = forgingScript;
        console.log('Using hex string as Policy ID:', policyId);

        // Get short addresses for display
        const shortUserAddress = userAddress.slice(0, 10) + '...' + userAddress.slice(-10);
        const shortCreatorAddress = courseData.creatorAddress ? 
            courseData.creatorAddress.slice(0, 10) + '...' + courseData.creatorAddress.slice(-10) : '';

        // Use provided IPFS hash from certificate image if available
        const ipfsHash = courseData.ipfsHash;
        console.log('Using certificate IPFS hash:', ipfsHash);
        
        const metadata = {
            name: `${courseData.courseTitle} Certificate`,
            image: ipfsHash,
            mediaType: "image/png",
            description: "Course completion certificate",
            properties: {
                courseId: courseData._id.toString(),
                // ... các trường khác nếu cần
            },
            course_id: courseData._id.toString(),
            // CIP-721 metadata for standards compliance
            "721": {
                [policyId]: {
                    [assetName]: {
                        name: `${courseData.courseTitle} Certificate`,
                        image: ipfsHash,
                        mediaType: "image/png",
                        course_id: courseData._id.toString(),
                        course_title: courseData.courseTitle,
                        student_id: courseData.studentId || '',
                        student_name: courseData.studentName,
                        student_address: shortUserAddress,
                        educator_id: (typeof courseData.educator === 'object' ? courseData.educator._id : courseData.educatorId) || '',
                        educator_name: typeof courseData.educator === 'object' ? courseData.educator.name : courseData.educator,
                        educator_address: shortCreatorAddress,
                        issued_at: new Date().toISOString().split('T')[0]
                    }
                }
            }
        };

        // Validate metadata
        if (!metadata["721"][policyId] || !metadata["721"][policyId][assetName]) {
            console.error('Invalid metadata structure:', metadata);
            throw new Error('Invalid metadata structure');
        }

        console.log('Metadata:', JSON.stringify(metadata, null, 2));

        console.log('Creating mint transaction with asset:', {
            name: assetName,
            metadata: metadata
        });

        // Create and build transaction
        const tx = new Transaction({ 
            initiator: new CustomInitiator(courseData.creatorAddress, collateral, utxos)
        });

        // Prepare mint asset và gửi cho student với minimum ADA
        const asset = {
            assetName: assetNameHex,
            assetQuantity: "1",
            metadata: metadata,
            label: "721",
            recipient: userAddress,
            // lovelace: "1500000" // 1.5 ADA minimum required
        };

        console.log('Mint asset:', JSON.stringify(asset, null, 2));

        // Mint NFT cho student
        tx.mintAsset(forgingScript, asset);

        // Gửi tiền thừa về cho educator
        tx.sendLovelace(
            courseData.creatorAddress, // Địa chỉ của educator
            "0", // Số dư còn lại sẽ tự động được trả về
            {
                changeAddress: courseData.creatorAddress // Đảm bảo tiền thừa về educator
            }
        );

        const unsignedTx = await tx.build();
        return {
            unsignedTx,
            policyId
        };

    } catch (error) {
        console.error("Error creating certificate NFT:", error);
        throw error;
    }
}

export { createCertificateNFT };

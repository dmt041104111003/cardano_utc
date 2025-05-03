import { generateCertificateBuffer } from '../utils/ImageUtils.js';
import { uploadToPinata } from '../utils/PinataUtils.js';
import { createBatchMintTransaction as batchMintTx } from '../utils/BatchMintUtils.js';

export const handleBatchMintRequest = async (req, res) => {
    try {
        console.log('Received batch mint request with certificate count:', req.body.certificateRequests?.length || 0);
        const { utxos: utxosString, collateral: collateralString, educatorAddress, certificateRequests } = req.body;

        if (!utxosString || !collateralString || !educatorAddress || !certificateRequests || !Array.isArray(certificateRequests)) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters'
            });
        }
        
        // Parse the stringified UTXOs and collateral
        const utxos = JSON.parse(utxosString);
        const collateral = JSON.parse(collateralString);

        // Process each certificate request to generate certificate images and upload to IPFS
        const processedRequests = [];
        
        for (const request of certificateRequests) {
            const { courseData, userAddress, studentId } = request;
            
            if (!courseData || !userAddress) {
                console.error('Invalid certificate request:', request);
                continue; // Skip invalid requests
            }
            
            try {
                // Generate certificate buffer
                console.log(`Generating certificate for student ${courseData.studentName} in course ${courseData.courseTitle}`);
                const certificateBuffer = await generateCertificateBuffer(
                    courseData.studentName,
                    courseData.educator,
                    courseData.courseTitle,
                    new Date().toLocaleDateString()
                );

                // Upload buffer to IPFS
                console.log('Uploading certificate to IPFS...');
                const ipfsResult = await uploadToPinata(certificateBuffer);
                console.log('Certificate image uploaded:', ipfsResult);

                // Add to processed requests
                processedRequests.push({
                    ...request,
                    ipfsHash: ipfsResult.IpfsHash
                });
            } catch (error) {
                console.error(`Error processing certificate for ${courseData.studentName}:`, error);
                // Continue with other requests even if one fails
            }
        }

        if (processedRequests.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid certificate requests could be processed'
            });
        }

        // Create batch mint transaction
        console.log('Creating batch mint transaction...');
        const { unsignedTx, policyId, processedCertificates } = await batchMintTx({
            utxos,
            collateral,
            educatorAddress,
            certificateRequests: processedRequests
        });

        res.json({
            success: true,
            unsignedTx,
            policyId,
            processedCertificates
        });

    } catch (error) {
        console.error("Error creating batch mint transaction:", error);
        
        // Provide more detailed error information
        const errorDetails = {
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        };
        
        res.status(500).json({
            success: false,
            message: error.message,
            error: errorDetails
        });
    }
};

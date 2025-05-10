import { stringToHex, Transaction } from '@meshsdk/core';
import { ForgeScript } from '@meshsdk/core';
import CustomInitiator from './CustomInitiator.js';

/**
 * Ensures a string is within the Cardano metadata value limit (64 bytes)
 * @param {string} str - The string to truncate if needed
 * @param {number} maxLength - Optional max length (default: 64)
 * @returns {string} - Truncated string
 */
function ensureMetadataLength(str, maxLength = 64) {
    if (!str) return '';
    
    // Convert to string if not already
    const strValue = String(str);
    
    // Check byte length (UTF-8)
    const encoder = new TextEncoder();
    const bytes = encoder.encode(strValue);
    
    if (bytes.length <= maxLength) {
        return strValue;
    }
    
    // If too long, truncate and add ellipsis
    // Start with half the max length and adjust until we're under the limit
    let truncatedLength = Math.floor(maxLength * 0.8);
    let truncated = strValue.substring(0, truncatedLength) + '...';
    
    // Check if we're still under the limit
    while (encoder.encode(truncated).length > maxLength) {
        truncatedLength -= 5;
        truncated = strValue.substring(0, truncatedLength) + '...';
    }
    
    return truncated;
}

/**
 * Create unsigned transaction for minting multiple NFT certificates in a single transaction
 */
async function createBatchMintTransaction({
    utxos,
    collateral,
    educatorAddress,
    certificateRequests
}) {
    try {
        if (!educatorAddress) {
            throw new Error('Educator address is required');
        }

        if (!certificateRequests || certificateRequests.length === 0) {
            throw new Error('Certificate requests are required');
        }

        // Create forging script with educator's address
        console.log('Creating forging script with educator address:', educatorAddress);
        const forgingScript = await ForgeScript.withOneSignature(educatorAddress);
        
        // Since forgingScript is a hex string, use it directly as policy ID
        const policyId = forgingScript;
        console.log('Using hex string as Policy ID:', policyId);

        // Create and build transaction
        const tx = new Transaction({ 
            initiator: new CustomInitiator(educatorAddress, collateral, utxos)
        });

        // Process each certificate request
        const processedCertificates = [];
        
        for (const request of certificateRequests) {
            const { 
                courseData, 
                userAddress, 
                ipfsHash 
            } = request;
            
            // Generate unique asset name (keeping it short to avoid Cardano limits)
            // Cardano has a 32-byte limit for asset names
            const index = processedCertificates.length;
            
            // Tạo asset name độc nhất bằng cách kết hợp:
            // 1. courseId (2 ký tự đầu)
            // 2. studentId (2 ký tự đầu nếu có)
            // 3. Timestamp hiện tại
            // 4. Mã ngẫu nhiên 4 chữ số
            const shortCourseId = courseData.courseId.toString().substring(0, 2);
            const studentId = courseData.studentId ? courseData.studentId.toString().substring(0, 2) : 'XX';
            const timestamp = Date.now().toString().substring(8, 13); // Lấy 5 chữ số cuối của timestamp
            const randomCode = Math.floor(1000 + Math.random() * 9000); // Mã ngẫu nhiên 4 chữ số
            
            // Kết hợp thành asset name độc nhất
            const assetName = `C${shortCourseId}${studentId}${timestamp}${randomCode}`;
            const assetNameHex = stringToHex(assetName);

            console.log('NFT Certificate asset:', {
                name: assetName,
                nameHex: assetNameHex,
                length: assetName.length
            });

            // Get short addresses for display
            const shortUserAddress = userAddress.slice(0, 10) + '...' + userAddress.slice(-10);
            const shortCreatorAddress = educatorAddress.slice(0, 10) + '...' + educatorAddress.slice(-10);

            // Prepare metadata with length-limited values
            const truncatedTitle = ensureMetadataLength(courseData.courseTitle, 40);
            const truncatedStudentName = ensureMetadataLength(courseData.studentName, 30);
            const truncatedEducator = ensureMetadataLength(courseData.educator, 30);
            
            // Create certificate name that fits within limits
            const certName = ensureMetadataLength(`${truncatedTitle} Certificate`, 64);
            
            // Create description that fits within limits
            const description = ensureMetadataLength(`Cert for ${truncatedStudentName} - ${truncatedTitle}`, 64);
            
            const metadata = {
                name: certName,
                image: `ipfs://${ipfsHash}`,  // Sử dụng định dạng ipfs:// để tương thích tốt hơn
                mediaType: "image/png",
                description: description,
                properties: {
                    courseId: courseData.courseId.toString(),
                    studentId: courseData.studentId ? courseData.studentId.toString() : "",
                    asset_name: assetName,  // Thêm asset_name vào metadata để dễ tra cứu
                    unique_id: `${shortCourseId}${studentId}${timestamp}${randomCode}`
                },
                course_id: courseData.courseId.toString(),
                // CIP-721 metadata for standards compliance
                "721": {
                    [policyId]: {
                        [assetName]: {
                            name: certName,
                            image: `ipfs://${ipfsHash}`,
                            mediaType: "image/png",
                            course_id: courseData.courseId.toString(),
                            course_title: truncatedTitle,
                            student_name: truncatedStudentName,
                            student_id: courseData.studentId ? courseData.studentId.toString() : "",
                            student_address: shortUserAddress,
                            educator_name: truncatedEducator,
                            educator_address: shortCreatorAddress,
                            asset_name: assetName,
                            issued_at: new Date().toISOString().split('T')[0]
                        }
                    }
                }
            };

            // Mint NFT for student
            const asset = {
                assetName: assetNameHex,
                assetQuantity: "1",
                metadata: metadata,
                label: "721",
                recipient: userAddress,
            };

            console.log('Adding mint asset to batch:', JSON.stringify(asset, null, 2));
            tx.mintAsset(forgingScript, asset);
            
            // Store processed certificate info
            processedCertificates.push({
                assetName,
                policyId,
                ipfsHash,
                userAddress,
                courseId: courseData.courseId,
                studentId: courseData.studentId,
                courseTitle: courseData.courseTitle
            });
        }

        // Send change back to educator
        tx.sendLovelace(
            educatorAddress,
            "0", // Remaining balance will be automatically returned
            {
                changeAddress: educatorAddress // Ensure change goes back to educator
            }
        );

        const unsignedTx = await tx.build();
        return {
            unsignedTx,
            policyId,
            processedCertificates
        };

    } catch (error) {
        console.error("Error creating batch mint transaction:", error);
        throw error;
    }
}

export { createBatchMintTransaction };

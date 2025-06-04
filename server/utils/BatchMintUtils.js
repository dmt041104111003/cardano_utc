import { stringToHex, Transaction } from '@meshsdk/core';
import { ForgeScript } from '@meshsdk/core';
import CustomInitiator from './CustomInitiator.js';

function ensureMetadataLength(str, maxLength = 64) {
    if (!str) return '';
    
    const strValue = String(str);
    
    const encoder = new TextEncoder();
    const bytes = encoder.encode(strValue);
    
    if (bytes.length <= maxLength) {
        return strValue;
    }

    let truncatedLength = Math.floor(maxLength * 0.8);
    let truncated = strValue.substring(0, truncatedLength) + '...';

    while (encoder.encode(truncated).length > maxLength) {
        truncatedLength -= 5;
        truncated = strValue.substring(0, truncatedLength) + '...';
    }
    
    return truncated;
}

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

        const forgingScript = await ForgeScript.withOneSignature(educatorAddress);
        const policyId = forgingScript;

        const tx = new Transaction({ 
            initiator: new CustomInitiator(educatorAddress, collateral, utxos)
        });

        const processedCertificates = [];
        
        for (const request of certificateRequests) {
            const { 
                courseData, 
                userAddress, 
                ipfsHash 
            } = request;

            const index = processedCertificates.length;

            const shortCourseId = courseData.courseId.toString().substring(0, 2);
            const studentId = courseData.studentId ? courseData.studentId.toString().substring(0, 2) : 'XX';
            const timestamp = Date.now().toString().substring(8, 13); 
            const randomCode = Math.floor(1000 + Math.random() * 9000); 
            const assetName = `C${shortCourseId}${studentId}${timestamp}${randomCode}`;
            const assetNameHex = stringToHex(assetName);
            const shortUserAddress = userAddress.slice(0, 10) + '...' + userAddress.slice(-10);
            const shortCreatorAddress = educatorAddress.slice(0, 10) + '...' + educatorAddress.slice(-10);
            const truncatedTitle = ensureMetadataLength(courseData.courseTitle, 40);
            const truncatedStudentName = ensureMetadataLength(courseData.studentName, 30);
            const truncatedEducator = ensureMetadataLength(courseData.educator, 30);
            const certName = ensureMetadataLength(`${truncatedTitle} Certificate`, 64);
            const description = ensureMetadataLength(`Cert for ${truncatedStudentName} - ${truncatedTitle}`, 64);
            
            const metadata = {
                name: certName,
                image: `ipfs://${ipfsHash}`, 
                mediaType: "image/png",
                description: description,
                properties: {
                    courseId: courseData.courseId.toString(),
                    studentId: courseData.studentId ? courseData.studentId.toString() : "",
                    asset_name: assetName, 
                    unique_id: `${shortCourseId}${studentId}${timestamp}${randomCode}`
                },
                course_id: courseData.courseId.toString(),
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
            const asset = {
                assetName: assetNameHex,
                assetQuantity: "1",
                metadata: metadata,
                label: "721",
                recipient: userAddress,
            };

            tx.mintAsset(forgingScript, asset);
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

        tx.sendLovelace(
            educatorAddress,
            "0",
            {
                changeAddress: educatorAddress
            }
        );

        const unsignedTx = await tx.build();
        return {
            unsignedTx,
            policyId,
            processedCertificates
        };

    } catch (error) {
        throw error;
    }
}

export { createBatchMintTransaction };

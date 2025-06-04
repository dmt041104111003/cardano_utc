import { stringToHex, ForgeScript, Transaction } from '@meshsdk/core';
import dotenv from 'dotenv';
import CustomInitiator from './CustomInitiator.js';

dotenv.config();
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
        const timestamp = Math.floor(Date.now() / 1000).toString(36);
        const shortCourseId = courseData._id.toString().substring(0, 4);
        const assetName = `CERT_${shortCourseId}_${timestamp}`;
        const assetNameHex = stringToHex(assetName);
        const educatorAddress = courseData.creatorAddress;
        if (!educatorAddress) {
            throw new Error('Educator address is required');
        }
        const forgingScript = await ForgeScript.withOneSignature(educatorAddress);
        const policyId = forgingScript;
        const shortUserAddress = userAddress.slice(0, 10) + '...' + userAddress.slice(-10);
        const shortCreatorAddress = courseData.creatorAddress ? 
            courseData.creatorAddress.slice(0, 10) + '...' + courseData.creatorAddress.slice(-10) : '';
        const ipfsHash = courseData.ipfsHash;
        
        const metadata = {
            name: `${courseData.courseTitle} Certificate`,
            image: ipfsHash,
            mediaType: "image/png",
            description: "Course completion certificate",
            properties: {
                courseId: courseData._id.toString(),
            },
            course_id: courseData._id.toString(),
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
        if (!metadata["721"][policyId] || !metadata["721"][policyId][assetName]) {
            throw new Error('Invalid metadata structure');
        }
        const tx = new Transaction({ 
            initiator: new CustomInitiator(courseData.creatorAddress, collateral, utxos)
        });

        const asset = {
            assetName: assetNameHex,
            assetQuantity: "1",
            metadata: metadata,
            label: "721",
            recipient: userAddress,
        };
        tx.mintAsset(forgingScript, asset);

        tx.sendLovelace(
            courseData.creatorAddress,
            "0",
            {
                changeAddress: courseData.creatorAddress 
            }
        );

        const unsignedTx = await tx.build();
        return {
            unsignedTx,
            policyId
        };

    } catch (error) {
        throw error;
    }
}

export { createCertificateNFT };

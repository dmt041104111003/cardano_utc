import Certificate from "../models/Certificate.js";
import Profile from "../models/Profile.js";

import { generateCertificateBuffer } from '../utils/ImageUtils.js';
import { uploadToPinata } from '../utils/PinataUtils.js';
import { createCertificateNFT } from '../utils/CertificateNFTUtils.js';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';

const PINATA_PREFIX_WEBSITE = "ipfs://"; 
const blockfrost = new BlockFrostAPI({
    projectId: process.env.BLOCKFROST_API_KEY,
    network: 'preprod',
});

export const getDetailCertificate = async (req, res) => {
    try {
        const { userId, courseId } = req.params;
        // Sắp xếp theo createdAt giảm dần để lấy chứng chỉ mới nhất
        const certificate = await Certificate.findOne({ userId, courseId })
            .sort({ createdAt: -1 }) // Lấy chứng chỉ mới nhất
            .populate("userId", "name email")
            .populate("courseId", "courseTitle")
            .populate("issueBy", "name");

        if (!certificate) {
            return res.status(404).json({ success: false, message: "Certificate not found" });
        }

        res.json({ success: true, certificate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createNewCertificate = async (req, res) => {
    try {
        const { userId, courseId, mintUserId, transactionHash, ipfsHash, policyId } = req.body;

        if (!ipfsHash) {
            return res.status(400).json({ success: false, message: "Thiếu ipfsHash" });
        }

        const issueAt = new Intl.DateTimeFormat("vi-VN").format(new Date());
        const certificate = new Certificate({
            userId,
            courseId,
            certificateUrl: `${PINATA_PREFIX_WEBSITE}${ipfsHash}`,
            transactionHash,
            policyId,
            issueBy: mintUserId,
            issueAt: issueAt, 
        });
        await certificate.save();
        res.json({ success: true, message: "Certificate has been created and saved successfully" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createUnsignedMintTx = async (req, res) => {
    try {
        console.log('Received request body:', JSON.stringify(req.body, null, 2));
        const { courseId, utxos, userAddress, collateral, courseData } = req.body;
        const studentName = courseData?.studentName || "Student";
        const userId = courseData?.userId || "";

        if (!courseId || !utxos || !userAddress || !collateral || !courseData) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters'
            });
        }

        // Fetch user profile data if available
        let profileData = null;
        if (userId) {
            try {
                profileData = await Profile.findOne({ userId });
                console.log('Found profile data:', profileData ? 'Yes' : 'No');
            } catch (profileError) {
                console.error('Error fetching profile data:', profileError);
                // Continue without profile data
            }
        }

        // Format course data for certificate
        const courseInfo = {
            _id: courseData.courseId,
            courseTitle: courseData.courseTitle,
            courseDescription: courseData.courseDescription,
            educator: {
                name: courseData.educator
            },
            creatorAddress: courseData.creatorAddress,
            studentName: studentName,
            // Thêm các thông tin từ Blockfrost API
            txHash: courseData.txHash || '',
            cccd: courseData.cccd || (profileData?.cccd || ''),
            blockfrostData: courseData.blockfrostData || '',
            additionalMetadata: {
                ...courseData.additionalMetadata || {},
                profile: profileData ? {
                    profileId: profileData.profileId,
                    cccd: profileData.cccd,
                    imageUrl: profileData.imageUrl,
                    imageHash: profileData.imageHash,
                    walletAddress: profileData.walletAddress,
                    txHash: profileData.txHash,
                    assetName: profileData.assetName
                } : null
            }
        };
        console.log('Course info with profile data:', courseInfo);

        // Generate certificate buffer
        console.log('Generating certificate buffer...');
        const certificateBuffer = await generateCertificateBuffer(
            studentName,
            courseInfo.educator.name, 
            courseInfo.courseTitle,
            new Date().toLocaleDateString()
        );

        // Upload buffer to IPFS
        console.log('Uploading certificate to IPFS...');
        const ipfsResult = await uploadToPinata(certificateBuffer);
        console.log('Certificate image uploaded:', ipfsResult);

        // Add IPFS hash to course data
        courseInfo.ipfsHash = ipfsResult.IpfsHash;

        // Create unsigned mint transaction
        console.log('Creating unsigned mint transaction...');
        const { unsignedTx, policyId } = await createCertificateNFT({
            utxos,
            userAddress,
            collateral,
            courseData: courseInfo
        });

        console.log('Got policy ID:', policyId);

        // Add profile info to response
        const hasProfileData = courseInfo.additionalMetadata?.profile !== null;
        
        res.json({
            success: true,
            unsignedTx,
            ipfsHash: ipfsResult.IpfsHash,
            policyId,
            hasProfileData
        });

    } catch (error) {
        console.error("Lỗi tạo certificate NFT:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateCertificate = async (req, res) => {
    try {
        const { certificateId, policyId } = req.body;

        if (!certificateId || !policyId) {
            return res.status(400).json({
                success: false,
                message: 'Certificate ID and Policy ID are required'
            });
        }

        const certificate = await Certificate.findByIdAndUpdate(
            certificateId,
            { policyId },
            { new: true }
        );

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        res.json({
            success: true,
            certificate
        });

    } catch (error) {
        console.error('Error updating certificate:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getCertificateByTx = async (req, res) => {
    try {
        const { txHash } = req.params;

        // Get certificate with this transaction hash
        const certificate = await Certificate.findOne({ transactionHash: txHash })
            .populate({
                path: "courseId",
                select: "courseTitle courseDescription educatorId",
                populate: {
                    path: "educatorId",
                    select: "name email walletAddress"
                }
            })
            .populate({
                path: "userId",
                select: "name email walletAddress"
            });

        if (!certificate) {
            return res.status(404).json({ 
                success: false, 
                message: "No certificate found with this transaction hash" 
            });
        }

        // Get transaction details from Blockfrost
        const txData = await blockfrost.getTransactionDetails(txHash);

        res.json({
            success: true,
            data: {
                course: {
                    title: certificate.courseId.courseTitle,
                    description: certificate.courseId.courseDescription
                },
                educator: {
                    name: certificate.courseId.educatorId.name,
                    email: certificate.courseId.educatorId.email,
                    walletAddress: certificate.courseId.educatorId.walletAddress
                },
                student: {
                    name: certificate.userId.name,
                    email: certificate.userId.email,
                    walletAddress: certificate.userId.walletAddress
                },
                issueDate: certificate.issueAt,
                certificateUrl: certificate.certificateUrl,
                transactionHash: certificate.transactionHash,
                blockHeight: txData.block_height,
                blockTime: txData.block_time
            }
        });

    } catch (error) {
        console.error('Error getting certificate by tx:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

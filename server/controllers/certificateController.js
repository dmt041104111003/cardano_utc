import Certificate from "../models/Certificate.js";

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
        const certificate = await Certificate.findOne({ userId, courseId })
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
        const { userId, courseId, mintUserId, transactionHash, ipfsHash } = req.body;

        if (!ipfsHash) {
            return res.status(400).json({ success: false, message: "Thiếu ipfsHash" });
        }

        const issueAt = new Intl.DateTimeFormat("vi-VN").format(new Date());
        const certificate = new Certificate({
            userId,
            courseId,
            certificateUrl: `${PINATA_PREFIX_WEBSITE}${ipfsHash}`,
            transactionHash,
            issueBy: mintUserId,
            issueAt: issueAt, 
        });
        await certificate.save();
        res.json({ success: true, message: "Chứng chỉ đã được tạo và lưu thành công" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createUnsignedMintTx = async (req, res) => {
    try {
        console.log('Received request body:', JSON.stringify(req.body, null, 2));
        const { courseId, utxos, userAddress, collateral, courseData } = req.body;
        const studentName = courseData?.studentName || "Student";

        if (!courseId || !utxos || !userAddress || !collateral || !courseData) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters'
            });
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
            studentName: studentName
        };
        console.log('Course info:', courseInfo);

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
        const unsignedTx = await createCertificateNFT({
            utxos,
            userAddress,
            collateral,
            courseData: courseInfo
        });

        res.json({
            success: true,
            unsignedTx,
            ipfsHash: ipfsResult.IpfsHash
        });

    } catch (error) {
        console.error("Lỗi tạo certificate NFT:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

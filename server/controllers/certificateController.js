import Certificate from "../models/Certificate.js";
import { generateCertificateImage, uploadToPinata, deleteFileAfterUpload } from '../utils/CertificateUtils.js';


export const getDetailCertificate = async (req, res) => {
    try {
        const { userId, courseId } = req.params;
        const certificate = await Certificate.findOne({ userId, courseId })
            .populate('userId', 'name email') 
            .populate('courseId', 'courseTitle') 
            .populate('issueBy', 'name')
            .populate('createAt');
        if (!certificate) {
            return res.status(404).json({ success: false, message: "Certificate not found" });
        }

        res.json({ success: true, certificate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const issueNewCertificate = async (req, res) => {
    const { username, dateIssued, issueBy, courseName } = req.body;

    try {
        const imagePath = await generateCertificateImage(username, dateIssued, issueBy, courseName);

        const ipfsHash = await uploadToPinata(imagePath);

        await deleteFileAfterUpload(imagePath);

        res.json({ success: true, ipfsHash });
    } catch (error) {
        console.error("Lỗi khi tạo & upload chứng chỉ:", error);
        res.status(500).json({ success: false, message: error.message });
    }



    // mint nft

    //luu monggodb

    //tra res
    
    // try {
    //     const { userId, courseId, issueBy} = req.body;

    //     const certificate = await Certificate.findOne({ userId, courseId })
    //         .populate('userId', 'name email') 
    //         .populate('courseId', 'courseTitle') 
    //         .populate('issueBy', 'name')
    //         .populate('createAt');
    //     if (!certificate) {
    //         return res.status(404).json({ success: false, message: "Certificate not found" });
    //     }

    //     res.json({ success: true, certificate });
    // } catch (error) {
    //     res.status(500).json({ success: false, message: error.message });
    // }
};


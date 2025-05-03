import Address from "../models/Address.js";
import Course from "../models/Course.js";
import Notification from "../models/Notification.js";

// Kiểm tra xem học viên đã gửi yêu cầu chứng chỉ cho khóa học cụ thể chưa
export const checkAddress = async (req, res) => {
    try {
        const { courseId, userId } = req.query;

        if (!courseId || !userId) {
            return res.json({
                success: false,
                message: 'Missing courseId or userId'
            });
        }

        const address = await Address.findOne({
            courseId: courseId,
            userId: userId
        });

        res.json({
            success: true,
            exists: !!address,
            address: address
        });
    } catch (error) {
        console.error('Error checking address:', error);
        res.json({ success: false, message: error.message });
    }
};

// Tìm địa chỉ theo courseId và educatorId
export const findAddress = async (req, res) => {
    try {
        const { courseId, educatorId } = req.query;

        if (!courseId || !educatorId) {
            return res.json({
                success: false,
                message: 'Missing courseId or educatorId'
            });
        }

        const address = await Address.findOne({
            courseId: courseId,
            educatorId: educatorId
        });

        console.log('Debug - Đã tìm thấy address:', address);

        res.json({
            success: true,
            address: address
        });
    } catch (error) {
        console.error('Error finding address:', error);
        res.json({ success: false, message: error.message });
    }
};

export const saveAddress = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { walletAddress, userName, courseId } = req.body;

        if (!walletAddress || !userName || !courseId) {
            return res.json({ 
                success: false, 
                message: 'Wallet address, user name and course ID are required' 
            });
        }

        // Get course to get educator ID and wallet
        const course = await Course.findById(courseId);
        if (!course) {
            return res.json({ success: false, message: 'Course not found' });
        }

        if (!course.educator || !course.creatorAddress) {
            return res.json({ 
                success: false, 
                message: 'Course educator information is incomplete' 
            });
        }

        // Save address with educator info
        const address = await Address.create({
            userId,
            userName,
            walletAddress,
            courseId,
            educatorId: course.educator,
            educatorWallet: course.creatorAddress
        });

        // Create notification for educator
        await Notification.create({
            studentId: userId,
            studentModel: userId.startsWith('user_') ? 'ClerkUser' : 'User',
            courseId: course._id,
            educatorId: course.educator,
            educatorModel: course.educator.startsWith('user_') ? 'ClerkUser' : 'User',
            type: 'certificate_request',
            message: `${userName} has submitted their wallet address for certificate`,
            data: {
                walletAddress,
                courseTitle: course.courseTitle
            }
        });

        res.json({ 
            success: true, 
            message: 'Address saved and certificate request sent to educator',
            address 
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

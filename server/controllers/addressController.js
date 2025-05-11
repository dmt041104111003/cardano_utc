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
        console.log('Debug - saveAddress request body:', req.body);
        console.log('Debug - saveAddress auth:', req.auth);
        
        // Lấy userId từ req.auth (middleware Clerk)
        const userId = req.auth?.userId;
        
        if (!userId) {
            console.error('Debug - No userId found in request auth');
            return res.json({ 
                success: false, 
                message: 'Authentication failed. User ID not found.' 
            });
        }
        
        const { walletAddress, userName, courseId, txHash } = req.body;
        console.log('Debug - Extracted data:', { walletAddress, userName, courseId, txHash });

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
        
        console.log('Debug - Found course:', { 
            id: course._id, 
            title: course.courseTitle,
            educator: course.educator,
            creatorAddress: course.creatorAddress
        });

        // Save address with educator info and txHash
        const addressData = {
            userId,
            userName,
            walletAddress,
            courseId,
            educatorId: course.educator,
            educatorWallet: course.creatorAddress,
            txHash: txHash || '' // Lưu txHash vào cơ sở dữ liệu
        };
        
        console.log('Debug - Creating address with data:', addressData);
        
        const address = await Address.create(addressData);
        console.log('Debug - Created address:', address);

        // Create notification for educator
        const notificationData = {
            studentId: userId,
            studentModel: userId.startsWith('user_') ? 'ClerkUser' : 'User',
            courseId: course._id,
            educatorId: course.educator,
            educatorModel: course.educator.startsWith('user_') ? 'ClerkUser' : 'User',
            type: 'certificate_request',
            message: `${userName} has submitted their wallet address for certificate`,
            data: {
                walletAddress,
                courseTitle: course.courseTitle,
                txHash: txHash || '' // Thêm txHash vào thông báo
            }
        };
        
        console.log('Debug - Creating notification with data:', notificationData);
        
        const notification = await Notification.create(notificationData);
        console.log('Debug - Created notification:', notification);

        res.json({ 
            success: true, 
            message: 'Address saved and certificate request sent to educator',
            address,
            notification
        });
    } catch (error) {
        console.error('Debug - Error in saveAddress:', error);
        res.json({ success: false, message: error.message });
    }
};

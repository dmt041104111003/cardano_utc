import { Purchase } from "../models/Purchase.js";
import Course from "../models/Course.js";

// Kiểm tra địa chỉ ví đã dùng để mua khóa học
export const verifyPurchaseAddress = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { courseId } = req.params;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: 'Course ID is required'
            });
        }

        // Tìm thông tin mua khóa học
        const purchase = await Purchase.findOne({
            userId,
            courseId,
            status: 'completed'
        });

        if (!purchase) {
            return res.json({
                success: true,
                hasPurchaseAddress: false,
                message: 'No purchase record found for this course'
            });
        }

        // Kiểm tra xem có lưu địa chỉ ví người gửi không
        if (!purchase.senderAddress) {
            // Nếu không có địa chỉ ví người gửi, cho phép sử dụng bất kỳ ví nào
            return res.json({
                success: true,
                hasPurchaseAddress: true,
                requireAddressCheck: false,
                purchaseInfo: {
                    paymentMethod: purchase.paymentMethod,
                    amount: purchase.amount,
                    createdAt: purchase.createdAt
                }
            });
        }

        // Trả về kết quả có địa chỉ ví người gửi
        return res.json({
            success: true,
            hasPurchaseAddress: true,
            requireAddressCheck: true,
            purchaseAddress: purchase.senderAddress,
            purchaseInfo: {
                paymentMethod: purchase.paymentMethod,
                amount: purchase.amount,
                createdAt: purchase.createdAt
            }
        });
    } catch (error) {
        console.error('Error verifying purchase:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

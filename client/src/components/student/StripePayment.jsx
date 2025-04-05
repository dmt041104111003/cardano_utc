/* eslint-disable react/prop-types */
import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function StripePayment({ courseData }) {
    const { backendUrl, userData } = useContext(AppContext);

    const handleStripePayment = async () => {
        if (!userData) {
            toast.error("Vui lòng đăng nhập hoặc đăng ký tài khoản trước khi thanh toán");
            return;
        }

        try {
            const { data } = await axios.post(
                `${backendUrl}/api/user/purchase-course`,
                { courseId: courseData._id },
                { withCredentials: true }
            );

            if (data.success) {
                // Nếu có URL thanh toán, chuyển hướng
                if (data.session_url) {
                    window.location.href = data.session_url;
                } else if (data.redirect_url) { 
                    // Nếu là khóa học miễn phí
                    window.location.href = data.redirect_url;
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };
    
    return (
        <div className="p-4 border rounded-lg mt-4 bg-gray-100">
            <h3 className="text-lg font-semibold mb-2">Thanh toán qua Stripe</h3>
            <p className="text-gray-600">Sử dụng thẻ Visa/Mastercard để thanh toán.</p>
            
            <div className="flex justify-end mt-3">
                <button 
                    onClick={handleStripePayment}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {courseData.coursePrice === 0 ? 'Đăng ký miễn phí' : 'Tiếp tục với Stripe'}
                </button>
            </div>
        </div>
    );
}
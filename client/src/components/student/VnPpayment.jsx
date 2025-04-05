/* eslint-disable react/prop-types */
import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';

export default function VnpayPayment({ courseData }) {
    const { userData } = useContext(AppContext);

    const handlePayment = () => {
        if (!userData) {
            toast.error("Vui lòng đăng nhập hoặc đăng ký tài khoản trước khi thanh toán");
            return;
        }
        // Xử lý thanh toán VNPAY
        toast.info("Tính năng đang phát triển");
    };

    return (
      <div className="p-4 border rounded-lg mt-4 bg-gray-100">
        <h3 className="text-lg font-semibold mb-2">Thanh toán qua VNPAY</h3>
        <p className="text-gray-600">Dùng QR Code hoặc ngân hàng nội địa để thanh toán.</p>
        
        <div className="flex justify-end mt-3">
            <button 
                onClick={handlePayment}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
                Tiếp tục với VNPAY
            </button>
        </div>
      </div>
    );
}
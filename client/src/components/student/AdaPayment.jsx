/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from "react"; 
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { convertUsdToAda } from "../../../utils/convertUsdToAda";

export default function AdaPayment({ courseData }) {
    const { currentWallet, userData, getToken, backendUrl, fetchUserData, fetchUserEnrolledCourses } = useContext(AppContext);
    const [balance, setBalance] = useState(0);
    const [course] = useState(courseData);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        async function fetchBalance() {
            if (!userData) {
                setBalance(0);
                return;
            }

            if (currentWallet) {
                try {
                    const lovelace = await currentWallet.getLovelace();
                    const ada = parseFloat(lovelace) / 1000000;
                    setBalance(Number(ada) || 0);
                } catch (error) {
                    console.error("Error fetching balance:", error);
                    setBalance(0);
                }
            }
        }
        fetchBalance();
    }, [currentWallet, userData]);
      
    const coursePrice = ( convertUsdToAda(
        courseData.coursePrice - (courseData.discount * courseData.coursePrice) / 100
    )).toFixed(2);

    const handlePayment = async () => {
        if (!userData) {
            toast.error("Please log in or sign up before making a payment");
            return;
        }

        if (!currentWallet) {
            toast.error("Please connect your Cardano wallet");
            return;
        }

        try {
            const utxos = await currentWallet.getUtxos();
            const changeAddress = await currentWallet.getChangeAddress();
            const getAddress = courseData.creatorAddress;

            if (!getAddress) {
                throw new Error('Educator wallet address not found');
            }
           
            const response = await axios.post(`${backendUrl}/api/course/payment`, {
                utxos: utxos,
                changeAddress: changeAddress,
                getAddress: getAddress,
                courseId: course._id,
                userId: userData._id,
                value: coursePrice * 1000000       
            });

            if (response.data.success) {
                const unsignedTx = response.data.unsignedTx;
                const signedTx = await currentWallet.signTx(unsignedTx);
                const txHash = await currentWallet.submitTx(signedTx);

                toast.success(`Payment successful! TX Hash: ${txHash}`);
                return true;
            } else {
                toast.error("Thanh toán thất bại!");
                return false;
            }
        } catch (error) {
            console.error("Lỗi khi thanh toán:", error);
            toast.error("Lỗi khi thanh toán!");
            return false;
        }
    }

    const enrollCourse = async () => {
        try {
            if (!userData) {
                return toast.error('Login to Enroll');
            }

            const token = await getToken();
            const { data } = await axios.post(`${backendUrl}/api/user/enroll-course`, {
                courseId: courseData._id,
                paymentMethod: "ADA Payment",
                currency: "ADA"
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success("Successfully enrolled in the course");
                if (data.session_url) {
                    window.location.replace(data.session_url);
                }
                return navigate("/");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };
    
    const handleEnrollCourse = async () => {  
        setIsLoading(true);
        try {
            const token = await getToken();
            const { data } = await axios.get(`${backendUrl}/api/course/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const course = data.courses.find(c => c._id === courseData._id);

            if (!course) {
                toast.error('Không tìm thấy thông tin khóa học');
                setIsLoading(false);
                return;
            }

            if (userData._id === course.educator._id) {
                toast.error('Bạn không thể đăng ký khóa học này vì bạn là giảng viên của khóa học này');
                setIsLoading(false);
                return;
            }

            const userWallet = await currentWallet.getChangeAddress();
            if (userWallet && course.creatorAddress && 
                userWallet.toLowerCase() === course.creatorAddress.toLowerCase()) {
                toast.error('Bạn không thể đăng ký khóa học này vì đây là địa chỉ ví của giảng viên');
                setIsLoading(false);
                return;
            }
            
            const paymentSuccess = await handlePayment();
            if (paymentSuccess) {
                await enrollCourse();
                await fetchUserData();
                await fetchUserEnrolledCourses();
            } else {
                toast.error("Thanh toán khóa học thất bại");
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.response?.data?.message || error.message);
        }
        setIsLoading(false);
    };

    return (
        <div className="p-4 border rounded-lg mt-4 bg-purple-50">
            <div className="flex items-center mb-3">
             
                <h3 className="text-lg font-semibold">Thanh toán bằng ADA</h3>
            </div>

            {!userData ? (
                <>
                    <p className="text-gray-600 mb-3">Vui lòng đăng nhập hoặc đăng ký tài khoản để xem thông tin thanh toán</p>
                    <button 
                        onClick={() => toast.error("Vui lòng đăng nhập hoặc đăng ký tài khoản trước khi thanh toán")}
                        className="w-full py-2 px-4 rounded-md bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
                    >
                        Tiếp tục với ADA
                    </button>
                </>
            ) : (
                <>
                    <div className="text-gray-700 mb-3">
                        <p>Giá khóa học: <span className="font-semibold">{coursePrice} ADA</span></p>
                        <p>Số dư ví: <span className="font-semibold">{balance} ADA</span></p>
                    </div>

                    <button
                        onClick={handleEnrollCourse}
                        className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                            currentWallet && balance >= coursePrice 
                                ? "bg-purple-600 text-white hover:bg-purple-700"
                                : "bg-gray-400 text-gray-700 cursor-not-allowed"
                        }`}
                        disabled={!currentWallet || balance < coursePrice || isLoading}
                    >
                        {isLoading ? "Đang xử lý..." : "Thanh toán với ADA"}
                    </button>

                    <p className="text-xs text-gray-500 mt-2">
                        Bằng cách thanh toán, bạn đồng ý với Điều khoản dịch vụ của chúng tôi
                    </p>
                </>
            )}
        </div>
    );
}

/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from "react"; 
import { AppContext } from "../../context/AppContext";
import { NavLink, useNavigate } from "react-router-dom";
import Loading from "./Loading";
import axios from "axios";
import { toast } from "react-toastify";

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
                    const as = parseFloat(lovelace) / 1000000;
                    setBalance(Number(as) || 0);
                } catch (error) {
                    console.error("Lỗi khi lấy số dư:", error);
                    setBalance(0);
                }
            }
        }
        fetchBalance();
    }, [currentWallet, userData]);
      
    const coursePrice = (
        courseData.coursePrice - (courseData.discount * courseData.coursePrice) / 100
    ).toFixed(2);
    
    const handlePayment = async () => {
        if (!userData) {
            toast.error("Vui lòng đăng nhập hoặc đăng ký tài khoản trước khi thanh toán");
            return;
        }

        if (!currentWallet) {
            toast.error("Vui lòng kết nối ví Cardano");
            return;
        }
        console.log("Thanh toán",userData._id,courseData._id,coursePrice);
         
        try {
            const utxos = await currentWallet.getUtxos();
            const changeAddress = await currentWallet.getChangeAddress();
            
            // Lấy địa chỉ của educator từ course data
            const getAddress = courseData.creatorAddress;
            if (!getAddress) {
                throw new Error('Không tìm thấy địa chỉ ví của giảng viên');
            }
           
            const response = await axios.post(`${backendUrl}/api/course/payment`, {
                    utxos: utxos,
                    changeAddress: changeAddress,
                    getAddress: getAddress,
                    courseId: course._id,
                    userId: userData._id,
                    value: coursePrice  * 1000000       
             });

            if(response.data.success){
                console.log(response.data.unsignedTx);
            }
    
            if (response.data.success) {
            const unsignedTx = response.data.unsignedTx;
            const signedTx = await currentWallet.signTx(unsignedTx);
            const txHash = await currentWallet.submitTx(signedTx);

            toast.success(`Thanh toan thành công! TX Hash: ${txHash}`);
                         return true;
            } else {
            toast.error("Thanh toan  thất bại!");
            return false;
            }
        } catch (error) {
            console.error("Lỗi khi mint NFT:", error);
            toast.error("Lỗi khi thanh toán!");
            return false;
        }
    }

    const enrollCourse = async () => {
        try {
            console.log("User Data:", userData);
    
            if (!userData) {
                return toast.error('Login to Enroll');
            }
    
            const token = await getToken();
            const { data } = await axios.post(`${backendUrl}/api/user/enroll-course`, {
                courseId: courseData._id,
                paymentMethod:"ADA Payment",
                currency :"ADA"
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            if (data.success) {
                toast.success("Tham gia khóa học thành công");
                
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
            // Debug: Kiểm tra courseData
            console.log('Course Data:', courseData);
            console.log('User Data:', userData);

            // Lấy thông tin khóa học từ MongoDB
            const token = await getToken();
            const { data } = await axios.get(`${backendUrl}/api/course/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('All Courses:', data);

            // Tìm khóa học cụ thể
            const course = data.courses.find(c => c._id === courseData._id);
            console.log('Found Course:', course);

            if (!course) {
                toast.error('Không tìm thấy thông tin khóa học');
                setIsLoading(false);
                return;
            }

            // Kiểm tra ID user trước
            console.log('Debug - IDs:', {
                userId: userData._id,
                educatorId: course.educator._id
            });

            if (userData._id === course.educator._id) {
                toast.error('Bạn không thể đăng ký khóa học này vì bạn là giảng viên của khóa học này');
                setIsLoading(false);
                return;
            }

            // Nếu ID khác nhau thì mới kiểm tra địa chỉ ví
            const userWallet = await currentWallet.getChangeAddress();
            console.log('Debug - Wallets:', {
                userWallet,
                creatorAddress: course.creatorAddress
            });

            if (userWallet && course.creatorAddress && 
                userWallet.toLowerCase() === course.creatorAddress.toLowerCase()) {
                toast.error('Bạn không thể đăng ký khóa học này vì đây là địa chỉ ví của giảng viên');
                setIsLoading(false);
                return;
            }
            
            const paymentSuccess = await handlePayment();  
            if (paymentSuccess) {
                await enrollCourse();  
                // Reload user data and enrolled courses
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
    

   
    if (!userData) {
        return (
            <div className="p-4 border rounded-lg mt-4 bg-gray-100">
                <h3 className="text-lg font-semibold mb-2">Thanh toán bằng ADA</h3>
                <p className="text-gray-600 mb-3">Vui lòng đăng nhập hoặc đăng ký tài khoản để xem thông tin thanh toán</p>
                <div className="flex justify-end">
                    <button 
                        onClick={() => toast.error("Vui lòng đăng nhập hoặc đăng ký tài khoản trước khi thanh toán")}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Tiếp tục với ADA
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 border rounded-lg mt-4 bg-gray-100">
            <h3 className="text-lg font-semibold mb-2">Thanh toán bằng ADA</h3>
            <div className="mb-4">
                <p className="text-gray-600">Giá khóa học: {coursePrice} ADA</p>
                <p className="text-gray-600">Số dư ví: {balance} ADA</p>
            </div>
            
            <div className="flex justify-end">
                <button 
                    onClick={handleEnrollCourse}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        currentWallet && balance >= coursePrice 
                            ? "bg-purple-600 text-white hover:bg-purple-700"
                            : "bg-gray-400 text-gray-700 cursor-not-allowed"

                    }`}
                    disabled={!currentWallet || balance < coursePrice || isLoading}
                >
                    Tiếp tục với ADA
                </button>
            </div>
        </div>
    );
}
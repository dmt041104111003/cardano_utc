/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from "react"; 
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
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
      
    // Calculate course price with discount if applicable
const calculatePrice = () => {
    if (!courseData) return "0.00";
    
    const currentDate = new Date();
    const discountEnd = courseData.discountEndTime ? new Date(courseData.discountEndTime) : null;
    const isDiscountActive = discountEnd && !isNaN(discountEnd.getTime()) && currentDate <= discountEnd;
    
    if (isDiscountActive && courseData.discount > 0) {
        return (courseData.coursePrice - (courseData.discount * courseData.coursePrice) / 100).toFixed(2);
    }
    
    return courseData.coursePrice.toFixed(2);
};

const coursePrice = calculatePrice();

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
                toast.error("Payment failed!");
                return false;
            }
        } catch (error) {
            console.error("Payment error:", error);
            toast.error(error.response?.data?.message || error.message || "Payment failed. Please try again.");
            return false;
        }
    }

    const enrollCourse = async () => {
        try {
            if (!userData) {
                return toast.error('Please log in to enroll');
            }

            // Lấy địa chỉ ví người mua
            const userAddress = await currentWallet.getChangeAddress();
            if (!userAddress) {
                return toast.error('Could not get wallet address');
            }

            const token = await getToken();
            const { data } = await axios.post(`${backendUrl}/api/user/enroll-course`, {
                courseId: courseData._id,
                paymentMethod: "ADA Payment",
                currency: "ADA",
                receiverAddress: courseData.creatorAddress,
                senderAddress: userAddress // Thêm địa chỉ ví người mua
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
            console.error('Error enrolling course:', error);
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
                toast.error('Course information not found');
                setIsLoading(false);
                return;
            }

            if (userData._id === course.educator._id) {
                toast.error('You cannot enroll in this course because you are the instructor');
                setIsLoading(false);
                return;
            }

            const userWallet = await currentWallet.getChangeAddress();
            if (userWallet && course.creatorAddress && 
                userWallet.toLowerCase() === course.creatorAddress.toLowerCase()) {
                toast.error('You cannot enroll in this course because this is the instructor\'s wallet address');
                setIsLoading(false);
                return;
            }
            
            const paymentSuccess = await handlePayment();
            if (paymentSuccess) {
                await enrollCourse();
                await fetchUserData();
                await fetchUserEnrolledCourses();
            } else {
                toast.error("Payment failed!");
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.response?.data?.message || error.message);
        }
        setIsLoading(false);
    };

    return (
        <div className="p-5 border rounded-xl mt-4 bg-gradient-to-br from-purple-50 to-white shadow-sm">
            <div className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600 mr-2" viewBox="0 0 256 256">
                    <circle cx="128" cy="128" r="120" fill="none" stroke="currentColor" strokeWidth="8"/>
                    <circle cx="128" cy="128" r="40" fill="currentColor"/>
                    <circle cx="128" cy="48" r="12" fill="currentColor"/>
                    <circle cx="128" cy="208" r="12" fill="currentColor"/>
                    <circle cx="48" cy="128" r="12" fill="currentColor"/>
                    <circle cx="208" cy="128" r="12" fill="currentColor"/>
                    <circle cx="68" cy="68" r="12" fill="currentColor"/>
                    <circle cx="188" cy="188" r="12" fill="currentColor"/>
                    <circle cx="68" cy="188" r="12" fill="currentColor"/>
                    <circle cx="188" cy="68" r="12" fill="currentColor"/>
                    <circle cx="158" cy="48" r="8" fill="currentColor"/>
                    <circle cx="98" cy="48" r="8" fill="currentColor"/>
                    <circle cx="48" cy="98" r="8" fill="currentColor"/>
                    <circle cx="48" cy="158" r="8" fill="currentColor"/>
                    <circle cx="98" cy="208" r="8" fill="currentColor"/>
                    <circle cx="158" cy="208" r="8" fill="currentColor"/>
                    <circle cx="208" cy="158" r="8" fill="currentColor"/>
                    <circle cx="208" cy="98" r="8" fill="currentColor"/>
                </svg>
                <h3 className="text-xl font-bold text-blue-800">Cardano Wallet</h3>
            </div>

            {!userData ? (
                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                    <p className="text-gray-700 mb-4">Please log in or sign up to view payment information</p>
                    <button 
                        onClick={() => toast.error("Please log in or sign up before making a payment")}
                        className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] shadow-md"
                    >
                        Continue with Cardano Wallet
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
                            <span className="text-gray-700">Course price:</span>
                            <span className="font-bold text-purple-700">{coursePrice} ADA</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700">Wallet balance:</span>
                            <span className={`font-bold ${balance >= coursePrice ? 'text-green-600' : 'text-red-600'}`}>
                                {balance} ADA
                                {balance < coursePrice && (
                                    <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                                        Insufficient
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleEnrollCourse}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-all transform ${
                            currentWallet && balance >= coursePrice && !isLoading
                                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 hover:scale-[1.02] shadow-md"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        disabled={!currentWallet || balance < coursePrice || isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing Payment...
                            </span>
                        ) : "Pay with Cardano Wallet"}
                    </button>

                    <p className="text-xs text-gray-500 mt-2 text-center">
                        By making a payment, you agree to our <a href="#" className="text-purple-600 hover:underline">Terms of Service</a>.
                    </p>
                </div>
            )}
        </div>
    );
}

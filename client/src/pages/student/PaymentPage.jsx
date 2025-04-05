/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useContext, useEffect } from "react";
import CourseInformationCard from "../../components/student/CourseInfomationCard";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import StripePayment from "../../components/student/StripePayment";
import AdaPayment from "../../components/student/AdaPayment";
import VnpayPayment from "../../components/student/VnPpayment";



export default function PaymentPage() {
  const [selectedMethod, setSelectedMethod] = useState("ada");
  const idParams = useParams();
  const [courseData, setCourseData] = useState(null);
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [playerData, setPlayerData] = useState(null);

  const { calculateRating, calculateCourseDuration, backendUrl } = useContext(AppContext);

  const fetchCourseData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/course/${idParams.courseId}`);
      if (data.success) {
        setCourseData(data.courseData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [idParams.courseId]);

  const paymentMethods = courseData
    ? [
        { id: "ada", name: "ADA", component: <AdaPayment courseData={courseData} /> },
        { id: "stripe", name: "Stripe", component: <StripePayment courseData={courseData} /> },
        { id: "vnpay", name: "VNPAY", component: <VnpayPayment courseData={courseData} /> },
      ]
    : [];
    
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        
       
        <div className="w-full lg:w-1/2">
          {courseData && (
            
            <CourseInformationCard 
              courseData={courseData} 
              playerData={playerData} 
              isAlreadyEnrolled={isAlreadyEnrolled} 
              rating={calculateRating(courseData)} 
              duration={calculateCourseDuration(courseData)} 
              lecture={calculateCourseDuration(courseData)} 
              openPaymentPage={false}
              courseId={idParams.courseId}
            />
          )}
        </div>

      
        <div className="w-full lg:w-2/3  p-1 md:p-2 rounded-lg  ">
          <h2 className="text-xl md:text-2xl font-semibold text-center mb-4 md:mb-6">
            Chọn phương thức thanh toán
          </h2>


          <div className="flex justify-center gap-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all shadow-md 
                  ${selectedMethod === method.id 
                    ? "bg-green-600 text-white border-2 border-green-600 scale-105 shadow-lg"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 hover:shadow-lg"
                  }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                {method.name}
              </button>
            ))}
          </div>

  
          <div className="mt-4">
            {selectedMethod && paymentMethods.find((m) => m.id === selectedMethod)?.component}
          </div>

        </div>
      </div>
    </div>
  );
}

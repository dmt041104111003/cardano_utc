/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useContext, useEffect } from "react";
import CourseInformationCard from "../../components/student/CourseInfomationCard";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import StripePayment from "../../components/student/StripePayment";
import AdaPayment from "../../components/student/AdaPayment";
import PaypalPayment from "../../components/student/PaypalPayment";
import Footer from "../../components/student/Footer";
import CourseItem from "../../components/student/CourseCardForPayment";

export default function PaymentPage() {
  const [selectedMethod, setSelectedMethod] = useState("ada");
  const idParams = useParams();
  const [courseData, setCourseData] = useState(null);
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [playerData, setPlayerData] = useState(null);
  const [educatorCourses, setEducatorCourses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const navigate = useNavigate();

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

  useEffect(() => {
    if (courseData?.educator?._id) {
      axios.get(`${backendUrl}/api/course/by-educator/${courseData.educator._id}?excludeId=${courseData._id}`)
        .then(({ data }) => {
          if (data.success) setEducatorCourses(data.courses);
        });
    }
  }, [courseData]);

  const paymentMethods = courseData
    ? [
        ...(courseData.paymentMethods?.ada ? [{ id: "ada", name: "ADA", component: <AdaPayment courseData={courseData} /> }] : []),
        ...(courseData.paymentMethods?.stripe ? [{ id: "stripe", name: "Stripe", component: <StripePayment courseData={courseData} /> }] : []),
        ...(courseData.paymentMethods?.paypal ? [{ id: "paypal", name: "Paypal", component: <PaypalPayment courseData={courseData} /> }] : [])
      ]
    : [];
    
  // Pagination logic
  const totalPages = Math.ceil(educatorCourses.length / itemsPerPage);
  const paginatedCourses = educatorCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
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

            <div className="course-content mt-16">
              <h3 className='text-xl font-semibold text-black mb-2'>More Courses by  
                {courseData?.educator && (
                  <span
                    className="text-blue-600 cursor-pointer underline"
                    onClick={() => navigate(`/user/${courseData.educator._id}`)}
                  >
                    {courseData.educator.name}
                  </span>
                )}
              </h3>
              {educatorCourses.length === 0 && <p className="text-gray-500">No more courses from this educator.</p>}
              {paginatedCourses.map((course) => (
                <CourseItem key={course._id} course={course} />
              ))}
              {totalPages > 1 && (
                <div className="flex gap-2 justify-center mt-4">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md text-sm ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded-md text-sm ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md text-sm ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

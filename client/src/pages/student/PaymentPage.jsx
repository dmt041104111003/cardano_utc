import React, { useState, useContext, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext';
import CourseInformationCard from '../../components/student/CourseInfomationCard';
import StripePayment from '../../components/student/StripePayment';
import AdaPayment from '../../components/student/AdaPayment';
import PaypalPayment from '../../components/student/PaypalPayment';
import Footer from '../../components/student/Footer';
import CourseItem from '../../components/student/CourseCardForPayment';
import Loading from '../../components/student/Loading';

const PaymentPage = () => {
  const { calculateRating, calculateCourseDuration, backendUrl, getToken, userData } = useContext(AppContext);
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [educatorCourses, setEducatorCourses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isEducatorCoursesLoading, setIsEducatorCoursesLoading] = useState(false);
  const itemsPerPage = 4;

  const fetchCourseData = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/course/${courseId}`);
      if (data.success) {
        setCourseData(data.courseData);
        if (userData) {
          try {
            const token = await getToken();
            const { data: enrollmentData } = await axios.get(`${backendUrl}/api/user/check-enrollment/${courseId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setIsAlreadyEnrolled(enrollmentData.isEnrolled);
          } catch {}
        }
      } else {
        toast.error(data.message || 'Failed to fetch course data');
      }
    } catch {
      toast.error('Error fetching course data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEducatorCourses = async (educatorId, excludeId) => {
    setIsEducatorCoursesLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/course/by-educator/${educatorId}?excludeId=${excludeId}`);
      if (data.success) setEducatorCourses(data.courses);
    } catch {} finally {
      setIsEducatorCoursesLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  useEffect(() => {
    if (courseData?.educator?._id && courseData._id) fetchEducatorCourses(courseData.educator._id, courseData._id);
  }, [courseData?.educator?._id, courseData?._id]);

  const paymentMethods = useMemo(() => courseData ? [
    ...(courseData.paymentMethods?.ada ? [{ id: 'ada', name: 'Cardano Wallet', component: <AdaPayment courseData={courseData} /> }] : []),
    ...(courseData.paymentMethods?.stripe ? [{ id: 'stripe', name: 'Stripe', component: <StripePayment courseData={courseData} /> }] : []),
    ...(courseData.paymentMethods?.paypal ? [{ id: 'paypal', name: 'Paypal', component: <PaypalPayment courseData={courseData} /> }] : [])
  ] : [], [courseData]);

  useEffect(() => {
    if (paymentMethods.length && !selectedMethod) setSelectedMethod(paymentMethods[0].id);
  }, [paymentMethods]);

  const totalPages = Math.ceil(educatorCourses.length / itemsPerPage);
  const paginatedCourses = educatorCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = page => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">
            Complete Your Purchase
          </span>
        </h1>
        {isAlreadyEnrolled ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">You are already enrolled in this course!</h2>
            <button
              onClick={() => navigate(`/course/${courseId}`)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              aria-label="Go to course"
            >
              Go to Course
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/2">
              {courseData ? (
                <CourseInformationCard
                  courseData={courseData}
                  isAlreadyEnrolled={isAlreadyEnrolled}
                  rating={calculateRating(courseData)}
                  duration={calculateCourseDuration(courseData)}
                  lectureCount={courseData.courseContent.reduce((total, chapter) => total + chapter.chapterContent.length, 0)}
                  openPaymentPage={false}
                  courseId={courseId}
                />
              ) : (
                <div className="animate-pulse bg-gray-200 rounded-lg h-96"></div>
              )}
            </div>
            <div className="w-full lg:w-1/2">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Select Payment Method
                </h2>
                {paymentMethods.length ? (
                  <>
                    <div className="flex flex-wrap justify-center gap-4 mb-6">
                      {paymentMethods.map(m => (
                        <button
                          key={m.id}
                          className={`px-6 py-3 text-sm font-bold rounded-lg transition-all duration-300 flex items-center gap-2 ${
                            selectedMethod === m.id
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg scale-105'
                              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-blue-300 hover:shadow-md'
                          }`}
                          onClick={() => setSelectedMethod(m.id)}
                          aria-pressed={selectedMethod === m.id}
                        >
                          {m.id === 'ada' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 256 256" fill="none" stroke={selectedMethod === m.id ? 'white' : '#0033ad'} strokeWidth="8">
                              <circle cx="128" cy="128" r="120" fill="none" />
                              <circle cx="128" cy="128" r="40" fill={selectedMethod === m.id ? 'white' : '#0033ad'} stroke="none" />
                              <circle cx="128" cy="48" r="12" fill={selectedMethod === m.id ? 'white' : '#0033ad'} stroke="none" />
                              <circle cx="128" cy="208" r="12" fill={selectedMethod === m.id ? 'white' : '#0033ad'} stroke="none" />
                              <circle cx="48" cy="128" r="12" fill={selectedMethod === m.id ? 'white' : '#0033ad'} stroke="none" />
                              <circle cx="208" cy="128" r="12" fill={selectedMethod === m.id ? 'white' : '#0033ad'} stroke="none" />
                              <circle cx="68" cy="68" r="12" fill={selectedMethod === m.id ? 'white' : '#0033ad'} stroke="none" />
                              <circle cx="188" cy="188" r="12" fill={selectedMethod === m.id ? 'white' : '#0033ad'} stroke="none" />
                              <circle cx="68" cy="188" r="12" fill={selectedMethod === m.id ? 'white' : '#0033ad'} stroke="none" />
                              <circle cx="188" cy="68" r="12" fill={selectedMethod === m.id ? 'white' : '#0033ad'} stroke="none" />
                              <circle cx="158" cy="48" r="8" fill={selectedMethod === m.id ? 'white' : '#0033ad'} stroke="none" />
                              <circle cx="98" cy="48" r="8" fill={selectedMethod === m.id ? 'white' : '#0033ad'} stroke="none" />
                              <circle cx="48" cy="98" r="8" fill={selectedMethod === m.id ? 'white' : '#0033ad'} stroke="none" />
                              <circle cx="48" cy="158" r="8" fill={selectedMethod === m.id ? 'white' : '#0033ad'} stroke="none" />
                              <circle cx="98" cy="208" r="8" fill={selectedMethod === m.id ? 'white' : '#0033ad'} stroke="none" />
                              <circle cx="158" cy="208" r="8" fill={selectedMethod === m.id ? 'white' : '#0033ad'} stroke="none" />
                              <circle cx="208" cy="158" r="8" fill={selectedMethod === m.id ? 'white' : '#0033ad'} stroke="none" />
                              <circle cx="208" cy="98" r="8" fill={selectedMethod === m.id ? 'white' : '#0033ad'} stroke="none" />
                            </svg>
                          )}
                          {m.id === 'stripe' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill={selectedMethod === m.id ? 'white' : '#635BFF'}>
                              <path d="M13.479 9.883c-1.626-.604-2.512-1.067-2.512-1.803 0-.622.518-1.034 1.46-1.034 1.688 0 3.418.642 4.606 1.219l.671-4.13C16.358 3.511 14.698 3 12.74 3 9.026 3 6.655 5.043 6.655 8.252c0 3.699 2.729 5.01 4.796 6.097 2.139 1.105 2.85 1.864 2.85 2.876 0 .864-.671 1.369-1.876 1.369-1.627 0-3.8-.671-5.353-1.629l-.699 4.131C7.82 21.713 9.96 22.5 12.145 22.5c4.01 0 6.424-1.995 6.424-5.343-.028-3.699-2.813-5.01-5.09-6.097l-.671-.289-.329.112z" />
                            </svg>
                          )}
                          {m.id === 'paypal' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill={selectedMethod === m.id ? 'white' : '#003087'}>
                              <path d="M20.067 8.478c.492.88.156 2.56-1.026 4.38-1.372 2.11-3.576 2.873-6.217 2.873H11.1l-.837 5.128H6.266L6.312 20H2.737L4.48 8.478h6.388c1.001 0 1.845.177 2.299.63.455.454.617 1.075.617 1.664 0 .19-.033.363-.066.53h.59c1.406 0 2.528.363 3.282 1.034.756.671.955 1.56.955 2.428 0 .083 0 .177-.017.26.033.036.05.083.05.13 0 .13-.05.317-.05.317v.013l.005-.013z" />
                            </svg>
                          )}
                          {m.name}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      {selectedMethod && paymentMethods.find(m => m.id === selectedMethod)?.component}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600 text-center">No payment methods available for this course.</p>
                )}
              </div>
              {educatorCourses.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md mt-8 border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    More Courses by
                    {courseData?.educator && <span className="ml-2 text-blue-600">{courseData.educator.name}</span>}
                  </h3>
                  {isEducatorCoursesLoading ? (
                    <Loading />
                  ) : (
                    <>
                      <div className="space-y-4">
                        {paginatedCourses.map(course => <CourseItem key={course._id} course={course} />)}
                      </div>
                      {!paginatedCourses.length && <p className="text-gray-500">No more courses from this educator.</p>}
                      {totalPages > 1 && (
                        <div className="flex gap-2 justify-center mt-6">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                              currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            aria-label="Previous page"
                          >
                            Previous
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => (
                            <button
                              key={i}
                              onClick={() => handlePageChange(i + 1)}
                              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                              aria-label={`Page ${i + 1}`}
                              aria-current={currentPage === i + 1 ? 'page' : undefined}
                            >
                              {i + 1}
                            </button>
                          ))}
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                              currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            aria-label="Next page"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PaymentPage;
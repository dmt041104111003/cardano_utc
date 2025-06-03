import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import { FaMedal, FaGraduationCap, FaCalendarAlt, FaUser, FaBook, FaUniversity } from "react-icons/fa";
import { toast } from "react-toastify";

const Certificate = () => {
  const { courseId } = useParams();
  const { backendUrl, getToken } = useContext(AppContext);
  const { user } = useUser();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getUserName = () => user?.fullName || `${user?.firstName} ${user?.lastName}`;

  const calculateCompletion = (course) => {
    const totalLectures = course.courseContent?.reduce((sum, c) => sum + c.chapterContent.length, 0) || 0;
    const completedLectures = course.courseContent?.reduce((sum, c) => sum + c.chapterContent.filter(l => l.completed).length, 0) || 0;
    return totalLectures > 0 ? (completedLectures / totalLectures) * 100 : 0;
  };

  const fetchCourse = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success && data.courseData) {
        setCourse(data.courseData);
      } else {
        setError("Failed to load course data");
      }
    } catch (err) {
      setError("Failed to load course information");
      toast.error(err.response?.data?.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchCourse();
  }, [courseId]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mb-4 animate-spin" />
          <div className="text-lg font-medium text-gray-700">Loading certificate...</div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md max-w-lg">
          <div className="flex items-center mb-3">
            <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-800">Error</h3>
          </div>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );

  if (!course)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg shadow-md max-w-lg">
          <div className="flex items-center mb-3">
            <svg className="h-6 w-6 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-blue-800">Information</h3>
          </div>
          <p className="text-blue-700">Course not found</p>
        </div>
      </div>
    );

  const currentDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const isCompleted = calculateCompletion(course) === 100;

  return (
    <div className="container mx-auto px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-indigo-400/20 to-pink-500/20 rounded-full filter blur-3xl opacity-30 translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {isCompleted ? (
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-gray-200/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-400/40 to-purple-500/40 rounded-full filter blur-2xl opacity-30 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-indigo-400/40 to-pink-500/40 rounded-full filter blur-2xl opacity-30 translate-x-1/2 -translate-y-1/2" />

            <div className="text-center mb-8">
              <div className="inline-block p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 animate-pulse">
                <FaMedal className="text-white text-3xl" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Certificate of Completion
              </h1>
              <p className="text-gray-600 mt-2">This certifies that</p>
              <p className="text-2xl font-bold text-gray-800 mt-1 mb-2">{getUserName()}</p>
              <p className="text-gray-600">has successfully completed</p>
              <p className="text-xl font-semibold text-gray-800 mt-1 mb-2">{course.courseTitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {[
                { icon: <FaBook className="text-blue-600" />, label: "Course ID", value: `#${courseId}`, bg: "bg-blue-100" },
                { icon: <FaUser className="text-purple-600" />, label: "Issued To", value: getUserName(), bg: "bg-purple-100" },
                { icon: <FaUniversity className="text-indigo-600" />, label: "Issuer", value: course.educator?.name, bg: "bg-indigo-100" },
                { icon: <FaCalendarAlt className="text-pink-600" />, label: "Date Issued", value: currentDate, bg: "bg-pink-100" },
              ].map(({ icon, label, value, bg }, i) => (
                <div key={i} className="bg-gray-50/80 p-4 rounded-lg border border-gray-200/50 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center mb-2">
                    <div className={`p-2 ${bg} rounded-full mr-3`}>{icon}</div>
                    <h3 className="font-medium text-gray-700">{label}</h3>
                  </div>
                  <p className="text-gray-800 font-semibold ml-12">{value}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-4" />
              <p className="text-gray-600 text-sm">This certificate verifies completion on the Cardano UTC platform</p>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-gray-200/50">
            <div className="text-center mb-6">
              <div className="inline-block p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4">
                <FaGraduationCap className="text-white text-3xl" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Course Information</h1>
              <p className="text-gray-600 mt-2">Complete the course to receive your certificate</p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">Complete all lectures to receive your certificate</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Course Details</h2>
              <div className="space-y-3">
                {[
                  { icon: <FaBook className="text-gray-600" />, label: "Course", value: course.courseTitle },
                  { icon: <FaUniversity className="text-gray-600" />, label: "Instructor", value: course.educator?.name },
                ].map(({ icon, label, value }, i) => (
                  <div key={i} className="flex items-center">
                    <div className="p-1.5 bg-gray-100 rounded-full mr-3">{icon}</div>
                    <span className="text-gray-700 font-medium">{label}:</span>
                    <span className="text-gray-800 ml-2">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Certificate;
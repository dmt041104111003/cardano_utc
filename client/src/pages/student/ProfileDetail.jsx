/* eslint-disable no-unused-vars */
import { useState, useEffect, useContext } from "react";
import { useUser } from "@clerk/clerk-react";
import { CardanoWallet } from "@meshsdk/react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaGraduationCap, FaBook, FaClock, FaWallet, FaEnvelope, FaUser, FaChartLine } from "react-icons/fa";

const ProfilePage = () => {
  const { user } = useUser();
  const [assets, setAssets] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    enrolledCourses,
    userData,
    fetchUserEnrolledCourses,
    backendUrl,
    getToken,
    calculateNoOfLectures,
    calculateCourseDuration,
    currentWallet,
    setCurrentWallet,
    connected, 
    wallet,
  } = useContext(AppContext);

  const [progressArray, setProgressArray] = useState([]);

  useEffect(() => {
    if (connected && wallet) {
      setCurrentWallet(wallet);
    }
  }, [connected, setCurrentWallet]);

  useEffect(() => {
    if (currentWallet) {
      getAssets();
    }
  }, [currentWallet]);

  async function getAssets() {
    if (!currentWallet) return;
    setLoading(true);
    setError(null);
    try {
      const lovelace = await currentWallet.getLovelace();
      const _assets = parseFloat(lovelace) / 1000000;
      if (_assets === 0) setError("No assets in wallet.");
      setAssets(_assets);
    } catch (err) {
      setError("Error loading assets from wallet.");
    }
    setLoading(false);
  }

  useEffect(() => {
    if (userData) {
      fetchUserEnrolledCourses();
    }
  }, [userData]);

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      getCourseProgress();
    }
  }, [enrolledCourses]);

  const getCourseProgress = async () => {
    try {
      const token = await getToken();
      const tempProgressArray = await Promise.all(
        enrolledCourses.map(async (course) => {
          const { data } = await axios.post(
            `${backendUrl}/api/user/get-course-progress`,
            { courseId: course._id },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          let totalLectures = calculateNoOfLectures(course);
          const lectureCompleted = data.progressData
            ? data.progressData.lectureCompleted.length
            : 0;
          return { totalLectures, lectureCompleted };
        })
      );
      setProgressArray(tempProgressArray);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: enrolledCourses.length > 3,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    cssEase: "cubic-bezier(0.645, 0.045, 0.355, 1.000)",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full filter blur-3xl opacity-70 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-purple-400/10 to-pink-500/10 rounded-full filter blur-3xl opacity-70 translate-x-1/2 translate-y-1/2"></div>
      
      {/* Main Content */}
      <div className="min-h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0 relative z-10">
        <div className="w-full max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-1.5 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">My Profile</h1>
          </div>
          
          {/* Profile Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-100/50 mb-8 overflow-hidden relative">
            {/* Card Light Effects */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full filter blur-2xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-indigo-400/20 to-pink-500/20 rounded-full filter blur-2xl opacity-30 translate-x-1/2 translate-y-1/2"></div>
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-8 relative z-10">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-70 blur-md group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <img
                      src={user?.imageUrl || "https://via.placeholder.com/100"}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-1 right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                  </div>
                </div>
                
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{user?.fullName || "User"}</h2>
                  <p className="text-gray-600 flex items-center gap-2 justify-center md:justify-start mb-2">
                    <FaEnvelope className="text-indigo-500" />
                    {user?.primaryEmailAddress?.emailAddress || "Email not available"}
                  </p>
                  {assets !== null && (
                    <div className="flex items-center gap-2 text-sm font-medium text-indigo-600 justify-center md:justify-start">
                      <FaWallet className="text-indigo-500" />
                      <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent font-bold">
                        {assets} ADA
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 md:mt-0 w-full md:w-auto flex justify-center md:justify-end">
                <div className="transform transition-all duration-300 hover:scale-105">
                  <CardanoWallet isDark={false} persist={true} onConnected={getAssets} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Courses Completed */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-indigo-100/50 p-6 hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-400/10 to-blue-500/10 rounded-full filter blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Courses Completed</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {progressArray.filter(progress => progress.lectureCompleted === progress.totalLectures).length}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">out of {enrolledCourses.length} enrolled</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-400 to-green-500 rounded-lg shadow-md">
                  <FaGraduationCap className="text-white text-xl" />
                </div>
              </div>
            </div>
            
            {/* Total Lectures */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-indigo-100/50 p-6 hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-400/10 to-indigo-500/10 rounded-full filter blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Lectures Completed</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {progressArray.reduce((total, progress) => total + progress.lectureCompleted, 0)}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">out of {progressArray.reduce((total, progress) => total + progress.totalLectures, 0)} total</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg shadow-md">
                  <FaBook className="text-white text-xl" />
                </div>
              </div>
            </div>
            
            {/* Overall Progress */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-indigo-100/50 p-6 hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-400/10 to-pink-500/10 rounded-full filter blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Overall Progress</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {progressArray.length > 0 ? 
                      Math.round((progressArray.reduce((total, progress) => total + progress.lectureCompleted, 0) / 
                      progressArray.reduce((total, progress) => total + progress.totalLectures, 0)) * 100) : 0}%
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">across all courses</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg shadow-md">
                  <FaChartLine className="text-white text-xl" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-500" 
                    style={{ width: `${progressArray.length > 0 ? 
                      Math.round((progressArray.reduce((total, progress) => total + progress.lectureCompleted, 0) / 
                      progressArray.reduce((total, progress) => total + progress.totalLectures, 0)) * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Courses Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-100/50 p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
              <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full filter blur-2xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-purple-400/10 to-pink-500/10 rounded-full filter blur-2xl opacity-30 translate-x-1/2 translate-y-1/2"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                  <FaBook className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Courses Being Studied
                </h3>
              </div>
              
              {enrolledCourses.length > 0 ? (
                <div className="pb-4">
                  <Slider {...sliderSettings}>
                    {enrolledCourses.map((course, index) => (
                      <div key={course._id} className="p-3">
                        <div className="bg-white rounded-xl shadow-md border border-indigo-100/50 p-6 h-full hover:shadow-lg transform transition-all duration-300 hover:scale-105 hover:border-indigo-300/70 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-400/10 to-indigo-500/10 rounded-full filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          <h4 className="font-bold text-gray-800 mb-3 line-clamp-2">{course.courseTitle}</h4>
                          
                          {progressArray[index] && (
                            <div className="mt-4">
                              <div className="flex justify-between mb-1 text-sm">
                                <span className="text-gray-600 font-medium">Progress</span>
                                <span className="text-indigo-600 font-medium">
                                  {Math.round((progressArray[index].lectureCompleted / progressArray[index].totalLectures) * 100)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" 
                                  style={{ width: `${Math.round((progressArray[index].lectureCompleted / progressArray[index].totalLectures) * 100)}%` }}
                                ></div>
                              </div>
                              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                <FaBook className="text-gray-400" />
                                {progressArray[index].lectureCompleted}/{progressArray[index].totalLectures} lectures completed
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </Slider>
                </div>
              ) : (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-lg shadow-sm">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        You haven't enrolled in any courses yet. Explore our course catalog to find something that interests you!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
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
    dots: true  ,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    responsive: [
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
    <>
      <div className='relative min-h-screen'>
        <div className='absolute top-0 left-0 w-full h-full bg-gradient-to-b from-green-100/70 via-cyan-100/50 to-white'></div>
        <div className='min-h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0 relative z-10'>
          <div className='w-full'>
            
            <div className="flex items-center justify-between p-6 border rounded-2xl shadow bg-gray-100">
              <div className="flex items-center gap-4">
                <img
                  src={user?.imageUrl || "https://via.placeholder.com/100"}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full"
                />
                <div>
                  <h2 className="text-2xl font-semibold">{user?.fullName || "User"}</h2>
                  <p className="text-gray-600">
                    {user?.primaryEmailAddress?.emailAddress || "Email not available"}
                  </p>
                </div>
              </div>
              <CardanoWallet isDark={true} persist={true} onConnected={getAssets} />
            </div>

            <div className=" p-4 ">
                <p className="text-gray-600">Currently no courses pending approval.</p>
              </div>

            <div className="mt-6 space-y-6">
              <div className=" p-4 ">
                <p className="text-gray-600">No recent courses.</p>
              </div>

              <div className="mt-6 space-y-6">
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">
                  Courses being studied...
                </h3>
                {enrolledCourses.length > 0 ? (
                  <Slider {...sliderSettings}>
                    {enrolledCourses.map((course, index) => (
                      <div key={course._id} className="p-2">
                        <div className="bg-white/90 p-4 rounded-lg shadow-lg border border-green-200/30 hover:shadow-xl transform transition-all duration-300 hover:scale-105">
                          <h4 className="font-semibold text-gray-800">{course.courseTitle}</h4>
                          {progressArray[index] && (
                            <p className="text-sm text-gray-600 mt-2">
                              Tiến độ: {progressArray[index].lectureCompleted}/{progressArray[index].totalLectures}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </Slider>
                ) : (
                  <p className="text-gray-600 bg-white/80 p-4 rounded-lg shadow">
                    Haven't taken any courses yet!
                  </p>
                )}
              </div>
            </div>
              
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
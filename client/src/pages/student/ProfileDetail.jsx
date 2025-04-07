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
      if (_assets === 0) setError("Không có tài sản nào trong ví.");
      setAssets(_assets);
    } catch (err) {
      setError("Lỗi khi tải tài sản từ ví.");
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
    
    <div className="max-w-7xl mx-auto mt-10">
      <div className="flex items-center justify-between p-6 border rounded-2xl shadow bg-gray-100">
        <div className="flex items-center gap-4">
          <img
            src={user?.imageUrl || "https://via.placeholder.com/100"}
            alt="Avatar"
            className="w-20 h-20 rounded-full"
          />
          <div>
            <h2 className="text-2xl font-semibold">{user?.fullName || "Người dùng"}</h2>
            <p className="text-gray-600">
              {user?.primaryEmailAddress?.emailAddress || "Email không có"}
            </p>
          </div>
        </div>
        <CardanoWallet isDark={true} persist={true} onConnected={getAssets} />
      </div>

      <div className=" p-4 ">
          {/* <h3 className="text-xl font-semibold mb-2">Khóa học chờ xét duyệt</h3>
          <p className="text-gray-600">Hiện tại không có khóa học nào đang chờ xét duyệt.</p> */}
        </div>

      <div className="mt-6 space-y-6">
        <div className=" p-4 ">
          {/* <h3 className="text-xl font-semibold mb-2">Khóa học gần đây</h3>
          <p className="text-gray-600">Chưa có khóa học gần đây.</p> */}
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
              Chưa có khóa học hoàn thành.
            </p>
          )}
        </div>
      </div>
        
      </div>
    </div>
  );
};

export default ProfilePage;
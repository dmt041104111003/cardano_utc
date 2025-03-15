/* eslint-disable no-unused-vars */
import { useState, useEffect, useContext } from "react";
import { useUser } from "@clerk/clerk-react";
import { useWallet, CardanoWallet } from "@meshsdk/react";
import { AppContext } from "../../context/AppContext"; // Giả sử bạn có AppContext
import axios from "axios";
import { toast } from "react-toastify";

const ProfilePage = () => {
  const { user } = useUser();
  const { connected, wallet, connect, setPersist } = useWallet();
  const [assets, setAssets] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy từ AppContext
  const {
    enrolledCourses,
    calculateCourseDuration,
    navigate,
    userData,
    fetchUserEnrolledCourses,
    backendUrl,
    getToken,
    calculateNoOfLectures,
  } = useContext(AppContext);

  const [progressArray, setProgressArray] = useState([]);

  // Hàm lấy tài sản từ ví Cardano
  async function getAssets() {
    if (wallet) {
      setLoading(true);
      setError(null);
      try {
        const lovelace = await wallet.getLovelace();
        const _assets = parseFloat(lovelace) / 1000000;
        if (_assets.length === 0) {
          setError("Không có tài sản nào trong ví.");
        }
        setAssets(_assets);
      } catch (err) {
        setError("Lỗi khi tải tài sản từ ví.");
      }
      setLoading(false);
    }
  }

  // Hàm lấy tiến độ khóa học từ API
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

  // Lấy danh sách khóa học đã đăng ký khi userData thay đổi
  useEffect(() => {
    if (userData) {
      fetchUserEnrolledCourses();
    }
  }, [userData]);

  // Lấy tiến độ khóa học khi enrolledCourses thay đổi
  useEffect(() => {
    if (enrolledCourses.length > 0) {
      getCourseProgress();
    }
  }, [enrolledCourses]);

  // Lọc các khóa học đã hoàn thành
  const completedCourses = enrolledCourses
    .map((course, index) => ({
      ...course,
      progress: progressArray[index],
    }))
    .filter(
      (course) =>
        course.progress &&
        course.progress.lectureCompleted === course.progress.totalLectures
    );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-10">
      {/* Thông tin cá nhân */}
      <div className="flex items-center justify-between border-b pb-4">
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

      {/* Tài sản trong ví */}
      {connected && (
        <>
          <h3 className="text-xl font-semibold mb-4 mt-4">Tài sản trong ví</h3>
          <div className="mt-4">
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {assets && (
              <pre className="bg-gray-100 p-4 rounded-md mt-2 overflow-x-auto">
                <code className="language-js">{JSON.stringify(assets, null, 2)} ada</code>
              </pre>
            )}
          </div>
        </>
      )}

      {/* Danh sách khóa học đã hoàn thành */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Khóa học đã hoàn thành</h3>
        {completedCourses.length > 0 ? (
          <table className="w-full border-collapse border rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Khóa học</th>
                <th className="border px-4 py-2">Thời lượng</th>
                <th className="border px-4 py-2">Tiến độ</th>
              </tr>
            </thead>
            <tbody>
              {completedCourses.map((course) => (
                <tr key={course._id} className="text-center">
                  <td className="border px-4 py-2">{course.courseTitle}</td>
                  <td className="border px-4 py-2">{calculateCourseDuration(course)}</td>
                  <td className="border px-4 py-2">
                    {course.progress &&
                      `${course.progress.lectureCompleted} / ${course.progress.totalLectures} bài giảng`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-600">Bạn chưa hoàn thành khóa học nào.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
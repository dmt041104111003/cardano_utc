
import React, { useState, useEffect, useContext } from "react";
import { Bell, Search } from "lucide-react";
import NotificationList from "../../components/educator/Notificationlist";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Lấy từ AppContext
  const {
    enrolledCourses,
    calculateCourseDuration,
    userData,
    fetchUserEnrolledCourses,
    backendUrl,
    getToken,
    calculateNoOfLectures,
  } = useContext(AppContext);

  const [progressArray, setProgressArray] = useState([]);

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
      toast.error("Lỗi khi tải tiến độ khóa học: " + error.message);
    }
  };


  // Lấy danh sách khóa học đã đăng ký khi userData thay đổi
  useEffect(() => {
    if (userData) {
      fetchUserEnrolledCourses();
    }
  }, [userData]);

  // Lấy tiến độ khóa học và tạo thông báo khi enrolledCourses thay đổi
  useEffect(() => {
    if (enrolledCourses.length > 0) {
      getCourseProgress();
    }
  }, [enrolledCourses]);

  // Tạo danh sách thông báo từ các khóa học đã hoàn thành
  useEffect(() => {
    if (progressArray.length > 0 && enrolledCourses.length > 0) {
      setLoading(true);
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

      // Tạo danh sách thông báo từ các khóa học hoàn thành
      const newNotifications = completedCourses.map((course, index) => {
        const notification = {
          id: index + 1,
          course: course.courseTitle,
          requester: userData?.name || "Người dùng",
          date: new Date().toLocaleDateString("vi-VN"), // Ngày hiện tại
          status: "pending", // Trạng thái mặc định
        };

        return notification;
      });

      setNotifications(newNotifications);
      setLoading(false);
    }
  }, [progressArray, enrolledCourses, userData]);

  // Lọc thông báo dựa trên tìm kiếm
  const filteredNotifications = notifications.filter(
    (notification) =>
      notification.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.requester.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Nhóm thông báo theo khóa học
  const groupedNotifications = filteredNotifications.reduce((acc, notification) => {
    if (!acc[notification.course]) {
      acc[notification.course] = [];
    }
    acc[notification.course].push(notification);
    return acc;
  }, {});

  return (
    <div className="mx-auto p-6 bg-white mt-5">
      <h1 className="text-3xl font-semibold mb-4 flex items-center gap-2">
        <Bell size={30} className="text-blue-600" /> Thông báo yêu cầu chứng chỉ
      </h1>

      {/* Thanh tìm kiếm */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm theo khóa học hoặc người yêu cầu..."
          className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-3 top-3 text-gray-500" size={20} />
      </div>

      {/* Hiển thị trạng thái tải hoặc thông báo */}
      {loading ? (
        <p className="text-gray-500 text-lg">Đang tải thông báo...</p>
      ) : Object.keys(groupedNotifications).length === 0 ? (
        <p className="text-gray-500 text-lg">Không có thông báo nào</p>
      ) : (
        Object.entries(groupedNotifications).map(([course, courseNotifications]) => (
          <div key={course} className="mb-6">
            <h2 className="text-xl font-semibold mb-3 text-blue-600">{course}</h2>
            <NotificationList notifications={courseNotifications} />
          </div>
        ))
      )}
    </div>
  );
};

export default NotificationPage;
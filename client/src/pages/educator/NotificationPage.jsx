/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Bell, Search } from "lucide-react";
import NotificationList from "../../components/educator/Notificationlist";

const notificationsData = [
  {
    id: 1,
    course: "Blockchain cơ bản",
    requester: "Nguyễn Văn A",
    date: "09/03/2025",
    status: "pending",
  },
  {
    id: 2,
    course: "Blockchain cơ bản",
    requester: "Phạm Văn D",
    date: "09/03/2025",
    status: "pending",
  },
  {
    id: 3,
    course: "Phân tích dữ liệu trên Blockchain",
    requester: "Trần Thị B",
    date: "08/03/2025",
    status: "approved",
  },
  {
    id: 4,
    course: "Lập trình hợp đồng thông minh",
    requester: "Lê Minh C",
    date: "07/03/2025",
    status: "rejected",
  },
];

const NotificationPage = () => {
  const [notifications, setNotifications] = useState(notificationsData);
  const [searchTerm, setSearchTerm] = useState("");


  const filteredNotifications = notifications.filter(
    (notification) =>
      notification.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.requester.toLowerCase().includes(searchTerm.toLowerCase())
  );

 
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

      {Object.keys(groupedNotifications).length === 0 ? (
        <p className="text-gray-500 text-lg">Không có thông báo phù hợp</p>
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

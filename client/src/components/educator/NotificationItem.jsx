/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import { CheckCircle, XCircle } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from 'react-toastify';

const handleAccept = (id) => {
    console.log(id);
    Swal.fire({
                title: "Bạn có chắc muốn duyệt chứng chỉ này của người yêu cầu?",
                text: "Bạn sẽ không thể thay đổi sau khi duyệt",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Có, duyệt!",
                cancelButtonText: "Hủy"
            }).then((result) => {
                if (result.isConfirmed) {
                    toast.success("Duyệt thành công chứng chỉ")
                }
            });
}
const NotificationItem = ({ notification, onApprove, onReject }) => {
  return (
    <li className="flex justify-between items-center p-4 bg-gray-100 rounded-lg shadow-md">
      <div>
        <p className="text-lg font-semibold">{notification.course}</p>
        <p className="text-gray-600">Người yêu cầu: {notification.requester}</p>
        <p className="text-gray-500 text-sm">Ngày: {notification.date}</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() =>handleAccept(notification._id)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 flex items-center gap-1"
        >
          <CheckCircle size={16} /> Chấp nhận
        </button>
       
      </div>
    </li>
  );
};

export default NotificationItem;
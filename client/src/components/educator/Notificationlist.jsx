/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState ,useEffect} from "react";
import NotificationItem from "./NotificationItem";
import axios from "axios";

const NotificationList = ({ notifications }) => {
  const [notification, setNotification] = useState([]);
  useEffect(() => {
    const fetchNotifications = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/notification/getAll?mintUserId=user_2ubWEhkBiuYj1uQbL2pXGUGKuvM"
            );
            console.log("API Response:", res.data);
            setNotification(res.data.notifications || []);
        } catch (error) {
            console.error("Error fetching notifications:", error.response?.data || error.message);
        }
    };

    fetchNotifications();
}, []);


  return (
    <ul className="space-y-4">
      {console.log(notifications)}
      {notifications.map((notif) => (
        <NotificationItem  key={notif.id} notification={notif} />
        
      ))}
    </ul>
  );
};

export default NotificationList;

/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import NotificationItem from "./NotificationItem";

const NotificationList = ({ notifications }) => {
  return (
    <ul className="space-y-4">
      {notifications.map((notif) => (
        <NotificationItem key={notif.id} notification={notif} />
      ))}
    </ul>
  );
};

export default NotificationList;

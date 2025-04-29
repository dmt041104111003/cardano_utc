/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { NavLink } from 'react-router-dom';
import { assets } from '../../assets/assets';

// Inline SidebarTimer since the file was deleted
function formatTime(ms) {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}
function SidebarTimer({ isPremium, premiumExpiry, cooldownMs, fetchUserData }) {
  const [premiumLeft, setPremiumLeft] = useState(
    isPremium && premiumExpiry ? new Date(premiumExpiry) - Date.now() : 0
  );
  const [cooldownLeft, setCooldownLeft] = useState(cooldownMs);
  const [showPremium, setShowPremium] = useState(isPremium && premiumLeft > 0);

  // Premium countdown
  useEffect(() => {
    if (isPremium && premiumExpiry) {
      setShowPremium(true);
      setPremiumLeft(new Date(premiumExpiry) - Date.now());
      const interval = setInterval(() => {
        const left = new Date(premiumExpiry) - Date.now();
        setPremiumLeft(left > 0 ? left : 0);
        if (left <= 0) {
          setShowPremium(false);
          if (typeof fetchUserData === 'function') fetchUserData(); // Optionally sync with backend
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setShowPremium(false);
    }
  }, [isPremium, premiumExpiry, fetchUserData]);

  // Cooldown countdown
  useEffect(() => {
    let interval;
    setCooldownLeft(cooldownMs);
    if ((!isPremium || !showPremium) && cooldownMs > 0) {
      interval = setInterval(() => {
        setCooldownLeft(t => {
          if (t <= 1000) {
            clearInterval(interval);
            if (typeof fetchUserData === 'function') fetchUserData();
            return 0;
          }
          return t - 1000;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPremium, showPremium, cooldownMs, fetchUserData]);

  if (showPremium && premiumLeft > 0) {
    return (
      <div className="p-3 bg-green-100 text-green-800 rounded mb-2 text-center text-sm font-semibold">
        Premium left: {formatTime(premiumLeft)}
      </div>
    );
  }
  if ((!isPremium || !showPremium) && cooldownLeft > 0) {
    return (
      <div className="p-3 bg-yellow-100 text-yellow-800 rounded mb-2 text-center text-sm font-semibold">
        Wait {formatTime(cooldownLeft)} to create a new course
      </div>
    );
  }
  if ((!isPremium || !showPremium) && cooldownLeft === 0) {
    return (
      <div className="p-3 bg-green-100 text-green-800 rounded mb-2 text-center text-sm font-semibold">
        You can create a new course!
      </div>
    );
  }
  return null;
}

const Sidebar = () => {
    const { isEducator, userData, fetchUserData } = useContext(AppContext);
    const isPremium = userData?.isPremium;
    const premiumExpiry = userData?.premiumExpiry;
    const cooldownMs = userData?.cooldownMs || 0;
    const canCreateCourse = userData?.canCreateCourse;

    const menuItems = [
        { name: 'Dashboard', path: '/educator', icon: assets.home_icon },
        { name: 'Add Course', path: '/educator/add-course', icon: assets.add_icon },
        { name: 'Delete Course', path: '/educator/edit-course', icon: assets.edit_icon },
        { name: 'My Courses', path: '/educator/my-courses', icon: assets.my_course_icon },
        { name: 'Student Enrolled', path: '/educator/student-enrolled', icon: assets.person_tick_icon },
        { name: 'Notification', path: '/educator/notification', icon: assets.notification_icon },
        { name: 'Premium', path: '/educator/subscription', icon: assets.star },
    ];

    return isEducator && (
        <div className='md:w-64 w-16 border-r min-h-screen text-base border-gray-500 py-2 flex flex-col z-20'>
            {/* Always show the timer at the top */}
            <SidebarTimer isPremium={isPremium} premiumExpiry={premiumExpiry} cooldownMs={cooldownMs} fetchUserData={fetchUserData} />
            {menuItems.map((item) => (
                <NavLink
                    className={({ isActive }) => `flex items-center md:flex-row
                    flex-col md:justify-start justify-center py-3.5 md:px-10 gap-3 
                    ${isActive ? 'bg-indigo-50 border-r-[6px] border-indigo-500/90'
                                : 'hover:bg-gray-100/90 border-r-[6px] border-white hover:border-gray-100/90'}`}
                    to={item.path} key={item.name} end={item.path === '/educator'}>
                    <img src={item.icon} alt="" className='w-6 h-6' />
                    <p className='md:block hidden text-center'>{item.name}</p>
                </NavLink>
            ))}
        </div>
    );
}

export default Sidebar;

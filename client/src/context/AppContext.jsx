import { createContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import humanizeDuration from 'humanize-duration';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useWallet } from '@meshsdk/react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const AppContext = createContext();

export const AppContextProvider = (props) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const currency = process.env.REACT_APP_CURRENCY;
    const navigate = useNavigate();
    const location = useLocation();
    const { getToken } = useAuth();
    const { user } = useUser();
    const { connected, wallet, setPersist } = useWallet();

    const [allCourses, setAllCourses] = useState([]);
    const [isEducator, setIsEducator] = useState(false);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [userData, setUserData] = useState(null);
    const [currentWallet, setCurrentWallet] = useState(null);


    useEffect(() => {
        if (wallet) {
            setCurrentWallet(wallet);
            setPersist(true); 
        } else {
            setCurrentWallet(null);
        }
    }, [wallet]);

    const fetchAllCourses = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/course/all');
            if (data.success) {
                setAllCourses(data.courses);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const fetchUserData = async () => {
        if (user?.publicMetadata.role === 'educator') {
            setIsEducator(true);
        }
        try {
            const token = await getToken();
            const { data } = await axios.get(backendUrl + '/api/user/data', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (data.success) {
                setUserData(data.user);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const calculateRating = (course) => {
        if (course.courseRatings.length === 0) return 0;
        let totalRating = 0;
        course.courseRatings.forEach((rating) => (totalRating += rating.rating));
        return Math.floor(totalRating / course.courseRatings.length);
    };

    const calculateChapterTime = (chapter) => {
        let time = 0;
        chapter.chapterContent.map((lecture) => (time += lecture.lectureDuration));
        return humanizeDuration(time * 60 * 1000, { units: ['h', 'm'] });
    };

    const calculateCourseDuration = (course) => {
        let time = 0;
        course.courseContent.map((chapter) =>
            chapter.chapterContent.map((lecture) => (time += lecture.lectureDuration))
        );
        return humanizeDuration(time * 60 * 1000, { units: ['h', 'm'] });
    };

    const calculateNoOfLectures = (course) => {
        let totalLectures = 0;
        course.courseContent.forEach((chapter) => {
            if (Array.isArray(chapter.chapterContent)) {
                totalLectures += chapter.chapterContent.length;
            }
        });
        return totalLectures;
    };

    const fetchUserEnrolledCourses = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get(backendUrl + '/api/user/enrolled-courses', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (data.success) {
                setEnrolledCourses(data.enrolledCourses.reverse());
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchAllCourses();
    }, [location.pathname]);

    useEffect(() => {
        if (user) {
            fetchUserData();
            fetchUserEnrolledCourses();
        }
    }, [user]);

    const value = {
        allCourses,
        setAllCourses,
        isEducator,
        setIsEducator,
        enrolledCourses,
        setEnrolledCourses,
        currency,
        backendUrl,
        navigate,
        calculateRating,
        calculateChapterTime,
        calculateCourseDuration,
        calculateNoOfLectures,
        fetchUserEnrolledCourses,
        user,
        userData,
        setUserData,
        getToken,
        fetchAllCourses,
        fetchUserData,
        currentWallet,
        setCurrentWallet,
        connected,
        wallet
    };

    return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};
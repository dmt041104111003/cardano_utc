
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import CourseCard from './CourseCard';
import { useContext } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const CoursesSection = () => {
    const { backendUrl, getToken, allCourses, setAllCourses } = useContext(AppContext);

    const fetchLatestCourses = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/course/all`);
            
            if (data.success) {
                const sortedCourses = [...data.courses].sort((a, b) => {
                    const ratingA = a.courseRatings.reduce((acc, curr) => acc + curr.rating, 0) / (a.courseRatings.length || 1);
                    const ratingB = b.courseRatings.reduce((acc, curr) => acc + curr.rating, 0) / (b.courseRatings.length || 1);
                    return ratingB - ratingA;
                });
                setAllCourses(sortedCourses);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            toast.error(error.message || 'Failed to fetch courses');
        }
    };

    const handleVisibilityChange = () => {
        if (!document.hidden) {
            fetchLatestCourses();
        }
    };

    useEffect(() => {
        fetchLatestCourses();
        
        const intervalId = setInterval(fetchLatestCourses, 2000);
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return (
        <div className='py-16 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto'>
            <div className='text-center max-w-4xl mx-auto mb-12'>
                <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-4">
                    Explore Our Courses
                </div>
                <h2 className='text-3xl md:text-4xl font-bold text-gray-800 mb-4'>
                    Popular Courses
                </h2>
                <p className='text-gray-600 max-w-2xl mx-auto'>
                    Join thousands of satisfied students in our highest-rated courses on the Cardano blockchain
                </p>
            </div>
            
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 my-10'>
                {allCourses.slice(0, 8).map((course, index) => (
                    <CourseCard key={course._id || index} course={course} />
                ))}
            </div>

            <div className="text-center mt-12">
                <Link
                    className='inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md transform hover:-translate-y-0.5'
                    to={'/course-list'} onClick={() => window.scrollTo(0, 0)}
                >
                    <span>View All Courses</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}

export default CoursesSection;

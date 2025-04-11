/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from 'react';
import { assets } from '../../assets/assets';
import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';

const CallToAction = () => {
    const [topCourses, setTopCourses] = useState([]);
    const { backendUrl } = useContext(AppContext);
    const navigate = useNavigate();

    const fetchTopCourses = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/course/top-rated`);
            if (response.data.success) {
                // Sort by rating
                const sortedCourses = [...response.data.courses].sort((a, b) => {
                    const ratingA = a.courseRatings.reduce((acc, curr) => acc + curr.rating, 0) / (a.courseRatings.length || 1);
                    const ratingB = b.courseRatings.reduce((acc, curr) => acc + curr.rating, 0) / (b.courseRatings.length || 1);
                    return ratingB - ratingA;
                });
                setTopCourses(sortedCourses);
            }
        } catch (error) {
            console.error('Error fetching top courses:', error);
        }
    };

    // Handle visibility change to update courses when tab becomes visible
    const handleVisibilityChange = () => {
        if (!document.hidden) {
            fetchTopCourses();
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchTopCourses();
        
        // Set up polling interval (every 2 seconds)
        const intervalId = setInterval(fetchTopCourses, 2000);
        
        // Set up visibility change listener
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Cleanup
        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return (
        <div className='flex flex-col items-center gap-8 py-16 px-8 md:px-0 bg-gradient-to-b from-white to-gray-50'>
            <div className='text-center max-w-4xl mx-auto'>
                <h2 className='text-3xl md:text-4xl font-bold text-gray-800 mb-4'>
                    Top Rated Courses
                </h2>
                <p className='text-gray-600'>
                    Join thousands of satisfied students in our highest-rated courses
                </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto'>
                {topCourses.map((course) => (
                    <div 
                        key={course._id}
                        className='bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300'
                    >
                        <div className='relative overflow-hidden'>
                            <img 
                                src={course.courseThumbnail} 
                                alt={course.courseTitle}
                                className='w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300'
                            />
                            <div className='absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg'>
                                <div className='flex items-center gap-1'>
                                    <FaStar className='text-yellow-500' />
                                    <span className='font-medium'>{course.rating ? course.rating.toFixed(1) : 'New'}</span>
                                </div>
                            </div>
                        </div>

                        <div className='p-5'>
                            <h3 className='font-semibold text-xl mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors'>
                                {course.courseTitle}
                            </h3>
                            <p className='text-gray-600 text-sm mb-2'>
                                Course by <span className='font-medium'>{course.educator?.name || 'Unknown Educator'}</span>
                            </p>
                            <p className='text-gray-500 text-xs mb-4'>ID: {course._id}</p>
                            <div className='flex items-center justify-between'>
                                <div className='flex flex-col'>
                                    <div className='flex items-center gap-2'>
                                        <span className='text-2xl font-bold text-blue-600'>${Number(course.price).toFixed(2)}</span>
                                        {course.hasDiscount && (
                                            <span className='text-gray-500 text-sm line-through'>${Number(course.originalPrice).toFixed(2)}</span>
                                        )}
                                    </div>
                                    <span className='text-gray-500 text-sm'>({course.totalRatings || 0} ratings)</span>
                                </div>
                                <button 
                                    onClick={() => navigate(`/course/${course._id}`)}
                                    className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                                >
                                    Learn More
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* <button 
                onClick={() => navigate('/course-list')}
                className='mt-8 px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium'
            >
                View All Courses
            </button> */}
        </div>
    );
}

export default CallToAction;

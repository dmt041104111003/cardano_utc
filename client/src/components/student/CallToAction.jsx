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
        <div className='flex flex-col items-center gap-8 py-16 px-4 md:px-8 lg:px-12 bg-gradient-to-b from-indigo-50/50 via-purple-50/30 to-white relative overflow-hidden'>
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-200/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/2 -left-24 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
            </div>
            
            <div className='text-center max-w-4xl mx-auto relative z-10'>
                <div className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4 animate-fade-in">
                    Highly Recommended
                </div>
                <h2 className='text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4 animate-fade-in'>
                    Top Rated Courses
                </h2>
                <p className='text-gray-600 max-w-2xl mx-auto'>
                    Join thousands of satisfied students in our highest-rated courses on the Cardano blockchain
                </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto relative z-10'>
                {topCourses.map((course, index) => (
                    <div 
                        key={course._id}
                        className='bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in'
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className='relative overflow-hidden'>
                            <img 
                                src={course.courseThumbnail} 
                                alt={course.courseTitle}
                                className='w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500'
                            />
                            <div className='absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                            <div className='absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-sm'>
                                <div className='flex items-center gap-1'>
                                    <FaStar className='text-amber-500' />
                                    <span className='font-medium'>{course.rating ? course.rating.toFixed(1) : 'New'}</span>
                                </div>
                            </div>
                            <div className='absolute bottom-0 left-0 w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300'>
                                <button
                                    onClick={() => {
                                        window.scrollTo(0, 0);
                                        navigate(`/course/${course._id}`);
                                    }}
                                    className='w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium'
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                    View Course
                                </button>
                            </div>
                        </div>

                        <div className='p-5'>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-6 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                                <p className='text-gray-600 text-sm'>
                                    <span className='font-medium text-indigo-600'>{course.educator?.name || 'Unknown Educator'}</span>
                                </p>
                            </div>
                            <h3 className='font-semibold text-xl mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors'>
                                {course.courseTitle}
                            </h3>
                            <div className='flex items-center justify-between mt-4'>
                                <div className='flex flex-col'>
                                    <div className='flex items-center gap-2'>
                                        <span className='text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>ADA{Number(course.price).toFixed(2)}</span>
                                        {course.hasDiscount && (
                                            <span className='text-gray-500 text-sm line-through'>${Number(course.originalPrice).toFixed(2)}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <FaStar key={i} className={`w-3 h-3 ${i < Math.round(course.rating || 0) ? 'text-amber-400' : 'text-gray-300'}`} />
                                            ))}
                                        </div>
                                        <span className='text-gray-500 text-xs'>({course.totalRatings || 0})</span>
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 animate-fade-in" style={{ animationDelay: '500ms' }}>
                <button 
                    onClick={() => {
                        window.scrollTo(0, 0);
                        navigate('/course-list');
                    }}
                    className='group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 overflow-hidden'
                >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative flex items-center justify-center gap-2 font-medium">
                        <span>View All Courses</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </span>
                </button>
            </div>
        </div>
    );
}

export default CallToAction;

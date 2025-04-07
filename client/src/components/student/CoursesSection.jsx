/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
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
                // Sort by rating
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

    // Handle visibility change to update courses when tab becomes visible
    const handleVisibilityChange = () => {
        if (!document.hidden) {
            fetchLatestCourses();
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchLatestCourses();
        
        // Set up polling interval (every 2 seconds)
        const intervalId = setInterval(fetchLatestCourses, 2000);
        
        // Set up visibility change listener
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Cleanup
        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return (
        <div className='py-16 md:px-40 px-8'>
            <div className='text-center max-w-4xl mx-auto'>
                <h2 className='text-3xl md:text-4xl font-bold text-gray-800 mb-4'>
                    List Courses
                </h2>
                <p className='text-gray-600'>
                    Join thousands of satisfied students in our highest-rated courses
                </p>
            </div>
            <div className='grid grid-cols-auto px-4 md:px-0 md:my-16 my-10 gap-4'>
                {allCourses.slice(0, 7).map((course, index) => <CourseCard key={course._id || index} course={course} />)}
            </div>

            <Link
                className='text-gray-500 border border-gray-500/30 rounded px-10 py-3'
                to={'/course-list'} onClick={() => scrollTo(0, 0)}>Show all course</Link>

        </div>
    );
}

export default CoursesSection;

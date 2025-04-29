/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useContext } from 'react';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
    if (!course || !course._id || !course.courseTitle || !course.educator || !course.courseRatings) {
        return <div>Course data is incomplete.</div>;
    }
    
    const { currency, calculateRating } = useContext(AppContext);
    return (
        <Link to={'/course/' + course._id} onClick={() => scrollTo(0, 0)}
            className='border border-gray-500/30 pb-6 overflow-hidden rounded-lg'>
            <img className='w-full' src={course.courseThumbnail} alt="" />
            <div className='p-3 text-left'>
                <div className='flex items-center justify-between mb-2'>
                    <h3 className='text-base font-semibold'>{course.courseTitle}</h3>
                    <span className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full flex items-center ${course.creatorAddress ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1 ${course.creatorAddress ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                        {course.creatorAddress ? 'On-Chain' : 'Off-Chain'}
                    </span>
                </div>
                <p className='text-gray-500'>{course.educator.name}</p>
                <p className='text-xs text-gray-400'>ID: {course._id}</p>
                <div className='flex items-center space-x-2'>
                    <p>{calculateRating(course)}</p>
                    <div className='flex'>
                        {[...Array(5)].map((_, i) => <img key={i} src={i < Math.floor(calculateRating(course)) ? assets.star : assets.star_blank} alt='' className='w-3.5 h-3.5' />)}
                    </div>
                    <p className='text-gray-500'>{course.courseRatings.length}</p>
                </div>
                <p className='text-base font-semibold text-gray-800 mt-2'>{currency}{(course.coursePrice - course.discount * course.coursePrice / 100).toFixed(2)}</p>
            </div>
        </Link>
    );
}

export default CourseCard;
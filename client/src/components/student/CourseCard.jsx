/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useContext } from 'react';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
    const { currency, calculateRating } = useContext(AppContext);
    
    if (!course || !course._id || !course.courseTitle || !course.educator || !course.courseRatings) {
        return (
            <div className="bg-white shadow-md rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg p-4 flex items-center justify-center text-gray-500">
                Course data is incomplete.
            </div>
        );
    }
    
    // Calculate discounted price
    const originalPrice = course.coursePrice;
    const discountedPrice = course.discount > 0 
        ? originalPrice - (originalPrice * course.discount / 100) 
        : originalPrice;
    
    // Calculate rating
    const rating = calculateRating(course);
    
    return (
        <div className="h-full bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            {/* Course Image */}
            <div className="relative overflow-hidden">
                <Link to={'/course/' + course._id}>
                    <img 
                        className="w-full h-40 object-cover hover:scale-105 transition-transform duration-500" 
                        src={course.courseThumbnail} 
                        alt={course.courseTitle} 
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/300x200?text=Course+Image';
                        }}
                    />
                </Link>
                
                {/* On-Chain Badge */}
                {course.creatorAddress && (
                    <div className="absolute top-2 left-2">
                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full mr-1 bg-green-500"></span>
                            On-Chain
                        </span>
                    </div>
                )}
                
                {/* Discount Badge */}
                {course.discount > 0 && (
                    <div className="absolute top-2 right-2">
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            {course.discount}% OFF
                        </span>
                    </div>
                )}
            </div>
            
            {/* Card Content */}
            <div className="p-4">
                {/* Course Title */}
                <Link to={'/course/' + course._id}>
                    <h3 className="text-lg font-medium text-gray-800 line-clamp-2 hover:text-blue-600 transition-colors mb-2">
                        {course.courseTitle}
                    </h3>
                </Link>
                
                {/* Educator info */}
                <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-5 h-5 rounded-full overflow-hidden">
                        <img 
                            src={course.educator?.imageUrl || 'https://via.placeholder.com/40'} 
                            alt={course.educator.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/40';
                            }}
                        />
                    </div>
                    <p className="text-xs text-gray-600">{course.educator.name}</p>
                </div>
                
                {/* Rating */}
                <div className="flex items-center mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <svg 
                            key={star}
                            className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`}
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    ))}
                    <span className="text-xs text-gray-500 ml-1">({course.courseRatings.length} reviews)</span>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                    {/* Price */}
                    <div>
                        {course.discount > 0 ? (
                            <div className="flex items-center">
                                <span className="text-blue-600 font-bold">{currency}{discountedPrice.toFixed(2)}</span>
                                <span className="ml-2 text-xs text-gray-400 line-through">{currency}{originalPrice.toFixed(2)}</span>
                            </div>
                        ) : (
                            <span className="text-blue-600 font-bold">{currency}{discountedPrice.toFixed(2)}</span>
                        )}
                    </div>
                    
                    {/* View Button */}
                    <Link 
                        to={'/course/' + course._id}
                        className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                    >
                        View
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default CourseCard;
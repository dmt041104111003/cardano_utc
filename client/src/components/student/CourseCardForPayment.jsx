import React, { useContext } from 'react';
import { FaStar, FaUser, FaHeart } from 'react-icons/fa';
import { AppContext } from '../../context/AppContext';
import moment from 'moment';


const CoursePayment = ({ course}) => {
    const { currency, calculateRating,calculateCourseDuration } = useContext(AppContext);

    if (!course) {
        return <div className="p-4 bg-gray-100 rounded-lg">Không có thông tin khóa học</div>;
    }

    return (
        <div className="flex items-start gap-4 py-4 border-b max-w-3xl">
            <img
                src={course.courseThumbnail || '/default-thumbnail.jpg'}
                alt={course.courseTitle || 'Khóa học'}
                className="w-20 h-20 rounded-lg object-cover"
            />

            <div className="flex-1">
                <h3 className="font-bold text-base">
                    {course.courseTitle || 'Tiêu đề khóa học'}
                </h3>

                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    {course.isBestseller && (
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
                            Bestseller
                        </span>
                    )}
                    <span className="font-semibold">{calculateCourseDuration(course) || 0} total hours</span>
                   
                    <span>• Updated {course.updatedAt ? moment(course.updatedAt).format('MM/YYYY') : 'N/A'}</span>
                </div>

                <div className="flex items-center gap-4 mt-2 text-sm">
                    <div className="flex items-center gap-1 text-yellow-500">
                        <span className="font-bold text-base">
                            {calculateRating(course).toFixed(1)}
                        </span>
                        <FaStar size={14} />
                    </div>
                    
                    <div className="font-bold text-lg text-gray-800">
                        {currency}{(course.coursePrice - (course.discount * course.coursePrice / 100)).toFixed(2)}
                    </div>
                </div>
            </div>

            <div className="text-purple-500">
                <FaHeart size={24} />
            </div>
        </div>
    );
};

export default CoursePayment;
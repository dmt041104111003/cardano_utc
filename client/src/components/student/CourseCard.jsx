/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useContext } from 'react';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
    // Kiểm tra dữ liệu khóa học
    if (!course || !course._id || !course.courseTitle || !course.educator || !course.courseRatings) {
        return <div className="text-center p-4 bg-gray-100 rounded-lg">Dữ liệu khóa học không đầy đủ.</div>;
    }

    const { currency, calculateRating } = useContext(AppContext);

    return (
        <Link
            to={`/course/${course._id}`}
            onClick={() => scrollTo(0, 0)}
            className="border border-gray-300 hover:shadow-lg transition-all duration-300 pb-5 overflow-hidden rounded-lg bg-white flex flex-col"
        >
            <div className="md:h-40 h-40 lg:h-40 w-full overflow-hidden rounded-t-xl">
                <img
                    src={course.courseThumbnail}
                    alt={course.courseTitle}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
            </div>

            <div className="p-4 text-left flex flex-col gap-2 flex-1">
                <h3 className="text-xl font-semibold text-gray-800 line-clamp-2">{course.courseTitle}</h3>
                <p className="text-sm text-gray-500">{course.educator.name}</p>
                <p className="text-xs text-gray-400">ID: {course._id}</p>

                {/* Đánh giá khóa học */}
                <div className="flex items-center space-x-2 mt-1">
                    {console.log(course)}
                    <p className="text-yellow-500 font-semibold text-sm">{calculateRating(course).toFixed(1)}</p>
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <img
                                key={i}
                                src={i < Math.floor(calculateRating(course)) ? assets.star : assets.star_blank}
                                alt="star"
                                className="w-4 h-4"
                            />
                        ))}
                    </div>
                    <p className="text-gray-400 text-sm">
                        ({course.courseRatings.length} {course.courseRatings.length < 2 ? 'Review' : 'Reviews'})
                    </p>
                </div>

                {/* Giá khóa học */}
                <p className="text-xl font-bold text-blue-600 mt-2">
                    {currency}{(course.coursePrice - course.discount * course.coursePrice / 100).toFixed(2)}
                </p>
            </div>
        </Link>
    );
}

export default CourseCard;

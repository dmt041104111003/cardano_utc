/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react';
import Loading from '../../components/student/Loading'
import { AppContext } from '../../context/AppContext'
import axios from 'axios';
import { toast } from 'react-toastify';

const MyCourses = () => {
    const { currency, backendUrl, isEducator, getToken } = useContext(AppContext)
    const [courses, setCourses] = useState(null)
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [showPublished, setShowPublished] = useState(false);
    const itemsPerPage = 5; // Show 5 courses per page

    const fetchEducatorCourses = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get(backendUrl + '/api/educator/courses',
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (data.success) {
                // Sort courses by creation date (latest last)
                const sortedCourses = [...data.courses].sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setCourses(sortedCourses);
                setFilteredCourses(sortedCourses);
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (isEducator) {
            fetchEducatorCourses()
        }
    }, [isEducator])

    useEffect(() => {
        if (courses) {
            let filtered = courses;

            // Filter by search query (course title or ID)
            filtered = filtered.filter(course =>
                course.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course._id.toLowerCase().includes(searchQuery.toLowerCase())
            );

            // // Filter by published status
            // if (showPublished) {
            //     filtered = filtered.filter(course => course.published);
            // }

            setFilteredCourses(filtered);
            setCurrentPage(1); // Reset to first page when filters change
        }
    }, [searchQuery, courses]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedCourses = filteredCourses.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return courses ? (
        <div className='min-h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>
            <div className='w-full'>
                <div className='flex justify-between items-center mb-4'>
                    <div className='flex items-center gap-4'>
                        <h2 className='text-lg font-medium mt-0'>My Courses</h2>
                        {/* <button
                            onClick={() => setShowPublished(!showPublished)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${showPublished 
                                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            {showPublished ? 'Show All' : 'Show Published'}
                        </button> */}
                    </div>
                    <input
                        type="text"
                        placeholder="Search by course name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
                    />
                </div>

                <div className='flex flex-col items-center max-w-4x1 w-full overflow-hidden rounded-md bg-white border border-gray-500/20'>
                    <table className='md:table-auto table-fixed w-full overflow-hidden'>
                        <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
                            <tr>
                                <th className="px-4 py-3 font-semibold truncate w-16 text-center">STT</th>
                                <th className="px-4 py-3 font-semibold truncate">Course</th>
                                <th className="px-4 py-3 font-semibold truncate">Course ID</th>
                                <th className="px-4 py-3 font-semibold truncate">Earnings</th>
                                <th className="px-4 py-3 font-semibold truncate">Students</th>
                                <th className="px-4 py-3 font-semibold truncate">Published On</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedCourses.map((course) => (
                                <tr key={course._id} className="border-b border-gray-500/20">
                                    <td className="px-4 py-3 text-center text-gray-500 text-sm">{startIndex + index + 1}</td>
                                    <td className="md:px-4 pl-2 md:p1-4 py-3 flex items-center space-x-3 truncate">
                                        <img src={course.courseThumbnail} alt="Course Image" className="w-16" />
                                        <span className="truncate hidden md:block">{course.courseTitle}</span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-sm">{course._id}</td>
                                    <td className="px-4 py-3">
                                        {currency} {Math.floor(course.enrolledStudents.length * 
                                            (course.coursePrice - course.discount * course.coursePrice / 100))}
                                    </td>
                                    <td className="px-4 py-3">{course.enrolledStudents.length}</td>
                                    <td className="px-4 py-3">
                                        {new Date(course.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 my-4 w-full border-t border-gray-500/20 pt-4">
                            {/* Previous button */}
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded-md text-sm ${
                                    currentPage === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                            >
                                Previous
                            </button>

                            {/* Page numbers */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(page => {
                                    // Always show first and last page
                                    if (page === 1 || page === totalPages) return true;
                                    // Show pages around current page
                                    return Math.abs(page - currentPage) <= 2;
                                })
                                .map((page, index, array) => {
                                    // Add ellipsis if there's a gap
                                    if (index > 0 && page - array[index - 1] > 1) {
                                        return (
                                            <React.Fragment key={`ellipsis-${page}`}>
                                                <span className="px-2 py-1">...</span>
                                                <button
                                                    onClick={() => handlePageChange(page)}
                                                    className={`px-3 py-1 rounded-md text-sm ${
                                                        currentPage === page
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-200 hover:bg-gray-300'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            </React.Fragment>
                                        );
                                    }
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`px-3 py-1 rounded-md text-sm ${
                                                currentPage === page
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 hover:bg-gray-300'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}

                            {/* Next button */}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1 rounded-md text-sm ${
                                    currentPage === totalPages
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    ) : <Loading />
}

export default MyCourses;
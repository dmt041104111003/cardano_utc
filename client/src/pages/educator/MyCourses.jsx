/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState, useRef } from 'react';
import Loading from '../../components/student/Loading'
import { AppContext } from '../../context/AppContext'
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExpandAlt, FaCompressAlt, FaCheck } from 'react-icons/fa';

const MyCourses = () => {
    const { currency, backendUrl, isEducator, getToken } = useContext(AppContext)
    const [courses, setCourses] = useState(null)
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [showPublished, setShowPublished] = useState(false);
    const itemsPerPage = 5; // Show 5 courses per page
    
    // State for terms and conditions modal
    const [showTermsModal, setShowTermsModal] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const modalRef = useRef(null);

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
    
    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                if (agreedToTerms) {
                    setShowTermsModal(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [agreedToTerms]);
    
    // Handle OK button click
    const handleOkClick = () => {
        if (agreedToTerms) {
            setShowTermsModal(false);
        } else {
            toast.error("Please agree to the terms and conditions");
        }
    };
    
    // Toggle expanded state
    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

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
            // setCurrentPage(1); // Reset to first page when filters change
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
        <div className='min-h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0 bg-gradient-to-b from-blue-50 to-white'>
            <div className='w-full max-w-7xl mx-auto'>
                <div className='mb-8'>
                    <h1 className='text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2'>
                        <div className='w-1.5 h-8 bg-blue-600 rounded-full mr-2'></div>
                        My Courses
                    </h1>
                    <p className='text-gray-600 ml-5'>Manage and track all your created courses</p>
                </div>
                
                <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200'>
                    <div className='flex items-center gap-4'>
                        <div className='flex items-center gap-2 text-blue-600'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className='font-medium'>Total: {courses.length} courses</span>
                        </div>
                        {/* <button
                            onClick={() => setShowPublished(!showPublished)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${showPublished 
                                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            {showPublished ? 'Show All' : 'Show Published'}
                        </button> */}
                    </div>
                    <div className='relative w-full md:w-80'>
                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by course name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm"
                        />
                    </div>
                </div>

                <div className='w-full overflow-hidden rounded-lg shadow-sm bg-white border border-gray-200'>
                    <div className='overflow-x-auto'>
                        <table className='min-w-full divide-y divide-gray-200'>
                            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 text-left">
                                <tr>
                                    <th className="px-4 py-3.5 text-sm font-semibold text-gray-700 w-16 text-center">#</th>
                                    <th className="px-4 py-3.5 text-sm font-semibold text-gray-700">Course</th>
                                    <th className="px-4 py-3.5 text-sm font-semibold text-gray-700">Course ID</th>
                                    <th className="px-4 py-3.5 text-sm font-semibold text-gray-700">Earnings</th>
                                    <th className="px-4 py-3.5 text-sm font-semibold text-gray-700">Students</th>
                                    <th className="px-4 py-3.5 text-sm font-semibold text-gray-700">Published On</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedCourses.map((course, index) => (
                                    <tr key={course._id} className="hover:bg-blue-50 transition-colors duration-150">
                                        <td className="px-4 py-4 text-center text-gray-500 text-sm font-medium">{startIndex + index + 1}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0 h-12 w-16 rounded-md overflow-hidden shadow-sm border border-gray-200">
                                                    <img src={course.courseThumbnail} alt="Course Image" className="h-full w-full object-cover" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                                        {course.courseTitle}
                                                        {course.isDeleted && (
                                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                                Stopped
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-xs text-gray-500 font-mono bg-gray-100 rounded px-2 py-1 break-all">
                                                {course._id}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm font-medium text-green-600">
                                                {currency} {Math.floor(course.enrolledStudents.length * 
                                                    (course.coursePrice - course.discount * course.coursePrice / 100))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {course.enrolledStudents.length} students
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {new Date(course.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 py-4 w-full border-t border-gray-200 bg-gray-50">
                            {/* Previous button */}
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                                    currentPage === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 shadow-sm'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Previous
                            </button>

                            {/* Page numbers */}
                            <div className="flex items-center">
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(page => {
                                        // Always show first and last page
                                        if (page === 1 || page === totalPages) return true;
                                        // Show pages around current page
                                        return Math.abs(page - currentPage) <= 1;
                                    })
                                    .map((page, index, array) => {
                                        // Add ellipsis if there's a gap
                                        if (index > 0 && page - array[index - 1] > 1) {
                                            return (
                                                <React.Fragment key={`ellipsis-${page}`}>
                                                    <span className="px-2 py-1 text-gray-500">...</span>
                                                    <button
                                                        onClick={() => handlePageChange(page)}
                                                        className={`flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-colors duration-200 ${
                                                            currentPage === page
                                                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm'
                                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
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
                                                className={`flex items-center justify-center w-8 h-8 mx-0.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                                                    currentPage === page
                                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm'
                                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}
                            </div>

                            {/* Next button */}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                                    currentPage === totalPages
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 shadow-sm'
                                }`}
                            >
                                Next
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    ) : <Loading />
}

export default MyCourses;
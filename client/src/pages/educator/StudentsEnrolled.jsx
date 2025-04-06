/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react';
import { dummyStudentEnrolled } from '../../assets/assets';
import Loading from '../../components/student/Loading';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const StudentsEnrolled = () => {
    const { backendUrl, getToken, isEducator } = useContext(AppContext)
    const [enrolledStudents, setEnrolledStudents] = useState(null)
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showCompleted, setShowCompleted] = useState(false);
    const itemsPerPage = 8; // Show 8 students per page

    const fetchEnrolledStudents = async (isFirstLoad = false) => {
        try {
            const token = await getToken()
            const { data } = await axios.get(backendUrl + '/api/educator/enrolled-students',
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (data.success) {
                const sortedStudents = data.enrolledStudents.reverse();
                setEnrolledStudents(sortedStudents);
                // Chỉ reset trang 1 và filter khi lần đầu load
                if (isFirstLoad) {
                    setFilteredStudents(sortedStudents);
                    setCurrentPage(1);
                }
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Handle visibility change to update students when tab becomes visible
    const handleVisibilityChange = () => {
        if (!document.hidden && isEducator) {
            fetchEnrolledStudents(false);
        }
    };

    useEffect(() => {
        if (!isEducator) return;

        // Initial fetch with isFirstLoad = true
        fetchEnrolledStudents(true);
        
        // Set up polling interval (every 2 seconds)
        const intervalId = setInterval(() => fetchEnrolledStudents(false), 2000);
        
        // Set up visibility change listener
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Cleanup
        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isEducator]);

    useEffect(() => {
        if (enrolledStudents) {
            let filtered = enrolledStudents;

            // Filter by search query (course title, course ID or student name)
            filtered = filtered.filter(student =>
                student.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.courseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.student.name.toLowerCase().includes(searchQuery.toLowerCase())
            );

            // // Filter by completion status
            // if (showCompleted) {
            //     filtered = filtered.filter(student => student.progress === 100);
            // }

            // Chỉ reset trang 1 khi có search query mới
            if (searchQuery) {
                setCurrentPage(1);
            }
            setFilteredStudents(filtered);
        }
    }, [searchQuery, enrolledStudents]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return enrolledStudents ? (
        <div className='min-h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>
            <div className='w-full'>
                <div className='flex justify-between items-center mb-4'>
                    <div className='flex items-center gap-4'>
                        <h2 className='text-lg font-medium mt-0'>Students Enrolled</h2>
                        {/* <button
                            onClick={() => setShowCompleted(!showCompleted)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${showCompleted 
                                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            {showCompleted ? 'Show All' : 'Show Completed'}
                        </button> */}
                    </div>
                    <input
                        type="text"
                        placeholder="Search by course name, ID or student name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
                    />
                </div>

                <div className='flex flex-col items-center max-w-4x1 w-full overflow-hidden rounded-md bg-white border border-gray-500/20'>
                    <table className='md:table-auto table-fixed w-full overflow-hidden'>
                        <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
                            <tr>
                                <th className="px-4 py-3 font-semibold truncate w-16">STT</th>
                                <th className="px-4 py-3 font-semibold truncate">Student Name</th>
                                <th className="px-4 py-3 font-semibold truncate">Course Title</th>
                                <th className="px-4 py-3 font-semibold truncate">Course ID</th>
                                <th className="px-4 py-3 font-semibold truncate">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedStudents.map((student, index) => (
                                <tr key={index} className="border-b border-gray-500/20">
                                    <td className="px-4 py-3 text-center text-gray-500 text-sm">{startIndex + index + 1}</td>
                                    <td className="px-4 py-3 flex items-center space-x-3">
                                        <img 
                                            src={student.student.imageUrl || dummyStudentEnrolled} 
                                            alt="Student" 
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                        <span>{student.student.name}</span>
                                    </td>
                                    <td className="px-4 py-3">{student.courseTitle}</td>
                                    <td className="px-4 py-3 text-gray-500 text-sm">{student.courseId}</td>
                                    <td className="px-4 py-3">
                                        {new Date(student.purchaseDate).toLocaleDateString()}
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

export default StudentsEnrolled;
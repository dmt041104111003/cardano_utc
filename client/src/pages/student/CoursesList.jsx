import React, { useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useSearchParams } from 'react-router-dom';
import CourseCard from '../../components/student/CourseCard';
import { assets } from '../../assets/assets';
import Footer from '../../components/student/Footer';
import axios from 'axios';
import { toast } from 'react-toastify';

const CoursesList = () => {
    const { navigate, backendUrl, getToken } = useContext(AppContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const [filteredCourses, setFilteredCourses] = React.useState([]);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [showPublishedOnly, setShowPublishedOnly] = React.useState(false);
    const [showNewest, setShowNewest] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const itemsPerPage = 8;

    // Get show newest from URL params
    const newestFromUrl = searchParams.get('newest') === 'true';

    const fetchLatestCourses = async (isFirstLoad = false) => {
        try {
            setLoading(true);
            const token = await getToken();
            const { data } = await axios.get(`${backendUrl}/api/course/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (data.success) {
                let tempCourses = data.courses;
                
                // Apply search filter
                if (searchQuery) {
                    tempCourses = tempCourses.filter(item => 
                        item.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.courseDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.educator?.name?.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                }

                // Filter and sort by newest if showNewest is true
                if (showNewest) {
                    const oneHourAgo = new Date();
                    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
                    
                    tempCourses = tempCourses.filter(course => 
                        new Date(course.createdAt) > oneHourAgo
                    ).sort((a, b) => 
                        new Date(b.createdAt) - new Date(a.createdAt)
                    );
                }

                // Chỉ reset trang 1 khi lần đầu load hoặc khi filter thay đổi
                if (isFirstLoad ) {
                    setCurrentPage(1);
                }
                setFilteredCourses(tempCourses);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            toast.error(error.message || 'Failed to fetch courses');
        } finally {
            setLoading(false);
        }
    };

    // Handle visibility change to update courses when tab becomes visible
    const handleVisibilityChange = () => {
        if (!document.hidden) {
            fetchLatestCourses(false);
        }
    };

    useEffect(() => {
        // Initial fetch with isFirstLoad = true
        fetchLatestCourses(true);
        
        // Set up polling interval (every 2 seconds)
        const intervalId = setInterval(() => fetchLatestCourses(false), 2000);
        
        // Set up visibility change listener
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Cleanup
        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [searchQuery, showNewest]);

    // Handle show newest toggle
    const toggleShowNewest = () => {
        const newParams = new URLSearchParams(searchParams);
        if (newestFromUrl) {
            newParams.delete('newest');
        } else {
            newParams.set('newest', 'true');
        }
        setSearchParams(newParams);
        setShowNewest(!newestFromUrl);
    };

    // Calculate pagination
    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedCourses = filteredCourses.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <div className='relative min-h-screen'>
                <div className='absolute top-0 left-0 w-full h-full bg-gradient-to-b from-green-100/70 via-cyan-100/50 to-white'></div>
                <div className='min-h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0 relative z-10'>
                    <div className='flex md:flex-row flex-col gap-6 items-start justify-start justify-between w-full'>
                        <div>
                            <h1 className='text-4xl font-semibold text-gray-800'>Course List</h1>
                            <p className='text-gray-500'>
                                <span onClick={() => navigate('/')} className='text-blue-600 cursor-pointer'>Home</span> /
                                <span>Course List</span>
                            </p>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search courses..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                    }}
                                    className="pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            {/* <button 
                                onClick={() => setShowPublishedOnly(!showPublishedOnly)}
                                className={`px-4 py-2 rounded-md ${
                                    showPublishedOnly ? 'bg-green-600' : 'bg-gray-600'
                                } text-white min-w-[150px]`}
                            >
                                {showPublishedOnly ? 'Published Only' : 'All Courses'}
                            </button> */}
                            <button 
                                onClick={toggleShowNewest}
                                className={`px-4 py-2 rounded-md ${
                                    newestFromUrl ? 'bg-blue-600' : 'bg-gray-600'
                                } text-white min-w-[150px]`}
                            >
                                {newestFromUrl ? 'Show All' : 'Show Newest'}
                            </button>
                        </div>
                    </div>

                    {/* Course count and current filters */}
                    <div className="mt-6 text-gray-600">
                        <p>Showing {paginatedCourses.length} of {filteredCourses.length} courses</p>
                        {(searchQuery || newestFromUrl) && (
                            <p className="text-sm mt-1">
                                Filters: {' '}
                                {searchQuery && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">Search: "{searchQuery}"</span>}
                                {/* {showPublishedOnly && <span className="bg-green-100 text-green-800 px-2 py-1 rounded mr-2">Published Only</span>} */}
                                {newestFromUrl && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Newest</span>}
                            </p>
                        )}
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-8 gap-3 px-2 md:p-0'>
                        {paginatedCourses.length > 0 ? (
                            paginatedCourses.map((course) => 
                                <CourseCard key={course._id} course={course} />
                            )
                        ) : (
                            <div className="col-span-full text-center py-8 text-gray-500">
                                No courses found matching your criteria
                            </div>
                        )}
                    </div>

                    {/* Enhanced Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-3 mt-6 mb-8">
                            {/* <button
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1}
                                className={`px-3 py-2 rounded-md ${
                                    currentPage === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                            >
                                First
                            </button> */}
                            <button
                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 rounded-md ${
                                    currentPage === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                            >
                                Previous
                            </button>
                            <div className="flex items-center gap-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(page => {
                                        if (totalPages <= 10) return true;
                                        if (page === 1 || page === totalPages) return true;
                                        if (page >= currentPage - 2 && page <= currentPage + 2) return true;
                                        return false;
                                    })
                                    .map((page, index, array) => (
                                        <React.Fragment key={page}>
                                            {index > 0 && array[index - 1] !== page - 1 && (
                                                <span className="text-gray-400">...</span>
                                            )}
                                            <button
                                                onClick={() => handlePageChange(page)}
                                                className={`px-4 py-2 rounded-md min-w-[40px] ${
                                                    currentPage === page
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-200 hover:bg-gray-300'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        </React.Fragment>
                                    ))}
                            </div>
                            <button
                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 rounded-md ${
                                    currentPage === totalPages
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                            >
                                Next
                            </button>
                            {/* <button
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-2 rounded-md ${
                                    currentPage === totalPages
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                            >
                                Last
                            </button> */}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}

export default CoursesList;
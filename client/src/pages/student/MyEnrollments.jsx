/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext'
import { Line } from 'rc-progress';
import Footer from '../../components/student/Footer';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';

const MyEnrollments = () => {
    const { 
        enrolledCourses, 
        calculateCourseDuration, 
        navigate,
        userData, 
        fetchUserEnrolledCourses, 
        backendUrl, 
        getToken, 
        calculateNoOfLectures,
        wallet,
        connected
    } = useContext(AppContext);
    const location = useLocation();

    const [progressArray, setProgressArray] = useState([])
    const [showNFTModal, setShowNFTModal] = useState(false)
    const [selectedNFT, setSelectedNFT] = useState(null)
    const [loading, setLoading] = useState(false)
    const [minting, setMinting] = useState({})
    const [loadingNFT, setLoadingNFT] = useState({});
    const [savingAddress, setSavingAddress] = useState({});
    const [loadingCertificate, setLoadingCertificate] = useState({});
    const [certificateStatus, setCertificateStatus] = useState({});
    const [sentToEducator, setSentToEducator] = useState(() => {
        // Load initial state từ localStorage
        const saved = localStorage.getItem('sentToEducator');
        return saved ? JSON.parse(saved) : {};
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [showCompleted, setShowCompleted] = useState(false);
    const [showCertified, setShowCertified] = useState(false);
    const itemsPerPage = 7;

    // Hàm update state và lưu vào localStorage 
    const updateSentToEducator = (courseId) => {
        const newState = { ...sentToEducator, [courseId]: true };
        setSentToEducator(newState);
        localStorage.setItem('sentToEducator', JSON.stringify(newState));
    };

    const getCourseProgress = async () => {
        try {
            const token = await getToken();
            const tempProgressArray = await Promise.all(
                enrolledCourses.map(async (course) => {
                    const { data } = await axios.post(`${backendUrl}/api/user/get-course-progress`,
                        { courseId: course._id }, { headers: { Authorization: `Bearer ${token}` } }
                    )
                    
                    // Get total lectures and tests
                    let totalLectures = 0;
                    let totalTests = 0;
                    
                    // Count lectures and tests from course content
                    course.courseContent?.forEach(chapter => {
                        if (chapter.chapterContent) {
                            totalLectures += chapter.chapterContent.length;
                        }
                    });
                    
                    // Count tests
                    if (course.tests) {
                        totalTests = course.tests.length;
                    }

                    // Get completed counts
                    const lectureCompleted = data.progressData ? data.progressData.lectureCompleted.length : 0;
                    const testsCompleted = data.progressData ? data.progressData.tests.filter(test => test.passed).length : 0;
                    
                    // Calculate total progress percentage
                    const totalItems = totalLectures + totalTests;
                    const completedItems = lectureCompleted + testsCompleted;
                    const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

                    return {
                        totalLectures,
                        totalTests,
                        lectureCompleted,
                        testsCompleted,
                        progressPercentage,
                        completed: data.progressData?.completed || false
                    }
                })
            )
            setProgressArray(tempProgressArray);
        } catch (error) {
            toast.error(error.message);
        }
    }

    const handleNFT = async (courseId) => {
        try {
            setLoadingNFT(prev => ({ ...prev, [courseId]: true }));
            const token = await getToken();
            const { data } = await axios.get(`${backendUrl}/api/nft/info/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (data.success) {
                setSelectedNFT({
                    policyId: data.policyId,
                    assetName: data.assetName,
                    courseTitle: data.courseTitle,
                    metadata: data.metadata,
                    mintTransaction: data.mintTransaction
                });
                setShowNFTModal(true);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message || "Failed to fetch NFT information");
        } finally {
            setLoadingNFT(prev => ({ ...prev, [courseId]: false }));
        }
    }

    const handleSaveAddress = async (courseId) => {
        try {
            setSavingAddress(prev => ({ ...prev, [courseId]: true }));
            if (!connected || !wallet) {
                toast.error("Please connect your wallet first!");
                return;
            }

            const addresses = await wallet.getUsedAddresses();
            if (!addresses || addresses.length === 0) {
                throw new Error("No wallet address found");
            }
            const userAddress = addresses[0];

            const token = await getToken();

            await axios.post(
                `${backendUrl}/api/address/save`,
                { 
                    walletAddress: userAddress,
                    userName: userData?.name,
                    courseId: courseId
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Lưu state vào localStorage
            updateSentToEducator(courseId);
            toast.success('Address saved and notification sent to educator!');
        } catch (error) {
            console.error('Error saving address:', error);
            toast.error(error.message);
        } finally {
            setSavingAddress(prev => ({ ...prev, [courseId]: false }));
        }
    };

    const checkCertificateStatus = async (courseId) => {
        try {
            setMinting(prev => ({...prev, [courseId]: true}));
            console.log('Checking certificate status for course:', courseId);

            const token = await getToken();
            const { data } = await axios.get(
                `${backendUrl}/api/notification/certificate-status?studentId=${userData._id}&courseId=${courseId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log('Certificate status response:', data);

            if (data.success) {
                const notification = data.notification;
                if (!notification) {
                    toast.info('Bạn chưa yêu cầu cấp certificate cho khóa học này');
                } else {
                    const walletAddress = notification.walletAddress;
                    const shortAddress = walletAddress ? 
                        `${walletAddress.slice(0,6)}...${walletAddress.slice(-4)}` : 
                        'chưa có';

                    if (notification.status === 'pending') {
                        toast.info(`Yêu cầu certificate đang chờ xét duyệt.`);
                    } 
                    else if (notification.status === 'completed') {
                        toast.success(`Certificate đã được cấp thành công vào ví ${shortAddress}!`);
                        setCertificateStatus(prev => ({ ...prev, [courseId]: 'completed' }));
                    }
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error checking certificate status:", error);
            toast.error('Có lỗi khi kiểm tra trạng thái');
        } finally {
            setMinting(prev => ({...prev, [courseId]: false}));
        }
    };

    const checkAllStatuses = async () => {
        try {
            const token = await getToken();
            
            // Check certificate statuses
            const certificatePromises = enrolledCourses.map(async (course) => {
                try {
                    const { data } = await axios.get(
                        `${backendUrl}/api/notification/certificate-status?studentId=${userData._id}&courseId=${course._id}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    if (data.success && data.notification?.status === 'completed') {
                        setCertificateStatus(prev => ({ ...prev, [course._id]: 'completed' }));
                    }
                } catch (error) {
                    console.error(`Error checking certificate status for course ${course._id}:`, error);
                }
            });

            // Check sent to educator statuses
            const addressPromises = enrolledCourses.map(async (course) => {
                try {
                    const { data } = await axios.get(
                        `${backendUrl}/api/address/find?courseId=${course._id}&userId=${userData._id}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    if (data.success && data.exists) {
                        updateSentToEducator(course._id);
                    }
                } catch (error) {
                    console.error(`Error checking address status for course ${course._id}:`, error);
                }
            });

            await Promise.all([...certificatePromises, ...addressPromises]);
        } catch (error) {
            console.error("Error checking statuses:", error);
        }
    };

    useEffect(() => {
        if (enrolledCourses.length > 0 && userData) {
            checkAllStatuses();
        }
    }, [enrolledCourses, userData]);

    // Add event listener for tab visibility change
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && enrolledCourses.length > 0 && userData) {
                checkAllStatuses();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [enrolledCourses, userData]);

    const handleCertificate = async (courseId) => {
        try {
            setLoadingCertificate(prev => ({ ...prev, [courseId]: true }));
            toast.info("Certificate download coming soon!");
            await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (error) {
            toast.error("Something went wrong!");
        } finally {
            setLoadingCertificate(prev => ({ ...prev, [courseId]: false }));
        }
    }
    

    useEffect(() => {
        if (enrolledCourses) {
            getCourseProgress();
            checkAllStatuses();
        }
    }, [enrolledCourses]);

    useEffect(() => {
        // Initial fetch with isFirstLoad = true
        fetchUserEnrolledCourses(true);
        
        // Set up polling interval (every 2 seconds)
        const intervalId = setInterval(() => fetchUserEnrolledCourses(false), 2000);
        
        // Set up visibility change listener
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Cleanup
        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Handle visibility change to update courses when tab becomes visible
    const handleVisibilityChange = () => {
        if (!document.hidden) {
            fetchUserEnrolledCourses(false);
        }
    };

    useEffect(() => {
        if (enrolledCourses) {
            let filtered = enrolledCourses;

            // Filter by search query (title or ID)
            if (searchQuery) {
                filtered = filtered.filter(course =>
                    course.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    course._id.toLowerCase().includes(searchQuery.toLowerCase())
                );
                // Reset to page 1 when search query changes
                // setCurrentPage(1);
            }

            // // Filter by completion status
            // if (showCompleted) {
            //     filtered = filtered.filter(course => progressArray.find(p => p.courseId === course._id)?.lectureCompleted === progressArray.find(p => p.courseId === course._id)?.totalLectures);
            //     // Reset trang 1 khi toggle filter
            //     setCurrentPage(1);
            // }

            // // Filter by certification status (Status Send Educator is Successful)
            // if (showCertified) {
            //     filtered = filtered.filter(course => sentToEducator[course._id] === true);
            //     // Reset trang 1 khi toggle filter
            //     setCurrentPage(1);
            // }

            setFilteredCourses(filtered);
        }
    }, [searchQuery, enrolledCourses, showCompleted, showCertified, progressArray, certificateStatus]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedCourses = filteredCourses.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const isCompleted = (index) => {
        if (!progressArray[index]) return false;
        return progressArray[index].completed;
    }

    return enrolledCourses ? (
        <div className='min-h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>
            <div className='w-full'>
                <div className='flex justify-between items-center mb-4'>
                    <div className='flex items-center gap-4'>
                        <h2 className='text-lg font-medium mt-0'>My Enrollments</h2>
                         
                    </div>
                    <input
                        type="text"
                        placeholder="Search by course name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                    />
                </div>

                <table className='md:table-auto table-fixed w-full overflow-hidden border mt-10'>
                    <thead className='text-gray-900 border-b border-gray-500/20 text-sm text-left max-sm:hidden'>
                        <tr>
                            <th className='px-4 py-3 font-semibold truncate w-16'>STT</th>
                            <th className='px-4 py-3 font-semibold truncate'>Course ID</th>
                            <th className='px-4 py-3 font-semibold truncate'>Course</th>
                           
                            {/* <th className='px-4 py-3 font-semibold truncate'>Duration</th>
                            <th className='px-4 py-3 font-semibold truncate'>Completed</th> */}
                            <th className='px-4 py-3 font-semibold truncate'>Status</th>
                            <th className='px-4 py-3 font-semibold truncate'>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedCourses.map((course, index) => (
                            <tr key={course._id} className='border-b border-gray-500/20'>
                                <td className='px-4 py-3 max-sm:hidden text-gray-500 text-sm text-center'>
                                    {startIndex + index + 1}
                                </td>
                                <td className='px-4 py-3 max-sm:hidden text-gray-500 text-sm'>
                                    {course._id}
                                </td>
                                <td className='md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3'>
                                    <img src={course.courseThumbnail} alt=""
                                        className='w-14 sm:w-24 md:x-28' />
                                    <div className='flex-1'>
                                        <p className='mb-1 max-sm:text-sm'>{course.courseTitle}</p>
                                        <Line strokeWidth={2} percent={progressArray[index]?.progressPercentage || 0} className='bg-gray-300 rounded-full' />
                                        <div className='text-xs text-gray-500 mt-1'>
                                            Lectures: {progressArray[index]?.lectureCompleted || 0}/{progressArray[index]?.totalLectures || 0},
                                            Tests: {progressArray[index]?.testsCompleted || 0}/{progressArray[index]?.totalTests || 0}
                                        </div>
                                    </div>
                                </td>
                                
                                {/* <td className='px-4 py-3 max-sm:hidden'>
                                    {calculateCourseDuration(course)}
                                </td>
                                <td className='px-4 py-3 max-sm:hidden'>
                                    {course.progress && `${course.progress.lectureCompleted} / ${course.progress.totalLectures}`}  <span>Lectures</span>
                                </td> */}
                                <td className='px-4 py-3 max-sm:text-right'>
                                    <button 
                                        className={`px-3 sm:px-5 py-1.5 sm:py-2 ${isCompleted(index) ? 'bg-green-600' : 'bg-blue-600'} max-sm:text-xs text-white rounded`} 
                                        onClick={() => navigate('/player/' + course._id)}
                                    >
                                        {isCompleted(index) ? 'Completed' : 'On Going'}
                                    </button>
                                </td>
                                <td className='px-4 py-3'>
                                    {isCompleted(index) && (
                                        <div className="flex gap-2">
                                            {connected && (
                                                <>
                                                    <button 
                                                        onClick={() => handleNFT(course._id)}
                                                        className="px-3 py-1.5 bg-purple-600 text-white rounded text-sm"
                                                        disabled={loadingNFT[course._id]}
                                                    >
                                                        {loadingNFT[course._id] ? 'Loading...' : 'NFT'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleSaveAddress(course._id)}
                                                        className={`px-3 py-1 rounded-md text-xs font-medium ${
                                                            savingAddress[course._id] || sentToEducator[course._id]
                                                                ? 'bg-gray-400'
                                                                : 'bg-orange-500 hover:bg-orange-600'
                                                        } text-white`}
                                                        disabled={savingAddress[course._id] || sentToEducator[course._id]}
                                                    >
                                                        {savingAddress[course._id] 
                                                            ? 'Loading...' 
                                                            : sentToEducator[course._id]
                                                                ? 'Sent'
                                                                : 'Send Educator'
                                                        }
                                                    </button>
                                                    <button
                                                        onClick={() => checkCertificateStatus(course._id)}
                                                        disabled={loading || minting[course._id] || !isCompleted(index)}
                                                        className={`px-3 py-1 rounded-md text-xs font-medium ${
                                                            loading || minting[course._id]
                                                                ? 'bg-gray-400'
                                                                : !isCompleted(index)
                                                                    ? 'bg-gray-400'
                                                                    : certificateStatus[course._id] === 'completed'
                                                                        ? 'bg-gray-400'
                                                                        : 'bg-orange-500 hover:bg-orange-600'
                                                        } text-white`}
                                                    >
                                                        {minting[course._id] 
                                                            ? 'Loading...' 
                                                            : certificateStatus[course._id] === 'completed'
                                                                ? 'Successful'
                                                                : 'Status Send Educator'
                                                        }
                                                    </button>
                                                </>
                                            )}
                                            <button 
                                                onClick={() => handleCertificate(course._id)}
                                                className="px-3 py-1.5 bg-yellow-600 text-white rounded text-sm"
                                                disabled={loadingCertificate[course._id]}
                                            >
                                                {loadingCertificate[course._id] ? 'Đang tải' : 'Certificate'}
                                            </button>
                                        </div>
                                    )}
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

            {/* NFT Information Modal */}
            {showNFTModal && selectedNFT && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">NFT Information</h2>
                            <button 
                                onClick={() => setShowNFTModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-600">Policy ID</label>
                                <p className="font-mono text-sm break-all bg-gray-50 p-2 rounded">{selectedNFT.policyId}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Asset Name</label>
                                <p className="font-mono text-sm break-all bg-gray-50 p-2 rounded">{selectedNFT.assetName}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Course Title</label>
                                <p className="text-sm bg-gray-50 p-2 rounded">{selectedNFT.courseTitle}</p>
                            </div>
                            {selectedNFT.mintTransaction && (
                                <div>
                                    <label className="text-sm text-gray-600">Mint Transaction</label>
                                    <div className="bg-gray-50 p-3 rounded space-y-2">
                                        <p className="text-sm">
                                            <span className="font-semibold">Transaction Hash:</span>
                                            <span className="font-mono ml-2 break-all">{selectedNFT.mintTransaction.txHash}</span>
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-semibold">Block:</span>
                                            <span className="font-mono ml-2">{selectedNFT.mintTransaction.block}</span>
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-semibold">Timestamp:</span>
                                            <span className="ml-2">{new Date(selectedNFT.mintTransaction.timestamp * 1000).toLocaleString()}</span>
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="text-sm text-gray-600">Metadata (CIP-721)</label>
                                <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto max-h-40 font-mono">
                                    {JSON.stringify(selectedNFT.metadata, null, 2)}
                                </pre>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <a 
                                href={`https://preprod.cardanoscan.io/token/${selectedNFT.policyId}${selectedNFT.assetName}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                View on Explorer
                            </a>
                            <button 
                                onClick={() => setShowNFTModal(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    ) : (
        <div className='flex justify-center items-center h-screen'>
            <h1 className='text-2xl font-bold'>No enrolled courses found!</h1>
        </div>
    );
}

export default MyEnrollments;

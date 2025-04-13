/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext'
import { Line } from 'rc-progress';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
    const [certificateData, setCertificateData] = useState({});
    const [loadingSimpleCert, setLoadingSimpleCert] = useState({});
    const [showCertModal, setShowCertModal] = useState(false);
    const [selectedCertData, setSelectedCertData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [showCompleted, setShowCompleted] = useState(false);
    const [showCertified, setShowCertified] = useState(false);
    const itemsPerPage = 7;

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
                        // updateSentToEducator(course._id);
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
            const token = await getToken();

            // First get certificate info to get policyId and transactionHash
            const { data: certData } = await axios.get(
                `${backendUrl}/api/certificate/${userData._id}/${courseId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log('Certificate data:', certData);

            if (!certData.success || !certData.certificate) {
                toast.error(certData.message || 'Certificate not found');
                return;
            }

            const certificate = certData.certificate;
            console.log('Certificate details:', certificate);

            try {
                // Get NFT info directly using policy ID and transaction hash
                const { data: nftData } = await axios.get(
                    `${backendUrl}/api/nft/info/by-policy/${certificate.policyId}/${certificate.transactionHash}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                console.log('NFT data:', nftData);

                if (nftData.success) {
                    setSelectedNFT({
                        policyId: nftData.policyId,
                        assetName: nftData.assetName,
                        courseTitle: nftData.courseTitle,
                        metadata: nftData.metadata,
                        mintTransaction: nftData.mintTransaction
                    });
                    setShowNFTModal(true);
                } else {
                    toast.error('Could not find certificate NFT information');
                }
            } catch (error) {
                console.error('Error:', error);
                toast.error(error.response?.data?.message || 'Error fetching NFT information');
            }
        } catch (error) {
            console.error('Error fetching certificate:', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to fetch certificate information');
        } finally {
            setLoadingCertificate(prev => ({ ...prev, [courseId]: false }));
        }
    }

    const handleViewCertificate2 = async (courseId) => {
        console.log('Starting handleViewCertificate2 with courseId:', courseId);
        try {
            setLoadingCertificate(prev => ({ ...prev, [courseId]: true }));
            const token = await getToken();

            // First get certificate info to get policyId and transactionHash
            const { data: certData } = await axios.get(
                `${backendUrl}/api/certificate/${userData._id}/${courseId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log('Certificate data:', certData);

            if (!certData.success || !certData.certificate) {
                toast.error(certData.message || 'Certificate not found');
                return;
            }

            const certificate = certData.certificate;
            console.log('Certificate details:', certificate);

            try {
                // Get NFT info directly using policy ID and transaction hash
                const { data: nftData } = await axios.get(
                    `${backendUrl}/api/nft/info/by-policy/${certificate.policyId}/${certificate.transactionHash}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                console.log('NFT data:', nftData);

                if (nftData.success) {
                    const qrData = {
                        policyId: nftData.policyId,
                        assetName: nftData.assetName,
                        courseTitle: nftData.courseTitle,
                        metadata: nftData.metadata,
                        mintTransaction: nftData.mintTransaction
                    };
                    console.log('QR data to be set:', qrData);
                    setSelectedNFTForQR(qrData);
                    setShowQRModal(true);
                } else {
                    toast.error(nftData.message || 'Failed to get NFT information');
                }
            } catch (error) {
                console.error('Error:', error);
                toast.error('Failed to get certificate information');
            } finally {
                setLoadingCertificate(prev => ({ ...prev, [courseId]: false }));
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to get certificate information');
        } finally {
            setLoadingCertificate(prev => ({ ...prev, [courseId]: false }));
        }
    };

    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedNFTForQR, setSelectedNFTForQR] = useState(null);

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

    const handleGetSimpleCertificate = async (courseId) => {
        try {
            setLoadingSimpleCert(prev => ({ ...prev, [courseId]: true }));
            const token = await getToken();
            const { data } = await axios.post(
                `${backendUrl}/api/user/get-simple-certificate`,
                { courseId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (data.success) {
                setSelectedCertData(data.progressData);
                setShowCertModal(true);
                // toast.success('Course progress data fetched successfully');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoadingSimpleCert(prev => ({ ...prev, [courseId]: false }));
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const isCompleted = (index) => {
        if (!progressArray[index]) return false;
        return progressArray[index].completed;
    }

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

    const handleViewCertificate = async (courseId) => {
        try {
            setLoadingCertificate(prev => ({ ...prev, [courseId]: true }));
            const token = await getToken();

            // First get certificate info to get policyId and transactionHash
            const { data: certData } = await axios.get(
                `${backendUrl}/api/certificate/${userData._id}/${courseId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log('Certificate data:', certData);

            if (!certData.success || !certData.certificate) {
                toast.error(certData.message || 'Certificate not found');
                return;
            }

            const certificate = certData.certificate;
            console.log('Certificate details:', certificate);

            try {
                // Get NFT info directly using policy ID and transaction hash
                const { data: nftData } = await axios.get(
                    `${backendUrl}/api/nft/info/by-policy/${certificate.policyId}/${certificate.transactionHash}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                console.log('NFT data:', nftData);

                if (nftData.success) {
                    setSelectedNFT({
                        policyId: nftData.policyId,
                        assetName: nftData.assetName,
                        courseTitle: nftData.courseTitle,
                        metadata: nftData.metadata,
                        mintTransaction: nftData.mintTransaction
                    });
                    setShowNFTModal(true);
                } else {
                    toast.error('Could not find certificate NFT information');
                }
            } catch (error) {
                console.error('Error:', error);
                toast.error(error.response?.data?.message || 'Error fetching NFT information');
            }
        } catch (error) {
            console.error('Error fetching certificate:', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to fetch certificate information');
        } finally {
            setLoadingCertificate(prev => ({ ...prev, [courseId]: false }));
        }
    }

    const handleDownloadCertPDF = (certData) => {
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        // Set up the PDF
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(30);
        pdf.setTextColor(44, 62, 80);

        // Add title
        pdf.text("Course Certificate", pdf.internal.pageSize.width/2, 40, { align: "center" });

        // Set font for content
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(16);
        pdf.setTextColor(52, 73, 94);

        // Add content
        const startY = 70;
        const lineHeight = 12;
        
        pdf.text(`Course: ${certData.courseInfo.title}`, 40, startY);
        pdf.text(`Course ID: ${certData.courseId}`, 40, startY + lineHeight);
        pdf.text(`Educator: ${certData.courseInfo.educatorName}`, 40, startY + lineHeight * 2);
        pdf.text(`Student Name: ${certData.studentInfo.name}`, 40, startY + lineHeight * 4);
        pdf.text(`Completion Date: ${new Date(certData.completedAt).toLocaleDateString()}`, 40, startY + lineHeight * 5);

        // Add decorative border
        pdf.setDrawColor(41, 128, 185);
        pdf.setLineWidth(1);
        pdf.rect(20, 20, pdf.internal.pageSize.width - 40, pdf.internal.pageSize.height - 40);

        // Save the PDF
        pdf.save(`${certData.courseInfo.title}-certificate.pdf`);
    };

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
                                    <div className="break-all max-w-[200px]">{course._id}</div>
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
                                        className={`px-3 sm:px-5 py-1.5 ${isCompleted(index) ? 'bg-green-600' : 'bg-blue-600'} max-sm:text-xs text-white rounded`} 
                                        onClick={() => navigate('/player/' + course._id)}
                                    >
                                        {isCompleted(index) ? 'Completed' : 'On Going'}
                                    </button>
                                </td>
                                <td className='px-4 py-3'>
                                    {isCompleted(index) && (
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={() => handleGetSimpleCertificate(course._id)}
                                                disabled={loadingSimpleCert[course._id]}
                                                className="px-3 py-1 text-sm bg-gradient-to-r from-green-500 to-green-600 text-white rounded hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500"
                                            >
                                                {loadingSimpleCert[course._id] ? 'Loading...' : 'View Course Progress'}
                                            </button>
                                            {certificateData[course._id] && (
                                                <div className="mt-4 p-4 bg-gray-50 rounded shadow">
                                                    <h3 className="text-lg font-semibold mb-2">Certificate Information</h3>
                                                    <div className="space-y-2">
                                                        <p><span className="font-medium">Course:</span> {certificateData[course._id].courseInfo.title}</p>
                                                        <p><span className="font-medium">Student:</span> {certificateData[course._id].studentInfo.name}</p>
                                                        <p><span className="font-medium">Completed:</span> {new Date(certificateData[course._id].completedAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {connected && (
                                                <>
                                                    <button 
                                                        onClick={() => handleNFT(course._id)}
                                                        disabled={minting[course._id]}
                                                        className="px-3 py-1 text-sm bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded hover:from-purple-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500"
                                                    >
                                                        {minting[course._id] ? 'Minting...' : 'NFT'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleSaveAddress(course._id)}
                                                        disabled={savingAddress[course._id]}
                                                        className="px-3 py-1 text-sm bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500"
                                                    >
                                                        {savingAddress[course._id]
                                                            ? 'Saving...'
                                                            : certificateStatus[course._id]?.addressSaved
                                                                ? 'Educator Notified'
                                                                : 'Send Educator'
                                                        }
                                                    </button>
                                                    <button 
                                                        onClick={() => handleCertificate(course._id)}
                                                        className="px-3 py-1 text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded hover:from-amber-600 hover:to-amber-700"
                                                    >
                                                        {loadingCertificate[course._id] ? 'Loading...' : 'View Certificate'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewCertificate2(course._id)}
                                                        disabled={loadingCertificate[course._id]}
                                                        className="px-3 py-1 text-sm bg-gradient-to-r from-orange-600 to-red-600 text-white rounded hover:from-orange-700 hover:to-red-700"
                                                    >
                                                        {loadingCertificate[course._id] ? 'Loading...' : 'Info Download Certificate NFT'}
                                                    </button>
                                                </>
                                            )}
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

            {/* QR Code Modal */}
            {showQRModal && selectedNFTForQR && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-hidden">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl">NFT Information</h2>
                            <button 
                                onClick={() => {
                                    setShowQRModal(false);
                                    setSelectedNFTForQR(null);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-gray-600 mb-2">Policy ID</h3>
                                <div className="bg-gray-50 p-4 rounded">
                                    {selectedNFTForQR.policyId}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-gray-600 mb-2">Asset Name</h3>
                                <div className="bg-gray-50 p-4 rounded">
                                    {selectedNFTForQR.assetName}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-gray-600 mb-2">Course Title</h3>
                                <div className="bg-gray-50 p-4 rounded">
                                    {selectedNFTForQR.courseTitle}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-gray-600 mb-2">Mint Transaction</h3>
                                <div className="bg-gray-50 p-4 rounded">
                                    <div className="mb-2">
                                        <span className="font-bold">Transaction Hash: </span>{selectedNFTForQR.mintTransaction.txHash}
                                    </div>
                                    <div className="mb-2">
                                        <span className="font-bold">Block: </span>{selectedNFTForQR.mintTransaction.block}
                                    </div>
                                    <div>
                                        <span className="font-bold">Timestamp: </span>{new Date(selectedNFTForQR.mintTransaction.timestamp * 1000).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-gray-600 mb-2">QR Code</h3> 
                                <div className="bg-gray-50 p-4 rounded flex flex-col items-center">
                                    <div className="border border-gray-200 p-2">
                                        <QRCodeSVG
                                            value={`https://transaction-sand.vercel.app/verify?policyId=${selectedNFTForQR.policyId}&txHash=${selectedNFTForQR.mintTransaction.txHash}`}
                                            size={200}
                                            level="H"
                                            includeMargin={true}
                                        />
                                    </div>
                                    <p className="mt-4 text-sm text-gray-600">Scan to verify certificate</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-gray-600 mb-2">Direct Info QR Code</h3>
                                <div className="bg-gray-50 p-4 rounded flex flex-col items-center">
                                    <div className="border border-gray-200 p-2">
                                        <QRCodeSVG
                                            value={JSON.stringify({
                                                policyId: selectedNFTForQR.policyId,
                                                txHash: selectedNFTForQR.mintTransaction.txHash
                                            })}
                                            size={200}
                                            level="H"
                                            includeMargin={true}
                                        />
                                    </div>
                                    <p className="mt-4 text-sm text-gray-600">Scan for blockchain info</p>
                                    <button
                                        onClick={() => {
                                            const certificateData = {
                                                courseTitle: selectedNFTForQR.courseTitle,
                                                policyId: selectedNFTForQR.policyId,
                                                assetName: selectedNFTForQR.assetName,
                                                txHash: selectedNFTForQR.mintTransaction.txHash,
                                                timestamp: selectedNFTForQR.mintTransaction.timestamp * 1000, // Convert to milliseconds
                                                block: selectedNFTForQR.mintTransaction.block,
                                                metadata: selectedNFTForQR.metadata
                                            };

                                            const pdf = new jsPDF('p', 'mm', 'a4');
                                            
                                            // Add title
                                            pdf.setFontSize(20);
                                            pdf.text('Certificate Information', pdf.internal.pageSize.width/2, 20, { align: 'center' });
                                            
                                            // Add content
                                            pdf.setFontSize(12);
                                            pdf.text(`Course Title: ${certificateData.courseTitle}`, 20, 40);
                                            
                                            // Split long text into multiple lines
                                            const policyIdText = `Policy ID: ${certificateData.policyId}`;
                                            const txHashText = `Transaction Hash: ${certificateData.txHash}`;
                                            const splitPolicyId = pdf.splitTextToSize(policyIdText, 170);
                                            const splitTxHash = pdf.splitTextToSize(txHashText, 170);
                                            
                                            pdf.text(splitPolicyId, 20, 50);
                                            pdf.text(`Asset Name: ${certificateData.assetName}`, 20, 60);
                                            pdf.text(splitTxHash, 20, 70);
                                            pdf.text(`Block Height: ${certificateData.block}`, 20, 80);
                                            pdf.text(`Timestamp: ${new Date(certificateData.timestamp).toLocaleString()}`, 20, 90);
                                            
                                            // Add metadata
                                            pdf.text('NFT Metadata:', 20, 110);
                                            const metadataText = JSON.stringify(certificateData.metadata, null, 2);
                                            const splitMetadata = pdf.splitTextToSize(metadataText, 170);
                                            pdf.setFontSize(10);
                                            pdf.text(splitMetadata, 20, 120);
                                            
                                            // Calculate metadata height and ensure enough space for QR codes
                                            const metadataHeight = splitMetadata.length * 5; // 5mm per line
                                            const qrCodeSize = 50; // Smaller QR codes
                                            const qrStartY = 220; // Move QR codes further down
                                            
                                            // Add both QR Codes side by side
                                            Promise.all([
                                                html2canvas(document.querySelector('.border.border-gray-200.p-2')),
                                                html2canvas(document.querySelectorAll('.border.border-gray-200.p-2')[1])
                                            ]).then(([canvas1, canvas2]) => {
                                                const imgData1 = canvas1.toDataURL('image/png');
                                                const imgData2 = canvas2.toDataURL('image/png');
                                                
                                                // Add a page break if needed
                                                if (qrStartY + qrCodeSize + 10 > pdf.internal.pageSize.height) {
                                                    pdf.addPage();
                                                    qrStartY = 20; // Start at top of new page
                                                }
                                                
                                                // First QR code on the left
                                                pdf.addImage(imgData1, 'PNG', 40, qrStartY, qrCodeSize, qrCodeSize);
                                                pdf.setFontSize(10);
                                                pdf.text('Verification QR Code', 65, qrStartY + qrCodeSize + 5, { align: 'center' });
                                                
                                                // Second QR code on the right
                                                pdf.addImage(imgData2, 'PNG', 120, qrStartY, qrCodeSize, qrCodeSize);
                                                pdf.text('Blockchain Info QR Code', 145, qrStartY + qrCodeSize + 5, { align: 'center' });
                                                
                                                // Save the PDF
                                                pdf.save(`${certificateData.courseTitle}-certificate.pdf`);
                                            });
                                        }}
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                        Download Certificate
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-gray-600 mb-2">Metadata (CIP-721)</h3>
                                <div className="bg-gray-50 p-4 rounded">
                                    <pre className="font-mono text-sm whitespace-pre">
{JSON.stringify(selectedNFTForQR.metadata, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <a 
                                href={`https://preprod.cardanoscan.io/token/${selectedNFTForQR.policyId}${selectedNFTForQR.assetName}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                View on Explorer
                            </a>
                            <button 
                                onClick={() => {
                                    setShowQRModal(false);
                                    setSelectedNFTForQR(null);
                                }}
                                className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
   
            {showCertModal && selectedCertData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Course Progress Details</h2>
                            <button 
                                onClick={() => setShowCertModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="space-y-6">
                            {/* Download Button */}
                            <div className="flex justify-end">
                                <button
                                    onClick={() => handleDownloadCertPDF(selectedCertData)}
                                    className="px-3 py-1 text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded hover:from-blue-600 hover:to-blue-700 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download Certificate
                                </button>
                            </div>

                            {/* Course Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">Course Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <p><span className="font-medium">Title:</span> {selectedCertData.courseInfo.title}</p>
                                    <p><span className="font-medium">Educator:</span> {selectedCertData.courseInfo.educatorName}</p>
                                    <p><span className="font-medium">Course ID:</span> {selectedCertData.courseId}</p>
                                </div>
                            </div>

                            {/* Student Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">Student Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <p><span className="font-medium">Name:</span> {selectedCertData.studentInfo.name}</p>
                                    <p><span className="font-medium">User ID:</span> {selectedCertData.userId}</p>
                                </div>
                            </div>

                            {/* Progress Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">Progress Information</h3>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Completion Status:</span> {selectedCertData.completed ? 'Completed' : 'In Progress'}</p>
                                    <p><span className="font-medium">Completed At:</span> {new Date(selectedCertData.completedAt).toLocaleDateString()}</p>
                                    <p><span className="font-medium">Lectures Completed:</span> {selectedCertData.lectureCompleted?.length || 0}</p>
                                    <div className="mt-2">
                                        <p className="font-medium mb-1">Completed Lectures:</p>
                                        <ul className="list-disc pl-5">
                                            {selectedCertData.lectureCompleted?.map((lecture, idx) => (
                                                <li key={idx}>{lecture}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Test Results */}
                            {selectedCertData.tests && selectedCertData.tests.length > 0 && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-2">Test Results</h3>
                                    <div className="space-y-4">
                                        {selectedCertData.tests.map((test, index) => (
                                            <div key={index} className="border-b pb-4">
                                                <p><span className="font-medium">Test {index + 1}:</span></p>
                                                <div className="ml-4 space-y-1">
                                                    <p><span className="font-medium">Status:</span> {test.passed ? 'Passed' : 'Not Passed'}</p>
                                                    {test.score !== undefined && (
                                                        <p><span className="font-medium">Score:</span> {test.score}</p>
                                                    )}
                                                    {test.answers && (
                                                        <div>
                                                            <p className="font-medium">Answers:</p>
                                                            <pre className="bg-gray-100 p-2 rounded mt-1 text-sm">
                                                                {JSON.stringify(test.answers, null, 2)}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
   
        </div>
    ) : (
        <div className='flex justify-center items-center h-screen'>
            <h1 className='text-2xl font-bold'>No enrolled courses found!</h1>
        </div>
    );
}

export default MyEnrollments;

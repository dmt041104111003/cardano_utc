/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext'
import { Line } from 'rc-progress';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useLocation, useSearchParams } from 'react-router-dom';
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
    const [searchParams] = useSearchParams();

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
    const [purchaseHistory, setPurchaseHistory] = useState([]);
    const [loadingPurchase, setLoadingPurchase] = useState(false);
    const [showPurchaseHistory, setShowPurchaseHistory] = useState(false);
    const [sentToEducator, setSentToEducator] = useState({});

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
                    hexName: data.assetName,
                    assetName: data.readableAssetName,
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
            setSentToEducator(prev => ({ ...prev, [courseId]: true }));
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
                    toast.info('You have not requested a certificate for this course');
                } else {
                    const walletAddress = notification.walletAddress;
                    const shortAddress = walletAddress ? 
                        `${walletAddress.slice(0,6)}...${walletAddress.slice(-4)}` : 
                        'not available';

                    if (notification.status === 'pending') {
                        toast.info(`Certificate request is pending approval.`);
                    } 
                    else if (notification.status === 'completed') {
                        toast.success(`Certificate has been successfully issued to wallet ${shortAddress}!`);
                        setCertificateStatus(prev => ({ ...prev, [courseId]: 'completed' }));
                    }
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error checking certificate status:", error);
            toast.error('Error checking status');
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
                    
                    if (data.success) {
                        // Nếu đã mint xong
                        if (data.notification?.status === 'completed') {
                            setCertificateStatus(prev => ({ ...prev, [course._id]: 'completed' }));
                            // Nếu đã mint xong thì cũng đã gửi yêu cầu rồi
                            setSentToEducator(prev => ({ ...prev, [course._id]: true }));
                        }
                        // Nếu có thông báo nhưng chưa mint xong, vẫn đánh dấu là đã gửi yêu cầu
                        else if (data.notification) {
                            setSentToEducator(prev => ({ ...prev, [course._id]: true }));
                        }
                    }
                } catch (error) {
                    console.error(`Error checking certificate status for course ${course._id}:`, error);
                }
            });

            // Check sent to educator statuses thông qua bảng Address
            const addressPromises = enrolledCourses.map(async (course) => {
                try {
                    // Sử dụng API mới để kiểm tra xem học viên đã gửi yêu cầu chưa
                    const { data } = await axios.get(
                        `${backendUrl}/api/address/check?courseId=${course._id}&userId=${userData._id}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    if (data.success && data.exists) {
                        console.log(`Address exists for course ${course._id}`);
                        // Nếu đã lưu địa chỉ, đánh dấu là đã gửi yêu cầu
                        setSentToEducator(prev => ({ ...prev, [course._id]: true }));
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
                        hexName: nftData.assetName,
                        assetName: nftData.readableAssetName,
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
                        hexName: nftData.assetName,
                        assetName: nftData.readableAssetName,
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
    const [showRawMetadata, setShowRawMetadata] = useState(false);

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
        if (showPurchaseHistory) {
            // Lọc purchaseHistory khi ở tab Purchase History
            let filtered = purchaseHistory;
            if (searchQuery) {
                filtered = filtered.filter(item => {
                    // Nếu courseId là object, tìm theo courseTitle hoặc _id
                    if (item.courseId && typeof item.courseId === 'object') {
                        return (
                            (item.courseId.courseTitle && item.courseId.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (item.courseId._id && item.courseId._id.toLowerCase().includes(searchQuery.toLowerCase()))
                        );
                    }
                    // Nếu courseId là string
                    return item.courseId && item.courseId.toLowerCase().includes(searchQuery.toLowerCase());
                });
            }
            setFilteredCourses(filtered);
        } else if (enrolledCourses) {
            // Lọc enrolledCourses như cũ
            let filtered = enrolledCourses;
            if (searchQuery) {
                filtered = filtered.filter(course =>
                    course.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    course._id.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }
            setFilteredCourses(filtered);
        }
    }, [searchQuery, enrolledCourses, showCompleted, showCertified, progressArray, certificateStatus, showPurchaseHistory, purchaseHistory]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedFilteredCourses = filteredCourses.slice(startIndex, startIndex + itemsPerPage);

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
                        hexName: nftData.assetName,
                        assetName: nftData.readableAssetName,
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
        // Tạo PDF với cấu hình hỗ trợ Unicode
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });
        
        // Lấy kích thước trang
        const width = pdf.internal.pageSize.width;
        const height = pdf.internal.pageSize.height;
        const centerX = width / 2;
        
        // Thêm background màu gradient
        const gradient = function(x, y, w, h, color1, color2) {
            for (let i = 0; i <= h; i += 1) {
                const ratio = i / h;
                const r = color1.r * (1 - ratio) + color2.r * ratio;
                const g = color1.g * (1 - ratio) + color2.g * ratio;
                const b = color1.b * (1 - ratio) + color2.b * ratio;
                pdf.setFillColor(r, g, b);
                pdf.rect(x, y + i, w, 1, 'F');
            }
        };
        
        // Màu gradient nhẹ cho background
        gradient(0, 0, width, height, 
            {r: 255, g: 255, b: 255}, // Trắng ở trên
            {r: 240, g: 248, b: 255}  // Xanh nhạt ở dưới
        );
        
        // Vẽ viền trang trí
        pdf.setDrawColor(41, 128, 185); // Màu xanh
        pdf.setLineWidth(2);
        pdf.roundedRect(15, 15, width - 30, height - 30, 5, 5, 'S');
        
        // Vẽ họa tiết trang trí góc
        pdf.setDrawColor(41, 128, 185);
        pdf.setLineWidth(1.5);
        // Góc trên bên trái
        pdf.line(15, 25, 35, 25);
        pdf.line(25, 15, 25, 35);
        // Góc trên bên phải
        pdf.line(width - 15, 25, width - 35, 25);
        pdf.line(width - 25, 15, width - 25, 35);
        // Góc dưới bên trái
        pdf.line(15, height - 25, 35, height - 25);
        pdf.line(25, height - 15, 25, height - 35);
        // Góc dưới bên phải
        pdf.line(width - 15, height - 25, width - 35, height - 25);
        pdf.line(width - 25, height - 15, width - 25, height - 35);
        
        // Tiêu đề chính
        pdf.setFont(undefined, "bold");
        pdf.setFontSize(36);
        pdf.setTextColor(41, 128, 185); // Màu xanh
        pdf.text("CERTIFICATE", centerX, 50, { align: "center" });
        
        pdf.setFontSize(22);
        pdf.setTextColor(70, 70, 70); // Màu xám đậm
        pdf.text("OF ACHIEVEMENT", centerX, 65, { align: "center" });
        
        // Đường kẻ ngang dưới tiêu đề
        pdf.setDrawColor(41, 128, 185);
        pdf.setLineWidth(1);
        pdf.line(centerX - 50, 70, centerX + 50, 70);
        
        // Thông tin chứng chỉ
        pdf.setFont(undefined, "normal");
        pdf.setFontSize(14);
        pdf.setTextColor(70, 70, 70);
        
        pdf.text("This is to certify that", centerX, 90, { align: "center" });
        
        // Tên học viên
        pdf.setFont(undefined, "bold");
        pdf.setFontSize(24);
        pdf.setTextColor(41, 128, 185);
        pdf.text(certData.studentInfo.name, centerX, 105, { align: "center" });
        
        // Thông tin khóa học
        pdf.setFont(undefined, "normal");
        pdf.setFontSize(14);
        pdf.setTextColor(70, 70, 70);
        pdf.text("has successfully completed the course", centerX, 120, { align: "center" });
        
        // Tên khóa học
        pdf.setFont(undefined, "bold");
        pdf.setFontSize(20);
        pdf.setTextColor(41, 128, 185);
        pdf.text(certData.courseInfo.title, centerX, 135, { align: "center" });
        
        // Thông tin giáo viên
        pdf.setFont(undefined, "normal");
        pdf.setFontSize(14);
        pdf.setTextColor(70, 70, 70);
        pdf.text(`Instructor: ${certData.courseInfo.educatorName}`, centerX, 150, { align: "center" });
        
        // Ngày hoàn thành
        pdf.text(`Completion Date: ${new Date(certData.completedAt).toLocaleDateString()}`, centerX, 165, { align: "center" });
        
        // Thông tin blockchain
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Course ID: ${certData.courseId}`, centerX, 180, { align: "center" });
        pdf.text("Verified on Cardano Blockchain", centerX, 185, { align: "center" });
        
        // Thêm chữ ký và con dấu
        pdf.setDrawColor(41, 128, 185);
        pdf.setLineWidth(0.5);
        pdf.line(centerX - 50, height - 50, centerX + 50, height - 50);
        pdf.setFont(undefined, "normal");
        pdf.setFontSize(12);
        pdf.text("Authorized Signature", centerX, height - 40, { align: "center" });
        
        // Save the PDF
        pdf.save(`${certData.courseInfo.title}-certificate.pdf`);
    };

    // Hàm fetch lịch sử mua khoá học
    const fetchPurchaseHistory = async () => {
        setLoadingPurchase(true);
        try {
            const token = await getToken();
            // Sửa endpoint đúng với backend
            const { data } = await axios.get(`${backendUrl}/api/user/purchase/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success && data.purchases) {
                setPurchaseHistory(data.purchases);
            } else {
                setPurchaseHistory([]);
            }
        } catch (error) {
            setPurchaseHistory([]);
        } finally {
            setLoadingPurchase(false);
        }
    };

    // Gọi fetch khi mở tab lịch sử
    useEffect(() => {
        if (showPurchaseHistory && purchaseHistory.length === 0) {
            fetchPurchaseHistory();
        }
    }, [showPurchaseHistory]);

    useEffect(() => {
        const status = searchParams.get('status');
        const message = searchParams.get('message');

        if (status && message) {
            if (status === 'success') {
                toast.success(message);
            } else if (status === 'error') {
                toast.error(message);
            } else if (status === 'cancelled') {
                toast.info(message);
            }
        }
    }, [searchParams]);

    return enrolledCourses ? (
        <div className='min-h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0 bg-gradient-to-b from-green-100/70 via-cyan-100/50 to-white'>
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

                <div className="flex gap-4 mt-6">
                    <button
                        className={`px-4 py-2 rounded ${!showPurchaseHistory ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                        onClick={() => setShowPurchaseHistory(false)}
                    >
                        My Enrollments
                    </button>
                    <button
                        className={`px-4 py-2 rounded ${showPurchaseHistory ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                        onClick={() => setShowPurchaseHistory(true)}
                    >
                        Purchase History
                    </button>
                </div>

                {/* Nếu là purchase history thì chỉ hiển thị bảng giao dịch, ẩn phần enrollments */}
                {showPurchaseHistory ? (
                    <div className="mt-8">
                        <h2 className="text-xl font-bold mb-4">Purchase History</h2>
                        {loadingPurchase ? (
                            <div>Loading...</div>
                        ) : purchaseHistory.length === 0 ? (
                            <div>No purchase history found.</div>
                        ) : (
                            <>
                                <table className="w-full border rounded-lg overflow-hidden">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Course ID</th>
                                            <th className="px-4 py-2 text-left">Amount</th>
                                            <th className="px-4 py-2 text-left">Status</th>
                                            <th className="px-4 py-2 text-left">Currency</th>
                                            <th className="px-4 py-2 text-left">Payment Method</th>
                                            <th className="px-4 py-2 text-left">Note</th>
                                            <th className="px-4 py-2 text-left">Created At</th>
                                            <th className="px-4 py-2 text-left">Updated At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedFilteredCourses.map((item) => (
                                            <tr key={item._id} className="border-b">
                                                <td className="px-4 py-2">
                                                    {item.courseId && typeof item.courseId === 'object'
                                                        ? `${item.courseId.courseTitle || ''} (${item.courseId._id})`
                                                        : item.courseId}
                                                </td>
                                                <td className="px-4 py-2">{item.amount}</td>
                                                <td className="px-4 py-2 capitalize">{item.status}</td>
                                                <td className="px-4 py-2">{item.currency}</td>
                                                <td className="px-4 py-2">{item.paymentMethod}</td>
                                                <td className="px-4 py-2">{item.note}</td>
                                                <td className="px-4 py-2">{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</td>
                                                <td className="px-4 py-2">{item.updatedAt ? new Date(item.updatedAt).toLocaleString() : ''}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {totalPages > 1 && (
                                    <div className="flex justify-center gap-2 my-4 w-full border-t border-gray-500/20 pt-4">
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
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(page => {
                                                if (page === 1 || page === totalPages) return true;
                                                return Math.abs(page - currentPage) <= 2;
                                            })
                                            .map((page, index, array) => {
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
                            </>
                        )}
                    </div>
                ) : (
                    <>
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
                                {paginatedFilteredCourses.map((course, index) => (
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
                                            {/* NFT chỉ hiển thị nếu là khóa onchain (course.txHash tồn tại) và đã kết nối ví. Các nút khác giữ nguyên. */}
                                            <div className="flex gap-2 mt-2">
                                                {connected && course.txHash && (
                                                    <button
                                                        onClick={() => handleNFT(course._id)}
                                                        disabled={loadingNFT[course._id]}
                                                        className="px-3 py-1 text-sm bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded hover:from-purple-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500"
                                                    >
                                                        {loadingNFT[course._id] ? 'Loading...' : 'NFT'}
                                                    </button>
                                                )}
                                                {/* Send Educator chỉ hiển thị khi onchain, completed, chưa mint */}
                                                {course.txHash && isCompleted(index) && certificateStatus[course._id] !== 'completed' && (
                                                    <button
                                                        onClick={() => handleSaveAddress(course._id)}
                                                        disabled={savingAddress[course._id] || sentToEducator[course._id]}
                                                        className="px-3 py-1 text-sm bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500"
                                                    >
                                                        {sentToEducator[course._id]
                                                            ? 'Sent, waiting for mint...'
                                                            : savingAddress[course._id]
                                                                ? 'Saving...'
                                                                : 'Send Educator'}
                                                    </button>
                                                )}
                                                {/* Khi đã mint thì hiển thị Minted (disabled) */}
                                                {course.txHash && isCompleted(index) && certificateStatus[course._id] === 'completed' && (
                                                    <button
                                                        disabled
                                                        className="px-3 py-1 text-sm bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded opacity-60 cursor-not-allowed"
                                                    >
                                                        Minted
                                                    </button>
                                                )}
                                                {/* View Certificate và Info Download Certificate NFT chỉ hiển thị khi đã mint */}
                                                {certificateStatus[course._id] === 'completed' && (
                                                    <>
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
                                                {/* Onchain completed: luôn hiển thị View Course Progress */}
                                                {course.txHash && isCompleted(index) && (
                                                    <button
                                                        onClick={() => handleGetSimpleCertificate(course._id)}
                                                        disabled={loadingSimpleCert[course._id]}
                                                        className="px-3 py-1 text-sm bg-gradient-to-r from-green-500 to-green-600 text-white rounded hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500"
                                                    >
                                                        {loadingSimpleCert[course._id] ? 'Loading...' : 'View Course Progress'}
                                                    </button>
                                                )}
                                                {/* Offchain đã hoàn thành: chỉ hiển thị View Course Progress */}
                                                {!course.txHash && isCompleted(index) && (
                                                    <button
                                                        onClick={() => handleGetSimpleCertificate(course._id)}
                                                        disabled={loadingSimpleCert[course._id]}
                                                        className="px-3 py-1 text-sm bg-gradient-to-r from-green-500 to-green-600 text-white rounded hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500"
                                                    >
                                                        {loadingSimpleCert[course._id] ? 'Loading...' : 'View Course Progress'}
                                                    </button>
                                                )}
                                            </div>
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
                    </>
                )}
            </div>

            {/* NFT Information Modal */}
            {showNFTModal && selectedNFT && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl">NFT Information</h2>
                            <button 
                                onClick={() => setShowNFTModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto pr-2 custom-scrollbar">
                            <div>
                                <label className="text-sm text-gray-600">Policy ID</label>
                                <p className="font-mono text-sm break-all bg-gray-50 p-2 rounded">{selectedNFT.policyId}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Hex Name</label>
                                <p className="font-mono text-sm break-all bg-gray-50 p-2 rounded">{selectedNFT.hexName}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Asset Name (Readable)</label>
                                <p className="font-mono text-sm break-all bg-gray-50 p-2 rounded">{selectedNFT.assetName || 'Loading...'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Course Title</label>
                                <p className="text-sm bg-gray-50 p-2 rounded">{selectedNFT.courseTitle}</p>
                            </div>
                            
                            {selectedNFT.metadata && selectedNFT.metadata['721'] && (
                                <div className="mt-4">
                                    <label className="text-sm text-gray-600 font-medium">Metadata Fields</label>
                                    <div className="space-y-3 mt-2">
                                        {Object.keys(selectedNFT.metadata['721']).filter(key => key !== 'version').map(policyId => {
                                            const assetData = selectedNFT.metadata['721'][policyId];
                                            const assetKeys = Object.keys(assetData);
                                            
                                            return assetKeys.map(assetKey => {
                                                const assetInfo = assetData[assetKey];
                                                
                                                return Object.entries(assetInfo).map(([key, value]) => {
                                                    // Bỏ qua các trường là object phức tạp hoặc các trường cần ẩn
                                                    if (typeof value === 'object' && value !== null || 
                                                        key === 'image' || 
                                                        key === 'student_id' || 
                                                        key === 'educator_id') {
                                                        return null;
                                                    }
                                                    
                                                    return (
                                                        <div key={key} className="bg-gray-50 p-2 rounded">
                                                            <div className="text-sm font-medium text-gray-700">{key}</div>
                                                            <div className="text-sm break-all">{value.toString()}</div>
                                                        </div>
                                                    );
                                                });
                                            });
                                        })}
                                    </div>
                                    
                                    <div className="mt-3">
                                        <button 
                                            onClick={() => setShowRawMetadata(!showRawMetadata)}
                                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                                        >
                                            {showRawMetadata ? 'Hide metadata' : 'View metadata'}
                                        </button>
                                        {showRawMetadata && (
                                            <pre className="mt-2 font-mono text-xs whitespace-pre-wrap overflow-x-auto bg-gray-100 p-2 rounded text-left max-h-40 overflow-y-auto">
                                                {JSON.stringify(selectedNFT.metadata, null, 2)}
                                            </pre>
                                        )}
                                    </div>
                                </div>
                            )}
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

                        </div>
                        <div className="mt-6 flex justify-end gap-2 pt-4 border-t">
                            <a 
                                href={`https://preprod.cardanoscan.io/token/${selectedNFT.policyId}${selectedNFT.hexName}`}
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
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
                        <div className="space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto pr-2 custom-scrollbar">
                            <div>
                                <h3 className="text-gray-600 mb-2">Policy ID</h3>
                                <div className="bg-gray-50 p-4 rounded">
                                    {selectedNFTForQR.policyId}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-gray-600 mb-2">Hex Name</h3>
                                <div className="bg-gray-50 p-4 rounded">
                                    {selectedNFTForQR.hexName}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-gray-600 mb-2">Asset Name (Readable)</h3>
                                <div className="bg-gray-50 p-4 rounded">
                                    {selectedNFTForQR.assetName}
                                </div>
                            </div>

                            {selectedNFTForQR.metadata && selectedNFTForQR.metadata['721'] && (
                                <div className="mt-4">
                                    <h3 className="text-gray-600 mb-2">Metadata Fields</h3>
                                    <div className="space-y-3">
                                        {Object.keys(selectedNFTForQR.metadata['721']).filter(key => key !== 'version').map(policyId => {
                                            const assetData = selectedNFTForQR.metadata['721'][policyId];
                                            const assetKeys = Object.keys(assetData);
                                            
                                            return assetKeys.map(assetKey => {
                                                const assetInfo = assetData[assetKey];
                                                
                                                return Object.entries(assetInfo).map(([key, value]) => {
                                                    // Bỏ qua các trường là object phức tạp hoặc các trường cần ẩn
                                                    if (typeof value === 'object' && value !== null || 
                                                        key === 'image' || 
                                                        key === 'student_id' || 
                                                        key === 'educator_id') {
                                                        return null;
                                                    }
                                                    
                                                    return (
                                                        <div key={key} className="bg-gray-50 p-3 rounded mb-2">
                                                            <div className="font-medium text-gray-700">{key}</div>
                                                            <div className="text-sm break-all">{value.toString()}</div>
                                                        </div>
                                                    );
                                                });
                                            });
                                        })}
                                    </div>
                                </div>
                            )}

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
                                            value={`https://transaction-b3.vercel.app/verify?policyId=${selectedNFTForQR.policyId}&txHash=${selectedNFTForQR.mintTransaction.txHash}`}
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
                                                hexName: selectedNFTForQR.hexName,
                                                assetName: selectedNFTForQR.assetName,
                                                txHash: selectedNFTForQR.mintTransaction.txHash,
                                                timestamp: selectedNFTForQR.mintTransaction.timestamp * 1000, // Convert to milliseconds
                                                block: selectedNFTForQR.mintTransaction.block,
                                                metadata: selectedNFTForQR.metadata
                                            };

                                            // Tạo PDF với cấu hình hỗ trợ Unicode
                                            const pdf = new jsPDF({
                                                orientation: 'p',
                                                unit: 'mm',
                                                format: 'a4'
                                            });
                                            
                                            // Lấy kích thước trang
                                            const width = pdf.internal.pageSize.width;
                                            const height = pdf.internal.pageSize.height;
                                            const centerX = width / 2;
                                            
                                            // Thêm background màu gradient
                                            const gradient = function(x, y, w, h, color1, color2) {
                                                for (let i = 0; i <= h; i += 1) {
                                                    const ratio = i / h;
                                                    const r = color1.r * (1 - ratio) + color2.r * ratio;
                                                    const g = color1.g * (1 - ratio) + color2.g * ratio;
                                                    const b = color1.b * (1 - ratio) + color2.b * ratio;
                                                    pdf.setFillColor(r, g, b);
                                                    pdf.rect(x, y + i, w, 1, 'F');
                                                }
                                            };
                                            
                                            // Màu gradient nhẹ cho background
                                            gradient(0, 0, width, height, 
                                                {r: 255, g: 255, b: 255}, // Trắng ở trên
                                                {r: 240, g: 248, b: 255}  // Xanh nhạt ở dưới
                                            );
                                            
                                            // Vẽ viền trang trí
                                            pdf.setDrawColor(41, 128, 185); // Màu xanh
                                            pdf.setLineWidth(1.5);
                                            pdf.roundedRect(15, 15, width - 30, height - 30, 5, 5, 'S');
                                            
                                            // Vẽ họa tiết trang trí góc
                                            pdf.setDrawColor(41, 128, 185);
                                            pdf.setLineWidth(1);
                                            // Góc trên bên trái
                                            pdf.line(15, 25, 35, 25);
                                            pdf.line(25, 15, 25, 35);
                                            // Góc trên bên phải
                                            pdf.line(width - 15, 25, width - 35, 25);
                                            pdf.line(width - 25, 15, width - 25, 35);
                                            // Góc dưới bên trái
                                            pdf.line(15, height - 25, 35, height - 25);
                                            pdf.line(25, height - 15, 25, height - 35);
                                            // Góc dưới bên phải
                                            pdf.line(width - 15, height - 25, width - 35, height - 25);
                                            pdf.line(width - 25, height - 15, width - 25, height - 35);
                                            
                                            // Tiêu đề chính
                                            pdf.setFont(undefined, "bold");
                                            pdf.setFontSize(24);
                                            pdf.setTextColor(41, 128, 185); // Màu xanh
                                            pdf.text("BLOCKCHAIN CERTIFICATE", centerX, 35, { align: "center" });
                                            
                                            // Đường kẻ ngang dưới tiêu đề
                                            pdf.setDrawColor(41, 128, 185);
                                            pdf.setLineWidth(0.5);
                                            pdf.line(centerX - 60, 40, centerX + 60, 40);
                                            
                                            // Tên khóa học
                                            pdf.setFont(undefined, "bold");
                                            pdf.setFontSize(18);
                                            pdf.setTextColor(70, 70, 70);
                                            pdf.text(certificateData.courseTitle, centerX, 50, { align: "center" });
                                            
                                            // Thông tin chính
                                            pdf.setFont(undefined, "bold");
                                            pdf.setFontSize(12);
                                            pdf.setTextColor(41, 128, 185);
                                            pdf.text('Policy ID:', 25, 65);
                                            pdf.text('Transaction Hash:', 25, 75);
                                            
                                            // Giá trị
                                            pdf.setFont(undefined, "normal");
                                            pdf.setFontSize(10);
                                            pdf.setTextColor(70, 70, 70);
                                            
                                            // Split long text into multiple lines
                                            const policyIdValue = pdf.splitTextToSize(certificateData.policyId, 140);
                                            const txHashValue = pdf.splitTextToSize(certificateData.txHash, 140);
                                            pdf.text(policyIdValue, 65, 65);
                                            pdf.text(txHashValue, 65, 75);
                                            
                                            // Tiêu đề phần metadata
                                            let yPos = 90;
                                            pdf.setDrawColor(41, 128, 185);
                                            pdf.setLineWidth(0.5);
                                            pdf.line(25, yPos, width - 25, yPos);
                                            
                                            pdf.setFont(undefined, "bold");
                                            pdf.setFontSize(16);
                                            pdf.setTextColor(41, 128, 185);
                                            pdf.text('CERTIFICATE METADATA', centerX, yPos + 7, { align: 'center' });
                                            yPos += 15;
                                            
                                            // Extract and display metadata fields
                                            if (certificateData.metadata && certificateData.metadata['721']) {
                                                const metadataFields = [];
                                                
                                                Object.keys(certificateData.metadata['721']).filter(key => key !== 'version').forEach(policyId => {
                                                    const assetData = certificateData.metadata['721'][policyId];
                                                    Object.keys(assetData).forEach(assetKey => {
                                                        const assetInfo = assetData[assetKey];
                                                        
                                                        Object.entries(assetInfo).forEach(([key, value]) => {
                                                            // Skip complex objects and hidden fields
                                                            if (typeof value === 'object' && value !== null || 
                                                                key === 'image' || 
                                                                key === 'student_id' || 
                                                                key === 'educator_id') {
                                                                return;
                                                            }
                                                            
                                                            metadataFields.push({ key, value: value.toString() });
                                                        });
                                                    });
                                                });
                                                
                                                // Vẽ background cho metadata
                                                pdf.setFillColor(248, 250, 252); // Màu xám nhạt
                                                pdf.roundedRect(25, yPos, width - 50, Math.min(metadataFields.length * 12 + 10, 100), 3, 3, 'F');
                                                
                                                // Hiển thị các trường metadata
                                                yPos += 8;
                                                pdf.setFontSize(11);
                                                
                                                // Tạo bảng 2 cột nếu có nhiều trường
                                                const useColumns = metadataFields.length > 4;
                                                const colWidth = useColumns ? (width - 60) / 2 : width - 60;
                                                let col2YPos = yPos;
                                                
                                                metadataFields.forEach((field, index) => {
                                                    // Xác định vị trí hiển thị (cột 1 hoặc cột 2)
                                                    let currentX = 30;
                                                    let currentYPos = yPos;
                                                    
                                                    if (useColumns && index >= Math.ceil(metadataFields.length / 2)) {
                                                        currentX = 30 + colWidth + 10;
                                                        currentYPos = col2YPos;
                                                        col2YPos += 12;
                                                    } else {
                                                        yPos += 12;
                                                    }
                                                    
                                                    // Tên trường
                                                    pdf.setFont(undefined, "bold");
                                                    pdf.setTextColor(70, 70, 70);
                                                    pdf.text(`${field.key}:`, currentX, currentYPos);
                                                    
                                                    // Giá trị
                                                    pdf.setFont(undefined, "normal");
                                                    pdf.setTextColor(100, 100, 100);
                                                    
                                                    const valueLines = pdf.splitTextToSize(field.value, colWidth - 40);
                                                    pdf.text(valueLines, currentX + 35, currentYPos);
                                                    
                                                    // Tăng vị trí y nếu có nhiều dòng
                                                    if (valueLines.length > 1 && !useColumns) {
                                                        yPos += (valueLines.length - 1) * 5;
                                                    }
                                                });
                                                
                                                // Cập nhật vị trí y cho phần tiếp theo
                                                yPos = Math.max(yPos, col2YPos) + 10;
                                            }
                                            
                                            // Tiêu đề phần QR code
                                            pdf.setDrawColor(41, 128, 185);
                                            pdf.setLineWidth(0.5);
                                            pdf.line(25, yPos, width - 25, yPos);
                                            
                                            pdf.setFont(undefined, "bold");
                                            pdf.setFontSize(16);
                                            pdf.setTextColor(41, 128, 185);
                                            pdf.text('BLOCKCHAIN VERIFICATION', centerX, yPos + 7, { align: 'center' });
                                            
                                            // Thêm hướng dẫn quét QR
                                            pdf.setFont(undefined, "normal");
                                            pdf.setFontSize(10);
                                            pdf.setTextColor(70, 70, 70);
                                            pdf.text('Scan these QR codes to verify the authenticity of this certificate on the Cardano blockchain', 
                                                   centerX, yPos + 15, { align: 'center' });
                                            
                                            // Kích thước và vị trí QR code
                                            const qrCodeSize = 40; // Kích thước QR code
                                            const qrStartY = yPos + 25; // Vị trí bắt đầu sau metadata
                                            
                                            // Thêm cả hai QR Code cạnh nhau
                                            Promise.all([
                                                html2canvas(document.querySelector('.border.border-gray-200.p-2')),
                                                html2canvas(document.querySelectorAll('.border.border-gray-200.p-2')[1])
                                            ]).then(([canvas1, canvas2]) => {
                                                const imgData1 = canvas1.toDataURL('image/png');
                                                const imgData2 = canvas2.toDataURL('image/png');
                                                
                                                // Thêm trang mới nếu cần
                                                if (qrStartY + qrCodeSize + 20 > pdf.internal.pageSize.height) {
                                                    pdf.addPage();
                                                    // Thêm background gradient cho trang mới
                                                    gradient(0, 0, width, height, 
                                                        {r: 255, g: 255, b: 255}, // Trắng ở trên
                                                        {r: 240, g: 248, b: 255}  // Xanh nhạt ở dưới
                                                    );
                                                    // Thêm viền trang trí
                                                    pdf.setDrawColor(41, 128, 185);
                                                    pdf.setLineWidth(1.5);
                                                    pdf.roundedRect(15, 15, width - 30, height - 30, 5, 5, 'S');
                                                }
                                                
                                                // Tạo background cho QR code
                                                const leftQRX = width / 2 - qrCodeSize - 20;
                                                const rightQRX = width / 2 + 20;
                                                
                                                // Background cho QR code bên trái
                                                pdf.setFillColor(248, 250, 252);
                                                pdf.roundedRect(leftQRX - 5, qrStartY - 5, qrCodeSize + 10, qrCodeSize + 30, 3, 3, 'F');
                                                
                                                // Background cho QR code bên phải
                                                pdf.setFillColor(248, 250, 252);
                                                pdf.roundedRect(rightQRX - 5, qrStartY - 5, qrCodeSize + 10, qrCodeSize + 30, 3, 3, 'F');
                                                
                                                // Viền cho QR code bên trái
                                                pdf.setDrawColor(41, 128, 185);
                                                pdf.setLineWidth(0.5);
                                                pdf.roundedRect(leftQRX - 5, qrStartY - 5, qrCodeSize + 10, qrCodeSize + 30, 3, 3, 'S');
                                                
                                                // Viền cho QR code bên phải
                                                pdf.roundedRect(rightQRX - 5, qrStartY - 5, qrCodeSize + 10, qrCodeSize + 30, 3, 3, 'S');
                                                
                                                // QR code bên trái
                                                pdf.addImage(imgData1, 'PNG', leftQRX, qrStartY, qrCodeSize, qrCodeSize);
                                                pdf.setFont(undefined, "bold");
                                                pdf.setFontSize(10);
                                                pdf.setTextColor(41, 128, 185);
                                                pdf.text('VERIFICATION', leftQRX + qrCodeSize/2, qrStartY + qrCodeSize + 8, { align: 'center' });
                                                pdf.setFont(undefined, "normal");
                                                pdf.setFontSize(8);
                                                pdf.setTextColor(100, 100, 100);
                                                pdf.text('Scan to verify certificate', leftQRX + qrCodeSize/2, qrStartY + qrCodeSize + 15, { align: 'center' });
                                                
                                                // QR code bên phải
                                                pdf.addImage(imgData2, 'PNG', rightQRX, qrStartY, qrCodeSize, qrCodeSize);
                                                pdf.setFont(undefined, "bold");
                                                pdf.setFontSize(10);
                                                pdf.setTextColor(41, 128, 185);
                                                pdf.text('BLOCKCHAIN INFO', rightQRX + qrCodeSize/2, qrStartY + qrCodeSize + 8, { align: 'center' });
                                                pdf.setFont(undefined, "normal");
                                                pdf.setFontSize(8);
                                                pdf.setTextColor(100, 100, 100);
                                                pdf.text('Scan for transaction details', rightQRX + qrCodeSize/2, qrStartY + qrCodeSize + 15, { align: 'center' });
                                                
                                                // Thêm chữ ký và ngày cấp
                                                const signatureY = qrStartY + qrCodeSize + 35;
                                                if (signatureY + 30 < height - 20) { // Kiểm tra còn đủ chỗ
                                                    pdf.setDrawColor(41, 128, 185);
                                                    pdf.setLineWidth(0.5);
                                                    pdf.line(centerX - 40, signatureY, centerX + 40, signatureY);
                                                    pdf.setFont(undefined, "normal");
                                                    pdf.setFontSize(10);
                                                    pdf.setTextColor(70, 70, 70);
                                                    pdf.text('Authorized Signature', centerX, signatureY + 5, { align: 'center' });
                                                    
                                                    // Ngày cấp chứng chỉ
                                                    const issueDate = new Date(certificateData.timestamp).toLocaleDateString();
                                                    pdf.text(`Issue Date: ${issueDate}`, centerX, signatureY + 15, { align: 'center' });
                                                }
                                                
                                                // Thêm footer
                                                pdf.setFont(undefined, "italic");
                                                pdf.setFontSize(8);
                                                pdf.setTextColor(150, 150, 150);
                                                pdf.text('This certificate is stored on the Cardano blockchain and cannot be altered or falsified.', 
                                                       centerX, height - 20, { align: 'center' });
                                                
                                                // Lưu PDF
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


                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <a 
                                href={`https://preprod.cardanoscan.io/token/${selectedNFTForQR.policyId}${selectedNFTForQR.hexName}`}
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

<style jsx>{`
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #555;
    }
`}</style>

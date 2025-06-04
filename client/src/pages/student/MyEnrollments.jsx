import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext'
import { Line } from 'rc-progress';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useLocation, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';

const MyEnrollments = () => {
    const { 
        enrolledCourses, 
        navigate,
        userData, 
        fetchUserEnrolledCourses, 
        backendUrl, 
        getToken, 
        wallet,
        connected
    } = useContext(AppContext);
    const [searchParams] = useSearchParams();

    const [progressArray, setProgressArray] = useState([])
    const [showNFTModal, setShowNFTModal] = useState(false)
    const [selectedNFT, setSelectedNFT] = useState(null)
    const [minting, setMinting] = useState({})
    const [loadingNFT, setLoadingNFT] = useState({});
    const [savingAddress, setSavingAddress] = useState({});
    const [loadingCertificate, setLoadingCertificate] = useState({});
    const [certificateStatus, setCertificateStatus] = useState({});
    const [loadingSimpleCert, setLoadingSimpleCert] = useState({});
    const [showCertModal, setShowCertModal] = useState(false);
    const [selectedCertData, setSelectedCertData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [showCompleted, setShowCompleted] = useState(false);
    const [showCertified, setShowCertified] = useState(false);
    const [updatingProgress, setUpdatingProgress] = useState({});
    const [resetCourses, setResetCourses] = useState({}); 
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
                    try {
                        const { data } = await axios.post(`${backendUrl}/api/user/get-course-progress`,
                            { courseId: course._id }, { headers: { Authorization: `Bearer ${token}` } }
                        );
                        
                        let totalLectures = 0;
                        let totalTests = 0;
                        
                        course.courseContent?.forEach(chapter => {
                            if (chapter.chapterContent) {
                                totalLectures += chapter.chapterContent.length;
                            }
                        });

                        if (course.tests) {
                            totalTests = course.tests.length;
                        }

                        const lectureCompleted = data.progressData ? data.progressData.lectureCompleted.length : 0;
                        const testsCompleted = data.progressData ? data.progressData.tests.filter(test => test.passed).length : 0;

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
                        };
                    } catch (error) {
                        console.error(`Error getting progress for course ${course._id}:`, error);
                        return {
                            totalLectures: 0,
                            totalTests: 0,
                            lectureCompleted: 0,
                            testsCompleted: 0,
                            progressPercentage: 0,
                            completed: false
                        };
                    }
                })
            );
            setProgressArray(tempProgressArray);
        } catch (error) {
            console.error("Error in getCourseProgress:", error);
            toast.error("Failed to get course progress");
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

            const verifyResponse = await axios.get(
                `${backendUrl}/api/purchase/verify-purchase-address/${courseId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log('Debug - Verify purchase response:', verifyResponse.data);

            if (verifyResponse.data.success && 
                verifyResponse.data.hasPurchaseAddress && 
                verifyResponse.data.requireAddressCheck) {
                
                if (userAddress !== verifyResponse.data.purchaseAddress) {
                    throw new Error(
                        "The wallet address you are using is different from the one used to purchase this course. " +
                        "Please connect the wallet that was used to purchase the course."
                    );
                }
                
                console.log('Debug - Wallet address verified successfully');
            } else {
                console.log('Debug - No wallet address verification required');
            }

            let txHash = '';
            try {
                const profileResponse = await axios.get(
                    `${backendUrl}/api/profile/user/current`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                console.log('Profile response:', profileResponse.data);
                
                if (profileResponse.data && profileResponse.data.success && profileResponse.data.profile) {
                    txHash = profileResponse.data.profile.txHash || '';
                    console.log('Got txHash from profile:', txHash);
                }
            } catch (profileError) {
                console.error('Error fetching profile:', profileError);
            }
            
            await axios.post(
                `${backendUrl}/api/address/save`,
                { 
                    walletAddress: userAddress,
                    userName: userData?.name,
                    courseId: courseId,
                    txHash: txHash 
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success('Address saved and notification sent to educator!');
            setSentToEducator(prev => ({ ...prev, [courseId]: true }));
        } catch (error) {
            console.error('Error saving address:', error);
            toast.error(error.response?.data?.message || error.message);
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
            
            const certificatePromises = enrolledCourses.map(async (course) => {
                try {
                    const { data } = await axios.get(
                        `${backendUrl}/api/notification/certificate-status?studentId=${userData._id}&courseId=${course._id}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    
                    if (data.success) {
                        if (data.notification?.status === 'completed') {
                            setCertificateStatus(prev => ({ ...prev, [course._id]: 'completed' }));
                            setSentToEducator(prev => ({ ...prev, [course._id]: true }));
                        }
                        else if (data.notification) {
                            setSentToEducator(prev => ({ ...prev, [course._id]: true }));
                        }
                    }
                } catch (error) {
                    console.error(`Error checking certificate status for course ${course._id}:`, error);
                }
            });

            const addressPromises = enrolledCourses.map(async (course) => {
                try {
                    const { data } = await axios.get(
                        `${backendUrl}/api/address/check?courseId=${course._id}&userId=${userData._id}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    if (data.success && data.exists) {
                        setSentToEducator(prev => ({ ...prev, [course._id]: true }));
                    }
                } catch (error) {
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

    const handleViewCertificate2 = async (courseId) => {
        console.log('Starting handleViewCertificate2 with courseId:', courseId);
        try {
            setLoadingCertificate(prev => ({ ...prev, [courseId]: true }));
            const token = await getToken();
    
            await checkCertificateStatus(courseId);
            
            const { data: certData } = await axios.get(
                `${backendUrl}/api/certificate/${userData._id}/${courseId}?timestamp=${new Date().getTime()}`,
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
                const { data: nftData } = await axios.get(
                    `${backendUrl}/api/nft/info/by-policy/${encodeURIComponent(certificate.policyId)}/${encodeURIComponent(certificate.transactionHash)}?timestamp=${new Date().getTime()}`,
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
        }
    }, [enrolledCourses]);

    useEffect(() => {
        fetchUserEnrolledCourses(true);
        
        const intervalId = setInterval(() => fetchUserEnrolledCourses(false), 2000);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

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
                `${backendUrl}/api/user/get-simple-certificate?timestamp=${new Date().getTime()}`,
                { courseId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (data.success) {
                setSelectedCertData(data.progressData);
                setShowCertModal(true);
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
            let filtered = purchaseHistory;
            if (searchQuery) {
                filtered = filtered.filter(item => {
                    if (item.courseId && typeof item.courseId === 'object') {
                        return (
                            (item.courseId.courseTitle && item.courseId.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (item.courseId._id && item.courseId._id.toLowerCase().includes(searchQuery.toLowerCase()))
                        );
                    }
                    return item.courseId && item.courseId.toLowerCase().includes(searchQuery.toLowerCase());
                });
            }
            setFilteredCourses(filtered);
        } else if (enrolledCourses) {
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

    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedFilteredCourses = filteredCourses.slice(startIndex, startIndex + itemsPerPage);


    const handleDownloadCertPDF = (certData) => {
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });
        
        const width = pdf.internal.pageSize.width;
        const height = pdf.internal.pageSize.height;
        const centerX = width / 2;
        
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
        
        gradient(0, 0, width, height, 
            {r: 255, g: 255, b: 255}, 
            {r: 240, g: 248, b: 255} 
        );
        
        pdf.setDrawColor(41, 128, 185);
        pdf.setLineWidth(2);
        pdf.roundedRect(15, 15, width - 30, height - 30, 5, 5, 'S');
        
        pdf.setDrawColor(41, 128, 185);
        pdf.setLineWidth(1.5);
        pdf.line(15, 25, 35, 25);
        pdf.line(25, 15, 25, 35);
        pdf.line(width - 15, 25, width - 35, 25);
        pdf.line(width - 25, 15, width - 25, 35);
        pdf.line(15, height - 25, 35, height - 25);
        pdf.line(25, height - 15, 25, height - 35);
        pdf.line(width - 15, height - 25, width - 35, height - 25);
        pdf.line(width - 25, height - 15, width - 25, height - 35);
        pdf.setFont(undefined, "bold");
        pdf.setFontSize(36);
        pdf.setTextColor(41, 128, 185);
        pdf.text("CERTIFICATE", centerX, 50, { align: "center" });
        
        pdf.setFontSize(22);
        pdf.setTextColor(70, 70, 70);
        pdf.text("OF ACHIEVEMENT", centerX, 65, { align: "center" });
        
        pdf.setDrawColor(41, 128, 185);
        pdf.setLineWidth(1);
        pdf.line(centerX - 50, 70, centerX + 50, 70);
        
        pdf.setFont(undefined, "normal");
        pdf.setFontSize(14);
        pdf.setTextColor(70, 70, 70);
        
        pdf.text("This is to certify that", centerX, 90, { align: "center" });
        
        pdf.setFont(undefined, "bold");
        pdf.setFontSize(24);
        pdf.setTextColor(41, 128, 185);
        pdf.text(certData.studentInfo.name, centerX, 105, { align: "center" });
        
        pdf.setFont(undefined, "normal");
        pdf.setFontSize(14);
        pdf.setTextColor(70, 70, 70);
        pdf.text("has successfully completed the course", centerX, 120, { align: "center" });
        
        pdf.setFont(undefined, "bold");
        pdf.setFontSize(20);
        pdf.setTextColor(41, 128, 185);
        pdf.text(certData.courseInfo.title, centerX, 135, { align: "center" });
                
        pdf.setFont(undefined, "normal");
        pdf.setFontSize(14);
        pdf.setTextColor(70, 70, 70);
        pdf.text(`Instructor: ${certData.courseInfo.educatorName}`, centerX, 150, { align: "center" });
                
        pdf.text(`Completion Date: ${new Date(certData.completedAt).toLocaleDateString()}`, centerX, 165, { align: "center" });
        
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Course ID: ${certData.courseId}`, centerX, 180, { align: "center" });
        pdf.text("Verified on Cardano Blockchain", centerX, 185, { align: "center" });
                
        pdf.setDrawColor(41, 128, 185);
        pdf.setLineWidth(0.5);
        pdf.line(centerX - 50, height - 50, centerX + 50, height - 50);
        pdf.setFont(undefined, "normal");
        pdf.setFontSize(12);
        pdf.text("Authorized Signature", centerX, height - 40, { align: "center" });
        
        pdf.save(`${certData.courseInfo.title}-certificate.pdf`);
    };
                
    const fetchPurchaseHistory = async () => {
        setLoadingPurchase(true);
        try {
            const token = await getToken();
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

    useEffect(() => {
        if (showPurchaseHistory && purchaseHistory.length === 0) {
            fetchPurchaseHistory();
        }
    }, [showPurchaseHistory]);
    
    useEffect(() => {
        toast.dismiss();
        
        const status = searchParams.get('status');
        const purchase_id = searchParams.get('purchase_id');
        const message = searchParams.get('message');
        
        if (!status || !purchase_id) return;
        
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        
        if (status === 'success') {
            const callStripeSuccess = async () => {
                try {
                    const response = await axios.get(`${backendUrl}/api/course/stripe-success?purchase_id=${purchase_id}`);
                    
                    if (response.data && response.data.success) {
                        toast.success(message || 'Payment successful! Your course enrollment has been processed.');
                        
                        fetchUserEnrolledCourses();
                        
                        fetchPurchaseHistory();
                    } else {
                        console.log('Payment was processed but enrollment failed, not showing error message as requested');
                    }
                } catch (error) {
                    console.error('Error processing Stripe payment:', error);
                }
            };
            
            callStripeSuccess();
        } else if (status === 'error') {
            console.log('Payment error, but not showing error message as requested');
        }
    }, [searchParams, fetchUserEnrolledCourses, fetchPurchaseHistory, backendUrl, getToken]);
    useEffect(() => {
        const checkAllCertificateStatus = async () => {
            if (!enrolledCourses || !progressArray) return;
            const newCertificateStatus = {};
            
            try {
                const token = await getToken();
                const { data } = await axios.get(
                    `${backendUrl}/api/notification/student-notifications`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                if (data.success && data.notifications) {
                    const completedNotifications = data.notifications.filter(
                        notification => notification.status === 'completed'
                    );
                    
                    completedNotifications.forEach(notification => {
                        newCertificateStatus[notification.courseId] = 'completed';
                    });
                    setCertificateStatus(newCertificateStatus);
                }
            } catch (error) {
            }
        };
        checkAllCertificateStatus();
    }, [enrolledCourses, progressArray, userData]);
    const handleResetProgress = async (courseId) => {
        try {
            const checkToken = await getToken();
            const { data: progressCheckData } = await axios.post(
                `${backendUrl}/api/user/get-course-progress`,
                { courseId },
                { headers: { Authorization: `Bearer ${checkToken}` } }
            );
            if (progressCheckData.progressData?.blocked === true || progressCheckData.progressData?.violations?.isBlocked === true) {
                await Swal.fire({
                    title: 'Reset Progress Blocked',
                    text: 'You cannot reset progress because you are blocked due to violations',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#d33'
                });
                return;
            }
            const result = await Swal.fire({
                title: 'Reset Course Progress',
                html: `
                    <div class="text-left">
                        <p>If you update, all your old data will be reset to 0. Do you agree?</p>
                        <p>We are not responsible for any data loss.</p>
                        <p>If you have already minted a certificate, don't worry - it will remain permanently on the blockchain.</p>
                    </div>
                `,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, reset it!',
                cancelButtonText: 'Cancel'
            });
            
            if (!result.isConfirmed) {
                return;
            }
            setUpdatingProgress(prev => ({ ...prev, [courseId]: true }));
            
            const token = await getToken();
            const { data } = await axios.post(
                `${backendUrl}/api/user/reset-course-progress`,
                { courseId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (data.success) {
                toast.success("Course progress has been reset successfully");
                setSentToEducator(prev => ({
                    ...prev,
                    [courseId]: false
                }));
                setCertificateStatus(prev => {
                    const newStatus = { ...prev };
                    delete newStatus[courseId]; 
                    return newStatus;
                });
                setResetCourses(prev => ({
                    ...prev,
                    [courseId]: true
                }));
                getCourseProgress();
                
                setTimeout(() => {
                    window.location.reload(true);
                }, 1500);
            } else {
                toast.error(data.message || "Failed to reset course progress");
            }
        } catch (error) {
            console.error("Error resetting course progress:", error);
            toast.error("An error occurred while resetting course progress");
        } finally {
            setUpdatingProgress(prev => ({ ...prev, [courseId]: false }));
        }
    };

    return enrolledCourses ? (
        <div className='min-h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0 relative'>
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white"></div>
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>
            
            <div className='w-full max-w-7xl mx-auto'>
                <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4'>
                    <div className='flex items-center gap-3'>
                        <div className="h-12 w-1.5 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                        <h2 className='text-3xl font-bold text-gray-800 mt-0 flex items-center gap-3'>
                            My Enrollments
                            <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-transparent bg-clip-text border border-blue-200 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">{enrolledCourses.length} Courses</span>
                            </span>
                        </h2>
                    </div>
                    <div className="relative w-full md:w-64 group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-4 h-4 text-indigo-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by course name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/80 backdrop-blur-sm border border-indigo-100 text-gray-800 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-300 block w-full pl-10 p-3 shadow-sm transition-all duration-200 group-hover:shadow-md"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 rounded-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                </div>

                <div className="flex gap-4 mt-8 mb-2">
                    <button
                        className={`btn ${!showPurchaseHistory ? 'btn-primary' : 'btn-outline-secondary'} px-6 py-2.5 rounded-lg font-medium transition-all duration-300 border border-transparent ${!showPurchaseHistory ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:bg-gradient-to-r hover:from-blue-700 hover:to-indigo-700' : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300 hover:border-gray-400'}`}
                        onClick={() => setShowPurchaseHistory(false)}
                    >
                        <span className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                            </svg>
                            My Enrollments
                        </span>
                    </button>
                    <button
                        className={`btn ${showPurchaseHistory ? 'btn-primary' : 'btn-outline-secondary'} px-6 py-2.5 rounded-lg font-medium transition-all duration-300 border border-transparent ${showPurchaseHistory ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:bg-gradient-to-r hover:from-blue-700 hover:to-indigo-700' : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300 hover:border-gray-400'}`}
                        onClick={() => setShowPurchaseHistory(true)}
                    >
                        <span className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                            </svg>
                            Purchase History
                        </span>
                    </button>
                </div>
                {showPurchaseHistory ? (
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent inline-block">Purchase History</h2>
                        {loadingPurchase ? (
                            <div className="flex justify-center items-center py-10">
                                <div className="animate-pulse flex flex-col items-center">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mb-3 animate-spin"></div>
                                    <div className="text-base font-medium text-gray-600">Loading purchase history...</div>
                                </div>
                            </div>
                        ) : purchaseHistory.length === 0 ? (
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-lg shadow-sm">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-blue-700">
                                            No purchase history found. When you purchase courses, your transactions will appear here.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-100/50 relative">
                                    <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full filter blur-2xl opacity-70 -translate-x-1/2 -translate-y-1/2"></div>
                                    <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-purple-400/10 to-pink-500/10 rounded-full filter blur-2xl opacity-70 translate-x-1/2 translate-y-1/2"></div>
                                    
                                    <table className="table table-hover w-full min-w-full divide-y divide-gray-200 relative z-10">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-gray-50 to-indigo-50">
                                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Course</th>
                                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Currency</th>
                                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Method</th>
                                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Created At</th>
                                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Updated At</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {paginatedFilteredCourses.map((item, index) => (
                                                <tr key={item._id} className={`hover:bg-indigo-50/50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                                {item.courseId && typeof item.courseId === 'object' && item.courseId.courseTitle ? item.courseId.courseTitle.charAt(0).toUpperCase() : 'C'}
                                                            </div>
                                                            <div className="ml-3">
                                                                <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                                                    {item.courseId && typeof item.courseId === 'object'
                                                                        ? item.courseId.courseTitle || 'Unknown Course'
                                                                        : 'Unknown Course'}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {item.courseId && typeof item.courseId === 'object'
                                                                        ? item.courseId._id
                                                                        : item.courseId}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{item.amount}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'completed' ? 'bg-green-100 text-green-800' : item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.currency}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        <div className="flex items-center">
                                                            {item.paymentMethod === 'cardano' ? (
                                                                <svg className="h-4 w-4 text-blue-500 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
                                                                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm-3-7h6v2H9v-2zm0-4h6v2H9V9zm0-4h6v2H9V5z"/>
                                                                </svg>
                                                            ) : item.paymentMethod === 'stripe' ? (
                                                                <svg className="h-4 w-4 text-purple-500 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
                                                                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-3.5-8v2H11v2h2v-2h1a2.5 2.5 0 100-5h-4a.5.5 0 010-1h5.5V8H13V6h-2v2h-1a2.5 2.5 0 000 5h4a.5.5 0 010 1H8.5z"/>
                                                                </svg>
                                                            ) : (
                                                                <svg className="h-4 w-4 text-gray-500 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
                                                                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-3.5-8v2H11v2h2v-2h1a2.5 2.5 0 100-5h-4a.5.5 0 010-1h5.5V8H13V6h-2v2h-1a2.5 2.5 0 000 5h4a.5.5 0 010 1H8.5z"/>
                                                                </svg>
                                                            )}
                                                            {item.paymentMethod}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : ''}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex justify-center gap-2 my-4 w-full border-t border-gray-500/20 pt-4">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`btn ${currentPage === 1 ? 'btn-outline-secondary' : 'btn-outline-primary'} px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
                                                currentPage === 1
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                                    : 'bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-200'
                                            }`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
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
                                                                className={`btn ${currentPage === page ? 'btn-primary' : 'btn-outline-secondary'} px-3 py-1 rounded-md text-sm ${
                                                                    currentPage === page
                                                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0'
                                                                        : 'bg-white hover:bg-gray-100 border border-gray-200'
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
                                                        className={`btn ${currentPage === page ? 'btn-primary' : 'btn-outline-secondary'} px-3 py-1 rounded-md text-sm ${
                                                            currentPage === page
                                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0'
                                                                : 'bg-white hover:bg-gray-100 border border-gray-200'
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                            })}
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className={`btn ${currentPage === totalPages ? 'btn-outline-secondary' : 'btn-outline-primary'} px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
                                                currentPage === totalPages
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                                    : 'bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-200'
                                            }`}
                                        >
                                            Next
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        <table className='md:table-auto table-fixed w-full overflow-hidden rounded-xl shadow-sm bg-white/80 backdrop-blur-sm mt-6'>
                            <thead className='text-gray-900 border-b border-indigo-100 text-sm text-left max-sm:hidden bg-gradient-to-r from-blue-50 to-indigo-50'>
                                <tr>
                                    <th className='px-6 py-4 font-semibold truncate w-16'>STT</th>
                                    <th className='px-6 py-4 font-semibold truncate'>Course ID</th>
                                    <th className='px-6 py-4 font-semibold truncate'>Course</th>
                                    <th className='px-6 py-4 font-semibold truncate'>Status</th>
                                    <th className='px-6 py-4 font-semibold truncate'>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedFilteredCourses.map((course, index) => (
                                    <tr key={course._id} className='border-b border-indigo-50 hover:bg-blue-50/30 transition-colors duration-150'>
                                        <td className='px-6 py-4 max-sm:hidden text-gray-500 text-sm text-center'>
                                            {startIndex + index + 1}
                                        </td>
                                        <td className='px-6 py-4 max-sm:hidden text-gray-500 text-sm'>
                                            <div className="break-all max-w-[200px] font-mono text-xs">{course._id}</div>
                                        </td>
                                        <td className='md:px-6 pl-3 md:pl-6 py-4 flex items-center space-x-4'>
                                            <div className="relative group overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                                                <img src={course.courseThumbnail} alt=""
                                                    className='w-16 sm:w-24 md:w-28 h-auto object-cover transition-transform duration-300 group-hover:scale-105' />
                                                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            </div>
                                            <div className='flex-1'>
                                                <p className='mb-2 max-sm:text-sm font-medium text-gray-800'>{course.courseTitle}</p>
                                                <Line strokeWidth={2} percent={progressArray[index]?.progressPercentage || 0} strokeColor={isCompleted(index) ? "#10b981" : "#4f46e5"} className='bg-gray-200 rounded-full h-2' />
                                                <div className='text-xs text-gray-500 mt-2 flex gap-3'>
                                                    <span className="flex items-center gap-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                                                        </svg>
                                                        Lectures: {progressArray[index]?.lectureCompleted || 0}/{progressArray[index]?.totalLectures || 0}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                                        </svg>
                                                        Tests: {progressArray[index]?.testsCompleted || 0}/{progressArray[index]?.totalTests || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='px-6 py-4 max-sm:text-right'>
                                            <button 
                                                className={`btn ${isCompleted(index) ? 'btn-success' : 'btn-primary'} px-4 sm:px-5 py-2 ${isCompleted(index) ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'} max-sm:text-xs text-white rounded-lg shadow-sm hover:shadow transition-all duration-200 font-medium flex items-center gap-1.5 border-0`} 
                                                onClick={() => navigate('/player/' + course._id)}
                                            >
                                                {isCompleted(index) ? (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        Completed
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                        </svg>
                                                        Continue
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className='px-6 py-4'>
                                            <div className="flex flex-wrap gap-2">
                                                {connected && course.txHash && (
                                                    <button
                                                        onClick={() => handleNFT(course._id)}
                                                        disabled={loadingNFT[course._id]}
                                                        className="btn btn-secondary px-3 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded shadow-sm hover:from-purple-600 hover:to-purple-700 hover:shadow transition-all duration-200 font-medium disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none disabled:opacity-70 border-0 flex items-center gap-1.5"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                                                            <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                                                            <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                                                        </svg>
                                                        {loadingNFT[course._id] ? 'Loading...' : 'NFT'}
                                                    </button>
                                                )}
                                                {course.txHash && isCompleted(index) && certificateStatus[course._id] !== 'completed' && (
                                                    <button
                                                        onClick={() => handleSaveAddress(course._id)}
                                                        disabled={savingAddress[course._id] || sentToEducator[course._id]}
                                                        className="btn btn-warning px-3 py-1.5 text-sm bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded shadow-sm hover:from-orange-600 hover:to-orange-700 hover:shadow transition-all duration-200 font-medium disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none disabled:opacity-70 border-0 flex items-center gap-1.5"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                                                        </svg>
                                                        {sentToEducator[course._id]
                                                            ? 'Sent, waiting for mint...'
                                                            : savingAddress[course._id]
                                                                ? 'Saving...'
                                                                : 'Send Educator'}
                                                    </button>
                                                )}
                                                {course.txHash && isCompleted(index) && certificateStatus[course._id] === 'completed' && (
                                                    <button
                                                        disabled
                                                        className="btn btn-success px-3 py-1.5 text-sm bg-gradient-to-r from-green-500 to-green-600 text-white rounded shadow-sm font-medium border-0 flex items-center gap-1.5"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        Minted
                                                    </button>
                                                )}
                                                {certificateStatus[course._id] === 'completed' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleViewCertificate2(course._id)}
                                                            disabled={loadingCertificate[course._id]}
                                                            className="btn btn-danger px-3 py-1.5 text-sm bg-gradient-to-r from-orange-600 to-red-600 text-white rounded shadow-sm hover:from-orange-700 hover:to-red-700 hover:shadow transition-all duration-200 font-medium disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none disabled:opacity-70 border-0 flex items-center gap-1.5"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                            {loadingCertificate[course._id] ? 'Loading...' : 'Info Download Certificate NFT'}
                                                        </button>
                                                    </>
                                                )}
                                                {course.txHash && isCompleted(index) && (
                                                    <button
                                                        onClick={() => handleGetSimpleCertificate(course._id)}
                                                        disabled={loadingSimpleCert[course._id]}
                                                        className="btn btn-success px-3 py-1.5 text-sm bg-gradient-to-r from-green-500 to-green-600 text-white rounded shadow-sm hover:from-green-600 hover:to-green-700 hover:shadow transition-all duration-200 font-medium disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none disabled:opacity-70 border-0 flex items-center gap-1.5"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                        </svg>
                                                        {loadingSimpleCert[course._id] ? 'Loading...' : 'View Course Progress'}
                                                    </button>
                                                )}
                                                {!course.txHash && isCompleted(index) && (
                                                    <button
                                                        onClick={() => handleGetSimpleCertificate(course._id)}
                                                        disabled={loadingSimpleCert[course._id]}
                                                        className="btn btn-success px-3 py-1.5 text-sm bg-gradient-to-r from-green-500 to-green-600 text-white rounded shadow-sm hover:from-green-600 hover:to-green-700 hover:shadow transition-all duration-200 font-medium disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none disabled:opacity-70 border-0 flex items-center gap-1.5"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                        </svg>
                                                        {loadingSimpleCert[course._id] ? 'Loading...' : 'View Course Progress'}
                                                    </button>
                                                )}
                                                    <button
                                                        onClick={() => handleResetProgress(course._id)}
                                                        disabled={updatingProgress[course._id]}
                                                        className="btn btn-danger px-3 py-1.5 text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded shadow-sm hover:from-red-600 hover:to-red-700 hover:shadow transition-all duration-200 font-medium disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none disabled:opacity-70 border-0 flex items-center gap-1.5"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                                        </svg>
                                                        {updatingProgress[course._id] ? 'Resetting...' : 'Reset Progress'}
                                                    </button>
                                            </div>
                                        </td>
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
                                <h3 className="text-gray-600 mb-2">Name Cert</h3>
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
                                            value={`https://client-react-brown.vercel.app/verify?policyId=${selectedNFTForQR.policyId}&txHash=${selectedNFTForQR.mintTransaction.txHash}`}
                                            size={200}
                                            level="H"
                                            includeMargin={true}
                                        />
                                    </div>
                                    <p className="mt-4 text-sm text-gray-600">Scan to verify certificate</p>
                                </div>
                            </div>

                            <div>
                                <div className="bg-gray-50 p-4 rounded flex flex-col items-center">
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
                                            const pdf = new jsPDF({
                                                orientation: 'p',
                                                unit: 'mm',
                                                format: 'a4'
                                            });
                                            const width = pdf.internal.pageSize.width;
                                            const height = pdf.internal.pageSize.height;
                                            const centerX = width / 2;
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
                                            gradient(0, 0, width, height, 
                                                {r: 255, g: 255, b: 255}, 
                                                {r: 240, g: 248, b: 255} 
                                            );

                                            pdf.setDrawColor(41, 128, 185); 
                                            pdf.setLineWidth(1.5);
                                            pdf.roundedRect(15, 15, width - 30, height - 30, 5, 5, 'S');
                                            pdf.setDrawColor(41, 128, 185);
                                            pdf.setLineWidth(1);
                                            pdf.line(15, 25, 35, 25);
                                            pdf.line(25, 15, 25, 35);
                                            pdf.line(width - 15, 25, width - 35, 25);
                                            pdf.line(width - 25, 15, width - 25, 35);
                                            pdf.line(15, height - 25, 35, height - 25);
                                            pdf.line(25, height - 15, 25, height - 35);
                                            pdf.line(width - 15, height - 25, width - 35, height - 25);
                                            pdf.line(width - 25, height - 15, width - 25, height - 35);
                                            pdf.setFont(undefined, "bold");
                                            pdf.setFontSize(24);
                                            pdf.setTextColor(41, 128, 185);
                                            pdf.text("BLOCKCHAIN CERTIFICATE", centerX, 35, { align: "center" });
                                            pdf.setDrawColor(41, 128, 185);
                                            pdf.setLineWidth(0.5);
                                            pdf.line(centerX - 60, 40, centerX + 60, 40);
                                            pdf.setFont(undefined, "bold");
                                            pdf.setFontSize(18);
                                            pdf.setTextColor(70, 70, 70);
                                            pdf.text(certificateData.courseTitle, centerX, 50, { align: "center" });
                                            pdf.setFont(undefined, "bold");
                                            pdf.setFontSize(12);
                                            pdf.setTextColor(41, 128, 185);
                                            pdf.text('Policy ID:', 25, 65);
                                            pdf.text('Transaction Hash:', 25, 75);
                                            pdf.setFont(undefined, "normal");
                                            pdf.setFontSize(10);
                                            pdf.setTextColor(70, 70, 70);
                                            const policyIdValue = pdf.splitTextToSize(certificateData.policyId, 140);
                                            const txHashValue = pdf.splitTextToSize(certificateData.txHash, 140);
                                            pdf.text(policyIdValue, 65, 65);
                                            pdf.text(txHashValue, 65, 75);
                                            let yPos = 90;
                                            pdf.setDrawColor(41, 128, 185);
                                            pdf.setLineWidth(0.5);
                                            pdf.line(25, yPos, width - 25, yPos);
                                            
                                            pdf.setFont(undefined, "bold");
                                            pdf.setFontSize(16);
                                            pdf.setTextColor(41, 128, 185);
                                            pdf.text('CERTIFICATE METADATA', centerX, yPos + 7, { align: 'center' });
                                            yPos += 15;
                                            if (certificateData.metadata && certificateData.metadata['721']) {
                                                const metadataFields = [];
                                                
                                                Object.keys(certificateData.metadata['721']).filter(key => key !== 'version').forEach(policyId => {
                                                    const assetData = certificateData.metadata['721'][policyId];
                                                    Object.keys(assetData).forEach(assetKey => {
                                                        const assetInfo = assetData[assetKey];
                                                        
                                                        Object.entries(assetInfo).forEach(([key, value]) => {
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

                                                pdf.setFillColor(248, 250, 252);
                                                pdf.roundedRect(25, yPos, width - 50, Math.min(metadataFields.length * 12 + 10, 100), 3, 3, 'F');

                                                yPos += 8;
                                                pdf.setFontSize(11);
                                                const useColumns = metadataFields.length > 4;
                                                const colWidth = useColumns ? (width - 60) / 2 : width - 60;
                                                let col2YPos = yPos;    
                                                metadataFields.forEach((field, index) => {
                                                    let currentX = 30;
                                                    let currentYPos = yPos;
                                                    
                                                    if (useColumns && index >= Math.ceil(metadataFields.length / 2)) {
                                                        currentX = 30 + colWidth + 10;
                                                        currentYPos = col2YPos;
                                                        col2YPos += 12;
                                                    } else {
                                                        yPos += 12;
                                                    }
                                                    pdf.setFont(undefined, "bold");
                                                    pdf.setTextColor(70, 70, 70);
                                                    pdf.text(`${field.key}:`, currentX, currentYPos);
                                                    pdf.setFont(undefined, "normal");
                                                    pdf.setTextColor(100, 100, 100);
                                                    
                                                    const valueLines = pdf.splitTextToSize(field.value, colWidth - 40);
                                                    pdf.text(valueLines, currentX + 35, currentYPos);
                                                    if (valueLines.length > 1 && !useColumns) {
                                                        yPos += (valueLines.length - 1) * 5;
                                                    }
                                                });
                                                yPos = Math.max(yPos, col2YPos) + 10;
                                            }
                                            pdf.setDrawColor(41, 128, 185);
                                            pdf.setLineWidth(0.5);
                                            pdf.line(25, yPos, width - 25, yPos);
                                            
                                            pdf.setFont(undefined, "bold");
                                            pdf.setFontSize(16);
                                            pdf.setTextColor(41, 128, 185);
                                            pdf.text('BLOCKCHAIN VERIFICATION', centerX, yPos + 7, { align: 'center' });
                                            pdf.setFont(undefined, "normal");
                                            pdf.setFontSize(10);
                                            pdf.setTextColor(70, 70, 70);
                                            pdf.text('Scan these QR codes to verify the authenticity of this certificate on the Cardano blockchain', 
                                                   centerX, yPos + 15, { align: 'center' });
                                            const qrCodeSize = 40; 
                                            const qrStartY = yPos + 25; 
                                            Promise.all([
                                                html2canvas(document.querySelector('.border.border-gray-200.p-2')),
                                                html2canvas(document.querySelectorAll('.border.border-gray-200.p-2')[1])
                                            ]).then(([canvas1, canvas2]) => {
                                                const imgData1 = canvas1.toDataURL('image/png');
                                                const imgData2 = canvas2.toDataURL('image/png');
                                                
                                                if (qrStartY + qrCodeSize + 20 > pdf.internal.pageSize.height) {
                                                    pdf.addPage();
                                                    gradient(0, 0, width, height, 
                                                        {r: 255, g: 255, b: 255}, 
                                                        {r: 240, g: 248, b: 255}  
                                                    );
                                                    pdf.setDrawColor(41, 128, 185);
                                                    pdf.setLineWidth(1.5);
                                                    pdf.roundedRect(15, 15, width - 30, height - 30, 5, 5, 'S');
                                                }
                                                
                                                const leftQRX = width / 2 - qrCodeSize - 20;
                                                const rightQRX = width / 2 + 20;
                                                
                                                pdf.setFillColor(248, 250, 252);
                                                pdf.roundedRect(leftQRX - 5, qrStartY - 5, qrCodeSize + 10, qrCodeSize + 30, 3, 3, 'F');
                                                
                                                pdf.setFillColor(248, 250, 252);
                                                pdf.roundedRect(rightQRX - 5, qrStartY - 5, qrCodeSize + 10, qrCodeSize + 30, 3, 3, 'F');
                                                
                                                pdf.setDrawColor(41, 128, 185);
                                                pdf.setLineWidth(0.5);
                                                pdf.roundedRect(leftQRX - 5, qrStartY - 5, qrCodeSize + 10, qrCodeSize + 30, 3, 3, 'S');
                                                
                                                pdf.roundedRect(rightQRX - 5, qrStartY - 5, qrCodeSize + 10, qrCodeSize + 30, 3, 3, 'S');
                                                
                                                pdf.addImage(imgData1, 'PNG', leftQRX, qrStartY, qrCodeSize, qrCodeSize);
                                                pdf.setFont(undefined, "bold");
                                                pdf.setFontSize(10);
                                                pdf.setTextColor(41, 128, 185);
                                                pdf.text('VERIFICATION', leftQRX + qrCodeSize/2, qrStartY + qrCodeSize + 8, { align: 'center' });
                                                pdf.setFont(undefined, "normal");
                                                pdf.setFontSize(8);
                                                pdf.setTextColor(100, 100, 100);
                                                pdf.text('Scan to verify certificate', leftQRX + qrCodeSize/2, qrStartY + qrCodeSize + 15, { align: 'center' });
                                                
                                                pdf.addImage(imgData2, 'PNG', rightQRX, qrStartY, qrCodeSize, qrCodeSize);
                                                pdf.setFont(undefined, "bold");
                                                pdf.setFontSize(10);
                                                pdf.setTextColor(41, 128, 185);
                                                pdf.text('BLOCKCHAIN INFO', rightQRX + qrCodeSize/2, qrStartY + qrCodeSize + 8, { align: 'center' });
                                                pdf.setFont(undefined, "normal");
                                                pdf.setFontSize(8);
                                                pdf.setTextColor(100, 100, 100);
                                                pdf.text('Scan for transaction details', rightQRX + qrCodeSize/2, qrStartY + qrCodeSize + 15, { align: 'center' });
                                                
                                                const signatureY = qrStartY + qrCodeSize + 35;
                                                if (signatureY + 30 < height - 20) { 
                                                    pdf.setDrawColor(41, 128, 185);
                                                    pdf.setLineWidth(0.5);
                                                    pdf.line(centerX - 40, signatureY, centerX + 40, signatureY);
                                                    pdf.setFont(undefined, "normal");
                                                    pdf.setFontSize(10);
                                                    pdf.setTextColor(70, 70, 70);
                                                    pdf.text('Authorized Signature', centerX, signatureY + 5, { align: 'center' });
                                                    
                                                    const issueDate = new Date(certificateData.timestamp).toLocaleDateString();
                                                    pdf.text(`Issue Date: ${issueDate}`, centerX, signatureY + 15, { align: 'center' });
                                                }
                                                
                                                pdf.setFont(undefined, "italic");
                                                pdf.setFontSize(8);
                                                pdf.setTextColor(150, 150, 150);
                                                pdf.text('This certificate is stored on the Cardano blockchain and cannot be altered or falsified.', 
                                                       centerX, height - 20, { align: 'center' });
                                                
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

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">Course Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <p><span className="font-medium">Title:</span> {selectedCertData.courseInfo.title}</p>
                                    <p><span className="font-medium">Educator:</span> {selectedCertData.courseInfo.educatorName}</p>
                                    <p><span className="font-medium">Course ID:</span> {selectedCertData.courseId}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">Student Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <p><span className="font-medium">Name:</span> {selectedCertData.studentInfo.name}</p>
                                    <p><span className="font-medium">User ID:</span> {selectedCertData.userId}</p>
                                </div>
                            </div>

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

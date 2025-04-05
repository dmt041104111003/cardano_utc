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
    const [showCompleted, setShowCompleted] = useState(false)
    const [showNFTModal, setShowNFTModal] = useState(false)
    const [selectedNFT, setSelectedNFT] = useState(null)
    const [loading, setLoading] = useState(false)
    const [minting, setMinting] = useState({})
    const [loadingNFT, setLoadingNFT] = useState({});
    const [savingAddress, setSavingAddress] = useState({});
    const [loadingCertificate, setLoadingCertificate] = useState({});

    const getCourseProgress = async () => {
        try {
            const token = await getToken();
            const tempProgressArray = await Promise.all(
                enrolledCourses.map(async (course) => {
                    const { data } = await axios.post(`${backendUrl}/api/user/get-course-progress`,
                        { courseId: course._id }, { headers: { Authorization: `Bearer ${token}` } }
                    )
                    let totalLectures = calculateNoOfLectures(course);
                    const lectureCompleted = data.progressData ? data.progressData.lectureCompleted.length : 0;
                    return { totalLectures, lectureCompleted }
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
                        handleNFT(courseId);
                    } 
                    // else if (notification.status === 'rejected') {
                    //     toast.error(`Yêu cầu cấp certificate vào ví ${shortAddress} đã bị từ chối`);
                    // }
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
        if (userData) {
            fetchUserEnrolledCourses()
        }
    }, [userData])

    useEffect(() => {
        if (enrolledCourses.length > 0) {
            getCourseProgress()
        }
    }, [enrolledCourses])

    const isCompleted = (index) => {
        if (!progressArray[index]) return false;
        return progressArray[index].lectureCompleted === progressArray[index].totalLectures;
    }

    // Filter courses based on completion status
    const coursesWithProgress = enrolledCourses.map((course, index) => ({
        ...course,
        completed: isCompleted(index),
        progress: progressArray[index]
    }));

    const filteredCourses = showCompleted 
        ? coursesWithProgress.filter(course => course.completed)
        : coursesWithProgress;

    return (
        <>
            <div className='md:px-36 px-8 pt-10 min-h-screen'>
                <div className="flex justify-between items-center">
                    <h1 className='text-2xl font-semibold'>MyEnrollments</h1>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600">
                            Connected Wallet: <span className="font-mono">{connected ? 'Connected' : 'Not Connected'}</span>
                        </div>
                        <button 
                            onClick={() => setShowCompleted(!showCompleted)}
                            className={`px-4 py-2 rounded-md ${showCompleted ? 'bg-green-600' : 'bg-blue-600'} text-white`}
                        >
                            {showCompleted ? 'Show All' : 'Show Completed'}
                        </button>
                    </div>
                </div>

                <table className='md:table-auto table-fixed w-full overflow-hidden border mt-10'>
                    <thead className='text-gray-900 border-b border-gray-500/20 text-sm text-left max-sm:hidden'>
                        <tr>
                            <th className='px-4 py-3 font-semibold truncate'>Course</th>
                            <th className='px-4 py-3 font-semibold truncate'>Duration</th>
                            <th className='px-4 py-3 font-semibold truncate'>Completed</th>
                            <th className='px-4 py-3 font-semibold truncate'>Status</th>
                            <th className='px-4 py-3 font-semibold truncate'>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCourses.map((course, index) => (
                            <tr key={course._id} className='border-b border-gray-500/20'>
                                <td className='md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3'>
                                    <img src={course.courseThumbnail} alt=""
                                        className='w-14 sm:w-24 md:x-28' />
                                    <div className='flex-1'>
                                        <p className='mb-1 max-sm:text-sm'>{course.courseTitle}</p>
                                        <Line strokeWidth={2} percent={course.progress ? (course.progress.lectureCompleted * 100) / course.progress.totalLectures : 0} className='bg-gray-300 rounded-full' />
                                    </div>
                                </td>
                                <td className='px-4 py-3 max-sm:hidden'>
                                    {calculateCourseDuration(course)}
                                </td>
                                <td className='px-4 py-3 max-sm:hidden'>
                                    {course.progress && `${course.progress.lectureCompleted} / ${course.progress.totalLectures}`}  <span>Lectures</span>
                                </td>
                                <td className='px-4 py-3 max-sm:text-right'>
                                    <button 
                                        className={`px-3 sm:px-5 py-1.5 sm:py-2 ${course.completed ? 'bg-green-600' : 'bg-blue-600'} max-sm:text-xs text-white rounded`} 
                                        onClick={() => navigate('/player/' + course._id)}
                                    >
                                        {course.completed ? 'Completed' : 'On Going'}
                                    </button>
                                </td>
                                <td className='px-4 py-3'>
                                    {course.completed && (
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
                                                        className="px-3 py-1 rounded-md text-xs font-medium bg-orange-500 hover:bg-orange-600 text-white"
                                                        disabled={savingAddress[course._id]}
                                                    >
                                                        {savingAddress[course._id] ? 'Loading...' : 'Send Educator'}
                                                    </button>
                                                    <button
                                                        onClick={() => checkCertificateStatus(course._id)}
                                                        disabled={loading || minting[course._id] || !isCompleted(index)}
                                                        className={`px-3 py-1 rounded-md text-xs font-medium ${
                                                            loading || minting[course._id]
                                                                ? 'bg-gray-400 cursor-not-allowed'
                                                                : !isCompleted(index)
                                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                                                        }`}
                                                    >
                                                        {minting[course._id] ? 'Loading...' : 'Status Send Educator'}
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
        </>
    );
}

export default MyEnrollments;

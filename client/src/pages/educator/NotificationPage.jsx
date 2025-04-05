/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react';
import Loading from '../../components/student/Loading';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const NotificationPage = () => {
    const { backendUrl, getToken, isEducator, userData, wallet, connected } = useContext(AppContext);
    const [notifications, setNotifications] = useState(null);
    const [minting, setMinting] = useState({});

    const fetchNotifications = async () => {
        if (!userData?._id) return;

        try {
            const token = await getToken();
            const { data } = await axios.get(
                `${backendUrl}/api/notification/all?educatorId=${userData._id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                setNotifications(data.notifications);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error details:", error.response?.data || error.message);
            toast.error(error.message);
        }
    };

    const handleMintCertificate = async (notification) => {
        if (!notification.data?.walletAddress) {
            toast.error('Student wallet address not found');
            return;
        }

        if (!connected || !wallet) {
            toast.error("Please connect your wallet first!");
            return;
        }

        setMinting(prev => ({...prev, [notification._id]: true}));
        try {
            const token = await getToken();
            
            // 1. Get course info and NFT info
            console.log('Getting course info for:', notification.courseId?._id);
            const [courseResponse, nftResponse] = await Promise.all([
                axios.get(`${backendUrl}/api/course/${notification.courseId?._id}`, 
                    { headers: { Authorization: `Bearer ${token}` } }
                ),
                axios.get(`${backendUrl}/api/nft/info/${notification.courseId?._id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                )
            ]);

            if (!courseResponse.data.success || !nftResponse.data.success) {
                throw new Error("Failed to get course or NFT info");
            }

            const courseData = courseResponse.data.courseData;
            const nftInfo = {
                policyId: nftResponse.data.policyId,
                assetName: nftResponse.data.assetName
            };
            console.log('Course data:', courseData);
            console.log('NFT info:', nftInfo);

            // 2. Get UTXOs and collateral from educator's wallet
            console.log('Getting UTXOs and collateral...');
            const utxos = await wallet.getUtxos();
            const collateral = await wallet.getCollateral();
            if (!utxos || !collateral) {
                throw new Error("Failed to get UTXOs or collateral");
            }

            // Lấy địa chỉ ví hiện tại của educator
            const educatorAddress = await wallet.getUsedAddresses();
            const currentWallet = educatorAddress[0];

            // Fetch thông tin address từ database
            const addressResponse = await axios.get(
                `${backendUrl}/api/address/find?courseId=${notification.courseId?._id}&educatorId=${userData?._id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Kiểm tra thông tin educator
            console.log('Debug - So sánh thông tin educator:', {
                currentEducator: {
                    id: userData?._id,
                    wallet: currentWallet
                },
                dbEducator: {
                    id: addressResponse.data?.address?.educatorId,
                    wallet: addressResponse.data?.address?.educatorWallet
                }
            });

            // Kiểm tra ID educator
            if (userData?._id !== addressResponse.data?.address?.educatorId) {
                throw new Error('Bạn không phải là educator của khóa học này');
            }

            // Kiểm tra ví educator
            if (currentWallet !== addressResponse.data?.address?.educatorWallet) {
                throw new Error('Ví đang kết nối không phải là ví đã đăng ký cho khóa học này');
            }

            console.log('Debug - Thông tin address:', {
                studentInfo: {
                    walletAddress: notification.data?.walletAddress,
                    userName: notification.data?.userName
                },
                educatorInfo: {
                    educatorId: userData?._id,
                    educatorWallet: courseData.creatorAddress
                },
                addressFromDB: addressResponse.data
            });

            // 3. Create mint transaction
            console.log('Creating mint transaction with address:', notification.data.walletAddress);
            const requestData = {
                courseId: notification.courseId?._id,
                utxos: utxos,
                userAddress: notification.data.walletAddress,
                collateral: collateral,
                courseData: {
                    courseId: notification.courseId?._id,
                    courseTitle: courseData.courseTitle,
                    courseDescription: courseData.courseDescription || '',
                    txHash: courseData.txHash,
                    creatorAddress: courseData.creatorAddress,
                    createdAt: courseData.createdAt,
                    educator: userData?.name || 'Edu Platform', // Truyền trực tiếp tên
                    certificateImage: courseData.courseThumbnail,
                    studentName: notification.studentId?.name || notification.data?.userName || "Student",
                    policyId: nftInfo.policyId,
                    assetName: nftInfo.assetName
                }
            };
            console.log('Sending request data:', JSON.stringify(requestData, null, 2));
            const { data: mintData } = await axios.post(
                `${backendUrl}/api/certificate/mint`,
                requestData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!mintData.success) {
                throw new Error(mintData.message || "Failed to create mint transaction");
            }

            // 5. Sign and submit transaction
            console.log('Signing transaction...');
            const signedTx = await wallet.signTx(mintData.unsignedTx);
            console.log('Submitting transaction...');
            const txHash = await wallet.submitTx(signedTx);

            // Update notification status
            console.log('Updating notification status...');
            const updateResponse = await axios.put(
                `${backendUrl}/api/notification/${notification._id}/read`,
                { status: 'completed' },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!updateResponse.data.success) {
                throw new Error("Failed to update notification status");
            }

            // Save certificate
            console.log('Saving certificate...');
            const saveResponse = await axios.post(
                `${backendUrl}/api/certificate/save`,
                {
                    userId: notification.studentId?._id,
                    courseId: notification.courseId?._id,
                    mintUserId: userData?._id,
                    ipfsHash: mintData.ipfsHash
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!saveResponse.data.success) {
                throw new Error("Failed to save certificate");
            }

            toast.success("Certificate minted and saved successfully!");
            fetchNotifications();

        } catch (error) {
            console.error("Mint error:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to mint certificate");
        } finally {
            setMinting(prev => ({...prev, [notification._id]: false}));
        }
    };

    const handleViewCertificateRequest = async (notification) => {
        // Show modal with certificate request details
        toast.info(`Student ${notification.studentId?.name} submitted wallet address: ${notification.data?.walletAddress} for course: ${notification.data?.courseTitle}`);
    };

    useEffect(() => {
        if (isEducator) {
            fetchNotifications();
        }
    }, [isEducator, userData?._id]);

    if (!notifications) return <Loading />;

    return (
        <div className='min-h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>
            <div className='flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20'>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Student
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Course
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                Date
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {notifications.map((notification, index) => {
                            const date = new Date(notification.createdAt).toLocaleDateString();
                            return (
                                <tr key={notification._id}>
                                    <td className="px-4 py-3 whitespace-nowrap flex items-center space-x-2">
                                        {notification.studentId?.avatar && (
                                            <img 
                                                src={notification.studentId.avatar} 
                                                className="w-9 h-9 rounded-full" 
                                                alt={notification.studentId?.name || 'Student'} 
                                            />
                                        )}
                                        <span className="truncate">{notification.studentId?.name || 'Unknown Student'}</span>
                                    </td>
                                    <td className="px-4 py-3 truncate">
                                        {notification.courseId?.courseTitle || 'Unknown Course'}
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell">
                                        {date}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span 
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                notification.status === 'completed' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}
                                        >
                                            {notification.status === 'completed' ? 'Completed' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            
                                            <button 
                                                onClick={() => handleMintCertificate(notification)}
                                                disabled={minting[notification._id] || notification.type !== 'certificate_request' || notification.status === 'completed'}
                                                className={`px-3 py-1 rounded-md text-xs font-medium ${
                                                    minting[notification._id]
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : notification.type !== 'certificate_request' || notification.status === 'completed'
                                                            ? 'bg-gray-400 cursor-not-allowed'
                                                            : 'bg-orange-500 hover:bg-orange-600 text-white'
                                                }`}
                                            >
                                                {minting[notification._id] ? 'Minting...' : 'Mint'}
                                            </button>
                                            <button 
                                                onClick={() => notification.type === 'certificate_request' && handleViewCertificateRequest(notification)}
                                                className={`px-3 py-1 rounded-md text-xs font-medium ${
                                                    notification.type === 'certificate_request'
                                                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                                        : 'bg-gray-400 cursor-not-allowed'
                                                }`}
                                            >
                                                info
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default NotificationPage;

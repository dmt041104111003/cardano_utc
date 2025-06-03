import React, { useContext, useEffect, useState } from 'react';
import Loading from '../../components/student/Loading';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const NotificationPage = () => {
    const { backendUrl, getToken, isEducator, userData, wallet, connected } = useContext(AppContext);
    const [notifications, setNotifications] = useState(null);
    const [minting, setMinting] = useState({});
    const [mintingAll, setMintingAll] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showCompleted, setShowCompleted] = useState(false);
    const itemsPerPage = 8;

    const fetchNotifications = async (isFirstLoad = false) => {
        if (!userData?._id) return;
        try {
            const token = await getToken();
            const { data } = await axios.get(`${backendUrl}/api/notification/all?educatorId=${userData._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                const sorted = [...data.notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setNotifications(sorted);
                if (isFirstLoad) {
                    setFilteredNotifications(sorted);
                    setCurrentPage(1);
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (!userData?._id || !isEducator) return;
        fetchNotifications(true);
        const intervalId = setInterval(() => fetchNotifications(false), 2000);
        const handleVisibilityChange = () => !document.hidden && fetchNotifications(false);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [userData, isEducator]);

    useEffect(() => {
        if (notifications) {
            let filtered = notifications.filter(n => 
                n.courseId?.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (showCompleted) filtered = filtered.filter(n => n.status === 'completed');
            setFilteredNotifications(filtered);
        }
    }, [searchQuery, notifications, showCompleted]);

    const handleMintCertificate = async (notification) => {
        if (!notification.data?.walletAddress) return toast.error('Student wallet address not found');
        if (!connected || !wallet) return toast.error('Please connect your wallet first!');
        setMinting(prev => ({ ...prev, [notification._id]: true }));
        try {
            const token = await getToken();
            const [{ data: courseData }, { data: nftData }, { data: addressData }] = await Promise.all([
                axios.get(`${backendUrl}/api/course/${notification.courseId?._id}`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${backendUrl}/api/nft/info/${notification.courseId?._id}`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${backendUrl}/api/address/find?courseId=${notification.courseId?._id}&educatorId=${userData?._id}`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            if (!courseData.success || !nftData.success) throw new Error('Failed to get course or NFT info');
            const [utxos, collateral, educatorAddress] = await Promise.all([
                wallet.getUtxos(),
                wallet.getCollateral(),
                wallet.getUsedAddresses()
            ]);
            if (!utxos || !collateral) throw new Error('Failed to get UTXOs or collateral');
            if (userData?._id !== addressData?.address?.educatorId) throw new Error('You are not the educator of this course.');
            if (educatorAddress[0] !== addressData?.address?.educatorWallet) throw new Error('The wallet being connected is not the wallet registered for this course');
            const requestData = {
                courseId: notification.courseId?._id,
                utxos,
                userAddress: notification.data.walletAddress,
                collateral,
                courseData: {
                    courseId: notification.courseId?._id,
                    courseTitle: courseData.courseData.courseTitle,
                    courseDescription: courseData.courseData.courseDescription || '',
                    txHash: courseData.courseData.txHash,
                    creatorAddress: courseData.courseData.creatorAddress,
                    createdAt: courseData.courseData.createdAt,
                    educator: userData?.name || 'Edu Platform',
                    certificateImage: courseData.courseData.courseThumbnail,
                    studentName: notification.studentId?.name || notification.data?.userName || 'Student',
                    policyId: nftData.policyId,
                    assetName: nftData.assetName
                }
            };
            const { data: mintData } = await axios.post(`${backendUrl}/api/certificate/mint`, requestData, { headers: { Authorization: `Bearer ${token}` } });
            if (!mintData.success) throw new Error(mintData.message || 'Failed to create mint transaction');
            const signedTx = await wallet.signTx(mintData.unsignedTx);
            const txHash = await wallet.submitTx(signedTx);
            const updateResponse = await axios.put(`${backendUrl}/api/notification/${notification._id}/read`, { status: 'completed' }, { headers: { Authorization: `Bearer ${token}` } });
            if (!updateResponse.data.success) throw new Error('Failed to update notification status');
            const saveResponse = await axios.post(`${backendUrl}/api/certificate/save`, {
                userId: notification.studentId?._id,
                courseId: notification.courseId?._id,
                mintUserId: userData?._id,
                ipfsHash: mintData.ipfsHash,
                policyId: nftData.policyId,
                transactionHash: txHash
            }, { headers: { Authorization: `Bearer ${token}` } });
            if (!saveResponse.data.success) throw new Error('Failed to save certificate');
            toast.success('Certificate minted and saved successfully!');
            fetchNotifications();
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Failed to mint certificate');
        } finally {
            setMinting(prev => ({ ...prev, [notification._id]: false }));
        }
    };

    const handleMintAllCertificates = async () => {
        if (!connected || !wallet) return toast.error('Please connect your wallet first!');
        const pendingRequests = filteredNotifications.filter(n => n.type === 'certificate_request' && n.status !== 'completed');
        if (!pendingRequests.length) return toast.info('No pending certificate requests to mint');
        setMintingAll(true);
        pendingRequests.forEach(n => setMinting(prev => ({ ...prev, [n._id]: true })));
        try {
            const token = await getToken();
            const [utxos, collateral, educatorAddress] = await Promise.all([
                wallet.getUtxos(),
                wallet.getCollateral(),
                wallet.getUsedAddresses()
            ]);
            if (!utxos || !collateral) throw new Error('Failed to get UTXOs or collateral');
            const certificateRequests = [];
            for (const notification of pendingRequests) {
                if (!notification.data?.walletAddress) continue;
                const [{ data: courseData }, { data: nftData }, { data: addressData }] = await Promise.all([
                    axios.get(`${backendUrl}/api/course/${notification.courseId?._id}`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${backendUrl}/api/nft/info/${notification.courseId?._id}`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${backendUrl}/api/address/find?courseId=${notification.courseId?._id}&educatorId=${userData?._id}`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                if (!courseData.success || !nftData.success) continue;
                if (userData?._id !== addressData?.address?.educatorId || educatorAddress[0] !== addressData?.address?.educatorWallet) continue;
                certificateRequests.push({
                    courseData: {
                        courseId: notification.courseId?._id,
                        courseTitle: courseData.courseData.courseTitle,
                        courseDescription: courseData.courseData.courseDescription || '',
                        txHash: courseData.courseData.txHash,
                        creatorAddress: courseData.courseData.creatorAddress,
                        createdAt: courseData.courseData.createdAt,
                        educator: userData?.name || 'Edu Platform',
                        certificateImage: courseData.courseData.courseThumbnail,
                        studentName: notification.studentId?.name || notification.data?.userName || 'Student',
                        studentId: notification.studentId?._id,
                        policyId: nftData.policyId,
                        assetName: nftData.assetName
                    },
                    userAddress: notification.data.walletAddress,
                    notificationId: notification._id
                });
            }
            if (!certificateRequests.length) throw new Error('No valid certificate requests could be prepared');
            const { data: batchMintData } = await axios.post(`${backendUrl}/api/batch/batch-mint`, {
                utxos: JSON.stringify(utxos),
                collateral: JSON.stringify(collateral),
                educatorAddress: educatorAddress[0],
                certificateRequests
            }, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, maxContentLength: Infinity, maxBodyLength: Infinity });
            if (!batchMintData.success) throw new Error(batchMintData.message || 'Failed to create batch mint transaction');
            const signedTx = await wallet.signTx(batchMintData.unsignedTx);
            const txHash = await wallet.submitTx(signedTx);
            const updatePromises = certificateRequests.map(r => 
                axios.put(`${backendUrl}/api/notification/${r.notificationId}/read`, { status: 'completed' }, { headers: { Authorization: `Bearer ${token}` } })
            );
            const savePromises = certificateRequests.map((r, i) => 
                axios.post(`${backendUrl}/api/certificate/save`, {
                    userId: r.courseData.studentId,
                    courseId: r.courseData.courseId,
                    mintUserId: userData?._id,
                    ipfsHash: batchMintData.processedCertificates[i].ipfsHash,
                    policyId: r.courseData.policyId,
                    transactionHash: txHash,
                    assetName: r.courseData.assetName
                }, { headers: { Authorization: `Bearer ${token}` } })
            );
            await Promise.allSettled([...updatePromises, ...savePromises]);
            toast.success(`Successfully minted ${batchMintData.processedCertificates.length} certificates in a single transaction!`);
            fetchNotifications();
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Failed to mint certificates');
        } finally {
            pendingRequests.forEach(n => setMinting(prev => ({ ...prev, [n._id]: false })));
            setMintingAll(false);
        }
    };

    const handleViewCertificateRequest = (notification) => {
        if (notification.type === 'certificate_request') {
            toast.info(`Student ${notification.studentId?.name} submitted wallet address: ${notification.data?.walletAddress} for course: ${notification.data?.courseTitle}`);
        }
    };

    const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = page => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (!notifications) return <Loading />;

    return (
        <div className="min-h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0 bg-gradient-to-b from-blue-50 to-white">
            <div className="w-full max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <div className="w-1.5 h-8 bg-blue-600 rounded-full mr-2"></div>
                        Notifications
                    </h1>
                    <p className="text-gray-600 ml-5">Manage certificate requests from your students</p>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center flex-wrap gap-3">
                        <button
                            onClick={() => setShowCompleted(!showCompleted)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${showCompleted ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' : 'bg-white border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {showCompleted ? 'Show All' : 'Show Completed'}
                        </button>
                        <button
                            onClick={handleMintAllCertificates}
                            disabled={mintingAll || !connected || !wallet}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${mintingAll || !connected || !wallet ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-sm'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                            </svg>
                            {mintingAll ? 'Minting All...' : 'Mint All'}
                            <span className="text-xs bg-white bg-opacity-20 px-1.5 py-0.5 rounded">Save on gas fees (pay only once)</span>
                        </button>
                    </div>
                    <div className="relative w-full md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by course name, ID or student name..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm"
                        />
                    </div>
                </div>
                <div className="w-full overflow-hidden rounded-lg shadow-sm bg-white border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 text-left">
                                <tr>
                                    <th className="px-4 py-3.5 text-sm font-semibold text-gray-700 w-16 text-center">#</th>
                                    <th className="px-4 py-3.5 text-sm font-semibold text-gray-700">Student</th>
                                    <th className="px-4 py-3.5 text-sm font-semibold text-gray-700">Course</th>
                                    <th className="px-4 py-3.5 text-sm font-semibold text-gray-700">Date</th>
                                    <th className="px-4 py-3.5 text-sm font-semibold text-gray-700 text-center">Status</th>
                                    <th className="px-4 py-3.5 text-sm font-semibold text-gray-700 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedNotifications.map((notification, index) => (
                                    <tr key={notification._id}>
                                        <td className="px-4 py-3 text-center text-gray-500 text-sm">{startIndex + index + 1}</td>
                                        <td className="px-4 py-3 whitespace-nowrap flex items-center space-x-2">
                                            {notification.studentId?.avatar && (
                                                <img src={notification.studentId.avatar} className="w-9 h-9 rounded-full" alt={notification.studentId?.name || 'Student'} />
                                            )}
                                            <span className="truncate">{notification.studentId?.name || 'Unknown Student'}</span>
                                        </td>
                                        <td className="px-4 py-3 truncate">{notification.courseId?.courseTitle || 'Unknown Course'}</td>
                                        <td className="px-4 py-3 text-gray-500 text-sm">{notification.courseId?._id || 'N/A'}</td>
                                        <td className="px-4 py-3 hidden sm:table-cell">{new Date(notification.createdAt).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${notification.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {notification.status === 'completed' ? 'Completed' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button
                                                    onClick={() => handleMintCertificate(notification)}
                                                    disabled={minting[notification._id] || notification.type !== 'certificate_request' || notification.status === 'completed'}
                                                    className={`px-3 py-1 rounded-md text-xs font-medium ${minting[notification._id] || notification.type !== 'certificate_request' || notification.status === 'completed' ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
                                                >
                                                    {minting[notification._id] ? 'Minting...' : 'Mint'}
                                                </button>
                                                <button
                                                    onClick={() => handleViewCertificateRequest(notification)}
                                                    className={`px-3 py-1 rounded-md text-xs font-medium ${notification.type === 'certificate_request' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-gray-400 cursor-not-allowed'}`}
                                                >
                                                    info
                                                </button>
                                            </div>
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
                                className={`px-3 py-1 rounded-md text-sm ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2).map((page, index, array) => (
                                <React.Fragment key={`page-${page}`}>
                                    {index > 0 && page - array[index - 1] > 1 && <span className="px-2 py-1">...</span>}
                                    <button
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3 py-1 rounded-md text-sm ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                    >
                                        {page}
                                    </button>
                                </React.Fragment>
                            ))}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1 rounded-md text-sm ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationPage;
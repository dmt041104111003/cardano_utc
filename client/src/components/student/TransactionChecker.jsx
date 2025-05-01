import React, { useState, useContext } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

const TransactionChecker = () => {
    const [policyId, setPolicyId] = useState('');
    const [txHash, setTxHash] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { backendUrl, getToken } = useContext(AppContext);
    const [showNFTModal, setShowNFTModal] = useState(false);
    const [selectedNFT, setSelectedNFT] = useState(null);
    const [activeTab, setActiveTab] = useState('nft');
    const [showRawMetadata, setShowRawMetadata] = useState(false);

    const handleCheck = async () => {
        if (!policyId.trim() || !txHash.trim()) {
            toast.error('Please enter both Policy ID and Transaction Hash');
            return;
        }

        try {
            setLoading(true);
            const token = await getToken();

            // Get NFT info using policy ID and transaction hash
            const { data: nftData } = await axios.get(
                `${backendUrl}/api/nft/info/by-policy/${policyId}/${txHash}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (nftData.success) {
                // Store NFT info
                setSelectedNFT({
                    policyId: nftData.policyId,
                    assetName: nftData.assetName,
                    courseTitle: nftData.courseTitle,
                    metadata: nftData.metadata,
                    mintTransaction: nftData.mintTransaction,
                    educator: nftData.educator
                });

                // Show NFT modal
                setShowNFTModal(true);
            } else {
                toast.error('Could not find certificate NFT information');
            }

        } catch (error) {
            console.error('Error:', error);
            toast.error(error.response?.data?.message || 'Error fetching certificate information');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8 bg-[#f0faf5] p-8 rounded-xl shadow-sm">
            <h2 className='text-3xl md:text-4xl font-bold text-gray-800 mb-4'>
                    Cardano NFT Explorer
                </h2>
                <p className="text-gray-600 text-lg">
                    Enter a Policy ID and Transaction Hash to view NFT details
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 mb-8">
                <div className="space-y-6">
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">Policy ID</label>
                        <input
                            type="text"
                            value={policyId}
                            onChange={(e) => setPolicyId(e.target.value)}
                            placeholder="Enter Policy ID"
                            className="w-full p-4 text-lg border-2 rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">Transaction Hash</label>
                        <input
                            type="text"
                            value={txHash}
                            onChange={(e) => setTxHash(e.target.value)}
                            placeholder="Enter Transaction Hash"
                            className="w-full p-4 text-lg border-2 rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex flex-col gap-4 pt-4">
                        <button
                            onClick={handleCheck}
                            disabled={loading}
                            className="w-full py-4 text-lg bg-gradient-to-r from-[#00b894] to-[#0984e3] text-white rounded-lg hover:opacity-90 disabled:bg-gray-400 disabled:hover:opacity-100 transition-all font-medium flex items-center justify-center shadow-md"
                        >
                            <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {loading ? 'Checking...' : 'Search'}
                        </button>
                        <a
                            href="https://transaction-sand.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-4 text-lg bg-gradient-to-r from-[#00b894] to-[#0984e3] text-white rounded-lg hover:opacity-90 transition-all font-medium flex items-center justify-center shadow-md"
                        >
                            <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Visit Explorer
                        </a>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg">
                    <div className="mb-6">
                        <QRCodeSVG
                            value="https://transaction-sand.vercel.app/"
                            size={250}
                            level="H"
                            includeMargin={true}
                            className="rounded-xl"
                        />
                    </div>
                    <p className="text-lg text-gray-600 text-center">
                        Scan to visit Transaction Explorer
                    </p>
                </div>
            </div>

            {/* NFT Information Modal */}
            {showNFTModal && selectedNFT && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
                    <div className="bg-white rounded-xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800">NFT Information</h2>
                            <button 
                                onClick={() => setShowNFTModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-xl"
                            >
                                ✕
                            </button>
                        </div>
                        {/* Tabs */}
                        <div className="flex gap-4 mb-8">
                            <button onClick={() => setActiveTab('nft')} className={`px-4 py-2 rounded ${activeTab === 'nft' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>NFT Details</button>
                            {selectedNFT.educator && (
                                <button onClick={() => setActiveTab('edu')} className={`px-4 py-2 rounded ${activeTab === 'edu' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Educator Info</button>
                            )}
                        </div>
                        {/* Tab content */}
                        {activeTab === 'nft' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-4">NFT Details</h3>
                                        <div className="bg-gray-50 p-6 rounded-lg space-y-6">
                                            <div>
                                                <h4 className="text-base font-medium text-gray-600 mb-2">Policy ID</h4>
                                                <p className="text-base break-all bg-white p-4 rounded-lg border border-gray-100">
                                                    {selectedNFT.policyId}
                                                </p>
                                            </div>
                                            <div>
                                                <h4 className="text-base font-medium text-gray-600 mb-2">Hex Name</h4>
                                                <p className="text-base break-all bg-white p-4 rounded-lg border border-gray-100">
                                                    {selectedNFT.assetName}
                                                </p>
                                            </div>
                                            <div>
                                                <h4 className="text-base font-medium text-gray-600 mb-2">Course Title</h4>
                                                <p className="text-base bg-white p-4 rounded-lg border border-gray-100">
                                                    {selectedNFT.courseTitle}
                                                </p>
                                            </div>
                                            {selectedNFT.educator && (
                                                <div>
                                                    <h4 className="text-base font-medium text-gray-600 mb-2">Educator</h4>
                                                    <p className="text-base bg-white p-4 rounded-lg border border-gray-100">
                                                        {selectedNFT.educator.name} {selectedNFT.educator.email && `(${selectedNFT.educator.email})`}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {selectedNFT.mintTransaction && (
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Mint Transaction</h3>
                                            <div className="bg-gray-50 p-6 rounded-lg space-y-6">
                                                <div>
                                                    <h4 className="text-base font-medium text-gray-600 mb-2">Transaction Hash</h4>
                                                    <p className="text-base break-all bg-white p-4 rounded-lg border border-gray-100">
                                                        {selectedNFT.mintTransaction.txHash}
                                                    </p>
                                                </div>
                                                <div>
                                                    <h4 className="text-base font-medium text-gray-600 mb-2">Block</h4>
                                                    <p className="text-base bg-white p-4 rounded-lg border border-gray-100">
                                                        {selectedNFT.mintTransaction.block}
                                                    </p>
                                                </div>
                                                <div>
                                                    <h4 className="text-base font-medium text-gray-600 mb-2">Timestamp</h4>
                                                    <p className="text-base bg-white p-4 rounded-lg border border-gray-100">
                                                        {new Date(selectedNFT.mintTransaction.timestamp * 1000).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Metadata (CIP-721)</h3>
                                    <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                                        {selectedNFT.metadata && selectedNFT.metadata['721'] && (
                                            <>
                                                {/* Lấy policy ID */}
                                                {Object.keys(selectedNFT.metadata['721']).filter(key => key !== 'version').map(policyId => {
                                                    const assetData = selectedNFT.metadata['721'][policyId];
                                                    const assetKeys = Object.keys(assetData);
                                                    
                                                    return assetKeys.map(assetKey => {
                                                        const assetInfo = assetData[assetKey];
                                                        
                                                        return (
                                                            <div key={assetKey} className="space-y-3">
                                                                {Object.entries(assetInfo).map(([key, value]) => {
                                                                    // Bỏ qua các trường là object phức tạp hoặc các trường cần ẩn
                                                                    if (typeof value === 'object' && value !== null || 
                                                                        key === 'image' || 
                                                                        key === 'student_id' || 
                                                                        key === 'educator_id') {
                                                                        return null;
                                                                    }
                                                                    
                                                                    return (
                                                                        <div key={key} className="bg-white p-4 rounded-lg border border-gray-100">
                                                                            <div className="font-medium text-gray-700">{key}</div>
                                                                            <div className="mt-1 break-all">{value.toString()}</div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        );
                                                    });
                                                })}
                                            </>
                                        )}
                                        <div className="mt-4">
                                            <button 
                                                onClick={() => setShowRawMetadata(!showRawMetadata)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                {showRawMetadata ? 'Hide metadata' : 'View metadata'}
                                            </button>
                                            {showRawMetadata && (
                                                <pre className="mt-2 font-mono text-sm whitespace-pre-wrap overflow-x-auto bg-gray-100 p-4 rounded-lg border border-gray-200 text-left">
                                                    {JSON.stringify(selectedNFT.metadata, null, 2)}
                                                </pre>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'edu' && selectedNFT.educator && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-gray-800 mb-4">Educator Information</h3>
                                
                                {/* Thông tin cơ bản */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                                        <h4 className="text-lg font-semibold text-gray-700 border-b pb-2">Basic Information</h4>
                                        <div><span className="font-semibold">Name:</span> {selectedNFT.educator.name}</div>
                                        <div><span className="font-semibold">Email:</span> {selectedNFT.educator.email}</div>
                                        {selectedNFT.educator.bio && (
                                            <div>
                                                <span className="font-semibold">Bio:</span> 
                                                <p className="mt-1 text-gray-600">{selectedNFT.educator.bio}</p>
                                            </div>
                                        )}
                                        {selectedNFT.educator.walletAddress && (
                                            <div>
                                                <span className="font-semibold">Wallet Address:</span>
                                                <p className="mt-1 text-sm text-gray-500 break-all">{selectedNFT.educator.walletAddress}</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Thống kê */}
                                    <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                                        <h4 className="text-lg font-semibold text-gray-700 border-b pb-2">Statistics</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                                <div className="text-sm text-gray-500">Total Students</div>
                                                <div className="text-2xl font-bold text-blue-600">{selectedNFT.educator.totalStudents}</div>
                                            </div>
                                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                                <div className="text-sm text-gray-500">Total Courses</div>
                                                <div className="text-2xl font-bold text-green-600">{selectedNFT.educator.totalCourses}</div>
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <div><span className="font-semibold">Joined:</span> {selectedNFT.educator.joinDate ? new Date(selectedNFT.educator.joinDate).toLocaleDateString() : 'N/A'}</div>
                                            <div><span className="font-semibold">Last Active:</span> {selectedNFT.educator.lastActive ? new Date(selectedNFT.educator.lastActive).toLocaleDateString() : 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Danh sách khóa học */}
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h4 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Courses & Ratings</h4>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-left border">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="border px-4 py-2">Course Title</th>
                                                    <th className="border px-4 py-2">Students</th>
                                                    <th className="border px-4 py-2">Price</th>
                                                    <th className="border px-4 py-2">Rating</th>
                                                    <th className="border px-4 py-2">Created</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedNFT.educator.courseRates.map((c) => (
                                                    <tr key={c.courseId} className="hover:bg-gray-50">
                                                        <td className="border px-4 py-2 font-medium">{c.courseTitle}</td>
                                                        <td className="border px-4 py-2">{c.enrolledCount || 0}</td>
                                                        <td className="border px-4 py-2">
                                                            {c.discount > 0 ? (
                                                                <div>
                                                                    <span className="line-through text-gray-400">ADA{c.price}</span>
                                                                    <span className="ml-2 text-green-600">ADA{(c.price - (c.price * c.discount / 100)).toFixed(2)}</span>
                                                                </div>
                                                            ) : (
                                                                <span>ADA{c.price}</span>
                                                            )}
                                                        </td>
                                                        <td className="border px-4 py-2">
                                                            <div className="flex items-center">
                                                                <span className="text-amber-500 mr-1">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                    </svg>
                                                                </span>
                                                                <span>{c.avgRate} ({c.totalVotes})</span>
                                                            </div>
                                                        </td>
                                                        <td className="border px-4 py-2">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="mt-8 flex justify-end gap-4">
                            <a 
                                href={`https://preprod.cardanoscan.io/token/${selectedNFT.policyId}${selectedNFT.assetName}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-3 text-lg bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md"
                            >
                                View on Explorer
                            </a>
                            <button 
                                onClick={() => setShowNFTModal(false)}
                                className="px-8 py-3 text-lg bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 shadow-md"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionChecker;

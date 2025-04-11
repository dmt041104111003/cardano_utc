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
                    mintTransaction: nftData.mintTransaction
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
        <div className="max-w-4xl mx-auto p-4">
            <div className="mb-6 bg-[#f0faf5] p-6 rounded-lg">
            <h2 className='text-3xl md:text-4xl font-bold text-gray-800 mb-4'>
                    Cardano NFT Explorer
                </h2>
                <p className="text-gray-600 text-sm">
                    Enter a Policy ID and optional Transaction Hash to view NFT details
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Policy ID</label>
                    <input
                        type="text"
                        value={policyId}
                        onChange={(e) => setPolicyId(e.target.value)}
                        placeholder="Enter Policy ID"
                        className="w-full p-2 border rounded bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Hash</label>
                    <input
                        type="text"
                        value={txHash}
                        onChange={(e) => setTxHash(e.target.value)}
                        placeholder="Enter Transaction Hash"
                        className="w-full p-2 border rounded bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={handleCheck}
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-[#00b894] to-[#0984e3] text-white rounded hover:opacity-90 disabled:bg-gray-400 disabled:hover:opacity-100 transition-all text-sm font-medium flex items-center justify-center"
                    >
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {loading ? 'Checking...' : 'Search'}
                    </button>
                    <a
                        href="https://transaction-sand.vercel.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 bg-gradient-to-r from-[#00b894] to-[#0984e3] text-white rounded hover:opacity-90 transition-all text-sm font-medium flex items-center justify-center"
                    >
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Visit Explorer
                    </a>
                </div>
                </div>
                <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md">
                    <div className="mb-4">
                        <QRCodeSVG
                            value="https://transaction-sand.vercel.app/"
                            size={200}
                            level="H"
                            includeMargin={true}
                            className="rounded-lg"
                        />
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                        Scan to visit Transaction Explorer
                    </p>
                </div>
            </div>

            {/* NFT Information Modal */}
            {showNFTModal && selectedNFT && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl">NFT Information</h2>
                            <button 
                                onClick={() => setShowNFTModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-gray-600 mb-2">Policy ID</h3>
                                <div className="bg-gray-50 p-4 rounded text-left">
                                    {selectedNFT.policyId}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-gray-600 mb-2">Asset Name</h3>
                                <div className="bg-gray-50 p-4 rounded text-left">
                                    {selectedNFT.assetName}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-gray-600 mb-2">Course Title</h3>
                                <div className="bg-gray-50 p-4 rounded text-left">
                                    {selectedNFT.courseTitle}
                                </div>
                            </div>

                            {selectedNFT.mintTransaction && (
                                <div>
                                    <h3 className="text-gray-600 mb-2">Mint Transaction</h3>
                                    <div className="bg-gray-50 p-4 rounded text-left">
                                        <div className="mb-2">
                                            <span className="font-bold">Transaction Hash: </span>{selectedNFT.mintTransaction.txHash}
                                        </div>
                                        <div className="mb-2">
                                            <span className="font-bold">Block: </span>{selectedNFT.mintTransaction.block}
                                        </div>
                                        <div>
                                            <span className="font-bold">Timestamp: </span>{new Date(selectedNFT.mintTransaction.timestamp * 1000).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="text-gray-600 mb-2">Metadata (CIP-721)</h3>
                                <div className="bg-gray-50 p-4 rounded">
                                    <pre className="font-mono text-sm whitespace-pre text-left">
{JSON.stringify(selectedNFT.metadata, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <a 
                                href={`https://preprod.cardanoscan.io/token/${selectedNFT.policyId}${selectedNFT.assetName}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                View on Explorer
                            </a>
                            <button 
                                onClick={() => setShowNFTModal(false)}
                                className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
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

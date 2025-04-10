import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const CertificateViewer = () => {
    const { txHash } = useParams();
    const [txInfo, setTxInfo] = useState(null);

    useEffect(() => {
        const storedInfo = localStorage.getItem('txInfo');
        if (storedInfo) {
            setTxInfo(JSON.parse(storedInfo));
        }
    }, []);

    const formatDate = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleString();
    };

    const shortenHash = (hash) => {
        if (!hash) return '';
        return hash.substring(0, 8) + '...' + hash.substring(hash.length - 8);
    };

    if (!txInfo) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4">Certificate Viewer</h2>
                    <p className="text-gray-600">No certificate information found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Certificate Details</h2>
                <p className="text-gray-600">Transaction Hash: {txInfo.hash}</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-xl font-semibold mb-4">Transaction Details</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm text-gray-600">Hash</label>
                                <p className="font-mono text-sm break-all bg-gray-50 p-2 rounded">
                                    {txInfo.hash}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Block</label>
                                <p className="font-mono text-sm bg-gray-50 p-2 rounded">
                                    {txInfo.block}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Timestamp</label>
                                <p className="text-sm bg-gray-50 p-2 rounded">
                                    {formatDate(txInfo.timestamp)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {txInfo.nft && (
                        <div>
                            <h3 className="text-xl font-semibold mb-4">NFT Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm text-gray-600">Policy ID</label>
                                    <p className="font-mono text-sm break-all bg-gray-50 p-2 rounded">
                                        {txInfo.nft.policyId}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600">Asset Name</label>
                                    <p className="font-mono text-sm break-all bg-gray-50 p-2 rounded">
                                        {txInfo.nft.assetName}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600">Fingerprint</label>
                                    <p className="font-mono text-sm break-all bg-gray-50 p-2 rounded">
                                        {txInfo.nft.fingerprint}
                                    </p>
                                </div>
                                {txInfo.nft.metadata && (
                                    <div>
                                        <label className="text-sm text-gray-600">Metadata</label>
                                        <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-48">
                                            {JSON.stringify(txInfo.nft.metadata, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-4">UTXOs</h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-lg font-medium mb-2">Inputs</h4>
                            <div className="space-y-2">
                                {txInfo.utxos.inputs.map((input, index) => (
                                    <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                                        <p className="font-mono">Address: {shortenHash(input.address)}</p>
                                        <p className="font-mono">
                                            Amount: {input.amount.map(amt => 
                                                `${amt.quantity} ${amt.unit === 'lovelace' ? 'ADA' : shortenHash(amt.unit)}`
                                            ).join(', ')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-lg font-medium mb-2">Outputs</h4>
                            <div className="space-y-2">
                                {txInfo.utxos.outputs.map((output, index) => (
                                    <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                                        <p className="font-mono">Address: {shortenHash(output.address)}</p>
                                        <p className="font-mono">
                                            Amount: {output.amount.map(amt => 
                                                `${amt.quantity} ${amt.unit === 'lovelace' ? 'ADA' : shortenHash(amt.unit)}`
                                            ).join(', ')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <a
                        href={`https://preprod.cardanoscan.io/transaction/${txInfo.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                    >
                        View on Cardanoscan →
                    </a>
                </div>
            </div>
        </div>
    );
};

export default CertificateViewer;

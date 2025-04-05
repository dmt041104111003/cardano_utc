import pinataSDK from '@pinata/sdk';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Khởi tạo Pinata với JWT thay vì API key và secret
const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });

/**
 * Upload file to IPFS via Pinata
 */
async function uploadToPinata(filePath) {
    try {
        console.log('Reading file from:', filePath);
        const readableStreamForFile = fs.createReadStream(filePath);
        const options = {
            pinataMetadata: {
                name: path.basename(filePath)
            }
        };

        console.log('Uploading to Pinata...');
        const result = await pinata.pinFileToIPFS(readableStreamForFile, options);
        console.log('Upload result:', result);
        return result;
    } catch (error) {
        console.error('Error uploading to Pinata:', error);
        throw error;
    }
}

export { uploadToPinata };

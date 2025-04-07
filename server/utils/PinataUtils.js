import pinataSDK from '@pinata/sdk';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

dotenv.config();

// Initialize Pinata with JWT
const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });

/**
 * Upload content to IPFS via Pinata
 * @param {string|Buffer} content - File path or buffer to upload
 * @param {string} [filename] - Optional filename for buffer uploads
 */
async function uploadToPinata(content, filename) {
    try {
        let readableStream;
        let options = { pinataMetadata: {} };

        if (Buffer.isBuffer(content)) {
            // Handle buffer input
            readableStream = Readable.from(content);
            options.pinataMetadata.name = filename || `certificate_${Date.now()}.png`;
            console.log('Uploading buffer to Pinata...');
        } else if (typeof content === 'string') {
            // Handle file path input
            console.log('Reading file from:', content);
            readableStream = fs.createReadStream(content);
            options.pinataMetadata.name = path.basename(content);
            console.log('Uploading file to Pinata...');
        } else {
            throw new Error('Invalid input: must be a file path or buffer');
        }

        const result = await pinata.pinFileToIPFS(readableStream, options);
        console.log('Upload result:', result);
        return result;
    } catch (error) {
        console.error('Error uploading to Pinata:', error);
        throw error;
    }
}

export { uploadToPinata };

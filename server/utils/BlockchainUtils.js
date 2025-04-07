import { stringToHex, BlockfrostProvider, MeshTxBuilder, ForgeScript, Transaction } from '@meshsdk/core';
import dotenv from 'dotenv';
import CustomInitiator from './CustomIInitiator.js';

dotenv.config();
const PINATA_PREFIX_WEBSITE = "ipfs://";
const blockfrostApiKey = process.env.BLOCKFROST_API_KEY;

async function createUnsignedMintTx(utxos, changeAddress, collateral, getAddress, courseData) {
    try {
        // Create unique asset name with courseId and timestamp
        const timestamp = Math.floor(Date.now() / 1000).toString(36); // Unix timestamp in base36
        const shortCourseId = courseData.courseId.slice(0, 4); // Take first 4 chars
        const assetName = `C${shortCourseId}${timestamp}`.slice(0, 16); // 'C' + 4 chars + ~8-10 chars timestamp
        const assetNameHex = stringToHex(assetName);

        console.log('Generated asset name:', {
            assetName,
            length: assetName.length,
            hexLength: assetNameHex.length
        });

        // Create forging script with minter's address
        console.log('Creating forging script with address:', getAddress); 
        const forgingScript = ForgeScript.withOneSignature(getAddress);
    
        // Take only first and last 8 characters of the address to create a unique identifier
        const shortAddress = getAddress.slice(0, 8) + '...' + getAddress.slice(-8);

        // Prepare metadata following CIP-721 standard with length limits
        const ipfsHash = "bafkreib2xqvtrkgzsivinihbasxl5qghmswa3x7pjy4kzllkgs7pra6mde"; // Use same IPFS hash as certificate
        
        const assetMetadata = {
            // Simple metadata for Eternal Wallet
            name: courseData.courseTitle.slice(0, 64),
            image: ipfsHash,  // Just store the hash, wallet will prepend ipfs://
            mediaType: "image/png",
            // description: courseData.courseDescription.slice(0, 64),
            
            properties: {
                id: courseData.courseId.slice(0, 16),
                creator: shortAddress,
                created: Math.floor(new Date(courseData.createdAt).getTime() / 1000),
                price: courseData.coursePrice,
                discount: courseData.discount
            },
            
            // CIP-721 metadata for standards compliance
            "721": {
                [forgingScript]: {
                    [assetName]: {
                        name: courseData.courseTitle.slice(0, 64),
                        // description: courseData.courseDescription.slice(0, 64),
                        image: ipfsHash,  // Just store the hash
                        mediaType: "image/png",
                        courseId: courseData.courseId.slice(0, 16),
                        courseTitle: courseData.courseTitle,
                        // courseDescription: courseData.courseDescription || "",
                        creator: shortAddress,
                        price: courseData.coursePrice,
                        discount: courseData.discount,
                    }
                }
            }
        };

        console.log('Asset being minted:', {
            assetName,
            assetNameHex,
            metadata: assetMetadata
        });

        // Prepare asset for minting
        const asset = {
            assetName: assetNameHex,
            assetQuantity: '1',
            metadata: assetMetadata,
            label: '721',
            recipient: getAddress
        };

        // Create and build transaction
        const tx = new Transaction({ initiator: new CustomInitiator(changeAddress, collateral, utxos) });
        tx.mintAsset(
            forgingScript,
            asset
        );

        const unsignedTx = await tx.build();
        return unsignedTx;

    } catch (error) {
        console.error("Error creating course minting transaction:", error);
        throw error;
    }
}

async function sendAda(utxos, changeAddress, getAddress, value) {
    try {
        const provider = new BlockfrostProvider(blockfrostApiKey);

        // Chuyển value thành chuỗi và đảm bảo nó là số nguyên
        const lovelaceAmount = Math.floor(Number(value)).toString();

        const transactionBuilder = new MeshTxBuilder({
            fetcher: provider,
            verbose: true,
        });

        const unsignedTransaction = await transactionBuilder
            .txOut(`${getAddress}`, [{ unit: "lovelace", quantity: lovelaceAmount }])
            .changeAddress(changeAddress)
            .selectUtxosFrom(utxos)
            .complete();
        return unsignedTransaction;

    } catch (error) {
        console.error("Error creating ADA transaction:", error);
        throw error;
    }
}

export { createUnsignedMintTx, sendAda };

import { stringToHex, BlockfrostProvider, MeshTxBuilder, ForgeScript, Transaction } from '@meshsdk/core';
import dotenv from 'dotenv';
import CustomInitiator from './CustomInitiator.js';
import { generateCertificateBuffer } from './ImageUtils.js';
import { uploadToPinata } from './PinataUtils.js';

dotenv.config();
const blockfrostApiKey = process.env.BLOCKFROST_API_KEY;
async function createUnsignedMintTx(utxos, changeAddress, collateral, getAddress, courseData) {
    try {
        const isCertificate = courseData.studentId !== undefined;
        let assetName, assetNameHex;
        
        if (isCertificate) {
            const shortCourseId = courseData.courseId.toString().substring(0, 2);
            const studentId = courseData.studentId ? courseData.studentId.toString().substring(0, 2) : 'XX';
            const timestamp = Date.now().toString().substring(8, 13); 
            const randomCode = Math.floor(1000 + Math.random() * 9000); 
            assetName = `C${shortCourseId}${studentId}${timestamp}${randomCode}`;
        } else {
            const shortCourseId = courseData.courseId.toString().substring(0, 2);
            const timestamp = Date.now().toString().substring(10, 13);
            const randomCode = Math.floor(100 + Math.random() * 900);
            assetName = `C${shortCourseId}${timestamp}${randomCode}`;
        }
        
        assetNameHex = stringToHex(assetName);
        const forgingScript = ForgeScript.withOneSignature(getAddress);
        const shortAddress = getAddress.slice(0, 8) + '...' + getAddress.slice(-8);

        let assetMetadata;
        let ipfsUri = "";
        
        if (isCertificate) {
            const studentName = courseData.studentName || "Student";
            const educatorName = courseData.educator || shortAddress;
            
            const certificateBuffer = await generateCertificateBuffer(
                studentName,
                educatorName, 
                courseData.courseTitle,
                new Date().toLocaleDateString('vi-VN')
            );
            const ipfsResult = await uploadToPinata(certificateBuffer, `certificate_${courseData.courseId}_${Date.now()}.png`);
            const ipfsHash = ipfsResult.IpfsHash;
            ipfsUri = `ipfs://${ipfsHash}`;
            assetMetadata = {
                "721": {
                    [forgingScript.hash]: {
                        [assetName]: {
                            name: `${courseData.courseTitle} Certificate`,
                            image: ipfsUri,
                            mediaType: "image/png",
                            description: `Certificate for ${courseData.studentName || 'Student'} - ${courseData.courseTitle}`,
                            courseId: courseData.courseId.toString(),
                            courseTitle: courseData.courseTitle,
                            studentName: courseData.studentName || 'Student',
                            studentId: courseData.studentId ? courseData.studentId.toString() : "",
                            educatorName: courseData.educator || shortAddress,
                            issuedAt: new Date().toISOString().split('T')[0],
                            gatewayUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
                        }
                    }
                }
            };
        } else {
            const coursePrice = courseData.coursePrice || 0;
            const discount = courseData.discount || 0;
            const ipfsHash = "bafkreiealuh6skgbomi77dczcpgacemtr3xxbctsjgvhecbqhx636gx7um";            
            assetMetadata = {
                name: courseData.courseTitle.slice(0, 64),
                image: ipfsHash, 
                mediaType: "image/png",
                properties: {
                    id: courseData.courseId.toString().slice(0, 16),
                    creator: shortAddress,
                    created: Math.floor(new Date().getTime() / 1000),
                    price: coursePrice,
                    discount: discount
                },
                "721": {
                    [forgingScript.hash]: {
                        [assetName]: {
                            name: courseData.courseTitle.slice(0, 64),
                            image: ipfsHash, 
                            mediaType: "image/png",
                            courseId: courseData.courseId.toString().slice(0, 16),
                            courseTitle: courseData.courseTitle,
                            creator: shortAddress,
                            price: String(coursePrice),
                            discount: String(discount)
                        }
                    }
                }
            };
        }
        const asset = {
            assetName: assetNameHex,
            assetQuantity: '1',
            metadata: assetMetadata,
            label: '721',
            recipient: getAddress
        };

        const tx = new Transaction({ initiator: new CustomInitiator(changeAddress, collateral, utxos) });
        tx.mintAsset(
            forgingScript,
            asset
        );

        const unsignedTx = await tx.build();
        return unsignedTx;

    } catch (error) {
        throw error;
    }
}

async function sendAda(utxos, changeAddress, getAddress, value) {
    try {
        const provider = new BlockfrostProvider(blockfrostApiKey);
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
        throw error;
    }
}

export { createUnsignedMintTx, sendAda };

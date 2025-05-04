import { stringToHex, BlockfrostProvider, MeshTxBuilder, ForgeScript, Transaction } from '@meshsdk/core';
import dotenv from 'dotenv';
import CustomInitiator from './CustomIInitiator.js';
import { generateCertificateBuffer } from './ImageUtils.js';
import { uploadToPinata } from './PinataUtils.js';

dotenv.config();
const PINATA_PREFIX_WEBSITE = "ipfs://";
const blockfrostApiKey = process.env.BLOCKFROST_API_KEY;

/**
 * Tạo giao dịch mint NFT cho khóa học hoặc certificate
 * @param {Array} utxos - Danh sách UTXOs của người dùng
 * @param {String} changeAddress - Địa chỉ nhận lại tiền thừa
 * @param {Array} collateral - Collateral UTXOs
 * @param {String} getAddress - Địa chỉ ví của người dùng
 * @param {Object} courseData - Thông tin khóa học hoặc certificate
 * @returns {String} - Unsigned transaction hex
 */
async function createUnsignedMintTx(utxos, changeAddress, collateral, getAddress, courseData) {
    try {
        // Kiểm tra xem đây là mint khóa học hay mint certificate
        const isCertificate = courseData.studentId !== undefined;
        
        // Tạo asset name độc nhất
        let assetName, assetNameHex;
        
        if (isCertificate) {
            // Logic cho certificate
            const shortCourseId = courseData.courseId.toString().substring(0, 2);
            const studentId = courseData.studentId ? courseData.studentId.toString().substring(0, 2) : 'XX';
            const timestamp = Date.now().toString().substring(8, 13); // Lấy 5 chữ số cuối của timestamp
            const randomCode = Math.floor(1000 + Math.random() * 9000); // Mã ngẫu nhiên 4 chữ số
            
            // Kết hợp thành asset name độc nhất cho certificate
            assetName = `C${shortCourseId}${studentId}${timestamp}${randomCode}`;
        } else {
            // Logic cho khóa học - đảm bảo tên ngắn hơn
            // Chỉ lấy 2 ký tự đầu của courseId
            const shortCourseId = courseData.courseId.toString().substring(0, 2);
            // Lấy 3 chữ số cuối của timestamp
            const timestamp = Date.now().toString().substring(10, 13);
            // Mã ngẫu nhiên 3 chữ số
            const randomCode = Math.floor(100 + Math.random() * 900);
            
            // Kết hợp thành asset name ngắn và độc nhất cho khóa học
            assetName = `C${shortCourseId}${timestamp}${randomCode}`;
        }
        
        assetNameHex = stringToHex(assetName);

        console.log(`Generated ${isCertificate ? 'certificate' : 'course'} asset name:`, {
            assetName,
            length: assetName.length,
            hexLength: assetNameHex.length
        });

        // Create forging script with minter's address
        console.log('Creating forging script with address:', getAddress); 
        const forgingScript = ForgeScript.withOneSignature(getAddress);
    
        // Take only first and last 8 characters of the address to create a unique identifier
        const shortAddress = getAddress.slice(0, 8) + '...' + getAddress.slice(-8);

        let assetMetadata;
        let ipfsUri = "";
        
        if (isCertificate) {
            // Logic cho certificate - tạo ảnh chứng chỉ và upload lên IPFS
            console.log('Generating certificate image...');
            const studentName = courseData.studentName || "Student";
            const educatorName = courseData.educator || shortAddress;
            
            // Generate certificate buffer
            const certificateBuffer = await generateCertificateBuffer(
                studentName,
                educatorName, 
                courseData.courseTitle,
                new Date().toLocaleDateString('vi-VN')
            );
            
            // Upload buffer to IPFS
            console.log('Uploading certificate to IPFS...');
            const ipfsResult = await uploadToPinata(certificateBuffer, `certificate_${courseData.courseId}_${Date.now()}.png`);
            const ipfsHash = ipfsResult.IpfsHash;
            console.log('Certificate image uploaded to IPFS:', ipfsHash);
            
            // Create full IPFS URI for metadata
            ipfsUri = `ipfs://${ipfsHash}`;
            
            // Tạo metadata cho certificate
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
            // Logic cho khóa học - sử dụng ảnh IPFS cố định
            console.log('Generating course NFT metadata...');
            const educatorName = courseData.educator || shortAddress;
            const coursePrice = courseData.coursePrice || 0;
            const discount = courseData.discount || 0;
            
            // Sử dụng hash IPFS cố định đã được kiểm chứng hoạt động với ví Cardano
            const ipfsHash = "bafkreiealuh6skgbomi77dczcpgacemtr3xxbctsjgvhecbqhx636gx7um";
            console.log('Course image IPFS hash:', ipfsHash);
            
            // Tạo metadata theo cấu trúc mới - sử dụng cấu trúc được kiểm chứng hoạt động
            assetMetadata = {
                // Metadata cơ bản cho Eternal Wallet
                name: courseData.courseTitle.slice(0, 64),
                image: ipfsHash,  // Chỉ lưu hash, ví sẽ tự động thêm ipfs://
                mediaType: "image/png",
                
                // Thuộc tính bổ sung
                properties: {
                    id: courseData.courseId.toString().slice(0, 16),
                    creator: shortAddress,
                    created: Math.floor(new Date().getTime() / 1000),
                    price: coursePrice,
                    discount: discount
                },
                
                // CIP-721 metadata cho tiêu chuẩn Cardano
                "721": {
                    [forgingScript.hash]: {
                        [assetName]: {
                            name: courseData.courseTitle.slice(0, 64),
                            image: ipfsHash,  // Chỉ lưu hash
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

import { createCanvas, loadImage } from "canvas";
import axios from "axios";
import FormData from "form-data";
import fs from "fs-extra";
import path from "path";
import assets from "../assets/assets.js";
import img from "../public/images/certificate.jpg"




const generateCertificateImage = async (username, dateIssued, issueBy, courseName) => {
    const width = 1000, height = 600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    try {
    
        const background = await loadImage(img);
        ctx.drawImage(background, 0, 0, width, height);
        console.log("Load anh success");
    } catch (error) {
        console.log("Lỗi khi load ảnh:", error);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height); 
    }

    ctx.font = "bold 40px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";

    ctx.fillText(username || "Người nhận", width / 2, 250);
    ctx.fillText(`Khóa học: ${courseName}`, width / 2, 320);
    ctx.fillText(`Ngày cấp: ${dateIssued}`, width / 2, 390);
    ctx.fillText(`Cấp bởi: ${issueBy}`, width / 2, 460);

    const outputPath = path.join("certificates", `${username}_${courseName}.png`);
    await fs.ensureDir("certificates"); 
    const buffer = canvas.toBuffer("image/png");
    await fs.writeFile(outputPath, buffer);

    return outputPath;
};

const uploadToPinata = async (filePath) => {
    try {
        const fileStream = fs.createReadStream(filePath);
        const formData = new FormData();
        formData.append("file", fileStream);

        const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            headers: {
                Authorization: `Bearer ${process.env.PINATA_JWT}`,
                ...formData.getHeaders(),
            },
        });

        return response.data.IpfsHash;
    } catch (error) {
        console.error("Lỗi khi upload lên Pinata:", error);
        throw error;
    }
};
const deleteFileAfterUpload = async (filePath) => {
    try {
        await fs.remove(filePath);
        console.log("File đã được xóa sau khi upload thành công!");
    } catch (error) {
        console.error("Lỗi khi xóa file:", error);
    }
};

export { generateCertificateImage, uploadToPinata, deleteFileAfterUpload };


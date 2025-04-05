import { createCanvas, loadImage } from "canvas";
import axios from "axios";
import FormData from "form-data";
import fs from "fs-extra";
import { assets } from "../assets/assets.js";

const generateCertificateImage = async (username, mintUsername, courseName, issueAt) => {
    const width = 1000, height = 600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    try {
        const backgroundBuffer = fs.readFileSync(assets.certificate_background);
        const background = await loadImage(backgroundBuffer);
        ctx.drawImage(background, 0, 0, width, height);
        console.log("Load ảnh thành công!");
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
    ctx.fillText(`Ngày cấp: ${issueAt}`, width / 2, 390);
    ctx.fillText(`Cấp bởi: ${mintUsername}`, width / 2, 460);

    const outputPath = `certificates/${username}_${courseName}.png`;
    await fs.promises.mkdir("certificates", { recursive: true });
    const buffer = canvas.toBuffer("image/png");
    await fs.promises.writeFile(outputPath, buffer);

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

        return response.data;
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

import multer from 'multer';
import path from 'path';
import { Readable } from 'stream';

const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /image\/(jpeg|jpg|png)|application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)/.test(file.mimetype);
    
    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error("Only images (jpeg, jpg, png), PDF files, and Word documents (doc, docx) are allowed"));
    }
};

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, 
    fileFilter: fileFilter
});

export default upload;

export const bufferToStream = (buffer) => {
    const readable = new Readable();
    readable._read = () => {}; 
    readable.push(buffer);
    readable.push(null);
    return readable;
};
import { createCanvas, loadImage } from 'canvas';
import path from 'path';
import fs from 'fs';

/**
 * Generate certificate image with student and course information
 */
async function generateCertificateImage(studentName, educatorName, courseTitle, date) {
    try {
        // Create temp directory path
        const tempDir = path.join(process.cwd(), 'temp');
        
        // Ensure temp directory exists
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Create temp file path
        const fileName = `${Date.now()}_${studentName.replace(/\s+/g, '_')}_${courseTitle.replace(/\s+/g, '_')}.png`;
        const imagePath = path.join(tempDir, fileName);

        console.log('Creating certificate at:', imagePath);

        // Create a canvas
        const canvas = createCanvas(800, 600);
        const ctx = canvas.getContext('2d');

        // Set background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 800, 600);

        // Add border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 10;
        ctx.strokeRect(10, 10, 780, 580);

        // Add certificate title
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#000000';
        ctx.fillText('Certificate of Completion', 400, 100);

        // Add student name
        ctx.font = 'bold 30px Arial';
        ctx.fillText(studentName, 400, 200);

        // Add course info
        ctx.font = '25px Arial';
        ctx.fillText(`has successfully completed the course`, 400, 250);
        ctx.font = 'bold 30px Arial';
        ctx.fillText(courseTitle, 400, 300);

        // Add educator name
        ctx.font = '20px Arial';
        ctx.fillText(`Instructor: ${educatorName}`, 400, 400);

        // Add date
        ctx.fillText(`Date: ${date}`, 400, 450);

        // Save to file
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(imagePath, buffer);

        console.log('Certificate image created successfully!');
        return imagePath;
    } catch (error) {
        console.error('Error generating certificate:', error);
        throw error;
    }
}

export { generateCertificateImage };

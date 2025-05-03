import { createCanvas } from 'canvas';
import path from 'path';
import fs from 'fs';
import os from 'os';
import canvas from 'canvas';

// Đổi tên để tránh xung đột
const createCanvasImage = canvas.createCanvas;

/**
 * Generate certificate image with student and course information
 */
async function generateCertificateImage(studentName, educatorName, courseTitle, date) {
    try {
        // Create temp directory path - use OS temp dir
        const tempDir = os.tmpdir();
        
        // Create temp file path
        const fileName = `${Date.now()}_${studentName.replace(/\s+/g, '_')}_${courseTitle.replace(/\s+/g, '_')}.png`;
        const imagePath = path.join(tempDir, fileName);

        console.log('Creating certificate at:', imagePath);

        // Create a canvas
        const canvas = createCanvasImage(800, 600);
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

// Add new function to generate buffer directly
async function generateCertificateBuffer(studentName, educatorName, courseTitle, date) {
    try {
        // Create a canvas with larger dimensions for better quality
        const width = 1200;
        const height = 800;
        const canvas = createCanvasImage(width, height);
        const ctx = canvas.getContext('2d');
        
        // Constants for positioning
        const centerX = width / 2;
        
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(1, '#f0f8ff'); // Light blue tint at bottom
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add decorative border
        ctx.strokeStyle = '#2980b9'; // Blue color
        ctx.lineWidth = 15;
        ctx.beginPath();
        
        // Vẽ viền bo tròn thủ công
        const borderX = 30;
        const borderY = 30;
        const borderWidth = width - 60;
        const borderHeight = height - 60;
        const radius = 10;
        
        // Top left corner
        ctx.moveTo(borderX + radius, borderY);
        // Top edge
        ctx.lineTo(borderX + borderWidth - radius, borderY);
        // Top right corner
        ctx.arc(borderX + borderWidth - radius, borderY + radius, radius, 1.5 * Math.PI, 0, false);
        // Right edge
        ctx.lineTo(borderX + borderWidth, borderY + borderHeight - radius);
        // Bottom right corner
        ctx.arc(borderX + borderWidth - radius, borderY + borderHeight - radius, radius, 0, 0.5 * Math.PI, false);
        // Bottom edge
        ctx.lineTo(borderX + radius, borderY + borderHeight);
        // Bottom left corner
        ctx.arc(borderX + radius, borderY + borderHeight - radius, radius, 0.5 * Math.PI, Math.PI, false);
        // Left edge
        ctx.lineTo(borderX, borderY + radius);
        // Top left corner
        ctx.arc(borderX + radius, borderY + radius, radius, Math.PI, 1.5 * Math.PI, false);
        
        ctx.stroke();
        
        // Add corner decorations
        ctx.strokeStyle = '#2980b9';
        ctx.lineWidth = 5;
        
        // Top-left corner
        ctx.beginPath();
        ctx.moveTo(30, 80);
        ctx.lineTo(80, 80);
        ctx.moveTo(80, 30);
        ctx.lineTo(80, 80);
        ctx.stroke();
        
        // Top-right corner
        ctx.beginPath();
        ctx.moveTo(width - 30, 80);
        ctx.lineTo(width - 80, 80);
        ctx.moveTo(width - 80, 30);
        ctx.lineTo(width - 80, 80);
        ctx.stroke();
        
        // Bottom-left corner
        ctx.beginPath();
        ctx.moveTo(30, height - 80);
        ctx.lineTo(80, height - 80);
        ctx.moveTo(80, height - 30);
        ctx.lineTo(80, height - 80);
        ctx.stroke();
        
        // Bottom-right corner
        ctx.beginPath();
        ctx.moveTo(width - 30, height - 80);
        ctx.lineTo(width - 80, height - 80);
        ctx.moveTo(width - 80, height - 30);
        ctx.lineTo(width - 80, height - 80);
        ctx.stroke();
        
        // Add certificate title
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#2980b9'; // Blue color
        ctx.fillText('CERTIFICATE', centerX, 150);
        
        ctx.font = 'bold 36px Arial';
        ctx.fillStyle = '#464646'; // Dark gray
        ctx.fillText('OF ACHIEVEMENT', centerX, 200);
        
        // Add horizontal line under title
        ctx.strokeStyle = '#2980b9';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - 200, 220);
        ctx.lineTo(centerX + 200, 220);
        ctx.stroke();
        
        // Add "This is to certify that"
        ctx.font = '28px Arial';
        ctx.fillStyle = '#464646';
        ctx.fillText('This is to certify that', centerX, 280);
        
        // Add student name
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = '#2980b9';
        ctx.fillText(studentName, centerX, 350);
        
        // Add course completion text
        ctx.font = '28px Arial';
        ctx.fillStyle = '#464646';
        ctx.fillText('has successfully completed the course', centerX, 420);
        
        // Add course title
        ctx.font = 'bold 40px Arial';
        ctx.fillStyle = '#2980b9';
        ctx.fillText(courseTitle, centerX, 480);
        
        // Add educator name
        ctx.font = '24px Arial';
        ctx.fillStyle = '#464646';
        ctx.fillText(`Instructor: ${educatorName}`, centerX, 550);
        
        // Add date
        ctx.fillText(`Date: ${date}`, centerX, 590);
        
        // Add Cardano verification text
        ctx.font = 'italic 18px Arial';
        ctx.fillStyle = '#666666';
        ctx.fillText('Verified on Cardano Blockchain', centerX, height - 80);
        
        // Add signature line
        ctx.strokeStyle = '#2980b9';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX - 150, height - 150);
        ctx.lineTo(centerX + 150, height - 150);
        ctx.stroke();
        
        ctx.font = '20px Arial';
        ctx.fillStyle = '#464646';
        ctx.fillText('Authorized Signature', centerX, height - 120);
        
        // Return buffer directly
        return canvas.toBuffer('image/png');
    } catch (error) {
        console.error('Error generating certificate buffer:', error);
        throw error;
    }
}

export { generateCertificateImage, generateCertificateBuffer };

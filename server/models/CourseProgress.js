import mongoose from "mongoose";

const courseProgressSchema = new mongoose.Schema({
    userId: {
        type: String, // Sử dụng ObjectId thay vì String
        ref: "User", // Tham chiếu tới model User
        required: true
    },
    courseId: { type: String, required: true },
    completed: { type: Boolean, required: false },
    lectureCompleted: [],
}, { minimize: false });

export const CourseProgress = mongoose.model("CourseProgress", courseProgressSchema);
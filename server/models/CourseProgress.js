import mongoose from "mongoose";

const courseProgressSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    courseId: { type: String, required: true },
    completed: { type: Boolean, required: false },
    lectureCompleted: []
}, { minimize: false });

export const CouseProgress = mongoose.model('CourseProgress', courseProgressSchema) 
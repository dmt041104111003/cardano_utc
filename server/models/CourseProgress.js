import mongoose from "mongoose";

const courseProgressSchema = new mongoose.Schema({
    userId: {
        type: String,
        ref: "User",
        required: true
    },
    courseId: { type: String, required: true },
    completed: { type: Boolean, default: false, required: false },
    lectureCompleted: [],
    tests: [{
        testId: { type: String },
        passed: { type: Boolean, default: false },
        score: { type: Number },
        completedAt: { type: Date }
    }]
}, { minimize: false });

export const CourseProgress = mongoose.model("CourseProgress", courseProgressSchema);
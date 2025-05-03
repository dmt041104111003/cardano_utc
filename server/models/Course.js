import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
    lectureId: { type: String, required: true },
    lectureTitle: { type: String, required: true },
    lectureDuration: { type: Number, required: false },
    lectureUrl: { type: String, required: true },
    isPreviewFree: { type: Boolean, default: true },
    lectureOrder: { type: Number, required: true },
}, { _id: false });

const chapterSchema = new mongoose.Schema({
    chapterId: { type: String, required: true },
    chapterOrder: { type: Number, required: true },
    chapterTitle: { type: String, required: true },
    chapterContent: [lectureSchema]
}, { _id: false });

const questionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    type: { type: String, enum: ['multiple_choice', 'essay'], required: true },
    options: [{ type: String }], // Only used for multiple_choice
    correctAnswers: [{ type: String }], // Array of correct answers for multiple_choice
    essayAnswer: { type: String }, // Only used for essay
    note: { type: String } // Note for the question
}, { _id: false });

const testSchema = new mongoose.Schema({
    testId: { type: String, required: true },
    chapterNumber: { type: Number, required: true }, // 0: Final test, 1-n: Chapter test
    duration: { type: Number, required: true }, // Minutes
    passingScore: { type: Number, required: true }, // Score to pass (%)
    questions: [questionSchema]
}, { _id: false });

const courseSchema = new mongoose.Schema({
    courseTitle: { type: String, required: true },
    courseDescription: { type: String, required: true },
    courseThumbnail: { type: String },
    coursePrice: { type: Number, required: true, default: 0 },
    isPublished: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }, // Trường đánh dấu khóa học đã bị xóa
    isUpdated: { type: Boolean, default: false }, // Trường đánh dấu khóa học đã được cập nhật
    lastUpdated: { type: Date }, // Thời gian cập nhật gần nhất
    paypalEmail: { type: String }, // Email PayPal của người tạo khóa học
    discount: { type: Number, required: true, min: 0, max: 100, default: 0 },
    discountEndTime: { type: Date }, // Thời gian kết thúc giảm giá
    courseContent: [chapterSchema],
    tests: [testSchema],
    courseRatings: [
        { userId: { type: String }, rating: { type: Number, min: 1, max: 5 } }
    ],
    educator: { type: String, ref: 'User', required: true },
    enrolledStudents: [
        { type: String, ref: 'User' }
    ],
    creatorAddress: { type: String, required: false },
    txHash: { type: String, required: false },
    paymentMethods: {
      ada: { type: Boolean, default: false },
      stripe: { type: Boolean, default: false },
      paypal: { type: Boolean, default: false }
    }
}, { timestamps: true, minimize: false });

const Course = mongoose.model('Course', courseSchema);
export default Course;

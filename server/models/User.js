import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        imageUrl: { type: String, required: true },
        enrolledCourses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course'
            }
        ],
        walletAddress: { type: String, required: false  },
        paypalEmail: { type: String, required: false },
        premiumPlan: { type: String, required: false },
        premiumExpiry: { type: Date, required: false },
        isPremium: { 
            type: Boolean, 
            default: false,
            get: function() {
                return this.premiumExpiry && this.premiumExpiry > new Date();
            }
        },
        lastCourseCreatedAt: { type: Date },
    },
    { 
        timestamps: true,
        toJSON: { getters: true }
    }
);

const User = mongoose.model('User', userSchema);
export default User;

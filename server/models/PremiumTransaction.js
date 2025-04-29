import mongoose from "mongoose";

const PremiumTransactionSchema = new mongoose.Schema({
    user: { type: String, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, enum: ["USD", "ADA"], required: true },
    paymentMethod: { type: String, enum: ["ADA", "PayPal"], required: true },
    plan: { type: String, enum: ["monthly", "yearly"], required: true },
    status: {
        type: String,
        enum: ["pending", "success", "failed"],
        default: "pending"
    },
    transactionId: { type: String, unique: true, sparse: true },
    note: { type: String },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const PremiumTransaction = mongoose.model('PremiumTransaction', PremiumTransactionSchema);
export default PremiumTransaction; 
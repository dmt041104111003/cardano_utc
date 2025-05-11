import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        userName: { type: String, required: true },
        walletAddress: { type: String, required: true },
        courseId: { type: String, required: true },
        educatorId: { type: String, required: true },
        educatorWallet: { type: String, required: true },
        txHash: { type: String, default: '' } // Thêm trường txHash để lưu giao dịch
    },
    { timestamps: true }
);

const Address = mongoose.model('Address', addressSchema);
export default Address;

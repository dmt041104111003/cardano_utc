import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        userName: { type: String, required: true },
        walletAddress: { type: String, required: true },
        courseId: { type: String, required: true },
        educatorId: { type: String, required: true },
        educatorWallet: { type: String, required: true }
    },
    { timestamps: true }
);

const Address = mongoose.model('Address', addressSchema);
export default Address;

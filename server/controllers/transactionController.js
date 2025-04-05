import {sendAda} from "../utils/blockchainUtils.js";

export const paymentByAda = async (req, res) => {
    const { utxos, changeAddress, getAddress,value} = req.body;

    try {
        const unsignedTx = await sendAda(utxos, changeAddress, getAddress,value);
        if (!unsignedTx) {
            return res.status(500).json({ success: false, message: "Loi thanh toan" });
        }
        res.json({ success: true, unsignedTx });
    } catch (error) {
        console.error("Lỗi thanh toan:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
export const paymentBybankAccount = async (req, res) => {
    res.status(400).json({ success: true });
};


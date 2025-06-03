import { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

export default function AdaPremiumPayment({ plan, adaAmount, receiverAddress }) {
  const { currentWallet, userData, backendUrl, fetchUserData } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false);

  const handlePremiumAdaPayment = async () => {
    if (!userData) return toast.error("Please log in!");
    if (!currentWallet) return toast.error("Please connect your Cardano wallet!");

    setIsLoading(true);
    try {
      const utxos = await currentWallet.getUtxos();
      const changeAddress = await currentWallet.getChangeAddress();

      const { data } = await axios.post(`${backendUrl}/api/premium/payment-ada`, {
        utxos,
        changeAddress,
        getAddress: receiverAddress,
        userId: userData._id,
        value: adaAmount * 1e6,
        plan,
      });

      if (data.success) {
        const unsignedTx = data.unsignedTx;
        const signedTx = await currentWallet.signTx(unsignedTx);
        const txHash = await currentWallet.submitTx(signedTx);
        toast.success(`Premium payment successful! TX Hash: ${txHash}`);
        if (fetchUserData) await fetchUserData();
      } else {
        toast.error("Payment failed!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
    setIsLoading(false);
  };

  return (
    <div>
      <button
        onClick={handlePremiumAdaPayment}
        disabled={isLoading}
        className="w-full py-2 px-4 rounded-md bg-green-600 text-white font-medium"
      >
        {isLoading ? "Processing..." : `Pay ${adaAmount} ADA for Premium`}
      </button>
    </div>
  );
} 
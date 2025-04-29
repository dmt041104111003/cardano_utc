import { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

export default function PaypalPremiumPayment({ plan, usdAmount, paypalEmail }) {
  const { userData, backendUrl, getToken } = useContext(AppContext);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePremiumPaypalPayment = async () => {
    if (!userData) return toast.error("Please log in!");

    setIsProcessing(true);
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/premium/payment-paypal`,
        {
          userId: userData._id,
          plan,
          usdPrice: usdAmount,
          paypalEmail,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.forwardLink) {
        window.location.href = data.forwardLink;
      } else {
        toast.error("PayPal link not received.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
    setIsProcessing(false);
  };

  return (
    <div>
      <button
        onClick={handlePremiumPaypalPayment}
        disabled={isProcessing}
        className="w-full py-2 px-4 rounded-md bg-blue-700 text-white font-medium"
      >
        {isProcessing ? "Redirecting..." : `Pay $${usdAmount} for Premium`}
      </button>
    </div>
  );
} 
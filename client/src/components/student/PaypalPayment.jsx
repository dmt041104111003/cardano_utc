/* eslint-disable react/prop-types */
import axios from "axios";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

export default function PaypalPayment({ courseData }) {
  const { userData, backendUrl, getToken } = useContext(AppContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [coursePrice, setCoursePrice] = useState("0.00");
  const [adaToUsd, setAdaToUsd] = useState(0);

  // Fetch ADA/USD exchange rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd');
        const data = await response.json();
        setAdaToUsd(data.cardano.usd);
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
      }
    };

    fetchExchangeRate();
    const interval = setInterval(fetchExchangeRate, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (courseData && adaToUsd > 0) {
      const currentDate = new Date();
      const discountEnd = courseData.discountEndTime ? new Date(courseData.discountEndTime) : null;
      const isDiscountActive = discountEnd && !isNaN(discountEnd.getTime()) && currentDate <= discountEnd;
    
      // Convert ADA price to USD
      const adaPrice = isDiscountActive && courseData.discount > 0
        ? courseData.coursePrice * (1 - courseData.discount / 100)
        : courseData.coursePrice;

      const usdPrice = (adaPrice * adaToUsd).toFixed(2);
      setCoursePrice(usdPrice);
    }
  }, [courseData, adaToUsd]);

  const handlePaypalPayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/course/payment-by-paypal`,
        {
          courseName: courseData.courseTitle,
          courseId: courseData._id,
          price: coursePrice,
          userId: userData._id,
          originalAdaPrice: courseData.coursePrice // Send original ADA price for reference
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.forwardLink) {
        window.location.href = data.forwardLink;
      } else {
        throw new Error("PayPal link not received.");
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || "Payment failed. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg mt-4 bg-blue-50">
      <div className="flex items-center mb-3">
        <img
          src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg"
          alt="PayPal"
          className="h-6 mr-2"
        />
        <h3 className="text-lg font-semibold">Pay with PayPal</h3>
      </div>

      <div className="text-gray-600 mb-3">
        <p>
          Course price: <span className="font-semibold text-green-600">${coursePrice} USD</span>
        </p>
        <p className="text-sm text-gray-500">
          ≈ {courseData.coursePrice} ADA
        </p>
      </div>

      <p className="text-gray-600 mb-3">
        Pay securely with your PayPal account or international credit card.
      </p>

      {error && (
        <div className="p-2 mb-3 text-red-600 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <button
        className={`w-full py-2 px-4 rounded-md bg-blue-600 text-white font-medium
          hover:bg-blue-700 transition-colors ${isProcessing ? "opacity-70 cursor-not-allowed" : ""}`}
        onClick={handlePaypalPayment}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Redirecting...
          </span>
        ) : "Pay with PayPal"}
      </button>

      <p className="text-xs text-gray-500 mt-2">
        By making a payment, you agree to our Terms of Service.
      </p>
    </div>
  );
}
